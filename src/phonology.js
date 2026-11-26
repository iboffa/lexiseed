// Phonology: inventory, phonotactics, word shapes, calibration, romanization, IPA.
import { SEGMENTS, seg, segmentBase, isVowel, sonority, FRONT_OF, BACK_OF } from './data/phonemes.js';
import { stream } from './rng.js';

const ALL_SYMBOLS = Object.keys(SEGMENTS).sort((a, b) => b.length - a.length);

// Split a cluster string such as "tʃl" into known segments (longest match first).
export function parseSegs(str) {
  str = str.normalize('NFC');
  const out = []; let i = 0;
  while (i < str.length) {
    const m = ALL_SYMBOLS.find(s => str.startsWith(s, i));
    if (!m) return null;
    out.push(m); i += m.length;
  }
  return out;
}

// Vowel segments include any IPA diacritic, followed by optional length and tone.
export const vBase = segmentBase;
export const isLong = (s) => s.includes('ː');
export const toneOf = (s) => { const m = s.match(/[1-6]$/); return m ? +m[0] : 0; };
export const isV = (s) => !!s && isVowel(s);

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// ---------- inventory ----------
function pickInventory(pool, count, complexity, rng, jitter, required = []) {
  const maxTier = complexity <= 1 ? 1 : complexity <= 3 ? 2 : 3;
  const tierBoost = { 1: 3, 2: complexity >= 2 ? 1.4 : 0.15, 3: complexity >= 4 ? 1 : complexity === 3 ? 0.25 : 0 };
  const entries = Object.entries(pool).filter(([ipa]) => SEGMENTS[ipa]);
  const chosen = [];
  const weights = {};
  for (const [ipa, [w, tier]] of entries) weights[ipa] = w * (tierBoost[tier] ?? 0) * rng.range(1 - jitter, 1 + jitter);
  for (const r of required) if (pool[r] && !chosen.includes(r)) chosen.push(r);
  let guard = 0;
  while (chosen.length < count && guard++ < 500) {
    const cand = entries.filter(([ipa]) => !chosen.includes(ipa) && weights[ipa] > 0).map(([ipa]) => [ipa, weights[ipa]]);
    if (!cand.length) break;
    chosen.push(rng.weighted(cand));
  }
  void maxTier;
  return chosen;
}

