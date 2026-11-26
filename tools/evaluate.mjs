// Expressive-range evaluation of the generator. Usage: node tools/evaluate.mjs [seedsPerFamily=40]
// Reports: determinism, locality, slider sweeps (target vs measured), hard-rule failures, time, and whether
// sister languages (same family) look more alike than languages of different families.
import { writeFileSync, mkdirSync } from 'node:fs';
import { generate } from '../src/language.js';
import { FAMILY_ORDER } from '../src/data/families.js';
import { inflectNoun, declensionOf } from '../src/morphology.js';
import { writeWord, originalCells } from '../src/scripts.js';

const N = Number(process.argv[2] || 40);
const out = [];
const pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const mean = (a) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
const line = (s = '') => console.log(s);

// ---------- 1. determinism + locality ----------
{
  const a = generate({ family: 'slavic' }, 'det'), b = generate({ family: 'slavic' }, 'det');
  const same = JSON.stringify(a.lex.entries.map(e => e.segs)) === JSON.stringify(b.lex.entries.map(e => e.segs));
  const base = generate({ family: 'uralic', order: 'SOV', caseCount: 6 }, 'loc');
  const moved = generate({ family: 'uralic', order: 'VSO', caseCount: 12, articles: 'both' }, 'loc');
  const changed = base.lex.entries.filter((e, i) => e.segs.join('') !== moved.lex.entries[i].segs.join('')).length;
  line('1. Determinism and locality');
  line(`   same seed twice -> identical lexicon: ${same ? 'yes' : 'NO'}`);
  line(`   change word order + case count + articles -> words changed: ${changed} of ${base.lex.entries.length} (expected: only compounds, whose order follows head direction)`);
}

function paradigmCollisions(L) {
  // paradigm collisions: distinct cells with identical forms that were not chosen as syncretism
  let coll = 0, cells = 0;
  const n = L.lex.byGloss.house;
  if (L.morph.caseMarking === 'suffix') {
    const seen = new Map();
    for (const c of L.morph.cases) for (const num of L.morph.numbers) { cells++; const f = inflectNoun(L, n, { kase: c, number: num }).segs.join(''); seen.set(f, (seen.get(f) || 0) + 1); }
    // declared syncretisms of this noun's declension are allowed
    const decl = L.morph.declensions ? declensionOf(L.morph, n) : null;
    const allowed = new Set();
    const endOf = (c, num) => decl ? (decl.endings[c]?.[num] || []).join(' ') : (L.morph.caseAff?.[c] || []).join(' ') + '|' + num;
    for (const c1 of L.morph.cases) for (const c2 of L.morph.cases) for (const n1 of L.morph.numbers) for (const n2 of L.morph.numbers) {
      // identical endings are a declared (or inherited, sound-change) syncretism, not an accident
      if (endOf(c1, n1) === endOf(c2, n2) && (decl || n1 === n2)) allowed.add(`${c1}.${n1}|${c2}.${n2}`);
    }
    const byForm = new Map();
    for (const c of L.morph.cases) for (const num of L.morph.numbers) { const f = inflectNoun(L, n, { kase: c, number: num }).segs.join(''); byForm.set(f, (byForm.get(f) || []).concat(`${c}.${num}`)); }
    for (const cellsSame of byForm.values()) for (let i = 1; i < cellsSame.length; i++) if (!allowed.has(`${cellsSame[0]}|${cellsSame[i]}`)) coll++;
    void seen;
  }
  return { coll, cells };
}

