// Lexicon: one independent random stream per meaning, so changing grammar controls never reshuffles roots.
import { MEANINGS } from './data/meanings.js';
import { genWord, genRoot, shapeParams, isV, vBase } from './phonology.js';
import { applyCascade } from './history.js';
import { join, applyPattern, segKey } from './morphology.js';
import { stream } from './rng.js';

const FUNCTION_POS = new Set(['conj', 'part', 'q', 'dem', 'adv']);
const BASIC_OFFSET = { 1: -0.45, 2: 0.05, 3: 0.4 };

// Keep the family's inventory, vowel harmony and tones, but avoid branching syllable edges.
export function genShortWord(ph, sp, rng, syllables = 1) {
  return genWord(ph, { ...sp, onsetCluster: 0, codaCluster: 0, diph: 0, coda: Math.min(sp.coda, 0.3) }, rng, syllables);
}

// Preserve both lexical stems. If a compound would be a homophone, lengthen the
// connective between them so that its shared head is still visible in either order.
export function productiveCompound(lang, modifier, head, isTaken) {
  const { ph, morph } = lang;
  const [first, last] = morph.compoundOrder === 'modifier-head' ? [modifier, head] : [head, modifier];
  const bridge = [ph.epenthetic + (ph.toneCount ? '1' : '')];
  const boundary = { ...ph, allophones: [] }; // constituents already have their surface allophones
  let stem = join(boundary, first.segs, morph.linker || []);
  for (let i = 0; i <= MEANINGS.length; i++) {
    const segs = join(boundary, stem, last.segs);
    if (!isTaken(segs)) return segs;
    stem = join(boundary, stem, bridge);
  }
  throw new Error('Could not distinguish compound ' + modifier.gloss + ' + ' + head.gloss);
}

function plannedSyllables(rng, entry, L, shift, ph) {
  const [, pos, basic] = entry;
  if (FUNCTION_POS.has(pos) && (pos !== 'adv' || basic === 1)) return rng.chance(0.9) ? 1 : 2;
  if (basic === 1) return rng.chance(Math.min(0.9, Math.max(0.35, 1.2 - L * 0.2))) ? 1 : 2;
  let x = L + (BASIC_OFFSET[basic] ?? 0) + shift;
  if (pos === 'adv') x -= 0.3;
  if (pos === 'num') x -= 0.2;
  x = Math.max(1, x);
  let n = Math.floor(x + rng.next());
  if (rng.chance(0.12)) n += rng.pick([-1, 1]);
  if (ph.family === 'sinitic' && n > 2) n = 2;
  return Math.max(1, Math.min(6, n));
}

export function buildLexicon(lang, ctl, seed) {
  const { ph, morph: m, cascade } = lang;
  const sp = lang.shape;
  const style = stream(seed, 'lexicon-style');
  const derivRate = Math.min(0.95, style.range(0.35, 0.8) + (lang.profile.special.compounding ?? 0) * 0.3 + (ph.templatic ? 0.3 : 0));
  const numeralBase = ph.family === 'original' ? style.weighted({ 10: 6, 20: 2, 12: 1 }) : ph.family === 'celtic' ? style.weighted({ 20: 3, 10: 2 }) : style.weighted({ 10: 9, 20: 1 });

  let shift = 0;
  let result;
  for (let pass = 0; pass < 3; pass++) {
    result = generatePass(lang, ctl, seed, sp, shift, derivRate, numeralBase);
    // compounds are excluded so that their order (which follows word order) never shifts the roots (locality)
    const cal = result.entries.filter(e => e.deriv?.type !== 'COMP' && !e.borrowed);
    if (!cal.length) break;
    const measured = cal.reduce((a, e) => a + e.syllables, 0) / cal.length;
    const err = ctl.wordLen - measured;
    if (Math.abs(err) < 0.05) break;
    shift += err * 1.1;
  }
  result.numeralBase = numeralBase;
  result.derivRate = derivRate;
  return result;
}