// ---------- build ----------
export function buildPhonology(profile, ctl, seed) {
  const rng = stream(seed, 'phonology');
  const tac = stream(seed, 'phonotactics');
  const cx = ctl.complexity; // 1..5
  const t = (cx - 1) / 4;
  const isOriginal = ctl.family === 'original';
  const jitter = isOriginal ? 0.85 : 0.45;

  const cCount = Math.round(clamp(lerp(profile.cCount[0], profile.cCount[1], t) + rng.int(-1, 1), 6, 40));
  const vCount = Math.round(clamp(lerp(profile.vCount[0], profile.vCount[1], t) + rng.int(-1, 1), 3, 14));
  const consonants = pickInventory(profile.consonants, cCount, cx, rng, jitter, ['m', 'n', 't', 'k'].filter(c => profile.consonants[c]).slice(0, 3));
  // two rhotics (r and ɾ) force spellings like 'rr'; keep both only in complex inventories
  if (consonants.includes('r') && consonants.includes('ɾ') && cx < 4) consonants.splice(consonants.indexOf('ɾ'), 1);
  const vowels = pickInventory(profile.vowels, vCount, cx, rng, jitter * 0.6, ['a', 'i', 'u'].filter(v => profile.vowels[v]));

  // vowel harmony needs front/back pairs
  const harmony = ctl.harmony;
  // [ASSUMPTION] default pairs are Finnish-like (a/ä o/ö u/y, i e neutral); a profile may give its own (Turkic a/e, ı/i ...)
  const hf = profile.harmonyPairs || { u: 'y', o: 'ø', a: 'æ', ɑ: 'æ', ɔ: 'ø' };
  const hb = {}; for (const [b, f] of Object.entries(hf)) if (!hb[f]) hb[f] = b; // first pair wins (o, not ɔ, for ø)
  if (harmony) {
    for (const v of [...vowels]) {
      const partner = hf[v] || hb[v];
      if (partner && SEGMENTS[partner] && !vowels.includes(partner) && vowels.length < 12) vowels.push(partner);
    }
    if (!vowels.some(v => hf[v])) vowels.push(Object.keys(hf)[0]);
    if (!vowels.some(v => hb[v])) vowels.push(Object.values(hf)[0]);
  }

  // frequencies (each sister language gets its own)
  const freq = {};
  for (const c of consonants) freq[c] = (profile.consonants[c]?.[0] ?? 1) * rng.range(0.5, 1.7);
  for (const v of vowels) freq[v] = (profile.vowels[v]?.[0] ?? 1) * rng.range(0.6, 1.5);
  if (profile.nasalVowels && cx >= 3) {
    const nasal = stream(seed, 'nasal-vowels');
    if (nasal.chance(0.25 + 0.15 * (cx - 3))) {
      const candidates = profile.nasalVowels.filter(v => vowels.includes(SEGMENTS[v].oral));
      for (const v of nasal.sample(candidates, Math.min(candidates.length, nasal.int(2, 3)))) {
        vowels.push(v);
        freq[v] = freq[SEGMENTS[v].oral] * nasal.range(0.25, 0.5);
      }
    }
  }

  // ---- phonotactics ----
  const onsetCap = Math.min(profile.onsetMax, [1, 2, 2, 3, 3][cx - 1]);
  const codaCap = Math.min(profile.codaMax, [1, 1, 2, 2, 3][cx - 1]);
  const inv = new Set(consonants);

  let onsetClusters = [];
  if (onsetCap >= 2) {
    let cand = [];
    if (profile.clusterOnset) {
      cand = profile.clusterOnset.map(parseSegs).filter(c => c && c.every(s => inv.has(s)) && c.length <= onsetCap);
    }
    if (cand.length < 4) { // generic sonority-rising clusters
      const obs = consonants.filter(c => sonority(c) <= 3 && !SEGMENTS[c].pren);
      const son = consonants.filter(c => ['lateral', 'rhotic', 'glide'].includes(SEGMENTS[c].manner) || (cx >= 4 && SEGMENTS[c].manner === 'nasal'));
      for (const a of obs) for (const b of son) if (sonority(b) - sonority(a) >= 2 && SEGMENTS[a].place !== SEGMENTS[b].place) cand.push([a, b]);
      if (cx >= 3 && inv.has('s')) for (const b of consonants.filter(c => SEGMENTS[c].manner === 'stop' && !SEGMENTS[c].voice)) cand.push(['s', b]);
      if (onsetCap >= 3 && inv.has('s')) for (const b of ['p', 't', 'k']) for (const c of ['r', 'l']) if (inv.has(b) && inv.has(c)) cand.push(['s', b, c]);
    }
    const keep = clamp(0.35 + 0.12 * cx + tac.range(-0.15, 0.15), 0.25, 0.95);
    onsetClusters = cand.filter(() => tac.chance(keep));
    if (onsetClusters.length > 6 + 5 * cx) onsetClusters = tac.sample(onsetClusters, 6 + 5 * cx);
    if (!onsetClusters.length && cand.length) onsetClusters = tac.sample(cand, Math.min(3, cand.length));
  }

  let codaSet;
  if (codaCap === 0) codaSet = [];
  else if (profile.codaSet) codaSet = profile.codaSet.filter(c => inv.has(c));
  else {
    const scored = consonants.map(c => [c, (sonority(c) >= 4 ? 3 : 1) * (['s', 't', 'k', 'n', 'r', 'l', 'm'].includes(c) ? 2 : 1) * tac.range(0.5, 1.5)]);
    scored.sort((a, b) => b[1] - a[1]);
    const n = Math.max(2, Math.round(consonants.length * clamp(0.25 + 0.15 * cx, 0.3, 1)));
    codaSet = scored.slice(0, n).map(x => x[0]);
  }
  if (codaCap > 0 && !codaSet.length) codaSet = consonants.filter(c => ['n', 'm', 's', 'r', 'l', 't'].includes(c)).slice(0, 3);

  let codaClusters = [];
  if (codaCap >= 2) {
    const first = codaSet.filter(c => sonority(c) >= 3);
    const second = consonants.filter(c => sonority(c) <= 3);
    for (const a of first) for (const b of second) if (sonority(a) > sonority(b) && a !== b) codaClusters.push([a, b]);
    codaClusters = tac.sample(codaClusters, Math.min(codaClusters.length, 2 + 3 * (cx - 2) + tac.int(0, 3)));
    if (codaCap >= 3 && inv.has('s') && inv.has('t')) codaClusters.push(['n', 's', 't'].filter(s => inv.has(s)));
  }

  const longVowels = rng.chance(profile.longVowels);
  const diphthongs = [];
  if (profile.diphthongList) {
    for (const d of profile.diphthongList) if (rng.chance(clamp(profile.diphthongs * 2.2, 0, 1)) && parseSegs(d)?.every(v => vowels.includes(v))) diphthongs.push(d);
  } else if (rng.chance(clamp(profile.diphthongs * 2.2, 0, 1))) {
    const offglides = vowels.filter(v => v === 'i' || v === 'u');
    for (const a of vowels) for (const b of offglides) if (a !== b && 'aeoɔɛə'.includes(a)) diphthongs.push(a + b);
  }

  // stress and tone
  const stress = rng.weighted(profile.stress);
  const toneCount = ctl.tone === 'none' ? 0 : ctl.tone === 'two' ? 2 : rng.int(3, 5);

  const ph = {
    consonants, vowels, freq, onsetClusters, codaSet, codaClusters, onsetCap, codaCap,
    longVowels, diphthongs, stress, toneCount, harmony, hf, hb,
    finalVowel: profile.finalVowel, templatic: !!profile.special.templatic,
    vowelInitial: profile.vowelInitial ?? null,
    finalVowels: profile.finalVowels ? Object.fromEntries(Object.entries(profile.finalVowels).filter(([v]) => vowels.includes(v))) : null,
    finalCodas: profile.finalCodas ? profile.finalCodas.filter(c => consonants.includes(c)) : null,
    affixConsonants: profile.affixConsonants ? profile.affixConsonants.filter(c => consonants.includes(c)) : null,
    noInitial: profile.noInitial || [],
    toneSpelling: profile.toneSpelling || 'marks',
    allophones: [],
    family: ctl.family,
  };

  // epenthetic vowel and hiatus strategy (used when joining affixes)
  ph.epenthetic = ['ə', 'e', 'i', 'a', 'u'].find(v => vowels.includes(v) && rng.chance(0.6)) || vowels[0];
  ph.hiatus = rng.weighted({ glide: 3, delete: 2 });
  ph.glide = consonants.includes('j') ? 'j' : consonants.includes('w') ? 'w' : consonants.includes('h') ? 'h' : consonants.includes('n') ? 'n' : consonants[0];

  ph.complexity = cx;
  ph.maxRun = clamp(onsetCap + codaCap, 1, cx <= 2 ? 2 : cx <= 4 ? 3 : 4);
  for (const [t, ctx, out] of profile.allophones || []) {
    if (!consonants.includes(t)) continue;
    if (out && SEGMENTS[out] && !consonants.includes(out)) { consonants.push(out); freq[out] = 0; } // only arises by rule
    ph.allophones.push([t, ctx, out]);
  }
  ph.legalOnsets = new Set(onsetClusters.map(c => c.join('.')));
  ph.legalCodas = new Set([...codaSet, ...codaClusters.map(c => c.join('.'))]);
  return ph;
}

