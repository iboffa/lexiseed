// IPA reader: a formant synthesiser (Klatt-style cascade/parallel), written from scratch, no external tools.
// planSpeech() turns IPA into timed acoustic targets (pure, testable in Node); synthesize() renders samples;
// speakIPA() plays them through Web Audio. A second, optional path reads a respelling with a voice installed on
// the user's own system (speakSystem), which sounds more natural but only approximates the IPA.
//
// What keeps the built-in voice from sounding robotic (version 2):
//  - pitch is one smooth contour over the phrase (declination, accent peaks on stressed syllables, a final fall or
//    question rise), with slow drift, per-cycle jitter and shimmer, instead of a constant step per sound;
//  - loudness, formants and voicing glide between sounds (smoothstep keyframes), with no gaps between words;
//  - the voice source is a Liljencrants-Fant-like pulse whose shape follows loudness (spectral tilt), plus breath
//    noise during the open phase;
//  - durations follow context: stress, phrase-final lengthening, shorter vowels before voiceless consonants,
//    shorter consonants in clusters;
//  - a small room (Schroeder reverb) and gentle level compression.
// [ASSUMPTION] Formant values are textbook averages; the result was checked by measurement, not by ear.
import { SEGMENTS } from './data/phonemes.js';

const VOWEL_F = {
  i: [280, 2250, 2900], y: [280, 1850, 2200], ɨ: [320, 1500, 2500], ɯ: [330, 1350, 2400], u: [310, 870, 2250],
  e: [400, 2050, 2650], ø: [400, 1600, 2300], ə: [500, 1450, 2500], ɤ: [450, 1150, 2400], o: [430, 850, 2400],
  ɛ: [580, 1850, 2550], ɔ: [580, 900, 2450], æ: [690, 1650, 2450], a: [750, 1300, 2500], ɑ: [720, 1050, 2450],
  ɪ: [390, 2000, 2750], ʏ: [390, 1700, 2450], ʊ: [440, 1050, 2400], œ: [550, 1550, 2350],
};
const LOCUS = { labial: [250, 800, 2200], dental: [250, 1600, 2600], alveolar: [250, 1700, 2650], postalveolar: [250, 2000, 2700], retroflex: [250, 1600, 1800], palatal: [250, 2300, 2900], velar: [250, 1900, 2400], uvular: [350, 1300, 2500], pharyngeal: [700, 1100, 2500], glottal: [500, 1400, 2500] };
const FRIC = {
  s: { r: [[5200, 1300, 1], [7200, 2000, 0.5]] }, z: { r: [[5200, 1300, 0.8]] }, ʃ: { r: [[2700, 600, 1], [4200, 1500, 0.5]] }, ʒ: { r: [[2700, 600, 0.8]] },
  ɕ: { r: [[3300, 800, 1]] }, ʑ: { r: [[3300, 800, 0.8]] }, ʂ: { r: [[2300, 500, 1]] }, ç: { r: [[3400, 700, 1]] },
  f: { by: 0.35 }, ɸ: { by: 0.3 }, v: { by: 0.25 }, β: { by: 0.2 }, θ: { by: 0.22, r: [[6500, 2500, 0.2]] }, ð: { by: 0.15 },
  x: { r: [[1700, 500, 0.8], [2700, 900, 0.4]] }, ɣ: { r: [[1700, 500, 0.6]] }, χ: { r: [[1250, 500, 0.9]] }, ʁ: { r: [[1250, 500, 0.6]] },
  ħ: { r: [[1100, 600, 0.6]] }, ʕ: { r: [[1100, 600, 0.3]] }, ɬ: { r: [[3500, 1500, 0.7]] }, h: { asp: true },
};
const BURST = { labial: { by: 0.5 }, dental: { r: [[4200, 1800, 0.9]] }, alveolar: { r: [[4000, 1500, 0.9]] }, postalveolar: { r: [[3000, 900, 1]] }, palatal: { r: [[3100, 800, 1]] }, retroflex: { r: [[2500, 700, 1]] }, velar: { r: [[1900, 600, 1]] }, uvular: { r: [[1200, 400, 1]] }, glottal: { by: 0 }, pharyngeal: { r: [[1100, 500, 0.5]] } };
const NASAL_ZERO = { labial: 1000, dental: 1600, alveolar: 1700, postalveolar: 2000, palatal: 2300, retroflex: 1500, velar: 2600, uvular: 2400 };

