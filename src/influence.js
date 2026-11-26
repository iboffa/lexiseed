// Secondary influence (contact): a second language, descended from another real ancestor (or from a sister
// branch of the same one), lends words at a seeded point of the recipient's history. Loans are adapted to the
// recipient's sounds and syllable shapes as they were at that time, then undergo the recipient's later sound
// changes, as French loans in English went through the Great Vowel Shift.
// [ASSUMPTION] Borrowing rates follow the general finding that basic vocabulary resists borrowing
// (Tadmor & Haspelmath, World Loanword Database): rare in tier 1, common in tier 3 and in meanings the
// ancestor has no word for. Pronouns, numerals and function words are never borrowed here.
import { PROTO } from './data/proto/index.js';
import { CHANGES } from './data/changes.js';
import { MEANINGS } from './data/meanings.js';
import { SEGMENTS } from './data/phonemes.js';
import { choosePath } from './history2.js';
import { evolve } from './evolve.js';
import { isV, vBase, isLong, toneOf } from './phonology.js';
import { FAMILY_PROTO, makeCoiner } from './descent.js';
import { applyCascade } from './history.js';
import { stream } from './rng.js';

export const INFLUENCE_FAMILIES = Object.keys(FAMILY_PROTO).filter(f => CHANGES[f] && PROTO[FAMILY_PROTO[f]]);
export const CONTACT_YEARS = 3000;
const ROOTS = MEANINGS.filter(([, pos, , , recipe]) => ['n', 'v', 'adj'].includes(pos) && !recipe);

export function validateContacts(input) {
  if (!Array.isArray(input)) throw new RangeError('Contacts must be a list of language families.');
  const seen = new Set();
  let total = 0;
  const contacts = input.map(row => {
    const { family, percent, yearsAgo } = row || {};
    if (!INFLUENCE_FAMILIES.includes(family) || seen.has(family)) throw new RangeError('Choose each donor family once.');
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) throw new RangeError('Each donor share must be between 0 and 100%.');
    if (!Number.isInteger(yearsAgo) || yearsAgo < 0 || yearsAgo > CONTACT_YEARS) throw new RangeError('Contact must start 0–3000 years ago.');
    seen.add(family);
    total += percent;
    return { family, percent, yearsAgo };
  });
  if (total > 100 + 1e-9) throw new RangeError('Donor percentages must total 100% or less.');
  return contacts;
}

const RATES = { // [tier1, tier2, tier3, gap]
  light: [0.02, 0.08, 0.25, 0.45],
  heavy: [0.06, 0.25, 0.55, 0.85],
};
const NEVER = new Set(['pron', 'num', 'conj', 'dem', 'part', 'q', 'adv']);
const known = (s) => !!SEGMENTS[s.replace(/[ː1-6]/g, '')];
const strip = (s) => s.replace(/[ː1-6]/g, '');

// feature distance between two segments of the same type
function segDist(a, b) {
  const A = SEGMENTS[a], B = SEGMENTS[b];
  if (!A || !B) return 99;
  if (A.type !== B.type) return 50;
  if (A.type === 'V') return Math.abs(hNum(A.height) - hNum(B.height)) + (A.back !== B.back ? 1 : 0) + (A.round !== B.round ? 0.8 : 0) + (!!A.nasal !== !!B.nasal ? 0.5 : 0);
  return (A.place !== B.place ? (near(A.place, B.place) ? 1 : 2) : 0) + (A.manner !== B.manner ? 1.5 : 0) + (A.voice !== B.voice ? 0.7 : 0) + (!!A.asp !== !!B.asp ? 0.5 : 0) + (!!A.ejective !== !!B.ejective ? 0.5 : 0) + (!!A.prenasal !== !!B.prenasal ? 0.5 : 0);
}
const H = { high: 0, mid: 1, lowmid: 1.6, low: 2.2 };
const hNum = (h) => H[h] ?? 1.5;
const ORDER = ['labial', 'dental', 'alveolar', 'postalveolar', 'retroflex', 'palatal', 'velar', 'uvular', 'pharyngeal', 'glottal'];
const near = (p, q) => Math.abs(ORDER.indexOf(p) - ORDER.indexOf(q)) === 1;

