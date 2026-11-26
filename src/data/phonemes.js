// Segment catalogue: IPA symbol -> features and romanization candidates.
// [ASSUMPTION] romanization candidates are the author's choice; the first entry is the plain default.
// type: C or V. manner: stop, affricate, fricative, nasal, lateral, rhotic, glide, (prenasal, aspirate, ejective as flags)
// place: labial, dental, alveolar, postalveolar, retroflex, palatal, velar, uvular, pharyngeal, glottal
// sonority: 1 stop, 2 affricate, 3 fricative, 4 nasal, 5 liquid, 6 glide

const C = (ipa, place, manner, voice, rom, extra = {}) => ({ ipa, type: 'C', place, manner, voice, rom, ...extra });
const V = (ipa, height, back, round, rom, extra = {}) => ({ ipa, type: 'V', height, back, round, rom, ...extra });

export const SONORITY = { stop: 1, affricate: 2, fricative: 3, nasal: 4, lateral: 5, rhotic: 5, glide: 6 };

const list = [
  // stops
  C('p', 'labial', 'stop', false, ['p']),
  C('b', 'labial', 'stop', true, ['b']),
  C('t', 'alveolar', 'stop', false, ['t']),
  C('d', 'alveolar', 'stop', true, ['d']),
  C('k', 'velar', 'stop', false, ['k', 'c']),
  C('g', 'velar', 'stop', true, ['g']),
  C('q', 'uvular', 'stop', false, ['q']),
  C('ʔ', 'glottal', 'stop', false, ["'", 'ʼ']),
  C('ʈ', 'retroflex', 'stop', false, ['ṭ', 'tr']),
  C('ɖ', 'retroflex', 'stop', true, ['ḍ', 'dr']),
  // Implosives, added from sourced Bantu inventories (PHOIBLE; references/bantu/notes.md)
  C('ɓ', 'labial', 'stop', true, ['ɓ', "b'", 'bb'], { imp: true }),
  C('ɗ', 'alveolar', 'stop', true, ['ɗ', "d'", 'dd'], { imp: true }),
  C('c', 'palatal', 'stop', false, ['ky', 'ć', 'tj']),
  C('ɟ', 'palatal', 'stop', true, ['gy', 'đ', 'dj']),
  C('pʰ', 'labial', 'stop', false, ['ph'], { asp: true }),
  C('tʰ', 'alveolar', 'stop', false, ['th'], { asp: true }),
  C('kʰ', 'velar', 'stop', false, ['kh'], { asp: true }),
  C('bʱ', 'labial', 'stop', true, ['bh'], { asp: true }),
  C('dʱ', 'alveolar', 'stop', true, ['dh'], { asp: true }),
  C('ɡʱ', 'velar', 'stop', true, ['gh'], { asp: true }),
  C('tʼ', 'alveolar', 'stop', false, ["t'", 'ţ'], { ej: true }),
  C('kʼ', 'velar', 'stop', false, ["k'", 'ķ'], { ej: true }),
  C('tˤ', 'alveolar', 'stop', false, ['ṭ', 'ț'], { emph: true }),
  C('dˤ', 'alveolar', 'stop', true, ['ḍ'], { emph: true }),
  C('sˤ', 'alveolar', 'fricative', false, ['ṣ', 'ş'], { emph: true }),
  C('tʲ', 'alveolar', 'stop', false, ['ť', 'ty', 'tj'], { pal: true }),
  C('dʲ', 'alveolar', 'stop', true, ['ď', 'dy', 'dj'], { pal: true }),
  C('ᵐb', 'labial', 'stop', true, ['mb'], { pren: true }),
  C('ⁿd', 'alveolar', 'stop', true, ['nd'], { pren: true }),
  C('ᵑɡ', 'velar', 'stop', true, ['ng'], { pren: true }),
  // affricates
  C('ts', 'alveolar', 'affricate', false, ['ts', 'c', 'z']),
  C('dz', 'alveolar', 'affricate', true, ['dz']),
  C('tʃ', 'postalveolar', 'affricate', false, ['ch', 'č', 'c', 'tx']),
  C('dʒ', 'postalveolar', 'affricate', true, ['j', 'dž', 'dj', 'g']),
  C('tɕ', 'palatal', 'affricate', false, ['ć', 'q', 'tj']),
  C('dʑ', 'palatal', 'affricate', true, ['dź', 'dj']),
  C('tʂ', 'retroflex', 'affricate', false, ['zh', 'cz', 'ṭš']),
  C('tɬ', 'alveolar', 'affricate', false, ['tl']),
  // fricatives
  C('ɸ', 'labial', 'fricative', false, ['f', 'fh']),
  C('f', 'labial', 'fricative', false, ['f', 'ph']),
  C('v', 'labial', 'fricative', true, ['v', 'w', 'bh']),
  C('β', 'labial', 'fricative', true, ['v', 'bh']),
  C('θ', 'dental', 'fricative', false, ['th', 'þ', 'ṯ']),
  C('ð', 'dental', 'fricative', true, ['dh', 'ð', 'ḏ']),
  C('s', 'alveolar', 'fricative', false, ['s']),
  C('z', 'alveolar', 'fricative', true, ['z']),
  C('ʃ', 'postalveolar', 'fricative', false, ['sh', 'š', 'x', 'ş', 'sz']),
  C('ʒ', 'postalveolar', 'fricative', true, ['zh', 'ž', 'j', 'ż']),
  C('ɕ', 'palatal', 'fricative', false, ['ś', 'x', 'sj']),
  C('ʑ', 'palatal', 'fricative', true, ['ź', 'zj']),
  C('ʂ', 'retroflex', 'fricative', false, ['ṣ', 'sh', 'sr']),
  C('ç', 'palatal', 'fricative', false, ['hy', 'ç', 'hj']),
  C('x', 'velar', 'fricative', false, ['kh', 'x', 'h', 'ch']),
  C('ɣ', 'velar', 'fricative', true, ['gh', 'ğ', 'g']),
  C('χ', 'uvular', 'fricative', false, ['kh', 'x', 'ḫ']),
  C('ʁ', 'uvular', 'fricative', true, ['gh', 'r', 'ġ']),
  C('ħ', 'pharyngeal', 'fricative', false, ['ḥ', 'hh']),
  C('ʕ', 'pharyngeal', 'fricative', true, ['ʿ', "`"]),
  C('h', 'glottal', 'fricative', false, ['h']),
  C('ɬ', 'alveolar', 'fricative', false, ['lh', 'll', 'ł']),
  C('sʲ', 'alveolar', 'fricative', false, ['ś', 'sy', 'sj'], { pal: true }),
  // nasals
  C('m', 'labial', 'nasal', true, ['m']),
  C('n', 'alveolar', 'nasal', true, ['n']),
  C('ɲ', 'palatal', 'nasal', true, ['ny', 'ñ', 'ń', 'nh']),
  C('ŋ', 'velar', 'nasal', true, ['ng', 'ŋ', "n'"]),
  C('ɳ', 'retroflex', 'nasal', true, ['ṇ', 'rn']),
  C('nʲ', 'alveolar', 'nasal', true, ['ň', 'ny', 'nj'], { pal: true }),
  // liquids
  C('l', 'alveolar', 'lateral', true, ['l']),
  C('ʎ', 'palatal', 'lateral', true, ['ly', 'lh', 'gl', 'll']),
  C('lʲ', 'alveolar', 'lateral', true, ['ľ', 'ly', 'lj'], { pal: true }),
  C('ɫ', 'velar', 'lateral', true, ['ł', 'l']),
  C('r', 'alveolar', 'rhotic', true, ['r', 'rr']),
  C('ɾ', 'alveolar', 'rhotic', true, ['r']),
  C('rʲ', 'alveolar', 'rhotic', true, ['ř', 'ry', 'rj'], { pal: true }),
  C('ɻ', 'retroflex', 'rhotic', true, ['r', 'ṛ']),
  // glides
  C('j', 'palatal', 'glide', true, ['y', 'j', 'i']),
  C('w', 'labial', 'glide', true, ['w', 'u', 'v']),

  // vowels
  V('i', 'high', 'front', false, ['i']),
  V('y', 'high', 'front', true, ['ü', 'y']),
  V('ɨ', 'high', 'central', false, ['y', 'ı', 'ï']),
  V('ɯ', 'high', 'back', false, ['ı', 'ư', 'ŭ']),
  V('u', 'high', 'back', true, ['u']),
  V('e', 'mid', 'front', false, ['e']),
  V('ø', 'mid', 'front', true, ['ö', 'ø', 'eu']),
  V('ə', 'mid', 'central', false, ['ë', 'ə', 'ă', 'e']),
  V('o', 'mid', 'back', true, ['o']),
  V('ɤ', 'mid', 'back', false, ['ơ', 'ŏ', 'õ']),
  V('ɛ', 'lowmid', 'front', false, ['è', 'ę', 'e']),
  V('ɔ', 'lowmid', 'back', true, ['ò', 'ǫ', 'o']),
  V('æ', 'low', 'front', false, ['ä', 'æ', 'ae']),
  V('a', 'low', 'central', false, ['a']),
  V('ɑ', 'low', 'back', false, ['â', 'å', 'a']),
  // Near-high and front rounded vowels, added from sourced Germanic, Celtic and Indo-Aryan inventories
  // (PHOIBLE; references/germanic/notes.md, references/celtic/notes.md, references/indoaryan/notes.md)
  V('ɪ', 'high', 'front', false, ['ı', 'ì', 'ĭ']),
  V('ʏ', 'high', 'front', true, ['ÿ', 'ŭ', 'ue']),
  V('ʊ', 'high', 'back', true, ['ù', 'ŭ', 'ou']),
  V('œ', 'lowmid', 'front', true, ['œ', 'ø', 'oe']),
];

