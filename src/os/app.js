/* Imp OS in the browser: window manager (laptop), sheets (phone), dock, menus, Spotlight, lightbox,
   settings, terminal and boot. The page arrives already drawn by the build (see src/pages); this file
   takes it over. Every window with an address keeps the address bar in step, so links can be shared.
   The mascot runtime (public/os/imp-live.js) loads on its own and is wired up when it arrives. */
import {
  A, esc, clamp, env, mod, lang, useLang, T, rtl, other, U, u, filmTitle, I, P, ALLFILMS, stageLabel, img,
  href, tileFor, SYS, appTile, appTitle, titleFor, clockHTML, clockNow, wallHTML, lbLists, playerFilms, sound, dur, filmTitleHTML,
  ACCENTS, WALLS, TERM, appMeta, topbarHTML, iconsHTML, widgetsHTML, homeHTML, dockHTML, bootHTML, FILM
} from './core.js';

(() => {
'use strict';

/* ===== core: state, settings ===== */
const doc = document.documentElement;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const Imp = () => window.ImpLive;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const mqPhone = matchMedia('(max-width: 759px)');
const osRM = matchMedia('(prefers-reduced-motion: reduce)');
const osDark = matchMedia('(prefers-color-scheme: dark)');
const ls = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { } } };
const ss = { get(k) { try { return sessionStorage.getItem(k); } catch { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch { } } };
env.mac = MAC; env.rm = osRM.matches;
useLang(doc.lang === 'ar' ? 'ar' : 'en');

/* settings, remembered per browser */
const SKEY = 'pf-a-settings';
const DEF = { theme: 'auto', accent: 'amber', wall: 'corniche', motion: 'auto', icons: 'default', widgets: true };
let S = (() => { let s = {}; try { s = JSON.parse(ls.get(SKEY) || '{}') || {}; } catch { } const old = ls.get('pf-a-theme'); if (!s.theme && old) s.theme = old; return { ...DEF, ...s }; })();
const saveS = () => ls.set(SKEY, JSON.stringify(S));
const rm = () => osRM.matches || S.motion === 'reduce';
let theme = S.theme === 'auto' ? (osDark.matches ? 'dark' : 'light') : S.theme;
const isDesk = () => !mqPhone.matches;
const ROUTE_APP = doc.dataset.app || 'start'; // the window this address stands for, set by the build

/* clock */
const tickClock = () => $$('[data-clock]').forEach(c => { c.innerHTML = (c.dataset.clock === 'label' ? esc(u('khobar')) + ' ' : '') + clockHTML(); });

/* toasts */
const toast = (msg, icon = I.check) => {
  const box = $('#toasts'); if (!box) return;
  const t = document.createElement('div'); t.className = 'toast glass'; t.innerHTML = `<span class="ti">${icon}</span><span>${esc(msg)}</span>`;
  box.append(t); while (box.children.length > 3) box.firstElementChild.remove();
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 2600);
};

/* a small canvas that plays one of the owner's Pixel imp clips (boot screen, Imp's menu); needs the mascot runtime */
const cameo = (cv, o = {}) => {
  const { drawFrame, box, whenFaces } = window.IMP2, { CLIPS } = window.IMP2CLIPS;
  const ctx = cv.getContext('2d');
  let clip = o.clip || 'idle', then = o.then || 'idle', fi = 0, ft = 0, alive = true, last = performance.now();
  const Sc = o.scale || 3, R = Math.max(1, Math.round(devicePixelRatio || 1));
  const size = () => {
    const w = cv.clientWidth || 60 * Sc, h = cv.clientHeight || 60 * Sc;
    if (cv.width !== w * R || cv.height !== h * R) { cv.width = w * R; cv.height = h * R; }
    return { w, h };
  };
  const draw = () => {
    const c = CLIPS[clip] || CLIPS.idle, fr = c.frames[fi % c.frames.length], { w, h } = size();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    const b = box(fr), py = b.pivot ? b.pivot[1] : b.h;
    // anchor: feet at the bottom centre (hang frames hang from their pivot near the top)
    const ax = Math.round(w / 2), ay = b.pivot ? Math.round((h - b.h * Sc) / 2 + py * Sc) : h - Math.round(Sc * 2);
    drawFrame(ctx, fr, ax * R, ay * R, Sc * R, { flip: !!o.flip, rim: o.rim || null });
  };
  const tick = now => {
    if (!alive) return;
    const dt = Math.min(now - last, 50); last = now;
    const c = CLIPS[clip] || CLIPS.idle;
    if (!rm()) {
      ft += dt;
      if (ft >= c.frames[fi].ms) { ft = 0; fi++; if (fi >= c.frames.length) { fi = 0; if (!c.loop && !o.loop) { clip = then; } } }
    }
    draw(); requestAnimationFrame(tick);
  };
  whenFaces().then(() => requestAnimationFrame(tick));
  return { stop() { alive = false; } };
};

/* the mascot arrives on its own (it is large); until then every call to him is skipped */
const impWait = [];
const whenImp = f => { if (window.IMP2 && Imp()) f(); else impWait.push(f); };
const IMP_MAP = [
  { type: 'ledge', sel: '.sheet.top .card, .sheet.top .fact, .sheet.top .edu, .sheet.top .ptile, .sheet.top .lab-card, .sheet.top .feat-card, .sheet.top .tool' },
  { type: 'toggle', sel: '#themeBtn' },
  { type: 'point', sel: '.icon, .ptile, .dock-item, .lab-card, .ship-row, .app-icon, .reach-row, .c-row, .rel-item, .tool-mini, .assist-card' },
  { type: 'header', sel: '#topbar' }
];
const loadImp = () => {
  if ($('#imp-js')) return;
  const s = document.createElement('script'); s.id = 'imp-js'; s.src = '/os/imp-live.js'; s.async = true;
  s.addEventListener('load', impArrived); document.body.append(s);
};
const impArrived = () => {
  Imp()?.configure({ map: IMP_MAP });
  if (booting && !Imp().state().hidden) { Imp().hide(true); bootHid = true; }
  syncImpSize();
  impWait.splice(0).forEach(f => f());
};


/* ===== apps: lightbox lists, film player, settings sync ===== */
let LB = null; // the lightbox lists, built the first time a screen is enlarged (and again after a language change)
const selectFilm = (pl, i, autoplay) => {
  const films = playerFilms(pl.dataset.player), f = films?.[i]; if (!f) return;
  pl.dataset.cur = i;
  const v = $('video', pl), st = $('.stage', pl);
  v.pause(); v.removeAttribute('data-poster'); posterIO?.unobserve(v); v.src = f.src; v.poster = f.poster; v.muted = !sound.on; v.setAttribute('aria-label', filmTitle(f));
  $('.backdrop', pl).style.backgroundImage = `url('${f.poster}')`;
  $('.film-title', pl).innerHTML = filmTitleHTML(f);
  $$('[data-film]', pl).forEach(b => b.setAttribute('aria-current', String(+b.dataset.film === i)));
  $('time', pl).textContent = `0:00 / ${dur(f.dur)}`; $('[data-pc="seek"]', pl).value = 0;
  st.classList.remove('playing');
  if (autoplay) v.play().catch(() => { });
};
const syncSound = () => $$('[data-pc="sound"]').forEach(b => { b.setAttribute('aria-pressed', String(sound.on)); b.setAttribute('aria-label', sound.on ? u('soundOff') : u('soundOn')); b.innerHTML = sound.on ? I.vol : I.mute; });
const syncSettingsUI = (root = document) => {
  const cur = { theme: S.theme, accent: S.accent, wall: S.wall, lang, icons: S.icons };
  $$('[data-set]', root).forEach(b => {
    const k = b.dataset.set;
    if (b.getAttribute('role') === 'switch') b.setAttribute('aria-checked', String(k === 'imp' ? !Imp()?.state().hidden : k === 'motion' ? S.motion === 'reduce' : !!S[k]));
    else b.setAttribute('aria-checked', String(cur[k] === b.dataset.val));
  });
  syncImpSize(root);
};


/* ===== window manager (laptop): open, focus, drag, resize from every edge, snap, arrange ===== */
const WM = { wins: new Map(), z: 100, hiddenByDesk: [] };
const barH = () => $('#topbar').offsetHeight;
const dockTop = () => { const r = $('#dock').getBoundingClientRect(); return Math.min(r.top || innerHeight, innerHeight - 92); };
const area = () => ({ top: barH(), bottom: dockTop() - 8, W: innerWidth, H: innerHeight });
const workArea = () => { const t = barH() + 6, b = dockTop() - 8; return { x: 6, y: t, w: innerWidth - 12, h: b - t }; };
const zoneRect = f => {
  const a = workArea(), g = 4, [fx, fy, fw, fh] = f;
  const x = a.x + fx * a.w + (fx > .001 ? g : 0), y = a.y + fy * a.h + (fy > .001 ? g : 0);
  const r = a.x + (fx + fw) * a.w - (fx + fw < .999 ? g : 0), b = a.y + (fy + fh) * a.h - (fy + fh < .999 ? g : 0);
  return { x: Math.round(x), y: Math.round(y), w: Math.round(r - x), h: Math.round(b - y) };
};
const FULL = [0, 0, 1, 1], T3 = 1 / 3;
const LAYOUTS = {
  '50-50': [[0, 0, .5, 1], [.5, 0, .5, 1]], '66-33': [[0, 0, 2 * T3, 1], [2 * T3, 0, T3, 1]], '33x3': [[0, 0, T3, 1], [T3, 0, T3, 1], [2 * T3, 0, T3, 1]],
  '50-25-25': [[0, 0, .5, 1], [.5, 0, .5, .5], [.5, .5, .5, .5]], quad: [[0, 0, .5, .5], [.5, 0, .5, .5], [0, .5, .5, .5], [.5, .5, .5, .5]]
};
const mirror = f => rtl() ? [1 - f[0] - f[2], f[1], f[2], f[3]] : f; // snap layouts read right-to-left in Arabic
const sameF = (a, b) => a && b && a.every((v, i) => Math.abs(v - b[i]) < .001);

const zOf = w => +w.el.style.zIndex || 0;
const visibleWins = () => [...WM.wins.values()].filter(w => !w.min && !w.closing).sort((a, b) => zOf(a) - zOf(b));
const front = () => visibleWins().at(-1);
const applyGeo = w => {
  const g = w.geo, s = w.el.style;
  s.left = g.x + 'px'; s.top = g.y + 'px'; s.width = g.w + 'px';
  if (g.h) { s.height = g.h + 'px'; s.maxHeight = ''; } else { s.height = ''; s.maxHeight = Math.max(260, w.dragged ? innerHeight - barH() - 110 : dockTop() - 10 - g.y) + 'px'; }
};
const fitGeo = w => { const a = area(), g = w.geo, h = g.h || w.el.offsetHeight; g.w = Math.min(g.w, a.W - 12); g.x = clamp(g.x, 0, Math.max(0, a.W - g.w)); g.y = clamp(g.y, a.top, Math.max(a.top, a.H - Math.min(h, a.H - a.top))); };
const animGeo = w => { if (rm()) return applyGeo(w); w.el.classList.add('anim'); applyGeo(w); clearTimeout(w.at); w.at = setTimeout(() => { w.el.classList.remove('anim'); syncPerches(); }, 340); };
const focusWin = w => {
  w.el.style.zIndex = ++WM.z;
  if (WM.z > 6000) { [...WM.wins.values()].sort((a, b) => zOf(a) - zOf(b)).forEach((v, i) => { v.el.style.zIndex = 100 + i; }); WM.z = 100 + WM.wins.size; }
  WM.wins.forEach(v => v.el.classList.toggle('front', v === w));
  syncPerches(); syncURL();
};

