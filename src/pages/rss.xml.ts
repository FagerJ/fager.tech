import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllWriting, entryPath } from '../lib/content';
import { SITE } from '../consts';

export async function GET(context: APIContext) {
  const writing = await getAllWriting();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    // Matches Astro's directory build format, so feed links are identical to
    // the canonical URLs rather than looking like duplicates.
    trailingSlash: true,
    items: writing.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.pubDate,
      link: entryPath(entry),
      categories: entry.data.tags,
      author: SITE.author,
    })),
    customData: `<language>en</language>`,
  });
}
