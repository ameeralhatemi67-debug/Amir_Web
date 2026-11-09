---
name: Amir Alhatemi Portfolio
description: Imp OS, a portfolio that behaves like a warm desktop operating system, with the owner's Pixel imp living on its windows.
colors:
  bg-dusk: "#0B2733"
  ink-dusk: "#EEF4F2"
  glass-dusk: "rgba(13, 34, 42, .62)"
  glass-2-dusk: "rgba(19, 46, 55, .72)"
  glass-strong-dusk: "rgba(9, 27, 34, .9)"
  bg-morning: "#EFE3D0"
  ink-morning: "#1A2A30"
  glass-morning: "rgba(255, 252, 246, .64)"
  amber: "#FFB547"
  coral: "#FF7A59"
  teal: "#2FA595"
  accent-1: "#FFC66A"
  accent-2: "#FF8A5B"
  accent-ink: "#2A1405"
  stage-concept: "#9AA7AB"
  stage-building: "#FFB547"
  stage-pilot: "#3CC3A8"
  stage-launch: "#FF8A5B"
  stage-live: "#6BD66B"
typography:
  display: { fontFamily: "'Bricolage Grotesque Variable'", fontWeight: 700, opticalSize: 96, letterSpacing: "-0.03em" }
  ui: { fontFamily: "'Onest Variable'", fontSize: "15px", lineHeight: 1.55 }
  arabic: { fontFamily: "'Alexandria Variable'", note: "display and UI for every Arabic page" }
  mono: { fontFamily: "'JetBrains Mono'", weights: [400, 500], use: "eyebrows, clock, chips, figures' captions, terminal" }
rounded:
  window: "16px"
  tile: "26% of the tile"
  card: "14px"
  button: "12px"
---

# Design System: Imp OS

## Overview

**Creative North Star: "A warm desktop on the Gulf."**

The portfolio is a small desktop operating system, AmirOS. On a laptop it is a desktop: a menu bar, a wallpaper, project icons down the side, three glass widgets, a dock, and real windows that open from the icon you clicked, drag, resize from every edge, snap to halves and quarters (with snap layouts and snap assist), minimise to the dock and cascade or tile. On a phone it is a home screen: a search pill, a hero widget, Imp's porch, an app grid and a four-item dock, and every app opens as a sheet you can drag down to close.

Projects are apps. Each project window has an Overview (hero screen or highlights, the problem, who it is for, what is implemented, where it stands, links, related projects), then Screens, Films and Facts tabs when it has them (Amir Lap adds a Tools tab, Hatan a highlights grid with a playing 3D locker room). There are system apps too: Start here, Work (every project, filterable), Films (one player with every film), Lab, About Amir, Contact, Settings, Keyboard shortcuts, Terminal, About AmirOS and Privacy.

The two themes are one place at two times of day: Dusk (dark, the default for dark systems) over the Gulf, and Morning on the corniche. Four coded wallpapers come in both versions: Corniche (skyline with the water tower, a minaret and palms), Aurora, Dunes and Pixel sun. Visitors can also pick one of five accent colours, reduce motion, reorder the desktop icons and hide the widgets. Everything is remembered per browser.

**Pixel imp** lives on the windows. He is the owner's own design (see the mascot notes below): he perches on window bars, widgets and the dock, hangs from titles, climbs into screenshots, points at what you hover, flips the lights by tapping the theme switch, can be dragged, thrown, poked, grown and shrunk, and reacts to what you open.

## Colours

Glass over a painted wallpaper. Surfaces are translucent (`--glass`, `--glass-2`, `--glass-strong`) with a 22px backdrop blur and a light inner edge; text is Ink, Ink 2 (74%) and Ink 3 (54%). The accent is a two-stop gradient (`--acc1` to `--acc2`, amber to coral by default) with its own dark ink, used for primary buttons, the selected tab underline, menu highlights and the mark. Project stages have fixed colours (concept grey, building amber, pilot teal, launch coral, live green), always shown with words.

## Typography

- **Bricolage Grotesque** (variable, optical size 96 for display) for names, window headings, figures and the boot mark.
- **Onest** (variable) for everything read and operated in English.
- **Alexandria** (variable) for the Arabic pages, display and UI alike, with letter-spacing 0 and taller line-heights.
- **JetBrains Mono** (400, 500) for eyebrows, the clock, chips, captions on screens and the terminal.

All four are served with the site from the `@fontsource` packages; the Latin (or Arabic) files a page needs first are preloaded. Nothing a reader needs is under 13px, and body copy is 14px or more.

## Layout

- **Laptop (760px and wider):** fixed desktop with icons in columns along the end edge (the right in English, the left in Arabic), widgets beside them above 1180px, windows in their own layer, dock at the bottom. Windows open at a size that fits and reflow when the screen changes; snapped windows keep their zone.
- **Phone (under 760px):** a scrolling home screen and sheets that cover it from 10px below the top. The dock keeps Work, Films, About and Contact.
- **Without JavaScript:** the home screen and the page's own window read as one plain page (all tabs shown as sections, links work, videos have native controls).
- Right-to-left is native: the desktop mirrors, snap layouts read right to left, and windows flip sides when the language changes.

## Motion

Windows grow out of the icon you clicked and shrink back into the dock; the dock magnifies under the pointer and bounces an app that opens; tiles lift on hover; the wallpaper drifts slowly; toasts slide in. A boot screen ("Waking up Imp…", with Imp waving) greets the first visit to the home page in a session and can be skipped with any key or click. Reduced motion (the system setting or the Settings switch) removes the boot screen, the drifting wallpaper, window animations and the mascot's movement.

## The mascot

Pixel imp is the owner's design: a charcoal pixel-art monkey with an ivory mask, hands and feet, amber brows and scarf, and a spiral tail. His head and body are pixel art; his face stays smooth. Never redraw or re-proportion him, and never enlarge his head. The runtime (`public/os/imp-live.js`) holds his sprites, clips and behaviour; the desktop gives him a perch map (`IMP_MAP` in `src/os/app.js`) and `data-imp` attributes on bars, widgets, titles and screenshots. The boot screen's waving Imp is a sprite rendered from his own wave clip by `scripts/boot-sprite.mjs`. He arrives with the visitor's first interaction (or four seconds after load) so he never slows the page down.

## Do's and Don'ts

### Do:
- **Do** treat every new piece of content as an app or a window part, built from the shared pieces (`.card`, `.chip`, `.btn`, `.frame`, `.tile`).
- **Do** give every window that should be linkable an address in `ROUTE` (`src/os/core.js`) so it gets its own page in both languages.
- **Do** show stages with their dot and their words, and keep facts honest, with sample data labelled.
- **Do** use only real captures or source-project assets in frames.
- **Do** keep 44px touch targets on the phone and visible focus everywhere.
- **Do** keep English and Arabic at parity, with the Arabic words written for Arabic readers.

### Don't:
- **Don't** redesign Imp or change his proportions; ask the owner first.
- **Don't** add analytics, third-party embeds, font services or a contact form.
- **Don't** load the mascot runtime before the page's own content.
- **Don't** use AI-generated, rendered or invented imagery.
