#!/usr/bin/env python3
"""Merge scouted rows (references/rows/*.json) into one example table for extract_rules.py,
and derive per-family phoneme presence weights (fraction of example languages that have each segment)."""
import json, glob, os, collections

root = os.path.join(os.path.dirname(__file__), '..', 'references')
rows = []
for p in sorted(glob.glob(os.path.join(root, 'rows', '*.json'))):
    rows += json.load(open(p))

# Normalisation (also described in references/CANDIDATES.md):
#  - consonants: geminate length (ː) folded into the base consonant; '|' alternatives keep the first
#  - vowels: quality = base letter after removing length, nasalisation, rhoticity and position diacritics
import unicodedata
DIAC = set('\u0303\u031e\u031d\u0320\u031f\u0308\u0339\u031c\u0329\u032f\u02de\u0325\u0324')
ALIAS = {'\u0261': 'g', 't\u0320\u0283': 't\u0283', 'd\u0320\u0292': 'd\u0292', 't\u0320\u0283\u02b0': 't\u0283\u02b0'}
def norm_c(s):
    s = unicodedata.normalize('NFD', s.split('|')[0]).replace('ː', '').replace('ˑ', '')
    s = s.replace('\u0261', 'g').replace('\u0320', '')            # ɡ -> g ; retracted t̠ʃ -> tʃ
    s = s.replace('\u032a', '').replace('\u033b', '').replace('\u033a', '')  # dental/laminal/apical marks
    if '\u0324' in s:                                               # breathy voice b̤ -> bʱ
        s = s.replace('\u0324', '') + 'ʱ'
    s = s.replace('gʱ', 'ɡʱ')                                        # generator spells this one with U+0261
    return unicodedata.normalize('NFC', s)
def quality(v):
    v = unicodedata.normalize('NFD', v.replace('ː', '').replace('ˑ', ''))
    v = ''.join(ch for ch in v if ch not in DIAC)
    return v
for r in rows:
    if r.get('consonants'):
        cs = set(norm_c(c) for c in r['consonants'])
        # SPA/EA write voiceless stops only as aspirated: with no plain counterpart, count Cʰ as plain C
        for c in list(cs):
            if c.endswith('ʰ') and c[:-1] not in cs:
                cs.discard(c); cs.add(c[:-1])
        r['consonants'] = sorted(cs)
        r['n_consonants'] = len(r['consonants'])
    if r.get('vowels'):
        quals = {quality(v) for v in r['vowels'] if len(quality(v)) == 1}
        r['n_vowel_qualities'] = len(quals)
        r['vowel_qualities'] = sorted(quals)

# example table: drop raw segment lists (too sparse for rule mining), keep coded fields
table = []
for r in rows:
    t = {k: v for k, v in r.items() if k not in ('consonants', 'vowels', 'vowel_qualities', 'source', 'notes', 'wals_code', 'glottocode', 'phoible_inventory')}
    t['source'] = ' '.join(r.get('source') or [])
    table.append(t)
json.dump(table, open(os.path.join(root, 'examples.json'), 'w'), ensure_ascii=False, indent=1)

# presence weights per family
pres = {}
for fam in sorted({r['style'] for r in rows}):
    fr = [r for r in rows if r['style'] == fam and r.get('consonants')]
    n = len(fr)
    cc, vc = collections.Counter(), collections.Counter()
    for r in fr:
        cc.update(set(r['consonants'])); vc.update(set(r.get('vowel_qualities') or []))
    pres[fam] = {'n': n, 'languages': [r['id'] for r in fr],
                 'consonants': {k: round(v / n, 2) for k, v in cc.most_common()},
                 'vowels': {k: round(v / n, 2) for k, v in vc.most_common()},
                 'n_consonants': sorted(r['n_consonants'] for r in fr if r.get('n_consonants')),
                 'n_vowel_qualities': sorted(r['n_vowel_qualities'] for r in fr if r.get('n_vowel_qualities'))}
json.dump(pres, open(os.path.join(root, 'presence.json'), 'w'), ensure_ascii=False, indent=1)
print(f'{len(rows)} rows from {len(pres)} families -> references/examples.json, references/presence.json')
for f, p in pres.items():
    print(f"  {f:11} n={p['n']}  C {p['n_consonants']}  V {p['n_vowel_qualities']}")
