# Amir Alhatemi portfolio

A static English/Arabic portfolio for Amir Alhatemi. Built with Astro, semantic HTML, native CSS, and small browser scripts. A work-first gallery presents all six projects with real public-site captures or existing source-project images. No AI-generated images, project source code, credentials, or private user records are included.

## Run locally

Requires Node.js 22.12+ supported by Astro 6, and npm. Tested with Node.js 22.19.0.

```powershell
Set-Location 'D:\Agents\main\projects\ideas\Amir_web'
npm ci
npm run dev
```

Open `http://localhost:4321/en/` or `http://localhost:4321/ar/`.

```powershell
npm run build
npm run preview
```

The output is `dist/`. There is no server adapter, database, account system, analytics, contact form, or application environment configuration. All fonts and images are hosted with the site. The theme override uses localStorage; language lives in the URL.

If a restricted Windows environment prevents Astro from writing its optional telemetry preference outside the folder, disable telemetry for that shell before running the build:

```powershell
$env:ASTRO_TELEMETRY_DISABLED = '1'
npm run build
```

This optional build-tool preference is not an application secret and does not need to be configured in Vercel.

## Editing

- `src/data/site.ts`: approved facts, bilingual content, links, project descriptions, and owner TODO comments.
- `src/components/HomePage.astro`: the work-first home gallery.
- `src/components/PageContent.astro`: inner page layouts and case studies.
- `src/components/ProjectVisual.astro` and `src/data/project-media.ts`: responsive project images, honest source captions, and alt text.
- `src/styles/global.css`: palette, type scale, RTL, themes, responsive rules, motion.
- `src/layouts/SiteShell.astro`: navigation, language switch, metadata, JSON-LD.
- `public/images/projects/`: optimized WebP captures and `provenance.json`.
- `public/images/`: locally typeset English/Arabic social images.
- `DESIGN.md` and `.impeccable/design.json`: the implemented design system.
- `public/licenses/`: font and icon license notices.

The primary routes are `/en/` and `/ar/`. Each includes projects, all six case studies, about, contact, privacy, and a localized 404. `/` shows the English home with `/en/` as its canonical URL. Missing URLs use the generated `404.html`.

Hadayah, NBC, BookQuest (currently branded Marginalia), and the Hedayah dashboard use screenshots of the owner's public deployments. The dashboard image uses its geographic scene and omits beneficiary names and the activity ticker. Comms Hub's primary image is an existing source-project design review with sample data, explicitly labeled as such; its case study also shows the real public sign-in page. Hida uses the source project's existing, clean start-screen preview. No authenticated session or private document was opened. A small labeled photo placeholder remains on About, as requested in the original brief.

The image origins and preparation steps are recorded in `public/images/projects/provenance.json`. `node scripts/import-project-images.mjs` can reproduce the optimized assets from the original local files and the ignored `.local/project-captures/` browser captures. Those raw captures are not needed to build or host the included site.

## Checks

```powershell
npm run build
npm run secrets
# In another terminal, leave npm run preview running first:
npm run audit
node scripts/lighthouse.mjs
```

`npm run build` runs Astro's diagnostics, generates static HTML, and checks all 26 output pages, local links, language/direction, metadata, and image budgets. The accessibility script runs axe WCAG A/AA checks in both languages, both themes, and desktop/mobile layouts. It also checks filters, theme persistence, the language switch, keyboard skip navigation, reduced motion, narrow screens, no-JavaScript content, and the custom 404. Lighthouse runs mobile checks on all 22 indexable localized pages. Scripts currently use the installed Chrome channel on Windows; adjust the Chrome path in `scripts/lighthouse.mjs` on another operating system.

Screenshots and full Lighthouse reports stay local under ignored `qa/screenshots/` and `qa/lighthouse/`. Compact results are saved in `qa/accessibility.json` and `qa/lighthouse-summary.json`.

Verified local results for this build:

| Check | Result |
| --- | --- |
| Astro diagnostics | 0 errors, 0 warnings, 0 hints |
| Static output | 26 pages; local links, metadata, locale/direction, image budgets passed |
| axe accessibility/layout | 96 language/theme/viewport combinations; 0 issues |
| Interaction checks | Filters, language path, themes, keyboard, reduced motion, narrow screens, no-JS content, 404 passed |
| Mobile Lighthouse | All 22 indexable localized pages meet 95 in every category |
| Performance | 99–100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

These are local lab results, not a guarantee for every device or future hosted build. Physical-device and screen-reader acceptance remain unverified. The five owner-provided project deployments were accessible during capture; ongoing availability is outside this portfolio's control. Filenames, staged whitespace, and credential patterns are checked before release.

