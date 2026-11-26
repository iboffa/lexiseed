// Orchestrator: generate(controls, seed) -> language. Pure: no DOM, no Math.random, runs in Node and the browser.
import { FAMILIES } from './data/families.js';
import { CASES } from './data/cases.js';
import { buildPhonology, shapeParams, buildRomanization, romanize, genWord, isV, vBase, toIPA } from './phonology.js';
import { chooseCascade } from './history.js';
import { buildMorphology, buildDeclensions, applyPattern, join, genAffix, PERSONS, inflectNoun, declensionOf } from './morphology.js';
import { buildLexicon, genShortWord, measureLexicon, sampleVowelPct } from './lexicon.js';
import { buildSyntax, buildClause } from './syntax.js';
import { buildOriginalScript, scriptCollisions } from './scripts.js';
import { stream, normSeed } from './rng.js';
import { applyCascade } from './history.js';
import { QUIRKS, chooseQuirks, applyQuirks } from './quirks.js';
import { DEGREE_STYLES, buildDegreeMarkers, configureIrregularVerbs } from './grammar-controls.js';
import { ROM } from './data/changes.js';
import { buildContacts, chooseInfluence, INFLUENCE_FAMILIES, validateContacts } from './influence.js';
import { hasDescent, chooseDescent, inventoryFrom, cascadeAdapter, descentLexicon, ancestorGrammar } from './descent.js';

export const VERSION = '3.1.0';

export const CONTROL_DEFS = {
  family: { values: Object.keys(FAMILIES), default: 'original' },
  vowelPct: { min: 25, max: 65, step: 1 },
  wordLen: { min: 1, max: 4, step: 0.1 },
  complexity: { min: 1, max: 5, step: 1 },
  caseOn: { values: [true, false] },
  caseCount: { min: 2, max: 14, step: 1 },
  morph: { values: ['agglutinative', 'fusional', 'isolating'] },
  order: { values: ['SOV', 'SVO', 'VSO', 'VOS', 'OVS', 'OSV'] },
  alignment: { values: ['accusative', 'ergative'] },
  gender: { values: ['none', 'animacy', 'two', 'three', 'classes'] },
  number: { values: ['sgpl', 'dual', 'none'] },
  articles: { values: ['none', 'definite', 'both'] },
  tone: { values: ['none', 'two', 'many'] },
  harmony: { values: [true, false] },
  tam: { values: ['simple', 'standard', 'rich'] },
  script: { values: ['latin', 'ipa', 'cyrillic', 'greek', 'georgian', 'armenian', 'runic', 'arabic', 'hebrew', 'devanagari', 'original'] },
  scriptType: { values: ['alphabet', 'abjad', 'abugida', 'syllabary'] },
  irregularity: { min: 0, max: 100, step: 1 },
  comparative: { values: DEGREE_STYLES },
  superlative: { values: DEGREE_STYLES },
  quirks: { values: ['none', 'few', 'many'] },
  ancestry: { values: ['real', 'invented'] },
  drift: { min: 0, max: 100, step: 5 },
  influence: { values: ['none', ...INFLUENCE_FAMILIES] },
  influenceLevel: { values: ['light', 'heavy'] },
  scriptStyle: { values: ['blocks', 'capitals', 'rounded', 'runic', 'brush', 'geometric', 'brahmic', 'cursive'] },
};

// Fill every control left on 'auto' from the family's ranges, one stream per control (locality).
export function resolveControls(input, seed) {
  const family = FAMILIES[input.family] ? input.family : 'original';
  const p = FAMILIES[family];
  const g = p.grammar;
  const out = { family };
  const auto = {};
  const r = (name) => stream(seed, 'auto', name);
  const set = (name, fn) => { if (input[name] === undefined || input[name] === 'auto' || input[name] === null || input[name] === '') { out[name] = fn(r(name)); auto[name] = true; } else out[name] = input[name]; };
  set('vowelPct', x => Math.round(x.range(p.vowelPct[0], p.vowelPct[1])));
  set('wordLen', x => Math.round(x.range(p.wordLen[0], p.wordLen[1]) * 10) / 10);
  set('complexity', x => x.int(p.complexity[0], p.complexity[1]));
  out.features = Object.fromEntries(Object.keys(QUIRKS)
    .filter(id => ['on', 'off'].includes(input.features?.[id])).map(id => [id, input.features[id]]));
  set('morph', x => {
    const pins = out.features;
    if (pins.defConj === 'on' || pins.incorp === 'on') return 'agglutinative';
    if (pins.serial === 'on') return 'isolating';
    if (pins.adjVerb === 'on' || pins.redup === 'on') {
      const compatible = Object.entries(g.morph).filter(([type, weight]) => type !== 'fusional' && weight > 0);
      return compatible.length ? x.weighted(compatible) : 'agglutinative';
    }
    return x.weighted(g.morph);
  });
  set('caseOn', x => x.chance(g.caseOn));
  set('caseCount', x => Math.max(2, x.int(g.caseCount[0] || 2, Math.max(g.caseCount[1], 2))));
  set('order', x => x.weighted(g.order));
  set('alignment', x => x.weighted(g.alignment));
  set('gender', x => {
    const noClasses = ['defConj', 'incorp', 'redup'].some(id => out.features[id] === 'on');
    if (!noClasses) return x.weighted(g.gender);
    const compatible = Object.entries(g.gender).filter(([gender, weight]) => gender !== 'classes' && weight > 0);
    return compatible.length ? x.weighted(compatible) : 'none';
  });
  set('number', x => x.weighted(g.number));
  set('articles', x => x.weighted(g.articles));
  set('tone', x => x.weighted(g.tone));
  set('harmony', x => x.chance(g.harmony));
  set('tam', x => x.weighted(g.tam));
  set('script', () => p.script);
  set('scriptType', () => 'auto');
  set('scriptStyle', () => 'auto');
  set('irregularity', x => x.int(3, 18));
  out.irregularity = Math.max(0, Math.min(100, Math.round(Number(out.irregularity) || 0)));
  for (const name of ['comparative', 'superlative']) {
    set(name, x => out.morph === 'isolating' ? 'particle' : x.weighted({ suffix: 4, particle: 3, prefix: 1 }));
    if (!DEGREE_STYLES.includes(out[name])) out[name] = 'particle';
  }
  set('quirks', () => 'few');
  set('ancestry', () => (hasDescent(family) ? 'real' : 'invented'));
  if (out.ancestry === 'real' && !hasDescent(family)) out.ancestry = 'invented';
  set('drift', x => 5 * Math.round(x.range(70, 90) / 5));
  set('influence', () => 'none');
  set('influenceLevel', () => 'light');
  if (input.contacts != null) out.contacts = validateContacts(input.contacts);
  if (out.ancestry !== 'real' || out.contacts) out.influence = 'none';
  for (const k of ['vowelPct', 'wordLen', 'complexity', 'caseCount', 'drift']) out[k] = Number(out[k]);
  for (const k of ['caseOn', 'harmony']) out[k] = out[k] === true || out[k] === 'true' || out[k] === 'yes';
  return { ctl: out, auto };
}

