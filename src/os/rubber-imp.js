/* The imp's side of Rubber: he grabs, pulls, carries and punches the environment with his rubber arm (Gear 5 only).
   create(host) returns { slingshot, relocate, moveWindow, tug, moveFileTo, punch, auto }.
   host = {
     windows(): the window elements on screen,
     moveWindow(el, dx, dy): really move a window (change its position),
     icons(): the desktop icon buttons,
     swapIcons(a, b): really swap two icons (reorder at once, keeping the same elements),
     files(): the desktop file buttons (notes saved to the desktop),
     freeCell(x, y): a free desktop cell near a screen point, as { c, r, x, y } (x, y = its centre), or null,
     moveFile(el, cell): really move a file to that cell (the host saves it); returns the file's element (it may be drawn again),
     bounds(): the screen rect the windows must stay inside,
     movable(el) / calm(): optional filters (a snapped window stays put; nobody is busy at the desk)
   }
   He reaches only as far as his arm, so before each trick he goes to stand where the thing he wants is in reach: the top edge of a
   perch (a title bar, a widget, the dock) near it. A window can be grabbed anywhere along its visible edge. */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), sleep = ms => new Promise(r => setTimeout(r, ms));
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const raf = fn => new Promise(res => { const t0 = performance.now(); const f = now => { if (fn(now - t0) === true) return res(); requestAnimationFrame(f); }; requestAnimationFrame(f); });
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => a.slice().sort(() => Math.random() - .5);
const IMP = () => window.ImpLive, R = () => window.Rubber;
const centre = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r }; };
// is this point of the thing really showing (not under a window, the dock, a menu)?
const showing = (el, x, y) => { const t = document.elementFromPoint(x, y); return !!t && el.contains(t); };

