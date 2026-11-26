// Sound-change engine: ordered rewrite rules over segment arrays, with stress and origin tracking.
// Rules are written in the usual notation, "A > B / L _ R", so each family's history is readable data
// (src/data/changes.js). The seed picks a path through each family's branch options.
//
// Tokens: a segment (k, tʃ, aː), a set {p t k} (a set on both sides maps position by position),
// classes V C Vf (front) Vb (back) Vh (high) Vlo (low) Vr (round) Vl (long) Vs (short) V' (stressed) V_ (unstressed)
// S (stop) Sv (voiced stop) Sx (voiceless stop) F (fricative) N (nasal) L (liquid) G (glide) R (sonorant: N L G)
// T (obstruent) K (velar) P (labial) D (coronal), # (word edge), ∅ (nothing). "C2" in a context means two consonants.
import { seg, segmentBase } from './data/phonemes.js';

const baseOf = segmentBase;
const feat = seg;
const isVow = (s) => feat(s)?.type === 'V';
const CLASS = {
  V: (x) => isVow(x.s),
  C: (x) => !isVow(x.s),
  Vf: (x) => isVow(x.s) && feat(x.s).back === 'front',
  Vb: (x) => isVow(x.s) && feat(x.s).back === 'back',
  Vh: (x) => isVow(x.s) && feat(x.s).height === 'high',
  Vlo: (x) => isVow(x.s) && feat(x.s).height === 'low',
  Vr: (x) => isVow(x.s) && feat(x.s).round,
  Vl: (x) => isVow(x.s) && x.s.includes('ː'),
  Vs: (x) => isVow(x.s) && !x.s.includes('ː'),
  "V'": (x) => isVow(x.s) && x.st,
  V_: (x) => isVow(x.s) && !x.st,
  S: (x) => feat(x.s)?.manner === 'stop' && !feat(x.s).pren,
  Sv: (x) => feat(x.s)?.manner === 'stop' && feat(x.s).voice,
  Sx: (x) => feat(x.s)?.manner === 'stop' && !feat(x.s).voice,
  F: (x) => feat(x.s)?.manner === 'fricative',
  A: (x) => feat(x.s)?.manner === 'affricate',
  N: (x) => feat(x.s)?.manner === 'nasal',
  L: (x) => ['lateral', 'rhotic'].includes(feat(x.s)?.manner),
  G: (x) => feat(x.s)?.manner === 'glide',
  R: (x) => ['nasal', 'lateral', 'rhotic', 'glide'].includes(feat(x.s)?.manner),
  T: (x) => ['stop', 'fricative', 'affricate'].includes(feat(x.s)?.manner),
  K: (x) => !isVow(x.s) && ['velar', 'uvular'].includes(feat(x.s)?.place),
  P: (x) => !isVow(x.s) && feat(x.s)?.place === 'labial',
  D: (x) => !isVow(x.s) && ['dental', 'alveolar', 'postalveolar'].includes(feat(x.s)?.place),
};

function tokens(str) { // "{p t k} V' # C2" -> tokens, keeping braces together
  const out = []; const re = /\{[^}]*\}|\S+/g; let m;
  while ((m = re.exec(str))) out.push(m[0]);
  return out;
}
function matcher(tok) {
  if (tok === '#') return { edge: true };
  if (tok === 'C2') return { multi: 2, f: CLASS.C };
  if (tok.startsWith('{')) { const set = tok.slice(1, -1).trim().split(/\s+/).map(t => (t === '∅' ? '' : t)); return { set, edgeOk: set.includes('#'), f: (x) => set.includes(x.s) || set.some(t => CLASS[t]?.(x)) }; }
  if (CLASS[tok]) return { f: CLASS[tok], cls: tok };
  if (tok.endsWith('*')) { const b = tok.slice(0, -1); return { f: (x) => baseOf(x.s) === b }; } // any length / tone
  return { lit: tok, f: (x) => x.s === tok };
}

// compile "A > B / L _ R"
export function compileRule(r) {
  if (r.fn) return { ...r, kind: 'fn' };
  const [lhs, envRaw] = r.r.split('/').map(s => s.trim());
  const [Araw, Braw] = lhs.split('>').map(s => s.trim());
  const env = envRaw ?? '_';
  const [Lraw, Rraw] = env.split('_').map(s => s.trim());
  const A = Araw === '∅' ? [] : tokens(Araw).map(matcher);
  const B = Braw === '∅' ? [] : tokens(Braw);
  const Lm = Lraw ? tokens(Lraw).map(matcher) : [];
  const Rm = Rraw ? tokens(Rraw).map(matcher) : [];
  return { ...r, kind: 'rw', A, B, L: Lm, R: Rm };
}

function matchSeq(ms, w, start, dir) {
  // returns end index (exclusive, for dir +1) or start index (for dir -1) if the matcher list matches, else -1
  let i = start;
  const list = dir > 0 ? ms : [...ms].reverse();
  for (const m of list) {
    if (m.edge) { if (dir > 0 ? i !== w.length : i !== 0) return -1; continue; }
    const n = m.multi || 1;
    for (let k = 0; k < n; k++) {
      const idx = dir > 0 ? i : i - 1;
      if ((idx < 0 || idx >= w.length) && m.edgeOk) { i = dir > 0 ? w.length : 0; break; }
      if (idx < 0 || idx >= w.length || !m.f(w[idx])) return -1;
      i += dir;
    }
  }
  return i;
}

