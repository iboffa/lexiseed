// Sound histories per family: ordered steps, each with options. A seeded "anchor" daughter (Spanish-like,
// Italian-like, ...) decides most options, and the rest are mixed in, so sister languages differ but still
// resemble the real daughters.
// [ASSUMPTION] Each step is a well-known change of the family's real history, simplified to a few rules
// (sources: standard handbooks of historical phonology; written from the author's knowledge, to be checked).
// Rule notation: see src/evolve.js.
import { isVowel } from './phonemes.js';

const un = (w, i) => !w[i].st; // unstressed
const PAL = ['tʃ', 'x', 'ʎ', 'ɲ', 'j', 'ʒ', 'dʒ'];
const st = (w, i) => !!w[i].st && !PAL.includes(w[i + 1]?.s); // stressed, not before a palatal (yod blocks breaking)
const open = (w, i) => { const a = w[i + 1], b = w[i + 2]; const V = (x) => x && /^[aeiouyøɛɔəɨɯæɑɤ]/.test(x.s); return !a || V(a) || (b && V(b)) || (b && ['r', 'l'].includes(b.s) && !V(a) === true && ['p', 't', 'k', 'b', 'd', 'g'].includes(a.s)); };
const R = (r, when) => (when ? { r, when } : { r });
const nasalize = (mapping, nasal, context) => Object.entries(mapping).map(([oral, vowel]) => R(`${oral} ${nasal} > ${vowel} / _ ${context}`));
const portugueseNasals = { a: 'ã', e: 'ẽ', ɛ: 'ẽ', i: 'ĩ', o: 'õ', ɔ: 'õ', u: 'ũ' };
const frenchNasals = { a: 'ɑ̃', e: 'ɑ̃', ɛ: 'ɑ̃', i: 'ɛ̃', o: 'ɔ̃', ɔ: 'ɔ̃', ø: 'œ̃', œ: 'œ̃', u: 'œ̃', y: 'œ̃' };

// syncope: lose the unstressed vowel after the stress in words stressed on the third syllable from the end
function syncope(w) {
  const vi = w.map((x, i) => (/^[aeiouyøɛɔəɨɯæɑɤ]/.test(x.s) ? i : -1)).filter(i => i >= 0);
  if (vi.length < 3) return w;
  const si = vi.findIndex(i => w[i].st);
  if (si < 0 || si !== vi.length - 3) return w;
  const p = vi[vi.length - 2];
  const cBefore = p > 0 && !/^[aeiouyøɛɔəɨɯæɑɤ]/.test(w[p - 1].s), cAfter = p + 1 < w.length && !/^[aeiouyøɛɔəɨɯæɑɤ]/.test(w[p + 1].s);
  if (!cBefore || !cAfter) return w;
  return w.filter((_, i) => i !== p);
}
function syncopeLiquid(w) { // Italian-like: only when a liquid is involved (tabula > tavola stays, but oculu > occhio)
  const vi = w.map((x, i) => (/^[aeiouyøɛɔəɨɯæɑɤ]/.test(x.s) ? i : -1)).filter(i => i >= 0);
  if (vi.length < 3) return w;
  const si = vi.findIndex(i => w[i].st);
  if (si !== vi.length - 3) return w;
  const p = vi[vi.length - 2];
  if (w[p + 1] && ['l', 'r'].includes(w[p + 1].s) && w[p - 1] && /^[kgpbt]/.test(w[p - 1].s)) return w.filter((_, i) => i !== p);
  return w;
}

