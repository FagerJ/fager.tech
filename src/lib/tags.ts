/**
 * Tags are authored in frontmatter with display casing ("eCycling", "3D printing")
 * and slugified only for URLs. Two tags that slugify the same are the same tag.
 */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function tagPath(tag: string): string {
  return `/tags/${tagSlug(tag)}`;
}
