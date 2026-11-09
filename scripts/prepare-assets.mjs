import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir, readFile, copyFile, writeFile } from 'node:fs/promises';

// The AmirOS mark (the amber tile with an "a" in Bricolage Grotesque) as favicons, plus the font licence notices.
await mkdir('public/licenses', { recursive: true });
const bricolage = (await readFile('node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2')).toString('base64');
const mark = size => `<!doctype html><html><head><style>
  @font-face{font-family:B;src:url(data:font/woff2;base64,${bricolage}) format('woff2-variations');font-weight:200 800}
  html,body{margin:0;background:transparent}
  .m{width:${size}px;height:${size}px;border-radius:${size * .27}px;display:grid;place-items:center;background:linear-gradient(140deg,#FFC86B,#FF7A59);
     box-shadow:inset 0 ${Math.max(1, size / 32)}px 0 rgba(255,255,255,.5);color:#2A1405;font:700 ${size * .7}px/1 B;font-variation-settings:"opsz" 96;padding-bottom:${size * .06}px;box-sizing:border-box}
</style></head><body><div class="m">a</div></body></html>`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  await page.setContent(mark(512));
  await page.evaluate(() => document.fonts.ready);
  const png = await page.locator('.m').screenshot({ omitBackground: true });
  for (const [size, name] of [[16, 'favicon-16.png'], [32, 'favicon-32.png'], [180, 'apple-touch-icon.png'], [192, 'favicon-192.png'], [512, 'favicon-512.png']]) {
    await sharp(png).resize(size, size).png().toFile(`public/${name}`);
  }
  // the SVG favicon carries the same mark with the 64 px PNG inside, so it renders identically everywhere
  const png64 = (await sharp(png).resize(64, 64).png().toBuffer()).toString('base64');
  await writeFile('public/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,${png64}" xlink:href="data:image/png;base64,${png64}"/></svg>\n`);
} finally { await browser.close(); }
for (const [directory, name] of [['@fontsource-variable/bricolage-grotesque', 'bricolage-grotesque'], ['@fontsource-variable/onest', 'onest'], ['@fontsource-variable/alexandria', 'alexandria'], ['@fontsource/jetbrains-mono', 'jetbrains-mono']]) {
  await copyFile(`node_modules/${directory}/LICENSE`, `public/licenses/${name}.txt`);
}
console.log('AmirOS favicon set and font licence notices prepared.');
