# OGC Website Prototype — Plan

Replace the Wix site with an Astro static site. Content lives in Markdown/JSON
(`src/content/`, `src/data/`) so volunteers (later via a CMS) and Chris (locally
via git) edit the same files. GitHub → Netlify: `main` = demo, PRs = previews.

## Decisions
- **Astro 7.4** on **Node 22.23.4** (`.nvmrc`, pinned in `netlify.toml`).
  Started on Astro 5 to match local Node 20, but `npm audit` showed every Astro
  ≤ 7.3.1 has open advisories (XSS, image-optimizer RCE) with no 5.x backport.
  Node 22 installed via nvm; system default Node unchanged.
- **Plain CSS** with custom properties (design tokens). No Tailwind: fewer deps,
  tokens map cleanly onto the Wix template's type/color mood once we have it.
- **Team slug** = Markdown filename (`jane-doe.md` → `/team/jane-doe`).
  Optional `slug:` frontmatter pins the URL if the file is renamed.
- **Team photo** sits next to its Markdown file (`photo: ./jane-doe.jpg`) so
  Astro optimizes it. Missing photo → initials placeholder.
- **displayOrder** defaults to 999 (forgotten = sorted last); ties sort by name.
- **shortBio** max 150 chars, enforced by schema — build fails if exceeded.
- **noindex**: one switch, `PUBLIC_ALLOW_INDEXING` env var (unset = blocked).
  Drives both the `<meta name="robots">` tag and `/robots.txt`.
- **Events "upcoming"** is computed at build time. Static site → needs a
  daily Netlify build hook (scheduled) before go-live so past events drop off.

## Blocked on Chris
- [x] Wix template URL (visual model) — Wix "Urban Church" template #1852
- [ ] Current OGC site URL (team bio text source)
- [x] Photos: placeholders for now (Chris, 2026-10-28)
- [x] GitHub: Chris's account (`chowie`) for now; church org later
- [x] Netlify team: Funky Bunch (free)

## Phase 1 — Scaffold (no visual design, no real content)
- [x] Astro project, `package.json`, tsconfig
- [x] Content schema: team, sermons, events + site settings
- [x] Clearly-fake sample entries to prove schema + sorting
- [x] Netlify config (`netlify.toml`), robots/noindex switch
- [x] Bare routes: `/`, `/about`, `/team/[slug]`, `/sermons`, `/events`, `/visit`
- [x] `npm run build` passes; 151-char shortBio fails build
- [x] README: how to add a team member

## Phase 2 — Design + content (after URLs arrive; check in first)
- [x] Study Wix template: layout, spacing, type scale, color mood (no code/images/text copied)
- [x] Design tokens + base layout, header/nav (mobile menu), footer
- [x] Home: hero, service times, welcome, upcoming events, latest sermon, Plan a Visit CTA
- [x] About/Team list (cards: photo, name, role, short bio, Read More)
- [x] Team detail page
- [x] Sermons list, Events list
- [x] Plan a Visit: address, map embed, service times, Netlify form
- [ ] Seed real team text from current site
- [x] Phone + desktop check; Lighthouse a11y ≥ 90

## Phase 3 — Ship (confirm each with Chris)
- [ ] Create GitHub repo, push
- [ ] Create/link Netlify site, deploy previews on PRs
- [ ] Verify demo URL, noindex live

## Review
### Phase 1 (2026-10-28)
Verified: `astro check` 0 errors; team sorts by displayOrder (missing → last);
past events hidden; `slug:` pins URL; 151-char shortBio fails build with a clear
message; noindex meta + `Disallow: /` by default, flipped by
`PUBLIC_ALLOW_INDEXING=true`. Pages are unstyled markup only.

### Phase 2 design (2026-10-28)
Palette sampled for mood only (slate #3f4359, plum #6a4e77, coral #ff6a48),
coral adjusted for WCAG contrast (dark ink on coral; #b83e25 for coral text).
Display font: Unbounded (OFL, self-hosted via Fontsource) stands in for the
template's wide bold caps. Hero uses a CSS gradient placeholder, no images.
Nothing copied from the template's code, images or text. No horizontal
overflow at 375px on any page. Lighthouse accessibility 100 on all six pages
(mobile + desktop).

## Stopped Here
Design done with placeholder content. Still need: current OGC site URL (team
text), real address/service times/map embed for site.json, hero photo.
