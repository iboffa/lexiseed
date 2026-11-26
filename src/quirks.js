// Peculiar grammatical features ("quirks"): seeded, family-weighted, each one implemented end to end
// (it changes how sentences are built, has a grammar-book section, and at least one example that uses it).
// [ASSUMPTION] The list and the family weights are the author's choice, based on well-known cases:
//   datPoss   - possession with a dative and "be" (Latin mihi est liber, Irish, Hindi)
//   locPoss   - possession with "at" and "be" (Russian u menja est', Finnish minulla on, Irish tá ... agam)
//   existPoss - possession as "X's Y exists" (Turkish evim var)
//   zeroCopula- no "be" in the present (Russian, Arabic, Hungarian 3rd person)
//   serEstar  - two verbs "to be": one for qualities, one for location and states (Spanish ser/estar, Irish is/tá)
//   dom       - animate or definite objects are marked like recipients (Spanish a, Hindi ko, Romanian pe)
//   negConcord- negative words also need the plain negation (Spanish no ... nunca, Russian ni ... ne)
//   negCircum - negation in two parts around the verb (French ne ... pas, Welsh, Arabic dialects ma ... -š)
//   tv        - polite "you" borrowed from the plural or third person (French vous, German Sie, Russian vy)
//   adjVerb   - adjectives are verbs: "the woman wise-s" (Japanese, Chinese, Korean)
//   inalienable - kin and body parts are possessed directly, other things need a possessive word (Polynesian a/o)
//   construct - the possessed noun takes a bound "construct" form before its possessor (Arabic, Hebrew)
//   defConj   - the verb agrees with a definite object (Hungarian)
//   redup     - plural and intensity by reduplication (Malay, Polynesian)
//   incorp    - generic objects are incorporated into the verb (Nahuatl, Iroquoian)
//   honorific - respected people take an honorific title, and verbs a respect form when they are the subject;
//               a polite speech level marks verbs addressed to a superior (Japanese -sama / o-...-ni naru / -masu,
//               Korean -nim / -si- / -yo, Samoan respect vocabulary)
//   serial    - instruments are introduced by a serial verb "take" (Chinese, West African languages)
import { genAffix } from './morphology.js';
import { stream } from './rng.js';

const KIN_BODY = new Set(['mother', 'father', 'brother', 'sister', 'child', 'son', 'daughter', 'friend', 'head', 'eye', 'ear', 'nose', 'mouth', 'tooth', 'tongue', 'hand', 'foot', 'heart', 'blood', 'bone', 'skin', 'hair', 'name']);

export const QUIRKS = {
  datPoss: { name: 'No verb “to have”: possession with the dative', group: 'poss', w: { romance: 2.5, celtic: 1.5, hellenic: 1, indoaryan: 1.5, uralic: 0.5, original: 1 } },
  locPoss: { name: 'No verb “to have”: “at me is”', group: 'poss', w: { slavic: 3, celtic: 2.5, uralic: 3, semitic: 2, original: 1, bantu: 0.5 } },
  existPoss: { name: 'No verb “to have”: “my book exists”', group: 'poss', w: { turkic: 4, japonic: 2, sinitic: 1, original: 1, uralic: 0.5 } },
  zeroCopula: { name: 'No verb “to be” in the present', group: 'copula', w: { slavic: 3, semitic: 3, turkic: 2, uralic: 1.5, indoaryan: 0.4, polynesian: 2, sinitic: 2, bantu: 1, original: 1.5, hellenic: 0.3 } },
  serEstar: { name: 'Two verbs “to be”', group: 'copula', w: { romance: 3, celtic: 3, original: 0.8 } },
  dom: { name: 'Marked animate objects', w: { romance: 2, indoaryan: 3, turkic: 2, semitic: 0.5, original: 1, uralic: 0.3 } },
  negConcord: { name: 'Double negation', w: { romance: 3, slavic: 3, hellenic: 2, celtic: 1, original: 1, germanic: 0.3, bantu: 0.5 } },
  negCircum: { name: 'Two-part negation', w: { romance: 1.5, celtic: 1.5, germanic: 0.5, original: 1, semitic: 1, bantu: 0.3 } },
  tv: { name: 'Polite “you”', w: { romance: 3, slavic: 3, germanic: 2, hellenic: 2, turkic: 2, uralic: 1, original: 1, celtic: 1, indoaryan: 1.5 } },
  adjVerb: { name: 'Adjectives are verbs', group: 'pred', w: { japonic: 4, sinitic: 3, polynesian: 1.5, original: 1, bantu: 0.5 } },
  inalienable: { name: 'Two kinds of possession', w: { polynesian: 3, original: 1, bantu: 0.5 } },
  construct: { name: 'The construct state', w: { semitic: 4, original: 0.5, celtic: 0.5 } },
  defConj: { name: 'Verbs agree with definite objects', w: { uralic: 3, original: 0.5 } },
  redup: { name: 'Reduplication', w: { polynesian: 3, original: 1, bantu: 1, sinitic: 0.5 } },
  incorp: { name: 'Noun incorporation', w: { original: 1, uralic: 0.3, polynesian: 0.5 } },
  honorific: { name: 'Honorifics', w: { japonic: 5, indoaryan: 1.5, polynesian: 1.5, bantu: 1, semitic: 0.5, turkic: 0.6, sinitic: 0.8, original: 1.2 } },
  serial: { name: 'Serial verbs', w: { sinitic: 3, bantu: 1, polynesian: 0.5, original: 1 } },
};

