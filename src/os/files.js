/* Imp OS: files, the Trash, and three of Amir Lap's tools you can try here.
   - Files: a note can live on the desktop (laptop) or the home screen (phone) as a file. The file is the note itself
     (note.desk = its grid cell). Drag a note out of Notes onto the desktop; right-click (long-press on a phone) for
     Open, Quick Look, File Toolbox, Longshot, Rename, Download, Move back to Notes and Move to Trash.
   - Trash: deleted notes wait in the Trash (note.trash) until restored, emptied or 30 days old. It sits at the end
     of the dock on a laptop; you can drop files on it.
   - File Toolbox: drag a file, tap Shift, drop it on the wheel, as in Amir Lap. It converts notes (txt, md, html,
     png, jpg, webp, pdf) and the visitor's own images (png, jpg, webp, bmp, ico, pdf), edits images and shares.
     Everything happens in the browser; nothing is uploaded.
   - Longshot: the real panel (Extend, Auto, Follow, Undo, Done) building one tall image of a note; on a project
     window it is a labelled demo that stacks the project's screens.
   - Pulse: a glass strip on a screen edge with honest cards: what the real one shows (Claude and Codex limits) as
     pictures, plus things that work here (a File Toolbox drop tile, notes, Imp, shortcuts).
   app.js loads this module in an idle moment (or when something needs it) and hands it OSAPI. */

let O = null;
const $ = (s, r) => O.$(s, r), $$ = (s, r) => O.$$(s, r), u = k => O.u(k), esc = v => O.esc(v), rtl = () => O.rtl(), isDesk = () => O.isDesk();
const NOTES = () => O.notes;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ================= files on the desktop and the home screen ================= */
const CW = 92, CH = 100, PAD = 16;
const deskEl = () => $('.desk');
const deskBox = () => deskEl()?.getBoundingClientRect() || { left: 0, top: 0, width: innerWidth, height: innerHeight };
const gridSize = () => { const d = deskBox(); return { cols: Math.max(1, Math.floor((d.width - PAD * 2) / CW)), rows: Math.max(1, Math.floor((d.height - PAD - 110) / CH)) }; };
const cellBox = ({ c, r }) => { const d = deskBox(), x = rtl() ? d.width - PAD - (c + 1) * CW : PAD + c * CW, y = PAD + r * CH; return { x, y, l: d.left + x, t: d.top + y }; };
const cellAt = (px, py) => {
  const d = deskBox(), lx = px - d.left, ly = py - d.top, g = gridSize();
  return { c: clamp(Math.floor(((rtl() ? d.width - lx : lx) - PAD) / CW), 0, g.cols - 1), r: clamp(Math.floor((ly - PAD) / CH), 0, g.rows - 1) };
};
const hit = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
const blockers = () => ['.icons', '.widgets:not([hidden])', '#pulse'].map(s => $(s)).filter(e => e && e.offsetParent !== null).map(e => e.getBoundingClientRect());
const cellRect = cell => { const b = cellBox(cell); return { left: b.l + 4, top: b.t + 4, right: b.l + CW - 4, bottom: b.t + CH - 4 }; };
const cellFree = (cell, self, taken, bl) => {
  const g = gridSize(); if (cell.c < 0 || cell.r < 0 || cell.c >= g.cols || cell.r >= g.rows) return false;
  if (taken.some(t => t.id !== self && t.c === cell.c && t.r === cell.r)) return false;
  const r = cellRect(cell); return !bl.some(b => hit(r, b));
};
const freeNear = (want, self = null, taken = null) => {
  const bl = blockers(); taken = taken || NOTES().live().filter(n => n.desk).map(n => ({ id: n.id, ...n.desk }));
  for (let rad = 0; rad < 40; rad++) for (let dc = -rad; dc <= rad; dc++) for (let dr = -rad; dr <= rad; dr++) {
    if (Math.max(Math.abs(dc), Math.abs(dr)) !== rad) continue;
    const cell = { c: want.c + dc, r: want.r + dr }; if (cellFree(cell, self, taken, bl)) return cell;
  }
  return { c: want.c, r: want.r };
};
// the first free cell, from the top of the free middle of the desktop
const freeCell = () => { const g = gridSize(); return freeNear({ c: Math.floor(g.cols * .35), r: 0 }); };
const titleOf = n => NOTES().title(n.text) || u('notesEmpty');
const fileHTML = (n, extra = '') => `<button type="button" class="dfile${extra}" data-file="${esc(n.id)}" data-imp="point" aria-label="${esc(u('fileNote'))}: ${esc(titleOf(n))}" title="${esc(titleOf(n))}">
  <span class="df-ic" aria-hidden="true"><span class="df-tx" dir="auto">${esc(n.text.slice(0, 90))}</span></span><span class="df-l" dir="auto">${esc(titleOf(n))}</span></button>`;
const refreshDesk = () => {
  const desk = deskEl(); if (!desk) return;
  let box = $('.dfiles', desk);
  if (!box) { box = document.createElement('div'); box.className = 'dfiles'; box.setAttribute('role', 'group'); desk.append(box); }
  box.setAttribute('aria-label', u('deskFiles'));
  if (!isDesk()) { box.innerHTML = ''; return; }
  const files = NOTES().live().filter(n => n.desk), taken = [], keep = document.activeElement?.dataset?.file;
  // every file gets a free cell; one pushed off the grid (a smaller window, a widget) moves to the nearest free one
  files.forEach(n => { const c = freeNear(n.desk, n.id, taken); if (c.c !== n.desk.c || c.r !== n.desk.r) n.desk = c; taken.push({ id: n.id, ...c }); });
  box.innerHTML = files.map(n => fileHTML(n)).join('');
  files.forEach(n => { const el = $(`[data-file="${CSS.escape(n.id)}"]`, box), b = cellBox(n.desk); el.style.transform = `translate(${b.x}px, ${b.y}px)`; });
  if (keep) $(`[data-file="${CSS.escape(keep)}"]`, box)?.focus({ preventScroll: true });
};
const refreshHome = () => {
  const sec = $('.home .files-home'); if (!sec) return;
  const files = NOTES().live().filter(n => n.desk), trashN = NOTES().all().filter(n => n.trash).length;
  sec.hidden = isDesk() || (!files.length && !trashN);
  if (sec.hidden) { sec.innerHTML = ''; return; }
  sec.innerHTML = `<div class="fh-head"><b>${esc(u('files'))}</b><button type="button" class="btn sm" data-open="trash">${O.I.trash}${esc(u('trash'))}${trashN ? ` <small>${trashN}</small>` : ''}</button></div>
    <div class="fh-grid">${files.map(n => fileHTML(n)).join('')}</div>`;
};
const refreshTrashIcon = () => { const full = NOTES().all().some(n => n.trash); $$('.trash-tile').forEach(t => t.classList.toggle('full', full)); };
const refresh = () => { refreshDesk(); refreshHome(); refreshTrashIcon(); $$('.app.trash').forEach(r => renderTrash(r)); if (PL.card === 'notes') renderPulseCard(); };

