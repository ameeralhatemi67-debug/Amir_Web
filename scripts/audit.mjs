import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

// Accessibility and behaviour of Imp OS (npm run preview must be running).
// axe (WCAG 2.1 A/AA and best practices) on every route, both languages, both themes, laptop and phone,
// with the mascot loaded; then interaction checks: windows, sheets, addresses, language, theme, filters,
// Spotlight, boot screen, reduced motion, narrow screens, the 404, and the pages without JavaScript.
const base = process.argv.find(arg => arg.startsWith('http')) || 'http://127.0.0.1:4321';
const content = JSON.parse(await readFile('src/os/content.json', 'utf8'));
const slugs = content.projects.map(p => p.slug);
const routes = ['', 'projects/', 'films/', 'lab/', 'about/', 'contact/', 'privacy/', '404/', ...slugs.map(slug => `projects/${slug}/`)];
const cases = process.argv.includes('--smoke') ? [] : ['en', 'ar'].flatMap(lang => routes.flatMap(route => ['light', 'dark'].flatMap(theme => ['desktop', 'mobile'].map(size => ({ lang, route, theme, size })))));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
await mkdir('qa/screenshots', { recursive: true });
const failures = [], checks = [];
const VIEW = { desktop: { width: 1440, height: 1000 }, mobile: { width: 390, height: 844 } };
const ctxFor = (size, o = {}) => browser.newContext({ viewport: VIEW[size], isMobile: size === 'mobile', hasTouch: size === 'mobile', ...o });
// the desktop is ready when its first window (laptop) or the page's own sheet (phone) is up
const ready = async (page, route, size) => {
  await page.waitForFunction(() => !!window.ImpOS, undefined, { timeout: 15_000 });
  if (size === 'desktop') await page.waitForFunction(() => window.ImpOS.state().wins.length > 0, undefined, { timeout: 10_000 });
  else if (route) await page.waitForFunction(() => window.ImpOS.state().sheets.length > 0, undefined, { timeout: 10_000 });
};

