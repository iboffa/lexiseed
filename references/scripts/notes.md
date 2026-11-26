# Script letter values: scripts.js vs sourced values

Retrieved 2026-11-23. Compares every entry of `T`, `DEVA_V`, `MATRES`, `HMATRES` and `HEBREW_FINAL` in
`src/scripts.js` with the value given on the fetched reference page (see `references/scripts.json` and
`references/manifest/scripts.json`). Values were read from the pages listed; nothing was filled from memory.
Where a page gave romanization only (Devanagari article), IPA was taken from Help:IPA/Hindi and Urdu.

Verdicts:
- **agrees**: the sourced value of the letter is exactly the phoneme, after removing tie bars and slashes/brackets,
  treating ⁽ʰ⁾ as optional and ɡ (U+0261) = g. Vowel-quality and place differences (a/ɑ, e/ɛ, o/ɔ, r/ʁ, x/χ) do NOT
  count as agreement. "agrees" may rely on one language's use of the letter, which is named.
- **approx**: the letter is the nearest available (including a/ɑ-type differences); no source gives a letter for the
  exact sound.
- **differs**: the source gives the letter a different value; an attested alternative is given when one was found.
- **no source**: no fetched page covers the letter for this sound (mostly letter sequences or omitted sounds).
- **INVENTION**: a letter or letter sequence with no attested basis for this sound; flagged for removal or change.

Caveats: the Greek and Armenian main articles had misaligned table columns in extraction, so Help:IPA/Greek and
Help:IPA/Armenian were preferred where they cover a letter. The Georgian alphabet page gives ყ as /qʼ/ and ღ as /ɣ/;
Help:IPA/Georgian gives /χʼ/ and /ʁ/. Greek οι Modern value was extracted as [y], which looks like an extraction error;
it is recorded only as "Ancient [oi]".

## Cyrillic (T.cyrillic)

