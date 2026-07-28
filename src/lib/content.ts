import { getCollection, type CollectionEntry } from 'astro:content';
import { tagSlug } from './tags';

/** Collections that render as articles and share the post layout, RSS and tag index. */
export const WRITING_COLLECTIONS = ['blog', 'recipes', 'guides'] as const;
export type WritingCollection = (typeof WRITING_COLLECTIONS)[number];
export type WritingEntry = CollectionEntry<WritingCollection>;

const isPublished = ({ data }: { data: { draft?: boolean } }) =>
  import.meta.env.DEV || !data.draft;

const byNewest = (a: WritingEntry, b: WritingEntry) =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

/** Published entries of one collection, newest first. */
export async function getWriting(collection: WritingCollection): Promise<WritingEntry[]> {
  const entries = await getCollection(collection, isPublished);
  return entries.sort(byNewest);
}

/** Published entries across blog + recipes + guides, newest first. */
export async function getAllWriting(): Promise<WritingEntry[]> {
  const groups = await Promise.all(WRITING_COLLECTIONS.map(getWriting));
  return groups.flat().sort(byNewest);
}

/** The canonical URL for any writing entry. Recipes and guides get their own prefix. */
export function entryPath(entry: WritingEntry): string {
  return entry.collection === 'blog' ? `/blog/${entry.id}` : `/${entry.collection}/${entry.id}`;
}

export interface Topic {
  tag: string;
  slug: string;
  count: number;
}

/**
 * Unique tags across all writing, sorted by frequency then alphabetically.
 * The first-seen casing wins, so author "eCycling" consistently.
 */
export function collectTopics(entries: WritingEntry[]): Topic[] {
  const seen = new Map<string, Topic>();

  for (const entry of entries) {
    for (const tag of entry.data.tags) {
      const slug = tagSlug(tag);
      const existing = seen.get(slug);
      if (existing) existing.count += 1;
      else seen.set(slug, { tag, slug, count: 1 });
    }
  }

  return [...seen.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** ~200 wpm, matching the "9 min read" in the prototype. */
export function readingTime(body: string | undefined): string {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/** ISO date, which is how every date on this site is displayed. */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
