// Sentence builder: noun phrases, clauses, word order, and Leipzig-style interlinear glosses.
import { CASES } from './data/cases.js';
import { inflectNoun, inflectVerb, join, mutate, roleToCase, nounStem } from './morphology.js';
import { rewriteSpec, isInalienable, HONOURED } from './quirks.js';
import { markDegree } from './grammar-controls.js';
import { stream } from './rng.js';

// A "word" in a sentence: { segs, parts: [{segs, gloss}] }
const W = (segs, gloss) => ({ segs, parts: [{ segs, gloss }] });

export function buildSyntax(lang, ctl, seed) {
  const rng = stream(seed, 'syntax');
  const m = lang.morph;
  const OV = ctl.order.indexOf('O') < ctl.order.indexOf('V');
  const genPos = OV ? (rng.chance(0.85) ? 'before' : 'after') : (rng.chance(0.75) ? 'after' : 'before');
  // C1 (sourced, WALS 86A x 87A over 71 languages, references/CANDIDATES.md): genitive-noun => adjective-noun in 20/20;
  // noun-genitive => noun-adjective in 24/30. One draw either way, so later draws keep their position.
  const adjRoll = rng.next();
  const adjPos = genPos === 'before' ? 'before' : (adjRoll < 0.8 ? 'after' : 'before');
  const numPos = rng.chance(0.75) ? 'before' : 'after';
  const relPos = OV ? (rng.chance(0.7) ? 'before' : 'after') : 'after';
  const whFront = !OV && rng.chance(0.7);
  const demPos = rng.chance(0.65) ? 'before' : adjPos;
  return { order: ctl.order, OV, genPos, adjPos, numPos, relPos, whFront, demPos, v2: m.v2 };
}

