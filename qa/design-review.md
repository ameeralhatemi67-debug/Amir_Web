# Lit Board redesign review

The owner chose "The Lit Board" (impeccable direction seed 3f9f8885, assigned grounded candidate) over a bilingual type-specimen pick and the classic canon, and added HAYZ, DnFOM and a lab strip. The build is code-led: no image generation, and the owner bans AI images, so every raster is a real capture listed in `public/images/work/provenance.json`.

## Finish review

An independent Impeccable finish reviewer ran from the shipped role brief as a fresh general-purpose subagent, because this harness cannot spawn the shipped agent type directly.

- **Round 1: fix.** It found eight material findings: a second amber plate beside the lit row, language relight bypassing named transition groups, status glyphs encoding access rather than lifecycle, the phone masthead, row relight on keyboard and touch, the ticker clipping under reduced motion, doubled elevation, and stale persistence files.
- **Round 2 (verdict pass): all eight resolved.** It flagged three regressions introduced by the batch: faint unlit pips, a leftover access glyph on the case status line, and "Google Play" splitting in the wrapped Arabic ticker. All three were then fixed and checked mechanically, and the same faint-ring fix was applied to the lifecycle rail. They were not re-reviewed, because the two-round review budget was spent.

The documenter then rewrote DESIGN.md and `.impeccable/design.json` from the built system. Code was aligned with five of the drifts it reported: theme button targets, next-project hover, scrollbar radius, the video frame colour token, and unused tokens. The theme-color meta now follows a manual theme choice.

## Verified locally (2026-10-20)

- `astro check`: 0 errors, 0 warnings, 0 hints. Build and static checks pass on 30 pages.
- axe audit: 112 language/theme/viewport combinations, 0 issues. Interaction checks pass.
- Mobile Lighthouse: all 26 indexable localized pages at 95 or higher in every category. Home pages score 99.
- Performance note: Handjet's variable font made text layout about eighteen times slower on a throttled phone. It ships as static instances, with metric-matched fallbacks to keep CLS low, and off-screen sections use `content-visibility: auto`.

Not verified: physical devices, screen readers, and the cross-document language relight in a visible browser. The relight was reviewed from source; headless captures cannot show it. Firefox falls back to normal navigation.