// [ASSUMPTION] voice presets: average adult male / adult female / child pitch, formants scaled by vocal-tract length
export const VOICES = {
  low: { name: 'Low voice', f0: 112, scale: 1.0, breath: 0.035, tilt: 0.4 },
  high: { name: 'High voice', f0: 205, scale: 1.15, breath: 0.06, tilt: 0.32 },
  child: { name: 'Child voice', f0: 265, scale: 1.27, breath: 0.05, tilt: 0.3 },
};

// IPA text -> tokens: { seg, stress, long, contour } or { pause, phrase, q }
const NEAREST_SEGMENT = {
  ʌ: 'ə', ɐ: 'a', ɒ: 'ɔ', ɵ: 'ø', ɘ: 'ə', ɜ: 'ə', ɡ: 'g', ɹ: 'r', ʋ: 'v', ɰ: 'w', ɦ: 'h',
  ʀ: 'ʁ', ɽ: 'ɻ', ɭ: 'l', ɱ: 'm', ʍ: 'w', ɥ: 'j', ɧ: 'ʃ',
};
export function parseIPA(text) {
  const syms = Object.keys(SEGMENTS).sort((a, b) => b.length - a.length);
  const out = [];
  let stress = false;
  const s = text.replace(/[/[\]]/g, '').normalize('NFC');
  for (let i = 0; i < s.length;) {
    const ch = s[i];
    if (ch === 'ˈ' || ch === "'" || ch === '’') { stress = true; i++; continue; }
    if (/[\s.‿,|;:‖?!ˌ]/.test(ch)) stress = false;
    if (ch === 'ˌ' || ch === '.' || ch === '‿') { i++; continue; } // '.' is a syllable boundary in IPA
    if (/\s/.test(ch)) { if (out.length && !out[out.length - 1].pause) out.push({ pause: 0.012, word: true }); i++; continue; } // connected speech: words are not separated by silence
    if (/[,|;:]/.test(ch)) { out.push({ pause: 0.2, phrase: true }); i++; continue; }
    if (/[‖?!]/.test(ch)) { out.push({ pause: 0.34, phrase: true, q: ch === '?' }); i++; continue; }
    if ('˥˦˧˨˩'.includes(ch)) { let t = ''; while (i < s.length && '˥˦˧˨˩'.includes(s[i])) t += s[i++]; const last = [...out].reverse().find(x => x.seg && SEGMENTS[x.seg]?.type === 'V'); if (last) last.contour = t; continue; }
    if (ch === 'ː') { const last = out[out.length - 1]; if (last?.seg) last.long = true; i++; continue; }
    if (/[̀-ͯ]/.test(ch)) { i++; continue; }
    const m = syms.find(x => s.startsWith(x, i));
    const base = ch.normalize('NFD')[0];
    const sound = m || NEAREST_SEGMENT[ch] || (isVowelSeg(base) && base);
    if (sound) {
      const vowel = isVowelSeg(sound);
      out.push({ seg: sound, stress: stress && vowel });
      if (vowel) stress = false;
    }
    i += m?.length || 1;
  }
  while (out.length && out[out.length - 1].pause) out.pop();
  return out;
}

export function tokensFromSegs(lang, words) {
  return parseIPA(words.map(segs => lang.ipa(segs)).join(' '));
}

const LEVEL = { '˥': 5, '˦': 4, '˧': 3, '˨': 2, '˩': 1 };
const isVowelSeg = (s) => SEGMENTS[s]?.type === 'V';
const oralVowel = (s) => SEGMENTS[s]?.oral || s;

