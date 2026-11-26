// Live translation English -> generated language. Rule-based and deliberately simple: one or more plain clauses
// (subject, verb, object, prepositional phrases, adjectives, determiners, numbers, tense, negation, questions).
// Unknown English words are coined on the fly, deterministically from (seed, word), and added to the lexicon.
// [ASSUMPTION] Coverage: the English parser knows the generator's built-in meanings, regular and common irregular
// inflection, pronouns, determiners and prepositions. Anything else is guessed from its position and ending.
import { MEANINGS, displayGloss } from './data/meanings.js';
import { genWord, isV } from './phonology.js';
import { applyCascade } from './history.js';
import { buildClause } from './syntax.js';
import { segKey } from './morphology.js';
import { stream } from './rng.js';

const IRREG_PAST = { saw: 'see', came: 'come', went: 'go', gave: 'give', took: 'take', made: 'make', ate: 'eat', drank: 'drink', slept: 'sleep', said: 'say', told: 'tell', knew: 'know', thought: 'think', ran: 'run', sat: 'sit', stood: 'stand', flew: 'fly', swam: 'swim', sang: 'sing', wrote: 'write', read: 'read', taught: 'teach', built: 'build', fought: 'fight', burnt: 'burn', rose: 'rise', fell: 'fall', held: 'hold', found: 'find', wept: 'weep', bought: 'buy', sought: 'seek', became: 'become', shone: 'shine', grew: 'grow', had: 'have', did: 'do', was: 'be', were: 'be', heard: 'hear', spoke: 'speak', killed: 'kill', lived: 'live', left: 'leave', got: 'get', brought: 'bring', felt: 'feel', kept: 'keep', meant: 'mean', met: 'meet', paid: 'pay', sent: 'send', spent: 'spend', won: 'win', lost: 'lose', drove: 'drive', rode: 'ride', broke: 'break', chose: 'choose', forgot: 'forget', threw: 'throw', wore: 'wear', woke: 'wake', hid: 'hide', bit: 'bite', led: 'lead', fed: 'feed', hung: 'hang', struck: 'strike', began: 'begin', sank: 'sink', drew: 'draw', blew: 'blow', caught: 'catch', dug: 'dig', lay: 'lie', shook: 'shake', stole: 'steal' };
const IRREG_PP = { seen: 'see', gone: 'go', given: 'give', taken: 'take', eaten: 'eat', drunk: 'drink', known: 'know', flown: 'fly', swum: 'swim', sung: 'sing', written: 'write', risen: 'rise', fallen: 'fall', become: 'become', grown: 'grow', been: 'be', done: 'do', spoken: 'speak', run: 'run', come: 'come', broken: 'break', chosen: 'choose', forgotten: 'forget', thrown: 'throw', worn: 'wear', hidden: 'hide', bitten: 'bite', begun: 'begin', drawn: 'draw', blown: 'blow', stolen: 'steal', shaken: 'shake' };
const IRREG_PL = { children: 'child', men: 'man', women: 'woman', teeth: 'tooth', feet: 'foot', wolves: 'wolf', knives: 'knife', leaves: 'leaf', mice: 'mouse', geese: 'goose', lives: 'life', wives: 'wife', thieves: 'thief', fish: 'fish', sheep: 'sheep', deer: 'deer', people: 'people', oxen: 'ox', cities: 'city', stories: 'story', ladies: 'lady' };
const SYN = { large: 'big', great: 'big', little: 'small', tiny: 'small', huge: 'big', speak: 'speak', talk: 'speak', look: 'see', watch: 'see', listen: 'hear', love: 'love', fear: 'fear', ocean: 'sea', boy: 'child', girl: 'child', kid: 'child', wife: 'woman', husband: 'man', mom: 'mother', dad: 'father', home: 'house', street: 'road', path: 'road', town: 'city', woods: 'forest', rock: 'stone', blaze: 'fire', lord: 'king', ruler: 'king', fast: 'quick', glad: 'happy', joyful: 'happy', pretty: 'beautiful', lovely: 'beautiful', mighty: 'strong', clever: 'wise', smart: 'wise', grab: 'take', get: 'take', create: 'make', construct: 'build', journey: 'way', soul: 'spirit', ghost: 'spirit', doggy: 'dog', puppy: 'dog', kitten: 'cat', hound: 'dog', bright: 'bright', shiny: 'bright', hello: null };
const PRON = { i: ['1SG', 'S'], me: ['1SG', 'O'], my: ['1SG', 'P'], mine: ['1SG', 'P'], you: ['2SG', 'X'], your: ['2SG', 'P'], yours: ['2SG', 'P'], he: ['3SG', 'S'], him: ['3SG', 'O'], his: ['3SG', 'P'], she: ['3SG', 'S'], her: ['3SG', 'OP'], it: ['3SG', 'X'], its: ['3SG', 'P'], we: ['1PL', 'S'], us: ['1PL', 'O'], our: ['1PL', 'P'], they: ['3PL', 'S'], them: ['3PL', 'O'], their: ['3PL', 'P'] };
const PREP = { in: 'location', at: 'location', on: 'location', inside: 'location', to: 'goal', into: 'goal', towards: 'goal', toward: 'goal', from: 'source', with: 'with', without: 'without', for: 'recipient', of: 'possessor', as: 'state', under: 'location', near: 'location', by: 'instrument', through: 'location', over: 'location', above: 'location', below: 'location', behind: 'location', across: 'location', around: 'location', between: 'location', beside: 'location', along: 'location', upon: 'location', against: 'location', after: 'location', before: 'location' };
const ROLE_CASE = { location: 'LOC', goal: 'ALL', source: 'ABL', instrument: 'INS', companion: 'COM', recipient: 'DAT', without: 'ABE', state: 'ESS' };
const AUX = new Set(['do', 'does', 'did', 'will', 'shall', 'would', 'is', 'are', 'am', 'was', 'were', 'have', 'has', 'had', 'can', 'could', 'must', 'should', 'may', 'might', "'s", "'re", "'m"]);
const WH = new Set(['who', 'what', 'where', 'when', 'why', 'how']);
const NUMS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, twenty: 20, hundred: 100, thousand: 1000 };
const CONJ = new Set(['and', 'but', 'or', 'because', 'if']);
const ADV = new Set(['here', 'there', 'now', 'today', 'tomorrow', 'yesterday', 'always', 'never', 'again', 'very']);

