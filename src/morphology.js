// Morphology: affixes, joining rules (harmony, epenthesis, hiatus), noun and verb paradigms, pronouns, articles.
import { SEGMENTS } from './data/phonemes.js';
import { FRONT_OF, BACK_OF } from './data/phonemes.js';
import { CASES, HIERARCHY_ACC, HIERARCHY_ERG, HIERARCHY_SPLIT_LOCAL, ROLE_ADPOSITION } from './data/cases.js';
import { isV, vBase, isLong, toneOf, harmonyClassOfVowel, assignTones, applyAllophones } from './phonology.js';
import { stream } from './rng.js';

// ---------- small helpers ----------
const key = (segs) => segs.join('');
const consRun = (segs, fromEnd) => {
  let n = 0;
  if (fromEnd) { for (let i = segs.length - 1; i >= 0 && !isV(segs[i]); i--) n++; }
  else { for (let i = 0; i < segs.length && !isV(segs[i]); i++) n++; }
  return n;
};

export function stemHarmony(ph, segs) {
  if (!ph.harmony) return null;
  for (let i = segs.length - 1; i >= 0; i--) {
    if (isV(segs[i])) { const c = harmonyClassOfVowel(vBase(segs[i]), ph); if (c !== 'neutral') return c; }
  }
  return 'front'; // only neutral vowels: front harmony (Finnish-like)
}

function harmonize(ph, affix, cls) {
  if (!ph.harmony || !cls) return affix;
  return affix.map(s => {
    if (!isV(s)) return s;
    const b = vBase(s);
    const t = cls === 'front' ? (ph.hf[b] && ph.vowels.includes(ph.hf[b]) ? ph.hf[b] : b) : (ph.hb[b] && ph.vowels.includes(ph.hb[b]) ? ph.hb[b] : b);
    return t + s.slice(b.length);
  });
}

// Join stem + suffix (or prefix + stem) with the language's repair rules. Returns new segs.
export function join(ph, a, b, opts = {}) {
  return applyAllophones(ph, joinRaw(ph, a, b, opts));
}
function joinRaw(ph, a, b, { harmonyFrom = null, allowDelete = false } = {}) {
  if (!a.length) return b.slice();
  if (!b.length) return a.slice();
  let right = b;
  if (harmonyFrom === 'left') right = harmonize(ph, b, stemHarmony(ph, a));
  let left = a;
  if (harmonyFrom === 'right') left = harmonize(ph, a, stemHarmony(ph, b));
  const lastV = isV(left[left.length - 1]);
  const firstV = isV(right[0]);
  if (lastV && firstV) {
    // deletion must not make a one-vowel suffix invisible (that would merge paradigm cells)
    const sameV = vBase(left[left.length - 1]) === vBase(right[0]);
    // vowel deletion only at the edge of a lexical stem, so a one-vowel affix is never swallowed
    if (allowDelete && ph.hiatus === 'delete' && !sameV && left.filter(isV).length > 1) return [...left.slice(0, -1), ...right];
    return [...left, ph.glide, ...right];
  }
  if (!lastV && !firstV) {
    const run = consRun(left, true) + consRun(right, false);
    const rightIsFinal = !right.some(isV);
    const limit = rightIsFinal ? ph.codaCap : ph.maxRun;
    const geminate = left[left.length - 1] === right[0];
    if (run > Math.max(1, limit) || geminate) {
      let e = ph.epenthetic;
      if (ph.harmony) e = harmonize(ph, [e], stemHarmony(ph, left))[0];
      if (ph.toneCount) e += '1';
      return [...left, e, ...right];
    }
  }
  return [...left, ...right];
}