// ---------------------------------------------------------------- plan: timed targets
export function planSpeech(tokens, { rate = 1, pitch = 1, voice = 'low', question = null } = {}) {
  const V = VOICES[voice] || VOICES.low;
  const ev = [];
  const D = (ms) => ms / 1000 / rate;
  const nextVowel = (i) => { for (let k = i + 1; k < tokens.length; k++) { if (tokens[k].phrase) return null; if (isVowelSeg(tokens[k].seg)) return tokens[k].seg; } return null; };
  const prevVowel = (i) => { for (let k = i - 1; k >= 0; k--) { if (tokens[k].phrase) return null; if (isVowelSeg(tokens[k].seg)) return tokens[k].seg; } return null; };
  // is this vowel the last one before a phrase break?
  const phraseFinal = (i) => { for (let k = i + 1; k < tokens.length; k++) { if (tokens[k].phrase) return true; if (isVowelSeg(tokens[k].seg)) return false; } return true; };
  const isQ = question ?? tokens.some(t => t.q);
  const sc = (F) => F.map(f => f * V.scale);
  let stressNext = false;
  for (let i = 0; i < tokens.length; i++) {
    const tk = tokens[i];
    if (tk.pause) { ev.push({ kind: 'pause', dur: D(tk.pause * 1000), F: null, AV: 0, phrase: !!tk.phrase, word: !!tk.word }); continue; }
    const f = SEGMENTS[tk.seg];
    if (!f) continue;
    if (tk.stress) stressNext = true;
    const nv = nextVowel(i) || prevVowel(i) || 'ə';
    const vf = VOWEL_F[oralVowel(nv)];
    const nextTok = tokens[i + 1], prevTok = tokens[i - 1];
    const inCluster = (nextTok?.seg && !isVowelSeg(nextTok.seg)) || (prevTok?.seg && !isVowelSeg(prevTok.seg));
    const cdur = (ms) => D(ms * (inCluster ? 0.78 : 1) * (prevTok?.word || !prevTok ? 1.12 : 1));
    if (f.type === 'V') {
      const F = VOWEL_F[oralVowel(tk.seg)] || VOWEL_F.ə;
      const beforeVoiceless = nextTok?.seg && SEGMENTS[nextTok.seg]?.type === 'C' && !SEGMENTS[nextTok.seg].voice;
      const fin = phraseFinal(i);
      const dur = 92 * (tk.long ? 1.7 : 1) * (stressNext ? 1.32 : 0.86) * (fin ? 1.45 : 1) * (beforeVoiceless ? 0.88 : 1);
      ev.push({ kind: 'V', seg: tk.seg, dur: D(dur), F: [...sc(F), 3500 * V.scale, 4500 * V.scale], AV: stressNext ? 1 : 0.78, stress: stressNext, contour: tk.contour, final: fin });
      if (f.nasal) ev[ev.length - 1].nasalZero = 1000 * V.scale;
      stressNext = false;
      continue;
    }
    const loc = LOCUS[f.place] || LOCUS.alveolar;
    const cF = sc([loc[0], f.place === 'velar' ? (vf[1] > 1600 ? 2200 : 1500) : (loc[1] * 0.7 + vf[1] * 0.3), loc[2], 3500, 4500]);
    const voiced = f.voice;
    const vF = [...sc(vf), 3500 * V.scale, 4500 * V.scale];
    switch (f.manner) {
      case 'stop': case 'affricate': {
        if (f.pren) ev.push({ kind: 'N', dur: cdur(50), F: [260 * V.scale, cF[1], cF[2], cF[3], cF[4]], AV: 0.5, nasalZero: NASAL_ZERO[f.place] || 1600 });
        if (f.place === 'glottal') { ev.push({ kind: 'gap', dur: cdur(45), F: cF, AV: 0 }); break; }
        ev.push({ kind: 'closure', dur: cdur(f.manner === 'affricate' ? 50 : 62), F: cF, AV: voiced ? 0.14 : 0, hard: true });
        const b = BURST[f.place] || BURST.alveolar;
        ev.push({ kind: 'burst', dur: D(f.ej ? 16 : 10), F: cF, AV: voiced ? 0.2 : 0, AF: f.ej ? 1.1 : 0.8, fr: b.r || [], by: b.by || 0, hard: true });
        if (f.manner === 'affricate') { const fr = FRIC[{ alveolar: 's', postalveolar: 'ʃ', palatal: 'ɕ', retroflex: 'ʂ' }[f.place] || 's']; ev.push({ kind: 'fric', dur: cdur(65), F: cF, AV: voiced ? 0.3 : 0, AF: 0.75, fr: fr.r || [], by: fr.by || 0 }); }
        if (f.ej) ev.push({ kind: 'gap', dur: D(38), F: cF, AV: 0, hard: true });
        else if (f.asp || (!voiced && f.place !== 'glottal')) ev.push({ kind: 'asp', dur: D(f.asp ? 55 : 16), F: vF, AV: f.asp && voiced ? 0.3 : 0, AH: f.asp ? 0.65 : 0.3 });
        break;
      }
      case 'fricative': {
        if (tk.seg === 'h') { ev.push({ kind: 'asp', dur: cdur(65), F: vF, AV: 0.05, AH: 0.7 }); break; }
        const fr = FRIC[tk.seg] || FRIC.s;
        ev.push({ kind: 'fric', dur: cdur(95), F: cF, AV: voiced ? 0.38 : 0, AF: voiced ? 0.55 : 0.85, fr: fr.r || [], by: fr.by || 0 });
        break;
      }
      case 'nasal': ev.push({ kind: 'N', dur: cdur(68), F: [260 * V.scale, cF[1], cF[2], cF[3], cF[4]], AV: 0.62, nasalZero: (NASAL_ZERO[f.place] || 1600) * V.scale }); break;
      case 'lateral':
        if (tk.seg === 'ɬ') { const fr = FRIC.ɬ; ev.push({ kind: 'fric', dur: cdur(95), F: cF, AV: 0, AF: 0.8, fr: fr.r, by: 0 }); break; }
        ev.push({ kind: 'L', dur: cdur(58), F: sc(f.place === 'velar' ? [400, 900, 2600, 3500, 4500] : f.place === 'palatal' ? [300, 2000, 2800, 3500, 4500] : [350, 1150, 2800, 3500, 4500]), AV: 0.72 });
        break;
      case 'rhotic':
        if (tk.seg === 'r') for (let k = 0; k < 3; k++) { ev.push({ kind: 'L', dur: D(22), F: sc([450, 1300, 1800, 3500, 4500]), AV: 0.66 }); ev.push({ kind: 'closure', dur: D(13), F: sc([300, 1500, 1800, 3500, 4500]), AV: 0.3, hard: true }); }
        else if (tk.seg === 'ɾ') ev.push({ kind: 'closure', dur: D(20), F: sc([300, 1600, 2500, 3500, 4500]), AV: 0.35, hard: true });
        else ev.push({ kind: 'L', dur: cdur(62), F: sc([400, 1250, 1650, 3500, 4500]), AV: 0.72 });
        break;
      case 'glide': ev.push({ kind: 'G', dur: cdur(50), F: sc(tk.seg === 'j' ? [270, 2250, 3000, 3500, 4500] : [300, 700, 2200, 3500, 4500]), AV: 0.7 }); break;
      default: ev.push({ kind: 'gap', dur: cdur(55), F: cF, AV: 0 });
    }
  }
  // time stamps
  let t = 0.03;
  for (const e of ev) { e.t0 = t; t += e.dur; e.t1 = t; }
  const total = t;
  // ---- pitch: one smooth contour of targets (time, Hz) over the utterance ----
  const base = V.f0 * pitch;
  const pts = [[0, base * 1.02]];
  const vowels = ev.filter(e => e.kind === 'V');
  const tonal = vowels.some(e => e.contour);
  for (const e of vowels) {
    const decl = 1 - 0.16 * (e.t0 / total); // declination over the utterance
    const mid = (e.t0 + e.t1) / 2;
    if (e.contour) { // tone languages: the tone letters give the shape, within the speaker's range
      const lv = [...e.contour].map(c => LEVEL[c] || 3);
      const hz = (x) => base * decl * (0.78 + 0.1 * x);
      if (lv.length === 1) pts.push([e.t0 + e.dur * 0.2, hz(lv[0])], [e.t1 - e.dur * 0.15, hz(lv[0])]);
      else lv.forEach((x, k) => pts.push([e.t0 + e.dur * (0.12 + 0.76 * k / (lv.length - 1)), hz(x)]));
      continue;
    }
    if (tonal) { pts.push([mid, base * decl]); continue; }
    if (e.final) { // phrase end: fall for statements, rise for questions
      pts.push([e.t0 + e.dur * 0.25, base * decl * (e.stress ? 1.1 : 0.98)]);
      pts.push([e.t1, base * decl * (isQ ? 1.35 : 0.78)]);
    } else pts.push([e.t0 + e.dur * 0.4, base * decl * (e.stress ? 1.16 : 0.97)]); // accent peak on stressed syllables
  }
  pts.push([total + 0.05, pts[pts.length - 1][1]]);
  return { events: ev, duration: total + 0.35, f0: pts, voice: V };
}