function validate(ctl, profile) {
  const notes = [];
  if (ctl.morph === 'isolating' && ctl.caseOn) notes.push({ level: 'info', text: 'Isolating morphology has no inflection, so the cases are written as separate particles after (or before) the noun phrase.' });
  if (ctl.gender === 'classes' && ctl.morph === 'isolating') { notes.push({ level: 'warn', text: 'Noun classes need prefixes; an isolating language cannot have them. Gender was set to none.' }); ctl.gender = 'none'; }
  if (ctl.morph === 'isolating' && ['two', 'three', 'animacy'].includes(ctl.gender)) notes.push({ level: 'info', text: 'An isolating language shows gender only on articles and pronouns.' });
  if (ctl.alignment === 'ergative' && !ctl.caseOn) notes.push({ level: 'info', text: 'Ergative alignment without cases is visible only in the order of words and in verb agreement; it is shown in the grammar as a description.' });
  if (ctl.tone !== 'none' && ctl.wordLen > 2.5) notes.push({ level: 'info', text: 'Tone languages tend to have short words; long words will carry many tone marks.' });
  if (ctl.harmony && ctl.morph === 'isolating') notes.push({ level: 'info', text: 'Vowel harmony applies inside roots only, since an isolating language has no suffixes to harmonise.' });
  void profile;
  return notes;
}

