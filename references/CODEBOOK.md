# Codebook v1 (frozen 2026-11-23)

One row per **example language**, coded from primary typological databases. Rows go in
`references/rows/<family>.json` as a JSON list. Every value must be traceable to a source URL in the row's
`source` list. If a source does not give a value, write `null`. Do not fill values from memory.

## Sources (all reference-only: we derive statistics, we copy no content into the generator)

| Source | What | Licence | Use |
|---|---|---|---|
| WALS Online, https://wals.info/ (Dryer & Haspelmath eds. 2013) | typological feature values per language | CC BY 4.0 | reference-only (derived ranges and weights, cited) |
| PHOIBLE 2.0, https://phoible.org/ (Moran & McCloy eds. 2019) | phoneme inventories | CC BY-SA 3.0 | reference-only (presence counts per family, cited) |
| Wikipedia / Unicode charts / Omniglot | script letter values only | CC BY-SA 4.0 / Unicode terms / all rights reserved | reference-only |

## Strata

`style` = the generator family id: `romance, slavic, germanic, hellenic, celtic, indoaryan, semitic, uralic,
turkic, sinitic, japonic, bantu, polynesian`. Target: **6 languages per family** (fewer only where the family has
fewer well-documented languages; say so). Prefer languages that have both a WALS page and a PHOIBLE inventory.
Include at least one historical or classical language where WALS or PHOIBLE covers it (for example Latin,
Ancient Greek, Sanskrit, Classical Arabic), and mark it with `historical: true`.

## Fields

| Field | Type | Definition / allowed values | Source |
|---|---|---|---|
| `id` | string | language name as on WALS | — |
| `style` | string | family id (see Strata) | — |
| `wals_code` | string | e.g. `rus` | WALS |
| `glottocode` | string | e.g. `russ1263` | WALS or PHOIBLE |
| `phoible_inventory` | string | PHOIBLE inventory id used (if several, pick the one from the largest source such as SPA, UPSID or the language-specific one, and name it) | PHOIBLE |
| `consonants` | list of IPA | every consonant phoneme in that PHOIBLE inventory, IPA as given | PHOIBLE |
| `vowels` | list of IPA | every vowel phoneme in that inventory, IPA as given (long, nasal and diphthong entries kept as given) | PHOIBLE |
| `n_consonants` | int | length of `consonants` | derived |
| `n_vowel_qualities` | int | distinct vowel qualities ignoring length (ː), nasalisation (̃) and diphthongs | derived |
| `long_vowels` | bool | true if any vowel in the inventory carries ː | derived |
| `diphthongs` | bool | true if the inventory lists diphthongs as phonemes | derived |
| `wals_1A_consonants` | string | WALS 1A value (Small / Moderately small / Average / Moderately large / Large) | WALS |
| `wals_2A_vowels` | string | WALS 2A value (Small 2-4 / Average 5-6 / Large 7-14) | WALS |
| `wals_12A_syllables` | string | Simple / Moderately complex / Complex | WALS |
| `wals_13A_tone` | string | No tones / Simple tone system / Complex tone system | WALS |
| `wals_20A_fusion` | string | WALS 20A value | WALS |
| `wals_26A_affixation` | string | WALS 26A prefixing vs suffixing value | WALS |
| `wals_30A_genders` | string | None / Two / Three / Four / Five or more | WALS |
| `wals_37A_definite` | string | WALS 37A value | WALS |
| `wals_38A_indefinite` | string | WALS 38A value | WALS |
| `wals_49A_cases` | string | No morphological case-marking / 2 / 3 / 4 / 5 / 6-7 / 8-9 / 10 or more / Exclusively borderline | WALS |
| `wals_51A_case_position` | string | WALS 51A value (case suffixes, prepositional clitics, ...) | WALS |
| `wals_81A_order` | string | SOV / SVO / VSO / VOS / OVS / OSV / No dominant order | WALS |
| `wals_85A_adposition` | string | Postpositions / Prepositions / ... | WALS |
| `wals_86A_genitive` | string | Genitive-Noun / Noun-Genitive / No dominant order | WALS |
| `wals_87A_adjective` | string | Adjective-Noun / Noun-Adjective / ... | WALS |
| `wals_98A_alignment` | string | WALS 98A value (Neutral / Nominative-accusative (standard) / Ergative-absolutive / ...) | WALS |
| `wals_65A_aspect` | string | Grammatical marking / No grammatical marking | WALS |
| `wals_67A_future` | string | Inflectional future exists / No inflectional future | WALS |
| `vowel_harmony` | bool or null | true only if WALS, PHOIBLE notes or the cited grammar source states it | cited source |
| `script` | string | main current writing system (Latin, Cyrillic, Greek, Arabic, Hebrew, Devanagari, Georgian, Armenian, Han, Kana, Hangul, Other) | cited source |
| `historical` | bool | classical or extinct language | — |
| `source` | list of URL | every page the values came from | — |
| `notes` | string | uncertainty, which inventory was chosen and why, values WALS lacks | — |

If WALS lacks a feature for a language, write `null` (WALS coverage is uneven); do not substitute a related
language's value.

**Not codable from these sources:** vowel share in running text and average word length. Those stay as labelled
assumptions in `families.js` unless a corpus with a clear licence is found.

## Script letter values (separate table)

`references/scripts.json`: for each script (cyrillic, greek, georgian, armenian, runic, arabic, hebrew,
devanagari), a list of `{letter, ipa, source}` giving the standard phonemic value of each letter, with the page
it came from. Also list the conventional transliteration for sounds the script lacks (for example Cyrillic for
θ), only when a source shows it.
