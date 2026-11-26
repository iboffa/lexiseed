# Indo-Aryan — reference sheet (codebook v1)

Rows: `references/rows/indoaryan.json` (6 languages: Hindi, Bengali, Marathi, Panjabi, Nepali, Sanskrit [historical]). Sanskrit is not in WALS (absent from the WALS Indic genus list), so all its WALS fields are null; its inventory is PHOIBLE RA 1782. All retrieved 2026-11-23.

## Sources
- WALS genus Indic — https://wals.info/languoid/genus/indic — CC BY 4.0 — 2026-11-23
- WALS language pages — https://wals.info/languoid/lect/wals_code_{hin,ben,mhi,pan,nep} — CC BY 4.0 — 2026-11-23
- PHOIBLE language pages — https://phoible.org/languages/{hind1269,beng1280,mara1378,panj1256,nepa1254,sans1269} — CC BY-SA 3.0 — 2026-11-23
- PHOIBLE inventories — https://phoible.org/inventories/view/{176,177,1766,175,1772,1782} — CC BY-SA 3.0 — 2026-11-23
- Wikipedia infobox "Writing system" (script field only) — https://en.wikipedia.org/wiki/{Hindi,Bengali_language,Marathi_language,Punjabi_language,Nepali_language,Sanskrit} — CC BY-SA 4.0 — 2026-11-23

Inventory rule: SPA > UPSID > PH > RA > EA/UZ. Used: Hindi-Urdu SPA 176, Bengali SPA 177, Panjabi SPA 175, Marathi RA 1766, Nepali RA 1772, Sanskrit RA 1782.

## Consonants (presence across 6 inventories)
- In all 6: p pʰ b, k kʰ ɡ, ʈ ʈʰ ɖ, m, j. In 5: ʂ, s, l, w, breathy-voiced b̤ ɖ̤. In 4: t̪ t̪ʰ d̪ d̪̤, l̤, r, ɽ, ŋ, h, ç (RA sources write palatal affricates as cç/ɟʝ; SPA writes t̠ʃ/d̠ʒ).
- Core pattern: four-way laryngeal contrast (voiceless, aspirated, voiced, breathy/murmured) at labial, dental, retroflex, palatal and velar places; retroflex stops universal.
- In few (<= 2): geminate series (Hindi-Urdu and Panjabi SPA list long consonants as phonemes), Perso-Arabic q χ ʁ z ʒ (Hindi-Urdu), ɭ (Panjabi, Sanskrit), dz ts tsʰ (Marathi), ɾ (Bengali, Marathi), ʔ (Hindi-Urdu).
- Range n_consonants: 35 (Nepali) – 71 (Hindi-Urdu, inflated by 25+ geminates); without geminate-listing sources 35–42.

## Vowels
- In most: a (5), i iː u uː (4). Nasal vowels in Hindi, Bengali, Panjabi (3/6).
- Long vowels: Hindi, Marathi, Nepali, Sanskrit (4/6); Bengali, Panjabi SPA have none.
- Diphthongs as phonemes: Hindi-Urdu only (ɔo̯, æe̯, nasal variants). Bengali lists non-syllabic e̯ o̯ (excluded from quality counts).
- Range n_vowel_qualities: 5 (Sanskrit) – 11 (Hindi); median ~8.5.

## Typology (WALS, non-null values only)
- SOV 5/5, postpositions 4/4, Genitive-Noun 4/4, Adjective-Noun 4/4, case suffixes 5/5, strongly suffixing 4/4.
- No articles (3/3 coded).
- Cases: 5 (Marathi), 2 (Panjabi). Alignment Tripartite (Hindi, Marathi).
- Genders: Two (Hindi, Panjabi), Three (Marathi).
- Inflectional future exists (3/3 coded). Aspect: marked (Hindi, Panjabi), not marked (Bengali).
- 1A Moderately large–Large; 2A Average (Hindi, Nepali) vs Large (Bengali); 12A Complex; no tones (3/3 coded).

## What varies
- Gender count (Bengali/Nepali gaps; 2 vs 3 among coded).
- Tone: PHOIBLE SPA 175 lists three tones for Panjabi, but WALS has no 13A value for Panjabi.
- Geminate consonants as listed phonemes (source-dependent).
- Script: Devanagari (Hindi, Marathi, Nepali, Sanskrit) vs Other (Bengali-Assamese; Gurmukhi/Shahmukhi for Panjabi).

## Gaps
- WALS 49A (cases) null for Hindi, Bengali, Nepali; 98A only for Hindi/Marathi; 20A only Hindi.
- Bengali WALS coverage thin (no word-order fields other than SOV).
- vowel_harmony null for all (no cited source).