export function generate(input = {}, seedIn = '0') {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const seed = normSeed(seedIn);
  const { ctl, auto } = resolveControls(input, seed);
  const profile = FAMILIES[ctl.family];
  const notes = validate(ctl, profile);

  const ph = buildPhonology(profile, ctl, seed);
  // descent from a real ancestor: inventory and history come from the evolved ancestor words
  const descent = ctl.ancestry === 'real' ? chooseDescent(ctl.family, ctl, auto, seed) : null;
  if (descent) {
    const g = ancestorGrammar(descent.path, descent.P);
    const extra = [];
    const walk = (x) => { if (Array.isArray(x)) { if (x.every(y => typeof y === 'string')) extra.push(x); else x.forEach(walk); } else if (x && typeof x === 'object') Object.values(x).forEach(walk); };
    walk(g);
    descent.nativeSegs = [...Object.values(descent.words).map(w => w.segs), ...extra.filter(x => x.length)];
    inventoryFrom(ph, descent.nativeSegs);
    descent.influence = chooseInfluence(ctl, seed, descent);
  }
  const cascade = descent ? cascadeAdapter(descent.path) : chooseCascade(ph, ctl.family, seed);

  // ---- calibrate consonant pressure k so that vowel % hits the target ----
  // morphology first: it does not depend on the calibration, and templatic calibration needs its patterns
  const morph = buildMorphology(ph, ctl, profile, seed);
  const blend = buildContacts(ctl, seed, descent, ph, cascade);
  // loans join the inventory only after the grammar is built: native endings and grammar choices stay as without contact
  if (descent?.influence) inventoryFrom(ph, [...descent.nativeSegs, ...Object.values(descent.influence.loans).map(l => l.segs)]);
  if (descent && Object.keys(blend.words).length) inventoryFrom(ph, [...descent.nativeSegs, ...Object.values(blend.words).map(l => l.segs)]);
  let k = 0.5, achieved = null;
  if (!descent) {
    let lo = 0, hi = 1;
    const sample = (kk) => sampleVowelPct(ph, kk, seed, cascade, ctl.wordLen, morph);
    const vLo = sample(1), vHi = sample(0);
    if (ctl.vowelPct >= vHi) { k = 0; achieved = vHi; }
    else if (ctl.vowelPct <= vLo) { k = 1; achieved = vLo; }
    else {
      for (let i = 0; i < 12; i++) { k = (lo + hi) / 2; const v = sample(k); if (v > ctl.vowelPct) lo = k; else hi = k; }
      k = (lo + hi) / 2;
    }
  }
  const shape = { ...shapeParams(ph, k), templatic: k };
  const romProfile = descent ? { ...profile, romPrefs: { ...profile.romPrefs, ...(ROM[ctl.family]?._ || {}), ...(ROM[ctl.family]?.[descent.path.anchor] || {}) }, spelling: ctl.family === 'romance' && !['spanish', 'portuguese'].includes(descent.path.anchor) ? [] : profile.spelling } : profile;
  const rom = buildRomanization(ph, romProfile, seed);
  const lang = { version: VERSION, seed, controls: ctl, auto, profile, ph, cascade, shape, rom, notes, descent,
    contacts: blend.contacts, contactWords: blend.words, contactRootCount: blend.rootCount };
  lang.romanize = (segs) => romanize(ph, rom, segs);
  lang.ipa = (segs) => toIPA(ph, segs);

  morph.degreeMarkers = buildDegreeMarkers(ph, seed);
  lang.morph = morph;
  lang.lex = descent ? descentLexicon(lang, ctl, seed, descent) : buildLexicon(lang, ctl, seed);
  const lex = lang.lex;
  const m = lang.morph;

  // ---- fusional declensions + gender assignment ----
  const nouns = lex.entries.filter(e => e.pos === 'n');
  if (m.pendingDeclensions) buildDeclensions(ph, m, nouns, seed);
  assignGender(lang, nouns, seed);
  const verbs = lex.entries.filter(e => e.pos === 'v');
  const vr = stream(seed, 'verbs', 'classes');
  for (const v of verbs) {
    v.conj = m.conjugations ? vr.int(0, m.conjugations.length - 1) : 0;
  }
  if (m.type === 'fusional') {
    const be = lex.byGloss.be;
    const sr = stream(seed, 'verbs', 'copula');
    const used = new Set();
    be.suppletive = { [m.tenses[0]]: {} };
    for (const p of PERSONS) be.suppletive[m.tenses[0]][p] = sr.chance(0.25) && p !== '1SG' ? be.suppletive[m.tenses[0]]['1SG'] : genAffix(ph, sr, ph.codaCap ? ['V', 'VC', 'CV', 'CVC'] : ['V', 'CV'], used);
  }
  if (profile.special.brokenPlurals && m.patterns) {
    const br = stream(seed, 'lexicon', 'broken-plurals');
    for (const n of nouns) if (n.root && m.numbers.includes('PL') && stream(seed, 'broken-plural', n.gloss).chance(ctl.irregularity / 100)) n.brokenPlural = applyCascade(cascade, ph, applyPattern(m.patterns.PL, n.root), br).segs;
  }

  // ---- pronouns ----
  lang.pronouns = buildPronouns(lang, seed);
  if (descent) applyAncestorGrammar(lang, ancestorGrammar(descent.path, descent.P));
  if (m.nounClasses) {
    lang.subjAgr = {};
    const ar = stream(seed, 'verbs', 'agreement');
    const used = new Set(m.used);
    for (const p of PERSONS) lang.subjAgr[p] = { segs: genAffix(ph, ar, ['CV', 'V'], used), gloss: p };
  }

  configureIrregularVerbs(lang, verbs);

  // ---- peculiar features (own stream) ----
  applyQuirks(lang, chooseQuirks(lang, seed, ctl.quirks), seed);

  // ---- syntax + script ----
  // verb-second only when the user left word order on Auto and the base order is SOV/SVO; never override a pinned order
  if (m.v2 && (!auto.order || !['SOV', 'SVO'].includes(ctl.order))) m.v2 = false;
  lang.syntax = buildSyntax(lang, ctl, seed);
  lang.script = ctl.script === 'original' ? buildOriginalScript(ph, ctl, seed) : { id: ctl.script };
  if (lang.script.notes) for (const t of lang.script.notes) notes.push({ level: 'info', text: t });
  if (ctl.script !== 'original') lang.originalPreview = null;

  // ---- name ----
  lang.name = makeName(lang, seed);

  // ---- examples ----
  lang.examples = buildExamples(lang);
  lang.story = buildStory(lang);

  // ---- measurements ----
  const meas = measureLexicon(lang, lex.entries);
  lang.measured = { ...meas, homophoneRejections: lex.rejections, k, glyphCollisions: lang.script.id === 'original' ? scriptCollisions(lang.script) : 0 };
  // Auto never warns about its own pick: an Auto control reports the value the family's structure actually reached
  if (auto.vowelPct) ctl.vowelPct = Math.round(meas.vowelPct);
  if (auto.wordLen) ctl.wordLen = Math.round(meas.meanSyllables * 10) / 10;
  if (descent && !auto.vowelPct && Math.abs(meas.vowelPct - ctl.vowelPct) > 4) notes.push({ level: 'warn', text: `Vowel share reached ${meas.vowelPct.toFixed(0)}% (target ${ctl.vowelPct}%): the closest of the family's simulated sound histories. Words inherited from ${descent.path.protoName} cannot be reshaped freely; choose ancestry “invented” for full control.` });
  else if (!descent && Math.abs(meas.vowelPct - ctl.vowelPct) > 4) {
    notes.push({ level: 'warn', text: `Vowel share reached ${meas.vowelPct.toFixed(0)}% (target ${ctl.vowelPct}%). ${meas.vowelPct > ctl.vowelPct ? 'Phoneme complexity ' + ctl.complexity + ' allows too few consonant clusters; raise complexity or the target.' : 'This family’s syllable shapes require more consonants; lower the complexity or raise the target.'}` });
  }
  if (Math.abs(meas.meanSyllables - ctl.wordLen) > 0.35 && !(descent && auto.wordLen)) notes.push({ level: 'warn', text: `Mean word length reached ${meas.meanSyllables.toFixed(1)} syllables (target ${ctl.wordLen}).` });
  lang.ms = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
  return lang;
}