// Generate a short affix of a given shape; unique against `used`.
export function genAffix(ph, rng, shapes, used, { avoid = [] } = {}) {
  const cons = ph.consonants.filter(c => !SEGMENTS[c].pren && !avoid.includes(c));
  const pickC = () => rng.weighted(cons.map(c => [c, (ph.freq[c] ?? 1) * (ph.affixConsonants ? (ph.affixConsonants.includes(c) ? 8 : 0.3) : ['n', 'm', 's', 't', 'k', 'l', 'r', 'd'].includes(c) ? 2 : 1)]));
  const harmonyVowels = ph.harmony ? ph.vowels.filter(v => harmonyClassOfVowel(v, ph) !== 'front') : ph.vowels;
  const pickV = () => rng.weighted(harmonyVowels.map(v => [v, ph.freq[v] ?? 1]));
  for (let tries = 0; tries < 60; tries++) {
    const shape = rng.pick(shapes);
    let segs = [];
    if (shape.endsWith('C') && !ph.codaSet.length) continue;
    for (let ci = 0; ci < shape.length; ci++) {
      const ch = shape[ci];
      if (ch === 'C' && ci === shape.length - 1 && ci > 0) segs.push(rng.weighted(ph.codaSet.map(c => [c, ph.freq[c] ?? 1])));
      else if (ch === 'C') segs.push(pickC());
      else if (ch === 'V') segs.push(pickV());
      else if (ch === 'L') segs.push(ph.longVowels ? pickV() + 'ː' : pickV());
    }
    // a lone consonant suffix must be a legal coda
    if (!segs.some(isV) && !segs.every(c => ph.codaSet.includes(c))) continue;
    segs = assignTones(ph, segs, rng);
    const k = key(segs);
    const kf = ph.harmony ? key(harmonize(ph, segs, 'front')) : k;
    // "-a" after a vowel surfaces as glide + a, so it must not equal a real glide-initial affix
    const canon = segs[0] === ph.glide && isV(segs[1]) ? key(segs.slice(1)) : isV(segs[0]) ? k : null;
    if (used.has(k) || used.has('F:' + kf) || (canon && used.has('G:' + canon))) continue;
    used.add(k); used.add('F:' + kf); if (canon) used.add('G:' + canon);
    return segs;
  }
  // fallback: guaranteed-unique by appending a vowel
  const segs = [pickC(), pickV(), pickC() ?? 'n'].filter(Boolean);
  used.add(key(segs) + used.size);
  return segs;
}

// ---------- case selection ----------
export function selectCases(ctl, seed) {
  if (!ctl.caseOn || ctl.caseCount < 2) return [];
  const n = Math.min(ctl.caseCount, 14);
  if (ctl.alignment === 'ergative') return HIERARCHY_ERG.slice(0, n);
  const rng = stream(seed, 'cases');
  if (n >= 9 && (ctl.family === 'uralic' || (ctl.family === 'original' && rng.chance(0.4)))) return HIERARCHY_SPLIT_LOCAL.slice(0, n);
  return HIERARCHY_ACC.slice(0, n);
}

// ---------- build morphology ----------
const PERSONS = ['1SG', '2SG', '3SG', '1PL', '2PL', '3PL'];