function generatePass(lang, ctl, seed, sp, shift, derivRate, numeralBase) {
  const { ph, morph: m, cascade } = lang;
  const L = ctl.wordLen;
  const byGloss = {};
  const taken = new Set(); // grammatical affixes are not checked, so grammar controls never reshuffle roots
  let rejections = 0;
  const entries = [];

  const coin = (meaning, attempt = 0) => {
    const [gloss, pos] = meaning;
    const rng = stream(seed, 'lexicon', gloss, attempt);
    let proto, root = null;
    const short = meaning[2] === 1 || (FUNCTION_POS.has(pos) && pos !== 'adv');
    if (ph.templatic && !FUNCTION_POS.has(pos) && pos !== 'num') {
      const t = templaticWord(ph, m, rng, pos, short ? Math.min(2, L + shift) : L + shift, short ? 0 : sp.templatic ?? 0.5, attempt);
      root = t.root; proto = t.proto;
    } else {
      const n = plannedSyllables(rng, meaning, L, shift, ph) + Math.floor(attempt / 8); // crowded sound space: grow
      proto = short ? genShortWord(ph, sp, rng, n) : genWord(ph, sp, rng, n);
    }
    const ev = applyCascade(cascade, ph, proto, rng);
    return { segs: ev.segs, proto, root, applied: ev.applied, exempt: ev.exempt };
  };

  const add = (meaning, made, deriv = null) => {
    const [gloss, pos, basic, tags] = meaning;
    const e = { gloss, pos, basic, tags: (tags || '').split(' ').filter(Boolean), ...made, deriv };
    e.syllables = e.segs.filter((s, i) => isV(s) && !(i > 0 && isV(e.segs[i - 1]) && ph.diphthongs.includes(vBase(e.segs[i - 1]) + vBase(s)))).length;
    byGloss[gloss] = e; entries.push(e); taken.add(segKey(e.segs));
    return e;
  };

  const tryUnique = (meaning) => {
    for (let attempt = 0; attempt < 25; attempt++) {
      const made = coin(meaning, attempt);
      const tooShort = ['n', 'v', 'adj'].includes(meaning[1]) && made.segs.length < 2;
      if (!taken.has(segKey(made.segs)) && !tooShort) return made;
      rejections++;
    }
    for (let attempt = 25; attempt < 80; attempt++) { const made = coin(meaning, attempt); if (!taken.has(segKey(made.segs))) return made; rejections++; }
    const made = coin(meaning, 80);
    const extension = [ph.consonants[0], ph.epenthetic];
    while (taken.has(segKey(made.segs))) made.segs = [...made.segs, ...extension];
    return made;
  };

  // 1) independent roots
  const derivedQueue = [];
  for (const meaning of MEANINGS) {
    const loan = lang.contactWords?.[meaning[0]];
    if (loan) add(meaning, loan);
  }
  for (const meaning of MEANINGS) {
    if (byGloss[meaning[0]]) continue;
    const d = meaning[4];
    const isNumCompound = meaning[1] === 'num' && numeralDerivation(meaning[0], numeralBase);
    if (isNumCompound) { derivedQueue.push([meaning, isNumCompound]); continue; }
    if (d) {
      const r = stream(seed, 'lexicon', meaning[0], 'derive?');
      if (meaning[5] || r.chance(derivRate)) { derivedQueue.push([meaning, d]); continue; }
    }
    add(meaning, tryUnique(meaning));
  }

  // 2) derived words (several passes so chains like teach -> teacher resolve)
  for (let pass = 0; pass < 4 && derivedQueue.length; pass++) {
    for (let i = 0; i < derivedQueue.length; i++) {
      const [meaning, d] = derivedQueue[i];
      const [type, b1, b2] = d;
      const base = byGloss[b1], base2 = b2 ? byGloss[b2] : null;
      if (!base || (b2 && !base2)) continue;
      let segs;
      if (meaning[5]) {
        segs = productiveCompound(lang, base, base2, s => taken.has(segKey(s)));
      } else if (type === 'COMP' || type === 'NUM') {
        const [head, mod] = type === 'NUM' ? [base, base2] : [base2, base];
        const a = m.compoundOrder === 'modifier-head' ? mod : head;
        const b = m.compoundOrder === 'modifier-head' ? head : mod;
        segs = m.linker && type === 'COMP' ? join(ph, join(ph, a.segs, m.linker), b.segs) : join(ph, a.segs, b.segs);
        if (type === 'NUM') segs = join(ph, base.segs, base2.segs);
      } else if (ph.templatic && base.root && m.patterns[type]) {
        const proto = applyPattern(m.patterns[type], base.root);
        segs = applyCascade(lang.cascade, ph, proto, stream(seed, 'lexicon', meaning[0])).segs;
      } else {
        const aff = m.deriv[type];
        segs = m.derivSide === 'prefix' ? join(ph, aff, base.segs, { harmonyFrom: 'right' }) : join(ph, base.segs, aff, { harmonyFrom: 'left' });
      }
      if (taken.has(segKey(segs))) { rejections++; add(meaning, tryUnique(meaning)); }
      else add(meaning, { segs, proto: null, root: type === 'COMP' ? null : base.root, applied: [], exempt: [] }, { type, from: [b1, b2].filter(Boolean) });
      derivedQueue.splice(i, 1); i--;
    }
  }
  for (const [meaning] of derivedQueue) add(meaning, tryUnique(meaning)); // unresolved: coin a root

  // keep the canonical meaning order
  const order = new Map(MEANINGS.map((mm, i) => [mm[0], i]));
  entries.sort((a, b) => order.get(a.gloss) - order.get(b.gloss));
  return { entries, byGloss, rejections };
}

