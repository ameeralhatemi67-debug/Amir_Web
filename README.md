# Amir Alhatemi portfolio

A static English/Arabic portfolio for Amir Alhatemi, built with Astro and vanilla JavaScript. The design is **Imp OS** (direction A from the "Lit Board Mascot" mood board): the portfolio behaves like a small desktop operating system, AmirOS. On a laptop, projects are icons and windows you can open, drag, resize, snap, minimise and tile; on a phone it is a home screen whose apps open as sheets. The owner's **Pixel imp** mascot lives on the windows. See `DESIGN.md` for the design system and `PRODUCT.md` for the product brief.

No AI-generated images, project source code, credentials or private user records are included.

## Run locally

Requires Node.js 22.12+ (tested with 22.19.0) and npm.

```powershell
Set-Location 'D:\Agents\main\projects\ideas\Amir_web'
npm ci
npm run dev
```

Open `http://127.0.0.1:4321/en/` or `http://127.0.0.1:4321/ar/`.

```powershell
npm run build
npm run preview
```

The output is `dist/`. There is no server adapter, database, account system, analytics, contact form or environment configuration. Fonts, images and videos are served with the site. If a restricted Windows shell blocks Astro's telemetry preference, set `$env:ASTRO_TELEMETRY_DISABLED = '1'` before building.

## How it is built

- `src/os/content.json`: all content: the person, contact routes, education, the eleven projects (stage, access, status, problem, audience, highlights, facts, boundary, links, screens, phone screens, films, tools, features), the lab, stages and interface words, in English and Arabic.
- `src/os/core.js`: words, icons, tiles, routes and the HTML of every window and of the desktop. It does no DOM work, so the build uses it to draw each page and the browser uses it to draw windows.
- `src/os/app.js`: the desktop in the browser: window manager, sheets, dock, menus, Spotlight search, lightbox, film player, settings, terminal, boot screen, address syncing and the mascot hook-up.
- `src/os/style.css`: the stylesheet (inlined into every page at build time).
- `src/layouts/OsPage.astro`: one page: metadata, JSON-LD, the wallpaper, menu bar, icons, widgets, home screen, dock and the page's own window drawn as a sheet.
- `src/pages/[lang]/[...path].astro`: one page per window with an address, in both languages; `src/pages/index.astro` (the English desktop at `/`) and `404.astro`.
- `public/os/imp-live.js`: the Pixel imp runtime (sprites, clips, behaviour). It loads with the visitor's first interaction or four seconds after the page loads. `public/os/boot-wave.webp` is the boot screen's waving Imp, rendered from his own wave clip.
- `public/media/`: project screens, phone screens, films and posters, app icons, logos and the portrait.

### Addresses

`/en/` and `/ar/` open the desktop (Start here on a laptop, the home screen on a phone). Every other window with an address has a page: `/en/projects/` (Work), `/en/projects/<slug>/` for each project, `/en/films/`, `/en/lab/`, `/en/about/`, `/en/contact/`, `/en/privacy/`, plus a localised `/en/404/`. Opening a window updates the address bar, and the language switch flips the open windows in place and moves to the same address in the other language. Each page arrives with its own window already drawn, so it reads without JavaScript and search engines see the content.

### Adding or changing content

- Edit `src/os/content.json`. A project needs a slug, both languages for every text field, and its media.
- Media: put screens in `public/media/<project>/` as WebP and list them with their pixel size. Then run `node scripts/media-variants.mjs` to make the 800 px copies of wide screens (served to phones through `srcset`), the 192 px app icons and the portrait sizes.
- Videos: H.264 with AAC audio under the 1.5 MB budget, with a WebP poster. For example:

```powershell
ffmpeg -i source.mp4 -vf "scale=960:540:flags=lanczos,fps=30" -c:v libx264 -profile:v high -preset veryslow -crf 27 -pix_fmt yuv420p -c:a aac -b:a 56k -ac 2 -ar 44100 -movflags +faststart out.mp4
```

