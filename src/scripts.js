// Writing systems. Real scripts map phonemes to the nearest letters ([ASSUMPTION] mappings by the author);
// the original script is generated from a seeded stroke grammar and rendered as SVG.
import { SEGMENTS } from './data/phonemes.js';
import { isV, vBase, isLong, syllabify, toIPA } from './phonology.js';
import { stream } from './rng.js';

export const SCRIPT_LIST = [
  ['latin', 'Latin (romanization)'], ['ipa', 'IPA'], ['cyrillic', 'Cyrillic'], ['greek', 'Greek'], ['georgian', 'Georgian'],
  ['armenian', 'Armenian'], ['runic', 'Runic (Elder Futhark)'], ['arabic', 'Arabic (abjad)'], ['hebrew', 'Hebrew (abjad)'],
  ['devanagari', 'Devanagari (abugida)'], ['original', 'Original (generated)'],
];

// Letter values checked 2026-11-23 against references/scripts.json (sources in references/manifest/scripts.json;
// details in references/scripts/notes.md). Approved fixes D1-D6 applied. Values with no attested convention:
// ASSUMPTION: no attested convention — greek ʃ:'σσ'
// ASSUMPTION: no attested convention — greek ŋ:'γκ' when not before a velar (before a velar: γ, attested)
// ASSUMPTION: no attested convention — runic ʃ:'ᛊᚺ'
// ASSUMPTION: no attested convention — runic y:'ᚢᛁ'
// ASSUMPTION: no attested convention — runic ø:'ᛟᛁ'
// ASSUMPTION: no attested convention — runic ts:'ᛏᛊ' and tʃ:'ᛏᛊ'
// ASSUMPTION: no attested convention — runic dʒ:'ᛞᛉ'
// ASSUMPTION: no attested convention — runic æ:'ᚨᛁ' (ᛇ is attested but its value is disputed)
// ASSUMPTION: no attested convention — devanagari θ:'थ़', ð:'द़', ç:'श़'
// ASSUMPTION: no attested convention — cyrillic long vowels with a combining macron
// ASSUMPTION: no attested convention — georgian and armenian long vowels by doubling the letter
// ASSUMPTION: no attested convention — arabic word-initial vowels written with أ / إ
// ASSUMPTION: no attested convention — armenian ŋ:'նգ' when not before a velar (before a velar: ն, attested)
const T = {
  cyrillic: { p: 'п', b: 'б', t: 'т', d: 'д', k: 'к', g: 'г', q: 'ҡ', ʔ: 'ъ', m: 'м', n: 'н', s: 'с', z: 'з', ʃ: 'ш', ʒ: 'ж', tʃ: 'ч', ts: 'ц', dz: 'ѕ', dʒ: 'џ', x: 'х', χ: 'х', f: 'ф', ɸ: 'ф', v: 'в', β: 'б', l: 'л', ɫ: 'л', r: 'р', ɾ: 'р', ɻ: 'р', j: 'й', w: 'ў', h: 'һ', ɲ: 'нь', ŋ: 'ң', ɕ: 'щ', ʑ: 'жь', tɕ: 'ч', dʑ: 'ђ', θ: 'ѳ', ð: 'ҙ', ɣ: 'гӀ', ʁ: 'ғ', ħ: 'ҳ', ʕ: 'Ӏ', tʲ: 'ть', dʲ: 'дь', nʲ: 'нь', lʲ: 'ль', rʲ: 'рь', sʲ: 'сь', ʎ: 'ль', ɬ: 'лъ', ç: 'хь', ʂ: 'ш', tʂ: 'ч', ʈ: 'т', ɖ: 'д', ɳ: 'н', a: 'а', e: 'е', i: 'и', o: 'о', u: 'у', ɨ: 'ы', ə: 'ә', y: 'ү', ø: 'ө', æ: 'ӓ', ɯ: 'ы', ɛ: 'э', ɔ: 'о', ɤ: 'ы', ɑ: 'а', 'ᵐb': 'мб', 'ⁿd': 'нд', 'ᵑɡ': 'нг', tʼ: 'тӀ', kʼ: 'кӀ', c: 'ть', ɟ: 'дь' },
  greek: { p: 'π', b: 'β', t: 'τ', d: 'δ', k: 'κ', g: 'γ', m: 'μ', n: 'ν', s: 'σ', z: 'ζ', l: 'λ', r: 'ρ', ɾ: 'ρ', f: 'φ', v: 'β', θ: 'θ', ð: 'δ', x: 'χ', ɣ: 'γ', pʰ: 'φ', tʰ: 'θ', kʰ: 'χ', j: 'ι', h: '', w: 'υ', ʃ: 'σσ', tʃ: 'τσ', ts: 'τσ', dz: 'τζ', dʒ: 'τζ', ʒ: 'ζ', q: 'κ', ʔ: '', ŋ: 'γκ', ɲ: 'νι', χ: 'χ', a: 'α', e: 'ε', i: 'ι', o: 'ο', u: 'ου', y: 'υ', ɛ: 'ε', ɔ: 'ο', ə: 'ε', ɨ: 'υ', æ: 'αι', ø: 'οι', ɯ: 'υ', ɑ: 'α', 'aː': 'α', 'eː': 'ει', 'oː': 'ω', 'iː': 'ι', 'uː': 'ου', 'ᵐb': 'μπ', 'ⁿd': 'ντ', 'ᵑɡ': 'γγ' },
  georgian: { a: 'ა', b: 'ბ', g: 'გ', d: 'დ', e: 'ე', v: 'ვ', z: 'ზ', tʰ: 'თ', i: 'ი', kʼ: 'კ', l: 'ლ', m: 'მ', n: 'ნ', o: 'ო', pʼ: 'პ', ʒ: 'ჟ', r: 'რ', ɾ: 'რ', s: 'ს', tʼ: 'ტ', u: 'უ', pʰ: 'ფ', kʰ: 'ქ', ɣ: 'ღ', q: 'ჴ', ʃ: 'შ', tʃ: 'ჩ', ts: 'ც', dz: 'ძ', x: 'ხ', χ: 'ხ', dʒ: 'ჯ', h: 'ჰ', p: 'ფ', t: 'თ', k: 'ქ', f: 'ჶ', j: 'ჲ', w: 'ჳ', ə: 'ჷ', ʔ: 'ჸ', θ: 'თ', ð: 'დ', ŋ: 'ნგ', ɲ: 'ნჲ', y: 'უ', ø: 'ო', ɨ: 'ჷ', æ: 'ა', ɛ: 'ე', ɔ: 'ო', ɯ: 'ჷ' },
  armenian: { a: 'ա', b: 'բ', g: 'գ', d: 'դ', e: 'ե', z: 'զ', ə: 'ը', tʰ: 'թ', ʒ: 'ժ', i: 'ի', l: 'լ', χ: 'խ', x: 'խ', ts: 'ծ', k: 'կ', h: 'հ', dz: 'ձ', ɣ: 'ղ', ʁ: 'ղ', tʃ: 'ճ', m: 'մ', j: 'յ', n: 'ն', ʃ: 'շ', o: 'օ', p: 'պ', dʒ: 'ջ', r: 'ռ', s: 'ս', v: 'վ', t: 'տ', ɾ: 'ր', w: 'ւ', pʰ: 'փ', kʰ: 'ք', f: 'ֆ', u: 'ու', ɛ: 'է', ɔ: 'օ', q: 'ք', θ: 'թ', ð: 'դ', ŋ: 'նգ', ɲ: 'նյ', y: 'իւ', ø: 'էօ', æ: 'ա', ɨ: 'ը', ʔ: '', ɯ: 'ը' },
  runic: { f: 'ᚠ', u: 'ᚢ', θ: 'ᚦ', ð: 'ᚦ', a: 'ᚨ', r: 'ᚱ', ɾ: 'ᚱ', k: 'ᚲ', g: 'ᚷ', ɣ: 'ᚷ', w: 'ᚹ', v: 'ᚹ', h: 'ᚺ', x: 'ᚺ', ç: 'ᚺ', n: 'ᚾ', i: 'ᛁ', j: 'ᛃ', p: 'ᛈ', z: 'ᛉ', s: 'ᛊ', ʃ: 'ᛊᚺ', t: 'ᛏ', b: 'ᛒ', e: 'ᛖ', ɛ: 'ᛖ', ə: 'ᛖ', m: 'ᛗ', l: 'ᛚ', ŋ: 'ᛜ', o: 'ᛟ', ɔ: 'ᛟ', d: 'ᛞ', y: 'ᚢᛁ', ø: 'ᛟᛁ', æ: 'ᚨᛁ', ɑ: 'ᚨ', ts: 'ᛏᛊ', tʃ: 'ᛏᛊ', dʒ: 'ᛞᛉ', q: 'ᚲ', ʔ: '', pʰ: 'ᛈ', tʰ: 'ᛏ', kʰ: 'ᚲ', ɨ: 'ᛁ', ʒ: 'ᛉ' },
  arabic: { b: 'ب', t: 'ت', θ: 'ث', dʒ: 'ج', ħ: 'ح', x: 'خ', χ: 'خ', d: 'د', ð: 'ذ', r: 'ر', ɾ: 'ر', z: 'ز', s: 'س', ʃ: 'ش', sˤ: 'ص', dˤ: 'ض', tˤ: 'ط', ʕ: 'ع', ɣ: 'غ', ʁ: 'غ', f: 'ف', q: 'ق', k: 'ك', l: 'ل', m: 'م', n: 'ن', h: 'ه', w: 'و', j: 'ي', ʔ: 'ء', p: 'پ', v: 'ڤ', g: 'گ', tʃ: 'چ', ʒ: 'ژ', ts: 'تس', ŋ: 'نگ', ɲ: 'ني', tʰ: 'ت', kʰ: 'ك', pʰ: 'پ', ç: 'خ' },
  hebrew: { b: 'ב', g: 'ג', d: 'ד', h: 'ה', v: 'ו', w: 'ו׳', z: 'ז', ħ: 'ח', x: 'כ', χ: 'כ', tˤ: 'ט', j: 'י', k: 'ק', l: 'ל', m: 'מ', n: 'נ', s: 'ס', ʕ: 'ע', p: 'פ', f: 'פ', sˤ: 'צ', ts: 'צ', q: 'ק', r: 'ר', ɾ: 'ר', ʃ: 'ש', t: 'ת', ʔ: 'א', θ: 'ת׳', ð: 'ד׳', ɣ: 'ג', tʃ: 'צ׳', dʒ: 'ג׳', ʒ: 'ז׳', dˤ: 'צ׳', ŋ: 'נג', ɲ: 'ני', tʰ: 'ת', kʰ: 'כ' },
  devanagari: { k: 'क', kʰ: 'ख', g: 'ग', ɡʱ: 'घ', ŋ: 'ङ', tʃ: 'च', dʒ: 'ज', ɲ: 'ञ', ʈ: 'ट', ɖ: 'ड', ɳ: 'ण', t: 'त', tʰ: 'थ', d: 'द', dʱ: 'ध', n: 'न', p: 'प', pʰ: 'फ', b: 'ब', bʱ: 'भ', m: 'म', j: 'य', r: 'र', ɾ: 'र', l: 'ल', v: 'व', w: 'व', ʃ: 'श', ʂ: 'ष', s: 'स', h: 'ह', f: 'फ़', z: 'ज़', x: 'ख़', ɣ: 'ग़', q: 'क़', ts: 'च़', ʒ: 'झ़', θ: 'थ़', ð: 'द़', ʔ: 'ॽ', χ: 'ख़', ç: 'श़' },
};
const DEVA_V = { a: ['अ', ''], aː: ['आ', 'ा'], i: ['इ', 'ि'], iː: ['ई', 'ी'], u: ['उ', 'ु'], uː: ['ऊ', 'ू'], e: ['ए', 'े'], eː: ['ए', 'े'], o: ['ओ', 'ो'], oː: ['ओ', 'ो'], ɛ: ['ऐ', 'ै'], ɔ: ['औ', 'ौ'], ə: ['अ', ''], æ: ['ऐ', 'ै'], y: ['उ', 'ु'], ø: ['ओ', 'ो'], ɨ: ['इ', 'ि'], ɯ: ['उ', 'ु'], ɑ: ['आ', 'ा'], ɤ: ['ओ', 'ो'] };
const ARABIC_FINAL_FORMS = {};
const HEBREW_FINAL = { 'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ' };
const MATRES = { a: 'ا', e: 'ي', i: 'ي', o: 'و', u: 'و', ə: '', ɛ: 'ي', ɔ: 'و', y: 'و', ø: 'و', ɨ: 'ي', æ: 'ا', ɑ: 'ا', ɯ: 'و', ɤ: 'و' };
const HMATRES = { a: 'א', e: 'י', i: 'י', o: 'ו', u: 'ו', ə: '', ɛ: 'י', ɔ: 'ו', y: 'ו', ø: 'ו', ɨ: 'י', æ: 'א', ɑ: 'א', ɯ: 'ו', ɤ: 'ו' };
const NASAL_LETTER = { cyrillic: 'н', greek: 'ν', georgian: 'ნ', armenian: 'ն', runic: 'ᚾ', arabic: 'ن', hebrew: 'נ', devanagari: 'ँ' };
const nasalBase = (s) => SEGMENTS[vBase(s)]?.oral;