// Numerals above the base are compounds. Returns ['NUM', a, b] meaning a+b (or a*b for multiples).
function numeralDerivation(gloss, base) {
  if (base === 10) { if (gloss === 'eleven') return ['NUM', 'ten', 'one']; if (gloss === 'twelve') return ['NUM', 'ten', 'two']; if (gloss === 'twenty') return ['NUM', 'two', 'ten']; }
  if (base === 20) { if (gloss === 'eleven') return ['NUM', 'ten', 'one']; if (gloss === 'twelve') return ['NUM', 'ten', 'two']; }
  if (base === 12) { if (gloss === 'twenty') return ['NUM', 'twelve', 'eight']; }
  return null;
}

export function measureLexicon(lang, entries) {
  let v = 0, total = 0, syl = 0;
  for (const e of entries) {
    for (const s of e.segs) { total++; if (isV(s)) v++; }
    syl += e.syllables;
  }
  return { vowelPct: 100 * v / Math.max(1, total), meanSyllables: syl / Math.max(1, entries.length), meanSegments: total / Math.max(1, entries.length) };
}

// Root-and-pattern word. tk in [0,1] is the consonant-pressure lever for templatic languages:
// it raises the chance of geminating the middle radical and of consonant-final nominal suffixes.
export function templaticWord(ph, m, rng, pos, target, tk, attempt = 0) {
  const root = genRoot(ph, rng);
  const aiu = ph.vowels.filter(v => 'aiu'.includes(v)).concat(ph.vowels[0]);
  let pat = pos === 'v' ? m.patterns.verb : pos === 'adj' ? m.patterns.adj : rng.pick(m.patterns.noun);
  if (rng.chance(tk * 0.85)) { const i = pat.indexOf('2'); if (i >= 0 && pat[i + 1] !== '3') pat = [...pat.slice(0, i), '2', '2', ...pat.slice(i + 1)]; }
  let proto = applyPattern(pat, root);
  const suffix = () => rng.chance(tk * 0.9) && ph.codaSet.length ? [rng.pick(aiu), rng.pick(ph.codaSet)] : [rng.pick(aiu)];
  if (pos !== 'v' && rng.chance(Math.max(0, Math.min(0.95, target - 2.0)))) proto = [...proto, ...suffix()];
  if (pos === 'v' && target > 3 && rng.chance(Math.min(0.9, target - 3))) proto = [...proto, ...suffix()];
  if (attempt >= 10) proto = [...proto, rng.pick(ph.vowels)];
  if (target < 2 && proto.filter(isV).length > 1 && rng.chance(Math.min(0.9, 2 - target))) proto = applyPattern(m.patterns.noun[1], root);
  return { root, proto };
}

// calibration helper: measure vowel % for random words at pressure k
export function sampleVowelPct(ph, k, seed, cascade, L, m = null) {
  const sp = shapeParams(ph, k);
  const rng = stream(seed, 'calibration');
  let v = 0, t = 0;
  for (let i = 0; i < 260; i++) {
    const n = Math.max(1, Math.floor(L + rng.next() - 0.3 + (rng.chance(0.15) ? rng.pick([-1, 1]) : 0)));
    let w = ph.templatic ? templaticWord(ph, m, rng, rng.pick(['n', 'n', 'v', 'adj']), L, k).proto : genWord(ph, sp, rng, n);
    if (!w) continue;
    w = applyCascade(cascade, ph, w, rng).segs;
    for (const s of w) { t++; if (isV(s)) v++; }
  }
  return 100 * v / Math.max(1, t);
}