// ---------- syllable / word generation ----------
function weightedFrom(list, freq, rng, filter) {
  const items = list.filter(x => !filter || filter(x)).map(x => [x, freq[x] ?? 1]);
  return items.length ? rng.weighted(items) : list[0];
}

// pressure k in [0,1]: consonants per syllable rise with k (used for vowel % calibration)
export function shapeParams(ph, k) {
  return {
    onset: clamp(0.45 + 2.5 * k, 0.45, 0.94),
    onsetCluster: ph.onsetClusters.length ? clamp(1.3 * k - 0.35, 0, 0.75) : 0,
    coda: ph.codaCap > 0 ? clamp(1.3 * k - 0.12, 0, 0.9) : 0,
    codaCluster: ph.codaClusters.length ? clamp(1.2 * k - 0.6, 0, 0.6) : 0,
    diph: ph.diphthongs.length ? clamp(0.06 + 0.3 * (1 - k) ** 2, 0, 0.3) : 0,
    long: ph.longVowels ? 0.12 : 0,
  };
}

export function harmonyClassOfVowel(v, ph) {
  const hf = ph?.hf || FRONT_OF, hb = ph?.hb || BACK_OF;
  if (hf[v]) return 'back';
  if (hb[v] && (ph?.hb || (v !== 'i' && v !== 'e'))) return 'front';
  return 'neutral';
}

