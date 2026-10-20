---
name: Amir Alhatemi Portfolio
description: A bilingual LED information board where projects are lit rows with honest status and real screens light up beside them.
colors:
  amber: "#ffb547"
  amber-soft: "#ffb54726"
  on-amber: "#1a1206"
  green: "#63d68f"
  red: "#ff6a5c"
  ink: "#e8ece7"
  muted: "#a3ada6"
  faint: "#6f7a73"
  panel: "#0a0e0c"
  panel-2: "#101613"
  panel-3: "#161d19"
  frame: "#2c3430"
  line: "#232b27"
  dot: "#19201c"
  print-amber: "#a35200"
  print-amber-soft: "#a3520014"
  print-on-amber: "#fffaf1"
  print-green: "#0e6b3a"
  print-red: "#b42318"
  print-ink: "#121614"
  print-muted: "#4c5750"
  print-faint: "#6a756e"
  print-panel: "#f5f6f2"
  print-panel-2: "#fbfbf8"
  print-panel-3: "#eceee9"
  print-frame: "#c7cdc7"
  print-line: "#dde1db"
  print-dot: "#e2e6e0"
typography:
  display:
    fontFamily: "'Handjet LED', 'Handjet Fallback A', 'Handjet Fallback R', sans-serif"
    fontSize: "clamp(56px, 8vw, 112px)"
    fontWeight: 560
    lineHeight: 0.95
    letterSpacing: "0.01em"
  board:
    fontFamily: "'Handjet LED', 'Handjet Fallback A', 'Handjet Fallback R', sans-serif"
    fontSize: "clamp(40px, 4.4vw, 62px)"
    fontWeight: 560
    lineHeight: 0.95
    letterSpacing: "0.01em"
  headline:
    fontFamily: "'Handjet LED', 'Handjet Fallback A', 'Handjet Fallback R', sans-serif"
    fontSize: "clamp(36px, 4.2vw, 56px)"
    fontWeight: 560
    lineHeight: 0.95
    letterSpacing: "0.01em"
  title:
    fontFamily: "'Handjet LED', 'Handjet Fallback A', 'Handjet Fallback R', sans-serif"
    fontSize: "clamp(24px, 2.3vw, 31px)"
    fontWeight: 560
    lineHeight: 0.95
    letterSpacing: "0.01em"
  figure:
    fontFamily: "'Handjet LED', 'Handjet Fallback A', 'Handjet Fallback R', sans-serif"
    fontSize: "clamp(30px, 3vw, 42px)"
    fontWeight: 560
    lineHeight: 0.95
    letterSpacing: "0.01em"
    fontFeature: "'tnum' 1"
  unlit:
    fontFamily: "'Handjet LED', 'Handjet Fallback A', 'Handjet Fallback R', sans-serif"
    fontSize: "26px"
    fontWeight: 260
    lineHeight: 0.95
    letterSpacing: "0.01em"
  body:
    fontFamily: "'Readex Pro Variable', 'Segoe UI', Tahoma, sans-serif"
    fontSize: "17px"
    fontWeight: 350
    lineHeight: 1.65
  body-arabic:
    fontFamily: "'Readex Pro Variable', 'Segoe UI', Tahoma, sans-serif"
    fontSize: "17.5px"
    fontWeight: 350
    lineHeight: 1.9
  label:
    fontFamily: "'Readex Pro Variable', 'Segoe UI', Tahoma, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.2
  caption:
    fontFamily: "'Readex Pro Variable', 'Segoe UI', Tahoma, sans-serif"
    fontSize: "13px"
    fontWeight: 350
    lineHeight: 1.45
rounded:
  r: "2px"
  nested: "1px"
spacing:
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "72px"
  s9: "112px"
