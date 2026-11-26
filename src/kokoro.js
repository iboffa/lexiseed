// Experimental neural voice: Kokoro-82M (Apache-2.0) through kokoro-js, fed IPA directly (its tokenizer maps
// one symbol to one token, so the English text phonemizer is skipped). Sounds outside Kokoro's 115-symbol
// vocabulary are replaced by the nearest one it has; each replacement is reported so it can be judged by ear.
// The model (~92 MB, q8) is downloaded only when load() is called, and the browser caches it.
export const KOKORO_URL = 'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js';
export const KOKORO_MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';

// phonetic symbols in the Kokoro v1.0 tokenizer
const VOCAB = new Set([...'abcdefhijklmnopqrstuvwxyzæçðøŋœɐɑɒɔɕɖəɚɛɜɟɡɣɤɥɨɪɯɰɲɳɴɸɹɻɽɾʁʂʃʈʊʋʌʎʒʔʝʣʤʥʦʧʨʰʲˈˌːβθχᵊᵝᵻ', '̃', ' ', ',', '.', '?', '!', '→', '↓', '↗', '↘']);
const VOWELS = new Set('aeiouyæøœɐɑɒɔəɚɛɜɤɨɪɯʊʌᵊᵻ');

// [ASSUMPTION] nearest Kokoro symbol for each sound it lacks
const MULTI = [
  ['tʃ', 'ʧ'], ['dʒ', 'ʤ'], ['ts', 'ʦ'], ['dz', 'ʣ'], ['tɕ', 'ʨ'], ['dʑ', 'ʥ'], ['tʂ', 'ʈʂ'], ['dʐ', 'ɖʒ'],
  ['ᵐb', 'mb'], ['ⁿd', 'nd'], ['ᵑɡ', 'ŋɡ'], ['ᵑg', 'ŋɡ'], ['ⁿdʒ', 'nʤ'],
];
const SINGLE = {
  g: 'ɡ', 'ʼ': 'ʔ', 'ʱ': 'ʰ', 'ʷ': 'w', ħ: 'h', ʕ: 'ʔ', ɢ: 'ɡ', ɬ: 'hl', ɮ: 'l', ɭ: 'l', ʐ: 'ʒ', ɦ: 'h', ʀ: 'ʁ', ʑ: 'ʒ',
  ɓ: 'b', ɗ: 'd', ʄ: 'ɟ', ɠ: 'ɡ', ǃ: 'k', ǀ: 'k', ǁ: 'k', ǂ: 'k', ʘ: 'p', ʙ: 'b', ɱ: 'm', ʍ: 'w', ɧ: 'ʃ', ɵ: 'ø',
  ʉ: 'u', ɘ: 'ə', ɞ: 'ɜ', ʏ: 'y', ɶ: 'œ', ɫ: 'l', ʟ: 'l', ɺ: 'ɾ', ʡ: 'ʔ', ʜ: 'h', ʢ: 'ʔ', ɕ: 'ɕ', ʋ: 'ʋ',
};
const TONE = /[˥˦˧˨˩]+/g;
const LEVEL = { '˥': 5, '˦': 4, '˧': 3, '˨': 2, '˩': 1 };
// Kokoro's Mandarin voices were trained with tone arrows: → level, ↗ rising, ↓ low/dipping, ↘ falling
function toneArrow(c) {
  const v = [...c].map(x => LEVEL[x]);
  const a = v[0], b = v[v.length - 1], lo = Math.min(...v);
  if (v.length >= 3 && lo < a && lo < b) return '↓';
  if (b - a >= 2) return '↗';
  if (a - b >= 2) return '↘';
  return a <= 2 ? '↓' : '→';
}

