# Draft rules extracted from examples (CANDIDATES: confirm each with the user)

71 examples; 0 without a recorded source. Styles: {'bantu': 6, 'celtic': 5, 'germanic': 6, 'hellenic': 1, 'indoaryan': 6, 'japonic': 4, 'polynesian': 6, 'romance': 6, 'semitic': 6, 'sinitic': 6, 'slavic': 7, 'turkic': 6, 'uralic': 6}.
Rules need support >= 3; "strong" needs a 95% lower bound >= 0.8, i.e. about 16+ consistent cases. Everything here is a candidate until the user confirms it; "never together" in n examples still allows a rate up to about 3/n.

## Vocabulary (field: value x count)
- **diphthongs**: False x57, True x9, None x5
- **historical**: False x70, True x1
- **long_vowels**: False x34, True x32, None x5
- **n_consonants**: None x5
- **n_vowel_qualities**: None x5
- **script**: Latin x41, Cyrillic x7, Han x6, Devanagari x4, Other x4, Kana x4, Arabic x2, Greek x1, None x1, Hebrew x1
- **vowel_harmony**: None x62, True x6, False x3
- **wals_12A_syllables**: None x38, Complex x16, Moderately complex x13, Simple x4
- **wals_13A_tone**: None x35, No tones x27, Complex tone system x6, Simple tone system x3
- **wals_1A_consonants**: None x35, Average x18, Moderately large x9, Small x4, Moderately small x3, Large x2
- **wals_20A_fusion**: None x52, Exclusively concatenative x14, Isolating/concatenative x2, Ablaut/concatenative x2, Exclusively isolating x1
- **wals_26A_affixation**: Strongly suffixing x38, None x15, Little affixation x7, Weakly suffixing x6, Strong prefixing x3, Weakly prefixing x1, Equal prefixing and suffixing x1
- **wals_2A_vowels**: None x35, Average (5-6) x18, Large (7-14) x18
- **wals_30A_genders**: None x51, Two x9, Three x7, Five or more x4
- **wals_37A_definite**: None x25, Definite word distinct from demonstrative x21, No definite or indefinite article x12, Definite affix x7, Demonstrative word used as definite article x3, No definite, but indefinite article x3
- **wals_38A_indefinite**: None x25, Indefinite word same as 'one' x18, No definite or indefinite article x12, Indefinite word distinct from 'one' x9, No indefinite, but definite article x7
- **wals_49A_cases**: None x35, No morphological case-marking x15, 2 cases x6, 6-7 cases x5, 10 or more cases x4, 4 cases x2, 5 cases x2, 3 cases x1, 8-9 cases x1
- **wals_51A_case_position**: Case suffixes x29, No case affixes or adpositional clitics x18, None x13, Prepositional clitics x5, Mixed morphological case x3, Case prefixes x2, Postpositional clitics x1
- **wals_65A_aspect**: None x37, Grammatical marking x18, No grammatical marking x16
- **wals_67A_future**: None x37, No inflectional future x20, Inflectional future exists x14
- **wals_81A_order**: SVO x33, SOV x15, None x9, VSO x8, No dominant order x6
- **wals_85A_adposition**: Prepositions x40, Postpositions x16, None x12, No dominant order x3
- **wals_86A_genitive**: Noun-Genitive x30, Genitive-Noun x20, None x13, No dominant order x8
- **wals_87A_adjective**: Adjective-Noun x35, Noun-Adjective x26, None x10
- **wals_98A_alignment**: None x50, Nominative - accusative (standard) x11, Neutral x8, Tripartite x2

Seen once (too rare to generalise; ask whether they are typical): historical=True, script=Greek, script=Hebrew, script=None, wals_20A_fusion=Exclusively isolating, wals_26A_affixation=Equal prefixing and suffixing, wals_26A_affixation=Weakly prefixing, wals_49A_cases=3 cases, wals_49A_cases=8-9 cases, wals_51A_case_position=Postpositional clitics

## Values seen in only one style (candidate style tags)
- script=Devanagari -> only in **indoaryan**
- script=Han -> only in **sinitic**
- script=Kana -> only in **japonic**
- wals_13A_tone=Complex tone system -> only in **sinitic**
- wals_26A_affixation=Strong prefixing -> only in **bantu**
- wals_30A_genders=Five or more -> only in **bantu**
- wals_49A_cases=10 or more cases -> only in **uralic**