const SUBORD = new Set(['when', 'if', 'because', 'while']);
const DET = new Set(['the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'some', 'every', 'no', 'many', 'all']);
const REL = new Set(['who', 'which', 'that']);
const POS_OF = {};
for (const [g, pos] of MEANINGS) { const d = displayGloss(g); if (!POS_OF[d]) POS_OF[d] = []; POS_OF[d].push([g, pos]); }

function known(lang, word, want) {
  const cands = POS_OF[word] || [];
  const user = lang.lex.byGloss['u:' + word];
  const all = [...cands.map(([g, pos]) => ({ gloss: g, pos })), ...(user ? [{ gloss: user.gloss, pos: user.pos }] : [])];
  if (want) { const hit = all.find(c => c.pos === want || (want === 'v' && c.gloss === word + '.v')); if (hit) return hit; }
  return all[0] || null;
}

function lemmaVerb(w) {
  if (IRREG_PAST[w]) return { lemma: IRREG_PAST[w], tense: 'PST' };
  if (IRREG_PP[w]) return { lemma: IRREG_PP[w], pp: true };
  if (w.endsWith('ied') && !POS_OF[w.slice(0, -1)]) return { lemma: w.slice(0, -3) + 'y', tense: 'PST' };
  if (w.endsWith('ed') && !POS_OF[w] && !w.endsWith('eed')) { const b = w.slice(0, -2); return { lemma: POS_OF[b] || POS_OF[b + 'e'] ? (POS_OF[b] ? b : b + 'e') : (/(.)\1$/.test(b) ? b.slice(0, -1) : POS_OF[w.slice(0, -1)] ? w.slice(0, -1) : b), tense: 'PST' }; }
  if (w.endsWith('ing') && !POS_OF[w] && !SYN[w] && (POS_OF[w.slice(0, -3)] || POS_OF[w.slice(0, -3) + 'e'] || POS_OF[w.slice(0, -4)] || w.length > 5)) { const b = w.slice(0, -3); return { lemma: POS_OF[b] ? b : POS_OF[b + 'e'] ? b + 'e' : /(.)\1$/.test(b) ? b.slice(0, -1) : b, prog: true }; }
  if (w.endsWith('ies')) return { lemma: w.slice(0, -3) + 'y', s: true };
  if (w.endsWith('es') && POS_OF[w.slice(0, -2)]) return { lemma: w.slice(0, -2), s: true };
  if (w.endsWith('s') && !w.endsWith('ss')) return { lemma: w.slice(0, -1), s: true };
  return { lemma: w };
}
// comparative / superlative adjective -> base: bigger -> big, wiser -> wise, happiest -> happy
const IRREG_DEGREE = { better: ['good', 'CMPR'], best: ['good', 'SUPL'], worse: ['bad', 'CMPR'], worst: ['bad', 'SUPL'] };
function lemmaAdj(w) {
  if (IRREG_DEGREE[w]) {
    const [lemma, degree] = IRREG_DEGREE[w];
    return { lemma, degree };
  }
  for (const suf of ['est', 'er']) {
    if (!w.endsWith(suf) || w.length < suf.length + 2) continue;
    const b = w.slice(0, -suf.length);
    const cands = [b, b + 'e', b.replace(/i$/, 'y'), /([bdgmnpt])\1$/.test(b) ? b.slice(0, -1) : null].filter(Boolean);
    const hit = cands.find(c => (POS_OF[c] || []).some(([, pos]) => pos === 'adj') || (SYN[c] && (POS_OF[SYN[c]] || []).some(([, pos]) => pos === 'adj')));
    if (hit) return { lemma: hit, degree: suf === 'er' ? 'CMPR' : 'SUPL' };
  }
  return { lemma: w };
}
function stripDegree(w) { // for an unknown adjective already known to be comparative ("taller than")
  const b = w.replace(/(est|er)$/, '');
  return /([bdgmnpt])\1$/.test(b) ? b.slice(0, -1) : b.replace(/i$/, 'y'); // bigger -> big, thinner -> thin, but taller -> tall
}
// does this word list contain a finite verb (or an auxiliary)?
function hasVerbLike(lang, ws) {
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i];
    if (AUX.has(w) && w !== "'s") return true;
    if (DET.has(ws[i - 1]) || PREP[ws[i - 1]]) continue;
    if (IRREG_PAST[w]) return true;
    const l = lemmaVerb(w).lemma;
    const k = known(lang, SYN[l] || l, 'v');
    if ((k && k.pos === 'v') || lang.lex.byGloss['u:' + l]?.pos === 'v') return true;
  }
  return false;
}
function verbForm(lang, w) {
  if (!w) return false;
  if (IRREG_PAST[w] || IRREG_PP[w]) return true;
  const l = lemmaVerb(w).lemma;
  const k = known(lang, SYN[l] || l, 'v');
  return (k && k.pos === 'v') || lang.lex.byGloss['u:' + l]?.pos === 'v' || (/[^e]ed$/.test(w) && !POS_OF[w]);
}
function lemmaNoun(w) {
  if (IRREG_PL[w]) return { lemma: IRREG_PL[w], pl: w !== IRREG_PL[w] || w === 'people' ? true : false };
  if (POS_OF[w]) return { lemma: w, pl: false };
  if (w.endsWith('ies') && POS_OF[w.slice(0, -3) + 'y']) return { lemma: w.slice(0, -3) + 'y', pl: true };
  if (w.endsWith('es') && POS_OF[w.slice(0, -2)]) return { lemma: w.slice(0, -2), pl: true };
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return { lemma: w.slice(0, -1), pl: true };
  return { lemma: w, pl: false };
}
function guessPos(w) {
  if (/ly$/.test(w)) return 'adv';
  if (/(ness|tion|sion|ment|ity|ship|hood|dom|ism|ist|er|or|ance|ence|age)$/.test(w)) return 'n';
  if (/(ous|ful|ive|able|ible|al|ic|ish|less|ant|ent|y)$/.test(w)) return 'adj';
  if (/(ize|ise|ify|ate|en)$/.test(w)) return 'v';
  return null;
}

