/* Imp OS: Gear 5 turns the desktop to rubber.
   While Imp is in Gear 5 (a minute, after ten pokes) the windows, the desktop icons and the files saved on the desktop become rubber:
   he can grab one with his arm and stretch it, carry two icons across each other, carry a file to a free cell, shift a window,
   and punch a window so it dents; when he lets go it snaps back, wobbles, and the things near it ripple. Only he does this; there is
   no way for a visitor to drag rubber. What he rearranges is saved in this browser, and "Reset layout" (the desktop menu, or the quiet
   button next to the city and the clock) puts everything back.
   rubber.js is the physics, rubber-imp.js is what he does with it, this file joins both to the OS. app.js loads it the first time
   Gear 5 starts, so none of it weighs on the page. It does nothing on a phone or when the visitor asks for less motion. */
import R from './rubber.js';
import { create } from './rubber-imp.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function init(O) {
  const { $, $$ } = O;
  R.rm = () => O.rm();
  const wins = () => O.isDesk() ? O.wm.visible() : [];
  const icons = () => O.isDesk() ? $$('.desk .icons .icon:not(.rb-clone)') : [];
  const files = () => O.isDesk() ? $$('.dfiles .dfile:not(.rb-clone)') : [];
  R.objects = () => [...wins(), ...icons(), ...files()];
  R.on('touch', e => O.wm.focus(e.el)); // whatever he grabs or punches comes to the front
  const underWindow = (x, y) => wins().some(el => { const r = el.getBoundingClientRect(); return x > r.left - 8 && x < r.right + 8 && y > r.top - 8 && y < r.bottom + 8; });

  const host = {
    windows: wins, icons, files,
    pullable: el => O.wm.pullable(el),
    movable: el => O.wm.movable(el),
    calm: () => !$('.menu, #cc, #nc, #taskview, #spot:not([hidden]), #lightbox:not([hidden]), #assist:not([hidden])') && !$('.win.dragging, .win.resizing, .dfile.dragging, .dfile-ghost'),
    bounds: () => O.wm.bounds(),
    moveWindow: (el, dx, dy) => O.wm.move(el, dx, dy),
    swapIcons: (a, b) => O.icons.swap(a, b),
    freeCell: (x, y) => { const f = O.files()?.freeCellAt?.(x, y); return f && !underWindow(f.x, f.y) ? f : null; },
    moveFile: (el, cell) => O.filesMove(el, cell)
  };
  const dir = create(host);

  // Reset layout: take a picture of where everything is, let the OS put things back, then let each one glide to its place
  const keyOf = el => el.classList.contains('win') ? 'w:' + el.dataset.win : el.classList.contains('dfile') ? 'f:' + el.dataset.file : 'i:' + el.dataset.open;
  const find = k => k[0] === 'w' ? $(`.win[data-win="${CSS.escape(k.slice(2))}"]`) : k[0] === 'f' ? $(`.dfiles [data-file="${CSS.escape(k.slice(2))}"]`) : $(`.desk .icons [data-open="${CSS.escape(k.slice(2))}"]`);
  const snapshot = () => R.active ? new Map(R.objects().map(e => [keyOf(e), R.restRect(e)])) : null;
  const glide = snap => { if (!snap || !R.active) return; let n = 0; snap.forEach((rect, k) => { const el = find(k); if (el) setTimeout(() => R.settleFrom(el, rect, { squash: false }), (n++ % 7) * 40); }); };

  // he lands on a window: it dents under him
  document.addEventListener('imp:land', e => {
    const d = e.detail || {}, win = d.el && d.el.closest && d.el.closest('.win');
    if (R.active && win && win.isConnected) R.hit(win, d.x, d.y - 4, 0, 1, clamp((d.vy || 400) * .7, 240, 820));
  });
  addEventListener('resize', () => { if (R.active && !O.isDesk()) setActive(false); });

  const setActive = on => { const v = !!on && O.isDesk() && !O.rm(); R.setActive(v); dir.auto(v); return v; };
  return { setActive, snapshot, glide, dir, R };
}