export const CHANGES = {
  romance: {
    proto: 'latin', protoName: 'Latin',
    anchors: { spanish: 3, italian: 3, french: 2, portuguese: 2, romanian: 1.5, sardinian: 0.6 },
    anchorNames: { spanish: 'Spanish', italian: 'Italian', french: 'French', portuguese: 'Portuguese', romanian: 'Romanian', sardinian: 'Sardinian' },
    steps: [
      { id: 'final-m', label: 'Final m was lost.', always: [R('m > ∅ / _ #')] },
      { id: 'h-loss', label: 'h was lost.', always: [R('h > ∅')] },
      { id: 'french-k', label: 'k and g before a became ʃ and ʒ (cantāre > chanter).', by: { french: 'on' }, options: { on: [R('k > ʃ / _ {a aː}'), R('g > ʒ / _ {a aː}')] } },
      {
        id: 'vowels', label: 'Vowel length was lost; short i and u became e and o.', by: { spanish: 'west', italian: 'west', french: 'west', portuguese: 'west', romanian: 'east', sardinian: 'sard' },
        options: {
          west: [R('a j > ɛ'), R('a w > ɔ'), R('{iː i eː e aː a o oː u uː} > {i e e ɛ a a ɔ o o u}'), R('{ɛ ɔ} > {e o}', un)],
          east: [R('a j > ɛ'), R('{iː i eː e aː a o oː u uː} > {i e e ɛ a a o o u u}'), R('ɛ > e', un)],
          sard: [R('a j > e'), R('a w > a w'), R('{iː eː aː oː uː} > {i e a o u}')],
        },
        labels: { west: 'Vowel length was lost: long and short vowels merged into seven qualities (short i > e, short u > o).', east: 'Vowel length was lost; short i became e, but short u stayed u (as in Romanian).', sard: 'Vowel length was simply lost, keeping five vowels (as in Sardinian).' },
      },
      { id: 'w', label: 'Consonantal w became v (or b).', by: { spanish: 'b', italian: 'v', french: 'v', portuguese: 'v', romanian: 'v', sardinian: 'b' }, options: { v: [R('w > v', (w, i) => !['k', 'g'].includes(w[i - 1]?.s))], b: [R('w > b', (w, i) => !['k', 'g'].includes(w[i - 1]?.s))] } },
      { id: 'kw', label: 'kw became p and gw became b (aqua > apă).', by: { romanian: 'on' }, options: { on: [R('k w > p / _ a'), R('g w > b')] } },
      {
        id: 'palatal', label: 'k and g before front vowels became affricates.', by: { spanish: 'ts', italian: 'tʃ', french: 'ts', portuguese: 'ts', romanian: 'tʃ', sardinian: 'none' },
        options: { ts: [R('k > ts / _ {Vf j}'), R('g > ʒ / _ {Vf j}')], tʃ: [R('s k > ʃ / _ Vf'), R('k > tʃ / _ {Vf j}'), R('g > dʒ / _ {Vf j}')], none: [] },
        labels: { ts: 'k before e and i became ts, and g became ʒ.', tʃ: 'k before e and i became tʃ, and g became dʒ.', none: 'k and g stayed hard before e and i (as in Sardinian kentu).' },
      },
      { id: 'yod', label: 'l and n before a glide became palatal.', always: [R('l j > ʎ / _ V'), R('n j > ɲ / _ V'), R('t j > ts / _ V'), R('k j > ts / _ V')] },
      { id: 'syncope', label: 'Unstressed vowels after the stress were lost in long words (oculus > *oclu).', by: { spanish: 'full', french: 'full', portuguese: 'full', romanian: 'full', italian: 'liquid', sardinian: 'none' }, options: { full: [{ fn: syncope }], liquid: [{ fn: syncopeLiquid }], none: [] } },
      {
        id: 'clusters', label: 'Consonant clusters changed.', by: { spanish: 'sp', italian: 'it', french: 'fr', portuguese: 'pt', romanian: 'ro', sardinian: 'none' },
        options: {
          sp: [R('k t > tʃ'), R('{p k} l > ʎ / # _'), R('{k g} l > x'), R('k s > x'), R('l j > x')],
          it: [R('k t > t t'), R('p t > t t'), R('{p k f b g} l > {p k f b g} j'), R('k s > s s'), R('{k g} {l j} > {k g} {k g} j / V _')],
          fr: [R('k t > j t'), R('{k g} l > j / V _'), R('k s > j s')],
          pt: [R('k t > j t'), R('{p k f} l > ʃ / # _'), R('{k g} l > ʎ / V _')],
          ro: [R('k t > p t'), R('k s > p s'), R('g n > m n')],
          none: [],
        },
        labels: { sp: 'kt became ch (nocte > noche), initial pl cl fl became ll, and kl became j (oculu > ojo).', it: 'kt and pt became tt (nocte > notte), and l after a consonant became i (plānu > piano).', fr: 'kt and kl became it and il (nocte > nuit).', pt: 'kt became it (nocte > noite), initial pl cl fl became ch (plōrāre > chorar).', ro: 'kt and ks became pt and ps (nocte > noapte, coxa > coapsă).', none: 'Clusters stayed.' },
      },
      {
        id: 'diphthong', label: 'Stressed open e and o broke into diphthongs.', by: { spanish: 'all', italian: 'open', french: 'fr', portuguese: 'none', romanian: 'ro', sardinian: 'none' },
        options: {
          all: [R('ɛ > j e', st), R('ɔ > w e', st)],
          open: [R('ɛ > j ɛ', (w, i) => st(w, i) && open(w, i)), R('ɔ > w ɔ', (w, i) => st(w, i) && open(w, i))],
          fr: [R('ɛ > j ɛ', (w, i) => st(w, i) && open(w, i)), R('ɔ > ø', (w, i) => st(w, i) && open(w, i)), R('a > e', (w, i) => st(w, i) && open(w, i)), R('o > ø', (w, i) => st(w, i) && open(w, i))],
          ro: [R('e > e a', (w, i) => st(w, i) && /^[aeə]/.test(w[i + 2]?.s || '')), R('o > o a', (w, i) => st(w, i) && /^[aeə]/.test(w[i + 2]?.s || ''))],
          none: [],
        },
        labels: { all: 'Stressed open e and o became ie and ue (terra > tierra, porta > puerta).', open: 'Stressed open e and o became ie and uo in open syllables (pede > piede, bonu > buono).', fr: 'Stressed vowels in open syllables changed: e > ie, o > eu, a > e (mare > mer).', ro: 'Stressed e and o became ea and oa before a or e in the next syllable (sole > soare).', none: 'Stressed vowels did not break.' },
      },
      {
        id: 'lenition', label: 'Consonants between vowels weakened.', by: { spanish: 'voice', italian: 'none', french: 'drop', portuguese: 'voiceLN', romanian: 'lr', sardinian: 'voice' },
        options: {
          voice: [R('{p t k} > {b d g} / V _ {V r l w j}')],
          voiceLN: [R('{p t k} > {b d g} / V _ {V r l w j}'), R('{l n} > ∅ / V _ V'), R('{p t k} > ∅ / _ {p t k}')],
          drop: [R('{p t k} > {v d g} / V _ {V r l w j}'), R('{d g} > ∅ / V _ V'), R('b > v / V _ V'), R('{p t k} > ∅ / _ {p t k}')],
          lr: [R('l > r / V _ V')],
          none: [],
        },
        labels: { voice: 'p t k between vowels became b d g (lupu > lobo), and double consonants became single.', voiceLN: 'p t k between vowels became b d g, and l and n between vowels were lost (lūna > lua).', drop: 'Consonants between vowels weakened or disappeared (vīta > vie, sēcūru > sûr).', lr: 'l between vowels became r (sōle > soare).', none: 'Consonants between vowels stayed, and double consonants were kept (nocte > notte).' },
      },
      { id: 'geminates', label: 'Double consonants were simplified.', by: { spanish: 'sp', french: 'on', portuguese: 'on', romanian: 'on' }, options: { sp: [R('l l > ʎ'), R('n n > ɲ'), R('r r > r'), R('{p t k b d g s m f v} > ∅ / _ {p t k b d g s m f v}', (w, i) => w[i].s === w[i + 1]?.s)], on: [R('{p t k b d g s m f v l n r} > ∅ / _ {p t k b d g s m f v l n r}', (w, i) => w[i].s === w[i + 1]?.s)] } },
      { id: 'f-h', label: 'Initial f became h (facere > hacer).', by: { spanish: 'on' }, options: { on: [R('f > h / # _ V')] } },
      { id: 'prothesis', label: 'An e was added before initial s + consonant (scola > escuela).', by: { spanish: 'on', french: 'on', portuguese: 'on' }, options: { on: [R('∅ > e / # _ s C')] } },
      {
        id: 'finals', label: 'Word endings were worn down.', by: { spanish: 'sp', italian: 'it', french: 'fr', portuguese: 'pt', romanian: 'ro', sardinian: 'sard' },
        options: {
          sp: [R('t > ∅ / _ #'), R('i > e / _ #'), R('e > ∅ / V {l r n s d ts} _ #')],
          it: [R('{s t} > ∅ / _ #'), R('u > o / _ #')],
          fr: [R('{k g} w > {k g}'), R('s > ∅ / V _ C'), R('l > w / V _ C'), R('a w > o'), R('{e o i u ɔ ɛ} > ∅ / C _ #'), R('a > ə / _ #'), R('{s t p k d g} > ∅ / _ #'), R('u > y'), ...nasalize(frenchNasals, '{m n}', '{C #}'), R('ə > ∅ / _ #')],
          pt: [R('t > ∅ / _ #'), R('e > ∅ / V {l r s} _ #'), R('o > u / _ #')],
          ro: [R('{u o} > ∅ / C _ #'), R('a > ə / _ #'), R('{s t} > ∅ / _ #')],
          sard: [R('t > ∅ / _ #')],
        },
        labels: { sp: 'Final t was lost, and final e fell after l r n s d (pane > pan, mare > mar).', it: 'Final s and t were lost, so every word ends in a vowel (stellas > stelle).', fr: 'Word endings wore down, and vowels merged with a following m or n before consonants and at word ends (cantāre > chanter).', pt: 'Final t was lost, final e fell after l r s, and final o is pronounced u.', ro: 'Final u was lost, and final a became ə (lupu > lup, casa > casă).', sard: 'Final consonants mostly stayed (Sardinian keeps -s and -t).' },
      },
      { id: 'modern-sp', label: 'Late Spanish changes: ts > θ and ʒ > x.', by: { spanish: 'castile' }, options: { castile: [R('ts > θ'), R('s θ > θ'), R('{ʒ dʒ ʃ} > x'), R('{ɛ ɔ} > {e o}')], seseo: [R('ts > s'), R('s s > s'), R('{ʒ dʒ ʃ} > x'), R('{ɛ ɔ} > {e o}')] }, labels: { castile: 'Late changes: ts became θ and ʒ became x (as in Castilian).', seseo: 'Late changes: ts became s and ʒ became x (as in Latin American Spanish).' } },
      { id: 'modern-fr', label: 'Late French changes: ts > s, dʒ > ʒ, tʃ > ʃ.', by: { french: 'on', portuguese: 'on' }, options: { on: [R('ts > s'), R('dʒ > ʒ'), R('tʃ > ʃ')] } },
      {
        id: 'romance-nasal-vowels',
        label: 'A vowel and a following nasal consonant merged into a nasal vowel before a consonant or at the end of a word.',
        by: { portuguese: 'pt' },
        options: { pt: nasalize(portugueseNasals, '{m n}', '{C #}') },
      },
    ],
  },
};

