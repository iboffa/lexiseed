# Lexiseed

[Try Lexiseed in your browser](https://iboffa.github.io/lexiseed/)

A procedural generator of constructed languages. Choose a parent family and a few sliders, and each seed produces a
complete language: a phonology, a sound history, a script, a grammar, and a vocabulary of 413 built-in meanings, plus pronouns and articles. It is presented
as a **showcase**, a **grammar book** and a searchable **vocabulary**, with live **translation** from English and
a built-in **IPA reader** (▶ buttons).

## Family blends, grammar and vocabulary in version 3

Choose a parent under **Language families**, then select **Add family influence** for each donor.
Set each donor's share of the 302 root meanings and the year when contact began, measured back
from the present. The parent receives the balance. Editing the parent's percentage redistributes
the other shares proportionally. For example, try a Semitic parent at 55%, Romance at 35% starting
900 years ago, and Germanic at 10% starting 20 years ago. The grammar book lists the resulting
loan counts, and the dictionary records when individual words entered the language.

Under **More grammar**, set the share of irregular verbs, choose how to form comparatives and
superlatives independently, and turn any of the 17 individual features on or off. Auto fills
the remaining choices. Try translating “The house is bigger than the tree” to hear the result.

Search **Vocabulary** for “ball” to see football, basketball, handball and their shared stem.
Search also matches the English names of a word's components. Copy a link or download the
recipe to keep the blend, grammar choices and word origins.

## Version 2 features

- **Real ancestors.** Family languages descend from real Latin, Ancient Greek, Proto-Slavic, Proto-Germanic,
  Proto-Celtic, Sanskrit, Proto-Semitic, Middle Chinese, Proto-Japonic, Proto-Bantu and Proto-Polynesian words,
  evolved through the family's real sound changes (seeded paths modelled on Spanish, Italian, French, Russian,
  Polish, German, English, Irish, Welsh, Hindi, Arabic, Hebrew, Mandarin, Cantonese, Japanese, Swahili, Hawaiian...).
  A **distance from the parent** slider runs from the ancestor itself (0) to a real-daughter distance (80) and
  beyond.
- **Peculiar grammar**: possession without "have", dropped "be", two verbs "be", marked animate objects, double
  negation, polite "you", honorifics, construct state, adjectives as verbs, and more. Each is used in the sentences
  and explained in the grammar book.
- **Original scripts** built like real ones: Hangul-like featural blocks, Latin-like capitals, Georgian-like
  rounded letters, runes, kana-like brush syllabaries, Cree-like turned shapes, Devanagari-like head-line abugidas,
  Arabic-like joined abjads with dots.
- **Translate** tab: type English; unknown words are coined on the fly and added to the vocabulary.
- **IPA reader**: a speech synthesiser written for this page reads any IPA exactly (smooth intonation, natural timing,
  breathy voice source, a small room; low, high and child voices). Optionally, a Spanish, Italian or Portuguese voice
  installed on your device reads a Spanish-style respelling: more natural, but approximate (no tones, foreign sounds
  approximated). A sample of the built-in voice is in `eval/voice-sample.wav`.

## Run it

ES modules do not load from `file://`, so serve the folder:

```bash
node tools/serve.mjs
```

Then open http://localhost:8765. Any static server works; `python3 -m http.server 8765` does too, but it lets the
browser cache modules while you edit.

## Controls

Every control can be pinned or left on **Auto**. On Auto, the seed picks a value from the range typical of the
chosen family.

| Group | Control |
|---|---|
| Seed | any text; *New seed* proposes one |
| Family | Original (no parent), Romance/Latin, Slavic, Germanic, Hellenic, Celtic, Indo-Aryan, Semitic, Uralic, Turkic, Sinitic, Japonic, Bantu, Polynesian |
| Family blend | donor percentages and contact start dates, from today back to 3,000 years ago |
| Sounds | vowel percentage, average word length (syllables), phoneme complexity (1–5), tone, vowel harmony |
| Grammar | case system on/off and number of cases (2–14), agglutination (agglutinative / fusional / isolating), word order (all six) |
| More grammar | alignment (accusative / ergative), gender (none, animacy, 2, 3, Bantu-style noun classes), number (with dual), articles, tense and aspect, individual features, irregularity, comparative and superlative strategies |
| Writing | Latin romanization, IPA, Cyrillic, Greek, Georgian, Armenian, Runic, Arabic, Hebrew, Devanagari, or an **original generated script** (alphabet, abjad, abugida or syllabary) |

Vowel percentage and word length are *targets*. The generator calibrates its syllable shapes until the generated
vocabulary hits them, and shows the measured value under each slider. When two controls conflict (for example 25%
vowels with complexity 2, which allows almost no clusters), it says so instead of failing silently.

## What the seed decides

These choices come from the seed:

- **Sounds:** the inventory, phoneme frequencies, permitted clusters, codas, stress, and the hiatus and epenthesis
  rules.
