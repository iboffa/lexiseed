// UI wiring. All randomness of the language comes from the seed; Math.random() is used only to propose a new seed.
import { generate, VERSION } from './language.js';
import { FAMILIES, FAMILY_ORDER } from './data/families.js';
import { SCRIPT_LIST } from './scripts.js';
import { renderShowcase, renderGrammar, vocabRows, native, esc, interlinear, speakBtn, sentenceIPA } from './render.js';
import { translate, addUserWord } from './translate.js';
import { speakIPA, systemVoices, respell, playSamples, queueSamples, stopPlayback } from './speech.js';
import { BANK, chooseBlend, describeBlend, loadKokoro, isLoaded, kokoroSay, prefetch, wasLoadedBefore, backendName } from './kokoro.js';
import { QUIRKS } from './quirks.js';
import { contactEditor } from './contact-controls.js';

const $ = (s) => document.querySelector(s);
const form = $('#controls');
const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
const SLIDERS = ['vowelPct', 'wordLen', 'complexity', 'caseCount', 'drift', 'irregularity'];
const SELECTS = ['family', 'tone', 'harmony', 'caseOn', 'morph', 'order', 'alignment', 'gender', 'number', 'articles', 'tam', 'script', 'scriptType', 'scriptStyle', 'quirks', 'ancestry', 'comparative', 'superlative'];
let lang = null;
let generatedInputs = {};
let currentTab = 'showcase';
const rendered = {};

// ---------- setup ----------
$('#family').innerHTML = FAMILY_ORDER.map(f => `<option value="${f}">${esc(FAMILIES[f].name)}</option>`).join('');
$('#script').innerHTML = `<option value="auto">Family default</option>` + SCRIPT_LIST.map(([id, n]) => `<option value="${id}">${esc(n)}</option>`).join('');

const degreeOptions = [['auto', 'Auto'], ['particle', 'Separate word'], ['prefix', 'Prefix'], ['suffix', 'Suffix'], ['unmarked', 'Unmarked']];
$('#degreeControls').innerHTML = ['comparative', 'superlative'].map(key =>
  `<label class="row"><span>${key === 'comparative' ? 'Comparative' : 'Superlative'}</span><select name="${key}">${degreeOptions.map(([v, label]) => `<option value="${v}">${label}</option>`).join('')}</select></label>`
).join('');
$('#featureControls').innerHTML = Object.entries(QUIRKS).map(([id, q]) =>
  `<label class="row"><span>${esc(q.name)}</span><select data-feature="${id}"><option value="auto">Auto</option><option value="on">On</option><option value="off">Off</option></select></label>`
).join('');
const featureSelects = [...form.querySelectorAll('[data-feature]')];
let legacyInfluence = null;
const blend = contactEditor(form, () => { legacyInfluence = null; schedule(); });

function readControls() {
  const c = { family: form.family.value };
  for (const n of SELECTS) if (n !== 'family') c[n] = form[n].value;
  if (legacyInfluence) Object.assign(c, legacyInfluence);
  for (const n of SLIDERS) {
    const box = document.querySelector(`.ctl[data-name="${n}"]`);
    const auto = box.querySelector('input[type=checkbox]').checked;
    c[n] = auto ? 'auto' : Number(box.querySelector('input[type=range]').value);
  }
  const features = {};
  for (const sel of featureSelects) if (sel.value !== 'auto') features[sel.dataset.feature] = sel.value;
  if (Object.keys(features).length) c.features = features;
  const contacts = blend.read();
  if (!legacyInfluence && contacts.length) c.contacts = contacts;
  return c;
}

function writeControls(c) {
  form.family.value = Object.hasOwn(FAMILIES, c.family) ? c.family : 'original';
  legacyInfluence = !c.contacts && c.influence && c.influence !== 'none' && c.influence !== 'auto'
    ? { influence: c.influence, influenceLevel: c.influenceLevel || 'light' } : null;
  blend.write(Array.isArray(c.contacts) ? c.contacts : []);
  for (const sel of featureSelects) sel.value = c.features?.[sel.dataset.feature] || 'auto';
  for (const n of SELECTS) if (n !== 'family') form[n].value = c[n] ?? 'auto';
  for (const n of SLIDERS) {
    const box = document.querySelector(`.ctl[data-name="${n}"]`);
    const auto = c[n] === undefined || c[n] === 'auto';
    box.querySelector('input[type=checkbox]').checked = auto;
    if (!auto) box.querySelector('input[type=range]').value = c[n];
  }
}