// ---------- helpers for other families ----------
const isVw = (x) => x && isVowel(x.s);
// Havlík's law: weak jers (final, or followed by a syllable with a strong jer... simplified: before a full vowel) drop, strong ones become vowels
function havlik(strongBack, strongFront, palatalize) {
  return (w) => {
    const vi = w.map((x, i) => (isVw(x) ? i : -1)).filter(i => i >= 0);
    const jer = (i) => w[i].s === 'ə' || w[i].s === 'ɨ';
    const strong = new Set(); const weak = new Set();
    let nextWeakJer = true; // the final jer counts as weak
    for (let k = vi.length - 1; k >= 0; k--) {
      const i = vi[k];
      if (!jer(i)) { nextWeakJer = false; continue; }
      if (k === vi.length - 1) { weak.add(i); nextWeakJer = true; continue; }
      if (nextWeakJer) { strong.add(i); nextWeakJer = false; } else { weak.add(i); nextWeakJer = true; }
    }
    const out = [];
    w.forEach((x, i) => {
      if (weak.has(i)) { if (palatalize && x.s === 'ɨ' && out.length) { const p = out[out.length - 1]; const pal = { t: 'tʲ', d: 'dʲ', n: 'nʲ', l: 'lʲ', r: 'rʲ', s: 'sʲ' }[p.s]; if (pal) out[out.length - 1] = { ...p, s: pal }; } return; }
      if (strong.has(i)) { out.push({ ...x, s: x.s === 'ə' ? strongBack : strongFront }); return; }
      out.push(x);
    });
    return out;
  };
}
// i-umlaut: a vowel is fronted when the next syllable has i, iː or j
function umlaut(map) {
  return (w) => w.map((x, i) => {
    if (!isVw(x)) return x;
    let j = i + 1; while (j < w.length && !isVw(w[j]) && w[j].s !== 'j') j++;
    const nx = w[j];
    if (!nx || !(['i', 'iː', 'j'].includes(nx.s))) return x;
    const long = x.s.includes('ː'); const b = x.s.replace('ː', '');
    return map[b] ? { ...x, s: map[b] + (long ? 'ː' : '') } : x;
  });
}
// compensatory lengthening: V C C > Vː C (Hindi saːt < satta)
function degeminateLengthen(w) {
  const out = [];
  for (let i = 0; i < w.length; i++) {
    const x = w[i];
    if (isVw(x) && !x.s.includes('ː') && w[i + 1] && w[i + 2] && !isVw(w[i + 1]) && w[i + 1].s === w[i + 2].s) { out.push({ ...x, s: x.s.replace(/^(.)/, '$1ː') }, w[i + 1]); i += 2; continue; }
    out.push(x);
  }
  return out;
}
// Middle Chinese tone split (Mandarin): tone by category and initial voicing; final stops lost
function mandarinTones(w) {
  const ini = w[0];
  const voicedObs = ini && ['b', 'd', 'g', 'dz', 'dʒ', 'dʑ', 'ɖ', 'ɟ', 'z', 'ʑ', 'ʒ', 'ɣ', 'v', 'ʐ'].includes(ini.s);
  const son = ini && ['m', 'n', 'ŋ', 'ɲ', 'l', 'j', 'w', 'ɳ'].includes(ini.s);
  return w.map(x => {
    const m = x.s.match(/^(.+?)([1-4])$/); if (!m) return x;
    const cat = +m[2]; let t;
    if (cat === 1) t = voicedObs || son ? 2 : 1;
    else if (cat === 2) t = voicedObs ? 4 : 3;
    else if (cat === 3) t = 4;
    else t = voicedObs ? 2 : son ? 4 : 4;
    return { ...x, s: m[1] + t };
  });
}
function cantoneseTones(w) {
  const ini = w[0];
  const lower = ini && ['b', 'd', 'g', 'dz', 'dʒ', 'dʑ', 'ɖ', 'ɟ', 'z', 'ʑ', 'ʒ', 'ɣ', 'v', 'm', 'n', 'ŋ', 'ɲ', 'l', 'j', 'w'].includes(ini.s);
  const stop = ['p', 't', 'k'].includes(w[w.length - 1]?.s);
  return w.map(x => {
    const m = x.s.match(/^(.+?)([1-4])$/); if (!m) return x;
    const cat = +m[2];
    const t = cat === 4 ? (lower ? 6 : stop && /[aɛæ]/.test(m[1]) ? 3 : 1) : ({ 1: [1, 4], 2: [2, 5], 3: [3, 6] }[cat])[lower ? 1 : 0];
    return { ...x, s: m[1] + t };
  });
}
const devoiceInitial = R('{b d g dz dʒ dʑ ɖ ɟ z ʑ ʒ ɣ v} > {p t k ts tʃ tɕ ʈ c s ɕ ʃ x f} / # _');