// Nasal vowels share the height, backness and rounding of their oral counterparts.
const nasalVowels = {
  a: ['ã'], ɑ: ['an', 'ã'], e: ['ẽ'], ɛ: ['ę', 'ẽ'], i: ['ĩ'],
  o: ['õ'], ɔ: ['ǫ', 'õ'], u: ['ũ'], œ: ['eun'], ə: ['ẽ', 'ən'],
};
for (const vowel of list.filter(s => s.type === 'V' && nasalVowels[s.ipa])) {
  const ipa = (vowel.ipa + '̃').normalize('NFC');
  list.push({ ...vowel, ipa, rom: [...nasalVowels[vowel.ipa], ipa], nasal: true, oral: vowel.ipa });
}

export const SEGMENTS = Object.fromEntries(list.map(s => [s.ipa, s]));

export const segmentBase = (ipa) => ipa.replace(/[ː1-6]+$/, '').normalize('NFC');
export function seg(ipa) {
  return SEGMENTS[segmentBase(ipa)];
}
export function isVowel(ipa) { const s = seg(ipa); return !!s && s.type === 'V'; }
export function sonority(ipa) { const s = seg(ipa); return s ? (s.type === 'V' ? 7 : SONORITY[s.manner]) : 0; }

// Harmony partner tables (front <-> back) used by vowel harmony.
export const FRONT_OF = { u: 'y', o: 'ø', a: 'æ', ɑ: 'æ', ɯ: 'i', ɨ: 'i', ɔ: 'ø', ɤ: 'e' };
export const BACK_OF = { y: 'u', ø: 'o', æ: 'a', i: 'ɯ', e: 'ɤ', ɛ: 'ɔ' };

// Place/manner ordering for the grammar-book consonant chart.
export const PLACES = ['labial', 'dental', 'alveolar', 'postalveolar', 'retroflex', 'palatal', 'velar', 'uvular', 'pharyngeal', 'glottal'];
export const MANNERS = ['stop', 'affricate', 'fricative', 'nasal', 'lateral', 'rhotic', 'glide'];
export const HEIGHTS = ['high', 'mid', 'lowmid', 'low'];
export const BACKS = ['front', 'central', 'back'];