const reserved = () => 216 + (innerWidth > 1180 && S.widgets ? 330 : 0);
const startGeo = () => {
  const a = area(), free = a.W - reserved(), w = Math.min(620, free - 48);
  let x = Math.max(24, (free - w) / 2); if (rtl()) x = a.W - x - w;
  const y = a.H >= 860 ? Math.max(a.top + 20, 160) : a.top + Math.max(16, Math.min(56, a.H - 760));
  return { x, y, w, h: 0 };
};

const RZ = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
const fillWin = w => {
  const m = appMeta(w.id);
  $('.win-title', w.el).innerHTML = `${appTile(w.id)}<span>${esc(appTitle(w.id))}</span>`;
  $$('.lights button', w.el).forEach(b => b.setAttribute('aria-label', u({ close: 'close', min: 'minimize', max: 'zoom' }[b.dataset.wc])));
  const main = $('.win-main', w.el); main.innerHTML = m.html(w); mountApp(main, w);
};
const openWin = (id, from, o = {}) => {
  let w = WM.wins.get(id);
  if (w) { if (w.min) restoreWin(w); else { focusWin(w); if (!rm()) w.el.animate?.([{ transform: 'scale(1)' }, { transform: 'scale(1.012)' }, { transform: 'scale(1)' }], { duration: 260 }); } dockBounce(id); return w; }
  const m = appMeta(id); if (!m) return;
  const el = document.createElement('section');
  el.className = 'win glass'; el.tabIndex = -1; el.dataset.app = id; el.setAttribute('role', 'dialog');
  const tid = 'wt-' + id.replace(/[^a-z0-9]/gi, '-'); el.setAttribute('aria-labelledby', tid);
  el.innerHTML = `<div class="win-bar" data-imp="ledge"><div class="lights"><button type="button" class="l-close" data-wc="close">${I.x}</button><button type="button" class="l-min" data-wc="min">${I.minus}</button><button type="button" class="l-max" data-wc="max">${I.expand}</button></div><div class="win-title" id="${tid}"></div></div><div class="win-main"></div>${RZ.map(d => `<div class="rz rz-${d}" data-rz="${d}" aria-hidden="true"></div>`).join('')}`;
  w = { id, el, opener: from && from.isConnected ? from : document.activeElement, min: false, snap: null, tab: 'overview', key: 'w' };
  WM.wins.set(id, w);
  if (id === 'start') w.geo = startGeo();
  else {
    const a = area(), n = visibleWins().length;
    const ww = Math.min(m.size[0], a.W - 32), hh = Math.min(m.size[1], a.bottom - a.top - 20);
    w.geo = { x: (a.W - ww) / 2 + ((n % 5) - 2) * 26, y: clamp(a.top + 16 + (n % 5) * 22, a.top + 6, Math.max(a.top + 6, a.bottom - hh)), w: ww, h: hh };
  }
  fillWin(w); applyGeo(w); $('#wins').append(el); fitGeo(w); applyGeo(w);
  focusWin(w); el.focus({ preventScroll: true });
  if (!rm() && !o.instant) {
    const r = el.getBoundingClientRect(); let fr = from?.getBoundingClientRect?.();
    if (!fr || !fr.width) fr = { left: r.left + r.width / 2 - 30, top: r.top + r.height / 2 - 30, width: 60, height: 60 };
    const dx = fr.left + fr.width / 2 - (r.left + r.width / 2), dy = fr.top + fr.height / 2 - (r.top + r.height / 2), s = clamp(fr.width / r.width, .06, .5);
    el.animate([{ transform: `translate(${dx}px,${dy}px) scale(${s})`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.2,.9,.25,1.05)' });
  }
  dockSync(); dockBounce(id); setTimeout(syncPerches, 500);
  if (id.startsWith('p:')) setTimeout(() => { if (!w.closing && !w.min) Imp()?.enter?.(el); }, rm() ? 60 : 520);
  return w;
};
const stopMedia = el => $$('video', el).forEach(v => v.pause());
const closeWin = (w, instant) => {
  if (!w || w.closing) return; w.closing = true; stopMedia(w.el); hideFlyout();
  const done = () => {
    w.el.remove(); WM.wins.delete(w.id); dockSync(); fillDockIfMins();
    const f = front(); if (f) focusWin(f); else { syncPerches(); syncURL(); }
    if (!instant) { const o = w.opener; if (o && o.isConnected && o.offsetParent) o.focus({ preventScroll: true }); else f?.el.focus({ preventScroll: true }); }
  };
  if (rm() || instant) return done();
  w.el.style.pointerEvents = 'none';
  w.el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.94) translateY(10px)' }], { duration: 190, easing: 'ease-in' }).onfinish = done;
};
let minsCount = 0;
const fillDockIfMins = () => { const n = [...WM.wins.values()].filter(w => w.min).length; if (n !== minsCount) { minsCount = n; fillDock(); } };
const minimizeWin = (w, quiet) => {
  if (!w || w.min) return; stopMedia(w.el); hideFlyout();
  w.min = true; fillDockIfMins();
  const t = $(`#dock [data-dock="min:${CSS.escape(w.id)}"]`)?.getBoundingClientRect(), r = w.el.getBoundingClientRect();
  const finish = () => { w.el.classList.add('min'); w.el.classList.remove('front'); const f = front(); if (f) focusWin(f); else { syncPerches(); syncURL(); } };
  if (rm() || !t || quiet) return finish();
  w.el.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${t.left + t.width / 2 - (r.left + r.width / 2)}px,${t.top - (r.top + r.height / 2)}px) scale(.06)`, opacity: .2 }], { duration: 420, easing: 'cubic-bezier(.5,0,.7,.4)' }).onfinish = finish;
};
const restoreWin = w => {
  const t = $(`#dock [data-dock="min:${CSS.escape(w.id)}"]`)?.getBoundingClientRect();
  w.min = false; w.el.classList.remove('min'); fillDockIfMins(); focusWin(w); w.el.focus({ preventScroll: true });
  if (!rm() && t) { const r = w.el.getBoundingClientRect(); w.el.animate([{ transform: `translate(${t.left + t.width / 2 - (r.left + r.width / 2)}px,${t.top - (r.top + r.height / 2)}px) scale(.06)`, opacity: .2 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.9,.25,1.05)' }); }
  setTimeout(() => { syncPerches(); Imp()?.goTo?.($('.win-bar', w.el), 'ledge'); }, rm() ? 50 : 460);
};
const closeAllWins = instant => [...WM.wins.values()].forEach(w => closeWin(w, instant));

/* ---- snapping ---- */
const snapTo = (w, frac, layout, assist) => {
  if (!w) return;
  if (!w.snap) w.restore = { ...w.geo, h: w.geo.h || w.el.offsetHeight };
  w.snap = { frac, layout }; const r = zoneRect(frac);
  w.geo = { x: r.x, y: r.y, w: r.w, h: r.h };
  w.el.classList.toggle('maxed', layout === 'max'); w.el.classList.add('snapped');
  focusWin(w); animGeo(w); hideFlyout();
  if (assist && layout !== 'max') setTimeout(() => snapAssist(w, layout), rm() ? 30 : 360);
};
const unsnap = w => { if (!w?.snap) return; w.snap = null; w.geo = { ...(w.restore || w.geo) }; w.el.classList.remove('snapped', 'maxed'); fitGeo(w); animGeo(w); };
const toggleMax = w => { if (w.snap) unsnap(w); else snapTo(w, FULL, 'max'); };

// Snap Assist: offer the other windows for the free zones of the layout just used
const snapAssist = (w, layout) => {
  const zones = layout === '50-50-phys' || layout === 'quad-phys' ? LAYOUTS[layout.replace('-phys', '')] : (LAYOUTS[layout] || []).map(mirror);
  const taken = visibleWins().filter(v => v.snap && v.snap.layout === layout).map(v => v.snap.frac);
  const free = zones.filter(z => !taken.some(t => sameF(t, z)));
  const cands = visibleWins().filter(v => v !== w && !(v.snap && v.snap.layout === layout)).reverse();
  if (!free.length || !cands.length) return closeAssist();
  const zr = zoneRect(free[0]), box = $('#assist');
  box.hidden = false;
  box.innerHTML = `<div class="assist-zone glass" style="left:${zr.x}px;top:${zr.y}px;width:${zr.w}px;height:${zr.h}px"><p>${esc(u('assist'))}</p><div class="assist-grid">${cands.map(c => {
    const p = c.id.startsWith('p:') ? P[c.id.slice(2)] : null, pv = p && (p.shots[0] || p.phones[0]);
    return `<button type="button" class="assist-card" data-assist="${c.id}"><span class="ac-prev">${pv ? img(pv, '') : appTile(c.id)}</span><span class="ac-t">${appTile(c.id)}<span>${esc(appTitle(c.id))}</span></span></button>`;
  }).join('')}</div></div>`;
  box.dataset.layout = layout; box.dataset.zone = JSON.stringify(free[0]);
  $('.assist-card', box)?.focus({ preventScroll: true });
};
const closeAssist = () => { const b = $('#assist'); if (b && !b.hidden) { b.hidden = true; b.innerHTML = ''; } };

// Snap Layouts flyout on the green button
let flyT = 0, flyFor = null;
const showFlyout = (w, btn) => {
  clearTimeout(flyT); if (!isDesk() || !w) return;
  const f = $('#flyout'); flyFor = w;
  f.innerHTML = `<p>${esc(u('snapLayouts'))}</p><div class="fly-grid">${Object.entries(LAYOUTS).map(([k, zs]) => `<div class="fly-lay" role="group" aria-label="${k}">${zs.map(mirror).map((z, i) => `<button type="button" class="fly-zone" data-fly="${k}" data-zi="${i}" style="left:${z[0] * 100}%;top:${z[1] * 100}%;width:${z[2] * 100}%;height:${z[3] * 100}%" aria-label="${k} ${i + 1}"></button>`).join('')}</div>`).join('')}</div>`;
  f.hidden = false;
  const r = btn.getBoundingClientRect(), fw = f.offsetWidth;
  f.style.left = clamp(r.left + r.width / 2 - fw / 2, 6, innerWidth - fw - 6) + 'px'; f.style.top = (r.bottom + 8) + 'px';
};
const hideFlyout = () => { clearTimeout(flyT); const f = $('#flyout'); if (f) f.hidden = true; flyFor = null; };
const flyLater = () => { clearTimeout(flyT); flyT = setTimeout(hideFlyout, 260); };

// edge snapping while dragging
const edgeZone = (x, y) => {
  const W = innerWidth, top = barH(), c = 30, H = innerHeight;
  const L = x <= 4, R = x >= W - 5;
  if (L || R) {
    const side = L ? 0 : .5;
    if (y <= top + c) return { frac: [side, 0, .5, .5], layout: 'quad-phys' };
    if (y >= H - c) return { frac: [side, .5, .5, .5], layout: 'quad-phys' };
    return { frac: [side, 0, .5, 1], layout: '50-50-phys' };
  }
  if (y <= top + 2) { if (x <= c) return { frac: [0, 0, .5, .5], layout: 'quad-phys' }; if (x >= W - c) return { frac: [.5, 0, .5, .5], layout: 'quad-phys' }; return { frac: FULL, layout: 'max' }; }
  return null;
};
const showPreview = z => { // sits above every window except the one being dragged
  const p = $('#snap-prev'); if (!z) { p.classList.remove('on'); return; }
  if (p.parentElement.id !== 'wins') $('#wins').append(p);
  const r = zoneRect(z.frac); Object.assign(p.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px', zIndex: WM.z - 1 }); p.classList.add('on');
};

/* ---- arranging ---- */
const cascadeWins = () => {
  const list = visibleWins(), a = workArea(); if (!list.length) return;
  list.forEach((w, i) => { const m = appMeta(w.id); w.snap = null; w.el.classList.remove('snapped', 'maxed'); w.geo = { x: a.x + 18 + (i % 8) * 36, y: a.y + 8 + (i % 8) * 30, w: Math.min(m.size[0], a.w * .66), h: Math.min(m.size[1] || 560, a.h * .82) }; animGeo(w); focusWin(w); });
  toast(u('t_cascaded'), I.stack);
};
const tileWins = () => {
  const list = visibleWins(), n = list.length; if (!n) return;
  const cols = n <= 3 ? n : Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols);
  list.forEach((w, i) => { const r = Math.floor(i / cols), k = r === rows - 1 ? n - cols * (rows - 1) : cols, c = i - r * cols; snapTo(w, mirror([c / k, r / rows, 1 / k, 1 / rows]), 'tile'); });
  toast(u('t_tiled'), I.grid);
};
const showDesktop = () => {
  const vis = visibleWins();
  if (vis.length) { WM.hiddenByDesk = vis.map(w => w.id); vis.forEach(w => minimizeWin(w)); toast(u('t_desktop'), I.eye); }
  else { WM.hiddenByDesk.forEach(id => { const w = WM.wins.get(id); if (w?.min) restoreWin(w); }); WM.hiddenByDesk = []; }
};
const snapKey = (w, k) => {
  if (!w) return;
  const half = s => w.snap && sameF(w.snap.frac, [s, 0, .5, 1]);
  if (k === 'ArrowLeft') { if (half(.5)) unsnap(w); else snapTo(w, [0, 0, .5, 1], '50-50-phys', true); }
  if (k === 'ArrowRight') { if (half(0)) unsnap(w); else snapTo(w, [.5, 0, .5, 1], '50-50-phys', true); }
  if (k === 'ArrowUp') { if (half(0)) snapTo(w, [0, 0, .5, .5], 'quad-phys'); else if (half(.5)) snapTo(w, [.5, 0, .5, .5], 'quad-phys'); else snapTo(w, FULL, 'max'); }
  if (k === 'ArrowDown') { if (w.snap) unsnap(w); else minimizeWin(w); }
};

/* ---- perches: only uncovered bars, and the front window's insides ---- */
const syncPerches = () => {
  const list = visibleWins(), f = list.at(-1);
  WM.wins.forEach(w => { if (w.min) { w.el.removeAttribute('data-imp'); $('.win-bar', w.el).removeAttribute('data-imp'); } });
  list.forEach((w, i) => {
    const r = w.el.getBoundingClientRect(), isF = w === f;
    const covered = list.slice(i + 1).some(o => { const q = o.el.getBoundingClientRect(); const ov = Math.min(r.right, q.right) - Math.max(r.left, q.left); return q.top <= r.top + 2 && q.bottom >= r.top && ov > r.width * .4; });
    const bar = $('.win-bar', w.el); covered ? bar.removeAttribute('data-imp') : bar.setAttribute('data-imp', 'ledge');
    isF ? w.el.setAttribute('data-imp', 'base') : w.el.removeAttribute('data-imp');
    $$('.hang-title', w.el).forEach(t => isF && t.offsetParent ? t.setAttribute('data-imp', 'hang') : t.removeAttribute('data-imp'));
    $$('.frame', w.el).forEach(fr => isF ? fr.setAttribute('data-imp', 'inside') : fr.removeAttribute('data-imp'));
  });
  const top = SH.at(-1);
  $$('.sheet').forEach(s => { const on = top && s === top.el; $$('.hang-title', s).forEach(t => on ? t.setAttribute('data-imp', 'hang') : t.removeAttribute('data-imp')); $$('.frame', s).forEach(fr => on ? fr.setAttribute('data-imp', 'inside') : fr.removeAttribute('data-imp')); });
};

/* ---- the address bar follows the front window that has an address ---- */
let urlLive = false;
const currentApp = () => {
  const list = isDesk() ? visibleWins().map(w => w.id) : SH.map(s => s.id);
  for (let i = list.length - 1; i >= 0; i--) if (list[i] === 'notfound' || href(list[i])) return list[i];
  return null;
};
// an unknown address keeps its path (in the chosen language when it has one); elsewhere "not found" is /xx/404/
const urlFor = (id, l = lang) => id === 'notfound' ? (ROUTE_APP === 'notfound' && /^\/(en|ar)\//.test(location.pathname) ? location.pathname.replace(/^\/(en|ar)\//, `/${l}/`) : ROUTE_APP === 'notfound' && l === lang ? location.pathname : `/${l}/404/`) : href(id || 'start', l);
const syncURL = () => {
  const id = currentApp(), lb = $('#langBtn');
  if (lb) lb.href = urlFor(id, other());
  if (!urlLive) return;
  const url = urlFor(id);
  if (url && location.pathname !== url) { try { history.replaceState(history.state, '', url); } catch { } }
  document.title = titleFor(id);
};

/* ---- pointer: focus, drag (with edge snapping), resize from every edge ---- */
document.addEventListener('pointerdown', e => {
  const winEl = e.target.closest('.win'); if (!winEl) return;
  const w = WM.wins.get(winEl.dataset.app); if (!w) return;
  if (!winEl.classList.contains('front')) focusWin(w);
  if (e.button !== 0) return;
  const bar = e.target.closest('.win-bar'), rz = e.target.closest('[data-rz]');
  if (bar && !e.target.closest('button')) {
    e.preventDefault(); bar.setPointerCapture(e.pointerId);
    let sx = e.clientX, sy = e.clientY, g0 = { ...w.geo }, h = w.geo.h || winEl.offsetHeight, moved = false, zone = null;
    const move = ev => {
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
      if (!moved) {
        moved = true; winEl.classList.add('dragging'); hideFlyout(); closeAssist();
        if (w.snap) { // a snapped or maximized window goes back to its own size under the pointer
          const rel = clamp((sx - g0.x) / g0.w, .1, .9), p = w.restore || g0; w.snap = null; winEl.classList.remove('snapped', 'maxed');
          w.geo = { ...p, x: ev.clientX - rel * p.w, y: Math.max(barH(), ev.clientY - 20) }; g0 = { ...w.geo }; sx = ev.clientX; sy = ev.clientY; h = w.geo.h || winEl.offsetHeight; applyGeo(w);
        }
      }
      const a = area();
      w.geo.x = clamp(g0.x + ev.clientX - sx, 0, Math.max(0, a.W - g0.w));
      w.geo.y = clamp(g0.y + ev.clientY - sy, a.top, Math.max(a.top, a.H - Math.min(h, a.H - a.top)));
      winEl.style.left = w.geo.x + 'px'; winEl.style.top = w.geo.y + 'px';
      zone = edgeZone(ev.clientX, ev.clientY); showPreview(zone);
    };
    const up = () => {
      bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up);
      winEl.classList.remove('dragging'); showPreview(null);
      if (!moved) return;
      w.dragged = true;
      if (zone) { snapTo(w, zone.frac, zone.layout, true); toast(u('t_snapped'), I.grid); } else { applyGeo(w); syncPerches(); }
    };
    bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up);
  } else if (rz) {
    e.preventDefault(); rz.setPointerCapture(e.pointerId);
    const dir = rz.dataset.rz, sx = e.clientX, sy = e.clientY, m = appMeta(w.id), [minW, minH] = m.min || [380, 260];
    if (w.snap) { w.snap = null; winEl.classList.remove('snapped', 'maxed'); }
    const g0 = { ...w.geo, h: w.geo.h || winEl.offsetHeight };
    winEl.classList.add('resizing');
    const move = ev => {
      const a = area(), dx = ev.clientX - sx, dy = ev.clientY - sy; let { x, y, w: ww, h } = g0;
      if (dir.includes('e')) ww = clamp(g0.w + dx, minW, a.W - g0.x);
      if (dir.includes('s')) h = clamp(g0.h + dy, minH, a.H - g0.y);
      if (dir.includes('w')) { const nx = clamp(g0.x + dx, 0, g0.x + g0.w - minW); ww = g0.x + g0.w - nx; x = nx; }
      if (dir.includes('n')) { const ny = clamp(g0.y + dy, a.top, g0.y + g0.h - minH); h = g0.y + g0.h - ny; y = ny; }
      w.geo = { x, y, w: ww, h }; applyGeo(w);
    };
    const up = () => { rz.removeEventListener('pointermove', move); rz.removeEventListener('pointerup', up); rz.removeEventListener('pointercancel', up); winEl.classList.remove('resizing'); w.dragged = true; syncPerches(); };
    rz.addEventListener('pointermove', move); rz.addEventListener('pointerup', up); rz.addEventListener('pointercancel', up);
  }
});
document.addEventListener('dblclick', e => { const bar = e.target.closest('.win-bar'); if (bar && !e.target.closest('button')) { const w = WM.wins.get(bar.closest('.win').dataset.app); if (w) toggleMax(w); } });
// snap layouts flyout on hover of the green button
document.addEventListener('pointerover', e => {
  if (!FINE) return;
  const mx = e.target.closest?.('.l-max');
  if (mx) { const w = WM.wins.get(mx.closest('.win').dataset.app); clearTimeout(flyT); flyT = setTimeout(() => showFlyout(w, mx), 380); return; }
  if (e.target.closest?.('#flyout')) { clearTimeout(flyT); return; }
  if (!$('#flyout').hidden) flyLater(); else clearTimeout(flyT);
});


/* ===== shell: menu bar, desktop, home screen, dock, menus, Spotlight, sheets, lightbox, settings, terminal, boot ===== */

/* ---- top bar ---- */
const syncThemeBtn = () => {
  const b = $('#themeBtn'); if (!b) return; const to = theme === 'dark' ? 'light' : 'dark';
  b.dataset.impSet = to; b.setAttribute('aria-label', u(to === 'dark' ? 'toDark' : 'toLight')); b.title = b.getAttribute('aria-label');
  b.innerHTML = theme === 'dark' ? I.moon : I.sun;
};
const fillTopbar = () => {
  const tb = $('#topbar');
  tb.setAttribute('aria-label', u('menuBar'));
  tb.innerHTML = topbarHTML({ hidden: !!Imp()?.state().hidden, langHref: urlFor(currentApp() || (urlLive ? null : ROUTE_APP), other()) });
  syncThemeBtn(); tickClock();
};

/* ---- desktop: icons and widgets ---- */
const fillDesk = () => {
  $('.desk').setAttribute('aria-label', u('desktop')); $('.icons').setAttribute('aria-label', T(A.ui.allWork));
  $('.icons').innerHTML = iconsHTML(S.icons);
  $('.widgets').hidden = !S.widgets;
  $('.widgets').innerHTML = widgetsHTML();
  const h1 = $('.desk h1'); if (h1) h1.textContent = `${T(A.person.name)} · ${T(A.person.headline)}`;
};
const fillHome = () => { $('.home').setAttribute('aria-label', u('home')); $('.home').innerHTML = homeHTML(); };

/* ---- dock ---- */
const fillDock = () => {
  const d = $('#dock'); d.setAttribute('aria-label', u('dock')); d.setAttribute('data-imp', 'ledge');
  d.innerHTML = dockHTML(isDesk() ? [...WM.wins.values()].filter(w => w.min) : []);
  dockSync();
};
const dockSync = () => $$('#dock [data-dock]').forEach(b => { const id = b.dataset.dock; if (!id.startsWith('min:')) b.classList.toggle('running', WM.wins.has(id) || SH.some(s => s.id === id)); });
const dockBounce = id => { if (rm()) return; const b = $(`#dock [data-dock="${CSS.escape(id)}"]`); if (!b) return; b.classList.remove('bounce'); void b.offsetWidth; b.classList.add('bounce'); setTimeout(() => b.classList.remove('bounce'), 720); };

/* ---- sheets (phone) ---- */
const SH = [];
const markHome = on => ['.home', '#topbar', '#dock'].forEach(s => $(s)?.classList.toggle('imp-chrome', on));
const setTopSheet = () => { SH.forEach((s, i) => s.el.classList.toggle('top', i === SH.length - 1)); syncPerches(); };
const fillSheet = s => {
  $('.sheet-bar h2', s.el).innerHTML = `${appTile(s.id)}<span>${esc(appTitle(s.id))}</span>`;
  $('.sheet-bar', s.el).title = u('swipe');
  $('.sheet-close', s.el).setAttribute('aria-label', u('close'));
  const main = $('.sheet-main', s.el); main.innerHTML = appMeta(s.id).html(s); mountApp(main, s);
};
const sheetsOpened = () => { markHome(true); $('.home').classList.add('behind'); doc.style.overflow = 'hidden'; };
const openSheet = (id, from) => {
  const ex = SH.find(s => s.id === id);
  if (ex) { while (SH.at(-1) !== ex) closeSheet(SH.at(-1), true); syncURL(); return; }
  if (!appMeta(id)) return;
  const el = document.createElement('section'), tid = 'st-' + id.replace(/[^a-z0-9]/gi, '-') + '-' + SH.length;
  el.className = 'sheet glass'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', tid); el.tabIndex = -1; el.dataset.app = id;
  el.innerHTML = `<div class="sheet-bar" title="${esc(u('swipe'))}"><span class="grab" aria-hidden="true"></span><h2 id="${tid}"></h2><button type="button" class="sheet-close" data-sc>${I.x}</button></div><div class="sheet-main" data-imp-scroll></div>`;
  const s = { id, el, opener: from && from.isConnected ? from : document.activeElement, tab: 'overview', key: 'sh' + SH.length };
  SH.push(s); fillSheet(s); $('#sheets').append(el);
  if (SH.length === 1) sheetsOpened();
  setTopSheet(); dockSync(); syncURL();
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('open')));
  setTimeout(() => { $('.sheet-close', el).focus({ preventScroll: true }); syncPerches(); if (id.startsWith('p:') && Imp()?.enter) Imp().enter(el); else if (Imp()?.state().mode === 'perch') Imp().go('ledge') || Imp().go('hang'); }, rm() ? 90 : 460);
};
// the page's own window came drawn by the build: take it over as the first sheet instead of drawing it again
const adoptSheet = el => {
  const s = { id: el.dataset.app, el, opener: null, tab: 'overview', key: 'st' };
  el.removeAttribute('data-ssr'); el.classList.add('open');
  SH.push(s); mountApp($('.sheet-main', el), s); sheetsOpened(); setTopSheet(); dockSync();
  whenImp(() => { if (SH.includes(s)) setTimeout(() => { if (SH.at(-1) === s) Imp()?.enter?.(el); }, 900); });
};
const closeSheet = (s, instant) => {
  const i = SH.indexOf(s); if (i < 0) return;
  SH.splice(i, 1); stopMedia(s.el);
  if (!SH.length) { markHome(false); $('.home').classList.remove('behind'); doc.style.overflow = ''; }
  s.el.classList.remove('open'); s.el.style.transform = '';
  setTimeout(() => s.el.remove(), instant || rm() ? 0 : 440);
  setTopSheet(); dockSync(); syncURL();
  if (!instant) { const o = s.opener; if (o && o.isConnected) o.focus({ preventScroll: true }); }
};
const closeAllSheets = instant => [...SH].reverse().forEach(s => closeSheet(s, instant));
document.addEventListener('pointerdown', e => { // drag a sheet down to close it
  const bar = e.target.closest('.sheet-bar'); if (!bar || e.target.closest('button')) return;
  const el = bar.closest('.sheet'), s = SH.find(x => x.el === el); if (!s) return;
  bar.setPointerCapture(e.pointerId); el.classList.add('dragging');
  const sy = e.clientY, t0 = performance.now(); let dy = 0;
  const move = ev => { dy = Math.max(0, ev.clientY - sy); el.style.transform = `translateY(${dy}px)`; };
  const up = () => {
    bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up);
    el.classList.remove('dragging'); const v = dy / Math.max(1, performance.now() - t0);
    if (dy > 110 || (v > .6 && dy > 30)) closeSheet(s); else el.style.transform = '';
  };
  bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up);
});