// ---------------------------------------------------------------- coining new words
export function coinWord(lang, english, pos) {
  const { ph } = lang;
  const sp = lang.shape;
  const taken = new Set(lang.lex.entries.map(e => segKey(e.segs)));
  for (const e of Object.values(lang.lex.byGloss)) if (e?.segs) taken.add(segKey(e.segs));
  let segs, proto;
  for (let attempt = 0; attempt < 40; attempt++) {
    const rng = stream(lang.seed, 'user', english, attempt);
    const n = Math.max(1, Math.round(lang.controls.wordLen + (pos === 'n' ? 0.2 : 0) + rng.range(-0.6, 0.6))) + Math.floor(attempt / 10);
    proto = lang.coinProto ? lang.coinProto(rng, n, pos) : genWord(ph, sp, rng, ph.family === 'sinitic' ? Math.min(2, n) : n);
    segs = applyCascade(lang.cascade, ph, proto, rng).segs;
    if (!taken.has(segKey(segs)) && segs.length >= 2) break;
  }
  const gloss = english;
  const e = { gloss, pos, basic: 2, tags: [], segs, proto, applied: [], exempt: [], user: true, syllables: segs.filter(isV).length, conj: 0 };
  // gender: predictable from the final sound, as for other nouns without natural gender
  const m = lang.morph;
  if (pos === 'n' && m.genders.length) {
    if (m.nounClasses) e.gender = m.genders[2].id;
    else if (m.declensions) { const last = segs[segs.length - 1]; const d = m.declensions.find(x => x.theme && isV(last) && last[0] === x.theme) || m.declensions[m.declensions.length - 1]; e.gender = d.gender || m.genders[0].id; }
    else e.gender = m.genders[(segs[segs.length - 1].codePointAt(0) + (isV(segs[segs.length - 1]) ? 7 : 0)) % m.genders.length].id;
  }
  return e;
}
export function addUserWord(lang, english, pos) {
  const key = 'u:' + english;
  if (lang.lex.byGloss[key]) return lang.lex.byGloss[key];
  const e = coinWord(lang, english, pos);
  e.key = key;
  lang.lex.byGloss[key] = e;
  lang.lex.byGloss[english] = lang.lex.byGloss[english] || e; // let the clause builder find it by its gloss
  (lang.userWords = lang.userWords || []).push(e);
  return e;
}