export function buildMorphology(ph, ctl, profile, seed) {
  const rng = stream(seed, 'morphology');
  const crng = stream(seed, 'cases');
  const vrng = stream(seed, 'verbs');
  const used = new Set();
  const type = ctl.morph; // agglutinative | fusional | isolating

  // ---- derivation and templates FIRST, from their own streams: the lexicon depends on them, so no grammar
  // control (word order, cases, gender...) may shift them (locality) ----
  const drng = stream(seed, 'derivation');
  const m0 = {};
  m0.deriv = {};
  for (const d of ['AGT', 'PLACE', 'NMLZ', 'ABST', 'CAUS']) m0.deriv[d] = genAffix(ph, drng, ph.codaCap ? ['VC', 'CVC', 'CV', 'V'] : ['CV', 'V', 'CVCV'], used);
  const sideRoll = drng.pick(['suffix', 'prefix']);
  m0.derivSide = profile.family === 'bantu' ? 'prefix' : type === 'isolating' ? sideRoll : 'suffix';
  m0.linker = drng.chance(0.4) ? [ph.vowels.includes('o') ? 'o' : ph.epenthetic] : null;
  if (m0.linker && ph.toneCount) m0.linker = [m0.linker[0] + '1'];
  const orng = stream(seed, 'derivation', 'compound-order');
  m0.compoundOrder = /OV/.test(ctl.order) || ctl.order === 'SOV' ? 'modifier-head' : orng.weighted({ 'head-modifier': 2, 'modifier-head': 1 });
  if (ph.templatic) m0.patterns = genPatterns(ph, stream(seed, 'derivation', 'patterns'));

  const cases = selectCases(ctl, seed);
  const caseMarking = !cases.length ? 'none' : (type === 'isolating' || profile.special.caseAsParticles) ? 'particle' : 'suffix';
  const numbers = ctl.number === 'none' ? ['SG'] : ctl.number === 'dual' ? ['SG', 'DU', 'PL'] : ['SG', 'PL'];
  const m = { ...m0, type, cases, caseMarking, numbers, persons: PERSONS.slice(), features: [] };

  // ---- genders / noun classes ----
  if (ctl.gender === 'two') m.genders = [{ id: 'M', name: 'masculine' }, { id: 'F', name: 'feminine' }];
  else if (ctl.gender === 'three') m.genders = [{ id: 'M', name: 'masculine' }, { id: 'F', name: 'feminine' }, { id: 'N', name: 'neuter' }];
  else if (ctl.gender === 'animacy') m.genders = [{ id: 'AN', name: 'animate' }, { id: 'IN', name: 'inanimate' }];
  else if (ctl.gender === 'classes') {
    const defs = [['1/2', 'people', 'h'], ['3/4', 'plants and nature', 'nature'], ['5/6', 'paired and round things', 'thing'], ['7/8', 'tools and objects', 'tool'], ['9/10', 'animals', 'a'], ['11/14', 'abstract and long things', 'abst']];
    m.genders = defs.map(([id, name, sem]) => ({ id: 'CL' + id, name: `class ${id} (${name})`, sem, prefix: { SG: genAffix(ph, rng, ['CV', 'V', 'CV'], used), PL: genAffix(ph, rng, ['CV', 'V', 'CV'], used) }, agr: { SG: genAffix(ph, rng, ['CV', 'V'], used), PL: genAffix(ph, rng, ['CV', 'V'], used) } }));
    m.nounClasses = true;
  } else m.genders = [];

  // ---- noun inflection ----
  const affShapes = ph.codaCap > 0 ? ['VC', 'CV', 'VC', 'CVC', 'V'] : ['CV', 'V', 'CVCV'];
  const caseAff = {};
  const nomZero = rng.chance(0.85);
  if (caseMarking === 'suffix' && type === 'agglutinative') {
    for (const c of cases) caseAff[c] = (c === cases[0] && nomZero) ? [] : genAffix(ph, crng, affShapes, used);
    m.caseAff = caseAff;
  } else if (caseMarking === 'particle') {
    for (const c of cases) caseAff[c] = (c === cases[0] && rng.chance(0.4)) ? [] : genAffix(ph, crng, ['CV', 'V', 'CVC'].filter(s => ph.codaCap || !s.endsWith('C')), used);
    m.caseParticles = caseAff;
    m.particleSide = /OV|OSV|SOV/.test(ctl.order) || ctl.order === 'OVS' ? 'after' : (rng.chance(0.7) ? 'before' : 'after');
  }
  if (type === 'agglutinative' && numbers.length > 1) {
    m.numAff = {};
    for (const n of numbers.slice(1)) m.numAff[n] = genAffix(ph, rng, affShapes, used);
  }
  if (type === 'isolating' && numbers.length > 1) {
    m.pluralStrategy = profile.special.reduplication ? 'reduplication' : rng.weighted({ particle: 3, reduplication: 1 });
    m.pluralParticle = genAffix(ph, rng, ['CV', 'CVC', 'V'].filter(s => ph.codaCap || !s.endsWith('C')), used);
  }

  // fusional declensions are finalised after the lexicon exists (theme vowels come from real nouns)
  m.pendingDeclensions = type === 'fusional';

  // ---- verbs ----
  const tam = ctl.tam === 'simple' ? ['NPST', 'PST'] : ctl.tam === 'standard' ? ['PRS', 'PST', 'FUT'] : ['PRS', 'PST', 'FUT'];
  m.tenses = tam;
  m.aspect = ctl.tam === 'rich' ? ['IPFV', 'PFV'] : null;
  m.verbAgreement = type !== 'isolating' ? (rng.chance(0.92) ? 'person' : 'none') : 'none';
  if (type === 'agglutinative' && ctl.features?.defConj === 'on') m.verbAgreement = 'person';
  m.proDrop = m.verbAgreement === 'person' && (type === 'fusional' ? rng.chance(0.75) : rng.chance(0.5));
  if (type === 'agglutinative') {
    m.tenseAff = {}; for (const t of tam) m.tenseAff[t] = (t === tam[0] && vrng.chance(0.6)) ? [] : genAffix(ph, vrng, affShapes, used);
    if (m.verbAgreement === 'person') { m.personAff = {}; for (const p of PERSONS) m.personAff[p] = (p === '3SG' && vrng.chance(0.5)) ? [] : genAffix(ph, vrng, affShapes, used); }
    if (m.aspect) m.aspectAff = { IPFV: [], PFV: genAffix(ph, vrng, affShapes, used) };
    m.infinitive = genAffix(ph, vrng, affShapes, used);
    m.negAff = vrng.chance(0.5) ? genAffix(ph, vrng, affShapes, used) : null;
  } else if (type === 'fusional') {
    const conjCount = vrng.int(1, 2);
    m.conjugations = [];
    for (let k = 0; k < conjCount; k++) {
      const cj = { id: k + 1, infinitive: genAffix(ph, vrng, ph.codaCap ? ['VC', 'V', 'VCV'] : ['V', 'CV'], used), endings: {} };
      for (const t of tam) {
        cj.endings[t] = {};
        for (const p of PERSONS) cj.endings[t][p] = genAffix(ph, vrng, ph.codaCap ? ['V', 'VC', 'VC', 'VCV', 'L', 'C'] : ['V', 'CV', 'VCV', 'L'], used);
        if (m.verbAgreement === 'none') for (const p of PERSONS) cj.endings[t][p] = cj.endings[t]['3SG'];
      }
      m.conjugations.push(cj);
    }
    if (m.aspect) m.aspectAff = { IPFV: [], PFV: genAffix(ph, vrng, ph.codaCap ? ['CV', 'VC', 'CVC'] : ['CV', 'V'], used), side: profile.special.aspectPairs ? 'prefix' : vrng.pick(['prefix', 'suffix']) };
    m.ablaut = !!profile.special.ablaut;
    if (m.ablaut) {
      const vs = ph.vowels.filter(v => !isLong(v));
      m.ablautMap = {}; const sh = vrng.shuffle(vs);
      vs.forEach((v, i) => { m.ablautMap[v] = sh[(i + 1) % sh.length]; });
    }
  } else {
    m.tenseParticles = {}; for (const t of tam) m.tenseParticles[t] = (t === tam[0]) ? [] : genAffix(ph, vrng, ['CV', 'V', 'CVC'].filter(s => ph.codaCap || !s.endsWith('C')), used);
    if (m.aspect || profile.family === 'sinitic' || vrng.chance(0.5)) m.aspectParticles = { PFV: genAffix(ph, vrng, ['CV', 'V'], used), PROG: genAffix(ph, vrng, ['CV', 'CVC'].filter(s => ph.codaCap || !s.endsWith('C')), used) };
    m.particlePos = /VO|VSO|VOS|SVO/.test(ctl.order) ? 'before' : 'after';
  }

  // ---- negation and questions ----
  m.negation = genAffix(ph, rng, ['CV', 'V', 'CVC', 'VC'].filter(s => ph.codaCap || !s.endsWith('C')), used);
  m.negPos = rng.weighted({ beforeVerb: 6, afterVerb: 2, sentenceFinal: 1 });
  m.questionParticle = rng.chance(0.7) ? genAffix(ph, rng, ['CV', 'CVC', 'V'].filter(s => ph.codaCap || !s.endsWith('C')), used) : null;
  m.questionPos = /^(SOV|OSV)$/.test(ctl.order) ? 'final' : rng.chance(0.5) ? 'initial' : 'final';


  // ---- extras by family ----
  if (profile.special.classifiers) {
    m.classifiers = {};
    for (const c of ['general', 'people', 'animals', 'flat things', 'long things']) m.classifiers[c] = genAffix(ph, rng, ['CV', 'CVC', 'V'].filter(s => ph.codaCap || !s.endsWith('C')), used);
  }
  if (profile.special.topicMarker) m.topicMarker = genAffix(ph, rng, ['CV', 'V'], used);
  if (profile.special.possessiveSuffixes && type === 'agglutinative') { m.possAff = {}; for (const p of PERSONS) m.possAff[p] = genAffix(ph, rng, affShapes, used); }
  if (profile.special.evidential && type === 'agglutinative') m.evidentialAff = genAffix(ph, vrng, affShapes, used);
  if (profile.special.mutations) m.mutation = buildMutation(ph);
  if (profile.special.politeness && type !== 'isolating') m.politeAff = genAffix(ph, vrng, ['CVC', 'CV', 'CVCV'].filter(s => ph.codaCap || !s.endsWith('C')), used);
  m.zeroCopula = type !== 'fusional' && rng.chance(0.55);
  m.v2 = profile.special.v2 ? rng.chance(profile.special.v2) : false;

  // adpositions for roles that have no case
  m.adpos = {};
  const roleCase = roleToCase(cases);
  for (const role of Object.keys(ROLE_ADPOSITION)) {
    if (!roleCase[role]) m.adpos[role] = genAffix(ph, rng, ph.codaCap ? ['CV', 'CVC', 'VC', 'V'] : ['CV', 'CVCV', 'V'], used);
  }
  m.adposSide = /OV/.test(ctl.order) || ctl.order === 'SOV' || ctl.order === 'OSV' ? (rng.chance(0.88) ? 'post' : 'pre') : (rng.chance(0.88) ? 'pre' : 'post');
  if (profile.special.inflectedPrepositions && m.adposSide === 'pre') m.inflectedPrepositions = true;

  // articles
  if (ctl.articles !== 'none') {
    // B4: a family may give sourced article-side weights (Germanic: WALS 37A definite affix 3/6); isolating never suffixes
    const sideW = profile.grammar.articleSide ? { ...profile.grammar.articleSide } : { before: 4, suffix: 1.5, after: 1 };
    if (type === 'isolating') sideW.suffix = 0;
    const artSide = rng.weighted(sideW);
    m.articles = { side: artSide, def: {}, indef: ctl.articles === 'both' ? {} : null };
    const gs = m.genders.length && !m.nounClasses ? m.genders.map(g => g.id) : ['_'];
    const artShapes = ph.codaCap ? ['CV', 'CV', 'V', 'VC', 'CVC'] : ['CV', 'V'];
    for (const g of gs) {
      m.articles.def[g] = genAffix(ph, rng, artShapes, used);
      if (m.articles.indef) m.articles.indef[g] = genAffix(ph, rng, artShapes, used);
    }
  }

  m.used = used;
  return m;
}