// ---------------------------------------------------------------- render
function resonator(f, bw, sr) {
  const T = 1 / sr;
  const C = -Math.exp(-2 * Math.PI * bw * T), B = 2 * Math.exp(-Math.PI * bw * T) * Math.cos(2 * Math.PI * f * T), A = 1 - B - C;
  return { A, B, C };
}
const smooth = (u) => u * u * (3 - 2 * u);
// value of a keyframe track [[t, value...]] at time t (smoothstep between keys)
function track(keys, t, cursor) {
  let k = cursor.k;
  while (k < keys.length - 2 && t > keys[k + 1][0]) k++;
  cursor.k = k;
  const a = keys[k], b = keys[k + 1] || a;
  const u = b[0] > a[0] ? smooth(Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0])))) : 0;
  return [a, b, u];
}
// Schroeder reverb: a small, soft room
function room(x, sr, wet = 0.11) {
  const combs = [0.0297, 0.0371, 0.0411, 0.0437].map((d, i) => ({ buf: new Float32Array(Math.round(d * sr)), i: 0, g: 0.74 - i * 0.02, lp: 0 }));
  const aps = [0.005, 0.0017].map(d => ({ buf: new Float32Array(Math.round(d * sr)), i: 0 }));
  const out = new Float32Array(x.length);
  for (let n = 0; n < x.length; n++) {
    let y = 0;
    for (const c of combs) { const v = c.buf[c.i]; c.lp = v * 0.7 + c.lp * 0.3; c.buf[c.i] = x[n] + c.lp * c.g; c.i = (c.i + 1) % c.buf.length; y += v; }
    y *= 0.25;
    for (const a of aps) { const v = a.buf[a.i]; const w = y + v * 0.5; a.buf[a.i] = w; a.i = (a.i + 1) % a.buf.length; y = v - w * 0.5; }
    out[n] = x[n] * (1 - wet * 0.5) + y * wet;
  }
  return out;
}