Production is configured for [amir-web-alpha.vercel.app](https://amir-web-alpha.vercel.app/), the domain assigned by Vercel to project `Amir / amir-web`. Source belongs in [Amir_Web](https://github.com/ameeralhatemi67-debug/Amir_Web), on branch `main`. Vercel uses Astro, `npm ci`, `npm run build`, `dist`, and Node.js 22. No application environment variables are required. `vercel.json` keeps build settings in source; `.vercelignore` excludes local captures, reports, and sensitive configuration from CLI uploads.

To regenerate share images and favicons locally:

```powershell
node scripts/social-images.mjs
node scripts/prepare-assets.mjs
```

The optimized project images are already included; each is below 300 KB. Do not copy private app screenshots, raw project folders, environment files, or signing materials into this repository.

## Owner TODO list

These are explicitly marked `TODO(owner)` in source. Missing details do not become invented claims.

1. Supply the public contact/support email. No personal inbox has been used.
2. Supply the personal origin story and motivations, and confirm the proposed working principles. Current bio uses only supplied facts and project topics.
3. Confirm personal proficiency in the listed project technologies. The site currently calls these "Tools in these projects."
4. Confirm solo/team context and exact contribution on each of the six projects. Case studies explicitly say the responsibility details need confirmation.
5. Supply an approved portrait, if desired; the labeled photo placeholder is safe to retain.
6. Confirm public naming and any disclosure restrictions for NBC, Comms Hub, and Hida. Existing public branding appears only inside the real screenshots; private records are excluded.
7. Choose BookQuest versus Marginalia as the final portfolio name. The supplied public landing page was verified and identifies a closed web alpha.
8. Provide approved Hadayah app privacy-policy and account-deletion URLs. No placeholder legal links are published.
9. Recheck Hedayah dashboard source health and confirm contribution scope. Its public deployment was verified; this portfolio does not claim all data sources are healthy.

The production-domain TODO is resolved: Vercel assigned `https://amir-web-alpha.vercel.app/`. If moving domains later, update `astro.config.mjs`, `src/data/site.ts`, and `public/robots.txt` together before rebuilding.

The five owner-provided public deployment URLs are now linked. Hadayah's Google Play status remains "Preparing for Google Play."

Source projects were inspected read-only. Sensitive configuration files were not opened or copied. Hadayah's source status mentions a historical exposed YouTube key in Git history; the owner should confirm replacement separately. No value or credential is retained here.

## GitHub handoff

For a fresh copy without Git history, these commands initialize the source repository. For this linked checkout, future updates only need review, staging, a commit, and `git push`.

```powershell
Set-Location 'D:\Agents\main\projects\ideas\Amir_web'
git init
git add .
git status --short
git diff --cached --check
npm run secrets -- --staged
git diff --cached --stat
git diff --cached
```

Review the full staged diff locally. The scanner reports locations without printing matching values, but a pattern scan cannot prove the absence of every kind of confidential information. Confirm that no environment files, credentials, signing materials, private screenshots, binaries over the image budget, `node_modules`, or `dist` are staged. Then:

```powershell
git commit -m "Initial portfolio site"
git remote add origin https://github.com/ameeralhatemi67-debug/Amir_Web.git
git branch -M main
git push -u origin main
```

If `origin` already exists, inspect it with `git remote -v`; when it is the intended repository, omit `git remote add origin`. Do not overwrite or force-push an existing remote history.

## Vercel, click by click

After choosing and confirming the production domain and pushing:

1. Sign in to Vercel with the GitHub account that can access `Amir_Web`.
2. Click **Add New → Project**.
3. Find `ameeralhatemi67-debug/Amir_Web` under **Import Git Repository**, and click **Import**. If absent, grant Vercel access to that repository.
4. Set **Project Name** to `amir-web`, or another available clean name.
5. Set **Framework Preset** to **Astro**.
6. Keep **Root Directory** as the repository root, `./`.
7. Under **Build and Output Settings**, use **Build Command** `npm run build` and **Output Directory** `dist`. The install command can remain automatic, or use `npm ci`.
8. Add **no environment variables**. No Vercel adapter, database, analytics, or storage integration is required.
9. Click **Deploy**. When ready, open the stable production `.vercel.app` domain, not a protected preview URL.
10. To rename later, open the project’s **Settings → General → Project Name**, change it, and save. Then check **Settings → Domains**. Renaming alone should not be assumed to assign the desired domain. This project's confirmed domain is `amir-web-alpha.vercel.app`. Update the three source domain settings if it changes, then rebuild and push that change.
11. Verify `https://YOUR-CONFIRMED-DOMAIN/` loads without a sign-in wall or certificate warning. Open `/en/` and `/ar/`, switch languages from a project page, test all theme options, and open `/en/privacy/` and `/ar/privacy/`. Check the layout on a real Android phone. Also open an invalid path to verify the 404.

Official references: [Astro on Vercel](https://docs.astro.build/en/guides/deploy/vercel/) and [Astro's Vercel integration](https://docs.astro.build/en/guides/integrations-guide/vercel/). A plain static Astro site does not require the Vercel adapter.

For the Google Play Console **Website** field, use the verified public HTTPS production root, for example `https://amir-web-alpha.vercel.app/` if that exact domain is assigned. The portfolio's own Privacy page does not replace Hadayah's app-specific privacy policy or account-deletion page.