components:
  action:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.on-amber}"
    typography: "{typography.label}"
    rounded: "{rounded.r}"
    padding: "10px 16px"
    height: "44px"
  action-outline:
    backgroundColor: "transparent"
    textColor: "{colors.amber}"
    typography: "{typography.label}"
    rounded: "{rounded.r}"
    padding: "10px 16px"
    height: "44px"
  action-outline-hover:
    backgroundColor: "{colors.amber-soft}"
    textColor: "{colors.amber}"
  text-action:
    textColor: "{colors.amber}"
    typography: "{typography.label}"
    height: "44px"
  row:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.r}"
    padding: "5px 14px"
  row-lit:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.on-amber}"
    typography: "{typography.title}"
    rounded: "{rounded.r}"
    padding: "5px 14px"
  channel:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.muted}"
    rounded: "{rounded.r}"
    padding: "6px 14px"
    height: "40px"
  channel-pressed:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.amber}"
  view-key:
    textColor: "{colors.muted}"
    rounded: "{rounded.nested}"
    padding: "6px 14px"
    height: "40px"
  view-key-selected:
    backgroundColor: "{colors.amber-soft}"
    textColor: "{colors.amber}"
  board:
    backgroundColor: "{colors.panel-2}"
    rounded: "{rounded.r}"
    padding: "clamp(20px, 3vw, 44px)"
  plate:
    backgroundColor: "{colors.panel-3}"
    rounded: "{rounded.r}"
  fact-value:
    textColor: "{colors.red}"
    typography: "{typography.figure}"
  unlit-value:
    textColor: "{colors.muted}"
    typography: "{typography.unlit}"
  stack-tag:
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.r}"
    padding: "3px 8px"
---

# Design System: Amir Alhatemi Portfolio

## Overview

**Creative North Star: "The Lit Board"**

The site is a working LED information board, the kind that hangs in Saudi mosques, schools and office lobbies: a black-green acrylic face, a visible grid of unlit dots, a thin aluminium frame, and dot-matrix lettering that lights up to say something. Projects are the board's rows, each with an honest status light, and the real application screens light up on a screen beside the board. Whatever the board displays (names, headlines, figures, dates, the ticker) is set in the LED face; whatever is read or operated is set in a calm sans that carries Arabic and Latin as one family.

The two themes are the same object in two lights. Lit, the default, is the board switched on at night. Print is the board printed as a timetable card in daylight: white stock, darkened inks and a pale halftone dot. Visitors choose Auto, Print or Lit (تلقائي / مطبوع / مضاء); Auto follows the device.

Density is that of a departures board: tight rows, small muted labels and large lit values, with generous space between boards. Colour is rationed to three LED inks with fixed jobs, and only one amber plate is ever inverted on a screen. English and Arabic are full peers with native right-to-left layout. Motion is the board relighting through its own dot grid, and it stands down completely under reduced motion.

**Key Characteristics:**
- Dot-field surfaces inside thin frame rings; nothing casts a blurred shadow.
- Three LED inks with fixed jobs: amber acts, green is live or public, red carries figures.
- Lit (560) and unlit (260) static Handjet instances for display; Readex Pro for reading.
- 2px corners on every rectangle; circles only for LED dots.
- Status drawn by pattern on one five-stage lifecycle, always with words, colour only reinforcing.
- Relight motion on a shared 6px dot pitch, with full reduced-motion fallbacks.

## Colors

Near-black acrylic neutrals carry the board; three saturated LED inks, each with one job, are the only colour outside the real captures.

Each Lit value has a Print counterpart under the same name with a `print-` prefix in the frontmatter. The CSS exposes one set of custom properties (`--amber`, `--panel-2` and so on) and redeclares them per theme, so components never reference a theme directly.

