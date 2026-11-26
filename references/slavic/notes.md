# Slavic — reference sheet (codebook v1)

Rows: `references/rows/slavic.json` (7 languages: Russian, Polish, Czech, Serbian-Croatian, Bulgarian, Ukrainian, Slovene). No historical language: WALS has Polabian (`plb`) but only 3 datapoints, none for codebook fields; PHOIBLE has no Polabian (pola1255) or Church Slavic (chur1257) page. All retrieved 2026-11-23.

## Sources
- WALS genus Slavic — https://wals.info/languoid/genus/slavic — CC BY 4.0 — 2026-11-23
- WALS language pages — https://wals.info/languoid/lect/wals_code_{rus,pol,cze,scr,bul,ukr,slo} — CC BY 4.0 — 2026-11-23
- PHOIBLE language pages — https://phoible.org/languages/{russ1263,poli1260,czec1258,croa1245,serb1264,bulg1262,ukra1253,slov1268} — CC BY-SA 3.0 — 2026-11-23
- PHOIBLE inventories — https://phoible.org/inventories/view/{166,1046,1140,1139,167,1035,1149} — CC BY-SA 3.0 — 2026-11-23
- Wikipedia infobox "Writing system" (script field only) — https://en.wikipedia.org/wiki/{Russian_language,Polish_language,Czech_language,Serbo-Croatian,Bulgarian_language,Ukrainian_language,Slovene_language} — CC BY-SA 4.0 — 2026-11-23

Inventory rule: SPA > UPSID > PH > RA > EA/UZ. Used: Russian SPA 166, Bulgarian SPA 167, Polish PH 1046, Czech PH 1140, Croatian PH 1139 (for Serbian-Croatian), Ukrainian PH 1035, Slovene PH 1149.

## Consonants (presence across 7 inventories)
- In most (>= 5/7): m, b, ɡ, j, x, f (7); k, p (6); s, n, r, v, z, ʃ, ʒ, t̠ʃ (5). Near-majority: ts, t̪, d̪, d̠ʒ (4).
- In few (<= 2): palatalised series (pʲ bʲ mʲ fʲ vʲ sʲ zʲ rʲ lʲ kʲ ...) only in Russian and Bulgarian; velarised lˠ (Russian, Bulgarian); alveolo-palatals tɕ dʑ (Polish, Croatian), ɕ ʑ (Polish); palatal stops c ɟ (Polish, Czech); ʎ (Croatian); r̝ (Czech); ɦ (Czech); aspirated pʰ tʰ kʰ (Bulgarian SPA only); w (Polish, Ukrainian marginal); ŋ (Polish).
- Caveat: dental vs alveolar coronals are transcribed inconsistently across sources (t vs t̪, s vs s̪), so coronal counts are not comparable segment by segment.
- Range n_consonants: 21 (Slovene) – 37 (Bulgarian); median 25.

## Vowels
- In most: u (7), i (6; Czech has iː and ɪ instead), ɛ (5), a (5), o (4; plus o̞ in Russian).
- In few: ɨ (Polish), ɤ and nasal vowels (Bulgarian SPA), ə (Slovene), ɪ (Czech, Ukrainian), diphthongs (Czech au/ou/ɛu, Croatian ie).
- Length contrasts: Czech, Serbian-Croatian, Slovene (3/7). Diphthongs: Czech, Serbian-Croatian.
- Range n_vowel_qualities: 5 – 8 (Slovene); typical 5–6.

## Typology (WALS, non-null values only)
- Order SVO 7/7; prepositions 7/7; Adjective-Noun 7/7.
- Suffixing: strongly 6/7, Czech weakly. Case suffixes 6/7 (Bulgarian: none).
- Cases: 6-7 (Russian, Polish), 5 (Serbian-Croatian), none (Bulgarian).
- Articles: none in 5/6 coded; Bulgarian has a definite word distinct from demonstrative (WALS 37A).
- Genitive: No dominant order 4, Noun-Genitive 2.
- Consonants 1A: Average–Large; vowels 2A Average (5-6) in all 3 coded; syllables Complex (3/3); no tones (3/3).
- Genders Three (Russian, Ukrainian); aspect grammatically marked, no inflectional future (Russian, Bulgarian).

## What varies
- Palatalisation as a phonemic series (Russian/Bulgarian) vs alveolo-palatal/palatal series (Polish, Czech, Croatian).
- Vowel length (West/South Slavic) vs none (East Slavic, Bulgarian, Polish).
- Case loss in Bulgarian, with a definite article.
- Script: Cyrillic (Russian, Ukrainian, Bulgarian) vs Latin (Polish, Czech, Slovene, Serbian-Croatian = Latin listed first, Cyrillic co-official).

## Gaps
- WALS is sparse for Czech, Ukrainian, Slovene, Serbian-Croatian (most phonology and 20A/30A/65A/67A/98A null). 20A and 98A only for Russian.
- No historical Slavic language codable from WALS/PHOIBLE.
- vowel_harmony null for all (no cited source).
- Serbian-Croatian: WALS glottocode sout1528 has no PHOIBLE page; Croatian inventory used.
