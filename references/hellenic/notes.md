# Hellenic: reference sheet (codebook v1)

Rows: `references/rows/hellenic.json` (1 language: Greek (Modern)). Citations: `references/manifest/hellenic.json`.
The family is small, and the databases cover only one of its languages, so this file describes a single language rather than family statistics.

## Sources (retrieved 2026-11-23)
- WALS Online, https://wals.info/ : CC BY 4.0. Valueset pages for grk; genus page https://wals.info/languoid/genus/greek (lists only Greek (Modern) and Greek (Cypriot)).
- PHOIBLE 2.0, https://phoible.org/ : CC BY-SA 3.0. Inventory SPA 170 (Modern Greek, 26 segments). Other inventories exist (UPSID 318, UZ 2186, UZ 2187, EA 2458) but were not used.
- Wikipedia, Modern Greek article (writing system only), CC BY-SA 4.0.

## Consonants (SPA 170, 21)
p b t d k ɡ ts dz m n ɾ f v θ ð s z x ɣ j l. There is a full voiceless/voiced fricative series (f v, θ ð, s z, x ɣ).

## Vowels
i ɛ ɑ ɔ u: 5 qualities, with no length, nasality or diphthongs.

## Typology (WALS grk)
Consonants Average, vowels Average (5-6), syllables Complex, no tones. Exclusively concatenative and strongly suffixing. Three genders. Definite word distinct from demonstrative. Indefinite word same as 'one'. 3 cases, marked by case suffixes. No dominant word order. Prepositions, Noun-Genitive, Adjective-Noun. Nominative-accusative (standard) alignment. Grammatical aspect, no inflectional future. Script: Greek.

## What varies
This can't be judged from one language. Compared with Romance, it shows case suffixes, three genders, Adjective-Noun order and the interdental and velar fricatives.

## Gaps
- Greek (Cypriot) `gcy`: WALS codes only 142A for it, which is not a codebook feature, and PHOIBLE returned 404 for cypr1249. The row was omitted rather than left entirely null.
- Ancient Greek: not in WALS (absent from the genus page), and PHOIBLE returned 404 for anci1242. No historical row.
- Tsakonian (tsak1248), Pontic (pont1253) and Cappadocian (capp1239) all returned 404 on PHOIBLE and are not in WALS.
- vowel_harmony is null.