// what the recipient sounded like at the time of contact
function snapshot(words) {
  const segs = new Set(), finals = new Set(), pairs = new Set(), inits = new Set();
  let long = false, tones = new Set();
  for (const w of words) {
    w.forEach(s => { if (isV(s)) { segs.add(vBase(s)); if (isLong(s)) long = true; const t = toneOf(s); if (t) tones.add(t); } else segs.add(s); });
    for (let i = 1; i < w.length; i++) if (!isV(w[i - 1]) && !isV(w[i])) pairs.add(w[i - 1] + '.' + w[i]);
    if (w.length && !isV(w[w.length - 1])) finals.add(w[w.length - 1]);
    if (w.length > 1 && !isV(w[0]) && !isV(w[1])) inits.add(w[0] + '.' + w[1]);
  }
  const vowels = [...segs].filter(s => SEGMENTS[s]?.type === 'V');
  const epen = ['u', 'i', 'ə', 'e', 'a', 'o'].find(v => vowels.includes(v)) || vowels[0] || 'a';
  return { segs, finals, pairs, inits, long, tones: [...tones].sort(), epen };
}

// adapt a donor word (objects {s, st}) to the recipient's sounds; heavy contact keeps a few foreign sounds
function adapt(word, snap, keepForeign, rng) {
  const map = (s) => {
    const b = strip(s);
    if (snap.segs.has(b) || keepForeign.has(b)) return b;
    let best = null, bd = Infinity;
    for (const c of snap.segs) { const d = segDist(b, c); if (d < bd) { bd = d; best = c; } }
    return best || b;
  };
  let out = word.map(x => {
    let s = map(x.s);
    if (isV(s)) {
      if (snap.long && isLong(x.s)) s += 'ː';
      if (snap.tones.length) s += toneOf(x.s) && snap.tones.includes(toneOf(x.s)) ? toneOf(x.s) : rng.pick(snap.tones);
    }
    return { s, st: x.st };
  });
  // syllable shapes: break unattested clusters and final consonants with the recipient's epenthetic vowel
  const V = (s) => ({ s: snap.epen + (snap.tones.length ? snap.tones[0] : ''), st: false, ep: true });
  const res = [];
  for (let i = 0; i < out.length; i++) {
    const cur = out[i], prev = res[res.length - 1];
    if (prev && !isV(prev.s) && !isV(cur.s)) {
      const initial = res.length === 1;
      const ok = initial ? snap.inits.has(prev.s + '.' + cur.s) : snap.pairs.has(prev.s + '.' + cur.s);
      if (!ok && prev.s === cur.s) continue; // an unfamiliar double consonant is simplified
      if (!ok) res.push(V());
    }
    res.push(cur);
  }
  const last = res[res.length - 1];
  if (last && !isV(last.s) && !snap.finals.has(last.s)) res.push(V());
  return res;
}

// choose donor, contact point and loans for a descended language
export function chooseInfluence(ctl, seed, d) {
  const fam = ctl.influence;
  if (!fam || fam === 'none' || !INFLUENCE_FAMILIES.includes(fam) || !d) return null;
  const level = ctl.influenceLevel === 'heavy' ? 'heavy' : 'light';
  const rng = stream(seed, 'influence', fam, level);
  const DP = PROTO[FAMILY_PROTO[fam]];
  // a sister branch when the donor family is the recipient's own (Norse in English)
  let anchor = null;
  if (fam === ctl.family) {
    const others = Object.entries(CHANGES[fam].anchors).filter(([a]) => a !== d.path.anchor);
    anchor = others.length ? rng.weighted(others) : null;
  }
  const donor = choosePath(fam, seed, { salt: 'donor', anchor, fidelity: 0.8, drift: 5 * Math.round(rng.range(55, 80) / 5) });
  // contact somewhere in the middle of the recipient's history (never before its first change)
  const n = d.path.steps.length;
  const k = n ? Math.max(1, Math.min(n, Math.round(n * rng.range(0.35, 0.75)))) : 0;
  const before = d.path.steps.slice(0, k).flatMap(s => s.rules);
  const after = d.path.steps.slice(k).flatMap(s => s.rules);
  const recip = Object.values(d.P.words).filter(w => w?.f).map(w => evolve(before, w.f, { stress: w.s }).segs.filter(known));
  const snap = snapshot(recip);
  // heavy contact brings in a few new sounds (as French brought v and ʒ into English)
  const keepForeign = new Set();
  const R = RATES[level];
  const loans = {};
  const donorSegs = new Map();
  const picks = [];
  for (const m of MEANINGS) {
    const [gloss, pos, basic] = m;
    if (NEVER.has(pos)) continue;
    const dw = DP.words[gloss];
    if (!dw?.f) continue;
    const gap = !d.words[gloss]?.segs?.length;
    const r = stream(seed, 'influence-word', fam, gloss);
    if (!r.chance(gap ? R[3] : R[Math.min(3, basic) - 1])) continue;
    const e = evolve(donor.rules, dw.f, { stress: dw.s });
    const objs = e.objs.filter(x => known(x.s));
    if (!objs.some(x => isV(x.s))) continue;
    picks.push({ gloss, objs, proto: dw.f.split(/\s+/), gap });
    for (const x of objs) { const b = strip(x.s); if (!snap.segs.has(b)) donorSegs.set(b, (donorSegs.get(b) || 0) + 1); }
  }
  if (level === 'heavy') for (const [s, c] of [...donorSegs].sort((a, b) => b[1] - a[1]).slice(0, 2)) if (c >= 3) keepForeign.add(s);
  for (const p of picks) {
    const ad = adapt(p.objs, snap, keepForeign, stream(seed, 'influence-tone', fam, p.gloss));
    const segs0 = ad.map(x => x.s);
    const vs = ad.map((x, i) => (isV(x.s) ? i : -1)).filter(i => i >= 0);
    const stressSyl = Math.max(0, vs.findIndex(i => ad[i].st));
    const segs = evolve(after, segs0, { stress: stressSyl }).segs.filter(known);
    if (!segs.some(isV)) continue;
    loans[p.gloss] = { segs, donorForm: p.objs.map(x => x.s), adapted: segs0, proto: p.proto, gap: p.gap };
  }
  const donorName = donor.anchorName && donor.anchorName !== donor.anchor ? `early ${donor.anchorName}-like` : `late ${donor.protoName}`;
  return {
    family: fam, level, donorName, donorAnchor: donor.anchor, donorProto: donor.protoName,
    contactStep: k, totalSteps: n, contactLabel: d.path.steps[k - 1]?.label || '', newSounds: [...keepForeign], loans,
  };
}