// ---------- noun phrases ----------
// spec: { n | pron, number, kase, role, adj, def, indef, poss (person) | possN (spec), num, dem }
export function buildNP(lang, spec, clause = {}) {
  const { ph, morph: m, syntax: sx, lex } = lang;
  if (spec.wh) { const core = [W(lex.byGloss[spec.wh].segs, spec.wh)]; core.person = '3SG'; core.wh = true; return core; }
  const words = [];
  const rc = roleToCase(m.cases);
  let kase = spec.kase && m.cases.includes(spec.kase) ? spec.kase : null;
  let adpos = null;
  if (!kase && spec.role) {
    kase = rc[spec.role] || null;
    if (!kase && !['subject', 'object', 'agent', 'absolutive'].includes(spec.role)) adpos = m.adpos[spec.role] ? { segs: m.adpos[spec.role], gloss: adposGloss(spec.role) } : null;
  }
  if (spec.kase && !m.cases.includes(spec.kase) && !kase) {
    const role = CASES[spec.kase].role;
    kase = rc[role] || null;
    if (!kase && m.adpos[role]) adpos = { segs: m.adpos[role], gloss: adposGloss(role) };
  }
  if (spec.at && lang.morph.possAt) adpos = { segs: lang.morph.possAt, gloss: 'at' };
  const q = lang.q || {};
  const number = spec.number ?? 'SG';
  const num = m.numbers.includes(number) ? number : (number === 'DU' ? 'PL' : 'SG');
  const suffixCase = m.caseMarking === 'suffix' ? kase : null;

  // head
  let head;
  let person = num === 'SG' ? '3SG' : '3PL';
  let gender = null;
  if (spec.pron) {
    const polite = spec.pron === '2SG.POL';
    const pid = polite ? (m.tvSource || '2PL') : spec.pron;
    const p = lang.pronouns.forms[pid] || lang.pronouns.forms[pid.replace(/\..*$/, '')] || lang.pronouns.forms['3SG'];
    person = pid.replace(/\..*$/, '').replace(/[MFN]$/, '').replace('DU', 'PL').replace(/^([123])(SG|PL).*/, '$1$2');
    const form = (suffixCase && p.cases?.[suffixCase]) || p.base;
    const pg = polite ? pid + '(POL)' : spec.pron;
    head = { segs: form, parts: [{ segs: form, gloss: pg + (suffixCase && suffixCase !== m.cases[0] ? '.' + suffixCase : '') }] };
    if (suffixCase && !p.cases?.[suffixCase] && m.caseAff?.[suffixCase]?.length) {
      const segs = join(ph, form, m.caseAff[suffixCase], { harmonyFrom: 'left' });
      head = { segs, parts: [{ segs: form, gloss: pg }, { segs: m.caseAff[suffixCase], gloss: suffixCase }] };
    }
  } else {
    const e = lex.byGloss[spec.n];
    gender = e.gender;
    const r = inflectNoun(lang, e, { kase: suffixCase, number: num, poss: spec.poss && m.possAff ? spec.poss : null });
    head = { segs: r.segs, parts: r.parts };
  }

  if (q.honorific && spec.n && HONOURED.has(spec.n) && m.honorTitle) {
    if (m.honorTitleSide === 'suffix') head = { segs: join(ph, head.segs, m.honorTitle, { harmonyFrom: 'left' }), parts: [...head.parts, { segs: m.honorTitle, gloss: 'HON' }] };
    else if (m.honorTitleSide === 'prefix') head = { segs: join(ph, m.honorTitle, head.segs, { harmonyFrom: 'right' }), parts: [{ segs: m.honorTitle, gloss: 'HON' }, ...head.parts] };
  }
  const construct = q.construct && spec.possN && !spec.pron;
  if (construct) { const segs = join(ph, head.segs, m.constructAff); head = { segs, parts: [...head.parts, { segs: m.constructAff, gloss: 'CSTR' }] }; }
  // article
  let artWord = null;
  if (m.articles && !spec.pron && !construct && (spec.def || spec.indef)) {
    const g = m.genders.length && !m.nounClasses ? gender : '_';
    const table = spec.def ? m.articles.def : m.articles.indef;
    if (table) {
      const a = table[g] ?? Object.values(table)[0];
      const gl = (spec.def ? 'DEF' : 'INDF') + (m.genders.length && !m.nounClasses ? '.' + g : '');
      if (m.articles.side === 'suffix') {
        const segs = join(ph, head.segs, a, { harmonyFrom: 'left' });
        head = { segs, parts: [...head.parts, { segs: a, gloss: gl }] };
      } else artWord = { segs: a, parts: [{ segs: a, gloss: gl }], side: m.articles.side };
      if (m.mutation && spec.def && gender === 'F' && num === 'SG' && m.articles.side === 'before') {
        const ms = mutate(m, head.segs);
        if (ms !== head.segs) { head = { segs: ms, parts: [{ segs: ms, gloss: head.parts[0].gloss + '[LEN]' }, ...head.parts.slice(1)] }; }
      }
    }
  }

  // adjective
  let adjWord = null;
  if (spec.adj) {
    const a = lex.byGloss[spec.adj];
    adjWord = agreeAdjective(lang, a, { gender, number: num, kase: suffixCase });
    if (spec.very) {
      if (q.redup && m.redupIntensity) { const segs = join(ph, adjWord.segs, adjWord.segs); adjWord = { segs, parts: [...adjWord.parts, { segs: adjWord.segs, gloss: 'INTS' }] }; }
      else if (lex.byGloss.very) adjWord = [W(lex.byGloss.very.segs, 'very'), adjWord];
    }
    if (spec.degree && !Array.isArray(adjWord)) adjWord = markDegree(lang, adjWord, spec.degree);
  }
  // numeral (+ classifier)
  let numWords = [];
  if (spec.num) {
    const ne = lex.byGloss[spec.num];
    numWords.push(W(ne.segs, spec.num));
    if (m.classifiers) {
      const cl = lex.byGloss[spec.n]?.tags.includes('h') ? 'people' : lex.byGloss[spec.n]?.tags.includes('a') ? 'animals' : 'general';
      numWords.push(W(m.classifiers[cl], 'CLF'));
    }
  }
  // possessor noun phrase (genitive)
  let possWords = [];
  if (spec.possN) possWords = buildNP(lang, { ...spec.possN, role: construct ? undefined : 'possessor', kase: construct ? m.cases[0] : spec.possN.kase });
  if (spec.poss && !m.possAff) {
    const pf = lang.pronouns.forms[spec.poss];
    const gen = m.cases.includes('GEN') ? (pf.cases?.GEN || (m.caseAff?.GEN ? join(ph, pf.base, m.caseAff.GEN, { harmonyFrom: 'left' }) : null)) : null;
    if (gen) possWords = [W(gen, spec.poss + '.GEN')];
    else if (m.adpos.possessor) possWords = sx.genPos === 'before' ? [W(pf.base, spec.poss), W(m.adpos.possessor, 'of')] : [W(m.adpos.possessor, 'of'), W(pf.base, spec.poss)];
    else possWords = [W(pf.base, spec.poss)];
  }
  if (q.inalienable && possWords.length && spec.n && !isInalienable(spec.n)) {
    const pw = W(m.possClassifier, 'POSS');
    possWords = sx.genPos === 'before' ? [...possWords, pw] : [pw, ...possWords];
  }
  // demonstrative
  let demWord = spec.dem ? W(lex.byGloss[spec.dem].segs, spec.dem.toUpperCase() === 'THIS' ? 'this' : 'that') : null;

  // assemble
  let core = [head];
  const adjWs = adjWord ? [].concat(adjWord) : [];
  if (num === 'PL' && !spec.pron && m.pluralStrategy === 'particle') core.push(W(m.pluralParticle, 'PL'));
  if (adjWs.length) core = sx.adjPos === 'before' ? [...adjWs, ...core] : [...core, ...adjWs];
  if (numWords.length) core = sx.numPos === 'before' ? [...numWords, ...core] : [...core, ...numWords];
  if (possWords.length) core = sx.genPos === 'before' && !construct ? [...possWords, ...core] : [...core, ...possWords];
  if (demWord) core = sx.demPos === 'before' ? [demWord, ...core] : [...core, demWord];
  if (artWord) core = artWord.side === 'before' ? [artWord, ...core] : [...core, artWord];
  // case particle or adposition
  if (m.caseMarking === 'particle' && kase && m.caseParticles[kase]?.length) {
    const pw = W(m.caseParticles[kase], kase);
    core = m.particleSide === 'after' ? [...core, pw] : [pw, ...core];
  } else if (adpos) {
    const aw = W(adpos.segs, adpos.gloss);
    core = m.adposSide === 'post' ? [...core, aw] : [aw, ...core];
  }
  if (spec.topic && m.topicMarker) core = [...core, W(m.topicMarker, 'TOP')];
  if (q.honorific && spec.n && HONOURED.has(spec.n) && m.honorTitleSide === 'word') core = [...core, W(m.honorTitle, 'HON')];
  // coordination inside a noun phrase: "the bear and the wolf" (both conjuncts carry the same case or adposition)
  if (spec.and) {
    const second = buildNP(lang, { ...spec.and, role: spec.role, kase: spec.kase });
    const cg = spec.andWord || 'and';
    const ce = lex.byGloss[cg];
    core = ce ? [...core, W(ce.segs, cg), ...second] : [...core, ...second];
    person = person.startsWith('1') || second.person?.startsWith('1') ? '1PL' : person.startsWith('2') || second.person?.startsWith('2') ? '2PL' : '3PL';
  }
  core.person = person; core.gender = gender; core.cls = gender; core.honoured = !!(spec.n && HONOURED.has(spec.n)) || spec.pron === '2SG.POL';
  return core;
}