// Which case (if any) realises a semantic role.
export function roleToCase(cases) {
  const r = {};
  for (const c of cases) { const role = CASES[c].role; if (!r[role]) r[role] = c; }
  if (r.absolutive) { r.subject = r.absolutive; r.object = r.absolutive; }
  return r;
}

// ---------- templatic patterns ----------
function genPatterns(ph, rng) {
  const vs = ph.vowels.filter(v => 'aiu'.includes(v));
  const V = () => rng.pick(vs.length ? vs : ph.vowels);
  const L = () => V() + (ph.longVowels ? 'ː' : '');
  const pre = ['m', 't', 'ʔ', 'n'].filter(c => ph.consonants.includes(c));
  const P = (arr) => arr;
  const pats = {
    noun: [P(['1', V(), '2', V(), '3']), P(['1', V(), '2', '3']), P(['1', V(), '2', L(), '3']), P(['1', L(), '2', V(), '3'])],
    verb: P(['1', 'a', '2', 'a', '3'].map(x => x === 'a' ? (vs.includes('a') ? 'a' : V()) : x)),
    AGT: P(['1', L(), '2', V(), '3']),
    PLACE: P([pre[0] ?? 'm', V(), '1', '2', V(), '3']),
    NMLZ: P(['1', V(), '2', L(), '3']),
    ABST: P(['1', V(), '2', '3', V()]),
    CAUS: P([pre[1] ?? pre[0] ?? 'ʔ', V(), '1', '2', V(), '3']),
    PL: P(['1', V(), '2', L(), '3']),
    adj: P(['1', V(), '2', L(), '3']),
  };
  return pats;
}