// ---------- grammar inherited from the ancestor (overrides the generated forms where the ancestor had them) ----------
function applyAncestorGrammar(lang, g) {
  const m = lang.morph, ph = lang.ph;
  const ok = (x) => x && x.length;
  lang.inherited = [];
  if (ok(g.negation)) { m.negation = g.negation; lang.inherited.push('negation'); }
  if (g.pronouns) for (const [p, segs] of Object.entries(g.pronouns)) {
    if (!ok(segs)) continue;
    const ids = Object.keys(lang.pronouns.forms).filter(k => k === p || k.startsWith(p + '.') || (p === '3SG' && k.startsWith('3SG')));
    for (const id of ids) { lang.pronouns.forms[id] = { ...lang.pronouns.forms[id], base: segs, cases: {} }; }
    if (ids.length) lang.inherited.push('pronoun ' + p);
  }
  if (g.adpos) for (const [r, segs] of Object.entries(g.adpos)) if (ok(segs) && m.adpos[r]) m.adpos[r] = segs;
  if (m.articles && g.article) {
    for (const k of Object.keys(m.articles.def)) if (ok(g.article.def)) m.articles.def[k] = g.article.def;
    if (m.articles.indef) for (const k of Object.keys(m.articles.indef)) if (ok(g.article.indef)) m.articles.indef[k] = g.article.indef;
    lang.inherited.push('articles');
  }
  if (m.type === 'fusional' && (g.person || g.case)) m.inheritedEndings = true;
  if (m.type === 'fusional' && m.conjugations && g.person) {
    const cj = m.conjugations[0];
    for (const t of m.tenses) { const src = g.person[t] || (t === 'NPST' ? g.person.PRS : null); if (!src) continue; for (const p of Object.keys(cj.endings[t])) if (src[p] && (src[p].length || p === '3SG')) cj.endings[t][p] = src[p]; }
    if (ok(g.infinitive)) cj.infinitive = g.infinitive;
    lang.inherited.push('verb endings');
  }
  if (m.type === 'agglutinative') {
    if (ok(g.plural) && m.numAff?.PL) m.numAff.PL = g.plural;
    if (g.person && m.personAff) { const src = g.person.PRS || Object.values(g.person)[0]; for (const p of Object.keys(m.personAff)) if (src?.[p]) m.personAff[p] = src[p]; lang.inherited.push('person suffixes'); }
    if (g.case && m.caseAff) {
      const generated = { ...m.caseAff };
      for (const c of Object.keys(m.caseAff)) {
        const e = g.case[c]?.SG;
        if (!e || !(e.length || c === m.cases[0])) continue;
        // keep a case distinct: an inherited suffix that sound change merged with another case is not used
        const same = (a, b) => a.join() === b.join() || [ph.epenthetic, ...a].join() === b.join() || a.join() === [ph.epenthetic, ...b].join(); // epenthesis can make them meet
        if (Object.entries(m.caseAff).some(([c2, a]) => c2 !== c && same(a, e))) continue;
        if (m.numAff && Object.values(m.numAff).some(a => a.join() === e.join())) continue; // would look like the plural
        m.caseAff[c] = e;
      }
      // final check on real nouns: if two case forms still meet, the later case keeps its generated suffix
      for (let guard = 0; guard < 12; guard++) {
        let clash = null;
        for (const gl of ['house', 'water', 'king', 'mother']) {
          const n = lang.lex.byGloss[gl]; if (!n) continue;
          const seen = new Map();
          for (const c of m.cases) for (const num of m.numbers) {
            const f = inflectNoun(lang, n, { kase: c, number: num }).segs.join(' ');
            const c0 = seen.get(f);
            if (c0 && c0 !== c) { clash = [c, c0].find(x => m.caseAff[x] !== generated[x]) || null; if (clash) break; }
            seen.set(f, c);
          }
          if (clash) break;
        }
        if (!clash) break;
        m.caseAff[clash] = generated[clash];
      }
      lang.inherited.push('case suffixes');
    }
    if (ok(g.infinitive)) m.infinitive = g.infinitive;
  }
  if (m.declensions && g.case) {
    const gen = m.declensions.map(d => JSON.parse(JSON.stringify(d.endings)));
    const apply = (d, src) => { for (const c of m.cases) for (const n of m.numbers) { const e = src[c]?.[n]; if (e) d.endings[c][n] = e; } };
    apply(m.declensions[0], g.case);
    if (g.caseAlt && m.declensions[1]) apply(m.declensions[1], g.caseAlt);
    // where vowel replacement makes two cells of a real noun meet, that cell keeps its generated ending
    for (let guard = 0; guard < 20; guard++) {
      let fix = null;
      for (const gl of ['house', 'water', 'king', 'mother', 'wolf', 'dog']) {
        const n = lang.lex.byGloss[gl]; if (!n) continue;
        const seen = new Map();
        for (const c of m.cases) for (const num of m.numbers) { const f = inflectNoun(lang, n, { kase: c, number: num }).segs.join(' '); if (seen.has(f)) { const [c0, n0] = seen.get(f); const d = declensionOf(m, n); const k = m.declensions.indexOf(d); if ((d.endings[c][num] || []).join() !== (d.endings[c0][n0] || []).join()) { const cand = [[c, num], [c0, n0]].find(([cc, nn]) => JSON.stringify(gen[k][cc][nn]) !== JSON.stringify(d.endings[cc][nn])); if (cand) { fix = [d, k, ...cand]; break; } } } seen.set(f, [c, num]); }
        if (fix) break;
      }
      if (!fix) break;
      const [d, k, c, num] = fix; d.endings[c][num] = gen[k][c][num];
    }
    for (const d of m.declensions.slice(0, 2)) { // endings merged by sound change are inherited syncretisms
      const cells = m.cases.flatMap(c => m.numbers.map(n => [c, n]));
      for (let i = 0; i < cells.length; i++) for (let j = i + 1; j < cells.length; j++) {
        const [c1, n1] = cells[i], [c2, n2] = cells[j];
        if ((d.endings[c1][n1] || []).join() === (d.endings[c2][n2] || []).join() && !d.syncretism.some(x => x.startsWith(`${c1}.${n1} =`))) d.syncretism.push(`${c1}.${n1} = ${c2}.${n2} (merged by sound change)`);
      }
    }
    lang.inherited.push('case endings');
  }
  if (m.nounClasses && g.classPrefixes) {
    const pairs = [['1', '2'], ['3', '4'], ['5', '6'], ['7', '8'], ['9', '10'], ['11', '14']];
    m.genders.forEach((gd, i) => { const [a, b] = pairs[i] || []; if (g.classPrefixes[a]) gd.prefix.SG = g.classPrefixes[a]; if (g.classPrefixes[b]) gd.prefix.PL = g.classPrefixes[b]; });
    for (const n of lang.lex.entries) if (n.cls) { const c = String(n.cls); const gd = m.genders.find(x => x.id.replace('CL', '').split('/').includes(c)); if (gd) n.gender = gd.id; }
    lang.inherited.push('noun-class prefixes');
  }
  const be = lang.lex.byGloss.be;
  if (g.copula && m.type === 'fusional' && be) {
    be.suppletive = { [m.tenses[0]]: {} };
    for (const p of PERSONS) be.suppletive[m.tenses[0]][p] = ok(g.copula[p]) ? g.copula[p] : (g.copula['3SG'] || be.segs);
    lang.inherited.push('the verb “be”');
  }
  void ph;
}