/* ---- right-click (long-press) menu for a file or a note ---- */
const menuFor = (id, at, src) => {
  const n = NOTES().byId(id); if (!n) return;
  const N = NOTES(), I = O.I, MI = O.MI, SEP = O.SEP, has = !!n.text.trim();
  const items = [MI(u('fileOpen'), () => N.open(id), { icon: O.SYS.notes() })];
  if (n.desk && isDesk()) items.push(MI(u('quickLook'), () => quickLook(id, src), { icon: O.I.eye, kbd: 'Space' }));
  items.push(MI(u('openTb'), () => { const b = src?.getBoundingClientRect(); openWheel({ kind: 'note', id }, b ? b.left + b.width / 2 : innerWidth / 2, b ? b.top + b.height / 2 : innerHeight / 2, 'click'); }, { icon: I.wheelI, disabled: !has }),
    MI(u('longshot'), () => openLongshot({ kind: 'note', id }), { icon: I.longI, disabled: !has }));
  if (n.desk && src?.classList.contains('dfile')) items.push(MI(u('fileRename'), () => rename(id), { icon: I.pen, kbd: 'F2' }));
  items.push(O.SEP, MI(`${u('tDownload')} .txt`, () => N.download('txt', n), { icon: I.download, disabled: !has }), MI(`${u('tDownload')} .md`, () => N.download('md', n), { icon: I.download, disabled: !has }), SEP,
    n.desk ? MI(u(isDesk() ? 'offDesk' : 'offHome'), () => N.offDesk(id), { icon: I.pen }) : MI(u(isDesk() ? 'toDesk' : 'toHome'), () => N.toDesk(id), { icon: I.fileI, disabled: !has }),
    MI(u('fileToTrash'), () => N.trash(id), { icon: I.trash, kbd: 'Del' }));
  O.openItems(items, at);
};
const rename = id => {
  const el = $(`.dfiles [data-file="${CSS.escape(id)}"]`); const n = NOTES().byId(id); if (!el || !n) return;
  const lbl = $('.df-l', el), inp = document.createElement('input');
  inp.className = 'df-in'; inp.value = titleOf(n); inp.setAttribute('aria-label', u('fileRename')); inp.dir = 'auto';
  lbl.replaceWith(inp); inp.focus(); inp.select();
  let done = false;
  const end = ok => {
    if (done) return; done = true;
    const v = inp.value.replace(/\s+/g, ' ').trim();
    if (ok && v && v !== titleOf(n)) { const lines = n.text.split('\n'), i = lines.findIndex(l => l.trim()); if (i < 0) lines.unshift(v); else lines[i] = (/^#+\s/.test(lines[i]) ? lines[i].match(/^#+\s*/)[0] : '') + v; NOTES().set(id, lines.join('\n')); }
    else refresh();
    $(`.dfiles [data-file="${CSS.escape(id)}"]`)?.focus();
  };
  inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') end(true); if (e.key === 'Escape') end(false); });
  inp.addEventListener('blur', () => end(true));
  inp.addEventListener('pointerdown', e => e.stopPropagation());
};
/* ---- Quick Look: Space on a file shows it without opening Notes ---- */
let QL = null;
const quickLook = (id, src) => {
  closeQuickLook(); const n = NOTES().byId(id); if (!n) return;
  const el = document.createElement('div'); el.id = 'qlook'; el.className = 'glass'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', `${u('quickLook')}: ${titleOf(n)}`);
  el.innerHTML = `<div class="ql-head"><b dir="auto">${esc(titleOf(n))}</b><small dir="ltr">${esc(NOTES().time(n.at))} · ${NOTES().words(n.text)} ${esc(u('tbWords'))}</small></div>
    <div class="ql-body" dir="auto" tabindex="0">${esc(n.text)}</div>
    <div class="ql-foot"><button type="button" class="btn sm" data-ql="close">${esc(u('close'))}</button><button type="button" class="btn sm primary" data-ql="open">${O.I.pen}${esc(u('fileOpen'))}</button></div>`;
  document.body.append(el); QL = { el, src, id };
  $('[data-ql="open"]', el).focus();
};
const closeQuickLook = (back = true) => { if (!QL) return; const { el, src } = QL; QL = null; el.remove(); if (back) src?.focus?.({ preventScroll: true }); };

/* ================= dragging: notes out of Notes, files around the desktop ================= */
const DR = { on: false, id: null, kind: null, src: null, ghost: null, sx: 0, sy: 0, x: 0, y: 0, target: null, cell: null, hintEl: null, just: 0, pid: null };
const startDrag = (e, id, src, kind) => {
  if (e.button !== 0 || !isDesk()) return;
  const n = NOTES().byId(id); if (!n || !n.text.trim()) return;
  Object.assign(DR, { on: false, id, kind, src, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, target: null, pid: e.pointerId });
  addEventListener('pointermove', onMove, true); addEventListener('pointerup', onUp, true); addEventListener('pointercancel', cancelDrag, true); addEventListener('keydown', onDragKey, true);
};
const begin = () => {
  DR.on = true; const n = NOTES().byId(DR.id);
  const g = document.createElement('div'); g.className = 'dfile-ghost'; g.innerHTML = fileHTML(n, ' ghost'); g.setAttribute('aria-hidden', 'true');
  document.body.append(g); DR.ghost = g; DR.src?.classList.add('dragging'); document.documentElement.classList.add('file-dragging');
  const h = document.createElement('div'); h.className = 'drag-hint glass'; h.textContent = u('dragHint'); document.body.append(h); DR.hintEl = h;
  getSelection()?.removeAllRanges?.();
};
const targetAt = (x, y) => {
  if (WH && wheelHit(x, y) !== null) return { kind: 'wheel' };
  const el = document.elementFromPoint(x, y); if (!el) return null;
  if (el.closest('[data-dock="trash"]')) return { kind: 'trash', el: el.closest('[data-dock="trash"]') };
  const pd = el.closest('.pl-drop'); if (pd) return { kind: 'pulse', el: pd };
  const win = el.closest('.win'); if (win) return $('.app.notes', win) && DR.kind === 'file' ? { kind: 'notes', el: win } : null;
  if (el.closest('#topbar, #dockwrap, #pulse, #pulse-card, .menu, #cc, #nc, #spot, #longshot')) return null;
  if (el.closest('.desk') || el.closest('.wall') || el === document.body || el.closest('#wins')) return { kind: 'desk', cell: cellAt(x, y) };
  return null;
};
const onMove = e => {
  if (e.pointerId !== DR.pid) return;
  DR.x = e.clientX; DR.y = e.clientY;
  if (!DR.on) { if (Math.hypot(DR.x - DR.sx, DR.y - DR.sy) < 7) return; begin(); }
  e.preventDefault();
  DR.ghost.style.transform = `translate(${DR.x - 46}px, ${DR.y - 34}px)`;
  DR.hintEl.style.transform = `translate(${clamp(DR.x - 140, 8, innerWidth - 290)}px, ${DR.y + 46}px)`;
  if (e.shiftKey && !WH) openWheel({ kind: 'note', id: DR.id }, DR.x, DR.y, 'drag');
  if (WH) wheelHover(DR.x, DR.y);
  markTarget(targetAt(DR.x, DR.y));
};
const markTarget = t => {
  $$('.drop-ok').forEach(x => x.classList.remove('drop-ok'));
  let cellHint = $('.dcell-hint');
  DR.target = t;
  if (t?.el) t.el.classList.add('drop-ok');
  if (t?.kind === 'desk') {
    const c = freeNear(t.cell, DR.kind === 'file' ? DR.id : null); t.cell = c; const b = cellBox(c);
    if (!cellHint) { cellHint = document.createElement('div'); cellHint.className = 'dcell-hint'; deskEl().append(cellHint); }
    cellHint.style.transform = `translate(${b.x}px, ${b.y}px)`;
  } else cellHint?.remove();
};
const onDragKey = e => {
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cancelDrag(); return; }
  if (e.key === 'Shift' && DR.on && !e.repeat) { e.preventDefault(); if (!WH) openWheel({ kind: 'note', id: DR.id }, DR.x, DR.y, 'drag'); else wheelPage(1); }
};
const endDrag = () => {
  removeEventListener('pointermove', onMove, true); removeEventListener('pointerup', onUp, true); removeEventListener('pointercancel', cancelDrag, true); removeEventListener('keydown', onDragKey, true);
  DR.ghost?.remove(); DR.hintEl?.remove(); $('.dcell-hint')?.remove(); $$('.drop-ok').forEach(x => x.classList.remove('drop-ok'));
  DR.src?.classList.remove('dragging'); document.documentElement.classList.remove('file-dragging');
  const was = DR.on; Object.assign(DR, { on: false, ghost: null, hintEl: null }); if (was) DR.just = performance.now();
  return was;
};
const cancelDrag = () => { endDrag(); if (WH?.mode === 'drag') closeWheel(); };
const onUp = e => {
  if (e.pointerId !== DR.pid) return;
  const t = DR.on ? targetAt(e.clientX, e.clientY) : null, id = DR.id, kind = DR.kind, cell = DR.target?.kind === 'desk' ? DR.target.cell : null;
  if (!endDrag()) return;
  const N = NOTES();
  if (WH?.mode === 'drag') { const i = wheelHit(e.clientX, e.clientY); if (i !== null && i >= 0) { runWheel(i); return; } closeWheel(); if (t?.kind === 'wheel') return; }
  if (!t) return;
  if (t.kind === 'trash') N.trash(id);
  else if (t.kind === 'notes') N.offDesk(id);
  else if (t.kind === 'pulse') { const b = t.el.getBoundingClientRect(); openWheel({ kind: 'note', id }, b.left + b.width / 2, b.top + b.height / 2, 'click'); }
  else if (t.kind === 'desk' && cell) { const n = N.byId(id); if (!n) return; if (kind === 'file') { n.desk = cell; N.save(); N.render(); } else N.toDesk(id, cell); requestAnimationFrame(() => $(`.dfiles [data-file="${CSS.escape(id)}"]`)?.focus({ preventScroll: true })); }
};
const justDragged = () => performance.now() - DR.just < 350;

/* ---- the visitor's own files dragged in from their computer ---- */
const EX = { on: false, shift: false, hint: null, x: 0, y: 0 };
const isFileDrag = e => [...(e.dataTransfer?.types || [])].includes('Files');
const extKind = e => { const it = e.dataTransfer?.items?.[0]; const t = it?.type || ''; return /^text\/|markdown/.test(t) ? 'text' : 'image'; };
const exHint = (x, y) => {
  if (!EX.hint) { EX.hint = document.createElement('div'); EX.hint.className = 'drag-hint glass'; EX.hint.textContent = u('dropHint'); document.body.append(EX.hint); }
  EX.hint.style.transform = `translate(${clamp(x - 140, 8, innerWidth - 290)}px, ${y + 30}px)`;
};
const exEnd = () => { EX.on = false; EX.shift = false; EX.hint?.remove(); EX.hint = null; $$('.drop-ok').forEach(x => x.classList.remove('drop-ok')); };
const onDragOver = e => {
  if (!isFileDrag(e)) return;
  e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
  EX.on = true; EX.x = e.clientX; EX.y = e.clientY; exHint(EX.x, EX.y);
  if (e.shiftKey && !EX.shift) { if (!WH) openWheel({ kind: 'ext', ext: extKind(e) }, EX.x, EX.y, 'drag'); else wheelPage(1); }
  EX.shift = e.shiftKey;
  if (WH) wheelHover(EX.x, EX.y);
  $$('.drop-ok').forEach(x => x.classList.remove('drop-ok'));
  document.elementFromPoint(EX.x, EX.y)?.closest('.pl-drop')?.classList.add('drop-ok');
};
const onDragLeave = e => { if (!isFileDrag(e) || e.relatedTarget) return; exEnd(); if (WH?.mode === 'drag' && WH.item.kind === 'ext') closeWheel(); };
const takeFile = async (f, x, y, viaWheel) => {
  if (!f) return;
  const text = /^text\/|markdown/.test(f.type) || /\.(txt|md|markdown)$/i.test(f.name);
  if (text) {
    if (f.size > 1e6) { O.toast(u('tbTooBig'), O.I.x); return; }
    const body = (await f.text()).replace(/\r\n?/g, '\n'), n = NOTES().create(body);
    NOTES().toDesk(n.id, isDesk() ? freeNear(cellAt(x, y)) : null, true); O.toast(`${u('tbNoteMade')} ${f.name}`, O.I.fileI);
    if (viaWheel !== undefined) runWheelOn({ kind: 'note', id: n.id }, viaWheel);
    return;
  }
  if (!/^image\//.test(f.type) && !/\.(png|jpe?g|webp|gif|bmp|avif|ico|svg)$/i.test(f.name)) { O.toast(u('tbNotImage'), O.I.x); return; }
  if (f.size > 40e6) { O.toast(u('tbTooBig'), O.I.x); return; }
  const item = { kind: 'image', file: f };
  if (viaWheel !== undefined) runWheelOn(item, viaWheel); else openWheel(item, x, y, 'click');
};
const onDrop = e => {
  if (!isFileDrag(e)) return;
  e.preventDefault();
  const f = e.dataTransfer.files?.[0], x = e.clientX, y = e.clientY;
  exEnd();
  if (WH?.mode === 'drag' && WH.item.kind === 'ext') {
    const i = wheelHit(x, y), page = WH.page; closeWheel();
    if (i !== null && i >= 0) { takeFile(f, x, y, { page, i }); return; }
  }
  takeFile(f, x, y);
};

/* ================= File Toolbox: the wheel ================= */
let WH = null;
const blobOf = (cv, type, q) => new Promise(res => cv.toBlob(b => res(b), type, q));
const canvasOf = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
const baseName = name => (name || 'image').replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').trim().slice(0, 60) || 'image';
const done = (blob, name) => { O.saveBlob(blob, name); O.toast(`${u('tbSaved')}: ${name}`, O.I.download); O.Imp()?.play?.('react-smile'); };
const bitmapOf = async file => { try { return await createImageBitmap(file); } catch { const url = URL.createObjectURL(file); try { const im = new Image(); im.src = url; await im.decode(); return im; } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); } } };
const draw = (src, w, h, o = {}) => {
  const W = o.rot ? h : w, H = o.rot ? w : h, cv = canvasOf(W, H), x = cv.getContext('2d');
  if (o.white) { x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); }
  x.save();
  if (o.rot) { x.translate(W, 0); x.rotate(Math.PI / 2); }
  if (o.flip) { x.translate(o.rot ? h : w, 0); x.scale(-1, 1); }
  x.drawImage(src, 0, 0, w, h); x.restore();
  if (o.gray) { const d = x.getImageData(0, 0, W, H), p = d.data; for (let i = 0; i < p.length; i += 4) { const g = p[i] * .299 + p[i + 1] * .587 + p[i + 2] * .114; p[i] = p[i + 1] = p[i + 2] = g; } x.putImageData(d, 0, 0); }
  return cv;
};
// BMP: 24-bit, bottom-up, over white
const bmpOf = cv => {
  const w = cv.width, h = cv.height, row = Math.floor((24 * w + 31) / 32) * 4, size = 54 + row * h, buf = new ArrayBuffer(size), v = new DataView(buf);
  const flat = draw(cv, w, h, { white: true }).getContext('2d').getImageData(0, 0, w, h).data;
  v.setUint16(0, 0x4D42, true); v.setUint32(2, size, true); v.setUint32(10, 54, true); v.setUint32(14, 40, true); v.setInt32(18, w, true); v.setInt32(22, h, true); v.setUint16(26, 1, true); v.setUint16(28, 24, true); v.setUint32(34, row * h, true);
  for (let y = 0; y < h; y++) { let o = 54 + (h - 1 - y) * row; for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; v.setUint8(o++, flat[i + 2]); v.setUint8(o++, flat[i + 1]); v.setUint8(o++, flat[i]); } }
  return new Blob([buf], { type: 'image/bmp' });
};
// ICO: one 256 px PNG inside the icon container
const icoOf = async src => {
  const s = Math.min(256 / src.width, 256 / src.height, 1), w = Math.round(src.width * s), h = Math.round(src.height * s), cv = canvasOf(256, 256);
  cv.getContext('2d').drawImage(src, (256 - w) / 2, (256 - h) / 2, w, h);
  const png = new Uint8Array(await (await blobOf(cv, 'image/png')).arrayBuffer()), head = new DataView(new ArrayBuffer(22));
  head.setUint16(2, 1, true); head.setUint16(4, 1, true); head.setUint8(6, 0); head.setUint8(7, 0); head.setUint16(10, 1, true); head.setUint16(12, 32, true); head.setUint32(14, png.length, true); head.setUint32(18, 22, true);
  return new Blob([head.buffer, png], { type: 'image/x-icon' });
};
// PDF: one page, the picture as a JPEG; works for any text too, because a note goes in as its picture
const pdfOf = async cv => {
  const jpg = new Uint8Array(await (await blobOf(draw(cv, cv.width, cv.height, { white: true }), 'image/jpeg', .92)).arrayBuffer());
  const W = (cv.width * .75).toFixed(2), H = (cv.height * .75).toFixed(2), enc = new TextEncoder(), parts = [], offs = []; let len = 0;
  const add = p => { const b = typeof p === 'string' ? enc.encode(p) : p; parts.push(b); len += b.length; };
  const obj = (n, body) => { offs[n] = len; add(`${n} 0 obj\n${body}\nendobj\n`); };
  add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>'); obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  offs[4] = len; add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${cv.width} /Height ${cv.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`); add(jpg); add('\nendstream\nendobj\n');
  const cs = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`; obj(5, `<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
  const x = len; add(`xref\n0 6\n0000000000 65535 f \n${[1, 2, 3, 4, 5].map(n => String(offs[n]).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${x}\n%%EOF\n`);
  return new Blob(parts, { type: 'application/pdf' });
};
// a note as a picture: its yellow paper, ruled, in the site's own type; Arabic lines run right to left
const uiFont = () => getComputedStyle(document.documentElement).getPropertyValue('--f-ui').trim() || 'system-ui, sans-serif';
const isRTL = s => { const m = s.match(/[A-Za-z֐-ࣿ]/); return !!m && /[֐-ࣿ]/.test(m[0]); };
const noteCanvas = async (n, w = 1000) => {
  await document.fonts?.ready;
  const pad = 64, lh = 50, fam = uiFont(), lines = [], probe = canvasOf(10, 10).getContext('2d');
  const all = n.text.replace(/\r\n?/g, '\n').split('\n'), first = all.findIndex(l => l.trim());
  all.forEach((para, i) => {
    const head = i === first, font = `${head ? 700 : 500} ${head ? 40 : 30}px ${fam}`; probe.font = font;
    if (!para.trim()) { lines.push({ t: '', font, head }); return; }
    const rt = isRTL(para), words = para.split(/(\s+)/); let cur = '';
    words.forEach(wd => { const next = cur + wd; if (probe.measureText(next).width > w - pad * 2 && cur.trim()) { lines.push({ t: cur.trim(), font, rt, head }); cur = wd.trimStart(); } else cur = next; });
    if (cur.trim()) lines.push({ t: cur.trim(), font, rt, head });
    if (head) lines.push({ t: '', font, head: false });
  });
  const shown = lines.slice(0, 560), H = pad * 2 + shown.length * lh + 50, cv = canvasOf(w, H), x = cv.getContext('2d');
  x.fillStyle = '#FFF3C4'; x.fillRect(0, 0, w, H);
  x.fillStyle = 'rgba(150, 110, 40, .16)'; for (let y = pad + lh; y < H - 50; y += lh) x.fillRect(0, y + 12, w, 1.5);
  x.fillStyle = '#3a2a10'; x.textBaseline = 'alphabetic';
  shown.forEach((l, i) => { if (!l.t) return; x.font = l.font; x.direction = l.rt ? 'rtl' : 'ltr'; x.textAlign = l.rt ? 'right' : 'left'; x.fillText(l.t, l.rt ? w - pad : pad, pad + (i + 1) * lh); });
  x.font = `500 20px ${fam}`; x.fillStyle = 'rgba(58, 42, 16, .55)'; x.direction = 'ltr'; x.textAlign = 'left'; x.fillText(`AmirOS · Notes · ${new Date(n.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`, pad, H - 28);
  return cv;
};
const htmlOf = n => { const t = NOTES().title(n.text), body = n.text.replace(/\r\n?/g, '\n'); return `<!doctype html>\n<html lang="${isRTL(body) ? 'ar' : 'en'}" dir="auto"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(t)}</title>\n<style>body{max-width:680px;margin:48px auto;padding:0 20px;font:17px/1.7 system-ui,sans-serif;color:#2a2010;background:#FFF8DC}h1{font-size:1.6em;line-height:1.25}p{margin:0 0 .9em;white-space:pre-wrap}</style>\n${body.split(/\n{2,}/).map((p, i) => i === 0 && p.split('\n')[0].trim() === t ? `<h1 dir="auto">${esc(t)}</h1>${p.split('\n').slice(1).join('\n').trim() ? `<p dir="auto">${esc(p.split('\n').slice(1).join('\n'))}</p>` : ''}` : `<p dir="auto">${esc(p)}</p>`).join('\n')}\n</html>\n`; };
const copyText = async t => { try { await navigator.clipboard.writeText(t); O.toast(u('tbCopied'), O.I.copy); } catch { O.toast(u('tbNoCopy'), O.I.x); } };
const shareIt = async data => { try { if (data.files && !(navigator.canShare?.(data))) throw 0; if (!navigator.share) throw 0; await navigator.share(data); return true; } catch (err) { return err?.name === 'AbortError'; } };