function vowelAllowed(ph, v, hClass) {
  if (!ph.harmony || !hClass) return true;
  const c = harmonyClassOfVowel(v, ph);
  return c === 'neutral' || c === hClass;
}

export function genSyllable(ph, sp, rng, { first, last, hClass }) {
  const out = [];
  // onset
  if (rng.chance(first ? sp.onset : Math.max(sp.onset, 0.85))) {
    if (rng.chance(sp.onsetCluster)) out.push(...rng.pick(ph.onsetClusters));
    else out.push(weightedFrom(ph.consonants, ph.freq, rng, c => !(SEGMENTS[c].manner === 'glide' && rng.chance(0.4))));
  }
  // nucleus
  if (rng.chance(sp.diph)) {
    const d = rng.pick(ph.diphthongs.map(parseSegs).filter(pair => pair?.every(v => vowelAllowed(ph, v, hClass))));
    if (d) out.push(...d); else out.push(weightedFrom(ph.vowels, ph.freq, rng, v => vowelAllowed(ph, v, hClass)));
  } else {
    let v = weightedFrom(ph.vowels, ph.freq, rng, v => vowelAllowed(ph, v, hClass));
    if (rng.chance(sp.long)) v += 'ː';
    out.push(v);
  }
  // coda
  const codaP = last ? sp.coda * (1 - ph.finalVowel) * 1.7 : sp.coda;
  if (ph.codaSet.length && rng.chance(clamp(codaP, 0, 0.95))) {
    if (rng.chance(sp.codaCluster) && ph.codaClusters.length) out.push(...rng.pick(ph.codaClusters));
    else out.push(weightedFrom(ph.codaSet, ph.freq, rng));
  }
  return out;
}

export function assignTones(ph, segs, rng) {
  if (!ph.toneCount) return segs;
  return segs.map((s, i) => {
    if (!isV(s)) return s;
    if (i > 0 && isV(segs[i - 1])) return s; // second half of a diphthong
    return s + String(rng.int(1, ph.toneCount));
  });
}