// ---------- gender / noun classes ----------
function assignGender(lang, nouns, seed) {
  const m = lang.morph;
  if (!m.genders.length) return;
  const rng = stream(seed, 'morphology', 'gender');
  const NATURE = new Set(['tree', 'forest', 'leaf', 'flower', 'grass', 'mountain', 'river', 'sea', 'lake', 'field', 'earth', 'sky', 'cloud', 'wind', 'rain', 'snow', 'island', 'stone', 'fire', 'water', 'sun', 'moon', 'star']);
  const TOOL = new Set(['knife', 'sword', 'cup', 'boat', 'door', 'book', 'house', 'bread', 'iron', 'gold', 'gift', 'thing', 'roof', 'road']);
  for (const n of nouns) {
    if (m.nounClasses) {
      const sem = n.tags.includes('h') ? 'h' : n.tags.includes('a') ? 'a' : NATURE.has(n.gloss) ? 'nature' : TOOL.has(n.gloss) ? 'tool' : (n.deriv?.type === 'ABST' || n.deriv?.type === 'NMLZ' || ['love', 'peace', 'truth', 'law', 'time', 'way', 'name', 'dream', 'spirit', 'life', 'death', 'fear'].includes(n.gloss)) ? 'abst' : 'thing';
      const g = m.genders.find(x => x.sem === sem) || m.genders[2];
      n.gender = rng.chance(0.9) ? g.id : rng.pick(m.genders).id;
      continue;
    }
    const ids = m.genders.map(g => g.id);
    if (ids.includes('AN')) { n.gender = n.tags.includes('h') || n.tags.includes('a') ? 'AN' : 'IN'; continue; }
    if (n.tags.includes('m') && ids.includes('M')) { n.gender = 'M'; continue; }
    if (n.tags.includes('f') && ids.includes('F')) { n.gender = 'F'; continue; }
    if (m.declensions) {
      const last = n.segs[n.segs.length - 1];
      const d = m.declensions.find(x => x.theme && isV(last) && vBase(last) === x.theme) || m.declensions[m.declensions.length - 1];
      n.gender = d.gender && rng.chance(0.82) ? d.gender : rng.pick(ids);
    } else {
      // gender predictable from the final sound in most nouns
      const last = n.segs[n.segs.length - 1];
      const h = (last.codePointAt(0) + (isV(last) ? 7 : 0)) % ids.length;
      n.gender = rng.chance(0.75) ? ids[h] : rng.pick(ids);
    }
  }
}