export function applyPattern(pattern, root) {
  return pattern.map(t => t === '1' ? root[0] : t === '2' ? root[1] : t === '3' ? root[2] : t);
}

// ---------- fusional declensions (after lexicon) ----------
export function buildDeclensions(ph, m, nouns, seed) {
  const rng = stream(seed, 'cases', 'declensions');
  const finals = {};
  for (const n of nouns) { const l = n.segs[n.segs.length - 1]; if (isV(l)) { const b = vBase(l); finals[b] = (finals[b] || 0) + 1; } }
  const ranked = Object.entries(finals).sort((a, b) => b[1] - a[1]).map(x => x[0]);
  const nVowelDecl = Math.min(ranked.length, rng.int(1, 2) + (ranked.length >= 3 && rng.chance(0.3) ? 1 : 0));
  const decls = [];
  const cells = [];
  const cases = m.cases.length ? m.cases : ['NOM'];
  for (const c of cases) for (const n of m.numbers) cells.push([c, n]);
  const gs = m.genders.filter(g => !m.nounClasses).map(g => g.id);
  const themes = ranked.slice(0, nVowelDecl).map(v => ({ theme: v })).concat([{ theme: null }]);
  themes.forEach((t, i) => {
    const used = new Set(t.theme ? [t.theme] : []);
    const d = { id: i + 1, theme: t.theme, gender: gs.length ? gs[i % gs.length] : null, endings: {}, syncretism: [] };
    for (const [c, n] of cells) {
      d.endings[c] = d.endings[c] || {};
      let e;
      if (c === cases[0] && n === 'SG') e = t.theme ? [t.theme] : [];
      else {
        const shapes = t.theme ? ['V', 'VC', 'VC', 'L', 'VCV'] : ['V', 'VC', 'CV', 'VC'];
        e = genAffix(ph, rng, ph.codaCap ? shapes : ['V', 'CV', 'L', 'VCV'], used);
      }
      d.endings[c][n] = e;
    }
    // deliberate syncretisms (labelled in the grammar)
    const syncCount = rng.int(0, 2);
    for (let s = 0; s < syncCount && cells.length > 3; s++) {
      const [c1, n1] = rng.pick(cells.slice(1)); const [c2] = rng.pick(cells.slice(1));
      if (c1 !== c2 && d.endings[c2][n1] && !(c1 === cases[0] && n1 === 'SG')) { d.endings[c2][n1] = d.endings[c1][n1]; d.syncretism.push(`${c1}.${n1} = ${c2}.${n1}`); }
    }
    if (d.gender === 'N' && m.cases.includes('ACC')) { for (const n of m.numbers) d.endings.ACC[n] = d.endings.NOM[n]; d.syncretism.push('NOM = ACC (neuter)'); }
    decls.push(d);
  });
  m.declensions = decls;
  m.pendingDeclensions = false;
}

