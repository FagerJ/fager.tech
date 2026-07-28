# Handoff: fager.tech — personal site (link-in-bio + blog + dashboard)

## Overview
Personal website for **Jonathan Fager** at `fager.tech`. It combines a link-in-bio hero, a
season telemetry dashboard, a blog index, race results, a projects grid, and a "uses" list on
the homepage, plus a long-form article template. Aesthetic: 80s/90s **cyberpunk neon** glitch
on near-black — magenta/cyan/acid-green, monospace UI chrome, clean readable body copy.

Target stack (chosen by the site owner): **Astro** static site, Markdown content collections,
deployed to **Vercel**, domain `fager.tech`.

## About the Design Files
The files in this bundle are **design references created in HTML** — a prototype showing the
intended look and behavior. They are *not* production code to copy directly.

`fager.tech.dc.html` is a single-file prototype authored in a streaming-component format; treat
its markup and inline styles as the **source of truth for visual values** (colors, type,
spacing, hover states, copy), and re-implement it as an Astro project with `.astro` components,
a global stylesheet, and Markdown content. `ASTRO_PLAN.md` in this folder specifies the exact
project structure, content schemas, and build-time Strava sync to implement.

If you open the prototype in a browser, note: the top nav "Blog" link and any post title switch
to the article view; "← index" returns to the homepage. In the real site these are real routes.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and hover states are final. Recreate pixel-
accurately. The two placeholder-ish areas are *content*, not design: the telemetry numbers,
race results, projects, and "uses" entries are plausible stand-ins to be replaced with real data.

## Screens / Views

### 1. Global shell (present on every route)

**Background** — `#050508` base with two soft radial glows layered on top:
- `radial-gradient(1100px 620px at 78% -10%, rgba(255,43,209,0.16), transparent 62%)`
- `radial-gradient(900px 520px at 8% 8%, rgba(0,229,255,0.13), transparent 60%)`

**Two fixed full-viewport overlays**, `pointer-events: none`:
1. Scanlines, `z-index: 60`, `mix-blend-mode: overlay`,
   `repeating-linear-gradient(to bottom, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px)`
2. CRT vignette, `z-index: 61`,
   `radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)`

**Header** — sticky, `top: 0`, `z-index: 50`, `padding: 16px 40px`, flex space-between,
`background: rgba(5,5,8,0.82)`, `backdrop-filter: blur(14px)`,
`border-bottom: 1px solid rgba(0,229,255,0.22)`.
- Wordmark: `FAGER` in Chakra Petch 700 / 19px / `letter-spacing: 0.08em`, color `#e8e8f0`;
  `.TECH` in `#ff2bd1`. On hover it runs the RGB-split glitch animation (below).
- Nav links: JetBrains Mono 11.5px, `letter-spacing: 0.16em`, uppercase, color `#8b8ba3`,
  `padding: 9px 13px`, transparent 1px border. Hover: background `#00e5ff`, text `#050508`,
  border `#00e5ff` (hard swap, no radius).
- Items: Home · Blog · Cycling · Projects · Uses.
- Trailing CTA "Strava ↗": color `#ff2bd1`, `border: 1px solid rgba(255,43,209,0.5)`,
  `box-shadow: inset 0 0 22px rgba(255,43,209,0.14)`, `padding: 9px 15px`,
  `margin-left: 10px`. Hover: filled `#ff2bd1` with `#050508` text.
  Links to `https://www.strava.com/athletes/5854987`.

**Footer** — `border-top: 1px solid rgba(255,255,255,0.09)`, `padding: 34px 40px 46px`,
`background: rgba(0,0,0,0.4)`. Inner max-width 1180px, flex space-between, JetBrains Mono 11px,
`letter-spacing: 0.12em`, uppercase, `#5c5c74`. Left: "fager.tech — built with Astro, hosted on
Vercel". Right: Strava / Instagram / RSS links, `gap: 18px`.

**Main container** — `max-width: 1180px; margin: 0 auto; padding: 0 40px 120px`.

