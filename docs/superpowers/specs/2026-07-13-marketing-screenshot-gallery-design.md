# Marketing Screenshot Gallery — Design

## Purpose
Produce a set of phone-framed screenshots of every key screen in The Scramble Cook PWA, assembled into a single HTML gallery page, for use on the marketing website.

## Scope
8 screens, captured in light mode only (app is single-theme), at a mobile viewport (390×844):

1. This Week (`/`) — populated week plan, includes WeekSetup bar inline
2. Shopping List (`/shopping`) — populated
3. Recipes (`/recipes`) — browse grid
4. History (`/history`) — past weeks
5. Recipe Detail — opened via RecipeCard click on `/recipes`, renders as BottomSheet over the grid
6. Swap Picker — opened via a DayCard "swap" control on `/`, own fixed panel (not BottomSheet)
7. Import Recipe — opened via "+ Import" button on `/recipes`, renders as BottomSheet
8. (Week Setup is not a separate screen — it's always inline on `/`, so it's captured as part of screen 1)

## Data setup
Use the existing dev household `casa cardollo`. Bypass the HouseholdGate UI by pre-seeding `localStorage['scramble-cook-household']` with the resolved household record before navigating (per `src/lib/household.js`), rather than typing the code through the form each run — deterministic and faster for repeated captures.

## Capture mechanics
- Drive the local Vite dev server (`npm run dev`) with Playwright.
- Viewport: 390×844 (iPhone 14-ish), no device scale beyond 1x for consistent output size.
- For BottomSheet-based overlays (Recipe Detail, Import Recipe): wait ~350ms after the trigger click for the slide-in transition (`translate-y-full` → `translate-y-0`) before capturing.
- For SwapPicker: wait for its own panel to render (no shared BottomSheet class), verify visually before locking the wait condition.
- Screenshot each target element/page as a full-viewport PNG, saved to `marketing/screens/*.png`.

## Gallery page
- Single static `marketing/screens/gallery.html`, no build step, inline CSS only.
- Visual style pulled from the app's actual tokens (`src/index.css` `@theme`):
  - Background: `#f5f2ec` (cream-50)
  - Primary accent: `#6b2d7a` (terra-400, matches manifest `theme_color`)
  - Secondary accent: `#e8401a` (tomato-400)
  - Fonts: "Plus Jakarta Sans" (body), "Playfair Display" (display/headings) — loaded from Google Fonts via `<link>` since the artifact/static file needs to be self-contained-ish; system-font fallback if offline.
  - Rounded corners: 20–24px (matches app's `--radius-2xl`/`--radius-3xl`)
- Layout: responsive grid of phone-framed screenshots (simple CSS bezel: rounded rect, notch cutout, shadow), each labeled with the screen name, laid out in a row/grid that reflows on smaller viewports.
- Page title: "The Scramble Cook — App Preview" or similar.

## Delivery
1. First publish `gallery.html` as a Claude Artifact for review (uses placeholder or actual captured screenshots inlined as data URIs so it's self-contained and shareable).
2. Once approved, save final files into the repo at `marketing/screens/` (`gallery.html` + individual `*.png` files) for the user to copy into their website.

## Out of scope
- Dark mode (app doesn't have one).
- Automated CI/regeneration — this is a one-off manual capture.
- Non-phone (desktop/tablet) framing.