// what the wheel offers: three pages for each kind of file
const pagesFor = item => {
  const N = NOTES();
  if (item.kind === 'note') {
    const n = N.byId(item.id), b = N.base(n), img = async (type, ext, q) => done(await blobOf(await noteCanvas(n), type, q), `${b}.${ext}`);
    return [
      { key: 'convert', items: [['TXT', () => N.download('txt', n)], ['MD', () => N.download('md', n)], ['HTML', () => done(new Blob([htmlOf(n)], { type: 'text/html;charset=utf-8' }), `${b}.html`)], ['PNG', () => img('image/png', 'png')], ['JPG', () => img('image/jpeg', 'jpg', .92)], ['WEBP', () => img('image/webp', 'webp', .9)], ['PDF', async () => done(await pdfOf(await noteCanvas(n, 1240)), `${b}.pdf`)]] },
      { key: 'tools', items: [[u('longshot'), () => openLongshot({ kind: 'note', id: n.id })], [u('tCopy'), () => copyText(n.text)], [u('tDup'), () => { const lines = n.text.split('\n'), i = lines.findIndex(l => l.trim()); lines[i] = `${lines[i]} (${u('dupOf')})`; const d = N.create(lines.join('\n')); if (n.desk) N.toDesk(d.id, isDesk() ? freeNear(n.desk) : null, true); }],
        [u('tCount'), () => O.toast(`${N.words(n.text)} ${u('tbWords')} · ${n.text.length.toLocaleString('en')} ${rtl() ? 'حرفًا' : 'characters'}`, O.I.pen)], [u('fileOpen'), () => N.open(n.id)], [n.desk ? u(isDesk() ? 'offDesk' : 'offHome') : u(isDesk() ? 'toDesk' : 'toHome'), () => n.desk ? N.offDesk(n.id) : N.toDesk(n.id)]] },
      { key: 'share', items: [[u('tShareOS'), async () => { if (!(await shareIt({ title: N.title(n.text), text: n.text }))) copyText(n.text); }], [u('tCopyMd'), () => copyText(N.md(n.text))],
        [u('tEmail'), () => { location.href = `mailto:?subject=${encodeURIComponent(N.title(n.text))}&body=${encodeURIComponent(n.text.slice(0, 1800))}`; }], [`${u('tDownload')} .txt`, () => N.download('txt', n)]] }];
  }
  if (item.kind === 'image' || item.kind === 'ext') {
    // an image dragged in from the computer is only read when it is dropped; its pages are the same
    const get = async () => { const src = await bitmapOf(item.file); if (!src) throw new Error('img'); return src; };
    const b = baseName(item.file?.name), same = () => /png|jpeg|webp/.test(item.file?.type) ? item.file.type : 'image/png', ext = t => ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' })[t];
    const conv = (type, e, q, white) => async () => { const s = await get(); done(await blobOf(draw(s, s.width, s.height, { white }), type, q), `${b}.${e}`); };
    const tool = (suffix, o, typ, q) => async () => { const s = await get(), t = typ || same(); const w = o.half ? Math.max(1, Math.round(s.width / 2)) : s.width, h = o.half ? Math.max(1, Math.round(s.height / 2)) : s.height; done(await blobOf(draw(s, w, h, { ...o, white: t === 'image/jpeg' }), t, q), `${b}-${suffix}.${ext(t)}`); };
    return [
      { key: 'convert', items: [['PNG', conv('image/png', 'png')], ['JPG', conv('image/jpeg', 'jpg', .92, true)], ['WEBP', conv('image/webp', 'webp', .9)], ['BMP', async () => { const s = await get(); done(bmpOf(draw(s, s.width, s.height)), `${b}.bmp`); }], ['ICO', async () => done(await icoOf(await get()), `${b}.ico`)], ['PDF', async () => { const s = await get(); done(await pdfOf(draw(s, s.width, s.height)), `${b}.pdf`); }]] },
      { key: 'tools', items: [[u('tRotate'), tool('rotated', { rot: true })], [u('tFlip'), tool('flipped', { flip: true })], [u('tGray'), tool('bw', { gray: true })], [u('tHalf'), tool('half', { half: true })], [u('tSmall'), tool('small', {}, 'image/webp', .6)], [u('tClean'), tool('clean', {})]] },
      { key: 'share', items: [[u('tShareOS'), async () => { const f = item.file; if (!(await shareIt({ files: [f], title: f.name }))) { O.saveBlob(f, f.name); } }], [u('tCopyImg'), async () => { try { const s = await get(); const png = await blobOf(draw(s, s.width, s.height), 'image/png'); await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]); O.toast(u('tbCopied'), O.I.copy); } catch { O.toast(u('tbNoCopy'), O.I.x); } }], [u('tDownload'), () => O.saveBlob(item.file, item.file.name)]] }];
  }
  return [];
};
const PAGE_L = { convert: 'tbConvert', tools: 'tbTools', share: 'tbShare' };
const R = () => isDesk() ? { out: 150, in: 56 } : { out: 136, in: 50 };
const wedge = (i, n, ro, ri) => {
  const gap = .035, a0 = (i / n) * Math.PI * 2 - Math.PI / 2 - Math.PI / n + gap, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2 - Math.PI / n - gap, P = (r, a) => `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
  const big = a1 - a0 > Math.PI ? 1 : 0; return `M${P(ro, a0)}A${ro} ${ro} 0 ${big} 1 ${P(ro, a1)}L${P(ri, a1)}A${ri} ${ri} 0 ${big} 0 ${P(ri, a0)}Z`;
};
const itemLabel = it => it.kind === 'note' ? titleOf(NOTES().byId(it.id)) : it.file?.name || (it.ext === 'text' ? 'text' : '');
const openWheel = (item, x, y, mode) => {
  closeWheel(true); O.closeMenus();
  const el = document.createElement('div'); el.id = 'tbwheel'; el.className = 'tb-wheel'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', u('toolbox'));
  document.body.append(el);
  const r = R(); x = clamp(x, r.out + 10, innerWidth - r.out - 10); y = clamp(y, r.out + 50, innerHeight - r.out - 10);
  el.style.left = x + 'px'; el.style.top = y + 'px';
  WH = { el, item, mode, page: 0, sel: -1, x, y, pages: item.kind === 'pick' ? [] : pagesFor(item.kind === 'ext' ? { kind: 'image' } : item), back: document.activeElement };
  renderWheel();
  if (mode === 'click') setTimeout(() => ($('.tb-b', el) || $('.tb-pick button', el))?.focus({ preventScroll: true }), 30);
  O.Imp()?.pointAt?.($('.tb-mid', el));
};
const closeWheel = keep => { if (!WH) return; const back = WH.back; WH.el.remove(); WH = null; if (!keep) back?.focus?.({ preventScroll: true }); };
const renderWheel = () => {
  if (!WH) return; const { el, item } = WH, r = R();
  if (item.kind === 'pick') {
    el.innerHTML = `<div class="tb-disc pick"><div class="tb-pick"><b>${esc(u('toolbox'))}</b><p>${esc(u('tbHint'))}</p>
      <button type="button" class="btn sm primary" data-tb="file">${O.I.image}${esc(u('tbPick'))}</button>
      <button type="button" class="btn sm" data-tb="note">${O.I.pen}${esc(u('tbUseNote'))}</button>
      <button type="button" class="btn sm" data-tb="sample">${O.I.sparkle}${esc(u('tbSample'))}</button>
      <small>${esc(u('tbLocal'))}</small></div><input type="file" accept="image/*,.txt,.md,text/plain" hidden data-tb-file></div>
      <button type="button" class="tb-x" data-tb="close" aria-label="${esc(u('close'))}">${O.I.x}</button>`;
    return;
  }
  const pg = WH.pages[WH.page], n = pg.items.length, D = r.out * 2;
  const labels = pg.items.map(([lab], i) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2, rr = (r.out + r.in) / 2; return `<button type="button" class="tb-b${i === WH.sel ? ' on' : ''}" data-tb-i="${i}" style="left:${(r.out + rr * Math.cos(a)).toFixed(1)}px;top:${(r.out + rr * Math.sin(a)).toFixed(1)}px" ${WH.mode === 'drag' ? 'tabindex="-1"' : ''}>${esc(lab)}</button>`; }).join('');
  const hov = WH.sel >= 0 ? pg.items[WH.sel][0] : null;
  const mid = hov ? (pg.key === 'convert' ? `${u('tbConvertTo')} ${hov}` : hov) : u(PAGE_L[pg.key]);
  el.innerHTML = `<div class="tb-disc" style="width:${D}px;height:${D}px">
    <svg class="tb-svg" viewBox="${-r.out} ${-r.out} ${D} ${D}" aria-hidden="true">${pg.items.map((_, i) => `<path class="tb-sec${i === WH.sel ? ' on' : ''}" d="${wedge(i, n, r.out - 3, r.in + 6)}"/>`).join('')}</svg>
    ${labels}
    <div class="tb-mid"><span class="tb-mid-l">${esc(mid)}</span><small class="tb-file" dir="auto">${esc(itemLabel(WH.item))}</small>
      <span class="tb-dots" role="tablist" aria-label="${esc(u('toolbox'))}">${WH.pages.map((p, i) => `<button type="button" role="tab" class="tb-dot" data-tb-page="${i}" aria-selected="${i === WH.page}" aria-label="${esc(u(PAGE_L[p.key]))}" ${WH.mode === 'drag' ? 'tabindex="-1"' : ''}></button>`).join('')}</span></div></div>
    <button type="button" class="tb-share" data-tb-page="${WH.pages.length - 1}" aria-label="${esc(u('tbShare'))}" ${WH.mode === 'drag' ? 'tabindex="-1"' : ''}>${O.I.out}<span>${esc(u('tbShare'))}</span></button>
    ${WH.mode === 'drag' ? `<div class="tb-tip glass">${esc(u('tbPages'))}</div>` : `<button type="button" class="tb-x" data-tb="close" aria-label="${esc(u('close'))}">${O.I.x}</button>`}`;
};
// which sector is under a point: -1 the middle, null outside the wheel
const wheelHit = (x, y) => {
  if (!WH || WH.item.kind === 'pick') return null; const r = R(), dx = x - WH.x, dy = y - WH.y, d = Math.hypot(dx, dy);
  if (d > r.out + 4) return null; if (d < r.in) return -1;
  const n = WH.pages[WH.page].items.length; let a = Math.atan2(dy, dx) + Math.PI / 2 + Math.PI / n; a = (a + Math.PI * 4) % (Math.PI * 2);
  return Math.floor(a / (Math.PI * 2 / n)) % n;
};
const wheelHover = (x, y) => { const i = wheelHit(x, y), s = i === null ? -1 : i; if (WH && s !== WH.sel) { WH.sel = s; renderWheel(); } };
const wheelPage = d => { if (!WH || !WH.pages.length) return; WH.page = (WH.page + d + WH.pages.length) % WH.pages.length; WH.sel = -1; renderWheel(); if (WH.mode === 'click') $('.tb-b', WH.el)?.focus({ preventScroll: true }); };
const runWheel = i => { if (!WH) return; const run = WH.pages[WH.page].items[i]?.[1]; closeWheel(); Promise.resolve().then(run).catch(() => O.toast(u('tbNotImage'), O.I.x)); };
const runWheelOn = (item, { page, i }) => { const run = pagesFor(item)[page]?.items[i]?.[1]; Promise.resolve().then(run).catch(() => O.toast(u('tbNotImage'), O.I.x)); };
const pickInto = async (kind, input) => {
  if (!WH) return; const { x, y } = WH;
  if (kind === 'note') { const n = NOTES().cur() || NOTES().live()[0] || NOTES().create(rtl() ? 'ملاحظة من AmirOS\nجرّب تحويلها إلى صورة أو PDF.' : 'A note from AmirOS\nTry turning it into a picture or a PDF.'); openWheel({ kind: 'note', id: n.id }, x, y, 'click'); return; }
  if (kind === 'sample') { const res = await fetch('/media/amirlap/wheel-convert.webp'); const blob = await res.blob(); openWheel({ kind: 'image', file: new File([blob], 'wheel-convert.webp', { type: 'image/webp' }) }, x, y, 'click'); return; }
  const f = input.files?.[0]; if (!f) return; closeWheel(true); takeFile(f, x, y);
};

/* ================= Longshot ================= */
let LS = null;
const PART = 520;
const openLongshot = async src => {
  closeLongshot(); closeWheel(true);
  let full, title, frameOf = () => null, follow = null;
  if (src.kind === 'note') {
    const n = NOTES().byId(src.id); if (!n) return; full = await noteCanvas(n, 900); title = `${NOTES().base(n)}-longshot.png`;
    frameOf = () => $$('.app.notes .note-ta').find(t => t.closest('.win, .sheet') && NOTES().cur()?.id === src.id);
    follow = () => { const ta = frameOf(); if (!ta) { NOTES().open(src.id); return; } return ta; };
  } else {
    const p = O.A.projects.find(q => q.slug === src.slug) || O.A.projects[0], shots = (p.shots || []).slice(0, 8);
    const ims = await Promise.all(shots.map(m => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = m.src; })));
    const ok = ims.filter(Boolean), W = 900, gap = 18, H = ok.reduce((h, im) => h + Math.round(im.naturalHeight * W / im.naturalWidth) + gap, gap);
    full = canvasOf(W, Math.min(H, 30000)); const x = full.getContext('2d'); x.fillStyle = '#121216'; x.fillRect(0, 0, W, full.height);
    let yy = gap; ok.forEach(im => { const h = Math.round(im.naturalHeight * W / im.naturalWidth); x.drawImage(im, 0, yy, W, h); yy += h + gap; });
    title = `${p.slug}-longshot.png`;
    const scroller = () => { const w = src.el?.isConnected ? src.el : null; return w ? ($('.scroller', w) || w.closest('.sheet') || w) : null; };
    frameOf = scroller; follow = scroller;
  }
  const el = document.createElement('section'); el.id = 'longshot'; el.className = 'glass'; el.setAttribute('aria-label', u('longshot'));
  document.body.append(el);
  LS = { el, full, title, k: 1, added: 0, auto: 0, follow: null, frameOf, followSrc: follow, demo: src.kind !== 'note', raf: 0 };
  renderLongshot(); $('[data-ls="extend"]', el)?.focus({ preventScroll: true });
  const frame = document.createElement('div'); frame.className = 'ls-frame'; frame.setAttribute('aria-hidden', 'true'); document.body.append(frame); LS.frame = frame;
  const tick = () => { if (!LS) return; const t = LS.frameOf(); if (t?.isConnected) { const b = t.getBoundingClientRect(); frame.hidden = false; Object.assign(frame.style, { left: b.left - 3 + 'px', top: b.top - 3 + 'px', width: b.width + 6 + 'px', height: b.height + 6 + 'px' }); } else frame.hidden = true; LS.raf = requestAnimationFrame(tick); };
  tick();
};
const lsHeight = () => Math.min(LS.full.height, LS.k * PART);
const renderLongshot = () => {
  if (!LS) return; const { el, full } = LS, h = lsHeight(), end = h >= full.height, parts = LS.k;
  el.innerHTML = `<div class="ls-head"><span class="ls-ic">${O.I.longI}</span><b>${esc(u('longshot'))}</b><button type="button" class="tb-btn icon-only" data-ls="reset" aria-label="${esc(u('lsReset'))}" title="${esc(u('lsReset'))}">${O.I.restart}</button><button type="button" class="tb-btn icon-only" data-ls="close" aria-label="${esc(u('close'))}">${O.I.x}</button></div>
    <div class="ls-prev">${LS.auto ? `<span class="ls-chip">${esc(u('lsAuto'))}</span>` : LS.follow ? `<span class="ls-chip">${esc(u('lsFollow'))}</span>` : ''}<canvas aria-label="${esc(u('longshot'))}" role="img"></canvas></div>
    <p class="ls-size" dir="ltr">${full.width.toLocaleString('en')} × ${h.toLocaleString('en')} px · ${parts} ${esc(u(parts === 1 ? 'lsPart' : 'lsParts'))}</p>
    <p class="ls-add muted small" role="status">${end ? esc(u('lsEnd')) : LS.added ? `${esc(u('lsAdded'))} ${LS.added} px.` : ''}</p>
    <button type="button" class="btn primary ls-extend" data-ls="extend" ${end ? 'disabled' : ''}>${O.I.download}${esc(u('lsExtend'))}</button>
    <div class="ls-grid"><button type="button" class="btn" data-ls="auto" aria-pressed="${!!LS.auto}">${O.I.play}${esc(u('lsAuto'))}</button><button type="button" class="btn" data-ls="follow" aria-pressed="${!!LS.follow}">${O.I.eye}${esc(u('lsFollow'))}</button>
      <button type="button" class="btn" data-ls="undo" ${parts < 2 ? 'disabled' : ''}>${O.I.restart}${esc(u('lsUndo'))}</button><button type="button" class="btn" data-ls="done">${O.I.check}${esc(u('lsDone'))}</button></div>
    <p class="muted small ls-help">${esc(u(LS.demo ? 'lsDemo' : 'lsHelp'))}</p>`;
  const cv = $('canvas', el), pw = 260, ph = Math.min(220, Math.round(h * pw / full.width)); cv.width = pw * 2; cv.height = ph * 2; cv.style.height = ph + 'px';
  const x = cv.getContext('2d'), sh = Math.round(ph * full.width / pw), sy = Math.max(0, h - sh); x.drawImage(full, 0, sy, full.width, Math.min(sh, h), 0, 0, cv.width, cv.height);
};
const lsExtend = () => { if (!LS) return false; const before = lsHeight(); if (before >= LS.full.height) return false; LS.k++; LS.added = lsHeight() - before; syncScroll(); renderLongshot(); return true; };
// Auto and the demo scroll the thing being captured along with the capture
const syncScroll = () => { const t = LS.frameOf(); if (t?.scrollHeight > t?.clientHeight) t.scrollTo({ top: (lsHeight() / LS.full.height) * t.scrollHeight - t.clientHeight, behavior: O.rm() ? 'auto' : 'smooth' }); };
const lsStop = () => { if (!LS) return; clearInterval(LS.auto); LS.auto = 0; if (LS.follow) { LS.follow.removeEventListener('scroll', LS.onScroll); LS.follow = null; } renderLongshot(); };
const lsAction = k => {
  if (!LS) return;
  if (k === 'close') return closeLongshot();
  if (k === 'extend') { lsExtend(); return; }
  if (k === 'reset') { lsStop(); LS.k = 1; LS.added = 0; renderLongshot(); return; }
  if (k === 'undo') { if (LS.k > 1) { const before = lsHeight(); LS.k--; LS.added = lsHeight() - before; renderLongshot(); } return; }
  if (k === 'auto') { if (LS.auto) return lsStop(); lsStop(); LS.auto = setInterval(() => { if (!lsExtend()) lsStop(); }, O.rm() ? 120 : 420); renderLongshot(); return; }
  if (k === 'follow') {
    if (LS.follow) return lsStop(); lsStop();
    const t = LS.followSrc(); if (!t) { setTimeout(() => { if (LS) lsAction('follow'); }, 500); return; }
    LS.follow = t; LS.onScroll = () => { const want = Math.ceil(((t.scrollTop + t.clientHeight) / t.scrollHeight) * LS.full.height / PART); if (want > LS.k) { const before = lsHeight(); LS.k = Math.min(want, Math.ceil(LS.full.height / PART)); LS.added = lsHeight() - before; renderLongshot(); } };
    t.addEventListener('scroll', LS.onScroll, { passive: true }); renderLongshot(); return;
  }
  if (k === 'done') {
    const h = lsHeight(), out = canvasOf(LS.full.width, h); out.getContext('2d').drawImage(LS.full, 0, 0);
    const name = LS.title; blobOf(out, 'image/png').then(b => done(b, name)); closeLongshot();
    O.Imp()?.snap?.(); // the screenshot is taken: he poses
  }
};
const closeLongshot = () => { if (!LS) return; clearInterval(LS.auto); if (LS.follow) LS.follow.removeEventListener('scroll', LS.onScroll); cancelAnimationFrame(LS.raf); LS.frame?.remove(); LS.el.remove(); LS = null; };

/* ================= Pulse ================= */
const PL = { el: null, card: null, cardEl: null };
const PULSE_ITEMS = () => [['claude', O.I.claudeI, 'Claude'], ['codex', O.I.codexI, 'Codex'], ['toolbox', O.I.boxI, u('toolbox')], ['notes', O.I.pen, u('notes')], ['imp', O.I.paw, u('impName')], ['shortcuts', O.I.grid, u('pShortcuts')]];
// the free side by default: left in English, right in Arabic (the icons sit on the other side)
const pulseEdge = () => isDesk() ? (O.getS().pulseEdgeSet ? O.getS().pulseEdge : rtl() ? 'right' : 'left') : 'bottom';
const pulse = on => {
  if (!on) { closePulseCard(); PL.el?.remove(); PL.el = null; document.documentElement.classList.remove('pulse-on', 'pulse-left', 'pulse-right', 'pulse-top', 'pulse-bottom'); refreshDesk(); return; }
  if (!PL.el) { PL.el = document.createElement('aside'); PL.el.id = 'pulse'; PL.el.className = 'glass'; document.body.append(PL.el); }
  renderPulse(); refreshDesk();
};
const renderPulse = () => {
  if (!PL.el) return; const edge = pulseEdge();
  document.documentElement.classList.remove('pulse-left', 'pulse-right', 'pulse-top', 'pulse-bottom'); document.documentElement.classList.add('pulse-on', 'pulse-' + edge);
  PL.el.className = `glass edge-${edge}`; PL.el.setAttribute('aria-label', u('pulse'));
  PL.el.innerHTML = `${isDesk() ? `<button type="button" class="pl-grip" data-pl="grip" aria-label="${esc(u('pGrip'))}" title="${esc(u('pMove'))}">${O.I.grip}</button>` : ''}
    ${PULSE_ITEMS().map(([k, ic, lab]) => `<button type="button" class="pl-i pl-${k}" data-pl="${k}" aria-label="${esc(lab)}" title="${esc(lab)}" aria-expanded="${PL.card === k}">${ic}</button>`).join('')}
    <button type="button" class="pl-i pl-x" data-pl="hide" aria-label="${esc(u('pHide'))}" title="${esc(u('pHide'))}">${O.I.x}</button>`;
};
const crop = (x0) => `<div class="pc-img" role="img" aria-label="${esc(u('pRealApp'))}" style="background-position:${(x0 / (1180 - 246) * 100).toFixed(1)}% 50%"></div>`;
const pulseCardHTML = k => {
  const I = O.I;
  if (k === 'claude' || k === 'codex') return `<h3>${k === 'claude' ? 'Claude' : 'Codex'}</h3><p class="pc-k">${esc(u('pRealApp'))}</p>${crop(k === 'claude' ? 15 : 277)}<p class="muted small">${esc(u(k === 'claude' ? 'pClaudeTxt' : 'pCodexTxt'))}</p>`;
  if (k === 'toolbox') return `<h3>${esc(u('toolbox'))}</h3><div class="pl-drop" tabindex="-1">${I.boxI}<span>${esc(u('tbDrop'))}</span></div>
    <div class="row pc-acts"><button type="button" class="btn sm" data-pc="pick">${I.image}${esc(u('tbPick'))}</button><button type="button" class="btn sm" data-pc="note">${I.pen}${esc(u('tbUseNote'))}</button></div><p class="muted small">${esc(u('tbLocal'))}</p>`;
  if (k === 'notes') { const ns = NOTES().live().filter(n => n.text.trim()).slice(0, 4); return `<h3>${esc(u('notes'))}</h3><div class="pc-notes">${ns.map(n => `<button type="button" class="pc-note" data-pc-note="${esc(n.id)}"><b dir="auto">${esc(titleOf(n))}</b><small dir="ltr">${esc(NOTES().time(n.at))}</small></button>`).join('') || `<p class="muted small">${esc(u('notesEmpty'))}</p>`}</div><button type="button" class="btn sm" data-pc="new">${I.plus}${esc(u('newNote'))}</button>`; }
  if (k === 'imp') { const st = O.Imp()?.state?.() || {}; const line = !O.Imp() || st.hidden ? u('pImpHidden') : st.costume === 'gear5' ? `${u('pImpG5')} ${Math.ceil((st.g5Left || 0) / 1000)}` : u('pImpBase'); return `<h3>${esc(u('pImpCard'))}</h3><p class="pc-imp" data-pc-imp>${esc(line)}</p><div class="row pc-acts"><button type="button" class="btn sm" data-pc="treat">${I.treatI}${esc(u('treat'))}</button>${isDesk() ? `<button type="button" class="btn sm" data-pc="ball">${I.ballI}${esc(u('throwBall'))}</button>` : ''}<button type="button" class="btn sm" data-pc="lights">${I.sparkle}${esc(u('flip'))}</button></div>`; }
  if (k === 'shortcuts') return `<h3>${esc(u('pShortcuts'))}</h3><div class="pc-apps">${['work', 'films', 'contact', 'notes', 'settings', 'trash'].map(id => `<button type="button" class="pc-app" data-open="${id}">${O.appTile(id)}<span>${esc(O.appTitle(id))}</span></button>`).join('')}</div>`;
  return '';
};
const openPulseCard = k => {
  if (PL.card === k) return closePulseCard();
  closePulseCard(false); PL.card = k;
  const el = document.createElement('div'); el.id = 'pulse-card'; el.className = 'glass'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', PULSE_ITEMS().find(p => p[0] === k)[2]);
  document.body.append(el); PL.cardEl = el; renderPulseCard(); renderPulse(); placeCard();
  $('button, [tabindex="0"]', el)?.focus({ preventScroll: true });
};
const renderPulseCard = () => { if (!PL.cardEl) return; PL.cardEl.innerHTML = pulseCardHTML(PL.card); };
const placeCard = () => {
  const c = PL.cardEl, b = $(`[data-pl="${PL.card}"]`, PL.el)?.getBoundingClientRect(); if (!c || !b) return;
  const edge = pulseEdge(), w = c.offsetWidth, h = c.offsetHeight; let x, y;
  if (edge === 'left') { x = b.right + 12; y = b.top + b.height / 2 - h / 2; } else if (edge === 'right') { x = b.left - 12 - w; y = b.top + b.height / 2 - h / 2; }
  else if (edge === 'top') { x = b.left + b.width / 2 - w / 2; y = b.bottom + 12; } else { x = b.left + b.width / 2 - w / 2; y = b.top - 12 - h; }
  c.style.left = clamp(x, 8, innerWidth - w - 8) + 'px'; c.style.top = clamp(y, 8, innerHeight - h - 8) + 'px';
};
const closePulseCard = (re = true) => { if (!PL.cardEl) { PL.card = null; return; } const k = PL.card; PL.cardEl.remove(); PL.cardEl = null; PL.card = null; if (re) { renderPulse(); $(`[data-pl="${k}"]`, PL.el)?.focus({ preventScroll: true }); } };
const gripDrag = e => {
  e.preventDefault(); const el = PL.el; el.classList.add('moving'); closePulseCard(false);
  const mv = ev => { el.style.left = ev.clientX - 22 + 'px'; el.style.top = ev.clientY - 22 + 'px'; el.style.right = el.style.bottom = 'auto'; el.style.transform = 'none'; };
  const up = ev => {
    removeEventListener('pointermove', mv); removeEventListener('pointerup', up); el.classList.remove('moving'); el.removeAttribute('style');
    const d = { left: ev.clientX, right: innerWidth - ev.clientX, top: ev.clientY, bottom: innerHeight - ev.clientY }, edge = Object.entries(d).sort((a, b) => a[1] - b[1])[0][0];
    O.setS('pulseEdge', edge); O.setS('pulseEdgeSet', true); renderPulse(); refreshDesk(); $('[data-pl="grip"]', el)?.focus({ preventScroll: true });
  };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
};

/* ================= the Trash window ================= */
const renderTrash = root => {
  const pad = $('.app.trash .pad', root) || $('.pad', root); if (!pad) return;
  const items = NOTES().all().filter(n => n.trash).sort((a, b) => b.trash - a.trash), sure = pad.dataset.sure;
  pad.innerHTML = `<div class="tr-head"><span class="eyebrow">${O.I.trash} AmirOS</span><h2 class="h2 hang-title">${esc(u('trash'))}</h2>
      <button type="button" class="btn sm" data-tr="empty" ${items.length ? '' : 'disabled'}>${O.I.trash}${esc(u('trashEmptyAll'))}</button></div>
    ${sure ? `<div class="tr-sure" role="alert"><p>${esc(u('trashSure'))}</p><div class="row"><button type="button" class="btn sm" data-tr="cancel">${esc(u('cancel'))}</button><button type="button" class="btn sm danger" data-tr="confirm">${esc(u('trashDelete'))}</button></div></div>` : ''}
    ${items.length ? `<ul class="tr-list">${items.map(n => `<li class="tr-row"><span class="df-ic sm" aria-hidden="true"></span><span class="tr-t"><b dir="auto">${esc(titleOf(n))}</b><small>${esc(u('deletedOn'))} <span dir="ltr">${esc(NOTES().time(n.trash))}</span></small></span>
      <button type="button" class="btn sm" data-tr="restore" data-id="${esc(n.id)}">${O.I.restart}${esc(u('trashRestore'))}</button><button type="button" class="btn sm" data-tr="delete" data-id="${esc(n.id)}" aria-label="${esc(u('trashDelete'))}: ${esc(titleOf(n))}">${O.I.x}</button></li>`).join('')}</ul>` : `<p class="tr-empty muted">${esc(u('trashEmpty'))}</p>`}
    <p class="muted small">${esc(u('trashNote'))}</p>`;
};
const mountTrash = root => renderTrash(root);

/* ================= Try it (the Amir Lap window) ================= */
const tryTool = (k, btn) => {
  if (k === 'toolbox') { const b = btn?.getBoundingClientRect(); openWheel({ kind: 'pick' }, b ? b.left + b.width / 2 : innerWidth / 2, b ? Math.max(b.top + 170, innerHeight / 2) : innerHeight / 2, 'click'); }
  if (k === 'longshot') openLongshot({ kind: 'demo', slug: 'amir-lap', el: btn?.closest('.win, .sheet') });
  if (k === 'pulse') { O.setS('pulse', true); pulse(true); O.renderCC(); O.toast(u('pOnEdge'), O.I.pulseI); setTimeout(() => openPulseCard('claude'), 250); }
};

/* ================= events ================= */
const wire = () => {
  document.addEventListener('pointerdown', e => {
    const f = e.target.closest?.('.dfiles .dfile');
    if (f && e.button === 0 && !e.target.closest('.df-in')) { $$('.dfile.sel').forEach(x => x.classList.remove('sel')); f.classList.add('sel'); startDrag(e, f.dataset.file, f, 'file'); }
    const g = e.target.closest?.('#pulse [data-pl="grip"]'); if (g) gripDrag(e);
    // a long press on a phone file opens its menu
    const h = e.target.closest?.('.files-home .dfile');
    if (h && e.pointerType !== 'mouse') { const t = setTimeout(() => { h.dataset.long = '1'; const b = h.getBoundingClientRect(); menuFor(h.dataset.file, { x: b.left + 20, y: b.bottom - 10 }, h); }, 520); const stop = () => { clearTimeout(t); removeEventListener('pointerup', stop, true); removeEventListener('pointermove', mv, true); }; const mv = ev => { if (Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) > 8) stop(); }; addEventListener('pointerup', stop, true); addEventListener('pointermove', mv, true); }
    if (WH?.mode === 'click' && !e.target.closest('#tbwheel')) closeWheel();
    if (PL.cardEl && !e.target.closest('#pulse-card, #pulse, .dfile, .nt-item')) closePulseCard(false), renderPulse(); // a drag may be headed for the card's drop tile
    if (QL && !e.target.closest('#qlook')) closeQuickLook(false);
  }, true);
  document.addEventListener('click', e => {
    const t = e.target;
    const h = t.closest?.('.files-home .dfile'); if (h) { e.preventDefault(); if (h.dataset.long) { delete h.dataset.long; return; } NOTES().open(h.dataset.file); return; }
    if (WH) {
      const b = t.closest('#tbwheel [data-tb-i]'); if (b) { runWheel(+b.dataset.tbI); return; }
      const pg = t.closest('#tbwheel [data-tb-page]'); if (pg) { WH.page = +pg.dataset.tbPage; WH.sel = -1; renderWheel(); return; }
      const k = t.closest('#tbwheel [data-tb]')?.dataset.tb;
      if (k === 'close') return closeWheel(); if (k === 'note' || k === 'sample') return pickInto(k); if (k === 'file') { $('[data-tb-file]', WH.el)?.click(); return; }
      if (t.closest('#tbwheel .tb-disc') && WH.mode === 'click') { const i = wheelHit(e.clientX, e.clientY); if (i !== null && i >= 0) runWheel(i); }
    }
    const ls = t.closest?.('#longshot [data-ls]'); if (ls) { lsAction(ls.dataset.ls); return; }
    const ql = t.closest?.('#qlook [data-ql]'); if (ql) { const id = QL?.id; closeQuickLook(ql.dataset.ql === 'close'); if (ql.dataset.ql === 'open') NOTES().open(id); return; }
    const pl = t.closest?.('#pulse [data-pl]'); if (pl) { const k = pl.dataset.pl; if (k === 'grip') return; if (k === 'hide') { O.setS('pulse', false); pulse(false); O.renderCC(); return; } openPulseCard(k); return; }
    if (PL.cardEl && t.closest('#pulse-card')) {
      const k = t.closest('[data-pc]')?.dataset.pc, nt = t.closest('[data-pc-note]')?.dataset.pcNote;
      if (nt) { closePulseCard(); NOTES().open(nt); return; }
      if (t.closest('[data-open]')) { closePulseCard(); return; }
      if (k === 'pick') { const b = t.getBoundingClientRect(); closePulseCard(); openWheel({ kind: 'pick' }, b.left, b.top, 'click'); setTimeout(() => $('[data-tb-file]', WH?.el)?.click(), 60); }
      if (k === 'note') { const b = t.getBoundingClientRect(); closePulseCard(); openWheel({ kind: 'pick' }, b.left, b.top, 'click'); pickInto('note'); }
      if (k === 'new') { closePulseCard(); O.openApp('notes'); setTimeout(() => NOTES().create(''), 200); }
      if (k === 'treat') O.spawnTreat(); if (k === 'ball') O.throwBall(); if (k === 'lights') O.lights();
      return;
    }
    const tr = t.closest?.('.app.trash [data-tr]');
    if (tr) {
      const root = tr.closest('.app.trash'), pad = $('.pad', root), k = tr.dataset.tr, id = tr.dataset.id;
      if (k === 'restore') NOTES().restore(id);
      if (k === 'delete') { NOTES().purge([id]); O.toast(u('gone'), O.I.trash); }
      if (k === 'empty') { pad.dataset.sure = '1'; renderTrash(root); $('[data-tr="cancel"]', root)?.focus(); return; }
      if (k === 'cancel') { delete pad.dataset.sure; renderTrash(root); $('[data-tr="empty"]', root)?.focus(); return; }
      if (k === 'confirm') { delete pad.dataset.sure; NOTES().purge(NOTES().all().filter(n => n.trash).map(n => n.id)); O.toast(u('gone'), O.I.trash); O.Imp()?.play?.('react-shock'); }
      $$('.app.trash').forEach(r => renderTrash(r));
    }
  });
  document.addEventListener('dblclick', e => { const f = e.target.closest?.('.dfiles .dfile'); if (f && !justDragged()) NOTES().open(f.dataset.file); });
  document.addEventListener('change', e => { if (e.target.matches?.('[data-tb-file]')) pickInto('file', e.target); });
  document.addEventListener('contextmenu', e => {
    const f = e.target.closest?.('.dfile:not(.ghost)'); if (!f) return;
    e.preventDefault(); e.stopPropagation(); if (f.dataset.long) return; menuFor(f.dataset.file, e.button === -1 || (!e.clientX && !e.clientY) ? (() => { const b = f.getBoundingClientRect(); return { x: b.left + 20, y: b.bottom - 6 }; })() : { x: e.clientX, y: e.clientY }, f);
  }, true);
  document.addEventListener('keydown', e => {
    if (QL && (e.key === 'Escape' || (e.key === ' ' && !e.target.closest('#qlook button')))) { e.preventDefault(); e.stopPropagation(); closeQuickLook(); return; }
    if (WH && e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeWheel(); return; }
    if (WH?.mode === 'click' && e.target.closest('#tbwheel')) {
      const bs = $$('.tb-b', WH.el), i = bs.indexOf(document.activeElement);
      if ((e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') && bs.length) { e.preventDefault(); const d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1; const nx = bs[((i < 0 ? 0 : i + d) + bs.length) % bs.length]; nx.focus(); WH.sel = +nx.dataset.tbI; WH.el.querySelectorAll('.tb-sec').forEach((p, j) => p.classList.toggle('on', j === WH.sel)); const m = $('.tb-mid-l', WH.el), pg = WH.pages[WH.page]; m.textContent = pg.key === 'convert' ? `${u('tbConvertTo')} ${pg.items[WH.sel][0]}` : pg.items[WH.sel][0]; }
      if (e.key === 'PageDown' || e.key === 'PageUp' || e.key === 'Shift') { e.preventDefault(); wheelPage(e.key === 'PageUp' ? -1 : 1); }
      return;
    }
    if (LS && e.key === 'Escape') { if (LS.auto || LS.follow) { e.preventDefault(); lsStop(); } else if (e.target.closest('#longshot')) { e.preventDefault(); closeLongshot(); } return; }
    if (PL.cardEl && e.key === 'Escape') { e.preventDefault(); closePulseCard(); return; }
    const f = e.target.closest?.('.dfiles .dfile'); if (!f || e.target.closest('.df-in')) return;
    const id = f.dataset.file;
    if (e.key === 'Enter') { e.preventDefault(); NOTES().open(id); }
    else if (e.key === ' ') { e.preventDefault(); quickLook(id, f); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); NOTES().trash(id); }
    else if (e.key === 'F2') { e.preventDefault(); rename(id); }
  }, true);
  document.addEventListener('dragover', onDragOver); document.addEventListener('dragenter', onDragOver); document.addEventListener('dragleave', onDragLeave); document.addEventListener('drop', onDrop);
  let rz = 0; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { refresh(); if (PL.el) { renderPulse(); placeCard(); } }, 160); });
  // the home screen is redrawn on a language change; its Files come back
  const home = $('.home'); if (home) new MutationObserver(() => { if (!$('.files-home', home)?.childElementCount) refreshHome(); }).observe(home, { childList: true });
  // Imp's state on the Pulse card stays current while it is open
  setInterval(() => { if (PL.card === 'imp') { const p = $('[data-pc-imp]', PL.cardEl); if (p) { const st = O.Imp()?.state?.() || {}; p.textContent = !O.Imp() || st.hidden ? u('pImpHidden') : st.costume === 'gear5' ? `${u('pImpG5')} ${Math.ceil((st.g5Left || 0) / 1000)}` : u('pImpBase'); } } }, 1000);
};

export const init = api => {
  O = api; wire(); refresh();
  if (O.getS().pulse) pulse(true);
  // the free cell nearest to a screen point, with its centre on screen (Gear 5: Imp carries a file there)
  const freeCellAt = (px, py, self = null) => { const cell = freeNear(cellAt(px, py), self), b = cellBox(cell); return { ...cell, x: b.l + CW / 2, y: b.t + CH / 2 - 4 }; };
  return { refresh, freeCell, freeCellAt, dragNote: (e, id, el) => startDrag(e, id, el, 'note'), menuFor, mountTrash, tryTool, pulse, justDragged, openWheel, openLongshot };
};