/* ---- apps on either form factor ---- */
const openApp = (id, from) => { closeMenus(); closeSpot(); urlLive = true; return isDesk() ? openWin(id, from) : openSheet(id, from); };
const hostState = el => { const h = el.closest('.win, .sheet'); if (!h) return null; return h.classList.contains('win') ? WM.wins.get(h.dataset.app) : SH.find(s => s.el === h); };
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { const v = en.target; if (en.isIntersecting && !rm() && !v.closest('.min')) v.play().catch(() => { }); else v.pause(); }), { threshold: .5 }) : null;
// a video's poster loads when the video comes near the screen (posters in closed tabs or far down a window wait)
const setPoster = v => { if (v.dataset.poster) { v.poster = v.dataset.poster; v.removeAttribute('data-poster'); } posterIO?.unobserve(v); };
const posterIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) setPoster(en.target); }), { rootMargin: '300px' }) : null;
const mountApp = root => {
  $$('.stage video[controls]', root).forEach(v => v.removeAttribute('controls')); // native controls are only for pages read without JavaScript
  $$('video[data-poster]', root).forEach(v => posterIO ? posterIO.observe(v) : setPoster(v));
  // the part that scrolls (a window's scroller, or the whole sheet on a phone) takes focus, so the keyboard can scroll it
  if (root.classList.contains('sheet-main')) root.tabIndex = 0; else $$('.scroller', root).forEach(s => { s.tabIndex = 0; });
  $$('video[data-autoview]', root).forEach(v => { io?.observe(v); v.addEventListener('pointerenter', () => { if (!rm()) v.play().catch(() => { }); }); v.addEventListener('click', () => v.paused ? v.play().catch(() => { }) : v.pause()); });
  if ($('.term-in', root)) mountTerminal(root);
  if ($('.settings', root)) syncSettingsUI(root);
  if ($('[data-clock]', root)) tickClock();
};

