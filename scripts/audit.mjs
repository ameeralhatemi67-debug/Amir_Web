import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.argv.find(arg => arg.startsWith('http')) || 'http://127.0.0.1:4321';
const routes = ['', 'projects/', 'about/', 'contact/', 'privacy/', '404/', ...['hadayah-live','comms-hub','hayz','nbc','bookquest','hedayah-dashboard','hida','dnfom'].map(slug => `projects/${slug}/`)];
const cases = process.argv.includes('--smoke') ? [] : ['en','ar'].flatMap(lang => routes.flatMap(route => ['light','dark'].flatMap(theme => ['desktop','mobile'].map(size => ({ lang,route,theme,size })))));
const browser = await chromium.launch({ channel:'chrome',headless:true });
await mkdir('qa/screenshots',{ recursive:true });
const failures = [];
const checks = [];
let cursor = 0;
try {
  async function worker() {
    const context = await browser.newContext({ reducedMotion:'reduce' });
    const page = await context.newPage();
    page.setDefaultTimeout(20_000);
    while (cursor < cases.length) {
      const test = cases[cursor++];
      const key = `${test.lang}/${test.route} ${test.theme} ${test.size}`;
      const errors=[];
      const errorListener = error => errors.push(error.message);
      page.on('pageerror',errorListener);
      await page.setViewportSize(test.size === 'mobile' ? { width:390,height:844 } : { width:1440,height:1000 });
      await page.emulateMedia({ colorScheme:test.theme });
      await page.addInitScript(() => localStorage.removeItem('amir-theme'));
      await page.goto(`${base}/${test.lang}/${test.route}`,{ waitUntil:'load' });
      await page.waitForFunction(() => document.fonts.status === 'loaded', undefined, { timeout:15_000 });
      await page.evaluate(async () => {
        await Promise.all([...document.images].map(async image => { image.loading='eager'; await image.decode().catch(() => undefined); }));
      });
      const layout = await page.evaluate(() => ({
        lang:document.documentElement.lang, dir:document.documentElement.dir,
        width:document.documentElement.clientWidth, scroll:document.documentElement.scrollWidth,
        broken:[...document.images].filter(image => !image.complete || !image.naturalWidth).length,
        background:getComputedStyle(document.body).backgroundColor,
      }));
      if (layout.lang !== test.lang || layout.dir !== (test.lang === 'ar' ? 'rtl' : 'ltr')) failures.push(`${key}: language/direction`);
      if (layout.scroll > layout.width) failures.push(`${key}: horizontal overflow ${layout.scroll}/${layout.width}`);
      if (layout.broken) failures.push(`${key}: ${layout.broken} broken images`);
      if (errors.length) failures.push(`${key}: browser errors`);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']).analyze();
      for (const violation of result.violations) failures.push(`${key}: ${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`);
      checks.push({ ...test, violations:result.violations.length, layout, errors });
      if (test.route === '' || test.route === 'projects/hadayah-live/') {
        await page.screenshot({path:`qa/screenshots/${test.lang}-${test.route ? 'hadayah' : 'home'}-${test.size}-${test.theme}.png`,fullPage:true});
        if (!test.route) await page.screenshot({path:`qa/screenshots/${test.lang}-home-${test.size}-${test.theme}-viewport.png`});
      }
      page.off('pageerror',errorListener);
      console.log(`Checked ${checks.length}/${cases.length}: ${key}; axe issues ${result.violations.length}.`);
      await writeFile('qa/accessibility-progress.json',JSON.stringify({checked:checks.length,failures},null,2));
    }
    await context.close();
  }
  await worker();

  const page = await browser.newPage({ viewport:{width:390,height:844} });
  await page.goto(`${base}/en/projects/`);
  await page.getByRole('button',{ name:'Mobile',exact:true }).click();
  assert.equal(await page.locator('[data-tags]:visible').count(),2,'Mobile filter');
  await page.getByRole('button',{ name:'AI',exact:true }).click();
  assert.equal(await page.locator('[data-tags]:visible').count(),1,'AI filter');
  await page.getByRole('button',{ name:'All',exact:true }).click();
  assert.equal(await page.locator('[data-tags]:visible').count(),8,'Reset filter');
  await page.goto(`${base}/en/projects/hadayah-live/`);
  await page.getByRole('link',{ name:'التبديل إلى العربية' }).click();
  assert.equal(new URL(page.url()).pathname,'/ar/projects/hadayah-live/','Language switch preserves page');
  await page.getByRole('button',{ name:/^مضاء/ }).click();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark','Theme persists');
  await page.getByRole('button',{ name:/^تلقائي/ }).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),null,'System theme resets override');
  await page.goto(`${base}/en/`);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').textContent(),'Skip to content','Keyboard skip link');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator(':focus').getAttribute('id'),'main','Skip link focus');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload();
  await page.evaluate(async () => { for (const img of document.querySelectorAll('.wall img')) { img.loading = 'eager'; await img.decode().catch(() => undefined); } });
  await page.waitForFunction(() => [...document.querySelectorAll('.wall img')].every(img => getComputedStyle(img).opacity === '1' && getComputedStyle(img).maskImage === 'none'));
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.ticker-track')).animationName), 'none', 'Reduced motion stops the ticker');
  for (const width of [320,360,768,1024]) {
    for (const lang of ['en','ar']) {
      await page.setViewportSize({width,height:900});
      await page.goto(`${base}/${lang}/`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),`${lang} ${width}px overflow`);
    }
  }
  const missing = await page.goto(`${base}/does-not-exist/`);
  assert.equal(missing.status(),404,'Unknown route returns HTTP 404');
  assert.equal(await page.locator('h1').textContent(),'This page isn’t here.','Custom 404');
  const noJS = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const staticPage = await noJS.newPage();
  await staticPage.goto(`${base}/ar/`);
  assert.equal(await staticPage.locator('[data-row]').count(),8,'Content survives without JS');
  assert(await staticPage.locator('.board-screen img').first().isVisible(),'Lead screen visible without JS');
  assert.equal(await staticPage.locator('html').getAttribute('dir'),'rtl','RTL survives without JS');
  await noJS.close();
  const summary={ combinations:checks.length, violations:failures.length, interactions:['filters','language-path preservation','theme persistence (segmented control)','system theme reset','keyboard skip link','reduced motion','320/360/768/1024px overflow','custom HTTP 404','JavaScript-disabled Arabic content'],failures,checks };
  await writeFile('qa/accessibility.json',JSON.stringify(summary,null,2));
  console.log(`Accessibility/layout audit: ${checks.length} combinations, ${failures.length} issues; interaction checks passed.`);
  if(failures.length) { console.error(failures.join('\n')); process.exitCode=1; }
} finally { await browser.close(); }