export function declensionOf(m, entry) {
  if (!m.declensions) return null;
  const last = entry.segs[entry.segs.length - 1];
  const byTheme = m.declensions.find(d => d.theme && isV(last) && vBase(last) === d.theme && !isLong(last));
  return byTheme || m.declensions[m.declensions.length - 1];
}

export function nounStem(m, entry) {
  const d = declensionOf(m, entry);
  if (d && d.theme) return entry.segs.slice(0, -1);
  return entry.segs;
}

// ---------- inflection (returns {segs, parts:[{segs, gloss}]}) ----------
export function inflectNoun(lang, entry, { kase = null, number = 'SG', poss = null } = {}) {
  const { ph, morph: m } = lang;
  const parts = [];
  let segs;
  if (m.nounClasses) {
    const g = m.genders.find(x => x.id === entry.gender) || m.genders[0];
    const pre = g.prefix[number === 'SG' ? 'SG' : 'PL'];
    segs = join(ph, pre, entry.segs);
    parts.push({ segs: pre, gloss: g.id.split('/')[number === 'SG' ? 0 : 1].replace('CL', '') }, { segs: entry.segs, gloss: entry.gloss });
    const ca = kase && m.caseAff?.[kase];
    if (ca && ca.length) { segs = join(ph, segs, ca, { harmonyFrom: 'left' }); parts.push({ segs: ca, gloss: kase }); }
    return { segs, parts };
  }
  if (m.type === 'fusional' && m.declensions) {
    const d = declensionOf(m, entry);
    const stem = nounStem(m, entry);
    const c = kase && m.cases.length ? kase : (m.cases[0] ?? 'NOM');
    let st = stem;
    const end0 = d.endings[c]?.[number] ?? [];
    if (m.inheritedEndings && end0.length && isV(end0[0]) && st.length > 1 && isV(st[st.length - 1])) st = st.slice(0, -1);
    if (number === 'PL' && entry.brokenPlural) st = entry.brokenPlural;
    const end = d.endings[c]?.[number] ?? d.endings[m.cases[0] ?? 'NOM']?.[number] ?? [];
    segs = join(ph, st, end, { allowDelete: true });
    const glossBits = [m.cases.length ? c : null, m.numbers.length > 1 ? number : null].filter(Boolean).join('.');
    parts.push({ segs: st, gloss: entry.gloss + (entry.brokenPlural && number !== 'SG' ? '.PL' : '') }, { segs: end, gloss: glossBits });
    if (poss && lang.morph.possAff) { segs = join(ph, segs, m.possAff[poss], { harmonyFrom: 'left' }); parts.push({ segs: m.possAff[poss], gloss: poss }); }
    return { segs, parts };
  }
  segs = entry.segs.slice();
  parts.push({ segs: entry.segs, gloss: entry.gloss });
  if (number === 'PL' && entry.brokenPlural && m.type !== 'isolating') {
    segs = entry.brokenPlural.slice();
    parts[0] = { segs, gloss: entry.gloss + '.PL' };
    number = 'SG_DONE';
  }
  if (number === 'PL' && m.pluralStrategy === 'reduplication') {
    const syllable = entry.segs.slice(0, entry.segs.findIndex(isV) + 1);
    segs = [...syllable, ...segs];
    parts.unshift({ segs: syllable, gloss: 'PL' });
    number = 'SG_DONE';
  }
  if (m.type === 'agglutinative') {
    if (number !== 'SG' && number !== 'SG_DONE' && m.numAff?.[number]) { segs = join(ph, segs, m.numAff[number], { harmonyFrom: 'left', allowDelete: true }); parts.push({ segs: m.numAff[number], gloss: number }); }
    if (poss && m.possAff) { segs = join(ph, segs, m.possAff[poss], { harmonyFrom: 'left' }); parts.push({ segs: m.possAff[poss], gloss: poss }); }
    const ca = kase && m.caseAff?.[kase];
    if (ca && ca.length) { segs = join(ph, segs, ca, { harmonyFrom: 'left' }); parts.push({ segs: ca, gloss: kase }); }
  }
  return { segs, parts };
}

