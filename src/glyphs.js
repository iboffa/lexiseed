// Original scripts: geometric, letter-like writing systems built from a design system, not from random strokes.
// [ASSUMPTION] The eight design systems imitate the *construction principles* of real scripts (they never copy a glyph):
//   blocks    - featural letters (one base shape per place of articulation, added strokes for manner, as Hangul)
//               grouped into square syllable blocks; round vowels horizontal, unround vertical
//   capitals  - stems, bars, bowls and diagonals on a cap height (Latin/Greek/Cyrillic capitals)
//   rounded   - round bodies on an x-height with ascenders, descenders and curls (Georgian, Armenian)
//   runic     - carved: stems and diagonal branches only, no curves and no horizontal strokes (runes)
//   brush     - kana-like syllabary: 2-3 brush strokes from the basic stroke types (dot, horizontal, vertical,
//               left- and right-falling, turn, hook) in a square; voiced syllables add two ticks (dakuten)
//   geometric - Cree-like: one shape per consonant, turned to show the vowel; dots for length
//   brahmic   - a head line, bodies hanging from it, vowel signs attached around the consonant, a virama
//   cursive   - Arabic-like: letters joined on a baseline; consonants of one place share a skeleton and
//               are told apart by dots
// Every glyph is a list of strokes in an em box: x in [0, w], y = 0 at the top line and 1 at the baseline.
import { SEGMENTS } from './data/phonemes.js';
import { isV, vBase, isLong, toneOf, syllabify } from './phonology.js';
import { stream } from './rng.js';

// ---------------------------------------------------------------- geometry helpers
const P = (x, y) => [x, y];
const L = (...pts) => ({ p: pts });
const closed = (st) => ({ ...st, closed: true });
const DOT = (x, y, r = 1) => ({ dot: [x, y], r });
function arcPts(cx, cy, rx, ry, a0, a1) {
  const n = Math.max(4, Math.ceil(Math.abs(a1 - a0) / 15));
  const out = [];
  for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
  return out;
}
const ARC = (cx, cy, rx, ry, a0, a1) => ({ p: arcPts(cx, cy, rx, ry, a0, a1) });
const RING = (cx, cy, rx, ry) => closed({ p: arcPts(cx, cy, rx, ry, 0, 360).slice(0, -1) });
function quad(a, c, b, n = 10) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n; o.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]); } return o; }
const Q = (a, c, b) => ({ p: quad(a, c, b) });
const chain = (...parts) => ({ p: parts.flatMap((pp, i) => (i ? pp.p.slice(1) : pp.p)) }); // one continuous stroke
function mapStroke(st, f) { return st.dot ? { ...st, dot: f(st.dot) } : { ...st, p: st.p.map(f) }; }
const mapG = (strokes, f) => strokes.map(s => mapStroke(s, f));
const fit = (strokes, x0, y0, x1, y1) => mapG(strokes, ([x, y]) => [x0 + x * (x1 - x0), y0 + y * (y1 - y0)]); // unit square -> box
function rotateUnit(strokes, quarter) { // rotate inside the unit square by quarter turns (clockwise)
  const f = [([x, y]) => [x, y], ([x, y]) => [1 - y, x], ([x, y]) => [1 - x, 1 - y], ([x, y]) => [y, 1 - x]][quarter & 3];
  return mapG(strokes, f);
}
const mirrorX = (strokes, w = 1) => mapG(strokes, ([x, y]) => [w - x, y]);
const mirrorY = (strokes) => mapG(strokes, ([x, y]) => [x, 1 - y]);

function bbox(strokes) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const s of strokes) for (const [x, y] of (s.dot ? [s.dot] : s.p)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x0, y0, x1, y1 };
}

// ---------------------------------------------------------------- raster distinctness (blurred IoU on a small bitmap)
const RW = 16, RH = 24;
function raster(strokes, frame = { x0: -0.15, y0: -0.75, x1: 1.15, y1: 1.75 }) {
  const grid = new Uint8Array(RW * RH);
  const put = (x, y) => {
    const gx = Math.floor((x - frame.x0) / (frame.x1 - frame.x0) * RW), gy = Math.floor((y - frame.y0) / (frame.y1 - frame.y0) * RH);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const X = gx + dx, Y = gy + dy; if (X >= 0 && X < RW && Y >= 0 && Y < RH) grid[Y * RW + X] = 1; }
  };
  for (const s of strokes) {
    if (s.dot) { put(...s.dot); continue; }
    const pts = s.closed ? [...s.p, s.p[0]] : s.p;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 0.03));
      for (let k = 0; k <= n; k++) put(ax + (bx - ax) * k / n, ay + (by - ay) * k / n);
    }
  }
  return grid;
}
function iou(a, b) { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { if (a[k] && b[k]) i++; if (a[k] || b[k]) u++; } return u ? i / u : 1; }
const normFrame = (g) => ({ x0: -0.15 * (g.w || 1), y0: -0.75, x1: 1.15 * (g.w || 1), y1: 1.75 });
export function glyphSimilarity(a, b) { return iou(raster(a.s, normFrame(a)), raster(b.s, normFrame(b))); }

// pick the candidate glyph most unlike the ones already made; accept early when clearly distinct
function distinctGlyph(make, existing, rng, { tries = 40, accept = 0.55 } = {}) {
  let best = null, bestSim = Infinity;
  for (let t = 0; t < tries; t++) {
    const g = make(rng, t);
    if (!g) continue;
    const r = raster(g.s, normFrame(g));
    let sim = 0;
    for (const e of existing) { const s = iou(r, e.r); if (s > sim) sim = s; if (sim >= bestSim) break; }
    if (sim < bestSim) { best = { ...g, r }; bestSim = sim; }
    if (sim <= accept) break;
  }
  best.sim = bestSim;
  return best;
}

// ---------------------------------------------------------------- phonetic features
const PG = { labial: 'lab', dental: 'cor', alveolar: 'cor', postalveolar: 'pal', palatal: 'pal', retroflex: 'ret', velar: 'vel', uvular: 'vel', pharyngeal: 'gut', glottal: 'gut' };
const MG = { stop: 'stop', affricate: 'aff', fricative: 'fric', nasal: 'nas', lateral: 'liq', rhotic: 'liq', glide: 'gl' };
function feat(c) {
  const f = SEGMENTS[c] || SEGMENTS[c.replace(/[ʰʱʲˤʼ]/g, '')] || { place: 'alveolar', manner: 'stop', voice: false };
  const flags = [];
  if (f.asp) flags.push('asp'); if (f.emph) flags.push('emph'); if (f.pal) flags.push('pal'); if (f.pren) flags.push('pren'); if (f.ej) flags.push('ej');
  if (f.place === 'uvular') flags.push('uv'); if (f.place === 'dental') flags.push('den'); if (f.place === 'palatal' && f.manner !== 'glide') flags.push('pl2');
  if (f.place === 'pharyngeal') flags.push('ph');
  if (c === 'ɾ' || c === 'ɻ') flags.push('tap'); if (c === 'ɫ' || c === 'ɬ' || c === 'tɬ') flags.push('dark');
  if (f.place === 'retroflex' && f.manner !== 'rhotic') flags.push('ret');
  return { place: PG[f.place] || 'cor', manner: MG[f.manner] || 'stop', voice: !!f.voice, lateral: f.manner === 'lateral', flags, raw: f };
}
const VOICE_PAIRS = { b: 'p', d: 't', g: 'k', z: 's', v: 'f', ʒ: 'ʃ', dʒ: 'tʃ', dz: 'ts', ð: 'θ', ɣ: 'x', ɖ: 'ʈ', ɟ: 'c', β: 'ɸ', ʁ: 'χ', dʑ: 'tɕ', ʑ: 'ɕ', dʲ: 'tʲ', dˤ: 'tˤ', ʕ: 'ħ' };
const plain = (s) => s.replace(/[1-6]$/, '');

// ---------------------------------------------------------------- system: BLOCKS (featural, Hangul-like)
const BLOCK_SHAPES = {
  square: () => [closed(L(P(0, 0), P(1, 0), P(1, 1), P(0, 1)))],
  angleL: () => [L(P(0, 0), P(0, 1), P(1, 1))],
  angle7: () => [L(P(0, 0), P(1, 0), P(1, 1))],
  bracket: () => [L(P(1, 0), P(0, 0), P(0, 1), P(1, 1))],
  lambda: () => [L(P(0, 1), P(0.5, 0), P(1, 1))],
  circle: () => [RING(0.5, 0.5, 0.5, 0.5)],
  cap: () => [L(P(0, 1), P(0, 0), P(1, 0), P(1, 1))],
  cup: () => [L(P(0, 0), P(0, 1), P(1, 1), P(1, 0))],
  zig: () => [L(P(0, 0), P(1, 0), P(1, 0.5), P(0, 0.5), P(0, 1), P(1, 1))],
  triangle: () => [closed(L(P(0.5, 0), P(1, 1), P(0, 1)))],
  vee: () => [L(P(0, 0), P(0.5, 1), P(1, 0))],
  half: () => [ARC(0.5, 1, 0.5, 1, 180, 360), L(P(0, 1), P(1, 1))],
};
const BLOCK_ROUND = { square: () => [RING(0.5, 0.5, 0.5, 0.5)], angleL: () => [chain(L(P(0, 0), P(0, 0.55)), ARC(0.45, 0.55, 0.45, 0.45, 180, 90), L(P(0.45, 1), P(1, 1)))] };

function blockConsonant(spec, rounded) {
  // spec: { base, mods: [] } -> strokes in unit square
  const top = spec.mods.includes('bar') || spec.mods.includes('tick');
  const both = spec.mods.includes('bar') && spec.mods.includes('tick');
  const y0 = both ? 0.36 : top ? 0.24 : 0;
  const right = spec.mods.includes('dot') ? 0.8 : 1;
  const bottom = spec.mods.includes('under') ? 0.8 : 1;
  const left = spec.mods.includes('hook') ? 0.18 : 0;
  const make = (rounded && BLOCK_ROUND[spec.base]) || BLOCK_SHAPES[spec.base];
  let base = make();
  const out = [];
  if (spec.mods.includes('double')) { out.push(...fit(base, left, y0, left + (right - left) * 0.46, bottom), ...fit(base, left + (right - left) * 0.54, y0, right, bottom)); }
  else out.push(...fit(base, left, y0, right, bottom));
  const cx = (left + right) / 2;
  if (spec.mods.includes('bar')) out.push(L(P(left + 0.12, y0 - 0.12), P(right - 0.12, y0 - 0.12)));
  if (spec.mods.includes('tick')) out.push(L(P(cx, both ? 0 : 0.02), P(cx, both ? 0.12 : y0 - 0.06)));
  if (spec.mods.includes('inner')) {
    const my = y0 + (bottom - y0) * 0.55;
    out.push(['lambda', 'triangle', 'vee'].includes(spec.base) ? L(P(cx, y0 + (bottom - y0) * 0.25), P(cx, bottom - (spec.base === 'vee' ? 0.25 : 0))) : L(P(left + 0.18, my), P(right - 0.18, my)));
  }
  if (spec.mods.includes('dot')) out.push(DOT(0.94, y0 + (bottom - y0) * 0.5, 1.15));
  if (spec.mods.includes('under')) out.push(L(P(left + 0.15, 0.95), P(right - 0.15, 0.95)));
  if (spec.mods.includes('hook')) out.push(Q(P(0.12, y0), P(0, y0 + 0.1), P(0.1, y0 + 0.3)));
  if (spec.mods.includes('notch')) out.push(L(P(right - 0.05, y0 - 0.02), P(right + 0.05, y0 - 0.14)));
  if (spec.mods.includes('dot2')) out.push(DOT(cx, y0 + (bottom - y0) * 0.5, 1.15));
  return out;
}

// vowel jamo: { o: 'V'|'H', ticks: [side, count], iStroke: bool, dot: bool }
function blockVowelParts(spec) {
  // returns { h: strokes in unit box (horizontal part, wide), v: strokes in unit box (vertical part, tall) }
  const res = { h: null, v: null };
  const ticks = (n, side, horiz) => {
    const out = []; const pos = n === 1 ? [0.5] : n === 2 ? [0.38, 0.62] : [0.3, 0.5, 0.7];
    for (const t of pos) out.push(horiz ? L(P(t, 0.55), P(t, side === 'up' ? 0.25 : 0.85)) : L(P(0.5, t), P(side === 'right' ? 0.85 : 0.15, t)));
    return out;
  };
  if (spec.o === 'H') res.h = [L(P(0.04, 0.55), P(0.96, 0.55)), ...ticks(spec.n, spec.side, true)];
  else res.v = [L(P(0.5, 0.03), P(0.5, 0.97)), ...ticks(spec.n, spec.side, false)];
  if (spec.n === 0) { if (res.h) res.h = [res.h[0]]; if (res.v) res.v = [res.v[0]]; }
  if (spec.iStroke) { const iv = [L(P(0.5, 0.03), P(0.5, 0.97))]; if (res.v) res.v = [...res.v, L(P(0.85, 0.03), P(0.85, 0.97))]; else res.v = iv; }
  if (spec.dot) (res.v || res.h).push(DOT(res.v ? 0.15 : 0.5, res.v ? 0.2 : 0.25, 1.1));
  return res;
}