let cursor = 0;
async function worker() {
  while (cursor < cases.length) {
    const test = cases[cursor++];
    const key = `${test.lang}/${test.route} ${test.theme} ${test.size}`;
    const context = await ctxFor(test.size, { reducedMotion: 'reduce', colorScheme: test.theme });
    const page = await context.newPage();
    page.setDefaultTimeout(20_000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', m => { if (m.type() === 'error' && !/status of 404/.test(m.text())) errors.push(m.text()); });
    try {
      await page.goto(`${base}/${test.lang}/${test.route}`, { waitUntil: 'load' });
      await ready(page, test.route, test.size);
      // wake the mascot (he loads on the first pointer move) so his controls are checked too
      await page.mouse.move(VIEW[test.size].width / 2, 200);
      await page.waitForFunction(() => !!window.ImpLive, undefined, { timeout: 15_000 });
      await page.waitForFunction(() => document.fonts.status === 'loaded', undefined, { timeout: 15_000 });
      await page.waitForTimeout(700);
      await page.evaluate(async () => { await Promise.all([...document.images].filter(i => i.offsetParent).map(async image => { image.loading = 'eager'; await image.decode().catch(() => undefined); })); });
      const layout = await page.evaluate(() => ({
        lang: document.documentElement.lang, dir: document.documentElement.dir, theme: document.documentElement.dataset.theme,
        width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth,
        broken: [...document.images].filter(i => i.offsetParent && i.complete && !i.naturalWidth).map(i => i.src),
      }));
      if (layout.lang !== test.lang || layout.dir !== (test.lang === 'ar' ? 'rtl' : 'ltr')) failures.push(`${key}: language/direction`);
      if (layout.theme !== test.theme) failures.push(`${key}: theme follows the system (${layout.theme})`);
      if (layout.scroll > layout.width) failures.push(`${key}: horizontal overflow ${layout.scroll}/${layout.width}`);
      if (layout.broken.length) failures.push(`${key}: broken images ${layout.broken.join(' ')}`);
      if (errors.length) failures.push(`${key}: browser errors: ${errors.join(' | ')}`);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze();
      for (const violation of result.violations) failures.push(`${key}: ${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`);
      checks.push({ ...test, violations: result.violations.length, layout, errors });
      if (['', 'projects/hadayah-live/', 'projects/hatan/'].includes(test.route)) await page.screenshot({ path: `qa/screenshots/${test.lang}-${test.route.replace('projects/', '').replace('/', '') || 'home'}-${test.size}-${test.theme}.png` });
      console.log(`Checked ${checks.length}/${cases.length}: ${key}; axe issues ${result.violations.length}.`);
    } catch (error) { failures.push(`${key}: ${error.message.split('\n')[0]}`); }
    await writeFile('qa/accessibility-progress.json', JSON.stringify({ checked: checks.length, failures }, null, 2));
    await context.close();
  }
}

try {
  await Promise.all([worker(), worker(), worker()]);
  const done = [];
  const step = async (name, fn) => { try { await fn(); done.push(name); } catch (error) { failures.push(`interaction: ${name}: ${error.message.split('\n')[0]}`); } };

  // laptop: a desktop icon opens its window and the address follows; Escape closes it and the address follows back
  await step('desktop icon opens a window with its own address', async () => {
    const ctx = await ctxFor('desktop', { reducedMotion: 'reduce' }), page = await ctx.newPage();
    await page.goto(`${base}/en/`); await ready(page, '', 'desktop');
    await page.locator('.icons a[data-open="p:hatan"]').click();
    await page.waitForFunction(() => location.pathname === '/en/projects/hatan/');
    assert.match(await page.title(), /^Hatan · /);
    assert.equal(await page.locator('.win[data-app="p:hatan"]').count(), 1);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => location.pathname === '/en/');
    await ctx.close();
  });
  // the language switch flips the page in place and moves the address to the same window in the other language
  await step('language switch keeps the window', async () => {
    const ctx = await ctxFor('desktop', { reducedMotion: 'reduce' }), page = await ctx.newPage();
    await page.goto(`${base}/en/projects/hadayah-live/`); await ready(page, 'x', 'desktop');
    assert.equal(await page.locator('#langBtn').getAttribute('href'), '/ar/projects/hadayah-live/');
    await page.locator('#langBtn').click();
    await page.waitForFunction(() => location.pathname === '/ar/projects/hadayah-live/' && document.documentElement.dir === 'rtl');
    assert.equal(await page.locator('.win[data-app="p:hadayah-live"] .p-head h2').textContent(), content.projects.find(p => p.slug === 'hadayah-live').name.ar);
    await ctx.close();
  });
  // the theme button flips the lights and the choice survives a reload
  await step('theme persists', async () => {
    const ctx = await ctxFor('desktop', { reducedMotion: 'reduce', colorScheme: 'dark' }), page = await ctx.newPage();
    await page.goto(`${base}/en/about/`); await ready(page, 'x', 'desktop');
    await page.locator('#themeBtn').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.reload(); await ready(page, 'x', 'desktop');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await ctx.close();
  });
  // Work filters
  await step('work filters', async () => {
    const ctx = await ctxFor('desktop', { reducedMotion: 'reduce' }), page = await ctx.newPage();
    await page.goto(`${base}/en/projects/`); await ready(page, 'x', 'desktop');
    const win = page.locator('.win[data-app="work"]');
    await win.getByRole('button', { name: 'Mobile', exact: true }).click();
    assert.equal(await win.locator('.ptile:not(.hide)').count(), content.projects.filter(p => p.tags.includes('mobile')).length);
    await win.getByRole('button', { name: 'All', exact: true }).click();
    assert.equal(await win.locator('.ptile:not(.hide)').count(), content.projects.length);
    await ctx.close();
  });
  // Spotlight: Ctrl+K, type, Enter
  await step('search opens an app', async () => {
    const ctx = await ctxFor('desktop', { reducedMotion: 'reduce' }), page = await ctx.newPage();
    await page.goto(`${base}/en/contact/`); await ready(page, 'x', 'desktop');
    await page.keyboard.press('Control+KeyK');
    await page.locator('#spot input').fill('films');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => location.pathname === '/en/films/');
    assert.equal(await page.locator('.win[data-app="films"]').count(), 1);
    await ctx.close();
  });
  // phone: an app icon opens a sheet with its address; closing returns home
  await step('phone sheet and address', async () => {
    const ctx = await ctxFor('mobile', { reducedMotion: 'reduce' }), page = await ctx.newPage();
    await page.goto(`${base}/en/`); await ready(page, '', 'mobile');
    await page.locator('.home .apps a[data-open="p:memory-card"]').click();
    await page.waitForFunction(() => location.pathname === '/en/projects/memory-card/');
    await page.locator('.sheet.top .sheet-close').click();
    await page.waitForFunction(() => location.pathname === '/en/' && window.ImpOS.state().sheets.length === 0);
    await ctx.close();
  });
  // phone deep link: the page's own window is the drawn sheet, taken over without drawing it again
  await step('phone deep link takes over the drawn sheet', async () => {
    const ctx = await ctxFor('mobile', { reducedMotion: 'reduce' }), page = await ctx.newPage();
    await page.goto(`${base}/ar/projects/hatan/`); await ready(page, 'x', 'mobile');
    assert.equal(await page.locator('#sheets .sheet').count(), 1);
    assert.equal(await page.locator('#sheets .sheet[data-ssr]').count(), 0);
    await page.locator('.sheet.top [role="tab"][data-tab="facts"]').click();
    assert(await page.locator('.sheet.top [data-panel="facts"]').isVisible());
    await ctx.close();
  });
  // the boot screen shows on a first visit to the home page only, and goes away by itself
  await step('boot screen', async () => {
    const ctx = await ctxFor('desktop'), page = await ctx.newPage();
    await page.goto(`${base}/en/`);
    assert(await page.locator('#boot').isVisible(), 'boot screen on the first visit');
    await page.waitForFunction(() => !document.getElementById('boot'), undefined, { timeout: 5000 });
    await page.goto(`${base}/en/`);
    assert.equal(await page.locator('#boot').isVisible(), false, 'no boot screen on the second visit');
    const fresh = await (await ctxFor('desktop')).newPage();
    await fresh.goto(`${base}/en/projects/nbc/`);
    assert.equal(await fresh.locator('#boot').count(), 0, 'no boot screen on a deep link');
    await ctx.close();
  });
  // reduced motion: no boot screen and still wallpapers
  await step('reduced motion', async () => {
    const ctx = await ctxFor('desktop', { reducedMotion: 'reduce' }), page = await ctx.newPage();
    await page.goto(`${base}/en/`);
    assert.equal(await page.locator('#boot').isVisible(), false);
    // the corniche's twinkling stars, glittering water and bobbing dhow all hold still
    assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('.wp[data-wp="corniche"] :is(.tw, .gl, .dhow)')].map(el => getComputedStyle(el).animationName).filter(n => n !== 'none')), []);
    assert.ok(await page.evaluate(() => document.querySelectorAll('.wp[data-wp="corniche"] :is(.tw, .gl, .dhow)').length) > 5);
    await ctx.close();
  });
  // the mascot loads with the first interaction and settles on the desktop
  await step('mascot arrives', async () => {
    const ctx = await ctxFor('desktop', { reducedMotion: 'reduce' }), page = await ctx.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${base}/en/`); await ready(page, '', 'desktop');
    assert.equal(await page.evaluate(() => !!window.ImpLive), false, 'not loaded before an interaction');
    await page.mouse.move(400, 300);
    await page.waitForFunction(() => window.ImpLive?.state().mode === 'perch', undefined, { timeout: 15_000 });
    assert.deepEqual(errors, []);
    await ctx.close();
  });
  // narrow screens
  await step('320/360/768/1024 px without overflow', async () => {
    const ctx = await ctxFor('mobile', { reducedMotion: 'reduce' }), page = await ctx.newPage();
    for (const width of [320, 360, 768, 1024]) for (const lang of ['en', 'ar']) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${base}/${lang}/`); await page.waitForFunction(() => !!window.ImpOS);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${lang} ${width}px overflow`);
    }
    await ctx.close();
  });
  // unknown addresses
  await step('custom 404', async () => {
    const ctx = await ctxFor('desktop', { reducedMotion: 'reduce' }), page = await ctx.newPage();
    const missing = await page.goto(`${base}/does-not-exist/`);
    assert.equal(missing.status(), 404);
    await ready(page, 'x', 'desktop');
    assert.equal(await page.locator('.win[data-app="notfound"] h2').textContent(), 'This page isn’t here.');
    await ctx.close();
  });
  // without JavaScript the pages still read: the home screen, the page's own window, links that work
  await step('content without JavaScript', async () => {
    const ctx = await ctxFor('mobile', { javaScriptEnabled: false }), page = await ctx.newPage();
    await page.goto(`${base}/ar/`);
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    assert.equal(await page.locator('.home .apps a[data-open^="p:"][href^="/ar/projects/"]').count(), content.projects.length);
    await page.goto(`${base}/en/projects/hadayah-live/`);
    assert.equal(await page.locator('#sheets .p-head h2').textContent(), 'Hadayah Live');
    assert(await page.locator('#sheets [data-panel="facts"]').isVisible(), 'every tab reads as a section');
    assert(await page.locator('#sheets .hero-shot img').isVisible());
    await ctx.close();
  });

  const summary = { combinations: checks.length, violations: failures.length, interactions: done, failures, checks };
  await writeFile('qa/accessibility.json', JSON.stringify(summary, null, 2));
  console.log(`Accessibility/layout audit: ${checks.length} combinations; interactions passed: ${done.length}; ${failures.length} issues.`);
  if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
} finally { await browser.close(); }