| phoneme | scripts.js | verdict | sourced value of that letter | attested alternative | source |
|---|---|---|---|---|---|
| p | п | agrees | п [p] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| b | б | agrees | б [b] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| t | т | agrees | т [t] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| d | д | agrees | д [d] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| k | к | agrees | к [k] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| g | г | agrees | г [ɡ] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| q | ҡ | agrees | ҡ [q] (Bashkir) | also қ /q/ (Kazakh, Uzbek) | [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) |
| ʔ | ъ | agrees | ъ/ь [ʔ] (Bashkir); ъ optional /ʔ/ (Chechen) | palochka Ӏ /ʔ/ (Kabardian) | [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) [ce](https://en.wikipedia.org/wiki/Chechen_language) [kbd](https://en.wikipedia.org/wiki/Kabardian_language) |
| m | м | agrees | м [m] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| n | н | agrees | н [n] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| s | с | agrees | с [s] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| z | з | agrees | з [z] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| ʃ | ш | agrees | ш [ʂ] or [ʃ] (Russian), [ʃ] (Bashkir) |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) |
| ʒ | ж | approx | ж [ʐ] (Russian, Bashkir) | no Cyrillic letter given as /ʒ/ in fetched pages | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) |
| tʃ | ч | agrees | ч [tʃ] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) |
| ts | ц | agrees | ц [t͡s] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| dz | ѕ | agrees | ѕ /d͡z/ (Macedonian) |  | [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) |
| dʒ | џ | agrees | џ /dʒ/ (Serbian) | also Bashkir җ [d͡ʒ] | [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) |
| x | х | agrees | х [x] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| χ | х | agrees | х [χ] (Bashkir) |  | [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) |
| f | ф | agrees | ф [f] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| ɸ | ф | agrees | ф [ɸ] (Bashkir) |  | [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) |
| v | в | agrees | в [v] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| β | в | **differs** | в [v] | б [β] (Bashkir) | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) |
| l | л | agrees | л [l] (Bashkir); [ɫ]/[lʲ] Russian |  | [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| ɫ | л | agrees | л [ɫ] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| r | р | agrees | р [r] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| ɾ | р | approx | р [r] | none found | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| ɻ | р | approx | р [r] | none found | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| j | й | agrees | й [j] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| w | ў | agrees | ў /w/ (Belarusian) |  | [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) |
| h | һ | agrees | һ /h/ (Kazakh, Tatar, Buryat, Bashkir) |  | [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) |
| ɲ | нь | approx | нь = н + ь [nʲ] | њ /ɲ/ (Serbian) | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) |
| ŋ | ң | agrees | ң /ŋ/ (Kazakh, Kyrgyz, Tatar, Bashkir) |  | [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) |
| ɕ | щ | agrees | щ [ɕ] (Russian [ɕː]/[ɕ], Kabardian [ɕ]) |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) [kbd](https://en.wikipedia.org/wiki/Kabardian_language) |
| ʑ | жь | agrees | жь [ʑ] (Kabardian) |  | [kbd](https://en.wikipedia.org/wiki/Kabardian_language) |
| tɕ | ч | agrees | ч [t͡ɕ] (Russian) | also ћ /tɕ/ (Serbian) | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) |
| dʑ | џь | **INVENTION** | џь: no source | ђ /dʑ/ (Serbian); Komi ԇ /dʑ/ | [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) [komi](https://en.wikipedia.org/wiki/Komi_language) |
| θ | ѳ | agrees | ѳ fita: infobox [θ] (Greek loans; Russians said /f/) | ҫ [θ] (Bashkir) | [fita](https://en.wikipedia.org/wiki/Fita) [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) |
| ð | ԁ | **INVENTION** | ԁ = Komi De /d/ (Molodtsov alphabet) | ҙ [ð] (Bashkir) | [komide](https://en.wikipedia.org/wiki/Komi_De) [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) |
| ɣ | ғ | **differs** | ғ /ʁ/ (Kazakh, Uzbek, Bashkir) | гӀ /ɣ/ (Chechen) | [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) [ce](https://en.wikipedia.org/wiki/Chechen_language) |
| ʁ | ғ | agrees | ғ /ʁ/ (Kazakh, Uzbek, Bashkir) | also ӷ /ʁ/ (Abkhaz), гъ [ʁ] (Kabardian) | [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) |
| ħ | ҳ | agrees | ҳ /ħ/ (Abkhaz; /h/ in Uzbek) | also хь /ħ/ (Chechen, Kabardian) | [ab](https://en.wikipedia.org/wiki/Abkhaz_alphabet) [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) |
| ʕ | ӷ | **differs** | ӷ /ʁ/ (Abkhaz) | Ӏ /ʕ/ (Chechen) | [ab](https://en.wikipedia.org/wiki/Abkhaz_alphabet) [ce](https://en.wikipedia.org/wiki/Chechen_language) |
| tʲ | ть | agrees | ть [tʲ] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| dʲ | дь | agrees | дь [dʲ] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| nʲ | нь | agrees | нь [nʲ] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| lʲ | ль | agrees | ль [lʲ] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| rʲ | рь | agrees | рь [rʲ] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| sʲ | сь | agrees | сь [sʲ] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| ʎ | ль | approx | ль [lʲ] | љ /ʎ/ (Serbian) | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) |
| ɬ | лъ | agrees | лъ [ɬ] (Kabardian) |  | [kbd](https://en.wikipedia.org/wiki/Kabardian_language) |
| ç | хь | **differs** | хь /ħ/ (Chechen, Kabardian) | none found | [ce](https://en.wikipedia.org/wiki/Chechen_language) [kbd](https://en.wikipedia.org/wiki/Kabardian_language) |
| ʂ | ш | agrees | ш [ʂ] (Russian) |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| tʂ | ч | approx | ч [t͡ɕ]/[tʃ] | ҽ /ʈ͡ʂʰ/ (Abkhaz, aspirated) | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) [ab](https://en.wikipedia.org/wiki/Abkhaz_alphabet) |
| ʈ | т | approx | т [t] | none found | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| ɖ | д | approx | д [d] | none found | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| ɳ | н | approx | н [n] | none found | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| a | а | agrees | а [a] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| e | е | agrees | е [e] (after consonant; [je] initially) |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| i | и | agrees | и [i] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| o | о | agrees | о [o] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| u | у | agrees | у [u] |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| ɨ | ы | agrees | ы [ɨ] (Russian, Abkhaz) |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) [ab](https://en.wikipedia.org/wiki/Abkhaz_alphabet) |
| ə | ә | **differs** | ә /æ/ (Kazakh, Tatar, Bashkir); /◌ʷ/ (Abkhaz) | none found | [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) [ab](https://en.wikipedia.org/wiki/Abkhaz_alphabet) |
| y | ү | agrees | ү /y/ (Kyrgyz, Tatar) |  | [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) |
| ø | ө | agrees | ө [ø] (Bashkir; /œ/ Kyrgyz, Tatar) |  | [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) |
| æ | ӓ | agrees | ӓ /æ/ (Hill Mari, Gagauz) | also ә /æ/ (Kazakh, Tatar, Bashkir) | [adia](https://en.wikipedia.org/wiki/A_with_diaeresis_(Cyrillic)) [cyr](https://en.wikipedia.org/wiki/Cyrillic_alphabets) |
| ɯ | ы | agrees | ы [ɯ] (Bashkir) |  | [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) |
| ɛ | э | agrees | э [ɛ] (Russian) |  | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| ɔ | о | approx | о [o] | none found | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| ɤ | ы | no source | ы [ɨ]/[ɯ] | none found | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) |
| ɑ | а | agrees | а [ɑ] (Bashkir) |  | [ba](https://en.wikipedia.org/wiki/Bashkir_alphabet) |
| ᵐb | мб | no source | мб = м [m] + б [b] (sequence) | none found | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| ⁿd | нд | no source | нд = н [n] + д [d] (sequence) | none found | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| ᵑɡ | нг | no source | нг = н [n] + г [ɡ] (sequence) | none found | [ru](https://en.wikipedia.org/wiki/Russian_alphabet) |
| tʼ | тӀ | agrees | тӀ [tʼ] (Chechen, Kabardian) |  | [ce](https://en.wikipedia.org/wiki/Chechen_language) [kbd](https://en.wikipedia.org/wiki/Kabardian_language) |
| kʼ | кӀ | agrees | кӀ /kʼ/ (Chechen); [kʼ]~[t͡ʃʼ] (Kabardian) |  | [ce](https://en.wikipedia.org/wiki/Chechen_language) [kbd](https://en.wikipedia.org/wiki/Kabardian_language) |
| c | кь | **differs** | кь: no source | Komi т before ь/soft vowels = /c/ (i.e. ть) | [komi](https://en.wikipedia.org/wiki/Komi_language) |
| ɟ | гь | **differs** | гь: no source | Komi д before ь/soft vowels = /ɟ/ (i.e. дь) | [komi](https://en.wikipedia.org/wiki/Komi_language) |

80 mappings: 57 agree, 10 approx, 7 differ, 4 no source, 2 invention.

## Greek (T.greek)

| phoneme | scripts.js | verdict | sourced value of that letter | attested alternative | source |
|---|---|---|---|---|---|
| p | π | agrees | π [p] |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| b | β | agrees | β [b] (Ancient); Modern [v] | μπ /b/ (Modern) | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) [grIPA](https://en.wikipedia.org/wiki/Help:IPA/Greek) |
| t | τ | agrees | τ [t] |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| d | δ | agrees | δ [d̪] (Ancient); Modern [ð] | ντ /d/ (Modern) | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) [grIPA](https://en.wikipedia.org/wiki/Help:IPA/Greek) |
| k | κ | agrees | κ [k] |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| g | γ | agrees | γ [ɡ] (Ancient); Modern [ɣ] | γκ/γγ /ɡ/ (Modern) | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) [grIPA](https://en.wikipedia.org/wiki/Help:IPA/Greek) |
| m | μ | agrees | μ [m] |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| n | ν | agrees | ν [n] |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| s | σ | agrees | σ [s] |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| z | ζ | agrees | ζ [z] (Modern) |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) [grIPA](https://en.wikipedia.org/wiki/Help:IPA/Greek) |
| l | λ | agrees | λ [l] |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| r | ρ | agrees | ρ [r] |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| ɾ | ρ | agrees | ρ [r] ~ [ɾ] (Modern) |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| f | φ | agrees | φ [f] (Modern) |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| v | β | agrees | β [v] (Modern) |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| θ | θ | agrees | θ [θ] (Modern) |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| ð | δ | agrees | δ [ð] (Modern) |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| x | χ | agrees | χ [x] (Modern) |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| ɣ | γ | agrees | γ [ɣ] (Modern) |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| pʰ | φ | agrees | φ [pʰ] (Ancient) |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| tʰ | θ | agrees | θ [t̪ʰ] (Ancient) |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| kʰ | χ | agrees | χ [kʰ] (Ancient) |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| j | ι | agrees | ι /j/ |  | [grIPA](https://en.wikipedia.org/wiki/Help:IPA/Greek) |
| h | ἡ | **differs** | ἡ = eta with rough breathing (adds vowel [ɛː]/[i]) | rough breathing ῾ on the following vowel (Ancient /h/) | [grIPA](https://en.wikipedia.org/wiki/Help:IPA/Greek) [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| w | ου | **differs** | ου [u] | υ /w/ | [grIPA](https://en.wikipedia.org/wiki/Help:IPA/Greek) [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| ʃ | σσ | **INVENTION** | σσ: no source (σσ is a geminate/double s) | no Greek spelling for /ʃ/ in fetched pages | [grIPA](https://en.wikipedia.org/wiki/Help:IPA/Greek) [gro](https://en.wikipedia.org/wiki/Greek_orthography) |
| tʃ | τσ | **differs** | τσ [t͡s] | no Greek spelling for /tʃ/ in fetched pages | [gro](https://en.wikipedia.org/wiki/Greek_orthography) [grIPA](https://en.wikipedia.org/wiki/Help:IPA/Greek) |
| ts | τσ | agrees | τσ [t͡s] |  | [gro](https://en.wikipedia.org/wiki/Greek_orthography) [grIPA](https://en.wikipedia.org/wiki/Help:IPA/Greek) |
| dz | τζ | agrees | τζ [d͡z] |  | [gro](https://en.wikipedia.org/wiki/Greek_orthography) [grIPA](https://en.wikipedia.org/wiki/Help:IPA/Greek) |
| dʒ | τζ | **differs** | τζ [d͡z] | no Greek spelling for /dʒ/ in fetched pages | [gro](https://en.wikipedia.org/wiki/Greek_orthography) [grIPA](https://en.wikipedia.org/wiki/Help:IPA/Greek) |
| ʒ | ζ | **differs** | ζ [z] | none found | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) [grIPA](https://en.wikipedia.org/wiki/Help:IPA/Greek) |
| q | κ | approx | κ [k] | none found | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| ʔ | (empty) | no source | (omitted) | none found (Glottal stop article gives no Greek letter) | [gs](https://en.wikipedia.org/wiki/Glottal_stop) |
| ŋ | γκ | **differs** | γκ [ŋɡ]/[ɡ] | γ /ŋ/ before γ κ ξ χ | [grIPA](https://en.wikipedia.org/wiki/Help:IPA/Greek) [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| ɲ | νι | agrees | νι: ν [ɲ] before unstressed ι + vowel |  | [omgr](https://www.omniglot.com/writing/greek.htm) [grIPA](https://en.wikipedia.org/wiki/Help:IPA/Greek) |
| χ | χ | agrees | χ [χ] before a o u (Modern) |  | [omgr](https://www.omniglot.com/writing/greek.htm) |
| a | α | agrees | α [a] |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| e | ε | agrees | ε [e] |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| i | ι | agrees | ι [i] |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| o | ο | agrees | ο [o] |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| u | ου | agrees | ου [u] |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| y | υ | agrees | υ [y] (Ancient) |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| ɛ | ε | approx | ε [e] | η [ɛː] only for long (Ancient) | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| ɔ | ο | approx | ο [o] | ω [ɔː] only for long (Ancient) | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| ə | ε | no source | ε [e] | none found | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| ɨ | υ | no source | υ [y]/[i] | none found | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| æ | αι | **differs** | αι Ancient [ai], Modern [e] | none found | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| ø | οι | **differs** | οι Ancient [oi], Modern [i] | none found | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| ɯ | υ | no source | υ [y]/[i] | none found | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| ɑ | α | approx | α [a] | none found | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| aː | α | agrees | α [aː] long (Ancient) |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| eː | η | **differs** | η [ɛː] (Ancient) | ει [eː] (Ancient) | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| oː | ω | **differs** | ω [ɔː] (Ancient) | none found ([oː] not given for any letter) | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| iː | ει | **differs** | ει [eː] (Ancient), [i] (Modern) | ι [iː] long (Ancient) | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| uː | ου | approx | ου [u] | none found | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) |
| ᵐb | μπ | agrees | μπ [mb]/[b] |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) [omgr](https://www.omniglot.com/writing/greek.htm) |
| ⁿd | ντ | agrees | ντ [nd]/[d] |  | [gr](https://en.wikipedia.org/wiki/Greek_alphabet) [omgr](https://www.omniglot.com/writing/greek.htm) |
| ᵑɡ | γγ | agrees | γγ [ŋɡ] |  | [grIPA](https://en.wikipedia.org/wiki/Help:IPA/Greek) [omgr](https://www.omniglot.com/writing/greek.htm) |

58 mappings: 37 agree, 5 approx, 11 differ, 4 no source, 1 invention.

## Georgian (T.georgian)

| phoneme | scripts.js | verdict | sourced value of that letter | attested alternative | source |
|---|---|---|---|---|---|
| a | ა | approx | ა /ɑ/ | none found | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| b | ბ | agrees | ბ /b/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| g | გ | agrees | გ /ɡ/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| d | დ | agrees | დ /d/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| e | ე | approx | ე /ɛ/ (Help:IPA e) | none found | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| v | ვ | agrees | ვ /v/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| z | ზ | agrees | ზ /z/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| tʰ | თ | agrees | თ /t⁽ʰ⁾/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| i | ი | agrees | ი /i/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| kʼ | კ | agrees | კ /kʼ/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| l | ლ | agrees | ლ /l/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| m | მ | agrees | მ /m/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| n | ნ | agrees | ნ /n/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| o | ო | approx | ო /ɔ/ (Help:IPA o) | none found | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| pʼ | პ | agrees | პ /pʼ/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| ʒ | ჟ | agrees | ჟ /ʒ/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| r | რ | agrees | რ /r/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| ɾ | რ | approx | რ /r/ | none found | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) |
| s | ს | agrees | ს /s/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| tʼ | ტ | agrees | ტ /tʼ/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| u | უ | agrees | უ /u/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| pʰ | ფ | agrees | ფ /p⁽ʰ⁾/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| kʰ | ქ | agrees | ქ /k⁽ʰ⁾/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| ɣ | ღ | agrees | ღ /ɣ/ (Help:IPA ʁ) |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| q | ყ | **differs** | ყ /qʼ/ (Georgian alphabet) or /χʼ/ (Help:IPA) | archaic ჴ /q⁽ʰ⁾/ (retained in Svan) | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) [ka](https://en.wikipedia.org/wiki/Georgian_scripts) |
| ʃ | შ | agrees | შ /ʃ/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| tʃ | ჩ | agrees | ჩ /tʃ⁽ʰ⁾/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| ts | ც | agrees | ც /ts⁽ʰ⁾/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| dz | ძ | agrees | ძ /dz/ |  | [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| x | ხ | approx | ხ /χ/ | none found (no velar letter) | [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| χ | ხ | agrees | ხ /χ/ |  | [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| dʒ | ჯ | agrees | ჯ /dʒ/ |  | [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| h | ჰ | agrees | ჰ /h/ |  | [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| p | პ | **differs** | პ /pʼ/ (ejective) | ფ /p⁽ʰ⁾/, nationally romanized p | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) |
| t | ტ | **differs** | ტ /tʼ/ (ejective) | თ /t⁽ʰ⁾/, nationally romanized t | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) |
| k | კ | **differs** | კ /kʼ/ (ejective) | ქ /k⁽ʰ⁾/, nationally romanized k | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) |
| f | ჶ | agrees | ჶ fi: used for foreign names; Help:IPA marginal /f/ |  | [ka](https://en.wikipedia.org/wiki/Georgian_scripts) [kaIPA](https://en.wikipedia.org/wiki/Help:IPA/Georgian) |
| j | ჲ | agrees | ჲ /j/ (obsolete in Georgian; Mingrelian, Laz) |  | [ka](https://en.wikipedia.org/wiki/Georgian_scripts) |
| w | ჳ | agrees | ჳ Svan /w/ (Old Georgian /wi~vi/) |  | [ka](https://en.wikipedia.org/wiki/Georgian_scripts) |
| ə | ჷ | agrees | ჷ /ə/ (Mingrelian, Svan) |  | [ka](https://en.wikipedia.org/wiki/Georgian_scripts) |
| ʔ | ჸ | agrees | ჸ /ʔ/ (Mingrelian, Svan) |  | [ka](https://en.wikipedia.org/wiki/Georgian_scripts) |
| θ | თ | **differs** | თ /t⁽ʰ⁾/ | none found | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) |
| ð | დ | **differs** | დ /d/ | none found | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) |
| ŋ | ნგ | no source | ნგ = ნ /n/ + გ /ɡ/ (sequence) | none found | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) |
| ɲ | ნჲ | no source | ნჲ = ნ /n/ + ჲ /j/ (sequence) | none found | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) [ka](https://en.wikipedia.org/wiki/Georgian_scripts) |
| y | უ | approx | უ /u/ | none found | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) |
| ø | ო | approx | ო /ɔ/ | none found | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) |
| ɨ | ჷ | approx | ჷ /ə/ | none found | [ka](https://en.wikipedia.org/wiki/Georgian_scripts) |
| æ | ა | approx | ა /ɑ/ | none found | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) |
| ɛ | ე | agrees | ე /ɛ/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) |
| ɔ | ო | agrees | ო /ɔ/ |  | [kaa](https://en.wikipedia.org/wiki/Georgian_alphabet) |
| ɯ | ჷ | approx | ჷ /ə/ | none found | [ka](https://en.wikipedia.org/wiki/Georgian_scripts) |

52 mappings: 34 agree, 10 approx, 6 differ, 2 no source, 0 invention.

## Armenian (T.armenian)

| phoneme | scripts.js | verdict | sourced value of that letter | attested alternative | source |
|---|---|---|---|---|---|
| a | ա | approx | ա /ɑ/ | none found | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| b | բ | agrees | բ /b/ (Eastern) |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| g | գ | agrees | գ /ɡ/ (Eastern) |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| d | դ | agrees | դ /d/ (Eastern) |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| e | ե | approx | ե /ɛ/ ([jɛ] initially) | none found | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) [hy](https://en.wikipedia.org/wiki/Armenian_alphabet) |
| z | զ | agrees | զ /z/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| ə | ը | agrees | ը /ə/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| tʰ | թ | agrees | թ /tʰ/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| ʒ | ժ | agrees | ժ /ʒ/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| i | ի | agrees | ի /i/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| l | լ | agrees | լ /l/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| χ | խ | agrees | խ /χ/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| x | խ | approx | խ /χ/ | none found | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| ts | ծ | agrees | ծ /ts/ (Eastern) |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| k | կ | agrees | կ /k/ (Eastern) |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| h | հ | agrees | հ /h/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| dz | ձ | agrees | ձ /dz/ (Eastern) |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| ɣ | ղ | approx | ղ /ʁ/ | none found | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| ʁ | ղ | agrees | ղ /ʁ/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| tʃ | ճ | agrees | ճ /tʃ/ (Eastern) |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| m | մ | agrees | մ /m/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| j | յ | agrees | յ /j/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| n | ն | agrees | ն /n/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| ʃ | շ | agrees | շ /ʃ/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| o | ո | **differs** | ո /ɔ/ ([vɔ] initially) | օ /o/ | [hy](https://en.wikipedia.org/wiki/Armenian_alphabet) [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| p | պ | agrees | պ /p/ (Eastern) |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| dʒ | ջ | agrees | ջ /dʒ/ (Eastern) |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| r | ռ | agrees | ռ /r/ (trill) |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| s | ս | agrees | ս /s/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| v | վ | agrees | վ /v/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| t | տ | agrees | տ /t/ (Eastern) |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| ɾ | ր | agrees | ր /ɹ~ɻ~ɾ/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| w | ւ | agrees | ւ /w/, /v/ |  | [hy](https://en.wikipedia.org/wiki/Armenian_alphabet) |
| pʰ | փ | agrees | փ /pʰ/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| kʰ | ք | agrees | ք /kʰ/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| f | ֆ | agrees | ֆ /f/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| u | ու | agrees | ու /u/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| ɛ | է | agrees | է /e/, /ɛ/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) [hy](https://en.wikipedia.org/wiki/Armenian_alphabet) |
| ɔ | օ | agrees | օ (Help:IPA ɔ: ո, օ) |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| q | ք | **differs** | ք /kʰ/ | none found | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| θ | թ | **differs** | թ /tʰ/ | none found | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| ð | դ | **differs** | դ /d/ | none found | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| ŋ | նգ | **differs** | նգ = ն + գ /ɡ/ | ն alone (Help:IPA gives /ŋ/ as ն) | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| ɲ | նյ | no source | նյ = ն + յ (sequence) | none found | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| y | իւ | agrees | իւ /ʏ/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| ø | էօ | agrees | էօ /œ/ |  | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| æ | ա | approx | ա /ɑ/ | none found | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| ɨ | ը | approx | ը /ə/ | none found | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |
| ʔ | (empty) | no source | (omitted) | none found | [gs](https://en.wikipedia.org/wiki/Glottal_stop) |
| ɯ | ը | approx | ը /ə/ | none found | [hyIPA](https://en.wikipedia.org/wiki/Help:IPA/Armenian) |

50 mappings: 36 agree, 7 approx, 5 differ, 2 no source, 0 invention.

## Runic, Elder Futhark (T.runic)

| phoneme | scripts.js | verdict | sourced value of that letter | attested alternative | source |
|---|---|---|---|---|---|
| f | ᚠ | agrees | ᚠ /f/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| u | ᚢ | agrees | ᚢ /u/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| θ | ᚦ | agrees | ᚦ /θ/ or /ð/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| ð | ᚦ | agrees | ᚦ /θ/ or /ð/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| a | ᚨ | approx | ᚨ a /ɑ/ | none found | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| r | ᚱ | agrees | ᚱ /r/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| ɾ | ᚱ | approx | ᚱ /r/ | none found | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| k | ᚲ | agrees | ᚲ /k/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| g | ᚷ | agrees | ᚷ /g/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| ɣ | ᚷ | agrees | ᚷ /ɣ/ (consonant chart) |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| w | ᚹ | agrees | ᚹ /w/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| v | ᚹ | approx | ᚹ /w/ | none found | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| h | ᚺ | agrees | ᚺ /h/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| x | ᚺ | agrees | ᚺ /x/ (consonant chart) |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| ç | ᚺ | approx | ᚺ /h/, /x/ | none found | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| n | ᚾ | agrees | ᚾ /n/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| i | ᛁ | agrees | ᛁ /i/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| j | ᛃ | agrees | ᛃ /j/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| p | ᛈ | agrees | ᛈ /p/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| z | ᛉ | agrees | ᛉ /z/ (later ʀ) |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| s | ᛊ | agrees | ᛊ /s/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| ʃ | ᛊᚺ | **INVENTION** | ᛊᚺ: no source | none found (no rune or combination for /ʃ/) | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| t | ᛏ | agrees | ᛏ /t/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| b | ᛒ | agrees | ᛒ /b/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| e | ᛖ | agrees | ᛖ /e/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| ɛ | ᛖ | approx | ᛖ /e/ | none found | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| ə | ᛖ | approx | ᛖ /e/ | none found | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| m | ᛗ | agrees | ᛗ /m/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| l | ᛚ | agrees | ᛚ /l/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| ŋ | ᛜ | agrees | ᛜ /ŋ/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| o | ᛟ | agrees | ᛟ /o/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| ɔ | ᛟ | approx | ᛟ /o/ | none found | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| d | ᛞ | agrees | ᛞ /d/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| y | ᚢᛁ | **INVENTION** | ᚢᛁ: no source | none found (no rune for /y/) | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| ø | ᛟᛁ | **INVENTION** | ᛟᛁ: no source | none found (no rune for /ø/) | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| æ | ᚨᛁ | **INVENTION** | ᚨᛁ: no source | ᛇ ï or æ, /ɪ/ or /æ/ (value disputed) | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| ɑ | ᚨ | agrees | ᚨ /ɑ/ |  | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| ts | ᛏᛊ | **INVENTION** | ᛏᛊ: no source | none found | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| tʃ | ᛏᛊ | **INVENTION** | ᛏᛊ: no source | none found | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| dʒ | ᛞᛉ | **INVENTION** | ᛞᛉ: no source | none found | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| q | ᚲ | approx | ᚲ /k/ | none found | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| ʔ | (empty) | no source | (omitted) | none found | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| pʰ | ᛈ | approx | ᛈ /p/ | none found | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| tʰ | ᛏ | approx | ᛏ /t/ | none found | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| kʰ | ᚲ | approx | ᚲ /k/ | none found | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| ɨ | ᛁ | approx | ᛁ /i/ | ᛇ ï /ɪ/ (disputed) | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |
| ʒ | ᛉ | approx | ᛉ /z/ | none found | [fu](https://en.wikipedia.org/wiki/Elder_Futhark) |

47 mappings: 26 agree, 13 approx, 0 differ, 1 no source, 7 invention.

## Arabic (T.arabic)

| phoneme | scripts.js | verdict | sourced value of that letter | attested alternative | source |
|---|---|---|---|---|---|
| b | ب | agrees | ب /b/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| t | ت | agrees | ت /t/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| θ | ث | agrees | ث /θ/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| dʒ | ج | agrees | ج /d͡ʒ/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ħ | ح | agrees | ح /ħ/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| x | خ | agrees | خ /x/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| χ | خ | approx | خ /x/ | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| d | د | agrees | د /d/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ð | ذ | agrees | ذ /ð/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| r | ر | agrees | ر /r/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ɾ | ر | approx | ر /r/ | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| z | ز | agrees | ز /z/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| s | س | agrees | س /s/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ʃ | ش | agrees | ش /ʃ/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| sˤ | ص | agrees | ص /sˤ/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| dˤ | ض | agrees | ض /dˤ/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| tˤ | ط | agrees | ط /tˤ/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ʕ | ع | agrees | ع /ʕ/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ɣ | غ | agrees | غ /ɣ/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ʁ | غ | approx | غ /ɣ/ ([ɢ], [ɣ] Persian) | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) [fa](https://en.wikipedia.org/wiki/Persian_alphabet) |
| f | ف | agrees | ف /f/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| q | ق | agrees | ق /q/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| k | ك | agrees | ك /k/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| l | ل | agrees | ل /l/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| m | م | agrees | م /m/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| n | ن | agrees | ن /n/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| h | ه | agrees | ه /h/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| w | و | agrees | و /w/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| j | ي | agrees | ي /j/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ʔ | ء | agrees | ء /ʔ/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| p | پ | agrees | پ /p/ (foreign words; Persian) |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) [fa](https://en.wikipedia.org/wiki/Persian_alphabet) |
| v | ڤ | agrees | ڤ /v/ (foreign names and loanwords) |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| g | گ | agrees | گ /ɡ/ (Persian; Gulf/Iraqi Arabic) | also ڨ (Algeria, Tunisia), ڭ (Morocco) | [fa](https://en.wikipedia.org/wiki/Persian_alphabet) [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| tʃ | چ | agrees | چ /t͡ʃ/ (Persian; Gulf/Iraqi Arabic) |  | [fa](https://en.wikipedia.org/wiki/Persian_alphabet) [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ʒ | ژ | agrees | ژ /ʒ/ (Persian) |  | [fa](https://en.wikipedia.org/wiki/Persian_alphabet) |
| ts | تس | no source | تس = ت + س (sequence) | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ŋ | نگ | no source | نگ = ن + گ (sequence) | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) [fa](https://en.wikipedia.org/wiki/Persian_alphabet) |
| ɲ | ني | no source | ني = ن + ي (sequence) | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| tʰ | ت | approx | ت /t/ | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| kʰ | ك | approx | ك /k/ | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| pʰ | پ | approx | پ /p/ | none found | [fa](https://en.wikipedia.org/wiki/Persian_alphabet) |
| ç | خ | approx | خ /x/ | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |

42 mappings: 32 agree, 7 approx, 0 differ, 3 no source, 0 invention.

## Arabic vowel letters (MATRES)

| phoneme | scripts.js | verdict | sourced value of that letter | attested alternative | source |
|---|---|---|---|---|---|
| a | ا | agrees | ا /aː/ (long a) |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| e | ي | no source | ي /iː/; Persian ی [i], word-final ه [e] | none found for ي as e | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) [fa](https://en.wikipedia.org/wiki/Persian_alphabet) |
| i | ي | agrees | ي /iː/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| o | و | agrees | و [o] (Persian); Arabic /uː/ |  | [fa](https://en.wikipedia.org/wiki/Persian_alphabet) [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| u | و | agrees | و /uː/ |  | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ə | (empty) | no source | (omitted) | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ɛ | ي | no source | ي /iː/ | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ɔ | و | approx | و /uː/, Persian [o] | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) [fa](https://en.wikipedia.org/wiki/Persian_alphabet) |
| y | و | no source | و /uː/ | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ø | و | no source | و /uː/ | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ɨ | ي | no source | ي /iː/ | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| æ | ا | approx | ا /aː/ (Persian ا [ɒ]) | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) [fa](https://en.wikipedia.org/wiki/Persian_alphabet) |
| ɑ | ا | approx | ا Persian [ɒ]; Arabic /aː/ | none found | [fa](https://en.wikipedia.org/wiki/Persian_alphabet) [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ɯ | و | no source | و /uː/ | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |
| ɤ | و | no source | و /uː/ | none found | [ar](https://en.wikipedia.org/wiki/Arabic_alphabet) |

15 mappings: 4 agree, 3 approx, 0 differ, 8 no source, 0 invention.

## Hebrew (T.hebrew)

| phoneme | scripts.js | verdict | sourced value of that letter | attested alternative | source |
|---|---|---|---|---|---|
| b | ב | agrees | ב [v], בּ [b] with dagesh |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| g | ג | agrees | ג [ɡ] (with dagesh) |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| d | ד | agrees | ד [d] (with dagesh) |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| h | ה | agrees | ה [h] |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| v | ו | agrees | ו [v] |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| w | ו | **differs** | ו [v] | ו׳ or וו /w/ (loanwords, non-standard) | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| z | ז | agrees | ז [z] |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| ħ | ח | agrees | ח /ħ/ (Biblical; Modern [χ]) |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| x | כ | agrees | כ (no dagesh) [χ]; ך [x]~[χ] |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| χ | כ | agrees | כ (no dagesh) [χ] |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| tˤ | ט | agrees | ט /tˤ/ (Biblical; Modern [t]) |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| j | י | agrees | י [j] |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| k | ק | agrees | ק [k] (Modern) | also כּ [k] with dagesh | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| l | ל | agrees | ל [l] |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| m | מ | agrees | מ [m] |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| n | נ | agrees | נ [n] |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| s | ס | agrees | ס [s] |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| ʕ | ע | agrees | ע /ʕ/ (Biblical; Modern [ʔ] or silent) |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| p | פ | agrees | פּ [p] with dagesh |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| f | פ | agrees | פ [f] (no dagesh) |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| sˤ | צ | agrees | צ /sˤ/ (Biblical) |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| ts | צ | agrees | צ [ts] (Modern) |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| q | ק | agrees | ק /q/ (Biblical) |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| r | ר | approx | ר [ʁ] (Modern) | none found | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| ɾ | ר | approx | ר [ʁ] | none found | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| ʃ | ש | agrees | שׁ [ʃ] |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| t | ת | agrees | ת [t] |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| ʔ | א | agrees | א [ʔ] or silent |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) [gs](https://en.wikipedia.org/wiki/Glottal_stop) |
| θ | ת | **differs** | ת /t/ (spirant [θ] only as Biblical allophone; Iraqi/Yemenite) | ת׳ [θ] (geresh) | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| ð | ד | **differs** | ד /d/ (spirant [ð] only as Biblical allophone) | ד׳ [ð] (geresh) | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| ɣ | ג | **differs** | ג /ɡ/ (spirant [ɣ] only as Biblical allophone) | closest attested: ע׳ or ר׳ [ʁ] (Arabic transliteration) | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| tʃ | צ׳ | agrees | צ׳ [t͡ʃ] |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| dʒ | ג׳ | agrees | ג׳ [d͡ʒ] |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| ʒ | ז׳ | agrees | ז׳ [ʒ] |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| dˤ | צ׳ | agrees | צ׳ [dˤ] (scientific transliteration) |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| ŋ | נג | no source | נג = נ + ג (sequence) | none found | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| ɲ | ני | no source | ני = נ + י (sequence) | none found | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| tʰ | ת | approx | ת [t] | none found | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| kʰ | כ | approx | כ [χ] (no dagesh) | כּ [k] or ק [k]; no aspirate letter | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |

39 mappings: 29 agree, 4 approx, 4 differ, 2 no source, 0 invention.

## Hebrew vowel letters (HMATRES)

| phoneme | scripts.js | verdict | sourced value of that letter | attested alternative | source |
|---|---|---|---|---|---|
| a | א | agrees | א occasionally marks a; final ה marks a or e (code uses ה word-finally) |  | [mater](https://en.wikipedia.org/wiki/Mater_lectionis) |
| e | י | agrees | י indicates i or e |  | [mater](https://en.wikipedia.org/wiki/Mater_lectionis) |
| i | י | agrees | י indicates i or e |  | [mater](https://en.wikipedia.org/wiki/Mater_lectionis) |
| o | ו | agrees | ו indicates o or u |  | [mater](https://en.wikipedia.org/wiki/Mater_lectionis) |
| u | ו | agrees | ו indicates o or u |  | [mater](https://en.wikipedia.org/wiki/Mater_lectionis) |
| ə | (empty) | no source | (omitted) | none found | [mater](https://en.wikipedia.org/wiki/Mater_lectionis) |
| ɛ | י | approx | י (i or e) | none found | [mater](https://en.wikipedia.org/wiki/Mater_lectionis) |
| ɔ | ו | approx | ו (o or u) | none found | [mater](https://en.wikipedia.org/wiki/Mater_lectionis) |
| y | ו | no source | ו (o or u) | none found | [mater](https://en.wikipedia.org/wiki/Mater_lectionis) |
| ø | ו | no source | ו (o or u) | none found | [mater](https://en.wikipedia.org/wiki/Mater_lectionis) |
| ɨ | י | no source | י (i or e) | none found | [mater](https://en.wikipedia.org/wiki/Mater_lectionis) |
| æ | א | approx | א (occasionally a) | none found | [mater](https://en.wikipedia.org/wiki/Mater_lectionis) |
| ɑ | א | approx | א (occasionally a) | none found | [mater](https://en.wikipedia.org/wiki/Mater_lectionis) |
| ɯ | ו | no source | ו (o or u) | none found | [mater](https://en.wikipedia.org/wiki/Mater_lectionis) |
| ɤ | ו | no source | ו (o or u) | none found | [mater](https://en.wikipedia.org/wiki/Mater_lectionis) |

15 mappings: 5 agree, 4 approx, 0 differ, 6 no source, 0 invention.

## Hebrew final forms (HEBREW_FINAL)

| phoneme | scripts.js | verdict | sourced value of that letter | attested alternative | source |
|---|---|---|---|---|---|
| כ | ך | agrees | ך final kaf |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| מ | ם | agrees | ם final mem |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| נ | ן | agrees | ן final nun |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| פ | ף | agrees | ף final pe |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |
| צ | ץ | agrees | ץ final tsadi |  | [he](https://en.wikipedia.org/wiki/Hebrew_alphabet) |

5 mappings: 5 agree, 0 approx, 0 differ, 0 no source, 0 invention.

## Devanagari consonants (T.devanagari)

| phoneme | scripts.js | verdict | sourced value of that letter | attested alternative | source |
|---|---|---|---|---|---|
| k | क | agrees | क k [k] (Help:IPA) |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| kʰ | ख | agrees | ख kh [kʰ] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| g | ग | agrees | ग g [ɡ] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ɡʱ | घ | agrees | घ gh [ɡʱ] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ŋ | ङ | no source | ङ ṅ (romanization only; Help:IPA writes /ŋ/ with anusvara in रंग) | none found | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| tʃ | च | agrees | च c [t͡ʃ] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| dʒ | ज | agrees | ज j [dʒ] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ɲ | ञ | no source | ञ ñ (romanization only, no IPA on fetched pages) | none found | [dev](https://en.wikipedia.org/wiki/Devanagari) |
| ʈ | ट | agrees | ट ṭ [ʈ] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ɖ | ड | agrees | ड ḍ [ɖ] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ɳ | ण | agrees | ण ṇ [ɳ] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| t | त | agrees | त t [t] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| tʰ | थ | agrees | थ th [tʰ] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| d | द | agrees | द d [d] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| dʱ | ध | agrees | ध dh [dʱ] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| n | न | agrees | न n [n] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| p | प | agrees | प p [p] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| pʰ | फ | agrees | फ ph [pʰ] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| b | ब | agrees | ब b [b] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| bʱ | भ | agrees | भ bh [bʱ] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| m | म | agrees | म m [m] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| j | य | agrees | य y [j] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| r | र | agrees | र r [r] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ɾ | र | agrees | र [ɾ] (ज़रा) |  | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| l | ल | agrees | ल l [l] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| v | व | approx | व [ʋ] | none found | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| w | व | agrees | व [w] (पकवान) |  | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ʃ | श | agrees | श ś [ʃ] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ʂ | ष | agrees | ष ṣ [ʂ] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| s | स | agrees | स s [s] |  | [dev](https://en.wikipedia.org/wiki/Devanagari) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| h | ह | approx | ह [ɦ] | none found | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| f | फ़ | agrees | फ़ /f/ |  | [nukta](https://en.wikipedia.org/wiki/Nukta) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| z | ज़ | agrees | ज़ /z/ |  | [nukta](https://en.wikipedia.org/wiki/Nukta) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| x | ख़ | agrees | ख़ /x/ |  | [nukta](https://en.wikipedia.org/wiki/Nukta) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ɣ | ग़ | agrees | ग़ /ɣ/ |  | [nukta](https://en.wikipedia.org/wiki/Nukta) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| q | क़ | agrees | क़ /q/ |  | [nukta](https://en.wikipedia.org/wiki/Nukta) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ts | त्स | **differs** | त्स = त + virama + स (sequence) | च़ /t͡s/ (Kashmiri) | [nukta](https://en.wikipedia.org/wiki/Nukta) |
| ʒ | झ़ | agrees | झ़ /ʒ/ |  | [nukta](https://en.wikipedia.org/wiki/Nukta) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| θ | थ़ | **INVENTION** | थ़: no source (Nukta page has no /θ/ letter) | none found | [nukta](https://en.wikipedia.org/wiki/Nukta) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ð | द़ | **INVENTION** | द़: no source (Nukta page has no /ð/ letter) | none found | [nukta](https://en.wikipedia.org/wiki/Nukta) [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ʔ | ऽ | **differs** | ऽ avagraha: marks prodelision of अ / vowel prolongation, not a sound | ॽ DEVANAGARI LETTER GLOTTAL STOP U+097D (Limbu) | [avag](https://en.wikipedia.org/wiki/Avagraha) [devblk](https://en.wikipedia.org/wiki/Devanagari_(Unicode_block)) [gs](https://en.wikipedia.org/wiki/Glottal_stop) |
| χ | ख़ | approx | ख़ /x/ | none found | [nukta](https://en.wikipedia.org/wiki/Nukta) |
| ç | श़ | **INVENTION** | श़: no source | none found | [nukta](https://en.wikipedia.org/wiki/Nukta) |

43 mappings: 33 agree, 3 approx, 2 differ, 2 no source, 3 invention.

## Devanagari vowels (DEVA_V: independent / sign)

| phoneme | scripts.js | verdict | sourced value of that letter | attested alternative | source |
|---|---|---|---|---|---|
| a | अ / (none) | approx | अ [ə] (कल) | none found | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| aː | आ / ा | agrees | आ / ा [aː] (काम) |  | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| i | इ / ि | approx | इ / ि [ɪ] (जितना) | none found | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| iː | ई / ी | agrees | ई / ी [iː] |  | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| u | उ / ु | approx | उ / ु [ʊ] (उन) | none found | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| uː | ऊ / ू | agrees | ऊ / ू [uː] |  | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| e | ए / े | approx | ए / े [eː] (जेब) | none found | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| eː | ए / े | agrees | ए / े [eː] |  | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| o | ओ / ो | approx | ओ / ो [oː] (बोलो) | none found | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| oː | ओ / ो | agrees | ओ / ो [oː] |  | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ɛ | ऐ / ै | approx | ऐ / ै [ɛː] (कैसा) | none found | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ɔ | औ / ौ | approx | औ / ौ [ɔː] (कौन) | none found | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ə | अ / (none) | agrees | अ [ə] (inherent vowel) |  | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| æ | ऐ / ै | approx | ऐ [ɛː] | none found | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| y | उ / ु | no source | उ [ʊ] | none found | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ø | ओ / ो | no source | ओ [oː] | none found | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ɨ | इ / ि | no source | इ [ɪ] | none found | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ɯ | उ / ु | no source | उ [ʊ] | none found | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ɑ | आ / ा | approx | आ [aː] | none found | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |
| ɤ | ओ / ो | no source | ओ [oː] | none found | [hiIPA](https://en.wikipedia.org/wiki/Help:IPA/Hindi_and_Urdu) |

20 mappings: 6 agree, 9 approx, 0 differ, 5 no source, 0 invention.

## Inventions and differences to fix (summary)

- **cyrillic**: β:в→б [β] (Bashkir); dʑ:џь→ђ /dʑ/ (Serbian); Komi ԇ /dʑ/; ð:ԁ→ҙ [ð] (Bashkir); ɣ:ғ→гӀ /ɣ/ (Chechen); ʕ:ӷ→Ӏ /ʕ/ (Chechen); ç:хь→none found; ə:ә→none found; c:кь→Komi т before ь/soft vowels = /c/ (i.e. ть); ɟ:гь→Komi д before ь/soft vowels = /ɟ/ (i.e. дь)
- **greek**: h:ἡ→rough breathing ῾ on the following vowel (Ancient /h/); w:ου→υ /w/; ʃ:σσ→no Greek spelling for /ʃ/ in fetched pages; tʃ:τσ→no Greek spelling for /tʃ/ in fetched pages; dʒ:τζ→no Greek spelling for /dʒ/ in fetched pages; ʒ:ζ→none found; ŋ:γκ→γ /ŋ/ before γ κ ξ χ; æ:αι→none found; ø:οι→none found; eː:η→ει [eː] (Ancient); oː:ω→none found ([oː] not given for any letter); iː:ει→ι [iː] long (Ancient)
- **georgian**: q:ყ→archaic ჴ /q⁽ʰ⁾/ (retained in Svan); p:პ→ფ /p⁽ʰ⁾/, nationally romanized p; t:ტ→თ /t⁽ʰ⁾/, nationally romanized t; k:კ→ქ /k⁽ʰ⁾/, nationally romanized k; θ:თ→none found; ð:დ→none found
- **armenian**: o:ո→օ /o/; q:ք→none found; θ:թ→none found; ð:դ→none found; ŋ:նգ→ն alone (Help:IPA gives /ŋ/ as ն)
- **runic**: ʃ:ᛊᚺ→none found (no rune or combination for /ʃ/); y:ᚢᛁ→none found (no rune for /y/); ø:ᛟᛁ→none found (no rune for /ø/); æ:ᚨᛁ→ᛇ ï or æ, /ɪ/ or /æ/ (value disputed); ts:ᛏᛊ→none found; tʃ:ᛏᛊ→none found; dʒ:ᛞᛉ→none found
- **hebrew**: w:ו→ו׳ or וו /w/ (loanwords, non-standard); θ:ת→ת׳ [θ] (geresh); ð:ד→ד׳ [ð] (geresh); ɣ:ג→closest attested: ע׳ or ר׳ [ʁ] (Arabic transliteration)
- **devanagari**: ts:त्स→च़ /t͡s/ (Kashmiri); θ:थ़→none found; ð:द़→none found; ʔ:ऽ→ॽ DEVANAGARI LETTER GLOTTAL STOP U+097D (Limbu); ç:श़→none found

Other code paths: Greek ξ (k+s), ψ (p+s) and final ς agree with the Greek alphabet page; Hebrew word-final ה for a agrees
(Mater lectionis). No fetched page covers: Arabic word-initial أ / إ; Cyrillic long vowels written with a combining
macron (U+0304); Georgian and Armenian long vowels written by doubling the letter. These are unsourced.