### 2. Homepage

**a. Hero** — `display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 56px;
align-items: center; padding: 84px 0 72px`.

Left column:
- Status pill: inline-flex, `gap: 9px`, JetBrains Mono 11px, `letter-spacing: 0.24em`,
  uppercase, color `#39ff88`, `border: 1px solid rgba(57,255,136,0.32)`, `padding: 6px 11px`,
  `margin-bottom: 26px`. Contains a 6×6px `#39ff88` square with
  `box-shadow: 0 0 10px #39ff88`, then text "Online · Sundbyberg, SE".
- H1: Chakra Petch 700, **82px**, `line-height: 0.92`, `letter-spacing: -0.02em`, uppercase,
  `margin: 0 0 22px`. Two lines: "Jonathan" in `#e8e8f0`, "Fager" in `#ff2bd1`.
  Hover: glitch animation.
- Tagline: Space Grotesk 21px, `line-height: 1.5`, `color: #b9b9cc`, `max-width: 30ch`,
  `text-wrap: pretty`. Text: "Setting PRs my son is going to have a rough time beating."
- Sub-line: JetBrains Mono 13px, `letter-spacing: 0.06em`, `color: #6f6f88`,
  `margin-bottom: 34px`. Text: `> racing to not be last in '26`
- Button row: flex, `flex-wrap: wrap`, `gap: 10px`. All buttons JetBrains Mono 12.5px,
  `letter-spacing: 0.1em`, uppercase, `padding: 13px 20px`, no radius.
  - Primary "Strava": background `#00e5ff`, text `#050508`, weight 700.
    Hover: background `#ff2bd1` + glitch animation.
  - Secondary "Instagram" and "Read the blog": `background: rgba(255,255,255,0.04)`,
    `border: 1px solid rgba(255,255,255,0.16)`, text `#e8e8f0`.
    Hover: border+text `#ff2bd1` (Instagram) / `#00e5ff` (Read the blog).
  - Links: `https://www.instagram.com/faaager/`, `/blog`.

Right column — framed portrait:
- Absolutely positioned frame at `inset: -14px`, `1px solid rgba(0,229,255,0.28)`.
- Corner brackets: 26×26px, top-left uses `border-top`/`border-left` `2px solid #ff2bd1`;
  bottom-right uses `border-bottom`/`border-right`.
- Image wrapper `overflow: hidden; background: #000`. Hover adds
  `outline: 1px solid rgba(255,43,209,0.4)`.
- `<img src="/assets/jonathan.jpg">`, full width, `filter: contrast(1.05) saturate(1.1)`.
  Hover runs the **tear** animation.
- Scan sweep: absolutely positioned strip, `height: 22%`, full width,
  `background: linear-gradient(rgba(0,229,255,0), rgba(0,229,255,0.14), rgba(255,43,209,0.1), rgba(0,229,255,0))`,
  `mix-blend-mode: screen`, `animation: fgr-sweep 7s linear infinite`.
  This is the **only** always-on motion on the site.

**b. Telemetry dashboard** — `margin-bottom: 96px`.
- Section head: flex space-between, `border-bottom: 1px solid rgba(255,255,255,0.1)`,
  `padding-bottom: 12px`, `margin-bottom: 22px`. Title `// 2026 telemetry` in JetBrains Mono
  12px, `letter-spacing: 0.26em`, uppercase, `#00e5ff`. Right meta "synced from Strava · 4h ago"
  in JetBrains Mono 11px, `#5c5c74`.
- Grid: `repeat(4, 1fr)`, `gap: 14px`.
- Card: `padding: 22px 20px 20px`,
  `background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))`,
  `border: 1px solid rgba(255,255,255,0.09)`, `overflow: hidden`.
  Hover: `border-color: rgba(0,229,255,0.55)` and
  `background: linear-gradient(180deg, rgba(0,229,255,0.09), rgba(255,43,209,0.05))`.
  - Label: JetBrains Mono 10.5px, `letter-spacing: 0.2em`, uppercase, `#7b7b95`,
    `margin-bottom: 12px`.
  - Value: Chakra Petch 700, 40px, `line-height: 1`, `#e8e8f0`; unit suffix 16px `#ff2bd1`
    with `margin-left: 4px`. Hover: glitch animation.
  - Delta: JetBrains Mono 11px, `#39ff88`, `margin-top: 10px`.
