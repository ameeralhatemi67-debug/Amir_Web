import sharp from 'sharp';
import { mkdir, readFile, copyFile } from 'node:fs/promises';

await mkdir('public/images', { recursive: true });
await mkdir('public/licenses', { recursive: true });
const favicon = await readFile('public/favicon.svg');
for (const [size, name] of [[16,'favicon-16.png'],[32,'favicon-32.png'],[180,'apple-touch-icon.png'],[192,'favicon-192.png'],[512,'favicon-512.png']]) {
  await sharp(favicon).resize(size,size).png().toFile(`public/${name}`);
}
for (const [directory, name] of [['@fontsource-variable/handjet','handjet'],['@fontsource-variable/readex-pro','readex-pro']]) {
  await copyFile(`node_modules/${directory}/LICENSE`, `public/licenses/${name}.txt`);
}
await copyFile('node_modules/@tabler/icons/LICENSE', 'public/licenses/tabler-icons.txt');
console.log('Favicon set and license notices prepared. Project screenshots are managed separately.');
