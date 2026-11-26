# Conlang generator: domain brief

A generator is a function of **(controls, seed, version)**. Each control can be pinned by the user or left on
**Auto**. When it is on Auto, the seed picks a value from the range typical of the chosen family. The same
(controls, seed, version) always rebuilds the same language.

Items marked **[ASSUMPTION]** are the generator author's linguistic defaults and are not your rules. Confirm,
change or drop them. All of them live in `src/data/families.js`, `src/data/cases.js` and `src/data/scripts.js`,
so you can edit them without touching the engine.

## 1. Content and structure

A language consists of:

1. **Phonology:** a consonant and vowel inventory, syllable templates, cluster rules, stress, and optional tone
   and vowel harmony.
2. **History:** proto-forms passed through an ordered sound-change cascade (2–5 rules). This produces irregular
   forms and "marks of history".
3. **Lexicon:** 413 meanings (a Swadesh-like core, everyday content words and productive compounds), some of them derived from
   others (agent nouns, places, compounds; root and pattern for Semitic).
4. **Morphology:** a noun paradigm (cases × numbers, by declension class/gender), a verb paradigm (person ×
   number × tense/aspect), pronouns, articles and adjective agreement.
5. **Syntax:** basic order, head direction (adpositions, genitive, adjectives), questions, negation and
   relative clauses.
6. **Orthography:** romanization, IPA, a real script or a procedurally generated original script.
7. **Presentation:** a showcase, a grammar book and a vocabulary.

## 2. Controls (user inputs)

| Control | Range | Auto picks from |
|---|---|---|
| Parent family | Original, Romance/Latin, Slavic, Germanic, Hellenic, Celtic, Indo-Aryan, Semitic, Uralic, Turkic, Sinitic, Japonic, Bantu, Polynesian | (none: user choice; default Original) |
| Vowel percentage | 25–65 % of segments | family range |
| Average word length | 1.0–4.0 syllables (root words) | family range |
| Phoneme complexity | 1–5 (inventory size, marked sounds, cluster size) | family range |
| Case system | on/off; number of cases 2–14 | family |
| Morphological type | agglutinative (yes) / fusional (no) / isolating | family |
| Word order | SOV SVO VSO VOS OVS OSV | family |
| *Suggested:* alignment | nominative–accusative / ergative–absolutive | family (mostly nom–acc) |
| *Suggested:* grammatical gender | none / animacy / 2 / 3 / noun classes (Bantu-style, 6) | family |
| *Suggested:* number | sg–pl / sg–du–pl / none | family |
| *Suggested:* articles | none / definite / definite + indefinite | family |
| *Suggested:* tone | none / 2 / 3–4 tones | family |
| *Suggested:* vowel harmony | on/off | family |
| *Suggested:* tense–aspect | simple (past/non-past) / standard (past/present/future) / rich (+ perfective/imperfective) | family |
| *Suggested:* pro-drop | on/off | derived from verb agreement plus the seed |
| Script | Latin, IPA, Cyrillic, Greek, Georgian, Armenian, Runic, Arabic, Hebrew, Original | family default |
| Original script type | alphabet / abjad / abugida / syllabary | seed |

**What the seed decides when the controls leave it open:** which phonemes, their frequencies, syllable
template weights, cluster rules, stress, the sound-change cascade, every root, the case and number endings,
declension classes, pronouns, verb endings, articles, derivational affixes, the numeral base (10 / 20 / 12),
the language name, the glyph shapes and the style of the original script, the romanization choices (digraphs
vs diacritics), and the sample text.

**Locality (one random stream per subsystem):** `phonology`, `phonotactics`, `history`, `lexicon:<meaning>`,
`morphology`, `cases`, `verbs`, `syntax`, `script`, `name`. Changing the word order does not change the
vocabulary. Changing the case count does not change the roots.

## 3. Hard rules (always hold)

- Every word is pronounceable under the language's own phonotactics: no illegal clusters and at least one vowel
  (or a syllabic nucleus) per syllable.
- No two lexical meanings share a form (homophones are rejected and regenerated, with a retry cap; the number of
  rejections is reported).
- Within one paradigm, the endings for different cells are distinct, except for syncretisms the generator chose
  deliberately and labelled.
- Every case in the language is shown in at least one example sentence.
- Original script: glyphs are pairwise distinct (stroke-set distance above a threshold, retry cap).
- Contradictory controls (for example vowel % = 25 with complexity 1, which allows no clusters) are reported as a
  warning with the measured value. They are not silently broken.

## 4. Soft preferences

- The measured vowel % and the mean word length land near the targets (the UI shows target vs measured).
- Frequent and basic words are shorter (pronouns, "water", "eye"), and derived words are longer.
- Grammatical affixes are short (1 syllable or less).

## 5. Linguistic defaults [ASSUMPTION]

- **Case hierarchy** (which cases a language with *n* cases gets, after Blake 1994): core
  (NOM/ACC or ABS/ERG) → GEN → DAT → LOC → ABL / INS → COM → VOC → ALL → ESS / PART → TRANS → ABE.
  Uralic-style languages with many cases split LOC into inessive / elative / illative / adessive / ablative /
  allative.
