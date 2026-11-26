# Semitic: reference sheet (codebook v1, retrieved 2026-11-23)

Rows: `references/rows/semitic.json` (6 languages). Every page used is listed in `references/manifest/semitic.json`.

## Sources
- WALS Online, language and valueset pages, e.g. https://wals.info/languoid/lect/wals_code_ams and https://wals.info/valuesets/81A-ams. CC BY 4.0. Retrieved 2026-11-23.
- WALS genus page https://wals.info/languoid/genus/semitic (used to confirm the codes). CC BY 4.0. Retrieved 2026-11-23.
- PHOIBLE 2.0 language and inventory pages: UZ 2157, SPA 132, SPA 135, SPA 131, GM 1350 and SPA 134 (https://phoible.org/inventories/view/<id>). CC BY-SA 3.0. Retrieved 2026-11-23.
- English Wikipedia articles, one per language (infobox writing system), e.g. https://en.wikipedia.org/wiki/Maltese_language. CC BY-SA 4.0. Retrieved 2026-11-23.
- Glottolog search pages (https://glottolog.org/glottolog?search=<name>) used to get the glottocodes of historical lects for PHOIBLE probes (all returned 404). CC BY 4.0. Retrieved 2026-11-23.

## Languages and inventory
| WALS | Language | PHOIBLE inventory | C | V qualities |
|---|---|---|---|---|
| ams | Arabic (Modern Standard) | UZ 2157 (only one) | 29 | 3 |
| aeg | Arabic (Egyptian) | SPA 132 | 58 | 9 |
| heb | Hebrew (Modern) | SPA 135 | 24 | 6 |
| amh | Amharic | SPA 131 | 52 | 7 |
| tig | Tigrinya | GM 1350 (only one) | 32 | 7 |
| mlt | Maltese | SPA 134 | 45 | 5 |

Inventory rule: SPA, then UPSID, then EA, then UZ, then other. Consonant counts include geminates where the source lists them as phonemes: SPA does this for Egyptian Arabic, Amharic and Maltese. Singleton (non-ː) counts are 29, 32, 24, 31, 32 and 23.

## Segments
- **Consonants in most inventories (at least 4 of 6, raw strings):** s, j, l, ʃ, ʔ, f, m (all 6); b, w, z, h, n, t, p, k (5); ħ, d̠ʒ, t̠ʃ, d, ɡ (4). Geminates (lː, nː, sː, tː, ...) recur in 3 of the 6.
- **Consonants in few inventories:**
  - pharyngealised emphatics (sˤ tˤ dˤ ðˤ zˤ, or retracted s̙ˤ t̪̙ˤ d̙ˤ in UZ 2157): Arabic only.
  - ejectives (tʼ kʼ pʼ sʼ t̠ʃʼ qʼ cʼ kʷʼ): Ethiopian Semitic only (Amharic, Tigrinya).
  - labialised kʷ ɡʷ hʷ: Amharic only.
  - uvular q: Arabic and Tigrinya.
  - ʕ: Arabic and Tigrinya.
  - Modern Hebrew has neither pharyngeals nor emphatics, and it has the fortis/lenis pairs k͉ p͉ t͉.
- **Vowels:**
  - At raw-string level, plain a is in 4 of 6, i and u in 4, o in 3.
  - Hebrew (SPA 135) writes the high vowels as ɪ ʊ.
  - Egyptian Arabic (SPA 132) has only ɪ ʊ ə a̟ short and iː uː eː oː æː long, with no plain i/u/a.
  - So the a/i/u triangle is universal by quality, not by exact symbol. MSA (UZ 2157) has only i u a plus length, and lists ai au ii̯ uu̯ as diphthong-type entries. Ethiopian Semitic adds ɨ and ə/ʌ.

## Ranges
- Consonants: 24 to 58 as listed; 23 to 32 singletons.
- Vowel qualities: 3 to 9.
- Long vowels: in 3 of 6 inventories (MSA, Egyptian Arabic, Maltese).

## Typology (WALS, where coded)
- Order (81A): VSO for MSA; SVO for Egyptian Arabic and Hebrew; SOV for Amharic and Tigrinya.
- Adpositions (85A): prepositions in 4 languages; Amharic has no dominant order.
- Genitive (86A): Noun-Genitive in Arabic and Hebrew.
- Adjective (87A): Noun-Adjective in Arabic and Hebrew; Adjective-Noun in Amharic and Tigrinya.
- Gender (30A): Two, wherever coded.
- Fusion (20A): Ablaut/concatenative (root-and-pattern morphology).
- Definiteness (37A): mostly a definite affix.
- Case (49A): none, except 2 in Amharic.
- Tone (13A): none.

## What varies
- Word order splits by branch: Arabic and Hebrew are VSO/SVO, prepositional and head-initial; Ethiopian Semitic is SOV with modifier-first order.
- Emphatic consonants are pharyngealised in Arabic and ejective in Ethiopic.
- Consonant gemination is phonemic in some inventories.

## Gaps
- WALS has no values for MSA for most phonology and morphology features. Maltese has only 30A, 65A and 67A; Tigrinya is sparse. 1A, 2A, 12A, 13A, 20A and 98A are coded for only 2 of 6 languages.
- `vowel_harmony` is null for all six; no fetched source mentions it.
- No historical Semitic language is coded.
  - None has a WALS page in the Semitic genus listing.
  - PHOIBLE returned 404 for the Glottolog codes of Akkadian (akka1240), Ancient Hebrew (anci1244), Classical Arabic (clas1259), Classical Syriac (clas1252) and Ge'ez (geez1241). Codes were taken from the Glottolog search pages.
- Script: Amharic and Tigrinya use Ge'ez (Ethiopic), coded `Other`.
