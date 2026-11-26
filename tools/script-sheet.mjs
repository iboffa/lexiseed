// Contact sheet of original scripts: node tools/script-sheet.mjs -> eval/scripts.html
// 1. every design style written as every type; 2. script lineages: sister languages of one parent family.
import { writeFileSync } from 'node:fs';
import { generate } from '../src/language.js';
import { scriptChart, renderOriginal, SYSTEM_LIST } from '../src/scripts.js';

const TYPES = ['alphabet', 'abjad', 'abugida', 'syllabary'];
const esc = (s) => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
let html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Script sheet</title><style>
body{font:14px system-ui;background:#fffdf8;color:#222;margin:20px} h2{margin-top:28px} .row{display:grid;grid-template-columns:150px repeat(4,1fr);gap:8px;align-items:start;margin:6px 0}
.cell{border:1px solid #e4ded2;border-radius:8px;padding:6px;min-height:60px;overflow:hidden} .cell small{display:block;color:#777;font-size:11px;margin-bottom:4px} svg{color:#8a3b1f}
.g{display:inline-flex;flex-direction:column;align-items:center;margin:2px;padding:2px;border:1px solid #f0ebe0;min-width:30px} .g span{font-size:10px;color:#888}
.fam{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}
</style><h1>Original scripts</h1>`;

// 1. style x type
html += '<h2>1. Every style as every type</h2><div class="row"><b></b>' + TYPES.map(t => `<b>${t}</b>`).join('') + '</div>';
for (const [sys, label] of SYSTEM_LIST) {
  html += `<div class="row"><b>${esc(label)}</b>`;
  for (const t of TYPES) {
    const L = generate({ family: 'japonic', script: 'original', scriptStyle: sys, scriptType: t }, `sheet-${sys}-${t}`);
    const words = ['water', 'mother', 'mountain', 'sun'].map(g => L.lex.byGloss[g]).filter(Boolean);
    html += `<div class="cell"><small>${L.script.generic ? 'new pairing' : 'tailored'} · ${esc(L.script.lineage.habits.join(', ') || 'no habits')}</small>${words.map(e => `<span class="g">${renderOriginal(L, e.segs, { size: 26 })}<span>${esc(L.romanize(e.segs))}</span></span>`).join('')}</div>`;
  }
  html += '</div>';
}

// 2. lineages: sister languages share a lineage (one of three per parent family) and drift a little
html += '<h2>2. Script lineages: sister languages of one family</h2>';
for (const fam of ['romance', 'slavic', 'bantu', 'polynesian', 'semitic']) {
  html += `<h3>${fam}</h3><div class="fam">`;
  for (let s = 0; s < 9; s++) {
    const L = generate({ family: fam, script: 'original' }, `lineage-${s}`);
    const sc = L.script;
    const words = ['water', 'fire', 'king'].map(g => L.lex.byGloss[g]).filter(Boolean);
    html += `<div class="cell"><small>${esc(L.name.exonym)} · lineage ${sc.lineage.index + 1} · ${sc.system} ${sc.type} · ${esc(sc.lineage.habits.join(', ') || '—')} · ${sc.style.pen}</small>${words.map(e => `<span class="g">${renderOriginal(L, e.segs, { size: 26 })}<span>${esc(L.romanize(e.segs))}</span></span>`).join('')}</div>`;
  }
  html += '</div>';
}

// 3. one full chart per new pairing family member
html += '<h2>3. Charts of a few new pairings</h2>';
for (const [sys, t] of [['rounded', 'syllabary'], ['capitals', 'abugida'], ['runic', 'syllabary'], ['brush', 'alphabet']]) {
  const L = generate({ family: 'polynesian', script: 'original', scriptStyle: sys, scriptType: t }, 'chart-' + sys);
  const rom = (p) => L.rom.map?.[p] ?? p;
  html += `<div class="cell"><b>${sys} ${t}</b>`;
  for (const sec of scriptChart(L, rom)) {
    html += `<div><b>${esc(sec.title)}</b> <small>${esc(sec.text || '')}</small>`;
    if (sec.grid) html += sec.grid.map(c => `<span class="g">${c.html}<span>${esc(c.label)}</span></span>`).join('');
    if (sec.table) html += `<table><tr>${sec.table.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${sec.table.rows.slice(0, 6).map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
    html += '</div>';
  }
  html += '</div>';
}
writeFileSync(new URL('../eval/scripts.html', import.meta.url), html);
console.log('wrote eval/scripts.html');