export function verbStemForTense(lang, entry, tense) {
  const m = lang.morph;
  if (tense === 'PST' && entry.pastStem) return entry.pastStem;
  if (m.ablaut && tense === 'PST' && entry.strong) {
    const segs = entry.segs.slice();
    const i = segs.findIndex(isV);
    if (i >= 0) {
      const base = vBase(segs[i]);
      segs[i] = (m.ablautMap[base] ?? base) + segs[i].slice(base.length);
    }
    return segs;
  }
  return entry.segs;
}

export function conjugationOf(m, entry) {
  if (!m.conjugations) return null;
  return m.conjugations[(entry.conj ?? 0) % m.conjugations.length];
}

export function inflectVerb(lang, entry, { tense, person = '3SG', aspect = null, neg = false, evid = false, subjClass = null } = {}) {
  const { ph, morph: m } = lang;
  const parts = [];
  let segs;
  if (entry.suppletive && entry.suppletive[tense]?.[person]) {
    segs = entry.suppletive[tense][person];
    parts.push({ segs, gloss: `${entry.gloss}.${tense}.${person}` });
    return { segs, parts };
  }
  if (m.type === 'fusional') {
    const cj = conjugationOf(m, entry);
    let stem = verbStemForTense(lang, entry, tense);
    const end = cj.endings[tense][person];
    // inherited endings replace the stem's final vowel (Latin canta- + -ō > cantō), as in the ancestor
    if (m.inheritedEndings && end.length && isV(end[0]) && stem.length > 1 && isV(stem[stem.length - 1])) stem = stem.slice(0, -1);
    segs = join(ph, stem, end, { allowDelete: true });
    const ablauted = stem !== entry.segs;
    const endGloss = [ablauted ? null : tense, m.verbAgreement === 'person' ? person : null].filter(Boolean).join('.') || tense;
    parts.push({ segs: stem, gloss: entry.gloss + (ablauted ? '.' + tense : '') }, { segs: end, gloss: endGloss });
    if (aspect === 'PFV' && m.aspectAff?.PFV) {
      if (m.aspectAff.side === 'prefix') { segs = join(ph, m.aspectAff.PFV, segs); parts.unshift({ segs: m.aspectAff.PFV, gloss: 'PFV' }); }
      else { segs = join(ph, segs, m.aspectAff.PFV); parts.push({ segs: m.aspectAff.PFV, gloss: 'PFV' }); }
    }
    return { segs, parts };
  }
  const stem = verbStemForTense(lang, entry, tense);
  const stemGloss = entry.gloss + (stem !== entry.segs ? '.PST' : '');
  if (m.type === 'agglutinative') {
    segs = stem.slice();
    parts.push({ segs: stem, gloss: stemGloss });
    if (m.nounClasses) {
      // Bantu-style template: (NEG-)SUBJ-TENSE-stem(-PFV)
      let agr = lang.subjAgr?.[person];
      if (subjClass && person.startsWith('3')) {
        const g = m.genders.find(x => x.id === subjClass);
        if (g) agr = { segs: g.agr[person === '3SG' ? 'SG' : 'PL'], gloss: g.id.replace('CL', '').split('/')[person === '3SG' ? 0 : 1] };
      }
      const ta = m.tenseAff[tense];
      let pre = [];
      const preParts = [];
      if (neg && m.negAff) { pre = m.negAff.slice(); preParts.push({ segs: m.negAff, gloss: 'NEG' }); }
      if (agr) { pre = join(ph, pre, agr.segs); preParts.push({ segs: agr.segs, gloss: agr.gloss }); }
      if (ta.length) { pre = join(ph, pre, ta); preParts.push({ segs: ta, gloss: tense }); }
      segs = join(ph, pre, stem);
      parts.unshift(...preParts);
      if (aspect === 'PFV' && m.aspectAff) { segs = join(ph, segs, m.aspectAff.PFV); parts.push({ segs: m.aspectAff.PFV, gloss: 'PFV' }); }
      return { segs, parts };
    }
    if (aspect === 'PFV' && m.aspectAff) { segs = join(ph, segs, m.aspectAff.PFV, { harmonyFrom: 'left' }); parts.push({ segs: m.aspectAff.PFV, gloss: 'PFV' }); }
    if (neg && m.negAff) { segs = join(ph, segs, m.negAff, { harmonyFrom: 'left' }); parts.push({ segs: m.negAff, gloss: 'NEG' }); }
    const ta = m.tenseAff[tense];
    if (ta.length) { segs = join(ph, segs, ta, { harmonyFrom: 'left' }); parts.push({ segs: ta, gloss: tense }); }
    if (evid && m.evidentialAff) { segs = join(ph, segs, m.evidentialAff, { harmonyFrom: 'left' }); parts.push({ segs: m.evidentialAff, gloss: 'EVID' }); }
    if (m.personAff) { const pa = m.personAff[person]; if (pa.length) { segs = join(ph, segs, pa, { harmonyFrom: 'left' }); parts.push({ segs: pa, gloss: person }); } }
    return { segs, parts };
  }
  return { segs: stem, parts: [{ segs: stem, gloss: stemGloss }] };
}

export function citationVerb(lang, entry) {
  const m = lang.morph;
  if (m.type === 'fusional') return join(lang.ph, entry.segs, conjugationOf(m, entry).infinitive);
  if (m.type === 'agglutinative' && m.infinitive && !m.nounClasses) return join(lang.ph, entry.segs, m.infinitive, { harmonyFrom: 'left' });
  return entry.segs;
}

// ---------- Celtic-style initial mutation (lenition) ----------
function buildMutation(ph) {
  const cand = { p: ['b', 'f'], t: ['d', 'θ'], k: ['g', 'x'], b: ['v', 'β'], d: ['ð'], g: ['ɣ'], m: ['v', 'β'], s: ['h'] };
  const map = {};
  for (const [a, bs] of Object.entries(cand)) { if (!ph.consonants.includes(a)) continue; const b = bs.find(x => ph.consonants.includes(x)); if (b) map[a] = b; }
  return map;
}
export function mutate(m, segs) {
  if (!m.mutation || !segs.length) return segs;
  const t = m.mutation[segs[0]];
  return t ? [t, ...segs.slice(1)] : segs;
}

export { PERSONS, key as segKey };
void toneOf;