// ---------- pronouns ----------
function buildPronouns(lang, seed) {
  const { ph, morph: m, controls: ctl, profile } = lang;
  const used = new Set();
  const sp = shapeParams(ph, 0.4);
  const forms = {};
  const list = [];
  const persons = ['1SG', '2SG'];
  const g3 = m.genders.length && !m.nounClasses && m.genders.length <= 3 ? m.genders.map(g => '3SG.' + g.id) : ['3SG'];
  persons.push(...g3);
  if (m.numbers.includes('DU')) persons.push('1DU', '2DU', '3DU');
  if (profile.special.inclusiveExclusive) persons.push('1PL.INCL', '1PL.EXCL'); else persons.push('1PL');
  persons.push('2PL', '3PL');
  for (const p of persons) {
    const rng = stream(seed, 'pronouns', p);
    let segs;
    for (let attempt = 0; attempt < 48; attempt++) {
      const syllables = attempt < 16 && rng.chance(0.9) ? 1 : 2 + Math.floor(attempt / 32);
      segs = genShortWord(ph, sp, rng, syllables);
      if (!used.has(segs.join('')) && segs.length >= 2) break;
    }
    used.add(segs.join(''));
    forms[p] = { id: p, base: segs, cases: {} };
    list.push(p);
  }
  for (const p of list) {
    const entry = forms[p];
    if (m.type === 'fusional' && m.cases.length) {
      for (const c of m.cases.slice(1, 4)) {
        const rng = stream(seed, 'pronoun-exception', p, c);
        if (rng.chance(ctl.irregularity / 100)) {
          entry.cases[c] = genAffix(ph, rng, ph.codaCap ? ['CV', 'VC', 'CVC', 'V'] : ['CV', 'V', 'CVCV'], used);
        }
      }
      for (const c of m.cases.slice(1)) if (!entry.cases[c]) {
        const d = m.declensions[m.declensions.length - 1];
        entry.cases[c] = join(ph, entry.base, d.endings[c]?.SG ?? []);
      }
    }

  }
  // alias plain 3SG for templates
  if (!forms['3SG']) forms['3SG'] = forms[g3[0]];
  if (!forms['1PL']) forms['1PL'] = forms['1PL.INCL'];
  return { forms, list };
}

// ---------- name ----------
function makeName(lang, seed) {
  const rng = stream(seed, 'name');
  const sp = lang.shape;
  let segs, clean = '';
  for (let a = 0; a < 20; a++) {
    const n = lang.ph.family === 'sinitic' ? 2 : rng.int(2, 3);
    segs = applyCascade(lang.cascade, lang.ph, lang.coinProto ? lang.coinProto(rng, n) : genWord(lang.ph, sp, rng, n), rng).segs;
    const rom = lang.romanize(segs).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ʻʼ'`ʿʾ]/g, '');
    clean = rom.replace(/[^a-zA-Zþðæøłđßŋəıçşğñšžčřďťňľɛɔɨ]/g, '');
    if (clean.length >= 4 && clean.length <= 10 && !isV(segs[0]) && !/(.)\1\1/.test(clean)) break;
  }
  return { segs, native: clean.charAt(0).toUpperCase() + clean.slice(1), exonym: clean.charAt(0).toUpperCase() + clean.slice(1) };
}

