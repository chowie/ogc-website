import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Team: one Markdown file per person in src/content/team/.
// The filename is the URL slug (jane-doe.md -> /team/jane-doe).
// Set `slug:` in frontmatter to pin the URL if the file is ever renamed.
const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      role: z.string().optional(),
      // Path relative to the Markdown file, e.g. ./jane-doe.jpg
      photo: image().optional(),
      photoAlt: z.string().optional(),
      // Team cards show the first ~150 characters; the rest is cut at a word.
      shortBio: z
        .string()
        .max(400, 'shortBio must be 400 characters or fewer')
        .optional(),
      // Lower numbers appear first. Missing = sorted to the end.
      displayOrder: z.number().default(999),
    }),
});

const sermons = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sermons' }),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    speaker: z.string().optional(),
    youtubeUrl: z.url(),
    series: z.string().optional(),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z
    .object({
      title: z.string().min(1),
      start: z.coerce.date(),
      end: z.coerce.date().optional(),
      location: z.string().optional(),
      summary: z.string().optional(),
    })
    .refine((e) => !e.end || e.end >= e.start, {
      message: 'end must be after start',
      path: ['end'],
    }),
});

export const collections = { team, sermons, events };
