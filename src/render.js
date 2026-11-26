// HTML rendering of a generated language: showcase, grammar book, vocabulary. Pure string builders (no DOM).
import { CASES } from './data/cases.js';
import { FAMILIES } from './data/families.js';
import { SEGMENTS, PLACES, MANNERS, HEIGHTS, BACKS } from './data/phonemes.js';
import { displayGloss } from './data/meanings.js';
import { isV, vBase, isLong, syllabify, TONE_NAMES, TONE_MARK } from './phonology.js';
import { ruleLabel } from './history.js';
import { inflectNoun, inflectVerb, citationVerb, declensionOf, PERSONS, join } from './morphology.js';
import { buildClause, agreeAdjective } from './syntax.js';
import { QUIRKS } from './quirks.js';
import { writeWord, renderOriginal, scriptChart, RTL } from './scripts.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ORDER_NAMES = { SOV: 'subject–object–verb', SVO: 'subject–verb–object', VSO: 'verb–subject–object', VOS: 'verb–object–subject', OVS: 'object–verb–subject', OSV: 'object–subject–verb' };
const PERSON_NAMES = { '1SG': 'I', '2SG': 'you (sg.)', '3SG': 'he / she / it', '1PL': 'we', '2PL': 'you (pl.)', '3PL': 'they', '3SG.M': 'he', '3SG.F': 'she', '3SG.N': 'it', '3SG.AN': 'he / she', '3SG.IN': 'it', '1DU': 'we two', '2DU': 'you two', '3DU': 'they two', '1PL.INCL': 'we (incl. you)', '1PL.EXCL': 'we (not you)' };
const TENSE_NAMES = { PRS: 'present', PST: 'past', FUT: 'future', NPST: 'non-past' };
const NUM_NAMES = { SG: 'singular', DU: 'dual', PL: 'plural' };

// ---------- script helpers ----------
export function native(lang, segs, { size = 22, cls = '' } = {}) {
  const id = lang.script.id;
  if (id === 'original') return `<span class="nat orig ${cls}" title="${esc(lang.romanize(segs))}">${renderOriginal(lang, segs, { size })}</span>`;
  const t = writeWord(lang, segs);
  return `<span class="nat ${cls}" ${RTL.has(id) ? 'dir="rtl"' : ''}>${esc(t)}</span>`;
}
export const rom = (lang, segs) => `<span class="rom">${esc(lang.romanize(segs))}</span>`;
const ipa = (lang, segs) => `<span class="ipa">${esc(lang.ipa(segs))}</span>`;
const usesOwnScript = (lang) => lang.script.id !== 'latin';

function sentenceNative(lang, words, size = 32) {
  const id = lang.script.id;
  if (id === 'original') {
    const parts = words.map(w => renderOriginal(lang, w.segs, { size }));
    const ordered = lang.script.style.direction === 'rtl' ? parts.reverse() : parts;
    return `<div class="nat-line orig">${ordered.join('<span class="wsep"></span>')}</div>`;
  }
  const sep = id === 'runic' ? ' ᛫ ' : ' ';
  const text = words.map(w => writeWord(lang, w.segs)).join(sep);
  return `<div class="nat-line" ${RTL.has(id) ? 'dir="rtl"' : ''}>${esc(text)}</div>`;
}

function sentenceRom(lang, c) {
  const t = c.words.map(w => lang.romanize(w.segs)).join(' ');
  return t.charAt(0).toUpperCase() + t.slice(1) + (c.q ? '?' : '.');
}

// Align morpheme parts to the surface word so hyphens fall in the right place.
function alignParts(lang, w) {
  const surf = w.segs;
  if (w.parts.length < 2) return [lang.romanize(surf)];
  const out = [];
  let pos = 0;
  for (let i = 0; i < w.parts.length; i++) {
    const p = w.parts[i].segs;
    if (i === w.parts.length - 1) { out.push(surf.slice(pos)); break; }
    let len = p.length;
    // epenthetic or glide segment at the boundary: give it to the next morpheme
    const next = w.parts[i + 1].segs;
    const rest = surf.length - pos;
    const need = w.parts.slice(i).reduce((a, x) => a + x.segs.length, 0);
    if (len > 0 && rest < need && i + 1 < w.parts.length) len = Math.max(0, len - (need - rest)); // deletion
    out.push(surf.slice(pos, pos + len));
    pos += len;
    void next;
  }
  if (out.join('').length === 0) return [lang.romanize(surf)];
  return out.map(s => lang.romanize(s));
}

export const speakBtn = (ipaText, label = 'Listen') => `<button type="button" class="speak" data-ipa="${esc(ipaText)}" title="${label}" aria-label="${label}">▶</button>`;
export const sentenceIPA = (lang, words) => words.map(w => lang.ipa(w.segs).replace(/^[/[]|[/\]]$/g, '')).join(' ');

export function interlinear(lang, c, { showNative = true } = {}) {
  const cols = c.words.map(w => {
    const seg = alignParts(lang, w).filter((x, i, a) => x !== '' || a.length === 1);
    const gl = w.parts.filter(p => p.segs.length || p.gloss).map(p => glossHTML(p.gloss));
    const segShown = seg.length === gl.length ? seg.join('-') : lang.romanize(w.segs);
    return `<div class="ig-col"><div class="ig-m">${esc(segShown)}</div><div class="ig-g">${gl.join('-')}</div></div>`;
  }).join('');
  return `<figure class="ex">
    ${showNative && usesOwnScript(lang) ? sentenceNative(lang, c.words) : ''}
    <div class="ig">${cols}</div>
    <figcaption>${speakBtn(sentenceIPA(lang, c.words))} ‘${esc(c.en)}’ <span class="ipa small">/${esc(sentenceIPA(lang, c.words))}/</span></figcaption>
  </figure>`;
}

function glossHTML(g) {
  if (!g) return '∅';
  return esc(displayGloss(g)).split('.').map(x => /^[A-Z0-9]+(\[LEN\])?$/.test(x) && !/^[0-9]+$/.test(x) ? `<span class="sc">${x.toLowerCase()}</span>` : x.replace(/\[LEN\]/, '<span class="sc">[len]</span>')).join('.');
}

// ---------- facts ----------
export function facts(lang) {
  const { controls: ctl, morph: m, ph, syntax: sx } = lang;
  const f = [];
  f.push(['Family', FAMILIES[ctl.family].name]);
  f.push(['Word order', ctl.order]);
  f.push(['Morphology', ctl.morph]);
  f.push(['Cases', m.cases.length ? `${m.cases.length} (${m.caseMarking === 'particle' ? 'particles' : 'suffixes'})` : 'none']);
  f.push(['Gender', m.nounClasses ? `${m.genders.length} noun classes` : m.genders.length ? m.genders.map(g => g.name).join(', ') : 'none']);
  f.push(['Number', m.numbers.map(n => NUM_NAMES[n]).join(', ')]);
  f.push(['Sounds', `${ph.consonants.length} consonants, ${ph.vowels.length} vowels`]);
  if (ph.toneCount) f.push(['Tone', `${ph.toneCount} tones`]);
  if (ph.harmony) f.push(['Vowel harmony', 'front / back']);
  f.push(['Script', scriptName(lang)]);
  void sx;
  return f;
}

function scriptName(lang) {
  if (lang.script.id === 'original') return `original ${lang.script.systemName}, ${lang.script.style.direction === 'rtl' ? 'right to left' : 'left to right'}`;
  return { latin: 'Latin', ipa: 'IPA', cyrillic: 'Cyrillic', greek: 'Greek', georgian: 'Georgian', armenian: 'Armenian', runic: 'Runic', arabic: 'Arabic abjad', hebrew: 'Hebrew abjad', devanagari: 'Devanagari' }[lang.script.id];
}