// Shares count independently sourced content roots. Allocate whole meanings by largest
// remainder, including the base share in rounding. The borrowability ordering keeps
// more of the basic vocabulary native at modest contact levels.
function planRoots(contacts, seed) {
  const percentages = [...contacts.map(c => c.percent), Math.max(0, 100 - contacts.reduce((s, c) => s + c.percent, 0))];
  const amounts = percentages.map(p => p * ROOTS.length / 100);
  const counts = amounts.map(Math.floor);
  const remainders = amounts.map((v, i) => ({ i, fraction: v - counts[i] })).sort((a, b) => b.fraction - a.fraction);
  const missing = ROOTS.length - counts.reduce((a, b) => a + b, 0);
  for (const { i } of remainders.slice(0, missing)) counts[i]++;
  const ranks = ROOTS.map(meaning => {
    const priority = stream(seed, 'borrowability', meaning[0]).next() ** (1 / (meaning[2] ** 2));
    return { meaning, priority };
  }).sort((a, b) => b.priority - a.priority);
  const borrowed = ranks.slice(0, ROOTS.length - counts.pop()).map(x => x.meaning);
  // A fixed preference per (meaning, donor) lets a small share edit reassign
  // individual roots without reshuffling the rest of the borrowed vocabulary.
  const preferences = [];
  for (const [i, contact] of contacts.entries()) {
    if (!counts[i]) continue;
    for (const meaning of borrowed) {
      const rank = stream(seed, 'contact-allocation', contact.family, meaning[0]).next();
      preferences.push({ i, meaning, rank });
    }
  }
  preferences.sort((a, b) => b.rank - a.rank);
  const assigned = new Set();
  const groups = contacts.map(() => []);
  for (const { i, meaning } of preferences) {
    if (groups[i].length >= counts[i] || assigned.has(meaning[0])) continue;
    groups[i].push(meaning);
    assigned.add(meaning[0]);
  }
  return groups;
}

const contactStage = (n, age) => Math.round(n * (1 - age / CONTACT_YEARS));

// Invented histories have a fixed inventory and a sequence of optional sound rules.
// Use the recipient's syllable model for adoption throughout that sequence.
function inventedSnapshot(ph) {
  const pairs = new Set([...ph.legalOnsets, ...ph.legalCodas]);
  for (const coda of ph.codaSet) for (const onset of ph.consonants) pairs.add(coda + '.' + onset);
  return {
    segs: new Set([...ph.consonants, ...ph.vowels]), finals: new Set([...ph.codaSet, ...ph.codaClusters.map(c => c.at(-1))]),
    pairs, inits: ph.legalOnsets, long: ph.longVowels,
    tones: Array.from({ length: ph.toneCount }, (_, i) => i + 1), epen: ph.epenthetic,
  };
}