export function synthesize(plan, sr = 24000) {
  const n = Math.ceil(plan.duration * sr);
  const out = new Float32Array(n);
  const ev = plan.events;
  if (!ev.length) return out;
  const V = plan.voice || VOICES.low;
  // keyframe tracks: formants, voicing and breath amplitude (two keys per event, so transitions sit at boundaries;
  // closures and bursts get short edges, vowels long ones)
  const fKeys = [], aKeys = [];
  for (const e of ev) {
    const edge = Math.min(e.hard ? 0.006 : e.kind === 'V' ? 0.03 : 0.018, e.dur * 0.35);
    if (e.F) fKeys.push([e.t0 + edge, ...e.F], [e.t1 - edge, ...e.F]);
    const av = e.AV || 0, ah = e.AH || 0;
    aKeys.push([e.t0 + edge, av, ah], [e.t1 - edge, av, ah]);
  }
  if (!fKeys.length) fKeys.push([0, ...VOWEL_F.ə, 3500, 4500]);
  const BW = [70, 95, 150, 220, 300];
  let seed = 12345;
  const noise = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x3fffffff - 1; };
  const st = () => ({ y1: 0, y2: 0 });
  const casc = [0, 1, 2, 3, 4].map(st);
  const nz = { x1: 0, x2: 0 };
  const np = st();
  const fricSt = [st(), st(), st()];
  const npCoef = resonator(270, 100, sr);
  const FRAME = Math.round(sr * 0.002);
  let coef = null, fcoef = [], nzCoef = null;
  const fc = { k: 0 }, ac = { k: 0 }, pc = { k: 0 };
  let ei = 0, phase = 0, lastX = 0, tiltY = 0;
  let periodJit = 1, periodShim = 1, drift = 0;
  let AV = 0, AH = 0;
  const pts = plan.f0;
  for (let s = 0; s < n; s++) {
    const t = s / sr;
    while (ei < ev.length - 1 && t >= ev[ei].t1) ei++;
    const cur = ev[ei];
    if (s % FRAME === 0) {
      const [a, b, u] = track(fKeys, t, fc);
      const F = a.slice(1).map((x, i) => x + (b[i + 1] - x) * u);
      coef = F.map((f, i) => resonator(Math.min(f, sr * 0.45), BW[i] * (cur.kind === 'N' ? 1.5 : 1) * (i === 0 && F[0] < 350 ? 0.85 : 1), sr));
      fcoef = (cur.fr || []).map(([f, bw, g]) => ({ ...resonator(Math.min(f * V.scale, sr * 0.45), bw, sr), g }));
      nzCoef = cur.nasalZero ? resonator(cur.nasalZero, 200, sr) : null;
      const [a2, b2, u2] = track(aKeys, t, ac);
      AV = a2[1] + (b2[1] - a2[1]) * u2;
      AH = a2[2] + (b2[2] - a2[2]) * u2;
      drift = 0.012 * Math.sin(2 * Math.PI * 0.9 * t) + 0.006 * Math.sin(2 * Math.PI * 4.7 * t + 1.3); // slow, natural wander
    }
    // pitch from the contour (smoothstep between targets)
    const [p0, p1, pu] = track(pts, t, pc);
    const f0 = (p0[1] + (p1[1] - p0[1]) * pu) * (1 + drift) * periodJit;
    phase += f0 / sr;
    if (phase >= 1) { // a new glottal cycle: small random changes in length and strength (jitter, shimmer)
      phase -= 1;
      periodJit = 1 + noise() * 0.008;
      periodShim = 1 + noise() * 0.05;
    }
    // LF-like glottal flow derivative; louder voice = shorter open phase, sharper closure (brighter)
    const oq = 0.66 - 0.12 * Math.min(1, AV);
    const tp = oq * 0.72;
    let g = 0;
    if (phase < tp) g = Math.sin(Math.PI * phase / tp) * Math.exp(2.2 * (phase / tp - 1));
    else if (phase < oq) g = -Math.sin(Math.PI / 2 * (phase - tp) / (oq - tp)) * 2.6;
    const openPhase = phase < oq ? 1 : 0.25;
    let x = g * AV * periodShim * 0.09;
    // spectral tilt: softer voice is darker
    const tilt = V.tilt + 0.2 * (1 - Math.min(1, AV));
    tiltY = x * (1 - tilt) + tiltY * tilt; x = tiltY;
    // breath noise during the open phase, and aspiration
    x += noise() * (AV * V.breath * 0.06 * openPhase + AH * 0.14);
    if (nzCoef) {
      const y = npCoef.A * x + npCoef.B * np.y1 + npCoef.C * np.y2; np.y2 = np.y1; np.y1 = y;
      const z = (y - nzCoef.B * nz.x1 - nzCoef.C * nz.x2) / nzCoef.A;
      nz.x2 = nz.x1; nz.x1 = y;
      x = cur.kind === 'V' ? x * 0.65 + z * 0.35 : z * 0.5;
    }
    for (let k = 0; k < 5; k++) { const c = coef[k], q = casc[k]; const y = c.A * x + c.B * q.y1 + c.C * q.y2; q.y2 = q.y1; q.y1 = y; x = y; }
    let fr = 0;
    const AF = cur.AF || 0;
    if (AF) {
      const ramp = Math.min(1, (t - cur.t0) / 0.01, (cur.t1 - t) / 0.01);
      const nn = noise();
      fcoef.forEach((c, k) => { const q = fricSt[k]; const y = c.A * nn + c.B * q.y1 + c.C * q.y2; q.y2 = q.y1; q.y1 = y; fr += y * c.g; });
      fr += nn * (cur.by || 0) * 0.5;
      fr *= AF * 0.32 * Math.max(0, ramp);
    }
    const pre = x - 0.9 * lastX; lastX = x; // lip radiation
    out[s] = pre * 2.5 + fr;
  }
  // DC removal, gentle compression (evens out loud and soft syllables), room, normalisation
  let prevIn = 0, prevOut = 0, peak = 0;
  for (let s = 0; s < n; s++) { const y = out[s] - prevIn + 0.995 * prevOut; prevIn = out[s]; prevOut = y; out[s] = y; peak = Math.max(peak, Math.abs(y)); }
  if (peak > 0) for (let s = 0; s < n; s++) { const v = out[s] / peak; out[s] = Math.tanh(1.8 * v) / Math.tanh(1.8); }
  const wetted = room(out, sr);
  peak = 0; for (let s = 0; s < n; s++) peak = Math.max(peak, Math.abs(wetted[s]));
  if (peak > 0) for (let s = 0; s < n; s++) wetted[s] *= 0.85 / peak;
  return wetted;
}

