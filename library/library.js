// draws the shelf from library/shelf.js. you shouldn't need to edit this file to add books or cds.
(() => {
  const { shelf, books = [], about, board = {}, boardCards = {} } = window.LIBRARY || {};
  const items = shelf || books;
  const $ = (id) => document.getElementById(id);
  const COLORS = ["#3d5226", "#5a7340", "#2b3a1a", "#6b6a4f", "#8a7f68", "#4a5a3a", "#2f3328", "#7a8a5e", "#5c5144", "#1e211a"];
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
  // sizes are in centimetres. books use a photo of their spine if they have one (spine: in shelf.js),
  // otherwise they get a cloth-bound spine in their colour.
  function makeBook(b, h) {
    const el = document.createElement("button");
    el.className = "bk" + (status(b) === "reading" ? " bk--reading" : "");
    const tall = b.height || 18 + (h % 50) / 10;
    el.style.setProperty("--h", tall);
    const pageCount = b.pages || (b.type === "manga" ? 192 : 300);
    el.style.setProperty("--w", Math.min(5, Math.max(1.6, pageCount * 0.0065 + 0.4)).toFixed(2));
    if (h % 5 === 0) el.style.setProperty("--lean", h % 2 ? "1.2deg" : "-1.2deg");
    el.innerHTML = '<span class="bk-body"><span class="bk-cloth"><span class="bk-title"></span><span class="bk-author"></span></span><img class="bk-photo" alt="" draggable="false" hidden /></span>'
      + (status(b) === "reading" ? '<span class="bk-ribbon"></span>' : "");
    el.querySelector(".bk-title").textContent = b.title;
    el.querySelector(".bk-author").textContent = by(b).split(" ").pop();
    if (b.spine) {
      const img = el.querySelector(".bk-photo");
      img.onload = () => {
        img.hidden = false;
        el.classList.add("has-photo");
        el.style.setProperty("--w", ((tall * img.naturalWidth) / img.naturalHeight).toFixed(2));
      };
      img.src = b.spine;
    }
    return el;
  }

  // cds stand spine-out like the books
  function makeCd(c, h) {
    const el = document.createElement("button");
    el.className = "cd" + (status(c) === "listening" ? " cd--playing" : "");
    if (h % 3 === 0) el.style.setProperty("--lean", h % 2 ? "0.8deg" : "-0.8deg");
    // the art stays hidden on the shelf; it's only loaded to colour the spine and shows in the card
    el.innerHTML = '<span class="cd-body"><span class="cd-name"></span><img class="cd-photo" alt="" draggable="false" hidden /></span><img class="art" alt="" hidden />';
    el.querySelector(".cd-name").textContent = c.title;
    if (c.spine) {
      const img = el.querySelector(".cd-photo");
      img.onload = () => {
        img.hidden = false;
        el.classList.add("has-photo");
        el.style.setProperty("--cw", ((12.4 * img.naturalWidth) / img.naturalHeight).toFixed(2));
      };
      img.src = c.spine;
    }
    return el;
  }

  // a cd's spine is printed in the album's main colour, so take the most common colour in the art
  function tint(el, src) {
    const pic = new Image();
    pic.crossOrigin = "anonymous";
    pic.onload = () => {
      try {
        const cv = document.createElement("canvas");
        cv.width = cv.height = 16;
        const g = cv.getContext("2d");
        g.drawImage(pic, 0, 0, 16, 16);
        const d = g.getImageData(0, 0, 16, 16).data;
        const buckets = new Map();
        for (let i = 0; i < d.length; i += 4) {
          const key = (d[i] >> 5) * 64 + (d[i + 1] >> 5) * 8 + (d[i + 2] >> 5);
          const s = buckets.get(key) || [0, 0, 0, 0];
          s[0] += d[i]; s[1] += d[i + 1]; s[2] += d[i + 2]; s[3]++;
          buckets.set(key, s);
        }
        const [r, gr, b, n] = [...buckets.values()].sort((x, y) => y[3] - x[3])[0];
        const [R, G, B] = [r / n, gr / n, b / n].map(Math.round);
        el.style.setProperty("--c", `rgb(${R}, ${G}, ${B})`);
        el.classList.toggle("cd--light", 0.299 * R + 0.587 * G + 0.114 * B > 150);
      } catch {
        // art from a site that doesn't allow this keeps the default colour
      }
    };
    pic.src = src;
  }

  const spines = items.map((it, i) => {
    const h = hash(it.title);
    const el = isCd(it) ? makeCd(it, h) : makeBook(it, h);
    el.type = "button";
    el.setAttribute("aria-label", `${it.title} by ${by(it)}`);
    el.style.setProperty("--c", it.color || COLORS[h % COLORS.length]);
    const imgs = [...el.querySelectorAll("img.art")];
    for (const img of imgs) img.onload = () => { img.hidden = false; el.classList.add("has-art"); if (isCd(it) && !it.color) tint(el, img.src); };
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

  // each cd's title shrinks until it fits its spine (sizes are in cqw, so the ratio holds at any width)
  function fitCdNames() {
    for (const n of document.querySelectorAll(".cd-name")) {
      n.style.removeProperty("--fit");
      if (n.clientHeight && n.scrollHeight > n.clientHeight) n.style.setProperty("--fit", (n.clientHeight / n.scrollHeight * 0.98).toFixed(3));
    }
  }
  document.fonts.ready.then(fitCdNames);
  addEventListener("resize", fitCdNames);

  // ---------- bulletin board (hung on the wall above the shelf) + about card ----------
  const bookend = document.createElement("button");
  bookend.type = "button";
  bookend.className = "board";
  bookend.setAttribute("aria-label", "about me");
  // each pinned thing: where it sits (% of the board), its tilt, and the point it pivots on (its tack or clip)
  const PINS = [
    { id: "rain", src: "rain.jpg", left: 8.695, top: 8.109, width: 44, tilt: 3, pivot: "50% 6%", tack: [30.7, 10.44], say: "be not defeated by the rain" },
    { id: "receipt", src: "receipt.png", left: 53.187, top: 49.374, width: 40.647, tilt: -4, pivot: "50% 10%", tack: [73.51, 53.37] },
    { id: "note", src: "note.png", left: 5.196, top: 56.452, width: 43.88, tilt: -3, pivot: "12.5% 14.6%" },
  ];
  bookend.innerHTML = '<span class="bb"><img src="library/photo/board/cork.jpg" alt="" draggable="false" />' +
    PINS.map((p) => `<span class="pin pin-${p.id}" data-pin="${p.id}" style="left:${p.left}%;top:${p.top}%;width:${p.width}%;` +
      `transform-origin:${p.pivot};--tilt:${p.tilt}deg"><img src="library/photo/board/${p.src}" alt="" draggable="false" /></span>` +
      (p.tack ? `<i class="tack" style="left:${p.tack[0]}%;top:${p.tack[1]}%"></i>` : "")).join("") + "</span>";
  $("shelfRead").before(bookend);

  // first visit: outline the note and point at it until the about card has been opened from the board once
  const HINT_KEY = "jf-board-hint-done";
  let hint = false;
  try { hint = !localStorage.getItem(HINT_KEY); } catch {}
  if (hint) {
    bookend.classList.add("hint");
    bookend.insertAdjacentHTML("beforeend", '<svg class="hint-call" viewBox="0 0 866 620" aria-hidden="true">' +
      '<path class="hint-line" pathLength="1" d="M470 238 C380 186 262 206 220 326" />' +
      '<path class="hint-head" d="M236.6 311.7 L220 326 L216 304.5" />' +
      '<text x="482" y="250">click me!</text></svg>');
  }
  function endHint() {
    if (!hint) return;
    hint = false;
    bookend.classList.remove("hint");
    bookend.querySelector(".hint-call")?.remove();
    try { localStorage.setItem(HINT_KEY, "1"); } catch {}
  }

  // ---------- standing calendar at the left end of the shelf ----------
  // calendar.png is a photo with its printed page blanked out; the current month is laid onto
  // that page (the photo has been straightened to face the front). CAL_PAGE is the page's corners (top left, top right, bottom right,
  // bottom left) as a percentage of the photo. The page is laid out at the photo's own pixel size (673 x 664).
  const CAL_PAGE = [[4.67, 7.93], [95.33, 7.93], [95.33, 86.01], [4.67, 86.01]];
  function squareTo([x0, y0], [x1, y1], [x2, y2], [x3, y3], w, h) {
    const sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
    const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2, det = dx1 * dy2 - dx2 * dy1;
    const g = (sx * dy2 - dx2 * sy) / det, k = (dx1 * sy - sx * dy1) / det;
    const a = x1 - x0 + g * x1, b = x3 - x0 + k * x3, d = y1 - y0 + g * y1, e = y3 - y0 + k * y3;
    return `matrix3d(${a / w},${d / w},0,${g / w},${b / h},${e / h},0,${k / h},0,0,1,0,${x0},${y0},0,1)`;
  }
  function makeCalendar(now = new Date()) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "cal";
    el.setAttribute("aria-label", "this week");
    el.innerHTML = '<img src="library/photo/calendar.png?v=5" alt="" draggable="false" /><div class="cal-page"></div>';
    const y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
    const lead = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
    const cells = [...Array(lead).fill(""), ...Array.from({ length: days }, (_, i) => i + 1)];
    const cls = (d, i) => [i % 7 === 6 && "sun", d === today && "today"].filter(Boolean).join(" ");
    const page = el.querySelector(".cal-page");
    page.innerHTML = `<span class="cal-num">${m + 1}</span><span class="cal-year">${y}</span>` +
      `<span class="cal-days">${[..."MTWTFSS"].map((d, i) => `<span class="${cls(0, i)}">${d}</span>`).join("")}</span>` +
      `<span class="cal-grid">${cells.map((d, i) => `<span class="${cls(d, i)}">${d}</span>`).join("")}</span>`;
    const fit = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (!w) return;
      const pts = CAL_PAGE.map(([px, py]) => [(px / 100) * w, (py / 100) * h]);
      page.style.transform = squareTo(...pts, page.offsetWidth, page.offsetHeight);
    };
    new ResizeObserver(fit).observe(el);
    return el;
  }
  const calendar = makeCalendar();
  $("shelfRead").prepend(calendar);
  calendar.addEventListener("mouseenter", () => { $("libNow").textContent = "want to talk? here's my schedule"; });
  calendar.addEventListener("focus", () => { $("libNow").textContent = "want to talk? here's my schedule"; });
  calendar.addEventListener("mouseleave", () => showNow(null));
  calendar.addEventListener("blur", () => showNow(null));

  let aboutFrom = bookend;
  const safeAboutHref = (value) => {
    try {
      const url = new URL(value);
      return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  };
  // overlays close by playing their opening backwards, then hide
  const overlayMotion = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.libStay = (overlay) => {
    clearTimeout(overlay.leaving);
    overlay.stopLeaving?.();
    overlay.classList.remove("lib-leaving");
    overlay.hidden = false;
  };
  window.libLeave = (overlay) => {
    if (overlay.hidden || overlay.classList.contains("lib-leaving")) return false;
    const finish = () => {
      overlay.stopLeaving?.();
      overlay.classList.remove("lib-leaving");
      overlay.hidden = true;
      if (!document.querySelector(".lib-overlay:not([hidden])")) document.body.classList.remove("lib-locked");
    };
    if (!overlayMotion) { finish(); return true; }
    overlay.classList.add("lib-leaving");
    // wait for the panel to finish sinking even on a slow device; the timer is only a fallback
    const onEnd = (e) => { if (e.animationName === "lib-sink") { clearTimeout(overlay.leaving); finish(); } };
    overlay.addEventListener("animationend", onEnd);
    overlay.leaving = setTimeout(finish, 900);
    overlay.stopLeaving = () => overlay.removeEventListener("animationend", onEnd);
    return true;
  };

  function openAbout(e, card = about) {
    aboutFrom = e?.currentTarget || bookend;
    const { heading = "about me", text = [], links = [] } = card || {};
    $("aboutHeading").textContent = heading;
    const aboutText = $("aboutText");
    aboutText.replaceChildren(...[].concat(text).map((t) => {
      const content = String(t);
      const p = document.createElement("p");
      const pattern = /\[([^\]]+)\]\(([^)]*)\)/g;
      let lastIndex = 0;
      for (const match of content.matchAll(pattern)) {
        p.append(document.createTextNode(content.slice(lastIndex, match.index)));
        const href = safeAboutHref(match[2]);
        if (href) {
          const link = document.createElement("a");
          link.href = href;
          link.textContent = match[1];
          link.target = "_blank";
          link.rel = "noopener";
          p.append(link);
        } else {
          p.append(document.createTextNode(match[0]));
        }
        lastIndex = match.index + match[0].length;
      }
      p.append(document.createTextNode(content.slice(lastIndex)));
      return p;
    }));
    $("aboutOverlay").querySelector(".about-links")?.remove();
    const aboutLinks = document.createElement("div");
    aboutLinks.className = "about-links";
    for (const { label, href: target } of [].concat(links)) {
      if (!target?.trim()) continue;
      const href = safeAboutHref(target);
      if (!href) continue;
      const link = document.createElement("a");
      link.className = "lib-btn";
      link.href = href;
      link.textContent = label;
      link.target = "_blank";
      link.rel = "noopener";
      aboutLinks.append(link);
    }
    if (aboutLinks.childElementCount) aboutText.after(aboutLinks);
    libStay($("aboutOverlay"));
    document.body.classList.add("lib-locked");
    $("aboutClose").focus();
  }
  function closeAbout() {
    if (!libLeave($("aboutOverlay"))) return;
    aboutFrom.focus();
  }
  bookend.addEventListener("click", (e) => {
    const id = e.target.closest(".pin")?.dataset.pin;
    const href = board[id]?.trim();
    if (href) window.open(href, /^https?:/.test(href) ? "_blank" : "_self", "noopener");
    else {
      if (!boardCards[id]) endHint();
      openAbout(e, boardCards[id]);
    }
  });
  $("libAbout").addEventListener("click", (e) => openAbout(e));
  bookend.addEventListener("mouseover", (e) => {
    const pin = PINS.find((p) => p.id === e.target.closest(".pin")?.dataset.pin);
    $("libNow").textContent = pin?.say || boardCards[pin?.id]?.heading || "about me";
  });
  bookend.addEventListener("focus", () => { if (!bookend.matches(":hover")) $("libNow").textContent = "about me"; });
  bookend.addEventListener("mouseleave", () => showNow(null));
  bookend.addEventListener("blur", () => showNow(null));
  $("aboutClose").addEventListener("click", closeAbout);
  $("aboutOverlay").addEventListener("click", (e) => { if (e.target === $("aboutOverlay")) closeAbout(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAbout(); });

  const DEFAULT_NOW = "";
  function showNow(it) {
    const now = $("libNow");
    if (!it) now.textContent = DEFAULT_NOW;
    else now.textContent = by(it) && norm(by(it)) !== norm(it.title) ? `${it.title} \u00b7 ${by(it)}` : it.title;
  }
  showNow(null);

  const count = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const tally = (list, bookWord) => {
    const cds = list.filter(isCd).length;
    return [list.length - cds && count(list.length - cds, bookWord), cds && count(cds, "cd")].filter(Boolean).join(" \u00b7 ");
  };
  const queue = items.filter((it) => QUEUE.has(status(it)));
  $("toReadCount").textContent = tally(queue, "book");

  // ---------- shelves ----------
  const visible = () => items.map((_, i) => i).filter((i) => !spines[i].hidden);
  const shown = (shelf) => [...shelf.children].some((el) => !el.hidden && el !== calendar);
  $("shelfRead").hidden = !shown($("shelfRead")) && !bookend.isConnected;
  $("toReadSection").hidden = !shown($("shelfToRead"));
  $("libEmpty").hidden = visible().length > 0;

  // ---------- cd music: the disc peeks out when a cd opens; play slides it halfway out and spins it ----------
  const music = new Audio();
  music.preload = "none";
  const playBtn = document.createElement("button");
  playBtn.type = "button";
  playBtn.className = "lib-play";
  let fade = 0;
  function fadeTo(vol, ms, then) {
    cancelAnimationFrame(fade);
    const from = music.volume, t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, Math.max(0, (t - t0) / ms));
      music.volume = Math.min(1, Math.max(0, from + (vol - from) * k));
      if (k < 1) fade = requestAnimationFrame(tick);
      else then?.();
    };
    fade = requestAnimationFrame(tick);
  }
  function showPlaying(on) {
    $("libArt").classList.toggle("lib-art--music", on);
    playBtn.innerHTML = on
      ? '<svg viewBox="0 0 10 10" aria-hidden="true"><rect x="2" y="1.5" width="2.2" height="7" rx="0.4"/><rect x="5.8" y="1.5" width="2.2" height="7" rx="0.4"/></svg>'
      : '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1.4v7.2a.4.4 0 0 0 .6.35l5.6-3.6a.4.4 0 0 0 0-.7L3.6 1.05A.4.4 0 0 0 3 1.4z"/></svg>';
    playBtn.setAttribute("aria-label", on ? "pause the song" : "play the song");
  }
  function playMusic() {
    const it = items[current];
    if (!it?.audio) return;
    const src = new URL(it.audio, document.baseURI).href;
    if (music.src !== src) music.src = src;
    music.volume = 0;
    $("libArt").classList.add("lib-art--out");
    showPlaying(true);
    music.play().then(() => fadeTo(0.7, 700)).catch(() => showPlaying(false));
  }
  function pauseMusic(ms = 300) {
    showPlaying(false);
    if (music.paused) return;
    fadeTo(0, ms, () => music.pause());
  }
  function stopMusic() {
    cancelAnimationFrame(fade);
    music.pause();
    if (music.src) music.currentTime = 0;
    $("libArt").classList.remove("lib-art--out");
    showPlaying(false);
  }
  playBtn.addEventListener("click", () => (music.paused || !$("libArt").classList.contains("lib-art--music") ? playMusic() : pauseMusic()));
  music.addEventListener("ended", () => { showPlaying(false); music.currentTime = 0; });
  document.addEventListener("visibilitychange", () => { if (document.hidden) pauseMusic(0); });

  // ---------- open book / cd ----------
  let current = -1;
  function open(i) {
    stopMusic();
    current = i;
    const it = items[i];
    const cd = isCd(it);
    const big = artUrl(it, "L");
    $("libArt").classList.toggle("lib-art--cd", cd);
    $("libArt").classList.toggle("lib-art--playing", status(it) === "listening");
    $("libCover").style.setProperty("--c", spines[i].style.getPropertyValue("--c"));
    $("libCover").classList.toggle("lib-cover--plain", !big);
    const coverImg = $("libCoverImg");
    coverImg.hidden = true;
    coverImg.onload = null;
    coverImg.onerror = null;
    if (big) {
      const coverSrc = new URL(big, document.baseURI).href;
      coverImg.onload = () => {
        if (coverImg.src !== coverSrc || coverImg.currentSrc !== coverSrc) return;
        coverImg.hidden = false;
        $("libCover").classList.remove("lib-cover--plain");
      };
      coverImg.onerror = () => {
        if (coverImg.src !== coverSrc) return;
        coverImg.hidden = true;
        $("libCover").classList.add("lib-cover--plain");
      };
      coverImg.src = big;
      if (coverImg.complete && coverImg.naturalWidth > 0 && coverImg.currentSrc === coverSrc) {
        coverImg.hidden = false;
        $("libCover").classList.remove("lib-cover--plain");
      }
    } else {
      coverImg.removeAttribute("src");
    }
    $("libCoverTitle").textContent = it.title;
    $("libStatus").textContent = `${cd ? "album" : "book card"} \u00b7 ${STATUS[status(it)] || status(it)}`;
    $("libTitle").textContent = it.title;
    $("libAuthor").textContent = by(it);
    $("libQuote").textContent = it.quote ? `\u201c${it.quote}\u201d` : "";
    $("libQuote").hidden = !it.quote;

    const stars = it.rating && "\u2605".repeat(it.rating) + "\u2606".repeat(5 - it.rating);
    const type = it.type || "book";
    const rows = (type === "cd"
      ? [["my rating", stars], ["year", it.year], ["genre", it.genre], ["song count", it.songs ?? it.tracks ?? it.tracklist?.length], ["favorite track", it.favorite || (it.audio ? " " : "")]]
      : type === "manga"
        ? [["my rating", stars], ["genre", it.genre], ["volume count", it.volumes]]
        : [["my rating", stars], ["genre", it.genre], ["page count", it.pages && it.pages.toLocaleString()]]
    ).filter(([, v]) => v);
    $("libMeta").replaceChildren(...rows.map(([k, v]) => {
      const row = document.createElement("div");
      row.className = "lib-row";
      row.innerHTML = "<dt></dt><dd></dd>";
      row.firstChild.textContent = k;
      row.lastChild.textContent = v.trim?.() ?? v;
      if (k === "favorite track" && cd && /^https?:\/\//.test(it.favoriteLink || "")) {
        const a = document.createElement("a");
        a.className = "lib-fav";
        a.href = it.favoriteLink;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = row.lastChild.textContent + " \u2197";
        row.lastChild.replaceChildren(a);
      }
      if (k === "favorite track" && cd && it.audio) row.lastChild.append(playBtn);
      return row;
    }));

    const sections = [cd ? ["track list", it.tracklist?.length && it.tracklist] : ["synopsis", it.synopsis], ["my thoughts", it.thoughts], ...(cd ? [["recommended for", it.recommend]] : [["why i read it", it.whyRead], ["why i'd reread it", it.reread]])].filter(([, v]) => v);
    $("libDetail").replaceChildren(...sections.flatMap(([k, v]) => {
      const h = document.createElement("h4");
      h.textContent = k;
      if (Array.isArray(v)) {
        const ul = document.createElement("ul");
        ul.className = "lib-tracks";
        ul.replaceChildren(...v.map((song) => Object.assign(document.createElement("li"), { textContent: song })));
        return [h, ul];
      }
      const p = document.createElement("p");
      p.textContent = v;
      return [h, p];
    }));
    $("libDetail").hidden = !sections.length;

    const list = visible();
    $("libPrev").disabled = list.length < 2;
    $("libNext").disabled = list.length < 2;
    libStay($("overlay"));
    document.body.classList.add("lib-locked");
    $("libClose").focus({ preventScroll: true });
    $("overlay").scrollTop = 0;
    $("overlay").querySelector(".lib-card").scrollTop = 0;

    const at = list.indexOf(i);
    if (list.length > 1 && at !== -1) {
      const neighbors = new Set([
        list[(at - 1 + list.length) % list.length],
        list[(at + 1) % list.length],
      ]);
      for (const neighbor of neighbors) {
        const src = artUrl(items[neighbor], "L");
        if (src) {
          const image = new Image();
          image.src = src;
        }
      }
    }
  }

  function step(d) {
    const list = visible();
    const at = list.indexOf(current);
    if (list.length > 1) open(list[(at + d + list.length) % list.length]);
  }

  function close() {
    if (!libLeave($("overlay"))) return;
    pauseMusic(400);
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
  let wheelDeltaX = 0;
  let wheelIgnoreUntil = 0;
  $("overlay").addEventListener("wheel", (e) => {
    if ($("overlay").hidden || Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Date.now() < wheelIgnoreUntil) return;
    wheelDeltaX += e.deltaX;
    if (Math.abs(wheelDeltaX) >= 60) {
      step(wheelDeltaX > 0 ? 1 : -1);
      wheelDeltaX = 0;
      wheelIgnoreUntil = Date.now() + 450;
    }
  }, { passive: true });
  let touchStart = null;
  $("overlay").addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    touchStart = $("overlay").hidden || !touch ? null : { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  $("overlay").addEventListener("touchend", (e) => {
    if ($("overlay").hidden || !touchStart) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) step(dx < 0 ? 1 : -1);
  }, { passive: true });
  $("overlay").addEventListener("touchcancel", () => { touchStart = null; }, { passive: true });

  // on narrow screens the room scrolls sideways; start with the shelf in view
  const scene = $("scene");
  const row = $("shelfRead");
  const last = row.lastElementChild;
  const left = Math.min(bookend.offsetLeft, row.offsetLeft + calendar.offsetLeft);
  const right = Math.max(bookend.offsetLeft + bookend.offsetWidth, row.offsetLeft + last.offsetLeft + last.offsetWidth);
  scene.scrollLeft = (left + right) / 2 - scene.clientWidth / 2;

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
