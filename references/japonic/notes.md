# Japonic reference sheet (codebook v1)

The family is small and thinly covered: WALS has only Japanese and Shuri (Central Okinawan) on its Japanese genus page; PHOIBLE has Japanese plus two Ryukyuan inventories (Miyako (Ogami) EA 2453, Kunigami (Nakijin) EA 2336) and no Central Okinawan page (cent2126 returned 404 twice; search for Okinawa/Ryukyu/Yonaguni/Amami/Yaeyama/Hachijo found nothing). So 4 rows, not 6:
- Japanese (WALS + PHOIBLE SPA 197)
- Shuri (WALS only, 7 features; PHOIBLE fields null)
- Miyako (Ogami) and Kunigami (Nakijin) (PHOIBLE only; all WALS fields null)
No historical member (Old Japanese) in either source, so `historical` is false.

## Sources
- https://wals.info/languoid/genus/japanese — CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), retrieved 2026-11-23. WALS Japanese genus page: only Japanese and Shuri.
- https://wals.info/languoid/lect/wals_code_jpn — CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), retrieved 2026-11-23. WALS feature values for Japanese.
- https://phoible.org/languages/nucl1643 — CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/), retrieved 2026-11-23. PHOIBLE language page (inventory list) for Japanese.
- https://phoible.org/inventories/view/197 — CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/), retrieved 2026-11-23. PHOIBLE inventory segment list for Japanese.
- https://en.wikipedia.org/wiki/Japanese_language — CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/), retrieved 2026-11-23. Wikipedia infobox script line for Japanese.
- https://wals.info/languoid/lect/wals_code_ryu — CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), retrieved 2026-11-23. WALS feature values for Shuri.
- https://en.wikipedia.org/wiki/Okinawan_language — CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/), retrieved 2026-11-23. Wikipedia infobox script line for Shuri.
- https://phoible.org/languages/miya1259 — CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/), retrieved 2026-11-23. PHOIBLE language page (inventory list) for Miyako (Ogami).
- https://phoible.org/inventories/view/2453 — CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/), retrieved 2026-11-23. PHOIBLE inventory segment list for Miyako (Ogami).
- https://en.wikipedia.org/wiki/Miyakoan_language — CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/), retrieved 2026-11-23. Wikipedia infobox script line for Miyako (Ogami).
- https://phoible.org/languages/kuni1268 — CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/), retrieved 2026-11-23. PHOIBLE language page (inventory list) for Kunigami (Nakijin).
- https://phoible.org/inventories/view/2336 — CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/), retrieved 2026-11-23. PHOIBLE inventory segment list for Kunigami (Nakijin).
- https://en.wikipedia.org/wiki/Kunigami_language — CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/), retrieved 2026-11-23. Wikipedia infobox script line for Kunigami (Nakijin).

Inventory rule applied: SPA if present, else UPSID, else the only (or other) inventory; chosen inventory named in each row. Tones listed by PHOIBLE are kept out of consonant/vowel lists. Marginal segments would be kept (none flagged in these inventories). n_vowel_qualities ignores only ː and nasal tilde, per codebook.

## Ranges
- Consonants: 14 (Miyako) to 27 (Japanese, which lists geminates kː tː pː sː ʃː çː tsː t̠ʃː as separate segments; 19 without them). Kunigami 20.
- Vowel qualities: 5 in all three inventories. Long vowels only in Japanese (SPA). No diphthongs listed.
- WALS (Japanese only): 1A Moderately small, 2A Average (5-6), 12A Moderately complex, 13A Simple tone system (SPA lists tone segments ˥ ˧, kept out of C/V).

## Consonants
- In all 3: s m. In 2 of 3: h w ɡ n b j ɾ z ʔ pʰ kʰ.
- Few: Kunigami glottalised/ejective series pʼ t̺ʼ kʼ cʼ vs aspirated pʰ t̺ʰ kʰ cʰ; Miyako syllabic consonants f̩ m̩ n̩ s̩ ʋ̩ and ʋ; Japanese geminates and t̠ʃ d̠ʒ ʃ.

## Vowels
- Common: i, e̞, a/ä, back unrounded ɯ (Japanese, Miyako ɯ̞) or u (Kunigami). Miyako (EA 2453) lists ä e̞ i̞ ɯ̞ ʊ.

## Typology (WALS, Japanese; Shuri only 85A Postpositions)
- SOV, Postpositions, Genitive-Noun, Adjective-Noun; Strongly suffixing; Exclusively concatenative; 8-9 cases with Postpositional clitics; Nominative - accusative (standard); no gender coded (30A null); No definite, but indefinite article; No grammatical aspect marking; No inflectional future.

## What varies
- Laryngeal contrasts (Kunigami aspirated vs glottalised; Miyako aspirated only; Japanese voicing); syllabic consonants (Miyako); vowel length.

## Gaps
- Ryukyuan morphosyntax is essentially absent from WALS; Shuri has no PHOIBLE inventory. vowel_harmony null throughout.