/* ---- lightbox: Imp steps aside while a screen is enlarged ---- */
let lb = null;
const lbEl = () => $('#lightbox');
const openLB = (group, i, opener) => {
  const list = (LB ||= lbLists())[group]; if (!list?.length) return;
  const wasShown = !!Imp() && !Imp().state().hidden && !lb;
  lb = { list, i: clamp(i, 0, list.length - 1), opener, impBack: wasShown || lb?.impBack };
  if (wasShown) Imp().hide(true);
  const L = lbEl(); L.hidden = false; L.setAttribute('aria-label', list[0].cap.split(' · ')[0]);
  $('.lb-prev', L).setAttribute('aria-label', u('prev')); $('.lb-next', L).setAttribute('aria-label', u('next')); $('.lb-close', L).setAttribute('aria-label', u('close'));
  renderLB(); $('.lb-close', L).focus({ preventScroll: true });
};
const renderLB = () => { const m = lb.list[lb.i], L = lbEl(), im = $('img', L); im.src = m.src; im.width = m.w; im.height = m.h; im.alt = m.cap; $('.cap', L).textContent = m.cap; $('.count', L).textContent = `${lb.i + 1} / ${lb.list.length}`; im.style.animation = 'none'; void im.offsetWidth; im.style.animation = ''; };
const stepLB = d => { if (!lb) return; lb.i = (lb.i + d + lb.list.length) % lb.list.length; renderLB(); };
const closeLB = () => { if (!lb) return; lbEl().hidden = true; const o = lb.opener, back = lb.impBack; lb = null; if (back) Imp()?.show(); if (o?.isConnected) o.focus({ preventScroll: true }); };
(() => {
  let sx = null;
  document.addEventListener('pointerdown', e => { if (e.target.closest('#lightbox') && !e.target.closest('button')) sx = e.clientX; });
  document.addEventListener('pointerup', e => {
    if (sx === null || !lb) return; const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 50) stepLB((dx < 0 ? 1 : -1) * (rtl() ? -1 : 1));
    else if (e.target.id === 'lightbox' || e.target.tagName === 'FIGURE') closeLB();
  });
})();

/* ---- Imp: size, visibility, reactions ---- */
// imp:size detail is { size, min: at the smallest, max: at the largest, sizes }; his default size is 0.8 (shown as 100%)
let IMPSIZE = { size: .8, min: false, max: false }, impAsk = null;
const atMax = () => IMPSIZE.max === true, atMin = () => IMPSIZE.min === true;
const syncImpSize = (root = document) => {
  $$('[data-imp-size="grow"]', root).forEach(b => { b.disabled = atMax(); }); $$('[data-imp-size="shrink"]', root).forEach(b => { b.disabled = atMin(); });
  const base = .8; $$('[data-imp-size-readout]', root).forEach(o => { o.textContent = Math.round(IMPSIZE.size / base * 100) + '%'; });
};
const impGrow = () => { if (!Imp()) return; if (Imp().state().hidden) Imp().show(); if (atMax()) return toast(u('t_limit'), I.paw); impAsk = 'grow'; Imp().grow?.(); };
const impShrink = () => { if (!Imp()) return; if (Imp().state().hidden) Imp().show(); if (atMin()) return toast(u('t_limit'), I.paw); impAsk = 'shrink'; Imp().shrink?.(); };
const toggleImp = () => { if (!Imp()) { loadImp(); whenImp(() => Imp().state().hidden && Imp().show()); return; } const h = Imp().state().hidden; h ? Imp().show() : Imp().hide(); };
// without him the lights still flip, by hand
const lights = () => { closeMenus(); if (!Imp()) return setSetting('theme', theme === 'dark' ? 'light' : 'dark'); if (Imp().state().hidden) Imp().show(); Imp().lights(); };
const laugh = () => { closeMenus(); if (!Imp()) return; if (Imp().state().hidden) Imp().show(); setTimeout(() => Imp()?.react('react-laugh'), 60); };
document.addEventListener('imp:size', e => {
  IMPSIZE = { ...IMPSIZE, ...(e.detail || {}) }; syncImpSize();
  if (impAsk) { toast(u(impAsk === 'grow' ? 't_grow' : 't_shrink'), impAsk === 'grow' ? I.plus : I.minus); impAsk = null; }
});
document.addEventListener('imp:visibility', e => {
  $('#impBtn')?.classList.toggle('imp-off', e.detail.hidden);
  $$('[data-mi-imp]').forEach(b => b.setAttribute('aria-checked', String(!e.detail.hidden)));
  $$('[data-set="imp"]').forEach(b => b.setAttribute('aria-checked', String(!e.detail.hidden)));
});
document.addEventListener('imp:costume', e => { if (e.detail?.costume === 'gear5') toast(u('t_gear5'), I.sparkle); });