export function genWord(ph, sp, rng, nSyl) {
  const segs = [];
  const hClass = ph.harmony ? rng.pick(['front', 'back']) : null;
  for (let i = 0; i < nSyl; i++) {
    const syl = genSyllable(ph, sp, rng, { first: i === 0, last: i === nSyl - 1, hClass });
    // avoid V.V hiatus by forcing onset in non-initial syllables
    if (segs.length && isV(segs[segs.length - 1]) && isV(syl[0])) syl.unshift(weightedFrom(ph.consonants, ph.freq, rng, c => !ph.legalOnsets.size || true));
    // avoid consonant pileups across the boundary: trim the onset, then the previous coda
    const runAt = () => { let a = 0; for (let k = segs.length - 1; k >= 0 && !isV(segs[k]); k--) a++; let b = 0; for (let k = 0; k < syl.length && !isV(syl[k]); k++) b++; return [a, b]; };
    for (let guard = 0; guard < 4 && segs.length; guard++) {
      const [a, b] = runAt();
      if (a + b <= ph.maxRun) break;
      if (b > 1) syl.shift(); else if (a > 1 || (a === 1 && b === 1 && ph.maxRun < 2)) segs.pop(); else break;
    }
    // avoid geminates
    if (segs.length && segs[segs.length - 1] === syl[0]) syl.shift();
    segs.push(...syl);
  }
  // family word-shape tendencies: few vowel-initial words, preferred final vowels and final consonants
  if (ph.vowelInitial != null && isV(segs[0]) && !rng.chance(ph.vowelInitial)) {
    segs.unshift(weightedFrom(ph.consonants, ph.freq, rng, c => SEGMENTS[c].manner !== 'glide' && c !== segs[1]));
  }
  if (ph.finalCodas && !isV(segs[segs.length - 1])) {
    const last = segs[segs.length - 1];
    if (!ph.finalCodas.includes(last) || !isV(segs[segs.length - 2])) segs.push(rng.weighted(Object.entries(ph.finalVowels || { a: 1 })));
  }
  const fv = ph.finalVowels ? Object.entries(ph.finalVowels).filter(([v]) => vowelAllowed(ph, v, hClass)) : [];
  if (fv.length && isV(segs[segs.length - 1])) {
    const l = segs.length - 1;
    if (!isV(segs[l - 1] ?? '')) segs[l] = rng.weighted(fv) + segs[l].replace(vBase(segs[l]), '');
    else if (l > 1) segs.splice(l, 1); // drop the tail of a final diphthong
  }
  if (ph.noInitial.includes(segs[0])) {
    segs[0] = weightedFrom(ph.consonants, ph.freq, rng, c => !ph.noInitial.includes(c) && SEGMENTS[c].manner !== 'glide');
  }
  return assignTones(ph, applyAllophones(ph, segs), rng);
}

// Context rules such as Japanese s -> sh before i. Rule: [target, following vowels, result ('' deletes)].
export function applyAllophones(ph, segs) {
  if (!ph.allophones?.length) return segs;
  const out = [];
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i], nx = segs[i + 1];
    const r = nx && isV(nx) && ph.allophones.find(([t, ctx]) => t === s && ctx.includes(SEGMENTS[vBase(nx)].oral || vBase(nx)));
    if (r) { if (r[2]) out.push(r[2]); if (!r[2] && i === 0 && !out.length) { /* initial glide deletion */ } continue; }
    out.push(s);
  }
  return out.some(isV) ? out : segs;
}

// Semitic-style root: three consonants, no two identical in a row.
export function genRoot(ph, rng) {
  const cons = ph.consonants.filter(c => SEGMENTS[c].manner !== 'glide' || rng.chance(0.3));
  const r = [];
  while (r.length < 3) {
    const c = weightedFrom(cons, ph.freq, rng);
    if (r.length && (r[r.length - 1] === c || SEGMENTS[r[r.length - 1]].place === SEGMENTS[c].place && rng.chance(0.8))) continue;
    r.push(c);
  }
  return r;
}

// ---------- syllabification and stress ----------
export function syllabify(ph, segs) {
  const nuclei = [];
  for (let i = 0; i < segs.length; i++) {
    if (isV(segs[i])) {
      if (i > 0 && isV(segs[i - 1]) && ph.diphthongs.includes(vBase(segs[i - 1]) + vBase(segs[i])) && nuclei[nuclei.length - 1] === i - 1) { nuclei[nuclei.length - 1] = i - 1; continue; }
      nuclei.push(i);
    }
  }
  if (!nuclei.length) return [[0, segs.length]];
  const bounds = [0];
  for (let n = 1; n < nuclei.length; n++) {
    let end = nuclei[n - 1] + 1;
    while (end < segs.length && isV(segs[end]) && end < nuclei[n]) end++;
    const cons = nuclei[n] - end; // consonants between nuclei
    let split;
    if (cons <= 0) split = nuclei[n];
    else if (cons === 1) split = nuclei[n] - 1;
    else {
      const two = segs.slice(nuclei[n] - 2, nuclei[n]).join('.');
      split = ph.legalOnsets.has(two) && cons >= 2 ? nuclei[n] - 2 : nuclei[n] - 1;
    }
    bounds.push(split);
  }
  bounds.push(segs.length);
  const syl = [];
  for (let i = 0; i < bounds.length - 1; i++) syl.push([bounds[i], bounds[i + 1]]);
  return syl;
}

