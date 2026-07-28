import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const base = {
  title: z.string(),
  /** Doubles as the homepage excerpt and the meta description. */
  description: z.string(),
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
    carbsPerServing: z.number().optional(),
    ingredients: z.array(z.string()).optional(),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({ ...base, difficulty: z.enum(['easy', 'medium', 'hard']).optional() }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    kind: z.string(),
    blurb: z.string(),
    status: z.enum(['Live', 'In progress', 'Coming soon', 'Archived']),
    tint: z.enum(['magenta', 'cyan', 'green']).default('magenta'),
    order: z.number().default(0),
    url: z.url().optional(),
  }),
});

export const collections = { blog, recipes, guides, projects };