const BLOCKS = {
  id: 'blocks', name: 'featural syllable blocks', types: ['alphabet'], extent: [0, 1], ltrOnly: true,
  build(ph, rng, style) {
    const mannerMod = rng.pick([
      { stop: ['bar'], fric: ['inner'], aff: ['bar', 'inner'], voice: 'tick' },
      { stop: ['inner'], fric: ['bar'], aff: ['bar', 'inner'], voice: 'double' },
      { stop: ['bar'], fric: ['tick'], aff: ['bar', 'tick'], voice: 'double' },
    ]);
    const flagMods = rng.shuffle(['dot', 'under', 'hook', 'notch', 'dot2']);
    const places = ['lab', 'cor', 'pal', 'ret', 'vel', 'gut', 'liq', 'gl', 'liq2'];
    const shapePool = rng.shuffle(['square', 'angleL', 'angle7', 'lambda', 'cap', 'cup', 'triangle', 'vee', 'half', 'bracket']);
    const base = {};
    base.liq = rng.chance(0.7) ? 'zig' : shapePool.pop();
    base.gl = rng.chance(0.5) ? 'circle' : shapePool.pop();
    for (const p of places) if (!base[p]) base[p] = shapePool.pop() || 'square';
    const nullOnset = base.gl === 'circle' ? null : 'circle';
    const sigs = new Set();
    const letters = {};
    for (const c of ph.consonants) {
      const f = feat(c);
      let place = f.manner === 'liq' ? (f.lateral ? 'liq' : 'liq2') : f.manner === 'gl' ? 'gl' : f.place;
      if (place === 'liq2' && !ph.consonants.some(x => feat(x).lateral)) place = 'liq';
      const mods = [];
      if (['stop', 'fric', 'aff'].includes(f.manner)) mods.push(...mannerMod[f.manner]);
      if (f.voice && ['stop', 'fric', 'aff'].includes(f.manner)) mods.push(mannerMod.voice);
      if (f.manner === 'gl' && f.raw.place === 'labial') mods.push('inner');
      let fi = 0;
      for (const fl of f.flags) { if (['den', 'pl2', 'uv', 'ph', 'asp', 'emph', 'pal', 'pren', 'ej', 'tap', 'dark', 'ret'].includes(fl) && flagMods[fi]) mods.push(flagMods[fi++ % flagMods.length]); }
      let spec = { base: base[place], mods: [...new Set(mods)] };
      let k = 0;
      while (sigs.has(spec.base + spec.mods.sort().join()) && k < 8) { const extra = flagMods[(fi + k) % flagMods.length]; if (!spec.mods.includes(extra)) spec.mods.push(extra); else spec = { ...spec, base: shapePool[k % Math.max(1, shapePool.length)] || 'triangle' }; k++; }
      sigs.add(spec.base + spec.mods.sort().join());
      letters[c] = { spec, s: blockConsonant(spec, style.rounded) };
    }
    if (nullOnset) letters['∅'] = { spec: { base: 'circle', mods: [] }, s: blockConsonant({ base: 'circle', mods: [] }) };
    // vowels: features -> orientation, tick side and count, plus an i-stroke for front vowels (as ㅐ = ㅏ + ㅣ)
    const flip = rng.chance(0.5);
    const vowels = {};
    const used = new Set();
    const vspec = (v) => {
      const f = SEGMENTS[v];
      const round = f.round;
      let o = round ? 'H' : 'V';
      if (v === 'ɯ' || v === 'ɨ') o = 'H';
      const hn = { high: 0, mid: 1, lowmid: 2, low: 1 }[f.height];
      let side;
      if (o === 'V') side = (f.height === 'low' || f.height === 'lowmid') !== flip ? 'right' : 'left';
      else side = (f.height === 'high') !== flip ? 'down' : 'up';
      let n = f.height === 'high' ? (o === 'H' && round ? 1 : 0) : hn;
      const front = f.back === 'front' && v !== 'i' && v !== 'e' || (v === 'e' && ph.vowels.includes('ə'));
      let sp = { o, side, n, iStroke: front && v !== 'i' };
      if (sp.iStroke) { // front vowel = its back partner + i-stroke
        const partner = { e: 'ə', ɛ: 'a', æ: 'a', ø: 'o', y: 'u' }[v] || 'a';
        const ps = vspecBack(partner);
        sp = { ...ps, iStroke: true };
      }
      return sp;
    };
    const vspecBack = (v) => { const f = SEGMENTS[v]; const round = f.round; const o = round ? 'H' : 'V'; const n = f.height === 'high' ? 1 : f.height === 'lowmid' ? 2 : 1; const side = o === 'V' ? ((f.height === 'low' || f.height === 'lowmid') !== flip ? 'right' : 'left') : ((f.height === 'high') !== flip ? 'down' : 'up'); return { o, side, n }; };
    for (const v of ph.vowels) {
      let sp = vspec(v);
      let key = JSON.stringify(sp);
      let k = 0;
      while (used.has(key) && k < 6) { sp = k < 2 ? { ...sp, n: sp.n + 1 } : { ...sp, dot: true, n: sp.n }; if (k === 3) sp = { ...sp, side: sp.o === 'V' ? (sp.side === 'left' ? 'right' : 'left') : (sp.side === 'up' ? 'down' : 'up') }; key = JSON.stringify(sp); k++; }
      used.add(key);
      vowels[v] = { spec: sp, parts: blockVowelParts(sp) };
    }
    return { letters, vowels, nullOnset: !!nullOnset, mannerMod, base };
  },
  layout(sc, ph, segs) {
    const syls = syllabify(ph, segs.map(plain));
    const cells = [];
    for (const [a, b] of syls) {
      const part = segs.slice(a, b);
      const vi = part.findIndex(isV);
      let vEnd = vi; while (vEnd + 1 < part.length && isV(part[vEnd + 1])) vEnd++;
      const onset = vi < 0 ? part : part.slice(0, vi);
      const nucleus = vi < 0 ? [] : part.slice(vi, vEnd + 1);
      const coda = vi < 0 ? [] : part.slice(vEnd + 1);
      cells.push(blockCell(sc, onset, nucleus, coda));
    }
    return cells;
  },
};

function blockCell(sc, onset, nucleus, coda) {
  const d = sc.data;
  const parts = [];
  const cons = (c) => d.letters[plain(c)]?.s || d.letters['∅']?.s || [];
  const on = onset.length ? onset.map(cons) : d.nullOnset ? [d.letters['∅'].s] : [];
  const vs = nucleus.map(v => d.vowels[vBase(v)]?.parts).filter(Boolean);
  let H = null, Vt = [];
  for (const v of vs) { if (v.h && !H) H = v.h; if (v.v) Vt.push(v.v); if (v.h && H && H !== v.h) Vt.push(v.h); }
  const topH = coda.length ? 0.6 : 1;
  const place = (strokes, x0, y0, x1, y1) => parts.push(...fit(strokes, x0, y0, x1, y1));
  const row = (list, x0, y0, x1, y1, pad = 0.06) => { const n = list.length; const w = (x1 - x0) / n; list.forEach((s, i) => place(s, x0 + i * w + pad, y0 + pad, x0 + (i + 1) * w - pad, y1 - pad)); };
  const vw = Vt.length ? 0.22 * Vt.length : 0;
  if (H) {
    row(on.length ? on : [], 0.05, 0, 1 - vw - 0.02, topH * 0.55);
    place(H, 0.02, topH * 0.5, 1 - vw - 0.02, topH * 0.98);
  } else row(on, 0, 0, 1 - vw, topH);
  Vt.forEach((v, i) => place(v, 1 - vw + i * 0.22, 0.02, 1 - vw + (i + 1) * 0.22, topH - 0.02));
  if (coda.length) row(coda.map(cons), 0.08, 0.62, 0.92, 1);
  const extra = [];
  const v0 = nucleus[0];
  if (v0 && isLong(v0)) extra.push(DOT(1.08, 0.5, 1.1));
  const tone = v0 ? toneOf(v0) : 0;
  if (tone > 1) for (let i = 0; i < Math.min(3, tone - 1); i++) extra.push(DOT(-0.1, 0.25 + i * 0.22, 1));
  return { s: [...parts, ...extra], w: 1, gap: 0.12 };
}

// ---------------------------------------------------------------- system: CAPITALS (Latin/Greek-capital-like)
const CAP_SKELETONS = {
  stem: (w) => ({ s: [L(P(0, 0), P(0, 1))], stem: 0, w }),
  stem2: (w) => ({ s: [L(P(0, 0), P(0, 1)), L(P(w, 0), P(w, 1))], stem: 0, stem2: w, w }),
  ring: (w) => ({ s: [RING(w / 2, 0.5, w / 2, 0.5)], round: true, w }),
  arcC: (w) => ({ s: [ARC(w / 2 + 0.05, 0.5, w / 2, 0.5, 45, 315)], round: true, open: 'right', w }),
  lam: (w) => ({ s: [L(P(0, 1), P(w / 2, 0), P(w, 1))], apex: 'top', w }),
  vee: (w) => ({ s: [L(P(0, 0), P(w / 2, 1), P(w, 0))], apex: 'bottom', w }),
  cup: (w) => ({ s: [chain(L(P(0, 0), P(0, 0.55)), ARC(w / 2, 0.55, w / 2, 0.45, 180, 0), L(P(w, 0.55), P(w, 0)))], w }),
  arch: (w) => ({ s: [chain(L(P(0, 1), P(0, 0.45)), ARC(w / 2, 0.45, w / 2, 0.45, 180, 360), L(P(w, 0.45), P(w, 1)))], w }),
  tee: (w) => ({ s: [L(P(0, 0), P(w, 0)), L(P(w / 2, 0), P(w / 2, 1))], w, center: true }),
  zed: (w) => ({ s: [L(P(0, 0), P(w, 0), P(0, 1), P(w, 1))], w }),
};
function capAttachments(sk, w, rng) {
  const A = [];
  const st = sk.stem !== undefined;
  if (st) {
    A.push(['bowlU', [chain(L(P(0, 0), P(w * 0.45, 0)), ARC(w * 0.45, 0.25, w * 0.5, 0.25, 270, 450), L(P(w * 0.45, 0.5), P(0, 0.5)))]]);
    A.push(['bowlL', [chain(L(P(0, 0.5), P(w * 0.45, 0.5)), ARC(w * 0.45, 0.75, w * 0.5, 0.25, 270, 450), L(P(w * 0.45, 1), P(0, 1)))]]);
    A.push(['bowlF', [chain(L(P(0, 0), P(w * 0.35, 0)), ARC(w * 0.35, 0.5, w * 0.6, 0.5, 270, 450), L(P(w * 0.35, 1), P(0, 1)))]]);
    A.push(['armU', [L(P(0, 0.55), P(w, 0))]], ['armL', [L(P(w * 0.25, 0.42), P(w, 1))]], ['armK', [L(P(w, 0), P(0, 0.55), P(w, 1))]]);
    A.push(['barT', [L(P(0, 0), P(w, 0))]], ['barM', [L(P(0, 0.5), P(w * 0.8, 0.5))]], ['barB', [L(P(0, 1), P(w, 1))]]);
    A.push(['flag', [L(P(0, 0), P(w * 0.7, 0.25), P(0, 0.5))]]);
  }
  if (sk.stem2 !== undefined) A.push(['barM2', [L(P(0, 0.5), P(w, 0.5))]], ['barT2', [L(P(0, 0), P(w, 0))]], ['diag', [L(P(0, 0), P(w, 1))]], ['vmid', [L(P(0, 0), P(w / 2, 0.6), P(w, 0))]]);
  if (sk.round) A.push(['cross', [L(P(w * 0.18, 0.5), P(w * 0.82, 0.5))]], ['vbar', [L(P(w / 2, -0.12), P(w / 2, 1.12))]], ['tail', [L(P(w * 0.6, 0.75), P(w * 1.05, 1.1))]], ['dotIn', [DOT(w / 2, 0.5, 1.3)]], ['spur', [L(P(w, 0.55), P(w, 0.95))]]);
  if (sk.apex) A.push(['barM', [L(P(w * 0.25, sk.apex === 'top' ? 0.55 : 0.45), P(w * 0.75, sk.apex === 'top' ? 0.55 : 0.45))]], ['barX', [L(P(0, sk.apex === 'top' ? 1 : 0), P(w, sk.apex === 'top' ? 1 : 0))]], ['midStem', [L(P(w / 2, sk.apex === 'top' ? 0 : 1), P(w / 2, sk.apex === 'top' ? -0.0 : 1))]], ['inStem', [L(P(w / 2, sk.apex === 'top' ? 0 : 1), P(w / 2, sk.apex === 'top' ? 1 : 0))]]);
  if (sk.center) A.push(['barB', [L(P(w * 0.2, 1), P(w * 0.8, 1))]], ['hook', [ARC(w * 0.32, 1 - 0.18, w * 0.18, 0.18, 0, 180)]], ['cupT', [ARC(w / 2, 0, w / 2, 0.35, 0, 180)]]);
  if (!st && !sk.round && !sk.apex && !sk.center) A.push(['barM', [L(P(w * 0.15, 0.5), P(w * 0.85, 0.5))]], ['dotT', [DOT(w / 2, -0.25, 1.2)]], ['barT', [L(P(0, 0), P(w, 0))]], ['stemM', [L(P(w / 2, 0), P(w / 2, 1))]]);
  void rng;
  return A;
}
function capSign(r, style, isVow) {
  const names = Object.keys(CAP_SKELETONS);
  const w = r.pick([0.55, 0.65, 0.75]) * style.width;
  const name = r.weighted(names.map(n => [n, isVow ? ({ ring: 3, arcC: 2, lam: 2, vee: 2, cup: 2, arch: 1, stem: 0.6 }[n] ?? 0.4) : ({ stem: 5, stem2: 2, arch: 1, tee: 1, zed: 0.6, lam: 0.8, vee: 0.8, ring: 0.5, arcC: 0.8, cup: 0.6 }[n] ?? 0.5)]));
  const sk = CAP_SKELETONS[name](w);
  const atts = capAttachments(sk, w, r);
  const n = name === 'stem' ? r.int(1, 2) : r.weighted({ 0: 1, 1: 2.5, 2: 0.6 });
  const chosen = r.sample(atts, Math.min(n, atts.length));
  // bowls exclude each other and arms (keeps letters readable)
  const ids = chosen.map(c => c[0]);
  if (ids.filter(i => i.startsWith('bowl') || i.startsWith('arm') || i === 'flag').length > 1) return null;
  if (ids.includes('bowlF') && ids.some(i => i.startsWith('bar'))) return null;
  const s = [...sk.s, ...chosen.flatMap(c => c[1])];
  return { s, w: sk.w + (sk.s.length && ids.some(i => i.startsWith('bowl')) ? 0.08 : 0), name, ids };
}
const CAPITALS = {
  id: 'capitals', name: 'capital-letter alphabet', types: ['alphabet', 'abjad'], extent: [-0.45, 1.15],
  build(ph, rng, style) {
    const existing = [];
    const glyphs = {};
    const units = [...ph.consonants.map(c => 'C:' + c), ...ph.vowels.map(v => 'V:' + v)];
    // [ASSUMPTION] vowels favour round and open skeletons, consonants stems: a "family look" for each class
    for (const u of units) {
      const isVow = u.startsWith('V:');
      const g = distinctGlyph((r) => capSign(r, style, isVow), existing, rng, { tries: 60, accept: 0.5 });
      glyphs[u] = g; existing.push(g);
    }
    return { glyphs };
  },
  layout: alphaLayout,
};

