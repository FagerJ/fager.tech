# fager.tech

Personal site for Jonathan Fager — link-in-bio hero, season telemetry, blog, race
results, projects and a uses list. Static Astro, Markdown content, deployed to Vercel.

Built from the design handoff in `design/` (visual spec + Astro plan). The
prototype's values — colours, type scale, spacing, hover states — are the source
of truth; `src/styles/global.css` holds them as custom properties.

## Running it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # runs the Strava sync, then builds to dist/
npm run preview  # serve dist/
npm run check    # astro check (types + template diagnostics)
```

Node 22.

## How it is put together

```
src/
├─ components/     one .astro file per design element, styles scoped alongside
├─ layouts/        BaseLayout (shell, head, SEO) and PostLayout (article column)
├─ content/        blog, recipes, guides, projects — Markdown collections
├─ content.config.ts   collection schemas
├─ data/           telemetry (generated), results, uses, links, history, manual
├─ lib/            content helpers, tag slugs, OG card renderer
├─ pages/          routes
├─ styles/         global.css (tokens, reset, keyframes) + prose.css (article body)
└─ assets/fonts/   vendored woff2 + ttf
scripts/sync-strava.mjs   build-time telemetry fetch
```

**Zero client-side JavaScript.** Every interaction in the design is a hover state
or a link, so nothing ships to the browser — verified in the build output. Keep it
that way: if something seems to need JS, check whether CSS can do it first.

**Border radius is 0 everywhere.** There is no radius scale.

**Motion is hover-only**, with one exception: the 7s scan sweep over the portrait.
No entrance animations, no parallax, no autoplaying glitch. The `steps()` timing on
the glitch keyframes is what makes them read as digital tearing rather than a blur —
do not swap it for `ease`. `prefers-reduced-motion: reduce` disables all of it.

**Hover states are instant hard swaps.** No `transition`. It should read as a
terminal, not a web page.

### A scoped-style gotcha

Astro scopes a component's `<style>` to elements in *its own* template. When a child
component owns an element the parent styles — `GlitchText` rendering the hero `<h1>`,
for instance — a plain scoped rule silently does not match. The fix used throughout
is to scope the ancestor and globalise the descendant:

```css
.hero :global(.hero__title) { … }
```

## Content

Posts are Markdown in `src/content/{blog,recipes,guides}/`. All three render with
the same `PostLayout` and appear together in `/blog`, the RSS feed and the tag
index; they differ only in the frontmatter block above the body and their URL
prefix. Frontmatter is validated by `src/content.config.ts` — the build fails on a
malformed post rather than shipping it.

Set `draft: true` to hide a post from production while keeping it visible in `dev`.

Tags are authored with display casing (`eCycling`, `3D printing`) and slugified only
for URLs, so `/tags/ecycling` and `/tags/3d-printing`.

## Telemetry / Strava

`scripts/sync-strava.mjs` runs as `prebuild`, refreshes the OAuth token, reads the
athlete's year-to-date ride totals and writes `src/data/telemetry.json`. It never
runs in the browser — the refresh token must not reach the client, and the numbers
are baked into the HTML.

Copy `.env.example` to `.env` locally and set the same four variables in the Vercel
project settings. FTP is not exposed by the Strava API; it is maintained by hand in
`src/data/manual.json`.

The script is deliberately fail-soft: missing credentials, a revoked token or a
Strava outage log a warning and exit 0, leaving the committed `telemetry.json` in
place. **A Strava problem must never fail a deploy.** `telemetry.json` is committed
for exactly this reason — do not gitignore it.

Strava rotates refresh tokens. When it does, the script logs the new one; copy it
into the Vercel environment variable.

`.github/workflows/refresh-telemetry.yml` pokes a Vercel deploy hook daily so the
numbers stay current without a content change. It needs a `VERCEL_DEPLOY_HOOK_URL`
repository secret, and no-ops without one.

## Fonts

Three families, latin subsets, vendored as woff2 in `src/assets/fonts` and served
through Astro's `local` font provider. Astro emits the `@font-face` rules, preloads
the two above-the-fold faces (Chakra Petch 700, JetBrains Mono) and generates
size-adjusted fallback metrics so the swap does not shift layout.

Vendoring rather than using the `google()` provider keeps the build free of any
network dependency — a deploy cannot fail on someone else's outage. To update a
face, replace the woff2 and change nothing else.

The two `.ttf` files are separate: satori parses TTF, not woff2, and is used only to
render OG cards at build time.

## Deployment

Vercel, zero-config — it detects Astro and serves `dist/`. No adapter: the site is
fully static, and `@astrojs/vercel` would only add serverless plumbing nothing uses.

`vercel.json` pins the few things that are not defaults:

- `trailingSlash: true`, so served URLs match the `<link rel="canonical">` tags and
  the RSS links. Change one and you must change all three.
- Immutable caching for `/_astro/*`, which is content-hashed and can never go stale.
- Short revalidating cache for `/og/*`, which is **not** hashed — an OG card keeps
  its filename when a post title changes, so it must not be cached immutably.
- Baseline security headers.

### First-time setup

1. Import the repo in Vercel. Framework preset: Astro. Node 22. Build command and
   output directory are detected; leave them alone.
2. Add the four `STRAVA_*` variables from `.env.example` to Project → Settings →
   Environment Variables. The build succeeds without them — `prebuild` warns and
   uses the committed `telemetry.json` — so this can wait.
3. Add `fager.tech` and `www.fager.tech` under Project → Settings → Domains, and set
   `www` to redirect to the apex.
4. Create a deploy hook (Settings → Git → Deploy Hooks) and store the URL as the
   `VERCEL_DEPLOY_HOOK_URL` repository secret, so the daily telemetry refresh in
   `.github/workflows/refresh-telemetry.yml` has something to call. It no-ops
   without one.

## Deliberate non-goals

Confirmed with the owner: no comments, no newsletter, no analytics, no site search,
no dark/light toggle, no guestbook. The 3D-printing area stays a "Coming soon"
project card until there are photos.