function strip(s) { return s.replace(/[ʰʱʲˤʼ]/g, '').replace(/^[ᵐⁿᵑ]/, ''); }
function look(table, s) {
  const b = s.replace(/[1-6]$/, '');
  if (table[b] !== undefined) return table[b];
  const nb = b.replace('ː', '');
  if (table[nb] !== undefined) return table[nb];
  const st = strip(nb);
  if (table[st] !== undefined) return table[st];
  // nearest by place + manner
  const f = SEGMENTS[nb];
  if (f) {
    const cand = Object.keys(table).find(k => SEGMENTS[k] && SEGMENTS[k].type === f.type && SEGMENTS[k].manner === f.manner && SEGMENTS[k].place === f.place)
      || Object.keys(table).find(k => SEGMENTS[k] && SEGMENTS[k].type === f.type && (SEGMENTS[k].manner === f.manner || SEGMENTS[k].height === f.height));
    if (cand) return table[cand];
  }
  return '';
}

// ---------- word rendering for text scripts ----------
export function writeWord(lang, segs, script = lang.script.id) {
  const ph = lang.ph;
  switch (script) {
    case 'latin': return lang.romanize(segs);
    case 'ipa': return toIPA(ph, segs).slice(1, -1);
    case 'cyrillic': case 'georgian': case 'armenian': case 'runic': {
      let out = '';
      // D4: Armenian ŋ before a velar is written ն
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i], oral = nasalBase(s);
        const g = script === 'armenian' && s === 'ŋ' && VELARS.has(segs[i + 1]) ? 'ն' : look(T[script], oral || s);
        out += g;
        if (isV(s) && isLong(s) && script !== 'runic') out += script === 'cyrillic' ? '̄' : g;
        if (oral) out += NASAL_LETTER[script];
      }
      return out;
    }
    case 'greek': {
      let out = '';
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i], n = segs[i + 1];
        if ((s === 'k' || s === 'p') && n === 's') { out += s === 'k' ? 'ξ' : 'ψ'; i++; continue; }
        if (s === 'ŋ' && VELARS.has(n)) { out += 'γ'; continue; }           // D3: ŋ before a velar is γ (γκ, γγ, γχ)
        const oral = nasalBase(s);
        const target = oral ? oral + (isLong(s) ? 'ː' : '') : s;
        let g = look(T.greek, target);
        if (isV(s) && segs[i - 1] === 'h') g = (g + '\u0314').normalize('NFC'); // D3: /h/ is rough breathing on the vowel
        out += g + (oral ? NASAL_LETTER.greek : '');
      }
      return out.replace(/σ$/, 'ς');
    }
    case 'arabic': case 'hebrew': {
      const tbl = T[script], matres = script === 'arabic' ? MATRES : HMATRES;
      const alef = script === 'arabic' ? 'ا' : 'א';
      let out = '';
      segs.forEach((s, i) => {
        if (isV(s)) {
          const oral = nasalBase(s), b = oral || vBase(s);
          const final = i === segs.length - 1;
          if (i === 0) out += script === 'arabic' ? (b === 'i' || b === 'e' ? 'إ' : 'أ') : alef;
          if (isLong(s) || final) out += final && script === 'hebrew' && b === 'a' ? 'ה' : (matres[b] ?? '');
          else if (i === 0 && script === 'hebrew' && 'iueo'.includes(b)) out += matres[b];
          if (oral) out += NASAL_LETTER[script];
        } else out += look(tbl, s);
      });
      if (script === 'hebrew') { const l = out[out.length - 1]; if (HEBREW_FINAL[l]) out = out.slice(0, -1) + HEBREW_FINAL[l]; }
      return out;
    }
    case 'devanagari': {
      let out = '';
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i];
        if (isV(s)) {
          const oral = nasalBase(s), b = oral || vBase(s);
          const k = b + (isLong(s) ? 'ː' : '');
          const v = DEVA_V[k] || DEVA_V[b] || ['अ', ''];
          const prevC = i > 0 && !isV(segs[i - 1]);
          out += prevC ? v[1] : v[0];
          if (oral) out += NASAL_LETTER.devanagari;
        } else {
          out += look(T.devanagari, s) || '?';
          const n = segs[i + 1];
          if (!n || !isV(n)) out += '्';
        }
      }
      return out;
    }
    case 'original': return null; // rendered as SVG
    default: return lang.romanize(segs);
  }
}

export const RTL = new Set(['arabic', 'hebrew']);
const VELARS = new Set(['k', 'g', 'ɡ', 'x', 'kʰ', 'ɣ']);

// ---------- original script: see glyphs.js ----------
export { buildOriginalScript, renderOriginal, originalCells, scriptCollisions, renderUnit, scriptChart, SYSTEM_LIST } from './glyphs.js';