// ---------- URL state ----------
function toHash(c, seed) {
  const p = new URLSearchParams();
  p.set('seed', seed);
  for (const [k, v] of Object.entries(c)) if (v !== 'auto' && v !== '' && v !== undefined && !(k === 'influenceLevel' && (!c.influence || c.influence === 'auto'))) p.set(k, typeof v === 'object' ? JSON.stringify(v) : v);
  return '#' + p.toString();
}
function fromHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  if (!p.has('seed')) return null;
  const c = {};
  for (const [k, v] of p.entries()) {
    if (k === 'contacts' || k === 'features') {
      try {
        const parsed = JSON.parse(v);
        if (k === 'contacts' && Array.isArray(parsed)) c.contacts = parsed.filter(row => row && typeof row === 'object');
        if (k === 'features' && parsed && typeof parsed === 'object') c.features = parsed;
      } catch { /* Ignore a truncated structured parameter in a shared link. */ }
    } else if (k !== 'seed') c[k] = SLIDERS.includes(k) ? Number(v) : v;
  }
  return { seed: p.get('seed'), c };
}

// ---------- generate + render ----------
function run() {
  clearTimeout(timer);
  const invalid = form.querySelector('input:invalid, select:invalid');
  $('#controlError').hidden = true;
  $('#contactSummary').classList.remove('control-error');
  if (invalid) {
    $('#contactSummary').textContent = invalid.validationMessage;
    $('#contactSummary').classList.add('control-error');
    $('#copyLink').disabled = true;
    return;
  }
  const c = readControls();
  const seed = $('#seed').value.trim() || '0';
  const input = { ...c };
  if (input.script === 'auto') delete input.script;
  try {
    lang = generate(input, seed);
  } catch (e) {
    console.error(e);
    $('#controlError').textContent = e.message;
    $('#controlError').hidden = false;
    $('#copyLink').disabled = true;
    return;
  }
  $('#copyLink').disabled = false;
  generatedInputs = c;
  history.replaceState(null, '', toHash(c, seed));
  loadUserWords();
  syncPanel(c);
  for (const k of Object.keys(rendered)) delete rendered[k];
  show(currentTab);
  updateNeuralNote();
}

