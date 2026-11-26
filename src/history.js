// Sound-change cascade: proto-forms -> modern forms through an ordered list of seeded rules.
// This produces the "marks of history": irregular-looking forms, and proto-forms shown as etymologies.
// [ASSUMPTION] The rule menu is a small set of common, well-attested *types* of change.
import { SEGMENTS, seg } from './data/phonemes.js';
import { isV, vBase, isLong, toneOf } from './phonology.js';
import { stream } from './rng.js';

const withBase = (s, b) => b + s.slice(vBase(s).length); // keep length/tone marks on a vowel

// Each rule: id, label (shown in the grammar book), weight per family, applicable(ph), apply(segs, ctx) -> segs
const RULES = [
  {
    id: 'intervocalic-voicing', label: 'Voiceless stops became voiced between vowels (p t k → b d g).',
    w: { romance: 3, celtic: 3, original: 1, germanic: 1 },
    ok: ph => ['b', 'd', 'g'].some(c => ph.consonants.includes(c)),
    map: { p: 'b', t: 'd', k: 'g' },
    apply(segs, ph) { return segs.map((s, i) => (this.map[s] && ph.consonants.includes(this.map[s]) && isV(segs[i - 1] ?? '') && isV(segs[i + 1] ?? '')) ? this.map[s] : s); },
  },
  {
    id: 'final-devoicing', label: 'Voiced obstruents became voiceless at the end of a word (b d g z v → p t k s f).',
    w: { slavic: 4, germanic: 4, turkic: 2, original: 1 },
    ok: ph => ph.codaSet.some(c => ['b', 'd', 'g', 'z', 'v'].includes(c)) || ph.codaCap > 0,
    map: { b: 'p', d: 't', g: 'k', z: 's', v: 'f', ʒ: 'ʃ', dʒ: 'tʃ' },
    apply(segs, ph) { const l = segs.length - 1; const s = segs[l]; if (this.map[s] && ph.consonants.includes(this.map[s])) { const o = segs.slice(); o[l] = this.map[s]; return o; } return segs; },
  },
  {
    id: 'lenition', label: 'Voiced stops softened to fricatives between vowels (b d g → v ð ɣ).',
    w: { celtic: 4, hellenic: 3, romance: 1, semitic: 1, original: 1 },
    ok: ph => ['v', 'ð', 'ɣ', 'β'].some(c => ph.consonants.includes(c)),
    map: { b: ['β', 'v'], d: ['ð'], g: ['ɣ'] },
    apply(segs, ph) { return segs.map((s, i) => { const t = this.map[s]?.find(x => ph.consonants.includes(x)); return t && isV(segs[i - 1] ?? '') && isV(segs[i + 1] ?? '') ? t : s; }); },
  },
  {
    id: 'palatalization', label: 'Velars became palatal affricates before front vowels (k g → tʃ dʒ / _i, e).',
    w: { slavic: 5, romance: 4, indoaryan: 2, original: 1 },
    ok: ph => ph.consonants.includes('tʃ') || ph.consonants.includes('ts'),
    map: { k: ['tʃ', 'ts'], g: ['dʒ', 'ʒ', 'z'], x: ['ʃ', 's'] },
    apply(segs, ph) { return segs.map((s, i) => { const t = this.map[s]?.find(x => ph.consonants.includes(x)); const nx = segs[i + 1] ?? ''; return t && isV(nx) && 'ieɛy'.includes(vBase(nx)) ? t : s; }); },
  },
  {
    id: 'apocope', label: 'Short unstressed vowels were lost at the end of long words.',
    w: { germanic: 4, celtic: 3, slavic: 1, original: 1 },
    ok: ph => ph.codaCap > 0,
    apply(segs, ph) {
      const l = segs.length - 1;
      const nV = segs.filter(isV).length;
      if (nV < 3 || !isV(segs[l]) || isLong(segs[l]) || isV(segs[l - 1] ?? '')) return segs;
      const prev = segs[l - 1];
      if (!ph.codaSet.includes(prev)) return segs;
      if (!isV(segs[l - 2] ?? '')) return segs; // would create a cluster
      return segs.slice(0, l);
    },
  },
  {
    id: 'reduction', label: 'Unstressed final a and o were reduced to ə.',
    w: { germanic: 3, slavic: 1, celtic: 2, original: 1 },
    ok: ph => ph.vowels.includes('ə'),
    apply(segs) { const l = segs.length - 1; if (segs.filter(isV).length >= 2 && isV(segs[l]) && 'ao'.includes(vBase(segs[l])) && !isLong(segs[l])) { const o = segs.slice(); o[l] = withBase(segs[l], 'ə'); return o; } return segs; },
  },
  {
    id: 'h-loss', label: 'h disappeared between vowels.',
    w: { romance: 3, hellenic: 2, polynesian: 2, original: 1 },
    ok: ph => ph.consonants.includes('h'),
    apply(segs, ph) {
      const out = [];
      for (let i = 0; i < segs.length; i++) {
        if (segs[i] === 'h' && isV(segs[i - 1] ?? '') && isV(segs[i + 1] ?? '') && !isV(segs[i - 2] ?? '') && !isV(segs[i + 2] ?? '')) continue;
        out.push(segs[i]);
      }
      return out;
    },
  },
  {
    id: 'umlaut', label: 'Back vowels were fronted when the next syllable had i (a o u → æ ø y).',
    w: { germanic: 5, uralic: 1, original: 1 },
    ok: ph => ['æ', 'ø', 'y'].some(v => ph.vowels.includes(v)),
    map: { a: 'æ', o: 'ø', u: 'y' },
    apply(segs, ph) {
      const vi = segs.map((s, i) => isV(s) ? i : -1).filter(i => i >= 0);
      const out = segs.slice();
      for (let k = 0; k < vi.length - 1; k++) { const a = segs[vi[k]], b = segs[vi[k + 1]]; const t = this.map[vBase(a)]; if (t && ph.vowels.includes(t) && vBase(b) === 'i' && !ph.harmony) out[vi[k]] = withBase(a, t); }
      return out;
    },
  },
  {
    id: 'nasal-assimilation', label: 'n took the place of articulation of a following stop (np → mp, nk → ŋk).',
    w: { original: 2, bantu: 3, indoaryan: 2, romance: 2, uralic: 2, turkic: 2, japonic: 2 },
    ok: ph => ph.consonants.includes('n'),
    apply(segs, ph) { return segs.map((s, i) => { if (s !== 'n') return s; const nx = SEGMENTS[segs[i + 1]]; if (!nx || nx.type !== 'C') return s; if (nx.place === 'labial' && ph.consonants.includes('m')) return 'm'; if (nx.place === 'velar' && ph.consonants.includes('ŋ')) return 'ŋ'; return s; }); },
  },
  {
    id: 'monophthongization', label: 'Diphthongs became long vowels (ai → eː, au → oː).',
    w: { romance: 2, hellenic: 2, indoaryan: 3, semitic: 1, original: 1, japonic: 2 },
    ok: ph => ph.diphthongs.length > 0 && ph.vowels.includes('e') && ph.vowels.includes('o'),
    apply(segs, ph) {
      const out = [];
      for (let i = 0; i < segs.length; i++) {
        const a = segs[i], b = segs[i + 1];
        if (isV(a) && b && isV(b) && vBase(a) === 'a' && (vBase(b) === 'i' || vBase(b) === 'u') && !(toneOf(b))) {
          out.push((vBase(b) === 'i' ? 'e' : 'o') + (ph.longVowels ? 'ː' : '') + (toneOf(a) || '')); i++; continue;
        }
        out.push(a);
      }
      return out;
    },
  },
  {
    id: 'debuccalization', label: 's became h at the start of words.',
    w: { hellenic: 4, celtic: 1, indoaryan: 1, original: 1, polynesian: 2 },
    ok: ph => ph.consonants.includes('h') && ph.consonants.includes('s'),
    apply(segs) { return segs[0] === 's' && isV(segs[1] ?? '') ? ['h', ...segs.slice(1)] : segs; },
  },
  {
    id: 'final-raising', label: 'Final e and o were raised to i and u.',
    w: { slavic: 1, original: 1 },
    ok: ph => ph.vowels.includes('e') && ph.vowels.includes('o'),
    apply(segs) { const l = segs.length - 1; if (isV(segs[l]) && 'eo'.includes(vBase(segs[l]))) { const o = segs.slice(); o[l] = withBase(segs[l], vBase(segs[l]) === 'e' ? 'i' : 'u'); return o; } return segs; },
  },
  {
    id: 'cluster-simplification', label: 'The first consonant of word-initial clusters was lost.',
    w: { romance: 1, japonic: 2, polynesian: 3, original: 1, semitic: 1 },
    ok: ph => ph.onsetClusters.length > 0,
    apply(segs) { return !isV(segs[0]) && !isV(segs[1] ?? 'a') && segs[0] !== 's' ? segs.slice(1) : segs; },
  },
  {
    id: 'vowel-lengthening', label: 'Vowels lengthened before a lost coda consonant (VC → Vː).',
    w: { indoaryan: 2, semitic: 1, original: 1, japonic: 1 },
    ok: ph => ph.longVowels && ph.codaSet.includes('h'),
    apply(segs) { const o = []; for (let i = 0; i < segs.length; i++) { if (segs[i] === 'h' && isV(segs[i - 1] ?? '') && !isV(segs[i + 1] ?? 'a') && !isLong(segs[i - 1])) { o[o.length - 1] = withBase(segs[i - 1], vBase(segs[i - 1]) + 'ː'); continue; } o.push(segs[i]); } return o; },
  },
];

