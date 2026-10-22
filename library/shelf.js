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
      "a junior studying data science & linguistics @ uc berkeley. i like acronyms, idioms, heytea cloud jasmine, and [math tournaments](https://berkeley.mt)!",
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

  // cards that open from things on the board, laid out like the fyi card (same heading / text format as about)
  boardCards: {
    receipt: {
      heading: "receipts of the past",
      text: [
        "so what's on this shelf? it's all for your information, a synthesis of media i think changed me and i'd recommend to someone else. i wrote all the synposes and comments (without ai btw) so i hope you enjoy browsing. :P",
      ],
    },
  },

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
      spine: "library/photo/spines/east-of-eden.png",
      author: "john steinbeck",
      status: "finished",
      rating: "",
      genre: "family saga",
      pages: 611,
      cover: "library/photo/covers/east-of-eden.jpg",
      quote: "And this I believe: that the free, exploring mind of the individual human is the most valuable thing in the world.",
      synopsis: "the story of cain and abel told across 3 generations in salinas valley, with the fundamental lesson that who you become is not preordained",
      thoughts: "",
      whyRead: "junior yr English summer reading",
      reread: "this was such a thick book tbh but it was so rewarding. watching the biblical allegory unfold but allude to a better ending; the dramatic plotline, dramatic irony, and dramatic settings made 600 pages feel like nothing tbh.",
    },
    {
      type: "book",
      title: "lolita",
      spine: "library/photo/spines/lolita.jpg",
      height: 19.5,
      author: "vladimir nabokov",
      status: "finished",
      rating: "",
      genre: "literary fiction",
      pages: 336,
      cover: "library/photo/covers/lolita.jpg",
      quote: "lolita, light of my life, fire of my loins.",
      synopsis: "an unreliable and deeply unsettling narrator depicts his love t",
      whyRead: "loins is a funny word",
      reread: "i really like how disturbed i feel reading this book. the decadence and beauty of nabokov's words are so purposefully opulent you could almost forget humbert humbert's crimes.",
      thoughts: "",
    },
    {
      type: "book",
      title: "white nights",
      spine: "library/photo/spines/white-nights.png",
      height: 21.5,
      author: "fyodor dostoevsky",
      status: "in progress",
      rating: "",
      genre: "psychological fiction",
      pages: 82,
      cover: "library/photo/covers/white-nights.jpg",
      quote: "It was a wonderful night, such a night as is only possible when we are young, dear reader.",
      synopsis: "romance 101",
      whyRead: "",
      reread: "",
      thoughts: "",
    },
    {
      type: "book",
      title: "schoolgirl",
      spine: "library/photo/spines/schoolgirl.png",
      author: "osamu dazai",
      status: "finished",
      rating: "",
      genre: "japanese literary fiction",
      pages: 103,
      cover: "library/photo/covers/schoolgirl.jpg",
      quote: "",
      synopsis: "the struggle against a society told from the eyes of the Tokyo schoolgirl in post-war Japan",
      thoughts: "",
      whyRead: "i'm also just a girl",
      reread: "articulates the inner turmoil of depression, grief, joy, and isolation to transform a very mundane story into a worthwhile emotional rollercoaster.",
    },
    {
      type: "book",
      title: "james and the giant peach",
      spine: "library/photo/spines/james-and-the-giant-peach.png",
      author: "roald dahl",
      status: "",
      rating: "",
      genre: "children's fantasy",
      pages: 144,
      cover: "library/photo/covers/james-and-the-giant-peach.png",
      quote: "",
      synopsis: "james goes on a wonderful adventure in a giant peach with a crew of giant bugs. they search for the meaning of life and defeat evil aunts with the power of friendship and vitamin c.",
      thoughts: "",
      whyRead: "4th grade reading groups",
      reread: "whimsy and joy and merriment and wonder and absurdity",
    },
    {
      type: "book",
      title: "the awakening",
      spine: "library/photo/spines/the-awakening.png",
      author: "kate chopin",
      status: "",
      rating: "",
      genre: "feminist historical fiction",
      pages: 195,
      cover: "library/photo/covers/the-awakening.jpg",
      quote: "",
      synopsis: "edna pontellier's search for free will and love in her otherwise stifling marriage and suffocating societal duties.",
      thoughts: "",
      whyRead: "AP literature required reading",
      reread: "she cheats her partner and cheats on the new guy too, but actually that's extremely okay and edna isn't in the wrong here so let's talk about it. also i really like oceanic catharsis.",
    },
    {
      type: "book",
      title: "anna karenina",
      spine: "library/photo/spines/anna-karenina.png",
      author: "leo tolstoy",
      status: "finished",
      rating: "",
      genre: "romance, historical fiction",
      pages: 895,
      cover: "library/photo/covers/anna-karenina.jpg",
      quote: "I’ve always loved you, and when you love someone, you love the whole person, just as they are, and not as you would like them to be.",
      synopsis: "asf",
      thoughts: "",
      whyRead: "barnes & nobles was having a christmas sale on a fancy hardback version",
      reread: "it's a long, thick book, but it's just so interesting—you're a spectator in this grand, tumultuous dramatic affair, and you definitely have opinions on who should receive sympathy versus not. but it's not about picking sides or morally aligning with one person's actions, it's just about spectating and understanding human fallacy."
    },
    {
      type: "manga",
      title: "haikyu!!",
      spine: "library/photo/spines/haikyu.png",
      author: "haruichi furudate",
      status: "memorized",
      rating: "",
      genre: "sports",
      height: 19,
      volumes: 45,
      cover: "library/photo/covers/haikyu.jpg",
      quote: "he who climbs a ladder must begin at the bottom.",
      synopsis: "a story not just about volleyball, but about life: the different ways you can face it and make it your own.",
      thoughts: "",
      whyRead: "#kagehina4life",
      reread: "the greatest manga to ever be written and illustrated. if society read the whole series back to front, the self help book industry would go bankrupt.",
    },
    {
      type: "manga",
      title: "bungo stray dogs",
      spine: "library/photo/spines/bungo-stray-dogs.png",
      author: "kafka asagiri & sango harukawa",
      status: "finished",
      rating: "",
      genre: "supernatural action",
      height: 19,
      volumes: 28,
      cover: "library/photo/covers/bungo-stray-dogs.jpg",
      quote: "",
      synopsis: "an action-based plotline that explores moral ambiguity and loneliness, ft. ragtag teams of characters named after sensational classic authors and their works.",
      thoughts: "",
      whyRead: "haha ",
      reread: "to celebrate the unfinished and largely depressive lives of infamous authors, but give them a second chance to find each other this time.",
    },
    {
      type: "cd",
      title: "TOMMY CANDY SHOP SUGAR ME",
      spine: "library/photo/spines/tommy-candy-shop-sugar-me.png",
      artist: "Tommy february6",
      status: "",
      rating: "",
      year: 2013,
      genre: "j-pop",
      songs: 10,
      favorite: "SUMMER BUBBLES",
      cover: "library/photo/covers/tommy-candy-shop-sugar-me.png",
      tracklist: [
        "FAIRY DUST",
        "SUGAR ME",
        "RUNAWAY",
        "ANGEL FADE", 
        "SPACE COWGIRL", 
        "PINK ARMY", 
        "愛の愛の星",
        "MY VACATION", 
        "SUMMER BUBBLES", 
        "BE MY VALENTINE", 
      ],
      thoughts: "",
      recommend: "",
    },
    {
      type: "cd",
      title: "This is PATEKO",
      spine: "library/photo/spines/this-is-pateko.png",
      artist: "PATEKO",
      status: "",
      rating: "",
      year: "",
      genre: "k-pop, krnb",
      songs: 7,
      favorite: "Think About You",
      quote: "",
      cover: "library/photo/covers/this-is-pateko.jpg",
      tracklist: [
        "OHAYO MY NIGHT",
        "Rainy day (ft. ASH ISLAND, Skinny Brown)",
        "Think About You",
        "One Small Day",  
        "It's Gone", 
        "So painful", 
        "teachmehowtoloveyou",
      ],
      thoughts: "",
      recommend: "",
    },
    {
      type: "cd",
      title: "i might be able to talk about it more",
      spine: "library/photo/spines/i-might-be-able-to-talk-about-it-more.png",
      artist: "several",
      status: "",
      rating: "",
      year: 2026,
      genre: "several",
      songs: 13,
      favorite: "",
      quote: "",
      cover: "library/photo/covers/i-might-be-able-to-talk-about-it-more.jpg",
      tracklist: [
        "eight by IU, prod./ft. SUGA",
        "summertime sadness by lana del ray", 
        "phải lòng anh (dream ver.) by MIN",
        "line without a hook by ricky montegomery", 
        "cruel summer by taylor swift", 
        "feather by sabrina carpenter",
        "wallflower by twice",
        "she looks so perfect by 5SOS",
        "PONPONPON by kyary pamyu pamyu",
        "remember when by chris wallace", 
        "wanna be her by june", 
        "月亮代表我的心 by teresa teng", 
        "impacto by enjambre, denise gutierrez",
      ],
      thoughts: "a cd burned for me by my best friend",
      recommend: "",
    }
  ],
};