// alphabets share one layout: one glyph per segment, doubled for long vowels (or a length mark), tone diacritics
function alphaLayout(sc, ph, segs) {
  const cells = [];
  const d = sc.data;
  for (let i = 0; i < segs.length; i++) {
    const s = plain(segs[i]);
    if (isV(s)) {
      const base = vBase(s);
      if (sc.type === 'abjad' && !(i === 0 || isLong(s) || i === segs.length - 1 || SEGMENTS[base].nasal)) {
        if (sc.style.pointed) { const prev = cells[cells.length - 1]; if (prev) prev.s = [...prev.s, ...pointMark(sc, base, prev.w)]; }
        continue;
      }
      const g = d.glyphs['V:' + base] || Object.entries(d.glyphs).find(([k]) => k.startsWith('V:'))?.[1] || anyGlyph(d);
      const small = sc.type === 'abjad' && !isLong(s);
      cells.push(cellOf(g, { small, tone: toneOf(segs[i]), sc }));
      if (isLong(s) && sc.type !== 'abjad') { if (sc.style.lengthMark) cells[cells.length - 1].s.push(L(P(0.1, -0.2), P(g.w - 0.1, -0.2))); else cells.push(cellOf(g, { sc })); }
    } else cells.push(cellOf(d.glyphs['C:' + s] || d.glyphs['C:' + s.replace(/[ʰʱʲˤʼ]/g, '')] || anyGlyph(d), { sc }));
  }
  return cells;
}
function anyGlyph(d) { return Object.values(d.glyphs)[0]; }
function cellOf(g, { small = false, tone = 0, sc } = {}) {
  let s = g.s;
  let w = g.w;
  if (small) { s = mapG(s, ([x, y]) => [x * 0.7, 0.3 + y * 0.7]); w *= 0.7; }
  s = [...s];
  if (tone > 1 && sc) s.push(...toneMark(tone, w));
  return { s, w, gap: sc?.style.gap ?? 0.25, joinable: g.joinable };
}
function toneMark(t, w) {
  const c = w / 2;
  return [
    [], [], [L(P(c - 0.12, -0.2), P(c + 0.12, -0.36))], [L(P(c - 0.15, -0.28), P(c + 0.15, -0.28))],
    [L(P(c - 0.14, -0.38), P(c, -0.2), P(c + 0.14, -0.38))], [L(P(c - 0.12, -0.36), P(c + 0.12, -0.2))], [DOT(c, -0.3, 1.2)],
  ][Math.min(t, 6)];
}
function pointMark(sc, v, w) {
  const f = SEGMENTS[v] || {};
  if (f.round) return [Q(P(w / 2 - 0.08, -0.22), P(w / 2 + 0.14, -0.42), P(w / 2 + 0.04, -0.12))];
  if (f.back === 'front') return [L(P(w / 2 - 0.12, 1.25), P(w / 2 + 0.12, 1.15))];
  return [L(P(w / 2 - 0.12, -0.15), P(w / 2 + 0.12, -0.27))];
}

// ---------------------------------------------------------------- system: ROUNDED (Georgian/Armenian-like)
function roundBodies(w) {
  const r = w / 2;
  return {
    o: { s: [RING(r, 0.5, r, 0.5)], anchors: { l: [0, 0.5], r: [w, 0.5], t: [r, 0], b: [r, 1] } },
    cR: { s: [ARC(r, 0.5, r, 0.5, 40, 320)], anchors: { l: [0, 0.5], t: [r, 0], b: [r, 1], r: [r + r * Math.cos(Math.PI * 40 / 180), 0.5 + 0.5 * Math.sin(Math.PI * 40 / 180)] } },
    cL: { s: [ARC(r, 0.5, r, 0.5, -140, 140)], anchors: { r: [w, 0.5], t: [r, 0], b: [r, 1], l: [r - r * 0.77, 0.5 - 0.32] } },
    n: { s: [chain(L(P(0, 1), P(0, 0.5)), ARC(r, 0.5, r, 0.5, 180, 360), L(P(w, 0.5), P(w, 1)))], anchors: { l: [0, 1], r: [w, 1], t: [r, 0], b: [0, 1] } },
    u: { s: [chain(L(P(0, 0), P(0, 0.5)), ARC(r, 0.5, r, 0.5, 180, 0), L(P(w, 0.5), P(w, 0)))], anchors: { l: [0, 0], r: [w, 0], t: [w, 0], b: [r, 1] } },
    m: { s: [chain(ARC(r / 2, 0.5, r / 2, 0.5, 180, 0), ARC(r * 1.5, 0.5, r / 2, 0.5, 180, 360))], anchors: { l: [0, 0.5], r: [w, 0.5], t: [r * 1.5, 0], b: [r / 2, 1] } },
    three: { s: [chain(ARC(r * 0.8, 0.26, r * 0.8, 0.26, 200, 450), ARC(r * 0.8, 0.74, r * 0.95, 0.26, 270, 520))], anchors: { l: [0.05, 0.85], r: [r * 1.75, 0.74], t: [r * 0.3, 0.12], b: [r * 0.8, 1] } },
    e: { s: [ARC(r, 0.5, r, 0.5, 30, 360), L(P(0, 0.5), P(w, 0.5))], anchors: { l: [0, 0.5], r: [w, 0.5], t: [r, 0], b: [r, 1] } },
    s: { s: [chain(ARC(r, 0.26, r * 0.85, 0.25, 340, 90), ARC(r, 0.75, r * 0.85, 0.25, 270, 520))], anchors: { l: [0.1, 0.8], r: [w - 0.05, 0.2], t: [r, 0.02], b: [r, 1] } },
    loop: { s: [chain(ARC(r, 0.62, r, 0.38, 180, 540), L(P(0, 0.62), P(0, 0.2)), ARC(r * 0.45, 0.2, r * 0.45, 0.2, 180, 360))], anchors: { l: [0, 0.62], r: [w, 0.62], t: [r * 0.9, 0], b: [r, 1] } },
  };
}
function roundExtenders(w, a, rng) {
  const [ax, ay] = a;
  const side = ax > w / 2 ? 1 : -1;
  return {
    asc: L(P(ax, ay), P(ax, -0.62)),
    ascHook: chain(L(P(ax, ay), P(ax, -0.4)), ARC(ax + side * 0.14, -0.4, 0.14, 0.18, side > 0 ? 180 : 0, side > 0 ? 360 : -180)),
    desc: L(P(ax, ay), P(ax, 1.62)),
    descCurl: chain(L(P(ax, ay), P(ax, 1.38)), ARC(ax - side * 0.15, 1.38, 0.15, 0.2, side > 0 ? 0 : 180, side > 0 ? 180 : 0)),
    topLoop: chain(L(P(ax, ay), P(ax, -0.15)), ARC(ax, -0.36, 0.16, 0.21, 90, 450)),
    tail: Q(P(ax, ay), P(ax + side * 0.3 * rng.range(0.6, 1), ay + 0.1), P(ax + side * 0.25, ay + 0.45)),
  };
}
const ROUNDED = {
  id: 'rounded', name: 'rounded alphabet', types: ['alphabet', 'abjad'], extent: [-0.7, 1.7], scale: 1.35,
  build(ph, rng, style) {
    const existing = [];
    const glyphs = {};
    const featural = rng.chance(0.45);
    const placeBody = {};
    const units = [...ph.consonants.map(c => 'C:' + c), ...ph.vowels.map(v => 'V:' + v)];
    const bodyNames = Object.keys(roundBodies(0.7));
    const vowelBodies = rng.sample(['o', 'cR', 'cL', 'e', 'u', 'n', 'm', 'loop'], 4);
    for (const u of units) {
      const isVow = u.startsWith('V:');
      const f = isVow ? null : feat(u.slice(2));
      if (featural && f && !placeBody[f.place + f.manner[0]]) placeBody[f.place + f.manner[0]] = rng.pick(bodyNames);
      const g = distinctGlyph((r, t) => {
        const w = (r.pick([0.6, 0.7, 0.8]) * style.width);
        const bodies = roundBodies(w);
        const bn = featural && f && t < 20 ? placeBody[f.place + f.manner[0]] : isVow ? r.pick(vowelBodies) : r.pick(bodyNames);
        const body = bodies[bn];
        const s = [...body.s];
        const ids = [bn];
        // [ASSUMPTION] vowels stay on the x-height (no extenders), consonants usually rise or descend: visible classes
        if (!isVow || r.chance(0.15)) {
          const anchorName = r.pick(Object.keys(body.anchors));
          const ext = roundExtenders(w, body.anchors[anchorName], r);
          const en = r.weighted({ asc: 2, desc: 2, ascHook: 1.2, descCurl: 1.4, topLoop: 0.8, tail: 1 });
          if ((en.startsWith('asc') || en === 'topLoop') && body.anchors[anchorName][1] > 0.6) return null;
          if (en.startsWith('desc') && body.anchors[anchorName][1] < 0.4) return null;
          s.push(ext[en]); ids.push(en + anchorName);
        }
        if (r.chance(0.18)) { s.push(DOT(w / 2, isVow ? -0.35 : 0.5, 1.2)); ids.push('dot'); }
        return { s, w, ids };
      }, existing, rng, { tries: 60, accept: 0.5 });
      glyphs[u] = g; existing.push(g);
    }
    return { glyphs, featural };
  },
  layout: alphaLayout,
};

// ---------------------------------------------------------------- system: RUNIC (carved: no curves, no horizontals)
function runeSign(r, style) {
  const w = 0.6 * style.width;
  const s = [];
  const ids = [];
  if (r.chance(0.82)) {
    const x = r.pick([0, w / 2, w]);
    s.push(L(P(x, 0), P(x, 1))); ids.push('stem' + x);
    const n = r.weighted({ 1: 3, 2: 2.5, 0: x === w / 2 ? 0 : 0.3 });
    const ys = [0, 0.25, 0.5];
    for (let i = 0; i < n; i++) {
      const y = r.pick(ys);
      const dir = x === 0 ? 1 : x === w ? -1 : r.pick([-1, 1]);
      const kind = r.weighted({ down: 3, up: 2, bump: 1.5, cross: x === w / 2 ? 1.5 : 0 });
      const len = w * (x === w / 2 ? 0.5 : 1);
      let st;
      if (kind === 'down') st = L(P(x, y), P(x + dir * len, y + 0.32));
      else if (kind === 'up') st = L(P(x, y + 0.32), P(x + dir * len, y));
      else if (kind === 'bump') st = L(P(x, y), P(x + dir * len * 0.8, y + 0.2), P(x, y + 0.4));
      else st = L(P(x - len, y), P(x + len, y + 0.32));
      const id = kind + y + dir;
      if (ids.includes(id)) continue;
      s.push(st); ids.push(id);
    }
  } else {
    const kind = r.pick(['lt', 'gt', 'x', 'diamond', 'hooks', 'ing']);
    ids.push(kind);
    if (kind === 'lt') s.push(L(P(w, 0.1), P(0, 0.5), P(w, 0.9)));
    if (kind === 'gt') s.push(L(P(0, 0.1), P(w, 0.5), P(0, 0.9)));
    if (kind === 'x') s.push(L(P(0, 0), P(w, 1)), L(P(w, 0), P(0, 1)));
    if (kind === 'diamond') s.push(closed(L(P(w / 2, 0.1), P(w, 0.5), P(w / 2, 0.9), P(0, 0.5))), L(P(w / 2, 0.9), P(w / 2, 1.05)));
    if (kind === 'hooks') s.push(L(P(w * 0.6, 0), P(0, 0.35), P(w * 0.6, 0.6)), L(P(w * 0.4, 0.4), P(w, 0.65), P(w * 0.4, 1)));
    if (kind === 'ing') s.push(L(P(0, 0), P(w, 0.5), P(0, 1)), L(P(w, 0), P(0, 0.5), P(w, 1)));
  }
  return { s, w, ids };
}
const RUNIC = {
  id: 'runic', name: 'carved runic alphabet', types: ['alphabet'], extent: [-0.3, 1.1],
  build(ph, rng, style) {
    const existing = [];
    const glyphs = {};
    const units = [...ph.consonants.map(c => 'C:' + c), ...ph.vowels.map(v => 'V:' + v)];
    for (const u of units) {
      const g = distinctGlyph((r) => runeSign(r, style), existing, rng, { tries: 60, accept: 0.5 });
      glyphs[u] = g; existing.push(g);
    }
    return { glyphs };
  },
  layout: alphaLayout,
};