// IPA (as written by lang.ipa / sentenceIPA) -> { text, subs: [[from, to]], dropped: [chars] }
export function ipaToKokoro(ipa, { tones = 'arrows' } = {}) {
  let s = ipa.replace(/[/[\]]/g, '').replace(/['’]/g, 'ˈ').normalize('NFC');
  const subs = new Map(), dropped = new Set();
  const note = (a, b) => subs.set(a, b);
  for (const [a, b] of MULTI) if (s.includes(a)) { s = s.split(a).join(b); if (!['tʃ', 'dʒ', 'ts', 'dz', 'tɕ', 'dʑ'].includes(a)) note(a, b); }
  s = s.replace(TONE, (c) => { if (tones === 'arrows') { const t = toneArrow(c); note(c, t); return t; } note(c, '∅'); return ''; });
  s = s.replace(/([→↗↓↘])([^\s.ˈˌ,|→↗↓↘]*)/g, '$2$1'); // arrows close their syllable
  s = s.replace(/\s*\|\s*/g, ', ');
  let out = '';
  let stress = '';
  for (const ch of s.normalize('NFD')) {
    if (ch === 'ˈ' || ch === 'ˌ') { stress = ch; continue; }
    if (/[\s.,;:?!‖‿→↗↓↘]/.test(ch)) stress = '';
    if (ch === '.') continue; // Kokoro reads a syllable boundary as a full stop
    const sound = VOCAB.has(ch) ? ch : SINGLE[ch];
    if (sound === undefined) { dropped.add(ch); continue; }
    if (sound !== ch && ch !== 'g') note(ch, sound);
    // Kokoro's phonemizer places stress immediately before the vowel, after any onset.
    if (stress && VOWELS.has(sound)) { out += stress; stress = ''; }
    out += sound;
  }
  // The tokenizer takes a nasal vowel as two symbols (vowel + combining tilde).
  return { text: out.replace(/\s+/g, ' ').trim(), subs: [...subs], dropped: [...dropped] };
}

let tts = null, loading = null, backend = null;
export const isLoaded = () => !!tts;
export const backendName = () => backend; // e.g. 'GPU (WebGPU, fp16)'
const READY_KEY = 'conlang-forge:kokoro-ready';
// was the model downloaded in this browser before? (then it can be warmed up in the background)
export const wasLoadedBefore = () => { try { return !!localStorage.getItem(READY_KEY); } catch { return false; } };

async function hasGPU() {
  try { return !!(typeof navigator !== 'undefined' && navigator.gpu && await navigator.gpu.requestAdapter()); } catch { return false; }
}
// a short render: compiles the GPU shaders (the first call is several times slower) and catches broken output
async function warmUp(model) {
  const { input_ids } = model.tokenizer(ipaToKokoro('ˈkasa').text, { truncation: true });
  const a = await model.generate_from_ids(input_ids, { voice: 'if_sara' });
  let peak = 0, bad = 0;
  for (const v of a.audio) { if (!Number.isFinite(v)) bad++; else peak = Math.max(peak, Math.abs(v)); }
  if (bad || peak < 0.01) throw new Error('the model produced no sound on this device');
}
// device 'auto' uses the GPU (WebGPU, fp32, ~325 MB) when there is one and falls back to the CPU (wasm, q8, ~92 MB)
export async function loadKokoro({ device = 'auto', dtype = null, onProgress = null } = {}) {
  if (tts) return tts;
  if (!loading) loading = (async () => {
    const { KokoroTTS } = await import(KOKORO_URL);
    const tries = device === 'auto' ? ((await hasGPU()) ? ['webgpu', 'wasm'] : ['wasm']) : [device];
    let err = null;
    for (const dev of tries) {
      const dt = dtype || (dev === 'webgpu' ? 'fp32' : 'q8'); // fp16 on the GPU is faster to download but sounds clearly worse
      try {
        const model = await KokoroTTS.from_pretrained(KOKORO_MODEL, { dtype: dt, device: dev, progress_callback: onProgress });
        await warmUp(model);
        tts = model; backend = dev === 'webgpu' ? `GPU (WebGPU, ${dt})` : `CPU (wasm, ${dt})`;
        try { localStorage.setItem(READY_KEY, backend); } catch { /* storage unavailable */ }
        return tts;
      } catch (e) { err = e; console.warn(`Kokoro on ${dev} failed:`, e); }
    }
    throw err || new Error('no backend');
  })().catch(e => { loading = null; throw e; });
  return loading;
}

// ---------------------------------------------------------------- voices and blends
// Kokoro's speakers, one female and one male per training language (French has only a female voice).
export const BANK = {
  it: { name: 'Italian', f: 'if_sara', m: 'im_nicola' },
  es: { name: 'Spanish', f: 'ef_dora', m: 'em_alex' },
  pt: { name: 'Portuguese', f: 'pf_dora', m: 'pm_alex' },
  fr: { name: 'French', f: 'ff_siwis', m: null },
  hi: { name: 'Hindi', f: 'hf_alpha', m: 'hm_omega' },
  ja: { name: 'Japanese', f: 'jf_alpha', m: 'jm_kumo' },
  zh: { name: 'Mandarin', f: 'zf_xiaobei', m: 'zm_yunjian' },
  en: { name: 'English', f: 'af_heart', m: 'am_michael' },
};
// [ASSUMPTION] sounds that set each training language apart (weight 1) or that it merely has (0.4); the shared
// core p t k m n s l a e i o u counts for nothing
const SIG = {
  it: [['tʃ dʒ ts dz ʎ ɲ ɛ ɔ r', 1], ['v ʃ j w', 0.4]],
  es: [['θ x β ð ɣ ɾ r ʝ ɲ', 1], ['tʃ j w', 0.4]],
  pt: [['ʒ ʎ ɐ ʁ ɾ', 1], ['ʃ ɲ ɛ ɔ v z w j', 0.4]],
  fr: [['ʁ y ø œ ɥ', 1], ['ʒ ʃ ə ɛ ɔ v z w j', 0.4]],
  hi: [['ʈ ɖ ɳ ɽ ɦ bʱ dʱ ɡʱ pʰ tʰ kʰ ʋ', 1], ['tʃ dʒ ŋ ə ʃ', 0.4]],
  ja: [['ɸ ɕ ʑ tɕ dʑ ɯ ç ɾ', 1], ['ts j w', 0.4]],
  zh: [['ʂ ʐ tʂ ɕ tɕ ɤ ɻ x', 1], ['ts y ŋ pʰ tʰ kʰ ə w j', 0.4]],
  en: [['θ ð ɹ æ ʌ ɪ ʊ', 1], ['h dʒ tʃ ŋ z v w ʃ ə', 0.4]],
};
const NASAL_V = /[ãẽĩõũɛ̃ɔ̃]|̃/;
const SIGMAP = Object.fromEntries(Object.entries(SIG).map(([l, arr]) => [l, Object.fromEntries(arr.flatMap(([str, w]) => str.split(' ').map(x => [x, w])))]));

// Which training languages does this language sound most like? -> [{ lang, voice, weight }] (weights sum to 1)
// gender 'f' | 'm'. mode 'adaptive' (2-3 closest, weighted) | 'neutral' (all, equal) | a single voice id.
export function chooseBlend(ph, { gender = 'f', mode = 'adaptive' } = {}) {
  const avail = Object.entries(BANK).filter(([, b]) => b[gender]);
  if (mode && mode !== 'adaptive' && mode !== 'neutral') {
    const hit = Object.entries(BANK).find(([, b]) => b.f === mode || b.m === mode);
    return [{ lang: hit?.[0] || '?', name: hit?.[1].name || mode, voice: mode, weight: 1 }];
  }
  if (mode === 'neutral') return avail.map(([l, b]) => ({ lang: l, name: b.name, voice: b[gender], weight: 1 / avail.length }));
  const freq = ph?.freq || {};
  const total = Object.values(freq).reduce((a, b) => a + b, 0) || 1;
  const score = {};
  for (const [l] of avail) {
    let s = 0.02;
    for (const [seg, n] of Object.entries(freq)) s += (SIGMAP[l][seg.replace(/[ː1-6]/g, '')] || 0) * Math.sqrt(n / total);
    score[l] = s;
  }
  // syllable shape: open syllables (Japanese, Italian, Spanish) vs heavy clusters and codas (English, French)
  const open = !(ph?.codaSet?.length) || (ph.codaCap || 0) === 0;
  if (open) { for (const l of ['ja', 'it', 'es']) if (score[l] != null) score[l] += 0.15; }
  else if ((ph.codaCap || 0) >= 2 || (ph.onsetCap || 0) >= 3) { for (const l of ['en', 'fr']) if (score[l] != null) score[l] += 0.12; }
  if ((ph?.vowels || []).some(v => NASAL_V.test(v))) { for (const l of ['pt', 'fr', 'hi']) if (score[l] != null) score[l] += 0.15; }
  if (ph?.longVowels) { for (const l of ['hi', 'ja']) if (score[l] != null) score[l] += 0.05; }
  const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]);
  let top = ranked.slice(0, 3);
  const sum = (arr) => arr.reduce((a, [, v]) => a + v, 0);
  let w = top.map(([l, v]) => [l, v / sum(top)]).filter(([, v]) => v >= 0.18);
  w = w.map(([l, v]) => [l, v / w.reduce((a, [, x]) => a + x, 0)]);
  // tones only come through a Mandarin speaker
  if (ph?.toneCount) {
    w = w.filter(([l]) => l !== 'zh').map(([l, v]) => [l, v * 0.35]);
    const rest = w.reduce((a, [, v]) => a + v, 0);
    w = [['zh', 1 - rest], ...w];
    const keep = w.filter(([l, v]) => l === 'zh' || v >= 0.1);
    const t = keep.reduce((a, [, v]) => a + v, 0);
    w = keep.map(([l, v]) => [l, v / t]);
  }
  return w.map(([l, v]) => ({ lang: l, name: BANK[l].name, voice: BANK[l][gender], weight: Math.round(v * 100) / 100 }));
}
export const describeBlend = (blend) => blend.map(b => `${b.name} ${Math.round(b.weight * 100)}%`).join(' / ');

