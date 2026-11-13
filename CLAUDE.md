# CLAUDE.md

Astro 7 static site for Oneida Gospel Church (prototype replacement for the
church's Wix site). README.md is the human guide and the source of truth for
content editing, the sermon import, deploy and releasing. This file is a
quick index into it plus the things that are easy to get wrong.
Machine-specific setup (paths, logins) lives in `CLAUDE.local.md` (git-ignored).

## Environment

- **Node 22** (`.nvmrc`; Netlify pins 22.23.4), via nvm.
- **One-time per clone:** `git config include.path ../.gitconfig`. It sets the
  GitHub no-reply commit email and `core.hooksPath = .githooks`:
  `commit-msg` checks Conventional Commits, and both `commit-msg` and
  `pre-commit` then run the clone's own `.git/hooks/` hook, if executable.
- No `.env` needed locally. Configuration that exists:

  | Variable | Where | Purpose |
  |---|---|---|
  | `PUBLIC_ALLOW_INDEXING` | Netlify env | `true` at go-live; unset keeps the `X-Robots-Tag: noindex` header + `noindex` meta (crawling stays allowed) |
  | `RELEASE_TAG` | Netlify env | Pin production to an older tag (rollback); unset = newest |
  | `NETLIFY_BUILD_HOOK` | GitHub secret | Used by the daily-rebuild Action |

## Commands (details in README)

| When | Run |
|---|---|
| Local dev server (http://localhost:4321) | `npm run dev` |
| Unit tests (`node --test tests/*.test.ts`) | `npm test` |
| Type check + build to `dist/` | `npm run build` |
| **Before every push**, and the release gate | `npm run verify` (test + build) |
| Pull new YouTube sermons by hand | `npm run sermons:import` (then branch + PR) |
| Check a commit message / PR title | `node scripts/check-commit-msg.mjs --message "…"` |
| Cut a release (**Chris only**, puts it live) | `npm run release -- patch\|minor\|major\|X.Y.Z [--dry-run]` |

## Where things live

- `src/content/{team,sermons,events}/`: one Markdown file per item, checked
  against the schema in `src/content.config.ts` (a bad file fails the build
  and names itself).
- `src/data/site.json`: site-wide settings, validated by the schema in
  `src/lib/site.ts` (which also exports the `allowIndexing` flag).
- `src/lib/content.ts`: collection queries (`getTeam`, `getSermons`,
  `getUpcomingEvents`) and helpers. `src/lib/time.ts`: DST-safe weekly-event
  math (America/Detroit), unit-tested.
- `scripts/`: `import-sermons.mjs`, `release.mjs`, `build-release.sh`
  (production build of the newest tag), `check-commit-msg.mjs`.
- `.github/workflows/`: `import-sermons` (twice a day; adds sermons through its
  own PR, which it merges), `daily-rebuild` (drops past events), `pr-checks`
  (Conventional Commits).
- `tasks/todo.md` (plan, decisions, "Stopped Here") and `tasks/lessons.md`
  (rules from past corrections): read both at session start.

## How deploys work

- **Production = newest `vX.Y.Z` tag**, not `main`. Merging to `main` changes
  nothing live; `npm run release` does.
- **Deploy previews** (one per PR) build the PR's commit with `npm run verify`.
  This is the only place CI runs the tests. Netlify adds a "Deploy Preview
  ready!" status and a comment with the URL:
  `https://deploy-preview-<PR#>--ogc-website.netlify.app`.
- `[skip netlify]` in a commit message skips the Netlify build, and so also
  skips the preview's tests. Use it only on commits with no code or content
  changes, and never on the last commit of a PR.

## Change workflow (always)

1. **Never commit to `main`.** A GitHub ruleset requires a PR, requires every
   review conversation to be resolved, and blocks force pushes and deletion.
   The admin role (Chris) bypasses all of it **always**, and Claude acts with
   Chris's credentials, so **the ruleset will not stop Claude**. Never push,
   force-push or delete `main`, never merge with `--admin`, and never run
   `npm run release`: the bypass exists only for Chris's releases. The
   sermon import goes through its own PR. Start each change on a new branch:
   `git switch main && git pull && git switch -c <type>/<short-name>`.
   Rebase/amend only on your own branch.
2. **Conventional Commits** for every commit and the PR title:
   `type(scope)!: description`. Types are `TYPES` in
   `scripts/check-commit-msg.mjs`; use `content` for site content and leave
   `release` to the release script.
3. Run `npm run verify` before pushing.
4. Push and open a PR with `gh pr create` (Conventional Commits title; body:
   what changed, why, how it was checked). Add a line under
   `## [Unreleased]` in `CHANGELOG.md` for user-visible changes only.
5. Wait for checks: **Netlify deploy preview** and **PR checks**. Fix
   failures on the branch.
6. **Code review:** run the `code-review` skill on the PR with `--comment`
   (e.g. `/code-review 12 --comment`). Fix valid findings in new commits, reply
   to each comment (what was fixed in which commit, or why not), then resolve
   the thread (GraphQL `resolveReviewThread`). The ruleset holds the merge
   while any thread is open, except for the admin bypass, so finish this
   before telling Chris the PR is ready.
7. Give Chris the PR link **and the deploy preview URL**. **Don't merge** unless
   Chris says to. After a merge, don't push more commits to that branch;
   start a new branch.

## Gotchas (learned the hard way)

- `git rev-parse --git-path hooks/X` follows `core.hooksPath`, so it points
  back into `.githooks/`. To reach the clone's own hooks use
  `$(git rev-parse --git-common-dir)/hooks/X`. Getting this wrong made the
  hooks call themselves forever.
- Sourcing `nvm.sh` from a plain `sh` hook fails silently; find node by path.
- PRs opened by a workflow with `GITHUB_TOKEN` don't start other workflows, so
  `pr-checks` never runs on the sermon import's PRs. Don't make status checks
  required in the ruleset, or those PRs can't merge.
- Changing GitHub/Netlify account settings through the API is blocked for
  Claude; give Chris the exact UI path instead.
