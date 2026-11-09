/* Rubber: the environment physics for Gear 5.
   Every object (a window, a desktop icon, a saved file) is a small lattice of point masses joined by springs, so it can absorb an impact (a dent),
   store energy while it is pulled (it gets harder to pull the further it goes), snap back with that energy (overshoot, wobble) and pass a ripple on to its
   neighbours. Strain limits keep the rubber from folding over itself, and objects in its way are pushed aside while one is held.
   Two ways to draw the same physics (Rubber.cfg.mode: 'frame', 'bend', or 'mix' = a random one each time):
     frame: the whole object takes one stretch (a parallelogram); its contents stay their own size and crisp, like a card in a rubber frame.
     bend:  the object is cut into tiles (clones), each warped to a quad of a smooth mesh interpolated from the lattice, so text and pictures bend too.
   Nothing runs unless Rubber.setActive(true) (Gear 5) and motion is allowed. The imp "director" lives in rubber-imp.js; rubber-os.js wires both to the OS. */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // bendMaxNodes: a window with more parts than this is only ever drawn the Frame way (cloning it into tiles would stall the page for a moment)
  const cfg = { mode: 'mix', k: 150, kn: 140, c: 9.5, limit: 380, speed: 760, poisson: .3, ka: 130, ca: 12, maxStretch: 3.2, minGap: .3, bendMaxNodes: 160, shade: 1, push: 1, pushMax: 46 };
  const R = { cfg, active: false, rm: () => matchMedia('(prefers-reduced-motion: reduce)').matches, listeners: {}, probe: { disp: 0, energy: 0, stage: 'rest', tension: 0 } };
  const bodies = new Map(), sched = [];
  const syncObjects = () => { if (!R.objects) return; R.objects().forEach(e => R.track(e)); bodies.forEach((B, el) => { if (!B.on && !el.isConnected) bodies.delete(el); }); };
  let raf = 0, last = 0, stageHold = { name: 'rest', until: 0 };
  const emit = (n, d) => (R.listeners[n] || []).forEach(f => { try { f(d); } catch { } });
  R.on = (n, f) => { (R.listeners[n] = R.listeners[n] || []).push(f); };
  const setStage = (name, ms = 0) => { const now = performance.now(); if (ms) stageHold = { name, until: now + ms }; if (R.probe.stage !== name) { R.probe.stage = name; emit('stage', name); } };

  /* ---------- the body: a lattice of points ---------- */
  const layout = B => { // rest positions and the stretch-limited links (edges and diagonals) for the current size
    const { cols, rows } = B, W1 = cols + 1, links = [];
    for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) { const id = j * W1 + i; B.rx[id] = i * B.w / cols; B.ry[id] = j * B.h / rows; }
    const add = (a, b) => links.push([a, b, Math.hypot(B.rx[b] - B.rx[a], B.ry[b] - B.ry[a])]);
    for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) { const id = j * W1 + i; if (i < cols) add(id, id + 1); if (j < rows) add(id, id + W1); if (i < cols && j < rows) { add(id, id + W1 + 1); add(id + 1, id + W1); } }
    B.links = links;
  };
  const bodyFor = (el, kind) => {
    let B = bodies.get(el); if (B) return B;
    const w = el.offsetWidth, h = el.offsetHeight, cols = kind === 'icon' ? 3 : 4, rows = 3, N = (cols + 1) * (rows + 1);
    B = { el, kind, sig: '', w, h, cols, rows, N, rx: new Float32Array(N), ry: new Float32Array(N), dx: new Float32Array(N), dy: new Float32Array(N), vx: new Float32Array(N), vy: new Float32Array(N),
      ax: 0, ay: 0, avx: 0, avy: 0, tx: 0, ty: 0, pin: null, carry: false, tiles: null, on: false, quiet: 0, axis: [1, 0], lastHit: 0, lastRel: 0, mode: 'frame', lift: 0, pushed: false, fc: 4, fr: 3 };
    layout(B); bodies.set(el, B); return B;
  };
  const pointAt = (B, lx, ly) => { // where a point of the object (local px) is now, by bilinear blend of the four lattice points around it
    const cw = B.w / B.cols, ch = B.h / B.rows, i = clamp(Math.floor(lx / cw), 0, B.cols - 1), j = clamp(Math.floor(ly / ch), 0, B.rows - 1), u = clamp((lx - i * cw) / cw, 0, 1), v = clamp((ly - j * ch) / ch, 0, 1), W1 = B.cols + 1;
    const a = j * W1 + i, b = a + 1, c = a + W1, d = c + 1, g = k => [B.rx[k] + B.dx[k], B.ry[k] + B.dy[k]], A = g(a), Bn = g(b), C = g(c), D = g(d);
    return [(1 - u) * (1 - v) * A[0] + u * (1 - v) * Bn[0] + (1 - u) * v * C[0] + u * v * D[0] + B.ax, (1 - u) * (1 - v) * A[1] + u * (1 - v) * Bn[1] + (1 - u) * v * C[1] + u * v * D[1] + B.ay];
  };
  const restOrigin = B => { if (B.on) return B.origin; const r = B.el.getBoundingClientRect(); return { x: r.left, y: r.top }; };

  /* ---------- homographies and tiles (the bend renderer) ---------- */
  const mul3 = (a, b) => { const o = new Array(9); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c]; return o; };
  const sq2quad = (x0, y0, x1, y1, x2, y2, x3, y3) => { // unit square (0,0)(1,0)(1,1)(0,1) -> quad
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) return [x1 - x0, x3 - x0, x0, y1 - y0, y3 - y0, y0, 0, 0, 1];
    const det = dx1 * dy2 - dx2 * dy1, g = (dx3 * dy2 - dx2 * dy3) / det, h = (dx1 * dy3 - dx3 * dy1) / det;
    return [x1 - x0 + g * x1, x3 - x0 + h * x3, x0, y1 - y0 + g * y1, y3 - y0 + h * y3, y0, g, h, 1];
  };
  const goodQuad = (x0, y0, x1, y1, x2, y2, x3, y3, m) => { // a quad that folds over itself, or whose perspective term would blow up, is drawn as a parallelogram instead
    const cr = (ax, ay, bx, by, cx, cy) => (bx - ax) * (cy - by) - (by - ay) * (cx - bx), a = cr(x0, y0, x1, y1, x2, y2), b = cr(x1, y1, x2, y2, x3, y3), c = cr(x2, y2, x3, y3, x0, y0), d = cr(x3, y3, x0, y0, x1, y1);
    if (!(a > 1 && b > 1 && c > 1 && d > 1)) return false; const g = m[6], h = m[7]; return 1 + g > .35 && 1 + h > .35 && 1 + g + h > .35 && Math.abs(g) < .55 && Math.abs(h) < .55;
  };
  const m3d = m => `matrix3d(${(m[0] / m[8]).toFixed(5)},${(m[3] / m[8]).toFixed(5)},0,${(m[6] / m[8]).toFixed(7)},${(m[1] / m[8]).toFixed(5)},${(m[4] / m[8]).toFixed(5)},0,${(m[7] / m[8]).toFixed(7)},0,0,1,0,${(m[2] / m[8]).toFixed(3)},${(m[5] / m[8]).toFixed(3)},0,1)`;
  const cr1 = (a, b, c, d, t) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  // a smooth (Catmull-Rom) finer mesh from the coarse lattice, so the bend has no creases; the edges are extended in a straight line so rest stays exactly rest
  const fineGrid = (B, P) => {
    const { cols, rows, fc, fr } = B, W1 = cols + 1, F = new Float32Array((fc + 1) * (fr + 1) * 2), col = new Float32Array(4);
    const at = (i, j, k) => { if (i < 0) return 2 * P[(j * W1) * 2 + k] - P[(j * W1 + 1) * 2 + k]; if (i > cols) return 2 * P[(j * W1 + cols) * 2 + k] - P[(j * W1 + cols - 1) * 2 + k]; return P[(j * W1 + i) * 2 + k]; };
    const row = (i, jj, k, tu) => { // one row of the lattice, interpolated along x (rows outside the lattice are extended in a straight line)
      if (jj < 0) { const a = row(i, 0, k, tu), b = row(i, 1, k, tu); return 2 * a - b; }
      if (jj > rows) { const a = row(i, rows, k, tu), b = row(i, rows - 1, k, tu); return 2 * a - b; }
      return cr1(at(i - 1, jj, k), at(i, jj, k), at(i + 1, jj, k), at(i + 2, jj, k), tu);
    };
    for (let v = 0; v <= fr; v++) for (let u = 0; u <= fc; u++) {
      const gu = u / fc * cols, gv = v / fr * rows, i = Math.min(cols - 1, Math.floor(gu)), tu = gu - i, jr = Math.min(rows - 1, Math.floor(gv)), tv = gv - jr;
      for (let k = 0; k < 2; k++) { for (let dj = -1; dj <= 2; dj++) col[dj + 1] = row(i, jr + dj, k, tu); F[(v * (fc + 1) + u) * 2 + k] = cr1(col[0], col[1], col[2], col[3], tv); }
    }
    return F;
  };
  const buildTiles = B => {
    const el = B.el, parent = el.parentNode, W = B.w, H = B.h, tiles = [], proto = el.cloneNode(true);
    proto.removeAttribute('id'); proto.removeAttribute('data-imp'); proto.removeAttribute('tabindex'); proto.removeAttribute('data-win'); proto.removeAttribute('data-open'); proto.removeAttribute('data-file'); proto.removeAttribute('href'); proto.classList.add('rb-clone');
    const cs = getComputedStyle(el), bf = cs.backdropFilter || cs.webkitBackdropFilter; if (bf && bf !== 'none') { proto.style.backdropFilter = 'none'; proto.style.webkitBackdropFilter = 'none'; const p = (cs.backgroundColor.match(/[0-9.]+/g) || []).map(Number); if (p.length >= 3 && (p.length < 4 || p[3] < 1)) proto.style.backgroundColor = `rgb(${p[0]}, ${p[1]}, ${p[2]})`; }
    proto.querySelectorAll('*').forEach(n => { if (n.classList.contains('glass')) { n.style.backdropFilter = 'none'; n.style.webkitBackdropFilter = 'none'; } });
    proto.querySelectorAll('[id]').forEach(n => n.removeAttribute('id')); proto.querySelectorAll('[data-imp], [data-imp-react]').forEach(n => { n.removeAttribute('data-imp'); n.removeAttribute('data-imp-react'); });
    proto.querySelectorAll('[tabindex]').forEach(n => n.setAttribute('tabindex', '-1'));
    const a = [...el.querySelectorAll('textarea, input, select')], b = [...proto.querySelectorAll('textarea, input, select')]; a.forEach((s, n) => { if (b[n]) b[n].value = s.value; });
    proto.querySelectorAll('video').forEach(v => { const im = new Image(); im.src = v.poster || ''; im.className = v.className; im.style.cssText = 'width:100%;height:100%;object-fit:cover'; v.replaceWith(im); });
    [...proto.children].forEach(c => { c.style.transform = ''; c.style.transformOrigin = ''; }); // a bent object is never drawn with the frame renderer, but be safe
    const srcCv = [...el.querySelectorAll('canvas')];
    for (let j = 0; j < B.fr; j++) for (let i = 0; i < B.fc; i++) {
      // each tile is a small box (the tile and a hair of overlap) holding a clone of the whole object shifted so that its piece shows. The warp acts on the small box, so a strong stretch can never push a far corner of a big box behind the viewer and make the browser drop the tile
      const c = proto.cloneNode(true), x0 = i * W / B.fc, x1 = (i + 1) * W / B.fc, y0 = j * H / B.fr, y1 = (j + 1) * H / B.fr, ox = x0 - (i ? 1.2 : 0), oy = y0 - (j ? 1.2 : 0), t = document.createElement('div');
      if (srcCv.length) { const cb = [...c.querySelectorAll('canvas')]; srcCv.forEach((s, n) => { try { if (cb[n]) cb[n].getContext('2d').drawImage(s, 0, 0); } catch { } }); }
      Object.assign(c.style, { position: 'absolute', left: -ox + 'px', top: -oy + 'px', right: 'auto', bottom: 'auto', width: W + 'px', height: H + 'px', transform: 'none', transition: 'none', opacity: '1', pointerEvents: 'none', margin: '0' });
      Object.assign(t.style, { position: 'absolute', left: el.offsetLeft + ox + 'px', top: el.offsetTop + oy + 'px', width: x1 - ox + (i < B.fc - 1 ? 1 : 0) + 'px', height: y1 - oy + (j < B.fr - 1 ? 1 : 0) + 'px', overflow: 'hidden', pointerEvents: 'none', transformOrigin: '0 0', willChange: 'transform', zIndex: el.style.zIndex });
      t.className = 'rb-tile'; t.setAttribute('aria-hidden', 'true'); t.appendChild(c); parent.insertBefore(t, el.nextSibling); tiles.push({ t, i, j, x0, y0, x1, y1, ox, oy, shade: 1 });
    }
    return tiles;
  };

  /* ---------- turning a body on and off ---------- */
  const sigOf = B => { const e = B.el; return e.offsetLeft + ',' + e.offsetTop + ',' + e.offsetWidth + ',' + e.offsetHeight + (B.mode === 'frame' && B.kind === 'win' ? '' : ',' + e.style.transform); };
  const pickMode = (B, n) => { const m = cfg.mode === 'mix' ? (Math.random() < (B.kind === 'win' ? .55 : .5) ? 'bend' : 'frame') : cfg.mode; return m === 'bend' && B.kind === 'win' && n > cfg.bendMaxNodes ? 'frame' : m; };
  const wake = (B, force) => {
    if (B.on) return; B.on = true; B.quiet = 0; B.prevTr = B.el.style.transition; B.el.style.transition = 'none'; void B.el.offsetWidth; B.base = B.el.style.transform || '';
    const r = B.el.getBoundingClientRect(); B.kids = [...B.el.children].map(c => { const q = c.getBoundingClientRect(); return [q.left - r.left, q.top - r.top]; });
    B.origin = { x: r.left, y: r.top }; B.w = B.el.offsetWidth; B.h = B.el.offsetHeight; layout(B); const n = B.el.querySelectorAll('*').length; B.mode = force || pickMode(B, n); B.sig = sigOf(B);
    if (B.mode === 'bend') { [B.fc, B.fr] = cfg.tiles || (B.kind === 'icon' ? [4, 4] : n < 70 ? [8, 6] : [6, 4]); B.tiles = buildTiles(B); B.el.style.opacity = '0'; } else { B.el.style.willChange = 'transform'; B.el.style.transformOrigin = '0 0'; }
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  };
  const sleep = B => {
    B.on = false; B.dx.fill(0); B.dy.fill(0); B.vx.fill(0); B.vy.fill(0); B.ax = B.ay = B.avx = B.avy = B.tx = B.ty = 0; B.pin = null; B.carry = false; B.lift = 0; B.pushed = false;
    if (B.tiles) { B.tiles.forEach(o => o.t.remove()); B.tiles = null; }
    const s = B.el.style; s.opacity = ''; if (B.mode === 'frame' && B.kind === 'win') s.transform = ''; s.willChange = ''; s.transformOrigin = ''; s.transition = B.prevTr || ''; B.el.classList.remove('rb-lift');
    [...B.el.children].forEach(c => { if (c.__rbT) { c.style.transform = ''; c.style.transformOrigin = ''; c.__rbT = 0; } });
  };

  /* ---------- the physics ---------- */
  const constrain = B => { // the rubber stretches a long way, but its grid keeps its order: a row never crosses a row and a column never crosses a column, so it cannot fold over itself
    const { dx, dy, rx, ry } = B, hi = cfg.maxStretch, gap = cfg.minGap, pin = B.pin, held = pin ? new Set(pin.ids.filter((_, q) => pin.w[q] > .6)) : null, W1 = B.cols + 1;
    for (let it = 0; it < 5; it++) for (let q = 0; q < B.links.length; q++) {
      const [a, b, L0] = B.links[q], ex = rx[b] + dx[b] - rx[a] - dx[a], ey = ry[b] + dy[b] - ry[a] - dy[a], len = Math.hypot(ex, ey) || 1e-6, wa = held && held.has(a) ? 0 : 1, wb = held && held.has(b) ? 0 : 1, ws = wa + wb; if (!ws) continue;
      const horiz = b === a + 1, vert = b === a + W1; let fx = 0, fy = 0;
      if (horiz && ex < L0 * gap) fx = ex - L0 * gap; else if (vert && ey < L0 * gap) fy = ey - L0 * gap;
      if (len > L0 * hi) { const c = (len - L0 * hi) / len; fx += ex * c; fy += ey * c; }
      if (!fx && !fy) continue; const ca = wa / ws, cb = wb / ws; dx[a] += fx * ca; dy[a] += fy * ca; dx[b] -= fx * cb; dy[b] -= fy * cb;
    }
  };
  const stepBody = (B, dt) => {
    const { cols, rows, dx, dy, vx, vy, N } = B, k = cfg.k, kn = cfg.kn, c = cfg.c, cn = .35 * Math.sqrt(kn), W1 = cols + 1;
    const fx = new Float32Array(N), fy = new Float32Array(N);
    for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
      const id = j * W1 + i; let ax = -k * dx[id] - c * vx[id], ay = -k * dy[id] - c * vy[id];
      if (i > 0) { const m = id - 1; ax += kn * (dx[m] - dx[id]) + cn * (vx[m] - vx[id]); ay += kn * (dy[m] - dy[id]) + cn * (vy[m] - vy[id]); }
      if (i < cols) { const m = id + 1; ax += kn * (dx[m] - dx[id]) + cn * (vx[m] - vx[id]); ay += kn * (dy[m] - dy[id]) + cn * (vy[m] - vy[id]); }
      if (j > 0) { const m = id - W1; ax += kn * (dx[m] - dx[id]) + cn * (vx[m] - vx[id]); ay += kn * (dy[m] - dy[id]) + cn * (vy[m] - vy[id]); }
      if (j < rows) { const m = id + W1; ax += kn * (dx[m] - dx[id]) + cn * (vx[m] - vx[id]); ay += kn * (dy[m] - dy[id]) + cn * (vy[m] - vy[id]); }
      fx[id] = ax; fy[id] = ay;
    }
    for (let id = 0; id < N; id++) { vx[id] += fx[id] * dt; vy[id] += fy[id] * dt; dx[id] += vx[id] * dt; dy[id] += vy[id] * dt; }
    if (B.pin) { const p = B.pin; for (let q = 0; q < p.ids.length; q++) { const id = p.ids[q], w = p.w[q], nx = (p.x - B.ax) * w, ny = (p.y - B.ay) * w; vx[id] = (nx - dx[id]) / dt * .5; vy[id] = (ny - dy[id]) / dt * .5; dx[id] = nx; dy[id] = ny; } }
    constrain(B);
    // the whole object can be carried or nudged aside: its anchor follows a target with a spring
    if (B.carry || Math.abs(B.tx) + Math.abs(B.ty) > .01 || Math.abs(B.ax) + Math.abs(B.ay) + Math.abs(B.avx) + Math.abs(B.avy) > .02) {
      const ex = B.ax - B.tx, ey = B.ay - B.ty; B.avx += (-cfg.ka * ex - cfg.ca * B.avx) * dt; B.avy += (-cfg.ka * ey - cfg.ca * B.avy) * dt; B.ax += B.avx * dt; B.ay += B.avy * dt;
    }
  };
  const measure = B => { let md = 0, ms = 0, e = 0; for (let i = 0; i < B.N; i++) { const d = Math.hypot(B.dx[i], B.dy[i]), s = Math.hypot(B.vx[i], B.vy[i]); if (d > md) md = d; if (s > ms) ms = s; e += .5 * cfg.k * d * d + .5 * s * s; } return { md, ms, e: Math.sqrt(e / B.N) }; };

  /* ---------- drawing ---------- */
  const positions = B => { // lattice positions in the object's own pixels, with volume keeping (it thins where it stretches) and a small lift while held
    const { N } = B, P = new Float32Array(N * 2), [nx, ny] = B.axis, tx = -ny, ty = nx; let mn = 1e9, mx = -1e9, rmn = 1e9, rmx = -1e9;
    for (let i = 0; i < N; i++) { const px = B.rx[i] + B.dx[i], py = B.ry[i] + B.dy[i], p = px * nx + py * ny, q = B.rx[i] * nx + B.ry[i] * ny; if (p < mn) mn = p; if (p > mx) mx = p; if (q < rmn) rmn = q; if (q > rmx) rmx = q; }
    const eps = clamp(((mx - mn) - (rmx - rmn)) / Math.max(1, rmx - rmn), -.45, .6), s = 1 - cfg.poisson * eps, up = 1 + .045 * B.lift, cx = B.w / 2 + B.ax, cy = B.h / 2 + B.ay;
    for (let i = 0; i < N; i++) { const px = B.rx[i] + B.dx[i] + B.ax, py = B.ry[i] + B.dy[i] + B.ay, ox = px - cx, oy = py - cy, a = ox * nx + oy * ny, b = (ox * tx + oy * ty) * s; P[i * 2] = cx + (a * nx + b * tx) * up; P[i * 2 + 1] = cy + (a * ny + b * ty) * up - 5 * B.lift; }
    return P;
  };
  const drawFrame = (B, P) => { // least-squares stretch of the whole lattice; a window stretches as a whole with its contents counter-scaled (crisp); an icon or file stretches its page and keeps the label crisp
    const N = B.N; let rcx = 0, rcy = 0, pcx = 0, pcy = 0; for (let i = 0; i < N; i++) { rcx += B.rx[i]; rcy += B.ry[i]; pcx += P[i * 2]; pcy += P[i * 2 + 1]; } rcx /= N; rcy /= N; pcx /= N; pcy /= N;
    let sxx = 0, sxy = 0, syy = 0, cxx = 0, cxy = 0, cyx = 0, cyy = 0;
    for (let i = 0; i < N; i++) { const rx = B.rx[i] - rcx, ry = B.ry[i] - rcy, px = P[i * 2] - pcx, py = P[i * 2 + 1] - pcy; sxx += rx * rx; sxy += rx * ry; syy += ry * ry; cxx += px * rx; cxy += px * ry; cyx += py * rx; cyy += py * ry; }
    const det = sxx * syy - sxy * sxy || 1, i00 = syy / det, i01 = -sxy / det, i11 = sxx / det;
    const a = cxx * i00 + cxy * i01, c = cxx * i01 + cxy * i11, b = cyx * i00 + cyy * i01, d = cyx * i01 + cyy * i11, e = pcx - (a * rcx + c * rcy), f = pcy - (b * rcx + d * rcy);
    const kids = [...B.el.children], f2 = v => v.toFixed(2), m5 = v => v.toFixed(5);
    if (B.kind === 'icon') {
      kids.forEach((ch, n) => { const [ox, oy] = B.kids[n] || [0, 0]; ch.style.transformOrigin = '0 0'; ch.__rbT = 1;
        ch.style.transform = n === 0 ? `matrix(${m5(a)},${m5(b)},${m5(c)},${m5(d)},${f2(e + a * ox + c * oy - ox)},${f2(f + b * ox + d * oy - oy)})` : `translate(${f2(e + a * ox + c * oy - ox)}px,${f2(f + b * ox + d * oy - oy)}px)`; });
      return;
    }
    B.el.style.transform = `matrix(${m5(a)},${m5(b)},${m5(c)},${m5(d)},${f2(e)},${f2(f)})`;
    const dd = a * d - b * c || 1, inv = `matrix(${m5(d / dd)},${m5(-b / dd)},${m5(-c / dd)},${m5(a / dd)},0,0)`;
    kids.forEach(ch => { ch.style.transformOrigin = '0 0'; ch.style.transform = inv; ch.__rbT = 1; });
  };
  const drawTiles = (B, P) => {
    B.base = B.el.style.transform; const base = B.base ? B.base + ' ' : '', F = fineGrid(B, P), W1 = B.fc + 1;
    B.tiles.forEach(o => {
      const a = o.j * W1 + o.i, b = a + 1, c2 = a + W1 + 1, d2 = a + W1, x0 = F[a * 2], y0 = F[a * 2 + 1], x1 = F[b * 2], y1 = F[b * 2 + 1], x2 = F[c2 * 2], y2 = F[c2 * 2 + 1], x3 = F[d2 * 2], y3 = F[d2 * 2 + 1];
      let q = sq2quad(x0, y0, x1, y1, x2, y2, x3, y3); if (!goodQuad(x0, y0, x1, y1, x2, y2, x3, y3, q)) q = [x1 - x0, x3 - x0, x0, y1 - y0, y3 - y0, y0, 0, 0, 1];
      const w = o.x1 - o.x0, h = o.y1 - o.y0, ax = o.x0 - o.ox, ay = o.y0 - o.oy, S = [1 / w, 0, -ax / w, 0, 1 / h, -ay / h, 0, 0, 1], M = mul3(q, S); // the tile box's own pixels -> unit square -> quad, then back out by the box's offset
      o.t.style.transform = base + m3d([M[0] - o.ox * M[6], M[1] - o.ox * M[7], M[2] - o.ox * M[8], M[3] - o.oy * M[6], M[4] - o.oy * M[7], M[5] - o.oy * M[8], M[6], M[7], M[8]]);
      if (cfg.shade) { // rubber lightens where it is stretched thin and darkens where it is squeezed
        const area = .5 * Math.abs((x2 - x0) * (y3 - y1) - (x3 - x1) * (y2 - y0)), br = clamp(1 + (area / (w * h) - 1) * .3, .84, 1.2), r = Math.round(br * 100) / 100;
        if (r !== o.shade) { o.shade = r; o.t.style.filter = r === 1 ? '' : `brightness(${r})`; }
      }
    });
  };

  /* ---------- the loop ---------- */
  const bbox = (B, P) => { let l = 1e9, t = 1e9, r = -1e9, b = -1e9; for (let i = 0; i < B.N; i++) { const x = B.origin.x + P[i * 2], y = B.origin.y + P[i * 2 + 1]; if (x < l) l = x; if (x > r) r = x; if (y < t) t = y; if (y > b) b = y; } return { l, t, r, b }; };
  const restBox = (B, now) => { // the screen box an object occupies at rest (cached; bodies that are on know it already)
    if (B.on) return { l: B.origin.x, t: B.origin.y, r: B.origin.x + B.w, b: B.origin.y + B.h };
    if (!B.cr || now - B.crT > 400) { const r = B.el.getBoundingClientRect(); B.cr = { l: r.left, t: r.top, r: r.right, b: r.bottom }; B.crT = now; } return B.cr;
  };
  const pushAside = (actors, now) => { // objects in the way of something being held or carried are nudged out of its way, then come back
    bodies.forEach(O => {
      if (O.pin || O.carry || !O.el.isConnected) return; let tx = 0, ty = 0;
      actors.forEach(A => { if (A === O || !A.bb2) return; const b = restBox(O, now), m = 14, ix = Math.min(A.bb2.r, b.r) - Math.max(A.bb2.l, b.l) + m, iy = Math.min(A.bb2.b, b.b) - Math.max(A.bb2.t, b.t) + m;
        if (ix > 0 && iy > 0) { const ocx = (b.l + b.r) / 2, ocy = (b.t + b.b) / 2, acx = (A.bb2.l + A.bb2.r) / 2, acy = (A.bb2.t + A.bb2.b) / 2; let ux = ocx - acx, uy = ocy - acy; const L = Math.hypot(ux, uy) || 1; ux /= L; uy /= L; const amp = clamp(Math.min(ix, iy) * .5 + 6, 0, cfg.pushMax) * cfg.push; tx += ux * amp; ty += uy * amp; } });
      const want = Math.hypot(tx, ty) > 3;
      if (want && !O.on) wake(O, 'frame');
      if (O.on) { O.tx += (tx - O.tx) * .3; O.ty += (ty - O.ty) * .3; if (!want && Math.hypot(O.tx, O.ty) < 1.5) O.tx = O.ty = 0; O.pushed = want || Math.hypot(O.tx, O.ty) > 0; } // (a small leftover push must end, or the object never comes to rest)
    });
  };
  const tick = now => {
    raf = 0; const dt0 = clamp((now - last) / 1000, 0, 1 / 20); last = now;
    while (sched.length && sched[0].t <= now) sched.shift().fn();
    let anyOn = false, peak = 0, peakE = 0, tension = 0, snap = false, pushing = false; const actors = [];
    bodies.forEach(B => {
      if (!B.on) return; if (!B.el.isConnected || B.sig !== sigOf(B)) { sleep(B); return; } anyOn = true;
      const n = Math.max(1, Math.ceil(dt0 / (1 / 100))), dt = Math.max(dt0 / n, 1 / 480); for (let s = 0; s < n; s++) stepBody(B, dt);
      B.lift += ((B.pin || B.carry ? 1 : 0) - B.lift) * (1 - Math.exp(-dt0 * 11)); const lifted = B.lift > .35; if (lifted !== B.el.classList.contains('rb-lift')) { B.el.classList.toggle('rb-lift', lifted); if (B.tiles) B.tiles.forEach(o => o.t.classList.toggle('rb-lift', lifted)); }
      const m = measure(B); if (!isFinite(m.e) || !isFinite(B.ax) || !isFinite(B.ay)) { sleep(B); return; } peak = Math.max(peak, m.md); peakE = Math.max(peakE, m.e);
      if (B.pin) tension = Math.max(tension, B.pin.tension || 0);
      if (!B.pin && now - B.lastRel < 900 && m.e > 2) snap = true;
      if (B.pushed) pushing = true;
      const rest = !B.pin && !B.carry && !B.pushed && m.md < .25 && m.ms < 4 && Math.abs(B.ax) + Math.abs(B.ay) + Math.abs(B.avx) + Math.abs(B.avy) + Math.abs(B.tx) + Math.abs(B.ty) < .3;
      B.quiet = rest ? B.quiet + 1 : 0;
      if (B.quiet > 8) { sleep(B); return; }
      const P = positions(B); if (B.mode === 'bend') drawTiles(B, P); else drawFrame(B, P);
      if (B.pin || B.carry) { B.bb2 = bbox(B, P); actors.push(B); }
    });
    if (actors.length || pushing) pushAside(actors, now);
    R.probe.disp = peak; R.probe.energy = peakE; R.probe.tension = tension;
    const hold = stageHold.until > now ? stageHold.name : null;
    setStage(!anyOn && !sched.length ? 'rest' : hold || (tension > .55 ? 'taut' : tension > 0 ? 'elastic' : snap ? 'snap' : peakE > 1 ? 'settle' : 'rest'));
    emit('frame', R.probe);
    if (anyOn || sched.length) raf = requestAnimationFrame(tick); else { setStage('rest'); }
  };
  const later = (ms, fn) => { sched.push({ t: performance.now() + ms, fn }); sched.sort((a, b) => a.t - b.t); if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };

  /* ---------- the public handle ---------- */
  const usable = () => R.active && !R.rm();
  const local = (B, x, y) => { const o = restOrigin(B); return [x - o.x, y - o.y]; };
  R.setActive = on => { R.active = !!on; if (!on) { bodies.forEach(B => { if (B.on) sleep(B); }); sched.length = 0; } emit('active', R.active); };
  R.track = (el, kind) => bodyFor(el, kind || (el.matches('.icon, button.icon, .dfile') ? 'icon' : 'win'));
  R.isBusy = el => { const B = bodies.get(el); return !!(B && B.on); };
  const touch = (B, el) => { emit('touch', { el }); if (B.on && B.tiles) B.tiles.forEach(o => { o.t.style.zIndex = el.style.zIndex; }); };

  // something hits an object at a screen point, travelling along (dx, dy) at `speed` px/s: it dents, then rebounds
  R.hit = (el, x, y, dx, dy, speed = 600, o = {}) => {
    if (!usable() || !el) return false; syncObjects(); const B = R.track(el), L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L; if (o.touch) touch(B, el); wake(B);
    const [lx, ly] = local(B, x, y), rad = .34 * Math.max(B.w, B.h) + 24; B.axis = [Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) || 1 : 0, Math.abs(dx) > Math.abs(dy) ? 0 : Math.sign(dy) || 1];
    for (let i = 0; i < B.N; i++) { const d = Math.hypot(B.rx[i] - lx, B.ry[i] - ly), g = Math.exp(-(d * d) / (rad * rad)); B.vx[i] += dx * speed * g; B.vy[i] += dy * speed * g; }
    B.lastHit = performance.now(); setStage('cushion', 320);
    if (o.ripple !== false) R.ripple(x, y, clamp(speed * .12, 20, 130), el);
    return true;
  };
  // a wave that reaches each object after a delay that grows with distance, weaker the further it goes
  R.ripple = (x, y, strength, except) => {
    if (!usable()) return; setStage('ripple', 450);
    bodies.forEach(B => {
      if (B.el === except || !B.el.isConnected) return; const r = B.el.getBoundingClientRect(); if (!r.width) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2, d = Math.hypot(cx - x, cy - y), amp = strength / (1 + d / 260); if (amp < 2) return;
      later(d / cfg.speed * 1000, () => { if (!usable()) return; wake(B, 'frame'); const ux = d ? (cx - x) / d : 0, uy = d ? (cy - y) / d : 1; for (let i = 0; i < B.N; i++) { B.vx[i] += ux * amp * 3.2; B.vy[i] += uy * amp * 3.2 - (B.kind === 'icon' ? amp * 2.4 : 0); } });
    });
  };
  R.registerAll = els => els.forEach(e => R.track(e));
  R.freeze = el => { const B = bodies.get(el); if (B && B.on) sleep(B); }; // snap back to rest at once (something else is about to move it)

  // Grab an object at a screen point. The returned handle pulls it toward wherever the hand wants to be, with growing resistance.
  R.grab = (el, x, y, o = {}) => {
    if (!usable() || !el) return null; syncObjects(); const B = R.track(el); touch(B, el); wake(B);
    const [lx, ly] = local(B, x, y), rad = (o.radius || .13) * Math.max(B.w, B.h) + 14, ids = [], w = [];
    for (let i = 0; i < B.N; i++) { const d = Math.hypot(B.rx[i] - lx, B.ry[i] - ly), g = Math.exp(-(d * d) / (rad * rad)); if (g > .08) { ids.push(i); w.push(g); } }
    B.pin = { ids, w, x: 0, y: 0, tension: 0 }; B.carry = !!o.carry; B.tx = B.ty = 0; setStage('cushion', 200);
    const origin = { x, y }, limit = Math.min(o.limit || cfg.limit, .8 * Math.max(B.w, B.h)), gl = [lx, ly];
    const attach = () => { const [px, py] = pointAt(B, gl[0], gl[1]), o0 = B.origin; return { x: o0.x + px, y: o0.y + py }; };
    const H = {
      el, body: B, origin, attach,
      // where the hand wants to be (screen px); the object resists, so the grabbed point lags behind. Returns where that point actually is.
      setHand(hx, hy) {
        const ux = hx - origin.x, uy = hy - origin.y, m = Math.hypot(ux, uy) || 1, f = m / (1 + m / limit), s = f / m, tension = clamp(f / (limit * .62), 0, 1);
        B.axis = Math.abs(ux) > Math.abs(uy) ? [Math.sign(ux) || 1, 0] : [0, Math.sign(uy) || 1];
        if (B.carry) { B.tx = ux; B.ty = uy; B.pin.x = ux; B.pin.y = uy; } else { B.pin.x = ux * s; B.pin.y = uy * s; }
        B.pin.tension = B.carry ? .2 : tension; const a = attach(); a.tension = B.pin.tension; a.stretch = f; return a;
      },
      // let go: the stored energy turns into speed; the neighbours feel it a moment later
      release() {
        if (!B.pin) return 0; const e = Math.hypot(B.pin.x - (B.carry ? B.ax : 0), B.pin.y - (B.carry ? B.ay : 0)); B.pin = null; B.carry = false; B.lastRel = performance.now(); setStage('release', 220);
        R.ripple(origin.x, origin.y, clamp(e * .35, 10, 120), el); return e;
      }
    };
    return H;
  };
  // an object has moved for real (the host changed its layout): glide it from where it was to where it now is
  R.settleFrom = (el, oldRect, o = {}) => {
    if (!usable() || !el) return; const B = R.track(el), keep = el.style.transform, stretched = B.on && B.mode === 'frame' && B.kind === 'win'; if (stretched) el.style.transform = ''; const r = el.getBoundingClientRect(); if (stretched) el.style.transform = keep;
    wake(B); B.origin = { x: r.left, y: r.top }; B.sig = sigOf(B);
    if (B.tiles) B.tiles.forEach(t => { t.t.style.left = el.offsetLeft + t.ox + 'px'; t.t.style.top = el.offsetTop + t.oy + 'px'; });
    B.ax += oldRect.left - r.left; B.ay += oldRect.top - r.top; B.tx = B.ty = 0; B.avx = B.avy = 0; B.carry = false; B.lastRel = performance.now(); B.quiet = 0;
    if (o.squash) { const L = Math.hypot(B.ax, B.ay) || 1; R.hit(el, r.left + r.width / 2, r.top + r.height / 2, -B.ax / L, -B.ay / L, clamp(L * 4, 120, 520), { ripple: o.ripple }); }
  };
  // where the object really sits (not where it is drawn right now)
  R.restRect = el => { const B = bodies.get(el); if (B && B.on) return { left: B.origin.x, top: B.origin.y, width: B.w, height: B.h }; const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; };
  R.hitRect = (el, dirx, diry, speed, o) => { const r = el.getBoundingClientRect(); return R.hit(el, r.left + r.width / 2 - dirx * r.width * .35, r.top + r.height / 2 - diry * r.height * .35, dirx, diry, speed, o); };
  R._bodies = bodies; window.Rubber = R;
export default R;
