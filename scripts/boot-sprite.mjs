import { chromium } from 'playwright';
import sharp from 'sharp';

// The boot screen's waving Imp, rendered once from the owner's own "wave" clip with the mascot runtime's own
// renderer, at the boot screen's size (150 x 168 CSS px) and twice its density, frames side by side.
// The page then shows it with a two-step CSS animation instead of waiting for the 800 KB runtime.
// Run after the mascot art changes: node scripts/boot-sprite.mjs
const W = 150, H = 168, S = 3, R = 2;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ path: 'public/os/imp-live.js' });
  const data = await page.evaluate(async ({ W, H, S, R }) => {
    const { drawFrame, whenFaces } = window.IMP2, { CLIPS } = window.IMP2CLIPS;
    await whenFaces();
    const frames = CLIPS.wave.frames, out = document.createElement('canvas');
    out.width = W * R * frames.length; out.height = H * R;
    const ctx = out.getContext('2d');
    frames.forEach((fr, i) => {
      ctx.save(); ctx.translate(i * W * R, 0);
      // the same anchor the boot cameo used: feet at the bottom centre, two art pixels above the edge
      drawFrame(ctx, fr, Math.round(W / 2) * R, (H - S * 2) * R, S * R, {});
      ctx.restore();
    });
    return { url: out.toDataURL('image/png'), frames: frames.map(f => f.ms) };
  }, { W, H, S, R });
  const png = Buffer.from(data.url.split(',')[1], 'base64');
  await sharp(png).webp({ lossless: true, effort: 6 }).toFile('public/os/boot-wave.webp');
  console.log(`boot-wave.webp: ${data.frames.length} frames (${data.frames.join(', ')} ms)`);
} finally { await browser.close(); }
