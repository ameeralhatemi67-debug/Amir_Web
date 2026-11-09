/* Imp OS in the browser: window manager (laptop), sheets (phone), dock, menus, Spotlight, lightbox,
   settings, terminal and boot. The page arrives already drawn by the build (see src/pages); this file
   takes it over. Every window with an address keeps the address bar in step, so links can be shared.
   The mascot runtime (public/os/imp-live.js) loads on its own and is wired up when it arrives. */
import {
  A, esc, clamp, env, mod, lang, useLang, T, rtl, other, U, u, filmTitle, I, P, ALLFILMS, stageLabel, img,
  href, tileFor, SYS, appTile, appTitle, titleFor, clockHTML, clockNow, wallHTML, lbLists, playerFilms, sound, dur, filmTitleHTML,
  ACCENTS, WALLS, TERM, appMeta, topbarHTML, iconsHTML, iconIds, widgetsHTML, homeHTML, dockHTML, bootHTML, FILM,
  TAGS, techsOf, featImg, stageChip, reachChip, lbLists as lbListsCore
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
// iconOrder, winPos and deskHome are what Imp rearranged in Gear 5 (see rubber-os.js): a custom icon order, where he put windows, and the cells his files came from
const DEF = { theme: 'auto', accent: 'amber', wall: 'corniche', motion: 'auto', icons: 'default', widgets: true, ball: true, pulse: false, pulseEdge: 'left', iconOrder: null, winPos: null, deskHome: null };
let S = (() => { let s = {}; try { s = JSON.parse(ls.get(SKEY) || '{}') || {}; } catch { } const old = ls.get('pf-a-theme'); if (!s.theme && old) s.theme = old; return { ...DEF, ...s }; })();
const saveS = () => ls.set(SKEY, JSON.stringify(S));
const rm = () => osRM.matches || S.motion === 'reduce';
let theme = S.theme === 'auto' ? (osDark.matches ? 'dark' : 'light') : S.theme;
const isDesk = () => !mqPhone.matches;
const ROUTE_APP = doc.dataset.app || 'start'; // the window this address stands for, set by the build

/* clock */
const tickClock = () => $$('[data-clock]').forEach(c => { c.innerHTML = (c.dataset.clock === 'label' ? esc(u('khobar')) + ' ' : '') + clockHTML(); });

/* toasts (each one is also kept for the notification centre) */
const NOTIFS = [];
const toast = (msg, icon = I.check, act = null) => {
  const box = $('#toasts'); if (!box) return;
  const t = document.createElement('div'); t.className = 'toast glass'; t.innerHTML = `<span class="ti">${icon}</span><span>${esc(msg)}</span>`;
  if (act) { const b = document.createElement('button'); b.type = 'button'; b.className = 'toast-act'; b.textContent = act.label; b.addEventListener('click', () => { act.run(); t.remove(); }); t.append(b); }
  NOTIFS.unshift({ msg, icon, at: Date.now() }); if (NOTIFS.length > 30) NOTIFS.pop();
  box.append(t); document.dispatchEvent(new CustomEvent('os:toast', { detail: { el: t } })); while (box.children.length > 3) box.firstElementChild.remove();
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, act ? 6000 : 2600);
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
  { type: 'point', sel: '.icon, .dfile, .ptile, .dock-item, .lab-card, .ship-row, .app-icon, .reach-row, .c-row, .rel-item, .tool-mini, .assist-card' },
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
// small reasons for him to react (the runtime picks the moment: a screenshot, a mistake, an empty result, a ta-da);
// each kind has its own cool-down so he never nags. Silent when he is hidden or has not arrived yet.
const impSigAt = {};
const impSig = (type, ms = 8000) => {
  const i = Imp(); if (!i || !i.signal || i.state().hidden) return; const now = performance.now();
  if (now - (impSigAt[type] || -1e9) < ms) return; impSigAt[type] = now; i.signal(type);
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
const WM = { wins: new Map(), z: 100, hiddenByDesk: [], n: 0, focused: null };
// a window can hold several apps as tabs; WM.wins is keyed by the window's own key, w.id is its active tab
const findWin = id => [...WM.wins.values()].find(w => w.tabs.some(t => t.id === id));
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
const front = () => { const f = WM.focused; return f && WM.wins.get(f.key) === f && !f.min && !f.closing ? f : visibleWins().at(-1); };
const applyGeo = w => {
  const g = w.geo, s = w.el.style;
  s.left = g.x + 'px'; s.top = g.y + 'px'; s.width = g.w + 'px';
  if (g.h) { s.height = g.h + 'px'; s.maxHeight = ''; } else { s.height = ''; s.maxHeight = Math.max(260, w.dragged ? innerHeight - barH() - 110 : dockTop() - 10 - g.y) + 'px'; }
};
const fitGeo = w => { const a = area(), g = w.geo, h = g.h || w.el.offsetHeight; g.w = Math.min(g.w, a.W - 12); g.x = clamp(g.x, 0, Math.max(0, a.W - g.w)); g.y = clamp(g.y, a.top, Math.max(a.top, a.H - Math.min(h, a.H - a.top))); };
const animGeo = w => { if (rm()) return applyGeo(w); w.el.classList.add('anim'); applyGeo(w); clearTimeout(w.at); w.at = setTimeout(() => { w.el.classList.remove('anim'); syncPerches(); }, 340); };
const focusWin = w => {
  w.el.style.zIndex = ++WM.z; WM.focused = w;
  WM.wins.forEach(v => { if (v.pin && v !== w) v.el.style.zIndex = ++WM.z; }); // always-on-top windows stay above
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
  $('.win-title', w.el).innerHTML = `${appTile(w.id)}<span>${esc(appTitle(w.id))}</span>`; fillTabs(w); w.el.dataset.cur = w.el.dataset.app = w.id;
  $$('.lights button', w.el).forEach(b => b.setAttribute('aria-label', u({ close: 'close', min: 'minimize', max: 'zoom' }[b.dataset.wc])));
  const main = $('.win-main', w.el); main.innerHTML = m.html(w); mountApp(main, w);
};
const openWin = (id, from, o = {}) => {
  let w = findWin(id);
  if (w && w.id !== id) switchTab(w, id);
  if (w) { if (w.min) restoreWin(w); else { focusWin(w); if (!rm()) w.el.animate?.([{ transform: 'scale(1)' }, { transform: 'scale(1.012)' }, { transform: 'scale(1)' }], { duration: 260 }); } dockBounce(id); return w; }
  const m = appMeta(id); if (!m) return;
  const el = document.createElement('section');
  const key = 'w' + (++WM.n); el.className = 'win glass'; el.tabIndex = -1; el.dataset.win = key; el.setAttribute('role', 'dialog');
  const tid = 'wt-' + id.replace(/[^a-z0-9]/gi, '-'); el.setAttribute('aria-labelledby', tid);
  el.innerHTML = `<div class="win-bar" data-imp="ledge"><div class="lights"><button type="button" class="l-close" data-wc="close">${I.x}</button><button type="button" class="l-min" data-wc="min">${I.minus}</button><button type="button" class="l-max" data-wc="max">${I.expand}</button></div><div class="win-title" id="${tid}"></div><div class="win-tabs" role="tablist"></div><button type="button" class="win-plus" data-newtab aria-label="${esc(u('newTab'))}" title="${esc(u('newTab'))}">${I.plus}</button></div><div class="win-main"></div>${RZ.map(d => `<div class="rz rz-${d}" data-rz="${d}" aria-hidden="true"></div>`).join('')}`;
  w = { key, id, el, opener: from && from.isConnected ? from : document.activeElement, min: false, snap: null, tab: 'overview', tabs: [{ id, tab: 'overview', top: 0 }] };
  WM.wins.set(key, w);
  if (id === 'start') w.geo = startGeo();
  else {
    const a = area(), n = visibleWins().length;
    const ww = Math.min(m.size[0], a.W - 32), hh = Math.min(m.size[1], a.bottom - a.top - 20);
    w.geo = { x: (a.W - ww) / 2 + ((n % 5) - 2) * 26, y: clamp(a.top + 16 + (n % 5) * 22, a.top + 6, Math.max(a.top + 6, a.bottom - hh)), w: ww, h: hh };
  }
  w.home = { x: w.geo.x, y: w.geo.y }; // where it opens; Reset layout brings it back here
  const sp = id !== 'start' && S.winPos && S.winPos[id]; if (sp) { w.geo.x = sp.x; w.geo.y = sp.y; } // where Imp last put it (Gear 5)
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
  else if (id === 'privacy' || id === 'aboutos' || id === 'help') setTimeout(() => { if (!w.closing && !w.min) impSig('read', 25000); }, rm() ? 200 : 900); // he reads the small print with you
  return w;
};
const stopMedia = el => $$('video', el).forEach(v => v.pause());
const closeWin = (w, instant) => {
  if (!w || w.closing) return; w.closing = true; stopMedia(w.el); hideFlyout();
  const done = () => {
    w.el.remove(); WM.wins.delete(w.key); if (WM.focused === w) WM.focused = null; dockSync(); fillDockIfMins();
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
  const t = $(`#dock [data-dock="min:${CSS.escape(w.key)}"]`)?.getBoundingClientRect(), r = w.el.getBoundingClientRect();
  const finish = () => { w.el.classList.add('min'); w.el.classList.remove('front'); const f = front(); if (f) focusWin(f); else { syncPerches(); syncURL(); } };
  if (rm() || !t || quiet) return finish();
  w.el.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${t.left + t.width / 2 - (r.left + r.width / 2)}px,${t.top - (r.top + r.height / 2)}px) scale(.06)`, opacity: .2 }], { duration: 420, easing: 'cubic-bezier(.5,0,.7,.4)' }).onfinish = finish;
};
const restoreWin = w => {
  const t = $(`#dock [data-dock="min:${CSS.escape(w.key)}"]`)?.getBoundingClientRect();
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
    return `<button type="button" class="assist-card" data-assist="${c.key}"><span class="ac-prev">${pv ? img(pv, '') : appTile(c.id)}</span><span class="ac-t">${appTile(c.id)}<span>${esc(appTitle(c.id))}</span></span></button>`;
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
  if (vis.length) { WM.hiddenByDesk = vis.map(w => w.key); vis.forEach(w => minimizeWin(w)); toast(u('t_desktop'), I.eye); setTimeout(() => impSig('present', 12000), rm() ? 80 : 520); }
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
  if (TOYS.length) toyGo(); // a closed window may have been holding the ball
  const list = visibleWins(), f = front();
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
  const w = WM.wins.get(winEl.dataset.win); if (!w) return;
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
      shakeTrack(w, ev);
      zone = mergeHover(w, ev.clientX, ev.clientY) ? null : edgeZone(ev.clientX, ev.clientY); showPreview(zone);
    };
    const up = () => {
      bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up);
      winEl.classList.remove('dragging'); showPreview(null);
      if (!moved) { mergeCancel(); return; }
      w.dragged = true;
      if (mergeDrop(w)) return;
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
document.addEventListener('dblclick', e => { const bar = e.target.closest('.win-bar'); if (bar && !e.target.closest('button')) { const w = WM.wins.get(bar.closest('.win').dataset.win); if (w) toggleMax(w); } });
// snap layouts flyout on hover of the green button
document.addEventListener('pointerover', e => {
  if (!FINE) return;
  const mx = e.target.closest?.('.l-max');
  if (mx) { const w = WM.wins.get(mx.closest('.win').dataset.win); clearTimeout(flyT); flyT = setTimeout(() => showFlyout(w, mx), 380); return; }
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
  $('.icons').innerHTML = iconsHTML(S.icons, S.iconOrder);
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
const dockSync = () => $$('#dock [data-dock]').forEach(b => { const id = b.dataset.dock; if (!id.startsWith('min:')) b.classList.toggle('running', !!findWin(id) || SH.some(s => s.id === id)); });
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
const openApp = (id, from) => { closeMenus(); closeSpot(); closeCC(); closeNC(); if (TV) closeTaskView(); urlLive = true; return isDesk() ? openWin(id, from) : openSheet(id, from); };
const hostState = el => { const h = el.closest('.win, .sheet'); if (!h) return null; return h.classList.contains('win') ? WM.wins.get(h.dataset.win) : SH.find(s => s.el === h); };
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
  if (!document.pictureInPictureEnabled) $$('[data-pc="pip"]', root).forEach(b => b.remove());
  if ($('.app.notes', root)) mountNotes(root);
  if ($('.app.trash', root)) loadFiles().then(f => f.mountTrash(root));
};

/* ---- lightbox: Imp steps aside while a screen is enlarged ---- */
let lb = null;
const lbEl = () => $('#lightbox');
const openLB = (group, i, opener) => {
  const list = (LB ||= lbListsCore())[group]; if (!list?.length) return;
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
document.addEventListener('imp:costume', e => {
  const g5 = e.detail?.costume === 'gear5';
  if (g5) toast(u('t_gear5'), I.sparkle);
  // Gear 5 turns the desktop to rubber (loaded the first time it is needed; nothing on a phone or with reduced motion)
  if (g5 && isDesk() && !rm()) loadRubber().then(r => { if (Imp()?.state().costume === 'gear5') r.setActive(true); }); else RB?.setActive(false);
});

/* ---- menus ---- */
let menu = null;
const MI = (label, run, o = {}) => ({ label, run, ...o }), SEP = { sep: true };
const menuItems = kind => {
  const ex = extraMenu(kind); if (ex) return ex;
  const desk = isDesk(), f = front(), st = Imp()?.state() || {};
  if (kind === 'os') return [MI(u('aboutOS'), () => openApp('aboutos'), { icon: SYS.aboutos() }), MI(u('settingsDots'), () => openApp('settings'), { icon: SYS.settings(), kbd: mod() + ' ,' }), MI(u('privacy'), () => openApp('privacy'), { icon: SYS.privacy() }), SEP,
    ...(desk ? [MI(u('cascade'), cascadeWins, { icon: I.stack, disabled: !visibleWins().length }), MI(u('tileAll'), tileWins, { icon: I.grid, kbd: 'Ctrl Alt G', disabled: !visibleWins().length }), MI(u('showDesktop'), showDesktop, { icon: I.eye, kbd: 'Ctrl Alt D' }), MI(u('closeAll'), () => closeAllWins(), { icon: I.x, disabled: !WM.wins.size }), MI(u('taskView'), openTaskView, { icon: I.tasks, kbd: 'F3' }), SEP] : []),
    MI(u('controlCenter'), openCC, { icon: I.sliders, kbd: 'Ctrl Alt C' }), MI(u('notes'), () => openApp('notes'), { icon: SYS.notes() }), SEP,
    MI(u('restart'), restart, { icon: I.restart })];
  if (kind === 'work') return [...A.projects.map(p => MI(T(p.name), () => openApp('p:' + p.slug), { icon: tileFor(p), kbd: stageLabel(p.stage) })), SEP, MI(u('allProjects'), () => openApp('work'), { icon: SYS.work() })];
  if (kind === 'window') {
    const vis = visibleWins().reverse();
    return [MI(u('minimize'), () => minimizeWin(f), { disabled: !f, icon: I.minus }), MI(f?.snap ? u('restore') : u('zoom'), () => toggleMax(f), { disabled: !f, icon: I.expand }),
      MI(u('snapLeft'), () => snapKey(f, 'ArrowLeft'), { disabled: !f, kbd: 'Ctrl Alt ←' }), MI(u('snapRight'), () => snapKey(f, 'ArrowRight'), { disabled: !f, kbd: 'Ctrl Alt →' }), SEP,
      MI(u('newTab'), () => setTimeout(() => { MENUCTX.win = f; const b = $('[data-newtab]', f?.el); if (b) openMenu('newtab', b); }, 0), { icon: I.plus, disabled: !f }), MI(u('mergeAll'), mergeAll, { icon: I.stack, disabled: WM.wins.size < 2 }), MI(u('pinTop'), () => togglePin(f), { role: 'menuitemcheckbox', checked: !!f?.pin, disabled: !f }), SEP,
      MI(u('taskView'), openTaskView, { icon: I.tasks, kbd: 'F3' }), MI(u('cascade'), cascadeWins, { icon: I.stack, disabled: !vis.length }), MI(u('tileAll'), tileWins, { icon: I.grid, disabled: !vis.length }), MI(u('showDesktop'), showDesktop, { icon: I.eye }), MI(u('closeAll'), () => closeAllWins(), { icon: I.x, disabled: !WM.wins.size }), SEP,
      { head: vis.length ? u('openWindows') : u('noWindows') }, ...vis.map(w => MI(appTitle(w.id) + (w.tabs.length > 1 ? ` (+${w.tabs.length - 1})` : ''), () => focusWin(w), { icon: appTile(w.id), role: 'menuitemradio', checked: w === f }))];
  }
  if (kind === 'help') return [MI(u('shortcuts'), () => openApp('help'), { icon: SYS.help(), kbd: '?' }), MI(u('search'), openSpot, { icon: I.search, kbd: mod() + ' K' }), MI(u('terminal'), () => openApp('terminal'), { icon: SYS.terminal(), kbd: 'Ctrl Alt T' }), SEP, MI(u('aboutOS'), () => openApp('aboutos'), { icon: SYS.aboutos() }), MI(u('privacy'), () => openApp('privacy'), { icon: SYS.privacy() })];
  if (kind === 'imp' || kind === 'impctx') return [...(kind === 'imp' ? [{ head: 'imp' }] : []),
    MI(u('impOnDesk'), toggleImp, { role: 'menuitemcheckbox', checked: !!Imp() && !st.hidden, sw: true, attr: 'data-mi-imp', keep: true }),
    MI(u('grow'), impGrow, { icon: I.plus, disabled: !Imp() || atMax(), keep: true, attr: 'data-imp-size="grow"' }), MI(u('shrink'), impShrink, { icon: I.minus, disabled: !Imp() || atMin(), keep: true, attr: 'data-imp-size="shrink"' }), SEP,
    MI(u('flip'), lights, { icon: I.sparkle }), MI(u('laugh'), laugh, { icon: I.paw, disabled: !Imp() }), MI(u('giveTreat'), spawnTreat, { icon: I.treatI }), ...(desk ? [MI(u('throwBall'), throwBall, { icon: I.ballI })] : []), ...(kind === 'impctx' ? [MI(u('hideImp'), () => Imp()?.hide(), { icon: I.eye })] : [])];
  if (kind === 'desk') return [{ head: u('arrangeIcons') }, ...['default', 'name', 'stage'].map(k => MI(u({ default: 'byDefault', name: 'byName', stage: 'byStage' }[k]), () => setSetting('icons', k), { role: 'menuitemradio', checked: S.icons === k })), SEP,
    MI(u('resetLayout'), resetLayout, { icon: I.restart }), SEP,
    { head: u('changeWall') }, ...WALLS.map(k => MI(u('W_' + k), () => setSetting('wall', k), { role: 'menuitemradio', checked: S.wall === k })), SEP,
    MI(u('newNote'), () => openApp('notes'), { icon: SYS.notes() }), MI(u('throwBall'), throwBall, { icon: I.ballI }), MI(u('giveTreat'), spawnTreat, { icon: I.treatI }), SEP,
    MI(u('taskView'), openTaskView, { icon: I.tasks, kbd: 'F3' }), MI(u('tileAll'), tileWins, { icon: I.grid, disabled: !visibleWins().length }), MI(u('cascade'), cascadeWins, { icon: I.stack, disabled: !visibleWins().length }), MI(u('showDesktop'), showDesktop, { icon: I.eye }), MI(u('settingsDots'), () => openApp('settings'), { icon: I.gear })];
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

/* ---- Spotlight: everything inside the projects too (highlights, views, tech, facts, every screenshot) ---- */
let spot = null;
const norm = s => String(s || '').toLowerCase().replace(/[ً-ٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
const both = (en, ar) => en + ' ' + ar;
const recentGet = () => { try { return JSON.parse(ls.get('pf-a-recent') || '[]'); } catch { return []; } };
const recentPush = key => { const r = recentGet().filter(k => k !== key); r.unshift(key); ls.set('pf-a-recent', JSON.stringify(r.slice(0, 6))); };
const SGROUPS = ['apps', 'projects', 'details', 'screens', 'tech', 'films', 'lab', 'actions'];
const SFILTERS = ['all', 'projects', 'details', 'screens', 'tech', 'films', 'actions'];
const SLIMIT = { apps: 4, projects: 6, details: 6, screens: 6, tech: 4, films: 4, lab: 3, actions: 5 };
const SBOOST = { apps: 10, projects: 12, tech: 7, details: 0, screens: -3, films: 2, lab: 0, actions: 3 };
const thumb = m => `<span class="tile thumb"><img src="${m.src}" alt="" loading="lazy" decoding="async"></span>`;
const techTile = n => `<span class="tile sys tech-t" style="--tg:linear-gradient(150deg,#3a4d55,#18262c)"><b dir="ltr">${esc(n.replace(/[^A-Za-z0-9+#.]/g, '').slice(0, 2) || n.slice(0, 2))}</b></span>`;
const spotIndex = () => {
  const c = A.contact, items = [];
  const ALIAS = { about: 'aboutAmir', help: 'shortcuts', aboutos: 'aboutOS' };
  ['work', 'films', 'about', 'contact', 'settings', 'notes', 'trash', 'lab', 'help', 'terminal', 'aboutos', 'start', 'privacy'].forEach((id, i) => { const k = U[ALIAS[id] || id] || [id, '']; items.push({ key: 'app:' + id, g: 'apps', id, alt: both(k[0], k[1]), t: appTitle(id), s: u('app'), ic: appTile(id), k: both(k[0], k[1]) + ' ' + id, sug: i < 4, run: o => o.newTab ? openAt(id, o) : openApp(id), prev: { type: 'app', id } }); });
  A.projects.forEach((p, i) => {
    const id = 'p:' + p.slug, name = T(p.name);
    items.push({ key: id, g: 'projects', id, alt: both(p.name.en, p.name.ar), t: name, s: T(p.category), ic: tileFor(p), sug: i < 3, k: [p.name.en, p.name.ar, p.category.en, p.category.ar, p.pitch.en, p.pitch.ar, p.tags.map(t => both(...(TAGS[t] || [t, '']))).join(' '), p.slug].join(' '), run: o => openAt(id, o), prev: { type: 'project', p } });
    p.highlights.forEach((h, j) => items.push({ key: `d:${p.slug}:hl${j}`, g: 'details', id, t: T(h), s: `${name} · ${u('inHighlights')}`, ic: tileFor(p), k: both(h.en, h.ar) + ' ' + p.name.en, run: o => openAt(id, { ...o, find: 'hl-' + j }), prev: { type: 'detail', p, text: T(h) } }));
    (p.features || []).forEach((f, j) => items.push({ key: `d:${p.slug}:ft${j}`, g: 'details', id, t: T(f.title), s: `${name} · ${T(f.line)}`, ic: tileFor(p), k: both(f.title.en, f.title.ar) + ' ' + both(f.line.en, f.line.ar), run: o => openAt(id, { ...o, find: 'feat-' + j }), prev: { type: 'detail', p, text: T(f.line), img: featImg(p, j) } }));
    p.facts.forEach((f, j) => items.push({ key: `d:${p.slug}:fa${j}`, g: 'details', id, t: `${f.value} ${T(f.label)}`, s: `${name} · ${u('inFacts')}`, ic: tileFor(p), k: both(f.label.en, f.label.ar) + ' ' + f.value, run: o => openAt(id, { ...o, tab: 'facts', find: 'fact-' + j }), prev: { type: 'detail', p, text: `${f.value} · ${T(f.label)}` } }));
    (p.roles || []).forEach(r => items.push({ key: `d:${p.slug}:ro${r.id}`, g: 'details', id, alt: [both(r.name.en, r.name.ar), ...(r.alias || [])].join(' '), t: `${T(r.name)} · ${name}`, s: `${u('inViews')} · ${T(r.line)}`, ic: tileFor(p), k: [both(r.name.en, r.name.ar), both(r.line.en, r.line.ar), ...(r.chips || []).map(x => both(x.en, x.ar)), ...(r.alias || [])].join(' '), run: o => openAt(id, { ...o, tab: 'views', role: r.id }), prev: { type: 'detail', p, text: T(r.line), img: r.shots[0] } }));
    (p.tools || []).forEach((t, j) => items.push({ key: `d:${p.slug}:to${j}`, g: 'details', id, t: T(t.name), s: `${name} · ${u('inTools')}`, ic: tileFor(p), k: both(t.name.en, t.name.ar) + ' ' + both(t.line.en, t.line.ar), run: o => openAt(id, { ...o, tab: 'tools', find: 'tool-' + j }), prev: { type: 'detail', p, text: T(t.line), img: t.shots[0] } }));
    items.push({ key: `d:${p.slug}:pr`, g: 'details', id, t: `${u('inProblem')} · ${name}`, s: T(p.problem), ic: tileFor(p), k: both(p.problem.en, p.problem.ar) + ' ' + both(p.audience.en, p.audience.ar), run: o => openAt(id, o), prev: { type: 'detail', p, text: T(p.problem) }, low: true });
  });
  Object.entries(LB ||= lbListsCore()).forEach(([grp, list]) => list.forEach((m, i) => items.push({ key: `s:${grp}:${i}`, g: 'screens', t: m.cap.split(' · ').slice(1).join(' · ') || m.cap, s: m.cap.split(' · ')[0], ic: thumb(m), k: m.cap + ' ' + (m.name || '') + ' screenshot screen شاشة', run: () => openLB(grp, i, null), prev: { type: 'shot', m } })));
  const tech = new Map();
  A.projects.forEach(p => techsOf(p).forEach(n => { const k = norm(n); if (!tech.has(k)) tech.set(k, { name: n, ps: [], why: [] }); const e = tech.get(k); if (!e.ps.includes(p)) e.ps.push(p); (p.under?.layers || []).forEach(l => l.items.forEach(it => { if (norm(it.name) === k) e.why.push(both(it.why?.en || '', it.why?.ar || '')); })); }));
  tech.forEach((e, k) => items.push({ key: 't:' + k, g: 'tech', alt: e.name, t: e.name, s: `${u('usedIn')} ${e.ps.map(p => T(p.name)).join(' · ')}`, ic: techTile(e.name), k: e.name + ' ' + e.why.join(' '), run: () => e.ps.length === 1 ? openAt('p:' + e.ps[0].slug, { tab: e.ps[0].under ? 'stack' : 'facts', find: 'tech-' + k }) : openWorkTech(e.name), prev: { type: 'tech', name: e.name, ps: e.ps } }));
  A.lab.forEach(l => items.push({ key: 'lab:' + l.name, g: 'lab', t: l.name, s: T(l.line), ic: tileFor(l), k: both(l.line.en, l.line.ar), run: () => openApp('lab'), prev: { type: 'shot', m: { ...l.shot, cap: l.name } } }));
  ALLFILMS.forEach((v, i) => items.push({ key: 'f:' + v.name, g: 'films', t: filmTitle(v), s: `${T(v.p.name)} · ${dur(v.dur)}`, ic: tileFor(v.p), k: both((FILM[v.name] || [])[0] || '', (FILM[v.name] || [])[1] || '') + ' ' + v.p.name.en + ' film video فيلم', run: () => { openApp('films'); setTimeout(() => { const pl = $('.win[data-cur=films] [data-player]') || $('.sheet.top [data-player]'); if (pl) selectFilm(pl, i, false); }, 120); }, prev: { type: 'film', v } }));
  const act = (t, k, ic, run, sug) => items.push({ key: 'a:' + k.split(' ')[0], g: 'actions', t, s: '', ic: `<span class="tile sys" style="--tg:linear-gradient(150deg,#56656c,#2b3940)">${ic}</span>`, k, run, sug, prev: { type: 'action', ic } });
  act(T(A.ui.copy) + ': ' + c.email, 'copy email mail نسخ البريد', I.copy, () => copyEmail(), true);
  act(T(A.ui.call) + ' ' + c.phoneDisplay, 'call phone اتصال هاتف', I.phone, () => { location.href = 'tel:' + c.phone; });
  act(T(A.ui.whatsapp), 'whatsapp message واتساب', I.chat, () => window.open(c.whatsapp, '_blank', 'noopener'));
  act('GitHub', 'github code', I.gh, () => window.open(c.github, '_blank', 'noopener')); act('LinkedIn', 'linkedin', I.li, () => window.open(c.linkedin, '_blank', 'noopener'));
  act(u('flip'), 'theme dark light lights سمة إضاءة', I.sparkle, () => setSetting('theme', theme === 'dark' ? 'light' : 'dark'));
  act(T(A.ui.language), 'language arabic english لغة عربية انجليزية', I.globe, () => setLang(other()));
  act(u('controlCenter'), 'control center quick settings مركز التحكم', I.sliders, openCC);
  act(u('grow') + ' · ' + u('impName'), 'imp grow bigger mascot كبر', I.plus, impGrow); act(u('shrink') + ' · ' + u('impName'), 'imp shrink smaller mascot صغر', I.minus, impShrink);
  act(u('laugh'), 'imp laugh mascot اضحك', I.paw, laugh); act(u('giveTreat'), 'treat feed imp banana snack حلوى', I.treatI, spawnTreat, true);
  act(u('notes'), 'notes note write ملاحظة', I.pen, () => openApp('notes'));
  if (isDesk()) {
    act(u('throwBall'), 'ball throw toy play كرة', I.ballI, throwBall);
    act(u('taskView'), 'all windows task view mission control expose نوافذ', I.tasks, openTaskView, true); act(u('mergeAll'), 'merge windows tabs دمج تبويب', I.stack, mergeAll);
    act(u('tileAll'), 'tile arrange windows ترتيب', I.grid, tileWins); act(u('cascade'), 'cascade arrange windows', I.stack, cascadeWins); act(u('showDesktop'), 'desktop minimize all', I.eye, showDesktop);
  }
  act(u('edu'), 'education mmu university multimedia melaka malaysia degree جامعة تعليم', I.cap, () => openApp('about'));
  act(u('restart'), 'restart reboot boot', I.restart, restart);
  items.forEach(it => { it._t = norm(it.t); it._w = it._t.split(/[\s·:,.()\-/–]+/).filter(Boolean); it._k = norm(it.k + ' ' + it.s); it._kw = it._k.split(/[\s·:,.()\-/–]+/).filter(Boolean); it._a = norm(it.alt || '').split(/[\s·:,.()\-/–]+/).filter(Boolean); });
  return items;
};
// edit distance of at most one (a typo)
const near1 = (a, b) => { if (Math.abs(a.length - b.length) > 1) return false; let i = 0, j = 0, e = 0; while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; continue; } if (++e > 1) return false; if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; } } return e + (a.length - i) + (b.length - j) <= 1; };
const initials = (q, words) => q.length >= 2 && words.length >= q.length && words.slice(0).map(w => w[0]).join('').startsWith(q);
const tokScore = (q, it) => {
  if (it._t.startsWith(q)) return 100;
  if (it._w.some(w => w.startsWith(q))) return 80;
  if (it._a.some(w => w.startsWith(q))) return 75;
  if (it._t.includes(q)) return 60;
  if (it._kw.some(w => w.startsWith(q))) return 40;
  if (it._k.includes(q)) return 25;
  if (q.length >= 4 && (it._w.some(w => near1(q, w) || near1(q, w.slice(0, q.length))) || it._kw.some(w => near1(q, w)))) return 18;
  if (initials(q, it._w)) return 30;
  return 0;
};
const scoreOf = (it, toks, recent) => { let s = 0; for (const q of toks) { const v = tokScore(q, it); if (!v) return 0; s += v; } if (it.g === 'tech' && toks.some(q => tokScore(q, it) < 60)) s -= 25; // a technology only mentioned in passing
  return s + (SBOOST[it.g] || 0) + (recent.includes(it.key) ? 14 : 0) - (it.low ? 20 : 0); };
const markText = (text, toks) => {
  let out = esc(text); const lower = text.toLowerCase();
  const spans = []; toks.forEach(q => { const i = lower.indexOf(q); if (i >= 0) spans.push([i, i + q.length]); });
  if (!spans.length) return out; spans.sort((a, b) => a[0] - b[0]);
  let res = '', at = 0; spans.forEach(([a, b]) => { if (a < at) return; res += esc(text.slice(at, a)) + '<mark>' + esc(text.slice(a, b)) + '</mark>'; at = b; });
  return res + esc(text.slice(at));
};
const calc = q => {
  const s = q.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**').replace(/,/g, '');
  if (!/^[\d\s.+\-*/()%]+$/.test(s) || !/\d/.test(s) || !/[+\-*/%]/.test(s.replace(/^\s*-/, ''))) return null;
  try { const v = Function('"use strict";return (' + s + ')')(); return Number.isFinite(v) ? +v.toPrecision(12) : null; } catch { return null; }
};

const openSpot = () => {
  if (spot) return closeSpot();
  closeMenus(); closeCC(); closeNC();
  const box = $('#spot'); box.hidden = false;
  box.innerHTML = `<div class="spot-box glass"><div class="spot-in">${I.search}<input type="search" role="combobox" aria-expanded="true" aria-controls="spot-list" aria-autocomplete="list" placeholder="${esc(u('searchPh'))}" aria-label="${esc(u('search'))}"><kbd>Esc</kbd></div>
    <div class="spot-chips" role="tablist" aria-label="${esc(u('search'))}">${SFILTERS.map((f, i) => `<button role="tab" data-sf="${f}" aria-selected="${i === 0}" tabindex="-1">${esc(u('s_' + f))}<em></em></button>`).join('')}</div>
    <div class="spot-body"><ul id="spot-list" role="listbox"></ul><aside class="spot-prev" aria-live="polite"></aside></div><p class="spot-foot">${esc(u('searchHint'))}</p></div>`;
  spot = { items: spotIndex(), sel: 0, list: [], f: 'all', q: '', opener: document.activeElement };
  const inp = $('input', box); renderSpot(''); inp.focus();
  inp.addEventListener('input', () => renderSpot(inp.value));
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (spot.list.length) { spot.sel = (spot.sel + (e.key === 'ArrowDown' ? 1 : -1) + spot.list.length) % spot.list.length; markSpot(); } }
    if (e.key === 'Enter') { e.preventDefault(); runSpot(spot.sel, { newTab: e.ctrlKey || e.metaKey }); }
    if (e.key === 'Tab') { e.preventDefault(); const i = SFILTERS.indexOf(spot.f); setFilter(SFILTERS[(i + (e.shiftKey ? -1 : 1) + SFILTERS.length) % SFILTERS.length]); }
  });
};
const setFilter = f => { if (!spot) return; spot.f = f; $$('#spot [data-sf]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.sf === f))); renderSpot(spot.q); };
let shrugT = 0;
const renderSpot = q => {
  spot.q = q; const n = norm(q.trim()), toks = n.split(/\s+/).filter(Boolean), recent = recentGet();
  const rows = []; let list = [];
  const groupOut = (title, arr) => { if (!arr.length) return; rows.push(`<li class="sg" role="presentation">${esc(title)}</li>`); arr.forEach(it => { it._i = list.length; list.push(it); rows.push(itemRow(it, toks)); }); };
  const counts = {};
  const v = n ? calc(q) : null;
  if (v != null) { const it = { key: 'calc', g: 'actions', t: `= ${v}`, s: u('s_calc'), ic: `<span class="tile sys" style="--tg:linear-gradient(150deg,#56656c,#2b3940)"><b>=</b></span>`, run: () => copyText(String(v)).then(ok => ok && toast(u('t_calc'), I.copy)), prev: { type: 'calc', v } }; groupOut(u('s_top'), [it]); }
  if (!toks.length) {
    const rec = recent.map(k => spot.items.find(i => i.key === k)).filter(Boolean).filter(i => spot.f === 'all' || i.g === spot.f);
    groupOut(u('s_recent'), rec.slice(0, 5));
    groupOut(u('s_suggest'), spot.items.filter(i => i.sug && !rec.includes(i) && (spot.f === 'all' || i.g === spot.f)).slice(0, 9));
    if (spot.f !== 'all' && !list.length) groupOut(u('s_' + spot.f), spot.items.filter(i => i.g === spot.f).slice(0, 30));
  } else {
    const hits = spot.items.map(i => [i, scoreOf(i, toks, recent)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).map(x => x[0]);
    hits.forEach(h => { counts[h.g] = (counts[h.g] || 0) + 1; });
    if (spot.f !== 'all') groupOut(u('s_' + spot.f), hits.filter(h => h.g === spot.f).slice(0, 40));
    else {
      const top = hits[0]; if (top) groupOut(u('s_top'), [top]);
      SGROUPS.forEach(g => groupOut(u('s_' + (g === 'apps' ? 'apps' : g)), hits.filter(h => h.g === g && h !== top).slice(0, SLIMIT[g])));
    }
  }
  $$('#spot [data-sf]').forEach(b => { const f = b.dataset.sf, c = f === 'all' ? Object.values(counts).reduce((a, b) => a + b, 0) : (counts[f] || 0); $('em', b).textContent = toks.length && c ? c : ''; if (f === 'details') $('em', b).textContent = toks.length && c ? c : ''; });
  spot.list = list; spot.sel = list.length && v == null && toks.length && spot.f === 'all' ? 0 : 0;
  $('#spot-list').innerHTML = rows.length ? rows.join('') : `<li class="empty">${esc(u('noResults'))}</li>`;
  if (!rows.length) impSig('empty', 15000);
  markSpot();
  clearTimeout(shrugT);
  if (toks.length && !list.length && n.length >= 3) shrugT = setTimeout(() => { if (spot && !spot.list.length) { Imp()?.play?.('shrug'); Imp()?.say?.(u('say_nothing'), 2200); } }, 700);
};
const itemRow = (it, toks) => `<li role="option" id="so${it._i}" data-so="${it._i}" aria-selected="false">${it.ic}<span class="so-t"><b>${markText(it.t, toks)}</b>${it.s ? `<small>${markText(it.s, toks)}</small>` : ''}</span><em>${esc(u('s_' + it.g))}</em></li>`;
const prevHTML = it => {
  const pv = it?.prev; if (!pv) return '';
  const openBtns = it.id ? `<div class="row"><button class="btn sm primary" data-so-run="${it._i}">${esc(u('openL'))}</button>${isDesk() && front() ? `<button class="btn sm" data-so-tab="${it._i}">${I.plus}${esc(u('openInTab'))}</button>` : ''}</div>` : '';
  if (pv.type === 'project') { const p = pv.p, m = p.shots[0] || p.phones[0]; return `${m ? `<div class="sp-img ${m.kind === 'phone' ? 'ph' : ''}"><img src="${m.src}" alt=""></div>` : ''}<div class="sp-h">${tileFor(p)}<div><b>${esc(T(p.name))}</b><small>${esc(T(p.category))}</small></div></div><p>${esc(T(p.pitch))}</p><div class="row">${stageChip(p)}${reachChip(p.reach)}</div><div class="stack">${techsOf(p).slice(0, 8).map(s => `<span class="chip mono">${esc(s)}</span>`).join('')}</div>${openBtns}`; }
  if (pv.type === 'detail') { const p = pv.p; return `${pv.img ? `<div class="sp-img ${pv.img.kind === 'phone' ? 'ph' : ''}"><img src="${pv.img.src}" alt=""></div>` : ''}<div class="sp-h">${tileFor(p)}<div><b>${esc(T(p.name))}</b><small>${esc(T(p.category))}</small></div></div><p>${markText(pv.text, norm(spot.q).split(/\s+/).filter(Boolean))}</p>${openBtns}`; }
  if (pv.type === 'shot') return `<div class="sp-img ${pv.m.kind === 'phone' ? 'ph' : ''}"><img src="${pv.m.src}" alt=""></div><p><b>${esc(it.t)}</b><br><span class="muted small">${esc(it.s)}</span></p>`;
  if (pv.type === 'tech') return `<div class="sp-h">${techTile(pv.name)}<div><b dir="ltr">${esc(pv.name)}</b><small>${esc(u('usedIn'))} ${pv.ps.length} ${esc(u('projectsN'))}</small></div></div><div class="sp-list">${pv.ps.map(p => `<button data-open="p:${p.slug}">${tileFor(p)}<span><b>${esc(T(p.name))}</b><small>${esc(T(p.category))}</small></span></button>`).join('')}</div>`;
  if (pv.type === 'film') return `<div class="sp-img"><img src="${pv.v.poster}" alt=""></div><div class="sp-h">${tileFor(pv.v.p)}<div><b>${esc(it.t)}</b><small>${esc(it.s)}</small></div></div>`;
  if (pv.type === 'app') return `<div class="sp-big">${appTile(pv.id)}</div><p class="center"><b>${esc(it.t)}</b></p>${openBtns}`;
  if (pv.type === 'calc') return `<div class="sp-calc" dir="ltr">${esc(spot.q.trim())}<b>= ${esc(pv.v)}</b></div>`;
  return `<div class="sp-big"><span class="tile sys" style="--tg:linear-gradient(150deg,#56656c,#2b3940)">${pv.ic}</span></div><p class="center"><b>${esc(it.t)}</b></p>`;
};
const markSpot = () => {
  $$('#spot-list [data-so]').forEach(li => li.setAttribute('aria-selected', String(+li.dataset.so === spot.sel)));
  const inp = $('#spot input'); inp?.setAttribute('aria-activedescendant', spot.list.length ? 'so' + spot.sel : '');
  $('#so' + spot.sel)?.scrollIntoView({ block: 'nearest' });
  const pv = $('#spot .spot-prev'); if (pv) pv.innerHTML = prevHTML(spot.list[spot.sel]);
};
const runSpot = (i, o = {}) => { const it = spot?.list[i]; if (!it) return; closeSpot(true); if (it.key !== 'calc') recentPush(it.key); it.run(o); };
const closeSpot = keepFocus => { const b = $('#spot'); if (!spot || !b) return; const o = spot.opener; spot = null; clearTimeout(shrugT); b.hidden = true; b.innerHTML = ''; if (!keepFocus && o?.isConnected) o.focus({ preventScroll: true }); };
document.addEventListener('click', e => {
  if (!spot) return;
  const f = e.target.closest('[data-sf]'); if (f) { e.stopPropagation(); setFilter(f.dataset.sf); $('#spot input')?.focus(); return; }
  const r = e.target.closest('[data-so-run]'); if (r) { e.stopPropagation(); runSpot(+r.dataset.soRun); return; }
  const t = e.target.closest('[data-so-tab]'); if (t) { e.stopPropagation(); runSpot(+t.dataset.soTab, { newTab: true }); return; }
  const so = e.target.closest('[data-so]'); if (so) { e.stopPropagation(); runSpot(+so.dataset.so, { newTab: e.ctrlKey || e.metaKey }); }
}, true);
document.addEventListener('pointermove', e => { if (!spot || !FINE) return; const so = e.target.closest?.('[data-so]'); if (so && +so.dataset.so !== spot.sel) { spot.sel = +so.dataset.so; $$('#spot-list [data-so]').forEach(li => li.setAttribute('aria-selected', String(li === so))); const pv = $('#spot .spot-prev'); if (pv) pv.innerHTML = prevHTML(spot.list[spot.sel]); } }, { passive: true });

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
  if (k === 'icons') { S.iconOrder = null; saveS(); fillDesk(); } // choosing an arrangement replaces whatever Imp had moved
  if (k === 'widgets') { fillDesk(); layoutDesk(); }
  if (k === 'ball') syncBall();
  if (k === 'pulse') loadFiles().then(f => f.pulse(!!v));
  syncSettingsUI(); renderCC();
};
const resetSettings = () => { S = { ...DEF }; saveS(); applyTheme(); applyAccent(); applyWall(); applyMotion(); fillDesk(); layoutDesk(); syncBall(); syncSettingsUI(); toast(u('t_reset'), I.restart); };
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
    case 'exit': { const w = findWin('terminal'); if (w) closeWin(w); const s2 = SH.find(x => x.id === 'terminal'); if (s2) closeSheet(s2); break; }
    case 'sudo': dim('nice try.'); break;
    default: dim(u('termUnknown')); impSig('error', 4000);
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
  if (wc) { const w = WM.wins.get(wc.closest('.win').dataset.win); if (!w) return; ({ close: closeWin, min: minimizeWin, max: toggleMax })[wc.dataset.wc](w); return; }
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
    if (a === 'imp-grow') impGrow(); if (a === 'imp-shrink') impShrink(); if (a === 'tasks') openTaskView(); if (a === 'resetlayout') resetLayout();
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
    if (pc.dataset.pc === 'pip') { (document.pictureInPictureElement === v ? document.exitPictureInPicture() : v.play().then(() => v.requestPictureInPicture())).catch(() => { }); return; }
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
  if (e.key === 'F3' || (e.ctrlKey && e.altKey && e.code === 'KeyA')) { if (isDesk()) { e.preventDefault(); openTaskView(); } return; }
  if (e.ctrlKey && e.altKey && e.code === 'KeyC') { e.preventDefault(); openCC(); return; }
  if (e.ctrlKey && e.altKey && e.code === 'KeyW' && isDesk()) { e.preventDefault(); const f = front(); if (f) removeTab(f, f.id); return; }
  if (e.altKey && e.shiftKey && isDesk() && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); cycleTab((e.key === 'ArrowRight') !== rtl() ? 1 : -1); return; }
  if (e.altKey && isDesk() && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && (e.ctrlKey || !typing(e.target))) { e.preventDefault(); closeAssist(); snapKey(front(), e.key); return; }
  if (e.ctrlKey && e.altKey && !e.metaKey) {
    if (e.code === 'KeyD' && isDesk()) { e.preventDefault(); showDesktop(); return; }
    if (e.code === 'KeyG' && isDesk()) { e.preventDefault(); tileWins(); return; }
    if (e.code === 'KeyT') { e.preventDefault(); openApp('terminal'); return; }
  }
  if (e.key === 'Escape') {
    if (spot) return closeSpot();
    if (CC) { closeCC(); $('#ccBtn')?.focus(); return; }
    if (NC) { closeNC(); return; }
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
  if (tb && !tb.classList.contains('wtab') && !tb.closest('.role-seg') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
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
  closeMenus(); closeSpot(); closeLB(); closeAssist(); hideFlyout(); closeCC(); closeNC(); if (TV) closeTaskView(); closeAllWins(true); closeAllSheets(true);
  setMode(); fillAll(); syncBall();
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
const restart = () => { closeMenus(); closeSpot(); closeLB(); closeAssist(); hideFlyout(); closeCC(); closeNC(); if (TV) closeTaskView(); closeAllWins(true); closeAllSheets(true); bootScreen(true).then(() => { if (isDesk()) openWin('start'); }); };

/* ===== round 6 ===== */
/* ---------- window tabs ---------- */
const fillTabs = w => {
  const strip = $('.win-tabs', w.el); if (!strip) return;
  const many = w.tabs.length > 1;
  w.el.classList.toggle('tabbed', many);
  strip.innerHTML = many ? w.tabs.map(t => { const on = t.id === w.id; return `<div class="wtab" role="tab" tabindex="${on ? 0 : -1}" aria-selected="${on}" data-wtab="${esc(t.id)}" title="${esc(appTitle(t.id))}">${appTile(t.id)}<span class="wt-l" dir="auto">${esc(appTitle(t.id))}</span><button class="wt-x" data-wtab-close="${esc(t.id)}" tabindex="-1" aria-label="${esc(u('closeTab'))}: ${esc(appTitle(t.id))}">${I.x}</button></div>`; }).join('') : '';
};
const scrollerOf = w => $('.win-main .scroller', w.el);
const saveTab = w => { const t = w.tabs.find(x => x.id === w.id); if (!t) return; t.tab = w.tab; t.top = scrollerOf(w)?.scrollTop || 0; };
const showTab = (w, t, fx) => {
  stopMedia(w.el); w.id = t.id; w.tab = t.tab;
  fillWin(w); const sc = scrollerOf(w); if (sc) sc.scrollTop = t.top || 0;
  if (fx && !rm()) $('.win-main', w.el).animate([{ opacity: .35, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out' });
  dockSync(); syncURL(); setTimeout(syncPerches, 60);
};
const switchTab = (w, id) => {
  if (!w || w.id === id) return; const t = w.tabs.find(x => x.id === id); if (!t) return;
  saveTab(w); showTab(w, t, true);
  if (id.startsWith('p:')) setTimeout(() => Imp()?.enter?.(w.el), 220);
};
const removeTab = (w, id, quiet) => {
  const i = w.tabs.findIndex(t => t.id === id); if (i < 0) return;
  if (w.tabs.length === 1) { closeWin(w, quiet); return; }
  if (w.id === id) { const nx = w.tabs[i + 1] || w.tabs[i - 1]; w.tabs.splice(i, 1); showTab(w, nx, !quiet); }
  else { w.tabs.splice(i, 1); fillTabs(w); dockSync(); }
  syncPerches();
};
const addTab = (w, id, from) => {
  if (!appMeta(id)) return null;
  if (!w || !isDesk()) return openApp(id, from);
  const ex = findWin(id);
  if (ex === w) { if (w.min) restoreWin(w); switchTab(w, id); focusWin(w); return w; }
  if (ex) removeTab(ex, id, true);
  saveTab(w); w.tabs.push({ id, tab: 'overview', top: 0 });
  if (w.min) restoreWin(w);
  switchTab(w, id); focusWin(w); dockBounce(id);
  return w;
};
const detachTab = (w, id, at) => {
  if (!w || w.tabs.length < 2) return w;
  saveTab(w); const t = { ...w.tabs.find(x => x.id === id) };
  removeTab(w, id, true);
  const nw = openWin(id, null, { instant: true }); if (!nw) return null;
  nw.tab = t.tab; nw.tabs[0] = { ...t }; fillWin(nw); const sc = scrollerOf(nw); if (sc) sc.scrollTop = t.top || 0;
  if (at) { const a = area(); nw.geo.w = Math.min(nw.geo.w, w.geo.w || nw.geo.w); nw.geo.x = clamp(at.x - Math.min(160, nw.geo.w / 3), 0, a.W - nw.geo.w); nw.geo.y = clamp(at.y - 22, a.top, a.H - 120); applyGeo(nw); }
  return nw;
};
const mergeInto = (src, dst, quiet) => {
  if (!src || !dst || src === dst) return;
  saveTab(src); saveTab(dst);
  const moved = src.tabs.filter(t => !dst.tabs.some(d => d.id === t.id)), act = src.id;
  dst.tabs.push(...moved.map(t => ({ ...t })));
  src.tabs = []; stopMedia(src.el); src.closing = true; src.el.remove(); WM.wins.delete(src.key); if (WM.focused === src) WM.focused = null;
  const t = dst.tabs.find(x => x.id === act) || dst.tabs[0];
  if (dst.min) restoreWin(dst);
  showTab(dst, t, true); focusWin(dst); dockSync(); fillDockIfMins();
  if (!quiet) { toast(u('t_merged'), I.stack); Imp()?.react?.('react-smug'); }
};
const mergeAll = () => {
  const f = front() || [...WM.wins.values()][0]; if (!f) return;
  [...WM.wins.values()].filter(w => w !== f && !w.closing).forEach(w => mergeInto(w, f, true));
  toast(u('t_merged'), I.stack); Imp()?.say?.(u('say_tabs'));
};
const togglePin = w => { if (!w) return; w.pin = !w.pin; w.el.classList.toggle('pinned', w.pin); focusWin(w); toast(u(w.pin ? 't_pinned' : 't_unpinned'), I.pinI); };

// a window dragged over another window's title bar joins it as a tab
const mergeHover = (w, x, y) => {
  let hit = null;
  const list = visibleWins().filter(v => v !== w).reverse();
  for (const v of list) {
    const r = v.el.getBoundingClientRect(); if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
    const b = $('.win-bar', v.el).getBoundingClientRect(); if (y <= b.bottom && w.tabs.length) hit = v;
    break; // the top window under the pointer decides
  }
  if (hit !== WM.mergeT) { WM.mergeT?.el.classList.remove('merge-target'); hit?.el.classList.add('merge-target'); if (hit) $('.win-bar', hit.el).dataset.drop = u('dropTab'); WM.mergeT = hit; }
  return hit;
};
const mergeDrop = w => { const t = WM.mergeT; WM.mergeT = null; if (!t) return false; t.el.classList.remove('merge-target'); mergeInto(w, t); return true; };
const mergeCancel = () => { WM.mergeT?.el.classList.remove('merge-target'); WM.mergeT = null; };

// shake a window by its title bar: every other window steps aside; shake again and they come back
const SHK = { w: null, revs: [], sx: 0, lx: 0, at: 0 };
const shakeTrack = (w, ev) => {
  const now = performance.now();
  if (SHK.w !== w) { SHK.w = w; SHK.revs = []; SHK.sx = 0; SHK.lx = ev.clientX; return; }
  const dx = ev.clientX - SHK.lx;
  if (Math.abs(dx) > 18) { const s = Math.sign(dx); if (SHK.sx && s !== SHK.sx) SHK.revs.push(now); SHK.sx = s; SHK.lx = ev.clientX; }
  SHK.revs = SHK.revs.filter(t => now - t < 900);
  if (SHK.revs.length >= 4 && now - SHK.at > 1400) { SHK.revs = []; SHK.at = now; shakeOthers(w); }
};
const shakeOthers = w => {
  const others = visibleWins().filter(v => v !== w);
  if (others.length) { WM.shaken = others.map(v => v.key); others.forEach(v => minimizeWin(v)); toast(u('t_shake'), I.eye); Imp()?.say?.(u('say_whoa'), 1400); }
  else if (WM.shaken?.length) { WM.shaken.forEach(k => { const v = WM.wins.get(k); if (v?.min) restoreWin(v); }); WM.shaken = []; toast(u('t_unshake'), I.stack); setTimeout(() => focusWin(w), 480); }
};

// pulling a tab: sideways reorders, down (or out of the bar) tears it off into its own window that follows the pointer
document.addEventListener('pointerdown', e => {
  const tabEl = e.target.closest?.('.wtab'); if (!tabEl || e.button !== 0 || e.target.closest('.wt-x')) return;
  const winEl = tabEl.closest('.win'), w = WM.wins.get(winEl.dataset.win); if (!w) return;
  e.preventDefault(); e.stopPropagation(); if (!winEl.classList.contains('front')) focusWin(w);
  const id = tabEl.dataset.wtab, sx = e.clientX, sy = e.clientY; let mode = null, nw = null, off = null, zone = null;
  const move = ev => {
    const dx = ev.clientX - sx, dy = ev.clientY - sy;
    if (!mode) { if (Math.abs(dy) > 26 && w.tabs.length > 1) mode = 'tear'; else if (Math.abs(dx) > 8) mode = 'order'; else return; }
    if (mode === 'order') {
      const tabs = $$('.wtab', winEl), i = w.tabs.findIndex(t => t.id === id);
      const j = tabs.findIndex(t => { const r = t.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX <= r.right; });
      if (j >= 0 && j !== i) { const [t] = w.tabs.splice(i, 1); w.tabs.splice(j, 0, t); fillTabs(w); }
      if (Math.abs(dy) > 34 && w.tabs.length > 1) mode = 'tear'; else return;
    }
    if (mode === 'tear' && !nw) {
      nw = detachTab(w, id, { x: ev.clientX, y: ev.clientY }); if (!nw) { mode = 'done'; return; }
      off = { x: ev.clientX - nw.geo.x, y: ev.clientY - nw.geo.y }; nw.el.classList.add('dragging'); nw.dragged = true;
      Imp()?.say?.(u('say_whoa'), 1100);
    }
    if (nw) {
      const a = area(); nw.geo.x = clamp(ev.clientX - off.x, 0, Math.max(0, a.W - nw.geo.w)); nw.geo.y = clamp(ev.clientY - off.y, a.top, a.H - 60);
      nw.el.style.left = nw.geo.x + 'px'; nw.el.style.top = nw.geo.y + 'px';
      const m = mergeHover(nw, ev.clientX, ev.clientY); zone = m ? null : edgeZone(ev.clientX, ev.clientY); showPreview(zone);
    }
  };
  const up = () => {
    removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
    if (!mode) { switchTab(w, id); return; }
    if (nw) { nw.el.classList.remove('dragging'); showPreview(null); if (mergeDrop(nw)) return; if (zone) snapTo(nw, zone.frac, zone.layout, true); else { applyGeo(nw); syncPerches(); } toast(u('t_tornOff'), I.stack); }
  };
  addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
}, true);
document.addEventListener('click', e => {
  const x = e.target.closest?.('[data-wtab-close]');
  if (x) { e.stopPropagation(); const w = WM.wins.get(x.closest('.win').dataset.win); if (w) removeTab(w, x.dataset.wtabClose); return; }
  const nt = e.target.closest?.('[data-newtab]');
  if (nt) { e.stopPropagation(); MENUCTX.win = WM.wins.get(nt.closest('.win').dataset.win); openMenu('newtab', nt, null, e.detail === 0); }
}, true);
document.addEventListener('auxclick', e => { if (e.button !== 1) return; const t = e.target.closest?.('.wtab'); if (!t) return; e.preventDefault(); const w = WM.wins.get(t.closest('.win').dataset.win); if (w) removeTab(w, t.dataset.wtab); });
document.addEventListener('keydown', e => { // arrows along the tab strip
  const t = e.target.closest?.('.wtab'); if (!t || !['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Delete'].includes(e.key)) return;
  const w = WM.wins.get(t.closest('.win').dataset.win); if (!w) return; e.preventDefault();
  if (e.key === 'Delete') { removeTab(w, t.dataset.wtab); return; }
  const i = w.tabs.findIndex(x => x.id === t.dataset.wtab), d = (e.key === 'ArrowRight') !== rtl() ? 1 : -1;
  const j = e.key === 'Home' ? 0 : e.key === 'End' ? w.tabs.length - 1 : (i + d + w.tabs.length) % w.tabs.length;
  switchTab(w, w.tabs[j].id); $(`.wtab[data-wtab="${CSS.escape(w.tabs[j].id)}"]`, w.el)?.focus();
});
const cycleTab = d => { const w = front(); if (!w || w.tabs.length < 2) return; const i = w.tabs.findIndex(t => t.id === w.id); switchTab(w, w.tabs[(i + d + w.tabs.length) % w.tabs.length].id); };

/* ---------- menus for tabs and title bars ---------- */
const MENUCTX = { win: null, tab: null, at: null, items: null };
const LAUNCH = () => ['work', ...A.projects.map(p => 'p:' + p.slug), 'films', 'lab', 'about', 'contact', 'notes', 'settings', 'terminal'];
const extraMenu = kind => {
  if (kind === 'custom') return MENUCTX.items || [];
  const w = MENUCTX.win && WM.wins.get(MENUCTX.win.key) ? MENUCTX.win : null;
  if (kind === 'newtab') return [{ head: u('newTab') }, ...LAUNCH().map(id => MI(appTitle(id), () => addTab(w || front(), id), { icon: appTile(id), disabled: !!w && w.tabs.some(t => t.id === id) }))];
  if (kind === 'winctx' && w) {
    const tab = MENUCTX.tab || w.id, many = w.tabs.length > 1;
    return [MI(u('newTab'), () => setTimeout(() => openMenu('newtab', null, MENUCTX.at), 0), { icon: I.plus }),
      MI(u('moveTabNew'), () => { const nw = detachTab(w, tab, null); if (nw) { focusWin(nw); toast(u('t_tornOff'), I.stack); } }, { icon: I.out, disabled: !many }),
      MI(u('mergeAll'), mergeAll, { icon: I.stack, disabled: WM.wins.size < 2 }), SEP,
      MI(u('pinTop'), () => togglePin(w), { role: 'menuitemcheckbox', checked: !!w.pin, sw: true }),
      MI(u('minimize'), () => minimizeWin(w), { icon: I.minus }), MI(w.snap ? u('restore') : u('zoom'), () => toggleMax(w), { icon: I.expand }),
      MI(u('snapLeft'), () => snapKey(w, 'ArrowLeft'), { kbd: 'Ctrl Alt ←' }), MI(u('snapRight'), () => snapKey(w, 'ArrowRight'), { kbd: 'Ctrl Alt →' }), SEP,
      ...(many ? [MI(u('closeTab'), () => removeTab(w, tab), { icon: I.x, kbd: 'Ctrl Alt W' })] : []), MI(u('closeWin'), () => closeWin(w), { icon: I.x })];
  }
  if (kind === 'iconctx') { const id = MENUCTX.tab; return [MI(u('openL'), () => openApp(id), { icon: appTile(id) }), MI(u('openInTab'), () => addTab(front(), id), { icon: I.plus, disabled: !front() })]; }
  return null;
};
document.addEventListener('contextmenu', e => {
  const bar = e.target.closest?.('.win-bar'); const launcher = e.target.closest?.('button.icon[data-open], button.dock-item[data-open], button.ptile[data-open], button.rel-item[data-open]');
  if (bar && isDesk()) { e.preventDefault(); e.stopPropagation(); MENUCTX.win = WM.wins.get(bar.closest('.win').dataset.win); MENUCTX.tab = e.target.closest('.wtab')?.dataset.wtab || null; MENUCTX.at = { x: e.clientX, y: e.clientY }; openMenu('winctx', null, MENUCTX.at); return; }
  if (launcher && isDesk()) { e.preventDefault(); e.stopPropagation(); MENUCTX.tab = launcher.dataset.open; openMenu('iconctx', null, { x: e.clientX, y: e.clientY }); }
}, true);
// Ctrl- or ⌘-click (or middle-click) a launcher: open it as a tab in the front window
document.addEventListener('click', e => {
  if (!(e.ctrlKey || e.metaKey) || !isDesk()) return; const op = e.target.closest?.('[data-open]'); if (!op || op.tagName === 'A' || !front()) return;
  e.preventDefault(); e.stopPropagation(); addTab(front(), op.dataset.open, op);
}, true);
document.addEventListener('auxclick', e => { if (e.button !== 1 || !isDesk()) return; const op = e.target.closest?.('[data-open]'); if (!op || op.tagName === 'A' || !front()) return; e.preventDefault(); addTab(front(), op.dataset.open, op); });

/* ---------- All windows (task view): live thumbnails of every window, Imp stands on them ---------- */
let TV = null;
const tvClone = w => {
  const src = $('.win-main', w.el); if (!src) return '';
  const c = src.cloneNode(true);
  c.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
  c.querySelectorAll('*').forEach(n => { for (const a of [...n.attributes]) if (a.name.startsWith('data-imp')) n.removeAttribute(a.name); });
  c.querySelectorAll('video').forEach(v => { const im = document.createElement('img'); im.src = v.poster || ''; im.className = v.className; im.style.cssText = 'width:100%;height:100%;object-fit:cover'; v.replaceWith(im); });
  c.querySelectorAll('img[loading]').forEach(i => i.removeAttribute('loading'));
  return c;
};
const openTaskView = () => {
  if (!isDesk()) return; if (TV) return closeTaskView();
  closeMenus(); closeSpot(); closeAssist(); hideFlyout(); closeCC(); closeNC();
  const wins = [...WM.wins.values()].filter(w => !w.closing).sort((a, b) => (a.min - b.min) || zOf(b) - zOf(a));
  const box = document.createElement('div'); box.id = 'taskview'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', u('taskView'));
  box.innerHTML = `<div class="tv-head"><b class="h3 m0">${esc(u('taskView'))}</b><span class="muted small">${wins.length} ${esc(u('windowsN'))}</span><span class="grow"></span>
    <button class="btn sm" data-tv="tile" ${wins.length ? '' : 'disabled'}>${I.grid}${esc(u('tileAll'))}</button><button class="btn sm" data-tv="merge" ${wins.length > 1 ? '' : 'disabled'}>${I.stack}${esc(u('mergeAll'))}</button><button class="btn sm" data-tv="desk">${I.eye}${esc(u('showDesktop'))}</button></div>
    <div class="tv-grid" role="list">${wins.length ? wins.map((w, i) => `<div class="tv-card ${w.min ? 'is-min' : ''}" role="listitem" data-tvw="${w.key}" data-imp="ledge" style="--i:${i}">
      <div class="tv-bar">${appTile(w.id)}<b>${esc(appTitle(w.id))}</b>${w.tabs.length > 1 ? `<span class="chip">${w.tabs.length} ${esc(u('tabsN'))}</span>` : ''}${w.min ? `<span class="chip">${esc(u('minimized'))}</span>` : ''}${w.pin ? `<span class="chip">${I.pinI}</span>` : ''}
        <button class="tv-x" data-tv-close="${w.key}" aria-label="${esc(u('close'))}: ${esc(appTitle(w.id))}">${I.x}</button></div>
      <button class="tv-prev" data-tv-go="${w.key}" aria-label="${esc(appTitle(w.id))}"><span class="tv-clone"></span></button>
      ${w.tabs.length > 1 ? `<div class="tv-tabs">${w.tabs.map(t => `<button data-tv-tab="${w.key}|${esc(t.id)}" title="${esc(appTitle(t.id))}" aria-label="${esc(appTitle(t.id))}" ${t.id === w.id ? 'aria-current="true"' : ''}>${appTile(t.id)}</button>`).join('')}</div>` : ''}</div>`).join('') : `<p class="tv-empty">${esc(u('tvEmpty'))}</p>`}</div>
    <p class="tv-foot">${esc(u('tvHint'))}</p>`;
  document.body.append(box); TV = { el: box, opener: document.activeElement };
  wins.forEach(w => {
    const holder = $(`.tv-card[data-tvw="${w.key}"] .tv-clone`, box), c = tvClone(w); if (!holder || !c) return;
    const ww = w.geo.w || 900, hh = (w.geo.h || w.el.offsetHeight || 640) - 44, pw = holder.parentElement.clientWidth;
    holder.style.width = ww + 'px'; holder.style.height = hh + 'px'; holder.style.transform = `scale(${pw / ww})`; holder.append(c);
    const s0 = scrollerOf(w)?.scrollTop || w.tabs.find(t => t.id === w.id)?.top || 0, s1 = $('.scroller', c); if (s1) s1.scrollTop = s0;
  });
  $('.tv-prev', box)?.focus({ preventScroll: true });
  setTimeout(() => { if (TV) Imp()?.go?.('ledge'); }, rm() ? 60 : 380);
};
const closeTaskView = (then) => {
  if (!TV) return; const el = TV.el; TV = null;
  if (rm()) el.remove(); else { el.classList.add('out'); setTimeout(() => el.remove(), 220); }
  then?.();
};
document.addEventListener('click', e => {
  if (!TV) return; const t = e.target;
  const go = t.closest('[data-tv-go]'); if (go) { const w = WM.wins.get(go.dataset.tvGo); closeTaskView(() => { if (!w) return; w.min ? restoreWin(w) : focusWin(w); w.el.focus({ preventScroll: true }); }); return; }
  const tb = t.closest('[data-tv-tab]'); if (tb) { const [k, id] = tb.dataset.tvTab.split('|'), w = WM.wins.get(k); closeTaskView(() => { if (!w) return; if (w.min) restoreWin(w); switchTab(w, id); focusWin(w); }); return; }
  const x = t.closest('[data-tv-close]');
  if (x) { const w = WM.wins.get(x.dataset.tvClose), card = x.closest('.tv-card'); if (w) closeWin(w, true); card.style.pointerEvents = 'none'; if (rm()) card.remove(); else card.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.9)' }], { duration: 200 }).onfinish = () => { card.remove(); if (!$('.tv-card', TV?.el)) closeTaskView(); }; return; }
  const a = t.closest('[data-tv]'); if (a) { const k = a.dataset.tv; closeTaskView(() => { if (k === 'tile') tileWins(); if (k === 'desk') showDesktop(); if (k === 'merge') mergeAll(); }); return; }
  if (t === TV.el || t.closest('.tv-grid') === t) closeTaskView();
}, true);
document.addEventListener('keydown', e => {
  if (!TV) return;
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeTaskView(); return; }
  const cards = $$('.tv-prev', TV.el), i = cards.indexOf(document.activeElement); if (!cards.length) return;
  if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
    e.preventDefault(); e.stopPropagation();
    const cols = Math.max(1, Math.round($('.tv-grid', TV.el).clientWidth / (cards[0].closest('.tv-card').offsetWidth + 18)));
    const d = { ArrowRight: rtl() ? -1 : 1, ArrowLeft: rtl() ? 1 : -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
    cards[clamp((i < 0 ? 0 : i) + d, 0, cards.length - 1)].focus();
  }
  if ((e.key === 'Delete' || e.key === 'Backspace') && i >= 0) { e.preventDefault(); $('.tv-x', cards[i].closest('.tv-card')).click(); }
}, true);

/* ---------- Control Center ---------- */
let CC = null;
const impSizes = () => Imp()?.sizes || [0.55, 0.7, 0.8, 1, 1.25];
const ccTile = (k, icon, title, sub, on) => `<button class="cc-tile" data-cc="${k}" ${on == null ? '' : `aria-pressed="${!!on}"`}><span class="cc-ic">${icon}</span><span><b>${esc(title)}</b><small>${esc(sub)}</small></span></button>`;
const ccHTML = () => {
  const st = Imp()?.state() || {}, si = Math.max(0, impSizes().indexOf(Imp()?.size?.() ?? .8));
  return `<div class="cc-head"><b>${esc(u('controlCenter'))}</b><button class="tb-btn icon-only" data-cc="close" aria-label="${esc(u('close'))}">${I.x}</button></div>
  <div class="cc-grid">
    ${ccTile('theme', theme === 'dark' ? I.moon : I.sun, theme === 'dark' ? u('darkL') : u('lightL'), u('themeL'), theme === 'dark')}
    ${ccTile('lang', I.globe, rtl() ? 'العربية' : 'English', u('languageL'), null)}
    ${ccTile('imp', I.paw, u('impName'), st.hidden ? u('off') : u('on'), !st.hidden)}
    ${ccTile('sound', sound.on ? I.vol : I.mute, u('soundL'), sound.on ? u('on') : u('off'), sound.on)}
    ${ccTile('motion', I.sparkle, u('reduceMotion'), rm() ? u('on') : u('off'), rm())}
    ${ccTile('pulse', I.pulseI, u('pulse'), S.pulse ? u('on') : u('off'), !!S.pulse)}
    ${isDesk() ? ccTile('ball', I.ballI, u('ball'), S.ball ? u('on') : u('off'), S.ball) : ccTile('treat', I.treatI, u('treat'), u('giveTreat'), null)}
  </div>
  <label class="cc-row"><span>${esc(u('impSize'))}</span><input type="range" min="0" max="${impSizes().length - 1}" step="1" value="${si}" data-cc-size aria-label="${esc(u('impSize'))}"><output data-imp-size-readout></output></label>
  <div class="cc-row"><span>${esc(u('accent'))}</span><div class="swatches" role="radiogroup" aria-label="${esc(u('accent'))}">${Object.entries(ACCENTS).map(([k, c]) => `<button role="radio" data-set="accent" data-val="${k}" aria-checked="${S.accent === k}" aria-label="${esc(u('A_' + k))}" title="${esc(u('A_' + k))}" style="--sw1:${c[0]};--sw2:${c[1]}"></button>`).join('')}</div></div>
  <div class="cc-walls" role="radiogroup" aria-label="${esc(u('wallpaper'))}">${WALLS.map(k => `<button role="radio" data-set="wall" data-val="${k}" aria-checked="${S.wall === k}" title="${esc(u('W_' + k))}" aria-label="${esc(u('W_' + k))}"><span class="wthumb wt-${k}"></span></button>`).join('')}</div>
  <div class="cc-acts"><button class="btn sm" data-act="lights">${I.sparkle}${esc(u('flip'))}</button><button class="btn sm" data-cc="treat">${I.treatI}${esc(u('treat'))}</button>${isDesk() ? `<button class="btn sm" data-cc="throw">${I.ballI}${esc(u('throwBall'))}</button>` : ''}<button class="btn sm" data-cc="settings">${I.gear}${esc(u('settingsDots'))}</button></div>`;
};
const renderCC = () => { if (!CC) return; const f = document.activeElement?.dataset?.cc; CC.el.innerHTML = ccHTML(); syncImpSize(CC.el); if (f) $(`[data-cc="${f}"]`, CC.el)?.focus({ preventScroll: true }); };
const openCC = () => {
  if (CC) return closeCC(); closeMenus(); closeSpot(); closeNC();
  const el = document.createElement('div'); el.id = 'cc'; el.className = 'glass panel-pop'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', u('controlCenter')); el.dataset.imp = 'ledge';
  document.body.append(el); CC = { el, btn: $('#ccBtn') }; CC.btn?.setAttribute('aria-expanded', 'true'); renderCC();
  $('.cc-tile', el)?.focus({ preventScroll: true });
};
const closeCC = () => { if (!CC) return; CC.el.remove(); CC.btn?.setAttribute('aria-expanded', 'false'); CC = null; };
document.addEventListener('click', e => {
  const open = e.target.closest?.('[data-cc-open]'); if (open) { e.stopPropagation(); openCC(); return; }
  if (!CC) return;
  if (!e.target.closest('#cc')) { if (!e.target.closest('.imp-hit, .toy')) closeCC(); return; }
  const b = e.target.closest('[data-cc]'); if (!b) { setTimeout(renderCC, 30); return; }
  e.stopPropagation(); const k = b.dataset.cc;
  if (k === 'close') return closeCC();
  if (k === 'theme') setSetting('theme', theme === 'dark' ? 'light' : 'dark');
  if (k === 'lang') { closeCC(); setLang(rtl() ? 'en' : 'ar'); return; }
  if (k === 'imp') toggleImp();
  if (k === 'sound') { sound.on = !sound.on; $$('video:not(.preview)').forEach(x => { x.muted = !sound.on; }); syncSound(); }
  if (k === 'motion') setSetting('motion', S.motion === 'reduce' ? 'auto' : 'reduce');
  if (k === 'ball') setSetting('ball', !S.ball);
  if (k === 'pulse') setSetting('pulse', !S.pulse);
  if (k === 'treat') { closeCC(); spawnTreat(); return; }
  if (k === 'throw') { closeCC(); throwBall(); return; }
  if (k === 'settings') { closeCC(); openApp('settings'); return; }
  setTimeout(renderCC, 40);
}, true);
document.addEventListener('change', e => {
  const r = e.target.closest?.('[data-cc-size]'); if (!r) return;
  const sz = impSizes(), cur = sz.indexOf(Imp()?.size?.() ?? .8), v = +r.value; if (v === cur) return;
  if (Imp()?.state().hidden) Imp().show();
  Imp()?.setSize?.(sz[v]); Imp()?.react?.(v > cur ? ['react-smug', 'react-triumph', 'react-laugh'] : ['react-annoyed', 'react-shy', 'react-sad']);
  toast(u(v > cur ? 't_grow' : 't_shrink'), v > cur ? I.plus : I.minus);
});
document.addEventListener('imp:visibility', () => setTimeout(renderCC, 20));

/* ---------- notifications and calendar (the clock) ---------- */
let NC = null;
const ago = t => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? u('justNow') : rtl() ? `${m} ${u('minAgo')}` : `${m} ${u('minAgo')}`; };
const riyadh = () => { const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Riyadh', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date()).map(x => [x.type, +x.value || x.value])); return { y: p.year, m: p.month - 1, d: p.day }; };
const calHTML = () => {
  const { y, m, d } = riyadh(), loc = rtl() ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', first = new Date(Date.UTC(y, m, 1)).getUTCDay(), days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const wk = [...Array(7)].map((_, i) => new Intl.DateTimeFormat(loc, { weekday: 'narrow', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 8, 1 + i))));
  const title = new Intl.DateTimeFormat(loc, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m, 1)));
  const long = new Intl.DateTimeFormat(loc, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Riyadh' }).format(new Date());
  const cells = [...Array(first)].map(() => '<span></span>').concat([...Array(days)].map((_, i) => `<span class="${i + 1 === d ? 'today' : ''}" ${i + 1 === d ? `aria-current="date" title="${esc(u('today'))}"` : ''}>${i + 1}</span>`));
  return `<div class="cal"><div class="cal-top"><span class="eyebrow">${esc(u('khobar'))}</span><b>${esc(long)}</b><span class="cal-clock" data-clock="time"></span></div><div class="cal-m">${esc(title)}</div><div class="cal-g">${wk.map(x => `<i>${esc(x)}</i>`).join('')}${cells.join('')}</div></div>`;
};
const ncList = () => NOTIFS.length ? NOTIFS.map(n => `<li><span class="ti">${n.icon}</span><span><b>${esc(n.msg)}</b><small>${esc(ago(n.at))}</small></span></li>`).join('') : `<li class="empty">${esc(u('noNotifs'))}</li>`;
const ncHTML = () => `${calHTML()}<div class="nc-h"><b>${esc(u('notifications'))}</b>${NOTIFS.length ? `<button class="btn sm" data-nc-clear>${esc(u('clearAll'))}</button>` : ''}</div><ul class="nc-list">${ncList()}</ul>`;
const openNC = () => {
  if (NC) return closeNC(); closeMenus(); closeSpot(); closeCC();
  const el = document.createElement('div'); el.id = 'nc'; el.className = 'glass panel-pop'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', u('ncLabel')); el.dataset.imp = 'ledge';
  el.innerHTML = ncHTML(); document.body.append(el); NC = { el }; tickClock(); $('[data-nc]')?.setAttribute('aria-expanded', 'true'); $('.nc-dot')?.setAttribute('hidden', '');
  Imp()?.goTo?.(el, 'ledge'); setTimeout(() => { const t = NC && $('.cal .today', el); if (t && Imp()?.pointAt?.(t)) Imp()?.say?.(u('say_today'), 1600); }, rm() ? 200 : 1500);
};
const closeNC = () => { if (!NC) return; NC.el.remove(); NC = null; $('[data-nc]')?.setAttribute('aria-expanded', 'false'); };
document.addEventListener('click', e => {
  if (e.target.closest?.('[data-nc]')) { e.stopPropagation(); openNC(); return; }
  if (!NC) return;
  if (e.target.closest('[data-nc-clear]')) { e.stopPropagation(); NOTIFS.length = 0; NC.el.innerHTML = ncHTML(); tickClock(); return; }
  if (!e.target.closest('#nc, .imp-hit')) closeNC();
}, true);
let toastPointAt = 0;
document.addEventListener('os:toast', e => { // Imp glances at fresh notifications; a dot waits on the clock until you look
  if (!NC) $('.nc-dot')?.removeAttribute('hidden'); else { $('.nc-list', NC.el).innerHTML = ncList(); }
  const now = performance.now(); if (now - toastPointAt < 7000) return; toastPointAt = now;
  setTimeout(() => { if (e.detail?.el?.isConnected) Imp()?.pointAt?.(e.detail.el); }, 160);
});

/* ---------- Notes: as many notes as you like, kept in this browser ----------
   localStorage 'pf-a-notes' holds [{ id, text, made, at, desk?, trash? }], newest first. The first line of a note is its
   title. `desk` puts the note on the desktop (laptop) or the home screen (phone) as a file: { c, r } is its grid cell,
   and the file is the note itself, not a copy. `trash` is when it went to the Trash; files.js shows the files and the
   Trash. Typing saves half a second after you stop (and on leaving the page); Save and Ctrl/Cmd+S save at once.
   Every open Notes window, tab and phone sheet shows the same notes. Download gives the note as .txt or .md. */
const NK = 'pf-a-notes';
const NT = { list: null, sel: null, timer: 0, dirty: false, savedAt: 0, failed: false };
const notesLoad = () => {
  let list = null; try { list = JSON.parse(localStorage.getItem(NK) || 'null'); } catch { }
  if (!Array.isArray(list)) { // the one note the first Notes kept comes along as the first note
    const old = ls.get('pf-a-note'), now = Date.now();
    list = old && old.trim() ? [{ id: 'n' + now.toString(36), text: old, made: now, at: now }] : [];
  }
  const month = Date.now() - 30 * 864e5; // the Trash forgets after 30 days
  return list.filter(n => n && typeof n.id === 'string' && typeof n.text === 'string' && !(n.trash && n.trash < month));
};
const notesAll = () => NT.list || (NT.list = notesLoad());
const notesLive = () => notesAll().filter(n => !n.trash);
const noteById = id => notesAll().find(n => n.id === id) || null;
const noteCur = () => notesLive().find(n => n.id === NT.sel) || null;
const noteTitle = t => (t.split('\n').find(l => l.trim()) || '').trim().replace(/^#+\s*/, '').slice(0, 80);
const notePeek = t => { const ls2 = t.split('\n').filter(l => l.trim()); return (ls2[1] || '').trim().slice(0, 90); };
const noteWords = t => t.trim() ? t.trim().split(/\s+/).length : 0;
const noteTime = ms => {
  const d = new Date(ms), now = new Date(), loc = rtl() ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB';
  return d.toDateString() === now.toDateString() ? d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) : d.toLocaleDateString(loc, { day: 'numeric', month: 'short' });
};
// write everything now; an empty note that is not the open one is dropped
const notesSave = () => {
  clearTimeout(NT.timer); NT.timer = 0;
  NT.list = notesAll().filter(n => n.text.trim() || n.id === NT.sel);
  try {
    localStorage.setItem(NK, JSON.stringify(NT.list.filter(n => n.text.trim())));
    try { localStorage.removeItem('pf-a-note'); } catch { }
    NT.dirty = false; NT.failed = false; NT.savedAt = Date.now();
  } catch { NT.failed = true; }
  notesStatus(); return !NT.failed;
};
// every Notes on the page, plus one being mounted that is not on the page yet
const notesRoots = r => { const set = new Set($$('.app.notes')), a = r && (r.matches?.('.app.notes') ? r : $('.app.notes', r)); if (a) set.add(a); return [...set]; };
const notesStatus = (r = null) => {
  const txt = NT.failed ? u('notesFail') : NT.dirty ? u('notesSaving') : NT.savedAt ? `${u('notesSavedAt')} ${noteTime(NT.savedAt)}` : '';
  notesRoots(r).map(x => $('.nt-status', x)).filter(Boolean).forEach(s => { s.textContent = txt; s.classList.toggle('bad', NT.failed); });
};
const notesListHTML = root => {
  const q = norm($('[data-nt="find"]', root)?.value || ''), all = notesLive();
  const shown = all.filter(n => !q || norm(n.text).includes(q));
  if (!shown.length) return `<li class="nt-none muted small">${esc(q ? u('notesNone') : u('notesEmpty'))}</li>`;
  return shown.map(n => `<li><button type="button" class="nt-item" data-nt-id="${esc(n.id)}"${n.id === NT.sel ? ' aria-current="true"' : ''}>
    <b dir="auto">${esc(noteTitle(n.text) || u('notesEmpty'))}</b><span class="nt-meta"><time dir="ltr">${esc(noteTime(n.at))}</time>${n.desk ? `<span class="nt-on">${I.fileI}${esc(u(isDesk() ? 'onDesk' : 'onHome'))}</span>` : `<span dir="auto">${esc(notePeek(n.text))}</span>`}</span></button></li>`).join('');
};
// draw every open Notes; `keep` is the editor being typed in, which is left alone
const notesRender = (keep = null, r = null) => {
  if (!NT.sel || !noteCur()) NT.sel = notesLive()[0]?.id || null;
  const cur = noteCur(), inTrash = notesAll().filter(n => n.trash).length;
  notesRoots(r).forEach(root => {
    const ul = $('.nt-list', root); if (ul) ul.innerHTML = notesListHTML(root);
    const ta = $('.note-ta', root);
    if (ta && ta !== keep && ta.value !== (cur?.text || '')) ta.value = cur?.text || '';
    const n = $('.note-n', root); if (n) { const w = noteWords(cur?.text || ''), c = notesLive().filter(x => x.text.trim()).length; n.textContent = `${w} ${u(w === 1 ? 'wordOne' : 'notesWords')} · ${c} ${u(c === 1 ? 'notesOne' : 'notesCount')}`; }
    const del = $('[data-nt="del"]', root); if (del) del.disabled = !cur || (!cur.text.trim() && notesLive().length < 2);
    const dk = $('[data-nt="desk"]', root);
    if (dk) { const on = !!cur?.desk, lbl = u(on ? (isDesk() ? 'offDesk' : 'offHome') : (isDesk() ? 'toDesk' : 'toHome')); dk.setAttribute('aria-pressed', String(on)); dk.setAttribute('aria-label', lbl); dk.title = lbl; $('.nt-desk-l', dk).textContent = lbl; dk.disabled = !cur || !cur.text.trim(); }
    const tn = $('.nt-trash-n', root); if (tn) tn.textContent = inTrash ? String(inTrash) : '';
  });
  notesStatus(r);
  FILES_API?.refresh();
};
const noteFocus = root => { const ta = root && $('.note-ta', root); if (ta) { ta.focus({ preventScroll: true }); ta.setSelectionRange(ta.value.length, ta.value.length); } };
const noteNew = (root, text = '') => {
  const cur = noteCur();
  if (!text && cur && !cur.text.trim()) { noteFocus(root); return cur; } // the open note is still empty: write there
  const now = Date.now(), n = { id: 'n' + now.toString(36) + Math.floor(Math.random() * 1e4).toString(36), text, made: now, at: now };
  notesAll().unshift(n); NT.sel = n.id; notesSave(); notesRender(null, root); noteFocus(root); return n;
};
const noteSelect = (id, root) => { if (NT.dirty) notesSave(); NT.sel = id; NT.list = notesAll().filter(n => n.text.trim() || n.id === id); notesRender(); if (isDesk() && root) noteFocus(root); };
// the Trash keeps a deleted note (and where its file was) until it is restored, emptied or 30 days old
const noteTrash = (id, quiet) => {
  const n = noteById(id); if (!n || n.trash) return;
  if (!n.text.trim()) { NT.list = notesAll().filter(x => x !== n); notesSave(); notesRender(); return; }
  n.trash = Date.now(); if (NT.sel === id) NT.sel = null; notesSave(); notesRender();
  Imp()?.play?.('shrug');
  if (!quiet) toast(u('movedTrash'), I.trash, { label: u('undo'), run: () => noteRestore(id, true) });
};
const noteRestore = (id, quiet) => { const n = noteById(id); if (!n) return; delete n.trash; NT.sel = n.id; notesSave(); notesRender(); if (!quiet) toast(u('restored'), I.restart); };
const noteDelete = root => { const n = noteCur(); if (!n) return; noteTrash(n.id); if (!notesLive().length) noteNew(root); };
// the note as a file on the desktop (laptop) or home screen (phone); files.js picks the cell when none is given
const noteToDesk = (id, cell, quiet) => { const n = noteById(id); if (!n || !n.text.trim()) return; n.desk = cell || FILES_API?.freeCell() || { c: 0, r: 0 }; notesSave(); notesRender(); if (!quiet) toast(u(isDesk() ? 'fileOnDesk' : 'fileOnHome'), I.fileI); };
const noteOffDesk = (id, quiet) => { const n = noteById(id); if (!n || !n.desk) return; delete n.desk; notesSave(); notesRender(); if (!quiet) toast(u('fileBack'), I.pen); };
const noteOpen = id => { const n = noteById(id); if (!n) return; if (n.trash) delete n.trash; NT.sel = id; notesSave(); openApp('notes'); notesRender(); };
const mdOf = t => { const lines = t.split('\n'), i = lines.findIndex(l => l.trim()); if (i < 0 || /^#/.test(lines[i].trim())) return t; lines[i] = '# ' + lines[i].trim(); return lines.join('\n'); };
const fileBase = n => noteTitle(n.text).replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60) || u('notesUntitled');
const saveBlob = (blob, name) => {
  const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; a.hidden = true; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 8000);
};
const noteDownload = (fmt, n = noteCur()) => {
  if (NT.dirty) notesSave();
  if (!n || !n.text.trim()) { toast(u('notesNothing'), I.pen); return; }
  const name = `${fileBase(n)}.${fmt}`, text = n.text.replace(/\r\n?/g, '\n'), body = fmt === 'md' ? mdOf(text) : text;
  saveBlob(new Blob([body.endsWith('\n') ? body : body + '\n'], { type: fmt === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8' }), name);
  toast(`${u('notesDownloaded')}: ${name}`, I.download);
};
const noteMenu = (root, open) => {
  const m = root && $('.nt-dl', root), b = root && $('[data-nt="dl"]', root); if (!m) return;
  const on = open ?? m.hidden; m.hidden = !on; b.setAttribute('aria-expanded', String(on)); if (on) $('button', m)?.focus();
};
// the window is not on the page yet when it is mounted, so the editor takes focus a moment later
const mountNotes = root => { notesAll(); notesRender(null, root); if (!noteCur()) noteNew(root); if (isDesk()) setTimeout(() => noteFocus(root), 120); };
document.addEventListener('input', e => {
  const t = e.target, root = t.closest?.('.app.notes'); if (!root) return;
  if (t.matches('[data-nt="find"]')) { const ul = $('.nt-list', root); if (ul) ul.innerHTML = notesListHTML(root); return; }
  if (!t.classList.contains('note-ta')) return;
  let cur = noteCur(); if (!cur) { noteNew(root); cur = noteCur(); }
  cur.text = t.value; cur.at = Date.now();
  const all = notesAll(), i = all.indexOf(cur); if (i > 0) { all.splice(i, 1); all.unshift(cur); } // the note you are writing moves to the top
  NT.dirty = true; clearTimeout(NT.timer); NT.timer = setTimeout(() => { notesSave(); notesRender(t); }, 500);
  notesRender(t);
});
document.addEventListener('click', e => {
  const root = e.target.closest?.('.app.notes');
  $$('.app.notes .nt-dl:not([hidden])').forEach(m => { if (!m.closest('.nt-dlw').contains(e.target)) noteMenu(m.closest('.app.notes'), false); });
  if (!root) return;
  const item = e.target.closest('[data-nt-id]'); if (item) { if (FILES_API?.justDragged()) return; noteSelect(item.dataset.ntId, root); return; }
  const b = e.target.closest('[data-nt]'); if (!b) return;
  const k = b.dataset.nt, cur = noteCur();
  if (k === 'new') noteNew(root);
  else if (k === 'save') { if (notesSave()) { b.classList.remove('flash-ok'); void b.offsetWidth; b.classList.add('flash-ok'); } }
  else if (k === 'del') noteDelete(root);
  else if (k === 'desk' && cur) { if (NT.dirty) notesSave(); loadFiles().then(() => cur.desk ? noteOffDesk(cur.id) : noteToDesk(cur.id)); }
  else if (k === 'dl') noteMenu(root);
  else if (k === 'dl-txt' || k === 'dl-md') { noteMenu(root, false); noteDownload(k === 'dl-md' ? 'md' : 'txt'); }
});
// drag a note out of the list to make it a file (laptop); files.js does the dragging
document.addEventListener('pointerdown', e => {
  const it = e.target.closest?.('.app.notes .nt-item'); if (!it || e.button !== 0 || !isDesk()) return;
  loadFiles().then(f => f.dragNote(e, it.dataset.ntId, it));
});
document.addEventListener('contextmenu', e => {
  const it = e.target.closest?.('.app.notes .nt-item'); if (!it) return;
  e.preventDefault(); e.stopPropagation(); loadFiles().then(f => f.menuFor(it.dataset.ntId, { x: e.clientX, y: e.clientY }, it));
}, true);
document.addEventListener('keydown', e => {
  const root = e.target.closest?.('.app.notes'); if (!root) return;
  if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 's') { e.preventDefault(); e.stopPropagation(); notesSave(); return; }
  if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyN') { e.preventDefault(); noteNew(root); return; }
  const m = $('.nt-dl', root);
  if (e.key === 'Escape' && m && !m.hidden) { e.preventDefault(); e.stopPropagation(); noteMenu(root, false); $('[data-nt="dl"]', root)?.focus(); return; }
  if (m && !m.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); const bs = $$('button', m), i = bs.indexOf(document.activeElement); bs[(i + (e.key === 'ArrowDown' ? 1 : bs.length - 1)) % bs.length]?.focus(); return; }
  // up and down move through the list
  const it = e.target.closest('.nt-item');
  if (it && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); const items = $$('.nt-item', root), i = items.indexOf(it), nx = items[i + (e.key === 'ArrowDown' ? 1 : -1)]; nx?.focus(); }
}, true);
// nothing typed is lost when the page goes away
const notesFlush = () => { if (NT.dirty) notesSave(); };
addEventListener('pagehide', notesFlush);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') notesFlush(); });
// another tab of this site changed the notes
addEventListener('storage', e => { if (e.key !== NK || NT.dirty) return; NT.list = null; notesRender(); });

/* ---------- files, the Trash, File Toolbox, Longshot and Pulse (src/os/files.js) ----------
   Loaded in an idle moment after start-up, or at once when something needs it, so it never weighs on the page. */
let FILES_API = null, filesP = null;
const OSAPI = {
  $, $$, esc, u, T, I, A, SYS, rtl, isDesk, clamp, rm, toast, openApp, closeMenus, FINE, Imp, front, findWin, appTitle, appTile,
  openItems: (items, at, btn) => { MENUCTX.items = items; openMenu('custom', btn || null, at, !at); }, MI, SEP,
  notes: { all: notesAll, live: notesLive, byId: noteById, title: noteTitle, words: noteWords, time: noteTime, save: notesSave, render: notesRender, cur: noteCur,
    create: text => noteNew(null, text), open: noteOpen, select: noteSelect, trash: noteTrash, restore: noteRestore, toDesk: noteToDesk, offDesk: noteOffDesk,
    download: noteDownload, md: mdOf, base: fileBase, flush: notesFlush, set: (id, text) => { const n = noteById(id); if (!n) return; n.text = text; n.at = Date.now(); notesSave(); notesRender(); },
    purge: ids => { NT.list = notesAll().filter(n => !ids.includes(n.id)); notesSave(); notesRender(); } },
  saveBlob, getS: () => S, setS: (k, v) => { S[k] = v; saveS(); }, renderCC: () => renderCC(),
  spawnTreat: () => spawnTreat(), throwBall: () => throwBall(), lights: () => lights()
};
const loadFiles = () => filesP || (filesP = import('./files.js').then(m => { FILES_API = m.init(OSAPI); return FILES_API; }));

/* ---------- Gear 5 turns the desktop to rubber (src/os/rubber-os.js, loaded the first time it starts) ----------
   Imp can stretch windows, icons and files; what he rearranges is real and saved: icon order (S.iconOrder), where a window
   sits (S.winPos, by app), and the cell a file came from (S.deskHome). Reset layout undoes all of it. */
let RB = null, rbP = null;
const winOf = el => [...WM.wins.values()].find(w => w.el === el);
const applyIconOrder = () => { // put the icons that are on the desk in the saved order, without redrawing them
  const box = $('.desk .icons'); if (!box) return; const by = new Map($$('.icon:not(.rb-clone)', box).map(e => [e.dataset.open, e]));
  iconIds(S.icons, S.iconOrder).forEach(id => { const e = by.get(id); if (e) box.append(e); });
};
const RBAPI = {
  $, $$, rm, isDesk, files: () => FILES_API,
  wm: {
    visible: () => visibleWins().filter(w => !w.closing).map(w => w.el),
    pullable: el => !!winOf(el) && $('.win-bar', el)?.hasAttribute('data-imp'), // its title bar is not covered
    movable: el => { const w = winOf(el); return !!w && !w.snap && !!$('.win-bar', el)?.hasAttribute('data-imp'); },
    bounds: () => { const a = area(); return { left: 6, top: a.top, right: a.W - 6, bottom: a.bottom + 8 }; },
    focus: el => { const w = winOf(el); if (w && !w.min && !w.closing && front() !== w) focusWin(w); },
    move: (el, dx, dy) => {
      const w = winOf(el); if (!w || w.snap) return; const a = area(), h = w.geo.h || el.offsetHeight;
      w.geo.x = clamp(Math.round(w.geo.x + dx), 0, Math.max(0, a.W - w.geo.w)); w.geo.y = clamp(Math.round(w.geo.y + dy), a.top, Math.max(a.top, a.bottom + 8 - h));
      applyGeo(w); syncPerches(); S.winPos = { ...(S.winPos || {}), [w.id]: { x: w.geo.x, y: w.geo.y } }; saveS();
    }
  },
  icons: {
    swap: (a, b) => {
      const ids = $$('.desk .icons .icon:not(.rb-clone)').map(e => e.dataset.open), i = ids.indexOf(a.dataset.open), j = ids.indexOf(b.dataset.open); if (i < 0 || j < 0) return;
      [ids[i], ids[j]] = [ids[j], ids[i]]; S.iconOrder = ids; saveS(); applyIconOrder();
    }
  },
  filesMove: (el, cell) => { // a file carried to another cell: the note's own cell changes (and the first cell is remembered for Reset)
    const id = el.dataset.file, n = noteById(id); if (!n || !n.desk) return el;
    S.deskHome = S.deskHome || {}; if (!S.deskHome[id]) S.deskHome[id] = { c: n.desk.c, r: n.desk.r }; saveS();
    n.desk = { c: cell.c, r: cell.r }; notesSave(); notesRender();
    return $(`.dfiles [data-file="${CSS.escape(id)}"]`) || el;
  }
};
const loadRubber = () => rbP || (rbP = loadFiles().then(() => import('./rubber-os.js')).then(m => (RB = m.init(RBAPI))));
const resetLayout = () => {
  closeMenus(); const snap = RB?.snapshot();
  S.iconOrder = null; S.winPos = null; const home = S.deskHome; S.deskHome = null; saveS();
  visibleWins().forEach(w => { if (w.snap || !w.home) return; w.geo = { ...w.geo, x: w.home.x, y: w.home.y }; fitGeo(w); applyGeo(w); });
  if (home) { Object.entries(home).forEach(([id, cell]) => { const n = noteById(id); if (n?.desk) n.desk = { c: cell.c, r: cell.r }; }); notesSave(); notesRender(); }
  applyIconOrder(); syncPerches(); RB?.glide(snap);
  toast(u('t_layoutReset'), I.restart);
};

/* ---------- toys: a ball to throw at Imp, treats to feed him ---------- */
const PIX = (rows, pal) => { let r = ''; rows.forEach((row, y) => [...row].forEach((ch, x) => { if (pal[ch]) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${pal[ch]}"/>`; })); return `<svg viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`; };
const BALL_SVG = PIX(['....kkkk....', '..kkaaiikk..', '.kaaaaiiiik.', '.kaaaiiippk.', 'kaaaiiipppik', 'kaaiiipppiik', 'kiiiipppaaik', 'kiiipppaaaak', '.kiipppaaak.', '.kiippaaaak.', '..kkiaaakk..', '....kkkk....'], { k: '#121113', a: '#f7a623', i: '#f3ead8', p: '#8048b0' });
const TREAT_SVG = PIX(['..........kk', '.........kdk', '........kyyk', '.......kyyk.', '......kyyyk.', '.....kyyyk..', 'kk..kyyyyk..', 'kyykkyyyk...', 'kyyyyyydk...', '.kdyyyddk...', '..kkkkkk....'], { k: '#121113', y: '#f5c84c', d: '#c4701e' });
const TOYS = []; let toyRAF = 0, toyPrev = 0;
const toyMake = kind => {
  const el = document.createElement('button'); el.type = 'button'; el.className = `toy toy-${kind} imp-chrome`; el.innerHTML = kind === 'ball' ? BALL_SVG : TREAT_SVG;
  el.setAttribute('aria-label', u(kind === 'ball' ? 'ballLabel' : 'treatLabel')); document.body.append(el);
  const t = { kind, el, r: kind === 'ball' ? 17 : 15, x: 0, y: 0, vx: 0, vy: 0, a: 0, held: null, rest: null, still: 0, by: null, wait: 0 };
  TOYS.push(t); return t;
};
const toyKill = t => { const i = TOYS.indexOf(t); if (i >= 0) TOYS.splice(i, 1); if (rm()) t.el.remove(); else t.el.animate([{ transform: t.el.style.transform + ' scale(1)', opacity: 1 }, { transform: t.el.style.transform + ' scale(.2)', opacity: 0 }], { duration: 220 }).onfinish = () => t.el.remove(); };
const surfaces = () => {
  const out = []; const add = (el, pad = 0) => { if (!el || !el.offsetParent && el.id !== 'dock') return; const r = el.getBoundingClientRect(); if (r.width > 40 && r.top > barH() + 4) out.push({ el, l: r.left + pad, r: r.right - pad, top: r.top }); };
  visibleWins().forEach(w => add($('.win-bar', w.el), 6)); if (isDesk()) { $$('.widgets:not([hidden]) .widget:not([hidden])').forEach(w => add(w, 8)); add($('#dock'), 10); }
  if (CC) add(CC.el, 10); if (NC) add(NC.el, 10); $$('.tv-card').forEach(c => add(c, 8));
  return out;
};
// Gear 5 does not walk over: his rubber arm grabs the treat, his rubber leg kicks the ball, when they are in reach
const g5Reach = (t, side) => {
  const I = Imp(); if (I?.state?.().costume !== 'gear5' || !I.grab) return false;
  if (t.kind === 'treat') return I.grab(t.x, t.y, 'eat', () => { if (TOYS.includes(t)) { toyKill(t); I.say?.(u('say_yum'), 1300); } });
  return I.grab(t.x, t.y, 'kick', () => { if (!TOYS.includes(t)) return; t.rest = null; t.by = 'imp'; t.vx = side * (650 + Math.random() * 350); t.vy = -(720 + Math.random() * 280); I.say?.(u('say_mine'), 900); });
};
const toyTick = now => {
  const dt = Math.min(.034, (now - (toyPrev || now)) / 1000); toyPrev = now;
  if (!TOYS.length) { toyRAF = 0; toyPrev = 0; return; }
  const H = innerHeight, Wd = innerWidth, top = barH(), floor = H - 3, imp = Imp()?.body?.(), surf = TOYS.some(t => !t.held) ? surfaces() : [];
  TOYS.forEach(t => {
    if (t.held) return;
    if (t.rest) { // resting: wake if its shelf moved or went away
      const s = t.rest === 'floor' ? { top: floor } : surf.find(q => q.el === t.rest.el);
      if (!s || Math.abs(s.top - (t.y + t.r)) > 1.5 || (s.l != null && (t.x < s.l || t.x > s.r))) { t.rest = null; }
      else { t.vx *= Math.pow(.18, dt); t.x += t.vx * dt; t.a += t.vx * dt / t.r; if (s.l != null && (t.x < s.l || t.x > s.r)) t.rest = null; t.still = Math.abs(t.vx) < 14 ? t.still + dt : 0; }
    }
    if (!t.rest) {
      const yb = t.y + t.r; t.vy += 2100 * dt; t.x += t.vx * dt; t.y += t.vy * dt; t.a += t.vx * dt / t.r * .6; t.still = 0;
      if (t.x < t.r) { t.x = t.r; t.vx = Math.abs(t.vx) * .7; } if (t.x > Wd - t.r) { t.x = Wd - t.r; t.vx = -Math.abs(t.vx) * .7; }
      if (t.y < top + t.r) { t.y = top + t.r; t.vy = Math.abs(t.vy) * .5; }
      if (t.vy > 0) {
        const s = surf.find(q => t.x > q.l && t.x < q.r && yb <= q.top + 2 && t.y + t.r >= q.top) || (t.y + t.r >= floor ? { top: floor, floor: true } : null);
        if (s) { t.y = s.top - t.r; if (t.vy > 260) { t.vy = -t.vy * (t.kind === 'ball' ? .58 : .25); t.vx *= .9; } else { t.vy = 0; t.rest = s.floor ? 'floor' : s; } }
      }
    }
    // Imp is in the way
    if (imp && (t.by !== 'imp' || t.kind === 'treat')) {
      const cx = clamp(t.x, imp.left, imp.left + imp.width), cy = clamp(t.y, imp.top, imp.top + imp.height), d = Math.hypot(t.x - cx, t.y - cy), sp = Math.hypot(t.vx, t.vy);
      if (d < t.r && t.kind === 'treat') { Imp()?.feed?.(); Imp()?.say?.(u('say_yum'), 1300); toyKill(t); return; }
      if (d < t.r && sp > 260 && imp.standing) {
        const side = Math.sign(t.x - (imp.left + imp.width / 2)) || 1; t.vx = side * Math.max(220, Math.abs(t.vx) * .55); t.vy = -Math.max(320, Math.abs(t.vy) * .45); t.rest = null; t.x = side > 0 ? imp.left + imp.width + t.r : imp.left - t.r;
        if (Imp()?.bonk?.(t.x, sp > 1100)) Imp()?.say?.(u(sp > 1100 ? 'say_ow' : 'say_hey'), 1200);
      }
    }
    // a thrown ball or a dropped treat that has settled: Imp goes over to it
    if (t.rest && t.still > .9 && t.by === 'you' && imp?.standing && !Imp()?.state().hidden) {
      t.by = null; const restTop = t.rest === 'floor' ? floor + 2 : t.rest.top, side = Math.sign(t.x - imp.x) || 1;
      const spot = t.kind === 'ball' ? t.x - side * (t.r + 16) : t.x;
      if (!g5Reach(t, side)) Imp()?.hopToSpot?.(spot, restTop, () => {
        if (!TOYS.includes(t)) return;
        if (t.kind === 'treat') { Imp()?.feed?.(); Imp()?.say?.(u('say_yum'), 1300); toyKill(t); return; }
        Imp()?.kick?.(t.x); Imp()?.say?.(u('say_mine'), 900);
        setTimeout(() => { if (!TOYS.includes(t)) return; t.rest = null; t.by = 'imp'; t.vx = side * (420 + Math.random() * 320); t.vy = -(620 + Math.random() * 300); }, 300);
      });
    }
    t.el.style.transform = `translate(${Math.round(t.x - t.r)}px, ${Math.round(t.y - t.r)}px) rotate(${t.kind === 'ball' ? t.a.toFixed(2) : 0}rad)`;
  });
  if (TOYS.every(t => !t.held && t.rest && t.still > 1.6 && t.by !== 'you')) { toyRAF = 0; toyPrev = 0; return; } // all at rest: sleep until something moves
  toyRAF = requestAnimationFrame(toyTick);
};
const toyGo = () => { if (!toyRAF) toyRAF = requestAnimationFrame(toyTick); };
document.addEventListener('pointerdown', e => {
  const el = e.target.closest?.('.toy'); if (!el) return; const t = TOYS.find(x => x.el === el); if (!t) return;
  e.preventDefault(); el.setPointerCapture(e.pointerId); closeCC();
  t.held = { id: e.pointerId, ox: e.clientX - t.x, oy: e.clientY - t.y, s: [[e.clientX, e.clientY, performance.now()]], moved: false }; t.rest = null; el.classList.add('held'); toyGo();
  const move = ev => { const h = t.held; if (!h || ev.pointerId !== h.id) return; if (Math.hypot(ev.clientX - h.s[0][0], ev.clientY - h.s[0][1]) > 4) h.moved = true; t.x = ev.clientX - h.ox; t.y = ev.clientY - h.oy; h.s.push([ev.clientX, ev.clientY, performance.now()]); if (h.s.length > 6) h.s.shift(); t.el.style.transform = `translate(${Math.round(t.x - t.r)}px, ${Math.round(t.y - t.r)}px) rotate(${t.a.toFixed(2)}rad)`; };
  const up = ev => {
    const h = t.held; if (!h || ev.pointerId !== h.id) return; el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); el.classList.remove('held'); t.held = null;
    if (!h.moved) { t.vx = (Math.random() - .5) * 300; t.vy = -650; t.by = t.kind === 'treat' ? 'you' : null; return; }
    const a = h.s[0], b = h.s[h.s.length - 1], dt = Math.max((b[2] - a[2]) / 1000, .016);
    t.vx = clamp((b[0] - a[0]) / dt, -2400, 2400); t.vy = clamp((b[1] - a[1]) / dt, -2400, 2400); t.by = 'you';
    const imp = Imp()?.body?.(); if (t.kind === 'treat' && imp && t.x > imp.left - 10 && t.x < imp.left + imp.width + 10 && t.y > imp.top - 10 && t.y < imp.top + imp.height + 10) { Imp()?.feed?.(); Imp()?.say?.(u('say_yum'), 1300); toyKill(t); }
  };
  el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
});
document.addEventListener('keydown', e => { const el = e.target.closest?.('.toy'); if (!el || (e.key !== 'Enter' && e.key !== ' ')) return; e.preventDefault(); const t = TOYS.find(x => x.el === el); if (!t) return; if (t.kind === 'treat') { Imp()?.feed?.(); toyKill(t); return; } t.rest = null; t.vx = (rtl() ? 1 : -1) * 600; t.vy = -800; t.by = 'you'; toyGo(); });
let BALL = null;
const syncBall = () => {
  const want = isDesk() && S.ball;
  if (want && !BALL) { BALL = toyMake('ball'); BALL.x = rtl() ? 150 : innerWidth - 150; BALL.y = innerHeight - 3 - BALL.r; BALL.rest = 'floor'; toyGo(); }
  if (!want && BALL) { toyKill(BALL); BALL = null; }
};
const throwBall = () => { if (!isDesk()) return; if (!S.ball) setSetting('ball', true); syncBall(); const t = BALL; const imp = Imp()?.body?.(); t.rest = null; t.x = rtl() ? innerWidth - 60 : 60; t.y = barH() + 80; t.vx = (rtl() ? -1 : 1) * (imp ? Math.min(1500, Math.abs(imp.x - t.x) * 1.1) : 900); t.vy = -200; t.by = 'you'; toyGo(); };
const spawnTreat = () => {
  const t = toyMake('treat'), imp = Imp()?.body?.();
  t.x = imp ? clamp(imp.x + (imp.x > innerWidth / 2 ? -140 : 140), 40, innerWidth - 40) : innerWidth / 2; t.y = barH() + 70; t.vx = 0; t.vy = 0; t.by = 'you';
  toyGo(); setTimeout(() => t.el.focus({ preventScroll: true }), 50); toast(u('dragTreat'), I.treatI);
};
addEventListener('resize', () => TOYS.forEach(t => { t.x = clamp(t.x, t.r, innerWidth - t.r); t.rest = null; toyGo(); }));

/* ---- inside project windows: the Views switcher, jumping to a spot, Work narrowed to one technology ---- */
const pickRole = (root, id) => {
  $$('[data-role]', root).forEach(b => b.setAttribute('aria-selected', String(b.dataset.role === id)));
  $$('[data-role-panel]', root).forEach(p => { p.hidden = p.dataset.rolePanel !== id; });
  setTimeout(syncPerches, 60);
};
const flash = el => { if (!el) return; el.scrollIntoView({ block: 'center', behavior: rm() ? 'auto' : 'smooth' }); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); setTimeout(() => Imp()?.pointAt?.(el), rm() ? 50 : 520); };
document.addEventListener('click', e => {
  const r = e.target.closest?.('[data-role]'); if (r && r.closest('.role-seg')) { pickRole(r.closest('.app'), r.dataset.role); return; }
  const g = e.target.closest?.('[data-role-go]'); if (g) { pickRole(g.closest('.app'), g.dataset.roleGo); return; }
  const f = e.target.closest?.('[data-find-go]'); if (f) { const app = f.closest('.app'), k = f.dataset.findGo; setTimeout(() => flash($(`[data-find="${CSS.escape(k)}"]`, app)), 80); }
  const tc = e.target.closest?.('[data-tech-clear]'); if (tc) techFilter(tc.closest('.app'), null);
});
document.addEventListener('keydown', e => { // arrow keys along the role switcher
  const r = e.target.closest?.('.role-seg [data-role]'); if (!r || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  const bs = $$('[data-role]', r.parentElement), i = bs.indexOf(r), d = (e.key === 'ArrowRight') !== rtl() ? 1 : -1, n = bs[(i + d + bs.length) % bs.length];
  e.preventDefault(); n.focus(); pickRole(r.closest('.app'), n.dataset.role);
});
// open an app, go to one of its tabs (and role), and point at a spot inside
const openAt = (id, o = {}) => {
  let w = null;
  if (o.newTab && isDesk() && front()) w = addTab(front(), id); else openApp(id);
  setTimeout(() => {
    const root = isDesk() ? (w || findWin(id))?.el : SH.find(s => s.id === id)?.el; if (!root) return;
    if (o.tab && o.tab !== 'overview') $(`.tabs [data-tab="${o.tab}"]`, root)?.click();
    if (o.role) pickRole($('.app', root), o.role);
    if (o.find) setTimeout(() => flash($(`[data-find="${CSS.escape(o.find)}"]`, root)), 90);
  }, isDesk() ? 160 : 520);
};
const techFilter = (app, name) => {
  if (!app) return; const bar = $('.tech-filter', app), k = name && norm(name);
  $$('.ptile', app).forEach(tl => { const p = P[tl.dataset.open.slice(2)], show = !k || techsOf(p).some(t => norm(t) === k); tl.classList.toggle('hide-tech', !show); });
  if (bar) { bar.hidden = !k; bar.innerHTML = k ? `<span class="muted small">${esc(u('techOnly'))}</span><span class="chip mono">${esc(name)}</span><button class="btn sm" data-tech-clear>${I.x}${esc(u('clearFilter'))}</button>` : ''; }
};
const openWorkTech = name => { openApp('work'); setTimeout(() => { const root = isDesk() ? findWin('work')?.el : SH.find(s => s.id === 'work')?.el; techFilter($('.app.work', root), name); }, isDesk() ? 80 : 480); };

/* ---- go ---- */
setMode(); applyLangAttrs(); applyTheme(); applyAccent(); applyWall(); applyMotion();
// the build drew the default desktop; redraw only what this browser's settings change
if (MAC) fillTopbar(); else tickClock();
if (S.icons !== 'default' || !S.widgets) fillDesk(); else if (S.iconOrder) applyIconOrder(); // the page is drawn in the default order; put it the way Imp left it
dockSync(); layoutDesk();
// what nothing needs for the first paint waits for an idle moment, so start-up stays one short task
const idle = f => (window.requestIdleCallback || (g => setTimeout(g, 1)))(f, { timeout: 1200 });
idle(() => { syncSettingsUI(); syncImpSize(); setInterval(tickClock, 1000); });
// the files on the desktop, the Trash, File Toolbox, Longshot and Pulse
// at once when there is something of the visitor's to draw (files on the desktop, the Trash, Pulse); otherwise with
// the first touch, key or mouse move, or five seconds after load, like the mascot, so it never weighs on the page
if (S.pulse || notesAll().some(n => n.desk || n.trash)) setTimeout(() => idle(() => loadFiles()), 300);
else {
  const evs = ['pointermove', 'pointerdown', 'keydown', 'touchstart', 'dragenter'], go = () => { evs.forEach(e => removeEventListener(e, go, true)); idle(() => loadFiles()); };
  evs.forEach(e => addEventListener(e, go, { capture: true, passive: true })); setTimeout(go, 5000);
}
document.addEventListener('click', e => { const t = e.target.closest?.('[data-try]'); if (!t) return; e.stopPropagation(); loadFiles().then(f => f.tryTool(t.dataset.try, t)); });
// the window this address stands for: drawn by the build as a sheet, which the phone takes over and the laptop swaps for a window
const ssr = $('#sheets > .sheet[data-ssr]');
if (ssr && !isDesk()) adoptSheet(ssr); else { ssr?.remove(); $('.home').classList.remove('behind'); }
bootScreen().then(() => {
  if (isDesk()) openWin(ROUTE_APP, null, { instant: ROUTE_APP !== 'start' });
  urlLive = true;
  idle(syncBall);
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
  openApp, addTab: (id, into) => addTab(into ? findWin(into) : front(), id), switchTab: (key, id) => switchTab(WM.wins.get(key) || findWin(key), id), mergeAll, openTaskView, closeTaskView, openCC, closeCC, openNC, closeNC, throwBall, spawnTreat, toys: () => TOYS.map(t => ({ kind: t.kind, x: Math.round(t.x), y: Math.round(t.y), rest: !!t.rest })),
  rubber: () => RB, resetLayout, closeAllWins, setLang, setSetting, tileWins, cascadeWins, showDesktop, snapTo: (id, f, l) => snapTo(findWin(id), f, l || 'test', false), openSpot, restart,
  state: () => ({ wins: [...WM.wins.values()].map(w => ({ id: w.id, key: w.key, tabs: w.tabs.map(t => t.id), pin: !!w.pin, min: w.min, snap: w.snap?.layout || null, geo: { ...w.geo } })), sheets: SH.map(s => s.id), lang, theme, S: { ...S }, imp: !!Imp() })
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