function adposGloss(role) {
  return { possessor: 'of', recipient: 'to', location: 'in', source: 'from', instrument: 'with', companion: 'with', goal: 'to', state: 'as', partial: 'some', change: 'into', without: 'without', surface: 'on', address: 'O' }[role] || role;
}

export function agreeAdjective(lang, a, { gender, number, kase }) {
  const { ph, morph: m } = lang;
  if (m.nounClasses && gender) {
    const g = m.genders.find(x => x.id === gender);
    const pre = g.prefix[number === 'SG' ? 'SG' : 'PL'];
    const segs = join(ph, pre, a.segs);
    return { segs, parts: [{ segs: pre, gloss: g.id.replace('CL', '').split('/')[number === 'SG' ? 0 : 1] }, { segs: a.segs, gloss: a.gloss }] };
  }
  if (m.type === 'fusional' && m.declensions && m.genders.length) {
    const d = m.declensions.find(x => x.gender === gender) || m.declensions[0];
    const stem = d.theme && a.segs[a.segs.length - 1]?.[0] === d.theme ? a.segs.slice(0, -1) : a.segs;
    const c = kase || m.cases[0] || 'NOM';
    const end = d.endings[c]?.[number] ?? [];
    const segs = join(ph, stem, end);
    const gl = [gender, m.cases.length ? c : null, number].filter(Boolean).join('.');
    return { segs, parts: [{ segs: stem, gloss: a.gloss }, { segs: end, gloss: gl }] };
  }
  return W(a.segs, a.gloss);
}

