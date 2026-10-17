import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://amir-web-alpha.vercel.app',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
