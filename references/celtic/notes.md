# Celtic: reference sheet (codebook v1)

Rows: `references/rows/celtic.json` (5 languages: Welsh, Irish, Gaelic (Scots), Breton, Cornish). Citations: `references/manifest/celtic.json`.

## Sources (retrieved 2026-11-23)
- WALS Online, https://wals.info/ : CC BY 4.0. Valueset pages per feature.
- PHOIBLE 2.0, https://phoible.org/ : CC BY-SA 3.0. Inventories used: EA 2406 Welsh (Llanwrtyd), SPA 156 Irish Gaelic, EA 2601 Scottish Gaelic (Lewis), SPA 157 Breton. Cornish has no inventory.
- Wikipedia language articles (writing system only), CC BY-SA 4.0.

## Consonants (4 inventories)
- In at least 3 of 4: m n ŋ f v ʃ x h l j w, plus aspirated stops pʰ tʰ kʰ. The sources mark the fortis series as aspirated: unaspirated p t k appear only in Welsh and Gaelic, and voiced b d ɡ appear in Irish and Breton.
- Goidelic (Irish, Gaelic): broad and slender pairs, written velarised ˠ and palatalised ʲ (lˠ lʲ nˠ nʲ ɾˠ ɾʲ tʲ kʲ ...), plus ç ɣ. Irish SPA also has labialised-velarised bʷˠ mʷˠ pʷˠʰ and voiceless sonorants.
- Welsh: ɬ, θ ð, χ, voiceless nasals m̥ n̥ ŋ̥ and r̥.
- Breton: ɟ cʰ ɥ, laminal s̻ z̻, ʒ.
- n_consonants: 25 (Breton) to 44 (Irish), with Welsh 29 and Gaelic 33. All are well above the Romance range.

## Vowels
- In at least 3 of 4: a iː uː eː oː. Length contrast is present in all 4.
- In few: nasal vowels (Irish, Gaelic, Breton), front rounded y yː ø̞ øː (Breton), back unrounded ɯ ɤ (Gaelic), and diphthongs listed as phonemes (Welsh, Gaelic).
- n_vowel_qualities: 10 to 13.

## Typology (WALS)
- Order VSO (Welsh, Irish, Gaelic), but SVO in Breton and Cornish. Prepositions, Noun-Genitive and Noun-Adjective in all 5.
- Affixation ranges from strongly suffixing (Welsh, Cornish) through weakly suffixing (Gaelic, Breton) to equal prefixing and suffixing (Irish, which reflects initial mutation).
- Definite word distinct from demonstrative (5 of 5). Indefinite: none, but a definite article exists (Welsh, Irish, Gaelic, Cornish); Breton has an indefinite word distinct from 'one'.
- Case: Welsh none, Irish 2 cases. Case position: mixed morphological case (Irish, Gaelic) or prepositional clitics (Breton).
- Genders: Two (Gaelic). Alignment: Irish neutral.
- Breton only: consonants Average, vowels Large (7-14), syllables Complex, no tones.
- Script: Latin for all 5. Ogham and Insular script are historical only.

## What varies
Basic word order (VSO in the Goidelic languages and Welsh, SVO in Breton and Cornish), consonant inventory size (the Goidelic palatalisation pairs double it), the indefinite article (Breton) and prefixing (Irish).

## Gaps
- WALS has almost no phonology or verbal chapters (1A, 2A, 12A, 13A, 20A, 65A, 67A, 98A) for Welsh, Irish, Gaelic or Cornish. Irish (Donegal) `ird` has 1A, 2A, 12A and 13A, but it was not coded as a separate row.
- Cornish: no PHOIBLE inventory (corn1251 returned 404 twice), so its inventory fields are null.
- Manx (`mnx`): WALS has only 14A, 15A, 16A, 45A and 70A, none of them codebook features, and PHOIBLE returned 404 for manx1243. The row was omitted.
- No historical Celtic language (Old Irish, Middle Welsh) is covered.
- Welsh and Gaelic inventories are single-dialect EA sources, the only ones available.
- vowel_harmony is null.
