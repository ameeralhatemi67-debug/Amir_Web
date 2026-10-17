---
name: Amir Alhatemi Portfolio
description: Restrained bilingual editorial system for real application work.
colors:
  paper: "#f8faf8"
  ink: "#19342c"
  muted: "#52665b"
  surface: "#eaf0eb"
  surface-soft: "#f0f4f0"
  line: "#cad5cd"
  warm: "#99502d"
  cool: "#24666d"
  dark-paper: "#11231d"
  dark-ink: "#edf3ec"
  dark-muted: "#b3c4b8"
  dark-surface: "#1c3429"
  dark-surface-soft: "#172b23"
  dark-line: "#3b5547"
  dark-warm: "#e9b28e"
  dark-cool: "#92ced0"
typography:
  display:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "clamp(2.4rem, 4.7vw, 3.65rem)"
    fontWeight: 550
    lineHeight: 1.18
    letterSpacing: "-.035em"
  headline:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-.03em"
  title:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-.03em"
  body:
    fontFamily: "'Source Sans 3 Variable', sans-serif"
    fontSize: "18px"
    lineHeight: 1.7
  label:
    fontFamily: "'Source Sans 3 Variable', sans-serif"
    fontSize: "15px"
    fontWeight: 600
  arabic-body:
    fontFamily: "'IBM Plex Sans Arabic', sans-serif"
    fontSize: "18px"
    lineHeight: 1.95
    letterSpacing: "0"
rounded:
  surface: "12px"
  action: "8px"
  control: "6px"
  image: "7px"
  thumbnail-image: "5px"
spacing:
  s: "12px"
  m: "24px"
  l: "48px"
  xl: "88px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.action}"
    padding: "11px 19px"
  button-primary-hover:
    backgroundColor: "{colors.cool}"
    textColor: "{colors.paper}"
  filter:
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  filter-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  tool-tag:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "8px 15px"
  contact-band:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.surface}"
    padding: "40px"
---

# Design System: Amir Alhatemi Portfolio

## Overview

**Creative North Star: "The Software Contact Sheet"**

A quiet editorial frame gives real application work room to speak. Mineral-white paper, deep green ink, readable typography and uneven image groupings give the portfolio a precise, personal character. Application colors remain visible inside authentic screenshots rather than becoming a competing site palette.

The system supports English and Arabic as full peers, including native direction, generous Arabic leading and mirrored directional icons. Density comes from concise labels and supporting facts around images, with generous space between larger sections.

**Key Characteristics:**
- Real application imagery with honest captions.
- Mineral-white and deep-green editorial framing.
- Restrained variable typography and native Arabic.
- Flat surfaces, soft screenshot depth and uneven grids.
- Visible keyboard states and optional, minimal motion.

## Colors

A green-tinted neutral family carries most of the interface; warm and cool accents identify interaction and status.

### Primary

- **Deep Green Ink / Light Ink:** Primary text, headings, filled actions and selected filters. The dark theme reverses the value relationship.
- **Cool Teal:** Link hover, status text, selection and keyboard outlines.
- **Warm Clay:** Active navigation underline and the error-page number.

### Neutral

- **Mineral Paper:** Page canvas and the contrasting text inside filled actions.
- **Quiet Green Surface:** Contact panels, controls, screenshot frames and small information containers.
- **Soft Green Surface:** Declared supporting surface token; no distinct recurring component assignment is established.
- **Muted Green:** Supporting descriptions, metadata and captions.
- **Green Divider:** Separators, footer boundaries and quiet link underlines.

All normative values, including dark counterparts, are in the frontmatter. Theme selection follows system preference unless the visitor selects light or dark. Screenshot-specific background tints are local art direction, not additional global accents.

**The Image Color Rule.** Keep the site's framing restrained so each real application's own colors remain legible.

## Typography

**Display Font:** Manrope Variable, with sans-serif fallback.

**Body Font:** Source Sans 3 Variable, with sans-serif fallback.
**Arabic Font:** IBM Plex Sans Arabic replaces both families for Arabic.

**Character:** Compact, lightly tightened headings sit above open body copy. Arabic uses untracked text and taller line boxes.

### Hierarchy