function syncPanel(c) {
  const ctl = lang.controls;
  $('#familyBlurb').textContent = FAMILIES[ctl.family].blurb;
  for (const n of SLIDERS) {
    const box = document.querySelector(`.ctl[data-name="${n}"]`);
    const auto = c[n] === 'auto';
    box.classList.toggle('is-auto', auto);
    const range = box.querySelector('input[type=range]');
    if (auto) range.value = ctl[n];
    box.querySelector('output').textContent = (n === 'vowelPct' || n === 'irregularity') ? ctl[n] + '%' : n === 'wordLen' ? Number(ctl[n]).toFixed(1) : ctl[n];
    const ms = box.querySelector('.measured');
    if (ms && n === 'vowelPct') { const v = lang.measured.vowelPct; ms.textContent = `measured ${v.toFixed(0)}% of sounds in the vocabulary`; ms.classList.toggle('off', Math.abs(v - ctl[n]) > 4); }
    if (ms && n === 'wordLen') { const v = lang.measured.meanSyllables; ms.textContent = `measured ${v.toFixed(2)} syllables, ${lang.measured.meanSegments.toFixed(1)} sounds per word`; ms.classList.toggle('off', Math.abs(v - ctl[n]) > 0.35); }
  }
  document.querySelector('.ctl[data-name="caseCount"]').style.display = ctl.caseOn ? '' : 'none';
  // show resolved auto values in selects
  for (const n of SELECTS) {
    if (n === 'family') continue;
    const sel = form[n];
    const autoOpt = sel.querySelector('option[value="auto"]');
    if (!autoOpt) continue;
    const val = n === 'script' ? ctl.script : n === 'scriptType' ? (lang.script.type || '–') : n === 'scriptStyle' ? (lang.script.system || '–') : ctl[n];
    const label = sel.querySelector(`option[value="${String(val)}"]`)?.textContent ?? String(val);
    autoOpt.textContent = `Auto (${label.replace(/^Yes: |^No: /, '')})`;
  }
  $('#driftRow').style.display = ctl.ancestry === 'real' ? '' : 'none';
  $('#ancestryRow').style.display = lang.descent || ctl.ancestry === 'real' || FAMILIES[ctl.family] && ctl.family !== 'original' ? '' : 'none';
  if (lang.descent) $('#driftRow .measured').textContent = `${ctl.drift <= 15 ? 'barely changed from' : ctl.drift < 80 ? 'part of the way from' : ctl.drift === 80 ? 'as far as a real daughter of' : 'further than any real daughter of'} ${lang.descent.path.protoName}; closest to ${lang.descent.path.anchorName}`;
  const contacts = lang.contacts || [];
  if (legacyInfluence && lang.descent?.influence) {
    const old = lang.descent.influence;
    const share = Math.round(100 * lang.lex.entries.filter(e => e.borrowed).length / (lang.contactRootCount || lang.lex.entries.length));
    blend.write([{ family: old.family, percent: share, yearsAgo: old.totalSteps ? Math.round(3000 * (1 - old.contactStep / old.totalSteps)) : 0 }]);
  }
  $('#contactSummary').textContent = contacts.length
    ? `${lang.lex.entries.filter(e => e.borrowed).length} borrowed roots out of ${lang.contactRootCount}.`
    : legacyInfluence && lang.descent?.influence ? 'This seed uses the earlier contact model. Edit a share or date to use the blend.' : '';
  for (const sel of featureSelects) {
    const active = lang.quirks.includes(sel.dataset.feature);
    sel.options[0].textContent = `Auto (${active ? 'on' : 'off'})`;
  }
  const { count, total } = lang.morph.irregularVerbs;
  form.querySelector('[data-name="irregularity"] .measured').textContent = `${count} of ${total} verbs have exceptional forms`;
  const conflicts = lang.notes.filter(n => n.feature);
  $('#featureWarning').hidden = !conflicts.length;
  $('#featureWarning').textContent = conflicts.map(n => n.text).join(' ');
  $('#scriptTypeRow').style.display = ctl.script === 'original' ? '' : 'none';
  $('#scriptStyleRow').style.display = ctl.script === 'original' ? '' : 'none';
}

function show(tab) {
  currentTab = tab;
  for (const button of tabs) {
    const selected = button.dataset.tab === tab;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  }
  document.querySelectorAll('.tab-panel').forEach(p => { p.hidden = p.id !== 'tab-' + tab; });
  if (!lang || rendered[tab]) return;
  rendered[tab] = true;
  if (tab === 'showcase') $('#tab-showcase').innerHTML = renderShowcase(lang);
  if (tab === 'grammar') $('#tab-grammar').innerHTML = renderGrammar(lang);
  if (tab === 'vocab') renderVocab();
  if (tab === 'explore') renderExplore();
  if (tab === 'translate') doTranslate();
  if (tab === 'recipe') renderRecipe();
}