// ---------- example sentences (each case gets one) ----------
const CASE_EXAMPLES = {
  NOM: { en: 'The man sleeps.', S: { n: 'man', def: true }, V: 'sleep' },
  ACC: { en: 'The woman sees the dog.', S: { n: 'woman', def: true }, V: 'see', O: { n: 'dog', def: true } },
  ABS: { en: 'The child sleeps.', S: { n: 'child', def: true }, V: 'sleep' },
  ERG: { en: 'The hunter sees the bird.', S: { n: 'hunter', def: true }, V: 'see', O: { n: 'bird', def: true } },
  GEN: { en: 'The king’s horse drinks water.', S: { n: 'horse', def: true, possN: { n: 'king', def: true } }, V: 'drink', O: { n: 'water' } },
  DAT: { en: 'The mother gives bread to the child.', S: { n: 'mother', def: true }, V: 'give', O: { n: 'bread' }, obl: [{ n: 'child', def: true, kase: 'DAT', role: 'recipient' }] },
  LOC: { en: 'The children sleep in the house.', S: { n: 'child', number: 'PL', def: true }, V: 'sleep', obl: [{ n: 'house', def: true, kase: 'LOC', role: 'location' }] },
  ABL: { en: 'The bird flies from the tree.', S: { n: 'bird', def: true }, V: 'fly', obl: [{ n: 'tree', def: true, kase: 'ABL', role: 'source' }] },
  INS: { en: 'The hunter kills the wolf with a knife.', S: { n: 'hunter', def: true }, V: 'kill', O: { n: 'wolf', def: true }, obl: [{ n: 'knife', indef: true, kase: 'INS', role: 'instrument' }] },
  COM: { en: 'The woman walks with her friend.', S: { n: 'woman', def: true }, V: 'walk', obl: [{ n: 'friend', def: true, kase: 'COM', role: 'companion' }] },
  VOC: { en: 'Friend, the king is coming!', vocative: 'friend', S: { n: 'king', def: true }, V: 'come' },
  ALL: { en: 'The people go to the city.', S: { n: 'people', def: true }, V: 'go', obl: [{ n: 'city', def: true, kase: 'ALL', role: 'goal' }] },
  ESS: { en: 'The old man lives as a king.', S: { n: 'man', adj: 'old', def: true }, V: 'live', obl: [{ n: 'king', kase: 'ESS', role: 'state' }] },
  PART: { en: 'The guest drinks some wine.', S: { n: 'guest', def: true }, V: 'drink', O: { n: 'wine', kase: 'PART' } },
  TRANS: { en: 'The water becomes snow.', S: { n: 'water', def: true }, V: 'become', obl: [{ n: 'snow', kase: 'TRANS', role: 'change' }] },
  ABE: { en: 'The warrior comes without a sword.', S: { n: 'warrior', def: true }, V: 'come', obl: [{ n: 'sword', kase: 'ABE', role: 'without' }] },
  INE: { en: 'The children sleep in the house.', S: { n: 'child', number: 'PL', def: true }, V: 'sleep', obl: [{ n: 'house', def: true, kase: 'INE' }] },
  ELA: { en: 'The dog runs out of the house.', S: { n: 'dog', def: true }, V: 'run', obl: [{ n: 'house', def: true, kase: 'ELA' }] },
  ILL: { en: 'The man walks into the forest.', S: { n: 'man', def: true }, V: 'walk', obl: [{ n: 'forest', def: true, kase: 'ILL' }] },
  ADE: { en: 'The bird sits on the stone.', S: { n: 'bird', def: true }, V: 'sit', obl: [{ n: 'stone', def: true, kase: 'ADE' }] },
};

const QUIRK_EXAMPLES = {
  datPoss: [{ en: 'I have a horse.', S: { pron: '1SG' }, V: 'have', O: { n: 'horse', indef: true } }, { en: 'The king had a sword.', S: { n: 'king', def: true }, V: 'have', O: { n: 'sword', indef: true }, tense: 'PST' }],
  locPoss: [{ en: 'I have a horse.', S: { pron: '1SG' }, V: 'have', O: { n: 'horse', indef: true } }, { en: 'The king had a sword.', S: { n: 'king', def: true }, V: 'have', O: { n: 'sword', indef: true }, tense: 'PST' }],
  existPoss: [{ en: 'I have a horse.', S: { pron: '1SG' }, V: 'have', O: { n: 'horse', indef: true } }, { en: 'The king has a sword.', S: { n: 'king', def: true }, V: 'have', O: { n: 'sword', indef: true } }],
  zeroCopula: [{ en: 'The water is cold.', S: { n: 'water', def: true }, pred: 'cold' }, { en: 'The water was cold.', S: { n: 'water', def: true }, pred: 'cold', tense: 'PST' }],
  serEstar: [{ en: 'The king is wise.', S: { n: 'king', def: true }, pred: 'wise' }, { en: 'The king is in the city.', S: { n: 'king', def: true }, V: 'be', obl: [{ n: 'city', def: true, role: 'location', kase: 'LOC' }], beLoc: true }],
  dom: [{ en: 'The woman sees the child.', S: { n: 'woman', def: true }, V: 'see', O: { n: 'child', def: true } }, { en: 'The woman sees a tree.', S: { n: 'woman', def: true }, V: 'see', O: { n: 'tree', indef: true } }],
  negConcord: [{ en: 'The king never sleeps.', adv: 'never', S: { n: 'king', def: true }, V: 'sleep' }],
  negCircum: [{ en: 'The dog does not eat bread.', S: { n: 'dog', def: true }, V: 'eat', O: { n: 'bread' }, neg: true }],
  tv: [{ en: 'Do you (polite) see the king?', S: { pron: '2SG.POL', keepPronoun: true }, V: 'see', O: { n: 'king', def: true }, q: 'polar' }, { en: 'Do you (familiar) see the king?', S: { pron: '2SG', keepPronoun: true }, V: 'see', O: { n: 'king', def: true }, q: 'polar' }],
  adjVerb: [{ en: 'The mountain is high.', S: { n: 'mountain', def: true }, pred: 'high' }, { en: 'The mountain was high.', S: { n: 'mountain', def: true }, pred: 'high', tense: 'PST' }],
  inalienable: [{ en: 'My mother sees my house.', S: { n: 'mother', poss: '1SG' }, V: 'see', O: { n: 'house', poss: '1SG' } }],
  construct: [{ en: 'The king’s house is big.', S: { n: 'house', possN: { n: 'king', def: true } }, pred: 'big' }],
  defConj: [{ en: 'I see a bird.', S: { pron: '1SG' }, V: 'see', O: { n: 'bird', indef: true } }, { en: 'I see the bird.', S: { pron: '1SG' }, V: 'see', O: { n: 'bird', def: true } }],
  redup: [{ en: 'The children see very big trees.', S: { n: 'child', number: 'PL', def: true }, V: 'see', O: { n: 'tree', number: 'PL', adj: 'big', very: true } }],
  incorp: [{ en: 'The man eats meat.', S: { n: 'man', def: true }, V: 'eat', O: { n: 'meat' } }, { en: 'The man eats the meat.', S: { n: 'man', def: true }, V: 'eat', O: { n: 'meat', def: true } }],
  honorific: [{ en: 'The man comes.', S: { n: 'man', def: true }, V: 'come' }, { en: 'The king comes (respectful).', S: { n: 'king', def: true }, V: 'come' }, { en: 'The man comes (said politely).', S: { n: 'man', def: true }, V: 'come', polite: true }],
  serial: [{ en: 'The hunter kills the wolf with a knife.', S: { n: 'hunter', def: true }, V: 'kill', O: { n: 'wolf', def: true }, obl: [{ n: 'knife', indef: true, role: 'instrument', kase: 'INS' }] }],
};