function gate(id, lang) {
  const m = lang.morph;
  switch (id) {
    case 'adjVerb': return m.type !== 'fusional';
    case 'defConj': return m.type === 'agglutinative' && !!m.personAff && !m.nounClasses;
    case 'redup': return m.type !== 'fusional' && !m.nounClasses;
    case 'incorp': return m.type === 'agglutinative' && !m.nounClasses;
    case 'serial': return m.type === 'isolating';
    case 'construct': return true;
    default: return true;
  }
}

const REQUIREMENTS = {
  adjVerb: 'agglutinative or isolating morphology',
  defConj: 'agglutinative morphology with person agreement and no noun classes',
  redup: 'agglutinative or isolating morphology without noun classes',
  incorp: 'agglutinative morphology without noun classes',
  serial: 'isolating morphology',
};

// choose the quirks (own stream: locality); level: none | few | many
export function chooseQuirks(lang, seed, level = 'few') {
  const rng = stream(seed, 'quirks');
  const fam = lang.controls.family;
  const n = level === 'none' ? 0 : level === 'many' ? rng.int(4, 6) : rng.int(2, 3);
  const chosen = [];
  const groups = new Set();
  const pins = lang.controls.features || {};
  for (const [id, q] of Object.entries(QUIRKS)) {
    if (pins[id] !== 'on') continue;
    const conflict = chosen.find(other => q.group && QUIRKS[other].group === q.group);
    if (conflict || !gate(id, lang)) {
      const reason = conflict ? `conflicts with “${QUIRKS[conflict].name}”` : `requires ${REQUIREMENTS[id]}`;
      lang.notes.push({ level: 'warn', feature: id, text: `“${q.name}” ${reason}. This feature is inactive.` });
      continue;
    }
    chosen.push(id);
    if (q.group) groups.add(q.group);
  }
  for (let k = chosen.length; k < n; k++) {
    const cand = Object.entries(QUIRKS).filter(([id, q]) => !pins[id] && !chosen.includes(id) && !(q.group && groups.has(q.group)) && gate(id, lang))
      .map(([id, q]) => [id, (q.w[fam] ?? 0) + (fam === 'original' ? 0.4 : 0.08)]).filter(([, w]) => w > 0);
    if (!cand.length) break;
    const id = rng.weighted(cand);
    chosen.push(id); if (QUIRKS[id].group) groups.add(QUIRKS[id].group);
  }
  return chosen;
}

