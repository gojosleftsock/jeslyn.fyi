// the "recommend a book" popup: search open library, add a name and a note, send it to jeslyn.
// where it gets sent is set by recommendTo in library/shelf.js.
(() => {
  const to = (window.LIBRARY || {}).recommendTo || {};
  const $ = (id) => document.getElementById(id);
  const overlay = $("recOverlay");
  let book = null;
  let typed = false;
  let searchTimer = 0;
  let searching = null;

  function show(step) {
    for (const id of ["recPick", "recWrite", "recDone"]) $(id).hidden = id !== step;
  }

  function reset() {
    book = null;
    typed = false;
    $("recQuery").value = "";
    $("recResults").replaceChildren();
    $("recHint").textContent = "";
    $("recStatus").textContent = "";
    $("recSend").disabled = false;
    show("recPick");
  }

  function openRec() {
    reset();
    overlay.hidden = false;
    document.body.classList.add("lib-locked");
    $("recQuery").focus();
  }

  function closeRec() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("lib-locked");
    clearTimeout(searchTimer);
    searching?.abort();
    $("libRecommend").focus();
  }

  const cover = (id, size) => (id ? `https://covers.openlibrary.org/b/id/${id}-${size}.jpg` : "");
  const byline = (b) => [b.author, b.year].filter(Boolean).join(" \u00b7 ");

  async function search(q) {
    searching?.abort();
    searching = new AbortController();
    $("recHint").textContent = "searching\u2026";
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8&fields=key,title,author_name,first_publish_year,cover_i`;
      const res = await fetch(url, { signal: searching.signal });
      const { docs = [] } = await res.json();
      const list = $("recResults");
      list.replaceChildren(...docs.map((d) => {
        const b = { title: d.title, author: (d.author_name || [])[0] || "", year: d.first_publish_year || "", cover: d.cover_i || 0, key: d.key || "" };
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "rec-result";
        const thumb = document.createElement("span");
        thumb.className = "rec-thumb rec-thumb--small";
        if (b.cover) {
          const img = document.createElement("img");
          img.alt = "";
          img.src = cover(b.cover, "S");
          thumb.append(img);
        }
        const text = document.createElement("span");
        const t = document.createElement("span");
        t.className = "rec-book-title";
        t.textContent = b.title;
        const by = document.createElement("span");
        by.className = "rec-book-by";
        by.textContent = byline(b);
        text.append(t, by);
        btn.append(thumb, text);
        btn.addEventListener("click", () => pick(b, false));
        li.append(btn);
        return li;
      }));
      $("recHint").textContent = docs.length ? "" : "nothing found. try different words, or type it in below";
    } catch (e) {
      if (e.name !== "AbortError") $("recHint").textContent = "couldn't search right now. you can type it in below";
    }
  }

  function pick(b, manual) {
    book = b;
    typed = manual;
    $("recPicked").hidden = manual;
    $("recTyped").hidden = !manual;
    const img = $("recThumbImg");
    img.hidden = true;
    img.removeAttribute("src");
    if (!manual) {
      $("recBookTitle").textContent = b.title;
      $("recBookBy").textContent = byline(b);
      if (b.cover) { img.onload = () => (img.hidden = false); img.src = cover(b.cover, "M"); }
    } else {
      $("recTitle").value = $("recQuery").value.trim();
      $("recAuthor").value = "";
    }
    $("recStatus").textContent = "";
    show("recWrite");
    (manual ? $("recTitle") : $("recName")).focus();
  }

  async function send(e) {
    e.preventDefault();
    if ($("recTrap").checked) { show("recDone"); return; }
    const b = typed ? { title: $("recTitle").value.trim(), author: $("recAuthor").value.trim() } : book;
    if (!b || !b.title) { $("recStatus").textContent = "what's the book called?"; $("recTitle").focus(); return; }
    const name = $("recName").value.trim() || "anonymous";
    const why = $("recWhy").value.trim();
    const subject = `book rec: ${b.title}${b.author ? ` by ${b.author}` : ""}`;
    const message = [
      `book: ${b.title}`,
      b.author && `author: ${b.author}`,
      b.year && `first published: ${b.year}`,
      b.key && `https://openlibrary.org${b.key}`,
      `from: ${name}`,
      why && `\nwhy: ${why}`,
    ].filter(Boolean).join("\n");

    if (to.web3formsKey) {
      $("recSend").disabled = true;
      $("recStatus").textContent = "sending\u2026";
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ access_key: to.web3formsKey, subject, from_name: "jeslyn's library", name, book: b.title, author: b.author || "", why, message }),
        });
        const out = await res.json();
        if (!out.success) throw new Error(out.message);
        show("recDone");
      } catch {
        $("recStatus").textContent = "that didn't send. try again in a bit?";
      } finally {
        $("recSend").disabled = false;
      }
    } else if (to.email) {
      location.href = `mailto:${to.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      show("recDone");
    } else {
      $("recStatus").textContent = "jeslyn hasn't set up where recommendations go yet";
    }
  }

  $("libRecommend").addEventListener("click", openRec);
  $("recClose").addEventListener("click", closeRec);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeRec(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeRec(); });
  $("recQuery").addEventListener("input", () => {
    clearTimeout(searchTimer);
    const q = $("recQuery").value.trim();
    if (q.length < 2) { searching?.abort(); $("recResults").replaceChildren(); $("recHint").textContent = ""; return; }
    searchTimer = setTimeout(() => search(q), 350);
  });
  $("recQuery").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); $("recResults").querySelector("button")?.click(); }
  });
  $("recManual").addEventListener("click", () => pick(null, true));
  $("recBack").addEventListener("click", () => { show("recPick"); $("recQuery").focus(); });
  $("recAgain").addEventListener("click", () => { reset(); $("recQuery").focus(); });
  $("recForm").addEventListener("submit", send);
})();
