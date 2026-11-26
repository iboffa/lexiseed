// Case inventory and hierarchy. [ASSUMPTION] Order after Blake (1994) "Case", simplified.
// A language with n cases takes the first n of its hierarchy (accusative or ergative core first).
// role: what the grammar engine uses the case for when building sentences.

export const CASES = {
  NOM: { name: 'Nominative', abbr: 'NOM', use: 'subject of every verb', role: 'subject' },
  ACC: { name: 'Accusative', abbr: 'ACC', use: 'direct object', role: 'object' },
  ABS: { name: 'Absolutive', abbr: 'ABS', use: 'subject of intransitive verbs and object of transitive verbs', role: 'absolutive' },
  ERG: { name: 'Ergative', abbr: 'ERG', use: 'subject of transitive verbs (the agent)', role: 'agent' },
  GEN: { name: 'Genitive', abbr: 'GEN', use: 'possessor: "of X", "X\'s"', role: 'possessor' },
  DAT: { name: 'Dative', abbr: 'DAT', use: 'recipient or beneficiary: "to X", "for X"', role: 'recipient' },
  LOC: { name: 'Locative', abbr: 'LOC', use: 'location: "in / at / on X"', role: 'location' },
  ABL: { name: 'Ablative', abbr: 'ABL', use: 'source or origin: "from X"', role: 'source' },
  INS: { name: 'Instrumental', abbr: 'INS', use: 'instrument or means: "with / by means of X"', role: 'instrument' },
  COM: { name: 'Comitative', abbr: 'COM', use: 'accompaniment: "together with X"', role: 'companion' },
  VOC: { name: 'Vocative', abbr: 'VOC', use: 'direct address: "O X!"', role: 'address' },
  ALL: { name: 'Allative', abbr: 'ALL', use: 'motion towards: "to / onto X"', role: 'goal' },
  ESS: { name: 'Essive', abbr: 'ESS', use: 'temporary state or role: "as X"', role: 'state' },
  PART: { name: 'Partitive', abbr: 'PART', use: 'part of a whole, unbounded quantity: "some X"', role: 'partial' },
  TRANS: { name: 'Translative', abbr: 'TRANS', use: 'change of state: "becoming X"', role: 'change' },
  ABE: { name: 'Abessive', abbr: 'ABE', use: 'absence: "without X"', role: 'without' },
  // Uralic-style local cases (used when the locative splits)
  INE: { name: 'Inessive', abbr: 'INE', use: 'inside: "in X"', role: 'location' },
  ELA: { name: 'Elative', abbr: 'ELA', use: 'out of: "out of X"', role: 'source' },
  ILL: { name: 'Illative', abbr: 'ILL', use: 'into: "into X"', role: 'goal' },
  ADE: { name: 'Adessive', abbr: 'ADE', use: 'on / at: "on X", also possession "at X = X has"', role: 'surface' },
};

export const HIERARCHY_ACC = ['NOM', 'ACC', 'GEN', 'DAT', 'LOC', 'ABL', 'INS', 'COM', 'VOC', 'ALL', 'ESS', 'PART', 'TRANS', 'ABE'];
export const HIERARCHY_ERG = ['ABS', 'ERG', 'GEN', 'DAT', 'LOC', 'ABL', 'INS', 'COM', 'VOC', 'ALL', 'ESS', 'PART', 'TRANS', 'ABE'];
// With 10+ cases and a "split locative" language, local cases replace LOC/ABL/ALL.
export const HIERARCHY_SPLIT_LOCAL = ['NOM', 'ACC', 'GEN', 'PART', 'INE', 'ELA', 'ILL', 'ADE', 'ABL', 'ALL', 'ESS', 'TRANS', 'ABE', 'COM', 'INS'];

// English adposition gloss for each role, used when a role has no case and needs an adposition instead.
export const ROLE_ADPOSITION = {
  possessor: 'of', recipient: 'to', location: 'in', source: 'from', instrument: 'with', companion: 'with.COM',
  goal: 'towards', state: 'as', partial: 'some.of', change: 'into.state', without: 'without', surface: 'on', address: 'O',
};
