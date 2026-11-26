# Germanic — reference sheet (codebook v1)

Rows: `references/rows/germanic.json` (6 languages: German, English, Dutch, Swedish, Icelandic, Norwegian). No historical language: Gothic (goth1244) and Old English (olde1238) have no PHOIBLE page and are not in the WALS Germanic genus list. All retrieved 2026-11-23.

## Sources
- WALS genus Germanic — https://wals.info/languoid/genus/germanic — CC BY 4.0 — 2026-11-23
- WALS language pages — https://wals.info/languoid/lect/wals_code_{ger,eng,dut,swe,ice,nor} — CC BY 4.0 — 2026-11-23
- PHOIBLE language pages — https://phoible.org/languages/{stan1295,stan1293,dutc1256,swed1254,icel1247,norw1258} — CC BY-SA 3.0 — 2026-11-23
- PHOIBLE inventories — https://phoible.org/inventories/view/{161,160,1050,1150,158,2441} — CC BY-SA 3.0 — 2026-11-23
- Wikipedia infobox "Writing system" (script field only) — https://en.wikipedia.org/wiki/{German_language,English_language,Dutch_language,Swedish_language,Icelandic_language,Norwegian_language} — CC BY-SA 4.0 — 2026-11-23

Inventory rule: SPA > UPSID > PH > RA > EA/UZ. Used: German SPA 161, English SPA 160, Icelandic SPA 158, Dutch PH 1050, Swedish PH 1150, Norwegian EA 2441 (only inventory).

## Consonants (presence across 6 inventories)
- In most (>= 4/6): m, l, f (6); b, ŋ, h, s, j, n, v (5); ɡ, d, aspirated pʰ tʰ kʰ (4).
- Note: SPA/EA sources write the voiceless stops as aspirated (pʰ tʰ kʰ) and list no plain p t k; Dutch and Swedish PH list plain p t k. Treat "voiceless stop series" as universal.
- In few (<= 2): θ (English, Icelandic), ð (English), ʍ (English, Icelandic), ɣ (Dutch, Icelandic), uvular ʀ (German, Dutch), pf ts (German), t̠ʃ d̠ʒ (English), ɧ ɕ ʝ (Swedish), voiceless sonorants l̥ n̥ r̥ j̥ (Icelandic), retroflex ʈ ɖ ɳ ɭ ʂ ɽ (Norwegian), ʔ (German, English, Dutch-marginal).
- Range n_consonants: 18 (Swedish) – 27 (English); median ~23.5.

## Vowels
- In most: ɔ (6), ɛ (5), long iː uː eː øː (5), oː aː yː (4), œ ɪ (4).
- Front rounded vowels (y/ʏ/ø/œ) in 5/6 (not English).
- Long vowels in 6/6. Diphthongs listed as phonemes only in Dutch (ɔu, œy, ɛi̯).
- In few: ə ɐ (German, English), æ ɒ (English), ʉ ɵ (Swedish, Norwegian).
- Range n_vowel_qualities: 8 (Icelandic) – 16 (Swedish); median ~12.

## Typology (WALS, non-null values only)
- Prepositions 6/6, Adjective-Noun 6/6, strongly suffixing 6/6.
- Order: SVO 4, No dominant order 2 (German, Dutch).
- Definite article: free word 3 (German, English, Dutch) vs definite affix 3 (Swedish, Icelandic, Norwegian).
- Indefinite: same as 'one' 3, distinct from 'one' 2, none but definite (Icelandic).
- Cases: 4 (German, Icelandic), 2 (English, Swedish), none (Dutch); case suffixes 3 vs none 3.
- Genitive: Noun-Genitive 3, No dominant order 2, Genitive-Noun 1 (Swedish).
- 1A Average (3/3), 2A Large 7-14 (3/3), 12A Complex (3/3). Tone: none (German, English) vs Simple tone system (Norwegian).
- Genders Three (3/3 coded); no grammatical aspect, no inflectional future (4/4).
- Alignment: German nominative-accusative, English Neutral.

## What varies
- Article placement (prenominal word vs suffix: West vs North Germanic).
- Case retention (Icelandic/German 4, English/Swedish 2, Dutch 0).
- Retroflexes from r+coronal (Norwegian) and pitch accent (Norwegian WALS "Simple tone system").
- Dental fricatives (English, Icelandic only).

## Gaps
- WALS sparse for Dutch, Swedish, Icelandic, Norwegian (1A/2A/12A/20A/30A/98A often null).
- No historical Germanic language in WALS or PHOIBLE (Gothic, Old English checked).
- vowel_harmony null for all (no cited source).
- German and Dutch glottocodes from PHOIBLE (WALS page shows none).
