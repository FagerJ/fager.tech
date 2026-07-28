import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

/**
 * One OG card template for every route: near-black canvas, magenta rule, the
 * title in Chakra Petch and the wordmark in mono. Rendered at build time only —
 * satori draws an SVG, resvg rasterises it.
 */
const WIDTH = 1200;
const HEIGHT = 630;

const BG = '#050508';
const TEXT = '#e8e8f0';
const MAGENTA = '#ff2bd1';
const CYAN = '#00e5ff';
const META = '#6f6f88';

/**
 * Resolved from the project root rather than `import.meta.url`: this module is
 * bundled into dist/.prerender at build time, so a module-relative path would
 * point at the chunk instead of the source tree. These endpoints only ever run
 * during `astro build`, where cwd is the project root.
 */
const fontUrl = (name: string) =>
  new URL(`src/assets/fonts/${name}`, pathToFileURL(`${process.cwd()}/`));

let fontCache: Awaited<ReturnType<typeof loadFonts>> | null = null;

async function loadFonts() {
  const [display, mono] = await Promise.all([
    readFile(fontUrl('chakra-petch-700.ttf')),
    readFile(fontUrl('jetbrains-mono-400.ttf')),
  ]);

  return [
    { name: 'Chakra Petch', data: display, weight: 700 as const, style: 'normal' as const },
    { name: 'JetBrains Mono', data: mono, weight: 400 as const, style: 'normal' as const },
  ];
}

export interface OgOptions {
  title: string;
  /** Small mono line above the title — a section name, or the tag list. */
  eyebrow?: string;
  /** Small mono line at bottom-right, usually the date. */
  meta?: string;
}

export async function renderOgImage({ title, eyebrow, meta }: OgOptions): Promise<Buffer> {
  fontCache ??= await loadFonts();

  // Satori takes a React-element-shaped object; building it literally avoids
  // pulling JSX (and a React dependency) into the build for one template.
  const el = {
    type: 'div',
    props: {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: BG,
        padding: '64px 72px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'JetBrains Mono',
                    fontSize: 22,
                    letterSpacing: '0.24em',
                    textTransform: 'uppercase',
                    color: CYAN,
                    marginBottom: 28,
                  },
                  children: eyebrow ? `// ${eyebrow}` : '// fager.tech',
                },
              },
              {
                type: 'div',
                props: {
                  style: { width: 96, height: 3, backgroundColor: MAGENTA, marginBottom: 36 },
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Chakra Petch',
                    fontWeight: 700,
                    // Long titles get a smaller face so they never overflow.
                    fontSize: title.length > 68 ? 60 : title.length > 40 ? 72 : 88,
                    lineHeight: 1.08,
                    letterSpacing: '-0.015em',
                    color: TEXT,
                    display: 'flex',
                  },
                  children: title,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              fontFamily: 'JetBrains Mono',
              fontSize: 22,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', color: TEXT },
                  children: [
                    { type: 'span', props: { children: 'FAGER' } },
                    { type: 'span', props: { style: { color: MAGENTA }, children: '.TECH' } },
                  ],
                },
              },
              { type: 'div', props: { style: { color: META }, children: meta ?? '' } },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(el as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: fontCache,
  });

  return Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng());
}
