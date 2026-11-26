// Regression checks for family blends, grammar pins and productive word families.
import assert from 'node:assert/strict';
import test from 'node:test';
import { FAMILY_ORDER } from '../src/data/families.js';
import { MEANINGS } from '../src/data/meanings.js';
import { SEGMENTS } from '../src/data/phonemes.js';
import { generate } from '../src/language.js';
import { choosePath, evolve } from '../src/history2.js';
import { QUIRKS } from '../src/quirks.js';
import { renderGrammar, vocabRows } from '../src/render.js';
import { writeWord } from '../src/scripts.js';
import { translate } from '../src/translate.js';
import { isV, parseSegs, vBase } from '../src/phonology.js';

const contacts = [
  { family: 'romance', percent: 35, yearsAgo: 900 },
  { family: 'germanic', percent: 10, yearsAgo: 0 },
];
const recipe = { family: 'semitic', contacts, script: 'latin' };

test('nasal vowels reach the inventory, lexicon, IPA and writing systems', () => {
  assert.deepEqual(parseSegs('kãɛ̃'), ['k', 'ã', 'ɛ̃']);
  assert.equal(vBase('ɛ̃ː2'), 'ɛ̃');
  assert.ok(isV('ɛ̃ː2'));
  for (const [family, seed, anchor] of [
    ['original', '0', undefined], ['romance', '21', 'french'],
    ['romance', '1', 'portuguese'], ['slavic', '0', 'polish'],
  ]) {
    const ancestry = anchor ? 'real' : 'invented';
    const lang = generate({ family, ancestry, complexity: 5, drift: 80, tone: 'two', script: 'original' }, seed);
    assert.equal(lang.descent?.path.anchor, anchor);
    const inventory = lang.ph.vowels.filter(v => SEGMENTS[v].nasal);
    assert.ok(inventory.length >= 2);
    const entry = lang.lex.entries.find(e => e.segs.some(s => inventory.includes(vBase(s))));
    assert.ok(entry);
    assert.match(lang.ipa(entry.segs).normalize('NFD'), /̃/);
    const grammar = renderGrammar(lang);
    assert.ok(inventory.every(v => grammar.includes(v)));
    assert.equal(writeWord(lang, ['k', 'ã'], 'devanagari'), 'कँ');
  }
});

test('descent distinguishes inherited nasal vowels from oral vowel and nasal consonant sequences', () => {
  const evolveOn = (family, anchor, form) => evolve(choosePath(family, '0', { anchor, fidelity: 1, drift: 80 }).rules, form).segs;
  assert.deepEqual(evolveOn('romance', 'french', 'l uː n a'), ['l', 'y', 'n']);
  assert.ok(evolveOn('romance', 'french', 'k a n t aː r e').includes('ɑ̃'));
  assert.ok(evolveOn('romance', 'portuguese', 'k a n t aː r e').includes('ã'));
  assert.deepEqual(evolveOn('slavic', 'polish', 'm ẽ s o'), ['m', 'ɛ̃', 's', 'o']);
  assert.deepEqual(evolveOn('slavic', 'polish', 'ʒ e n a'), ['ʒ', 'e', 'n', 'a']);
  assert.ok(evolveOn('slavic', 'russian', 'm ẽ s o').every(s => !SEGMENTS[vBase(s)]?.nasal));
});

test('family shares describe dictionary roots and loans respect their entry dates', () => {
  for (const family of FAMILY_ORDER) {
    for (const ancestry of ['invented', 'real']) {
      const lang = generate({ ...recipe, family, ancestry }, 'harbour');
      for (const c of lang.contacts) {
        const loans = lang.lex.entries.filter(e => e.loan?.family === c.family);
        assert.ok(Math.abs(loans.length - lang.contactRootCount * c.percent / 100) < 1);
        for (const e of loans) {
          assert.ok(e.loan.borrowedYearsAgo >= 0 && e.loan.borrowedYearsAgo <= c.yearsAgo);
          if (c.yearsAgo === 0) {
            assert.equal(e.loan.contactStep, c.totalSteps);
            assert.deepEqual(e.segs, e.loan.adapted);
          }
        }
      }
      for (const [gloss, , , , [, modifier, head]] of MEANINGS.filter(m => m[5])) {
        const entry = lang.lex.byGloss[gloss];
        assert.deepEqual(entry.deriv.from, [modifier, head]);
        for (const base of [modifier, head]) {
          const part = lang.lex.byGloss[base].segs;
          assert.ok(entry.segs.some((_, i) => part.every((s, j) => s === entry.segs[i + j])), gloss);
        }
      }
    }
  }
});

