// Accuracy tests for the English parser in src/translate.js.
// Each case states the parse a correct translation needs; the script reports which fields come out wrong.
// Usage: node tools/translate-tests.mjs [--verbose]
import { generate } from '../src/language.js';
import { translate } from '../src/translate.js';

// expected: S / O = noun gloss or pron id; V = verb gloss; tense PST|FUT|PRS; neg; q; obl = ["role:noun"]; pred = adj
const CASES = [
  ['The man sees the dog.', { S: 'man', V: 'see', O: 'dog' }],
  ['The dogs see a man.', { S: 'dog', Snum: 'PL', V: 'see', O: 'man' }],
  ['I love you.', { S: '1SG', V: 'love.v', O: '2SG' }],
  ['She loves him.', { S: '3SG', V: 'love.v', O: '3SG' }],
  ['We saw the king yesterday.', { S: '1PL', V: 'see', O: 'king', tense: 'PST', adv: 'yesterday' }],
  ['They will build a house.', { S: '3PL', V: 'build', O: 'house', tense: 'FUT' }],
  ['The children are sleeping.', { S: 'child', Snum: 'PL', V: 'sleep' }],
  ['The woman did not eat the bread.', { S: 'woman', V: 'eat', O: 'bread', tense: 'PST', neg: true }],
  ["The king doesn't know the truth.", { S: 'king', V: 'know', O: 'truth', neg: true }],
  ['Does the bird fly?', { S: 'bird', V: 'fly', q: 'polar' }],
  ['Where is the river?', { S: 'river', V: 'be', q: 'wh' }],
  ['Who killed the wolf?', { S: 'who', V: 'kill', O: 'wolf', tense: 'PST', q: 'wh' }],
  ['What do you want?', { S: '2SG', V: 'want', O: 'what', q: 'wh' }],
  ['The mother gave bread to the child.', { S: 'mother', V: 'give', O: 'bread', tense: 'PST', obl: ['recipient:child'] }],
  ['The mother gave the child bread.', { S: 'mother', V: 'give', O: 'bread', tense: 'PST', obl: ['recipient:child'] }],
  ['The bird flies from the tree.', { S: 'bird', V: 'fly', obl: ['source:tree'] }],
  ['The children sleep in the house.', { S: 'child', Snum: 'PL', V: 'sleep', obl: ['location:house'] }],
  ['The hunter killed the wolf with a knife.', { S: 'hunter', V: 'kill', O: 'wolf', tense: 'PST', obl: ['instrument:knife'] }],
  ['The woman walks with her friend.', { S: 'woman', V: 'walk', obl: ['companion:friend'] }],
  ['The people go to the city.', { S: 'people', V: 'go', obl: ['goal:city'] }],
  ['The old man is wise.', { S: 'man', Sadj: 'old', V: 'be', pred: 'wise' }],
  ['This water is cold.', { S: 'water', V: 'be', pred: 'cold' }],
  ['The sun is very bright.', { S: 'sun', V: 'be', pred: 'bright' }],
  ['My mother drinks water.', { S: 'mother', Sposs: '1SG', V: 'drink', O: 'water' }],
  ["The king's horse drinks water.", { S: 'horse', Sowner: 'king', V: 'drink', O: 'water' }],
  ['The horse of the king is white.', { S: 'horse', Sowner: 'king', V: 'be', pred: 'white' }],
  ['Three wolves came from the dark forest.', { S: 'wolf', Snum: 'PL', V: 'come', tense: 'PST', obl: ['source:forest'] }],
  ['There is a stone in the river.', { S: 'stone', V: 'be', obl: ['location:river'] }],
  ['The king is in the city.', { S: 'king', V: 'be', obl: ['location:city'] }],
  ['I have a red book.', { S: '1SG', V: 'have', O: 'book' }],
  ['We have eaten the meat.', { S: '1PL', V: 'eat', O: 'meat', tense: 'PST' }],
  ['The warrior fought bravely.', { S: 'warrior', V: 'fight', tense: 'PST' }],
  ['The rain fell on the field.', { S: 'rain', V: 'fall', tense: 'PST', obl: ['location:field'] }],
  ['The fire burns.', { S: 'fire', V: 'burn' }],
  ['You never listen.', { S: '2SG', V: 'hear', adv: 'never' }],
  ['The singer sang a beautiful song.', { S: 'singer', V: 'sing', O: 'song', tense: 'PST' }],
  ['The teacher teaches the children.', { S: 'teacher', V: 'teach', O: 'child' }],
  ['Tomorrow we will walk to the sea.', { S: '1PL', V: 'walk', tense: 'FUT', adv: 'tomorrow', obl: ['goal:sea'] }],
  ['The guest drank some wine.', { S: 'guest', V: 'drink', O: 'wine', tense: 'PST' }],
  ['The small cat sits on the roof.', { S: 'cat', Sadj: 'small', V: 'sit', obl: ['location:roof'] }],
  ['He gave me a gift.', { S: '3SG', V: 'give', O: 'gift', tense: 'PST', obl: ['recipient:1SG'] }],
  ['She is a teacher.', { S: '3SG', V: 'be', predN: 'teacher' }],
  ['The snow becomes water.', { S: 'snow', V: 'become', O: 'water' }],
  ['I am going to write a story.', { S: '1SG', V: 'write', O: 'story', tense: 'FUT' }],
  ['The boat is on the lake.', { S: 'boat', V: 'be', obl: ['location:lake'] }],
  ['The dog runs into the forest.', { S: 'dog', V: 'run', obl: ['goal:forest'] }],
  ['My friends live near the mountain.', { S: 'friend', Snum: 'PL', Sposs: '1SG', V: 'live', obl: ['location:mountain'] }],
  ['The god of the sea is angry.', { S: 'god', Sowner: 'sea', V: 'be' }],
  ['The children laughed and the mother wept.', [{ S: 'child', Snum: 'PL', V: 'laugh', tense: 'PST' }, { S: 'mother', V: 'weep', tense: 'PST' }]],
  ['I think and I dream.', [{ S: '1SG', V: 'think' }, { S: '1SG', V: 'dream' }]],
  ['The light is shining.', { S: 'light', V: 'shine' }],
  ['A wolf is hunting the deer.', { S: 'wolf', V: 'hunt', O: 'deer' }],
  ['The leaves fall in winter.', { S: 'leaf', Snum: 'PL', V: 'fall', obl: ['location:winter'] }],
  ['Nobody came.', { S: 'person', V: 'come', tense: 'PST', neg: true }],
  ['I saw nothing.', { S: '1SG', V: 'see', O: 'thing', tense: 'PST', neg: true }],
  ['Can you swim?', { S: '2SG', V: 'swim', q: 'polar' }],
  ['The woman reads a book every day.', { S: 'woman', V: 'read', O: 'book' }],
  ['The bear and the wolf are in the forest.', { S: 'bear', V: 'be', obl: ['location:forest'] }],
  ['The warrior with the sword is strong.', { S: 'warrior', V: 'be', pred: 'strong', obl: ['instrument:sword'] }],
  ['The stars shine at night.', { S: 'star', Snum: 'PL', V: 'shine', obl: ['location:night'] }],
  // ---- harder, everyday input ----
  ['Where do you live?', { S: '2SG', V: 'live', q: 'wh', adv: 'where' }],
  ['How are you?', { S: '2SG', V: 'be', q: 'wh', adv: 'how' }],
  ['I am happy.', { S: '1SG', V: 'be', pred: 'happy' }],
  ['Give me water!', { S: '2SG', V: 'give', O: 'water', obl: ['recipient:1SG'] }],
  ['Come here!', { S: '2SG', V: 'come', adv: 'here' }],
  ['Do not fear the dark.', { S: '2SG', V: 'fear.v', neg: true }],
  ['I want to see the sea.', [{ S: '1SG', V: 'want' }, { V: 'see', O: 'sea' }]],
  ['The old man walked slowly to the river.', { S: 'man', Sadj: 'old', V: 'walk', tense: 'PST', obl: ['goal:river'] }],
  ['She quickly opened the door.', { S: '3SG', V: 'open', O: 'door', tense: 'PST' }],
  ['The bear and the wolf are in the forest.', { S: 'bear', Sand: 'wolf', V: 'be', obl: ['location:forest'] }],
  ['I eat bread and meat.', { S: '1SG', V: 'eat', O: 'bread', Oand: 'meat' }],
  ['The woman who sings is my sister.', { S: 'woman', V: 'be', predN: 'sister' }],
  ['When the sun rises, the birds sing.', [{ S: 'sun', V: 'rise' }, { S: 'bird', Snum: 'PL', V: 'sing' }]],
  ['The child wept because the dog died.', [{ S: 'child', V: 'weep', tense: 'PST' }, { S: 'dog', V: 'die', tense: 'PST' }]],
  ['If you go, I will go.', [{ S: '2SG', V: 'go' }, { S: '1SG', V: 'go', tense: 'FUT' }]],
  ['The book was written by the king.', { S: 'king', V: 'write', O: 'book', tense: 'PST' }],
  ['The house is bigger than the tree.', { S: 'house', V: 'be', pred: 'big' }],
  ['There are many stars in the sky.', { S: 'star', Snum: 'PL', V: 'be', obl: ['location:sky'] }],
  ['It is raining.', { S: '3SG', V: 'rain' }],
  ['The friends of my father are here.', { S: 'friend', Snum: 'PL', Sowner: 'father', V: 'be', adv: 'here' }],
  ['We must leave now.', { S: '1PL', V: 'leave', adv: 'now' }],
  ['The queen gave a gold cup to her son.', { S: 'queen', V: 'give', O: 'cup', tense: 'PST', obl: ['recipient:son'] }],
  ['Why is the sky blue?', { S: 'sky', V: 'be', pred: 'blue', q: 'wh', adv: 'why' }],
  ['My brother has two horses.', { S: 'brother', Sposs: '1SG', V: 'have', O: 'horse', Onum: 'PL' }],
  ['The warriors were fighting in the field.', { S: 'warrior', Snum: 'PL', V: 'fight', tense: 'PST', obl: ['location:field'] }],
  ['I can hear the river.', { S: '1SG', V: 'hear', O: 'river' }],
  ['The dog did not see the cat.', { S: 'dog', V: 'see', O: 'cat', tense: 'PST', neg: true }],
  ['Who is the king of this land?', { S: 'king', V: 'be', q: 'wh' }],
  ['The girl ran to her mother.', { S: 'child', V: 'run', tense: 'PST', obl: ['goal:mother'] }],
  ['Bring me the cup!', { S: '2SG', V: 'bring', O: 'cup', obl: ['recipient:1SG'] }],
  ['They sang and danced all night.', [{ S: '3PL', V: 'sing', tense: 'PST' }, { S: '3PL', V: 'dance', tense: 'PST' }]],
  ['The flowers grow when the rain falls.', [{ S: 'flower', Snum: 'PL', V: 'grow' }, { S: 'rain', V: 'fall' }]],
  ['He is taller than his father.', { S: '3SG', V: 'be', pred: 'tall' }],
  ['We are going to the market tomorrow.', { S: '1PL', V: 'go', adv: 'tomorrow', obl: ['goal:market'] }],
  ['The king wants to conquer the enemy land.', [{ S: 'king', V: 'want' }, { V: 'conquer', O: 'land', Oowner: 'enemy' }]],
  ['The stone house is old.', { S: 'house', Sowner: 'stone', V: 'be', pred: 'old' }],
  ['I like to play chess.', [{ S: '1SG', V: 'like' }, { V: 'play', O: 'chess' }]],
  ['She plays the guitar.', { S: '3SG', V: 'play', O: 'guitar' }],
  ['We eat broccoli.', { S: '1PL', V: 'eat', O: 'broccoli' }],
  ['Fish swim in the sea.', { S: 'fish', V: 'swim', obl: ['location:sea'] }],
];