// ---------------------------------------------------------------- system voice (optional, approximate)
// [ASSUMPTION] respelling into Spanish orthography, the most phonemic spelling among common system voices; sounds
// Spanish lacks are approximated, and tone is lost. Only voices installed on the device are offered (localService).
const RESPELL = {
  p: 'p', b: 'b', t: 't', d: 'd', k: 'k', g: 'g', q: 'k', ʔ: '', m: 'm', n: 'n', ɲ: 'ñ', ŋ: 'n', ɳ: 'n', nʲ: 'ñ',
  f: 'f', v: 'b', β: 'b', ɸ: 'f', θ: 'z', ð: 'd', s: 's', z: 's', ʃ: 'ch', ʒ: 'y', ɕ: 'ch', ʑ: 'y', ʂ: 'ch', ç: 'j', x: 'j', ɣ: 'g', χ: 'j', ʁ: 'rr', ħ: 'j', ʕ: '', h: 'j',
  ts: 'ts', dz: 'ds', tʃ: 'ch', dʒ: 'y', tɕ: 'ch', dʑ: 'y', tʂ: 'ch', tɬ: 'tl', l: 'l', ʎ: 'll', lʲ: 'll', ɫ: 'l', ɬ: 'l', r: 'rr', ɾ: 'r', rʲ: 'r', ɻ: 'r', j: 'y', w: 'u',
  ʈ: 't', ɖ: 'd', c: 'ch', ɟ: 'y', tʲ: 'ti', dʲ: 'di', sʲ: 's', ᵐb: 'mb', ⁿd: 'nd', ᵑɡ: 'ng', pʰ: 'p', tʰ: 't', kʰ: 'k', bʱ: 'b', dʱ: 'd', ɡʱ: 'g', tʼ: 't', kʼ: 'k', tˤ: 't', dˤ: 'd', sˤ: 's',
  a: 'a', e: 'e', i: 'i', o: 'o', u: 'u', ə: 'e', ɛ: 'e', ɔ: 'o', æ: 'a', ɑ: 'a', y: 'iu', ɨ: 'i', ɯ: 'u', ɤ: 'o',
  ɪ: 'i', ʏ: 'iu', ʊ: 'u',
};
const ACUTE = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
export function respell(text) {
  const words = text.split(/\s+/).filter(Boolean).map(w => parseIPA(w).filter(t => t.seg));
  // Spanish spelling has no single vowel for /ø/ or /œ/. Use the IPA voice for the utterance.
  if (words.some(word => word.some(t => t.seg === 'ø' || t.seg === 'œ'))) return null;
  return words.map(toks => {
    let out = '';
    toks.forEach((t, i) => {
      let r = RESPELL[oralVowel(t.seg)] ?? '';
      const next = toks[i + 1]?.seg;
      const beforeEI = /^[ei]/.test(RESPELL[oralVowel(next)] ?? '');
      if (r === 'k' && beforeEI) r = 'qu';
      else if (r === 'k') r = 'c';
      if (r === 'g' && beforeEI) r = 'gu';
      const prev = toks[i - 1]?.seg;
      if ((t.seg === 'j' || t.seg === 'w') && prev && SEGMENTS[prev]?.type === 'C' && next && isVowelSeg(next)) r = t.seg === 'j' ? 'i' : 'u'; // bje > bie
      if (t.stress && isVowelSeg(t.seg) && ACUTE[r[0]]) r = ACUTE[r[0]] + r.slice(1); // mark the stressed vowel, as Spanish spelling does
      out += r + (SEGMENTS[t.seg]?.nasal ? 'n' : '');
    });
    return out;
  }).join(' ');
}
export function systemVoices() {
  if (typeof speechSynthesis === 'undefined') return [];
  const rank = (v) => (/^es/i.test(v.lang) ? 0 : /^ca/i.test(v.lang) ? 1 : /^it/i.test(v.lang) ? 2 : 3); // the respelling is Spanish
  return speechSynthesis.getVoices().filter(v => v.localService && /^(es|it|pt|ca)/i.test(v.lang)).sort((a, b) => rank(a) - rank(b));
}
export function speakSystem(text, { rate = 1, pitch = 1, voiceName = null } = {}) {
  if (typeof speechSynthesis === 'undefined') return false;
  const voices = systemVoices();
  const v = voices.find(x => x.name === voiceName) || voices.find(x => /^es/i.test(x.lang)) || voices[0];
  if (!v) return false;
  speechSynthesis.cancel();
  const spelling = respell(text);
  if (spelling === null) return false;
  stopPlayback();
  const u = new SpeechSynthesisUtterance(spelling);
  u.voice = v; u.lang = v.lang; u.rate = rate * 0.95; u.pitch = pitch;
  speechSynthesis.speak(u);
  return true;
}

