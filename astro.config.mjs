import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://amir-web-alpha.vercel.app',
  output: 'static',
  trailingSlash: 'always',
  // The desktop is one page that stays open, so its stylesheet travels inside the HTML: no render-blocking request.
  build: { format: 'directory', inlineStylesheets: 'always' },
});
