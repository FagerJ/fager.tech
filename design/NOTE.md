# Design handoff (reference)

These are the original handoff files, kept for reference. They are **not** built or
deployed — nothing in `src/` imports from here.

- `README.md` — the visual spec. Source of truth for colours, type, spacing and
  hover states.
- `ASTRO_PLAN.md` — the original implementation plan. The build follows it; where
  it has drifted, see "Deviations" below.
- `fager.tech.dc.html` — the prototype, authored in a streaming-component format.
  It will not render standalone (it needs a `support.js` that was not shipped);
  read it as markup, not as a runnable page.
- `screenshots/` — captures of the prototype at ~913px. The prototype has no
  responsive rules, so at that width things wrap in ways the real site does not.
  Trust `README.md`'s measurements over the screenshots where they disagree.

The portrait lives at `src/assets/jonathan.jpg` so `astro:assets` can emit
avif/webp variants; it is not duplicated here.

## Deviations from ASTRO_PLAN.md

Each of these is a deliberate change, not an oversight:

- **No Vercel adapter.** The plan specifies `@astrojs/vercel/static`, which no
  longer exists in the current adapter (static output was folded into zero-config
  detection). A pure static Astro build needs no adapter on Vercel.
- **Fonts are vendored, not fetched.** The plan specifies `@fontsource`. Astro now
  has a first-class font pipeline that also handles preloading and fallback
  metrics, so it is used with the `local` provider over vendored woff2 files.
- **`/blog` lists all writing**, not just the `blog` collection — recipes and
  guides share the layout, the feed and the tag index, and the nav has one entry
  for all of them. This also matches the prototype's own post list, which shows a
  Recipes-tagged post.
- **Daily refresh is a GitHub Action**, not a Vercel Cron. Vercel Cron requires a
  serverless function; this site is deliberately static, so the Action pokes a
  deploy hook instead.
- **No visual current-page state in the nav.** The design has exactly one nav
  treatment and a permanently filled item would compete with the Strava CTA;
  `aria-current="page"` is still set for assistive tech.

## Still needed from the owner

Real 2026 Strava totals and FTP · real race results and upcoming entries ·
confirmed bike, trainer, printer and software list for Uses · the actual blog posts
· 3D-printing photos when the print bench section goes live.

The posts, results and uses entries currently in the repo are written to match the
prototype's placeholders and the site's voice. They are stand-ins.