// ---------- 2. per-family runs ----------
const rows = [];
const times = [];
let failures = 0;
const failMsgs = new Map();
for (const fam of FAMILY_ORDER) {
  for (let s = 0; s < N; s++) {
    try {
      const L = generate({ family: fam }, `eval-${s}`);
      times.push(L.ms);
      const { coll, cells } = paradigmCollisions(L);
      const words = L.lex.entries.map(e => L.romanize(e.segs));
      const homophones = L.lex.entries.length - new Set(L.lex.entries.map(e => e.segs.join(' '))).size; // by phoneme, so ts (one sound) differs from t+s
      rows.push({ fam, seed: s, name: L.name.exonym, vTarget: L.controls.vowelPct, vMeas: L.measured.vowelPct, lTarget: L.controls.wordLen, lMeas: L.measured.meanSyllables, homRej: L.measured.homophoneRejections, homophones, glyphColl: L.measured.glyphCollisions, paradigmColl: coll, cells, cases: L.morph.cases.length, morph: L.controls.morph, order: L.controls.order, cons: L.ph.consonants.length, vows: L.ph.vowels.length, warn: L.notes.filter(x => x.level === 'warn').length, ms: L.ms, words });
    } catch (e) { failures++; const k = e.message; failMsgs.set(k, (failMsgs.get(k) || 0) + 1); }
  }
}
line();
line(`2. Runs: ${rows.length + failures} languages (${N} seeds x ${FAMILY_ORDER.length} families), failures: ${failures}`);
for (const [k, v] of failMsgs) line(`   ${v}x ${k}`);
line(`   time per language: p50 ${pct(times, 0.5).toFixed(0)} ms, p95 ${pct(times, 0.95).toFixed(0)} ms, max ${Math.max(...times).toFixed(0)} ms`);
const names = new Set(rows.map(r => r.name));
line(`   duplicate language names: ${rows.length - names.size}`);
line(`   homophone rejections per language: mean ${mean(rows.map(r => r.homRej)).toFixed(1)}, max ${Math.max(...rows.map(r => r.homRej))}`);
line(`   homophones left in a lexicon (hard rule): ${rows.reduce((a, r) => a + r.homophones, 0)}`);
line(`   unplanned paradigm collisions (model noun): ${rows.filter(r => r.paradigmColl > 0).length} languages`);
line(`   languages with a calibration warning: ${rows.filter(r => r.warn > 0).length}`);