export function stressIndex(ph, segs, syls, rng) {
  const n = syls.length;
  if (n <= 1) return 0;
  const heavy = (s) => { const [a, b] = s; const part = segs.slice(a, b); const vi = part.findIndex(isV); return part.some(isLong) || (vi >= 0 && part.slice(vi + 1).some(x => !isV(x))) || (vi >= 0 && isV(part[vi + 1] ?? '')); };
  switch (ph.stress) {
    case 'initial': return 0;
    case 'final': return n - 1;
    case 'penult': return n - 2;
    case 'antepenult': return Math.max(0, n - 3);
    case 'weight': return n >= 3 ? (heavy(syls[n - 2]) ? n - 2 : n - 3) : (heavy(syls[n - 1]) && !heavy(syls[0]) ? n - 1 : 0);
    case 'free': return rng ? rng.int(0, n - 1) : 0;
    case 'pitch': return rng ? (rng.chance(0.4) ? -1 : rng.int(0, n - 1)) : -1;
    default: return -1;
  }
}

// ---------- representation ----------
const TONE_IPA = { 2: ['˥', '˩'], 3: ['˥', '˧', '˩'], 4: ['˥', '˧˥', '˨˩˦', '˥˩'], 5: ['˥', '˧˥', '˨˩˦', '˥˩', '˧'], 6: ['˥', '˧˥', '˧', '˨˩', '˩˧', '˨'] };
const TONE_MARK = { 2: ['́', ''], 3: ['́', '', '̀'], 4: ['̄', '́', '̌', '̀'], 5: ['̄', '́', '̌', '̀', ''], 6: ['̄', '́', '', '̀', '̌', '̏'] };

export function toIPA(ph, segs, stressAt = null) {
  const syls = syllabify(ph, segs);
  const st = stressAt ?? (ph.stress === 'none' || ph.stress === 'pitch' ? -1 : stressIndex(ph, segs, syls, null));
  let out = '';
  syls.forEach(([a, b], i) => {
    if (i === st && syls.length > 1) out += 'ˈ';
    else if (i > 0) out += '.';
    for (const s of segs.slice(a, b)) {
      const t = toneOf(s);
      out += s.replace(/[1-6]$/, '');
      if (t && ph.toneCount) out += TONE_IPA[ph.toneCount][t - 1];
    }
  });
  return '/' + out + '/';
}