- **Head direction** follows the verb–object order (Greenberg-style tendencies): OV → postpositions, GEN–N; VO →
  prepositions, N–GEN. Adjective position: the seed picks, with a 70 % chance of following the genitive's
  side.
- **Family profiles:** the phoneme pools, syllable shapes and grammar defaults per family are author
  approximations meant to evoke the family's sound. They are not reconstructions of real languages. The
  vocabulary is generated and never copied from real languages.
- **Script mappings:** each phoneme maps to the nearest letter of the chosen script. Sounds with no letter use a
  diacritic or a digraph. Arabic and Hebrew are written as abjads (short vowels omitted, long vowels written
  with matres lectionis).

## 6. What "different" means to the audience

From most to least visible: the look of words on the page (letters and diacritics, length, clusters), the
script, the sound of the sample text, the grammar's headline features (cases, order, gender), and the details of
the paradigms. Two seeds of the same family should feel like **sister languages**, and two families should be
recognisably different.

## 7. Evaluation

`node tools/evaluate.mjs` runs the generator over many seeds and control settings. It reports measured vowel %
and word length against the targets, homophone rejections, paradigm collisions, glyph collisions, failures,
time per language, and the lexical similarity of languages within and across families.

## 8. Version 2 additions

### Real ancestors (descent)
- Family languages now descend from a real ancestor: Latin, Ancient Greek, Proto-Slavic, Proto-Germanic, Proto-Celtic,
  Sanskrit, Proto-Semitic, Middle Chinese, Proto-Japonic, Proto-Bantu, Proto-Polynesian, Proto-Uralic and Proto-Turkic. (Uralic and Turkic were added last; their
  data has fewer entries.) The word lists are in `src/data/proto/*.js`, each with its `sources` (mostly Wiktionary
  Swadesh appendices and Reconstruction pages, CC BY-SA 4.0, used as reference data) and `notes` on conventions.
  **[ASSUMPTION]** Entries marked "not individually fetched" in a file's sources were written from the compiling
  agent's knowledge and should be spot-checked.
- Sound histories are in `src/data/changes.js`: ordered steps with options, written as `A > B / L _ R` rules.
  Each family has "anchor" daughters (Spanish, Italian, French...); the seed picks an anchor and follows its options
  with probability 0.8 and otherwise skips that change, so every history is one real lineage (never a mix of daughters).
  **[ASSUMPTION]** The rules are simplified versions of textbook changes written from the author's knowledge.
- Hard rule: the anchor path run on the ancestor must be closer to the real daughter than the unchanged ancestor is
  (evaluation section 7). Homophones created by sound change are resolved by one word escaping a change, or else by
  replacing the word with a new coinage (as real languages do); both are recorded in the vocabulary notes.
- Meanings the ancestor lacks are derived from inherited words, or coined with a syllable model of the ancestor and
  then evolved, so they sound native. Live-translation coinages use the same model.
- Controls: **ancestry** (real / invented), **distance from the parent** (0 = the ancestor itself, 80 = as far as a
  real daughter, above 80 = extra common sound changes of its own). Vowel % and word length become targets for a
  search among 14 seeded histories, and are reported as measured. Tone comes from the ancestor (Middle Chinese).

### Peculiar grammar (quirks)
- `src/quirks.js`: dative / locative / existential possession (no verb "have"), zero copula, two verbs "be",
  differential object marking, double and two-part negation, polite "you", adjectives as verbs, alienable /
  inalienable possession, construct state, definite conjugation, reduplication, noun incorporation, serial verbs,
  honorifics. **[ASSUMPTION]** family weights are the author's choice. Control: none / a few / many.
- Hard rule: every chosen quirk changes sentence building and has a grammar-book section with an example that uses it.

### Original scripts
- `src/glyphs.js`: eight design systems (featural blocks, capitals, rounded, runic, brush syllabary, turned-shape
  syllabary, head-line abugida, joined dotted abjad), each a construction grammar on typographic metrics.
  **[ASSUMPTION]** they imitate construction principles of Hangul, Latin/Greek capitals, Georgian, runes, kana, Cree
  syllabics, Devanagari and Arabic, never their glyphs.
- Hard rules: every phoneme has a glyph; glyph distinctness is measured on rasterised bitmaps (blurred IoU),
  not on stroke lists; near-duplicates (IoU > 0.92) are counted as collisions.
- v2.1: style and type are independent. Each of the 8 styles has a *hand* (draws one distinct sign); styles without a tailored builder for the chosen type use generic alphabet/abjad, syllabary or abugida builders (e.g. a rounded, Georgian-like syllabary). Hands with few distinct shapes (brahmic, cursive, runic, blocks, geometric) build syllabaries the Ge'ez way: one base shape per consonant plus a vowel mark in a fixed place; their distinctness check is structural (distinct bases, one mark place per vowel).
- Script lineages [ASSUMPTION]: a lineage = base style + 1–3 scribal habits (angular, round, serif, wedge, hook, head line, baseline joins, narrow, wide, back slant) + pen. Each parent family has 3 lineages; a seed picks one, then may drop or gain one habit, so sister languages get recognisably related scripts. Invented languages found their own lineage. A pinned style keeps the lineage's habits.