/* ---- menus ---- */
let menu = null;
const MI = (label, run, o = {}) => ({ label, run, ...o }), SEP = { sep: true };
const menuItems = kind => {
  const desk = isDesk(), f = front(), st = Imp()?.state() || {};
  if (kind === 'os') return [MI(u('aboutOS'), () => openApp('aboutos'), { icon: SYS.aboutos() }), MI(u('settingsDots'), () => openApp('settings'), { icon: SYS.settings(), kbd: mod() + ' ,' }), MI(u('privacy'), () => openApp('privacy'), { icon: SYS.privacy() }), SEP,
    ...(desk ? [MI(u('cascade'), cascadeWins, { icon: I.stack, disabled: !visibleWins().length }), MI(u('tileAll'), tileWins, { icon: I.grid, kbd: 'Ctrl Alt G', disabled: !visibleWins().length }), MI(u('showDesktop'), showDesktop, { icon: I.eye, kbd: 'Ctrl Alt D' }), MI(u('closeAll'), () => closeAllWins(), { icon: I.x, disabled: !WM.wins.size }), SEP] : []),
    MI(u('restart'), restart, { icon: I.restart })];
  if (kind === 'work') return [...A.projects.map(p => MI(T(p.name), () => openApp('p:' + p.slug), { icon: tileFor(p), kbd: stageLabel(p.stage) })), SEP, MI(u('allProjects'), () => openApp('work'), { icon: SYS.work() })];
  if (kind === 'window') {
    const vis = visibleWins().reverse();
    return [MI(u('minimize'), () => minimizeWin(f), { disabled: !f, icon: I.minus }), MI(f?.snap ? u('restore') : u('zoom'), () => toggleMax(f), { disabled: !f, icon: I.expand }),
      MI(u('snapLeft'), () => snapKey(f, 'ArrowLeft'), { disabled: !f, kbd: 'Ctrl Alt ←' }), MI(u('snapRight'), () => snapKey(f, 'ArrowRight'), { disabled: !f, kbd: 'Ctrl Alt →' }), SEP,
      MI(u('cascade'), cascadeWins, { icon: I.stack, disabled: !vis.length }), MI(u('tileAll'), tileWins, { icon: I.grid, disabled: !vis.length }), MI(u('showDesktop'), showDesktop, { icon: I.eye }), MI(u('closeAll'), () => closeAllWins(), { icon: I.x, disabled: !WM.wins.size }), SEP,
      { head: vis.length ? u('openWindows') : u('noWindows') }, ...vis.map(w => MI(appTitle(w.id), () => focusWin(w), { icon: appTile(w.id), role: 'menuitemradio', checked: w === f }))];
  }
  if (kind === 'help') return [MI(u('shortcuts'), () => openApp('help'), { icon: SYS.help(), kbd: '?' }), MI(u('search'), openSpot, { icon: I.search, kbd: mod() + ' K' }), MI(u('terminal'), () => openApp('terminal'), { icon: SYS.terminal(), kbd: 'Ctrl Alt T' }), SEP, MI(u('aboutOS'), () => openApp('aboutos'), { icon: SYS.aboutos() }), MI(u('privacy'), () => openApp('privacy'), { icon: SYS.privacy() })];
  if (kind === 'imp' || kind === 'impctx') return [...(kind === 'imp' ? [{ head: 'imp' }] : []),
    MI(u('impOnDesk'), toggleImp, { role: 'menuitemcheckbox', checked: !!Imp() && !st.hidden, sw: true, attr: 'data-mi-imp', keep: true }),
    MI(u('grow'), impGrow, { icon: I.plus, disabled: !Imp() || atMax(), keep: true, attr: 'data-imp-size="grow"' }), MI(u('shrink'), impShrink, { icon: I.minus, disabled: !Imp() || atMin(), keep: true, attr: 'data-imp-size="shrink"' }), SEP,
    MI(u('flip'), lights, { icon: I.sparkle }), MI(u('laugh'), laugh, { icon: I.paw, disabled: !Imp() }), ...(kind === 'impctx' ? [MI(u('hideImp'), () => Imp()?.hide(), { icon: I.eye })] : [])];
  if (kind === 'desk') return [{ head: u('arrangeIcons') }, ...['default', 'name', 'stage'].map(k => MI(u({ default: 'byDefault', name: 'byName', stage: 'byStage' }[k]), () => setSetting('icons', k), { role: 'menuitemradio', checked: S.icons === k })), SEP,
    { head: u('changeWall') }, ...WALLS.map(k => MI(u('W_' + k), () => setSetting('wall', k), { role: 'menuitemradio', checked: S.wall === k })), SEP,
    MI(u('tileAll'), tileWins, { icon: I.grid, disabled: !visibleWins().length }), MI(u('cascade'), cascadeWins, { icon: I.stack, disabled: !visibleWins().length }), MI(u('showDesktop'), showDesktop, { icon: I.eye }), MI(u('settingsDots'), () => openApp('settings'), { icon: I.gear })];
  return [];
};
const menuHTML = items => items.map((it, i) => {
  if (it.sep) return '<hr>';
  if (it.head === 'imp') return `<div class="im-head">${window.IMP2 ? '<canvas aria-hidden="true"></canvas>' : '<span class="boot-imp mini" aria-hidden="true"></span>'}<div><b>${esc(u('impName'))}</b><p>${esc(u('impLine'))}</p><output data-imp-size-readout></output></div></div>`;
  if (it.head) return `<div class="mh" role="presentation">${esc(it.head)}</div>`;
  const role = it.role || 'menuitem', mark = role === 'menuitemradio' && !it.icon ? `<span class="ic radio" aria-hidden="true"></span>` : it.icon ? `<span class="ic">${it.icon}</span>` : '<span class="ic"></span>';
  return `<button type="button" class="mi" role="${role}" data-mi="${i}" ${it.attr || ''} ${it.disabled ? 'disabled' : ''} ${role !== 'menuitem' ? `aria-checked="${!!it.checked}"` : ''}>${mark}<span class="ml">${esc(it.label)}</span>${it.sw ? '<span class="switch" aria-hidden="true"></span>' : ''}${it.kbd ? `<small>${esc(it.kbd)}</small>` : ''}</button>`;
}).join('');
const closeMenus = () => { if (!menu) return; menu.cameo?.stop(); menu.el.remove(); menu.btn?.setAttribute('aria-expanded', 'false'); menu = null; };
const openMenu = (kind, btn, at, viaKey) => {
  closeMenus(); closeSpot();
  const items = menuItems(kind), el = document.createElement('div');
  el.className = 'menu glass' + (kind.startsWith('imp') ? ' imp-menu' : ''); el.setAttribute('role', 'menu');
  el.innerHTML = menuHTML(items); document.body.append(el);
  const mw = el.offsetWidth, mh = el.offsetHeight;
  let x, y;
  if (btn) { const r = btn.getBoundingClientRect(); x = (rtl() !== (kind === 'imp')) ? r.right - mw : r.left; y = r.bottom + 6; btn.setAttribute('aria-expanded', 'true'); }
  else { x = at.x; y = at.y; if (rtl()) x -= mw; }
  el.style.left = clamp(x, 6, innerWidth - mw - 6) + 'px'; el.style.top = clamp(y, 6, innerHeight - mh - 6) + 'px';
  menu = { el, btn, kind, items, at: performance.now(), hover: false };
  if (kind === 'imp' && window.IMP2) menu.cameo = cameo($('canvas', el), { clip: 'wave', scale: 1.6, then: 'idle', flip: rtl() });
  syncImpSize(el);
  if (viaKey || !btn) $('.mi:not([disabled])', el)?.focus({ preventScroll: true });
};
document.addEventListener('pointerover', e => { if (!menu?.btn) return; const b = e.target.closest?.('#topbar [data-menu]'); if (b && b !== menu.btn && FINE) { openMenu(b.dataset.menu, b); menu.hover = true; } });