line();
line('3. Per family: measured vowel % and syllables per word (target in brackets), typology mix');
line('   family       vowel%        syll/word     cases  C/V      morph (agg/fus/iso)  orders');
for (const fam of FAMILY_ORDER) {
  const r = rows.filter(x => x.fam === fam);
  const mo = ['agglutinative', 'fusional', 'isolating'].map(m => r.filter(x => x.morph === m).length).join('/');
  const ord = Object.entries(r.reduce((a, x) => (a[x.order] = (a[x.order] || 0) + 1, a), {})).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}${v}`).join(' ');
  line(`   ${fam.padEnd(12)} ${mean(r.map(x => x.vMeas)).toFixed(0).padStart(3)} (${mean(r.map(x => x.vTarget)).toFixed(0)})    ${mean(r.map(x => x.lMeas)).toFixed(2)} (${mean(r.map(x => x.lTarget)).toFixed(2)})   ${mean(r.map(x => x.cases)).toFixed(1).padStart(4)}   ${mean(r.map(x => x.cons)).toFixed(0)}/${mean(r.map(x => x.vows)).toFixed(0)}    ${mo.padEnd(20)} ${ord}`);
}

// ---------- 3b. word order and scripts ----------
{
  let orderBad = 0, orderChecked = 0, scriptBad = 0, scriptChecked = 0;
  const badScripts = new Map();
  const SCRIPTS = ['latin', 'ipa', 'cyrillic', 'greek', 'georgian', 'armenian', 'runic', 'arabic', 'hebrew', 'devanagari', 'original'];
  for (const fam of FAMILY_ORDER) for (let s = 0; s < 6; s++) for (const order of ['SOV', 'SVO', 'VSO', 'VOS', 'OVS', 'OSV']) {
    const L = generate({ family: fam, order, script: SCRIPTS[(s + order.length + fam.length) % SCRIPTS.length] }, `ord-${s}`);
    const ws = L.examples.general.basic.words;
    const pos = (g) => ws.findIndex(w => w.parts.some(p => { const gl = p.gloss.replace(/\[[A-Z]+\]/g, ''); return gl === g || gl.startsWith(g + '.'); }));
    const p = { S: pos('man'), V: pos('see'), O: pos('dog') };
    orderChecked++;
    const got = Object.entries(p).sort((a, b) => a[1] - b[1]).map(x => x[0]).join('');
    if (Object.values(p).some(x => x < 0) || got !== order) orderBad++;
  }
  for (const fam of FAMILY_ORDER) for (const sc of SCRIPTS) {
    const L = generate({ family: fam, script: sc }, 'scripts');
    for (const e of L.lex.entries) {
      scriptChecked++;
      const out = sc === 'original' ? originalCells(L, e.segs) : writeWord(L, e.segs, sc);
      const bad = sc === 'original' ? (!out.length || out.some(c => !c.s || !c.s.length)) : (!out || /[?]/.test(out) || /[a-zA-Z]/.test(sc === 'latin' || sc === 'ipa' ? '' : out));
      if (bad) { scriptBad++; badScripts.set(sc, (badScripts.get(sc) || 0) + 1); }
    }
  }
  line();
  line('3b. Hard checks');
  line(`   pinned word order respected in the example sentence: ${orderChecked - orderBad} of ${orderChecked}`);
  line(`   words rendered in every script without gaps, "?" or leftover Latin letters: ${scriptChecked - scriptBad} of ${scriptChecked}` + (badScripts.size ? ' (failures: ' + [...badScripts].map(([k, v]) => `${k} ${v}`).join(', ') + ')' : ''));
}

// ---------- 4. slider sweeps ----------
line();
line('4. Slider sweeps (family Original, 8 seeds each): target -> measured');
const sweep = (name, values, extra = {}) => {
  const res = values.map(v => {
    const ms = [];
    for (let s = 0; s < 8; s++) { const L = generate({ family: 'original', ...extra, [name]: v }, `sw-${s}`); ms.push(name === 'vowelPct' ? L.measured.vowelPct : name === 'wordLen' ? L.measured.meanSyllables : name === 'complexity' ? L.ph.consonants.length + L.ph.vowels.length : L.morph.cases.length); }
    return `${v}->${mean(ms).toFixed(name === 'wordLen' ? 2 : 0)}`;
  });
  line(`   ${name.padEnd(11)} ${res.join('  ')}`);
};
sweep('vowelPct', [25, 35, 45, 55, 65], { complexity: 5 });
sweep('vowelPct', [25, 35, 45, 55, 65], { complexity: 2 });
sweep('wordLen', [1, 1.5, 2, 2.5, 3, 3.5, 4]);
sweep('complexity', [1, 2, 3, 4, 5]);
sweep('caseCount', [2, 4, 6, 8, 10, 14], { caseOn: true, morph: 'agglutinative' });

// ---------- 5. family distinctness ----------
// letter-bigram profile of each language's romanized lexicon; compare within vs across families
const profile = (words) => { const m = new Map(); let t = 0; for (const w of words) { const s = `^${w}$`; for (let i = 0; i < s.length - 1; i++) { const k = s.slice(i, i + 2); m.set(k, (m.get(k) || 0) + 1); t++; } } for (const [k, v] of m) m.set(k, v / t); return m; };
const dist = (a, b) => { let d = 0; const keys = new Set([...a.keys(), ...b.keys()]); for (const k of keys) d += Math.abs((a.get(k) || 0) - (b.get(k) || 0)); return d / 2; };
const sample = rows.filter(r => r.seed < 10).map(r => ({ fam: r.fam, p: profile(r.words) }));
let within = [], across = [];
for (let i = 0; i < sample.length; i++) for (let j = i + 1; j < sample.length; j++) (sample[i].fam === sample[j].fam ? within : across).push(dist(sample[i].p, sample[j].p));
line();
line('5. Bigram distance between languages (0 = same letter-pair statistics, 1 = disjoint)');
line(`   within a family: mean ${mean(within).toFixed(3)}   across families: mean ${mean(across).toFixed(3)}`);
const famStats = FAMILY_ORDER.map(f => { const w = []; const sa = sample.filter(x => x.fam === f); for (let i = 0; i < sa.length; i++) for (let j = i + 1; j < sa.length; j++) w.push(dist(sa[i].p, sa[j].p)); return [f, mean(w)]; });
line('   within-family distance per family: ' + famStats.map(([f, d]) => `${f} ${d.toFixed(2)}`).join(', '));

// ---------- 6. contact sheet ----------
line();
line('6. Contact sheet: seed 0 of every family (water, fire, mother, sun, king, big)');
for (const fam of FAMILY_ORDER) {
  const L = generate({ family: fam }, 'eval-0');
  line(`   ${fam.padEnd(11)} ${L.name.exonym.padEnd(11)} ${['water', 'fire', 'mother', 'sun', 'king', 'big'].map(g => L.romanize(L.lex.byGloss[g].segs)).join(', ')}`);
}

mkdirSync(new URL('../eval/', import.meta.url), { recursive: true });
// ---------- 7. descent: simulated histories against real daughter languages ----------
{
  const { CHANGES } = await import('../src/data/changes.js');
  const { PROTO } = await import('../src/data/proto/index.js');
  const { FAMILY_PROTO } = await import('../src/descent.js');
  const { choosePath } = await import('../src/history2.js');
  const { evolve } = await import('../src/evolve.js');
  const { MEANINGS } = await import('../src/data/meanings.js');
  const POS = Object.fromEntries(MEANINGS.map(m => [m[0], m[1]]));
  const norm = (segs) => segs.join(' ').replace(/ː/g, '').replace(/β/g, 'b').replace(/ð/g, 'd').replace(/ɣ/g, 'g').replace(/[ʁɾ]/g, 'r').replace(/[1-6]/g, '').split(' ').filter(Boolean);
  const lev = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
  line();
  line('7. Descent: each anchor path run on the real ancestor, compared with the real daughter (normalised edit distance, 0 = identical)');
  line('   daughter            n   exact  path   unchanged ancestor');
  for (const [fam, pid] of Object.entries(FAMILY_PROTO)) {
    const P = PROTO[pid]; if (!P || !CHANGES[fam]) continue;
    for (const [dname, dw] of Object.entries(P.daughters || {})) {
      const anchor = dname.normalize('NFD').replace(/[^a-z]/gi, '').toLowerCase();
      if (!CHANGES[fam].anchors[anchor]) continue;
      const path = choosePath(fam, 'x', { anchor, fidelity: 1, drift: 80 });
      let n = 0, exact = 0, dist = 0, base = 0;
      for (const [g, real] of Object.entries(dw)) {
        const pw = P.words[g]; if (!pw) continue;
        const inf = POS[g] === 'v' && P.affixes?.infinitive && fam === 'romance' ? ' ' + P.affixes.infinitive : '';
        const a = norm(evolve(path.rules, pw.f + inf, { stress: pw.s }).segs), b = norm(real.split(' ')), p0 = norm((pw.f + inf).split(' '));
        const dd = lev(a, b) / Math.max(a.length, b.length, 1); dist += dd; base += lev(p0, b) / Math.max(p0.length, b.length, 1); n++; if (dd === 0) exact++;
      }
      if (n) line(`   ${dname.padEnd(18)} ${String(n).padStart(3)}  ${String(exact).padStart(5)}  ${(dist / n).toFixed(2)}   ${(base / n).toFixed(2)}`);
    }
  }
  // distance slider sweep: mean distance of the evolved words from the ancestor
  const { generate: gen2 } = await import('../src/language.js');
  const sw = [0, 20, 40, 60, 80, 100].map(dv => { let t = 0, k = 0; for (const fam of ['romance', 'slavic', 'japonic', 'polynesian']) for (let s = 0; s < 3; s++) { const L = gen2({ family: fam, drift: dv }, 'drift-' + s); for (const e of L.lex.entries.filter(x => x.inherited)) { const a = norm(e.segs), b = norm(e.proto); t += lev(a, b) / Math.max(a.length, b.length, 1); k++; } } return `${dv}->${(t / k).toFixed(2)}`; });
  line(`   distance slider -> mean distance of inherited words from the ancestor: ${sw.join('  ')}`);
}

// ---------- 8. secondary influence: loans from a second real lineage ----------
{
  const { generate: gen3 } = await import('../src/language.js');
  const { INFLUENCE_FAMILIES } = await import('../src/influence.js');
  line();
  line('8. Secondary influence: every recipient x donor pair, light and heavy, 2 seeds each');
  const mk = () => ({ n: 0, fail: 0, hom: 0, loans: 0, displaced: 0, newS: 0, ms: 0, para: 0, glyph: 0, warn: 0, sc: 0, scBad: 0, ord: 0, ordBad: 0 });
  const agg = { light: mk(), heavy: mk() };
  const det = [];
  for (const level of ['light', 'heavy']) for (const rf of INFLUENCE_FAMILIES) for (const df of INFLUENCE_FAMILIES) for (let s = 0; s < 2; s++) {
    const a = agg[level]; a.n++;
    try {
      const t = Date.now();
      const L = gen3({ family: rf, influence: df, influenceLevel: level }, 'inf-' + s);
      a.ms += Date.now() - t;
      const b = L.lex.entries.filter(e => e.borrowed);
      a.hom += L.lex.homophones; a.loans += b.length / L.lex.entries.length; a.displaced += b.filter(e => e.loan.displaced).length; a.newS += L.descent.influence.newSounds.length;
      const SC = ['latin', 'ipa', 'cyrillic', 'greek', 'georgian', 'armenian', 'runic', 'arabic', 'hebrew', 'devanagari'];
      a.para += paradigmCollisions(L).coll > 0 ? 1 : 0; a.glyph += L.measured.glyphCollisions || 0; a.warn += L.notes.some(x => x.level === 'warn') ? 1 : 0;
      for (const e of b) for (const sc of SC) { a.sc++; const out = writeWord(L, e.segs, sc); if (!out || /[?]/.test(out) || (sc !== 'latin' && sc !== 'ipa' && /[a-zA-Z]/.test(out))) a.scBad++; }
      const order = ['SOV', 'SVO', 'VSO', 'VOS', 'OVS', 'OSV'][(rf.length + df.length + s) % 6];
      const O = gen3({ family: rf, influence: df, influenceLevel: level, order, script: 'original' }, 'inf-' + s);
      for (const e of O.lex.entries.filter(x => x.borrowed)) { a.sc++; const c = originalCells(O, e.segs); if (!c.length || c.some(x => !x.s || !x.s.length)) a.scBad++; }
      const ws = O.examples.general.basic.words;
      const pos = (g) => ws.findIndex(w => w.parts.some(p => { const gl = p.gloss.replace(/\[[A-Z]+\]/g, ''); return gl === g || gl.startsWith(g + '.'); }));
      const pp = { S: pos('man'), V: pos('see'), O: pos('dog') };
      a.ord++; if (Object.values(pp).some(x => x < 0) || Object.entries(pp).sort((x, y) => x[1] - y[1]).map(x => x[0]).join('') !== order) a.ordBad++;
      if (s === 0 && rf === 'germanic' && (df === 'romance' || df === 'germanic')) det.push(JSON.stringify(b.map(e => e.segs)) === JSON.stringify(gen3({ family: rf, influence: df, influenceLevel: level }, 'inf-0').lex.entries.filter(e => e.borrowed).map(e => e.segs)));
    } catch (e) { a.fail++; if (a.fail <= 3) line(`   failure ${rf} <- ${df} (${level}): ${e.message}`); }
  }
  for (const [level, a] of Object.entries(agg)) line(`   ${level.padEnd(6)} ${a.n} languages, failures ${a.fail}, homophones ${a.hom}, mean loan share ${(100 * a.loans / Math.max(1, a.n - a.fail)).toFixed(1)}%, inherited words displaced per language ${(a.displaced / Math.max(1, a.n - a.fail)).toFixed(1)}, new sounds per language ${(a.newS / Math.max(1, a.n - a.fail)).toFixed(2)}, ${(a.ms / Math.max(1, a.n - a.fail)).toFixed(1)} ms per language`);
  for (const [level, a] of Object.entries(agg)) line(`   ${level.padEnd(6)} hard checks: paradigm collisions ${a.para} languages, glyph collisions ${a.glyph}, calibration warnings ${a.warn} languages, loanwords in every script ${a.sc - a.scBad} of ${a.sc}, pinned word order ${a.ord - a.ordBad} of ${a.ord}`);
  line(`   same input twice -> identical loans: ${det.every(Boolean) ? 'yes' : 'NO'}`);
}

const csv = ['family,seed,name,vowel_target,vowel_measured,len_target,len_measured,homophone_rejections,glyph_collisions,paradigm_collisions,cases,morph,order,consonants,vowels,warnings,ms',
  ...rows.map(r => [r.fam, r.seed, r.name, r.vTarget, r.vMeas.toFixed(1), r.lTarget, r.lMeas.toFixed(2), r.homRej, r.glyphColl, r.paradigmColl, r.cases, r.morph, r.order, r.cons, r.vows, r.warn, r.ms.toFixed(0)].join(','))].join('\n');
writeFileSync(new URL('../eval/results.csv', import.meta.url), csv);
line();
line('CSV written to eval/results.csv');
void out;