// ---------- SHOWCASE ----------
export function renderShowcase(lang) {
  const { lex } = lang;
  const W = (g) => lex.byGloss[g];
  const featured = ['water', 'fire', 'sun', 'moon', 'mother', 'heart', 'love', 'friend', 'star', 'river', 'dream', 'song'];
  const cards = featured.map(g => { const e = W(g); return `<div class="wcard">${usesOwnScript(lang) ? `<div class="wn">${native(lang, e.segs, { size: 26 })}</div>` : ''}<div class="wr">${esc(lang.romanize(e.segs))}</div><div class="wi">${esc(lang.ipa(e.segs))} ${speakBtn(lang.ipa(e.segs))}</div><div class="we">${esc(displayGloss(g))}</div></div>`; }).join('');
  const story = lang.story;
  const nums = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'].map((g, i) => `<li><b>${i + 1}</b> ${esc(lang.romanize(W(g).segs))}</li>`).join('');
  const phrases = ['pron', 'basic', 'q', 'neg'].map(id => lang.examples.general[id]).filter(Boolean);
  return `
  <section class="hero">
    <div class="hero-name">${speakBtn(lang.ipa(lang.name.segs))}${native(lang, lang.name.segs, { size: 56, cls: 'big' })}</div>
    <h2>${esc(lang.name.exonym)}</h2>
    <p class="lede">${esc(describe(lang))}</p>
    <dl class="facts">${facts(lang).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    ${lang.notes.length ? `<ul class="notes">${lang.notes.map(n => `<li class="${n.level}">${esc(n.text)}</li>`).join('')}</ul>` : ''}
  </section>
  <section>
    <h2>A short story</h2>
    <div class="story">
      ${usesOwnScript(lang) ? `<div class="story-native">${story.map(c => sentenceNative(lang, c.words, 30)).join('')}</div>` : ''}
      <div class="story-rom">${story.map(c => `<p>${speakBtn(sentenceIPA(lang, c.words))} ${esc(sentenceRom(lang, c))}</p>`).join('')}</div>
      <div class="story-en">${story.map(c => `<p>${esc(c.en)}</p>`).join('')}</div>
    </div>
    <details class="gloss-toggle"><summary>Show word-by-word glosses</summary>${story.map(c => interlinear(lang, c, { showNative: false })).join('')}</details>
  </section>
  <section>
    <h2>Words</h2>
    <div class="wgrid">${cards}</div>
  </section>
  <section class="two-col">
    <div><h2>Phrases</h2>${phrases.map(c => interlinear(lang, c)).join('')}</div>
    <div><h2>Counting</h2><ol class="nums">${nums}</ol><p class="muted">Base ${lang.lex.numeralBase} numerals.</p></div>
  </section>`;
}

function describe(lang) {
  const { controls: ctl, morph: m, ph } = lang;
  const fam = ctl.family === 'original' ? 'an a priori language with no parent family' : lang.descent ? `a descendant of ${lang.descent.path.protoName}, a sister of the real ${FAMILIES[ctl.family].name.replace(/ \(.*\)/, '')} languages whose sound history most resembles ${lang.descent.path.anchorName}${lang.descent.influence ? `, with ${lang.descent.influence.level} ${lang.descent.influence.donorName} influence` : ''}` : `a language in the style of the ${FAMILIES[ctl.family].name} family`;
  const bits = [];
  bits.push(`${lang.name.exonym} is ${fam}.`);
  if (lang.contacts?.length) {
    bits.push(`Its vocabulary draws on ${lang.contacts.map(c => FAMILIES[c.family].name + ' (' + c.percent + '% of roots)').join(', ')}.`);
  }
  const morphTxt = { agglutinative: 'builds words by stacking one suffix per meaning', fusional: 'packs several meanings into single endings', isolating: 'usually expresses grammatical distinctions with separate words' }[ctl.morph];
  bits.push(`Its basic word order is ${ORDER_NAMES[ctl.order]}, and it ${morphTxt}.`);
  if (m.cases.length) bits.push(`Nouns have ${m.cases.length} cases.`);
  if (ph.toneCount) bits.push(`Pitch distinguishes words: it has ${ph.toneCount} tones.`);
  if (ph.harmony) bits.push('Suffix vowels harmonise with the root.');
  if (lang.quirks?.length) bits.push(`Notable features: ${lang.quirks.map(id => QUIRKS[id].name.charAt(0).toLowerCase() + QUIRKS[id].name.slice(1)).join('; ')}.`);
  return bits.join(' ');
}

function grInfluence(lang) {
  if (lang.contacts?.length) {
    const total = lang.contactRootCount;
    return `<h3>Language contact</h3><p>Each borrowed root enters between the start of contact and the present. It passes through the sound changes that follow its arrival.</p>
      <div class="scroll"><table class="data"><tr><th>Donor family</th><th>Contact began</th><th>Root share</th><th>Example loans</th></tr>
      ${lang.contacts.slice().sort((a, b) => b.yearsAgo - a.yearsAgo).map(c => {
        const entries = lang.lex.entries.filter(e => e.borrowed && e.loan.family === c.family);
        const examples = entries.slice(0, 3).map(e => `${rom(lang, e.segs)} ‘${esc(displayGloss(e.gloss))}’`).join(', ');
        return `<tr><th>${esc(FAMILIES[c.family].name)}</th><td>${c.yearsAgo === 0 ? 'Present day' : c.yearsAgo + ' years ago'}</td><td>${c.percent}% (${entries.length}/${total})</td><td>${examples || '—'}</td></tr>`;
      }).join('')}</table></div>`;
  }
  const I = lang.descent?.influence;
  if (!I) return '';
  const loans = lang.lex.entries.filter(e => e.borrowed);
  if (!loans.length) return '';
  const share = Math.round(100 * loans.length / lang.lex.entries.length);
  const displaced = loans.filter(e => e.loan.displaced).length;
  const ex = loans.slice().sort((a, b) => (b.basic || 0) - (a.basic || 0)).slice(0, 6);
  const when = I.contactLabel ? ` after this change: “${esc(I.contactLabel.replace(/\.$/, ''))}”` : ' early in its history';
  return `<h4>Contact with ${esc(I.donorName)}</h4>
  <p>${I.level === 'heavy' ? 'Long and close' : 'Some'} contact with ${esc(I.donorName)} speakers (descended from ${esc(I.donorProto)}) began${when} (step ${I.contactStep} of ${I.totalSteps}). ${share}% of the core vocabulary is borrowed from it${displaced ? `, and ${displaced} loans pushed out an inherited word` : ''}. Loans were fitted to the sounds and syllables of the time, then went through the later sound changes like native words${I.newSounds.length ? `; they also brought in new sounds: ${I.newSounds.map(s => '/' + esc(s) + '/').join(', ')}` : ''}.</p>
  <p class="muted">${ex.map(e => `${rom(lang, e.segs)} ‘${esc(displayGloss(e.gloss))}’ &lt; ${esc(e.loan.donorForm.join(''))}`).join('; ')}</p>`;
}