- **History:** a 2–5 step sound-change cascade, which creates irregular forms and proto-form etymologies.
- **Words:** every root, case ending, declension and conjugation class, pronoun, article, and derivational affix.
- **Grammar details:** strong verbs and broken plurals, the numeral base (10, 20 or 12), adjective, genitive and
  numeral order, and the negation and question strategies.
- **Name and spelling:** the language name and the romanization style.
- **Original script:** glyph shapes and the stroke style.

Each subsystem uses its own random stream. Changing the word order or the number of cases therefore does not
reshuffle the vocabulary. Only compounds, whose element order follows head direction, change.

## Files

| Path | What |
|---|---|
| `generator-brief.md` | the domain brief: controls, hard rules, and every linguistic **assumption** to confirm or change |
| `src/data/families.js` | family profiles: phoneme pools, ranges, grammar weights, preferred script (edit freely) |
| `src/data/cases.js`, `meanings.js`, `phonemes.js` | case hierarchy, the meaning list, segment features and romanizations |
| `src/language.js` | `generate(controls, seed)`: the pure generator (no DOM, runs in Node) |
| `src/phonology.js`, `history.js`, `morphology.js`, `lexicon.js`, `syntax.js`, `scripts.js` | the subsystems |
| `src/render.js`, `src/app.js`, `index.html`, `css/style.css` | the interface |
| `src/data/proto/*.js`, `src/data/changes.js` | ancestor word lists (with sources) and the families' sound histories |
| `src/evolve.js`, `src/history2.js`, `src/descent.js` | sound-change engine, path choice, descent lexicon and grammar |
| `src/kokoro.js`, `eval/voice-test.html` | default neural voice: Kokoro-82M via kokoro-js, IPA mapped to its symbols, model downloaded on the first ▶ (GPU fp32 ≈325 MB, or CPU q8 ≈92 MB), streamed phrase by phrase; speakers of its 8 training languages are blended to match each language's sounds (Adaptive) or all equally (Neutral). The test page compares it with the built-in voice |
| `src/influence.js` | loan allocation by family share and contact date, donor forms, adaptation and subsequent sound changes |
| `src/quirks.js` | peculiar grammatical features |
| `src/glyphs.js` | original script design systems |
| `src/speech.js` | IPA speech synthesiser |
| `src/translate.js` | English to conlang translation |
| `tools/evaluate.mjs` | expressive-range evaluation (see below) |
| `tools/script-sheet.mjs` | contact sheet of original scripts: every style × type, sister-language lineages, sample charts (`eval/scripts.html`) |

## Evaluation

```bash
node tools/evaluate.mjs 40
node tools/language-controls-tests.mjs
```

The script runs 40 seeds for each of the 14 families. It reports:

- determinism and locality;
- generation time;
- homophones and unplanned paradigm collisions (hard rules);
- measured vowel % and word length against their targets, per family;
- slider sweeps;
- whether sister languages look more alike than languages of different families.

It writes `eval/results.csv` (and the full text report to `eval/report.txt`). Last run, 560 languages (version 2):

- 0 failures and 0 homophones. When sound change merged two inherited words, one was replaced by a new word, as
  real languages do (about 4 per language, noted in the vocabulary).
- 1 language has one case form that is identical to another case form (an unplanned syncretism).
- Pinned word order was respected in 504 of 504 checks; 40,040 of 40,040 word renderings across 11 scripts were clean.
- 0 near-duplicate glyphs in original scripts (raster check).
- Generation takes 5 ms per language (median).
- The bigram distance is 0.32 within a family and 0.70 across families.
- **Real daughters** (section 7): each anchor path is run on the real ancestor and compared with the real language
  (normalised edit distance, lower is closer; in brackets, the unchanged ancestor). Examples:
  - Spanish 0.07 (0.42), Italian 0.10 (0.31), Modern Greek 0.11 (0.28), Turkish 0.10 (0.25), Arabic 0.13 (0.23);
  - Hawaiian 0.04 (0.29), Japanese 0.21 (0.42), Finnish 0.25 (0.38), Serbo-Croatian 0.19 (0.37);
  - weakest: English 0.48 (0.59), Mandarin 0.53 (0.64), Irish 0.46 (0.64).
- **Distance slider**: mean distance of inherited words from the ancestor rises 0.00, 0.09, 0.19, 0.24, 0.30,
  0.35 for slider values 0, 20, 40, 60, 80, 100.
- **Secondary influence** (section 8): every recipient × donor pair, light and heavy, 2 seeds each (676 languages):
  0 failures, 0 homophones, 0 paradigm or glyph collisions, all loanwords clean in every script, word order 338/338
  per level. Mean loan share 8% (light) and 19% (heavy); heavy contact brings in 1.75 new sounds per language.
  Influence leaves section 7 unchanged, since that compares inherited cognates only.

When a target is outside what a family's syllable structure allows (for example 65% vowels in a family with
no open syllables), the measured value under the slider shows it. Bantu and Japonic top out near 50–55% vowels;
Semitic templates cover roughly 36–45%.

## Recipes

The *Recipe* tab and the URL hash store (generator version, seed, controls). The same triple always rebuilds the
same language. *Download JSON* also saves the resolved controls, measurements and the full lexicon.
