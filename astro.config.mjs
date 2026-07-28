// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const dir = './src/assets/fonts';

// Pure static output. Vercel builds Astro static sites zero-config, so no adapter
// is needed — adding one would only pull in serverless plumbing this site never uses.
export default defineConfig({
  site: 'https://fager.tech',
  output: 'static',

  /**
   * Three families, latin subset only:
   *   Chakra Petch   — display, headings, stat values, blockquote
   *   Space Grotesk  — body copy (also the <body> default)
   *   JetBrains Mono — all UI chrome: nav, labels, meta, chips, buttons, footer
   *
   * The woff2 files are vendored in src/assets/fonts (latin subsets pulled from
   * Google Fonts, ~81 kB total) and served through Astro's local font provider.
   * Vendoring rather than using the `google()` provider keeps the build free of
   * any network dependency, so a deploy cannot fail on someone else's outage.
   * Astro still emits the @font-face rules, the preload hints and the
   * size-adjusted fallback metrics that keep the swap from shifting layout.
   *
   * Chakra Petch has no variable release, hence the three static weights; the
   * other two are single variable faces spanning 400–700.
   *
   * To update a face: replace the woff2 and leave everything else alone.
   */
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Chakra Petch',
      cssVariable: '--font-display',
      fallbacks: ['system-ui', 'sans-serif'],
      optimizedFallbacks: true,
      options: {
        variants: [
          { weight: 400, style: 'normal', display: 'swap', src: [`${dir}/chakra-petch-400.woff2`] },
          { weight: 600, style: 'normal', display: 'swap', src: [`${dir}/chakra-petch-600.woff2`] },
          { weight: 700, style: 'normal', display: 'swap', src: [`${dir}/chakra-petch-700.woff2`] },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Space Grotesk',
      cssVariable: '--font-body',
      fallbacks: ['system-ui', 'sans-serif'],
      optimizedFallbacks: true,
      options: {
        variants: [
          {
            weight: '400 700',
            style: 'normal',
            display: 'swap',
            src: [`${dir}/space-grotesk-variable.woff2`],
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      fallbacks: ['ui-monospace', 'monospace'],
      optimizedFallbacks: true,
      options: {
        variants: [
          {
            weight: '400 700',
            style: 'normal',
            display: 'swap',
            src: [`${dir}/jetbrains-mono-variable.woff2`],
          },
        ],
      },
    },
  ],

  integrations: [sitemap()],

  markdown: {
    shikiConfig: { theme: 'github-dark-default' },
  },
});