// ---------- vocabulary ----------
let vocabCache = null;
function renderVocab() {
  vocabCache = vocabRows(lang);
  drawVocab();
}
function drawVocab() {
  if (!vocabCache) return;
  const q = $('#vocabSearch').value.trim().toLowerCase();
  const pos = $('#vocabPos').value;
  const sort = $('#vocabSort').value;
  let rows = vocabCache.filter(r => (!q || r.en.toLowerCase().includes(q) || r.rom.toLowerCase().includes(q) || r.roots?.some(g => g.toLowerCase().includes(q))) && (!pos || (pos === 'other' ? !['n', 'v', 'adj', 'num', 'pron', 'art'].includes(r.pos) : r.pos === pos)));
  if (sort === 'en') rows = rows.slice().sort((a, b) => a.en.localeCompare(b.en));
  if (sort === 'native') rows = rows.slice().sort((a, b) => a.rom.localeCompare(b.rom));
  const own = lang.script.id !== 'latin';
  const POS = { n: 'noun', v: 'verb', adj: 'adj.', adv: 'adv.', num: 'num.', conj: 'conj.', part: 'particle', q: 'question', dem: 'dem.', pron: 'pronoun', art: 'article' };
  $('#vocabTable').innerHTML = `<p class="muted">${rows.length} of ${vocabCache.length} words.</p><div class="scroll"><table class="data"><tr><th>English</th>${own ? '<th>Script</th>' : ''}<th>Word</th><th>IPA</th><th>Type</th><th>Notes</th></tr>${rows.map(r => `<tr><td>${esc(r.en)}</td>${own ? `<td>${native(lang, r.segs, { size: 20 })}</td>` : ''}<td><b>${esc(r.rom)}</b>${r.isNew ? ' <span class="badge">new</span>' : ''}</td><td class="ipa">${esc(r.ipa)} ${speakBtn(r.ipa)}</td><td class="n">${esc(POS[r.pos] || r.pos)}${r.gender ? ', ' + esc(r.gender) : ''}</td><td class="n">${esc(r.note)}</td></tr>`).join('')}</table></div>`;
}
['vocabSearch', 'vocabPos', 'vocabSort'].forEach(id => $('#' + id).addEventListener('input', drawVocab));
$('#csv').addEventListener('click', () => {
  if (!vocabCache) renderVocab();
  const lines = [['english', 'word', 'ipa', 'type', 'gender', 'notes'], ...vocabCache.map(r => [r.en, r.rom, r.ipa, r.pos, r.gender, r.note])];
  const csv = lines.map(l => l.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
  download(`${lang.name.exonym}-vocabulary.csv`, csv, 'text/csv');
});

// ---------- translate ----------
// coined words are kept per language (recipe) in this browser; re-coining them in the same order rebuilds them exactly
const userKey = () => 'conlang-forge:words:' + location.hash.replace(/&?quirks=[^&]*/, '');
function loadUserWords() {
  let list = [];
  try { list = JSON.parse(localStorage.getItem(userKey()) || '[]'); } catch { list = []; }
  for (const w of list) addUserWord(lang, w.en, w.pos);
}
function saveUserWords() {
  try { localStorage.setItem(userKey(), JSON.stringify((lang.userWords || []).map(e => ({ en: e.gloss, pos: e.pos })))); } catch { /* storage unavailable: words last until reload */ }
}
function doTranslate() {
  const text = $('#trIn').value;
  lang.translatePolite = $('#trPolite').checked;
  const r = translate(lang, text);
  saveUserWords();
  vocabCache = null; delete rendered.vocab;
  const blocks = r.sentences.filter(s => s.words.length).map(s => interlinear(lang, { words: s.words, en: s.en, q: s.q })).join('');
  const coined = r.coined.length ? `<p class="notes"><b>New words:</b> ${r.coined.map(e => `${native(lang, e.segs, { size: 18 })} <b>${esc(lang.romanize(e.segs))}</b> ‘${esc(e.gloss)}’ ${speakBtn(lang.ipa(e.segs))}`).join(' · ')}</p>` : '';
  const skipped = r.dropped?.length ? `<p class="notes"><b>Not translated:</b> ${r.dropped.map(d => `‘${esc(d)}’`).join(', ')} <span class="muted">(no equivalent in the language's grammar yet)</span></p>` : '';
  $('#trOut').innerHTML = coined + skipped + (blocks || '<p class="muted">Nothing to translate.</p>');
}
$('#trGo').addEventListener('click', doTranslate);
$('#trIn').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) doTranslate(); });
$('#trPolite').addEventListener('change', doTranslate);
$('#trClear').addEventListener('click', () => { try { localStorage.removeItem(userKey()); } catch { /* ignore */ } run(); show('translate'); });
const speechOpts = () => ({ rate: Number($('#rate').value), pitch: Number($('#pitch').value), voice: $('#preset').value, engine: $('#engine').value, voiceName: $('#sysVoice').value || null });
// voice choices are a per-viewer convenience, kept in this browser
const VOICE_KEY = 'conlang-forge:voice';
$('#neuralVoice').insertAdjacentHTML('beforeend', Object.values(BANK).flatMap(b => [b.f && `<option value="${b.f}">${esc(b.name)}, female</option>`, b.m && `<option value="${b.m}">${esc(b.name)}, male</option>`]).filter(Boolean).join(''));
function loadVoicePrefs() {
  try {
    const v = JSON.parse(localStorage.getItem(VOICE_KEY) || '{}');
    if (v.v !== 2) v.engine = 'neural'; // the neural voice became the default in this version
    for (const id of ['engine', 'preset', 'rate', 'pitch', 'neuralVoice']) if (v[id] != null) $('#' + id).value = v[id];
  } catch { /* storage unavailable */ }
}
function saveVoicePrefs() { try { localStorage.setItem(VOICE_KEY, JSON.stringify({ v: 2, engine: $('#engine').value, preset: $('#preset').value, rate: $('#rate').value, pitch: $('#pitch').value, sysVoice: $('#sysVoice').value, neuralVoice: $('#neuralVoice').value })); } catch { /* storage unavailable */ } }
const neuralGender = () => ($('#preset').value === 'low' ? 'm' : 'f');
const currentBlend = () => chooseBlend(lang?.ph, { gender: neuralGender(), mode: $('#neuralVoice').value });
function updateNeuralNote() {
  const el = document.querySelector('#neuralNote');
  if (!el || !lang) return;
  el.textContent = `Speaker for ${lang.name.exonym}: ${describeBlend(currentBlend())}${$('#preset').value === 'child' ? ' (Kokoro has no child voice; the female speakers are used)' : ''}.${isLoaded() ? ` Running on the ${backendName()}.` : ' The model downloads on the first ▶ (about 325 MB with a GPU, 92 MB without; once).'}`;
}
function refreshVoices() {
  const vs = systemVoices();
  const engine = $('#engine').value;
  const sys = engine === 'system', neural = engine === 'neural';
  $('#sysVoice').innerHTML = vs.map(v => `<option value="${esc(v.name)}">${esc(v.name)} (${esc(v.lang)})</option>`).join('');
  try { const v = JSON.parse(localStorage.getItem(VOICE_KEY) || '{}'); if (v.sysVoice && vs.some(x => x.name === v.sysVoice)) $('#sysVoice').value = v.sysVoice; } catch { /* ignore */ }
  $('#sysRow').hidden = !sys || !vs.length;
  $('#presetRow').hidden = sys;
  $('#neuralRow').hidden = !neural;
  $('#neuralNote').hidden = !neural;
  $('#pitchRow').hidden = neural; // Kokoro has no pitch control
  $('#presetLabel').textContent = neural ? 'Voice (low = male speakers)' : 'Built-in voice';
  $('#sysNote').hidden = !sys;
  const spelling = respell($('#ipaIn').value);
  if (!vs.length) $('#sysNote').textContent = 'No Spanish, Italian or Portuguese voice is installed on this device, so the built-in voice is used. On macOS add one in System Settings › Accessibility › Spoken Content; on Windows in Settings › Time & language › Speech.';
  else if (spelling === null) $('#sysNote').textContent = 'The built-in IPA voice reads this text to preserve its rounded vowel.';
  else $('#sysNote').textContent = `The system voice reads a respelling, for example: ${spelling}`;
  updateNeuralNote();
}
loadVoicePrefs();
if (typeof speechSynthesis !== 'undefined') speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
refreshVoices();
['engine', 'preset', 'rate', 'pitch', 'sysVoice', 'neuralVoice'].forEach(id => $('#' + id).addEventListener('change', () => { saveVoicePrefs(); refreshVoices(); }));
$('#ipaIn').addEventListener('input', () => { if ($('#engine').value === 'system') refreshVoices(); });