/* ---- Spotlight ---- */
let spot = null;
const norm = s => String(s || '').toLowerCase().replace(/[ً-ٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
const both = (en, ar) => en + ' ' + ar;
const spotIndex = () => {
  const c = A.contact, key = id => ({ about: 'aboutAmir', help: 'shortcuts', aboutos: 'aboutOS' }[id] || id);
  const app = id => ({ t: appTitle(id), s: u('app'), ic: appTile(id), kind: u('app'), k: both(U[key(id)]?.[0] || id, U[key(id)]?.[1] || ''), run: () => openApp(id) });
  const act = (t, k, ic, run, sug) => ({ t, s: '', ic: `<span class="tile sys" style="--tg:linear-gradient(150deg,#56656c,#2b3940)">${ic}</span>`, kind: u('action'), k, run, sug });
  return [
    ...['work', 'films', 'about', 'contact', 'settings'].map(id => ({ ...app(id), sug: true })), ...['lab', 'help', 'terminal', 'aboutos', 'start', 'privacy'].map(app),
    ...A.projects.map((p, i) => ({ t: T(p.name), s: T(p.category), ic: tileFor(p), kind: u('project'), sug: i < 3, k: [p.name.en, p.name.ar, p.category.en, p.category.ar, p.pitch.en, p.tags.join(' '), p.stack.join(' '), p.slug].join(' '), run: () => openApp('p:' + p.slug) })),
    ...A.lab.map(l => ({ t: l.name, s: T(l.line), ic: tileFor(l), kind: u('labItem'), k: both(l.line.en, l.line.ar), run: () => openApp('lab') })),
    ...ALLFILMS.map((v, i) => ({ t: filmTitle(v), s: T(v.p.name), ic: tileFor(v.p), kind: u('film'), k: both((FILM[v.name] || [])[0] || '', (FILM[v.name] || [])[1] || '') + ' film video فيلم', run: () => { openApp('films'); setTimeout(() => { const pl = $('.win[data-app=films] [data-player]') || $('.sheet.top [data-player]'); if (pl) selectFilm(pl, i, false); }, 120); } })),
    act(T(A.ui.copy) + ': ' + c.email, 'copy email mail نسخ البريد', I.copy, () => copyEmail(), true),
    act(T(A.ui.call) + ' ' + c.phoneDisplay, 'call phone اتصال هاتف', I.phone, () => { location.href = 'tel:' + c.phone; }),
    act(T(A.ui.whatsapp), 'whatsapp message واتساب', I.chat, () => window.open(c.whatsapp, '_blank', 'noopener')),
    act('GitHub', 'github code', I.gh, () => window.open(c.github, '_blank', 'noopener')), act('LinkedIn', 'linkedin', I.li, () => window.open(c.linkedin, '_blank', 'noopener')),
    act(u('flip'), 'theme dark light lights سمة إضاءة', I.sparkle, () => setSetting('theme', theme === 'dark' ? 'light' : 'dark')),
    act(T(A.ui.language), 'language arabic english لغة عربية انجليزية', I.globe, () => setLang(other())),
    act(u('grow') + ' · ' + u('impName'), 'imp grow bigger mascot كبر', I.plus, impGrow), act(u('shrink') + ' · ' + u('impName'), 'imp shrink smaller mascot صغر', I.minus, impShrink),
    act(u('laugh'), 'imp laugh mascot', I.paw, laugh),
    ...(isDesk() ? [act(u('tileAll'), 'tile arrange windows ترتيب', I.grid, tileWins), act(u('cascade'), 'cascade arrange windows', I.stack, cascadeWins), act(u('showDesktop'), 'desktop minimize all', I.eye, showDesktop)] : []),
    act(u('edu'), 'education mmu university multimedia melaka malaysia degree جامعة تعليم', I.cap, () => openApp('about')),
    act(u('restart'), 'restart reboot boot', I.restart, restart)
  ];
};
const score = (it, q) => { const t = norm(it.t), k = norm(it.k + ' ' + it.s); return t.startsWith(q) ? 4 : t.includes(q) ? 3 : k.split(/\s+/).some(w => w.startsWith(q)) ? 2 : k.includes(q) ? 1 : 0; };
const openSpot = () => {
  if (spot) return closeSpot();
  closeMenus();
  const box = $('#spot'); box.hidden = false;
  box.innerHTML = `<div class="spot-box glass"><div class="spot-in">${I.search}<input type="search" role="combobox" aria-expanded="true" aria-controls="spot-list" aria-autocomplete="list" placeholder="${esc(u('searchPh'))}" aria-label="${esc(u('search'))}"><kbd>Esc</kbd></div><ul id="spot-list" role="listbox" aria-label="${esc(u('search'))}"></ul><p class="spot-foot">${esc(u('searchHint'))}</p></div>`;
  box.setAttribute('aria-label', u('search'));
  spot = { items: spotIndex(), sel: 0, list: [], opener: document.activeElement };
  const inp = $('input', box); renderSpot(''); inp.focus();
  inp.addEventListener('input', () => renderSpot(inp.value));
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); spot.sel = (spot.sel + (e.key === 'ArrowDown' ? 1 : -1) + spot.list.length) % Math.max(1, spot.list.length); markSpot(); }
    if (e.key === 'Enter') { e.preventDefault(); runSpot(spot.sel); }
  });
};
const renderSpot = q => {
  const n = norm(q.trim());
  let res = n ? spot.items.map(i => [i, score(i, n)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).map(x => x[0]) : spot.items.filter(i => i.sug);
  spot.list = res.slice(0, 9); spot.sel = 0;
  $('#spot-list').innerHTML = spot.list.length ? spot.list.map((it, i) => `<li role="option" id="so${i}" data-so="${i}" aria-selected="${i === 0}">${it.ic}<span class="so-t"><b>${esc(it.t)}</b>${it.s ? `<small>${esc(it.s)}</small>` : ''}</span><em>${esc(it.kind)}</em></li>`).join('') : `<li class="empty" role="option" aria-disabled="true" aria-selected="false">${esc(u('noResults'))}</li>`;
  markSpot();
};
const markSpot = () => { $$('#spot-list [data-so]').forEach(li => li.setAttribute('aria-selected', String(+li.dataset.so === spot.sel))); const inp = $('#spot input'); inp?.setAttribute('aria-activedescendant', spot.list.length ? 'so' + spot.sel : ''); $('#so' + spot.sel)?.scrollIntoView({ block: 'nearest' }); };
const runSpot = i => { const it = spot?.list[i]; if (!it) return; closeSpot(true); it.run(); };
const closeSpot = keepFocus => { const b = $('#spot'); if (!spot || !b) return; const o = spot.opener; spot = null; b.hidden = true; b.innerHTML = ''; if (!keepFocus && o?.isConnected) o.focus({ preventScroll: true }); };

/* ---- settings ---- */
// root-level changes restyle the whole page, so each one only touches the root when the value really changes
const setRoot = (k, v) => { if (doc.dataset[k] !== v) doc.dataset[k] = v; };
const applyTheme = () => { theme = S.theme === 'auto' ? (osDark.matches ? 'dark' : 'light') : S.theme; setRoot('theme', theme); syncThemeBtn(); };
const applyAccent = () => {
  const [a1, a2, ink] = ACCENTS[S.accent] || ACCENTS.amber, amber = a1 === ACCENTS.amber[0];
  if (amber && !doc.style.getPropertyValue('--acc1')) return; // the stylesheet's own amber
  doc.style.setProperty('--acc1', a1); doc.style.setProperty('--acc2', a2); doc.style.setProperty('--acc-ink', ink);
};
// the page arrives with the default wallpaper drawn; any other is drawn the first time it is chosen
const applyWall = () => {
  const k = WALLS.includes(S.wall) ? S.wall : 'corniche', wall = $('.wall');
  if (wall && !$(`.wp[data-wp="${k}"]`, wall)) wall.insertAdjacentHTML('afterbegin', wallHTML([k], !$('.grain', wall)));
  setRoot('wall', k);
};
const applyMotion = () => { if (doc.classList.contains('reduce') !== rm()) doc.classList.toggle('reduce', rm()); env.rm = osRM.matches; };
const setSetting = (k, v) => {
  if (k === 'lang') return setLang(v);
  if (k === 'imp') return toggleImp();
  S[k] = v; saveS();
  if (k === 'theme') { applyTheme(); toast(u('t_theme'), theme === 'dark' ? I.moon : I.sun); }
  if (k === 'accent') { applyAccent(); toast(u('t_accent'), I.sparkle); }
  if (k === 'wall') { applyWall(); toast(u('t_wall'), I.image); }
  if (k === 'motion') { applyMotion(); toast(u('t_motion')); }
  if (k === 'icons') fillDesk();
  if (k === 'widgets') { fillDesk(); layoutDesk(); }
  syncSettingsUI();
};
const resetSettings = () => { S = { ...DEF }; saveS(); applyTheme(); applyAccent(); applyWall(); applyMotion(); fillDesk(); layoutDesk(); syncSettingsUI(); toast(u('t_reset'), I.restart); };
osDark.addEventListener?.('change', () => { if (S.theme === 'auto') applyTheme(); });
osRM.addEventListener?.('change', applyMotion);

/* ---- language: the page flips in place and the address moves to the other language ---- */
const applyLangAttrs = () => { if (doc.lang !== lang) doc.lang = lang; const dir = rtl() ? 'rtl' : 'ltr'; if (doc.dir !== dir) doc.dir = dir; };
const setLang = l => {
  if (l === lang) return;
  closeMenus(); closeSpot(); closeAssist(); hideFlyout();
  useLang(l); applyLangAttrs(); urlLive = true;
  WM.wins.forEach(w => {
    if (w.snap) { if (w.snap.layout !== '50-50-phys' && w.snap.layout !== 'quad-phys') w.snap.frac = [1 - w.snap.frac[0] - w.snap.frac[2], w.snap.frac[1], w.snap.frac[2], w.snap.frac[3]]; const r = zoneRect(w.snap.frac); w.geo = { x: r.x, y: r.y, w: r.w, h: r.h }; }
    else w.geo.x = innerWidth - w.geo.x - w.geo.w;
    if (w.restore) w.restore.x = innerWidth - w.restore.x - w.restore.w;
    applyGeo(w); fillWin(w);
  });
  SH.forEach(fillSheet); LB = null; fillAll(); syncPerches(); syncURL(); toast(u('t_lang'), I.globe);
};

/* ---- copy ---- */
const copyText = async t => {
  try { await navigator.clipboard.writeText(t); return true; } catch {
    const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0'; document.body.append(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch { } ta.remove(); return ok;
  }
};
const copyEmail = async btn => {
  const ok = await copyText(A.contact.email); if (!ok) return false;
  toast(u('t_copied'), I.copy); Imp()?.react('react-triumph');
  if (btn) {
    const lab = btn.classList.contains('copy-btn') ? btn.querySelector('span') : null, old = lab?.textContent, end = btn.querySelector('.end'), oldEnd = end?.innerHTML;
    btn.classList.add('done'); if (lab) lab.textContent = T(A.ui.copied); if (end) end.innerHTML = I.check + esc(T(A.ui.copied));
    setTimeout(() => { btn.classList.remove('done'); if (lab) lab.textContent = old; if (end) end.innerHTML = oldEnd; }, 1700);
  }
  return true;
};

/* ---- terminal ---- */
const termPrint = (html, cls = '') => {
  const line = `<div class="tl ${cls}">${html}</div>`; TERM.lines.push(line); if (TERM.lines.length > 400) TERM.lines.shift();
  $$('.term-out').forEach(o => { o.insertAdjacentHTML('beforeend', line); o.scrollTop = o.scrollHeight; });
};
const findProject = q => { q = norm(q); return A.projects.find(p => p.slug === q) || A.projects.find(p => p.slug.startsWith(q)) || A.projects.find(p => norm(p.name.en).includes(q) || norm(p.name.ar).includes(q)); };
const CMDS = ['help', 'whoami', 'ls', 'open', 'cat', 'contact', 'education', 'films', 'imp', 'theme', 'lang', 'arrange', 'date', 'clear', 'exit'];
const runCmd = raw => {
  const s = raw.trim(); termPrint(`<span class="tp">amir@amiros ~ %</span> ${esc(s)}`, 'cmd'); if (!s) return;
  TERM.hist.push(s); TERM.hi = TERM.hist.length;
  const [c0, ...rest] = s.split(/\s+/), c = c0.toLowerCase(), arg = rest.join(' ').toLowerCase(), ps = A.person, ct = A.contact;
  const out = (t, cls) => termPrint(esc(t), cls), dim = t => termPrint(esc(t), 'dim');
  switch (c) {
    case 'help': ['whoami                who is this', 'ls                    list the projects', 'open <name>           open a project or app (work, films, lab, about, contact, settings, privacy)', 'cat about             the short bio', 'contact [copy]        email and phone; copy puts the email on the clipboard', 'education             where Amir studied', 'films                 list the films', 'imp grow|shrink|hide|show|lights|laugh', 'theme dark|light|auto', 'lang en|ar', 'arrange tile|cascade', 'date                  the time in Al Khobar', 'clear, exit'].forEach(l => out(l)); break;
    case 'whoami': out(`${T(ps.name)} · ${T(ps.role)} · ${T(ps.city)}`, 'hi'); out(T(ps.headline)); break;
    case 'ls': A.projects.forEach(p => termPrint(`<span class="tc">${esc(p.slug.padEnd(20))}</span>${esc(stageLabel(p.stage).padEnd(16))}<span class="dim">${esc(T(p.name))}</span>`)); break;
    case 'open': {
      if (!arg) { dim('open what? try: open ' + A.projects[0].slug); break; }
      const appIds = { work: 'work', films: 'films', lab: 'lab', about: 'about', contact: 'contact', settings: 'settings', help: 'help', terminal: 'terminal', start: 'start', privacy: 'privacy' };
      if (appIds[arg]) { openApp(appIds[arg]); out('opening ' + arg + '…'); break; }
      const p = findProject(arg); if (p) { openApp('p:' + p.slug); out('opening ' + T(p.name) + '…'); } else dim('no project called “' + arg + '”. try: ls');
      break;
    }
    case 'cat': if (arg === 'about' || arg === 'bio') out(T(ps.bio)); else dim('try: cat about'); break;
    case 'contact': out(`${u('email')}: ${ct.email}`); out(`${T(A.ui.call)}: ${ct.phoneDisplay}`); out(`${T(A.ui.whatsapp)}: ${ct.whatsapp}`); out(`GitHub: ${ct.github}`);
      if (arg === 'copy') copyEmail().then(ok => dim(ok ? 'email copied' : 'could not copy')); break;
    case 'education': { const e = ps.education; out(`${T(e.school)} · ${T(e.campus)}`, 'hi'); out(T(e.line)); dim(T(e.degree)); break; }
    case 'films': ALLFILMS.forEach(v => termPrint(`<span class="tc">${esc(dur(v.dur).padEnd(6))}</span>${esc(filmTitle(v))} <span class="dim">· ${esc(T(v.p.name))}</span>`)); break;
    case 'imp': ({ grow: impGrow, shrink: impShrink, hide: () => Imp()?.hide(), show: () => Imp()?.show(), lights, laugh })[arg]?.() ?? dim('imp grow|shrink|hide|show|lights|laugh'); break;
    case 'theme': if (['dark', 'light', 'auto'].includes(arg)) { setSetting('theme', arg); dim('theme: ' + arg); } else dim('theme dark|light|auto'); break;
    case 'lang': if (['en', 'ar'].includes(arg)) setLang(arg); else dim('lang en|ar'); break;
    case 'arrange': if (arg === 'tile') tileWins(); else if (arg === 'cascade') cascadeWins(); else dim('arrange tile|cascade'); break;
    case 'date': out(`${u('khobar')} ${clockNow()} (UTC+3)`); break;
    case 'clear': TERM.lines = []; $$('.term-out').forEach(o => { o.innerHTML = ''; }); break;
    case 'exit': { const w = WM.wins.get('terminal'); if (w) closeWin(w); const s2 = SH.find(x => x.id === 'terminal'); if (s2) closeSheet(s2); break; }
    case 'sudo': dim('nice try.'); break;
    default: dim(u('termUnknown'));
  }
};
const mountTerminal = root => {
  if (!TERM.lines.length) { TERM.lines.push(`<div class="tl hi">${esc(u('termHello'))}</div>`); $('.term-out', root).innerHTML = TERM.lines.join(''); }
  const form = $('.term-in', root), inp = $('input', form), outEl = $('.term-out', root);
  outEl.scrollTop = outEl.scrollHeight;
  form.addEventListener('submit', e => { e.preventDefault(); runCmd(inp.value); inp.value = ''; });
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); TERM.hi = clamp(TERM.hi + (e.key === 'ArrowUp' ? -1 : 1), 0, TERM.hist.length); inp.value = TERM.hist[TERM.hi] || ''; }
    if (e.key === 'Tab') {
      e.preventDefault(); const v = inp.value, m = v.match(/^open\s+(\S*)$/);
      if (m) { const hit = [...A.projects.map(p => p.slug), 'work', 'films', 'lab', 'about', 'contact', 'settings', 'privacy'].filter(x => x.startsWith(m[1])); if (hit.length === 1) inp.value = 'open ' + hit[0]; else if (hit.length) termPrint(esc(hit.join('  ')), 'dim'); }
      else { const hit = CMDS.filter(x => x.startsWith(v)); if (hit.length === 1) inp.value = hit[0] + ' '; }
    }
  });
  root.addEventListener('pointerup', e => { if (!getSelection()?.toString() && !e.target.closest('a,button')) inp.focus({ preventScroll: true }); });
  setTimeout(() => inp.focus({ preventScroll: true }), 80);
};