// ---------------------------------------------------------------- system: BRUSH (kana-like syllabary)
// stroke types of the brush tradition; t = taper ('end' thins toward the end)
function brushStroke(kind, r, z) {
  // z: zone {x0,y0,x1,y1} in unit square
  const { x0, y0, x1, y1 } = z;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const curve = r.range(-0.08, 0.08);
  switch (kind) {
    case 'heng': return { ...Q(P(x0, cy + 0.02), P(cx, cy - 0.03 + curve), P(x1, cy - 0.04)), t: 'end', k: kind };
    case 'shu': { const hook = r.weighted({ none: 2, left: 1, right: 0.6 }); const st = L(P(cx, y0), P(cx + curve * 0.3, y1)); if (hook === 'left') st.p.push(P(cx - 0.12, y1 - 0.1)); if (hook === 'right') st.p.push(P(cx + 0.1, y1 - 0.12)); return { ...st, t: 'end', k: kind }; }
    case 'pie': return { ...Q(P(x1, y0), P(x1 - (x1 - x0) * 0.1, cy + 0.1), P(x0, y1)), t: 'end', k: kind };
    case 'na': return { ...Q(P(x0, y0), P(cx - 0.05, cy + 0.12), P(x1, y1)), t: 'start', k: kind };
    case 'dian': { const l = 0.13; return { ...L(P(cx - l / 2, cy - l / 2), P(cx + l / 2, cy + l / 2)), t: 'start', k: kind }; }
    case 'ti': return { ...L(P(x0, y1), P(x1, y0)), t: 'end', k: kind };
    case 'zhe': { const st = L(P(x0, y0), P(x1, y0), P(x1 - (x1 - x0) * r.range(0, 0.25), y1)); if (r.chance(0.35)) st.p.push(P(x1 - 0.12 - (x1 - x0) * 0.2, y1 - 0.12)); return { ...st, t: 'end', k: kind }; }
    case 'zhe2': return { ...L(P(x0, y0), P(x0, y1), P(x1, y1)), t: 'end', k: kind };
    case 'wan': { const big = Math.min(x1 - x0, y1 - y0) / 2; const a0 = r.pick([200, 260, 120]); return { ...ARC(cx, cy, big, (y1 - y0) / 2, a0, a0 + r.range(200, 290)), t: 'end', k: kind }; }
    case 'loop': return { ...chain(Q(P(x0 + 0.1, y0), P(cx, cy), P(cx - 0.05, y1)), ARC(cx + 0.12, y1 - 0.18, 0.17, 0.18, 120, 400)), t: 'end', k: kind };
    case 'swirl': return { ...chain(L(P(cx - 0.05, y0), P(cx, cy)), ARC(cx + 0.12, cy + 0.12, 0.2, 0.22, 200, 470)), t: 'end', k: kind };
    default: return null;
  }
}
const ZONES = {
  full: { x0: 0.12, y0: 0.1, x1: 0.88, y1: 0.9 }, top: { x0: 0.15, y0: 0.1, x1: 0.85, y1: 0.35 }, mid: { x0: 0.12, y0: 0.38, x1: 0.88, y1: 0.62 },
  bot: { x0: 0.12, y0: 0.65, x1: 0.88, y1: 0.9 }, left: { x0: 0.1, y0: 0.1, x1: 0.45, y1: 0.9 }, right: { x0: 0.55, y0: 0.1, x1: 0.9, y1: 0.9 },
  center: { x0: 0.35, y0: 0.15, x1: 0.65, y1: 0.85 }, tl: { x0: 0.1, y0: 0.1, x1: 0.48, y1: 0.48 }, tr: { x0: 0.52, y0: 0.1, x1: 0.9, y1: 0.48 },
  bl: { x0: 0.1, y0: 0.52, x1: 0.48, y1: 0.9 }, br: { x0: 0.52, y0: 0.52, x1: 0.9, y1: 0.9 }, lower: { x0: 0.12, y0: 0.35, x1: 0.88, y1: 0.9 }, upper: { x0: 0.12, y0: 0.1, x1: 0.88, y1: 0.62 },
};
// [ASSUMPTION] layout templates distilled from how kana are put together (stroke over stroke, two parallels, a cross,
// a frame with an inner stroke, a long stroke with side strokes, a curve with a dot); every glyph is one of these
const KANA_TEMPLATES = {
  angular: [
    [['top', 'heng'], ['lower', ['pie', 'shu', 'zhe', 'na']]],
    [['top', 'heng'], ['bot', 'heng']],
    [['upper', 'zhe'], ['center', ['pie', 'dian', 'shu']]],
    [['full', 'shu'], ['mid', 'heng']],
    [['full', 'pie'], ['mid', ['heng', 'dian', 'ti']]],
    [['left', 'pie'], ['right', 'na']],
    [['left', 'shu'], ['right', ['dian', 'na', 'pie']]],
    [['tl', 'dian'], ['tr', 'dian'], ['lower', ['pie', 'zhe', 'shu']]],
    [['full', 'zhe2'], ['tr', ['dian', 'pie']]],
    [['top', 'heng'], ['left', 'shu'], ['right', 'shu']],
    [['tl', 'dian'], ['mid', 'dian'], ['bot', 'ti']],
    [['upper', 'zhe'], ['lower', 'pie'], ['br', 'dian']],
  ],
  cursive: [
    [['full', 'wan'], ['tr', 'dian']],
    [['top', 'heng'], ['lower', ['wan', 'swirl', 'loop']]],
    [['full', 'loop']],
    [['left', 'shu'], ['right', 'wan']],
    [['top', 'heng'], ['bot', 'wan']],
    [['full', 'swirl'], ['top', 'heng']],
    [['tl', 'dian'], ['lower', 'wan']],
    [['full', 'shu'], ['mid', 'heng'], ['br', 'wan']],
    [['left', 'pie'], ['right', 'wan']],
    [['upper', 'wan'], ['bot', 'heng']],
  ],
};
function kanaGlyph(r, mode) {
  const tpl = r.pick(KANA_TEMPLATES[mode === 'cursive' ? (r.chance(0.7) ? 'cursive' : 'angular') : 'angular']);
  const s = [];
  for (const [zone, kinds] of tpl) {
    const kind = Array.isArray(kinds) ? r.pick(kinds) : kinds;
    const z = ZONES[zone];
    const j = 0.05;
    const zz = { x0: z.x0 + r.range(-j, j), y0: z.y0 + r.range(-j, j), x1: z.x1 + r.range(-j, j), y1: z.y1 + r.range(-j, j) };
    let st = brushStroke(kind, r, zz);
    if (!st) continue;
    if (mode === 'cursive' && st.k !== 'dian') st = { ...st, p: st.p }; // curves already in 'wan'
    if (r.chance(0.3)) st = mapStroke(st, ([x, y]) => [1 - x, y]); // mirror for variety
    s.push(st);
  }
  const b = bbox(s);
  if (b.x1 - b.x0 < 0.58 || b.y1 - b.y0 < 0.58) return null; // too small: unbalanced
  return { s, w: 1 };
}
const dakuten = (w = 1) => [L(P(w - 0.05, -0.02), P(w + 0.02, 0.12)), L(P(w + 0.1, -0.06), P(w + 0.17, 0.08))];

const BRUSH = {
  id: 'brush', name: 'brush-stroke syllabary', types: ['syllabary'], extent: [0, 1],
  build(ph, rng, style) {
    const mode = rng.chance(0.5) ? 'cursive' : 'angular';
    const glyphs = {};
    const existing = [];
    const useDakuten = rng.chance(0.75);
    const add = (key, made) => { glyphs[key] = made; existing.push(made); };
    for (const v of ph.vowels) add('V:' + v, distinctGlyph((r) => kanaGlyph(r, mode), existing, rng, { tries: 50, accept: 0.45 }));
    for (const c of ph.consonants) {
      const vl = VOICE_PAIRS[c];
      for (const v of ph.vowels) {
        if (useDakuten && vl && ph.consonants.includes(vl) && glyphs['CV:' + vl + '|' + v]) {
          const base = glyphs['CV:' + vl + '|' + v];
          glyphs['CV:' + c + '|' + v] = { ...base, s: [...base.s, ...dakuten()], derived: vl };
          continue;
        }
        add('CV:' + c + '|' + v, distinctGlyph((r) => kanaGlyph(r, mode), existing, rng, { tries: 40, accept: 0.45 }));
      }
    }
    // voiced first-pass gaps (voiced consonant listed before its voiceless partner)
    for (const c of ph.consonants) for (const v of ph.vowels) if (!glyphs['CV:' + c + '|' + v]) add('CV:' + c + '|' + v, distinctGlyph((r) => kanaGlyph(r, mode), existing, rng, { tries: 40, accept: 0.45 }));
    // consonants without a vowel: the syllable with the quietest vowel, written small with a final hook
    const quiet = ['ɯ', 'u', 'ə', 'ɨ', 'i'].find(v => ph.vowels.includes(v)) || ph.vowels[0];
    for (const c of ph.consonants) glyphs['C:' + c] = { ...glyphs['CV:' + c + '|' + quiet], s: [...glyphs['CV:' + c + '|' + quiet].s, L(P(0.75, 0.95), P(0.95, 1.08))], small: true };
    return { glyphs, mode, useDakuten, quiet, lengthMark: rng.pick(['bar', 'dot']) };
  },
  layout: syllabaryLayout,
};

function syllabaryLayout(sc, ph, segs) {
  const d = sc.data;
  const cells = [];
  const ps = segs.map(plain);
  for (let i = 0; i < ps.length; i++) {
    const s = ps[i], n = ps[i + 1];
    let g, cell;
    if (!isV(s) && n && isV(n) && (g = d.glyphs['CV:' + s + '|' + vBase(n)])) { cell = cellOf(g, { sc, tone: toneOf(segs[i + 1]) }); i++; if (isLong(n)) cell.s.push(...lengthMarkOf(sc, cell.w)); }
    else if (isV(s)) { cell = cellOf(d.glyphs['V:' + vBase(s)] || anyGlyph(d), { sc, tone: toneOf(segs[i]) }); if (isLong(s)) cell.s.push(...lengthMarkOf(sc, cell.w)); }
    else { g = d.glyphs['C:' + s]; cell = g ? cellOf(g, { small: true, sc }) : cellOf(anyGlyph(d), { small: true, sc }); }
    cells.push(cell);
  }
  return cells;
}
function lengthMarkOf(sc, w) {
  if (sc.system === 'geometric') return [DOT(w / 2, -0.22, 1.2)];
  return sc.data.lengthMark === 'dot' ? [DOT(w + 0.05, 0.5, 1.1)] : [L(P(w + 0.02, 0.5), P(w + 0.22, 0.5))];
}

// ---------------------------------------------------------------- system: GEOMETRIC (Cree-like: shape per consonant, turned per vowel)
const GEO_SHAPES = {
  tri: () => [closed(L(P(0.1, 0.1), P(0.9, 0.5), P(0.1, 0.9)))],
  angle: () => [L(P(0.1, 0.1), P(0.9, 0.5), P(0.1, 0.9))],
  cupR: () => [chain(L(P(0.2, 0.1), P(0.55, 0.1)), ARC(0.55, 0.5, 0.35, 0.4, 270, 450), L(P(0.55, 0.9), P(0.2, 0.9)))],
  hookJ: () => [chain(L(P(0.15, 0.1), P(0.6, 0.1)), L(P(0.6, 0.1), P(0.6, 0.6)), ARC(0.4, 0.6, 0.2, 0.3, 0, 180))],
  pee: () => [L(P(0.2, 0.1), P(0.2, 0.9)), chain(L(P(0.2, 0.1), P(0.55, 0.1)), ARC(0.55, 0.3, 0.3, 0.2, 270, 450), L(P(0.55, 0.5), P(0.2, 0.5)))],
  dee: () => [L(P(0.2, 0.1), P(0.2, 0.9)), ARC(0.2, 0.5, 0.65, 0.4, 270, 450)],
  ell: () => [L(P(0.2, 0.1), P(0.2, 0.9), P(0.85, 0.9))],
  gam: () => [L(P(0.85, 0.1), P(0.2, 0.1), P(0.2, 0.9)), L(P(0.2, 0.5), P(0.6, 0.5))],
  tee: () => [L(P(0.1, 0.15), P(0.9, 0.15)), L(P(0.5, 0.15), P(0.5, 0.9))],
  wave: () => [chain(ARC(0.3, 0.5, 0.2, 0.25, 180, 360), ARC(0.7, 0.5, 0.2, 0.25, 180, 0))],
  semi: () => [ARC(0.15, 0.5, 0.65, 0.4, 270, 450), L(P(0.15, 0.1), P(0.15, 0.9))],
  bolt: () => [L(P(0.2, 0.1), P(0.8, 0.1), P(0.2, 0.9), P(0.8, 0.9))],
  sigma: () => [L(P(0.85, 0.1), P(0.15, 0.1), P(0.6, 0.5), P(0.15, 0.9), P(0.85, 0.9))],
  key: () => [RING(0.3, 0.5, 0.2, 0.2), L(P(0.5, 0.5), P(0.9, 0.5)), L(P(0.75, 0.5), P(0.75, 0.72))],
};
const GEOMETRIC = {
  id: 'geometric', name: 'geometric turned-shape syllabary', types: ['syllabary', 'abugida'], extent: [-0.3, 1.1],
  build(ph, rng, style) {
    const shapes = rng.shuffle(Object.keys(GEO_SHAPES));
    const nullShape = shapes.indexOf('tri') >= 0 ? 'tri' : shapes[0];
    const pool = shapes.filter(s => s !== nullShape);
    const turns = rng.shuffle([0, 1, 2, 3]);
    // [ASSUMPTION] Cree-like: four orientations for the first four vowels, a dot beside the sign for the next four
    const orient = {};
    ph.vowels.forEach((v, i) => { orient[v] = { turn: turns[i % 4], dot: i >= 4 ? (i >= 8 ? 2 : 1) : 0 }; });
    const consShape = {};
    const glyphs = {};
    const MODS = ['', '+bar', '+dot', '+tick', '+ring'];
    ph.consonants.forEach((c, i) => { consShape[c] = pool[i % pool.length] + MODS[Math.floor(i / pool.length) % MODS.length]; });
    const draw = (shape, o) => {
      const [nm, extra] = shape.split('+');
      let s = GEO_SHAPES[nm]();
      if (extra === 'bar') s = [...s, L(P(0.05, 0.98), P(0.95, 0.98))];
      if (extra === 'dot') s = [...s, DOT(0.5, 0.5, 1.3)];
      if (extra === 'tick') s = [...s, L(P(0.5, 0), P(0.5, -0.18))];
      if (extra === 'ring') s = [...s, RING(0.5, 0.5, 0.1, 0.1)];
      s = rotateUnit(s, o.turn);
      if (o.dot === 1) s.push(DOT(1.05, 0.15, 1.2));
      if (o.dot === 2) s.push(DOT(1.05, 0.15, 1.2), DOT(1.05, 0.45, 1.2));
      return { s, w: 1 };
    };
    for (const v of ph.vowels) glyphs['V:' + v] = draw(nullShape, orient[v]);
    for (const c of ph.consonants) for (const v of ph.vowels) glyphs['CV:' + c + '|' + v] = draw(consShape[c], orient[v]);
    // finals: a small raised form of the consonant (as Cree finals)
    for (const c of ph.consonants) { const g = draw(consShape[c], { turn: 0, dot: 0 }); glyphs['C:' + c] = { s: mapG(g.s, ([x, y]) => [x * 0.5, y * 0.5 - 0.05]), w: 0.55, small: true, final: true }; }
    return { glyphs, consShape, orient, nullShape };
  },
  layout(sc, ph, segs) {
    const cells = syllabaryLayout(sc, ph, segs);
    for (const c of cells) if (c.final) { c.s = c.s; }
    return cells;
  },
};