// Romanization table: phoneme -> letters. Unique, unambiguous where possible.
export function buildRomanization(ph, profile, seed) {
  const rng = stream(seed, 'romanization');
  const taken = new Set();
  const map = {};
  const style = rng.weighted({ plain: 3, diacritic: 2 });
  const order = [...ph.vowels, ...ph.consonants].sort((a, b) => (SEGMENTS[a].rom.length - SEGMENTS[b].rom.length));
  // simple one-letter phonemes first so they keep their natural letter
  const TONAL_V0 = { ɛ: 1, ɔ: 1, ə: 1, ɨ: 1, ø: 1, y: 1, æ: 1, ɯ: 1, ɤ: 1, ɑ: 1 };
  const prefTargets = new Set(Object.entries(profile.romPrefs || {}).filter(([k]) => k !== 'long' && ph.consonants.concat(ph.vowels).includes(k)).map(([, v]) => v));
  const simple = order.filter(p => SEGMENTS[p].rom[0] === p && !(profile.romPrefs?.[p]) && !prefTargets.has(p));
  for (const p of simple) { map[p] = p; taken.add(p); }
  // the family's own spellings win before any default letter is handed out
  for (const p of order) {
    const want = profile.romPrefs?.[p];
    if (want && !map[p] && (!taken.has(want) || profile.romMerge?.includes(p)) && !(ph.toneCount && TONAL_V0[p])) { map[p] = want; taken.add(want); }
  }
  // Spanish-style: trill rr vs tap r when both exist
  if (ph.consonants.includes('r') && ph.consonants.includes('ɾ')) { map.r = 'rr'; map['ɾ'] = 'r'; taken.add('rr'); taken.add('r'); }
  // tone languages keep vowel letters free of diacritics (tone marks go there), using IPA-style letters
  const TONAL_V = { ɛ: ['ɛ'], ɔ: ['ɔ'], ə: ['e', 'ə'], ɨ: ['ɨ'], ø: ['ø'], y: ['ü', 'y'], æ: ['æ'], ɯ: ['ɯ'], ɤ: ['ɤ'], ɑ: ['ɑ'] };
  for (const p of order) {
    if (map[p]) continue;
    const diacriticFirst = (list) => [...list.filter(r => /[^\x00-\x7f]/.test(r) && r.length === 1), ...list];
    const base = ph.toneCount && TONAL_V[p] ? TONAL_V[p] : (style === 'diacritic' ? diacriticFirst(SEGMENTS[p].rom) : SEGMENTS[p].rom);
    const prefs = [ph.toneCount && TONAL_V[p] ? null : profile.romPrefs?.[p], ...base, ...SEGMENTS[p].rom].filter(Boolean);
    let choice = prefs.find(r => !taken.has(r) && !(r.length === 1 && ph.consonants.concat(ph.vowels).includes(r) && r !== p));
    if (!choice) choice = prefs.find(r => !taken.has(r)) || p;
    map[p] = choice; taken.add(choice);
  }
  const longStyle = profile.romPrefs?.long || rng.weighted({ double: ph.family === 'uralic' ? 9 : 2, macron: ph.family === 'semitic' || ph.family === 'japonic' || ph.family === 'polynesian' ? 9 : 2, acute: 1 });
  const spelling = (profile.spelling || []).map(([re, to]) => [new RegExp(re, 'g'), to]);
  return { map, longStyle, spelling };
}

export function romanize(ph, rom, segs) {
  let out = '';
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (isV(s)) {
      const base = vBase(s);
      let r = rom.map[base] ?? base;
      const t = toneOf(s);
      if (isLong(s) && r.length > 1 && /^[a-z]+$/.test(r)) { /* digraph vowels such as ai/au are written without a length mark */ }
      else if (isLong(s)) {
        if (rom.longStyle === 'none') { /* length not written */ }
        else if (rom.longStyle === 'double') r = r + r;
        else if (rom.longStyle === 'macron') r = (r + '̄').normalize('NFC');
        else r = (r + '́').normalize('NFC');
      }
      if (t && ph.toneCount && ph.toneSpelling !== 'none') {
        const mark = TONE_MARK[ph.toneCount][t - 1];
        if (mark) r = (r[0] + mark + r.slice(1)).normalize('NFC');
      }
      out += r;
    } else {
      out += rom.map[s] ?? s;
    }
  }
  // trill spelled rr only between vowels (Spanish-style): word-initially and after consonants it is r
  if (rom.spelling) for (const [re, to] of rom.spelling) out = out.replace(re, to);
  if (rom.map.r === 'rr') out = out.replace(/rr$/, 'r').replace(/^rr/, 'r').replace(/([^aeiouáéíóúàèìòùäëïöüāēīōū])rr/g, '$1r');
  return out;
}

export const TONE_NAMES = {
  2: ['high', 'low'], 3: ['high', 'mid', 'low'], 4: ['level', 'rising', 'dipping', 'falling'], 5: ['level', 'rising', 'dipping', 'falling', 'neutral'], 6: ['high level', 'high rising', 'mid level', 'low falling', 'low rising', 'low level'],
};
export { TONE_MARK, TONE_IPA };