function grDescent(lang) {
  const d = lang.descent, p = d.path;
  const inh = lang.lex.entries.filter(e => e.inherited && e.history?.length);
  const protoRom = (segs) => segs.join('').replace(/ː/g, '\u0304');
  const rows = p.steps.map(st => {
    const ex = inh.filter(e => e.history.some(h => h.id.startsWith(st.id + ':'))).slice(0, 3);
    return `<li><p>${esc(st.label)}</p>${ex.length ? `<p class="muted">${ex.map(e => `*${esc(protoRom(e.proto))} → ${rom(lang, e.segs)} ‘${esc(displayGloss(e.gloss))}’`).join('; ')}</p>` : ''}</li>`;
  }).join('');
  const share = Math.round(100 * lang.lex.entries.filter(e => e.inherited).length / lang.lex.entries.length);
  const trace = inh.filter(e => e.history.length >= 3).sort((a, b) => b.history.length - a.history.length)[0];
  const exempt = lang.lex.entries.filter(e => e.exempt?.length).slice(0, 5);
  const drift = lang.controls.drift;
  return `<p>${esc(lang.name.exonym)} descends from <b>${esc(p.protoName)}</b>. ${share}% of the core vocabulary is inherited from it; the rest was ${d.influence || lang.contacts?.length ? 'borrowed, ' : ''}built from inherited words or coined later in the same sound shape. Its history follows the path of the family’s real daughters, and is closest to <b>${esc(p.anchorName)}</b>${drift < 80 ? `, but it has gone only part of the way (distance ${drift} of 100)` : drift > 80 ? `, with a few changes of its own on top (distance ${drift} of 100)` : ''}.</p>
  <p>These sound changes happened in this order (ancestor forms are marked *):</p>
  <ol class="rules">${rows}</ol>
  ${trace ? `<h4>One word through time</h4><p>${esc(displayGloss(trace.gloss))}: *${esc(protoRom(trace.proto))} ${trace.history.map(h => `→ ${esc(lang.romanize(h.form))}`).join(' ')}</p>` : ''}
  ${exempt.length ? `<p>Some words escaped a change, which kept them apart from words that would otherwise sound the same: ${exempt.map(e => `${rom(lang, e.segs)} ‘${esc(displayGloss(e.gloss))}’`).join(', ')}.</p>` : ''}
  ${grInfluence(lang)}
  ${lang.inherited?.length ? `<p>Inherited grammar: ${esc(lang.inherited.join(', '))} come from the ${esc(p.protoName)} forms, through the same sound changes.</p>` : ''}`;
}

// ---------- notable features (quirks) ----------
function grFeatures(lang) {
  const m = lang.morph;
  const R = (segs) => segs ? `<i>${esc(lang.romanize(segs))}</i>` : '';
  const caseOrWord = (c, segs, gl) => m.cases.includes(c) ? `the ${esc(CASES[c]?.name || c)} case` : `the word ${R(segs)} ‘${gl}’`;
  const T = {
    datPoss: () => `There is no verb ‘to have’. The owner goes into ${caseOrWord('DAT', m.adpos.recipient, 'to')} and the thing owned is the subject of ‘be’: literally ‘to me is a horse’, as in Latin <i>mihi est equus</i>.`,
    locPoss: () => `There is no verb ‘to have’. The owner is put ${m.possLocCase ? `in the ${esc(CASES[m.possLocCase]?.name || m.possLocCase)} case` : `after the word ${R(m.possAt)} ‘at’`}, and the thing owned is the subject of ‘be’: literally ‘at me is a horse’, as in Russian <i>u menja est’ kon’</i>.`,
    existPoss: () => `There is no verb ‘to have’. The thing owned takes its owner’s possessive and the word ${R(m.existential)} ‘exists’: literally ‘my horse exists’, as in Turkish <i>atım var</i>.`,
    zeroCopula: () => `In the present tense the verb ‘be’ is left out${m.zeroCopulaScope === 'third' ? ' in the third person' : ''}: ‘the water cold’. In other tenses it is used.`,
    serEstar: () => `Two verbs translate ‘be’: ${R(lang.lex.byGloss.be.segs)} for identity and lasting qualities, and ${R(m.copulaLoc)} for where something is and for passing states, as Spanish <i>ser</i> and <i>estar</i>.`,
    dom: () => `Objects that are ${m.domRule === 'human' ? 'people' : m.domRule === 'animate' ? 'people or animals' : 'definite'} are marked like recipients, with ${caseOrWord('DAT', m.adpos.recipient, 'to')}; other objects are left bare (compare Spanish <i>veo a Juan</i> with <i>veo el árbol</i>).`,
    negConcord: () => 'Negative words such as ‘never’ do not replace the plain negation: both appear, so ‘he never sleeps’ is literally ‘he never not sleeps’.',
    negCircum: () => `Negation has two parts: ${R(m.negation)} and ${R(m.negation2)} ${m.neg2Pos === 'final' ? 'at the end of the sentence' : 'right after the verb'}, like French <i>ne … pas</i>.`,
    tv: () => `Speaking politely to one person, you use the ${m.tvSource === '2PL' ? 'plural ‘you’' : m.tvSource === '3PL' ? '‘they’ pronoun' : '‘he/she’ pronoun'} and its verb forms, like French <i>vous</i> or German <i>Sie</i>.`,
    adjVerb: () => 'Adjectives behave like verbs: they take the verb endings themselves and need no ‘be’.',
    inalienable: () => `Kin and body parts are possessed directly (‘my hand’, ‘my mother’); everything else needs the possessive word ${R(m.possClassifier)} between owner and thing.`,
    construct: () => `A possessed noun takes the construct ending ${R(m.constructAff)} and stands right before its owner, without an article: ‘house-of the king’, as Arabic <i>bayt al-malik</i>.`,
    defConj: () => `When the object is definite, the verb adds ${R(m.defObjAff)}: ‘I see a bird’ but ‘I see-DEF the bird’, as in Hungarian <i>látok</i> / <i>látom</i>.`,
    redup: () => 'Repeating the first syllable of a noun makes it plural, and repeating an adjective makes it stronger (‘big-big’ = very big).',
    incorp: () => 'A general, unspecified object is built into the verb: ‘the man meat-eats’. A specific object stays a separate word.',
    serial: () => `Instruments are introduced with the verb ${R(lang.lex.byGloss.take.segs)} ‘take’: ‘the hunter takes a knife kills the wolf’.`,
    honorific: () => `Respected people (kings, gods, teachers, parents, guests) take the honorific ${m.honorTitleSide === 'word' ? 'word' : m.honorTitleSide} ${R(m.honorTitle)}, and when one of them is the subject the verb adds ${R(m.honorVerb)}. Speaking politely to someone, verbs add ${R(m.politeVerb)}, as in Japanese <i>-sama</i>, <i>o-…-ni naru</i> and <i>-masu</i>.`,
  };
  return lang.quirks.map(id => `<h3>${esc(QUIRKS[id].name)}</h3><p>${T[id] ? T[id]() : ''}</p>${(lang.examples.quirks[id] || []).map(c => interlinear(lang, c)).join('')}`).join('');
}

// ---------- GRAMMAR BOOK ----------
export function renderGrammar(lang) {
  const sections = [
    ['phonology', '1. Sounds', grPhonology(lang)],
    ['history', '2. Sound history', grHistory(lang)],
    ['writing', '3. Writing', grWriting(lang)],
    ['nouns', '4. Nouns', grNouns(lang)],
    ['cases', '5. Cases and relations', grCases(lang)],
    ['adjectives', '6. Articles, adjectives and numerals', grAdjectives(lang)],
    ['pronouns', '7. Pronouns', grPronouns(lang)],
    ['verbs', '8. Verbs', grVerbs(lang)],
    ['syntax', '9. Sentences', grSyntax(lang)],
    ['derivation', '10. Building words', grDerivation(lang)],
  ];
  if (lang.quirks?.length) sections.push(['features', '11. Notable features', grFeatures(lang)]);
  return `<div class="book">
    <nav class="toc"><b>Contents</b>${sections.map(([id, t]) => `<a href="#g-${id}">${esc(t)}</a>`).join('')}</nav>
    <div class="chapters">${sections.map(([id, t, body]) => `<section id="g-${id}" class="chapter"><h2>${esc(t)}</h2>${body}</section>`).join('')}</div>
  </div>`;
}

function exampleWord(lang, pred) {
  return lang.lex.entries.find(pred);
}

