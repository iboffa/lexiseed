// Languages that descend from a real ancestor: the ancestor's words and endings are evolved through a seeded path
// of the family's real sound changes. The phoneme inventory is whatever the evolved words contain.
import { PROTO } from './data/proto/index.js';
import { CHANGES } from './data/changes.js';
import { choosePath } from './history2.js';
import { evolve, evolveSuffix, evolveWord, applyRule, toObjects } from './evolve.js';
import { MEANINGS } from './data/meanings.js';
import { SEGMENTS, seg } from './data/phonemes.js';
import { isV, vBase, isLong, toneOf } from './phonology.js';
import { productiveCompound } from './lexicon.js';
import { stream } from './rng.js';

export const FAMILY_PROTO = { romance: 'latin', hellenic: 'greek', slavic: 'protoslavic', germanic: 'protogermanic', celtic: 'protoceltic', indoaryan: 'sanskrit', semitic: 'protosemitic', uralic: 'protouralic', turkic: 'prototurkic', sinitic: 'middlechinese', japonic: 'protojaponic', bantu: 'protobantu', polynesian: 'protopolynesian' };
export const hasDescent = (family) => !!(CHANGES[family] && PROTO[FAMILY_PROTO[family]]);

const POS = Object.fromEntries(MEANINGS.map(m => [m[0], m[1]]));
const known = (s) => !!seg(s);

// evolve every ancestor word with a path
function evolveAll(path, P) {
  const out = {};
  for (const [g, w] of Object.entries(P.words)) {
    if (!w?.f) continue;
    const e = evolve(path.rules, w.f, { stress: w.s, record: true });
    out[g] = { segs: e.segs.filter(known), proto: w.f.split(/\s+/), hist: e.history, note: w.note, cls: w.cls, root: w.root };
  }
  return out;
}
function measure(words) {
  let v = 0, t = 0, syl = 0, n = 0;
  for (const w of Object.values(words)) { n++; for (const s of w.segs) { t++; if (isV(s)) v++; } syl += w.segs.filter((s, i) => isV(s) && !(i > 0 && isV(w.segs[i - 1]))).length; }
  return { vowelPct: 100 * v / Math.max(1, t), meanSyllables: syl / Math.max(1, n) };
}

// choose among seeded paths the one closest to the pinned targets (vowel %, word length)
export function chooseDescent(family, ctl, auto, seed) {
  const P = PROTO[FAMILY_PROTO[family]];
  const tries = (!auto.vowelPct || !auto.wordLen) ? 14 : 1;
  let best = null;
  for (let salt = 0; salt < tries; salt++) {
    const path = choosePath(family, seed, { salt, fidelity: 0.8, drift: ctl.drift });
    const words = evolveAll(path, P);
    const m = measure(words);
    const cost = (auto.vowelPct ? 0 : Math.abs(m.vowelPct - ctl.vowelPct) / 5) + (auto.wordLen ? 0 : Math.abs(m.meanSyllables - ctl.wordLen) / 0.3);
    if (!best || cost < best.cost - 1e-9) best = { path, words, m, cost, salt };
  }
  return { ...best, P };
}

// syllable model of the ancestor, used to coin ancestor-shaped words for meanings it lacks (and user words)
function protoModel(P) {
  const ini = {}, med = {}, nuc = {}, fin = {};
  const add = (o, k) => { o[k] = (o[k] || 0) + 1; };
  for (const w of Object.values(P.words)) {
    const s = (w.f || '').trim().split(/\s+/);
    let i = 0, first = true, cons = [];
    for (; i < s.length; i++) {
      const isVow = isV(s[i]);
      if (isVow) { add(first ? ini : med, cons.join(' ')); add(nuc, s[i]); cons = []; first = false; } else cons.push(s[i]);
    }
    add(fin, cons.join(' '));
  }
  return { ini, med, nuc, fin };
}
export function makeCoiner(P) {
  const M = protoModel(P);
  const pick = (rng, o) => { const e = Object.entries(o); return e.length ? rng.weighted(e) : ''; };
  return (rng, nSyl, simple = false) => {
    const out = [];
    for (let k = 0; k < Math.max(1, nSyl); k++) {
      const on = pick(rng, k && Object.keys(M.med).length ? M.med : M.ini);
      if (on) out.push(...(simple ? on.split(' ').slice(-1) : on.split(' ')));
      out.push(pick(rng, M.nuc));
    }
    const f = pick(rng, M.fin);
    if (f && f.split(' ').length <= 1) out.push(...f.split(' '));
    return out.filter(Boolean);
  };
}