/* ---- one place for clicks ---- */
document.addEventListener('click', async e => {
  const t = e.target;
  const mb = t.closest('[data-menu]');
  if (mb) { e.preventDefault(); if (menu?.btn === mb) { if (menu.hover && performance.now() - menu.at < 700) menu.hover = false; else closeMenus(); } else openMenu(mb.dataset.menu, mb, null, e.detail === 0); return; }
  const mi = t.closest('.menu [data-mi]');
  if (mi && menu) { const it = menu.items[+mi.dataset.mi]; if (!it || mi.disabled) return; if (!it.keep) closeMenus(); it.run(); if (it.keep && menu) { $$('.mi', menu.el).forEach(b => { const x = menu.items[+b.dataset.mi]; if (x?.role === 'menuitemcheckbox') b.setAttribute('aria-checked', String(!Imp()?.state().hidden)); }); syncImpSize(); } return; }
  if (menu && !t.closest('.menu')) closeMenus();
  const so = t.closest('[data-so]'); if (so) { runSpot(+so.dataset.so); return; }
  if (spot && t.closest('#spot') && !t.closest('.spot-box')) { closeSpot(); return; }
  const ac = t.closest('[data-assist]');
  if (ac) { const box = $('#assist'), w = WM.wins.get(ac.dataset.assist), layout = box.dataset.layout, zone = JSON.parse(box.dataset.zone); closeAssist(); if (w) { snapTo(w, zone, layout, false); setTimeout(() => snapAssist(w, layout), rm() ? 20 : 360); } return; }
  if (t.closest('#assist') && !t.closest('.assist-zone')) { closeAssist(); return; }
  const fz = t.closest('[data-fly]');
  if (fz && flyFor) { const zs = LAYOUTS[fz.dataset.fly].map(mirror), w = flyFor; snapTo(w, zs[+fz.dataset.zi], fz.dataset.fly, true); return; }
  const wc = t.closest('[data-wc]');
  if (wc) { const w = WM.wins.get(wc.closest('.win').dataset.app); if (!w) return; ({ close: closeWin, min: minimizeWin, max: toggleMax })[wc.dataset.wc](w); return; }
  const rs = t.closest('[data-restore]'); if (rs) { const w = WM.wins.get(rs.dataset.restore); if (w) restoreWin(w); return; }
  if (t.closest('[data-sc]')) { const s = SH.find(x => x.el === t.closest('.sheet')); if (s) closeSheet(s); return; }
  const op = t.closest('[data-open]');
  if (op) { if (op.tagName === 'A' && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return; e.preventDefault(); openApp(op.dataset.open, op); return; }
  const st = t.closest('[data-set]');
  if (st) { const k = st.dataset.set; if (st.getAttribute('role') === 'switch') { if (k === 'motion') setSetting('motion', S.motion === 'reduce' ? 'auto' : 'reduce'); else if (k === 'imp') toggleImp(); else setSetting(k, !S[k]); } else setSetting(k, st.dataset.val); return; }
  const act = t.closest('[data-act]');
  if (act) {
    const a = act.dataset.act;
    if (a === 'lights') lights(); if (a === 'laugh') laugh(); if (a === 'search') openSpot(); if (a === 'restart') restart(); if (a === 'reset') resetSettings();
    if (a === 'imp-grow') impGrow(); if (a === 'imp-shrink') impShrink();
    return;
  }
  const tab = t.closest('[data-tab]');
  if (tab) {
    const app = tab.closest('.app'), sth = hostState(tab), name = tab.dataset.tab;
    $$('.tabs [data-tab]', app).forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
    $$('[data-panel]', app).forEach(p => { p.hidden = p.dataset.panel !== name; if (p.hidden) stopMedia(p); });
    if (sth) sth.tab = name;
    const sc = app.querySelector('.scroller'); if (sc) sc.scrollTop = 0; const sm = tab.closest('.sheet-main'); if (sm && sm.scrollTop > 0) sm.scrollTop = Math.min(sm.scrollTop, $('.tabs', app).offsetTop);
    setTimeout(syncPerches, 60); return;
  }
  const fl = t.closest('[data-filter]');
  if (fl) {
    const app = fl.closest('.app'), f = fl.dataset.filter;
    $$('[data-filter]', app).forEach(b => b.setAttribute('aria-pressed', String(b === fl)));
    $$('.ptile', app).forEach(tl => { const show = f === 'all' || tl.dataset.tags.split(' ').includes(f); tl.classList.toggle('hide', !show); if (show && !rm()) tl.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' }); });
    return;
  }
  const lbb = t.closest('[data-lb]'); if (lbb) { openLB(lbb.dataset.lb, +lbb.dataset.i, lbb); return; }
  if (t.closest('.lb-prev')) { stepLB(rtl() ? 1 : -1); return; }
  if (t.closest('.lb-next')) { stepLB(rtl() ? -1 : 1); return; }
  if (t.closest('.lb-close')) { closeLB(); return; }
  const cp = t.closest('[data-copy]'); if (cp) { e.preventDefault(); copyEmail(cp); return; }
  if (t.closest('#langBtn')) { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); setLang(other()); return; }
  if (t.closest('#themeBtn')) { setSetting('theme', theme === 'dark' ? 'light' : 'dark'); return; }
  const film = t.closest('[data-film]'); if (film) { selectFilm(film.closest('[data-player]'), +film.dataset.film, true); return; }
  const pc = t.closest('[data-pc]');
  if (pc && pc.dataset.pc !== 'seek') {
    const pl = pc.closest('[data-player]'), v = $('video', pl);
    if (pc.dataset.pc === 'toggle') { if (v.paused) v.play().catch(() => { }); else v.pause(); }
    if (pc.dataset.pc === 'sound') { sound.on = !sound.on; $$('video:not(.preview)').forEach(x => { x.muted = !sound.on; }); syncSound(); }
    return;
  }
  if (t.tagName === 'VIDEO' && t.closest('.stage')) { t.paused ? t.play().catch(() => { }) : t.pause(); }
});
document.addEventListener('input', e => { const r = e.target.closest?.('[data-pc="seek"]'); if (!r) return; const v = $('video', r.closest('[data-player]')); if (v.duration) v.currentTime = r.value / 1000 * v.duration; });
document.addEventListener('play', e => {
  const v = e.target; if (v.classList.contains('preview')) return;
  $$('video').forEach(o => { if (o !== v && !o.classList.contains('preview')) o.pause(); });
  const st = v.closest('.stage'); if (st) { st.classList.add('playing'); $$('[data-pc="toggle"]', st).forEach(b => { if (!b.classList.contains('big-play')) { b.innerHTML = I.pause; b.setAttribute('aria-label', u('pause')); } }); }
}, true);
document.addEventListener('pause', e => { const st = e.target.closest?.('.stage'); if (st) { st.classList.remove('playing'); st.classList.add('paused-once'); $$('[data-pc="toggle"]', st).forEach(b => { if (!b.classList.contains('big-play')) { b.innerHTML = I.play; b.setAttribute('aria-label', u('play')); } }); } }, true);
document.addEventListener('timeupdate', e => { const v = e.target, pl = v.closest?.('[data-player]'); if (!pl || !v.duration) return; $('[data-pc="seek"]', pl).value = Math.round(v.currentTime / v.duration * 1000); $('time', pl).textContent = `${dur(v.currentTime)} / ${dur(v.duration)}`; }, true);

/* right-click: the desktop gets its own menu, Imp gets his */
document.addEventListener('contextmenu', e => {
  if (e.target.closest('.imp-hit')) { e.preventDefault(); openMenu('impctx', null, { x: e.clientX, y: e.clientY }); return; }
  if (!isDesk() || e.target.closest('.win, #topbar, #dockwrap, .menu, #spot, #lightbox, input, textarea, a, .widget, #assist, #flyout')) return;
  e.preventDefault(); openMenu('desk', null, { x: e.clientX, y: e.clientY });
});

/* hover previews on Work tiles */
document.addEventListener('pointerover', e => {
  if (!FINE || rm()) return;
  const tl = e.target.closest?.('.ptile[data-vid]'); if (!tl || tl.querySelector('video')) return;
  const v = document.createElement('video'); v.className = 'preview'; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.src = tl.dataset.vid; v.setAttribute('aria-hidden', 'true');
  if (!P[tl.dataset.open.slice(2)].shots.length) v.classList.add('contain');
  v.style.opacity = '0'; v.style.transition = 'opacity .3s';
  tl.querySelector('.cover').insertBefore(v, tl.querySelector('.cover .tile'));
  v.play().then(() => { v.style.opacity = '1'; }).catch(() => { });
  const leave = ev => { if (tl.contains(ev.relatedTarget)) return; tl.removeEventListener('pointerout', leave); v.pause(); v.remove(); };
  tl.addEventListener('pointerout', leave);
});

/* keyboard */
const typing = el => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
document.addEventListener('keydown', e => {
  const modKey = e.ctrlKey || e.metaKey;
  if (modKey && !e.altKey && e.code === 'KeyK') { e.preventDefault(); openSpot(); return; }
  if (modKey && !e.altKey && e.code === 'Comma') { e.preventDefault(); openApp('settings'); return; }
  if (e.altKey && isDesk() && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && (e.ctrlKey || !typing(e.target))) { e.preventDefault(); closeAssist(); snapKey(front(), e.key); return; }
  if (e.ctrlKey && e.altKey && !e.metaKey) {
    if (e.code === 'KeyD' && isDesk()) { e.preventDefault(); showDesktop(); return; }
    if (e.code === 'KeyG' && isDesk()) { e.preventDefault(); tileWins(); return; }
    if (e.code === 'KeyT') { e.preventDefault(); openApp('terminal'); return; }
  }
  if (e.key === 'Escape') {
    if (spot) return closeSpot();
    if (menu) { const b = menu.btn; closeMenus(); b?.focus(); return; }
    if (!$('#assist').hidden) return closeAssist();
    if (!$('#flyout').hidden) return hideFlyout();
    if (lb) return closeLB();
    if (SH.length) return closeSheet(SH.at(-1));
    const f = front(); if (f && isDesk() && !typing(e.target)) closeWin(f);
    return;
  }
  if (e.key === '?' && !typing(e.target)) { e.preventDefault(); openApp('help'); return; }
  if (lb && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { stepLB((e.key === 'ArrowRight' ? 1 : -1) * (rtl() ? -1 : 1)); e.preventDefault(); return; }
  if (menu && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    const items = $$('.mi:not([disabled])', menu.el), i = items.indexOf(document.activeElement);
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus(); e.preventDefault();
  }
  // tabs: the arrow keys move between them
  const tb = e.target.closest?.('[role="tab"]');
  if (tb && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    const list = $$('[role="tab"]', tb.parentElement), d = (e.key === 'ArrowRight' ? 1 : -1) * (rtl() ? -1 : 1), next = list[(list.indexOf(tb) + d + list.length) % list.length];
    next.focus(); next.click(); e.preventDefault();
  }
});

/* glass glow follows the cursor; the dock magnifies */
if (FINE) {
  let raf = 0, last = null;
  document.addEventListener('pointermove', e => {
    if (rm()) return; last = e; if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; const g = last.target.closest?.('.glass'); if (!g) return; const r = g.getBoundingClientRect(); g.style.setProperty('--mx', (last.clientX - r.left) + 'px'); g.style.setProperty('--my', (last.clientY - r.top) + 'px'); });
  }, { passive: true });
  const dock = $('#dock');
  dock.addEventListener('pointermove', e => { if (!isDesk() || rm()) return; $$('.dock-item', dock).forEach(it => { const r = it.getBoundingClientRect(), c = r.left + r.width / 2, d = Math.abs(e.clientX - c); it.style.setProperty('--s', (1 + .55 * Math.max(0, 1 - d / 150)).toFixed(3)); }); });
  dock.addEventListener('pointerleave', () => $$('.dock-item', dock).forEach(it => it.style.setProperty('--s', 1)));
}

/* ---- layout ---- */
const fitWidgets = () => {
  const wc = $('.widgets'); if (!wc) return;
  wc.classList.remove('compact'); $$('.widget', wc).forEach(w => { w.hidden = false; }); wc.style.setProperty('--wy', (startGeo().y - barH()) + 'px');
  if (!isDesk() || !S.widgets || getComputedStyle(wc).display === 'none') return;
  const limit = dockTop() - 14, fits = () => wc.getBoundingClientRect().bottom <= limit;
  if (fits()) return;
  wc.style.setProperty('--wy', '16px'); if (fits()) return;
  wc.classList.add('compact');
  for (const id of ['w-ship', 'w-reach', 'w-edu']) { if (fits()) break; $('#' + id, wc).hidden = true; }
};
const layoutDesk = () => {
  if (!isDesk()) return;
  const rh = clamp(Math.floor((innerHeight - barH() - 100) / 6), 88, 106), rows = clamp(Math.floor((innerHeight - barH() - 100) / rh), 6, 8);
  const ic = $('.icons'); ic.style.setProperty('--rows', rows); ic.style.setProperty('--rh', rh + 'px'); ic.classList.toggle('tight', rh < 102);
  fitWidgets();
  WM.wins.forEach(w => { if (w.snap) { const r = zoneRect(w.snap.frac); w.geo = { x: r.x, y: r.y, w: r.w, h: r.h }; } else fitGeo(w); applyGeo(w); });
};
const fillAll = () => { fillTopbar(); fillDesk(); fillHome(); fillDock(); layoutDesk(); syncSettingsUI(); };
const setMode = () => { if (doc.classList.contains('is-phone') !== mqPhone.matches) { doc.classList.toggle('is-phone', mqPhone.matches); doc.classList.toggle('is-desk', !mqPhone.matches); } };
mqPhone.addEventListener('change', () => {
  closeMenus(); closeSpot(); closeLB(); closeAssist(); hideFlyout(); closeAllWins(true); closeAllSheets(true);
  setMode(); fillAll();
  if (isDesk()) openWin('start');
  setTimeout(() => Imp()?.go('ledge'), 100);
});
let rzT = 0; addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(() => { layoutDesk(); syncPerches(); }, 120); });