// set up the forms each quirk needs
export function applyQuirks(lang, ids, seed) {
  const { ph, morph: m } = lang;
  const rng = stream(seed, 'quirks', 'forms');
  const used = new Set(m.used);
  for (const e of lang.lex.entries) used.add(e.segs.join(''));
  const short = ph.codaCap ? ['CV', 'CVC', 'V', 'VC'] : ['CV', 'V', 'CVCV'];
  const q = {};
  for (const id of ids) q[id] = true;
  m.zeroCopula = !!q.zeroCopula;
  if (q.zeroCopula) m.zeroCopulaScope = rng.chance(0.3) ? 'third' : 'all';
  if (q.locPoss) { m.possLocCase = ['ADE', 'LOC', 'INE'].find(c => m.cases.includes(c)) || null; if (!m.possLocCase) m.possAt = genAffix(ph, rng, short, used); }
  if (q.existPoss) m.existential = genAffix(ph, rng, ['CVC', 'CV', 'CVCV'].filter(s => ph.codaCap || !s.endsWith('C')), used);
  if (q.serEstar) m.copulaLoc = genAffix(ph, rng, ['CVC', 'CVCV', 'VCV'].filter(s => ph.codaCap || !s.endsWith('C')), used);
  if (q.dom) { m.domRule = rng.pick(['human', 'animate', 'definite']); if (!m.cases.includes('DAT') && !m.adpos.recipient) m.adpos.recipient = genAffix(ph, rng, short, used); }
  if (q.negCircum) { m.negation2 = genAffix(ph, rng, ['CV', 'CVC', 'V'].filter(s => ph.codaCap || !s.endsWith('C')), used); m.neg2Pos = rng.pick(['afterVerb', 'final']); }
  if (q.tv) m.tvSource = m.type === 'isolating' ? '2PL' : rng.weighted({ '2PL': 3, '3PL': 1.5, '3SG': 0.8 });
  if (q.inalienable) m.possClassifier = genAffix(ph, rng, ['V', 'CV'], used);
  if (q.construct) m.constructAff = genAffix(ph, rng, ph.codaCap ? ['VC', 'V'] : ['V', 'CV'], used);
  if (q.defConj) m.defObjAff = genAffix(ph, rng, ph.codaCap ? ['VC', 'CV', 'V'] : ['CV', 'V'], used);
  if (q.honorific) {
    m.honorTitle = genAffix(ph, rng, ph.codaCap ? ['CVC', 'CV', 'CVCV'] : ['CV', 'CVCV'], used);
    m.honorTitleSide = m.type === 'isolating' ? 'word' : rng.weighted({ suffix: 3, prefix: 1 });
    m.honorVerb = genAffix(ph, rng, ph.codaCap ? ['CV', 'VC', 'CVC'] : ['CV', 'V'], used);
    m.politeVerb = m.politeAff || genAffix(ph, rng, ph.codaCap ? ['CVC', 'CVCV', 'CV'] : ['CVCV', 'CV'], used);
  }
  if (lang.controls.features?.redup === 'off' && m.pluralStrategy === 'reduplication') m.pluralStrategy = 'particle';
  if (q.redup) { m.pluralStrategy = 'reduplication'; m.redupIntensity = true; }
  if (q.serial && !lang.lex.byGloss.take) q.serial = false;
  lang.q = q;
  lang.quirks = ids.filter(id => q[id]);
  return lang.quirks;
}

export const isInalienable = (gloss) => KIN_BODY.has(gloss);
export const HONOURED = new Set(['king', 'queen', 'god', 'teacher', 'mother', 'father', 'guest']);

// rewrite a clause spec before it is built (possession, predicate adjectives)
export function rewriteSpec(lang, spec) {
  const q = lang.q || {};
  if (spec.V === 'have' && spec.O) {
    const owner = spec.S, owned = { ...spec.O };
    if (q.datPoss) return { ...spec, V: 'be', possCopula: true, S: owned, O: null, obl: [{ ...owner, kase: 'DAT', role: 'recipient', front: true }, ...(spec.obl || [])] };
    if (q.locPoss) {
      const m = lang.morph;
      const o = m.possLocCase ? { ...owner, kase: m.possLocCase, front: true } : { ...owner, at: true, front: true };
      return { ...spec, V: 'be', possCopula: true, S: owned, O: null, obl: [o, ...(spec.obl || [])] };
    }
    if (q.existPoss) {
      const possessed = owner.pron ? { ...owned, poss: owner.pron, indef: false } : { ...owned, possN: owner, indef: false };
      return { ...spec, V: 'exist', S: possessed, O: null };
    }
  }
  return spec;
}
