// Ancient Greek: proto/ancestor lexicon for the hellenic family.
// Sources: see `sources`. Forms are facts collected from the cited pages; spelling converted to the project's segments.
export default {
  id: "greek",
  family: "hellenic",
  name: "Ancient Greek (Attic/Koine)",
  sources: [
    {
      url: "https://en.wiktionary.org/wiki/Appendix:Ancient_Greek_Swadesh_list",
      licence: "CC BY-SA 4.0",
      use: "reference"
    },
    {
      url: "https://en.wiktionary.org/wiki/Appendix:Greek_Swadesh_list",
      licence: "CC BY-SA 4.0",
      use: "reference (Modern Greek daughter forms)"
    },
    {
      url: "https://en.wiktionary.org/wiki/ψωμί",
      licence: "CC BY-SA 4.0",
      use: "reference"
    },
    {
      url: "https://en.wiktionary.org/wiki/Category:Ancient_Greek_lemmas",
      licence: "CC BY-SA 4.0",
      use: "reference: standard Ancient Greek lemmas outside the Swadesh list, written from the compiler's knowledge and checkable on the individual Wiktionary entry pages (not each fetched)"
    },
    {
      url: "https://en.wiktionary.org/w/api.php?action=query&prop=revisions&titles=ὀμμάτιον|ὀψάριον|ὠτίον|κυνηγός|πολεμιστής|πρωΐ|ποτήριον|χόρτος|μάχαιρα",
      licence: "CC BY-SA 4.0",
      use: "reference (entry pages checked for headword and accent)"
    }
  ],
  words: {
    person: {
      f: "a n tʰ r ɔː p o s",
      s: 0,
      src: 0,
      note: "ἄνθρωπος"
    },
    man: {
      f: "a n ɛː r",
      s: 1,
      src: 0,
      note: "ἀνήρ (gen. ἀνδρός)"
    },
    woman: {
      f: "g y n ɛː",
      s: 1,
      src: 0,
      note: "γυνή (gen. γυναικός; Modern γυναίκα < acc. γυναῖκα)"
    },
    child: {
      f: "p a j d i o n",
      s: 1,
      src: 0,
      note: "παιδίον, diminutive of παῖς (Modern παιδί)"
    },
    mother: {
      f: "m ɛː t ɛː r",
      s: 0,
      src: 0,
      note: "μήτηρ"
    },
    father: {
      f: "p a t ɛː r",
      s: 1,
      src: 0,
      note: "πατήρ"
    },
    brother: {
      f: "a d e l pʰ o s",
      s: 2,
      src: 3,
      note: "ἀδελφός"
    },
    sister: {
      f: "a d e l pʰ ɛː",
      s: 2,
      src: 3,
      note: "ἀδελφή"
    },
    friend: {
      f: "pʰ i l o s",
      s: 0,
      src: 3,
      note: "φίλος"
    },
    enemy: {
      f: "e kʰ tʰ r o s",
      s: 1,
      src: 3,
      note: "ἐχθρός"
    },
    king: {
      f: "b a s i l e w s",
      s: 2,
      src: 3,
      note: "βασιλεύς"
    },
    queen: {
      f: "b a s i l eː a",
      s: 1,
      src: 3,
      note: "βασίλεια 'queen' (cf. βασιλεία 'kingdom')"
    },
    god: {
      f: "tʰ e o s",
      s: 1,
      src: 3,
      note: "θεός"
    },
    teacher: {
      f: "d i d a s k a l o s",
      s: 1,
      src: 3,
      note: "διδάσκαλος"
    },
    singer: {
      f: "ɔː d o s",
      s: 1,
      src: 3,
      note: "ᾠδός"
    },
    hunter: {
      f: "k y n ɛː g o s",
      s: 2,
      src: 4,
      note: "κυνηγός 'hunter (with dogs)'"
    },
    writer: {
      f: "s y ŋ g r a pʰ e w s",
      s: 2,
      src: 3,
      note: "συγγραφεύς"
    },
    warrior: {
      f: "p o l e m i s t ɛː s",
      s: 3,
      src: 4,
      note: "πολεμιστής"
    },
    guest: {
      f: "k s e n o s",
      s: 0,
      src: 3,
      note: "ξένος 'guest-friend, stranger'"
    },
    daughter: {
      f: "tʰ y g a t ɛː r",
      s: 1,
      src: 3,
      note: "θυγάτηρ"
    },
    son: {
      f: "h y j o s",
      s: 1,
      src: 3,
      note: "υἱός (υι written y j)"
    },
    roof: {
      f: "s t e g ɛː",
      s: 0,
      src: 3,
      note: "στέγη"
    },
    people: {
      f: "l a o s",
      s: 1,
      src: 3,
      note: "λαός; δῆμος 'the people (political)'"
    },
    head: {
      f: "k e pʰ a l ɛː",
      s: 2,
      src: 0,
      note: "κεφαλή (Modern κεφάλι < dim. κεφάλιον)"
    },
    eye: {
      f: "o m m a t i o n",
      s: 1,
      src: 4,
      note: "ὀμμάτιον, diminutive of ὄμμα (Modern μάτι); ὀφθαλμός is the Swadesh-list word"
    },
    ear: {
      f: "ɔː t i o n",
      s: 1,
      src: 4,
      note: "ὠτίον, Koine diminutive of οὖς (Modern αυτί); οὖς is the Swadesh-list word"
    },
    nose: {
      f: "r iː s",
      s: 0,
      src: 0,
      note: "ῥίς (gen. ῥινός)"
    },
    mouth: {
      f: "s t o m a",
      s: 0,
      src: 0,
      note: "στόμα"
    },
    tooth: {
      f: "o d uː s",
      s: 1,
      src: 0,
      note: "ὀδούς (gen. ὀδόντος; Modern δόντι < ὀδόντιον)"
    },
    tongue: {
      f: "g l ɔː s s a",
      s: 0,
      src: 0,
      note: "γλῶσσα (Attic γλῶττα)"
    },
    hand: {
      f: "kʰ eː r",
      s: 0,
      src: 0,
      note: "χείρ (Modern χέρι < χέριον)"
    },
    foot: {
      f: "p uː s",
      s: 0,
      src: 0,
      note: "πούς (gen. ποδός; Modern πόδι < πόδιον)"
    },
    heart: {
      f: "k a r d i aː",
      s: 1,
      src: 0,
      note: "καρδία"
    },
    blood: {
      f: "h a j m a",
      s: 0,
      src: 0,
      note: "αἷμα"
    },
    bone: {
      f: "o s t uː n",
      s: 1,
      src: 0,
      note: "ὀστοῦν (uncontracted ὀστέον)"
    },
    skin: {
      f: "d e r m a",
      s: 0,
      src: 0,
      note: "δέρμα"
    },
    hair: {
      f: "tʰ r i k s",
      s: 0,
      src: 0,
      note: "θρίξ (gen. τριχός)"
    },
    tear: {
      f: "d a k r y",
      s: 0,
      src: 3,
      note: "δάκρυ"
    },
    sun: {
      f: "h ɛː l i o s",
      s: 0,
      src: 0,
      note: "ἥλιος"
    },
    moon: {
      f: "s e l ɛː n ɛː",
      s: 1,
      src: 0,
      note: "σελήνη"
    },
    star: {
      f: "a s t ɛː r",
      s: 1,
      src: 0,
      note: "ἀστήρ; ἄστρον"
    },
    sky: {
      f: "uː r a n o s",
      s: 2,
      src: 0,
      note: "οὐρανός"
    },
    water: {
      f: "h y d ɔː r",
      s: 0,
      src: 0,
      note: "ὕδωρ (gen. ὕδατος); Modern νερό is from Byzantine νηρόν (ὕδωρ) 'fresh water'"
    },
    fire: {
      f: "p yː r",
      s: 0,
      src: 0,
      note: "πῦρ (Modern φωτιά < φωτία)"
    },
    earth: {
      f: "g ɛː",
      s: 0,
      src: 0,
      note: "γῆ"
    },
    stone: {
      f: "l i tʰ o s",
      s: 0,
      src: 0,
      note: "λίθος; πέτρα 'rock' (Modern πέτρα)"
    },
    river: {
      f: "p o t a m o s",
      s: 2,
      src: 0,
      note: "ποταμός"
    },
    sea: {
      f: "tʰ a l a s s a",
      s: 0,
      src: 0,
      note: "θάλασσα (Attic θάλαττα)"
    },
    mountain: {
      f: "o r o s",
      s: 0,
      src: 0,
      note: "ὄρος"
    },
    tree: {
      f: "d e n d r o n",
      s: 0,
      src: 0,
      note: "δένδρον"
    },
    forest: {
      f: "h y l ɛː",
      s: 0,
      src: 0,
      note: "ὕλη"
    },
    wind: {
      f: "a n e m o s",
      s: 0,
      src: 0,
      note: "ἄνεμος"
    },
    rain: {
      f: "h y e t o s",
      s: 2,
      src: 0,
      note: "ὑετός; βροχή (Modern βροχή)"
    },
    snow: {
      f: "kʰ i ɔː n",
      s: 1,
      src: 0,
      note: "χιών"
    },
    cloud: {
      f: "n e pʰ o s",
      s: 0,
      src: 0,
      note: "νέφος; νεφέλη"
    },
    leaf: {
      f: "pʰ y l l o n",
      s: 0,
      src: 0,
      note: "φύλλον"
    },
    flower: {
      f: "a n tʰ o s",
      s: 0,
      src: 0,
      note: "ἄνθος"
    },
    grass: {
      f: "kʰ o r t o s",
      s: 0,
      src: 4,
      note: "χόρτος 'fodder, grass' (Modern χόρτο); πόα is the Swadesh-list word"
    },
    island: {
      f: "n ɛː s o s",
      s: 0,
      src: 3,
      note: "νῆσος"
    },
    lake: {
      f: "l i m n ɛː",
      s: 0,
      src: 0,
      note: "λίμνη"
    },
    field: {
      f: "a g r o s",
      s: 1,
      src: 3,
      note: "ἀγρός"
    },
    salt: {
      f: "h a l s",
      s: 0,
      src: 0,
      note: "ἅλς (Modern αλάτι < ἁλάτιον)"
    },
    day: {
      f: "h ɛː m e r aː",
      s: 1,
      src: 0,
      note: "ἡμέρα"
    },
    night: {
      f: "n y k s",
      s: 0,
      src: 0,
      note: "νύξ (gen. νυκτός)"
    },
    year: {
      f: "e t o s",
      s: 0,
      src: 0,
      note: "ἔτος"
    },
    morning: {
      f: "p r ɔː i",
      s: 1,
      src: 4,
      note: "πρωΐ 'early in the day' (Modern πρωί)"
    },
    evening: {
      f: "h e s p e r aː",
      s: 1,
      src: 3,
      note: "ἑσπέρα"
    },
    winter: {
      f: "kʰ eː m ɔː n",
      s: 1,
      src: 3,
      note: "χειμών"
    },
    summer: {
      f: "tʰ e r o s",
      s: 0,
      src: 3,
      note: "θέρος"
    },
    time: {
      f: "kʰ r o n o s",
      s: 0,
      src: 3,
      note: "χρόνος"
    },
    dog: {
      f: "k y ɔː n",
      s: 0,
      src: 0,
      note: "κύων (gen. κυνός)"
    },
    cat: {
      f: "a j l uː r o s",
      s: 0,
      src: 3,
      note: "αἴλουρος"
    },
    horse: {
      f: "h i p p o s",
      s: 0,
      src: 3,
      note: "ἵππος (Modern άλογο < Byzantine ἄλογον 'beast')"
    },
    bird: {
      f: "o r n i s",
      s: 0,
      src: 0,
      note: "ὄρνις (gen. ὄρνιθος)"
    },
    fish: {
      f: "o p s a r i o n",
      s: 1,
      src: 4,
      note: "ὀψάριον 'relish, fish' (Koine; Modern ψάρι); ἰχθύς is the Swadesh-list word"
    },
    snake: {
      f: "o pʰ i s",
      s: 0,
      src: 0,
      note: "ὄφις"
    },
    wolf: {
      f: "l y k o s",
      s: 0,
      src: 3,
      note: "λύκος"
    },
    cow: {
      f: "b uː s",
      s: 0,
      src: 3,
      note: "βοῦς"
    },
    bear: {
      f: "a r k t o s",
      s: 0,
      src: 3,
      note: "ἄρκτος"
    },
    egg: {
      f: "ɔː o n",
      s: 1,
      src: 0,
      note: "ᾠόν (iota subscript not written)"
    },
    house: {
      f: "o j k o s",
      s: 0,
      src: 3,
      note: "οἶκος; οἰκία"
    },
    door: {
      f: "tʰ y r aː",
      s: 0,
      src: 3,
      note: "θύρα"
    },
    road: {
      f: "h o d o s",
      s: 1,
      src: 0,
      note: "ὁδός"
    },
    city: {
      f: "p o l i s",
      s: 0,
      src: 3,
      note: "πόλις"
    },
    village: {
      f: "k ɔː m ɛː",
      s: 0,
      src: 3,
      note: "κώμη"
    },
    book: {
      f: "b i b l i o n",
      s: 1,
      src: 3,
      note: "βιβλίον"
    },
    knife: {
      f: "m a kʰ a j r a",
      s: 0,
      src: 4,
      note: "μάχαιρα"
    },
    bread: {
      f: "p s ɔː m i o n",
      s: 1,
      src: 2,
      note: "ψωμίον 'morsel' (Koine; Modern ψωμί); ἄρτος is the Classical word"
    },
    meat: {
      f: "k r e a s",
      s: 0,
      src: 0,
      note: "κρέας"
    },
    wine: {
      f: "o j n o s",
      s: 0,
      src: 3,
      note: "οἶνος (Modern κρασί < κρᾶσις 'mixture')"
    },
    milk: {
      f: "g a l a",
      s: 0,
      src: 3,
      note: "γάλα (gen. γάλακτος)"
    },
    boat: {
      f: "p l o j o n",
      s: 0,
      src: 3,
      note: "πλοῖον"
    },
    sword: {
      f: "k s i pʰ o s",
      s: 0,
      src: 3,
      note: "ξίφος"
    },
    gold: {
      f: "kʰ r yː s o s",
      s: 1,
      src: 3,
      note: "χρυσός"
    },
    iron: {
      f: "s i d ɛː r o s",
      s: 0,
      src: 3,
      note: "σίδηρος"
    },
    cup: {
      f: "p o t ɛː r i o n",
      s: 1,
      src: 4,
      note: "ποτήριον (Modern ποτήρι)"
    },
    gift: {
      f: "d ɔː r o n",
      s: 0,
      src: 3,
      note: "δῶρον"
    },
    school: {
      f: "s kʰ o l ɛː",
      s: 1,
      src: 3,
      note: "σχολή"
    },
    library: {
      f: "b i b l i o tʰ ɛː k ɛː",
      s: 3,
      src: 3,
      note: "βιβλιοθήκη"
    },
    temple: {
      f: "n a o s",
      s: 1,
      src: 3,
      note: "ναός (Attic νεώς)"
    },
    kingdom: {
      f: "b a s i l eː aː",
      s: 2,
      src: 3,
      note: "βασιλεία"
    },
    market: {
      f: "a g o r aː",
      s: 2,
      src: 3,
      note: "ἀγορά"
    },
    grave: {
      f: "t a pʰ o s",
      s: 0,
      src: 3,
      note: "τάφος"
    },
    name: {
      f: "o n o m a",
      s: 0,
      src: 0,
      note: "ὄνομα"
    },
    word: {
      f: "l o g o s",
      s: 0,
      src: 3,
      note: "λόγος"
    },
    song: {
      f: "ɔː d ɛː",
      s: 1,
      src: 3,
      note: "ᾠδή"
    },
    story: {
      f: "m yː tʰ o s",
      s: 0,
      src: 3,
      note: "μῦθος"
    },
    war: {
      f: "p o l e m o s",
      s: 0,
      src: 3,
      note: "πόλεμος"
    },
    peace: {
      f: "eː r ɛː n ɛː",
      s: 1,
      src: 3,
      note: "εἰρήνη"
    },
    love: {
      f: "a g a p ɛː",
      s: 1,
      src: 3,
      note: "ἀγάπη (Koine); ἔρως 'desire'"
    },
    life: {
      f: "z d ɔː ɛː",
      s: 1,
      src: 3,
      note: "ζωή; βίος 'way of life'"
    },
    death: {
      f: "tʰ a n a t o s",
      s: 0,
      src: 3,
      note: "θάνατος"
    },
    fear: {
      f: "pʰ o b o s",
      s: 0,
      src: 3,
      note: "φόβος"
    },
    dream: {
      f: "o n eː r o s",
      s: 0,
      src: 3,
      note: "ὄνειρος (also ὄνειρον)"
    },
    truth: {
      f: "a l ɛː tʰ eː a",
      s: 1,
      src: 3,
      note: "ἀλήθεια"
    },
    wisdom: {
      f: "s o pʰ i aː",
      s: 1,
      src: 3,
      note: "σοφία"
    },
    strength: {
      f: "d y n a m i s",
      s: 0,
      src: 3,
      note: "δύναμις; ἰσχύς"
    },
    beauty: {
      f: "k a l l o s",
      s: 0,
      src: 3,
      note: "κάλλος"
    },
    darkness: {
      f: "s k o t o s",
      s: 0,
      src: 3,
      note: "σκότος"
    },
    freedom: {
      f: "e l e w tʰ e r i aː",
      s: 3,
      src: 3,
      note: "ἐλευθερία"
    },
    spirit: {
      f: "p n e w m a",
      s: 0,
      src: 3,
      note: "πνεῦμα"
    },
    law: {
      f: "n o m o s",
      s: 0,
      src: 3,
      note: "νόμος"
    },
    language: {
      f: "g l ɔː s s a",
      s: 0,
      src: 3,
      note: "γλῶσσα (same word as 'tongue')"
    },
    thing: {
      f: "p r aː g m a",
      s: 0,
      src: 3,
      note: "πρᾶγμα"
    },
    way: {
      f: "t r o p o s",
      s: 0,
      src: 3,
      note: "τρόπος 'manner'"
    },
    be: {
      f: "eː n a j",
      s: 0,
      src: 3,
      note: "infinitive εἶναι (irregular: εἰμί, εἶ, ἐστί)"
    },
    have: {
      f: "e kʰ",
      s: 0,
      src: 0,
      note: "ἔχω"
    },
    go: {
      f: "h y p a g",
      s: 1,
      src: 3,
      note: "ὑπάγω 'go away' (Koine; Modern πάω/πηγαίνω); εἶμι/ἔρχομαι are Classical"
    },
    come: {
      f: "e r kʰ",
      s: 0,
      src: 0,
      note: "ἔρχομαι"
    },
    see: {
      f: "b l e p",
      s: 0,
      src: 0,
      note: "βλέπω; ὁράω and εἶδον are the other Classical verbs"
    },
    hear: {
      f: "a k uː",
      s: 1,
      src: 0,
      note: "ἀκούω"
    },
    speak: {
      f: "l a l e",
      s: 1,
      src: 3,
      note: "λαλέω (contract)"
    },
    say: {
      f: "l e g",
      s: 0,
      src: 0,
      note: "λέγω"
    },
    tell: {
      f: "d i ɛː g e",
      s: 2,
      src: 3,
      note: "διηγέομαι 'narrate' (contract, deponent)"
    },
    know: {
      f: "g i g n ɔː s k",
      s: 1,
      src: 0,
      note: "γιγνώσκω (Koine γινώσκω); οἶδα 'I know (perfect)'"
    },
    think: {
      f: "n o m i z d",
      s: 1,
      src: 0,
      note: "νομίζω"
    },
    eat: {
      f: "e s tʰ i",
      s: 1,
      src: 0,
      note: "ἐσθίω (aorist ἔφαγον; Modern τρώγω < τρώγω 'gnaw')"
    },
    drink: {
      f: "p i n",
      s: 0,
      src: 0,
      note: "πίνω"
    },
    sleep: {
      f: "k a tʰ e w d",
      s: 1,
      src: 0,
      note: "καθεύδω; κοιμάομαι gives Modern κοιμάμαι"
    },
    die: {
      f: "a p o tʰ n ɛː s k",
      s: 2,
      src: 0,
      note: "ἀποθνῄσκω (iota subscript not written)"
    },
    kill: {
      f: "a p o k t eː n",
      s: 2,
      src: 0,
      note: "ἀποκτείνω"
    },
    live: {
      f: "z d a",
      s: 0,
      src: 0,
      note: "ζάω, contracted ζῶ"
    },
    give: {
      f: "d i d ɔː",
      s: 0,
      src: 0,
      note: "δίδωμι (athematic; Koine/Modern δίνω)"
    },
    take: {
      f: "l a m b a n",
      s: 1,
      src: 3,
      note: "λαμβάνω"
    },
    make: {
      f: "p o j e",
      s: 1,
      src: 3,
      note: "ποιέω (contract)"
    },
    "love.v": {
      f: "a g a p a",
      s: 2,
      src: 3,
      note: "ἀγαπάω (contract; Modern αγαπώ); φιλέω 'love, kiss'"
    },
    want: {
      f: "tʰ e l",
      s: 0,
      src: 3,
      note: "θέλω (Attic ἐθέλω)"
    },
    walk: {
      f: "p e r i p a t e",
      s: 3,
      src: 0,
      note: "περιπατέω (contract)"
    },
    run: {
      f: "t r e kʰ",
      s: 0,
      src: 3,
      note: "τρέχω"
    },
    sit: {
      f: "k a tʰ i z d",
      s: 1,
      src: 0,
      note: "καθίζω"
    },
    stand: {
      f: "h i s t ɛː",
      s: 0,
      src: 0,
      note: "ἵστημι (athematic)"
    },
    fly: {
      f: "p e t",
      s: 0,
      src: 0,
      note: "πέτομαι (deponent)"
    },
    swim: {
      f: "k o l y m b a",
      s: 2,
      src: 0,
      note: "κολυμβάω (contract; Modern κολυμπώ); νέω is the other Swadesh-list verb"
    },
    sing: {
      f: "aː d",
      s: 0,
      src: 0,
      note: "ᾄδω, contracted from ἀείδω"
    },
    write: {
      f: "g r a pʰ",
      s: 0,
      src: 3,
      note: "γράφω"
    },
    read: {
      f: "a n a g i g n ɔː s k",
      s: 3,
      src: 3,
      note: "ἀναγιγνώσκω (Koine ἀναγινώσκω)"
    },
    teach: {
      f: "d i d a s k",
      s: 1,
      src: 3,
      note: "διδάσκω"
    },
    learn: {
      f: "m a n tʰ a n",
      s: 1,
      src: 3,
      note: "μανθάνω"
    },
    build: {
      f: "o j k o d o m e",
      s: 3,
      src: 3,
      note: "οἰκοδομέω (contract)"
    },
    fight: {
      f: "m a kʰ",
      s: 0,
      src: 0,
      note: "μάχομαι (deponent)"
    },
    burn: {
      f: "k a j",
      s: 0,
      src: 0,
      note: "καίω"
    },
    flow: {
      f: "r e",
      s: 0,
      src: 0,
      note: "ῥέω"
    },
    rise: {
      f: "e g eː r",
      s: 1,
      src: 3,
      note: "ἐγείρω 'rouse'; mid. 'rise'"
    },
    fall: {
      f: "p i p t",
      s: 0,
      src: 0,
      note: "πίπτω"
    },
    hold: {
      f: "k r a t e",
      s: 1,
      src: 3,
      note: "κρατέω (contract); ἔχω is the Swadesh-list word"
    },
    find: {
      f: "h e w r i s k",
      s: 1,
      src: 3,
      note: "εὑρίσκω"
    },
    "fear.v": {
      f: "pʰ o b e",
      s: 1,
      src: 0,
      note: "φοβέομαι (contract, deponent)"
    },
    laugh: {
      f: "g e l a",
      s: 1,
      src: 0,
      note: "γελάω (contract)"
    },
    weep: {
      f: "k l a j",
      s: 0,
      src: 3,
      note: "κλαίω"
    },
    hunt: {
      f: "tʰ ɛː r e w",
      s: 1,
      src: 0,
      note: "θηρεύω"
    },
    carry: {
      f: "pʰ e r",
      s: 0,
      src: 3,
      note: "φέρω"
    },
    open: {
      f: "a n o j g",
      s: 1,
      src: 3,
      note: "ἀνοίγω"
    },
    close: {
      f: "k l eː",
      s: 0,
      src: 3,
      note: "κλείω"
    },
    rule: {
      f: "a r kʰ",
      s: 0,
      src: 3,
      note: "ἄρχω"
    },
    buy: {
      f: "a g o r a z d",
      s: 2,
      src: 3,
      note: "ἀγοράζω"
    },
    wait: {
      f: "p e r i m e n",
      s: 2,
      src: 3,
      note: "περιμένω (Modern περιμένω); μένω 'stay'"
    },
    call: {
      f: "k a l e",
      s: 1,
      src: 3,
      note: "καλέω (contract)"
    },
    seek: {
      f: "z d ɛː t e",
      s: 1,
      src: 3,
      note: "ζητέω (contract)"
    },
    become: {
      f: "g i g n",
      s: 0,
      src: 3,
      note: "γίγνομαι (Koine γίνομαι)"
    },
    work: {
      f: "e r g a z d",
      s: 1,
      src: 3,
      note: "ἐργάζομαι (deponent)"
    },
    remember: {
      f: "m i m n ɛː s k",
      s: 1,
      src: 3,
      note: "μιμνῄσκομαι (iota subscript not written)"
    },
    shine: {
      f: "l a m p",
      s: 0,
      src: 3,
      note: "λάμπω"
    },
    grow: {
      f: "a w k s a n",
      s: 1,
      src: 0,
      note: "αὐξάνω"
    },
    return: {
      f: "e p i s t r e pʰ",
      s: 2,
      src: 3,
      note: "ἐπιστρέφω"
    },
    dance: {
      f: "o r kʰ e",
      s: 1,
      src: 3,
      note: "ὀρχέομαι (contract, deponent)"
    },
    big: {
      f: "m e g a s",
      s: 0,
      src: 0,
      note: "μέγας"
    },
    small: {
      f: "m iː k r o s",
      s: 1,
      src: 0,
      note: "μικρός"
    },
    good: {
      f: "a g a tʰ o s",
      s: 2,
      src: 0,
      note: "ἀγαθός; καλός 'fine' (Modern καλός)"
    },
    bad: {
      f: "k a k o s",
      s: 1,
      src: 0,
      note: "κακός"
    },
    old: {
      f: "p a l a j o s",
      s: 2,
      src: 0,
      note: "παλαιός (of things); γέρων 'old man'"
    },
    new: {
      f: "n e o s",
      s: 0,
      src: 0,
      note: "νέος"
    },
    young: {
      f: "n e a r o s",
      s: 2,
      src: 3,
      note: "νεαρός"
    },
    long: {
      f: "m a k r o s",
      s: 1,
      src: 0,
      note: "μακρός"
    },
    short: {
      f: "b r a kʰ y s",
      s: 1,
      src: 0,
      note: "βραχύς"
    },
    hot: {
      f: "tʰ e r m o s",
      s: 1,
      src: 0,
      note: "θερμός"
    },
    cold: {
      f: "p s y kʰ r o s",
      s: 1,
      src: 0,
      note: "ψυχρός"
    },
    red: {
      f: "e r y tʰ r o s",
      s: 2,
      src: 0,
      note: "ἐρυθρός"
    },
    white: {
      f: "l e w k o s",
      s: 1,
      src: 0,
      note: "λευκός"
    },
    black: {
      f: "m e l a s",
      s: 0,
      src: 0,
      note: "μέλας"
    },
    green: {
      f: "kʰ l ɔː r o s",
      s: 1,
      src: 0,
      note: "χλωρός"
    },
    blue: {
      f: "k y a n e o s",
      s: 1,
      src: 3,
      note: "κυάνεος 'dark blue' (Modern γαλάζιος/μπλε)"
    },
    full: {
      f: "p l ɛː r ɛː s",
      s: 0,
      src: 0,
      note: "πλήρης; μεστός"
    },
    heavy: {
      f: "b a r y s",
      s: 1,
      src: 0,
      note: "βαρύς"
    },
    beautiful: {
      f: "k a l o s",
      s: 1,
      src: 3,
      note: "καλός"
    },
    strong: {
      f: "i s kʰ y r o s",
      s: 2,
      src: 3,
      note: "ἰσχυρός; δυνατός 'able, strong' (Modern δυνατός)"
    },
    wise: {
      f: "s o pʰ o s",
      s: 1,
      src: 3,
      note: "σοφός"
    },
    dark: {
      f: "s k o t eː n o s",
      s: 2,
      src: 3,
      note: "σκοτεινός"
    },
    bright: {
      f: "l a m p r o s",
      s: 1,
      src: 3,
      note: "λαμπρός"
    },
    high: {
      f: "h y p s ɛː l o s",
      s: 2,
      src: 3,
      note: "ὑψηλός"
    },
    deep: {
      f: "b a tʰ y s",
      s: 1,
      src: 3,
      note: "βαθύς"
    },
    holy: {
      f: "h a g i o s",
      s: 0,
      src: 3,
      note: "ἅγιος"
    },
    true: {
      f: "a l ɛː tʰ ɛː s",
      s: 2,
      src: 3,
      note: "ἀληθής"
    },
    free: {
      f: "e l e w tʰ e r o s",
      s: 1,
      src: 3,
      note: "ἐλεύθερος"
    },
    far: {
      f: "m a k r aː n",
      s: 1,
      src: 0,
      note: "adverb μακράν"
    },
    near: {
      f: "e ŋ g y s",
      s: 1,
      src: 0,
      note: "adverb ἐγγύς"
    },
    happy: {
      f: "e w d a j m ɔː n",
      s: 1,
      src: 3,
      note: "εὐδαίμων"
    },
    sad: {
      f: "l yː p ɛː r o s",
      s: 2,
      src: 3,
      note: "λυπηρός 'painful, grieved'"
    },
    quick: {
      f: "t a kʰ y s",
      s: 1,
      src: 3,
      note: "ταχύς"
    },
    many: {
      f: "p o l y s",
      s: 1,
      src: 0,
      note: "πολύς"
    },
    all: {
      f: "p aː s",
      s: 0,
      src: 0,
      note: "πᾶς"
    },
    here: {
      f: "e n tʰ a d e",
      s: 1,
      src: 0,
      note: "ἐνθάδε"
    },
    there: {
      f: "e k eː",
      s: 1,
      src: 0,
      note: "ἐκεῖ"
    },
    now: {
      f: "n yː n",
      s: 0,
      src: 3,
      note: "νῦν"
    },
    today: {
      f: "s ɛː m e r o n",
      s: 0,
      src: 3,
      note: "σήμερον (Attic τήμερον)"
    },
    tomorrow: {
      f: "a w r i o n",
      s: 0,
      src: 3,
      note: "αὔριον"
    },
    yesterday: {
      f: "kʰ tʰ e s",
      s: 0,
      src: 3,
      note: "χθές"
    },
    always: {
      f: "a eː",
      s: 1,
      src: 3,
      note: "ἀεί"
    },
    never: {
      f: "uː d e p o t e",
      s: 1,
      src: 3,
      note: "οὐδέποτε"
    },
    again: {
      f: "p a l i n",
      s: 0,
      src: 3,
      note: "πάλιν"
    },
    very: {
      f: "s pʰ o d r a",
      s: 0,
      src: 3,
      note: "σφόδρα"
    },
    and: {
      f: "k a j",
      s: 0,
      src: 0,
      note: "καί"
    },
    or: {
      f: "ɛː",
      s: 0,
      src: 3,
      note: "ἤ"
    },
    but: {
      f: "a l l a",
      s: 1,
      src: 3,
      note: "ἀλλά"
    },
    if: {
      f: "eː",
      s: 0,
      src: 0,
      note: "εἰ; ἐάν with subjunctive"
    },
    because: {
      f: "h o t i",
      s: 0,
      src: 0,
      note: "ὅτι; διότι"
    },
    yes: {
      f: "n a j",
      s: 0,
      src: 3,
      note: "ναί"
    },
    no: {
      f: "uː",
      s: 0,
      src: 0,
      note: "οὐ (οὐχί, οὔ)"
    },
    who: {
      f: "t i s",
      s: 0,
      src: 0,
      note: "τίς"
    },
    what: {
      f: "t i",
      s: 0,
      src: 0,
      note: "τί"
    },
    where: {
      f: "p uː",
      s: 0,
      src: 0,
      note: "ποῦ"
    },
    when: {
      f: "p o t e",
      s: 0,
      src: 0,
      note: "πότε"
    },
    why: {
      f: "d i a t i",
      s: 2,
      src: 3,
      note: "διατί (Koine, usually written διὰ τί; no Wiktionary page for the univerbated form); Classical τί"
    },
    how: {
      f: "p ɔː s",
      s: 0,
      src: 0,
      note: "πῶς"
    },
    this: {
      f: "h uː t o s",
      s: 0,
      src: 0,
      note: "οὗτος (neut. τοῦτο)"
    },
    that: {
      f: "e k eː n o s",
      s: 1,
      src: 0,
      note: "ἐκεῖνος (neut. ἐκεῖνο)"
    },
    one: {
      f: "h eː s",
      s: 0,
      src: 0,
      note: "εἷς (neut. ἕν)"
    },
    two: {
      f: "d y o",
      s: 0,
      src: 0,
      note: "δύο"
    },
    three: {
      f: "t r eː s",
      s: 0,
      src: 0,
      note: "τρεῖς (neut. τρία)"
    },
    four: {
      f: "t e s s a r e s",
      s: 0,
      src: 0,
      note: "τέσσαρες (Attic τέτταρες)"
    },
    five: {
      f: "p e n t e",
      s: 0,
      src: 0,
      note: "πέντε"
    },
    six: {
      f: "h e k s",
      s: 0,
      src: 3,
      note: "ἕξ"
    },
    seven: {
      f: "h e p t a",
      s: 1,
      src: 3,
      note: "ἑπτά"
    },
    eight: {
      f: "o k t ɔː",
      s: 1,
      src: 3,
      note: "ὀκτώ"
    },
    nine: {
      f: "e n n e a",
      s: 1,
      src: 3,
      note: "ἐννέα"
    },
    ten: {
      f: "d e k a",
      s: 0,
      src: 3,
      note: "δέκα"
    },
    eleven: {
      f: "h e n d e k a",
      s: 0,
      src: 3,
      note: "ἕνδεκα"
    },
    twelve: {
      f: "d ɔː d e k a",
      s: 0,
      src: 3,
      note: "δώδεκα"
    },
    twenty: {
      f: "eː k o s i",
      s: 0,
      src: 3,
      note: "εἴκοσι"
    },
    hundred: {
      f: "h e k a t o n",
      s: 2,
      src: 3,
      note: "ἑκατόν"
    },
    thousand: {
      f: "kʰ iː l i o j",
      s: 0,
      src: 3,
      note: "χίλιοι (plural adjective)"
    }
  },
  gaps: [],
  affixes: {
    case: {
      NOM: {
        sg: "o s",
        pl: "o j"
      },
      ACC: {
        sg: "o n",
        pl: "uː s"
      },
      GEN: {
        sg: "uː",
        pl: "ɔː n"
      },
      DAT: {
        sg: "ɔː",
        pl: "o j s"
      },
      VOC: {
        sg: "e",
        pl: "o j"
      }
    },
    caseAlt: {
      theme: "ɛː",
      NOM: {
        sg: "ɛː",
        pl: "a j"
      },
      ACC: {
        sg: "ɛː n",
        pl: "aː s"
      },
      GEN: {
        sg: "ɛː s",
        pl: "ɔː n"
      },
      DAT: {
        sg: "ɛː",
        pl: "a j s"
      },
      VOC: {
        sg: "ɛː",
        pl: "a j"
      }
    },
    person: {
      PRS: {
        "1SG": "ɔː",
        "2SG": "eː s",
        "3SG": "eː",
        "1PL": "o m e n",
        "2PL": "e t e",
        "3PL": "uː s i"
      },
      PST: {
        "1SG": "s a",
        "2SG": "s a s",
        "3SG": "s e",
        "1PL": "s a m e n",
        "2PL": "s a t e",
        "3PL": "s a n"
      }
    },
    infinitive: "eː n",
    article: {
      def: "h o",
      indef: "h eː s"
    },
    demonstratives: {
      this: "h uː t o s",
      that: "e k eː n o s"
    },
    pronouns: {
      "1SG": "e g ɔː",
      "2SG": "s y",
      "3SG": "a w t o s",
      "1PL": "h ɛː m eː s",
      "2PL": "h y m eː s",
      "3PL": "a w t o j"
    },
    adpositions: {
      location: "e n",
      goal: "eː s",
      source: "e k",
      instrument: "d i a",
      companion: "m e t a",
      recipient: "p r o s"
    },
    negation: "uː",
    copula: {
      PRS: {
        "1SG": "eː m i",
        "2SG": "eː",
        "3SG": "e s t i",
        "1PL": "e s m e n",
        "2PL": "e s t e",
        "3PL": "eː s i"
      }
    }
  },
  daughters: {
    "Modern Greek": {
      person: "a n θ r o p o s",
      brother: "a ð e l f o s",
      sister: "a ð e l f i",
      friend: "f i l o s",
      enemy: "e x θ r o s",
      god: "θ e o s",
      child: "p e ð i",
      wolf: "l i k o s",
      fish: "p s a r i",
      bread: "p s o m i",
      river: "p o t a m o s",
      sea: "θ a l a s a",
      earth: "j i",
      sun: "i l j o s",
      moon: "s e l i n i",
      sky: "u r a n o s",
      wind: "a n e m o s",
      tree: "ð e n d r o",
      leaf: "f i l o",
      flower: "a n θ o s",
      book: "v i v l i o",
      milk: "ɣ a l a",
      gold: "x r i s o s",
      iron: "s i ð i r o s",
      gift: "ð o r o",
      name: "o n o m a",
      word: "l o ɣ o s",
      war: "p o l e m o s",
      love: "a ɣ a p i",
      life: "z o i",
      death: "θ a n a t o s",
      fear: "f o v o s",
      truth: "a l i θ j a",
      time: "x r o n o s",
      day: "i m e r a",
      cup: "p o t i r i",
      morning: "p r o i",
      grass: "x o r t o",
      have: "e x o",
      write: "ɣ r a f o",
      drink: "p i n o",
      see: "v l e p o",
      hear: "a k u o",
      say: "l e ɣ o",
      want: "θ e l o",
      run: "t r e x o",
      burn: "k e o",
      weep: "k l e o",
      open: "a n i ɣ o",
      "love.v": "a ɣ a p o",
      good: "a ɣ a θ o s",
      beautiful: "k a l o s",
      bad: "k a k o s",
      small: "m i k r o s",
      white: "l e f k o s",
      cold: "p s i x r o s",
      new: "n e o s",
      wise: "s o f o s",
      deep: "v a θ i s",
      heavy: "v a r i s",
      and: "k e",
      where: "p u",
      when: "p o t e",
      how: "p o s",
      there: "e k i",
      what: "t i",
      tomorrow: "a v r i o",
      today: "s i m e r a",
      again: "p a l i",
      two: "ð i o",
      five: "p e n d e",
      seven: "e p t a",
      eight: "o k t o",
      nine: "e n e a",
      ten: "ð e k a",
      eleven: "e n d e k a",
      twelve: "ð o ð e k a",
      hundred: "e k a t o"
    }
  },
  notes: [
    "Spelling: η -> ɛː, ω -> ɔː, υ -> y (long ῡ -> yː), ει -> eː (genuine and spurious alike), ου -> uː (post-Classical Attic/Koine value), αι -> a j, οι -> o j, αυ -> a w, ευ -> e w, υι -> y j; φ θ χ -> pʰ tʰ kʰ; ζ -> z d (Attic [zd]); ξ -> k s, ψ -> p s; γγ/γκ/γχ -> ŋ g / ŋ k / ŋ kʰ; rough breathing -> h; initial ῥ -> r.",
    "Long ᾱ ῑ ῡ are marked only where the quantity is known; iota subscript (ᾳ ῃ ῳ) is not written (it was silent by Koine times): ᾠδή -> ɔː d ɛː.",
    "Diphthong offglides are written j/w so that every syllable has exactly one vowel segment; s counts vowel segments from 0. The pitch accent type (acute/circumflex) is not distinguished.",
    "Nouns and adjectives: nominative singular (masculine for adjectives). Note that Modern Greek often continues the accusative or a -ιον diminutive (πατέρας, χέρι, πόδι).",
    "Verbs: present stem without the thematic vowel (γράφω -> g r a pʰ; contract verbs keep the stem vowel: ἀγαπάω -> a g a p a); person endings in affixes include the thematic vowel; s is the accent of the 1sg present mapped onto the stem. \"be\" is the infinitive εἶναι. PST is the sigmatic aorist (augment e- not included).",
    "Where Koine replaced the Attic word and Modern Greek continues the Koine one, the Koine word is given and the Attic one is in note (ψωμίον, ὀψάριον, ὀμμάτιον, ὠτίον, παιδίον, ἀγάπη, ὑπάγω); ὕδωρ, ἵππος, πῦρ, οἶνος are kept although Modern Greek replaced them.",
    "Modern Greek daughter forms are broad IPA of the standard language (ντ = [nd]; palatal [ʝ] written j); verbs are 1sg present (stem + -ω), nouns nominative; only regular reflexes of `f` are listed. Tsakonian skipped."
  ]
};
