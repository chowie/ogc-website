import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { STATUSES } from './lib/section-status.mjs';

// Team: one Markdown file per person in src/content/team/.
// The filename is the URL slug (jane-doe.md -> /about/team/jane-doe).
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
    passage: z.string().optional(),
    youtubeUrl: z.url(),
    series: z.string().optional(),
    summary: z.string().optional(),
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
      // Repeating events: `start`/`end` are the first meeting; the site shows the next one.
      repeat: z.enum(['weekly']).optional(),
      until: z.coerce.date().optional(),
    })
    .refine((e) => !e.end || e.end >= e.start, {
      message: 'end must be after start',
      path: ['end'],
    })
    .refine((e) => !e.until || e.repeat, {
      message: 'until only applies to repeating events',
      path: ['until'],
    }),
});

// Pages: the copy for each menu page, one Markdown file per page in
// src/content/pages/ (about/beliefs.md -> /about/beliefs). Each `##` heading
// is a section; the menu links to sections by their heading id.
// `status` labels the copy for the demo: real (from the church), rewritten
// (from the old site, edited for the web; needs review) or placeholder.
const status = z.enum(STATUSES as [string, ...string[]]);
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().min(1),
    eyebrow: z.string().optional(),
    intro: z.string().optional(),
    description: z.string().optional(),
    // Required, so the badges and /content-status always agree.
    status,
    // Per-section overrides, keyed by heading id: { faq: real }. Also lists
    // sections a page's .astro file adds (SectionHeading), so /content-status
    // and the badge read the same value.
    sections: z.record(z.string(), status).default({}),
    // Where real or rewritten copy came from.
    sources: z.array(z.url()).default([]),
    // What's still needed to finish the page (shown on /content-status).
    needs: z.array(z.string()).default([]),
  }),
});

export const collections = { team, sermons, events, pages };