// neural playback: load on first use, render (cached), and play only the most recent request
let toastTimer = null;
function toast(msg, ms = 0) {
  const t = $('#voiceToast');
  clearTimeout(toastTimer);
  if (!msg) { t.hidden = true; return; }
  t.textContent = msg; t.hidden = false;
  if (ms) toastTimer = setTimeout(() => { t.hidden = true; }, ms);
}
let speakSeq = 0;
async function speak(ipa, btn = null) {
  const opts = speechOpts();
  if (opts.engine !== 'neural') { speakIPA(ipa, opts); return; }
  const my = ++speakSeq;
  btn?.classList.add('busy');
  try {
    if (!isLoaded()) {
      const files = {};
      toast('Loading the neural voice…');
      await loadKokoro({ onProgress: (p) => {
        if (p.file && p.total) files[p.file] = [p.loaded || 0, p.total];
        const [l, t] = Object.values(files).reduce((a, [x, y]) => [a[0] + x, a[1] + y], [0, 0]);
        if (t > 5e6) toast(`Downloading the neural voice: ${(l / 1e6).toFixed(0)} of ${(t / 1e6).toFixed(0)} MB (once; your browser keeps it)`);
        else if (p.status === 'ready') toast('Preparing the neural voice…');
      } });
      updateNeuralNote();
    }
    toast(null);
    if (my !== speakSeq) return;
    stopPlayback();
    // play each piece as soon as it is rendered
    await kokoroSay(ipa, { voice: currentBlend(), speed: opts.rate, isCurrent: () => my === speakSeq, onChunk: (samples, sr, i) => { if (my === speakSeq) (i ? queueSamples : playSamples)(samples, sr); } });
  } catch (e) {
    console.error(e);
    toast(`The neural voice could not be used (${e.message}); the built-in voice reads instead.`, 6000);
    if (my === speakSeq) speakIPA(ipa, { ...opts, engine: 'builtin' });
  } finally { btn?.classList.remove('busy'); }
}
$('#ipaGo').addEventListener('click', () => speak($('#ipaIn').value, $('#ipaGo')));
// render a word while the pointer rests on its ▶, so the click plays at once
document.addEventListener('pointerover', (e) => {
  const b = e.target.closest?.('button.speak[data-ipa]');
  if (b && $('#engine').value === 'neural' && isLoaded()) prefetch(b.dataset.ipa, { voice: currentBlend(), speed: Number($('#rate').value) });
});
// a browser that has the model already warms it up in the background
if (wasLoadedBefore() && $('#engine').value === 'neural') { const warm = () => loadKokoro().then(updateNeuralNote).catch(() => {}); if (window.requestIdleCallback) requestIdleCallback(warm, { timeout: 3000 }); else setTimeout(warm, 1500); }
document.addEventListener('click', (e) => { const b = e.target.closest('button.speak[data-ipa]'); if (b) { e.preventDefault(); speak(b.dataset.ipa, b); } });

