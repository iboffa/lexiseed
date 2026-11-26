# Romance: reference sheet (codebook v1)

Rows: `references/rows/romance.json` (6 languages: Spanish, Italian, French, Portuguese, Romanian, Catalan). Page-level citations: `references/manifest/romance.json`.

## Sources (retrieved 2026-11-23)
- WALS Online, Dryer & Haspelmath (eds.) 2013, https://wals.info/ : CC BY 4.0. Values read from `https://wals.info/valuesets/<feature>-<code>` pages; the language pages load their tables by script.
- PHOIBLE 2.0, Moran & McCloy (eds.) 2019, https://phoible.org/ : CC BY-SA 3.0. Inventories used: SPA 164 (Spanish), PH 1145 (Italian), SPA 162 (French), SPA 163 (Portuguese), SPA 165 (Romanian), PH 1138 (Catalan).
- Wikipedia language articles (infobox writing system only), https://en.wikipedia.org/ : CC BY-SA 4.0.

## Consonants
- In most (more than 3 of 6): p b t k ɡ m n ɲ f v s z ʃ ʒ ʎ r ɾ l j w t̠ʃ.
- In few: d̠ʒ ts dz ŋ x θ β ð͉ ɣ h ɦ ʀ ɱ ɥ. Dentals are written t̪ d̪ in some sources and t d in others, so presence counts for t/d split across symbols.
- n_consonants: 20 to 23 (mean about 22).

## Vowels
- In most: i e ɛ a ɔ o u (the seven-vowel Romance core; Spanish SPA has only i e̞ a o̞ u).
- In few: front rounded y ø œ (French only), nasal vowels (French, Portuguese), central ə ɐ ɨ (Catalan, Portuguese, Romanian, Italian), length (French ɛː only).
- n_vowel_qualities: 5 to 13 (Spanish 5, Italian 7, Romanian 7, Portuguese 8, Catalan 8, French 13).
- Diphthongs listed as phonemes only in Catalan PH 1138. Romanian lists the glides ɛ̯ ɔ̯.

## Typology (WALS)
- Order SVO everywhere it is coded. Prepositions, Noun-Genitive and Noun-Adjective in all 6.
- Affixation is strongly suffixing (5 coded). Fusion is exclusively concatenative (2 coded).
- Definite article is a separate word, except in Romanian, which has a definite affix. Indefinite article is the same word as 'one' (6 of 6).
- No morphological case, except Romanian (2 cases, case suffixes). Genders: Two (Spanish, French).
- No tones. Syllables are moderately complex (Spanish, Catalan) or complex (French).
- Aspect is marked grammatically (4 coded). Inflectional future: yes in Spanish and French, no in Portuguese and Romanian.
- Alignment: Spanish nominative-accusative, French neutral.
- Script: Latin for all 6. Romanian is also written in Cyrillic, in Transnistria only.

## What varies
Vowel inventory size and nasality (5 to 13 qualities), syllable complexity, the definite article (word or suffix), residual case (Romanian), inflectional future, and the affricates ts/dz/d̠ʒ.

## Gaps
- No historical language. WALS has no Latin: code `lat` is Latvian, and Latin is not on the Romance genus page. PHOIBLE returned 404 for lati1261 on two tries.
- WALS lacks 1A, 2A, 12A, 13A, 20A, 30A, 98A, 65A and 67A for Italian, and most phonology chapters for Portuguese. Catalan lacks 20A, 26A, 30A, 37A and 51A.
- vowel_harmony is null throughout, because no consulted source states it.
- Italian and Catalan have no SPA or UPSID inventory, so the PHOIBLE-contributed (PH) ones were used.
