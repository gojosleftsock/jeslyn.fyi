// the week view that opens from the standing calendar. it always shows the current week.
(() => {
  const { week = {} } = window.LIBRARY || {};
  const calendars = week.calendars || {};
  const events = week.events || [];
  const START = 8, END = 22, SPAN = END - START;
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const $ = (id) => document.getElementById(id);
  const overlay = $("weekOverlay");
  const trigger = document.querySelector(".cal");
  if (!overlay || !trigger) return;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const pct = (h) => ((h - START) / SPAN) * 100 + "%";
  const clock = (h, ampm = true) => {
    const hr = Math.floor(h), min = Math.round((h - hr) * 60);
    return ((hr + 11) % 12) + 1 + (min ? ":" + String(min).padStart(2, "0") : "") + (ampm ? (hr < 12 ? " AM" : " PM") : "");
  };
  const range = (a, b) => clock(a, (a < 12) !== (b < 12)) + " \u2013 " + clock(b);

  let builtFor = "";
  function build(now) {
    const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    $("wkTitle").replaceChildren(el("b", "", MONTHS[now.getMonth()] + " "), el("span", "", String(now.getFullYear())));
    const grid = $("wkWeek");
    grid.replaceChildren(el("div"));
    for (let d = 0; d < 7; d++) {
      const date = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + d);
      const head = el("div", "wk-day" + (d === 0 || d === 6 ? " wkend" : "") + (d === now.getDay() ? " today" : ""));
      head.append(el("span", "", DOW[d]), el("span", "wk-num", String(date.getDate())));
      grid.append(head);
    }
    grid.append(el("div", "wk-allday label", "all-day"));
    for (let d = 0; d < 7; d++) grid.append(el("div", "wk-allday"));

    const gutter = el("div", "wk-gutter");
    for (let h = START + 1; h < END; h++) {
      const line = el("div", "wk-hour");
      line.style.top = pct(h);
      line.dataset.h = h;
      const label = el("span", "", h === 12 ? "Noon" : clock(h, false));
      if (h !== 12) label.append(el("small", "", h < 12 ? "AM" : "PM"));
      line.append(label);
      gutter.append(line);
    }
    grid.append(gutter);

    for (let d = 0; d < 7; d++) {
      const col = el("div", "wk-col" + (d === 0 || d === 6 ? " wkend" : ""));
      col.dataset.day = d;
      for (let h = START + 1; h < END; h++) {
        const line = el("div", "wk-hour");
        line.style.top = pct(h);
        col.append(line);
      }
      for (const ev of events.filter((e) => e.day === d)) {
        const box = el("div", "wk-ev");
        box.style.setProperty("--c", calendars[ev.cal] || "#8e8e93");
        box.style.top = `calc(${pct(ev.start)} + 1px)`;
        box.style.height = `calc(${((ev.end - ev.start) / SPAN) * 100}% - 2px)`;
        box.dataset.day = d;
        box.dataset.end = ev.end;
        box.title = `${ev.title.replace(/\u00ad/g, "")}\n${range(ev.start, ev.end)}`;
        box.append(el("b", "", ev.title), el("time", "", range(ev.start, ev.end)));
        col.append(box);
      }
      grid.append(col);
    }
  }

  function tick() {
    const now = new Date();
    if (now.toDateString() !== builtFor) {
      builtFor = now.toDateString();
      build(now);
    }
    overlay.querySelectorAll(".wk-now, .wk-nowtime").forEach((n) => n.remove());
    const h = now.getHours() + now.getMinutes() / 60;
    overlay.querySelectorAll(".wk-ev").forEach((ev) => {
      const d = +ev.dataset.day;
      ev.classList.toggle("past", d < now.getDay() || (d === now.getDay() && +ev.dataset.end <= h));
    });
    overlay.querySelectorAll(".wk-gutter .wk-hour").forEach((l) => {
      l.style.visibility = Math.abs(+l.dataset.h - h) < 0.3 ? "hidden" : "";
    });
    if (h < START || h > END) return;
    const line = el("div", "wk-now");
    line.style.top = pct(h);
    overlay.querySelector(`.wk-col[data-day="${now.getDay()}"]`).append(line);
    const label = el("div", "wk-nowtime", ((now.getHours() + 11) % 12) + 1 + ":" + String(now.getMinutes()).padStart(2, "0"));
    label.style.top = pct(h);
    overlay.querySelector(".wk-gutter").append(label);
  }

  let timer = 0;
  function open() {
    tick();
    libStay(overlay);
    document.body.classList.add("lib-locked");
    timer = setInterval(tick, 30 * 1000);
    $("wkClose").focus();
  }
  function close() {
    if (!libLeave(overlay)) return;
    clearInterval(timer);
    trigger.focus();
  }
  trigger.addEventListener("click", open);
  $("wkClose").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
