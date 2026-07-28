import type { APIRoute } from 'astro';
import { renderOgImage } from '../../lib/og';
import { getAllWriting, formatDate } from '../../lib/content';
import { SITE } from '../../consts';

/** One card per article, plus the default used by every other route. */
export async function getStaticPaths() {
  const writing = await getAllWriting();

  return [
    {
      params: { slug: 'default' },
      props: { title: 'Jonathan Fager', eyebrow: 'fager.tech', meta: SITE.location },
    },
    ...writing.map((entry) => ({
      params: { slug: entry.id },
      props: {
        title: entry.data.title,
        eyebrow: entry.data.tags[0] ?? entry.collection,
        meta: formatDate(entry.data.pubDate),
      },
    })),
  ];
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(props as Parameters<typeof renderOgImage>[0]);

  return new Response(new Uint8Array(png), {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
};
