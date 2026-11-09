import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://amir-web-alpha.vercel.app',
  output: 'static',
  trailingSlash: 'always',
  // The desktop is one page that stays open, so its stylesheet travels inside the HTML: no render-blocking request.
  build: { format: 'directory', inlineStylesheets: 'always' },
  // Never inline assets as data URIs: the font subsets under 4 KB (JetBrains Mono's Cyrillic and Vietnamese) would
  // otherwise travel as base64 inside every page, although the browser only fetches a subset a page actually uses.
  vite: { build: { assetsInlineLimit: 0 } },
});
