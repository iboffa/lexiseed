// Meaning list (Swadesh-like core + words needed by the grammar and the sample texts).
// Format per entry: [gloss, pos, basicness 1..3 (1 = most basic -> shorter), tags, derivation?]
// tags: h = human, a = animal, m = male, f = female, l = place/location, t = time, mass = mass noun
// derivation: ['AGT'|'PLACE'|'NMLZ'|'ABST'|'COMP'|'CAUS', base1, base2?]  The seed decides whether a language
// actually derives the word or coins an independent root. A final true marks a productive compound.

// Keep both constituents identifiable wherever the language places its heads.
const compound = (gloss, modifier, head, tags = '') => [gloss, 'n', 3, tags, ['COMP', modifier, head], true];

export const MEANINGS = [
  // people
  ['person', 'n', 1, 'h'], ['man', 'n', 1, 'h m'], ['woman', 'n', 1, 'h f'], ['child', 'n', 1, 'h'],
  ['mother', 'n', 1, 'h f'], ['father', 'n', 1, 'h m'], ['brother', 'n', 2, 'h m'], ['sister', 'n', 2, 'h f'],
  ['friend', 'n', 2, 'h'], ['enemy', 'n', 3, 'h'], ['king', 'n', 1, 'h m'], ['queen', 'n', 2, 'h f'],
  ['god', 'n', 2, 'h'], ['teacher', 'n', 3, 'h', ['AGT', 'teach']], ['singer', 'n', 3, 'h', ['AGT', 'sing']],
  ['hunter', 'n', 3, 'h', ['AGT', 'hunt']], ['writer', 'n', 3, 'h', ['AGT', 'write']], ['warrior', 'n', 3, 'h', ['AGT', 'fight']],
  ['guest', 'n', 3, 'h'], ['daughter', 'n', 2, 'h f'], ['son', 'n', 2, 'h m'], ['roof', 'n', 3, ''], ['people', 'n', 2, 'h mass'],
  // body
  ['head', 'n', 1, ''], ['eye', 'n', 1, ''], ['ear', 'n', 1, ''], ['nose', 'n', 1, ''], ['mouth', 'n', 1, ''],
  ['tooth', 'n', 1, ''], ['tongue', 'n', 1, ''], ['hand', 'n', 1, ''], ['foot', 'n', 1, ''], ['heart', 'n', 1, ''],
  ['blood', 'n', 1, 'mass'], ['bone', 'n', 1, ''], ['skin', 'n', 2, ''], ['hair', 'n', 2, ''], ['tear', 'n', 2, '', ['COMP', 'eye', 'water']],
  // nature
  ['sun', 'n', 1, ''], ['moon', 'n', 1, ''], ['star', 'n', 1, ''], ['sky', 'n', 1, 'l'], ['water', 'n', 1, 'mass'],
  ['fire', 'n', 1, 'mass'], ['earth', 'n', 1, 'mass l'], ['stone', 'n', 1, ''], ['river', 'n', 1, 'l'], ['sea', 'n', 1, 'l'],
  ['mountain', 'n', 1, 'l'], ['tree', 'n', 1, ''], ['forest', 'n', 2, 'l'], ['wind', 'n', 1, ''], ['rain', 'n', 1, 'mass'],
  ['snow', 'n', 2, 'mass'], ['cloud', 'n', 2, ''], ['leaf', 'n', 2, ''], ['flower', 'n', 2, ''], ['grass', 'n', 2, 'mass'],
  ['island', 'n', 3, 'l', ['COMP', 'sea', 'earth']], ['lake', 'n', 2, 'l'], ['field', 'n', 2, 'l'], ['salt', 'n', 2, 'mass'],
  // time
  ['day', 'n', 1, 't'], ['night', 'n', 1, 't'], ['year', 'n', 1, 't'], ['morning', 'n', 2, 't'], ['evening', 'n', 2, 't'],
  ['winter', 'n', 2, 't'], ['summer', 'n', 2, 't'], ['time', 'n', 2, 't'],
  // animals
  ['dog', 'n', 1, 'a'], ['cat', 'n', 2, 'a'], ['horse', 'n', 1, 'a'], ['bird', 'n', 1, 'a'], ['fish', 'n', 1, 'a'],
  ['snake', 'n', 2, 'a'], ['wolf', 'n', 2, 'a'], ['cow', 'n', 2, 'a f'], ['bear', 'n', 2, 'a'], ['egg', 'n', 2, ''],
  // things and places
  ['house', 'n', 1, 'l'], ['door', 'n', 2, ''], ['road', 'n', 1, 'l'], ['city', 'n', 2, 'l'], ['village', 'n', 2, 'l'],
  ['book', 'n', 2, '', ['NMLZ', 'write']], ['knife', 'n', 2, ''], ['bread', 'n', 2, 'mass'], ['meat', 'n', 2, 'mass'],
  ['wine', 'n', 2, 'mass'], ['milk', 'n', 2, 'mass'], ['boat', 'n', 2, ''], ['sword', 'n', 2, ''], ['gold', 'n', 2, 'mass'],
  ['iron', 'n', 3, 'mass'], ['cup', 'n', 3, ''], ['gift', 'n', 3, '', ['NMLZ', 'give']], ['school', 'n', 3, 'l', ['PLACE', 'learn']],
  ['library', 'n', 3, 'l', ['COMP', 'book', 'house']], ['temple', 'n', 3, 'l', ['COMP', 'god', 'house']],
  ['kingdom', 'n', 3, 'l', ['PLACE', 'king']], ['market', 'n', 3, 'l', ['PLACE', 'buy']], ['grave', 'n', 3, 'l', ['PLACE', 'die']],
  // abstract
  ['name', 'n', 1, ''], ['word', 'n', 1, '', ['NMLZ', 'speak']], ['song', 'n', 2, '', ['NMLZ', 'sing']], ['story', 'n', 2, '', ['NMLZ', 'tell']],
  ['war', 'n', 2, '', ['NMLZ', 'fight']], ['peace', 'n', 2, ''], ['love', 'n', 2, '', ['NMLZ', 'love.v']], ['life', 'n', 2, '', ['NMLZ', 'live']],
  ['death', 'n', 2, '', ['NMLZ', 'die']], ['fear', 'n', 2, '', ['NMLZ', 'fear.v']], ['dream', 'n', 2, ''], ['truth', 'n', 3, '', ['ABST', 'true']],
  ['wisdom', 'n', 3, '', ['ABST', 'wise']], ['strength', 'n', 3, '', ['ABST', 'strong']], ['beauty', 'n', 3, '', ['ABST', 'beautiful']],
  ['darkness', 'n', 3, '', ['ABST', 'dark']], ['freedom', 'n', 3, '', ['ABST', 'free']], ['spirit', 'n', 2, ''], ['law', 'n', 3, ''],
  ['language', 'n', 2, '', ['NMLZ', 'speak']], ['thing', 'n', 1, ''], ['way', 'n', 2, ''],
  // verbs
  ['be', 'v', 1, ''], ['have', 'v', 1, ''], ['go', 'v', 1, ''], ['come', 'v', 1, ''], ['see', 'v', 1, ''], ['hear', 'v', 1, ''],
  ['speak', 'v', 1, ''], ['say', 'v', 1, ''], ['tell', 'v', 2, ''], ['know', 'v', 1, ''], ['think', 'v', 2, ''], ['eat', 'v', 1, ''],
  ['drink', 'v', 1, ''], ['sleep', 'v', 1, ''], ['die', 'v', 1, ''], ['kill', 'v', 2, '', ['CAUS', 'die']], ['live', 'v', 1, ''],
  ['give', 'v', 1, ''], ['take', 'v', 1, ''], ['make', 'v', 1, ''], ['love.v', 'v', 2, ''], ['want', 'v', 2, ''], ['walk', 'v', 1, ''],
  ['run', 'v', 2, ''], ['sit', 'v', 1, ''], ['stand', 'v', 1, ''], ['fly', 'v', 2, ''], ['swim', 'v', 2, ''], ['sing', 'v', 2, ''],
  ['write', 'v', 2, ''], ['read', 'v', 2, ''], ['teach', 'v', 2, '', ['CAUS', 'learn']], ['learn', 'v', 2, ''], ['build', 'v', 2, ''],
  ['fight', 'v', 2, ''], ['burn', 'v', 2, ''], ['flow', 'v', 2, ''], ['rise', 'v', 2, ''], ['fall', 'v', 2, ''], ['hold', 'v', 2, ''],
  ['find', 'v', 2, ''], ['fear.v', 'v', 2, ''], ['laugh', 'v', 2, ''], ['weep', 'v', 2, ''], ['hunt', 'v', 2, ''], ['carry', 'v', 2, ''],
  ['open', 'v', 2, ''], ['close', 'v', 3, ''], ['rule', 'v', 3, ''], ['buy', 'v', 3, ''], ['wait', 'v', 3, ''], ['call', 'v', 2, ''],
  ['seek', 'v', 3, ''], ['become', 'v', 2, ''], ['work', 'v', 2, ''], ['remember', 'v', 3, ''], ['shine', 'v', 3, ''], ['grow', 'v', 2, ''], ['return', 'v', 3, ''], ['dance', 'v', 3, ''],
  // adjectives
  ['big', 'adj', 1, ''], ['small', 'adj', 1, ''], ['good', 'adj', 1, ''], ['bad', 'adj', 1, ''], ['old', 'adj', 1, ''], ['new', 'adj', 1, ''],
  ['young', 'adj', 2, ''], ['long', 'adj', 1, ''], ['short', 'adj', 2, ''], ['hot', 'adj', 1, ''], ['cold', 'adj', 1, ''], ['red', 'adj', 1, ''],
  ['white', 'adj', 1, ''], ['black', 'adj', 1, ''], ['green', 'adj', 2, ''], ['blue', 'adj', 2, ''], ['full', 'adj', 2, ''], ['heavy', 'adj', 2, ''],
  ['beautiful', 'adj', 2, ''], ['strong', 'adj', 2, ''], ['wise', 'adj', 2, ''], ['dark', 'adj', 2, ''], ['bright', 'adj', 2, ''],
  ['high', 'adj', 2, ''], ['deep', 'adj', 2, ''], ['holy', 'adj', 3, ''], ['true', 'adj', 2, ''], ['free', 'adj', 3, ''], ['far', 'adj', 2, ''],
  ['near', 'adj', 2, ''], ['happy', 'adj', 2, ''], ['sad', 'adj', 3, ''], ['quick', 'adj', 3, ''], ['many', 'adj', 1, ''], ['all', 'adj', 1, ''],
  // adverbs and function words
  ['here', 'adv', 1, ''], ['there', 'adv', 1, ''], ['now', 'adv', 1, ''], ['today', 'adv', 2, ''], ['tomorrow', 'adv', 2, ''],
  ['yesterday', 'adv', 2, ''], ['always', 'adv', 2, ''], ['never', 'adv', 2, ''], ['again', 'adv', 3, ''], ['very', 'adv', 1, ''],
  ['and', 'conj', 1, ''], ['or', 'conj', 1, ''], ['but', 'conj', 1, ''], ['if', 'conj', 2, ''], ['because', 'conj', 2, ''],
  ['yes', 'part', 1, ''], ['no', 'part', 1, ''],
  ['who', 'q', 1, ''], ['what', 'q', 1, ''], ['where', 'q', 1, ''], ['when', 'q', 1, ''], ['why', 'q', 2, ''], ['how', 'q', 2, ''],
  ['this', 'dem', 1, ''], ['that', 'dem', 1, ''],
  // numerals
  ['one', 'num', 1, ''], ['two', 'num', 1, ''], ['three', 'num', 1, ''], ['four', 'num', 1, ''], ['five', 'num', 1, ''],
  ['six', 'num', 2, ''], ['seven', 'num', 2, ''], ['eight', 'num', 2, ''], ['nine', 'num', 2, ''], ['ten', 'num', 1, ''],
  ['eleven', 'num', 3, ''], ['twelve', 'num', 3, ''], ['twenty', 'num', 2, ''], ['hundred', 'num', 2, ''], ['thousand', 'num', 3, ''],
  // play and movement
  ['ball', 'n', 2, ''], ['basket', 'n', 2, ''], ['net', 'n', 2, ''], ['team', 'n', 2, ''], ['game', 'n', 2, ''],
  ['goal', 'n', 2, ''], ['court', 'n', 3, 'l'], ['chess', 'n', 3, ''], ['sport', 'n', 3, ''],
  ['play', 'v', 2, ''], ['kick', 'v', 2, ''], ['throw', 'v', 2, ''], ['catch', 'v', 2, ''],
  ['win', 'v', 2, ''], ['lose', 'v', 2, ''], ['jump', 'v', 2, ''], ['ride', 'v', 2, ''],
  compound('football', 'foot', 'ball'), compound('basketball', 'basket', 'ball'), compound('handball', 'hand', 'ball'),
  compound('netball', 'net', 'ball'), compound('snowball', 'snow', 'ball'),
  ['player', 'n', 3, 'h', ['AGT', 'play']], ['runner', 'n', 3, 'h', ['AGT', 'run']], ['swimmer', 'n', 3, 'h', ['AGT', 'swim']],
  // home, food and the neighbourhood
  ['room', 'n', 2, 'l'], ['bed', 'n', 1, ''], ['table', 'n', 2, ''], ['chair', 'n', 2, ''], ['window', 'n', 2, ''],
  ['wall', 'n', 2, ''], ['key', 'n', 2, ''], ['lock', 'n', 2, ''], ['bell', 'n', 2, ''], ['shelf', 'n', 3, ''],
  ['bowl', 'n', 2, ''], ['pot', 'n', 2, ''], ['pan', 'n', 2, ''], ['spoon', 'n', 2, ''], ['fork', 'n', 2, ''],
  ['fruit', 'n', 2, ''], ['apple', 'n', 2, ''], ['rice', 'n', 2, 'mass'], ['tea', 'n', 2, 'mass'], ['cheese', 'n', 2, 'mass'],
  ['soup', 'n', 2, 'mass'], ['honey', 'n', 2, 'mass'], ['sugar', 'n', 2, 'mass'], ['meal', 'n', 2, ''],
  ['street', 'n', 2, 'l'], ['bridge', 'n', 2, 'l'], ['town', 'n', 2, 'l'], ['shop', 'n', 2, 'l'],
  ['garden', 'n', 2, 'l'], ['farm', 'n', 2, 'l'], ['mill', 'n', 3, 'l'], ['tower', 'n', 3, 'l'],
  ['cook', 'v', 2, ''], ['bake', 'v', 2, ''], ['wash', 'v', 2, ''], ['sell', 'v', 2, ''],
  compound('bedroom', 'bed', 'room', 'l'), compound('classroom', 'school', 'room', 'l'),
  compound('doorbell', 'door', 'bell'), compound('bookshelf', 'book', 'shelf'),
  compound('bookshop', 'book', 'shop', 'l'), compound('teapot', 'tea', 'pot'), compound('teacup', 'tea', 'cup'),
  compound('windmill', 'wind', 'mill', 'l'), compound('watermill', 'water', 'mill', 'l'),
  ['bakery', 'n', 3, 'l', ['PLACE', 'bake']], ['kitchen', 'n', 2, 'l', ['PLACE', 'cook']],
  ['baker', 'n', 3, 'h', ['AGT', 'bake']], ['seller', 'n', 3, 'h', ['AGT', 'sell']], ['builder', 'n', 3, 'h', ['AGT', 'build']],
  // weather, countryside and navigation
  ['light', 'n', 2, 'mass'], ['storm', 'n', 2, ''], ['thunder', 'n', 3, ''], ['ice', 'n', 2, 'mass'],
  ['sand', 'n', 2, 'mass'], ['wood', 'n', 2, 'mass'], ['path', 'n', 2, 'l'], ['shore', 'n', 2, 'l'], ['hill', 'n', 2, 'l'],
  ['bee', 'n', 2, 'a'], ['deer', 'n', 2, 'a'], ['shell', 'n', 2, ''], ['berry', 'n', 2, ''], ['seed', 'n', 2, ''],
  ['sail', 'n', 2, ''], ['wheel', 'n', 2, ''], ['cart', 'n', 3, ''], ['train', 'n', 3, ''], ['bus', 'n', 3, ''],
  ['car', 'n', 2, ''], ['ship', 'n', 2, ''], ['map', 'n', 2, ''], ['port', 'n', 3, 'l'],
  compound('sunlight', 'sun', 'light', 'mass'), compound('moonlight', 'moon', 'light', 'mass'), compound('starlight', 'star', 'light', 'mass'),
  compound('rainstorm', 'rain', 'storm'), compound('snowstorm', 'snow', 'storm'), compound('thunderstorm', 'thunder', 'storm'),
  compound('seashell', 'sea', 'shell'), compound('seabird', 'sea', 'bird', 'a'), compound('sailboat', 'sail', 'boat'),
  compound('footpath', 'foot', 'path', 'l'), compound('hillside', 'hill', 'side', 'l'), ['side', 'n', 2, ''],
  // work, communications and everyday descriptions
  ['paper', 'n', 2, 'mass'], ['ink', 'n', 3, 'mass'], ['pen', 'n', 2, ''], ['letter', 'n', 2, ''],
  ['desk', 'n', 2, ''], ['bag', 'n', 2, ''], ['page', 'n', 2, ''], ['note', 'n', 2, ''], ['screen', 'n', 3, ''],
  ['phone', 'n', 2, ''], ['radio', 'n', 3, ''], ['computer', 'n', 3, ''], ['camera', 'n', 3, ''],
  ['music', 'n', 2, 'mass'], ['guitar', 'n', 3, ''], ['drum', 'n', 2, ''], ['clock', 'n', 2, ''],
  ['help', 'v', 1, ''], ['ask', 'v', 1, ''], ['need', 'v', 1, ''], ['like', 'v', 1, ''], ['show', 'v', 2, ''],
  ['send', 'v', 2, ''], ['bring', 'v', 2, ''], ['meet', 'v', 2, ''], ['travel', 'v', 2, ''], ['paint', 'v', 2, ''],
  compound('notebook', 'note', 'book'), compound('songbook', 'song', 'book'), compound('schoolbag', 'school', 'bag'),
  ['painter', 'n', 3, 'h', ['AGT', 'paint']], ['reader', 'n', 3, 'h', ['AGT', 'read']], ['dancer', 'n', 3, 'h', ['AGT', 'dance']],
  ['quiet', 'adj', 2, ''], ['loud', 'adj', 2, ''], ['tall', 'adj', 2, ''], ['slow', 'adj', 2, ''], ['soft', 'adj', 2, ''],
  ['hard', 'adj', 2, ''], ['empty', 'adj', 2, ''], ['dry', 'adj', 2, ''], ['wet', 'adj', 2, ''], ['sweet', 'adj', 2, ''],
];

// Display gloss (strip disambiguation suffixes like "love.v").
export function displayGloss(g) { return g.replace(/\.v$/, ''); }
