import sharp from 'sharp';
import { readdir, readFile, writeFile, stat, unlink } from 'node:fs/promises';
import { join } from 'node:path';

// Smaller copies of the media the desktop shows small, so phones do not download desktop-sized files.
//  - app icons: 192 px WebP (tiles are at most 96 CSS px), replacing the 256 px PNGs
//  - the portrait: a 160 px tile and a 640 px copy for the About window
//  - every screenshot 1200 px or wider: an 800 px copy named name-800.webp, offered through srcset (see img() in src/os/core.js)
// Run after adding media: node scripts/media-variants.mjs
const root = 'public/media';
const content = JSON.parse(await readFile('src/os/content.json', 'utf8'));
let made = 0;

const iconDir = join(root, 'icons');
for (const name of (await readdir(iconDir)).filter(n => n.endsWith('.png'))) {
  const src = join(iconDir, name), out = src.replace(/\.png$/, '.webp');
  await sharp(src).resize(192, 192).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(out);
  await unlink(src); made++;
}
// point the content at the WebP icons
const json = JSON.stringify(content, null, 1).replace(/"\/media\/icons\/([a-z0-9-]+)\.png"/g, '"/media/icons/$1.webp"');
await writeFile('src/os/content.json', json + '\n');

const portrait = join(root, 'amir/portrait.webp');
await sharp(portrait).resize(160, 200).webp({ quality: 82 }).toFile(join(root, 'amir/portrait-160.webp'));
await sharp(portrait).resize(640, 800).webp({ quality: 80 }).toFile(join(root, 'amir/portrait-640.webp'));
made += 2;

// film posters double as thumbnails in the film list (74 x 52 CSS px): a 160 px copy each, name-th.webp
for (const v of content.projects.flatMap(p => p.videos)) {
  const src = join('public', v.poster);
  // centre crop, as the list's object-fit: cover showed the full poster
  await sharp(src).resize(160, 112, { fit: 'cover' }).webp({ quality: 78 }).toFile(src.replace(/\.webp$/, '-th.webp'));
  made++;
}

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) { await walk(path); continue; }
    if (!entry.name.endsWith('.webp') || /-(800|160|640|th)\.webp$/.test(entry.name) || entry.name.endsWith('-poster.webp')) continue;
    const { width } = await sharp(path).metadata();
    if (width < 1200) continue;
    const out = path.replace(/\.webp$/, '-800.webp');
    await sharp(path).resize(800).webp({ quality: 80, effort: 6 }).toFile(out);
    made++;
  }
}
await walk(root);
console.log(`${made} media variants written.`);
for (const f of ['amir/portrait-160.webp', 'amir/portrait-640.webp']) console.log(f, (await stat(join(root, f))).size);