test('contact ages change forms, recipes replay, and extreme shares are respected', () => {
  const at = yearsAgo => generate({ ...recipe, contacts: [{ family: 'romance', percent: 100, yearsAgo }] }, 'history');
  const old = at(3000), recent = at(0);
  const loans = recent.lex.entries.filter(e => e.borrowed);
  assert.equal(loans.length, recent.contactRootCount);
  assert.ok(loans.some(e => e.segs.join(' ') !== old.lex.byGloss[e.gloss].segs.join(' ')));
  assert.deepEqual(at(0).lex.entries, recent.lex.entries);
  const empty = generate({ ...recipe, contacts: contacts.map(c => ({ ...c, percent: 0 })) }, 'history');
  assert.equal(empty.lex.entries.filter(e => e.borrowed).length, 0);
  const legacy = generate({ family: 'semitic', influence: 'romance', influenceLevel: 'heavy' }, 'history');
  assert.ok(legacy.lex.entries.some(e => e.borrowed));
  assert.doesNotThrow(() => vocabRows(legacy));
  for (const invalid of [
    [contacts[0], contacts[0]], [{ ...contacts[0], yearsAgo: -1 }], [{ ...contacts[0], percent: 101 }],
    [contacts[0], { ...contacts[1], percent: 70 }],
  ]) assert.throws(() => generate({ ...recipe, contacts: invalid }), RangeError);
});

test('each grammar feature can be used alone or excluded', () => {
  for (const id of Object.keys(QUIRKS)) {
    const on = generate({ family: 'romance', quirks: 'none', features: { [id]: 'on' } }, 'pins');
    assert.deepEqual(on.quirks, [id]);
    assert.doesNotThrow(() => renderGrammar(on));
    const off = generate({ family: 'original', quirks: 'many', features: { [id]: 'off' } }, 'pins');
    assert.ok(!off.quirks.includes(id));
  }
  const conflict = generate({ morph: 'fusional', features: { serial: 'on' } }, 'pins');
  assert.ok(conflict.notes.some(n => n.text.includes('requires isolating')));
});

test('irregularity controls exceptional stems and preserves dictionary roots', () => {
  for (const morph of ['isolating', 'fusional', 'agglutinative']) {
    let previous;
    for (const percent of [0, 10, 50, 100]) {
      const lang = generate({ family: 'germanic', morph, irregularity: percent }, 'exceptions');
      const verbs = lang.lex.entries.filter(e => e.pos === 'v');
      const exceptional = new Set(verbs.filter(e => e.pastStem || e.suppletive).map(e => e.gloss));
      assert.equal(exceptional.size, Math.round(verbs.length * percent / 100));
      for (const e of verbs.filter(e => e.pastStem)) assert.notDeepEqual(e.pastStem, e.segs);
      const roots = verbs.map(e => e.segs);
      if (previous) {
        assert.deepEqual(roots, previous.roots);
        for (const g of previous.exceptional) assert.ok(exceptional.has(g));
      }
      previous = { roots, exceptional };
    }
  }
});

test('comparatives and superlatives reach translation and word-by-word glosses', () => {
  for (const mode of ['prefix', 'suffix', 'particle', 'unmarked']) {
    const lang = generate({ ...recipe, comparative: mode, superlative: mode }, 'degree');
    for (const [text, code] of [
      ['The football is bigger than the basketball.', 'CMPR'],
      ['The house is the best.', 'SUPL'],
      ['I see the most beautiful tree.', 'SUPL'],
    ]) {
      const result = translate(lang, text);
      assert.deepEqual(result.dropped, []);
      const words = result.sentences[0].words;
      const marked = words.find(w => w.parts.some(p => p.gloss === code));
      if (mode === 'unmarked') assert.equal(marked, undefined);
      if (mode === 'particle') assert.deepEqual(marked.parts.map(p => p.gloss), [code]);
      if (mode === 'prefix') assert.equal(marked.parts[0].gloss, code);
      if (mode === 'suffix') assert.equal(marked.parts.at(-1).gloss, code);
      if (code === 'CMPR') assert.ok(words.some(w => w.parts.some(p => p.gloss === 'basketball')));
    }
  }
});

test('common coinages and grammatical words stay short across the family profiles', () => {
  const lengths = { common: [], other: [], pron: [], art: [] };
  for (const family of FAMILY_ORDER) {
    const lang = generate({ family, ancestry: 'invented', articles: 'both', wordLen: 3 }, 'short');
    for (const e of lang.lex.entries.filter(e => !e.deriv)) lengths[e.basic === 1 ? 'common' : 'other'].push(e.syllables);
    for (const row of vocabRows(lang).filter(r => ['pron', 'art'].includes(r.pos))) {
      lengths[row.pos].push(row.segs.filter(isV).length);
    }
  }
  const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
  assert.ok(mean(lengths.common) < mean(lengths.other));
  assert.ok(mean(lengths.pron) < 1.6);
  assert.ok(mean(lengths.art) < 1.6);
});
