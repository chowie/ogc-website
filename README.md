# Oneida Gospel Church website

Static site built with [Astro](https://astro.build). All content lives in
plain files under `src/content/` and `src/data/` — no code changes needed to
update people, sermons, events, or service times.

## Run locally

Requires Node 22.23.4+ (`nvm use` picks it up from `.nvmrc`).

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # type-check + build to dist/
```

## Editing content

| What | Where |
|---|---|
| Team members | `src/content/team/*.md` (one file per person) |
| Sermons | `src/content/sermons/*.md` |
| Events | `src/content/events/*.md` |
| Service times, address, map, social links | `src/data/site.json` |

The build checks every file against the rules in `src/content.config.ts`.
If something is wrong (missing name, short bio too long, bad date), the build
stops and names the file and field.

### Add a team member

1. Create `src/content/team/first-last.md`. The filename becomes the page URL:
   `/team/first-last`.
2. Optional: put their photo next to it, e.g. `src/content/team/first-last.jpg`.
3. Fill in:

```markdown
---
name: First Last            # required
role: Deacon
photo: ./first-last.jpg     # optional; path relative to this file
photoAlt: First Last smiling outside the church   # optional
displayOrder: 5             # lower numbers appear first; omit to sort last
shortBio: A few sentences. The team card shows the first ~150 characters. 400 max.
---

Full bio goes here, in Markdown. It appears on the person's detail page
after they click "Read More".
```

That's it — the person appears on the About page in `displayOrder` order
(ties sort by name) and gets their own detail page.

To keep a URL stable when renaming the file, add `slug: first-last` to the
frontmatter.

### Add a sermon

Pull new uploads from the church YouTube channel:

```bash
npm run sermons:import
```

It reads the channel's feed (latest 15 videos), takes the speaker, scripture
and sermon date from the video description's `🎙 Speaker:`, `📖 Scripture:`
and `🗓` lines, and writes one file per new video. Videos already imported are
skipped, so edits you make to those files are kept. Commit the new files.

Or add one by hand, `src/content/sermons/2026-11-01-title.md`:

```markdown
---
title: Sermon Title
date: 2026-11-01
speaker: Speaker Name
passage: Psalm 46          # optional
youtubeUrl: https://www.youtube.com/watch?v=...
series: Series Name        # optional
summary: One-line teaser.  # optional
---
```

### Add an event

`src/content/events/2026-12-24-christmas-eve.md`:

```markdown
---
title: Christmas Eve Service
start: 2026-12-24T18:00:00-05:00
end: 2026-12-24T19:00:00-05:00   # optional
location: Sanctuary              # optional
summary: Short description.      # optional
---
```

Past events drop off automatically on the next build.

## Deploy

Netlify builds `main` to the demo site and every pull request to a deploy
preview (config in `netlify.toml`). The contact form uses Netlify Forms.

### Search engines

The demo is hidden from search engines (`noindex` meta tag and a
`Disallow: /` robots.txt). At go-live, set `PUBLIC_ALLOW_INDEXING=true` in the
Netlify site's environment variables and redeploy.
