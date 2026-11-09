import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

// Sharing images are real captures of the desktop: the English and Arabic home pages at 1200 x 630,
// with the Start window open and Imp on the desktop. Needs npm run preview running.
const base = process.argv[2] || 'http://127.0.0.1:4321';
await mkdir('public/images', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const lang of ['en', 'ar']) {
    const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, colorScheme: 'dark', reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(`${base}/${lang}/`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.ImpOS?.state().wins.length > 0);
    await page.mouse.move(600, 80); // wakes the mascot
    await page.waitForFunction(() => window.ImpLive?.state().mode === 'perch', undefined, { timeout: 15_000 });
    await page.mouse.move(2, 620);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    // JPEG: the wallpaper's gradients make a PNG of this capture about 530 KB, over the 300 KB image budget
    await page.screenshot({ path: `public/images/social-${lang}.jpg`, type: 'jpeg', quality: 86 });
    await ctx.close();
  }
  console.log('English and Arabic sharing images captured from the desktop.');
} finally { await browser.close(); }