export function chooseCascade(ph, family, seed) {
  const rng = stream(seed, 'history');
  const n = rng.int(2, 5);
  const avail = RULES.filter(r => r.ok(ph));
  const chosen = [];
  while (chosen.length < n && chosen.length < avail.length) {
    // named families mostly undergo their own typical changes; 'original' samples the whole menu
    const cand = avail.filter(r => !chosen.includes(r)).map(r => [r, (r.w[family] ?? (family === 'original' ? 0.3 : 0)) + (family === 'original' ? 0.15 : 0.04)]);
    chosen.push(rng.weighted(cand));
  }
  // conservative words that escaped one rule: recorded exceptions
  return { rules: chosen, exceptionRate: rng.range(0.02, 0.07) };
}

export function applyCascade(cascade, ph, protoSegs, rng) {
  let s = protoSegs;
  const applied = [];
  const exempt = [];
  for (const r of cascade.rules) {
    const next = r.apply(s, ph);
    if (next.join('') !== s.join('')) {
      if (rng.chance(cascade.exceptionRate)) { exempt.push(r.id); continue; }
      applied.push(r.id);
      s = next;
    }
  }
  if (!s.some(isV)) return { segs: protoSegs, applied: [], exempt: [] }; // never lose the only vowel
  return { segs: s, applied, exempt };
}

export function ruleLabel(id) { return RULES.find(r => r.id === id)?.label ?? id; }
export { RULES };
void seg;
