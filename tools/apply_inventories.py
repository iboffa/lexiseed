#!/usr/bin/env python3
"""Apply the approved sourced inventories (CANDIDATES.md section A) to src/data/families.js.
weight = 10 x share of example languages with the sound; tier 1 if share >= 0.8, 2 if >= 0.4, else 3.
Pool = current pool minus approved removals plus approved additions. A kept sound with no sourced share is
marked tier 3, weight 1 and listed as assumed."""
import json, re, os, subprocess
root = os.path.join(os.path.dirname(__file__), '..')
pres = json.load(open(os.path.join(root, 'references/presence.json')))
rows = []
for f in os.listdir(os.path.join(root, 'references/rows')):
    rows += json.load(open(os.path.join(root, 'references/rows', f)))
catalogue = set(json.loads(subprocess.check_output(['node', '-e', "import('./src/data/phonemes.js').then(m=>console.log(JSON.stringify(Object.keys(m.SEGMENTS))))"], cwd=root)))

A1 = {'romance': ([20, 23], [5, 9]), 'slavic': ([21, 37], [5, 8]), 'germanic': ([18, 27], [8, 14]), 'hellenic': ([19, 23], [5, 5]),
      'celtic': ([25, 33], [8, 11]), 'indoaryan': ([31, 42], [5, 10]), 'semitic': ([23, 33], [3, 7]), 'uralic': ([17, 32], [5, 10]),
      'turkic': ([20, 25], [6, 9]), 'sinitic': ([14, 29], [5, 7]), 'japonic': ([14, 21], [5, 5]), 'bantu': ([15, 39], [5, 7]),
      'polynesian': ([9, 12], [5, 5])}
ADD_C = {'romance': 'w ɾ ʒ ŋ', 'slavic': 'dʒ', 'germanic': 'ʒ ʔ', 'hellenic': 'ɾ dz', 'celtic': 'tʃ dʒ z ɲ lʲ nʲ ç',
         'indoaryan': 'w ç h f ɟ c', 'semitic': 'tʃ ɾ v', 'turkic': 'ɾ x', 'sinitic': 'h ʔ', 'japonic': 'ʔ',
         'bantu': 'ɓ ɗ pʰ kʰ r ɬ'}
ADD_V = {'slavic': 'ɛ', 'germanic': 'ɪ œ ʊ ʏ ɑ', 'celtic': 'ɑ ɛ ɔ ɯ ɤ ɪ ʊ', 'indoaryan': 'ʊ ɪ æ', 'uralic': 'ɛ',
         'turkic': 'ɛ', 'sinitic': 'ɔ æ', 'japonic': 'ɯ', 'polynesian': 'ɛ'}
REMOVE = {'slavic': ['ɫ'], 'indoaryan': ['v']}
KEEP_T3 = {'hellenic': ['r', 'pʰ', 'tʰ', 'kʰ', 'h']}   # approved: keep at tier 3 for an archaic flavour

def share_rows(fam, key):
    rs = [r for r in rows if r['style'] == fam and r.get(key) is not None]
    return round(sum(1 for r in rs if r[key]) / len(rs), 2) if rs else None

src = open(os.path.join(root, 'src/data/families.js')).read()
report = []
for fam, (cc, vc) in A1.items():
    m = re.search(r'\n  ' + fam + r': \{\n(.*?)\n  \},\n', src, re.S)
    block = m.group(1)
    def parse(name):
        mm = re.search(r'    ' + name + r': W\(\{(.*?)\}\),\n', block, re.S)
        items = re.findall(r"'?([^\s,:'{}]+)'?: \[([\d.]+), (\d)\]", mm.group(1))
        return mm, {k: (float(w), int(t)) for k, w, t in items}
    cm, cur_c = parse('consonants'); vm, cur_v = parse('vowels')
    P = pres[fam]
    def build(cur, shares, adds, removes, keep3):
        keys = [k for k in cur if k not in removes] + [a for a in adds.split() if a not in cur]
        out, assumed = [], []
        for k in keys:
            sh = shares.get(k)
            if k in keep3 or not sh:
                out.append((k, 1, 3)); assumed.append(k); continue
            out.append((k, round(10 * sh, 1), 1 if sh >= 0.8 else 2 if sh >= 0.4 else 3))
        return out, assumed
    newc, ac = build(cur_c, P['consonants'], ADD_C.get(fam, ''), REMOVE.get(fam, []), KEEP_T3.get(fam, []))
    newv, av = build(cur_v, P['vowels'], ADD_V.get(fam, ''), [], [])
    for k, _, _ in newc + newv:
        assert k in catalogue, (fam, k)
    fmt = lambda lst: ', '.join(f"{k if re.fullmatch(r'[a-z]+', k) else repr(k)}: [{w:g}, {t}]" for k, w, t in lst)
    note = f"    // Sourced: PHOIBLE presence share x10 over {P['n']} languages ({', '.join(P['languages'])}); references/{fam}/notes.md\n"
    if ac or av: note += f"    // [ASSUMPTION] weight 1, tier 3, no sourced share: {' '.join(ac + av)}\n"
    newblock = block.replace(cm.group(0), note + f"    consonants: W({{ {fmt(newc)} }}),\n").replace(vm.group(0), f"    vowels: W({{ {fmt(newv)} }}),\n")
    newblock = re.sub(r'vCount: \[[\d, ]+\], cCount: \[[\d, ]+\]', f'vCount: [{vc[0]}, {vc[1]}], cCount: [{cc[0]}, {cc[1]}]', newblock)
    lv, dp = share_rows(fam, 'long_vowels'), share_rows(fam, 'diphthongs')
    if lv is not None: newblock = re.sub(r'longVowels: [\d.]+', f'longVowels: {lv}', newblock)
    if dp is not None: newblock = re.sub(r'diphthongs: [\d.]+', f'diphthongs: {dp}', newblock)
    src = src.replace(block, newblock)
    report.append(f"{fam:11} C {len(cur_c)}->{len(newc)}  V {len(cur_v)}->{len(newv)}  long {lv} diph {dp}  assumed: {' '.join(ac+av) or '-'}")
open(os.path.join(root, 'src/data/families.js'), 'w').write(src)
print('\n'.join(report))