// ---------------------------------------------------------------- browser playback
let ctx = null, sources = [], nextAt = 0;
const audioCtx = () => { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); return ctx; };
export function stopPlayback() { for (const s of sources) { try { s.stop(); } catch { /* already finished */ } } sources = []; nextAt = 0; }
export function playSamples(samples, sr = 24000) {
  if (typeof window === 'undefined') return null;
  stopPlayback();
  return queueSamples(samples, sr);
}
// append to what is playing (gapless), so long text can start before all of it is rendered
export function queueSamples(samples, sr = 24000) {
  if (typeof window === 'undefined' || !samples.length) return null;
  const c = audioCtx();
  const buf = c.createBuffer(1, samples.length, sr);
  buf.copyToChannel(samples, 0);
  const src = c.createBufferSource();
  src.buffer = buf; src.connect(c.destination);
  const at = Math.max(c.currentTime + 0.01, nextAt);
  src.start(at);
  nextAt = at + buf.duration;
  sources.push(src);
  src.onended = () => { sources = sources.filter(x => x !== src); };
  return src;
}
export function speakIPA(text, opts = {}) {
  if (opts.engine === 'system' && speakSystem(text, opts)) return null;
  return playSamples(synthesize(planSpeech(parseIPA(text), opts)));
}
export function speakWords(lang, words, opts = {}) { return speakIPA(words.map(s => lang.ipa(s)).join(' '), opts); }