- Placeholder content (replace with real Strava data):
  Distance 2026 `6 842 km` / +18% vs 2025 · Time in saddle `241 h` / +34 h vs 2025 ·
  Elevation `58.4 k m` / best year yet · FTP `268 W` / +19 W since March.

**c. Two-column band** — `grid-template-columns: 1.5fr 1fr; gap: 44px; margin-bottom: 96px`.

*Left — latest writing:*
- Head: `// latest writing` (same section-head styling) with right link "All posts →",
  JetBrains Mono 11px, `letter-spacing: 0.14em`, uppercase, `#7b7b95`; hover `#ff2bd1`.
- Each row is an `<a>`: `grid-template-columns: 92px 1fr; gap: 22px; align-items: start;
  padding: 22px 14px 22px 6px; border-bottom: 1px solid rgba(255,255,255,0.07)`.
  Hover: `background: rgba(0,229,255,0.05)` and `padding-left: 14px` (an 8px nudge).
  - Date: JetBrains Mono 11px, `letter-spacing: 0.1em`, `#5c5c74`, `padding-top: 5px`.
  - Title: Chakra Petch 600, 23px, `line-height: 1.2`, `margin-bottom: 7px`.
  - Excerpt: 15px, `line-height: 1.55`, `#9a9ab2`, `margin-bottom: 11px`, `text-wrap: pretty`.
  - Tag chips: flex `gap: 7px`; JetBrains Mono 10px, `letter-spacing: 0.14em`, uppercase,
    `#ff2bd1`, `border: 1px solid rgba(255,43,209,0.32)`, `padding: 3px 8px`.

*Right — results, then topics:*
- Column is `flex-direction: column; gap: 34px`.
- Results head `// results`. Rows: flex, `gap: 12px`, `align-items: baseline`,
  `padding: 13px 4px`, `border-bottom: 1px solid rgba(255,255,255,0.06)`.
  Hover `background: rgba(255,43,209,0.06)`.
  - Place: Chakra Petch 700, 17px, `#39ff88`, `min-width: 34px`.
  - Race name: 14.5px, `#dcdce8`. Meta below: JetBrains Mono 10.5px,
    `letter-spacing: 0.1em`, `#5c5c74`, `margin-top: 3px`.
- Topics head `// topics`; chip row flex-wrap `gap: 8px`, `padding-top: 16px`.
  Chip: JetBrains Mono 11px, `letter-spacing: 0.12em`, uppercase, `#9a9ab2`,
  `border: 1px solid rgba(255,255,255,0.14)`, `padding: 6px 10px`.
  Hover: background `#39ff88`, text `#050508`, matching border.
  Topics: Cycling, eCycling, Training, Racing, Recipes, Guides, 3D printing, Life.

**d. Projects** — head `// projects`, `margin-bottom: 96px`. Grid `repeat(3, 1fr)`, `gap: 16px`.
Card `<a>`: flex column, `gap: 12px`, `padding: 26px 24px 28px`, `min-height: 210px`,
`background: rgba(255,255,255,0.028)`, `border: 1px solid rgba(255,255,255,0.09)`.
Hover: `border-color: #ff2bd1`, `background: rgba(255,43,209,0.06)`.
- Kind label: JetBrains Mono 10.5px, `letter-spacing: 0.2em`, uppercase; color varies per card
  (`#ff2bd1` accent, `#39ff88`, `#00e5ff`).
- Title: Chakra Petch 600, 22px, `line-height: 1.2`.
- Blurb: 14.5px, `line-height: 1.55`, `#9a9ab2`.
- Status: pushed to bottom via `margin-top: auto`; JetBrains Mono 11px,
  `letter-spacing: 0.12em`, uppercase, `#5c5c74`.