- **Display:** The frontmatter records the actual introduction heading. On phones it becomes (35px, line-height 1.23), then (32px) below the narrowest breakpoint.
- **Headline:** The base second-level heading is the frontmatter headline role. Contextual section headings range from (20px) for principles to (32px) for prominent project and contact titles.
- **Title:** The base third-level heading uses the frontmatter title role; gallery titles use (25px) on desktop and (24px) on phones.
- **Body:** Paragraphs use the frontmatter body role, limited to (70ch); mobile base text is (17px). Supporting project descriptions use (17px) desktop and (16px) mobile.
- **Label:** Action text uses the frontmatter label role. Navigation uses (15px), metadata (12–14px), and image captions (12px, line-height 1.65), with smaller phone treatments.
- **Arabic:** Body leading is (1.95), headings generally use (1.5), and the mobile introduction uses (33px, line-height 1.55). Letter spacing is reset to (0).

**The Native Reading Rule.** Use the Arabic family, native RTL and Arabic leading together; preserve LTR direction for technology lists.

## Layout

The shared container is capped at (1200px), with (48px) desktop side space. At (1000px) and below, side space becomes (32px); at (700px), (20px); below (360px), (16px). Use logical dimensions, margins and padding.

The gallery uses a twelve-column grid with (32px) column gaps and (48px) row gaps. Existing pairs use unequal seven/five spans, while selected wider screenshots span all twelve columns. On phones, every project becomes a single column with a (36px) gap. Preserve screenshot proportions and readable application content rather than forcing all work into identical crops.

Supporting editorial sections use unequal two-column layouts, becoming single columns at the phone breakpoint. The recurring spacing tokens are recorded above; larger section margins use the extra-large step. Header navigation wraps beneath the name on phones, while language and theme controls remain available.

**The Reading Order Rule.** Responsive layouts retain the same content order in both languages and collapse columns rather than hiding evidence.

## Elevation & Depth

The interface is predominantly flat. Tonal panels and fine dividers separate sections; depth belongs to captured application surfaces. Screenshot shadows are soft and translucent, not structural offsets.

### Shadow Vocabulary

- **Featured screenshot:** (0 16px 40px #102c211c).
- **Gallery screenshot:** (0 10px 24px #102c2110).

**The Screenshot Depth Rule.** Reserve the existing shadow vocabulary for screenshot framing; editorial text and navigation stay flat.

## Shapes

Large panels and screenshot stages use the surface radius. Filled actions use the action radius, while filters, tags and the theme select use the control radius. Images nest within the softer surface framing with smaller image radii. Mobile screenshot stages use (10px) corners. Dividers are fine (1px) strokes; filled actions carry a transparent (1px) border.

## Components

### Buttons

Compact filled actions pair a descriptive label with an inline SVG direction icon. Use the primary component tokens, a minimum height of (47px) and an icon gap of (20px). Hover uses cool teal. On phones, use (10px 16px) padding, (45px) minimum height and (14px) text. Keyboard focus uses the shared (3px) cool outline with (5px) offset.

### Text links

Secondary actions use an underline colored with the divider token, (15px) semibold text, a (12px) icon gap and (44px) minimum height. Hover changes the text to cool teal and the underline to current color. These remain visibly lighter than filled actions.

### Filters and tags

Filters are native buttons in a wrapping group, with (8px) gaps and (42px) minimum height. The selected state uses ink fill and paper text; unselected hover uses the surface background and ink text. Selection is expressed through `aria-pressed`, with a live result count. Tool tags are passive surface-filled labels, not filter controls.

### Cards / Containers

Project items have no enclosing card border or panel around their text. A rounded screenshot stage sits above a title, short description, status, stack and provenance caption. Common screenshot stages have (24px) padding on desktop and (20px) on phones; wide assets have their own fitting treatment. The contact panel uses surface fill and the component padding recorded above, becoming (28px) on phones.

### Navigation

A typographic name anchors the masthead. Text navigation has no fill; the current page has a warm underline offset by (8px). The language switch uses the Arabic family, with explicit language and direction. The theme selector is a native surface-filled select. Focus and hover remain visible across these controls.

### Screenshot interaction

Real project images carry useful alt text and provenance captions. Supporting images load lazily; the featured image loads eagerly. With motion permitted, hover or keyboard focus within a project scales its image to (1.012) over (180ms), without changing layout. The introduction translates (8px) into place over (350ms) from an already visible state. Reduced-motion mode disables these transitions and animations.

## Do's and Don'ts

### Do:

- **Do** use actual project captures or source-project assets and identify their provenance.
- **Do** preserve readable Arabic, logical layout properties and visible keyboard focus.
- **Do** use unequal screenshot groupings where image proportions support them.
- **Do** preserve the dark-theme token relationships and reduced-motion behavior.

### Don't:

- **Don't** invent application imagery, device renders or unsupported project claims.
- **Don't** turn screenshot-specific colors into competing global site accents.
- **Don't** turn restrained image focus into parallax, hidden content or layout movement.
