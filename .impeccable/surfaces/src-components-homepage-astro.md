---
version: 1
slug: "src-components-homepage-astro"
primary_target: "src/components/HomePage.astro"
related_targets: ["src/layouts/SiteShell.astro","src/components/CaseStudy.astro","src/components/Board.astro"]
---

# Portfolio: The Lit Board

Mode: Experience. Owner chose The Lit Board (assigned direction) over the specimen pick and the canon, 2026-10-20. Scope adds HAYZ, DnFOM and a lab strip; owner will supply a portrait and a public email. Existing facts, routes, EN/AR parity, light/dark/system, static hosting, real-captures-only and no-push boundaries remain binding. Build path: code-led (no image generation; owner bans AI images).

## Direction contract

THESIS: The home page is a working information board: the projects are its rows, each lit with an honest status, and the real screens light up beside it. It refuses the hero-over-card-grid portfolio and the retired quiet green contact sheet.

OWN-WORLD: The LED information board of Saudi mosques, schools and office lobbies: black-green acrylic panel, a visible unlit dot grid, thin frame. Handjet dot-matrix display in both scripts; Readex Pro for reading. Three LED inks with fixed jobs: amber = interactive (nav, links, selected row, focus), green = live/public, red = figures and the ticker. Unlit dots = unconfirmed facts. Light theme = the same board printed as a timetable card: white stock, darkened inks, pale halftone dots. 2px corners; only status glyphs are round. Status is drawn by glyph pattern on one lifecycle, never by hue alone. One inverted amber plate per screen.

STORY: Recognise a bilingual app developer, scan eight real projects and their true state at a glance, preview the screens, open a case study, see the same product in Arabic and English, then make contact by email.

FIRST VIEWPORT: Masthead at most 64px: dot-matrix bilingual name lockup, nav, ع/EN relight switch, theme switch. One framed board spans the container: left 7/12 holds a two-line Handjet headline (~64px), an intro under 20 words, then eight project rows (name lit, category, status glyph and label), Hadayah Live selected as the amber plate. Right 5/12 is the screen: a real Hadayah phone capture over a web capture, caption, amber case-study action. Board foot: "Statuses as of" date in red plus a pausable ticker. Phones: headline, flagship screen, then rows that repack.

FORM: Grounded candidate 7 of 7, the LED information board; seed 3f9f8885. Signature interactions: row relight (hover/focus/tap previews the row's real capture through a dot mask) and language relight (cross-document view transition; text dot-wipes and relights in its own reading direction).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Raises kept from declined challengers
- Jackfield: one inverted plate per screen; status by stroke/fill pattern, not colour.
- Darkroom: statuses on one fixed lifecycle (concept, building, pilot/alpha, store prep, live).
- Provenance ribbon: confirmed facts lit solid; unconfirmed facts as unlit dots labelled "to be confirmed".
- Sewing pattern: lettered views, View A العربية / View B English, phone / desktop, from real paired captures.
- Merz collage: narrow screens repack rows rather than shrinking type.
- Teen-magazine quiz: the page ends at a destination panel, the contact message.

## Cited adaptations (finish review round 1)
- Language switch label: the masthead shows the full words "العربية" / "English" instead of ع / EN, so visitors who cannot read the other script still recognise the control.
- Phone masthead: below 760px it is two rows (about 96px) instead of one 64px row. Nav, language and theme keep 44px targets, which one row cannot hold at 360-390px. The bilingual lockup stays visible, and the masthead is not sticky on phones so the board keeps the screen.
- Row relight on touch: on phones the screen sits above the rows, so tapping a row opens its case study instead of previewing; a preview would need a second tap with the result out of view.
- Language relight applies to the whole page, triggered only when the /en/ or /ar/ prefix changes (view-transition type "relight"). Other navigations use a short cross-fade. No element keeps a separate view-transition name.
- Seed corroboration: concept-seed --scope direction --mode experience printed key 3f9f8885 on 2026-10-20; the resolved choice (assigned) was recorded with the --kind assigned telemetry ping.

## Unresolved
- Portrait and public email pending from owner.
- Role per project and personal story remain TODO(owner).
- BookQuest vs Marginalia final name remains TODO(owner).