// ---------------------------------------------------------------- parsing
function tokenize(text) {
  return text.toLowerCase().replace(/[’']s\b/g, " 's").replace(/n[’']t\b/g, ' not').replace(/[’']re\b/g, " 're").replace(/[’']m\b/g, " 'm").replace(/[’']ll\b/g, ' will')
    .replace(/([.,!?;:])/g, ' $1 ').split(/\s+/).filter(Boolean);
}

export function translate(lang, text) {
  const out = [];
  const coined = [];
  const dropped = [];
  const sentences = text.split(/(?<=[.!?;])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  for (const sent of sentences) {
    const toks = tokenize(sent);
    const isQ = toks.includes('?');
    // 1) chunks at commas; a chunk without a verb is a list item or a fronted phrase, so it rejoins its neighbour
    const raw = [[]];
    for (const t of toks) { if (t === ',') raw.push([]); else if (!/^[.!?;:]$/.test(t)) raw[raw.length - 1].push(t); }
    const chunks = [];
    let carry = [];
    for (const c of raw.filter(x => x.length)) {
      const body = SUBORD.has(c[0]) ? c.slice(1) : c;
      if (!hasVerbLike(lang, body)) {
        if (chunks.length && !SUBORD.has(c[0])) chunks[chunks.length - 1].push(...(CONJ.has(c[0]) ? [] : ['and']), ...c);
        else carry.push(...c);
        continue;
      }
      chunks.push([...carry, ...c]); carry = [];
    }
    if (carry.length) { if (chunks.length) chunks[chunks.length - 1].push(...carry); else chunks.push(carry); }
    // 2) inside each chunk: a leading subordinator, then split at a conjunction only when both sides have a verb
    const clauses = [];
    for (const c of chunks) {
      let words = c;
      if (SUBORD.has(words[0]) && words.length > 1) { clauses.push({ conj: words[0] === 'while' ? 'when' : words[0] }); words = words.slice(1); }
      let cur = [];
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if ((CONJ.has(w) || SUBORD.has(w)) && cur.length && i + 1 < words.length) {
          let j = i + 1; while (j < words.length && !CONJ.has(words[j]) && !SUBORD.has(words[j])) j++;
          const right = words.slice(i + 1, j);
          if (hasVerbLike(lang, cur) && (hasVerbLike(lang, right) || PRON[right[0]]?.[1] === 'S') && !(right.length && !verbForm(lang, right[0]) && !hasVerbLike(lang, right.slice(1)) && !PRON[right[0]])) { clauses.push({ words: cur }); cur = []; clauses.push({ conj: w === 'while' ? 'when' : w }); continue; }
        }
        cur.push(w);
      }
      if (cur.length) clauses.push({ words: cur });
    }
    const built = [];
    for (const c of clauses) {
      if (c.conj) { const e = lang.lex.byGloss[c.conj]; if (e) built.push({ conj: { segs: e.segs, parts: [{ segs: e.segs, gloss: c.conj }] } }); continue; }
      const prev = [...built].reverse().find(b => b.spec)?.spec;
      const afterConj = built.length && built[built.length - 1].conj;
      const specs = parseClause(lang, c.words, isQ, coined, dropped, afterConj && prev ? prev.S : null);
      for (const spec of [].concat(specs || [])) {
        let clause;
        try { clause = buildClause(lang, spec); } catch (err) { clause = null; }
        if (clause) built.push({ clause, spec });
      }
    }
    // merge into one line for display
    const allWords = [];
    for (const b of built) { if (b.conj) allWords.push(b.conj); else allWords.push(...b.clause.words); }
    out.push({ en: sent, words: allWords, q: isQ, specs: built.filter(b => b.spec).map(b => b.spec) });
  }
  return { sentences: out, coined, dropped };
}

function parseClause(lang, wsIn, isQ, coined, dropped = [], inheritS = null, forceVerb = false) {
  const lex = lang.lex.byGloss;
  const spec = { obl: [] };
  // manner adverbs in -ly and "please" have no counterpart in the lexicon: note them and leave them out
  const ws = wsIn.filter(w => { const drop = w === 'please' || (/ly$/.test(w) && w.length > 4 && !known(lang, w)); if (drop) dropped.push(w); return !drop; });
  let i = 0;
  const peek = () => ws[i];
  const lookupOrCoin = (lemma, pos) => {
    if (SYN[lemma]) lemma = SYN[lemma];
    const k = known(lang, lemma, pos);
    if (k && lex[k.gloss]) return k.gloss;
    if (lex['u:' + lemma]) return lex['u:' + lemma].gloss;
    const e = addUserWord(lang, lemma, pos);
    coined.push(e);
    return e.gloss;
  };
  const isNounish = (w) => { if (!w) return false; const l = lemmaNoun(w).lemma; const k = known(lang, SYN[l] || l); return !!(k && k.pos === 'n') || !!lex['u:' + l] && lex['u:' + l].pos === 'n'; };
  const isAdj = (w) => { const k = known(lang, SYN[w] || w, 'adj'); return (k && k.pos === 'adj') || lex['u:' + w]?.pos === 'adj'; };
  const isVerbish = (w) => { if (!w) return false; const l = lemmaVerb(w).lemma; const k = known(lang, SYN[l] || l, 'v'); return (k && k.pos === 'v') || lex['u:' + l]?.pos === 'v'; };
  const npStart = (w) => !!w && (['the', 'a', 'an', 'this', 'that', 'these', 'those', 'some', 'many', 'all', 'no', 'every'].includes(w) || PRON[w] || NUMS[w] || isNounish(w) || isAdj(w) || w === 'very' || ['nothing', 'nobody', 'everyone', 'someone', 'something'].includes(w));

  function readDegree(at) {
    const w = ws[at];
    if (!w) return null;
    if (['more', 'most'].includes(w) && ws[at + 1] && !DET.has(ws[at + 1]) && !PREP[ws[at + 1]] &&
        !isNounish(ws[at + 1]) && !AUX.has(ws[at + 1])) {
      return { lemma: ws[at + 1], degree: w === 'more' ? 'CMPR' : 'SUPL', end: at + 2 };
    }
    const parsed = lemmaAdj(w);
    if (parsed.degree) return { ...parsed, end: at + 1 };
    if (/er$/.test(w) && ws[at + 1] === 'than') return { lemma: stripDegree(w), degree: 'CMPR', end: at + 1 };
    return null;
  }

  let noCompound = false;
  function parseNP() {
    const np = {};
    let w = peek();
    if (!w) return null;
    if (WH.has(w) && (w === 'who' || w === 'what')) { i++; return { wh: w }; }
    if (w === 'nothing' || w === 'nobody' || (w === 'no' && ws[i + 1] === 'one')) { i += w === 'no' ? 2 : 1; spec.neg = true; return { n: w === 'nothing' ? 'thing' : 'person', indef: true }; }
    if (['something', 'someone', 'everyone'].includes(w)) { i++; return { n: w === 'something' ? 'thing' : 'person', indef: w !== 'everyone', ...(w === 'everyone' ? { adj: 'all', number: 'PL' } : {}) }; }
    if (PRON[w] && PRON[w][1] !== 'P' && !(PRON[w][1] === 'OP' && npStart(ws[i + 1]) && !PRON[ws[i + 1]])) { i++; return { pron: PRON[w][0] === '2SG' && ws[i] === 'all' ? (i++, '2PL') : PRON[w][0] }; }
    while ((w = peek())) {
      if (w === 'the') { np.def = true; i++; continue; }
      if (w === 'a' || w === 'an') { np.indef = true; i++; continue; }
      if (w === 'this' || w === 'these') { np.dem = 'this'; i++; if (w === 'these') np.number = 'PL'; continue; }
      if (w === 'that' || w === 'those') { np.dem = 'that'; i++; if (w === 'those') np.number = 'PL'; continue; }
      if (w === 'some') { np.indef = true; i++; continue; }
      if (w === 'no') { spec.neg = true; i++; continue; }
      if (PRON[w] && (PRON[w][1] === 'P' || PRON[w][1] === 'OP')) { np.poss = PRON[w][0]; i++; continue; }
      if (NUMS[w]) { np.num = w; if (NUMS[w] > 1) np.number = 'PL'; i++; continue; }
      if (w === 'many' || w === 'all') { np.adj = w; np.number = 'PL'; i++; continue; }
      const degree = readDegree(i);
      if (degree && ws[degree.end] && !AUX.has(ws[degree.end]) && !PREP[ws[degree.end]] && !isVerbish(ws[degree.end])) {
        np.adj = lookupOrCoin(degree.lemma, 'adj');
        np.degree = degree.degree;
        i = degree.end;
        continue;
      }
      if (w === 'very') { np.very = true; i++; continue; }
      if (!known(lang, SYN[w] || w) && !lex['u:' + w] && ws[i + 1] && (guessPos(w) === 'adj' || isNounish(ws[i + 1])) && guessPos(w) !== 'n' && !/s$/.test(w) && !AUX.has(ws[i + 1]) && !PREP[ws[i + 1]] && !isVerbish(ws[i + 1])) { np.adj = lookupOrCoin(w, 'adj'); i++; continue; }
      if (isAdj(w) && ws[i + 1] && !['.', 'and'].includes(ws[i + 1]) && (isNounish(ws[i + 1]) || isAdj(ws[i + 1]) || (!isVerbish(ws[i + 1]) && !PREP[ws[i + 1]] && !AUX.has(ws[i + 1]) && ws[i + 1] !== 'not'))) { np.adj = lookupOrCoin(w, 'adj'); i++; continue; }
      break;
    }
    w = peek();
    if (!w || AUX.has(w) || PREP[w] || CONJ.has(w) || w === 'not' || (ADV.has(w) && !isNounish(w))) return np.dem && !np.n ? { ...np, n: 'thing', demOnly: true } : (Object.keys(np).length ? np : null);
    const { lemma, pl } = lemmaNoun(w);
    const nx = ws[i + 1];
    if (nx && !AUX.has(nx) && !PREP[nx] && !CONJ.has(nx) && !REL.has(nx) && !DET.has(nx) && !PRON[nx] && nx !== "'s" && nx !== 'not' && !ADV.has(nx)
        && !pl && !noCompound && !isVerbish(nx)
        && (isNounish(nx) || (!known(lang, SYN[nx] || nx) && !lex['u:' + nx] && ['n', null].includes(guessPos(nx)) && !/s$/.test(nx)
             && (!ws[i + 2] || PREP[ws[i + 2]] || CONJ.has(ws[i + 2]) || ADV.has(ws[i + 2]) || AUX.has(ws[i + 2]))))) {
      // compound "enemy land", "stone house": built as "land of (the) enemy"
      const modifier = { n: lookupOrCoin(lemma, 'n') };
      i++;
      const head = parseNP();
      if (head) return { ...np, ...head, possN: head.possN || modifier };
    }
    np.n = lookupOrCoin(lemma, 'n');
    if (pl && !np.number) np.number = 'PL';
    i++;
    // possessive 's: "the king 's horse"
    if (peek() === "'s" && ws[i + 1] && !AUX.has(ws[i + 1]) && ws[i + 1] !== 'not') { i++; const owned = parseNP(); if (owned) return { ...owned, possN: np }; }
    // "of" possessor
    if (peek() === 'of' && npStart(ws[i + 1])) { i++; const owner = parseNP(); if (owner) np.possN = owner; }
    // relative clause "the woman who sings (the song)": no relative construction yet, so it is noted and skipped
    if (REL.has(peek()) && ws[i + 1] && (verbForm(lang, ws[i + 1]) || AUX.has(ws[i + 1]))) {
      const start = i; i++;
      while (peek() && (AUX.has(peek()) || peek() === 'not')) i++;
      if (verbForm(lang, peek())) i++;
      if (peek() && npStart(peek()) && !AUX.has(peek())) { const save = i; const o = parseNP(); if (!o) i = save; }
      dropped.push(ws.slice(start, i).join(' '));
    }
    // coordination "the bear and the wolf"
    if ((peek() === 'and' || peek() === 'or') && npStart(ws[i + 1])) { const cw = ws[i]; i++; const second = parseNP(); if (second) { np.and = second; np.andWord = cw; } }
    return np;
  }

  // commands: "Give me water", "Come here", "Do not fear the dark", "Don't go"
  {
    let j = 0, neg = false;
    if (ws[0] === 'do' && ws[1] === 'not') { j = 2; neg = true; }
    const w = ws[j];
    const lv = w ? lemmaVerb(w) : null;
    const base = lv && lv.lemma === w;
    const next = ws[j + 1];
    const unknownVerb = w && !known(lang, SYN[w] || w) && !lex['u:' + w] && !guessPos(w) && (PRON[next]?.[1] === 'O' || PRON[next]?.[1] === 'X' || DET.has(next) || (neg && !next));
    const looksVerb = w && base && !DET.has(w) && !PRON[w] && !WH.has(w) && !AUX.has(w) && (isVerbish(w) || unknownVerb) && (!isNounish(w) || !next || PRON[next] || DET.has(next) || ADV.has(next) || PREP[next] || NUMS[next]);
    if ((forceVerb && j === 0) || (!isQ && looksVerb && (neg || j === 0))) {
      i = j;
      spec.imperative = true;
      if (neg) spec.neg = true;
    }
  }
  // "Who is the king?" / "What is your name?": the question word is the predicate
  if (!spec.imperative && (peek() === 'who' || peek() === 'what') && ['is', 'are', 'was', 'were', "'s"].includes(ws[i + 1]) && npStart(ws[i + 2])) {
    const wq = ws[i]; const tv = ws[i + 1]; i += 2;
    const S = parseNP();
    return finish({ ...spec, V: 'be', S, predN: { wh: wq }, tense: ['was', 'were'].includes(tv) ? 'PST' : undefined, q: isQ ? 'wh' : undefined });
  }
  // "What do you want?": a fronted object question word followed by do-support or another auxiliary
  let frontWh = null;
  if (!spec.imperative && (peek() === 'what' || peek() === 'who') && AUX.has(ws[i + 1])) { frontWh = ws[i]; i++; }
  if (peek() === 'there' && ['is', 'are', 'was', 'were'].includes(ws[i + 1])) { spec.existential = true; spec.V = 'be'; i += 2; if (ws[i - 1] === 'was' || ws[i - 1] === 'were') spec.tense = 'PST'; }
  // leading adverbs / wh
  let wh = null;
  while (peek() && (ADV.has(peek()) || WH.has(peek()) && !['who', 'what'].includes(peek()))) { const w = ws[i++]; if (WH.has(w)) wh = w; else if (w !== 'very') spec.adv = w; }
  if (peek() === 'what' || peek() === 'who') { /* subject or object wh; handled below */ }
  // auxiliaries before the subject: questions
  let aux = [];
  while (peek() && AUX.has(peek()) && i < ws.length - 1) aux.push(ws[i++]);

  if (peek() === 'not') { spec.neg = true; i++; }
  // subject
  let S = null;
  if (inheritS && !spec.imperative && verbForm(lang, peek()) && !npStart(peek())) { S = inheritS; spec.dropSubject = true; }
  else if (spec.imperative) S = { pron: '2SG' };
  else if (!spec.existential) S = parseNP();
  if (S?.wh) { spec.whS = S.wh; S = { wh: S.wh }; }
  // a prepositional phrase right after the subject, before the verb: kept as a clause-level phrase
  const subjPP = [];
  while (S && PREP[peek()] && peek() !== 'of' && hasVerbLike(lang, ws.slice(i + 1))) {
    const p = ws[i++]; const np = parseNP();
    if (!np) break;
    let role = PREP[p];
    if (role === 'with') { const e = np.n ? lex[np.n] : null; role = np.pron || e?.tags?.includes('h') || e?.tags?.includes('a') ? 'companion' : 'instrument'; }
    subjPP.push({ ...np, role, kase: ROLE_CASE[role] });
  }
  // verb group
  while (peek() && (AUX.has(peek()) || peek() === 'not' || ADV.has(peek()) && !isNounish(peek()))) {
    const w = ws[i++];
    if (w === 'not') spec.neg = true;
    else if (ADV.has(w)) { if (w === 'never') { spec.adv = 'never'; } else if (w !== 'very') spec.adv = spec.adv || w; }
    else aux.push(w);
  }
  let tense = null, aspect = null;
  if (aux.some(a => ['will', 'shall', 'would'].includes(a))) tense = 'FUT';
  if (aux.some(a => ['did', 'was', 'were', 'had'].includes(a))) tense = 'PST';
  if (peek() === 'going' && ws[i + 1] === 'to' && verbForm(lang, ws[i + 2]) && !npStart(ws[i + 2])) { i += 2; tense = 'FUT'; }
  // main verb
  let V = null;
  const w0 = peek();
  if (w0 && !spec.existential) {
    const lv = lemmaVerb(w0);
    const lemma = SYN[lv.lemma] || lv.lemma;
    const k = known(lang, lemma, 'v');
    const copulaAux = aux.find(a => ['is', 'are', 'am', 'was', 'were', "'s", "'re", "'m"].includes(a));
    const n1 = ws[i + 1];
    const zeroVerb = S && !aux.length && k?.pos !== 'v' && !lex['u:' + lemma] && isNounish(w0) && !DET.has(w0) && (!n1 || PREP[n1] || ADV.has(n1) || DET.has(n1) || PRON[n1]);
    const unknownPred = copulaAux && !k && !lex['u:' + lemma] && !isNounish(w0) && !PREP[w0] && !lv.prog && !lv.pp && !(lv.tense === 'PST');
    if (copulaAux && readDegree(i) || unknownPred) { /* "is angry": an unknown word after a copula is a predicate adjective, handled below */ }
    else if ((k && k.pos === 'v') || lex['u:' + lemma]?.pos === 'v' || zeroVerb || (!npStart(w0) && !PREP[w0] && !isAdj(w0) && !(copulaAux && lemmaAdj(w0).degree))) {
      V = lookupOrCoin(lemma, 'v'); i++;
      if (lv.tense === 'PST' && !tense) tense = 'PST';
      if (lv.pp && aux.some(a => ['have', 'has', 'had'].includes(a))) { aspect = 'PFV'; tense = tense || 'PST'; }
      if (lv.prog && copulaAux) tense = tense || 'PRS';
      if (copulaAux && (lv.pp || lv.tense === 'PST') && !lv.prog) {
        if (['was', 'were'].includes(copulaAux)) tense = 'PST';
        if (peek() === 'by' && npStart(ws[i + 1])) { i++; const agent = parseNP(); if (agent) { spec.O = S; S = agent; spec.passive = true; } }
        else { spec.O = S; S = { pron: '3PL' }; spec.passive = true; }
      }
    } else if (copulaAux || unknownPred || aux.some(a => ['be', 'been'].includes(a))) V = 'be';
  }
  if (!V && aux.some(a => ['have', 'has', 'had'].includes(a)) && !spec.existential) V = 'have';
  if (!V && aux.some(a => ['is', 'are', 'am', 'was', 'were', "'s", "'re", "'m"].includes(a))) V = 'be';
  if (spec.existential) V = 'be';
  if (!V) V = 'be';
  spec.V = V;
  // complements
  if (V === 'be') {
    if (peek() === 'very') { spec.very = true; i++; }
    const w = peek();
    const degree = readDegree(i + (w === 'the' ? 1 : 0));
    const next = degree && ws[degree.end];
    if (degree && (!next || next === 'than' || PREP[next] || ADV.has(next))) {
      spec.pred = lookupOrCoin(degree.lemma, 'adj');
      spec.degree = degree.degree;
      i = degree.end;
      if (peek() === 'than') {
        i++;
        spec.standard = parseNP();
      }
    }
    else if (w && isAdj(w) && !isNounish(ws[i + 1])) { spec.pred = lookupOrCoin(w, 'adj'); i++; }
    else if (w && !known(lang, SYN[w] || w) && !lex['u:' + w] && !PREP[w] && !DET.has(w) && !PRON[w] && !NUMS[w] && !isVerbish(w) && (!ws[i + 1] || PREP[ws[i + 1]] || ADV.has(ws[i + 1]))) { spec.pred = lookupOrCoin(w, 'adj'); i++; }
    else if (w && npStart(w) && !PREP[w]) { const np = parseNP(); if (np) { if (spec.existential) S = np; else spec.predN = np; } }
  } else {
    if (['hear', 'see', 'wait', 'seek'].includes(V) && ['to', 'at', 'for'].includes(peek()) && npStart(ws[i + 1])) i++;
    // an unknown word right after the verb is its object: "play chess", "hates broccoli"
    const unknownObj = (w) => w && !PREP[w] && !AUX.has(w) && !CONJ.has(w) && !SUBORD.has(w) && !ADV.has(w) && !WH.has(w) && w !== 'not' && w !== 'to'
      && !known(lang, SYN[w] || w) && !lex['u:' + w] && ['n', null].includes(guessPos(w));
    if (peek() && (npStart(peek()) || unknownObj(peek())) && !PREP[peek()]) {
      noCompound = ['give', 'tell', 'say', 'teach', 'buy', 'show', 'send', 'make', 'bring'].includes(V) || lex['u:' + V]?.gloss === 'bring';
      const O = parseNP();
      noCompound = false;
      if (O?.wh) spec.whO = O.wh;
      else if (O) {
        spec.O = O;
        // double object: "give the child bread"
        if (peek() && npStart(peek()) && !PREP[peek()] && (['give', 'tell', 'say', 'teach', 'buy', 'show', 'send', 'make'].includes(V) || O.pron || (O.n && lex[O.n]?.tags?.includes('h')))) { const O2 = parseNP(); if (O2) { spec.obl.push({ ...O, role: 'recipient', kase: 'DAT' }); spec.O = O2; } }
      }
    }
  }
  // "walked home", "go home": home after a motion verb is a destination, not an object
  if (spec.O && spec.O.n === 'house' && !spec.O.def && !spec.O.poss && !spec.O.indef && ['go', 'come', 'walk', 'run', 'return', 'fly', 'swim'].includes(V) && ws.includes('home')) { spec.obl.push({ ...spec.O, role: 'goal', kase: 'ALL' }); delete spec.O; }
  let chained = null;
  const infinitiveNext = (w) => w && (isVerbish(w) || (!DET.has(w) && !PRON[w] && !NUMS[w] && !isNounish(w) && !isAdj(w) && !PREP[w]));
  if (V !== 'be' && !spec.O && peek() === 'to' && infinitiveNext(ws[i + 1])) {
    i++;
    const rest = ws.slice(i);
    i = ws.length;
    const sub = parseClause(lang, rest, false, coined, dropped, null, true);
    chained = [].concat(sub)[0];
    if (chained) { chained.S = S || { pron: '2SG' }; chained.dropSubject = true; delete chained.q; delete chained.imperative; }
  }
  if (frontWh && !spec.O && V !== 'be') spec.whO = frontWh;
  if (spec.whO) spec.O = { wh: spec.whO };
  // prepositional phrases and trailing adverbs
  while (i < ws.length) {
    const w = ws[i];
    if (PREP[w]) {
      i++;
      if (w === 'out' && ws[i] === 'of') i++;
      const np = parseNP();
      if (!np) continue;
      let role = PREP[w];
      if (role === 'goal' && ['give', 'tell', 'say', 'send', 'show'].includes(V)) role = 'recipient';
      if (role === 'recipient' && np.n && lex[np.n]?.tags?.includes('t')) role = 'location'; // "for many years": time, not a recipient
      if (role === 'with') { const e = np.n ? lex[np.n] : null; role = np.pron || e?.tags?.includes('h') || e?.tags?.includes('a') ? 'companion' : 'instrument'; }
      if (role === 'possessor') { if (spec.O) spec.O.possN = np; else if (S) S.possN = np; continue; }
      if (spec.existential && role === 'location') spec.beLoc = true;
      if (V === 'be' && role === 'location' && !spec.pred) spec.beLoc = true;
      spec.obl.push({ ...np, role, kase: ROLE_CASE[role] });
      continue;
    }
    if (ADV.has(w)) { i++; if (w !== 'very') spec.adv = spec.adv || w; continue; }
    if (w === 'not') { spec.neg = true; i++; continue; }
    dropped.push(w); i++; // unparsed word: noted and skipped
  }
  if (wh && ['where', 'when', 'why', 'how'].includes(wh)) spec.adv = wh;
  if (subjPP.length) spec.obl = [...subjPP, ...(spec.obl || [])];
  spec.S = S || (spec.existential ? null : { pron: '3SG' });
  if (tense) spec.tense = tense;
  if (aspect) spec.aspect = aspect;
  if (isQ) spec.q = wh || spec.whS || spec.whO ? 'wh' : 'polar';
  const main = finish(spec);
  return chained ? [main, chained] : main;

  function finish(sp) {
    if (sp.S?.wh) sp.S = { wh: sp.S.wh };
    if (sp.adv === 'never' && !lang.q?.negConcord) sp.neg = false;
    if (sp.S?.pron === '2SG' && lang.translatePolite) { sp.S = { ...sp.S, pron: '2SG.POL' }; sp.polite = true; }
    if (lang.translatePolite) sp.polite = true;
    if (sp.obl && !sp.obl.length) delete sp.obl;
    if (sp.S?.pron) sp.S.keepPronoun = false;
    if (!sp.tense) delete sp.tense;
    if (!sp.q) delete sp.q;
    return sp;
  }
}

export function userWordList(lang) { return (lang.userWords || []).map(e => ({ en: e.gloss, pos: e.pos })); }