export function buildContacts(ctl, seed, descent, ph, cascade) {
  const words = {};
  const contacts = [];
  if (!ctl.contacts?.length) return { contacts, words, rootCount: ROOTS.length };
  const planned = planRoots(ctl.contacts, seed);
  const steps = descent ? descent.path.steps : cascade.rules;
  const stages = new Map();
  function recipientStage(k) {
    if (!stages.has(k)) {
      if (descent) {
        const before = steps.slice(0, k).flatMap(s => s.rules);
        const after = steps.slice(k).flatMap(s => s.rules);
        const corpus = Object.values(descent.P.words).filter(w => w.f).map(w => evolve(before, w.f, { stress: w.s }).segs.filter(known));
        stages.set(k, { snap: snapshot(corpus), finish: (form, stress) => evolve(after, form, { stress }).segs.filter(known) });
      } else {
        const tail = { ...cascade, rules: steps.slice(k) };
        stages.set(k, { snap: inventedSnapshot(ph), finish: (form, stress, rng) => applyCascade(tail, ph, form, rng).segs });
      }
    }
    return stages.get(k);
  }
  const taken = new Set();
  for (const [i, row] of ctl.contacts.entries()) {
    const { family, yearsAgo } = row;
    const rng = stream(seed, 'contact-donor', family);
    const siblings = Object.entries(CHANGES[family].anchors).filter(([name]) => name !== descent?.path.anchor);
    const anchor = family === ctl.family && siblings.length ? rng.weighted(siblings) : null;
    const donor = choosePath(family, seed, { salt: 'contact-' + family, anchor, drift: 80 });
    const P = PROTO[FAMILY_PROTO[family]];
    const coin = makeCoiner(P);
    const donorName = donor.anchorName + '-like';
    const contactStep = contactStage(steps.length, yearsAgo);
    const contact = { ...row, donorName, donorAnchor: donor.anchor, donorProto: donor.protoName, contactStep, totalSteps: steps.length, loans: {} };
    contacts.push(contact);
    for (const [gloss, , basic] of planned[i]) {
      const borrowedYearsAgo = stream(seed, 'loan-date', family, gloss).int(0, yearsAgo);
      const stage = contactStage(steps.length, borrowedYearsAgo);
      const { snap, finish } = recipientStage(stage);
      const donorRules = donor.steps.slice(0, contactStage(donor.steps.length, borrowedYearsAgo)).flatMap(s => s.rules);
      const attested = P.words[gloss];
      // When a donor lacks this meaning, or its form would duplicate another loan,
      // coin a donor-shaped synonym and explicitly mark that choice in the dictionary.
      let segs, proto, donorForm, adapted, coined;
      for (let attempt = 0; attempt < 32; attempt++) {
        const formRng = stream(seed, 'contact-form', family, gloss, attempt);
        coined = attempt > 0 || !attested?.f;
        proto = coined ? coin(formRng, (basic === 1 ? 1 : 2) + Math.floor(attempt / 8)) : attested.f.split(/\s+/);
        const donorWord = evolve(donorRules, proto, { stress: coined ? null : attested.s }).objs.filter(x => known(x.s));
        donorForm = donorWord.map(x => x.s);
        const adaptedWord = adapt(donorWord, snap, new Set(), formRng);
        adapted = adaptedWord.map(x => x.s);
        const stress = Math.max(0, adaptedWord.filter(x => isV(x.s)).findIndex(x => x.st));
        segs = finish(adapted, stress, formRng);
        if (segs.some(isV) && !taken.has(segs.join(' '))) break;
      }
      // Bounded final disambiguation. Each appended syllable gives a new length.
      const extension = [ph.consonants[0], ph.epenthetic];
      while (!segs.some(isV) || taken.has(segs.join(' '))) segs = [...segs, ...extension];
      taken.add(segs.join(' '));
      const displaced = descent?.words[gloss]?.segs.length ? descent.words[gloss].proto : null;
      const loan = { family, from: donorName, yearsAgo, borrowedYearsAgo, contactStep: stage, donorForm, adapted, displaced, coined };
      const entry = { segs, proto, borrowed: true, loan, inherited: false, root: null, applied: [], exempt: [] };
      contact.loans[gloss] = entry;
      words[gloss] = entry;
    }
  }
  return { contacts, words, rootCount: ROOTS.length };
}
