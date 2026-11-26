# Candidates from scouting: please confirm before anything changes in `src/`

Evidence: 71 languages coded under `references/CODEBOOK.md` v1. Sources are WALS Online (CC BY 4.0) and PHOIBLE 2.0
(CC BY-SA 3.0), plus Wikipedia for script letters and current scripts. All of it is reference-only. The full
per-family tables are in `references/comparison.md`, each family's notes are in `references/<family>/notes.md`,
and every page used is listed in `references/manifest/*.json`. The raw extractor output is
`references/rules_draft.md`.

Answer each item **APPROVE**, **CHANGE (to …)** or **REJECT**. One answer per section is fine, for example
"A approve all, B approve except B7".

**Sample sizes are small.** The 95% Wilson lower bound for 6 of 6 is 0.61. Every typology item below is
therefore a candidate, not an established rule. Hellenic has 1 sourced language (Modern Greek) and Japonic 2, so
treat those families as tentative.

**Normalisation applied before counting** (`tools/merge_examples.py`):
- Geminate ː is folded into the base consonant.
- An aspirated stop with no plain counterpart (SPA and EA write p t k as pʰ tʰ kʰ) is counted as plain.
- PHOIBLE notation is aliased to the generator's symbols: ɡ→g, t̠ʃ→tʃ, d̠ʒ→dʒ, dental t̪→t, breathy b̤→bʱ.
- Vowel quality ignores length, nasalisation, rhoticity and lowering/raising diacritics.

---

## A. Inventories (counts: approved items replace the guesses directly)

**A1. Consonant and vowel counts.** Set `cCount` and `vCount` to the sourced min–max. Phoneme complexity 1–5
then spans the real range.

| Family | cCount now → proposed | vCount now → proposed | Note |
|---|---|---|---|
| romance | 14–19 → **20–23** | 5–5 → **5–9** | French's 12 vowel qualities left out as an outlier |
| slavic | 18–30 → **21–37** | 5–6 → **5–8** | |
| germanic | 16–24 → **18–27** | 5–11 → **8–14** | Upper end capped by what the segment catalogue can show (see G) |
| hellenic | 14–22 → **19–23** | 5–7 → **5–5** | n=1, Modern Greek only |
| celtic | 16–24 → **25–33** | 5–9 → **8–11** | Gaelic 44 left out (a 82-segment inventory with secondary articulations the generator lacks) |
| indoaryan | 18–32 → **31–42** | 5–8 → **5–10** | |
| semitic | 18–28 → **23–33** | 3–5 → **3–7** | 9 (Maltese) left out as a non-templatic outlier |
| uralic | 11–18 → **17–32** | 6–9 → **5–10** | |
| turkic | 14–22 → **20–25** | 6–9 → **6–9** | No change to vowels |
| sinitic | 16–22 → **14–29** | 5–8 → **5–7** | |
| japonic | 12–19 → **14–21** | 5–5 → 5–5 | n=3 inventories |
| bantu | 15–24 → **15–39** | 5–7 → 5–7 | Xhosa 75 left out (clicks are not supported) |
| polynesian | 8–12 → **9–12** | 5–5 → 5–5 | |

