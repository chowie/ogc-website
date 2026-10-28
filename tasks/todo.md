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
- **shortBio** stored in full (schema max 400); team cards show the first ~150
  chars cut at a word + "…". Changed from a hard 150 limit because every Wix
  Short Bio is 254–348 chars (Chris chose this, 2026-10-28).
- **noindex**: one switch, `PUBLIC_ALLOW_INDEXING` env var (unset = blocked).
  Drives both the `<meta name="robots">` tag and `/robots.txt`.
- **Events "upcoming"** is computed at build time. Static site → needs a
  daily Netlify build hook (scheduled) before go-live so past events drop off.

## Blocked on Chris
- [x] Wix template URL (visual model) — Wix "Urban Church" template #1852
- [x] Team text: Chris exported Wix Team CSV (2026-10-28); current site is oneidagospel.org
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
- [x] Seed real team text from Wix CSV export (6 people, Wix Sort Order → displayOrder,
      Wix slugs kept so /team/<name> URLs match the old site). Emails in the CSV
      deliberately NOT imported (two are personal Gmail).
- [x] Sermons imported from youtube.com/@OneidaGospelChurch (3 public videos)
      via `npm run sermons:import` (RSS feed; parses 🎙/📖/🗓 description lines).
- [x] Scheduled import: GitHub Actions twice daily (12:00 + 22:00 UTC) runs
      sermons:import, validates build, commits to main as github-actions[bot].
      Tested 2026-10-28: no-change run, and delete→re-import (54a4443, identical file).
      Deploys depend on the Netlify GitHub App access below.
- [x] site.json filled from the channel's video descriptions: 3048 E. Strange
      Hwy., Grand Ledge, MI 48837; Sundays 10:30 a.m.; YouTube + Facebook;
      Google Maps embed. Sunday School placeholder removed (time unknown).
- [x] Office phone 517.627.7112 + office@oneidagospel.org added (Chris, 2026-10-28)
- [x] Events: 3 upcoming from oneidagospel.org/events (Women's Bible Study,
      Who Is Oneida? Nov 15, Membership Class Dec 6). Trunk or Treat skipped (past).
      Flyer's personal cell numbers deliberately omitted → "call the church office".
- [x] Recurring events: `repeat: weekly` (+ optional `until`) on events; next
      occurrence computed DST-safe in src/lib/time.ts. Women's Bible Study uses it.
- [x] Daily rebuild: NETLIFY_BUILD_HOOK secret added by Chris; manual run
      2026-10-28 produced Netlify production deploy titled "Daily rebuild".
- [x] Team photos downloaded from the current site's Wix CDN (Chris approved
      2026-10-28); EXIF/ICC metadata stripped (no GPS was present). Photos still placeholders.
- [x] Phone + desktop check; Lighthouse a11y ≥ 90

## Commit email
- [x] History rewritten (git filter-repo, 2026-10-28): my personal Gmail →
      366047+chowie@users.noreply.github.com on all commits; main force-pushed.
- [x] `.gitconfig` in repo sets user.email; enable per clone with
      `git config include.path ../.gitconfig` (done in Chris's local clone).
- [x] Repo deleted and recreated 2026-10-28 to drop old PR #1 refs. Gmail
      also scrubbed from every version of this file (it had been written here).
      Verified on GitHub: 0 files and 0 commits mention it. Netlify app access
      and NETLIFY_BUILD_HOOK secret re-added by Chris; git deploy, daily rebuild
      and sermon import all re-verified.
- [x] Repo made public by Chris (2026-10-28). Anonymous check: only no-reply
      emails in commits; workflows have no pull_request triggers, so forks
      can't reach the NETLIFY_BUILD_HOOK secret.

- [x] Gmail backup bundles deleted (Chris turned on GitHub email protection).
- [x] Portfolio polish: README intro + screenshots (docs/screenshots/), repo
      description, homepage URL, topics. Home tagline now service time + town.

## Versioning + deploy from tag (PARKED 2026-10-28 — Chris to decide later)
Open questions: how auto-imported sermons go live when only tags deploy
(auto patch release / wait for manual release / overlay sermons on the tag),
and whether current main becomes v0.1.0. Nothing below is built.
Spec: SemVer 2.0.0 (current). Tags `vX.Y.Z` (annotated; the `v` is a tag
prefix, not part of the version), `package.json` version matches.
`main` = demo/prod line; the live site = the newest release tag, never HEAD.

What a version bump means for a website (our "public API" = content file
format + page URLs):
- MAJOR: existing content files need edits (breaking schema change), or a URL
  is removed/renamed without redirect.
- MINOR: new page/feature, new optional content field.
- PATCH: fixes, copy/style tweaks, new content (sermons, events).
- 0.y.z until go-live (spec: initial development); 1.0.0 = public launch.

Steps:
- [ ] `npm test`: node:test unit tests for src/lib/time.ts (DST both ways,
      until cutoff) + content helpers; `npm run verify` = test + check + build.
- [ ] CHANGELOG.md (Keep a Changelog 1.1.0) with an `Unreleased` section.
- [ ] `npm run release -- patch|minor|major`: refuses unless on main, clean,
      in sync with origin, verify passes; bumps package.json, moves Unreleased
      → new version in CHANGELOG, commits "release: vX.Y.Z", annotated tag,
      pushes commit + tag.
- [ ] Netlify: stop git-triggered *production* builds (`ignore` when
      CONTEXT=production); PR deploy previews unchanged.
- [ ] `.github/workflows/deploy.yml`: on tag push `v*` → check out the tag,
      verify, build, `netlify deploy --prod`. Also workflow_dispatch with a
      `ref` input (default newest tag) for rollback/redeploy, and the daily
      schedule (replaces daily-rebuild.yml, which rebuilds HEAD).
      Needs **Chris:** `NETLIFY_AUTH_TOKEN` repo secret (personal access token)
      + `NETLIFY_SITE_ID` (not secret; can live in the workflow).
- [ ] Sermon import: see decision below.
- [ ] README "Releasing" section; tag current main as v0.1.0 once approved.

## Phase 3 — Ship (confirm each with Chris)
- [x] Create GitHub repo, push — https://github.com/chowie/ogc-website (private: commits carry personal email)
- [x] Create Netlify site in Funky Bunch, linked to repo — https://app.netlify.com/projects/ogc-website
- [x] **Chris:** grant Netlify GitHub App access to `ogc-website` (done 2026-10-28)
      (GitHub → Settings → Applications → Netlify → Configure → add repo).
      Until then git-triggered builds fail ("Repository not found"); demo is
      deployed manually with `netlify deploy --prod --dir dist`.
- [x] Git-triggered build of main deployed (84093b7). Test PR chowie/ogc-website#1
      got https://deploy-preview-1--ogc-website.netlify.app (noindex header), prod
      unchanged; PR closed unmerged. Manual `netlify deploy` no longer needed.
- [x] Verify demo URL, noindex live — https://ogc-website.netlify.app (robots Disallow + noindex meta confirmed; contact form registered, form detection enabled)

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
Demo live; main auto-deploys, PRs get previews.
Still need: welcome text, any other service times, hero photo.
Re-shoot docs/screenshots/ after visual changes.
