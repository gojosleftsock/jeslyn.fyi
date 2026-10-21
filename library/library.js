// draws the shelf from library/shelf.js. you shouldn't need to edit this file to add books or cds.
(() => {
  const { shelf, books = [] } = window.LIBRARY || {};
  const items = shelf || books;
  const $ = (id) => document.getElementById(id);
  const COLORS = ["#5b2a55", "#2f3e46", "#7a4b3a", "#3d5a40", "#8a6d3b", "#4a4e69", "#6b2d2d", "#1f3b4d", "#9c6b7a", "#3a3a3a"];
  const STATUS = {
    read: "finished", reading: "reading now", "to-read": "to read",
    listened: "in my collection", listening: "on repeat", "to-listen": "to listen",
  };
  const QUEUE = new Set(["to-read", "to-listen"]);
  const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCd = (it) => it.type === "cd";
  const by = (it) => it.artist || it.author || "";
  const status = (it) => it.status || (isCd(it) ? "listened" : "read");
  const norm = (s) => String(s || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

  // book covers: an image url or an open library cover id. album art: an image url.
  // anything without a cover gets looked up once and remembered in this browser.
  const PX = { M: 300, L: 600 };
  function artUrl(it, size) {
    if (isCd(it)) {
      const u = typeof it.cover === "string" && it.cover ? it.cover : it._art;
      return u ? u.replace(/\/\d+x\d+bb\./, `/${PX[size]}x${PX[size]}bb.`) : "";
    }
    if (typeof it.cover === "string" && it.cover) return it.cover;
    const id = typeof it.cover === "number" ? it.cover : it._cover;
    return id ? `https://covers.openlibrary.org/b/id/${id}-${size}.jpg` : "";
  }

  async function remembered(key, find) {
    const cached = localStorage.getItem(key);
    if (cached !== null) return cached;
    try {
      const found = (await find()) || "";
      localStorage.setItem(key, found);
      return found;
    } catch {
      return "";
    }
  }

  const findBookCover = (b) => remembered(`lib-cover:${b.title}|${b.author}`, async () => {
    const q = new URLSearchParams({ title: b.title, author: b.author || "", limit: "5", fields: "cover_i" });
    const doc = (await (await fetch(`https://openlibrary.org/search.json?${q}`)).json()).docs.find((d) => d.cover_i);
    return doc && String(doc.cover_i);
  });

  const findAlbumArt = (c) => remembered(`lib-art:${c.title}|${c.artist}`, async () => {
    const q = new URLSearchParams({ term: `${c.title} ${c.artist || ""}`, entity: "album", limit: "15" });
    const results = (await (await fetch(`https://itunes.apple.com/search?${q}`)).json()).results || [];
    const t = norm(c.title);
    const a = norm(c.artist);
    const artistOk = (r) => !a || norm(r.artistName).includes(a) || a.includes(norm(r.artistName));
    const r = results.find((r) => artistOk(r) && norm(r.collectionName) === t)
      || results.find((r) => artistOk(r) && norm(r.collectionName).startsWith(t));
    return r && r.artworkUrl100;
  });

  async function lookup(it) {
    if (isCd(it)) it._art = await findAlbumArt(it);
    else it._cover = Number(await findBookCover(it)) || null;
  }

  // ---------- shelves ----------
  // books are little css 3d boxes: a spine facing you, a cover face behind it, and the page tops.
  // a few are turned so you can see their cover.
  const sin = (deg) => Math.sin((Math.abs(deg) * Math.PI) / 180);
  function makeBook(b, h) {
    const el = document.createElement("button");
    el.className = "bk" + (status(b) === "reading" ? " bk--reading" : "");
    const height = 190 + (h % 50);
    const depth = Math.round(height * 0.66);
    const ry = h % 6 === 0 ? -(20 + (h % 9)) : (h % 31) / 10 - 1.5;
    el.style.setProperty("--w", `${Math.round(Math.min(48, Math.max(22, (b.pages || 300) / 12)))}px`);
    el.style.setProperty("--h", `${height}px`);
    el.style.setProperty("--d", `${depth}px`);
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    el.style.setProperty("--gap", `${Math.round(depth * sin(ry) * 0.9)}px`);
    if (h % 7 === 0) el.style.setProperty("--rz", h % 2 ? "1.5deg" : "-1.5deg");
    el.innerHTML = '<span class="bk-3d"><span class="bk-spine"><img alt="" draggable="false" hidden /><span class="bk-band"></span><span class="bk-band bk-band--low"></span><span class="bk-title"></span><span class="bk-author"></span></span><span class="bk-cover"><img alt="" draggable="false" hidden /></span><span class="bk-top"></span></span>';
    el.querySelector(".bk-title").textContent = b.title;
    el.querySelector(".bk-author").textContent = by(b).split(" ").pop();
    return el;
  }

  // cds stand spine-out like the books; hovering swings the case round to show the cover
  function makeCd(c, h) {
    const el = document.createElement("button");
    el.className = "cd" + (status(c) === "listening" ? " cd--playing" : "");
    el.style.setProperty("--ry", `${((h % 41) / 10 - 2).toFixed(2)}deg`);
    if (h % 5 === 0) el.style.setProperty("--lean", h % 2 ? "2deg" : "-2deg");
    el.innerHTML = '<span class="cd-case"><span class="cd-spine"><img alt="" draggable="false" hidden /><span class="cd-name"></span></span><span class="cd-top"></span></span><span class="cd-pop"><span class="cd-disc"></span><span class="cd-front"><img alt="" draggable="false" hidden /><span class="cd-plain"></span></span></span>';
    el.querySelector(".cd-name").textContent = `${c.title} \u00b7 ${by(c)}`;
    el.querySelector(".cd-plain").textContent = `${c.title} \u00b7 ${by(c)}`;
    return el;
  }

  const spines = items.map((it, i) => {
    const h = hash(it.title);
    const el = isCd(it) ? makeCd(it, h) : makeBook(it, h);
    el.type = "button";
    el.setAttribute("aria-label", `${it.title} by ${by(it)}`);
    el.style.setProperty("--c", it.color || COLORS[h % COLORS.length]);
    const imgs = [...el.querySelectorAll("img")];
    for (const img of imgs) img.onload = () => { img.hidden = false; el.classList.add("has-art"); };
    const setImg = () => { const u = artUrl(it, "M"); if (u) for (const img of imgs) img.src = u; };
    if (artUrl(it, "M")) setImg();
    else lookup(it).then(setImg);
    el.addEventListener("click", () => open(i));
    el.addEventListener("mouseenter", () => showNow(it));
    el.addEventListener("focus", () => showNow(it));
    el.addEventListener("mouseleave", () => showNow(null));
    el.addEventListener("blur", () => showNow(null));
    (QUEUE.has(status(it)) ? $("shelfToRead") : $("shelfRead")).append(el);
    return el;
  });

  const DEFAULT_NOW = "hover over something for a quote, click it for my thoughts";
  function showNow(it) {
    const now = $("libNow");
    if (!it) now.textContent = DEFAULT_NOW;
    else if (it.quote) now.textContent = `\u201c${it.quote}\u201d \u2014 ${it.title}`;
    else if (it.favorite) now.textContent = `\u266a ${it.favorite} \u2014 ${it.title}`;
    else now.textContent = `${it.title} \u00b7 ${by(it)}`;
  }
  showNow(null);

  const count = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const tally = (list, bookWord) => {
    const cds = list.filter(isCd).length;
    return [list.length - cds && count(list.length - cds, bookWord), cds && count(cds, "cd")].filter(Boolean).join(" \u00b7 ");
  };
  const queue = items.filter((it) => QUEUE.has(status(it)));
  $("toReadCount").textContent = tally(queue, "book");

  // ---------- search + filters ----------
  let kind = "all";
  let genre = "all";
  function chips(box, options, pick) {
    for (const value of options) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "lib-chip";
      chip.textContent = value;
      chip.setAttribute("aria-pressed", value === "all");
      chip.addEventListener("click", () => {
        pick(value);
        for (const c of box.children) c.setAttribute("aria-pressed", c === chip);
        filter();
      });
      box.append(chip);
    }
  }
  const hasCds = items.some(isCd);
  if (hasCds && items.some((it) => !isCd(it))) {
    chips($("libKinds"), ["all", "books", "cds"], (v) => (kind = v));
    $("libKinds").hidden = false;
  }
  chips($("libFilters"), ["all", ...new Set(items.map((it) => it.genre).filter(Boolean).sort())], (v) => (genre = v));
  $("libSearch").addEventListener("input", filter);

  const visible = () => items.map((_, i) => i).filter((i) => !spines[i].hidden);
  function filter() {
    const q = norm($("libSearch").value);
    items.forEach((it, i) => {
      const kindOk = kind === "all" || (kind === "cds") === isCd(it);
      const text = norm(`${it.title} ${by(it)} ${it.genre || ""} ${it.favorite || ""}`);
      spines[i].hidden = !(kindOk && (genre === "all" || it.genre === genre) && text.includes(q));
    });
    const shown = (shelf) => [...shelf.children].some((el) => !el.hidden);
    $("shelfRead").hidden = !shown($("shelfRead"));
    $("toReadSection").hidden = !shown($("shelfToRead"));
    $("libEmpty").hidden = visible().length > 0;
  }
  filter();

  // ---------- open book / cd ----------
  let current = -1;
  function open(i) {
    current = i;
    const it = items[i];
    const cd = isCd(it);
    const big = artUrl(it, "L");
    $("libArt").classList.toggle("lib-art--cd", cd);
    $("libArt").classList.toggle("lib-art--playing", status(it) === "listening");
    $("libCover").style.setProperty("--c", spines[i].style.getPropertyValue("--c"));
    $("libCover").classList.toggle("lib-cover--plain", !big);
    $("libCoverImg").src = big || "";
    $("libCoverImg").hidden = !big;
    $("libCoverTitle").textContent = it.title;
    $("libStatus").textContent = `${cd ? "liner notes" : "library card"} \u00b7 ${STATUS[status(it)] || status(it)}`;
    $("libTitle").textContent = it.title;
    $("libAuthor").textContent = by(it);
    $("libQuote").textContent = it.quote ? `\u201c${it.quote}\u201d` : "";
    $("libQuote").hidden = !it.quote;

    const stars = it.rating && "\u2605".repeat(it.rating) + "\u2606".repeat(5 - it.rating);
    const rows = (cd
      ? [["my rating", stars], ["year", it.year], ["genre", it.genre], ["tracks", it.tracks], ["favorite track", it.favorite]]
      : [["my rating", stars], ["genre", it.genre], ["page count", it.pages && it.pages.toLocaleString()], ["word count", it.words && it.words.toLocaleString()]]
    ).filter(([, v]) => v);
    $("libMeta").replaceChildren(...rows.map(([k, v]) => {
      const row = document.createElement("div");
      row.className = "lib-row";
      row.innerHTML = "<dt></dt><dd></dd>";
      row.firstChild.textContent = k;
      row.lastChild.textContent = v;
      return row;
    }));

    const sections = [["synopsis", it.synopsis], ["my thoughts", it.thoughts], ["recommended for", it.recommend]].filter(([, v]) => v);
    $("libDetail").replaceChildren(...sections.flatMap(([k, v]) => {
      const h = document.createElement("h4");
      const p = document.createElement("p");
      h.textContent = k;
      p.textContent = v;
      return [h, p];
    }));
    $("libDetail").hidden = !sections.length;

    const list = visible();
    $("libPrev").disabled = list.length < 2;
    $("libNext").disabled = list.length < 2;
    $("overlay").hidden = false;
    document.body.classList.add("lib-locked");
    $("libClose").focus();
  }

  function step(d) {
    const list = visible();
    const at = list.indexOf(current);
    if (list.length > 1) open(list[(at + d + list.length) % list.length]);
  }

  function close() {
    if ($("overlay").hidden) return;
    $("overlay").hidden = true;
    document.body.classList.remove("lib-locked");
    spines[current]?.focus();
  }

  $("libClose").addEventListener("click", close);
  $("libPrev").addEventListener("click", () => step(-1));
  $("libNext").addEventListener("click", () => step(1));
  $("overlay").addEventListener("click", (e) => { if (e.target === $("overlay")) close(); });
  document.addEventListener("keydown", (e) => {
    if ($("overlay").hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  // ---------- typed heading ----------
  const heading = $("libHeading");
  const text = heading.textContent;
  heading.setAttribute("aria-label", text);
  if (!reduceMotion) {
    heading.textContent = "";
    const ghost = document.createElement("span");
    ghost.className = "lib-ghost";
    ghost.textContent = text;
    const typed = document.createElement("span");
    typed.className = "lib-typed";
    heading.append(ghost, typed);
    for (const s of heading.children) s.setAttribute("aria-hidden", "true");
    let n = 0;
    const tick = () => {
      typed.textContent = text.slice(0, ++n);
      if (n < text.length) setTimeout(tick, 38);
    };
    setTimeout(tick, 250);
  }
})();