**A2. Phoneme pool weights.** Replace each guessed `[weight, tier]` with sourced presence: the frequency weight
becomes 10 × (share of the family's example languages that have the sound). Tier becomes 1 if the share is
≥ 0.8, 2 if ≥ 0.4, otherwise 3. Sounds that appear in ≥ 50% of a family's languages and that the catalogue
already supports are added:

| Family | Add | Remove (in no example language) |
|---|---|---|
| romance | w ɾ ʒ ŋ | — |
| slavic | dʒ, vowel ɛ | ɫ |
| germanic | ʒ ʔ | — |
| hellenic | ɾ dz | r pʰ tʰ kʰ h (these are Ancient Greek; keep at tier 3 if you want an archaic flavour) |
| celtic | tʃ dʒ z ɲ lʲ nʲ ç, vowels ɑ ɛ ɔ ɯ ɤ | — |
| indoaryan | w ç ɽ ɦ→h f ʈʰ ɖʱ ɟ c tʃʰ | v (sources write ʋ) |
| semitic | tʃ ɾ v | — |
| uralic | vowel ɛ | — |
| turkic | ɾ x, vowel ɛ | — |
| sinitic | h ʔ tsʰ, vowels ɔ æ | tɕ ɕ tʂ: **keep**. They are Mandarin, but Mandarin's SPA inventory writes them differently, so this removal is a notation artefact |
| japonic | ʔ, vowel ɯ | — |
| bantu | ɓ ɗ (need catalogue entries, see G), pʰ kʰ r ɬ | ᵐb ⁿd ᵑɡ: **keep**. PHOIBLE writes prenasals as mb/nd, a notation difference, not an absence |
| polynesian | vowel ɛ (Tongan) | — |

**A3. Long vowels and diphthongs.** Set `longVowels` to the share of languages with long vowels, and
`diphthongs` likewise. The values are in `references/presence.json` and the rows.

## B. Typology weights in `families.js` (candidates: sourced counts against the current guess)

- **B1 Romance cases:** WALS gives no case in 4 languages and 2 cases in Romanian. Change `caseOn` from 0.35 to
  **0.2** and `caseCount` from 5–6 to **2–6**. The 6 stands for Latin, which is not in WALS or PHOIBLE, so it stays
  an assumption.
- **B2 Romance gender:** sourced as two in both coded languages. Change from `two 4, three 2` to **`two 6,
  three 1`** (Romanian's neuter is not coded as three in WALS here).
- **B3 Germanic aspect and future:** 65A shows no grammatical aspect (4 of 4) and 67A no inflectional future
  (4 of 4). Change `tam` to **`simple 4, standard 1`** and drop `rich`.
- **B4 Germanic articles:** 3 of 6 have a definite *affix* (the Scandinavian languages). The generator already
  supports suffix articles but picks the side at random. Add a family weight `articleSide: { before: 3,
  suffix: 3 }`. This needs one line of code in morphology.js to read it; see H.
- **B5 Germanic script default:** all 6 sourced languages use Latin. Runic is a stylistic default with no
  source. Proposed: keep `runic` as the default but mark it STYLISTIC. Alternative: change it to `latin`.
- **B6 Hellenic cases:** Modern Greek has 3. Change from 4–5 to **3–5** (5 = Ancient Greek, still assumed).
  Order is "No dominant order" in WALS: keep SVO-leaning.
- **B7 Celtic order:** VSO 3, SVO 2 (Breton and Cornish). Change from `VSO 7, SVO 1` to **`VSO 3, SVO 2`**.
- **B8 Celtic articles:** 4 of 5 have a definite article and no indefinite one. The current `definite 7` agrees;
  no change.
- **B9 Indo-Aryan alignment:** 2 sourced languages are *tripartite* (98A). The generator has only accusative and
  ergative. Change from `accusative 3, ergative 1` to **`accusative 1, ergative 1`** and add a note.
- **B10 Indo-Aryan cases:** WALS gives 5 and 2 (it counts modern case suffixes and excludes postpositions). Change
  `caseCount` from 7–8 to **4–8** (8 = Sanskrit, inventory-sourced only).
- **B11 Semitic order:** VSO 1, SVO 2, SOV 2 (Amharic and Tigrinya are SOV). Change from `VSO 6, SVO 3,
  SOV 0.5` to **`VSO 3, SVO 3, SOV 2`**.
- **B12 Semitic articles:** 3 of 5 have a definite affix (Arabic al-, Hebrew ha-). These are prefixes, and the
  generator's article suffix is postposed. Proposed: leave `definite 6` and record "prefixal article" as a gap.
- **B13 Uralic cases:** 10+ in 4 languages, 6–7 in 2. Change `caseCount` from 10–14 to **6–14**.
- **B14 Uralic harmony:** 2 true (Finnish, Hungarian), 2 false (Estonian, Udmurt). Change the probability from
  0.85 to **0.5**.
- **B15 Japonic cases:** WALS gives Japanese 8–9 (it counts particles). Change from 5–7 to **5–9**.
- **B16 Bantu tone:** Swahili has none and one other language has a simple system. The current `two 7, none 2`
  agrees with this direction; no change.
- **B17 Polynesian alignment:** sourced as 1 accusative and 1 neutral, with no ergative. Change from
  `accusative 2, ergative 2` to **`accusative 3, ergative 1`** (Tongan and Samoan ergativity is not coded in
  WALS 98A; keep it as a minority).
- **B18 Script defaults:** Sinitic is sourced as Han (6 of 6) and Japonic as Kana (4 of 4). The generator
  cannot render either, so `original` stays. Mark it STYLISTIC.
- **No change**, the sources agree: Slavic (cases 6–7, three genders, no articles), Turkic (SOV, agglutinative,
  harmony 4 of 5), Sinitic (complex tone 6 of 6), Bantu (SVO, prefixing, five or more classes), Polynesian (VSO,
  both articles, simple syllables).

## C. Head direction (in `syntax.js`, which is outside your allowed files: decide whether to touch it)

The sourced counts support the current assumptions:

| Rule | Sourced count | Current code |
|---|---|---|
| SOV → postpositions | 10 of 12 (Wilson lower 0.55) | 88% |
| VO → prepositions | 34 of 39 (0.73) | 88% |
| OV → genitive–noun | 13 of 14 (0.69) | 85% |
| VO → noun–genitive | 25 of 32 (0.62) | 75% |
| **genitive–noun ⇒ adjective–noun** | **20 of 20 (0.84, "strong")** | adjective follows genitive side 70% |
| noun–genitive ⇒ noun–adjective | 24 of 30 (0.62) | same 70% |

- **C1:** raise "adjective on the genitive's side" from 70% to **100% when the genitive comes first, and 80%
  when it comes after**. This is a two-line change in `syntax.js`.

## D. Script mappings in `src/scripts.js` (481 checked; details in `references/scripts/notes.md`)

- **D1 Georgian:** plain p t k → ფ თ ქ (currently the ejective letters პ ტ კ); q → ჴ. The two Georgian sources
  disagree on ყ.
- **D2 Cyrillic:** ð → **ҙ** (Bashkir; the current ԁ is Komi /d/), dʑ → ђ, β → б, ɣ → гӀ, c → ть, ɟ → дь.
  ʕ: the current ӷ is /ʁ/; change it to Ӏ.
- **D3 Greek:** h written as rough breathing on the next vowel; w → υ; ŋ → γ before velars; long eː → ει,
  iː → ι.
- **D4 Armenian:** o → **օ** (ո is word-initial /vo/); ŋ → ն before velars.
- **D5 Hebrew:** w → ו׳ (or וו), θ → ת׳, ð → ד׳.
- **D6 Devanagari:** ʔ → **ॽ** (avagraha ऽ is not a sound); ts → च़ (Kashmiri convention).
- **D7 Inventions with no attested convention:**
  - Greek σσ for ʃ.
  - Runic ᛊᚺ, ᚢᛁ, ᛟᛁ, ᛏᛊ, ᛞᛉ.
  - Devanagari थ़ द़ श़.
  - Cyrillic macron and doubled Georgian/Armenian letters for long vowels.
  - Arabic word-initial أ/إ.

  No source offers an alternative, so these stay and get an `// ASSUMPTION: no attested convention` comment.

## E. Mined rules discarded as coincidence (no action)

The extractor's high-confidence "requires" and "excludes" rules are almost all WALS **coverage artefacts**. A
language missing one feature usually misses the neighbouring ones (1A, 2A, 12A, 13A and 20A null together). The
`historical=False` implications only show that the sample has 1 historical language. The one exception is
genitive ⇒ adjective, which is in C.

## F. Still assumed after this (marked in the files)

- Vowel share and word length ranges (no licensed corpus).
- Syllable caps `onsetMax` and `codaMax`, and the cluster lists (WALS 12A is categorical only).
- Stress patterns.
- Sound-change rule weights.
- Classical members: Latin, Ancient Greek, Classical Arabic and Old Norse are not in WALS or PHOIBLE.
- Gender assignment.
- The case hierarchy in `cases.js` (Blake 1994, not re-checked). **No change is proposed to `cases.js`**: WALS 49A
  gives counts only, not which cases.
- Romanization preferences.
- Stylistic script defaults (B5, B18).

## G. Needs `src/data/phonemes.js` (outside your allowed files)

Sounds that occur in ≥ 50% of a family's languages but have no catalogue entry: Germanic ɪ ʊ œ ʏ, Celtic ɪ ʊ
lˠ nˠ ɾˠ pʲ, Indo-Aryan ɪ ʊ æ-length mʱ nʱ lʱ ɽʱ, Bantu ɓ ɗ. Allow `phonemes.js` and I'll add them (features plus
romanization candidates). Otherwise they stay out.

## H. Needs a code change (outside your allowed files)

B4 needs morphology.js to read `articleSide`. C1 needs syntax.js. Say whether these are allowed; if not, B4 and C1
stay as notes.

---

## Applied 2026-11-23 (approved by the requesting session)

| Item | Where | Status |
|---|---|---|
| A1–A3 | `src/data/families.js` (pools, cCount, vCount, longVowels, diphthongs), via `tools/apply_inventories.py` | Applied. Hellenic r pʰ tʰ kʰ h are kept at tier 3. Greek ɑ ɛ ɔ are credited to a e o. c ɟ are counted from cç ɟʝ, tʂ from ʈʂ, and ᵐb ⁿd ᵑɡ from the Zulu/Xhosa prenasal series (share 0.17). tɕ ɕ and Bantu ɾ stay assumed. |
| B1–B18 | `src/data/families.js`, cited inline in each `grammar: { // …` | Applied. The Romance case count of 6 (Latin) is marked [ASSUMPTION]. B5 and B18 are marked STYLISTIC. |
| C1 | `src/syntax.js` | Applied: adjective before when the genitive comes first (100%), after with 80% when the genitive comes after. |
| D1–D6 | `src/scripts.js` | Applied, including the Greek rough breathing and γ / Armenian ն before velars. |
| D7 | `src/scripts.js` | Each convention-less mapping is marked `// ASSUMPTION: no attested convention`. |
| G | `src/data/phonemes.js` | Added ɪ ʏ ʊ œ ɓ ɗ only. |
| H | `src/morphology.js` | Added the `articleSide` read only. |
| `cases.js` | — | Unchanged, as proposed. |

**Finding: real-ancestor mode overrides the sourced inventories.** Another session's real-ancestor mode
(`src/descent.js`, now the default for all 13 families) re-derives the inventory from simulated ancestor words, so
the sourced pools and counts take full effect only with ancestry set to "invented". Measured over 6 seeds,
consonant counts in default mode fall below the sourced ranges for Germanic (16–18 against 18–27), Celtic (16–19
against 25–33) and Japonic (13–16 against 14–21). Word lengths in that mode are set by the ancestor words, not by
the wordLen calibration.
