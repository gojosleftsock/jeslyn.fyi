// my shelf. to add something, copy a { ... } block below, paste it into the list, and fill it in.
// things show up on the shelf in the same order as this list.
//
// books:
//   status  -> "read", "reading" (gets a bookmark), or "to-read" (goes on the to-read shelf)
//   cover   -> optional. an image url or an open library cover id. leave it out to look it up automatically
//   genre, pages, words, rating (1-5), quote (shown on hover), synopsis, thoughts, recommend
//
// cds: same idea, plus  type: "cd"
//   status  -> "listened", "listening" (the disc peeks out), or "to-listen" (goes on the to-read shelf)
//   cover   -> optional. an image url. leave it out to look up the album art automatically
//   artist, year, genre, tracks, favorite (track), rating, quote (a lyric, shown on hover), thoughts, recommend
//
// anything you don't have, just leave out.
window.LIBRARY = {
  // where the "recommend a book" button sends things:
  //   web3formsKey -> a free key from web3forms.com. recommendations get emailed to you and visitors stay on the page
  //   email        -> used when there's no key: "send it" opens the visitor's email app, addressed to you
  recommendTo: { web3formsKey: "", email: "jesnguyen910@gmail.com" },

  // the about-me card that opens when you click the bookend at the left end of the shelf.
  // each string in text is its own paragraph.
  // use [text](url) in text to make a link; links with an empty href are hidden.
  about: {
    heading: "hi, i'm jeslyn",
    text: [
      "a junior studying data science & linguistics @ uc berkeley. i like acronyms, idioms, heytea cloud jasmine, and [math tournaments](https://berkeley.mt).",
    ],
    links: [
      { label: "github", href: "https://github.com/gojosleftsock" },
      { label: "linkedin", href: "https://www.linkedin.com/in/jeslyn-nguyen/" },
      { label: "instagram", href: "https://www.instagram.com/jeslynnguyen_/" },
    ],
  },

  shelf: [
    {
      title: "brave new world",
      spine: "library/photo/spines/brave-new-world.jpg",
      height: 18,
      author: "aldous huxley",
      status: "read",
      genre: "dystopian fiction",
      pages: 311,
      words: 64531,
      cover: 8231823,
      quote: "i don't want comfort. i want poetry, i want real danger, i want freedom.",
      synopsis: "a world engineered for stability through conditioning, consumption, and a drug called soma — until a few people start to feel the cost of frictionless happiness.",
      recommend: "anyone who's ever wondered whether comfort and freedom can actually coexist.",
    },
    {
      // placeholder cd: swap in your own
      type: "cd",
      title: "in rainbows",
      artist: "radiohead",
      status: "listened",
      year: 2007,
      genre: "alternative",
      tracks: 10,
      favorite: "weird fishes/arpeggi",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/dd/50/c7/dd50c790-99ac-d3d0-5ab8-e3891fb8fd52/634904032463.png/600x600bb.jpg",
    },
    {
      title: "lolita",
      spine: "library/photo/spines/lolita.jpg",
      height: 19.5,
      author: "vladimir nabokov",
      status: "read",
      genre: "literary fiction",
      pages: 336,
      words: 112473,
      cover: 12984540,
      quote: "lolita, light of my life, fire of my loins.",
      synopsis: "an unreliable narrator's confession that dazzles with language while describing something monstrous — a novel about obsession, self-deception, and the seductiveness of prose.",
      recommend: "readers who want to argue with a narrator on every single page.",
    },
    {
      title: "crime and punishment",
      spine: "library/photo/spines/crime-and-punishment.jpg",
      height: 21.5,
      author: "fyodor dostoevsky",
      status: "read",
      genre: "psychological fiction",
      pages: 671,
      words: 211591,
      cover: 13116014,
      quote: "to go wrong in one's own way is better than to go right in someone else's.",
      synopsis: "a destitute ex-student talks himself into a murder, then spends the rest of the book unraveling under the weight of his own conscience.",
      recommend: "anyone drawn to guilt, redemption, and long feverish walks through the city.",
    },
    {
      // placeholder cd: swap in your own
      type: "cd",
      title: "sos",
      artist: "sza",
      status: "listening",
      year: 2022,
      genre: "r&b",
      tracks: 23,
      favorite: "snooze",
    },
    {
      // placeholder cd: swap in your own
      type: "cd",
      title: "ok computer",
      artist: "radiohead",
      status: "listened",
      year: 1997,
      genre: "alternative",
      tracks: 12,
    },
  ],
};