function grPhonology(lang) {
  const { ph } = lang;
  const r = lang.rom.map;
  const cons = ph.consonants;
  const places = PLACES.filter(p => cons.some(c => SEGMENTS[c].place === p));
  const manners = MANNERS.filter(mn => cons.some(c => SEGMENTS[c].manner === mn));
  const cell = (list) => list.map(c => `<span class="ph"><span class="ipa">${esc(c)}</span><small>${esc(r[c])}</small></span>`).join(' ');
  const ctable = `<table class="chart"><thead><tr><th></th>${places.map(p => `<th>${p}</th>`).join('')}</tr></thead><tbody>${manners.map(mn => `<tr><th>${mn}</th>${places.map(p => `<td>${cell(cons.filter(c => SEGMENTS[c].manner === mn && SEGMENTS[c].place === p))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const vs = ph.vowels;
  const heights = HEIGHTS.filter(h => vs.some(v => SEGMENTS[v].height === h));
  const vtable = `<table class="chart"><thead><tr><th></th>${BACKS.map(b => `<th>${b}</th>`).join('')}</tr></thead><tbody>${heights.map(h => `<tr><th>${h === 'lowmid' ? 'open-mid' : h}</th>${BACKS.map(b => `<td>${cell(vs.filter(v => SEGMENTS[v].height === h && SEGMENTS[v].back === b))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

  // syllable structure, measured on the lexicon
  let maxOn = 0, maxCo = 0;
  const onsets = new Map(), codas = new Map();
  for (const e of lang.lex.entries) {
    const syls = syllabify(ph, e.segs);
    syls.forEach(([a, b]) => {
      const s = e.segs.slice(a, b); const vi = s.findIndex(isV);
      const on = s.slice(0, vi), co = s.slice(vi + 1).filter(x => !isV(x));
      maxOn = Math.max(maxOn, on.length); maxCo = Math.max(maxCo, co.length);
      if (on.length > 1) onsets.set(on.join(''), (onsets.get(on.join('')) || 0) + 1);
      if (co.length > 1) codas.set(co.join(''), (codas.get(co.join('')) || 0) + 1);
    });
  }
  const shape = '(C)'.repeat(Math.min(maxOn, 3)).replace(/^\(C\)/, maxOn ? '(C)' : '') + 'V' + (ph.longVowels || ph.diphthongs.length ? '(V)' : '') + '(C)'.repeat(maxCo);
  const stressTxt = {
    initial: 'Stress falls on the first syllable.', final: 'Stress falls on the last syllable.', penult: 'Stress falls on the next-to-last syllable.',
    antepenult: 'Stress falls on the third syllable from the end.', weight: 'Stress is weight-sensitive: it falls on the next-to-last syllable if that syllable is heavy (long vowel or closed), otherwise on the one before.',
    free: 'Stress is free and must be learned with each word (it is marked in the IPA).', pitch: 'There is no stress accent; instead some words carry a pitch drop, as in a pitch-accent language.', none: 'Syllables are evenly timed; there is no word stress.',
  }[ph.stress];
  let tone = '';
  if (ph.toneCount) {
    const names = TONE_NAMES[ph.toneCount];
    const sample = lang.lex.entries.filter(e => e.syllables === 1).slice(0, 12);
    tone = `<h3>Tone</h3><p>Each syllable carries one of ${ph.toneCount} tones, ${ph.toneSpelling === 'none' ? 'which the everyday spelling leaves unwritten (they are shown in the IPA). The marks below are used in dictionaries' : 'written with a mark over the vowel'}:</p>
    <table class="data"><tr><th>Tone</th><th>Mark</th><th>Example</th></tr>${names.map((n, i) => { const ex = sample.find(e => e.segs.some(s => s.endsWith(String(i + 1)))); return `<tr><td>${n}</td><td>${TONE_MARK[ph.toneCount][i] ? 'a' + TONE_MARK[ph.toneCount][i] : 'a (no mark)'}</td><td>${ex ? `${rom(lang, ex.segs)} ‘${esc(displayGloss(ex.gloss))}’` : '–'}</td></tr>`; }).join('')}</table>`;
  }
  const harmony = ph.harmony ? `<h3>Vowel harmony</h3><p>A word uses either front vowels or back vowels, never both (i and e may appear with either). Suffixes come in two forms and copy the class of the root: compare ${harmonyDemo(lang)}.</p>` : '';
  const sampleClusters = [...onsets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k]) => `<span class="ipa">${esc(k)}</span>`).join(', ');
  const sampleCodas = [...codas.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k]) => `<span class="ipa">${esc(k)}</span>`).join(', ');
  return `
  <h3>Consonants</h3>${ctable}
  <h3>Vowels</h3>${vtable}
  ${ph.longVowels ? `<p>Vowels can be long; length is written ${lang.rom.longStyle === 'double' ? 'by doubling the letter (aa)' : lang.rom.longStyle === 'macron' ? 'with a macron (ā)' : 'with an acute accent (á)'}.</p>` : ''}
  ${ph.diphthongs.length ? `<p>Diphthongs: ${ph.diphthongs.map(d => `<span class="ipa">${esc(d)}</span>`).join(', ')}.</p>` : ''}
  <h3>Syllables</h3>
  <p>The largest syllable is <b class="ipa">${esc(shape)}</b>. ${sampleClusters ? `Consonant clusters at the start of a syllable: ${sampleClusters}.` : 'Syllables never begin with a cluster.'} ${ph.codaSet.length ? `A syllable can end in ${ph.codaSet.map(c => `<span class="ipa">${esc(c)}</span>`).join(', ')}${sampleCodas ? `, and in the clusters ${sampleCodas}` : ''}.` : 'Every syllable ends in a vowel.'}</p>
  <p>When a suffix would create a forbidden cluster, the vowel <span class="ipa">${esc(ph.epenthetic.replace(/[1-6]/, ''))}</span> is inserted. When two vowels meet, ${ph.hiatus === 'delete' ? `the final vowel of the root is dropped (elsewhere <span class="ipa">${esc(ph.glide)}</span> is inserted)` : `<span class="ipa">${esc(ph.glide)}</span> is inserted between them`}.</p>
  <h3>Stress</h3><p>${stressTxt}</p>
  ${tone}${harmony}`;
}

function harmonyDemo(lang) {
  const m = lang.morph;
  const front = lang.lex.entries.find(e => e.pos === 'n' && e.segs.some(s => isV(s) && 'yøæ'.includes(vBase(s))));
  const back = lang.lex.entries.find(e => e.pos === 'n' && e.segs.some(s => isV(s) && 'uoaɯ'.includes(vBase(s))) && !e.segs.some(s => isV(s) && 'yøæ'.includes(vBase(s))));
  const c = m.cases[2] || m.cases[1];
  if (!front || !back) return 'any two nouns';
  const f = inflectNoun(lang, front, { kase: c, number: m.numbers.includes('PL') ? 'PL' : 'SG' });
  const b = inflectNoun(lang, back, { kase: c, number: m.numbers.includes('PL') ? 'PL' : 'SG' });
  return `${rom(lang, b.segs)} ‘${esc(back.gloss)}’ and ${rom(lang, f.segs)} ‘${esc(front.gloss)}’`;
}

function grHistory(lang) {
  if (lang.descent) return grDescent(lang);
  const rules = lang.cascade.rules;
  const entries = lang.lex.entries.filter(e => e.proto && !e.borrowed);
  const rows = rules.map(r => {
    const ex = entries.filter(e => e.applied.includes(r.id)).slice(0, 3);
    return `<li><p>${esc(ruleLabel(r.id))}</p>${ex.length ? `<p class="muted">${ex.map(e => `*${esc(lang.romanize(e.proto))} → ${rom(lang, e.segs)} ‘${esc(displayGloss(e.gloss))}’`).join('; ')}</p>` : '<p class="muted">(No word in the core vocabulary shows it.)</p>'}</li>`;
  }).join('');
  const exempt = entries.filter(e => e.exempt.length).slice(0, 4);
  return `<p>The modern language descends from an older stage (marked *). These sound changes happened in this order. Because each change applied to the output of the one before, some words look irregular today.</p>
  <ol class="rules">${rows}</ol>
  ${exempt.length ? `<p>A few words escaped a change, often because they were borrowed back from a conservative dialect: ${exempt.map(e => `${rom(lang, e.segs)} ‘${esc(displayGloss(e.gloss))}’`).join(', ')}.</p>` : ''}
  ${grInfluence(lang)}`;
}

function grWriting(lang) {
  const { ph } = lang;
  const sc = lang.script;
  const all = [...ph.consonants, ...ph.vowels];
  if (sc.id === 'original') {
    const typeTxt = {
      alphabet: 'an alphabet: every consonant and every vowel has its own letter',
      abjad: 'an abjad: consonants are written in full, vowels only partly',
      abugida: `an abugida: each consonant letter carries the vowel ${esc(lang.rom.map[sc.inherent] ?? sc.inherent)} unless a sign shows another vowel`,
      syllabary: 'a syllabary: each consonant + vowel syllable has its own sign',
    }[sc.type];
    const romOf = (p) => esc(lang.rom.map[p] ?? p);
    const secs = scriptChart(lang, romOf).map(sec => `<h4>${esc(sec.title)}</h4>${sec.text ? `<p>${esc(sec.text)}</p>` : ''}
      ${sec.grid ? `<div class="glyph-grid">${sec.grid.map(c => `<div class="gcell">${c.html}<span>${c.label}</span></div>`).join('')}</div>` : ''}
      ${sec.table ? `<div class="scroll"><table class="chart glyphs-t"><thead><tr>${sec.table.head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${sec.table.rows.map(r => `<tr><th>${r[0]}</th>${r.slice(1).map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : ''}`).join('');
    const demo = ['water', 'mother', 'king', 'house', 'star'].map(g => lang.lex.byGloss[g]).filter(Boolean).map(e => `<tr><td>${native(lang, e.segs, { size: 30 })}</td><td>${rom(lang, e.segs)}</td><td>${esc(displayGloss(e.gloss))}</td></tr>`).join('');
    return `<p>The native script is ${typeTxt}, in the style of ${esc(sc.systemName)}. It is written ${sc.style.direction === 'rtl' ? 'from right to left' : 'from left to right'}.</p>
      ${secs}<h4>Sample words</h4><table class="data">${demo}</table>
      ${romTable(lang, all)}`;
  }
  const realNote = { arabic: 'The Arabic abjad writes consonants; long vowels and word-final vowels use the letters ا و ي, and short vowels inside the word are not written.', hebrew: 'The Hebrew abjad writes consonants; vowels at the ends of words and long vowels use the letters א ה ו י.', devanagari: 'Devanagari is an abugida: each consonant carries the vowel a unless a vowel sign is added; the virama ् removes the vowel.', runic: 'Runes are written without capitals; words are separated with ᛫.', greek: 'Greek letters are used with their modern values; final s is written ς.' }[sc.id] || '';
  return `<p>The language is written in the ${esc(scriptName(lang))} script. ${esc(realNote)}</p>${romTable(lang, all)}`;
}

function romTable(lang, all) {
  const sc = lang.script.id;
  return `<h4>Pronunciation key</h4><div class="scroll"><table class="data key"><tr><th>Sound</th><th>Roman</th>${sc !== 'latin' ? '<th>Native</th>' : ''}<th>Example</th></tr>${all.map(p => {
    const ex = lang.lex.entries.find(e => e.segs.some(s => s.replace(/[ː1-6]/g, '') === p) && e.segs.length <= 6) || lang.lex.entries.find(e => e.segs.some(s => s.replace(/[ː1-6]/g, '') === p));
    return `<tr><td class="ipa">${esc(p)}</td><td><b>${esc(lang.rom.map[p])}</b></td>${sc !== 'latin' ? `<td>${native(lang, [p], { size: 22 })}</td>` : ''}<td>${ex ? `${rom(lang, ex.segs)} ‘${esc(displayGloss(ex.gloss))}’` : ''}</td></tr>`;
  }).join('')}</table></div>`;
}

function grNouns(lang) {
  const { morph: m } = lang;
  let out = '';
  if (m.nounClasses) {
    out += `<p>Every noun belongs to one of ${m.genders.length} noun classes. The class is shown by a prefix, which changes in the plural, and it is copied onto adjectives and onto the verb.</p>
    <table class="data"><tr><th>Class</th><th>Singular prefix</th><th>Plural prefix</th><th>Example</th></tr>${m.genders.map(g => {
      const ex = lang.lex.entries.find(e => e.pos === 'n' && e.gender === g.id);
      return `<tr><td>${esc(g.name)}</td><td>${rom(lang, g.prefix.SG)}-</td><td>${rom(lang, g.prefix.PL)}-</td><td>${ex ? `${rom(lang, inflectNoun(lang, ex, { number: 'SG' }).segs)} / ${rom(lang, inflectNoun(lang, ex, { number: 'PL' }).segs)} ‘${esc(ex.gloss)}’` : ''}</td></tr>`;
    }).join('')}</table>`;
  } else if (m.genders.length) {
    const share = lang.lex.entries.filter(e => e.pos === 'n');
    const counts = m.genders.map(g => [g, share.filter(e => e.gender === g.id).length]);
    out += `<p>Nouns have ${m.genders.length} genders: ${counts.map(([g, n]) => `${g.name} (${n} of ${share.length} nouns)`).join(', ')}. ${m.genders[0].id === 'AN' ? 'People and animals are animate; everything else is inanimate.' : 'Words for men are masculine and words for women feminine; for other nouns the gender is mostly predictable from the ending.'}</p>`;
  } else out += '<p>Nouns have no grammatical gender.</p>';

  if (m.numbers.length > 1) {
    if (m.type === 'agglutinative' && m.numAff) out += `<p>Number is marked by a suffix: ${m.numbers.slice(1).map(n => `${NUM_NAMES[n]} ${rom(lang, m.numAff[n])}`).join(', ')}, which comes before the case ending.</p>`;
    else if (m.type === 'isolating') out += m.pluralStrategy === 'reduplication' ? '<p>The plural is formed by repeating the first syllable of the noun.</p>' : '<p>Nouns do not change for number; plural is shown by context, numerals or quantity words.</p>';
    else out += `<p>Number (${m.numbers.map(n => NUM_NAMES[n]).join(', ')}) is fused with case in a single ending.</p>`;
  }
  const broken = lang.lex.entries.filter(e => e.brokenPlural).slice(0, 5);
  if (broken.length) out += `<p>Many nouns form a <i>broken plural</i> by changing the vowel pattern of the root: ${broken.map(e => `${rom(lang, e.segs)} → ${rom(lang, e.brokenPlural)} ‘${esc(e.gloss)}’`).join(', ')}.</p>`;

  // paradigms
  if (m.type === 'fusional' && m.declensions) {
    out += `<h3>Declensions</h3><p>There are ${m.declensions.length} declension classes, recognised by the final sound of the noun.</p>`;
    for (const d of m.declensions) {
      const ex = lang.lex.entries.find(e => e.pos === 'n' && declensionOf(m, e) === d && e.syllables >= 2) || lang.lex.entries.find(e => e.pos === 'n' && declensionOf(m, e) === d);
      if (!ex) continue;
      out += `<h4>Declension ${d.id}: ${d.theme ? `nouns ending in -${esc(lang.rom.map[d.theme])}` : 'other nouns'}${d.gender ? `, mostly ${esc(m.genders.find(g => g.id === d.gender)?.name)}` : ''}</h4>${paradigmTable(lang, ex)}${d.syncretism.length ? `<p class="muted">Shared endings: ${d.syncretism.map(esc).join('; ')}.</p>` : ''}`;
    }
  } else if (m.type === 'agglutinative' && m.cases.length && !m.nounClasses) {
    const ex = lang.lex.byGloss.house;
    out += `<h3>Model noun</h3>${paradigmTable(lang, ex)}`;
    const ex2 = lang.lex.entries.find(e => e.pos === 'n' && e.segs.length >= 3 && !isV(e.segs[e.segs.length - 1]) !== !isV(ex.segs[ex.segs.length - 1]));
    if (ex2) out += paradigmTable(lang, ex2);
  } else if (m.nounClasses && m.cases.length) {
    out += `<h3>Model noun</h3>${paradigmTable(lang, lang.lex.byGloss.house)}`;
  }
  if (m.possAff) out += `<h3>Possessive suffixes</h3><p>Possession by a pronoun is a suffix: ${PERSONS.map(p => `${rom(lang, inflectNoun(lang, lang.lex.byGloss.house, { poss: p }).segs)} ‘${PERSON_NAMES[p].replace(/ \(.*\)/, '').replace('I', 'my').replace('you', 'your').replace('he / she / it', 'his/her').replace('we', 'our').replace('they', 'their')} house’`).join(', ')}.</p>`;
  return out;
}

function paradigmTable(lang, e) {
  const m = lang.morph;
  const cases = m.caseMarking === 'suffix' && m.cases.length ? m.cases : [null];
  return `<div class="scroll"><table class="data paradigm"><caption>${rom(lang, e.segs)} ‘${esc(e.gloss)}’</caption><tr><th></th>${m.numbers.map(n => `<th>${NUM_NAMES[n]}</th>`).join('')}</tr>${cases.map(c => `<tr><th>${c ? `${CASES[c].name}` : 'form'}</th>${m.numbers.map(n => { const r = inflectNoun(lang, e, { kase: c, number: n }); return `<td>${rom(lang, r.segs)}${usesOwnScript(lang) ? `<br>${native(lang, r.segs, { size: 24, cls: 'small' })}` : ''}</td>`; }).join('')}</tr>`).join('')}</table></div>`;
}

function grCases(lang) {
  const m = lang.morph;
  let out = '';
  if (!m.cases.length) {
    out += `<p>Nouns have no cases. Subject and object are told apart by word order (${ORDER_NAMES[lang.controls.order]}), and other relations use ${m.adposSide === 'post' ? 'postpositions after' : 'prepositions before'} the noun.</p>`;
  } else {
    const align = m.cases.includes('ERG') ? '<p>The language is <b>ergative</b>: the subject of an intransitive verb (“the child sleeps”) takes the same case as the object of a transitive verb (absolutive), while the doer of a transitive verb takes the ergative.</p>' : '';
    out += `${align}<p>There are ${m.cases.length} cases, ${m.caseMarking === 'particle' ? `expressed by particles placed ${m.particleSide} the noun phrase` : 'expressed by endings'}.</p>
    <table class="data"><tr><th>Case</th><th>Marker</th><th>Used for</th></tr>${m.cases.map(c => `<tr><td><b>${CASES[c].name}</b> <span class="sc">${c.toLowerCase()}</span></td><td>${caseMarkerText(lang, c)}</td><td>${esc(CASES[c].use)}</td></tr>`).join('')}</table>
    <h3>Each case in use</h3>${m.cases.map(c => `<div class="case-ex"><h4>${CASES[c].name}</h4>${interlinear(lang, lang.examples.byCase[c])}</div>`).join('')}`;
  }
  const adp = Object.entries(m.adpos);
  if (adp.length) {
    out += `<h3>${m.adposSide === 'post' ? 'Postpositions' : 'Prepositions'}</h3><p>Relations without a case use separate words placed ${m.adposSide === 'post' ? 'after' : 'before'} the noun:</p>
    <table class="data">${adp.filter(([r]) => r !== 'address').map(([role, segs]) => `<tr><td>${rom(lang, segs)}</td><td>${esc({ possessor: 'of', recipient: 'to, for', location: 'in, at', source: 'from', instrument: 'with (a tool)', companion: 'together with', goal: 'towards', state: 'as', partial: 'some of', change: 'into (becoming)', without: 'without', surface: 'on' }[role] || role)}</td></tr>`).join('')}</table>
    ${Object.values(lang.examples.adposEx).slice(0, 3).map(c => interlinear(lang, c)).join('')}`;
    if (m.inflectedPrepositions) out += `<p>Prepositions fuse with pronouns: ${['1SG', '2SG', '3SG'].map(p => `${rom(lang, join(lang.ph, m.adpos.recipient || Object.values(m.adpos)[0], lang.pronouns.forms[p].base.slice(-2)))} ‘to ${PERSON_NAMES[p].split(' ')[0].replace('I', 'me').replace('he', 'him')}’`).join(', ')}.</p>`;
  }
  return out;
}

function caseMarkerText(lang, c) {
  const m = lang.morph;
  if (m.caseMarking === 'particle') return m.caseParticles[c]?.length ? rom(lang, m.caseParticles[c]) : '∅ (unmarked)';
  if (m.caseAff) return m.caseAff[c]?.length ? '-' + rom(lang, m.caseAff[c]) : '∅ (unmarked)';
  if (m.declensions) return m.declensions.map(d => { const e = d.endings[c]?.SG ?? []; return e.length ? '-' + lang.romanize(e) : '-∅'; }).join(' / ') + ' <span class="muted">(sg.)</span>';
  return '';
}

function grAdjectives(lang) {
  const { morph: m, syntax: sx } = lang;
  let out = '';
  if (m.articles) {
    const def = Object.entries(m.articles.def);
    out += `<h3>Articles</h3><p>${m.articles.indef ? 'There is a definite and an indefinite article.' : 'There is a definite article; indefinite nouns are bare.'} ${m.articles.side === 'suffix' ? 'The definite article is a suffix attached to the noun.' : `Articles stand ${m.articles.side} the noun.`}</p>
    <table class="data"><tr><th></th><th>definite</th>${m.articles.indef ? '<th>indefinite</th>' : ''}</tr>${def.map(([g, segs]) => `<tr><th>${g === '_' ? '' : esc(m.genders.find(x => x.id === g)?.name)}</th><td>${m.articles.side === 'suffix' ? '-' : ''}${rom(lang, segs)}</td>${m.articles.indef ? `<td>${rom(lang, m.articles.indef[g])}</td>` : ''}</tr>`).join('')}</table>
    ${m.mutation ? `<p>After the definite article, feminine nouns undergo <b>lenition</b>: their first consonant softens (${Object.entries(m.mutation).slice(0, 6).map(([a, b]) => `${esc(lang.rom.map[a])} → ${esc(lang.rom.map[b] ?? b)}`).join(', ')}).</p>` : ''}`;
  } else out += '<h3>Articles</h3><p>There are no articles; definiteness comes from context.</p>';
  out += `<h3>Adjectives</h3><p>Adjectives come ${sx.adjPos} the noun they describe.`;
  if (m.type === 'fusional' && m.genders.length && m.declensions) {
    const a = lang.lex.byGloss.good;
    out += ` They agree with the noun in gender, number and case: ${m.genders.map(g => `${rom(lang, agreeAdjective(lang, a, { gender: g.id, number: 'SG', kase: m.cases[0] }).segs)} (${g.name})`).join(', ')} ‘good’.</p>`;
  } else if (m.nounClasses) {
    const a = lang.lex.byGloss.good;
    out += ` They take the class prefix of the noun: ${m.genders.slice(0, 3).map(g => `${rom(lang, agreeAdjective(lang, a, { gender: g.id, number: 'SG' }).segs)} (${g.name.split(' (')[0]})`).join(', ')} ‘good’.</p>`;
  } else out += ' The adjective keeps the same form across genders, numbers and cases.</p>';
  out += interlinear(lang, lang.examples.general.adj);
  const degrees = [
    ['comparative', 'CMPR', 'The house is bigger than the tree.'],
    ['superlative', 'SUPL', 'The house is the biggest.'],
  ];
  out += '<h3>Comparatives and superlatives</h3>';
  for (const [key, code, en] of degrees) {
    const marker = rom(lang, m.degreeMarkers[code]);
    const description = { particle: `a separate particle ${marker} before the adjective`, prefix: `the prefix ${marker}-`, suffix: `the suffix -${marker}`, unmarked: 'context, with the plain adjective' };
    out += `<p>The ${key} uses ${description[lang.controls[key]]}.</p>`;
    out += interlinear(lang, buildClause(lang, { S: { n: 'house', def: true }, pred: 'big', degree: code, standard: code === 'CMPR' ? { n: 'tree', def: true } : null, en }));
  }
  out += `<h3>Numerals</h3><p>The numeral system has base ${lang.lex.numeralBase}. Numerals come ${sx.numPos} the noun${m.classifiers ? ', followed by a <b>classifier</b> that depends on the kind of thing counted' : ''}.</p>
  <table class="data nums-t">${['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'twenty', 'hundred', 'thousand'].map(g => { const e = lang.lex.byGloss[g]; return `<tr><td>${esc(g)}</td><td>${rom(lang, e.segs)}</td><td>${usesOwnScript(lang) ? native(lang, e.segs, { size: 18 }) : ''}</td><td class="muted">${e.deriv ? 'compound' : ''}</td></tr>`; }).join('')}</table>
  ${m.classifiers ? `<table class="data">${Object.entries(m.classifiers).map(([k, v]) => `<tr><td>${rom(lang, v)}</td><td>classifier for ${esc(k)}</td></tr>`).join('')}</table>` : ''}
  ${interlinear(lang, lang.examples.general.num)}`;
  return out;
}

function grPronouns(lang) {
  const { morph: m, pronouns: pr } = lang;
  const showCases = m.type === 'fusional' && m.cases.length ? m.cases.slice(0, 5) : m.type === 'agglutinative' && m.cases.length ? m.cases.slice(0, 4) : [];
  const caseForm = (p, c) => {
    const f = pr.forms[p];
    if (c === m.cases[0]) return f.base;
    if (f.cases?.[c]) return f.cases[c];
    if (m.caseAff?.[c]) return join(lang.ph, f.base, m.caseAff[c], { harmonyFrom: 'left' });
    return f.base;
  };
  return `<p>${m.proDrop ? 'Because the verb shows the person of the subject, subject pronouns are usually dropped and used only for emphasis.' : 'Subject pronouns are always expressed.'}</p>
  <div class="scroll"><table class="data"><tr><th></th><th>${showCases.length ? CASES[m.cases[0]].name : 'Form'}</th>${showCases.slice(1).map(c => `<th>${CASES[c].name}</th>`).join('')}</tr>
  ${pr.list.map(p => `<tr><th>${esc(PERSON_NAMES[p] || p)}</th>${(showCases.length ? showCases : [null]).map(c => { const s = c ? caseForm(p, c) : pr.forms[p].base; return `<td>${rom(lang, s)}${usesOwnScript(lang) ? ' ' + native(lang, s, { size: 18, cls: 'small' }) : ''}</td>`; }).join('')}</tr>`).join('')}</table></div>
  ${interlinear(lang, lang.examples.general.pron)}`;
}

function grVerbs(lang) {
  const { morph: m } = lang;
  const v = lang.lex.byGloss.walk;
  const persons = PERSONS;
  let out = `<p>Tenses: ${m.tenses.map(t => TENSE_NAMES[t]).join(', ')}.${m.aspect ? ' Verbs also distinguish <b>imperfective</b> (ongoing, repeated) from <b>perfective</b> (completed) aspect.' : ''}</p>`;
  if (m.type === 'isolating') {
    out += `<p>Time and aspect are shown by particles placed ${m.particlePos} the verb:</p><table class="data">${m.tenses.map(t => `<tr><td>${TENSE_NAMES[t]}</td><td>${m.tenseParticles[t].length ? rom(lang, m.tenseParticles[t]) : '∅'}</td></tr>`).join('')}${m.aspectParticles ? `<tr><td>completed action</td><td>${rom(lang, m.aspectParticles.PFV)}</td></tr><tr><td>ongoing action</td><td>${rom(lang, m.aspectParticles.PROG)}</td></tr>` : ''}</table>`;
  } else {
    out += `<p>The dictionary form is ${rom(lang, citationVerb(lang, v))} ‘to walk’. ${m.type === 'agglutinative' ? `A verb is built as: root${m.aspect ? ' + aspect' : ''}${m.negAff ? ' (+ negative)' : ''} + tense${m.evidentialAff ? ' (+ evidential)' : ''}${m.personAff ? ' + person' : ''}.` : 'Each ending expresses tense and person together.'}</p>`;
    const tables = [v];
    if (m.conjugations?.length > 1) { const v2 = lang.lex.entries.find(e => e.pos === 'v' && e.conj !== v.conj && e.gloss !== 'be'); if (v2) tables.push(v2); }
    if (m.ablaut) { const sv = lang.lex.entries.find(e => e.pos === 'v' && e.strong && e.gloss !== 'be'); if (sv) tables.push(sv); }
    for (const verb of tables) {
      out += `<div class="scroll"><table class="data paradigm"><caption>${rom(lang, citationVerb(lang, verb))} ‘to ${esc(displayGloss(verb.gloss))}’${verb.strong ? ' (strong verb: the vowel changes in the past)' : m.conjugations ? ` (conjugation ${verb.conj + 1})` : ''}</caption><tr><th></th>${m.tenses.map(t => `<th>${TENSE_NAMES[t]}</th>`).join('')}</tr>
      ${(m.verbAgreement === 'person' ? persons : ['3SG']).map(p => `<tr><th>${m.verbAgreement === 'person' ? esc(PERSON_NAMES[p]) : 'all persons'}</th>${m.tenses.map(t => `<td>${rom(lang, inflectVerb(lang, verb, { tense: t, person: p }).segs)}</td>`).join('')}</tr>`).join('')}</table></div>`;
    }
    if (m.aspect && m.aspectAff) out += `<p>The perfective is marked by ${m.aspectAff.side === 'prefix' ? 'the prefix' : 'the suffix'} ${rom(lang, m.aspectAff.PFV)}: ${rom(lang, inflectVerb(lang, v, { tense: 'PST', person: '3SG', aspect: 'PFV' }).segs)} ‘(s)he walked (and arrived)’.</p>`;
    if (m.evidentialAff) out += `<p>An <b>evidential</b> suffix ${rom(lang, m.evidentialAff)} marks events the speaker did not see: ${rom(lang, inflectVerb(lang, v, { tense: 'PST', person: '3SG', evid: true }).segs)} ‘(s)he walked, they say’.</p>`;
    if (m.politeAff) out += `<p>A polite suffix ${rom(lang, m.politeAff)} is added when speaking to elders and strangers.</p>`;
  }
  const { count, total } = m.irregularVerbs;
  const example = lang.lex.entries.find(entry => entry.pastStem);
  out += `<h3>Irregular verbs</h3><p>${count} of ${total} dictionary verbs have exceptional forms.${example ? ` For ‘${esc(displayGloss(example.gloss))}’, the usual stem ${rom(lang, example.segs)} becomes ${rom(lang, example.pastStem)} in the past.` : ''}</p>`;
  const be = lang.lex.byGloss.be;
  if (be.suppletive) out += `<h3>The verb ‘to be’</h3><p>‘To be’ is irregular in the ${TENSE_NAMES[m.tenses[0]]}: ${PERSONS.map(p => `${rom(lang, be.suppletive[m.tenses[0]][p])} (${esc(PERSON_NAMES[p].split(' ')[0])})`).join(', ')}.</p>`;
  else if (m.zeroCopula) out += `<h3>The verb ‘to be’</h3><p>In the ${TENSE_NAMES[m.tenses[0]]}, ‘to be’ is simply left out: “this woman wise”.</p>`;
  out += interlinear(lang, lang.examples.general.dem);
  out += interlinear(lang, lang.examples.general.past);
  out += interlinear(lang, lang.examples.general.fut);
  return out;
}

function grSyntax(lang) {
  const { syntax: sx, morph: m, controls: ctl } = lang;
  const qTxt = m.questionParticle ? `Yes/no questions add the particle ${rom(lang, m.questionParticle)} at the ${m.questionPos === 'initial' ? 'start' : 'end'} of the sentence.` : 'Yes/no questions are made with rising intonation only.';
  const negTxt = m.type === 'agglutinative' && m.negAff ? `Negation is a suffix on the verb, ${rom(lang, m.negAff)}.` : `Negation is the particle ${rom(lang, m.negation)}, placed ${m.negPos === 'beforeVerb' ? 'before the verb' : m.negPos === 'afterVerb' ? 'after the verb' : 'at the end of the sentence'}.`;
  return `<p>The basic order is <b>${ctl.order}</b> (${ORDER_NAMES[ctl.order]}).${sx.v2 ? ' In main clauses the verb must be the <b>second</b> element: if an adverb comes first, the subject moves after the verb.' : ''}</p>
  <ul>
    <li>${m.adposSide === 'post' ? 'Postpositions follow' : 'Prepositions precede'} their noun.</li>
    <li>A possessor comes ${sx.genPos} the possessed noun; adjectives come ${sx.adjPos} it; numerals ${sx.numPos} it.</li>
    <li>Relative clauses come ${sx.relPos} the noun they modify.</li>
    <li>Question words (who, what, where) ${sx.whFront ? 'move to the front of the sentence' : 'stay where the answer would be'}.</li>
    ${m.proDrop ? '<li>Subject pronouns are usually dropped.</li>' : ''}
    ${m.topicMarker ? `<li>A topic can be marked with ${rom(lang, m.topicMarker)} after the noun phrase.</li>` : ''}
  </ul>
  ${interlinear(lang, lang.examples.general.basic)}
  <h3>Negation</h3><p>${negTxt}</p>${interlinear(lang, lang.examples.general.neg)}
  <h3>Questions</h3><p>${qTxt}</p>${interlinear(lang, lang.examples.general.q)}
  <h3>Possession</h3>${interlinear(lang, lang.examples.general.poss)}`;
}

function grDerivation(lang) {
  const { morph: m, lex } = lang;
  const derived = lex.entries.filter(e => e.deriv);
  const byType = {};
  for (const e of derived) (byType[e.deriv.type] ||= []).push(e);
  const names = { AGT: 'person who does', PLACE: 'place of', NMLZ: 'action / result noun', ABST: 'quality (-ness)', CAUS: 'causative (make someone do)', COMP: 'compounds', NUM: 'compound numerals' };
  const rows = Object.entries(byType).map(([t, list]) => `<tr><td>${esc(names[t] || t)}</td><td>${t === 'COMP' || t === 'NUM' ? '' : m.patterns && lang.ph.templatic ? 'vowel pattern' : `${m.derivSide === 'prefix' ? '' : '-'}${rom(lang, m.deriv[t])}${m.derivSide === 'prefix' ? '-' : ''}`}</td><td>${list.slice(0, 4).map(e => `${rom(lang, e.segs)} ‘${esc(displayGloss(e.gloss))}’ <span class="muted">&lt; ${e.deriv.from.map(f => `${esc(lang.romanize(lex.byGloss[f].segs))}`).join(' + ')}</span>`).join('<br>')}</td></tr>`).join('');
  const tmpl = lang.ph.templatic && m.patterns ? `<p>Words are built from <b>roots of three consonants</b> slotted into vowel patterns. The root ${rootDemo(lang)}</p>` : '';
  return `${tmpl}<p>New words are formed ${lang.ph.templatic ? 'by changing the vowel pattern of a root' : m.derivSide === 'prefix' ? 'with prefixes' : 'with suffixes'} and by compounding (${m.compoundOrder === 'modifier-head' ? 'the modifier comes first' : 'the head comes first'}${m.linker ? `, joined by -${rom(lang, m.linker)}-` : ''}). ${Math.round(lex.derivRate * 100)}% of the derivable words in the core vocabulary are actually derived.</p>
  <table class="data">${rows}</table>`;
}

function rootDemo(lang) {
  const groups = {};
  for (const e of lang.lex.entries) if (e.root) (groups[e.root.join('')] ||= []).push(e);
  const best = Object.values(groups).sort((a, b) => b.length - a.length)[0];
  if (!best) return '';
  return `<b class="ipa">${esc(best[0].root.map(c => lang.rom.map[c]).join('-'))}</b> gives ${best.slice(0, 5).map(e => `${rom(lang, e.segs)} ‘${esc(displayGloss(e.gloss))}’`).join(', ')}.`;
}

// ---------- VOCABULARY ----------
export function vocabRows(lang) {
  const m = lang.morph;
  const functionRow = (en, pos, segs, note = '') => ({
    en, pos, segs, note, rom: lang.romanize(segs), ipa: lang.ipa(segs), gender: '',
  });
  const functionWords = lang.pronouns.list.map(p =>
    functionRow(PERSON_NAMES[p] || p, 'pron', lang.pronouns.forms[p].base));
  if (m.articles) {
    for (const [type, gloss] of [['def', 'the'], ['indef', 'a / an']]) {
      for (const [g, segs] of Object.entries(m.articles[type] || {})) {
        const label = m.genders.find(x => x.id === g)?.name;
        const side = m.articles.side === 'suffix' ? 'suffix' : '';
        functionWords.push(functionRow(gloss, 'art', segs, [label, side].filter(Boolean).join(', ')));
      }
    }
  }
  return lang.lex.entries.map(e => {
    const form = e.pos === 'v' ? citationVerb(lang, e) : e.segs;
    let note = '';
    if (e.deriv) note = `from ${e.deriv.from.map(f => lang.romanize(lang.lex.byGloss[f].segs) + ' ‘' + displayGloss(f) + '’').join(' + ')}`;
    else if (e.borrowed) {
      const loan = e.loan;
      const source = loan.family ? FAMILIES[loan.family].name : lang.descent?.influence?.donorName;
      const date = loan.borrowedYearsAgo === 0 ? ', borrowed today' : Number.isFinite(loan.borrowedYearsAgo) ? `, borrowed ${loan.borrowedYearsAgo} years ago` : '';
      note = `loan from ${source} ${loan.donorForm.join('')}${date}`;
      if (loan.coined) note += ' (coined donor form)';
      if (loan.displaced) note += `, replacing inherited *${loan.displaced.join('')}`;
    }
    else if (e.inherited && lang.descent) note = `< ${lang.descent.path.protoName} *${e.proto.join('').replace(/ː/g, '\u0304')}`;
    else if (e.coined && lang.descent) note = e.replacedInherited ? `new word: the inherited *${e.replacedInherited.proto.join('')} had become identical to ‘${displayGloss(e.replacedInherited.mergedWith)}’` : 'later coinage';
    else if (e.proto && lang.romanize(e.proto) !== lang.romanize(e.segs)) note = `< *${lang.romanize(e.proto)}`;
    if (e.pastStem && !e.strong) note += (note ? '; ' : '') + 'past stem ' + lang.romanize(e.pastStem);
    if (e.strong) note += (note ? '; ' : '') + 'strong verb, past ' + lang.romanize(inflectVerb(lang, e, { tense: 'PST', person: '3SG' }).segs);
    if (e.brokenPlural) note += (note ? '; ' : '') + 'pl. ' + lang.romanize(e.brokenPlural);
    if (e.exempt?.length) note += (note ? '; ' : '') + 'conservative form';
    if (e.gloss === 'have' && (lang.q?.datPoss || lang.q?.locPoss || lang.q?.existPoss)) note += (note ? '; ' : '') + 'means ‘hold, keep’; possession uses another construction (grammar §11)';
    const gender = e.gender ? (m.genders.find(g => g.id === e.gender)?.name.split(' (')[0] ?? e.gender) : '';
    return { en: displayGloss(e.gloss), pos: e.pos, segs: form, rom: lang.romanize(form), ipa: lang.ipa(form), gender, note, roots: e.deriv?.from };
  }).concat(functionWords, (lang.userWords || []).map(e => {
    const form = e.pos === 'v' ? citationVerb(lang, e) : e.segs;
    const gender = e.gender ? (m.genders.find(g => g.id === e.gender)?.name.split(' (')[0] ?? e.gender) : '';
    return { en: e.gloss, pos: e.pos, segs: form, rom: lang.romanize(form), ipa: lang.ipa(form), gender, note: 'coined in translation', isNew: true };
  }));
}

export { esc, sentenceRom };