const verbose = process.argv.includes('--verbose');
const L = generate({ family: 'original' }, 'tests');
const npKey = (np) => !np ? null : np.pron || np.wh || np.n || null;
const field = {};
let fails = 0, checks = 0;
const failed = [];
for (const [en, expect] of CASES) {
  const res = translate(L, en);
  const specs = res.sentences.flatMap(s => s.specs);
  const exps = Array.isArray(expect) ? expect : [expect];
  const errs = [];
  exps.forEach((ex, ci) => {
    const sp = specs[ci] || {};
    const got = {
      S: npKey(sp.S), Snum: sp.S?.number || 'SG', Sadj: sp.S?.adj, Sposs: sp.S?.poss, Sowner: npKey(sp.S?.possN), Oowner: npKey(sp.O?.possN),
      V: sp.V, O: npKey(sp.O), Onum: sp.O?.number || 'SG', Sand: npKey(sp.S?.and), Oand: npKey(sp.O?.and), tense: sp.tense || 'PRS', neg: !!sp.neg, q: sp.q || null, adv: sp.adv,
      pred: sp.pred, predN: npKey(sp.predN),
      obl: (sp.obl || []).map(o => `${o.role}:${npKey(o)}`),
    };
    for (const [k, v] of Object.entries(ex)) {
      checks++; field[k] = field[k] || [0, 0]; field[k][1]++;
      let ok;
      if (k === 'obl') ok = v.every(x => got.obl.includes(x));
      else if (k === 'tense' || k === 'neg' || k === 'q') ok = got[k] === v;
      else ok = got[k] === v;
      if (!ok) { errs.push(`${k}: want ${JSON.stringify(v)} got ${JSON.stringify(got[k])}`); field[k][0]++; fails++; }
    }
    // things that must NOT appear: an unexpected tense/neg/question
    if (!('tense' in ex) && got.tense !== 'PRS') { errs.push(`tense: want PRS got ${got.tense}`); fails++; }
    if (!('neg' in ex) && got.neg) { errs.push('neg: unexpected'); fails++; }
  });
  if (specs.length < exps.length) errs.push(`clauses: want ${exps.length} got ${specs.length}`);
  if (res.coined.length) errs.push(`coined: ${res.coined.map(e => e.gloss).join(', ')}`);
  if (errs.length) failed.push([en, errs]);
}
const okSent = CASES.length - failed.filter(([, e]) => e.some(x => !x.startsWith('coined'))).length;
console.log(`Sentences fully correct: ${okSent} of ${CASES.length}`);
console.log(`Field checks wrong: ${fails} of ${checks}`);
console.log('Wrong per field: ' + Object.entries(field).filter(([, v]) => v[0]).map(([k, v]) => `${k} ${v[0]}/${v[1]}`).join(', '));
for (const [en, errs] of failed) if (verbose || errs.some(x => !x.startsWith('coined'))) console.log(`- ${en}\n    ${errs.join('\n    ')}`);