function produce(rule, matched) {
  // B tokens -> new segment objects; sets map position by position, classes in B keep the matched segment
  const out = [];
  const B = rule.B;
  for (let j = 0; j < B.length; j++) {
    const t = B[j];
    const src = matched[Math.min(j, matched.length - 1)];
    if (t.startsWith('{')) {
      const outs = t.slice(1, -1).trim().split(/\s+/);
      const ins = rule.A[j]?.set || rule.A[0]?.set || [];
      const k = ins.indexOf(src?.s);
      const kk = k >= 0 ? k : ins.findIndex(x => CLASS[x]?.(src));
      const v = outs[kk >= 0 ? kk : 0];
      if (v === '∅') continue;
      out.push({ s: v === '=' ? src.s : v, st: src?.st && isVow(v === '=' ? src.s : v), o: src?.o ?? 0 });
    } else if (t === '=') out.push({ ...src });
    else if (t.endsWith('ː') && t.length === 2 && t[0] === '+') out.push({ ...src, s: baseOf(src.s) + 'ː' + (src.s.match(/[1-6]$/)?.[0] || '') });
    else if (t === '-ː') out.push({ ...src, s: src.s.replace('ː', '') });
    else out.push({ s: t, st: !!(src?.st && isVow(t)), o: src?.o ?? 0 });
  }
  // keep stress on the vowel if the stressed vowel was replaced by a glide+vowel sequence
  if (matched.some(x => x.st) && !out.some(x => x.st)) { const v = out.find(x => isVow(x.s)); if (v) v.st = true; }
  // tone carried over from the matched vowel when the output vowel has none
  const tone = matched.map(x => x.s.match(/[1-6]$/)?.[0]).find(Boolean);
  if (tone) for (const x of out) if (isVow(x.s) && !/[1-6]$/.test(x.s)) x.s += tone;
  return out;
}

export function applyRule(rule, w) {
  if (rule.kind === 'fn') return rule.fn(w);
  const out = [];
  let i = 0;
  const A = rule.A;
  const insertion = A.length === 0;
  while (i <= w.length) {
    // insertion rules apply at positions between segments
    if (insertion) {
      if (matchSeq(rule.L, w, i, -1) >= 0 && matchSeq(rule.R, w, i, 1) >= 0) out.push(...rule.B.map(b => ({ s: b, st: false, o: w[i]?.o ?? w[i - 1]?.o ?? 0 })));
      if (i < w.length) out.push(w[i]);
      i++;
      continue;
    }
    if (i === w.length) break;
    const end = matchSeq(A, w, i, 1);
    if (end >= 0 && matchSeq(rule.L, w, i, -1) >= 0 && matchSeq(rule.R, w, end, 1) >= 0 && (!rule.when || rule.when(w, i, end))) {
      out.push(...produce(rule, w.slice(i, end)));
      i = end;
    } else { out.push(w[i]); i++; }
  }
  return out;
}

// proto form "a k w a" + stressed syllable index -> segment objects
export function toObjects(form, stressSyl = null) {
  const segs = (Array.isArray(form) ? form : form.trim().split(/\s+/)).map(s => s.normalize('NFC'));
  const vi = segs.map((s, i) => (isVow(s) ? i : -1)).filter(i => i >= 0);
  let stressIdx = stressSyl != null && vi[stressSyl] !== undefined ? vi[stressSyl] : (vi.length >= 2 ? vi[vi.length - 2] : vi[0]);
  return segs.map((s, i) => ({ s, st: i === stressIdx, o: i }));
}

// evolve: returns { segs, stress (vowel index), history: [{id, form}] }
export function evolve(cascade, form, { stress = null, record = false, exempt = null } = {}) {
  let w = toObjects(form, stress);
  const hist = [];
  for (const r of cascade) {
    if (exempt && exempt.has(r.id)) continue;
    const nw = applyRule(r, w);
    if (nw.length === 0 || !nw.some(x => isVow(x.s))) continue; // never erase a word or its last vowel
    if (record && nw.map(x => x.s).join(' ') !== w.map(x => x.s).join(' ')) hist.push({ id: r.id, form: nw.map(x => x.s) });
    w = nw;
  }
  return { segs: w.map(x => x.s), objs: w, history: hist };
}

// evolve a suffix: attach to a dummy stressed stem, then keep only the segments that came from the suffix
export function evolveSuffix(cascade, affix, stem = ['p', 'a', 't']) {
  if (!affix || !affix.trim()) return [];
  const aff = affix.trim().split(/\s+/);
  const w0 = toObjects([...stem, ...aff], 0);
  let w = w0;
  for (const r of cascade) { const nw = applyRule(r, w); if (nw.some(x => isVow(x.s))) w = nw; }
  return w.filter(x => x.o >= stem.length).map(x => x.s);
}
// evolve a free grammatical word (article, pronoun, preposition): unstressed if 'clitic'
export function evolveWord(cascade, form, { clitic = false } = {}) {
  if (!form || !form.trim()) return [];
  const o = toObjects(form, clitic ? -1 : null);
  if (clitic) for (const x of o) x.st = false;
  let w = o;
  for (const r of cascade) { const nw = applyRule(r, w); if (nw.some(x => isVow(x.s))) w = nw; }
  return w.map(x => x.s);
}