### Secondary influence (contact)
- Optional controls `influence` (none or any family with a real ancestor, including the recipient's own family, in which case a sister branch is the donor) and `influenceLevel` (light/heavy). Real ancestry only. Default none leaves output byte-identical.
- The donor is a seeded path through its family's history (drift 55–80, so an "early" daughter). Contact happens at a seeded step (35–75%) of the recipient's history.
- Loans are chosen by basicness (tier 1 rare, tier 3 common, ancestor gaps most likely); pronouns, numerals and function words are never borrowed. They are mapped to the nearest recipient sound of that time, unattested clusters and finals get the epenthetic vowel, doubled consonants are simplified, then the recipient's later sound changes apply. Heavy contact keeps up to two frequent foreign sounds.
- Grammar is not borrowed (yet). The descent-distance evaluation (section 7) compares inherited cognates only, so influence does not change it; section 8 checks influenced languages.

### Speech
- `src/speech.js`: a formant synthesiser written for this project (no external voices or services). It reads IPA
  (stress, length, tone letters). Version 2 adds a smooth phrase pitch contour (declination, accent peaks, final fall or
  question rise), jitter and shimmer, an LF-like source with breath noise and loudness-dependent tilt, context-based
  durations, no pauses between words, and a small room. Optional: a system voice installed on the device (local
  voices only) reads a Spanish-style respelling. **[ASSUMPTION]** the respelling table is the author's choice. **[ASSUMPTION]** formant tables are textbook averages; the output was checked by
  spectrum (vowel formant bands, fricative noise bands), not by ear.
- Default engine (v2.1 UI): neural, Kokoro-82M through kokoro-js, loaded on the first ▶ (about 92 MB, cached by the browser). IPA goes straight to its 115-symbol vocabulary; missing sounds use the nearest symbol (src/kokoro.js). Voice choice is outside generation (no effect on output or VERSION): Adaptive blends the style vectors of the 2–3 training languages (it, es, pt, fr, hi, ja, zh, en) whose characteristic sounds best match the language; tonal languages get a Mandarin-led blend. Blending pulls the accent toward a mix but cannot remove the model's bias toward its 8 languages. With WebGPU it runs the fp32 model (~325 MB; fp16 was tried and sounded clearly worse) at about 3× faster than real time (first sound of a 21 s story after 1.2 s, played phrase by phrase while the rest renders); without a GPU, or if the GPU output fails a warm-up check, it uses the CPU q8 model (~92 MB) at about 2× slower than real time. Audio is cached per (IPA, blend, speed), a ▶ under the pointer is rendered ahead, and a browser that has loaded the model before warms it up in the background. The built-in synthesiser stays as the exact-IPA fallback.

### Translation
- `src/translate.js`: rule-based English parser for simple clauses -> clause spec -> the same sentence builder.
  Unknown words are coined deterministically from (seed, word) and kept per language in the browser.


## 9. Family blends and grammatical choices (version 3)

- The requested examples are Maltese and Tagalog, where vocabulary can show several periods of contact.
  The parent supplies the grammatical profile. Each donor supplies an independently chosen share of
  the dictionary's 302 noun, verb and adjective meanings without a derivation recipe. Function words,
  compound words and other potential derivatives sit outside this denominator.
- **[ASSUMPTION]** A model history spans 3,000 years. A donor can lend words from its contact start
  through the present. Sound-change stages are evenly spaced. A present-day loan undergoes adoption
  into the recipient's sound system at the time of borrowing. Older loans can undergo subsequent changes.
  Donor families use the project's existing ancestor dictionaries and sound histories. Coined donor
  forms fill gaps and are identified in the vocabulary. Shares are rounded to whole roots.
- The 17 existing notable features can each be on, off or automatic. Compatible automatic morphology
  follows a pin. The generator reports conflicts between explicit choices.
- **[ASSUMPTION]** Irregularity is a target percentage of dictionary verbs with an exceptional form,
  rounded to the nearest verb. It also biases exceptional pronoun case forms and broken plurals
  where the morphology supports them. Comparative and superlative strategies are independent.
  Each can use a particle, prefix, suffix or an unmarked adjective.
- Words such as football and basketball must contain their shared head. The local head order determines
  which end it occupies. The constituent entries are generated first and may themselves be borrowed.
  Common coinages, articles and pronouns favour short forms with simple syllable edges. Inherited forms
  retain the results of their own sound histories.
- Reference-only examples, with no text or lexical assets imported, include the morphological account
  of Maltese lexical strata and the study of Spanish and English borrowing into Tagalog.
  [Maltese lexical strata](https://doi.org/10.16995/glossa.6556) · [Borrowings in Tagalog/Filipino](https://www.academia.edu/31961925/Baklanova_Ekaterina_Types_of_Borrowings_in_Tagalog_Filipino_Kritika_Kultura_No_28_February_2017_Quezon_City_Ateneo_de_Manila_University_Press_Pp_35_54)
