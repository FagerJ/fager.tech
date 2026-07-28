# Astro implementation plan — fager.tech

Companion to `README.md` (which holds all visual specs). This file describes the code the
developer should write. Read `README.md` first for design values.

## Stack

- **Astro** (latest, `output: 'static'`) — content-driven, zero JS by default, which matches a
  site whose only interactivity is hover states.
- **Content Collections** (`astro:content`) with Markdown/MDX for all writing.
- **Vercel** deployment via `@astrojs/vercel/static`, domain `fager.tech`.
- **No CSS framework.** One global stylesheet with the CSS custom properties from README plus
  scoped `<style>` blocks per `.astro` component. The design is bespoke and small; Tailwind would
  add more indirection than it saves.
- `@fontsource-variable/chakra-petch`, `@fontsource-variable/space-grotesk`,
  `@fontsource-variable/jetbrains-mono` — self-hosted, subset to `latin`. Preload the two faces
  used above the fold (Chakra Petch 700, JetBrains Mono 400).

## Project structure

```
fager.tech/
├─ astro.config.mjs
├─ package.json
├─ tsconfig.json
├─ .env                      # STRAVA_* secrets, gitignored
├─ public/
│  ├─ assets/jonathan.jpg
│  ├─ favicon.svg            # magenta/cyan "F" glyph, to design
│  └─ robots.txt
├─ scripts/
│  └─ sync-strava.mjs        # prebuild data fetch → src/data/telemetry.json
├─ src/
│  ├─ content.config.ts      # collection schemas
│  ├─ data/
│  │  ├─ telemetry.json      # generated, committed as a fallback
│  │  ├─ results.json        # hand-maintained race results
│  │  ├─ uses.json           # hand-maintained gear/software list
│  │  └─ links.json          # link-in-bio buttons
│  ├─ content/
│  │  ├─ blog/*.md
│  │  ├─ recipes/*.md
│  │  ├─ guides/*.md
│  │  └─ projects/*.md
│  ├─ layouts/
│  │  ├─ BaseLayout.astro    # html/head, fonts, global css, overlays, header, footer
│  │  └─ PostLayout.astro    # article column, header, prose styles, post footer
│  ├─ components/
│  │  ├─ SiteHeader.astro
│  │  ├─ SiteFooter.astro
│  │  ├─ CrtOverlay.astro    # scanlines + vignette
│  │  ├─ GlitchText.astro    # <GlitchText as="h1" ms={420} steps={4}>
│  │  ├─ Hero.astro
│  │  ├─ Portrait.astro      # frame, corner brackets, tear-on-hover, scan sweep
│  │  ├─ SectionHead.astro   # "// title" + optional right slot
│  │  ├─ StatCard.astro
│  │  ├─ TelemetryGrid.astro
│  │  ├─ PostRow.astro
│  │  ├─ ResultRow.astro
│  │  ├─ TagChip.astro
│  │  ├─ ProjectCard.astro
│  │  └─ UsesList.astro
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ blog/index.astro
│  │  ├─ blog/[...slug].astro
│  │  ├─ cycling/index.astro
│  │  ├─ projects/index.astro
│  │  ├─ uses.astro
│  │  ├─ tags/index.astro
│  │  ├─ tags/[tag].astro
│  │  ├─ 404.astro            # good place for a glitch joke, warm not snarky
│  │  └─ rss.xml.ts
│  └─ styles/
│     ├─ global.css           # tokens, resets, keyframes, reduced-motion, focus-visible
│     └─ prose.css            # article body typography
```

## Content schemas (`src/content.config.ts`)

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const base = {
  title: z.string(),
  description: z.string(),          // used as the homepage excerpt + meta description
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  hero: z.string().optional(),
};

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({ ...base, featured: z.boolean().default(false) }),
});

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recipes' }),
  schema: z.object({
    ...base,
    servings: z.number().optional(),
    prepMinutes: z.number().optional(),
    carbsPerServing: z.number().optional(),   // ride food — owner cares about this
    ingredients: z.array(z.string()).optional(),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({ ...base, difficulty: z.enum(['easy','medium','hard']).optional() }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    kind: z.string(),                              // "Workshop" | "Tooling" | "Data"
    blurb: z.string(),
    status: z.enum(['Live','In progress','Coming soon','Archived']),
    tint: z.enum(['magenta','cyan','green']).default('magenta'),
    order: z.number().default(0),
    url: z.string().url().optional(),
  }),
});