## Numeric ranges (min / p10 / median / p90 / max, n)
- n_consonants [all]: 9 / 17 / 24 / 37 / 75 (n=66)
- n_consonants [bantu]: 15 / 23 / 36 / 57 / 75 (n=6)
- n_consonants [celtic]: 25 / 26.2 / 31 / 40.7 / 44 (n=4)
- n_consonants [germanic]: 18 / 20.5 / 23.5 / 25.5 / 27 (n=6)
- n_consonants [hellenic]: 21 / 21 / 21 / 21 / 21 (n=1)
- n_consonants [indoaryan]: 31 / 33 / 36.5 / 41.5 / 42 (n=6)
- n_consonants [japonic]: 14 / 15.2 / 20 / 20.8 / 21 (n=3)
- n_consonants [polynesian]: 9 / 9.2 / 10 / 11.6 / 12 (n=3)
- n_consonants [romance]: 20 / 21 / 23 / 23 / 23 (n=6)
- n_consonants [semitic]: 23 / 23.5 / 30.5 / 32.5 / 33 (n=6)
- n_consonants [sinitic]: 14 / 16.5 / 21.5 / 28 / 29 (n=6)
- n_consonants [slavic]: 21 / 22.8 / 25 / 34.6 / 37 (n=7)
- n_consonants [turkic]: 20 / 20.5 / 23 / 24.5 / 25 (n=6)
- n_consonants [uralic]: 17 / 17 / 26 / 30.5 / 32 (n=6)
- n_vowel_qualities [all]: 3 / 5 / 7 / 11 / 16 (n=66)
- n_vowel_qualities [bantu]: 5 / 5 / 5 / 7 / 7 (n=6)
- n_vowel_qualities [celtic]: 10 / 10.3 / 11 / 11 / 11 (n=4)
- n_vowel_qualities [germanic]: 8 / 9.5 / 12 / 15.5 / 16 (n=6)
- n_vowel_qualities [hellenic]: 5 / 5 / 5 / 5 / 5 (n=1)
- n_vowel_qualities [indoaryan]: 5 / 6 / 8 / 10 / 10 (n=6)
- n_vowel_qualities [japonic]: 5 / 5 / 5 / 5 / 5 (n=3)
- n_vowel_qualities [polynesian]: 5 / 5 / 5 / 5.8 / 6 (n=3)
- n_vowel_qualities [romance]: 5 / 6 / 8 / 10.5 / 12 (n=6)
- n_vowel_qualities [semitic]: 3 / 4 / 6 / 8 / 9 (n=6)
- n_vowel_qualities [sinitic]: 5 / 5.5 / 6.5 / 7 / 7 (n=6)
- n_vowel_qualities [slavic]: 5 / 5 / 6 / 6.8 / 8 (n=7)
- n_vowel_qualities [turkic]: 6 / 7 / 8 / 9 / 9 (n=6)
- n_vowel_qualities [uralic]: 5 / 5 / 8 / 9.5 / 10 (n=6)

## Correlations (Spearman; below the critical value it is indistinguishable from noise)
- n_consonants ~ n_vowel_qualities: +0.04 (n=66, critical 0.24)  [noise]

## Candidate hard rules: A requires B (B present whenever A is)
- wals_98A_alignment=None -> wals_20A_fusion=None (support 50, conf. lower bound 0.93, lift 1.37)
- script=Latin -> historical=False (support 41, conf. lower bound 0.91, lift 1.01)
- wals_85A_adposition=Prepositions -> historical=False (support 40, conf. lower bound 0.91, lift 1.01)
- wals_85A_adposition=Prepositions -> vowel_harmony=None (support 40, conf. lower bound 0.91, lift 1.15)
- wals_26A_affixation=Strongly suffixing -> historical=False (support 38, conf. lower bound 0.91, lift 1.01)
- wals_65A_aspect=None -> wals_20A_fusion=None (support 37, conf. lower bound 0.91, lift 1.37)
- wals_67A_future=None -> wals_20A_fusion=None (support 37, conf. lower bound 0.91, lift 1.37)
- wals_65A_aspect=None -> wals_67A_future=None (support 37, conf. lower bound 0.91, lift 1.92)
- wals_67A_future=None -> wals_65A_aspect=None (support 37, conf. lower bound 0.91, lift 1.92)
- wals_87A_adjective=Adjective-Noun -> historical=False (support 35, conf. lower bound 0.90, lift 1.01)
- wals_13A_tone=None -> wals_12A_syllables=None (support 35, conf. lower bound 0.90, lift 1.87)
- wals_1A_consonants=None -> wals_12A_syllables=None (support 35, conf. lower bound 0.90, lift 1.87)
- wals_2A_vowels=None -> wals_12A_syllables=None (support 35, conf. lower bound 0.90, lift 1.87)
- wals_13A_tone=None -> wals_1A_consonants=None (support 35, conf. lower bound 0.90, lift 2.03)
- wals_1A_consonants=None -> wals_13A_tone=None (support 35, conf. lower bound 0.90, lift 2.03)
- wals_13A_tone=None -> wals_2A_vowels=None (support 35, conf. lower bound 0.90, lift 2.03)
- wals_2A_vowels=None -> wals_13A_tone=None (support 35, conf. lower bound 0.90, lift 2.03)
- wals_1A_consonants=None -> wals_2A_vowels=None (support 35, conf. lower bound 0.90, lift 2.03)
- wals_2A_vowels=None -> wals_1A_consonants=None (support 35, conf. lower bound 0.90, lift 2.03)
- long_vowels=False -> historical=False (support 34, conf. lower bound 0.90, lift 1.01)
- wals_81A_order=SVO -> historical=False (support 33, conf. lower bound 0.90, lift 1.01)
- wals_86A_genitive=Noun-Genitive -> historical=False (support 30, conf. lower bound 0.89, lift 1.01)
- wals_86A_genitive=Noun-Genitive -> vowel_harmony=None (support 30, conf. lower bound 0.89, lift 1.15)
- wals_51A_case_position=Case suffixes -> historical=False (support 29, conf. lower bound 0.88, lift 1.01)
- wals_13A_tone=No tones -> historical=False (support 27, conf. lower bound 0.88, lift 1.01)
- wals_87A_adjective=Noun-Adjective -> historical=False (support 26, conf. lower bound 0.87, lift 1.01)
- wals_87A_adjective=Noun-Adjective -> vowel_harmony=None (support 26, conf. lower bound 0.87, lift 1.15)
- wals_37A_definite=Definite word distinct from demonstrative -> historical=False (support 21, conf. lower bound 0.84, lift 1.01)
- wals_67A_future=No inflectional future -> historical=False (support 20, conf. lower bound 0.84, lift 1.01)
- wals_86A_genitive=Genitive-Noun -> historical=False (support 20, conf. lower bound 0.84, lift 1.01)

