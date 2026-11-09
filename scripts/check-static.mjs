import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';

async function files(directory) {
  return (await Promise.all((await readdir(directory, { withFileTypes: true })).map(item => item.isDirectory() ? files(join(directory,item.name)) : join(directory,item.name)))).flat();
}
const all = await files('dist');
const htmlFiles = all.filter(file => file.endsWith('.html'));
const content = JSON.parse(await readFile('src/os/content.json', 'utf8'));
// per language: home, projects, films, lab, about, contact, privacy, 404 and one page per project; plus the root home and root 404
const expected = 2 * (8 + content.projects.length) + 2;
assert.equal(htmlFiles.length, expected, `Expected ${expected} pages (${8 + content.projects.length} per language, a root home and a root 404).`);
const problems = [];
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const lang = /\bar[\\/]/.test(file) ? 'ar' : 'en';
  const checks = [
    [html.includes(`lang="${lang}"`), 'page language'],
    [html.includes(`dir="${lang === 'ar' ? 'rtl' : 'ltr'}"`), 'page direction'],
    // one h1 for the laptop desktop and one for the phone home screen; the stylesheet only ever shows one of them
    [(html.match(/<h1\b/g) || []).length === 2 && /<div class="desk"[^>]*>\s*<h1 class="vh">/.test(html) && /<h1 class="h-display hero-name"/.test(html), 'one h1 per form factor'],
    [/<title>.+?<\/title>/.test(html), 'title'],
    [/<meta name="description" content="[^"]+"/.test(html), 'description'],
    [html.includes('hreflang="ar"') && html.includes('hreflang="en"'), 'alternate languages'],
    [html.includes('application/ld+json'), 'structured data'],
    [html.includes('name="twitter:card"'), 'social metadata'],
    [!/<(?:iframe|form)\b/i.test(html), 'no external embeds or contact forms'],
  ];
  checks.forEach(([ok,label]) => { if (!ok) problems.push(`${file}: ${label}`); });
  const srcset = [...html.matchAll(/srcset="([^"]+)"/g)].flatMap(m => m[1].split(',').map(part => part.trim().split(/\s+/)[0]));
  for (const target of [...[...html.matchAll(/(?:href|src|poster)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)].map(m => m[1]), ...srcset]) {
    const disk = resolve('dist', `.${target}`, target.endsWith('/') ? 'index.html' : '');
    try { await stat(disk); } catch { problems.push(`${file}: missing local target ${target}`); }
  }
}
for (const file of all.filter(file => ['.png','.jpg','.jpeg','.webp','.avif','.svg'].includes(extname(file)))) {
  if ((await stat(file)).size >= 300_000) problems.push(`${file}: exceeds 300 KB image limit`);
}
for (const file of all.filter(file => extname(file) === '.mp4')) {
  if ((await stat(file)).size >= 1_500_000) problems.push(`${file}: exceeds 1.5 MB video limit`);
}
assert.equal(problems.length, 0, problems.join('\n'));
assert(!all.some(file => /(?:\.env|\.jks|key\.properties|dart_define|service.account)/i.test(file)), 'Forbidden files in output');
console.log(`Static checks passed: ${htmlFiles.length} pages, local links, metadata, language/direction, and image budgets.`);
