// my shelf. to add something, copy a { ... } block below, paste it into the list, and fill it in.
// things show up on the shelf in the same order as this list.
//
// type -> "book", "manga" or "cd". it isn't shown anywhere, it just decides how the item is drawn
//         and which count shows on its card. leave it out and it's a book.
//
// books (type: "book"):
//   status  -> "read", "reading" (gets a bookmark), or "to-read" (goes on the to-read shelf)
//   cover   -> optional. an image url or an open library cover id. leave it out to look it up automatically
//   author, genre, pages ("page count"), rating (1-5), quote (shown on hover), synopsis, thoughts,
//   whyRead ("why i read it"), reread ("why i'd reread it")
//
// manga (type: "manga"): same as books, but volumes ("volume count") instead of pages
//
// cds (type: "cd"):
//   status  -> "listened", "listening" (the disc peeks out), or "to-listen" (goes on the to-read shelf)
//   cover   -> optional. an image url. leave it out to look up the album art automatically
//   artist, year, genre, songs ("song count"), favorite (song), rating, quote (a lyric, shown on hover),
//   tracklist (a list of song titles, shown as bullets where books have a synopsis), thoughts, recommend
//
// anything you don't have, just leave out or leave as "".
window.LIBRARY = {
  // where the "recommend a book" button sends things:
  //   web3formsKey -> a free key from web3forms.com. recommendations get emailed to you and visitors stay on the page
  //   email        -> used when there's no key: "send it" opens the visitor's email app, addressed to you
  recommendTo: { web3formsKey: "", email: "jesnguyen910@gmail.com" },

  // the about-me card that opens when you click the bookend at the left end of the shelf.
  // each string in text is its own paragraph.
  // use [text](url) in text to make a link; links with an empty href are hidden.
  about: {
    heading: "jeslyn nguyen",
    text: [
      "a junior studying data science & linguistics @ uc berkeley. i like acronyms, idioms, heytea cloud jasmine, and [math tournaments](https://berkeley.mt).",
      "currently reading: the beautiful and the damned by francis s. fitzgerald",
    ],
    links: [
      { label: "github", href: "https://github.com/gojosleftsock" },
      { label: "linkedin", href: "https://www.linkedin.com/in/jeslyn-nguyen/" },
      { label: "instagram", href: "https://www.instagram.com/jeslynnguyen_/" },
    ],
  },

  // the bulletin board. put a link in any of these to make that thing open it; leave "" and it opens the fyi card.
  board: { rain: "https://www.kenji-world.net/english/download/works/Rain.html", receipt: "", note: "" },

  // the week that opens from the calendar on the shelf. every week looks the same.
  // day -> 0 (sunday) to 6 (saturday); start / end -> 24h hours (13.5 is 1:30 pm); cal -> one of the calendars.
  week: {
    calendars: {
      secrets: "#b0533c", trouble: "#c0873a", avoidance: "#7e6990", opinions: "#557a8c", grind: "#5b7a3c",
    },
    events: [
      { day: 0, start: 13,   end: 15.5, cal: "trouble",   title: "beat the dead horse" },
      { day: 0, start: 19,   end: 22,   cal: "grind",     title: "burn the midnight oil" },
      { day: 1, start: 9,    end: 11,   cal: "trouble",   title: "bark up the wrong tree" },
      { day: 1, start: 12.5, end: 14,   cal: "secrets",   title: "sweep under the rug" },
      { day: 1, start: 16,   end: 18,   cal: "trouble",   title: "push some\u00adone's buttons" },
      { day: 2, start: 10,   end: 12.5, cal: "avoidance", title: "address the elephant in the room" },
      { day: 2, start: 15,   end: 17,   cal: "trouble",   title: "skate on thin ice" },
      { day: 3, start: 9.5,  end: 11.5, cal: "secrets",   title: "open the can of worms" },
      { day: 3, start: 14,   end: 15,   cal: "opinions",  title: "put in my 2 cents" },
      { day: 3, start: 17,   end: 19,   cal: "avoidance", title: "turn a blind eye" },
      { day: 4, start: 11,   end: 14,   cal: "secrets",   title: "take the skeleton out of the closet" },
      { day: 4, start: 18,   end: 20,   cal: "secrets",   title: "spill the beans" },
      { day: 5, start: 9,    end: 10.5, cal: "avoidance", title: "beat around the bush" },
      { day: 5, start: 12,   end: 13.5, cal: "opinions",  title: "look in the pudding" },
      { day: 6, start: 11,   end: 14,   cal: "opinions",  title: "knock it till i try it" },
    ],
  },

  shelf: [
    {
      type: "book",
      title: "east of eden",
      author: "john steinbeck",
      status: "",
      rating: "",
      genre: "family saga",
      pages: 611,
      cover: 11386937,
      quote: "",
      synopsis: "two families in california's salinas valley, the trasks and the hamiltons, live out the story of cain and abel across three generations — a sprawling novel about inheritance, love, and the freedom to choose who you become.",
      thoughts: "",
      whyRead: "",
      reread: "",
    },
    {
      type: "book",
      title: "lolita",
      spine: "library/photo/spines/lolita.jpg",
      height: 19.5,
      author: "vladimir nabokov",
      status: "read",
      rating: "",
      genre: "literary fiction",
      pages: 336,
      cover: 12984540,
      quote: "lolita, light of my life, fire of my loins.",
      synopsis: "an unreliable narrator's confession that dazzles with language while describing something monstrous — a novel about obsession, self-deception, and the seductiveness of prose.",
      whyRead: "",
      reread: "",
      thoughts: "",
    },
    {
      type: "book",
      title: "crime and punishment",
      spine: "library/photo/spines/crime-and-punishment.jpg",
      height: 21.5,
      author: "fyodor dostoevsky",
      status: "read",
      rating: "",
      genre: "psychological fiction",
      pages: 671,
      cover: 13116014,
      quote: "to go wrong in one's own way is better than to go right in someone else's.",
      synopsis: "a destitute ex-student talks himself into a murder, then spends the rest of the book unraveling under the weight of his own conscience.",
      whyRead: "",
      reread: "",
      thoughts: "",
    },
    {
      type: "book",
      title: "no longer human",
      author: "osamu dazai",
      status: "",
      rating: "",
      genre: "japanese literary fiction",
      pages: 188,
      cover: "https://covers.openlibrary.org/b/isbn/9780811204811-L.jpg",
      quote: "",
      synopsis: "told through the notebooks of yozo, a man who has hidden behind clowning since childhood because he can't understand other people — a quiet, devastating account of alienation, addiction, and self-erasure.",
      thoughts: "",
      whyRead: "",
      reread: "",
    },
    {
      type: "book",
      title: "james and the giant peach",
      author: "roald dahl",
      status: "",
      rating: "",
      genre: "children's fantasy",
      pages: 144,
      cover: 8252454,
      quote: "",
      synopsis: "after his parents are eaten by a rhinoceros, james is stuck with two cruel aunts — until a bag of magic crystals grows an enormous peach, and he sails off inside it with a crew of giant talking bugs.",
      thoughts: "",
      whyRead: "",
      reread: "",
    },
    {
      type: "book",
      title: "we have always lived in the castle",
      author: "shirley jackson",
      status: "",
      rating: "",
      genre: "gothic mystery",
      pages: 187,
      cover: 11545332,
      quote: "",
      synopsis: "eighteen-year-old merricat lives with her sister constance and their ailing uncle in the family house, shunned by the village ever since the rest of the blackwoods were poisoned at dinner six years ago. then a cousin arrives.",
      thoughts: "",
      whyRead: "",
      reread: "",
    },
    {
      type: "book",
      title: "the book thief",
      author: "markus zusak",
      status: "",
      rating: "",
      genre: "historical fiction",
      pages: 559,
      cover: 8153054,
      quote: "",
      synopsis: "narrated by death: liesel, a foster girl in nazi germany, steals books, learns to read, and shares them with her neighbors and the jewish man hidden in her basement.",
      thoughts: "",
      whyRead: "",
      reread: "",
    },
    {
      type: "book",
      title: "a tale for the time being",
      author: "ruth ozeki",
      status: "",
      rating: "",
      genre: "literary fiction",
      pages: 438,
      cover: 9765848,
      quote: "",
      synopsis: "a novelist on an island in british columbia finds a hello kitty lunchbox washed ashore, holding the diary of nao, a bullied sixteen-year-old in tokyo — and becomes desperate to know whether she survived.",
      thoughts: "",
      whyRead: "",
      reread: "",
    },
    {
      type: "manga",
      title: "haikyu!!",
      author: "haruichi furudate",
      status: "",
      rating: "",
      genre: "sports",
      height: 19,
      volumes: 45,
      cover: "https://covers.openlibrary.org/b/isbn/9781421587660-L.jpg",
      quote: "",
      synopsis: "shoyo hinata is short but determined to become a great volleyball player. at karasuno high he has to team up with tobio kageyama, the genius setter who beat him in middle school.",
      thoughts: "",
      whyRead: "",
      reread: "",
    },
    {
      type: "manga",
      title: "bungo stray dogs",
      author: "kafka asagiri & sango harukawa",
      status: "",
      rating: "",
      genre: "supernatural action",
      height: 19,
      // still coming out: 28 volumes so far
      volumes: 28,
      cover: "https://covers.openlibrary.org/b/isbn/9780316468145-L.jpg",
      quote: "",
      synopsis: "kicked out of his orphanage, atsushi nakajima joins the armed detective agency — people with supernatural powers named after famous writers — and learns he is the weretiger that's been terrorizing yokohama.",
      thoughts: "",
      whyRead: "",
      reread: "",
    },
    {
      type: "cd",
      title: "tommy february6",
      artist: "tommy february6",
      status: "",
      rating: "",
      year: 2002,
      genre: "j-pop",
      songs: 12,
      favorite: "",
      quote: "",
      tracklist: [
        "t.o.m.m.y",
        "everyday at the bus stop",
        "tommy febratte, macaron.",
        "bloomin'!",
        "hey bad boy",
        "\u2661kiss\u2661 one more time",
        "where are you? \"my hero\"",
        "walk away from you my babe",
        "koi wa nemuranai",
        "can't take my eyes off of you",
        "i'll be your angel",
        "\u2605candy pop in love\u2605",
      ],
      thoughts: "",
      recommend: "",
    },
  ],
};