const voiceCache = new Map();
async function voiceData(id) {
  if (voiceCache.has(id)) return voiceCache.get(id);
  const url = `https://huggingface.co/${KOKORO_MODEL}/resolve/main/voices/${id}.bin`;
  const p = (async () => {
    let cache = null;
    try { cache = await caches.open('kokoro-voices'); const hit = await cache.match(url); if (hit) return new Float32Array(await hit.arrayBuffer()); } catch { cache = null; }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`voice ${id}: HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    try { await cache?.put(url, new Response(buf.slice(0))); } catch { /* cache full or unavailable */ }
    return new Float32Array(buf);
  })();
  voiceCache.set(id, p);
  p.catch(() => voiceCache.delete(id));
  return p;
}
async function blendData(blend) {
  const parts = await Promise.all(blend.map(b => voiceData(b.voice)));
  if (parts.length === 1) return parts[0];
  const out = new Float32Array(parts[0].length);
  parts.forEach((arr, k) => { const w = blend[k].weight; for (let i = 0; i < out.length; i++) out[i] += w * arr[i]; });
  return out;
}

// Kokoro pauses at commas and full stops by itself, so text is split only to start playback sooner and to stay
// under its ~510-symbol limit: a short first chunk, then chunks of up to ~220 characters at phrase breaks.
function chunks(text) {
  const parts = text.split(/(?<=[,|;:?!‖])\s*/).map(p => p.trim()).filter(p => p.replace(/[\s,|;:?!‖/]/g, ''));
  const out = [];
  for (let p of parts) {
    while (p.length > 220) { const cut = p.lastIndexOf(' ', 220); const at = cut > 40 ? cut : 220; out.push(p.slice(0, at)); p = p.slice(at).trim(); }
    if (!p) continue;
    const last = out[out.length - 1];
    if (out.length >= 2 && last.length + p.length < 220) out[out.length - 1] = last + ' ' + p;
    else if (out.length === 1 && last.length < 40 && last.length + p.length < 120) out[0] = last + ' ' + p;
    else out.push(p);
  }
  return out;
}

// one model call at a time (prefetches and clicks share the model)
let chain = Promise.resolve();
const serial = (fn) => { const r = chain.then(fn, fn); chain = r.catch(() => {}); return r; };

async function renderChunk(text, style, speed, tones) {
  const { text: k } = ipaToKokoro(text, { tones });
  if (!k.replace(/[\s,.?!]/g, '')) return new Float32Array(0);
  return serial(async () => {
    const { input_ids } = tts.tokenizer(k, { truncation: true });
    const T = input_ids.constructor;
    const off = 256 * Math.min(Math.max(input_ids.dims.at(-1) - 2, 0), 509);
    const { waveform } = await tts.model({ input_ids, style: new T('float32', style.slice(off, off + 256), [1, 256]), speed: new T('float32', [speed], [1]) });
    return waveform.data;
  });
}
const SR = 24000;
const level = (x) => { let p = 0; for (const v of x) p = Math.max(p, Math.abs(v)); if (p > 0.9) for (let i = 0; i < x.length; i++) x[i] *= 0.9 / p; return x; }; // some voices clip

const audioCache = new Map(), inflight = new Map();
const keyOf = (blend, speed, tones, ipa) => `${blend.map(b => b.voice + ':' + b.weight).join('+')}|${speed}|${tones}|${ipa}`;
export const isCached = (ipa, { voice, speed = 1, tones = 'arrows' }) => audioCache.has(keyOf(typeof voice === 'string' ? [{ voice, weight: 1 }] : voice, speed, tones, ipa));

// Render IPA with a voice id or a blend [{ voice, weight }]. onChunk(samples, sr, index) is called as each piece is
// ready, so playback can start early; isCurrent() === false stops rendering. Returns { samples, sr, ms, cached }.
export async function kokoroSay(ipa, { voice = 'if_sara', speed = 1, tones = 'arrows', onChunk = null, isCurrent = () => true } = {}) {
  if (!tts) throw new Error('Kokoro is not loaded');
  const blend = typeof voice === 'string' ? [{ voice, weight: 1 }] : voice;
  const key = keyOf(blend, speed, tones, ipa);
  const t0 = performance.now();
  if (audioCache.has(key)) { const r = audioCache.get(key); onChunk?.(r.samples, r.sr, 0); return { ...r, ms: 0, cached: true }; }
  if (inflight.has(key)) { const r = await inflight.get(key); if (r) { onChunk?.(r.samples, r.sr, 0); return r; } }
  const job = (async () => {
    const style = await blendData(blend);
    const gap = new Float32Array(Math.round(SR * 0.12));
    const parts = [];
    let i = 0;
    for (const c of chunks(ipa.replace(/^\/|\/$/g, ''))) {
      if (!isCurrent()) return null;
      const wav = level(await renderChunk(c, style, speed, tones));
      if (!wav.length) continue;
      if (parts.length) parts.push(gap);
      parts.push(wav);
      if (isCurrent() && onChunk) { let out = wav; if (i) { out = new Float32Array(gap.length + wav.length); out.set(wav, gap.length); } onChunk(out, SR, i); }
      i++;
    }
    const samples = new Float32Array(parts.reduce((a, p) => a + p.length, 0));
    let o = 0; for (const p of parts) { samples.set(p, o); o += p.length; }
    const res = { samples, sr: SR };
    audioCache.set(key, res);
    if (audioCache.size > 150) audioCache.delete(audioCache.keys().next().value);
    return { ...res, ms: performance.now() - t0, cached: false };
  })();
  if (!onChunk) { inflight.set(key, job); job.finally(() => inflight.delete(key)); }
  return job;
}

// render ahead (on hover): only when the model is idle and the text is short
let prefetching = false;
export function prefetch(ipa, opts) {
  if (!tts || prefetching || ipa.length > 120 || isCached(ipa, opts)) return;
  prefetching = true;
  kokoroSay(ipa, opts).catch(() => {}).finally(() => { prefetching = false; });
}
