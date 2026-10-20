import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';

// Typeset sharing images in the Lit Board world: the panel, its dot grid, and the headline in Handjet.
await mkdir('public/images', { recursive: true });
const font = async file => (await readFile(`node_modules/@fontsource-variable/${file}`)).toString('base64');
const handjetLatin = await font('handjet/files/handjet-latin-full-normal.woff2');
const handjetArabic = await font('handjet/files/handjet-arabic-full-normal.woff2');
const readexLatin = await font('readex-pro/files/readex-pro-latin-wght-normal.woff2');
const readexArabic = await font('readex-pro/files/readex-pro-arabic-wght-normal.woff2');
const arabicRange = 'U+0600-06FF,U+FB50-FDFF,U+FE70-FEFC';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const lang of ['en', 'ar']) {
    const ar = lang === 'ar';
    await page.setContent(`<!doctype html><html lang="${lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
      @font-face{font-family:H;src:url(data:font/woff2;base64,${handjetLatin}) format('woff2-variations');font-weight:100 900}
      @font-face{font-family:H;src:url(data:font/woff2;base64,${handjetArabic}) format('woff2-variations');font-weight:100 900;unicode-range:${arabicRange}}
      @font-face{font-family:R;src:url(data:font/woff2;base64,${readexLatin}) format('woff2-variations');font-weight:160 700}
      @font-face{font-family:R;src:url(data:font/woff2;base64,${readexArabic}) format('woff2-variations');font-weight:160 700;unicode-range:${arabicRange}}
      *{box-sizing:border-box}
      body{margin:0;height:630px;padding:28px;background:#0a0e0c;font-family:R,sans-serif;color:#e8ece7}
      .board{height:100%;display:flex;flex-direction:column;padding:52px 60px;border-radius:2px;
        background:radial-gradient(circle at 50% 50%,#19201c 0 1.15px,transparent 1.65px) 0 0/6px 6px,#101613;
        box-shadow:0 0 0 1px #2c3430,0 0 0 6px #161d19,0 0 0 7px #2c3430}
      .led{font-family:H;font-variation-settings:'ELSH' 8,'ELGR' 1;font-weight:560;line-height:${ar ? 1.2 : .95}}
      .name{font-size:34px;display:flex;gap:16px;align-items:baseline}.name span+span{color:#a3ada6;font-size:30px}
      h1{margin:54px 0 0;font-size:${ar ? 80 : 92}px;max-inline-size:${ar ? 960 : 900}px;font-weight:560}
      .foot{margin-top:auto;display:flex;justify-content:space-between;align-items:center;border-block-start:1px solid #2c3430;padding-top:22px;font-size:19px;color:#a3ada6}
      .foot .led{color:#ff6a5c;font-size:30px}
      </style></head><body><div class="board">
      <div class="name led"><span>${ar ? 'أمير الحاتمي' : 'AMIR ALHATEMI'}</span><span>${ar ? 'AMIR ALHATEMI' : 'أمير الحاتمي'}</span></div>
      <h1 class="led">${ar ? 'مطوّر تطبيقات يضع العربية في صميم التجربة.' : 'App developer building Arabic-first products.'}</h1>
      <div class="foot"><span>${ar ? 'التعلّم والتواصل والعمل الميداني وأدوات العمل' : 'Learning, communication, field work and practical tools'}</span><span class="led">${ar ? 'ثمانية مشاريع' : '8 projects'}</span></div>
      </div></body></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `public/images/social-${lang}.png` });
  }
  console.log('English and Arabic sharing images prepared.');
} finally { await browser.close(); }
