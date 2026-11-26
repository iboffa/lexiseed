# Turkic: reference sheet (codebook v1, retrieved 2026-11-23)

Rows: `references/rows/turkic.json` (6 languages). Every page used is listed in `references/manifest/turkic.json`.

## Sources
- WALS Online, language and valueset pages, e.g. https://wals.info/languoid/lect/wals_code_tur and https://wals.info/valuesets/81A-tur. CC BY 4.0. Retrieved 2026-11-23.
- WALS genus page https://wals.info/languoid/genus/turkic. CC BY 4.0. Retrieved 2026-11-23.
- PHOIBLE 2.0 inventories: SPA 186, SPA 187, UPSID 603, SPA 188, EA 2595 and SPA 190 (https://phoible.org/inventories/view/<id>). CC BY-SA 3.0. Retrieved 2026-11-23.
- English Wikipedia articles, one per language (writing system, plus vowel-harmony statements), e.g. https://en.wikipedia.org/wiki/Turkish_language. CC BY-SA 4.0. Retrieved 2026-11-23.
- Glottolog search pages (https://glottolog.org/glottolog?search=<name>) used to get the glottocodes of historical lects for PHOIBLE probes (all returned 404). CC BY 4.0. Retrieved 2026-11-23.

## Languages and inventory
| WALS | Language | PHOIBLE inventory | C | V qualities | Vowel harmony (Wikipedia) |
|---|---|---|---|---|---|
| tur | Turkish | SPA 186 | 24 | 8 | true |
| aze | Azerbaijani | SPA 187 | 25 | 9 | null (not stated) |
| uzb | Uzbek | UPSID 603 (glottocode nort2690) | 24 | 6 | false (standard; dialects keep it) |
| kgz | Kirghiz | SPA 188 | 20 | 9 | true |
| tkm | Turkmen | EA 2595 (Teke) | 21 | 9 | true |
| ykt | Yakut | SPA 190 | 33 | 8 | true |

Inventory rule: SPA, then UPSID, then EA, then UZ.

Kazakh was dropped. All 18 WALS valuesets for `kaz` returned 404, and https://phoible.org/languages/kaza1248 returned 404 on both tries, so the row would have been empty apart from script.

## Segments
- **Consonants in half or more of the inventories (at least 3 of 6):** j, ʃ, m (all 6); s, l, d̠ʒ, z, f, t̠ʃ (5); b, h, n, ʒ, ɡ, p, k, ŋ, and aspirated pʰ (4); ɾ, v, x, t, tʰ (3).
- The voiceless stops are written as aspirated in the SPA inventories (pʰ tʰ kʰ cʰ). They are not a separate series.
- **Consonants in few inventories:**
  - uvulars q χ ʁ: Uzbek and Kirghiz.
  - interdentals θ ð: Turkmen only.
  - palatal c ɟ / cʰ ʎ: Turkish and Azerbaijani.
  - geminate series: Yakut only.
- **Vowels:** a front/back by rounded/unrounded system: i y ɯ u, e/ɛ œ/ø a/ɑ o/ɔ. Back unrounded ɯ is in Turkish, Turkmen, Yakut and Azerbaijani (ɯ̞). Long vowels: Turkish, Kirghiz, Turkmen and Yakut. No diphthongs anywhere. Uzbek (6 qualities, i ʉ e ɵ æ ɒ) is the odd one out, matching its loss of harmony.

## Ranges
- Consonants: 20 to 33 as listed; singletons 20 to 25 (Yakut 22 without its 11 geminates).
- Vowel qualities: 6 to 9.
- Long vowels: in 4 of 6 inventories.

## Typology (WALS, where coded)
- Order (81A): SOV everywhere coded.
- Adpositions (85A): postpositions.
- Genitive (86A): Genitive-Noun.
- Adjective (87A): Adjective-Noun in all 6.
- Affixation (26A): strongly suffixing.
- Case (51A): case suffixes.
- Gender (30A): none.
- Vowel inventory (2A): Large (7-14).
- Consonant inventory (1A): Average.
- Tone (13A): none.
- Turkish: 6-7 cases; no definite article but an indefinite article that is the same word as 'one'.

## What varies
- Syllable complexity: moderately complex for Turkish and Azerbaijani; complex for Kirghiz and Yakut.
- Vowel length.
- Uvular consonants.
- Whether vowel harmony survives (lost in standard Uzbek).

## Gaps
- WALS coverage is thin beyond word order. 20A, 37A, 49A and 98A are coded only for Turkish. Turkmen has only 81A, 85A, 86A and 87A.
- Azerbaijani and Kirghiz have no glottocode on the WALS page, so the glottocode was taken from PHOIBLE.
- Uzbek has uzbe1247 on WALS, but PHOIBLE returns 404 for it. Its inventory sits under nort2690.
- No historical Turkic language is coded. None has a WALS page in the genus listing, and PHOIBLE returned 404 for Old Turkic (oldu1238) and Chagatai (chag1247). Codes were taken from Glottolog search pages.