- Content: "The print bench" (Workshop / Coming soon — this is the 3D-printing placeholder),
  "fager.tech" (Tooling / Live), "Season dashboard" (Data / In progress).

**e. Uses** — head `// uses`. Grid `repeat(3, 1fr)` with `gap: 0 40px` so rows read as three
parallel definition lists. Each row: flex space-between, `align-items: baseline`,
`padding: 14px 0`, `border-bottom: 1px dashed rgba(255,255,255,0.11)`;
hover `border-bottom-color: #00e5ff`.
- Slot label: JetBrains Mono 10.5px, `letter-spacing: 0.16em`, uppercase, `#6f6f88`.
- Item: 14.5px, `#dcdce8`, right-aligned.
- Entries: Race bike / Trainer / Power / Head unit / Indoor / Printer / Editor / Stack /
  Analysis — all placeholder, confirm with owner.

### 3. Article page

- Breadcrumb row `padding: 56px 0 0`: "← index", JetBrains Mono 11px,
  `letter-spacing: 0.18em`, uppercase, `#6f6f88`; hover `#ff2bd1`.
- Article column: `max-width: 720px; margin: 0 auto`.
- Header: `padding: 44px 0 38px`, `border-bottom: 1px solid rgba(255,255,255,0.1)`,
  `margin-bottom: 44px`.
  - Tag chips (same style as the post-list chips), `margin-bottom: 20px`.
  - H1: Chakra Petch 700, **52px**, `line-height: 1.03`, `letter-spacing: -0.015em`,
    `text-wrap: balance`. Hover: glitch animation.
  - Meta row: flex, `gap: 18px`, JetBrains Mono 11.5px, `letter-spacing: 0.1em`, `#6f6f88`;
    date · read time · author, separated by `/` glyphs in `#2e2e3d`.
- Body: base 18.5px, `line-height: 1.72`, `color: #cfcfdd`, paragraphs `margin-bottom: 26px`.
  - **Lede** first paragraph: 21px, `line-height: 1.6`, `#e8e8f0`.
  - H2: Chakra Petch 700, 30px, `line-height: 1.15`, `letter-spacing: -0.01em`, `#e8e8f0`,
    `margin: 46px 0 18px`.
  - Blockquote: `margin: 34px 0`, `padding: 20px 26px`, `border-left: 2px solid #ff2bd1`,
    `background: linear-gradient(90deg, rgba(255,43,209,0.07), transparent)`,
    Chakra Petch 21px, `line-height: 1.45`, `#f2f2f8`.
  - Lists: `padding-left: 22px`, items `margin-bottom: 11px`; `<strong>` in `#e8e8f0`.
  - Inline links: `#00e5ff`, no underline; hover `#ff2bd1`.
- Footer: `margin-top: 56px`, `padding-top: 30px`,
  `border-top: 1px solid rgba(255,255,255,0.1)`, flex space-between.
  Left: "Ride data on Strava". Right: "Next post →" button —
  JetBrains Mono 11.5px, `letter-spacing: 0.14em`, uppercase, `#00e5ff`,
  `border: 1px solid rgba(0,229,255,0.4)`, `padding: 11px 16px`;
  hover filled `#00e5ff` with `#050508` text.

## Interactions & Behavior

**Motion policy: hover/interaction only.** The single ambient exception is the 7s scan sweep
over the portrait. No entrance animations, no parallax, no autoplaying glitch.

Three keyframe sets (copy verbatim into the global stylesheet):

