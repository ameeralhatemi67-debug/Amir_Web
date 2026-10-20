import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';

async function files(directory) {
  return (await Promise.all((await readdir(directory, { withFileTypes: true })).map(item => item.isDirectory() ? files(join(directory,item.name)) : join(directory,item.name)))).flat();
}
const all = await files('dist');
const htmlFiles = all.filter(file => file.endsWith('.html'));
assert.equal(htmlFiles.length, 30, 'Expected 28 localized pages (6 shared + 8 case studies, in two languages), a root home, and a root 404.');
const problems = [];
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const lang = /\bar[\\/]/.test(file) ? 'ar' : 'en';
  const checks = [
    [html.includes(`lang="${lang}"`), 'page language'],
    [html.includes(`dir="${lang === 'ar' ? 'rtl' : 'ltr'}"`), 'page direction'],
    [(html.match(/<h1\b/g) || []).length === 1, 'one h1'],
    [/<title>.+?<\/title>/.test(html), 'title'],
    [/<meta name="description" content="[^"]+"/.test(html), 'description'],
    [html.includes('hreflang="ar"') && html.includes('hreflang="en"'), 'alternate languages'],
    [html.includes('application/ld+json'), 'structured data'],
    [html.includes('name="twitter:card"'), 'social metadata'],
    [!/<(?:iframe|form)\b/i.test(html), 'no external embeds or contact forms'],
  ];
  checks.forEach(([ok,label]) => { if (!ok) problems.push(`${file}: ${label}`); });
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
    const target = match[1];
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