## Candidate hard rules: A excludes B (never together, though expected)
- wals_13A_tone=No tones x wals_1A_consonants=None (counts 27 / 35, expected together 13.3)
- wals_13A_tone=No tones x wals_2A_vowels=None (counts 27 / 35, expected together 13.3)
- wals_65A_aspect=None x wals_67A_future=No inflectional future (counts 37 / 20, expected together 10.4)
- wals_20A_fusion=Exclusively concatenative x wals_98A_alignment=None (counts 14 / 50, expected together 9.9)
- wals_65A_aspect=Grammatical marking x wals_67A_future=None (counts 18 / 37, expected together 9.4)
- wals_13A_tone=None x wals_1A_consonants=Average (counts 35 / 18, expected together 8.9)
- wals_13A_tone=None x wals_2A_vowels=Average (5-6) (counts 35 / 18, expected together 8.9)
- wals_13A_tone=None x wals_2A_vowels=Large (7-14) (counts 35 / 18, expected together 8.9)
- wals_1A_consonants=Average x wals_2A_vowels=None (counts 18 / 35, expected together 8.9)
- wals_1A_consonants=None x wals_2A_vowels=Average (5-6) (counts 35 / 18, expected together 8.9)
- wals_1A_consonants=None x wals_2A_vowels=Large (7-14) (counts 35 / 18, expected together 8.9)
- wals_65A_aspect=No grammatical marking x wals_67A_future=None (counts 16 / 37, expected together 8.3)
- wals_20A_fusion=None x wals_98A_alignment=Nominative - accusative (standard) (counts 52 / 11, expected together 8.1)
- wals_12A_syllables=Complex x wals_13A_tone=None (counts 16 / 35, expected together 7.9)
- wals_12A_syllables=Complex x wals_1A_consonants=None (counts 16 / 35, expected together 7.9)
- wals_12A_syllables=Complex x wals_2A_vowels=None (counts 16 / 35, expected together 7.9)
- wals_12A_syllables=None x wals_20A_fusion=Exclusively concatenative (counts 38 / 14, expected together 7.5)
- wals_20A_fusion=Exclusively concatenative x wals_65A_aspect=None (counts 14 / 37, expected together 7.3)
- wals_20A_fusion=Exclusively concatenative x wals_67A_future=None (counts 14 / 37, expected together 7.3)
- wals_65A_aspect=None x wals_67A_future=Inflectional future exists (counts 37 / 14, expected together 7.3)
- wals_86A_genitive=Genitive-Noun x wals_87A_adjective=Noun-Adjective (counts 20 / 26, expected together 7.3)
- wals_26A_affixation=Strongly suffixing x wals_51A_case_position=None (counts 38 / 13, expected together 7.0)
- wals_13A_tone=None x wals_20A_fusion=Exclusively concatenative (counts 35 / 14, expected together 6.9)
- wals_1A_consonants=None x wals_20A_fusion=Exclusively concatenative (counts 35 / 14, expected together 6.9)
- wals_20A_fusion=Exclusively concatenative x wals_2A_vowels=None (counts 14 / 35, expected together 6.9)
- wals_85A_adposition=Postpositions x wals_86A_genitive=Noun-Genitive (counts 16 / 30, expected together 6.8)
- wals_12A_syllables=Moderately complex x wals_13A_tone=None (counts 13 / 35, expected together 6.4)
- wals_12A_syllables=Moderately complex x wals_1A_consonants=None (counts 13 / 35, expected together 6.4)
- wals_12A_syllables=Moderately complex x wals_2A_vowels=None (counts 13 / 35, expected together 6.4)
- wals_81A_order=SOV x wals_86A_genitive=Noun-Genitive (counts 15 / 30, expected together 6.3)

Next: for each candidate, the user marks it RULE (hard), PREFERENCE (soft cost), or COINCIDENCE (drop).