```css
@keyframes fgr-split {
  0%   { text-shadow: 0 0 0 transparent; transform: translate(0,0); }
  20%  { text-shadow: -3px 0 0 #ff2bd1, 3px 0 0 #00e5ff; transform: translate(1px,-1px); }
  40%  { text-shadow: 2px 0 0 #ff2bd1, -2px 0 0 #39ff88; transform: translate(-1px,1px); }
  60%  { text-shadow: -2px 0 0 #00e5ff, 2px 0 0 #ff2bd1; transform: translate(1px,0); }
  100% { text-shadow: -1px 0 0 #ff2bd1, 1px 0 0 #00e5ff; transform: translate(0,0); }
}
@keyframes fgr-tear {
  0%   { clip-path: inset(0 0 0 0);      transform: translateX(0); }
  15%  { clip-path: inset(12% 0 74% 0);  transform: translateX(-6px); }
  30%  { clip-path: inset(0 0 0 0);      transform: translateX(0); }
  45%  { clip-path: inset(58% 0 30% 0);  transform: translateX(7px); }
  60%  { clip-path: inset(0 0 0 0);      transform: translateX(0); }
  75%  { clip-path: inset(80% 0 8% 0);   transform: translateX(-4px); }
  100% { clip-path: inset(0 0 0 0);      transform: translateX(0); }
}
@keyframes fgr-sweep {
  0%   { transform: translateY(-120%); }
  100% { transform: translateY(320%); }
}
```

Usage:
- `animation: fgr-split <duration> steps(3|4) 1` on hover — wordmark 340ms, hero H1 420ms/steps(4),
  primary button 300ms, stat value 300ms, article H1 380ms. The `steps()` timing is what makes it
  read as digital tearing rather than a smooth blur; do not replace with `ease`.
- `animation: fgr-tear 520ms steps(2) 1` on the portrait image hover.
- `animation: fgr-sweep 7s linear infinite` on the portrait sweep strip.

All other hover states are **instant** hard swaps (no transition) — deliberate, it reads as a
terminal. Don't add `transition: all`.

**Reduced motion — required:**
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

**Navigation flows** (prototype uses view state; implement as real routes):
- Wordmark, "Home" → `/`
- "Blog", any post row, "All posts →" → `/blog` (index) and `/blog/<slug>` (post)
- "Cycling" → `/cycling` · "Projects" → `/projects` · "Uses" → `/uses`
- Topic chip → `/tags/<slug>` · "← index" → `/blog`
- Strava / Instagram → external, new tab.

**Responsive** (not designed in the prototype — implement to these rules):
- ≤1024px: hero → single column, portrait first at max 420px wide; telemetry grid → 2 cols;
  the 1.5fr/1fr band → single column; projects → 2 cols; uses → 2 cols.
- ≤680px: hero H1 → 48px, article H1 → 34px, body 17px; all grids single column;
  header nav collapses to a hamburger or a horizontally scrollable mono row (owner's call —
  the scrollable row is more in keeping with the aesthetic); container padding → 20px.
- Keep the scanline overlay at all sizes; consider dropping the vignette below 680px.

**Accessibility notes:** `#6f6f88` and `#5c5c74` on `#050508` are below AA for small text — they
are used only for meta/labels; do not use them for body copy. Focus rings must be visible: use
`outline: 2px solid #00e5ff; outline-offset: 2px` on `:focus-visible` (the prototype omits this;
add it). Glitch text-shadow must never be the sole indicator of an interactive state — every
glitching element also changes color or background.

## State Management
The site is fully static; no client state is required beyond:
- Mobile nav open/closed (if a hamburger is used).
- Nothing else — telemetry, results, and post lists are resolved at build time.

Data fetching happens **at build time only** (Strava → JSON, see `ASTRO_PLAN.md`). No runtime
API calls, no client-side JS on article pages.

## Design Tokens

Colors:
| Token | Value | Use |
|---|---|---|
| `--bg` | `#050508` | Page background, inverted text on neon fills |
| `--panel` | `rgba(255,255,255,0.028)` | Project card fill |
| `--panel-grad` | `linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))` | Stat card fill |
| `--text` | `#e8e8f0` | Headings, primary text |
| `--text-strong` | `#f2f2f8` | Blockquote |
| `--body` | `#cfcfdd` | Article body |
| `--body-dim` | `#dcdce8` | List item values |
| `--muted` | `#b9b9cc` | Tagline |
| `--muted-2` | `#9a9ab2` | Excerpts, blurbs |
| `--label` | `#8b8ba3` / `#7b7b95` | Nav idle, stat labels |
| `--meta` | `#6f6f88` | Meta text, uses labels |
| `--meta-dim` | `#5c5c74` | Timestamps, status |
| `--rule-dim` | `#2e2e3d` | Meta separators |
| `--magenta` | `#ff2bd1` | Primary accent |
| `--cyan` | `#00e5ff` | Secondary accent, links |
| `--green` | `#39ff88` | Live/positive/results |

