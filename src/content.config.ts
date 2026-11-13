import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { STATUSES } from './lib/section-status.mjs';
import { FORM_NAMES } from './data/forms';

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
      // Which list on /about/team the person appears in.
      group: z.enum(['elders', 'deacons', 'missions', 'treasurer', 'staff']),
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
      // Who it's for ("New attenders", "Women") and whether kids are welcome.
      audience: z.string().optional(),
      kidsWelcome: z.boolean().optional(),
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
// A URL, or a document's name (no ':' or '/', so a mistyped URL still fails).
const source = z.union([z.url({ protocol: /^https?$/ }), z.string().regex(/^[^:/]+$/, 'not a URL or a document name')]);
// Where a section's copy came from; see src/lib/section-status.mjs.
const origin = z
  .object({
    status,
    from: source.optional(),
    // An unquoted YAML date (2026-11-12), which is read as that calendar day.
    on: z.date({ error: 'on must be a date like 2026-11-12 (no quotes)' }).optional(),
    note: z.string().max(200, 'note: one short sentence (200 characters max)').optional(),
  })
  .refine((o) => o.status === 'placeholder' || o.from, { message: 'from is required unless status is placeholder', path: ['from'] })
  .refine((o) => o.status === 'real' || o.on, { message: 'on (a date) is required for rewritten and placeholder copy', path: ['on'] });
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().min(1),
    eyebrow: z.string().optional(),
    intro: z.string().optional(),
    description: z.string().optional(),
    // The page default: status and where the copy came from. Required, so
    // every section has a badge and a source note.
    origin,
    // Per-section origins, keyed by heading id. Also lists sections a page's
    // .astro file adds (SectionHeading), so /content-status and the page agree.
    sections: z.record(z.string(), origin).default({}),
    // What's still needed to finish the page (shown on /content-status).
    needs: z.array(z.string()).default([]),
    // A form (src/data/forms.ts) shown after the copy, so it ends the last
    // section. `interest` preselects the connect form's "I'm interested in".
    form: z.object({ name: z.enum(FORM_NAMES), interest: z.string().optional() }).optional(),
  }),
});

export const collections = { team, sermons, events, pages };