const RubberImp = {
  create(host) {
    let busy = false, autoT = 0, autoOn = false;
    const ready = () => { const i = IMP(), r = R(); return !!(i && r && r.active && !r.rm() && i.state().costume === 'gear5' && !i.busy() && i.state().mode === 'perch'); };

    // points along the visible edge of a window (its title bar and its sides), where an arm can take hold
    const edgePoints = w => {
      const r = w.getBoundingClientRect(), out = [], add = (x, y) => { x = clamp(x, r.left + 5, r.right - 5); y = clamp(y, r.top + 5, r.bottom - 5); if (y > 40 && y < innerHeight - 8 && x > 4 && x < innerWidth - 4 && showing(w, x, y)) out.push({ x, y }); };
      for (let x = r.left + 110; x < r.right - 24; x += 46) { add(x, r.top + 14); add(x, r.bottom - 6); }
      for (let y = r.top + 44; y < r.bottom - 20; y += 46) { add(r.left + 6, y); add(r.right - 6, y); }
      return out;
    };
    const here = () => { const i = IMP(); return i.perchEl(); };
    const otherWins = () => host.windows().filter(w => w.isConnected && !(here() && w.contains(here())));
    // windows he can take hold of from where he stands: the nearest reachable edge point of each
    const reachableWins = (kind = 'pull') => { const i = IMP(), me = i.body(); if (!me) return [];
      return otherWins().map(w => { const pts = edgePoints(w).filter(p => i.reachable(p.x, p.y, kind)).sort((a, b) => Math.hypot(a.x - me.x, a.y - me.y) - Math.hypot(b.x - me.x, b.y - me.y)); return pts.length ? { w, p: pts[Math.min(pts.length - 1, Math.floor(Math.random() * 3))] } : null; }).filter(Boolean); };
    const reachableIcons = () => { const i = IMP(); return host.icons().map(e => ({ e, c: centre(e) })).filter(o => showing(o.e, o.c.x, o.c.y) && i.reachable(o.c.x, o.c.y)); };
    const reachableFiles = () => { const i = IMP(); return (host.files ? host.files() : []).map(e => ({ e, c: centre(e) })).filter(o => showing(o.e, o.c.x, o.c.y) && i.reachable(o.c.x, o.c.y)); };

    // how far his arm reaches from where he stands, in screen pixels (measured, so it follows his size)
    const reachR = () => { const i = IMP(); if (!i.body()) return 160; const sh = i.shoulder(false); let lo = 10, hi = 900; for (let k = 0; k < 11; k++) { const m = (lo + hi) / 2; if (i.reachable(sh[0] + m, sh[1])) lo = m; else hi = m; } return lo; };
    const ledges = () => [...document.querySelectorAll('[data-imp="ledge"]')].filter(el => el.isConnected).map(el => ({ el, r: el.getBoundingClientRect() }))
      .filter(o => o.r.width > 120 && o.r.height > 4 && o.r.top > 70 && o.r.top < innerHeight - 40 && o.r.bottom > 0);
    const targetsOf = kind => kind === 'win' ? host.windows().filter(w => w.isConnected).flatMap(w => edgePoints(w).map(p => ({ ...p, owner: w })))
      : (kind === 'file' ? (host.files ? host.files() : []) : host.icons()).map(e => { const c = centre(e); return showing(e, c.x, c.y) ? { x: c.x, y: c.y, owner: null } : null; }).filter(Boolean);
    const have = (kind, need) => (kind === 'win' ? reachableWins().length : kind === 'file' ? reachableFiles().length : reachableIcons().length) >= need;

    // go and stand where something is within reach: on the top edge of a perch as close to it as his arm allows, never on the thing itself
    const approach = async (kind, need = 1) => {
      const i = IMP(), me = i.body(); if (!me || i.busy()) return false;
      const sh0 = i.shoulder(false), off = [sh0[0] - me.x, sh0[1] - me.y], R0 = reachR() * .84, L = ledges();
      for (const T of shuffle(targetsOf(kind)).slice(0, 12)) {
        const spots = L.filter(o => !(T.owner && (T.owner === o.el || T.owner.contains(o.el) || o.el.contains(T.owner)))).map(o => {
          const x = clamp(T.x, o.r.left + 20, o.r.right - 20), y = o.r.top, ox = T.x < x ? -off[0] : off[0];
          return { x, y, d: Math.hypot(x + ox - T.x, y + off[1] - T.y) };
        }).filter(s => s.d < R0).sort((a, b) => a.d - b.d);
        for (const s of spots.slice(0, 2)) {
          if (Math.hypot(s.x - me.x, s.y - me.y) < 40) continue;
          if (i.hopToSpot(s.x, s.y, () => { })) { await sleep(700); for (let k = 0; k < 30 && i.busy(); k++) await sleep(150); if (have(kind, need)) return true; return false; }
        }
      }
      return false;
    };
    // hold on with the arm: resolves true when it has grabbed, false if it could not
    const hold = (x, y, follow) => new Promise(res => { const i = IMP(); let done = false; const ok = i.hold({ x, y, follow }, () => { done = true; res(true); }); if (!ok) res(false); setTimeout(() => { if (!done) res(false); }, 1500); });

    const slingshot = async () => {
      if (busy || !ready()) return false; busy = true;
      try {
        const i = IMP(), r = R(); let cand = reachableWins(); if (!cand.length && (await approach('win'))) cand = reachableWins(); if (!cand.length) return false;
        const c = pick(cand), w = c.w, G = c.p, me = i.body(), flip = G.x < me.x, sh = i.shoulder(flip), dist = Math.hypot(sh[0] - G.x, sh[1] - G.y) || 1, U = { x: (sh[0] - G.x) / dist, y: (sh[1] - G.y) / dist };
        const reach = Math.min(dist * .88, 400); let att = { x: G.x, y: G.y };
        if (!(await hold(G.x, G.y, () => [att.x, att.y]))) return false;
        await sleep(220); const h = r.grab(w, G.x, G.y); if (!h) { i.release(); return false; }
        await raf(t => { if (!i.holding()) return true; const k = ease(clamp(t / 760, 0, 1)); att = h.setHand(G.x + U.x * reach * k, G.y + U.y * reach * k); i.strain(att.tension); return t > 760; });
        await raf(t => { if (!i.holding()) return true; const j = (Math.random() - .5) * 2.2; att = h.setHand(G.x + U.x * reach + j, G.y + U.y * reach + j); i.strain(Math.min(1, att.tension + .1)); return t > 260; });
        h.release(); i.strain(0); i.release(); await sleep(900); return true;
      } finally { busy = false; }
    };

    // carry two icons across each other: they trade places for real (saved by the host)
    const relocate = async () => {
      if (busy || !ready()) return false; busy = true;
      try {
        const i = IMP(), r = R(); let cand = reachableIcons(); if (cand.length < 2 && (await approach('icon', 2))) cand = reachableIcons(); if (cand.length < 2) return false;
        const a = pick(cand), others = cand.filter(o => o.e !== a.e), b = pick(others), ca = a.c, cb = b.c;
        let att = { x: ca.x, y: ca.y };
        if (!(await hold(ca.x, ca.y, () => [att.x, att.y]))) return false;
        await sleep(160); const ha = r.grab(a.e, ca.x, ca.y, { carry: true, radius: .5, limit: 260 }), hb = r.grab(b.e, cb.x, cb.y, { carry: true, radius: .5, limit: 260 }); if (!ha) { i.release(); return false; }
        const restA = r.restRect(a.e), restB = r.restRect(b.e);
        await raf(t => { if (!i.holding()) return true; const k = ease(clamp(t / 900, 0, 1)), lift = Math.sin(Math.PI * k) * 46;
          att = ha.setHand(ca.x + (cb.x - ca.x) * k, ca.y + (cb.y - ca.y) * k - lift); i.strain(.25); if (hb) hb.setHand(cb.x + (ca.x - cb.x) * k, cb.y + (ca.y - cb.y) * k + lift * .4); return t > 900; });
        ha.release(); if (hb) hb.release(); i.release();
        host.swapIcons(a.e, b.e); r.settleFrom(a.e, restA, { squash: true }); r.settleFrom(b.e, restB, { squash: false });
        await sleep(1100); return true;
      } finally { busy = false; }
    };

    const moveWindow = async () => {
      if (busy || !ready()) return false; busy = true;
      try {
        const i = IMP(), r = R(), movable = c => !host.movable || host.movable(c.w); let cand = reachableWins().filter(movable); if (!cand.length && (await approach('win'))) cand = reachableWins().filter(movable); if (!cand.length) return false;
        const c = pick(cand), w = c.w, G = c.p, rr = w.getBoundingClientRect(), bd = host.bounds ? host.bounds() : { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
        const room = (lo, hi) => { lo = clamp(lo, -170, 0); hi = clamp(hi, 0, 170); if (hi - lo < 40) return 0; let v = lo + Math.random() * (hi - lo); if (Math.abs(v) < 70) v = v < 0 ? Math.max(lo, -90) : Math.min(hi, 90); return Math.round(v); };
        let dx = room(bd.left + 12 - rr.left, bd.right - 12 - rr.right), dy = room(bd.top + 10 - rr.top, bd.bottom - 10 - rr.bottom);
        for (let k = 0; k < 6 && !i.reachable(G.x + dx, G.y + dy); k++) { dx = Math.round(dx * .7); dy = Math.round(dy * .7); }
        if (Math.abs(dx) + Math.abs(dy) < 40) return false;
        let att = { x: G.x, y: G.y };
        if (!(await hold(G.x, G.y, () => [att.x, att.y]))) return false;
        await sleep(200); const h = r.grab(w, G.x, G.y, { carry: true, radius: .5, limit: 360 }); if (!h) { i.release(); return false; }
        const rest = r.restRect(w);
        await raf(t => { if (!i.holding()) return true; const k = ease(clamp(t / 950, 0, 1)); att = h.setHand(G.x + dx * k, G.y + dy * k); i.strain(.2); return t > 950; });
        h.release(); i.release(); host.moveWindow(w, dx, dy); r.settleFrom(w, rest, { squash: true });
        await sleep(1100); return true;
      } finally { busy = false; }
    };

    // tug a small thing (an icon or a file) toward him like gum and let go: it snaps back and ripples
    const tug = async () => {
      if (busy || !ready()) return false; busy = true;
      try {
        const i = IMP(), r = R(); const all = () => reachableIcons().concat(reachableFiles()); let cand = all(); if (!cand.length && ((await approach('icon')) || (await approach('file')))) cand = all(); if (!cand.length) return false;
        const c = pick(cand), me = i.body(), flip = c.c.x < me.x, sh = i.shoulder(flip), dist = Math.hypot(sh[0] - c.c.x, sh[1] - c.c.y) || 1, U = { x: (sh[0] - c.c.x) / dist, y: (sh[1] - c.c.y) / dist }, reach = Math.min(dist * .6, 170);
        let att = { x: c.c.x, y: c.c.y }; if (!(await hold(c.c.x, c.c.y, () => [att.x, att.y]))) return false;
        await sleep(200); const h = r.grab(c.e, c.c.x, c.c.y, { radius: .55, limit: 210 }); if (!h) { i.release(); return false; }
        await raf(t => { if (!i.holding()) return true; const k = ease(clamp(t / 620, 0, 1)); att = h.setHand(c.c.x + U.x * reach * k, c.c.y + U.y * reach * k); i.strain(att.tension * .8); return t > 620; });
        await raf(t => { if (!i.holding()) return true; const j = (Math.random() - .5) * 2; att = h.setHand(c.c.x + U.x * reach + j, c.c.y + U.y * reach + j); return t > 220; });
        h.release(); i.strain(0); i.release(); await sleep(900); return true;
      } finally { busy = false; }
    };
    // carry a file to a free cell, trailing behind his hand; the host saves the new cell
    const moveFileTo = async () => {
      if (busy || !ready() || !host.files) return false; busy = true;
      try {
        const i = IMP(), r = R(); let cand = reachableFiles(); if (!cand.length && (await approach('file'))) cand = reachableFiles(); if (!cand.length) return false;
        const a = pick(cand); let spot = null; for (let n = 0; n < 10 && !spot; n++) { const px = a.c.x + (Math.random() - .5) * 420, py = a.c.y + (Math.random() - .3) * 300, f = host.freeCell(px, py); if (f && i.reachable(f.x, f.y) && Math.hypot(f.x - a.c.x, f.y - a.c.y) > 90) spot = f; }
        if (!spot) return false; let att = { x: a.c.x, y: a.c.y }; if (!(await hold(a.c.x, a.c.y, () => [att.x, att.y]))) return false;
        await sleep(160); const h = r.grab(a.e, a.c.x, a.c.y, { carry: true, radius: .6, limit: 260 }); if (!h) { i.release(); return false; } const rest = r.restRect(a.e);
        await raf(t => { if (!i.holding()) return true; const k = ease(clamp(t / 900, 0, 1)), lift = Math.sin(Math.PI * k) * 52; att = h.setHand(a.c.x + (spot.x - a.c.x) * k, a.c.y + (spot.y - a.c.y) * k - lift); i.strain(.2); return t > 900; });
        h.release(); i.release(); const el = host.moveFile(a.e, spot) || a.e; r.settleFrom(el, rest, { squash: true }); await sleep(1100); return true;
      } finally { busy = false; }
    };

    const punch = async () => {
      if (busy || !ready()) return false; busy = true;
      try {
        const i = IMP(), r = R(); let cand = reachableWins('punch'); if (!cand.length && (await approach('win'))) cand = reachableWins('punch'); if (!cand.length) return false;
        const c = pick(cand), me = i.body(), G = c.p, L = Math.hypot(G.x - me.x, G.y - me.y) || 1;
        const ok = i.punch([G.x, G.y], () => r.hit(c.w, G.x, G.y, (G.x - me.x) / L, (G.y - me.y) / L, 950, { touch: true })); if (!ok) return false; await sleep(1500); return true;
      } finally { busy = false; }
    };

    // while Gear 5 lasts he now and then does one of these on his own
    const loop = (first) => { clearTimeout(autoT); if (!autoOn) return; autoT = setTimeout(async () => { if (ready() && !document.hidden && (!host.calm || host.calm())) { const a = Math.random(); try { await (a < .24 ? slingshot() : a < .42 ? relocate() : a < .6 ? moveFileTo() : a < .78 ? tug() : a < .9 ? moveWindow() : punch()); } catch { } } loop(); }, first ? 3600 : 5000 + Math.random() * 5000); };
    return { slingshot, relocate, moveWindow, punch, tug, moveFileTo, isBusy: () => busy, auto(on) { autoOn = !!on; loop(true); } };
  }
};
window.RubberImp = RubberImp;
export const create = host => RubberImp.create(host);
export default RubberImp;