// ---------- explore ----------
function renderExplore() {
  const c = generatedInputs;
  const input = { ...c }; if (input.script === 'auto') delete input.script;
  const base = lang.seed;
  const seeds = Array.from({ length: 12 }, (_, i) => i === 0 ? base : `${base}-${i}`);
  const cards = seeds.map(s => {
    const L = generate(input, s);
    const ex = L.examples.general.basic;
    const words = ['water', 'fire', 'mother', 'sun', 'king'].map(g => L.romanize(L.lex.byGloss[g].segs)).join(', ');
    return `<button class="card" data-seed="${esc(s)}"><span class="seedtag">seed ${esc(s)}</span><h3>${esc(L.name.exonym)}</h3><div>${native(L, L.name.segs, { size: 24 })}</div><p class="s">${esc(ex.words.map(w => L.romanize(w.segs)).join(' '))}</p><p class="muted">‘The man sees the dog.’</p><p>${esc(words)}</p><p class="muted">${esc(L.controls.order)} · ${esc(L.controls.morph)} · ${L.morph.cases.length} cases · ${L.ph.consonants.length}C/${L.ph.vowels.length}V</p></button>`;
  }).join('');
  $('#tab-explore').innerHTML = `<h2>Sister languages</h2><p class="muted">Twelve seeds with your current settings. Click one to open it. The words for water, fire, mother, sun and king are shown for comparison.</p><div class="contact">${cards}</div>`;
  $('#tab-explore').querySelectorAll('.card').forEach(b => b.addEventListener('click', () => { $('#seed').value = b.dataset.seed; run(); show('showcase'); }));
}

