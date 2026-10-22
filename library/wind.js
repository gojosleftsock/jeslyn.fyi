// wind through the window on the left: gusts ripple the sheer curtain, and a moment later sway the clover.
// the curtain and clover are cut out of photo/room.jpg (photo/wind/) and redrawn over it as they move.
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const track = document.querySelector("#scene .scene-track");
  if (!track) return;
  const PHOTO_W = 1536, PHOTO_H = 1024;
  const CLOVER = { x: 1236, y: 418, pivotX: 1400, pivotY: 547 };
  const load = (src) => new Promise((ok, fail) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = fail;
    img.src = "library/photo/wind/" + src + "?v=3";
  });
  const smooth = (x) => x * x * (3 - 2 * x);
  const pct = (v, of) => (v / of) * 100 + "%";

  // each gust eases in, holds, dies down, then it's calm for a few seconds
  const gusts = [];
  let nextGust = 1.2;
  function wind(t) {
    while (nextGust < t + 10) {
      const g = { at: nextGust, rise: 1.4 + Math.random() * 0.8, hold: 0.5 + Math.random() * 1.2, fall: 2.2 + Math.random() * 1.3, s: 0.55 + Math.random() * 0.45 };
      gusts.push(g);
      nextGust += g.rise + g.hold + g.fall + 2.5 + Math.random() * 3.5;
    }
    while (gusts.length && gusts[0].at + gusts[0].rise + gusts[0].hold + gusts[0].fall < t - 5) gusts.shift();
    let g = 0;
    for (const q of gusts) {
      const u = t - q.at;
      let e = 0;
      if (u <= 0) e = 0;
      else if (u < q.rise) e = smooth(u / q.rise);
      else if (u < q.rise + q.hold) e = 1;
      else if (u < q.rise + q.hold + q.fall) e = 1 - smooth((u - q.rise - q.hold) / q.fall);
      g = Math.max(g, e * q.s);
    }
    return 0.08 + 0.92 * g;
  }

  // the curtain is redrawn in thin rows, each pushed sideways: the rod end stays put, the hem moves most
  async function curtain() {
    const [cloth, behind] = await Promise.all([load("curtain.png"), load("curtain-bg.jpg")]);
    const W = cloth.width, H = cloth.height;
    const el = document.createElement("canvas");
    el.width = W;
    el.height = H;
    el.className = "wind wind-curtain";
    el.style.width = pct(W, PHOTO_W);
    const ctx = el.getContext("2d");
    return {
      el,
      draw(t, g) {
        ctx.drawImage(behind, 0, 0);
        for (let y = 0; y < H; y += 2) {
          const reach = Math.pow(y / H, 1.6) * g;
          const dx = reach * (17 + 14 * Math.sin(y * 0.011 - t * 1.9) + 7 * Math.sin(y * 0.027 - t * 3.1 + 1.3));
          ctx.drawImage(cloth, 0, y, W, 2, dx, y, W, 2);
        }
      },
    };
  }

  // the clover is cut into its separate leaves (photo/wind/clover-pieces.png: one grey level per leaf with its stem,
  // the dense middle is 252 and stays put). each leaf turns as one solid piece around where the stems meet the pot:
  // the wind sways the outer ones more, and leaves near the cursor swing away from it and spring back on their own
  async function clover() {
    const [leaves, behind, labels] = await Promise.all([load("clover.png"), load("clover-bg.jpg"), load("clover-pieces.png")]);
    const W = leaves.width, H = leaves.height, PAD = 24;
    const PX = CLOVER.pivotX - CLOVER.x + PAD, PY = CLOVER.pivotY - CLOVER.y + PAD;
    const el = document.createElement("canvas");
    el.width = W + 2 * PAD;
    el.height = H + 2 * PAD;
    el.className = "wind wind-clover";
    el.style.left = pct(CLOVER.x - PAD, PHOTO_W);
    el.style.top = pct(CLOVER.y - PAD, PHOTO_H);
    el.style.width = pct(W + 2 * PAD, PHOTO_W);
    const ctx = el.getContext("2d");
    const read = (img) => {
      const c = document.createElement("canvas");
      c.width = W; c.height = H;
      const x = c.getContext("2d", { willReadFrequently: true });
      x.drawImage(img, 0, 0);
      return x.getImageData(0, 0, W, H);
    };
    const leaf = read(leaves), lab = read(labels).data;

    // one small canvas per leaf, cropped to its own pixels
    const boxes = new Map();
    for (let i = 0; i < W * H; i++) {
      if (!leaf.data[i * 4 + 3]) continue;
      const id = Math.round(lab[i * 4] / 6);
      if (!id) continue;
      const x = i % W, y = (i / W) | 0, a = leaf.data[i * 4 + 3];
      const bx = boxes.get(id) || { id, x0: x, y0: y, x1: x, y1: y, sx: 0, sy: 0, sa: 0 };
      bx.x0 = Math.min(bx.x0, x); bx.y0 = Math.min(bx.y0, y); bx.x1 = Math.max(bx.x1, x); bx.y1 = Math.max(bx.y1, y);
      bx.sx += x * a; bx.sy += y * a; bx.sa += a;
      boxes.set(id, bx);
    }
    const pieces = [...boxes.values()].map((bx) => {
      const w = bx.x1 - bx.x0 + 1, h = bx.y1 - bx.y0 + 1;
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const x = c.getContext("2d"), img = x.createImageData(w, h);
      for (let v = 0; v < h; v++) for (let u = 0; u < w; u++) {
        const i = (bx.y0 + v) * W + bx.x0 + u;
        if (Math.round(lab[i * 4] / 6) !== bx.id) continue;
        img.data.set(leaf.data.subarray(i * 4, i * 4 + 4), (v * w + u) * 4);
      }
      x.putImageData(img, 0, 0);
      // centre of the leaf, relative to the pivot
      const cx = bx.sx / bx.sa + PAD - PX, cy = bx.sy / bx.sa + PAD - PY, r = Math.hypot(cx, cy);
      return {
        c, x: bx.x0 + PAD - PX, y: bx.y0 + PAD - PY, cx, cy, r, still: bx.id === 42,
        bend: smooth(Math.min(1, Math.max(0, (r - 30) / 90))), dir: Math.atan2(cy, cx),
        th: 0, v: 0, k: 0.035 + Math.random() * 0.03, damp: 0.86 + Math.random() * 0.04,
      };
    }).sort((p, q) => q.still - p.still || p.cy - q.cy);

    // the cursor, in this canvas's pixels relative to the pivot
    const PUSH_R = 34, PUSH_MAX = 0.32;
    let mx = 0, my = 0, over = false;
    addEventListener("pointermove", (e) => {
      const b = el.getBoundingClientRect();
      if (!b.width) return;
      const x = ((e.clientX - b.left) / b.width) * el.width, y = ((e.clientY - b.top) / b.height) * el.height;
      over = x > 0 && y > 0 && x < el.width && y < PY + 6;
      mx = x - PX; my = y - PY;
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => { over = false; });

    return {
      el,
      draw(t, g) {
        const sway = g * 0.075, flutter = g * 0.012;
        ctx.clearRect(0, 0, el.width, el.height);
        ctx.drawImage(behind, PAD, PAD);
        for (const p of pieces) {
          if (p.still) { ctx.drawImage(p.c, PX + p.x, PY + p.y); continue; }
          // swing whichever way carries the leaf's centre away from the cursor, hardest when it's right on it
          let aim = 0;
          if (over) {
            const ax = p.cx - mx, ay = p.cy - my, d = Math.hypot(ax, ay) || 1;
            aim = PUSH_MAX * Math.exp(-(d * d) / (PUSH_R * PUSH_R)) * (ax * -p.cy + ay * p.cx) / (d * p.r) * Math.min(1, p.r / 60);
          }
          p.v = (p.v + (aim - p.th) * p.k) * p.damp;
          p.th += p.v;
          const th = p.bend * (sway * (1 + 0.25 * Math.sin(t * 1.7 + p.dir * 3)) + flutter * Math.sin(t * 5.3 + p.dir * 9)) + p.th;
          ctx.setTransform(1, 0, 0, 1, PX, PY);
          ctx.rotate(th);
          ctx.drawImage(p.c, p.x, p.y);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
      },
    };
  }

  // the leafy window shadows on the wall: the photo with its shadows lifted out, then the shadows
  // multiplied back on top, shifting a little as the tree outside sways
  async function shade() {
    const B = { x: 200, y: 290, w: 1336, h: 610, pad: 32 };
    await Promise.all([load("shade-base.jpg"), load("shade.jpg"), load("shade-mask.png")]);
    const el = document.createElement("div");
    el.className = "wind wind-shade";
    Object.assign(el.style, { left: pct(B.x, PHOTO_W), top: pct(B.y, PHOTO_H), width: pct(B.w, PHOTO_W), height: pct(B.h, PHOTO_H) });
    const lit = document.createElement("div");
    lit.className = "wind-shade-lit";
    const shadows = document.createElement("div");
    shadows.className = "wind-shade-shadows";
    const PW = B.w + 2 * B.pad, PH = B.h + 2 * B.pad;
    Object.assign(shadows.style, { left: pct(-B.pad, B.w), top: pct(-B.pad, B.h), width: pct(PW, B.w), height: pct(PH, B.h) });
    el.append(lit, shadows);
    return {
      el,
      draw(t, g) {
        const dx = g * (18 + 6 * Math.sin(t * 1.3)) + g * 2.4 * Math.sin(t * 4.7);
        const dy = g * 4.5 * Math.sin(t * 0.9);
        const turn = g * 0.35 * Math.sin(t * 0.7 + 1);
        shadows.style.transform = `translate(${(dx / PW * 100).toFixed(3)}%, ${(dy / PH * 100).toFixed(3)}%) rotate(${turn.toFixed(3)}deg)`;
      },
    };
  }

  const light = document.createElement("div");
  light.className = "wind wind-light";

  Promise.all([curtain(), clover(), shade()]).then(([c, k, s]) => {
    track.prepend(s.el, k.el, c.el, light);
    let visible = true, raf = 0;
    const start = performance.now();
    const frame = (now) => {
      const t = (now - start) / 1000;
      const g = wind(t);
      c.draw(t, g);
      k.draw(t, wind(t - 0.9));
      s.draw(t, wind(t + 0.3));
      light.style.opacity = ((g - 0.08) * 0.85).toFixed(3);
      raf = visible ? requestAnimationFrame(frame) : 0;
    };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    }).observe(track);
    raf = requestAnimationFrame(frame);
  }).catch(() => {});
})();