// ---------------------------------------------------------------- system: BRAHMIC (head line, hanging bodies, vowel signs)
function brahmiBody(r, w) {
  const sx = w * 0.62; // body area left of the stem
  const kinds = {
    loop: () => [chain(L(P(sx, 0.45), P(sx * 0.6, 0.45)), ARC(sx * 0.4, 0.62, sx * 0.3, 0.18, 270, 600))],
    two: () => [chain(Q(P(sx * 0.1, 0.2), P(sx * 0.9, 0.1), P(sx * 0.5, 0.5)), Q(P(sx * 0.5, 0.5), P(sx * 0.1, 0.85), P(sx, 0.9)))],
    rev: () => [ARC(sx * 0.5, 0.5, sx * 0.45, 0.4, -100, 140)],
    angle: () => [L(P(sx, 0.05), P(sx * 0.1, 0.5), P(sx, 0.95))],
    dbl: () => [ARC(sx * 0.5, 0.3, sx * 0.4, 0.22, 90, 400), ARC(sx * 0.5, 0.72, sx * 0.4, 0.22, 270, 580)],
    notch: () => [L(P(sx * 0.1, 0), P(sx * 0.5, 0.6), P(sx, 0.35))],
    pcup: () => [chain(L(P(0.05, 0), P(0.05, 0.6)), ARC(sx * 0.5 + 0.03, 0.6, sx * 0.5 - 0.02, 0.35, 180, 0), L(P(sx, 0.6), P(sx, 0.5)))],
    hang: () => [L(P(sx * 0.5, 0), P(sx * 0.5, 0.55)), ARC(sx * 0.5, 0.72, sx * 0.3, 0.17, 270, 600)],
    wave: () => [chain(ARC(sx * 0.3, 0.4, sx * 0.25, 0.22, 180, 0), ARC(sx * 0.7, 0.4, sx * 0.25, 0.22, 180, 360), L(P(sx * 0.95, 0.4), P(sx * 0.95, 0.9)))],
  };
  const k = r.pick(Object.keys(kinds));
  return { s: kinds[k](), k };
}
const BRAHMIC = {
  id: 'brahmic', name: 'head-line abugida', types: ['abugida'], extent: [-0.55, 1.5], scale: 1.15,
  build(ph, rng, style) {
    const existing = [];
    const glyphs = {};
    const inherent = ph.vowels.includes('a') ? 'a' : ph.vowels.includes('ə') ? 'ə' : ph.vowels[0];
    const nukta = rng.chance(0.7);
    const bodyOf = {};
    for (const c of ph.consonants) {
      const f = feat(c);
      // [ASSUMPTION] as Devanagari's nukta: a fricative may be written as the stop of its place plus a dot below
      const stopPartner = nukta && f.manner === 'fric' && ph.consonants.find(x => { const g = feat(x); return g.place === f.place && g.manner === 'stop' && g.voice === f.voice && glyphs['C:' + x]; });
      if (stopPartner) { const b = glyphs['C:' + stopPartner]; glyphs['C:' + c] = { ...b, s: [...b.s, DOT(b.w * 0.4, 1.18, 1.2)], nukta: stopPartner }; continue; }
      const g = distinctGlyph((r) => {
        const w = r.pick([0.8, 0.9, 1.0]);
        const body = brahmiBody(r, w);
        const stem = r.chance(0.72);
        const s = [...body.s];
        if (stem) s.push(L(P(w * 0.78, 0), P(w * 0.78, 1)), L(P(w * 0.62, 0.45), P(w * 0.78, 0.45)));
        if (r.chance(0.2)) s.push(L(P(w * 0.2, 0.75), P(w * 0.45, 0.9)));
        return { s, w, stem, body: body.k };
      }, existing, rng, { tries: 50, accept: 0.5 });
      glyphs['C:' + c] = g; existing.push(g); bodyOf[c] = g.body;
    }
    for (const v of ph.vowels) {
      const g = distinctGlyph((r) => {
        const w = 0.9;
        const b1 = brahmiBody(r, w), b2 = brahmiBody(r, w);
        const s = [...b1.s, ...mapG(b2.s, ([x, y]) => [x * 0.5 + w * 0.45, y * 0.6 + 0.4])];
        return { s, w };
      }, existing, rng, { tries: 40, accept: 0.5 });
      glyphs['V:' + v] = g; existing.push(g);
    }
    // vowel signs (matras): structured by vowel quality
    const signs = {};
    const pool = { front: ['above', 'above2', 'preI'], back: ['below', 'below2', 'postStem'], central: ['postStem', 'postI', 'aboveR'] };
    const usedSign = new Set();
    for (const v of ph.vowels) {
      if (v === inherent) continue;
      const f = SEGMENTS[v];
      const group = f.round ? 'back' : f.back === 'front' ? 'front' : 'central';
      let sg = pool[group].find(x => !usedSign.has(x)) || ['above', 'above2', 'preI', 'below', 'below2', 'postStem', 'postI', 'aboveR', 'belowR', 'aboveC'].find(x => !usedSign.has(x)) || 'aboveC';
      usedSign.add(sg); signs[v] = sg;
    }
    return { glyphs, signs, inherent, nukta };
  },
  layout(sc, ph, segs) {
    const d = sc.data;
    const cells = [];
    const ps = segs.map(plain);
    for (let i = 0; i < ps.length; i++) {
      const s = ps[i];
      if (isV(s)) { cells.push(cellOf(d.glyphs['V:' + vBase(s)] || anyGlyph(d), { sc, tone: toneOf(segs[i]) })); continue; }
      const g = d.glyphs['C:' + s] || anyGlyph(d);
      const cell = cellOf(g, { sc });
      const n = ps[i + 1];
      if (n && isV(n)) {
        const vb = vBase(n);
        if (vb !== d.inherent) applyMatra(cell, d.signs[vb], isLong(n));
        else if (isLong(n)) applyMatra(cell, 'postStem', false);
        const t = toneOf(segs[i + 1]); if (t > 1) cell.s.push(...toneMark(t, cell.w));
        i++;
      } else cell.s.push(L(P(cell.w * 0.55, 1.08), P(cell.w * 0.8, 1.3))); // virama
      cells.push(cell);
    }
    return cells;
  },
  word(cells) { // continuous head line
    return cells.length ? [{ line: true }] : [];
  },
};
function applyMatra(cell, sign, long) {
  const w = cell.w;
  const add = (...st) => cell.s.push(...st);
  switch (sign) {
    case 'above': add(L(P(w * 0.5, 0), P(w * 0.25, -0.35))); break;
    case 'above2': add(L(P(w * 0.5, 0), P(w * 0.25, -0.35)), L(P(w * 0.75, 0), P(w * 0.5, -0.35))); break;
    case 'aboveR': add(Q(P(w * 0.7, 0), P(w * 0.95, -0.4), P(w * 1.05, -0.1))); break;
    case 'aboveC': add(ARC(w * 0.5, -0.05, w * 0.18, 0.18, 180, 360)); break;
    case 'below': add(Q(P(w * 0.55, 1), P(w * 0.2, 1.25), P(w * 0.6, 1.42))); break;
    case 'below2': add(Q(P(w * 0.55, 1), P(w * 0.95, 1.25), P(w * 0.5, 1.42))); break;
    case 'belowR': add(L(P(w * 0.6, 1.05), P(w * 0.9, 1.35))); break;
    case 'postStem': cell.s.push(L(P(w + 0.12, 0), P(w + 0.12, 1))); cell.w += 0.2; break;
    case 'postI': cell.s.push(chain(L(P(w + 0.12, 1), P(w + 0.12, 0)), Q(P(w + 0.12, 0), P(w * 0.6, -0.45), P(w * 0.2, -0.05)))); cell.w += 0.2; break;
    case 'preI': cell.s = mapG(cell.s, ([x, y]) => [x + 0.22, y]); cell.s.push(chain(L(P(0.08, 1), P(0.08, 0)), Q(P(0.08, 0), P(w * 0.6, -0.45), P(w + 0.1, -0.05)))); cell.w += 0.22; break;
    default: break;
  }
  if (long) cell.s.push(L(P(cell.w + 0.06, 0.2), P(cell.w + 0.06, 0.55)));
}

// ---------------------------------------------------------------- system: CURSIVE (Arabic-like joined abjad with dots)
const CURSIVE_SKELETONS = {
  tooth: (w) => ({ s: [L(P(0, 1), P(w, 1)), L(P(w * 0.5, 1), P(w * 0.5, 0.55))], w, join: true }),
  boat: (w) => ({ s: [Q(P(0, 0.75), P(w * 0.5, 1.25), P(w, 0.7))], w, join: true }),
  tall: (w) => ({ s: [L(P(w * 0.5, -0.6), P(w * 0.5, 1))], w: w * 0.6, join: false }),
  tallJ: (w) => ({ s: [chain(L(P(w * 0.7, -0.6), P(w * 0.7, 1)), L(P(w * 0.7, 1), P(0, 1)))], w, join: true }),
  loop: (w) => ({ s: [chain(L(P(0, 1), P(w * 0.3, 1)), ARC(w * 0.55, 0.78, w * 0.3, 0.24, 180, 540), L(P(w * 0.3, 1), P(w, 1)))], w, join: true }),
  hook: (w) => ({ s: [chain(L(P(w, 0.55), P(w * 0.2, 0.6)), Q(P(w * 0.2, 0.6), P(w * 0.1, 1.6), P(w * 0.9, 1.5)))], w, join: false }),
  ra: (w) => ({ s: [Q(P(w * 0.9, 0.75), P(w * 0.8, 1.35), P(0, 1.4))], w: w * 0.8, join: false }),
  wave: (w) => ({ s: [chain(L(P(0, 1), P(w * 0.2, 1)), L(P(w * 0.2, 1), P(w * 0.25, 0.72)), Q(P(w * 0.25, 0.72), P(w * 0.4, 1.05), P(w * 0.5, 0.72)), Q(P(w * 0.5, 0.72), P(w * 0.65, 1.05), P(w * 0.75, 0.72)), L(P(w * 0.75, 0.72), P(w * 0.8, 1)), L(P(w * 0.8, 1), P(w, 1)))], w: w * 1.3, join: true }),
  eye: (w) => ({ s: [chain(L(P(0, 1), P(w * 0.35, 1)), ARC(w * 0.6, 0.55, w * 0.28, 0.3, 120, 480), L(P(w * 0.45, 0.82), P(w, 1)))], w, join: true }),
  ayn: (w) => ({ s: [chain(ARC(w * 0.6, 0.5, w * 0.3, 0.2, 330, 150), Q(P(w * 0.35, 0.6), P(w * 0.2, 1), P(w, 1)))], w, join: true }),
  kaf: (w) => ({ s: [chain(L(P(w * 0.95, -0.4), P(w * 0.2, 0.6)), L(P(w * 0.2, 0.6), P(w * 0.9, 1)), L(P(w * 0.9, 1), P(0, 1)))], w, join: true }),
  dal: (w) => ({ s: [chain(L(P(w * 0.3, 0.35), P(w * 0.8, 0.9)), L(P(w * 0.8, 0.9), P(0, 1)))], w: w * 0.8, join: false }),
};
const DOT_PATTERNS = [[], [['a', 1]], [['b', 1]], [['a', 2]], [['b', 2]], [['a', 3]], [['b', 3]], [['a', 1], ['b', 1]]];
function dotsFor(pattern, w) {
  const out = [];
  for (const [pos, n] of pattern) {
    const y = pos === 'a' ? 0.3 : 1.35;
    if (n === 1) out.push(DOT(w * 0.5, y, 1.3));
    if (n === 2) out.push(DOT(w * 0.35, y, 1.3), DOT(w * 0.65, y, 1.3));
    if (n === 3) out.push(DOT(w * 0.35, y, 1.3), DOT(w * 0.65, y, 1.3), DOT(w * 0.5, y + (pos === 'a' ? -0.17 : 0.17), 1.3));
  }
  return out;
}
const CURSIVE = {
  id: 'cursive', name: 'joined dotted abjad', types: ['abjad', 'alphabet'], extent: [-0.7, 1.75], scale: 1.5,
  build(ph, rng, style) {
    // [ASSUMPTION] as Arabic's i'jam: consonants of one place share a skeleton, dots tell them apart
    const groups = {};
    for (const c of ph.consonants) { const f = feat(c); const k = f.manner === 'liq' ? 'liq' + (f.lateral ? 'l' : 'r') : f.manner === 'gl' ? 'gl' + f.raw.place : f.manner === 'nas' ? 'nas' + f.place : f.place; (groups[k] = groups[k] || []).push(c); }
    const skNames = rng.shuffle(Object.keys(CURSIVE_SKELETONS).filter(n => n !== 'tall'));
    const glyphs = {};
    let i = 0;
    const order = rng.shuffle(Object.keys(groups));
    const skOf = {};
    for (const k of order) {
      const name = skNames[i++ % skNames.length];
      const extraBar = i > skNames.length;
      skOf[k] = name;
      const pats = rng.shuffle(DOT_PATTERNS.slice(groups[k].length > 1 ? 0 : 0));
      groups[k].forEach((c, j) => {
        const sk = CURSIVE_SKELETONS[name](0.7 * style.width);
        const s = [...sk.s, ...dotsFor(pats[j % pats.length], sk.w)];
        if (extraBar) s.push(L(P(sk.w * 0.3, -0.05), P(sk.w * 0.75, -0.25)));
        if (j >= pats.length) s.push(L(P(sk.w * 0.2, 1.5), P(sk.w * 0.8, 1.5)));
        glyphs['C:' + c] = { s, w: sk.w, joinable: sk.join, group: k, sk: name };
      });
    }
    // vowel letters (matres): tall stroke for low vowels, loop/boat shapes for others
    const vsh = { low: 'tall', front: 'boat', back: 'eye', central: 'tooth' };
    ph.vowels.forEach((v, j) => {
      const f = SEGMENTS[v];
      const name = f.height === 'low' ? 'tall' : f.round ? 'eye' : f.back === 'front' ? 'boat' : 'tooth';
      const sk = CURSIVE_SKELETONS[name](0.7 * style.width);
      const s = [...sk.s];
      const sameName = ph.vowels.slice(0, j).filter(x => { const g = SEGMENTS[x]; return (g.height === 'low' ? 'tall' : g.round ? 'eye' : g.back === 'front' ? 'boat' : 'tooth') === name; }).length;
      if (sameName === 1) s.push(L(P(sk.w * 0.5 - 0.12, -0.45 + (name === 'tall' ? -0.3 : 0.4)), P(sk.w * 0.5 + 0.12, -0.6 + (name === 'tall' ? -0.3 : 0.4))));
      if (sameName >= 2) s.push(Q(P(sk.w * 0.4, 1.3), P(sk.w * 0.7, 1.55), P(sk.w * 0.3, 1.6)));
      glyphs['V:' + v] = { s, w: sk.w, joinable: name !== 'tall', vowel: true };
      void vsh;
    });
    return { glyphs, groups, skOf };
  },
  layout: alphaLayout,
  word(cells) { return [{ joins: true }]; },
};


