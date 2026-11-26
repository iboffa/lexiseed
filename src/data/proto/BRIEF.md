# Brief for proto-lexicon data files

Lexiseed is a conlang generator: a family's words are produced by evolving
real proto-language forms through seeded sound changes, so a "Romance" language sounds like a sister of Spanish/Italian.
You compile the source data for one or more proto-languages. Do not edit any other file in the project.

## What to produce
One file per proto-language: `src/data/proto/<id>.js` (ids are given in your task), an ES module:

```js
// <Language name>: proto/ancestor lexicon for the <family> family.
// Sources: see `sources`. Forms are facts collected from the cited pages; spelling converted to the project's segments.
export default {
  id: 'latin', family: 'romance', name: 'Latin (Vulgar/Late Latin forms)',
  sources: [ { url: 'https://en.wiktionary.org/wiki/Appendix:Latin_Swadesh_list', licence: 'CC BY-SA 4.0', use: 'reference' } ],
  // gloss -> entry. Glosses EXACTLY as in src/data/meanings.js (e.g. 'love.v', 'fear.v').
  words: {
    water: { f: 'a k w a', s: 0, src: 0, note: 'aqua (acc. aquam)' },
    see:   { f: 'w i d eː', s: 1, src: 0, note: 'vidēre, present stem' },
  },
  gaps: ['library', 'school'],          // meanings with no attested ancestor word (they will be derived/coined)
  affixes: { ... },                      // see below
  daughters: { Spanish: { water: 'a ɣ w a', ... }, Italian: { ... } }, // validation set, see below
  notes: ['...'],
};
```

Rules for `f` (form):
- Space-separated segments, using ONLY these symbols (from src/data/phonemes.js):
  `p b t d k g q ʔ ʈ ɖ c ɟ pʰ tʰ kʰ bʱ dʱ ɡʱ tʼ kʼ tˤ dˤ sˤ tʲ dʲ ᵐb ⁿd ᵑɡ ts dz tʃ dʒ tɕ dʑ tʂ tɬ ɸ f v β θ ð s z ʃ ʒ ɕ ʑ ʂ ç x ɣ χ ʁ ħ ʕ h ɬ sʲ m n ɲ ŋ ɳ nʲ l ʎ lʲ ɫ r ɾ rʲ ɻ j w`
  vowels `i y ɨ ɯ u e ø ə o ɤ ɛ ɔ æ a ɑ`; a long vowel is the vowel + `ː` as ONE segment (`aː`);
  a tone is a digit 1–4 appended to the vowel of the syllable as one segment (`a1`, `aː2`; only for tonal ancestors).
  Nasal vowels: write vowel + `n` (no nasal-vowel symbols). Syllabic resonants (Proto-Slavic jers, Sanskrit ṛ): use `ə`/`ɨ`/`r` + vowel as you judge, and say so in `notes`.
  If a sound is truly missing (e.g. a laryngeal), use the nearest symbol and list the substitution in `notes`.
- Give the form the daughters actually inherited: e.g. Latin nouns as the accusative minus final -m (aquam → `a k w a`, panem → `p a n e`, caballum → `k a b a l l u`); verbs as the present stem with its thematic vowel (cantāre → `k a n t aː`, vidēre → `w i d eː`, dormīre → `d o r m iː`). Proto-Slavic/Germanic/Celtic/Uralic/Turkic/Bantu/Polynesian nouns: the citation form with its stem vowel or ending (e.g. PGmc *wulfaz → `w u l f a z`). Bantu: the bare stem WITHOUT the class prefix, plus `cls: <class number>`.
- Geminates: repeat the segment (`l l`).
- `s` = index of the stressed (or accented) syllable counting from 0 at the start, when known (Latin: compute by the penultimate rule; Ancient Greek/Sanskrit: the attested accent). Omit when not known.
- Prefer the most-reconstructed/most-attested core word. Where Vulgar Latin differs from Classical in what daughters inherited (e.g. 'horse' caballus not equus, 'head' testa/caput, 'eat' manducare/comedere, 'speak' fabulare/parabolare), give the inherited one and put the other in `note`.
- Cover as many of the 260 meanings as honestly possible (see src/data/meanings.js; read it). Aim for 180+ for Latin/Greek/Sanskrit/Arabic/Germanic/Slavic, as many as reconstructions support for the others. NEVER invent a reconstruction: put unknown meanings in `gaps`. A later attested word (e.g. Old Church Slavonic, Old Japanese, Old Irish, Classical Arabic) is acceptable when no reconstruction exists; say so in `note`.
- Numerals 1–10, 'hundred', 'thousand' where they exist; 11, 12, 20 may be gaps if they are compounds.
- Function words (and, or, but, if, because, yes, no, who, what, where, when, why, how, this, that, here, there, now, today, tomorrow, yesterday, always, never, again, very): give them where attested.

`affixes` (give what the ancestor actually had; skip what it lacks):
```js
affixes: {
  case: { NOM: { sg: 'u s', pl: 'iː' }, ACC: { sg: 'u m', pl: 'oː s' }, GEN: {...}, DAT: {...}, ABL: {...}, LOC: {...}, INS: {...}, VOC: {...} }, // ONE representative declension (the most common, e.g. Latin 2nd, PSl o-stem, PGmc a-stem); endings only
  caseAlt: { ... },          // optional second declension (e.g. Latin 1st -a), same shape, key `theme`: 'a'
  plural: 'iː',              // if plural is a plain suffix (Uralic, Turkic: 'l a r'), or omit
  person: { PRS: { '1SG': 'oː', '2SG': 's', '3SG': 't', '1PL': 'm u s', '2PL': 't i s', '3PL': 'n t' }, PST: {...} }, // verb endings attached to the stem
  infinitive: 'r e',
  article: { def: '...', indef: '...' },          // e.g. Latin ille/illa (source of Romance articles) → 'i l l u', 'u n u'
  demonstratives: { this: '...', that: '...' },
  pronouns: { '1SG': 'e g o', '2SG': 't uː', '3SG': 'i l l e', '1PL': 'n oː s', '2PL': 'w oː s', '3PL': 'i l l iː' },
  adpositions: { location: 'i n', goal: 'a d', source: 'd eː', instrument: 'k u m', companion: 'k u m', recipient: 'a d', possessor: 'd eː' },
  negation: 'n o n', copula: { PRS: { '3SG': 'e s t' } },
  classPrefixes: { 1: 'm u', 2: 'b a', ... },     // Bantu only
}
```

`daughters`: a validation set of about 40 meanings (common nouns, verbs, adjectives, numerals) in 2–3 real
descendant languages, in the same segment notation, broad phonemic transcription (e.g. Spanish agua `a ɣ w a`,
Italian acqua `a k k w a`, French eau `o`). These are used to test that the simulated sound changes resemble real ones.

`sources`: every page you used, with its licence as stated on the site (Wiktionary: CC BY-SA 4.0). Primary sources:
Wiktionary Swadesh appendices (e.g. https://en.wiktionary.org/wiki/Appendix:Latin_Swadesh_list,
Appendix:Proto-Slavic_Swadesh_list, Appendix:Proto-Germanic_Swadesh_list ...), Wiktionary Reconstruction: pages and
category pages, and other open reference pages. Fetch them; do not rely on memory alone where a page exists.
Check: `node -e "import('./src/data/proto/<id>.js').then(m=>console.log(Object.keys(m.default.words).length))"`
must run, and every segment in every form must be in the symbol list above (write a quick check).

Report back: the file path(s), the count of words / gaps, and anything uncertain.