const GENERAL_EXAMPLES = [
  { id: 'basic', en: 'The man sees the dog.', S: { n: 'man', def: true }, V: 'see', O: { n: 'dog', def: true } },
  { id: 'pron', en: 'I love you.', S: { pron: '1SG' }, V: 'love.v', O: { pron: '2SG' } },
  { id: 'past', en: 'Yesterday the woman built a house.', adv: 'yesterday', S: { n: 'woman', def: true }, V: 'build', O: { n: 'house', indef: true }, tense: 'PST' },
  { id: 'fut', en: 'The children will sing a song.', S: { n: 'child', number: 'PL', def: true }, V: 'sing', O: { n: 'song', indef: true }, tense: 'FUT' },
  { id: 'adj', en: 'The big dog eats the red meat.', S: { n: 'dog', adj: 'big', def: true }, V: 'eat', O: { n: 'meat', adj: 'red', def: true } },
  { id: 'num', en: 'Three wolves come from the forest.', S: { n: 'wolf', number: 'PL', num: 'three' }, V: 'come', obl: [{ n: 'forest', def: true, role: 'source', kase: 'ABL' }] },
  { id: 'neg', en: 'The king does not know the truth.', S: { n: 'king', def: true }, V: 'know', O: { n: 'truth', def: true }, neg: true },
  { id: 'q', en: 'Does the bird fly?', S: { n: 'bird', def: true }, V: 'fly', q: 'polar' },
  { id: 'poss', en: 'My mother drinks water.', S: { n: 'mother', poss: '1SG' }, V: 'drink', O: { n: 'water' } },
  { id: 'dem', en: 'This woman is wise.', S: { n: 'woman', dem: 'this' }, V: 'be', O: null, pred: 'wise' },
];

function buildExamples(lang) {
  const m = lang.morph;
  const byCase = {};
  for (const c of m.cases) if (CASE_EXAMPLES[c]) byCase[c] = safeClause(lang, CASE_EXAMPLES[c]);
  const general = {};
  for (const ex of GENERAL_EXAMPLES) general[ex.id] = safeClause(lang, ex);
  // roles not covered by a case: show the adposition
  const adposEx = {};
  const rc = new Set(m.cases.map(c => CASES[c].role));
  for (const role of ['recipient', 'location', 'source', 'instrument', 'companion']) {
    if (rc.has(role)) continue;
    const c = { recipient: 'DAT', location: 'LOC', source: 'ABL', instrument: 'INS', companion: 'COM' }[role];
    adposEx[role] = safeClause(lang, { ...CASE_EXAMPLES[c], obl: CASE_EXAMPLES[c].obl.map(o => ({ ...o, kase: undefined })) });
  }
  const quirks = {};
  for (const id of lang.quirks || []) quirks[id] = (QUIRK_EXAMPLES[id] || []).map(ex => safeClause(lang, ex));
  return { byCase, general, adposEx, quirks };
}

function safeClause(lang, spec) { return buildClause(lang, spec); }

// ---------- the showcase story ----------
const STORY = [
  { en: 'Long ago, a king lived in a big city.', S: { n: 'king', indef: true }, V: 'live', obl: [{ n: 'city', adj: 'big', indef: true, role: 'location', kase: 'LOC' }], tense: 'PST' },
  { en: 'The king had a white horse.', S: { n: 'king', def: true }, V: 'have', O: { n: 'horse', adj: 'white', indef: true }, tense: 'PST' },
  { en: 'One night a wolf came from the dark forest.', S: { n: 'wolf', indef: true }, V: 'come', obl: [{ n: 'forest', adj: 'dark', def: true, role: 'source', kase: 'ABL' }], tense: 'PST' },
  { en: 'The king gave a sword to the young hunter.', S: { n: 'king', def: true }, V: 'give', O: { n: 'sword', indef: true }, obl: [{ n: 'hunter', adj: 'young', def: true, role: 'recipient', kase: 'DAT' }], tense: 'PST' },
  { en: 'The hunter killed the wolf with the sword.', S: { n: 'hunter', def: true }, V: 'kill', O: { n: 'wolf', def: true }, obl: [{ n: 'sword', def: true, role: 'instrument', kase: 'INS' }], tense: 'PST', aspect: 'PFV' },
  { en: 'Now the people sing a song.', adv: 'now', S: { n: 'people', def: true }, V: 'sing', O: { n: 'song', indef: true }, tense: 'PRS' },
];

function buildStory(lang) {
  return STORY.map(s => buildClause(lang, s));
}

export { CASE_EXAMPLES };
void inflectNoun;