// ---------------------------------------------------------------- hands: one sign in a style, for any writing type
// A hand draws a single distinct sign (consonant, vowel or syllable) in the look of a design system. The generic
// type builders below use it for style/type pairs a system has no tailored builder for (a rounded syllabary,
// a runic abugida, a brush alphabet...). role: 'C' | 'V' | 'CV'.
const HANDS = {
  capitals: (r, style, role) => capSign(r, style, role === 'V'),
  runic: (r, style) => runeSign(r, style),
  rounded: (r, style, role) => {
    const w = r.pick([0.6, 0.7, 0.8]) * style.width;
    const bodies = roundBodies(w);
    const bn = role === 'V' ? r.pick(['o', 'cR', 'cL', 'e', 'u', 'n', 'm', 'loop']) : r.pick(Object.keys(bodies));
    const body = bodies[bn];
    const st = [...body.s];
    if (role !== 'V' || r.chance(0.15)) {
      const an = r.pick(Object.keys(body.anchors));
      const ext = roundExtenders(w, body.anchors[an], r);
      const en = r.weighted({ asc: 2, desc: 2, ascHook: 1.2, descCurl: 1.4, topLoop: 0.8, tail: 1 });
      if ((en.startsWith('asc') || en === 'topLoop') && body.anchors[an][1] > 0.6) return null;
      if (en.startsWith('desc') && body.anchors[an][1] < 0.4) return null;
      st.push(ext[en]);
    }
    if (r.chance(0.18)) st.push(DOT(w / 2, role === 'V' ? -0.35 : 0.5, 1.2));
    return { s: st, w };
  },
  brush: (r, style, role, data) => kanaGlyph(r, data.mode),
  geometric: (r) => {
    const names = Object.keys(GEO_SHAPES);
    let st = rotateUnit(GEO_SHAPES[r.pick(names)](), r.int(0, 3));
    const m = r.weighted({ none: 3, bar: 1, dot: 1, tick: 1, ring: 0.6 });
    if (m === 'bar') st = [...st, L(P(0.05, 0.98), P(0.95, 0.98))];
    if (m === 'dot') st = [...st, DOT(0.5, 0.5, 1.3)];
    if (m === 'tick') st = [...st, L(P(0.5, 0), P(0.5, -0.18))];
    if (m === 'ring') st = [...st, RING(0.5, 0.5, 0.1, 0.1)];
    return { s: st, w: 1 };
  },
  brahmic: (r, style, role) => {
    const w = r.pick([0.8, 0.9, 1.0]);
    const body = brahmiBody(r, w);
    const st = [...body.s];
    if (role === 'V') { const b2 = brahmiBody(r, w); st.push(...mapG(b2.s, ([x, y]) => [x * 0.5 + w * 0.45, y * 0.6 + 0.4])); }
    else if (r.chance(0.72)) st.push(L(P(w * 0.78, 0), P(w * 0.78, 1)), L(P(w * 0.62, 0.45), P(w * 0.78, 0.45)));
    if (r.chance(0.2)) st.push(L(P(w * 0.2, 0.75), P(w * 0.45, 0.9)));
    return { s: st, w };
  },
  cursive: (r, style) => {
    const name = r.pick(Object.keys(CURSIVE_SKELETONS));
    const sk = CURSIVE_SKELETONS[name](0.7 * style.width);
    return { s: [...sk.s, ...dotsFor(r.pick(DOT_PATTERNS), sk.w)], w: sk.w, joinable: sk.join };
  },
  blocks: (r, style) => {
    const base = r.pick(Object.keys(BLOCK_SHAPES));
    const mods = r.sample(['bar', 'inner', 'tick', 'dot', 'under', 'hook', 'notch', 'dot2'], r.weighted({ 0: 1, 1: 2, 2: 1.5 }));
    return { s: blockConsonant({ base, mods }, style.rounded), w: 1 };
  },
};
// voiced syllables derived from voiceless ones by a small mark, in a form that suits the hand
const VOICING_MARKS = {
  ticks: (w) => dakuten(w), dot: (w) => [DOT(w + 0.1, 0.05, 1.2)], bar: (w) => [L(P(w * 0.2, 1.2), P(w * 0.8, 1.2))], ring: (w) => [RING(w + 0.12, 0.08, 0.08, 0.08)],
};
const MATRA_KINDS = ['above', 'above2', 'preI', 'below', 'below2', 'postStem', 'postI', 'aboveR', 'belowR', 'aboveC'];

// generic builders: alphabet / abjad, syllabary, abugida from a hand
function handBuild(type, system, ph, rng, style) {
  const hand = HANDS[system];
  const data = { mode: rng.chance(0.5) ? 'cursive' : 'angular' };
  const glyphs = {};
  const existing = [];
  const make = (role, key, accept = 0.5) => {
    const g = distinctGlyph((r) => hand(r, style, role, data), existing, rng, { tries: 50, accept });
    glyphs[key] = g; existing.push(g); return g;
  };
  if (type === 'alphabet' || type === 'abjad') {
    for (const c of ph.consonants) make('C', 'C:' + c);
    for (const v of ph.vowels) make('V', 'V:' + v);
    return { glyphs, generic: 'alpha', ...data };
  }
  if (type === 'syllabary') {
    const voicing = rng.chance(0.7) ? rng.pick(system === 'brush' ? ['ticks'] : Object.keys(VOICING_MARKS)) : null;
    for (const v of ph.vowels) make('V', 'V:' + v, 0.45);
    // [ASSUMPTION] as Ge'ez: hands with few distinct shapes write a syllable as the consonant's base shape plus
    // a vowel mark in a fixed place (the first vowel is the bare form); others give every syllable its own sign
    let bases = null, vmark = null;
    const composed = ['brahmic', 'cursive', 'runic', 'blocks', 'geometric'].includes(system) || rng.chance(0.3);
    if (composed) {
      const marks = rng.shuffle(MATRA_KINDS.filter(k => !['preI', 'above2', 'below2'].includes(k))); // near-mirror pairs blur together
      vmark = {}; ph.vowels.forEach((v, i) => { vmark[v] = i === 0 ? null : marks[(i - 1) % marks.length] + (i > 2 * marks.length ? '+dot2' : i > marks.length ? '+dot' : ''); });
      bases = {};
      for (const c of ph.consonants) { bases[c] = make('C', 'B:' + c); delete glyphs['B:' + c]; }
      dedupe({ ...Object.fromEntries(ph.vowels.map(v => ['V:' + v, glyphs['V:' + v]])), ...bases });
      for (const c of ph.consonants) {
        const base = bases[c];
        for (const v of ph.vowels) {
          const cell = { s: [...base.s], w: base.w };
          const m = vmark[v];
          if (m) { const [k, extra] = m.split('+'); applyMatra(cell, k, false); if (extra) cell.s.push(DOT(cell.w + 0.12, 0.5, 1.2)); if (extra === 'dot2') cell.s.push(DOT(cell.w + 0.12, 0.8, 1.2)); }
          glyphs['CV:' + c + '|' + v] = { ...base, s: cell.s, w: cell.w, composedFrom: c };
        }
      }
    }
    for (const pass of [0, 1]) for (const c of composed ? [] : ph.consonants) {
      const vl = VOICE_PAIRS[c];
      for (const v of ph.vowels) {
        const key = 'CV:' + c + '|' + v;
        if (glyphs[key]) continue;
        const base = voicing && vl && glyphs['CV:' + vl + '|' + v];
        if (base) { glyphs[key] = { ...base, s: [...base.s, ...VOICING_MARKS[voicing](base.w)], derived: vl }; continue; }
        if (pass === 1 || !(voicing && vl && ph.consonants.includes(vl))) make('CV', key, 0.45);
      }
    }
    const quiet = ['ɯ', 'u', 'ə', 'ɨ', 'i'].find(v => ph.vowels.includes(v)) || ph.vowels[0];
    for (const c of ph.consonants) { const g = glyphs['CV:' + c + '|' + quiet]; glyphs['C:' + c] = { ...g, s: [...g.s, L(P(g.w * 0.75, 0.95), P(g.w * 0.95, 1.08))], small: true, derived: c }; }
    return { glyphs, generic: 'syll', voicing: composed ? null : voicing, composed, bases: composed ? bases : null, vmark: composed ? vmark : null, quiet, lengthMark: rng.pick(['bar', 'dot']), ...data };
  }
  // abugida: consonant letters carry an inherent vowel; other vowels are signs around them, chosen by vowel quality
  const inherent = ph.vowels.includes('a') ? 'a' : ph.vowels.includes('ə') ? 'ə' : ph.vowels[0];
  for (const c of ph.consonants) make('C', 'C:' + c);
  for (const v of ph.vowels) make('V', 'V:' + v);
  const pool = { front: ['above', 'above2', 'preI'], back: ['below', 'below2', 'postStem'], central: ['postStem', 'postI', 'aboveR'] };
  const used = new Set(), signs = {};
  for (const v of ph.vowels) {
    if (v === inherent) continue;
    const f = SEGMENTS[v];
    const group = f.round ? 'back' : f.back === 'front' ? 'front' : 'central';
    const sg = rng.shuffle(pool[group]).find(x => !used.has(x)) || MATRA_KINDS.find(x => !used.has(x)) || 'aboveC';
    used.add(sg); signs[v] = sg;
  }
  return { glyphs, generic: 'abugida', signs, inherent, ...data };
}
const GENERIC_LAYOUT = { alpha: alphaLayout, syll: syllabaryLayout, abugida: (sc, ph, segs) => BRAHMIC.layout(sc, ph, segs) };

