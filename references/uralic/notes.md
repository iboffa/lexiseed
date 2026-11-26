# Uralic: reference sheet (codebook v1, retrieved 2026-11-23)

Rows: `references/rows/uralic.json` (6 languages). Every page used is listed in `references/manifest/uralic.json`.

## Sources
- WALS Online, language and valueset pages, e.g. https://wals.info/languoid/lect/wals_code_fin and https://wals.info/valuesets/49A-fin. CC BY 4.0. Retrieved 2026-11-23.
- WALS genus pages for finnic, ugric, saami, permic, mordvin and samoyedic (https://wals.info/languoid/genus/<genus>). CC BY 4.0. Retrieved 2026-11-23.
- PHOIBLE 2.0 inventories: SPA 180, EA 2248, SPA 183, UZ 2235, EA 2240 and SPA 185 (https://phoible.org/inventories/view/<id>). CC BY-SA 3.0. Retrieved 2026-11-23.
- English Wikipedia articles, one per language (writing system, plus vowel-harmony statements), e.g. https://en.wikipedia.org/wiki/Finnish_language. CC BY-SA 4.0. Retrieved 2026-11-23.

## Languages and inventory
| WALS | Language | PHOIBLE inventory | C | V qualities | Vowel harmony (Wikipedia) |
|---|---|---|---|---|---|
| fin | Finnish | SPA 180 | 25 | 10 | true |
| est | Estonian | EA 2248 (Standard) | 17 | 9 | false (standard; dialects have it) |
| hun | Hungarian | SPA 183 | 50 | 10 | true |
| sno | Saami (Northern) | UZ 2235 (only one) | 63 | 5 | null |
| udm | Udmurt | EA 2240 (Standard) | 29 | 7 | false |
| ntu | Nenets (Tundra) | SPA 185 "Yurak" | 26 | 8 | null |

Inventory rule: SPA, then UPSID, then EA, then UZ. Geminates and long consonants are listed as phonemes in the SPA Finnish and Hungarian inventories and the UZ Saami inventory, which inflates those counts. Saami also lists preaspirated (ʰp ʰt ʰk ...) and preglottalised (ˀm ˀn ˀɲ) series.

## Segments
- **Consonants in most inventories (at least 4 of 6, raw strings):** r, p, k, m (all 6); l, n, f, j (5); s, ʃ, h, t, v, b, ɡ (4). Plain t and s are only 4 of 6 because Estonian and Udmurt are transcribed as dental t̪/s̪ or laminal t̻/s̻.
- **Consonants in few inventories:**
  - palatalised series (tʲ sʲ nʲ lʲ, and in Nenets also pʲ mʲ rʲ): Estonian and Nenets.
  - retroflex/postalveolar and alveolo-palatal affricate sets (ʂ ʐ ʈʂ ɖʐ ɕ ʑ tɕ dʑ): Udmurt only.
  - palatal stops c ɟ / cç ɟʝ: Udmurt and Hungarian.
  - preaspirates: Saami only.
  - ʔ: Finnish and Nenets.
  - ð: Saami only.
- **Vowels:** i, u, o and a appear everywhere. Front rounded y and ø appear in Finnish, Estonian and Hungarian. Estonian and Udmurt add ɤ. Length contrast (ː) appears in Finnish, Hungarian and Saami. Diphthongs are listed as phonemes only in Saami (ua).

## Ranges
- Consonants: 17 to 63 as listed; singletons (no ː) are Finnish 16, Estonian 17, Hungarian 26, Saami 32, Udmurt 29 and Nenets 26.
- Vowel qualities: 5 to 10.
- Long vowels: in 3 of 6 inventories.

## Typology (WALS, where coded)
- Affixation (26A): strongly suffixing in all 6.
- Case (51A): case suffixes in all 6.
- Adpositions (85A): postpositions in all 6.
- Genitive (86A) and adjective (87A): Genitive-Noun and Adjective-Noun in all 6.
- Case count (49A): 10 or more in Finnish, Estonian, Hungarian and Udmurt; 6-7 in Saami and Nenets.
- Order (81A): SVO for Finnish, Estonian and Saami; SOV for Udmurt and Nenets; no dominant order for Hungarian.
- Gender (30A): none.
- Articles: none, except Hungarian.
- Fusion (20A): exclusively concatenative.
- Tone (13A): none.

## What varies
- Word order (SVO in the west, SOV in the east).
- Vowel harmony (Finnish and Hungarian yes; standard Estonian and Udmurt no).
- Size of case inventory.
- Consonant inventories: palatalisation versus length and gradation.

## Gaps
- WALS has no 1A, 2A, 12A, 13A, 20A, 30A or 98A values for Estonian, Northern Saami or Udmurt.
- No Erzya or Moksha row: they would push the family past the 6-language target, and Nenets was preferred for Samoyedic coverage.
- No historical Uralic language appears in the WALS genus listings, and none was probed in PHOIBLE.