export const collections = { blog, recipes, guides, projects };
```

Recipes and guides render with the same `PostLayout` as blog posts; they differ only in the
frontmatter block rendered above the body (ingredients/times for recipes, difficulty for guides)
and in which index page lists them. Tags are the cross-cutting index — `/tags/recipes` etc. work
regardless of collection.

## Homepage data assembly (`src/pages/index.astro`)

```
telemetry  ← src/data/telemetry.json          (generated at build time)
posts      ← getCollection('blog'), !draft, sort by pubDate desc, slice(0, 4)
results    ← src/data/results.json, slice(0, 4)
topics     ← unique tags across all four collections, sorted by count desc
projects   ← getCollection('projects'), sort by order, slice(0, 3)
uses       ← src/data/uses.json, slice(0, 9)
```

Keep the homepage a pure composition of components — no data logic inline beyond these six lines.

## Strava sync (`scripts/sync-strava.mjs`)

Runs as `prebuild`, writes `src/data/telemetry.json`. **Never** call Strava from the browser —
the refresh token must not ship to the client.

1. Env vars (Vercel project settings + local `.env`):
   `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN`, `STRAVA_ATHLETE_ID=5854987`.
2. `POST https://www.strava.com/oauth/token` with `grant_type=refresh_token` → access token.
   Strava rotates the refresh token; log the new one so it can be updated in Vercel when it
   changes, and fail soft rather than breaking the build.
3. `GET /api/v3/athletes/{id}/stats` → `ytd_ride_totals` for distance / moving_time /
   elevation_gain. FTP is not in the API — read it from a `ftp` field in `src/data/results.json`
   or a small `src/data/manual.json` the owner edits.
4. Compute the four cards exactly as the design shows them:
   - Distance: `Math.round(distance / 1000)`, space-grouped thousands (`6 842`), unit `km`.
   - Time: `Math.round(moving_time / 3600)`, unit `h`.
   - Elevation: `(elevation_gain / 1000).toFixed(1)`, unit `k m`.
   - FTP: manual value, unit `W`.
   - Deltas: compare against a `src/data/history.json` keyed by year that the script appends to.
5. Write `{ generatedAt, cards: [{label, value, unit, delta}] }`.
6. **Resilience:** wrap everything in try/catch. On failure, keep the committed
   `telemetry.json` and log a warning — a Strava outage must not fail a deploy. The
   "synced from Strava · Nh ago" line is computed from `generatedAt` at build time.
7. Freshness: add a Vercel Cron (or a daily GitHub Action) that triggers a deploy hook so
   telemetry refreshes without a content change.

Rate limits are generous for one athlete once a day; no caching layer needed.

## Global CSS notes

- Put the token table from README into `:root` as custom properties, then reference them
  everywhere. The prototype has literal hex values inline — do not carry that pattern over.
- `border-radius: 0` is the default; there is no radius scale to define.
- Add what the prototype omits:
  ```css
  :focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }
  html { scroll-behavior: smooth; }
  @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
  ```
- Keep the three keyframe blocks verbatim from README, including the `steps()` timings.
- `img { max-width: 100%; display: block; }`

## SEO / meta

- Per-page `<title>` / `description` from frontmatter; site title "Jonathan Fager — fager.tech".
- OG images: generate at build with `satori` + `@resvg/resvg-js` — black canvas, Chakra Petch
  title in `#e8e8f0`, magenta rule, `FAGER.TECH` wordmark. One template, all routes.
- `rss.xml` over blog + recipes + guides; link it in `<head>` and from the footer.
- `sitemap` via `@astrojs/sitemap`, `site: 'https://fager.tech'` in the config.
- JSON-LD: `Person` on `/`, `BlogPosting` on posts, `Recipe` on recipes (the structured recipe
  fields make this basically free and it earns rich results).

## Vercel

- `astro.config.mjs`: `import vercel from '@astrojs/vercel/static'`, `adapter: vercel()`,
  `site: 'https://fager.tech'`.
- Add `fager.tech` + `www.fager.tech` in Vercel; redirect `www` → apex. Point DNS at Vercel
  (A/CNAME per their instructions). TLS is automatic.
- Build: `npm run build` with `prebuild` running the Strava sync. Node 22.
- Analytics: none was requested — leave it out rather than adding a script the owner didn't ask
  for.

## Suggested build order

1. Astro scaffold, fonts, `global.css` tokens + keyframes, `BaseLayout`, `CrtOverlay`,
   `SiteHeader`, `SiteFooter` — get the shell pixel-matching the prototype first.
2. Homepage sections in order: Hero + Portrait → TelemetryGrid (hardcoded JSON) → post list →
   results → topics → projects → uses.
3. Content collections + `PostLayout` + `/blog` index + `/blog/[...slug]`, then port the sample
   article from the prototype as the first real post.
4. `/tags` index and `/tags/[tag]`.
5. `/cycling`, `/projects`, `/uses` pages (largely re-using homepage components with full lists
   instead of slices).
6. Strava sync script + Vercel cron.
7. Responsive pass per README, then focus states, then Lighthouse (target 100/100/100/100 — the
   site has no client JS, so this is achievable).
8. RSS, sitemap, OG images, 404.

## Deliberate non-goals

Confirmed with the owner: no comments, no newsletter, no analytics, no site search (15-ish pieces
of content — the tag index is enough), no dark/light toggle, no guestbook. The 3D-printing area
stays a "Coming soon" project card until there are photos.