Borders & rules: `1px solid rgba(255,255,255,0.09)` (cards) · `rgba(255,255,255,0.1)`
(section heads) · `rgba(255,255,255,0.07)` (list rows) · `rgba(255,255,255,0.06)` (result rows) ·
`1px dashed rgba(255,255,255,0.11)` (uses rows) · `rgba(0,229,255,0.22)` (header) ·
`rgba(0,229,255,0.28)` (portrait frame) · `rgba(255,43,209,0.32)` (tag chips).

**Border radius: 0 everywhere.** No rounded corners anywhere on the site.
**Shadows:** only `box-shadow: inset 0 0 22px rgba(255,43,209,0.14)` on the Strava CTA and
`0 0 10px #39ff88` on the live dot. No drop shadows.

Spacing scale (px): 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 26, 30, 34, 38, 40, 44,
46, 56, 72, 84, 96, 120. Section rhythm is `margin-bottom: 96px`; container padding `40px`.

Typography — three families, all Google Fonts:
- **Chakra Petch** 400/600/700 — display, headings, stat values, blockquote.
- **Space Grotesk** 400/500/700 — body copy, excerpts, list values. Also the `body` default.
- **JetBrains Mono** 400/500/700 — all UI chrome: nav, labels, meta, chips, buttons, footer.

Type scale: 82 (hero H1) · 52 (article H1) · 40 (stat value) · 30 (article H2) · 23 (post title) ·
22 (project title) · 21 (tagline, lede, blockquote) · 19 (wordmark) · 18.5 (body) ·
17 (result place) · 15 (excerpt) · 14.5 (blurbs, uses items) · 13 (hero sub-line) ·
12.5 (buttons) · 12 (section heads) · 11.5 (nav, article meta) · 11 (footer, most meta) ·
10.5 (small labels) · 10 (tag chips).
Mono letter-spacing runs 0.1em–0.26em by size — smaller text gets wider tracking.

## Assets
- `assets/jonathan.jpg` — 1080×1080 portrait, already glitch-processed (magenta/cyan/green
  chromatic split with datamosh bars on black) and supplied by the owner. This image is the
  palette anchor for the whole site; the site's neon values were sampled from it.
  Serve from `/public/assets/jonathan.jpg`. Ship an `.avif`/`.webp` alongside via
  `astro:assets`; keep the JPEG as fallback.
- No icons are used anywhere — labels are text. Do not introduce an icon set.
- Fonts loaded from Google Fonts in the prototype; self-host via `@fontsource` in production
  (see `ASTRO_PLAN.md`).

## Files
- `screenshots/` — rendered captures of the prototype. `homepage.png` is the hero;
  `01-04-section.png` walk down the homepage (telemetry → writing/results/topics → projects →
  uses/footer); `01-04-article.png` walk down the article page. Captured at ~913px viewport
  width, so the hero status pill and buttons wrap in a way they do not at the 1180px design
  width — trust the HTML and the measurements in this README over the screenshots where they
  disagree.
- `fager.tech.dc.html` — the full prototype (homepage + article view). Visual source of truth.
- `ASTRO_PLAN.md` — target Astro project structure, content collection schemas, Strava
  build-time sync, Vercel/domain config, and a suggested build order.
- `assets/jonathan.jpg` — the portrait.

## Content still needed from the owner
Real 2026 Strava totals and FTP · real race results and upcoming entries · confirmed bike,
trainer, printer and software list for Uses · the actual blog posts · 3D-printing photos when
the print bench section goes live.
