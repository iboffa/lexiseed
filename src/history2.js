// Descent from a real ancestor: pick a seeded path through the family's sound history and evolve the
// ancestor's words with it. See src/data/changes.js (rules) and src/evolve.js (engine).
import { CHANGES, stepRules } from './data/changes.js';
import { compileRule, evolve, evolveSuffix, evolveWord } from './evolve.js';
import { stream } from './rng.js';

// [ASSUMPTION] Innovations beyond the real daughters (used when the distance slider is above 80): common,
// cross-linguistically frequent sound changes.
const INNOVATIONS = [
  { id: 'inn-reduce', label: 'Unstressed final vowels were reduced to ə.', rules: [{ r: '{a e i o u} > ə / C _ #', when: (w, i) => !w[i].st }] },
  { id: 'inn-voice', label: 'Voiceless stops between vowels became voiced.', rules: [{ r: '{p t k} > {b d g} / V _ V' }] },
  { id: 'inn-spirant', label: 'Voiced stops between vowels became fricatives.', rules: [{ r: '{b d g} > {v ð ɣ} / V _ V' }] },
  { id: 'inn-final-c', label: 'Final consonants after a vowel were lost.', rules: [{ r: 'C > ∅ / V _ #' }] },
  { id: 'inn-palatal', label: 'k and g before front vowels became tʃ and dʒ.', rules: [{ r: '{k g} > {tʃ dʒ} / _ Vf' }] },
  { id: 'inn-s-h', label: 'Initial s became h.', rules: [{ r: 's > h / # _ V' }] },
  { id: 'inn-devoice', label: 'Final voiced consonants became voiceless.', rules: [{ r: '{b d g z v ʒ} > {p t k s f ʃ} / _ #' }] },
  { id: 'inn-short', label: 'Long vowels were shortened.', rules: [{ r: 'Vl > -ː' }] },
  { id: 'inn-front', label: 'u was fronted to y.', rules: [{ r: 'u > y' }] },
  { id: 'inn-raise', label: 'Stressed a was raised to e.', rules: [{ r: 'a > e', when: (w, i) => !!w[i].st }] },
  { id: 'inn-l-w', label: 'l before consonants became w.', rules: [{ r: 'l > w / V _ C' }] },
  { id: 'inn-nasal', label: 'Final n was lost after vowels.', rules: [{ r: 'n > ∅ / V _ #' }] },
];

export function choosePath(family, seed, { anchor = null, fidelity = 0.8, salt = 0, drift = 80 } = {}) {
  const fam = CHANGES[family];
  if (!fam) return null;
  const rng = stream(seed, 'history-path', salt);
  const a = anchor || rng.weighted(Object.entries(fam.anchors));
  const steps = [];
  for (const step of fam.steps) {
    let opt;
    if (step.always) opt = 'always';
    else {
      const opts = Object.keys(step.options);
      const pref = step.by?.[a];
      // one real lineage: a sister follows its anchor's option, or (sometimes) did not undergo the change at all;
      // it never borrows another branch's option, so no history is a mixture of daughters
      if (pref && rng.chance(fidelity)) opt = pref;
      else opt = null;
      void opts;
    }
    if (!opt) continue;
    const rules = stepRules(step, opt).map((r, k) => compileRule({ ...r, id: `${step.id}:${opt}:${k}` }));
    steps.push({ id: step.id, option: opt, label: step.labels?.[opt] || step.label, rules });
  }
  // distance from the parent: below 80 only the oldest part of the history happens; above 80 the language
  // also undergoes changes of its own
  const all = steps.length;
  const keep = drift >= 80 ? all : Math.round(all * drift / 80);
  steps.splice(keep);
  if (drift > 80) {
    const ir = stream(seed, 'history-innovations', salt);
    const n = Math.round((drift - 80) / 7);
    for (const inn of ir.sample(INNOVATIONS, Math.min(n, INNOVATIONS.length))) steps.push({ id: inn.id, option: 'innovation', label: inn.label + ' (an innovation of this language)', rules: inn.rules.map((r, k) => compileRule({ ...r, id: inn.id + ':' + k })) });
  }
  return { family, anchor: a, anchorName: fam.anchorNames?.[a] || a, steps, rules: steps.flatMap(s => s.rules), proto: fam.proto, protoName: fam.protoName };
}

export { evolve, evolveSuffix, evolveWord };
