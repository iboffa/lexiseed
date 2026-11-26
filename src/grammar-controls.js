// Seeded grammatical forms. Each degree and each exceptional stem has its own stream.
import { genAffix, join } from './morphology.js';
import { isV, vBase } from './phonology.js';
import { stream } from './rng.js';

export const DEGREE_STYLES = ['particle', 'prefix', 'suffix', 'unmarked'];

export function buildDegreeMarkers(ph, seed) {
  const markers = {};
  const used = new Set();
  for (const key of ['CMPR', 'SUPL', 'than']) {
    markers[key] = genAffix(ph, stream(seed, 'comparison', key), ['CV', 'V', 'CV'], used);
  }
  return markers;
}

export function markDegree(lang, word, degree) {
  if (!degree) return [word];
  const style = lang.controls[degree === 'CMPR' ? 'comparative' : 'superlative'];
  if (style === 'unmarked') return [word];
  const segs = lang.morph.degreeMarkers[degree];
  const part = { segs, gloss: degree };
  if (style === 'particle') return [{ segs, parts: [part] }, word];
  if (style === 'prefix') return [{ segs: join(lang.ph, segs, word.segs), parts: [part, ...word.parts] }];
  return [{ segs: join(lang.ph, word.segs, segs, { harmonyFrom: 'left' }), parts: [...word.parts, part] }];
}

// Allocate a rounded quota in a fixed order. Raising the percentage keeps previous exceptions.
// Common verbs and the inherited copula are first in line.
export function configureIrregularVerbs(lang, verbs) {
  const { seed, controls, ph } = lang;
  const count = Math.round(verbs.length * controls.irregularity / 100);
  const ranked = verbs.map(entry => ({
    entry,
    rank: entry.suppletive ? -1 : (entry.basic || 3) + stream(seed, 'irregularity', entry.gloss).next(),
  })).sort((a, b) => a.rank - b.rank);
  for (const [index, { entry }] of ranked.entries()) {
    entry.strong = false;
    if (index >= count) {
      if (entry.suppletive) {
        delete entry.suppletive;
        if (lang.inherited) lang.inherited = lang.inherited.filter(item => item !== 'the verb “be”');
      }
      continue;
    }
    if (entry.suppletive) continue;
    const rng = stream(seed, 'past-stem', entry.gloss);
    const i = entry.segs.findIndex(isV);
    const vowels = ph.vowels.filter(v => i >= 0 && v !== vBase(entry.segs[i]));
    const stem = entry.segs.slice();
    const ablaut = lang.morph.ablautMap?.[vBase(entry.segs[i] || '')];
    if (vowels.length) stem[i] = (vowels.includes(ablaut) ? ablaut : rng.pick(vowels)) + entry.segs[i].slice(vBase(entry.segs[i]).length);
    else stem.unshift(...genAffix(ph, rng, ['CV'], new Set()));
    entry.pastStem = stem;
    entry.strong = !!lang.morph.ablaut;
  }
  lang.morph.irregularVerbs = { count, total: verbs.length };
}