// ---------------------------------------------------------------- lineages: families of related scripts
// [ASSUMPTION] Scripts that descend from one another keep a hand and a set of habits (how strokes end, whether
// curves are drawn or cut, a head line, a slant) and drift in a few of them, as Phoenician, Greek and Latin did.
// A lineage is a base style plus traits; sister languages of one parent family share one of a few lineages,
// and each language changes at most one habit.
const TRAITS = {
  angular: { label: 'curves cut into straight strokes', not: ['round'] },
  round: { label: 'corners softened into curves', not: ['angular'] },
  serif: { label: 'short cross-strokes at stroke ends', not: ['wedge', 'hook'] },
  wedge: { label: 'wedge-shaped stroke heads', not: ['serif', 'hook'] },
  hook: { label: 'hooked stroke endings', not: ['serif', 'wedge'] },
  headline: { label: 'a head line joining the letters of a word', not: ['baseline'] },
  baseline: { label: 'letters joined along the baseline', not: ['headline'] },
  narrow: { label: 'narrow letters', not: ['wide'] },
  wide: { label: 'wide letters', not: ['narrow'] },
  backslant: { label: 'a backward slant', not: [] },
};
function lineageOf(system, family, seed, ctl) {
  // a parent family has three lineages; an invented language founds its own
  const key = family && family !== 'original' ? family : 'original:' + seed;
  const pick = stream(seed, 'script-lineage').int(0, 2);
  const lr = stream('lineage', key, pick);
  const sys = system || lr.weighted({ capitals: 3, rounded: 3, runic: 1.5, blocks: 1.5, brush: 2, geometric: 1.5, brahmic: 2.5, cursive: 2.5 });
  const tr = stream('lineage', key, pick, sys);
  const habits = [];
  const n = tr.weighted({ 1: 3, 2: 3, 3: 1 });
  for (const t of tr.shuffle(Object.keys(TRAITS))) { if (habits.length >= n) break; if (habits.some(h => TRAITS[h].not.includes(t))) continue; if (badTrait(sys, t)) continue; habits.push(t); }
  const pen = tr.weighted({ mono: 2, nib: 1.4, brush: 1 });
  // the language's own drift: lose or gain one habit
  const dr = stream(seed, 'script-drift');
  if (dr.chance(0.4)) {
    if (habits.length > 1 && dr.chance(0.5)) habits.splice(dr.int(0, habits.length - 1), 1);
    else { const t = dr.pick(Object.keys(TRAITS)); if (!habits.includes(t) && !habits.some(h => TRAITS[h].not.includes(t)) && !badTrait(sys, t)) habits.push(t); }
  }
  return { key, index: pick, system: sys, habits, pen, slantBias: tr.range(-0.02, 0.12) };
}
function badTrait(sys, t) {
  if (sys === 'brahmic' && (t === 'headline' || t === 'baseline')) return true; // already has a head line
  if (sys === 'cursive' && (t === 'baseline' || t === 'headline')) return true;
  if (sys === 'blocks' && (t === 'baseline' || t === 'headline' || t === 'backslant')) return true;
  if (sys === 'runic' && t === 'round') return true;
  return false;
}
// stroke-level habits applied to every sign
function simplify(pts, n) { if (pts.length <= n) return pts; const out = []; for (let i = 0; i < n; i++) out.push(pts[Math.round(i * (pts.length - 1) / (n - 1))]); return out; }
function chaikin(pts, closedLoop) {
  let p = pts;
  for (let k = 0; k < 2; k++) {
    const o = closedLoop ? [] : [p[0]];
    const m = closedLoop ? p.length : p.length - 1;
    for (let i = 0; i < m; i++) { const a = p[i], b = p[(i + 1) % p.length]; o.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]); }
    if (!closedLoop) o.push(p[p.length - 1]);
    p = o;
  }
  return p;
}
function endTicks(st, kind) {
  if (st.dot || st.closed || st.p.length < 2) return [];
  const out = [];
  const ends = [[st.p[0], st.p[1]], [st.p[st.p.length - 1], st.p[st.p.length - 2]]];
  for (const [[x, y], [px, py]] of ends) {
    let dx = x - px, dy = y - py; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const nx = -dy, ny = dx;
    if (kind === 'serif') { if (Math.abs(dy) < 0.5) continue; out.push(L(P(x - nx * 0.09, y - ny * 0.09), P(x + nx * 0.09, y + ny * 0.09))); }
    if (kind === 'wedge') { out.push(closed(L(P(x - nx * 0.07, y - ny * 0.07), P(x + nx * 0.07, y + ny * 0.07), P(x - dx * 0.14, y - dy * 0.14)))); break; }
    if (kind === 'hook') { out.push(Q(P(x, y), P(x + dx * 0.1 + nx * 0.02, y + dy * 0.1 + ny * 0.02), P(x + nx * 0.12, y + ny * 0.12))); break; }
  }
  return out;
}
function applyHabits(g, habits) {
  if (!g?.s) return;
  let s = g.s;
  if (habits.includes('angular')) s = s.map(st => (st.dot || st.p.length <= 4 ? st : { ...st, p: simplify(st.p, st.closed ? 5 : 4) }));
  if (habits.includes('round')) s = s.map(st => (st.dot || st.p.length < 3 || st.p.length > 6 ? st : { ...st, p: chaikin(st.p, st.closed) }));
  const tick = ['serif', 'wedge', 'hook'].find(h => habits.includes(h));
  if (tick) { const span = (st) => { const b = bbox([st]); return Math.hypot(b.x1 - b.x0, b.y1 - b.y0); }; const main = s.filter(st => !st.dot && !st.closed && st.p.length >= 2 && span(st) > 0.45).sort((a, b) => b.p.length - a.p.length); for (const st of (tick === 'serif' ? main : main.slice(0, 1))) s = [...s, ...endTicks(st, tick)]; }
  const sx = habits.includes('narrow') ? 0.82 : habits.includes('wide') ? 1.18 : 1;
  if (sx !== 1) { s = mapG(s, ([x, y]) => [x * sx, y]); g.w = (g.w || 1) * sx; }
  if (habits.includes('baseline')) g.joinable = g.joinable ?? true;
  g.s = s;
}

// ---------------------------------------------------------------- distinctness pass
// any glyph too close to an earlier one gets a small extra mark (a dot, ring or bar), as scripts do (ė, å, ē)
const EXTRA_MARKS = [
  (w) => [DOT(w + 0.12, 0.05, 1.1)], (w) => [DOT(w + 0.12, 0.95, 1.1)], (w) => [L(P(w * 0.2, -0.22), P(w * 0.8, -0.22))],
  (w) => [RING(w / 2, -0.3, 0.09, 0.09)], (w) => [DOT(w * 0.3, -0.25, 1.1), DOT(w * 0.7, -0.25, 1.1)], (w) => [L(P(w * 0.2, 1.22), P(w * 0.8, 1.22))],
  (w) => [L(P(w + 0.05, 0.1), P(w + 0.2, 0.3))], (w) => [RING(w + 0.15, 0.5, 0.08, 0.08)],
];
function dedupe(map, threshold = 0.88) {
  const done = [];
  for (const [k, g] of Object.entries(map)) {
    if (!g || g.derived || g.nukta || g.composedFrom) continue; // composed syllables: distinct bases + distinct mark places
    let r = raster(g.s, normFrame(g));
    for (let m = 0; m < EXTRA_MARKS.length * 3 && done.some(x => iou(x, r) > threshold); m++) {
      const round = Math.floor(m / EXTRA_MARKS.length);
      const extra = EXTRA_MARKS[m % EXTRA_MARKS.length](g.w || 1);
      g.s = [...g.s, ...(round ? mapG(extra, ([x, y]) => [round === 1 ? -0.2 - (x - (g.w || 1)) * 0.3 : x, round === 2 ? y + 0.3 : y]) : extra)];
      g.marked = true;
      r = raster(g.s, normFrame(g));
    }
    done.push(r);
    void k;
  }
}

// ---------------------------------------------------------------- registry and API
export const SYSTEMS = { blocks: BLOCKS, capitals: CAPITALS, rounded: ROUNDED, runic: RUNIC, brush: BRUSH, geometric: GEOMETRIC, brahmic: BRAHMIC, cursive: CURSIVE };
export const SYSTEM_LIST = [
  ['blocks', 'Featural blocks (Hangul-like)'], ['capitals', 'Capital letters (Latin/Greek-like)'], ['rounded', 'Rounded letters (Georgian-like)'],
  ['runic', 'Carved runes'], ['brush', 'Brush syllabary (kana-like)'], ['geometric', 'Turned shapes (Cree-like)'],
  ['brahmic', 'Head-line abugida (Devanagari-like)'], ['cursive', 'Joined dotted abjad (Arabic-like)'],
];
const TYPE_OF = { blocks: 'alphabet', capitals: 'alphabet', rounded: 'alphabet', runic: 'alphabet', brush: 'syllabary', geometric: 'syllabary', brahmic: 'abugida', cursive: 'abjad' };

export function buildOriginalScript(ph, ctl, seed) {
  const rng = stream(seed, 'script');
  const simpleSyll = ph.onsetCap === 1 && ph.codaCap <= 1 && ph.consonants.length * ph.vowels.length <= 150;
  let type = ctl.scriptType && ctl.scriptType !== 'auto' ? ctl.scriptType : null;
  const pinned = ctl.scriptStyle && ctl.scriptStyle !== 'auto' && SYSTEMS[ctl.scriptStyle] ? ctl.scriptStyle : null;
  const lineage = lineageOf(pinned, ctl.family, seed, ctl);
  const system = lineage.system;
  const notes = [];
  // [ASSUMPTION] a style is most often used for the type it was made for, but any hand can write any type
  if (!type) {
    const native = SYSTEMS[system].types;
    const fits = { alphabet: 3, abugida: 2, abjad: ph.templatic ? 6 : 1, syllabary: simpleSyll ? 3 : 0 };
    type = rng.weighted(Object.fromEntries(Object.entries(fits).map(([t, w]) => [t, w * (native.includes(t) ? 3 : 1)])));
    if (system === 'blocks' && type !== 'alphabet' && rng.chance(0.5)) type = 'alphabet';
  }
  if (type === 'syllabary' && !simpleSyll) notes.push('A syllabary needs simple syllables; consonant clusters are written with small vowel-less signs.');
  const sys = SYSTEMS[system];
  const generic = !sys.types.includes(type) || (system === 'geometric' && type === 'abugida');
  const style = {
    width: rng.range(0.9, 1.15),
    weight: system === 'brush' ? rng.range(1.6, 2.1) : system === 'rounded' ? rng.range(1.9, 2.8) : rng.range(1.5, 2.6),
    slant: lineage.habits.includes('backslant') ? -rng.range(0.06, 0.14) : ['capitals', 'rounded', 'cursive'].includes(system) && rng.chance(0.3) ? rng.range(0.05, 0.16) : Math.max(0, lineage.slantBias),
    cap: system === 'runic' || system === 'blocks' ? rng.pick(['square', 'round']) : 'round',
    rounded: system === 'blocks' && (rng.chance(0.3) || lineage.habits.includes('round')),
    pen: system === 'cursive' ? 'nib' : system === 'brush' ? 'brush' : lineage.pen,
    nibAngle: rng.range(25, 50),
    direction: system === 'cursive' || lineage.habits.includes('baseline') ? (rng.chance(0.8) ? 'rtl' : 'ltr') : type === 'abjad' ? (rng.chance(0.7) ? 'rtl' : 'ltr') : (sys.ltrOnly || system === 'brahmic' ? 'ltr' : rng.chance(0.12) ? 'rtl' : 'ltr'),
    pointed: rng.chance(0.4),
    lengthMark: rng.chance(0.4),
    gap: system === 'blocks' && !generic ? 0.12 : system === 'cursive' || lineage.habits.includes('baseline') ? 0 : lineage.habits.includes('headline') ? 0.08 : 0.22,
  };
  const data = generic ? handBuild(type, system, ph, stream(seed, 'script', system, type), style) : sys.build(ph, stream(seed, 'script', system), style);
  for (const g of Object.values(data.glyphs || {})) applyHabits(g, lineage.habits);
  for (const g of Object.values(data.letters || {})) { const x = { s: g.s, w: 1 }; applyHabits(x, lineage.habits.filter(h => !['narrow', 'wide'].includes(h))); g.s = x.s; }
  if (data.glyphs) dedupe(data.glyphs);
  if (data.letters) { const lm = Object.fromEntries(Object.entries(data.letters).map(([k, v]) => [k, Object.assign(v, { w: 1 })])); dedupe(lm); }
  // abugida vowel signs reach further above and below the letters than most hands do
  const ext = SYSTEMS[system].extent;
  const extent = generic && type === 'abugida' ? [Math.min(ext[0], -0.55), Math.max(ext[1], 1.5)] : generic && type === 'syllabary' ? [Math.min(ext[0], -0.3), Math.max(ext[1], 1.3)] : ext;
  const headline = system === 'brahmic' || lineage.habits.includes('headline');
  const joins = system === 'cursive' || lineage.habits.includes('baseline');
  return { id: 'original', type, system, systemName: sys.name, style, data, notes, inherent: data.inherent, generic, extent, headline, joins, lineage };
}

// glyph cells for a word (also used by the evaluation)
export function originalCells(lang, segs) {
  const sc = lang.script;
  return layoutOf(sc)(sc, lang.ph, segs);
}
const layoutOf = (sc) => (sc.generic ? GENERIC_LAYOUT[sc.data.generic] : SYSTEMS[sc.system].layout);

// ---------------------------------------------------------------- rendering
const f1 = (n) => (Math.round(n * 10) / 10).toString();
function outline(pts, widthAt, closedLoop) {
  // polygon around a polyline, width from widthAt(i, angle)
  const n = pts.length;
  if (n < 2) return '';
  const left = [], right = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const w = widthAt(i / (n - 1), Math.atan2(dy, dx)) / 2;
    left.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); right.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  const ring = (arr) => 'M' + arr.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
  if (closedLoop) return ring(left) + ring(right.reverse());
  return ring([...left, ...right.reverse()]);
}
function strokeSVG(st, tf, sw, style) {
  if (st.dot) { const [x, y] = tf(st.dot); return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(sw * 0.75 * (st.r || 1))}" fill="currentColor" stroke="none"/>`; }
  const pts = st.p.map(tf);
  if (style.pen === 'mono') return `<path d="M${pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L')}${st.closed ? 'Z' : ''}"/>`;
  let fn;
  if (style.pen === 'nib') { const th = style.nibAngle * Math.PI / 180; fn = (t, ang) => sw * (0.32 + 1.05 * Math.abs(Math.sin(ang - th))); }
  else { // brush: a full press with a thin tail ('end'), or a thin start ('start')
    fn = (t) => sw * (st.t === 'start' ? 0.35 + 1.2 * t : st.t === 'end' ? 1.45 - 1.05 * t * t : 1.1);
  }
  const all = st.closed ? [...pts, pts[0]] : pts;
  return `<path d="${outline(all, fn, false)}" fill="currentColor" stroke="none"/>`;
}