// derive phonology fields from the evolved words
export function inventoryFrom(ph, wordLists) {
  const cs = {}, vs = {}, ons = {}, codas = {}, diph = {};
  let long = false, maxTone = 0;
  for (const segs of wordLists) {
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      if (isV(s)) { const b = vBase(s); vs[b] = (vs[b] || 0) + 1; if (isLong(s)) long = true; maxTone = Math.max(maxTone, toneOf(s)); if (i && isV(segs[i - 1])) diph[vBase(segs[i - 1]) + b] = (diph[vBase(segs[i - 1]) + b] || 0) + 1; }
      else cs[s] = (cs[s] || 0) + 1;
    }
    // onsets: consonant runs at word start; codas: at word end
    let j = 0; while (j < segs.length && !isV(segs[j])) j++;
    if (j >= 2) ons[segs.slice(0, j).join('.')] = 1;
    let k = segs.length; while (k > 0 && !isV(segs[k - 1])) k--;
    const coda = segs.slice(k);
    if (coda.length) codas[coda.join('.')] = 1;
    // medial clusters split as coda + onset (last one or two consonants form the onset)
    for (let a = 1; a < segs.length; a++) {
      if (isV(segs[a - 1]) && !isV(segs[a])) { let b = a; while (b < segs.length && !isV(segs[b])) b++; if (b < segs.length && b - a >= 3) ons[segs.slice(b - 2, b).join('.')] = 1; if (b < segs.length && b - a >= 2) codas[segs[a]] = 1; }
    }
  }
  ph.consonants = Object.keys(cs).filter(c => SEGMENTS[c]);
  ph.vowels = Object.keys(vs).filter(v => SEGMENTS[v]);
  ph.freq = { ...cs, ...vs };
  ph.onsetClusters = Object.keys(ons).map(k => k.split('.')).filter(c => c.length <= 3);
  ph.legalOnsets = new Set(Object.keys(ons).flatMap(k => { const p = k.split('.'); return p.length >= 2 ? [p.slice(-2).join('.'), k] : [k]; }));
  const codaList = Object.keys(codas).map(k => k.split('.'));
  ph.codaSet = [...new Set(codaList.filter(c => c.length === 1).map(c => c[0]))];
  ph.codaClusters = codaList.filter(c => c.length >= 2);
  ph.legalCodas = new Set(Object.keys(codas));
  ph.onsetCap = Math.max(1, ...ph.onsetClusters.map(c => c.length));
  ph.codaCap = ph.codaSet.length ? Math.max(1, ...ph.codaClusters.map(c => c.length)) : 0;
  ph.diphthongs = Object.entries(diph).filter(([, n]) => n >= 2).map(([d]) => d);
  ph.longVowels = long;
  ph.harmony = false;
  ph.toneCount = maxTone ? (maxTone <= 4 ? 4 : 6) : 0; // tones come from the ancestor, not from the tone control
  ph.maxRun = Math.max(ph.maxRun || 2, ph.onsetCap + ph.codaCap);
  ph.affixConsonants = null; ph.finalVowels = null; ph.finalCodas = null;
  ph.glide = ph.consonants.includes('j') ? 'j' : ph.consonants.includes('w') ? 'w' : ph.consonants.includes('h') ? 'h' : ph.consonants[0];
  ph.epenthetic = ['ə', 'e', 'i', 'a', 'u'].find(v => ph.vowels.includes(v)) || ph.vowels[0];
  ph.allophones = [];
  return ph;
}

// adapter so older code that calls applyCascade(cascade, ph, segs) works with an evolution path
export function cascadeAdapter(path) {
  return {
    rules: path.rules.map(r => ({ id: r.id, apply: (segs) => applyRule(r, toObjects(segs)).map(x => x.s) })),
    exceptionRate: 0, descent: true,
  };
}

