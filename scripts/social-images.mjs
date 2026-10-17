import { chromium } from 'playwright';
import { readFile, readdir, mkdir } from 'node:fs/promises';

await mkdir('public/images', { recursive: true });
const arabicPath = 'node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-600-normal.woff2';
const manropeFiles = await readdir('node_modules/@fontsource-variable/manrope/files');
const manropePath = `node_modules/@fontsource-variable/manrope/files/${manropeFiles.find(file => file.includes('-latin-wght-normal.woff2'))}`;
const english = (await readFile(manropePath)).toString('base64');
const arabic = (await readFile(arabicPath)).toString('base64');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const lang of ['en','ar']) {
    const ar = lang === 'ar';
    await page.setContent(`<!doctype html><html lang="${lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
      @font-face{font-family:Display;src:url(data:font/woff2;base64,${english});font-weight:200 800}
      @font-face{font-family:Arabic;src:url(data:font/woff2;base64,${arabic});font-weight:600}
      *{box-sizing:border-box}body{margin:0;padding:64px 76px;background:#f8faf8;color:#19342c;font-family:${ar ? 'Arabic' : 'Display'},sans-serif;height:630px;display:flex;flex-direction:column}
      .name{font-size:25px;font-weight:600}h1{font-size:${ar ? 66 : 70}px;line-height:${ar ? 1.6 : 1.25};letter-spacing:${ar ? 0 : '-.035em'};margin:66px 0 0;font-weight:600;max-inline-size:1050px}
      .foot{margin-top:auto;padding-top:25px;border-block-start:1px solid #cad5cd;font-size:18px;color:#52665b}
      </style></head><body><div class="name">${ar ? 'أمير الحاتمي' : 'Amir Alhatemi'}</div><h1>${ar ? 'مطوّر تطبيقات يضع العربية في صميم التجربة.' : 'App developer building Arabic-first products.'}</h1><div class="foot">${ar ? 'أعمال مختارة في التعلّم والتواصل وأدوات العمل' : 'Learning, communication, and practical tools'}</div></body></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `public/images/social-${lang}.png` });
  }
  console.log('English and Arabic sharing images prepared.');
} finally { await browser.close(); }
