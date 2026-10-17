import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const staged = process.argv.includes('--staged');
const textExtensions = new Set(['.astro','.ts','.js','.mjs','.css','.html','.json','.txt','.md','.yml','.yaml','.svg','.webmanifest']);
const ignored = new Set(['node_modules','dist','.git','.local','.astro','.serena','qa','skill-observations']);
async function collect(directory) {
  return (await Promise.all((await readdir(directory,{ withFileTypes:true })).filter(item => !ignored.has(item.name)).map(item => item.isDirectory() ? collect(join(directory,item.name)) : join(directory,item.name)))).flat();
}
const paths = staged ? execFileSync('git',['diff','--cached','--name-only','--diff-filter=ACMR','-z'],{ encoding:'utf8' }).split('\0').filter(Boolean) : await collect('.');
const findings = [];
const filename = /(?:^|[\\/])(?:\.env(?:\..*)?|key\.properties|dart_define.*\.json|.*service[-_]?account.*\.json)$|\.(?:jks|keystore|pem|p12)$/i;
const patterns = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['credential token', /\b(?:AIza[\w-]{30,}|gh[pousr]_[A-Za-z0-9]{30,}|sk-(?:proj-)?[A-Za-z0-9_-]{30,}|sb_secret_[A-Za-z0-9_-]{20,})\b/],
  ['JWT', /\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\b/],
  ['database URL', /\bpostgres(?:ql)?:\/\/[^\s"'<>]+/i],
  ['assigned secret', /(?:api[_-]?key|client[_-]?secret|password|access[_-]?token)\s*[:=]\s*["'][A-Za-z0-9_+/=-]{16,}["']/i],
];
for (const path of paths) {
  if (filename.test(path)) findings.push(`${path}: forbidden sensitive filename`);
  if (!textExtensions.has(extname(path)) || path.endsWith('check-secrets.mjs') || path.endsWith('package-lock.json')) continue;
  const content = staged ? execFileSync('git',['show',`:${path.replaceAll('\\','/')}`],{ encoding:'utf8',maxBuffer:10_000_000 }) : await readFile(path,'utf8');
  content.split(/\r?\n/).forEach((line,index) => patterns.forEach(([label,pattern]) => { if (pattern.test(line)) findings.push(`${path}:${index+1}: ${label}`); }));
}
if (findings.length) { console.error(findings.join('\n')); process.exitCode=1; }
else console.log(`No credential patterns or sensitive filenames found in ${paths.length} ${staged ? 'staged' : 'source'} files. Values are never printed. Manual review remains required.`);