// grammatical forms from the ancestor (each only if the ancestor had it)
export function ancestorGrammar(path, P) {
  const A = P.affixes || {};
  const suf = (x) => (x ? evolveSuffix(path.rules, x).filter(known) : null);
  const word = (x, clitic = false) => (x ? evolveWord(path.rules, x, { clitic }).filter(known) : null);
  const g = {};
  if (A.case) { g.case = {}; for (const [c, v] of Object.entries(A.case)) g.case[c] = { SG: suf(v.sg), PL: suf(v.pl) }; }
  if (A.caseAlt) { g.caseAlt = {}; for (const [c, v] of Object.entries(A.caseAlt)) if (c !== 'theme') g.caseAlt[c] = { SG: suf(v.sg), PL: suf(v.pl) }; g.caseAltTheme = A.caseAlt.theme; }
  if (A.plural) g.plural = suf(A.plural);
  if (A.person) { g.person = {}; for (const [t, ps] of Object.entries(A.person)) { g.person[t] = {}; for (const [p, v] of Object.entries(ps)) g.person[t][p] = suf(v); } }
  if (A.infinitive) g.infinitive = suf(A.infinitive);
  if (A.article) g.article = { def: word(A.article.def, true), indef: word(A.article.indef, true) };
  if (A.demonstratives) g.dem = { this: word(A.demonstratives.this), that: word(A.demonstratives.that) };
  if (A.pronouns) { g.pronouns = {}; for (const [p, v] of Object.entries(A.pronouns)) g.pronouns[p] = word(v); }
  if (A.adpositions) { g.adpos = {}; for (const [r, v] of Object.entries(A.adpositions)) g.adpos[r] = word(v, true); }
  if (A.negation) g.negation = word(A.negation, true);
  if (A.copula?.PRS) { g.copula = {}; for (const [p, v] of Object.entries(A.copula.PRS)) g.copula[p] = word(v); }
  if (A.classPrefixes) { g.classPrefixes = {}; for (const [c, v] of Object.entries(A.classPrefixes)) g.classPrefixes[c] = word(v, true); }
  return g;
}