// ---------- recipe ----------
function recipe() {
  return {
    generator: 'conlang-forge', version: VERSION, seed: lang.seed,
    inputs: generatedInputs, controls: lang.controls, autoControls: Object.keys(lang.auto),
    measured: { vowelPct: +lang.measured.vowelPct.toFixed(1), meanSyllables: +lang.measured.meanSyllables.toFixed(2), homophoneRejections: lang.measured.homophoneRejections, glyphCollisions: lang.measured.glyphCollisions },
    name: lang.name.exonym,
    phonology: { consonants: lang.ph.consonants, vowels: lang.ph.vowels, stress: lang.ph.stress, tones: lang.ph.toneCount },
    soundChanges: lang.cascade.rules.map(r => r.id),
    cases: lang.morph.cases,
    quirks: lang.quirks,
    script: lang.script.id === 'original' ? { system: lang.script.system, type: lang.script.type } : lang.script.id,
    contacts: (lang.contacts || []).map(({ loans, ...contact }) => ({ ...contact, rootCount: Object.keys(loans).length })),
    lexicon: lang.lex.entries.map(e => ({
      gloss: e.gloss, form: lang.romanize(e.segs), ipa: lang.ipa(e.segs),
      ...(e.loan ? { loan: e.loan } : {}), ...(e.deriv ? { derivation: e.deriv } : {}),
    })),
    pronouns: lang.pronouns, articles: lang.morph.articles,
    coinedWords: (lang.userWords || []).map(e => ({ english: e.gloss, pos: e.pos, form: lang.romanize(e.segs), ipa: lang.ipa(e.segs) })),
  };
}
function renderRecipe() {
  const r = recipe();
  $('#tab-recipe').innerHTML = `<h2>Recipe</h2><p>The same generator version, seed and controls always rebuild this language exactly. Share the link or keep this file.</p>
  <div class="actions"><button type="button" id="dlJson">Download JSON</button></div>
  <pre class="recipe">${esc(JSON.stringify({ ...r, lexicon: `[${r.lexicon.length} entries in the download]` }, null, 2))}</pre>`;
  $('#dlJson').addEventListener('click', () => download(`${lang.name.exonym}-recipe.json`, JSON.stringify(recipe(), null, 2), 'application/json'));
}

function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ---------- events ----------
let timer = null;
const schedule = () => { clearTimeout(timer); timer = setTimeout(run, 120); };
form.addEventListener('input', (e) => {
  const box = e.target.closest('.ctl');
  if (box && e.target.type === 'range') box.querySelector('input[type=checkbox]').checked = false;
  if (box) { const r = box.querySelector('input[type=range]'); box.querySelector('output').textContent = r.value; }
  schedule();
});
form.addEventListener('submit', e => { e.preventDefault(); run(); });
form.addEventListener('change', schedule);
$('#dice').addEventListener('click', () => {
  const words = ['amber', 'river', 'ember', 'north', 'lumen', 'crane', 'delta', 'moss', 'opal', 'tide', 'quill', 'sable', 'thorn', 'vale', 'wren', 'yarrow'];
  $('#seed').value = words[Math.floor(Math.random() * words.length)] + '-' + Math.floor(Math.random() * 1000);
  run();
});
$('#reset').addEventListener('click', () => { writeControls({ family: form.family.value }); run(); });
$('#copyLink').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(location.href); $('#copyLink').textContent = 'Link copied'; } catch { $('#copyLink').textContent = 'Copy failed'; }
  setTimeout(() => { $('#copyLink').textContent = 'Copy link'; }, 1500);
});
for (const [index, button] of tabs.entries()) {
  button.addEventListener('click', () => show(button.dataset.tab));
  button.addEventListener('keydown', event => {
    const previous = (index - 1 + tabs.length) % tabs.length;
    const next = (index + 1) % tabs.length;
    const destinations = { ArrowLeft: previous, ArrowRight: next, Home: 0, End: tabs.length - 1 };
    if (!Object.hasOwn(destinations, event.key)) return;
    event.preventDefault();
    const destination = tabs[destinations[event.key]];
    show(destination.dataset.tab);
    destination.focus();
  });
}
const panel = $('#panel');
const panelToggle = $('#panelToggle');
function setPanelOpen(open) {
  panel.classList.toggle('open', open);
  panelToggle.setAttribute('aria-expanded', String(open));
}
panelToggle.addEventListener('click', () => {
  const open = !panel.classList.contains('open');
  setPanelOpen(open);
  if (open) $('#seed').focus();
});
panel.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !panel.classList.contains('open')) return;
  setPanelOpen(false);
  panelToggle.focus();
});
$('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  setPanelOpen(false);
  $('#main').focus();
});
$('#tab-grammar').addEventListener('click', (e) => { const a = e.target.closest('.toc a'); if (a) { e.preventDefault(); document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' }); } });

window.addEventListener('hashchange', () => { const h = fromHash(); if (h) { $('#seed').value = h.seed; writeControls(h.c); run(); } });

// ---------- start ----------
const init = fromHash();
if (init) { $('#seed').value = init.seed; writeControls(init.c); }
run();