// size = font size in px; returns an inline SVG for one word
export function renderOriginal(lang, segs, { size = 22 } = {}) {
  const sc = lang.script;
  return renderCells(sc, originalCells(lang, segs), size);
}
export function renderCells(sc, cells, size = 22) {
  const sys = SYSTEMS[sc.system];
  const [top, bottom] = sc.extent || sys.extent;
  const em = size * (sys.scale || 1) / (bottom - top);
  const sw = Math.max(1, sc.style.weight * em / (sc.style.pen === 'nib' ? 15 : 22));
  const padX = 0.12 * em + sw;
  const slant = sc.style.slant;
  // positions
  let x = 0;
  const pos = [];
  for (const c of cells) { pos.push(x); x += c.w + (c.gap ?? sc.style.gap); }
  const totalEm = Math.max(x - (cells.length ? (cells[cells.length - 1].gap ?? sc.style.gap) : 0), 0.3);
  const rtl = sc.style.direction === 'rtl';
  const W = totalEm * em + 2 * padX + Math.abs(slant) * (bottom - top) * em + (sc.headline ?? sys.id === 'brahmic' ? 0.3 * em : 0);
  const H = (bottom - top) * em + 2 * sw;
  const oy = -top * em + sw;
  let body = '';
  cells.forEach((c, i) => {
    const ox = rtl ? padX + (totalEm - pos[i] - c.w) * em : padX + pos[i] * em;
    const tf = ([px, py]) => [ox + px * em + (1 - py) * slant * em, oy + py * em];
    for (const st of c.s) body += strokeSVG(st, tf, sw, sc.style);
  });
  // word-level strokes: head line (brahmic) and baseline joins (cursive)
  if ((sc.headline ?? sys.id === 'brahmic') && cells.length) body += strokeSVG(L(P(-0.05, 0), P(totalEm + 0.05, 0)), ([px, py]) => [padX + px * em, oy + py * em], sw, { ...sc.style, pen: 'mono' });
  if (sc.joins ?? sys.id === 'cursive') {
    for (let i = 0; i < cells.length - 1; i++) {
      if (cells[i].joinable === false) continue;
      const a = rtl ? padX + (totalEm - pos[i] - cells[i].w) * em : padX + (pos[i] + cells[i].w) * em;
      const b = rtl ? padX + (totalEm - pos[i + 1]) * em : padX + pos[i + 1] * em;
      body += strokeSVG(L(P(Math.min(a, b) - 1, oy + em), P(Math.max(a, b) + 1, oy + em)), (p) => p, sw, sc.style);
    }
  }
  const lc = sc.style.cap === 'square' ? 'square' : 'round';
  return `<svg class="glyphs" viewBox="0 0 ${f1(W)} ${f1(H)}" width="${f1(W)}" height="${f1(H)}" fill="none" stroke="currentColor" stroke-width="${f1(sw)}" stroke-linecap="${lc}" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

export function renderUnit(lang, key, size = 34) {
  const sc = lang.script;
  const g = sc.data.glyphs?.[key];
  if (!g) return '';
  return renderCells({ ...sc, style: { ...sc.style, direction: 'ltr' } }, [cellOf(g, { sc, small: g.small })], size);
}

// ---------------------------------------------------------------- grammar-book chart
// returns sections: { title, text, table?: { head: [..], rows: [[label, html...]] }, grid?: [{ label, html }] }
export function scriptChart(lang, romOf) {
  const sc = lang.script, ph = lang.ph, d = sc.data;
  const R = (segs, size = 34) => renderCells({ ...sc, style: { ...sc.style, direction: 'ltr' } }, layoutOf(sc)({ ...sc, style: { ...sc.style, direction: 'ltr' } }, ph, segs), size);
  const sections = [];
  const sys = sc.system;
  const habits = sc.lineage?.habits || [];
  const look = habits.length ? ` Its scribes' habits: ${habits.map(h => TRAITS[h].label).join(', ')}.` : '';
  const hand = SYSTEMS[sys].name.replace(/ (alphabet|syllabary|abugida|abjad)$/, '');
  const abjadVowels = ph.vowels.some(v => SEGMENTS[v].nasal)
    ? 'Nasal vowels, long vowels, and vowels at the start or end of a word have vowel letters.'
    : 'Long vowels and vowels at the start or end of a word have vowel letters.';
  if (sc.generic) {
    const d2 = sc.data;
    if (d2.generic === 'syll') {
      const head = ['', ...ph.vowels.map(romOf)];
      const rows = [['–', ...ph.vowels.map(v => renderUnit(lang, 'V:' + v, 26))], ...ph.consonants.map(c => [romOf(c), ...ph.vowels.map(v => renderUnit(lang, 'CV:' + c + '|' + v, 26))])];
      const vm = Object.keys(d2.glyphs).some(k => k.startsWith('CV:') && d2.glyphs[k].derived) ? { ticks: 'two small ticks', dot: 'a dot at the upper right', bar: 'a bar underneath', ring: 'a small ring' }[d2.voicing] : null;
      sections.push({ title: 'Syllable chart', text: `A syllabary in the ${hand} hand: ${d2.composed ? `each consonant has one base shape, and the vowel is a mark attached to it in a fixed place (the bare shape is the syllable with ${romOf(ph.vowels[0])}), as in Ge'ez` : 'each syllable has its own sign'}.${vm ? ` A voiced consonant is written as its voiceless partner with ${vm}.` : ''} A consonant with no vowel after it is written small, as the syllable with ${romOf(d2.quiet)}, with a short tail.${look}`, table: { head, rows } });
      sections.push({ title: 'Finals', text: '', grid: ph.consonants.map(c => ({ label: romOf(c), html: renderUnit(lang, 'C:' + c, 30) })) });
    } else if (d2.generic === 'abugida') {
      const c0 = ph.consonants.find(c => feat(c).manner === 'stop') || ph.consonants[0];
      sections.push({ title: 'Consonants', text: `An abugida in the ${hand} hand: each consonant letter carries the vowel ${romOf(d2.inherent)}.${look}`, grid: ph.consonants.map(c => ({ label: romOf(c) + romOf(d2.inherent), html: renderUnit(lang, 'C:' + c, 36) })) });
      sections.push({ title: 'Vowel signs', text: 'Other vowels are signs attached to the consonant: above, below, before or after it. A slanted stroke under a letter cancels the vowel.', grid: [...ph.vowels.map(v => ({ label: romOf(c0) + romOf(v), html: R([c0, v], 40) })), { label: romOf(c0) + ' (no vowel)', html: R([c0], 40) }] });
      sections.push({ title: 'Independent vowels', text: 'At the start of a word or after another vowel, vowels have full letters.', grid: ph.vowels.map(v => ({ label: romOf(v), html: renderUnit(lang, 'V:' + v, 36) })) });
    } else {
      sections.push({ title: 'Consonants', text: `${sc.type === 'abjad' ? 'An abjad' : 'An alphabet'} in the ${hand} hand: one letter for each sound.${look}`, grid: ph.consonants.map(c => ({ label: romOf(c), html: renderUnit(lang, 'C:' + c, 36) })) });
      sections.push({ title: 'Vowels', text: sc.type === 'abjad' ? abjadVowels : '', grid: ph.vowels.map(v => ({ label: romOf(v), html: renderUnit(lang, 'V:' + v, 36) })) });
    }
    return sections;
  }
  if (sys === 'blocks') {
    sections.push({ title: 'Consonant letters', text: blockFeaturalText(sc, ph, romOf), grid: ph.consonants.map(c => ({ label: romOf(c), html: renderCells(sc, [{ s: d.letters[c].s, w: 1, gap: 0 }], 34) })) });
    if (d.nullOnset) sections[0].grid.push({ label: '(no consonant)', html: renderCells(sc, [{ s: d.letters['∅'].s, w: 1, gap: 0 }], 34) });
    sections.push({ title: 'Vowel letters', text: 'Rounded vowels are written with a horizontal stroke and the other vowels with a vertical one; short side strokes show the height, and front vowels add a second upright stroke.', grid: ph.vowels.map(v => ({ label: romOf(v), html: renderCells(sc, [{ s: [...(d.vowels[v].parts.h || []), ...(d.vowels[v].parts.v ? fit(d.vowels[v].parts.v, d.vowels[v].parts.h ? 0.6 : 0.2, 0, d.vowels[v].parts.h ? 1 : 0.8, 1) : [])], w: 1, gap: 0 }], 34) })) });
    const c0 = ph.consonants.find(c => feat(c).manner === 'stop') || ph.consonants[0];
    const cod = ph.codaSet?.[0];
    const ex = ph.vowels.slice(0, 5).map(v => [c0, v]).concat(cod ? [[c0, ph.vowels[0], cod]] : []);
    sections.push({ title: 'Syllable blocks', text: 'Letters are grouped into one square block per syllable: the first consonant at the top or left, the vowel beside or under it, and a final consonant at the bottom.', grid: ex.map(segs => ({ label: segs.map(romOf).join(''), html: R(segs, 40) })) });
  } else if (sys === 'brush' || sys === 'geometric') {
    const head = ['', ...ph.vowels.map(romOf)];
    const rows = [['–', ...ph.vowels.map(v => renderUnit(lang, 'V:' + v, 26))], ...ph.consonants.map(c => [romOf(c), ...ph.vowels.map(v => renderUnit(lang, 'CV:' + c + '|' + v, 26))])];
    const txt = sys === 'brush'
      ? `Each syllable has its own sign, drawn with ${d.mode === 'cursive' ? 'flowing, curved' : 'straight, angular'} brush strokes.${d.useDakuten ? ' A voiced consonant is written as its voiceless partner with two small ticks at the upper right.' : ''} A consonant with no vowel after it is written small, as the syllable with ${romOf(d.quiet)}, with a short tail.`
      : `Each consonant has one shape; the vowel is shown by turning it${ph.vowels.length > 4 ? ', and by dots beside it for the vowels after the first four' : ''}. A long vowel has a dot above. A consonant with no vowel after it is written as a small raised form.`;
    sections.push({ title: 'Syllable chart', text: txt, table: { head, rows } });
    sections.push({ title: 'Finals', text: '', grid: ph.consonants.map(c => ({ label: romOf(c), html: renderUnit(lang, 'C:' + c, 30) })) });
  } else if (sys === 'brahmic') {
    sections.push({ title: 'Consonants', text: `Each consonant letter hangs from the head line and carries the vowel ${romOf(d.inherent)}.${d.nukta ? ' A dot below turns a stop letter into the fricative of the same place.' : ''}`, grid: ph.consonants.map(c => ({ label: romOf(c) + romOf(d.inherent), html: renderUnit(lang, 'C:' + c, 36) })) });
    const c0 = ph.consonants.find(c => feat(c).manner === 'stop') || ph.consonants[0];
    sections.push({ title: 'Vowel signs', text: 'Other vowels are signs attached to the consonant: above, below, before or after it. A slanted stroke under a letter (virama) cancels the vowel.', grid: [...ph.vowels.map(v => ({ label: romOf(c0) + romOf(v), html: R([c0, v], 40) })), { label: romOf(c0) + ' (no vowel)', html: R([c0], 40) }] });
    sections.push({ title: 'Independent vowels', text: 'At the start of a word or after another vowel, vowels have full letters.', grid: ph.vowels.map(v => ({ label: romOf(v), html: renderUnit(lang, 'V:' + v, 36) })) });
  } else if (sys === 'cursive') {
    const rows = Object.entries(d.groups).map(([k, cs]) => ({ label: cs.map(romOf).join(' · '), html: cs.map(c => renderUnit(lang, 'C:' + c, 34)).join(' ') }));
    sections.push({ title: 'Letters', text: 'Letters are joined along the baseline. Consonants made at the same place share one shape and are told apart by dots above or below it. A few letters never join to the next one.', grid: rows });
    sections.push({ title: 'Vowel letters', text: sc.type === 'abjad' ? `${abjadVowels} Short oral vowels inside a word are ${sc.style.pointed ? 'shown by small marks above or below the consonant' : 'omitted'}.` : 'Every vowel is written with its own letter.', grid: ph.vowels.map(v => ({ label: romOf(v), html: renderUnit(lang, 'V:' + v, 34) })) });
  } else {
    sections.push({ title: 'Consonants', text: sys === 'runic' ? 'The letters are made for carving: straight stems and slanting branches only, with no curves and no horizontal strokes, which would split along the grain.' : sys === 'rounded' ? `Round letters sit on a common middle height; consonants rise above it or hang below it, while vowels stay within it.${d.featural ? ' Consonants made at the same place and in the same manner share a body.' : ''}` : 'Letters stand on a common height and are built from upright stems, bars, bowls and diagonals.', grid: ph.consonants.map(c => ({ label: romOf(c), html: renderUnit(lang, 'C:' + c, 36) })) });
    sections.push({ title: 'Vowels', text: sc.type === 'abjad' ? abjadVowels : '', grid: ph.vowels.map(v => ({ label: romOf(v), html: renderUnit(lang, 'V:' + v, 36) })) });
  }
  if (look) sections.push({ title: 'Family look', text: `This script belongs to a lineage of ${hand} scripts.${look}` });
  return sections;
}
function blockFeaturalText(sc, ph, romOf) {
  const d = sc.data;
  const m = d.mannerMod;
  const words = { bar: 'a bar on top', inner: 'a stroke inside', tick: 'a short upright stroke on top', double: 'a doubled shape', dot: 'a dot' };
  const places = { lab: 'the lips', cor: 'the tongue tip', pal: 'the front of the tongue', vel: 'the back of the tongue', gut: 'the throat', ret: 'the curled tongue' };
  const used = [...new Set(ph.consonants.map(c => feat(c)).filter(f => !['liq', 'gl'].includes(f.manner)).map(f => f.place))];
  const SHAPE = { square: 'a square', angleL: 'an L-shaped corner', angle7: 'a corner opening down-left', bracket: 'a bracket', lambda: 'a peak', circle: 'a circle', cap: 'an arch', cup: 'a cup', zig: 'a zigzag', triangle: 'a triangle', vee: 'a V', half: 'a dome' };
  return `The consonant letters are featural: each place in the mouth has one basic shape (${used.map(p => `${places[p] || p}: ${SHAPE[d.base[p]] || d.base[p]}`).join('; ')}). Stops add ${words[m.stop[0]]}, fricatives ${words[m.fric[0]]}, and voiced consonants ${words[m.voice]}. Nasals use the plain shape.`;
}

// near-duplicates in a script (hard check): pairs of different units whose raster IoU is above 0.92
export function scriptCollisions(sc) {
  // composed syllabaries: the base shapes must differ, and each vowel must have its own mark
  if (sc.data.composed) { const marks = Object.values(sc.data.vmark); if (new Set(marks).size !== marks.length) return 1; return scriptCollisions({ data: { glyphs: { ...Object.fromEntries(Object.entries(sc.data.glyphs).filter(([k]) => k.startsWith('V:'))), ...Object.fromEntries(Object.entries(sc.data.bases).map(([c, g]) => ['B:' + c, g])) } } }); }
  const gs = sc.data.glyphs ? Object.entries(sc.data.glyphs).filter(([, g]) => !g.derived && !g.nukta) : Object.entries(sc.data.letters || {}).map(([k, v]) => [k, { s: v.s, w: 1 }]);
  const rs = gs.map(([, g]) => raster(g.s, normFrame(g)));
  let n = 0;
  for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) if (iou(rs[i], rs[j]) > 0.92) n++;
  void 0;
  return n;
}