### Primary
- **Signal Amber** (#ffb547 Lit / #a35200 Print): The interactive ink. Filled and outlined actions, text actions, link hover, the current-page bar, pressed filters, selected view keys, the pressed theme option, linked lab names, the email route, focus outlines and text selection. Its strongest form is the single inverted plate.
- **Plate Ink** (#1a1206 Lit / #fffaf1 Print): Text and pips sitting on amber: the lit row, filled actions, the skip link, selected text.
- **Amber Wash** (#ffb54726 Lit, 15% / #a3520014 Print, 8%): The tint behind selected view keys, the pressed theme option, outline-action hover and resting-row hover.

### Secondary
- **Live Green** (#63d68f Lit / #0e6b3a Print): Only for what is live or publicly available: the status label and all five pips of a live project, and the filled public-access glyph with its label.

### Tertiary
- **Figure Red** (#ff6a5c Lit / #b42318 Print): Numbers and news. Verified figures in fact rows, the "Statuses as of" date, ticker lines and the 404 numeral.

### Neutral
- **Acrylic Black** (#0a0e0c Lit / Card Stock #f5f6f2 Print): Page background; the masthead at 94% over content and the board foot at 72%.
- **Board Face** (#101613 / #fbfbf8): The face under the dot field on boards, wall cards, the next-project link, tool tiles, filter channels and control trays.
- **Bezel Band** (#161d19 / #eceee9): The band inside the board bezel; the face of plates and flow cells.
- **Aluminium Frame** (#2c3430 / #c7cdc7): Every frame line: bezel rings, plate and chip borders, caption strips, the board-foot rule.
- **Rule Line** (#232b27 / #dde1db): Hairline dividers under column heads, between fact rows, cells, lab items and contact routes; masthead and footer edges.
- **Unlit Dot** (#19201c Lit / Halftone Dot #e2e6e0 Print): The dot grid texture and nothing else.
- **Lamp White** (#e8ece7 Lit / Card Black #121614 Print): Primary text, lit row names, the current lifecycle stage.
- **Dim Ink** (#a3ada6 / #4c5750): Labels, captions, intros, case-story prose, completed lifecycle stages and unlit (unconfirmed) values.
- **Dead Pixel** (#6f7a73 / #6a756e): Ring strokes of unlit pips and lifecycle nodes. Never text.

### Named Rules
**The Three Inks Rule.** Amber means you can act; green means live or public; red carries figures, dates and the ticker. An ink never borrows another's job, none is used as decoration, and product colours appear only inside real captures.

**The One Plate Rule.** A screen has at most one inverted amber plate. Where a board is present it is the lit row, and the action beside the board is outlined; a filled amber action appears only on screens with no lit row (a case study's project-site action, the 404 return action).

**The Unlit Rule.** An unconfirmed fact is shown, never hidden or guessed: it is set in unlit LED (weight 260, Dim Ink) and says "to be confirmed". A lit value is a verified value.

## Typography

**Display Font:** Handjet LED (with size-adjusted Arial and Roboto fallbacks)
**Body Font:** Readex Pro Variable (with Segoe UI, Tahoma, sans-serif)

**Character:** A dot-matrix display face that draws Arabic and Latin on the same lamp grid, set against a rounded, low-contrast sans whose two scripts share one family. The LED face displays; Readex Pro explains.

Handjet LED is not the variable Handjet: it is two static files per script frozen at round dots (element shape 8, element grid 1), lit at 560 and unlit at 260. Fallbacks are metric-matched (Arial at 74% for Latin and 98% for Arabic, Roboto at 81%) so the font swap does not reflow lines. Only the lit files are preloaded.

### Hierarchy
- **Display** (560, clamp(56px, 8vw, 112px), 0.95): Page headings. Case titles use clamp(50px, 6.6vw, 100px), the contact title clamp(44px, 6.2vw, 92px), and the 404 numeral clamp(120px, 22vw, 280px) at 0.8 in Figure Red.
- **Board** (560, clamp(40px, 4.4vw, 62px), 0.95): The home board's two-line headline.
- **Headline** (560, clamp(36px, 4.2vw, 56px), 0.95): Section titles. Case-story headings use clamp(32px, 3vw, 42px); principle headings clamp(26px, 2.6vw, 34px).
- **Title** (560, clamp(24px, 2.3vw, 31px), 0.95): Board row names. Fixed LED titles step down from screen names (28px) through lab names, cell values and the footer name (26px), the brand (25px), wall names (24px), flow names (23px) and view letters (22px) to ticker lines (20px).
- **Figure** (560, clamp(30px, 3vw, 42px), tabular numerals): Verified values in fact rows, in Figure Red. The as-of date is 21px.
- **Unlit** (260, 26px, Dim Ink): Unconfirmed values and placeholders: role, personal story, portrait, email (24px in the contact list).
- **Body** (Readex 350, 17px, 1.65): Reading text, paragraphs capped at 68ch with pretty wrapping. Leads use clamp(18px, 1.9vw, 21px). Arabic body is 17.5px at 1.9.
- **Label** (Readex 500, 15px, 1.2): Actions, text actions and nav (14px nav on phones); filter channels and view keys at 14px.
- **Caption** (Readex 350, 13px, 1.45, Dim Ink): Row categories and statuses, figure captions and flow details; column heads, screen notes and cell labels at 12.5px; lifecycle labels at 12px (11px on phones).

Readex headings use 500 at 1.15 with balanced wrapping; strong text is 550.

### Named Rules
**The Two Weights Rule.** Handjet ships only as lit (560) and unlit (260) static files. Never ask the LED face for another weight, and never load the variable Handjet: its dot contours are too slow to interpolate on phones.

**The Display/Read Rule.** Handjet LED is for what the board displays: names, headlines, figures, dates, ticker lines, the brand lockup and tool names. Readex Pro is for anything read in sentences and for control labels (actions, nav, filters, the language switch).

**The Native Script Rule.** Arabic LED gets its own sizes, 10 to 20% below the Latin ones (board headline clamp(36px, 3.9vw, 54px), section titles clamp(32px, 3.6vw, 48px), row names clamp(22px, 2.1vw, 28px)), with letter-spacing 0 and line-height 1.15. Latin names inside Arabic lines are isolated left-to-right and kept unbroken. The English name in the lockup is set in capitals.

## Layout

Content sits in one container, min(1320px, 100% minus two gutters), with a fluid gutter of clamp(16px, 4vw, 48px). Rhythm comes from the s-scale in the frontmatter: 16px and 24px inside boards, 32px and 48px between blocks, 112px between home sections (72px on phones). Micro spacing inside rows, chips and trays uses literal 3 to 14px values.

Boards use asymmetric two-column grids: the home board 7/5 (rows, then screen), the case board 6/5, the lab 4/8, the about teaser 4/7, the case body 4/8 with a sticky figures aside (90px from the top), principles 5/7. Only the contact board splits evenly. The screen wall is a 12-column grid where desktop captures span 6 and phone captures span 3. Sections below the board skip layout until they approach the viewport (content-visibility: auto).

The masthead is sticky and one row of at least 60px: lockup, nav pushed to the inline end, then the language and theme switches.

Responsive behaviour, by max-width:
- **1080px:** the board headline becomes clamp(40px, 5.4vw, 60px); the case board and lab go single-column.
- **900px:** the board stacks as headline, filters, screen, column heads, rows, foot, so the screen sits above the rows (the projects index hides the screen). Case body, about, contact and principles go single-column.
- **760px (cited adaptation):** the masthead becomes two rows, about 96px: lockup with the language switch, then nav with the theme switch. It stops being sticky. The wall becomes two columns (desktop captures span both), the lab one column, contact routes drop their kind label, the next-project link reflows.
- **420px:** board rows repack to name, category, status stacked; the screen's case-study action drops below its caption.

**The Repack Rule.** Narrow screens repack rows and grids instead of shrinking type: LED sizes stay fluid while rows restack.

**The Logical Rule.** Layout uses logical properties and inline-start/end throughout. Both languages keep the same order, and directional icons mirror under right-to-left.

## Elevation & Depth

Flat. Nothing in the system casts a blurred shadow. Depth is built the way a real board is built: a dot field on a face, inside a frame. Major boards carry a three-ring bezel drawn with zero-blur box-shadow spreads; plates and cards carry a 1px frame border; hairline rules separate rows. The only overlap is a phone capture sitting over a desktop capture on the board screen and the case hero.

### Shadow Vocabulary
- **Board bezel** (`box-shadow: 0 0 0 1px var(--frame), 0 0 0 6px var(--panel-3), 0 0 0 7px var(--frame)`): The home and projects board, case board, contact board, "Where it stands" board and error board. It sits outside the box and does not affect layout.
- **Outline ring** (`box-shadow: inset 0 0 0 1px var(--amber)`): The outline action.
- **Unlit ring** (`box-shadow: inset 0 0 0 1px var(--faint)`): Unlit pips; lifecycle rail nodes use the same ring at 1.5px. A paused current stage becomes a Lamp White ring, 1.5px on pips and 2px on the rail.
- **Current-stage halo** (`box-shadow: 0 0 0 3px color-mix(in srgb, var(--ink) 18%, transparent)`): The current node on the lifecycle rail.

### Named Rules
**The Frame Ring Rule.** Every box-shadow is a ring with zero offset and zero blur. If something needs to stand forward, frame it; do not float it.

**The Dot Field Rule.** Board-like surfaces carry the dot grid token: Unlit Dot lamps of 1.15px radius, softening to 1.65px, on a 6px pitch, laid over Board Face or Bezel Band. Prose areas, the masthead and the footer stay plain.

## Shapes

Rectangles everywhere, with 2px corners: boards, plates, actions, chips, rows, trays, focus outlines and the skip link. Anything nested inside a 2px container steps down to 1px (view keys, theme options, phone screenshots inside plates, the portrait image). Circles are reserved for LED dots: access glyphs (12px), lifecycle pips (6px), rail nodes (9px) and story bullets (7px). Frames are 1px solid Aluminium Frame; a dashed 1px frame marks notes and placeholders (case notes, the pending portrait). Flow connectors are 1px drawn lines.

**The Two Pixel Rule.** Corners are 2px, or 1px when nested. Nothing is a pill, and nothing is round unless it is a dot.

## Components

### Buttons
Compact rectangular controls, lit like lamps, each ending in an inline SVG arrow.
- **Shape:** sharp 2px corners, at least 44px tall, 10px 16px padding, 10px icon gap, Readex 15px at 500, no wrapping.
- **Filled action:** Signal Amber with Plate Ink text; hover mixes 16% Lamp White (Card Black in Print) into the amber. Only on screens with no lit row.
- **Outline action:** transparent with a 1px inset amber ring and amber text; hover fills Amber Wash. Used beside the board ("Explore the case study").
- **Text action:** the default secondary route. Amber 15px at 500, underlined at 45% amber, 44px tall, with an arrow.
- **Hover / Focus:** press feedback is scale(.97) over 160ms ease-out (theme options .96, ticker toggle .95). Every focusable element shows a 2px amber outline at 3px offset with 2px corners.

### Chips
- **Filter channels** (projects page): 40px tall, 6px 14px, 1px frame border on Board Face, Dim Ink 14px. Pressed turns text and border amber; hover lifts text to Lamp White. A polite live region announces the result count.
- **Stack tags:** passive 1px-frame rectangles, 3px 8px, 13px Lamp White, isolated left-to-right.
- **Tool tiles** (About): LED names at 22px in 1px-frame dot-field tiles, 10px 14px.

### Cards / Containers
- **Corner Style:** 2px.
- **Boards:** dot field over Board Face with the board bezel; padding clamp(20px, 3vw, 44px) on the home board, clamp(22px, 4vw, 52px) on the case board, clamp(24px, 5vw, 64px) on the contact board.
- **Plates:** a real capture on the dot field over Bezel Band, in a 1px frame; phone plates pad 5px around a 1px-cornered screenshot. Images stay transparent until decoded, then fade in over 280ms (2.5s fallback), so a slow capture shows the unlit grid instead of an empty box.
- **Wall cards:** whole-card links with a dot-field picture area clamp(280px, 30vw, 430px) tall, the image outlined in 1px frame, and a caption strip holding an LED name (24px) over a 12.5px note. Hover turns the border and name amber.
- **Flow cells:** Bezel Band cells in a 1px frame, LED name (23px) over a 13px detail, joined by 1px Dim Ink connectors. A compact vertical variant stands in on the screen when a project has no captures.
- **Next-project link:** a dot-field panel holding a kind label, an LED name clamp(30px, 4vw, 52px), the status pips and an arrow. Hover lights its frame and name in amber; it never becomes a second plate.
- **Shadow Strategy:** frame rings only (see Elevation & Depth).

### Navigation
- **Masthead:** sticky, 94% Acrylic Black over content, Rule Line bottom edge. The bilingual lockup is LED: the page language's name at 25px in Lamp White, the other script at 22px in Dim Ink; hover turns both amber.
- **Nav links:** Readex 15px Dim Ink, 44px tall. The current page is Lamp White with a 2px amber bar 6px above the bottom edge.
- **Language switch:** the full name of the other language (العربية / English) in Readex 15px Lamp White, set in its own language and direction, 44px tall. Following it relights the page.
- **Theme switch:** a 1px-framed tray of three options, Auto, Print and Lit, at 13px; the pressed option is amber on Amber Wash. Hidden without JavaScript.
- **Footer:** Rule Line top edge, LED name at 26px, a 13px Dim Ink line, and 14px links with 44px targets.

### The Board (signature)
Projects are rows on one framed board, with a screen beside it.
- **Column heads:** 12.5px Dim Ink over a Rule Line.
- **Rows:** whole-row links with 2px corners and 5px 14px padding (9px 10px when stacked): the LED name, a 13px category beneath, and the status (pips and a label) at the inline end. The lit row is the screen's amber plate, with Plate Ink text and pips. Mouse hover or keyboard focus lights a row and switches the screen; on touch, a tap opens the case study.
- **Screen:** the lit row's real captures, a phone capture overlapping the desktop one at the inline-end corner (34%, at most 176px), and a caption with the LED name (28px), a 12.5px note and the outline action. A project without captures shows its compact flow instead.
- **Foot:** "Statuses as of" with the date in Figure Red LED, the ticker of red LED lines crawling in reading direction, and a 40px amber pause/play toggle, on 72% Acrylic Black under a frame rule.

### Status Glyphs and the Lifecycle (signature)
Every project sits on one fixed lifecycle: Concept, Building, Pilot or alpha, Launch prep, Live.
- **Pips** (6px dots, 3px gap): earlier stages filled Dim Ink, the current stage filled Lamp White, later stages an unlit Dead Pixel ring. A live project fills all five in Live Green. A paused project shows its current stage as an empty ring. A visually hidden sentence names the stage.
- **Lifecycle rail** (case pages): five 9px nodes on a hairline with 12px labels. The current node is Lamp White with a 3px halo and a 500-weight label; a paused current node is a 2px ring.
- **Access glyphs** (12px): a filled circle is publicly available (Live Green, label green); a ring with its right half filled is limited access (Lamp White glyph, Dim Ink label); an empty ring is a private build (Dim Ink). Always paired with a visible or visually hidden label.

**The Pattern First Rule.** Every status reads from shape alone (filled, half or ring; lit, unlit or ringed pip) and always comes with words. Colour only reinforces.

### Facts and Unlit Values
Board grammar: a Dim Ink label column and a lit value column on Rule Line hairlines with 11px vertical padding. Values are verified figures in Figure Red tabular LED. Text facts (languages, city) switch to Readex 16px Lamp White, end-aligned. Unconfirmed values take the unlit style.

### Lettered Views and Strips
- **Lettered views:** a framed tab tray of keys (40px, 14px Dim Ink; selected is amber on Amber Wash), each led by an LED letter (A, B, C at 22px). Arrow keys move in reading direction; Home and End jump. Each panel holds the same real screen in another language, theme or identity.
- **Phone strip:** a horizontal scroll-snap row of phone plates (clamp(200px, 21vw, 256px) wide, 22px gap) in a focusable region, with captions.

### Relight Motion
All motion eases out on cubic-bezier(.23, 1, .32, 1) and happens through the board's own 6px dot pitch.
- **Row relight:** the incoming screen is masked by a 6px dot grid whose lamp radius grows from 0.4px to 4.6px over 240ms.
- **Language relight:** when the /en/ or /ar/ prefix changes, a cross-document view transition of type "relight" dims the old page (180ms) and lights the new one over 560ms: the dots reach 1.9px by 30% and then fill, while a solid wipe sweeps in the new page's reading direction (left to right in English, right to left in Arabic). Other navigations cross-fade in 160ms. No element carries its own view-transition name.
- **Ticker:** a 70s linear crawl in reading direction over two copies (the second hidden from assistive technology), paused on hover, on focus inside the board foot, or by the toggle.
- **Wall relight:** where scroll-driven animation is supported, wall captures light through the dot mask between entry 0% and cover 28%.
- **Controls:** 160ms colour and transform transitions; wall-card borders 200ms.
- **Reduced motion:** no view transitions; animations and transitions clamp to 1ms; the ticker stops, drops its edge fade, wraps into a static list and hides its toggle; row relight and ambient video stay off.

**The Relight Rule.** Content never slides, bounces or scales into place. It lights, through the dot mask on the 6px pitch or by fading in once decoded. The ticker is the only continuous movement, and it can always be paused.

## Do's and Don'ts

### Do:
- **Do** build new surfaces from the board kit: the dot field over Board Face inside the board bezel for major panels, a 1px Aluminium Frame for plates and cards.
- **Do** keep Signal Amber for things that respond to input, including the 2px focus outline at 3px offset and text selection.
- **Do** keep one inverted amber plate per screen: outline actions beside a board, filled actions only where no row is lit.
- **Do** show every status with pips or glyph pattern plus words, on the five-stage lifecycle.
- **Do** set unconfirmed facts in unlit LED (260, Dim Ink) with "to be confirmed".
- **Do** use only the lit (560) and unlit (260) Handjet instances for display, and Readex Pro for prose and control labels.
- **Do** give Arabic LED its own smaller sizes with letter-spacing 0 and line-height 1.15, and isolate Latin runs left-to-right.
- **Do** keep 44px targets for actions, text actions, nav, the language switch and footer links, and at least 40px for in-board controls.
- **Do** mount only real captures or source-project assets on plates, with honest captions.
- **Do** ship a reduced-motion fallback with any new relight or crawl.

### Don't:
- **Don't** add soft, offset or blurred shadows; frames are zero-blur rings and 1px borders.
- **Don't** introduce a fourth ink or decorative colour gradients, or let amber, green and red stand in for one another.
- **Don't** light a value that is not verified, or fill an unknown with a placeholder figure.
- **Don't** round rectangles beyond 2px or make pills; circles are for dots only.
- **Don't** set paragraphs or control labels in the LED face, or request Handjet weights other than 560 and 260.
- **Don't** shrink type to fit narrow screens; repack rows and grids instead.
- **Don't** use AI-generated, rendered or invented imagery.
- **Don't** move content into place with slides, bounces or scale-ins.