Object.assign(CHANGES, {
  hellenic: {
    proto: 'greek', protoName: 'Ancient Greek',
    anchors: { moderngreek: 4, pontic: 1, archaic: 1 },
    anchorNames: { moderngreek: 'Modern Greek', pontic: 'Pontic Greek', archaic: 'Koine Greek' },
    steps: [
      { id: 'h', label: 'The rough breathing h was lost.', always: [R('h > ∅')] },
      { id: 'diph', label: 'Diphthongs became simple vowels (oi > i, ai > e); au and eu became av and ev.', by: { moderngreek: 'on', pontic: 'on', archaic: 'on' }, options: { on: [R('o j > i'), R('a j > e'), R('e j > i'), R('{a e} w > {a e} v'), R('v > f / _ {p t k s θ x f pʰ tʰ kʰ}')] } },
      { id: 'iotacism', label: 'Several vowels merged into i (iotacism): η, ει, υ.', by: { moderngreek: 'full', pontic: 'partial', archaic: 'eta' }, options: { full: [R('{ɛː eː y yː} > i')], partial: [R('{eː y yː} > i'), R('ɛː > e')], eta: [R('eː > i'), R('ɛː > i')] }, labels: { full: 'η, ει and υ all merged into i (iotacism).', partial: 'ει and υ became i, but η became e (as in Pontic).', eta: 'η and ει became i; υ kept its rounded sound y.' } },
      { id: 'length', label: 'Vowel length was lost.', always: [R('{aː iː uː ɔː oː eː yː} > {a i u o o e y}'), R('{ɛ ɔ} > {e o}')] },
      { id: 'spirant', label: 'Aspirates and voiced stops became fricatives (pʰ tʰ kʰ > f θ x, b d g > v ð ɣ).', by: { moderngreek: 'on', pontic: 'on', archaic: 'asp' }, options: { on: [R('{pʰ tʰ kʰ} > {f θ x}'), R('{b d g} > {v ð ɣ}'), R('z d > z')], asp: [R('{pʰ tʰ kʰ} > {f θ x}')] }, labels: { on: 'pʰ tʰ kʰ became f θ x, and b d g became v ð ɣ.', asp: 'Only the aspirates became fricatives (pʰ tʰ kʰ > f θ x).' } },
      { id: 'final-n', label: 'Final n was lost.', by: { moderngreek: 'on', pontic: 'on' }, options: { on: [R('n > ∅ / V _ #')] } },
      { id: 'ion', label: 'Diminutives in -ion lost their ending (paidion > paidi).', by: { moderngreek: 'on', pontic: 'on' }, options: { on: [R('o > ∅ / i _ #'), R('o n > ∅ / i _ #')] } },
      { id: 'aphaeresis', label: 'Unstressed initial vowels were dropped (ommation > mati).', by: { moderngreek: 'on' }, options: { on: [R('V_ > ∅ / # _ C')] } },
      { id: 'degeminate', label: 'Double consonants became single.', always: [R('C > ∅ / _ C', (w, i) => w[i].s === w[i + 1]?.s)] },
      { id: 'synizesis', label: 'Unstressed i and e before a vowel became j.', by: { moderngreek: 'on', pontic: 'on' }, options: { on: [R('{i e} > j / C _ V', un)] } },
      { id: 'gamma', label: 'ɣ before front vowels became j.', by: { moderngreek: 'on' }, options: { on: [R('ɣ > j / _ {i e}')] } },
    ],
  },
  slavic: {
    proto: 'protoslavic', protoName: 'Proto-Slavic',
    anchors: { russian: 3, polish: 2.5, serbocroatian: 2, czech: 1.5, bulgarian: 1 },
    anchorNames: { russian: 'Russian', polish: 'Polish', serbocroatian: 'Serbo-Croatian', czech: 'Czech', bulgarian: 'Bulgarian' },
    steps: [
      { id: 'liquid', label: 'Liquid diphthongs were resolved.', by: { russian: 'east', polish: 'west', serbocroatian: 'south', czech: 'south', bulgarian: 'south' }, options: { east: [R('{o e} {r l} > {o e} {r l} {o e} / C _ C')], west: [R('o r > r o / C _ C'), R('o l > l o / C _ C'), R('e r > r e / C _ C'), R('e l > l e / C _ C')], south: [R('o r > r a / C _ C'), R('o l > l a / C _ C'), R('e r > r æ / C _ C'), R('e l > l æ / C _ C')] }, labels: { east: 'Liquid diphthongs grew an extra vowel (gordъ > gorod, pleophony).', west: 'Liquid diphthongs were swapped (gordъ > gród).', south: 'Liquid diphthongs were swapped and lengthened (gordъ > grad).' } },
      { id: 'tj', label: 'tj and dj became new affricates.', by: { russian: 'east', polish: 'west', serbocroatian: 'south', czech: 'west', bulgarian: 'bg' }, options: { east: [R('tʲ > tʃ'), R('dʲ > ʒ')], west: [R('tʲ > ts'), R('dʲ > dz')], south: [R('tʲ > tɕ'), R('dʲ > dʑ')], bg: [R('tʲ > ʃ t'), R('dʲ > ʒ d')] }, labels: { east: 'tj and dj became č and ž (noťь > noč).', west: 'tj and dj became c and dz (noťь > noc).', south: 'tj and dj became ć and đ (noťь > noć).', bg: 'tj and dj became št and žd (noťь > nošt).' } },
      { id: 'jers', label: 'The short jer vowels were lost or became full vowels (Havlík’s law).', by: { russian: 'east', polish: 'west', serbocroatian: 'south', czech: 'west', bulgarian: 'bg' }, options: { east: [{ fn: havlik('o', 'e', true) }], west: [{ fn: havlik('e', 'e', true) }], south: [{ fn: havlik('a', 'a', false) }], bg: [{ fn: havlik('ə', 'e', false) }] }, labels: { east: 'Weak jers disappeared; strong ъ and ь became o and e (sъnъ > son).', west: 'Weak jers disappeared; strong jers became e (sъnъ > sen).', south: 'Weak jers disappeared; strong jers became a (sъnъ > san).', bg: 'Weak jers disappeared; strong ъ became ə (sъnъ > sən).' } },
      { id: 'nasals', label: 'Nasal vowels changed.', by: { russian: 'east', polish: 'keep', serbocroatian: 'south', czech: 'cz', bulgarian: 'bg' }, options: { east: [R('ẽ > j a'), R('õ > u')], keep: [R('{ẽ õ} > {ɛ̃ ɔ̃}')], south: [R('{ẽ õ} > {e u}')], cz: [R('ẽ > j e'), R('õ > u')], bg: [R('{ẽ õ} > {e ə}')] }, labels: { east: 'Nasal ę and ǫ became ja and u (pętь > pjat’).', keep: 'Nasal vowels were kept as ɛ̃ and ɔ̃ (written ę and ą).', south: 'Nasal ę and ǫ became e and u.', cz: 'Nasal ę and ǫ became je and u.', bg: 'Nasal ę and ǫ became e and ə.' } },
      { id: 'yat', label: 'The vowel ě (yat) changed.', by: { russian: 'e', polish: 'e', serbocroatian: 'ije', czech: 'je', bulgarian: 'ja' }, options: { e: [R('æ > e')], ije: [R('æ > j e')], je: [R('æ > j e / C _'), R('æ > e')], ja: [R('æ > j a', st), R('æ > e')] }, labels: { e: 'ě merged with e.', ije: 'ě became je (as in Ijekavian Serbo-Croatian).', je: 'ě became je after consonants.', ja: 'Stressed ě became ja.' } },
      { id: 'y', label: 'The vowel y changed.', by: { russian: 'keep', polish: 'keep', serbocroatian: 'i', czech: 'i', bulgarian: 'i' }, options: { keep: [R('ɯ > ɨ')], i: [R('ɯ > i')] }, labels: { keep: 'y stayed a separate central vowel ɨ.', i: 'y merged with i.' } },
      { id: 'g-h', label: 'g became h (as in Czech, Slovak and Ukrainian).', by: { czech: 'on' }, options: { on: [R('g > h')] } },
      { id: 'polish', label: 'Polish-like changes: palatal r became ž, palatal s and t softened.', by: { polish: 'on' }, options: { on: [R('rʲ > ʒ'), R('tʲ > tɕ'), R('dʲ > dʑ'), R('sʲ > ɕ'), R('nʲ > ɲ')] } },
      { id: 'akanye', label: 'Unstressed o was pronounced a (akanye).', by: { russian: 'on' }, options: { on: [R('o > a', un)] } },
      { id: 'devoice', label: 'Final voiced consonants became voiceless.', by: { russian: 'on', polish: 'on', czech: 'on', bulgarian: 'on' }, options: { on: [R('{b d g z v ʒ dʒ} > {p t k s f ʃ tʃ} / _ #')] } },
    ],
  },
  germanic: {
    proto: 'protogermanic', protoName: 'Proto-Germanic',
    anchors: { german: 3, english: 3, swedish: 2, dutch: 1.5, icelandic: 1 },
    anchorNames: { german: 'German', english: 'English', swedish: 'Swedish', dutch: 'Dutch', icelandic: 'Icelandic' },
    steps: [
      { id: 'umlaut', label: 'i-umlaut: vowels were fronted before i or j in the next syllable (*gastiz > Gäste).', by: { german: 'on', english: 'on', swedish: 'on', dutch: 'weak', icelandic: 'on' }, options: { on: [{ fn: umlaut({ a: 'e', o: 'ø', u: 'y', aː: 'æ', oː: 'ø', uː: 'y' }) }], weak: [{ fn: umlaut({ a: 'e' }) }] } },
      { id: 'endings', label: 'Unstressed final syllables wore away.', by: { german: 'west', english: 'west', dutch: 'west', swedish: 'north', icelandic: 'norse' }, options: { west: [R('{a i u} {z n s} > ∅ / _ #'), R('{oː eː aː a i u o e} > ə / C _ #'), R('j > ∅ / C _ #')], north: [R('{a i u} {z n} > ∅ / _ #'), R('{oː eː} > a / C _ #'), R('j > ∅ / C _ #')], norse: [R('a z > u r / C _ #'), R('{i u} z > u r / C _ #'), R('a n > ∅ / _ #'), R('{oː eː} > a / C _ #')] }, labels: { west: 'Final -az, -an and -iz were lost and other final vowels became ə (*dagaz > Tag).', north: 'Final -az and -an were lost, final -ō became a (*tungōn > tunga).', norse: 'Final -az became -ur (*dagaz > dagur), as in Icelandic.' } },
      { id: 'rhotacism', label: 'z became r (rhotacism).', always: [R('z > r')] },
      { id: 'hgs', label: 'The High German consonant shift (p t k > pf ts kx initially, f s x after vowels).', by: { german: 'on' }, options: { on: [R('{p t} > {pf ts} / {# l r n m} _'), R('{p t k} > {f s x} / V _'), R('θ > d'), R('d > t / # _')] } },
      { id: 'th', label: 'θ and ð changed.', by: { english: 'keep', german: 'd', dutch: 'd', swedish: 't', icelandic: 'keep' }, options: { keep: [], d: [R('{θ ð} > d')], t: [R('θ > t'), R('ð > d')] }, labels: { keep: 'θ (th) was kept.', d: 'θ became d (as German drei, Dutch drie).', t: 'θ became t (as Swedish tre).' } },
      { id: 'english', label: 'English-like changes: k before front vowels became ch, sk became sh, final ə was lost, and the Great Vowel Shift.', by: { english: 'on' }, options: { on: [R('s k > ʃ'), R('k > tʃ / # _ {i e iː eː}'), R('g > j / # _ {i e}'), R('x > ∅ / V _'), R('ə > ∅ / _ #'), R('iː > a j'), R('uː > a w'), R('eː > iː'), R('oː > uː'), R('a > æ / C _ C')] } },
      { id: 'german-late', label: 'Late German changes: long i and u became ei and au, s became ʃ before consonants, w became v.', by: { german: 'on' }, options: { on: [R('iː > a j'), R('uː > a w'), R('s > ʃ / # _ {p t l m n w}'), R('w > v'), R('{b d g} > {p t k} / _ #')] } },
      { id: 'dutch', label: 'Dutch-like changes: g became x (ɣ), and final ə was kept.', by: { dutch: 'on' }, options: { on: [R('g > ɣ'), R('w > v / # _'), R('{b d} > {p t} / _ #')] } },
      { id: 'w-v', label: 'w became v.', by: { swedish: 'on', icelandic: 'on' }, options: { on: [R('w > v'), R('x > h / # _'), R('h > ∅ / # _ C')] } },
    ],
  },
  celtic: {
    proto: 'protoceltic', protoName: 'Proto-Celtic',
    anchors: { irish: 3, welsh: 3, breton: 1.5, gaulish: 0.5 },
    anchorNames: { irish: 'Irish', welsh: 'Welsh', breton: 'Breton', gaulish: 'Gaulish' },
    steps: [
      { id: 'kw', label: 'kʷ became p in Brythonic and k in Goidelic.', by: { irish: 'q', welsh: 'p', breton: 'p', gaulish: 'p' }, options: { q: [R('k w > k')], p: [R('k w > p')] }, labels: { q: 'kʷ became k (Q-Celtic, as Irish cenn).', p: 'kʷ became p (P-Celtic, as Welsh pen).' } },
      { id: 'lenition', label: 'Consonants between vowels were lenited (softened).', by: { irish: 'goidelic', welsh: 'brittonic', breton: 'brittonic' }, options: { goidelic: [R('{b d g m} > {v ð ɣ v} / V _ {V L}'), R('{t k} > {θ x} / V _ {V L}')], brittonic: [R('{b d g m} > {v ð ∅ v} / V _ {V L}'), R('{p t k} > {b d g} / V _ {V L}')] }, labels: { goidelic: 'b d g m between vowels became v ð ɣ v, and t k became θ x.', brittonic: 'p t k between vowels became b d g, and b d m became v ð v (g was lost).' } },
      { id: 'apocope', label: 'Final syllables were lost (apocope).', by: { irish: 'on', welsh: 'on', breton: 'on' }, options: { on: [R('{o a e i u} {s n m} > ∅ / C _ #'), R('{o a e i u} > ∅ / C _ #', un), R('{oː aː eː iː uː} > ∅ / C _ #')] } },
      { id: 'phi', label: 'ɸ (from earlier p) disappeared.', always: [R('ɸ > ∅')] },
      { id: 'xs', label: 'ks and xs simplified.', always: [R('{k x} s > x / _ #'), R('{k x} s > s')] },
      { id: 'brittonic', label: 'Brythonic changes: initial s became h, initial w became gw, long a became o.', by: { welsh: 'on', breton: 'on' }, options: { on: [R('s > h / # _ V'), R('w > g w / # _'), R('aː > ɔ'), R('{iː uː oː eː} > {i i u u}')] } },
      { id: 'goidelic', label: 'Goidelic changes: initial w became f, long vowels kept.', by: { irish: 'on' }, options: { on: [R('w > f / # _'), R('x > ∅ / V _ #'), R('ð > ∅ / V _ #')] } },
    ],
  },
  indoaryan: {
    proto: 'sanskrit', protoName: 'Sanskrit',
    anchors: { hindi: 3, punjabi: 2, bengali: 2, marathi: 1 },
    anchorNames: { hindi: 'Hindi', punjabi: 'Punjabi', bengali: 'Bengali', marathi: 'Marathi' },
    steps: [
      { id: 'r', label: 'Syllabic ṛ became a vowel (hṛdaya > hiya).', always: [R('r i > i / C _'), R('r i > ri / # _')] },
      { id: 'sibilants', label: 'The three sibilants merged.', by: { hindi: 's', punjabi: 's', bengali: 'ʃ', marathi: 's' }, options: { s: [R('{ɕ ʂ} > s')], ʃ: [R('{s ʂ ɕ} > ʃ')] }, labels: { s: 'ś ṣ s merged into s.', ʃ: 'ś ṣ s merged into ʃ (as in Bengali).' } },
      { id: 'clusters', label: 'Consonant clusters assimilated (Prakrit: sapta > satta, agni > aggi).', always: [R('k ʂ > k kʰ'), R('k s > k kʰ'), R('{k p g b} {t d} > {t t d d} {t t d d}'), R('t j > tʃ tʃ'), R('d j > dʒ dʒ'), R('{p t k g d b m n s} {r j v w} > {p t k g d b m n s} {p t k g d b m n s} / V _'), R('r {k t p g d b m n tʃ dʒ} > {k t p g d b m n tʃ dʒ} {k t p g d b m n tʃ dʒ}'), R('g n > g g'), R('s {t p k} > {tʰ pʰ kʰ} / # _'), R('s {t p k} > {t p k} {tʰ pʰ kʰ} / V _')] },
      { id: 'lenition', label: 'Single stops between vowels were lost or became h (Prakrit: mata > maa).', by: { hindi: 'on', punjabi: 'on', bengali: 'on', marathi: 'on' }, options: { on: [R('{k g tʃ dʒ t d p j v} > ∅ / V _ V'), R('{kʰ gʱ tʰ dʱ pʰ bʱ} > h / V _ V')] } },
      { id: 'degem', label: 'Double consonants were simplified, lengthening the vowel before them (satta > sāt).', by: { hindi: 'on', bengali: 'on', marathi: 'on', punjabi: 'keep' }, options: { on: [{ fn: degeminateLengthen }], keep: [] }, labels: { on: 'Double consonants were simplified, lengthening the vowel before them (satta > sāt).', keep: 'Double consonants were kept (as in Punjabi satt).' } },
      { id: 'schwa', label: 'Final short a was dropped (schwa deletion).', by: { hindi: 'on', punjabi: 'on', bengali: 'bn', marathi: 'on' }, options: { on: [R('a > ∅ / C _ #')], bn: [R('a > ∅ / C _ #'), R('a > ɔ', st)] }, labels: { on: 'Final short a was dropped (rāma > rām).', bn: 'Final short a was dropped, and stressed a became ɔ (as in Bengali).' } },
      { id: 'y-j', label: 'Initial y became j, and v became b.', by: { hindi: 'y', bengali: 'yv', punjabi: 'y', marathi: 'y' }, options: { y: [R('j > dʒ / # _')], yv: [R('j > dʒ / # _'), R('{v w} > b')] } },
      { id: 'hiatus', label: 'Vowel sequences contracted.', always: [R('{aː a} {aː a} > aː'), R('{iː i} {iː i} > iː'), R('{uː u} {uː u} > uː'), R('a i > ɛː'), R('a u > ɔː')] },
    ],
  },
  semitic: {
    proto: 'protosemitic', protoName: 'Proto-Semitic',
    anchors: { arabic: 3, hebrew: 3, aramaic: 1.5, amharic: 1, maltese: 1 },
    anchorNames: { arabic: 'Arabic', hebrew: 'Hebrew', aramaic: 'Aramaic', amharic: 'Amharic', maltese: 'Maltese' },
    steps: [
      { id: 'p-g', label: 'p became f and g became dʒ (as in Arabic).', by: { arabic: 'on', maltese: 'on' }, options: { on: [R('p > f'), R('g > dʒ')] } },
      { id: 'sibilants', label: 'The sibilants shifted.', by: { arabic: 'ar', hebrew: 'he', aramaic: 'he', amharic: 'am', maltese: 'ar' }, options: { ar: [R('ʃ > s'), R('ɬ > ʃ')], he: [R('ɬ > s')], am: [R('ɬ > s'), R('ʃ > s / # _')] }, labels: { ar: 'š became s, and ś became š (Proto-Semitic *šinn > Arabic sinn).', he: 'ś merged with s; š stayed.', am: 'ś merged with s.' } },
      { id: 'interdentals', label: 'The interdentals θ and ð changed.', by: { arabic: 'keep', hebrew: 'he', aramaic: 'ar', amharic: 'am', maltese: 'ar' }, options: { keep: [], he: [R('θ > ʃ'), R('ð > z')], ar: [R('θ > t'), R('ð > d')], am: [R('θ > s'), R('ð > z')] }, labels: { keep: 'θ and ð were kept (as in Arabic).', he: 'θ became ʃ and ð became z (*θalāθ > šalōš).', ar: 'θ became t and ð became d.', am: 'θ became s and ð became z.' } },
      { id: 'canaanite', label: 'Long a became o (the Canaanite shift).', by: { hebrew: 'on' }, options: { on: [R('aː > oː')] } },
      { id: 'segholate', label: 'A vowel was inserted into final clusters (malk > melek).', by: { hebrew: 'on', aramaic: 'on' }, options: { on: [R('{b d g k p t m n l r s ʃ z ʔ ʕ ħ x} > ∅ / _ {b d g k p t m n l r s ʃ z ʔ ʕ ħ x} #', (w, i) => w[i].s === w[i + 1]?.s), R('a > e / C _ C C #'), R('∅ > e / V C _ C #')] } },
      { id: 'spirant', label: 'Stops after vowels became fricatives (begadkefat).', by: { hebrew: 'on', aramaic: 'on' }, options: { on: [R('{b k p} > {v x f} / V _'), R('{g d t} > {g d t} / V _')] } },
      { id: 'gutturals', label: 'The guttural consonants weakened.', by: { maltese: 'mt', amharic: 'am', hebrew: 'he' }, options: { mt: [R('ʕ > ∅'), R('ħ > h'), R('q > ʔ'), R('ɣ > ∅'), R('{tˤ sˤ dˤ} > {t s d}')], am: [R('{ʕ ʔ} > ∅ / _ C'), R('ħ > h'), R('{tˤ sˤ q dˤ} > {tʼ tʼ kʼ tʼ}')], he: [R('ʕ > ʔ'), R('ħ > x'), R('{tˤ sˤ dˤ} > {t ts ts}'), R('q > k'), R('w > v')] }, labels: { mt: 'Pharyngeal and emphatic consonants were lost or merged (as in Maltese).', am: 'Emphatic consonants became ejectives (as in Amharic).', he: 'ʕ became ʔ, ḥ became x, and emphatics merged with plain consonants (as in Modern Hebrew).' } },
      { id: 'finals', label: 'Final short vowels and glides were lost.', always: [R('{u i a} {m n} > ∅ / C _ #'), R('j > ʔ / aː _ #')] },
      { id: 'amharic-vowels', label: 'Short vowels were reduced to ə.', by: { amharic: 'on' }, options: { on: [R('{a i u} > ə', un), R('aː > a')] } },
    ],
  },
  sinitic: {
    proto: 'middlechinese', protoName: 'Middle Chinese',
    anchors: { mandarin: 4, cantonese: 3 },
    anchorNames: { mandarin: 'Mandarin', cantonese: 'Cantonese' },
    steps: [
      { id: 'tones', label: 'Tones split by the voicing of the initial consonant.', by: { mandarin: 'mand', cantonese: 'cant' }, options: { mand: [{ fn: mandarinTones }], cant: [{ fn: cantoneseTones }] }, labels: { mand: 'Tones split by voicing: level tone became high (voiceless) or rising (voiced); entering tone was redistributed.', cant: 'Each tone split into a high and a low register by voicing, giving six tones.' } },
      { id: 'devoice', label: 'Voiced initial consonants became voiceless.', always: [devoiceInitial, R('x > ∅ / # _ {j w}', () => false)] },
      { id: 'stops', label: 'Final -p -t -k changed.', by: { mandarin: 'lost', cantonese: 'keep' }, options: { lost: [R('{p t k} > ∅ / _ #'), R('m > n / _ #')], keep: [] }, labels: { lost: 'Final -p -t -k were lost and final -m became -n.', keep: 'Final -p -t -k and -m were kept.' } },
      { id: 'palatal', label: 'k, kʰ and x before i and y became palatal (tɕ ɕ).', by: { mandarin: 'on' }, options: { on: [R('{k kʰ x ts s} > {tɕ tɕ ɕ tɕ ɕ} / # _ {i j y iː}')] } },
      { id: 'initials', label: 'Initial ŋ and ʔ were lost; ɲ became r.', by: { mandarin: 'on', cantonese: 'yue' }, options: { on: [R('{ŋ ʔ} > ∅ / # _'), R('ɲ > ɻ / # _'), R('ɕ > ʂ / # _ {w u}')], yue: [R('ʔ > ∅ / # _'), R('ɲ > j / # _'), R('{tɕ ɕ tʂ ʂ} > {ts s ts s}')] } },
    ],
  },
  japonic: {
    proto: 'protojaponic', protoName: 'Proto-Japonic',
    anchors: { japanese: 4, okinawan: 2 },
    anchorNames: { japanese: 'Japanese', okinawan: 'Okinawan' },
    steps: [
      { id: 'mono', label: 'Vowel + i sequences became single vowels (*poj > hi, *maj > me).', always: [R('{o u ə} j > i'), R('a j > e')] },
      { id: 'vowels', label: 'The mid vowels changed.', by: { japanese: 'ja', okinawan: 'ryu' }, options: { ja: [R('ə > o'), R('e > i / _ #', () => false)], ryu: [R('ə > u'), R('e > i'), R('o > u')] }, labels: { ja: 'ə merged with o.', ryu: 'e and o merged with i and u, leaving three vowels (as in Okinawan).' } },
      { id: 'p', label: 'p weakened: ɸ initially, w (then nothing) between vowels.', by: { japanese: 'h', okinawan: 'ɸ' }, options: { h: [R('p > w / V _ V'), R('p > h / # _'), R('w > ∅ / V _ {i e u o}')], ɸ: [R('p > ɸ / # _'), R('p > w / V _ V')] }, labels: { h: 'p became h initially and disappeared between vowels (*papa > haha, *kupu > kū).', ɸ: 'p became ɸ initially (as in Okinawan).' } },
      { id: 'prenasal', label: 'Prenasalised stops became plain voiced stops.', always: [R('{ᵐb ⁿd ᵑɡ} > {b d g}')] },
      { id: 'affrication', label: 't, d and s before i and u became affricates (ti > chi, tu > tsu).', by: { japanese: 'on', okinawan: 'ryu' }, options: { on: [R('t > tʃ / _ i'), R('t > ts / _ u'), R('d > dʒ / _ i'), R('d > z / _ u'), R('s > ʃ / _ i')], ryu: [R('t > tʃ / _ i'), R('k > tʃ / _ i'), R('d > dʒ / _ i'), R('s > ʃ / _ i')] } },
    ],
  },
  bantu: {
    proto: 'protobantu', protoName: 'Proto-Bantu',
    anchors: { swahili: 3, zulu: 2, shona: 2 },
    anchorNames: { swahili: 'Swahili', zulu: 'Zulu', shona: 'Shona' },
    steps: [
      { id: 'spirant', label: 'Stops before the high vowels i and u became fricatives (Bantu spirantisation).', by: { swahili: 'on', shona: 'on', zulu: 'weak' }, options: { on: [R('{t k} > s / _ i'), R('p > f / _ {i u}'), R('d > z / _ i')], weak: [R('p > f / _ i')] } },
      { id: 'vowels', label: 'Seven vowels merged into five.', always: [R('{ɨ ɯ} > {i u}')] },
      { id: 'p', label: 'p weakened.', by: { swahili: 'h', zulu: 'keep', shona: 'keep' }, options: { h: [R('p > ∅ / V _ V'), R('p > h / # _')], keep: [] }, labels: { h: 'p was lost between vowels and became h initially (as in Swahili).', keep: 'p stayed.' } },
      { id: 'c', label: 'c and j changed.', by: { swahili: 'sw', zulu: 'zu', shona: 'sn' }, options: { sw: [R('c > s'), R('j > ∅ / # _ V')], zu: [R('c > s'), R('j > ∅ / # _ V'), R('d > l')], sn: [R('c > tʃ'), R('j > dʒ / # _'), R('d > r')] }, labels: { sw: 'c became s, and initial j was lost.', zu: 'c became s, d became l, and initial j was lost.', sn: 'c became tʃ, j became dʒ, and d became r (as in Shona).' } },
      { id: 'liquids', label: 'd between vowels became l.', by: { swahili: 'on', zulu: 'on' }, options: { on: [R('d > l / V _ V')] } },
    ],
  },
  polynesian: {
    proto: 'protopolynesian', protoName: 'Proto-Polynesian',
    anchors: { hawaiian: 3, maori: 3, tongan: 2, samoan: 2 },
    anchorNames: { hawaiian: 'Hawaiian', maori: 'Māori', tongan: 'Tongan', samoan: 'Samoan' },
    steps: [
      { id: 'glottal', label: 'The old glottal stop and h were lost.', by: { hawaiian: 'on', maori: 'on', samoan: 'on', tongan: 'keep' }, options: { on: [R('{ʔ h} > ∅')], keep: [] }, labels: { on: 'The old glottal stop and h were lost.', keep: 'The glottal stop and h were kept (as in Tongan).' } },
      { id: 'k-t', label: 'k became a glottal stop and t became k.', by: { hawaiian: 'haw', samoan: 'sam' }, options: { haw: [R('k > ʔ'), R('t > k')], sam: [R('k > ʔ')] }, labels: { haw: 'k became a glottal stop, then t became k (as in Hawaiian: *tapu > kapu).', sam: 'k became a glottal stop (as in Samoan).' } },
      { id: 'liquids', label: 'r and l merged.', by: { hawaiian: 'l', samoan: 'l', maori: 'r', tongan: 'tg' }, options: { l: [R('r > l')], r: [R('l > r')], tg: [R('r > ∅')] }, labels: { l: 'r merged with l.', r: 'l merged with r (as in Māori).', tg: 'r was lost (as in Tongan ʔeiki < *ʔariki).' } },
      { id: 'fricatives', label: 'f and s became h.', by: { hawaiian: 'haw', maori: 'mao', tongan: 'tg', samoan: 'keep' }, options: { haw: [R('{f s} > h'), R('ŋ > n'), R('w > v / _ {i e}', () => false)], mao: [R('s > h'), R('f > ɸ')], tg: [R('s > h')], keep: [] }, labels: { haw: 'f and s became h, and ŋ became n (as in Hawaiian).', mao: 's became h and f became wh [ɸ] (as in Māori).', tg: 's became h.', keep: 'f and s were kept (as in Samoan).' } },
    ],
  },
  uralic: {
    proto: 'protouralic', protoName: 'Proto-Uralic',
    anchors: { finnish: 3, hungarian: 3, estonian: 2 },
    anchorNames: { finnish: 'Finnish', hungarian: 'Hungarian', estonian: 'Estonian' },
    steps: [
      { id: 'sibilants', label: 'The palatal sibilants merged with s.', always: [R('{ɕ sʲ ʃ} > s / # _'), R('{ɕ sʲ} > s'), R('tɕ > ts'), R('{nʲ lʲ dʲ} > {n l d}'), R('ɤ > a'), R('x > ∅ / V _ C'), R('x > k')] },
      { id: 'ti-si', label: 't before i became s (*käte > käsi).', by: { finnish: 'on', estonian: 'on' }, options: { on: [R('e > i / _ #'), R('t > s / _ i #')] } },
      { id: 'hung-p', label: 'Initial p became f, and k before back vowels became h (*kala > hal).', by: { hungarian: 'on' }, options: { on: [R('p > f / # _'), R('k > h / # _ {a o u ɑ ɯ}'), R('{t k} > {z ɣ} / V _ V')] } },
      { id: 'delta', label: 'ð changed.', by: { finnish: 'fi', estonian: 'fi', hungarian: 'hu' }, options: { fi: [R('ð > t')], hu: [R('ð > ∅ / V _ V'), R('ð > l')] }, labels: { fi: 'ð became t (as in Finnish).', hu: 'ð was lost between vowels (as in Hungarian).' } },
      { id: 'w-v', label: 'w became v and ŋ was lost.', always: [R('w > v'), R('ŋ > ∅ / V _ V'), R('ʃ > h')] },
      { id: 'apocope', label: 'Final vowels were lost.', by: { hungarian: 'all', estonian: 'long' }, options: { all: [R('V > ∅ / C _ #', un)], long: [R('V > ∅ / V C C _ #', un)] }, labels: { all: 'Final vowels were lost (*nimi > név).', long: 'Final vowels after a heavy syllable were lost (as in Estonian).' } },
      { id: 'hung-vowels', label: 'Vowels before a lost final vowel became long (*nimi > név).', by: { hungarian: 'on' }, options: { on: [R('i > eː / C _ C #'), R('a > aː / # C _ C #', () => false)] } },
    ],
  },
  turkic: {
    proto: 'prototurkic', protoName: 'Proto-Turkic',
    anchors: { turkish: 3, kazakh: 2, uzbek: 1.5, yakut: 1, chuvash: 0.8 },
    anchorNames: { turkish: 'Turkish', kazakh: 'Kazakh', uzbek: 'Uzbek', yakut: 'Yakut', chuvash: 'Chuvash' },
    steps: [
      { id: 'rz', label: 'The palatal r and l changed (*taːĺ “stone”, *kø̄ŕ “eye”).', by: { turkish: 'common', kazakh: 'common', uzbek: 'common', yakut: 'common', chuvash: 'lir' }, options: { common: [R('rʲ > z'), R('lʲ > ʃ'), R('nʲ > j')], lir: [R('rʲ > r'), R('lʲ > l'), R('nʲ > n')] }, labels: { common: 'Palatal ŕ and ĺ became z and š (*tāĺ > taš, *köŕ > göz).', lir: 'Palatal ŕ and ĺ became r and l (as in Chuvash: Lir-Turkic).' } },
      { id: 'd', label: 'd between vowels changed (*adak “foot”).', by: { turkish: 'j', kazakh: 'j', uzbek: 'j', yakut: 't', chuvash: 'r' }, options: { j: [R('{d ð} > j / V _')], t: [R('{d ð} > t / V _')], r: [R('{d ð z} > r / V _')] }, labels: { j: 'd after vowels became y (*adak > ayak).', t: 'd after vowels became t (*adak > atax, as in Yakut).', r: 'd and z after vowels became r (as in Chuvash).' } },
      { id: 'initial', label: 'Initial consonants changed.', by: { turkish: 'oghuz', kazakh: 'kip', yakut: 'yak', uzbek: 'none' }, options: { oghuz: [R('t > d / # _ V'), R('k > g / # _ Vf')], kip: [R('j > ʒ / # _'), R('ʃ > s'), R('tʃ > ʃ')], yak: [R('s > ∅ / # _'), R('tʃ > s'), R('j > s / # _')], none: [] }, labels: { oghuz: 'Initial t and k became d and g (*taš > daš, *kel- > gel-), as in Turkish.', kip: 'Initial y became ž, č became š and š became s (as in Kazakh).', yak: 'Initial s was lost and č became s (as in Yakut).', none: 'Initial consonants stayed.' } },
      { id: 'g', label: 'g after vowels weakened.', by: { turkish: 'on', kazakh: 'w', uzbek: 'on' }, options: { on: [R('g > ɣ / V _'), R('ɣ > ∅ / V _ #')], w: [R('g > w / V _')] }, labels: { on: 'g after vowels weakened to ğ and was lost at the end of words (*tāg > dağ).', w: 'g after vowels became w (as in Kazakh tau).' } },
      { id: 'b', label: 'Final b after vowels was lost (*sub > su).', by: { turkish: 'on', uzbek: 'on', kazakh: 'on' }, options: { on: [R('b > ∅ / V _ #'), R('b > v / V _ V')] } },
      { id: 'length', label: 'Long vowels were shortened.', by: { turkish: 'on', kazakh: 'on', uzbek: 'on', chuvash: 'on' }, options: { on: [R('Vl > -ː')] } },
      { id: 'uzbek', label: 'a became ɔ and vowel harmony weakened (as in Uzbek).', by: { uzbek: 'on' }, options: { on: [R('a > ɔ'), R('{y ø} > {u o}')] } },
      { id: 'nasal', label: 'ŋ became n.', by: { turkish: 'on', uzbek: 'on' }, options: { on: [R('ŋ > n')] } },
    ],
  },
});