// lexicon from the ancestor; gaps are derived (if the meaning has a derivation) or coined in the ancestor's shape
export function descentLexicon(lang, ctl, seed, d) {
  const { m: _ } = {}; void _;
  const entries = [];
  const byGloss = {};
  const taken = new Map();

  const coin = makeCoiner(d.P);
  lang.coinProto = (rng, n) => coin(rng, n);
  const keyOf = (s) => s.join(' ');
  const add = (meaning, made) => {
    const [gloss, pos, basic, tags] = meaning;
    const e = { gloss, pos, basic, tags: (tags || '').split(' ').filter(Boolean), applied: [], exempt: [], deriv: null, ...made };
    e.syllables = e.segs.filter((s, i) => isV(s) && !(i > 0 && isV(e.segs[i - 1]))).length || 1;
    entries.push(e); byGloss[gloss] = e; taken.set(keyOf(e.segs), gloss);
    return e;
  };
  // homophones: try the word with one sound change skipped (a recorded exception)
  const unique = (g, w, stress) => {
    let segs = w.segs;
    if (!taken.has(keyOf(segs)) && segs.length) return { segs, exempt: [] };
    for (const step of [...d.path.steps].reverse()) {
      const ex = new Set(step.rules.map(r => r.id));
      const alt = evolve(d.path.rules, w.proto, { stress, exempt: ex }).segs.filter(known);
      if (alt.length && !taken.has(keyOf(alt))) return { segs: alt, exempt: [step.id] };
    }
    return { segs, exempt: [], homophone: true };
  };
  const derived = [];
  const replaced = [];
  const loans = d.influence?.loans || {};
  // Reserve apportioned loans first. Native synonyms which merge with a loan can
  // follow the normal historical exception or coinage path without losing a donor.
  for (const meaning of MEANINGS) {
    const loan = lang.contactWords?.[meaning[0]];
    if (loan) add(meaning, loan);
  }
  for (const meaning of MEANINGS) {
    const [gloss] = meaning;
    if (byGloss[gloss]) continue;
    const w = d.words[gloss];
    const loan = loans[gloss];
    if (loan && loan.segs.length && !taken.has(keyOf(loan.segs))) { // a loan from the contact language replaces the native word
      add(meaning, { segs: loan.segs, proto: loan.proto, borrowed: true, loan: { from: d.influence.donorName, donorForm: loan.donorForm, displaced: w?.segs?.length ? w.proto : null }, inherited: false, root: null });
      continue;
    }
    if (w && w.segs.length) {
      const u = unique(gloss, w, d.P.words[gloss]?.s);
      if (u.homophone) { replaced.push({ gloss, with: taken.get(keyOf(u.segs)), proto: w.proto }); derived.push(meaning); continue; } // merged with another word: replaced by a new one
      add(meaning, { segs: u.segs, proto: w.proto, protoNote: w.note, history: w.hist, exempt: u.exempt, inherited: true, cls: w.cls, root: null });
    } else derived.push(meaning);
  }
  const coinGap = meaning => {
    let segs = null, proto = null;
    const common = meaning[2] === 1 || ['conj', 'part', 'q', 'dem'].includes(meaning[1]);
    const extra = ['n', 'v', 'adj'].includes(meaning[1]) && d.m.meanSyllables < 1.4 ? 1 : 0;
    for (let attempt = 0; attempt < 60; attempt++) {
      const rng = stream(seed, 'lexicon', meaning[0], attempt);
      const target = common ? (rng.chance(0.85) ? 1 : 2)
        : Math.max(1, Math.round(d.m.meanSyllables + (meaning[2] - 2) * 0.4 + rng.range(-0.5, 0.5))) + extra;
      proto = coin(rng, target + Math.floor(attempt / 12), common);
      segs = evolve(d.path.rules, proto).segs.filter(known);
      if (segs.some(isV) && segs.length >= 2 && !taken.has(keyOf(segs))) break;
    }
    // A productive modern extension also survives histories that erase a proto ending.
    const extension = [lang.ph.consonants[0], lang.ph.epenthetic];
    while (!segs.some(isV) || taken.has(keyOf(segs))) segs = [...segs, ...extension];
    const rep = replaced.find(r => r.gloss === meaning[0]);
    add(meaning, { segs, proto, coined: true, replacedInherited: rep ? { proto: rep.proto, mergedWith: rep.with } : null });
  };

  // Derivations may use newly coined stems or other derivations (e.g. schoolbag).
  // Resolve their dependencies regardless of the order of the meaning list.
  const pending = new Map(derived.map(meaning => [meaning[0], meaning]));
  const m = lang.morph;
  const resolve = (gloss, visiting = new Set()) => {
    if (byGloss[gloss]) return byGloss[gloss];
    const meaning = pending.get(gloss);
    if (!meaning || visiting.has(gloss)) throw new Error('Invalid derivation for ' + gloss);
    visiting.add(gloss);
    const recipe = meaning[4];
    if (recipe) {
      const [type, b1, b2] = recipe;
      const base = resolve(b1, visiting);
      let segs;
      if (type === 'COMP') {
        const head = resolve(b2, visiting);
        segs = productiveCompound(lang, base, head, s => taken.has(keyOf(s)));
      } else {
        const affix = m.deriv[type];
        segs = m.derivSide === 'prefix' ? [...affix, ...base.segs] : [...base.segs, ...affix];
      }
      if (!taken.has(keyOf(segs))) add(meaning, { segs, proto: null, deriv: { type, from: recipe.slice(1) } });
    }
    if (!byGloss[gloss]) coinGap(meaning);
    visiting.delete(gloss);
    return byGloss[gloss];
  };
  for (const meaning of derived) resolve(meaning[0]);
  const order = new Map(MEANINGS.map((mm, i) => [mm[0], i]));
  entries.sort((a, b) => order.get(a.gloss) - order.get(b.gloss));
  return { entries, byGloss, rejections: replaced.length, homophones: 0, replaced, numeralBase: 10, derivRate: 0.5 };
}

export { POS };
