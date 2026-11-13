# OGC Website Prototype — Plan

Replace the Wix site with an Astro static site. Content lives in Markdown/JSON
(`src/content/`, `src/data/`) so volunteers (later via a CMS) and Chris (locally
via git) edit the same files. GitHub → Netlify: production = newest release
tag, PRs = previews.

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

## Versioning + deploy from tag (2026-10-28)
SemVer 2.0.0, tags `vX.Y.Z`; live site = newest release tag, never main HEAD.
Bump rules + steps in README "Releasing". Chris decided: auto-imported
sermons wait for the next manual release (prototype; needn't be current);
current main becomes v0.1.0.
- [x] `npm test` (node:test, event date math, DST both ways, until cutoff);
      `npm run verify` = test + check + build. Added @types/node (fresh
      clones failed `astro check` on node:test imports without it).
- [x] CHANGELOG.md (Keep a Changelog 1.1.0).
- [x] `npm run release -- patch|minor|major|X.Y.Z [--dry-run]`.
- [x] Netlify production context → scripts/build-release.sh builds the newest
      vX.Y.Z tag in a git worktree (RELEASE_TAG env pins one for rollback);
      deploy previews unchanged. Tested in a fresh clone: unreleased HEAD
      change not published, -rc tag ignored, RELEASE_TAG pin works.
- [x] v0.1.0 released (2528453) and live. Netlify log confirms
      "build-release: building v0.1.0". The live site no longer follows main HEAD.

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

## PR workflow + Conventional Commits + Claude review (2026-11-12) — done
Goal: work like ogc-asana-intake-form (branch → push → PR → Netlify preview),
plus Conventional Commits and a Claude code review on each PR.
Decisions: review runs locally (`/code-review <n> --comment`, no Action or
secret). Chris's ruleset `default-branch-ruleset` on main: PR required
(0 approvals, conversations must be resolved; merge/squash/rebase allowed),
no force push or deletion. Admin bypass is unconditional and Claude uses
Chris's credentials, so never push, force-push or delete main; the bypass is
for `npm run release` only.
- [x] PR #1: `scripts/check-commit-msg.mjs` + `.githooks/` (commit-msg,
      pre-commit chaining) + `pr-checks.yml`; previews run `npm run verify`;
      README "Contributing". Review: 10 findings, all fixed.
- [x] PR #2: sermon import opens and squash-merges its own PR (preflight stops
      on a stuck import PR; runs `npm run verify` first). Review: 8 findings.
      End-to-end test: run on the branch re-added a removed sermon via bot
      PR #3, merged automatically.
- [x] PR #4: `CLAUDE.md` quick reference (environment, commands, deploys,
      gotchas); machine-specific notes in git-ignored `CLAUDE.local.md`.
      Review: 9 findings.
- [x] Chris: "Allow GitHub Actions to create and approve pull requests" on.
- [x] Chris: Netlify deploy notifications (commit status + PR comment) on;
      PRs now get "Deploy Preview ready!" and a link comment.
- [x] nvm default was `lts/*` → uninstalled Node 26, so new shells had no
      npm; set `nvm alias default 22`.

## Demo on the proposed menu structure (2026-11-12, plan approved)
Source: Notion "Website Outline: Menu Structure and Page Content". Full plan:
~/.claude/plans/zazzy-munching-aurora.md. Decisions: placeholders labeled +
hidden /content-status page; forms really submit, marked "demo — not
monitored"; no photos of children until a consent policy exists; Chris
reviews rewritten copy on the PR preview (statement of faith verbatim,
plain-language summary marked for elder review).
- [x] PR 1 `feat/nav-structure`: nav.ts, dropdown header + footer, every route
      (Markdown `pages` collection + catch-all route), redirects, status
      badges, /content-status, link checker. PR #7: review (10 findings)
      fixed in f848e7c; merged 2026-11-12
- [x] PR 2 `content/site-content`: demo content + live-site copy rewritten by a
      content specialist, photos (no children), realistic placeholders
      PR #8: merged 2026-11-12
- [x] Source notes on every section (`feat/content-provenance`): origin +
      per-section from/on/note, collapsed "Source" toggle, /content-status
      PR #9: merged 2026-11-12
- [x] Deacons on Our Team (`content/deacons`): Chris, Derek, Jordan with draft
      bios; Bonnie Schulert as Office Manager placeholder. PR #10: merged 2026-11-13
- [x] Our Team: placeholder cards for the Mission Board (4 members) and the
      Treasurer (1). Chris is adding these as proposals (2026-11-13)
- [ ] Welcome video example (Chris, PR #11 comment, 2026-11-13): a proposed
      transcript for the 60–90 second pastor welcome video, plus suggestions
      for staging it (setting, framing, light, sound) and any other
      direction. Presented as an example, not a final script.
- [ ] "Add to calendar" link on every event (Chris, PR #11 comment): on event
      pages, tiles and the calendar list (e.g. an .ics download plus Google
      Calendar link; weekly events as a repeating entry).
- [ ] Brainstorm, needs refinement before building (Chris, PR #11 comment):
      a "Plan Your Visit mode". Clicking Plan Your Visit turns it on; while
      the visitor browses, they can add things to a custom itinerary (e.g.
      Sunday School for their kids, a class, talking to a specific person, or
      meeting someone while they're there). Anything that involves a specific
      person must reach the office so it can be coordinated. Open questions:
      where the itinerary is kept, how it's sent (likely with the visit
      form), and who receives and coordinates it.
- [x] PR 3 `feat/home-forms-events`: outline home page, 4 forms, event pages +
      share buttons. PR #11: review (10 findings) fixed in a1172b2; merged 2026-11-13
- [ ] After merge: Chris decides demo from preview vs `npm run release -- minor`

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
Demo live = v0.1.0 (production builds the newest release tag; merging to
main publishes nothing until `npm run release`).
Every change: branch → PR → Netlify preview + PR checks → Claude review →
Chris merges (see CLAUDE.md). Exception: the sermon import's bot PRs merge
themselves after `npm run verify`.
Still need: welcome text, any other service times, hero photo.
Re-shoot docs/screenshots/ after visual changes.
Demo build (2026-11-12): PR #7 is ready for Chris. The content specialist's
rewrite is in src/content/pages/ on `content/site-content` (PR 2). Open questions it raised:
Andrew's children's ages, team bios naming children, pastor tenure, the
membership class date. Mission, vision and values now come word for word from the
OGC Operating Procedures (2007), Articles 1-3.