export function stepRules(step, opt) { return step.always || step.options?.[opt] || []; }

// spelling conventions of each anchor daughter (romanization preferences), [ASSUMPTION] simplified orthographies
export const ROM = {
  romance: {
    _: { long: 'macron' },
    spanish: { tʃ: 'ch', ʎ: 'll', ɲ: 'ñ', x: 'j', θ: 'z', k: 'c', ʃ: 'x', ʒ: 'y' },
    italian: { tʃ: 'c', dʒ: 'g', ʎ: 'gl', ɲ: 'gn', k: 'c', ts: 'z', ʃ: 'sc', ɛ: 'è', ɔ: 'ò' },
    french: { ʃ: 'ch', ʒ: 'j', ø: 'eu', y: 'u', u: 'ou', ɲ: 'gn', ɛ: 'è', ə: 'e', k: 'c', ts: 'ç', 'ɑ̃': 'an', 'ɛ̃': 'in', 'ɔ̃': 'on', 'œ̃': 'un' },
    portuguese: { ʃ: 'x', ʎ: 'lh', ɲ: 'nh', ʒ: 'j', k: 'c', tʃ: 'tch', ts: 'ç' },
    romanian: { ə: 'ă', ʃ: 'ș', ts: 'ț', tʃ: 'č', dʒ: 'ğ', k: 'c', ɨ: 'â' },
    sardinian: { k: 'k', tʃ: 'c', ts: 'tz', dʒ: 'g', ʎ: 'll' },
  },
  hellenic: { _: { x: 'ch', θ: 'th', ð: 'dh', ɣ: 'gh', j: 'y', ç: 'h' } },
  slavic: {
    russian: { tʃ: 'č', ʃ: 'š', ʒ: 'ž', ts: 'c', x: 'kh', ɨ: 'y', j: 'j', tʲ: 't’', dʲ: 'd’', nʲ: 'n’', lʲ: 'l’', rʲ: 'r’', sʲ: 's’' },
    polish: { tʃ: 'cz', ʃ: 'sz', ʒ: 'ż', ts: 'c', ɨ: 'y', x: 'ch', ɲ: 'ń', tɕ: 'ć', dʑ: 'dź', ɕ: 'ś', v: 'w', j: 'j', 'ẽ': 'ę', 'õ': 'ą', 'ɛ̃': 'ę', 'ɔ̃': 'ą' },
    serbocroatian: { tʃ: 'č', tɕ: 'ć', dʒ: 'dž', dʑ: 'đ', ʃ: 'š', ʒ: 'ž', ts: 'c', x: 'h', j: 'j' },
    czech: { tʃ: 'č', ʃ: 'š', ʒ: 'ž', ts: 'c', x: 'ch', j: 'j', ɲ: 'ň' },
    bulgarian: { tʃ: 'ch', ʃ: 'sh', ʒ: 'zh', ts: 'ts', x: 'h', ə: 'ǎ', j: 'y' },
  },
  germanic: {
    german: { long: 'none', ʃ: 'sch', ts: 'z', x: 'ch', ø: 'ö', y: 'ü', ɛ: 'ä', æ: 'ä', j: 'j', v: 'w', f: 'f', ŋ: 'ng', pf: 'pf' },
    english: { long: 'none', ʃ: 'sh', tʃ: 'ch', θ: 'th', ð: 'th', j: 'y', dʒ: 'j', æ: 'a', ø: 'e', y: 'i', k: 'k' },
    swedish: { long: 'none', ø: 'ö', ɛ: 'ä', æ: 'ä', j: 'j', ʃ: 'sj', y: 'y', u: 'u' },
    dutch: { x: 'ch', ɣ: 'g', j: 'j', y: 'uu', ø: 'eu', ə: 'e', u: 'oe' },
    icelandic: { θ: 'þ', ð: 'ð', æ: 'æ', ø: 'ö', j: 'j' },
  },
  celtic: {
    irish: { x: 'ch', ɣ: 'gh', v: 'bh', ð: 'dh', θ: 'th', ʃ: 's' },
    welsh: { v: 'f', f: 'ff', ð: 'dd', θ: 'th', ɬ: 'll', x: 'ch', u: 'w', ɨ: 'u', j: 'i' },
    breton: { x: "c'h", v: 'v', ʃ: 'ch', ð: 'z' },
  },
  indoaryan: { _: { ʈ: 'ṭ', ɖ: 'ḍ', ɳ: 'ṇ', ʃ: 'sh', tʃ: 'ch', dʒ: 'j', j: 'y', ɛ: 'ai', ɔ: 'au', long: 'macron' }, bengali: { ɔ: 'o', ʃ: 'sh' } },
  semitic: { _: { ħ: 'ḥ', ʕ: 'ʿ', ʔ: 'ʾ', ʃ: 'sh', x: 'kh', ɣ: 'gh', θ: 'th', ð: 'dh', j: 'y', long: 'macron' }, hebrew: { x: 'kh', ts: 'ts', v: 'v' }, amharic: { tʼ: "t'", kʼ: "q", ə: 'ə' } },
  sinitic: { mandarin: { tɕ: 'j', ɕ: 'x', ʂ: 'sh', tʂ: 'zh', ts: 'z', x: 'h', ŋ: 'ng', ɻ: 'r', kʰ: 'k', tʰ: 't', pʰ: 'p', k: 'g', t: 'd', p: 'b', j: 'y' }, cantonese: { ts: 'z', ŋ: 'ng', j: 'j', kʰ: 'k', tʰ: 't', pʰ: 'p', k: 'g', t: 'd', p: 'b', x: 'h' } },
  japonic: { _: { ʃ: 'sh', tʃ: 'ch', ts: 'ts', ɸ: 'f', dʒ: 'j', j: 'y', long: 'macron' } },
  bantu: { _: { tʃ: 'ch', ʃ: 'sh', ɲ: 'ny', ŋ: "ng'", j: 'y', ᵐb: 'mb', ⁿd: 'nd', ᵑɡ: 'ng', dʒ: 'j' }, zulu: { ɬ: 'hl', j: 'y' } },
  polynesian: { _: { ʔ: 'ʻ', ŋ: 'ng', long: 'macron' }, maori: { ɸ: 'wh' }, samoan: { ŋ: 'g' } },
  uralic: { _: { long: 'double', æ: 'ä', ø: 'ö', y: 'y', j: 'j', ʃ: 'š' }, hungarian: { long: 'acute', ʃ: 's', s: 'sz', ɲ: 'ny', ts: 'c', tʃ: 'cs', j: 'j', y: 'ü', ø: 'ö', ɛ: 'e', æ: 'e' }, estonian: { ɤ: 'õ', ø: 'ö', y: 'ü' } },
  turkic: { _: { ɯ: 'ı', ʃ: 'ş', tʃ: 'ç', dʒ: 'c', ø: 'ö', y: 'ü', ɣ: 'ğ', j: 'y', ŋ: 'ñ' }, kazakh: { ɣ: 'ğ', q: 'q', ʒ: 'j', ɯ: 'ı' }, uzbek: { ɔ: 'o', ʃ: 'sh', tʃ: 'ch', q: 'q', ɣ: 'gʻ' }, yakut: { x: 'x', ŋ: 'ŋ' } },
};
