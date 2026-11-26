// Family profiles.
// SOURCED (2026-11-23, see references/CANDIDATES.md, approved items A, B):
//   consonants / vowels weights and tiers, cCount, vCount, longVowels, diphthongs: PHOIBLE 2.0 (Moran & McCloy
//   eds. 2019, CC BY-SA 3.0), presence share over the example languages in references/rows/<family>.json;
//   grammar weights marked B1-B18: WALS Online (Dryer & Haspelmath eds. 2013, CC BY 4.0).
//   Every page used is listed in references/manifest/<family>.json. Data is reference-only (derived counts).
// [ASSUMPTION] still the author's: vowelPct, wordLen, complexity ranges, onsetMax/codaMax, codaSet, cluster
//   lists, stress, finalVowel and other shape fields, number/tone weights not marked B, special features,
//   romanization preferences, and anything marked [ASSUMPTION] or STYLISTIC below. Original is entirely assumed.
//
// consonants / vowels: { ipa: [frequencyWeight, tier] }  tier 1 = core, 2 = common, 3 = marked (needs complexity)
// ranges are [lo, hi]; Auto picks inside them with the seed.
// grammar weights: { option: weight }

const W = (o) => o;

export const FAMILIES = {
  original: {
    name: 'Original', blurb: 'No parent family: broad pools, every option possible.',
    consonants: W({ p: [5, 1], t: [6, 1], k: [6, 1], b: [4, 1], d: [4, 1], g: [3, 2], m: [6, 1], n: [7, 1], s: [6, 1], l: [5, 1], r: [5, 1], j: [3, 1], w: [3, 1], h: [3, 1],
      f: [3, 2], v: [3, 2], z: [3, 2], ʃ: [3, 2], ŋ: [2, 2], x: [2, 2], ts: [2, 2], tʃ: [2, 2], q: [1, 3], ʔ: [2, 3], θ: [1, 3], ɬ: [1, 3], ɲ: [2, 3], ʒ: [1, 3], ɣ: [1, 3], tʼ: [1, 3], kʼ: [1, 3], χ: [1, 3], ɾ: [2, 2], dʒ: [2, 3] }),
    vowels: W({ a: [8, 1], i: [6, 1], u: [6, 1], e: [5, 1], o: [5, 1], ə: [2, 2], ɛ: [2, 3], ɔ: [2, 3], y: [1, 3], ɨ: [1, 3], æ: [1, 3], ø: [1, 3] }),
    nasalVowels: ['ã', 'ẽ', 'ĩ', 'õ', 'ũ', 'ɛ̃', 'ɔ̃'],
    vCount: [3, 9], cCount: [9, 26], vowelPct: [36, 56], wordLen: [1.6, 3.0], complexity: [1, 5],
    onsetMax: 3, codaMax: 3, finalVowel: 0.5, longVowels: 0.3, diphthongs: 0.3,
    stress: { initial: 2, penult: 2, final: 1, weight: 1 },
    grammar: {
      caseOn: 0.6, caseCount: [3, 8], morph: { agglutinative: 2, fusional: 1.5, isolating: 1 },
      order: { SOV: 4, SVO: 4, VSO: 2, VOS: 1, OVS: 0.6, OSV: 0.4 }, alignment: { accusative: 3, ergative: 1 },
      gender: { none: 3, animacy: 1, two: 1, three: 1 }, number: { sgpl: 4, dual: 1, none: 1 },
      articles: { none: 2, definite: 1, both: 1 }, tone: { none: 5, two: 1, many: 0.5 }, harmony: 0.2,
      tam: { simple: 1, standard: 2, rich: 1 },
    },
    special: {}, script: 'latin', romPrefs: {},
  },

  romance: {
    name: 'Romance (Latin)', blurb: 'Open syllables, words ending in -a/-o/-e, gender and articles; Latin-like case if enabled.',
    // Sourced: PHOIBLE presence share x10 over 6 languages (Spanish, Italian, French, Portuguese, Romanian, Catalan); references/romance/notes.md
    consonants: W({ p: [10, 1], t: [10, 1], k: [8.3, 1], b: [8.3, 1], d: [8.3, 1], g: [6.7, 2], m: [10, 1], n: [10, 1], s: [10, 1], l: [10, 1], r: [6.7, 2], f: [10, 1], v: [6.7, 2], z: [8.3, 1], 'tʃ': [6.7, 2], 'dʒ': [5, 2], 'ɲ': [8.3, 1], 'ʎ': [6.7, 2], ts: [3.3, 3], j: [10, 1], 'ʃ': [8.3, 1], 'θ': [1.7, 3], w: [10, 1], 'ɾ': [6.7, 2], 'ʒ': [6.7, 2], 'ŋ': [5, 2] }),
    vowels: W({ a: [8.3, 1], e: [10, 1], i: [10, 1], o: [10, 1], u: [10, 1], 'ɛ': [8.3, 1], 'ɔ': [8.3, 1] }),
    vCount: [5, 9], cCount: [20, 23], vowelPct: [44, 50], wordLen: [2.2, 2.9], complexity: [2, 3],
    onsetMax: 2, codaMax: 1, codaSet: ['n', 's', 'r', 'l'], finalVowel: 0.85, longVowels: 0.17, diphthongs: 0.17,
    // [ASSUMPTION] Romance shape: few vowel-initial words, final vowels mostly -a/-o/-e, final consonants only s n r l
    vowelInitial: 0.12, finalVowels: { a: 4, o: 4, e: 3, i: 1 }, finalCodas: ['s', 'n', 'r', 'l'],
    affixConsonants: ['s', 'm', 'n', 'r', 't'],
    spelling: [['c(?=[eiè])', 'qu'], ['g(?=[eiè])', 'gu']], // [ASSUMPTION] Spanish-style: /k/ before e, i is written qu
    clusterOnset: ['pr', 'tr', 'kr', 'br', 'dr', 'gr', 'pl', 'kl', 'bl', 'fl', 'fr', 'st', 'sp', 'sk'],
    stress: { penult: 5, antepenult: 1 },
    grammar: { // B1 49A: no case 4, two cases 1; B2 30A: two 2
      caseOn: 0.2, caseCount: [2, 6] /* 6 = Latin [ASSUMPTION] */, morph: { fusional: 6, agglutinative: 0.5, isolating: 0.3 },
      order: { SVO: 5, SOV: 2, VSO: 0.3 }, alignment: { accusative: 1 },
      gender: { two: 6, three: 1, none: 0.3 }, number: { sgpl: 1 }, articles: { both: 4, definite: 1, none: 0.5 },
      tone: { none: 1 }, harmony: 0, tam: { standard: 2, rich: 2 },
    },
    special: {}, script: 'latin', romPrefs: { k: 'c', tʃ: 'c', ɲ: 'gn', ʎ: 'gl', ɛ: 'è', ɔ: 'ò', ts: 'z' },
  },

  slavic: {
    name: 'Slavic', blurb: 'Heavy consonant clusters, palatalisation, rich case, three genders, aspect.',
    // Sourced: PHOIBLE presence share x10 over 7 languages (Russian, Polish, Czech, Serbian-Croatian, Bulgarian, Ukrainian, Slovene); references/slavic/notes.md
    consonants: W({ p: [10, 1], b: [10, 1], t: [10, 1], d: [10, 1], k: [10, 1], g: [10, 1], m: [10, 1], n: [10, 1], s: [10, 1], z: [10, 1], l: [7.1, 2], r: [8.6, 1], v: [7.1, 2], j: [10, 1], x: [10, 1], 'ʃ': [7.1, 2], 'ʒ': [7.1, 2], 'tʃ': [7.1, 2], ts: [10, 1], 'tʲ': [2.9, 3], 'nʲ': [2.9, 3], 'lʲ': [2.9, 3], 'rʲ': [2.9, 3], 'sʲ': [2.9, 3], 'dʲ': [2.9, 3], f: [10, 1], 'ɲ': [4.3, 2], 'ɕ': [1.4, 3], 'ʑ': [1.4, 3], 'tɕ': [2.9, 3], 'dʒ': [5.7, 2] }),
    vowels: W({ a: [8.6, 1], o: [7.1, 2], e: [4.3, 2], i: [10, 1], u: [10, 1], 'ɨ': [1.4, 3], 'ɛ': [7.1, 2] }),
    vCount: [5, 8], cCount: [21, 37], vowelPct: [36, 43], wordLen: [1.9, 2.8], complexity: [3, 5],
    onsetMax: 3, codaMax: 2, finalVowel: 0.45, longVowels: 0.43, diphthongs: 0.29,
    clusterOnset: ['pr', 'tr', 'kr', 'br', 'dr', 'gr', 'pl', 'kl', 'bl', 'gl', 'vl', 'zv', 'sv', 'st', 'sk', 'sp', 'zd', 'zb', 'mn', 'dv', 'tv', 'kv', 'sl', 'sn', 'sm', 'vz', 'vs', 'tʃl', 'xl', 'xr', 'ʃk', 'ʃt', 'ʒd', 'str', 'skr', 'spr', 'vzd', 'zdr', 'pʃ', 'gn', 'kn'],
    vowelInitial: 0.08, finalVowels: { a: 4, o: 3, e: 3, i: 2, u: 0.5 }, affixConsonants: ['m', 'x', 'v', 'j', 't', 's'], noInitial: ['ɫ'],
    stress: { initial: 2, penult: 3, free: 2 },
    grammar: { // Sourced check 49A 6-7 cases, 30A three, 37A no articles: agree
      caseOn: 0.92, caseCount: [6, 7], morph: { fusional: 8, agglutinative: 0.5 },
      order: { SVO: 5, SOV: 1.5, OVS: 0.5 }, alignment: { accusative: 1 },
      gender: { three: 6, two: 1 }, number: { sgpl: 5, dual: 1 }, articles: { none: 6, definite: 1 },
      tone: { none: 6, two: 0.5 }, harmony: 0, tam: { rich: 5, standard: 1 },
    },
    special: { aspectPairs: true }, script: 'cyrillic', romPrefs: { ɨ: 'y', ʃ: 'š', ʒ: 'ž', tʃ: 'č', ts: 'c', x: 'ch', j: 'j', tʲ: 'ť', nʲ: 'ň', lʲ: 'ľ', rʲ: 'ř' },
  },

  germanic: {
    name: 'Germanic', blurb: 'Initial stress, consonant-final words, umlaut, strong verbs, verb-second.',
    // Sourced: PHOIBLE presence share x10 over 6 languages (German, English, Dutch, Swedish, Icelandic, Norwegian); references/germanic/notes.md
    consonants: W({ p: [10, 1], b: [8.3, 1], t: [10, 1], d: [8.3, 1], k: [10, 1], g: [6.7, 2], m: [10, 1], n: [10, 1], s: [10, 1], l: [10, 1], r: [1.7, 3], f: [10, 1], v: [8.3, 1], h: [8.3, 1], w: [5, 2], j: [8.3, 1], 'θ': [3.3, 3], 'ð': [1.7, 3], x: [5, 2], 'ŋ': [10, 1], 'ʃ': [5, 2], z: [5, 2], ts: [1.7, 3], 'pʰ': [1.7, 3], 'ɣ': [3.3, 3], 'ç': [1.7, 3], 'ʒ': [5, 2], 'ʔ': [5, 2] }),
    vowels: W({ a: [8.3, 1], e: [10, 1], i: [10, 1], o: [8.3, 1], u: [10, 1], 'ə': [3.3, 3], y: [6.7, 2], 'ø': [8.3, 1], 'æ': [1.7, 3], 'ɛ': [8.3, 1], 'ɔ': [10, 1], 'ɪ': [6.7, 2], 'œ': [6.7, 2], 'ʊ': [5, 2], 'ʏ': [5, 2], 'ɑ': [5, 2] }),
    vCount: [8, 14], cCount: [18, 27], vowelPct: [35, 41], wordLen: [1.4, 2.2], complexity: [3, 5],
    onsetMax: 3, codaMax: 3, finalVowel: 0.25, longVowels: 1.0, diphthongs: 0.17,
    clusterOnset: ['pr', 'tr', 'kr', 'br', 'dr', 'gr', 'pl', 'kl', 'bl', 'gl', 'fl', 'fr', 'sl', 'sn', 'sm', 'sw', 'st', 'sp', 'sk', 'str', 'spr', 'skr', 'θr', 'hw', 'hl', 'hr', 'kn', 'gn', 'dw', 'tw', 'kw', 'wr', 'wl'],
    diphthongList: ['ai', 'au', 'ei', 'ou'], vowelInitial: 0.15, finalVowels: { ə: 4, a: 2, e: 1, o: 1, i: 1 }, affixConsonants: ['n', 'r', 's', 't', 'd', 'm'], noInitial: ['ŋ', 'ç'],
    stress: { initial: 8 },
    grammar: { // B3 65A no aspect 4/4, 67A no inflectional future 4/4; B4 37A definite affix 3/6
      caseOn: 0.55, caseCount: [2, 4], morph: { fusional: 6, isolating: 1.5, agglutinative: 0.3 },
      order: { SVO: 4, SOV: 3 }, alignment: { accusative: 1 },
      gender: { three: 4, two: 2, none: 1 }, number: { sgpl: 1 }, articles: { both: 4, definite: 2, none: 1 }, articleSide: { before: 3, suffix: 3 },
      tone: { none: 6, two: 1 }, harmony: 0, tam: { simple: 4, standard: 1 },
    },
    special: { v2: 0.6, ablaut: true }, script: 'runic' /* STYLISTIC: all 6 sourced languages use Latin */, romPrefs: { θ: 'þ', ð: 'ð', x: 'ch', ʃ: 'sch', j: 'j', w: 'w', ə: 'e', y: 'ü', ø: 'ö', æ: 'ä', ɛ: 'e', ɔ: 'o', ɣ: 'gh', long: 'double' }, romMerge: ['ə', 'ɛ', 'ɔ'],
  },

  hellenic: {
    name: 'Hellenic', blurb: 'Clear five-vowel system, aspirates and theta, articles with case, three genders.',
    // Sourced: PHOIBLE presence share x10 over 1 languages (Greek (Modern)); references/hellenic/notes.md
    // [ASSUMPTION] weight 1, tier 3, no sourced share: r pʰ tʰ kʰ h (kept for archaic flavour, approved) y
    consonants: W({ p: [10, 1], t: [10, 1], k: [10, 1], b: [10, 1], d: [10, 1], g: [10, 1], m: [10, 1], n: [10, 1], s: [10, 1], l: [10, 1], r: [1, 3], 'pʰ': [1, 3], 'tʰ': [1, 3], 'kʰ': [1, 3], 'θ': [10, 1], 'ð': [10, 1], f: [10, 1], v: [10, 1], x: [10, 1], 'ɣ': [10, 1], z: [10, 1], j: [10, 1], h: [1, 3], ts: [10, 1], 'ɾ': [10, 1], dz: [10, 1] }),
    // Greek PHOIBLE writes /a e o/ as ɑ ɛ ɔ (notation); credited to a e o. y stays assumed (Ancient Greek flavour).
    vowels: W({ a: [10, 1], e: [10, 1], i: [10, 1], o: [10, 1], u: [10, 1], y: [1, 3] }),
    vCount: [5, 5], cCount: [19, 23], vowelPct: [42, 50], wordLen: [2.3, 3.2], complexity: [2, 4],
    onsetMax: 2, codaMax: 1, codaSet: ['s', 'n', 'r', 'l'], finalVowel: 0.55, longVowels: 0.0, diphthongs: 0.0,
    clusterOnset: ['pr', 'tr', 'kr', 'pl', 'kl', 'ps', 'ks', 'pn', 'kt', 'pt', 'sp', 'st', 'sk', 'θr', 'xr', 'fr', 'fθ', 'xθ', 'gr', 'gl', 'mn', 'dr'],
    diphthongList: ['ai', 'ei', 'oi', 'au', 'eu'], vowelInitial: 0.2, finalVowels: { a: 3, o: 2, i: 3, e: 2 }, finalCodas: ['s', 'n', 'r'], affixConsonants: ['s', 'n', 'm', 't', 'r'],
    stress: { penult: 3, antepenult: 3, final: 2 },
    grammar: { // B6 49A: Modern Greek 3 cases; 81A no dominant order (n=1)
      caseOn: 0.85, caseCount: [3, 5] /* 5 = Ancient Greek [ASSUMPTION] */, morph: { fusional: 8, agglutinative: 0.3 },
      order: { SVO: 4, SOV: 2, VSO: 1 }, alignment: { accusative: 1 },
      gender: { three: 7, two: 1 }, number: { sgpl: 4, dual: 1 }, articles: { definite: 6, both: 1 },
      tone: { none: 5, two: 1 }, harmony: 0, tam: { rich: 4, standard: 1 },
    },
    special: {}, script: 'greek', romPrefs: { pʰ: 'ph', tʰ: 'th', kʰ: 'kh', θ: 'th', x: 'ch', ɣ: 'gh', ð: 'd', y: 'y', long: 'macron' },
  },

  celtic: {
    name: 'Celtic', blurb: 'Verb-first sentences, initial consonant mutations, inflected prepositions.',
    // Sourced: PHOIBLE presence share x10 over 4 languages (Welsh, Irish, Gaelic (Scots), Breton); references/celtic/notes.md
    consonants: W({ p: [7.5, 2], b: [2.5, 3], t: [10, 1], d: [5, 2], k: [10, 1], g: [5, 2], m: [7.5, 2], n: [10, 1], s: [10, 1], l: [7.5, 2], r: [5, 2], v: [7.5, 2], h: [7.5, 2], 'ð': [2.5, 3], 'θ': [2.5, 3], x: [7.5, 2], f: [7.5, 2], 'ɣ': [5, 2], w: [7.5, 2], j: [10, 1], 'ɬ': [2.5, 3], 'ŋ': [7.5, 2], 'ʃ': [7.5, 2], 'tʃ': [5, 2], 'dʒ': [5, 2], z: [5, 2], 'ɲ': [5, 2], 'lʲ': [5, 2], 'nʲ': [5, 2], 'ç': [5, 2] }),
    vowels: W({ a: [10, 1], e: [10, 1], i: [10, 1], o: [10, 1], u: [10, 1], 'ə': [7.5, 2], 'ɑ': [7.5, 2], 'ɛ': [7.5, 2], 'ɔ': [5, 2], 'ɯ': [5, 2], 'ɤ': [5, 2], 'ɪ': [7.5, 2], 'ʊ': [5, 2] }),
    vCount: [8, 11], cCount: [25, 33], vowelPct: [37, 43], wordLen: [1.6, 2.5], complexity: [3, 4],
    onsetMax: 2, codaMax: 2, finalVowel: 0.35, longVowels: 1.0, diphthongs: 0.5,
    clusterOnset: ['br', 'dr', 'gr', 'bl', 'gl', 'kr', 'tr', 'kl', 'fl', 'sl', 'sn', 'sm', 'sk', 'st', 'sp', 'gw', 'xw', 'θr', 'ðr', 'kn'],
    diphthongList: ['ai', 'au', 'ei', 'oi', 'ae'], vowelInitial: 0.15, finalVowels: { a: 2, e: 2, i: 1, o: 1, ə: 1 }, affixConsonants: ['n', 'ð', 'd', 'r', 'x', 's'],
    stress: { initial: 4, penult: 3 },
    grammar: { // B7 81A: VSO 3 (Welsh, Irish, Gaelic), SVO 2 (Breton, Cornish); B8 37A/38A agree
      caseOn: 0.2, caseCount: [2, 3], morph: { fusional: 5, isolating: 1 },
      order: { VSO: 3, SVO: 2 }, alignment: { accusative: 1 },
      gender: { two: 6, none: 1 }, number: { sgpl: 4, dual: 0.5 }, articles: { definite: 7 },
      tone: { none: 1 }, harmony: 0, tam: { standard: 2, rich: 1 },
    },
    special: { mutations: true, inflectedPrepositions: true }, script: 'latin', romPrefs: { x: 'ch', ð: 'dd', θ: 'th', ɬ: 'll', v: 'f', f: 'ff', w: 'w', ə: 'y', long: 'acute' },
  },

  indoaryan: {
    name: 'Indo-Aryan', blurb: 'Aspirated and retroflex stops, eight-case nominals, verb-final order.',
    // Sourced: PHOIBLE presence share x10 over 6 languages (Hindi, Bengali, Marathi, Panjabi, Nepali, Sanskrit); references/indoaryan/notes.md
    // c ɟ: sources write cç ɟʝ (share 0.5)
    consonants: W({ p: [10, 1], b: [10, 1], t: [10, 1], d: [10, 1], k: [10, 1], g: [10, 1], m: [10, 1], n: [10, 1], s: [10, 1], l: [10, 1], r: [6.7, 2], j: [10, 1], h: [6.7, 2], 'ʈ': [10, 1], 'ɖ': [10, 1], 'pʰ': [10, 1], 'tʰ': [10, 1], 'kʰ': [10, 1], 'bʱ': [8.3, 1], 'dʱ': [8.3, 1], 'ɡʱ': [8.3, 1], 'ʃ': [1.7, 3], 'ʂ': [8.3, 1], 'ɳ': [5, 2], 'tʃ': [5, 2], 'dʒ': [5, 2], 'ŋ': [6.7, 2], 'ɲ': [5, 2], w: [8.3, 1], 'ç': [6.7, 2], f: [5, 2], 'ɟ': [5, 2], c: [5, 2] }),
    vowels: W({ a: [10, 1], i: [8.3, 1], u: [8.3, 1], e: [10, 1], o: [10, 1], 'ɛ': [1.7, 3], 'ɔ': [5, 2], 'ʊ': [5, 2], 'ɪ': [5, 2], 'æ': [5, 2] }),
    vCount: [5, 10], cCount: [31, 42], vowelPct: [40, 48], wordLen: [2.2, 3.0], complexity: [3, 5],
    onsetMax: 2, codaMax: 1, finalVowel: 0.6, longVowels: 0.67, diphthongs: 0.17,
    clusterOnset: ['pr', 'tr', 'kr', 'br', 'dr', 'gr', 'sv', 'tv', 'dv', 'kʂ', 'st', 'sn', 'sm', 'ʃr', 'pj', 'tj', 'mj', 'vj', 'dʱv', 'bʱr'],
    vowelInitial: 0.12, finalVowels: { a: 5, i: 3, e: 1, o: 1, u: 1 }, affixConsonants: ['n', 's', 'm', 't', 'k', 'r'], noInitial: ['ɳ', 'ŋ', 'ɲ'],
    stress: { weight: 4, penult: 2, initial: 1 },
    grammar: { // B9 98A tripartite 2; B10 49A: 5 cases, 2 cases
      caseOn: 0.9, caseCount: [4, 8] /* 8 = Sanskrit, inventory-sourced only [ASSUMPTION] */, morph: { fusional: 7, agglutinative: 2 },
      order: { SOV: 8, SVO: 0.5 }, alignment: { accusative: 1, ergative: 1 } /* 98A: tripartite 2; the generator has no tripartite */,
      gender: { three: 4, two: 3 }, number: { sgpl: 3, dual: 2 }, articles: { none: 8 },
      tone: { none: 1 }, harmony: 0, tam: { rich: 4, standard: 2 },
    },
    special: {}, script: 'devanagari', romPrefs: { ʈ: 'ṭ', ɖ: 'ḍ', ɳ: 'ṇ', ʂ: 'ṣ', ʃ: 'ś', tʃ: 'c', dʒ: 'j', j: 'y', ŋ: 'ṅ', ɲ: 'ñ', ɛ: 'ai', ɔ: 'au', long: 'macron' },
  },

  semitic: {
    name: 'Semitic', blurb: 'Triconsonantal roots with vowel templates, pharyngeals and emphatics, VSO.',
    // Sourced: PHOIBLE presence share x10 over 6 languages (Arabic (Modern Standard), Arabic (Egyptian), Hebrew (Modern), Amharic, Tigrinya, Maltese); references/semitic/notes.md
    consonants: W({ b: [8.3, 1], t: [10, 1], d: [8.3, 1], k: [10, 1], q: [5, 2], 'ʔ': [10, 1], m: [10, 1], n: [10, 1], s: [10, 1], z: [8.3, 1], l: [10, 1], r: [6.7, 2], h: [8.3, 1], 'ħ': [6.7, 2], 'ʕ': [3.3, 3], j: [10, 1], w: [8.3, 1], 'ʃ': [10, 1], f: [10, 1], x: [3.3, 3], 'ɣ': [1.7, 3], 'tˤ': [1.7, 3], 'sˤ': [1.7, 3], 'dˤ': [1.7, 3], 'θ': [3.3, 3], 'ð': [3.3, 3], 'dʒ': [8.3, 1], g: [6.7, 2], p: [8.3, 1], 'tʃ': [6.7, 2], 'ɾ': [5, 2], v: [5, 2] }),
    vowels: W({ a: [10, 1], i: [8.3, 1], u: [8.3, 1], e: [6.7, 2], o: [8.3, 1] }),
    vCount: [3, 7], cCount: [23, 33], vowelPct: [36, 44], wordLen: [2.0, 2.8], complexity: [3, 5],
    onsetMax: 1, codaMax: 2, finalVowel: 0.35, longVowels: 0.5, diphthongs: 0.17,
    stress: { weight: 5, penult: 2 },
    grammar: { // B11 81A: VSO 1, SVO 2, SOV 2 (Amharic, Tigrinya); B12 37A definite affix 3/5, prefixal: gap
      caseOn: 0.35, caseCount: [3, 3], morph: { fusional: 8, agglutinative: 1 },
      order: { VSO: 3, SVO: 3, SOV: 2 }, alignment: { accusative: 1 },
      gender: { two: 9 }, number: { sgpl: 2, dual: 3 }, articles: { definite: 6, none: 2 },
      tone: { none: 1 }, harmony: 0, tam: { simple: 2, standard: 1, rich: 2 },
    },
    special: { templatic: true, brokenPlurals: true }, script: 'arabic', romPrefs: { ʃ: 'sh', ħ: 'ḥ', ʕ: 'ʿ', ʔ: 'ʾ', x: 'kh', ɣ: 'gh', j: 'y', dʒ: 'j', θ: 'th', ð: 'dh', tˤ: 'ṭ', sˤ: 'ṣ', dˤ: 'ḍ', long: 'macron' },
  },

  uralic: {
    name: 'Uralic', blurb: 'Vowel harmony, initial stress, agglutinative with a large locative case system.',
    // Sourced: PHOIBLE presence share x10 over 6 languages (Finnish, Estonian, Hungarian, Saami (Northern), Udmurt, Nenets); references/uralic/notes.md
    consonants: W({ p: [10, 1], t: [10, 1], k: [10, 1], m: [10, 1], n: [10, 1], s: [10, 1], l: [8.3, 1], r: [10, 1], j: [8.3, 1], v: [6.7, 2], h: [6.7, 2], d: [6.7, 2], g: [6.7, 2], b: [6.7, 2], 'ŋ': [5, 2], 'ʃ': [6.7, 2], ts: [6.7, 2], 'nʲ': [3.3, 3], 'lʲ': [3.3, 3], 'tʲ': [3.3, 3], 'ʒ': [1.7, 3], f: [8.3, 1] }),
    vowels: W({ a: [6.7, 2], e: [8.3, 1], i: [10, 1], o: [10, 1], u: [10, 1], y: [5, 2], 'æ': [5, 2], 'ø': [5, 2], 'ɤ': [3.3, 3], 'ɛ': [5, 2] }),
    vCount: [5, 10], cCount: [17, 32], vowelPct: [44, 52], wordLen: [2.2, 3.0], complexity: [1, 3],
    onsetMax: 1, codaMax: 1, codaSet: ['n', 't', 's', 'l', 'r', 'k', 'h'], finalVowel: 0.7, longVowels: 0.5, diphthongs: 0.17,
    diphthongList: ['ai', 'ei', 'oi', 'ui', 'au', 'ou', 'æi', 'øi', 'yi', 'ie', 'uo', 'yø'], finalVowels: { a: 3, æ: 3, e: 3, i: 2, o: 1, ø: 1, u: 1, y: 1 }, affixConsonants: ['n', 's', 't', 'l', 'k', 'h', 'j'],
    stress: { initial: 10 },
    grammar: { // B13 49A: 10+ cases 4, 6-7 cases 2; B14 harmony 2 of 4 (Finnish, Hungarian yes; Estonian, Udmurt no)
      caseOn: 0.98, caseCount: [6, 14], morph: { agglutinative: 9, fusional: 1 },
      order: { SVO: 4, SOV: 4 }, alignment: { accusative: 1 },
      gender: { none: 10 }, number: { sgpl: 6, dual: 1 }, articles: { none: 9 },
      tone: { none: 1 }, harmony: 0.5, tam: { simple: 4, standard: 1 },
    },
    special: { possessiveSuffixes: true, consonantGradation: 0.5 }, script: 'latin', romPrefs: { æ: 'ä', ø: 'ö', y: 'y', j: 'j', ʃ: 'š', ɤ: 'õ', long: 'double' },
  },

  turkic: {
    name: 'Turkic', blurb: 'Strict vowel harmony, verb-final order, long suffix chains, no gender.',
    // Sourced: PHOIBLE presence share x10 over 6 languages (Turkish, Azerbaijani, Uzbek, Kirghiz, Turkmen, Yakut); references/turkic/notes.md
    consonants: W({ p: [10, 1], b: [6.7, 2], t: [10, 1], d: [6.7, 2], k: [8.3, 1], g: [6.7, 2], m: [10, 1], n: [10, 1], s: [8.3, 1], z: [8.3, 1], l: [10, 1], r: [3.3, 3], j: [10, 1], 'ʃ': [10, 1], 'tʃ': [10, 1], 'dʒ': [8.3, 1], q: [3.3, 3], 'ɣ': [1.7, 3], 'χ': [1.7, 3], 'ŋ': [6.7, 2], h: [6.7, 2], v: [5, 2], f: [8.3, 1], 'ʒ': [6.7, 2], ts: [1.7, 3], 'ɾ': [5, 2], x: [5, 2] }),
    vowels: W({ a: [6.7, 2], e: [1.7, 3], i: [6.7, 2], 'ɯ': [6.7, 2], o: [5, 2], 'ø': [3.3, 3], u: [5, 2], y: [6.7, 2], 'ɛ': [8.3, 1] }),
    vCount: [6, 9], cCount: [20, 25], vowelPct: [38, 44], wordLen: [2.0, 2.6], complexity: [2, 3],
    onsetMax: 1, codaMax: 2, finalVowel: 0.4, longVowels: 0.67, diphthongs: 0.0,
    harmonyPairs: { a: 'e', ɯ: 'i', o: 'ø', u: 'y' }, affixConsonants: ['l', 'r', 'n', 'd', 'k', 'm', 's', 'j'], noInitial: ['ɣ', 'ŋ'],
    stress: { final: 9 },
    grammar: { // Sourced check 81A SOV 5/5, harmony 4/5: agree
      caseOn: 0.98, caseCount: [6, 7], morph: { agglutinative: 10 },
      order: { SOV: 10, SVO: 0.3 }, alignment: { accusative: 1 },
      gender: { none: 10 }, number: { sgpl: 1 }, articles: { none: 6, both: 0.5 },
      tone: { none: 1 }, harmony: 0.95, tam: { rich: 3, standard: 2 },
    },
    special: { possessiveSuffixes: true, evidential: true }, script: 'latin', romPrefs: { ʃ: 'ş', tʃ: 'ç', dʒ: 'c', ɯ: 'ı', ø: 'ö', y: 'ü', ɣ: 'ğ', j: 'y', χ: 'x' },
  },

  sinitic: {
    name: 'Sinitic', blurb: 'Monosyllabic, tonal and isolating; classifiers, aspect particles, compounds.',
    // Sourced: PHOIBLE presence share x10 over 6 languages (Mandarin, Cantonese, Hakka, Min (Southern), Wu, Fuzhou); references/sinitic/notes.md
    // tʂ: sources write ʈʂ (Mandarin, share 0.17). [ASSUMPTION] weight 1, tier 3, not in these inventories: tɕ ɕ
    consonants: W({ p: [10, 1], t: [10, 1], k: [8.3, 1], 'pʰ': [10, 1], 'tʰ': [10, 1], 'kʰ': [8.3, 1], m: [8.3, 1], n: [8.3, 1], s: [8.3, 1], l: [8.3, 1], x: [1.7, 3], f: [6.7, 2], ts: [8.3, 1], 'tɕ': [1, 3], 'ɕ': [1, 3], 'tʂ': [1.7, 3], 'ʂ': [1.7, 3], 'ɻ': [1.7, 3], 'ŋ': [8.3, 1], j: [6.7, 2], w: [6.7, 2], h: [6.7, 2], 'ʔ': [5, 2] }),
    vowels: W({ a: [10, 1], i: [10, 1], u: [10, 1], 'ə': [3.3, 3], o: [3.3, 3], y: [5, 2], 'ɔ': [6.7, 2], 'æ': [5, 2] }),
    vCount: [5, 7], cCount: [14, 29], vowelPct: [44, 56], wordLen: [1.0, 1.3], complexity: [2, 4],
    onsetMax: 1, codaMax: 1, codaSet: ['n', 'ŋ'], finalVowel: 0.6, longVowels: 0.0, diphthongs: 0.0,
    diphthongList: ['ai', 'ei', 'au', 'ou', 'ia', 'ie', 'ua', 'uo'],
    stress: { none: 1 },
    grammar: { // B18 13A complex tone 6/6 agrees
      caseOn: 0.0, caseCount: [0, 0], morph: { isolating: 10 },
      order: { SVO: 9, SOV: 1 }, alignment: { accusative: 1 },
      gender: { none: 10 }, number: { none: 9, sgpl: 1 }, articles: { none: 10 },
      tone: { many: 9, two: 1 }, harmony: 0, tam: { simple: 1 },
    },
    special: { classifiers: true, compounding: 0.6 }, script: 'original' /* STYLISTIC: sourced Han 6/6, which the generator cannot render */, romPrefs: { tɕ: 'j', ɕ: 'x', tʂ: 'zh', ʂ: 'sh', ts: 'z', pʰ: 'p', tʰ: 't', kʰ: 'k', p: 'b', t: 'd', k: 'g', x: 'h', j: 'y', ɻ: 'r', ŋ: 'ng', ə: 'e' },
  },

  japonic: {
    name: 'Japonic', blurb: '(C)V(n) syllables, pitch accent, topic particles, strictly head-final.',
    // Sourced: PHOIBLE presence share x10 over 3 languages (Japanese, Miyako (Ogami), Kunigami (Nakijin)); references/japonic/notes.md
    consonants: W({ k: [10, 1], s: [10, 1], t: [10, 1], n: [10, 1], h: [6.7, 2], m: [10, 1], j: [6.7, 2], 'ɾ': [6.7, 2], w: [6.7, 2], g: [6.7, 2], z: [6.7, 2], d: [6.7, 2], b: [6.7, 2], p: [10, 1], 'ʔ': [6.7, 2] }),
    vowels: W({ a: [10, 1], i: [10, 1], u: [3.3, 3], e: [6.7, 2], o: [3.3, 3], 'ɯ': [6.7, 2] }),
    vCount: [5, 5], cCount: [14, 21], vowelPct: [50, 56], wordLen: [2.5, 3.3], complexity: [1, 2],
    onsetMax: 1, codaMax: 1, codaSet: ['n'], finalVowel: 0.85, longVowels: 0.33, diphthongs: 0.0,
    diphthongList: ['ai', 'oi', 'ui'], vowelInitial: 0.15, affixConsonants: ['m', 's', 't', 'n', 'k', 'r'],
    // [ASSUMPTION] Japanese-style allophony: si -> shi, ti -> chi, tu -> tsu, hu -> fu, zi/di -> ji, du -> zu, no yi / wu
    allophones: [['s', 'i', 'ʃ'], ['t', 'i', 'tʃ'], ['t', 'u', 'ts'], ['h', 'u', 'ɸ'], ['z', 'i', 'dʒ'], ['d', 'i', 'dʒ'], ['d', 'u', 'z'], ['j', 'ie', ''], ['w', 'uoie', '']],
    stress: { pitch: 1 },
    grammar: { // B15 49A: Japanese 8-9 (counts particles)
      caseOn: 0.9, caseCount: [5, 9], morph: { agglutinative: 9 },
      order: { SOV: 10 }, alignment: { accusative: 1 },
      gender: { none: 10 }, number: { none: 6, sgpl: 1 }, articles: { none: 10 },
      tone: { none: 8, two: 1 }, harmony: 0, tam: { simple: 3, standard: 1 },
    },
    special: { caseAsParticles: true, topicMarker: true, politeness: true }, script: 'original' /* STYLISTIC: sourced Kana 4/4, which the generator cannot render */, romPrefs: { ɾ: 'r', ʃ: 'sh', tʃ: 'ch', ts: 'ts', dʒ: 'j', ɸ: 'f', j: 'y', long: 'macron' },
  },

  bantu: {
    name: 'Bantu', blurb: 'Noun-class prefixes, prenasalised stops, open syllables, tone, agglutinative verbs.',
    // Sourced: PHOIBLE presence share x10 over 6 languages (Swahili, Zulu, Shona, Kinyarwanda, Lingala, Xhosa); references/bantu/notes.md
    // ᵐb ⁿd ᵑɡ: only the Zulu/Xhosa prenasal series is listed as unit segments (share 0.17); other inventories treat NC as clusters. [ASSUMPTION] weight 1, tier 3: ɾ
    consonants: W({ p: [10, 1], b: [5, 2], t: [10, 1], d: [5, 2], k: [10, 1], g: [3.3, 3], m: [10, 1], n: [10, 1], s: [10, 1], z: [8.3, 1], l: [6.7, 2], j: [10, 1], w: [10, 1], 'ᵐb': [1.7, 3], 'ⁿd': [1.7, 3], 'ᵑɡ': [1.7, 3], 'tʃ': [6.7, 2], 'ɲ': [8.3, 1], f: [10, 1], v: [6.7, 2], 'ʃ': [8.3, 1], 'ŋ': [8.3, 1], h: [8.3, 1], 'ɾ': [1, 3], 'dʒ': [5, 2], 'ɓ': [6.7, 2], 'ɗ': [5, 2], 'pʰ': [5, 2], 'kʰ': [5, 2], r: [5, 2], 'ɬ': [5, 2] }),
    vowels: W({ a: [8.3, 1], i: [10, 1], u: [10, 1], e: [8.3, 1], o: [8.3, 1], 'ɛ': [5, 2], 'ɔ': [5, 2] }),
    vCount: [5, 7], cCount: [15, 39], vowelPct: [48, 56], wordLen: [2.5, 3.3], complexity: [2, 3],
    onsetMax: 1, codaMax: 0, finalVowel: 1, longVowels: 0.17, diphthongs: 0.0,
    toneSpelling: 'none', vowelInitial: 0.1, finalVowels: { a: 5, i: 2, u: 1.5, o: 1, e: 1.5 }, affixConsonants: ['m', 'n', 'k', 'l', 't', 'w'],
    stress: { penult: 8 },
    grammar: { // B16 13A: none 1 (Swahili), simple 1; agrees
      caseOn: 0.05, caseCount: [2, 3], morph: { agglutinative: 10 },
      order: { SVO: 10 }, alignment: { accusative: 1 },
      gender: { classes: 10 }, number: { sgpl: 1 }, articles: { none: 10 },
      tone: { two: 7, none: 2 }, harmony: 0.1, tam: { rich: 6 },
    },
    special: { nounClasses: true }, script: 'latin', romPrefs: { ᵐb: 'mb', ⁿd: 'nd', ᵑɡ: 'ng', ɲ: 'ny', tʃ: 'ch', ʃ: 'sh', j: 'y', dʒ: 'j' },
  },

  polynesian: {
    name: 'Polynesian', blurb: 'Tiny inventory, only open syllables, long vowels, verb-initial with particles.',
    // Sourced: PHOIBLE presence share x10 over 3 languages (Maori, Hawaiian, Tongan); references/polynesian/notes.md
    consonants: W({ p: [10, 1], t: [6.7, 2], k: [10, 1], m: [10, 1], n: [10, 1], 'ŋ': [6.7, 2], f: [6.7, 2], v: [3.3, 3], h: [10, 1], l: [3.3, 3], 'ɾ': [3.3, 3], 'ʔ': [6.7, 2], w: [6.7, 2], s: [6.7, 2] }),
    vowels: W({ a: [6.7, 2], e: [6.7, 2], i: [10, 1], o: [10, 1], u: [10, 1], 'ɛ': [6.7, 2] }),
    vCount: [5, 5], cCount: [9, 12], vowelPct: [53, 61], wordLen: [2.3, 3.2], complexity: [1, 1],
    onsetMax: 1, codaMax: 0, finalVowel: 1, longVowels: 0.67, diphthongs: 0.0,
    diphthongList: ['ai', 'ae', 'ao', 'au', 'ei', 'oi', 'ou'], vowelInitial: 0.25, finalVowels: { a: 4, o: 3, i: 2, e: 2, u: 0.5 },
    stress: { penult: 9 },
    grammar: { // B17 98A: accusative 1, neutral 1, no ergative coded
      caseOn: 0.2, caseCount: [2, 3], morph: { isolating: 9, agglutinative: 1 },
      order: { VSO: 8, VOS: 2, SVO: 1 }, alignment: { accusative: 3, ergative: 1 },
      gender: { none: 10 }, number: { sgpl: 2, dual: 4 }, articles: { both: 6, definite: 2 },
      tone: { none: 1 }, harmony: 0, tam: { simple: 2, standard: 2 },
    },
    special: { reduplication: true, inclusiveExclusive: true }, script: 'latin', romPrefs: { ŋ: 'ng', ʔ: 'ʻ', ɾ: 'r' },
  },
};

export const FAMILY_ORDER = ['original', 'romance', 'slavic', 'germanic', 'hellenic', 'celtic', 'indoaryan', 'semitic', 'uralic', 'turkic', 'sinitic', 'japonic', 'bantu', 'polynesian'];