- After changing the mascot runtime, run `node scripts/boot-sprite.mjs` to re-render the boot screen's waving Imp.
- `node scripts/prepare-assets.mjs` re-renders the favicons from the AmirOS mark and copies the font licences; `node scripts/social-images.mjs` (with `npm run preview` running) captures the sharing images from the live desktop.

## Checks

```powershell
npm run build
npm run secrets
# In another terminal, leave npm run preview running first:
npm run audit
node scripts/lighthouse.mjs
```

`npm run build` runs Astro's diagnostics, builds the static pages and checks every page: language and direction, one h1 per form factor, title, description, alternates, structured data, social metadata, no embeds or forms, every local link, `srcset` and poster target, and the 300 KB image and 1.5 MB video budgets. `npm run audit` runs axe (WCAG 2.1 A/AA and best practices) on every route in both languages, both themes, laptop and phone, with the mascot loaded, then checks windows and their addresses, the language switch, theme persistence, Work filters, search, phone sheets and deep links, the boot screen, reduced motion, the mascot arriving, narrow screens, the 404 and the pages without JavaScript. `scripts/lighthouse.mjs` runs mobile Lighthouse on every indexable page.

Verified local results for this build (2026-11-09):

| Check | Result |
| --- | --- |
| Astro diagnostics | 0 errors, 0 warnings |
| Static output | 40 pages; links, srcset, metadata, language/direction, image and video budgets passed |
| axe accessibility/layout | 152 language/theme/viewport combinations with the mascot loaded; 0 issues |
| Interaction checks | 13 of 13 passed |
| Mobile Lighthouse (36 pages) | Accessibility, best practices and SEO 100 on every page. Performance 95 to 98 on 31 pages; 93 to 94 on Work (English), Hatan (both), Amir Lap (Arabic) and Memory Card (Arabic) |

The five pages under 95 are the image-heaviest. Their real first paint and LCP are about 0.6 s on a fast connection; Lighthouse's simulated slow 4G pushes LCP to about 3 s, because fonts, the app bundle and nearby screens share the link before the main screenshot. Details are in `qa/accessibility.json` and `qa/lighthouse-summary.json`. These are local lab results, not a guarantee for every device; physical-device and screen-reader acceptance remain unverified.

## Owner TODO list

1. Supply the personal origin story and motivations, and confirm the working principles on the About window.
2. Confirm solo/team context and exact contribution on each project.
3. Confirm public naming and any disclosure restrictions for NBC, Comms Hub, Hida and DnFOM (the DnFOM client stays unnamed until it agrees).
4. Choose BookQuest versus Marginalia as the final portfolio name.
5. Provide approved Hadayah app privacy-policy and account-deletion URLs. No placeholder legal links are published.
6. Recheck Hedayah dashboard source health and confirm contribution scope.

The production domain is `https://amir-web-alpha.vercel.app/`. If it moves, update `astro.config.mjs`, the `origin` in `src/layouts/OsPage.astro` and `src/pages/sitemap.xml.ts`, and `public/robots.txt` together.

## Deploying

The repository is linked to the Vercel project `amir-web` (Astro preset, build command `npm run build`, output `dist`, no environment variables). Pushing `main` to `https://github.com/ameeralhatemi67-debug/Amir_Web.git` deploys it. Before pushing, review the staged diff and run `npm run secrets -- --staged`. Do not overwrite or force-push the remote history. After a deploy, open `/en/` and `/ar/` on the production domain, open a project from the desktop, switch languages from a project, flip the theme, open `/en/privacy/`, and check an invalid address shows the 404. Check the phone layout on a real Android phone.

For the Google Play Console **Website** field, use the production root, `https://amir-web-alpha.vercel.app/`. The portfolio's Privacy window does not replace Hadayah's app-specific privacy policy or account-deletion page.