/* ---- boot and restart ---- */
let booting = false, bootHid = false;
// the first visit to the home page in a session shows the boot screen, drawn by the build so it is there from the first paint
const bootScreen = force => new Promise(res => {
  let b = $('#boot');
  if (!force && (!doc.classList.contains('boot') || !b)) { b?.remove(); doc.classList.remove('boot'); return res(); }
  ss.set('pf-a-boot', '1');
  if (force) { b?.remove(); b = document.createElement('div'); b.id = 'boot'; b.setAttribute('role', 'status'); b.innerHTML = bootHTML(true); document.body.append(b); }
  booting = true; bootHid = false;
  if (Imp() && !Imp().state().hidden) { Imp().hide(true); bootHid = true; }
  let done = false;
  const end = () => {
    if (done) return; done = true; booting = false; removeEventListener('keydown', end);
    b.classList.add('out'); if (bootHid) Imp()?.show(); res();
    setTimeout(() => { b.remove(); doc.classList.remove('boot'); }, 320);
  };
  b.addEventListener('click', end); addEventListener('keydown', end); setTimeout(end, rm() ? 700 : 1350);
});
const restart = () => { closeMenus(); closeSpot(); closeLB(); closeAssist(); hideFlyout(); closeAllWins(true); closeAllSheets(true); bootScreen(true).then(() => { if (isDesk()) openWin('start'); }); };

/* ---- go ---- */
setMode(); applyLangAttrs(); applyTheme(); applyAccent(); applyWall(); applyMotion();
// the build drew the default desktop; redraw only what this browser's settings change
if (MAC) fillTopbar(); else tickClock();
if (S.icons !== 'default' || !S.widgets) fillDesk();
dockSync(); layoutDesk();
// what nothing needs for the first paint waits for an idle moment, so start-up stays one short task
const idle = f => (window.requestIdleCallback || (g => setTimeout(g, 1)))(f, { timeout: 1200 });
idle(() => { syncSettingsUI(); syncImpSize(); setInterval(tickClock, 1000); });
// the window this address stands for: drawn by the build as a sheet, which the phone takes over and the laptop swaps for a window
const ssr = $('#sheets > .sheet[data-ssr]');
if (ssr && !isDesk()) adoptSheet(ssr); else { ssr?.remove(); $('.home').classList.remove('behind'); }
bootScreen().then(() => {
  if (isDesk()) openWin(ROUTE_APP, null, { instant: ROUTE_APP !== 'start' });
  urlLive = true;
});
document.fonts?.ready.then(() => { layoutDesk(); syncPerches(); });
// the mascot runtime is large (about 430 KB compressed) and only decorative, so it never competes with the page itself:
// it comes with the visitor's first touch, scroll, key or mouse move, or 4 s after the page has loaded, whichever is first.
// With Save-Data on it waits until someone asks for him (Imp menu, "Imp on the desktop").
if (!navigator.connection?.saveData) {
  const evs = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
  const go = () => { evs.forEach(ev => removeEventListener(ev, go, true)); (window.requestIdleCallback || (f => setTimeout(f, 0)))(loadImp, { timeout: 1500 }); };
  evs.forEach(ev => addEventListener(ev, go, { capture: true, passive: true }));
  const later = () => setTimeout(go, 4000);
  document.readyState === 'complete' ? later() : addEventListener('load', later, { once: true });
}
window.ImpOS = {
  openApp, closeAllWins, setLang, setSetting, tileWins, cascadeWins, showDesktop, snapTo: (id, f, l) => snapTo(WM.wins.get(id), f, l || 'test', false), openSpot, restart,
  state: () => ({ wins: [...WM.wins.values()].map(w => ({ id: w.id, min: w.min, snap: w.snap?.layout || null, geo: { ...w.geo } })), sheets: SH.map(s => s.id), lang, theme, S: { ...S }, imp: !!Imp() })
};


/* ---------- reasons for the imp to react (the runtime reads data-imp-react when you hover) ---------- */
const IMP_REACTS = [
  ['[data-open="p:hadayah-live"]', 'smug face-sparkle'],             // the flagship: he is proud of it
  ['[data-open="p:dnfom"], .ribbon', 'shrug'],                         // still being built
  ['.tile.mmu, .edu, .edu-w', 'face-sparkle react-triumph'],           // the graduation
  ['.portrait', 'react-shy face-kitty'],                               // Amir himself
  ['[data-open="contact"], .w-contact', 'wave'],                       // say hello
  ['[data-open="films"]', 'react-curious face-happy'],                 // films!
  ['[data-open="lab"]', 'peek react-curious'],                         // what is in there
  ['[data-open="settings"], [data-open="terminal"]', 'react-focused'], // serious business
  ['[data-open="aboutos"]', 'smug'],
];
const markReacts = () => IMP_REACTS.forEach(([sel, r]) => $$(sel).forEach(el => { if (!el.dataset.impReact) el.dataset.impReact = r; }));
let markT = 0;
idle(() => { new MutationObserver(() => { clearTimeout(markT); markT = setTimeout(markReacts, 120); }).observe(document.body, { childList: true, subtree: true }); markReacts(); });
// opening Work: he shows you around the projects
document.addEventListener('click', e => { if (e.target.closest?.('[data-open="work"]')) setTimeout(() => Imp()?.play?.('point-around'), 750); }, true);

})();