// ---------- clauses ----------
// spec: { S: np, V: gloss, O?: np, obl?: [np...], tense, aspect, neg, q: 'polar'|'wh', wh?: np-role, adv?, en }
export function buildClause(lang, specIn) {
  const { ph, morph: m, syntax: sx, lex } = lang;
  const q = lang.q || {};
  let spec = rewriteSpec(lang, specIn);
  // predicate adjective: "this woman is wise"; with adjVerb the adjective itself is the verb
  let predWord = null;
  if (spec.pred) {
    if (q.adjVerb) spec = { ...spec, V: spec.pred, adjAsVerb: true };
    else { const a = lex.byGloss[spec.pred] || lex.byGloss['u:' + spec.pred]; predWord = spec.very && q.redup ? W(join(ph, a.segs, a.segs), a.gloss + '~INTS') : W(a.segs, a.gloss); spec = { ...spec, V: 'be' }; }
  }
  if (spec.adv === 'never' && q.negConcord) spec = { ...spec, neg: true };
  // differential object marking
  if (q.dom && spec.O && !spec.O.kase) {
    const e = spec.O.n ? lex.byGloss[spec.O.n] : null;
    const human = spec.O.pron || e?.tags.includes('h');
    const animate = human || e?.tags.includes('a');
    const marked = m.domRule === 'human' ? human : m.domRule === 'animate' ? animate : (spec.O.def || spec.O.pron || spec.O.poss || spec.O.possN);
    if (marked) spec = { ...spec, O: { ...spec.O, ...(m.cases.includes('DAT') ? { kase: 'DAT' } : { role: 'recipient' }), dom: true } };
  }
  // serial verbs: an instrument is introduced by "take"
  let serialWords = [];
  if (q.serial && spec.obl?.some(o => (o.role === 'instrument' || o.kase === 'INS'))) {
    const inst = spec.obl.find(o => o.role === 'instrument' || o.kase === 'INS');
    spec = { ...spec, obl: spec.obl.filter(o => o !== inst) };
    const np = buildNP(lang, { ...inst, kase: undefined, role: undefined });
    serialWords = [W(lex.byGloss.take.segs, 'take'), ...np];
  }
  // noun incorporation of a generic object
  let incorporated = null;
  if (q.incorp && spec.O && spec.O.n && !spec.O.def && !spec.O.pron && !spec.O.adj && !spec.O.num && !spec.O.poss && !spec.O.possN && m.type === 'agglutinative') {
    incorporated = lex.byGloss[spec.O.n];
    spec = { ...spec, O: null };
  }
  const transitive = !!spec.O;
  const erg = m.cases.includes('ERG');
  const sRole = transitive ? (erg ? 'agent' : 'subject') : (erg ? 'absolutive' : 'subject');
  const S = spec.S ? buildNP(lang, { ...spec.S, role: spec.S.kase ? undefined : sRole }) : null;
  const O = spec.O ? buildNP(lang, { ...spec.O, role: spec.O.kase ? undefined : spec.O.role || (erg ? 'absolutive' : 'object') }) : null;
  const obl = (spec.obl || []).map(o => buildNP(lang, o));

  // verb
  let ve = lex.byGloss[spec.V];
  if (spec.V === 'exist') ve = { segs: m.existential, gloss: 'exist', conj: 0 };
  const isCopula = spec.V === 'be';
  if (isCopula && q.serEstar && m.copulaLoc && (spec.possCopula || spec.beLoc || (spec.obl || []).some(o => ['location', 'surface'].includes(o.role) || ['LOC', 'INE', 'ADE'].includes(o.kase)))) ve = { segs: m.copulaLoc, gloss: 'be.LOC', conj: 0 };
  if (spec.adjAsVerb) ve = { ...lex.byGloss[spec.V], conj: 0 };
  const tense = pickTense(m, spec.tense);
  const person = S ? S.person : '3SG';
  let verbWords = [];
  if (isCopula && m.zeroCopula && (tense === m.tenses[0]) && (m.zeroCopulaScope !== 'third' || person.startsWith('3'))) verbWords = [];
  else {
    const subjClass = m.nounClasses ? S?.cls : null;
    const r = inflectVerb(lang, ve, { tense, person, aspect: spec.aspect, neg: spec.neg && m.type === 'agglutinative' && m.negAff, evid: spec.evid, subjClass });
    verbWords = [{ segs: r.segs, parts: r.parts }];
    if (incorporated) { const ns = nounStem(m, incorporated); verbWords = [{ segs: join(ph, ns, r.segs), parts: [{ segs: ns, gloss: incorporated.gloss }, ...r.parts] }]; }
    if (q.honorific && verbWords.length) {
      const add = [];
      if (S?.honoured && m.honorVerb) add.push([m.honorVerb, 'HON']);
      if (spec.polite && m.politeVerb) add.push([m.politeVerb, 'POL']);
      for (const [aff, gl] of add) {
        const v = verbWords[0];
        verbWords = m.type === 'isolating' ? [...verbWords, W(aff, gl)] : [{ segs: join(ph, v.segs, aff, { harmonyFrom: 'left' }), parts: [...v.parts, { segs: aff, gloss: gl }] }, ...verbWords.slice(1)];
      }
    }
    if (q.defConj && m.defObjAff && O && (spec.O.def || spec.O.pron || spec.O.poss || spec.O.possN)) { const v = verbWords[0]; verbWords = [{ segs: join(ph, v.segs, m.defObjAff, { harmonyFrom: 'left' }), parts: [...v.parts, { segs: m.defObjAff, gloss: 'DEF.OBJ' }] }]; }
    if (spec.adjAsVerb && spec.degree) verbWords = [...markDegree(lang, verbWords[0], spec.degree), ...verbWords.slice(1)];
    if (m.type === 'isolating') {
      const tp = m.tenseParticles[tense];
      if (tp && tp.length) verbWords = m.particlePos === 'before' ? [W(tp, tense), ...verbWords] : [...verbWords, W(tp, tense)];
      if (spec.aspect === 'PFV' && m.aspectParticles) verbWords = [...verbWords, W(m.aspectParticles.PFV, 'PFV')];
    }
  }
  if (spec.predN) { const pn = buildNP(lang, { ...spec.predN, role: undefined }); verbWords = sx.OV ? [...pn, ...verbWords] : [...verbWords, ...pn]; }
  if (predWord) {
    const pred = markDegree(lang, predWord, spec.degree);
    verbWords = sx.OV ? [...pred, ...verbWords] : [...verbWords, ...pred];
  }
  if (spec.standard) {
    const standard = buildNP(lang, spec.standard);
    const than = W(m.degreeMarkers.than, 'than');
    if (m.adposSide === 'post') verbWords = [...standard, than, ...verbWords];
    else verbWords = [...verbWords, than, ...standard];
  }
  const negAsWord = spec.neg && !(m.type === 'agglutinative' && m.negAff);
  if (negAsWord && m.negPos !== 'sentenceFinal') {
    const nw = W(m.negation, 'NEG');
    verbWords = m.negPos === 'beforeVerb' ? [nw, ...verbWords] : [...verbWords, nw];
  }
  if (spec.neg && m.negation2 && m.neg2Pos === 'afterVerb') verbWords = [...verbWords, W(m.negation2, 'NEG2')];
  if (serialWords.length) verbWords = sx.OV ? [...serialWords, ...verbWords] : [...serialWords, ...verbWords];

  // pro-drop
  let Sout = S;
  if (S && spec.S.pron && m.proDrop && !spec.keepPronoun) Sout = null;
  if (spec.imperative || spec.dropSubject) Sout = null; // commands and chained clauses ("want to see") have no overt subject

  // order
  const slots = { S: Sout || [], O: O || [], V: verbWords };
  let seq = [];
  const order = sx.v2 ? 'SVO' : sx.order;
  for (const ch of order) {
    seq.push(...(ch === 'V' ? slots.V : ch === 'S' ? slots.S : slots.O));
  }
  // obliques: before the verb in OV, after the object in VO; a possessor in "to me is" goes first
  const frontWords = obl.filter((o, i) => (spec.obl || [])[i]?.front).flat();
  const oblWords = obl.filter((o, i) => !(spec.obl || [])[i]?.front).flat();
  if (oblWords.length) {
    if (sx.OV && !sx.v2) {
      const vi = seq.indexOf(slots.V[0]);
      if (vi >= 0) seq.splice(vi, 0, ...oblWords); else seq.push(...oblWords);
    } else seq.push(...oblWords);
  }
  if (frontWords.length) seq.unshift(...frontWords);
  if (sx.whFront) { for (const np of [O, S]) if (np?.wh) { seq = seq.filter(w => !np.includes(w)); seq.unshift(...np); } }
  if (spec.adv) seq.unshift(W(lex.byGloss[spec.adv].segs, spec.adv));
  if (sx.v2 && spec.adv) { // V2: adverb first, verb second, subject after the verb
    const restS = seq.filter(w => !slots.V.includes(w) && !slots.S.includes(w));
    seq = [restS[0], ...slots.V, ...slots.S, ...restS.slice(1)];
  }
  if (negAsWord && m.negPos === 'sentenceFinal') seq.push(W(m.negation, 'NEG'));
  if (spec.neg && m.negation2 && m.neg2Pos === 'final') seq.push(W(m.negation2, 'NEG2'));
  if (spec.q === 'polar' && m.questionParticle) {
    const qw = W(m.questionParticle, 'Q');
    if (m.questionPos === 'initial') seq.unshift(qw); else seq.push(qw);
  }
  if (spec.vocative) {
    const vo = buildNP(lang, { n: spec.vocative, kase: 'VOC', role: 'address' });
    seq = [...vo, ...seq];
  }
  return { words: seq.filter(Boolean), en: spec.en, q: !!spec.q };
}

function pickTense(m, t) {
  if (!t) return m.tenses[0];
  if (m.tenses.includes(t)) return t;
  if (t === 'PRS' || t === 'FUT') return m.tenses.includes('NPST') ? 'NPST' : m.tenses[0];
  return m.tenses[1] ?? m.tenses[0];
}
