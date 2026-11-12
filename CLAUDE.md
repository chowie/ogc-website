# CLAUDE.md

Astro 7 static site for Oneida Gospel Church (prototype replacement for the
church's Wix site). README.md is the human guide: content editing, the
sermon import, deploy and releasing. This file is the quick reference plus
the things that are easy to get wrong.

## Environment

- **Node 22** (`.nvmrc`; Netlify pins 22.23.4). Installed with nvm, whose
  default is `22`. Claude's Bash tool doesn't load nvm, so start shell
  commands with:
  `export PATH=~/.nvm/versions/node/v22.23.4/bin:$PATH`
- **One-time per clone:** `git config include.path ../.gitconfig`. It sets the
  GitHub no-reply commit email and `core.hooksPath = .githooks` (the
  Conventional Commits `commit-msg` hook). Already set in Chris's clone.
- **`gh`** is authenticated as `chowie`. The **Netlify CLI is not installed**;
  for Netlify data, call the API with the token in
  `~/.config/netlify/config.json` (`users[userId].auth.token`). Site ID is in
  `.netlify/state.json`. Netlify team: Funky Bunch.
- No `.env` needed locally. Configuration that exists:

  | Variable | Where | Purpose |
  |---|---|---|
  | `PUBLIC_ALLOW_INDEXING` | Netlify env | `true` at go-live; unset keeps `noindex` + `Disallow: /` |
  | `RELEASE_TAG` | Netlify env | Pin production to an older tag (rollback); unset = newest |
  | `NETLIFY_BUILD_HOOK` | GitHub secret | Used by the daily-rebuild Action |

## Commands

| When | Run |
|---|---|
| Local dev server (http://localhost:4321) | `npm run dev` (`.claude/launch.json` has an `ogc-dev` config) |
| Unit tests (`node --test tests/*.test.ts`) | `npm test` |
| Type check + build to `dist/` | `npm run build` |
| **Before every push**, and the release gate | `npm run verify` (test + build) |
| Pull new YouTube sermons by hand | `npm run sermons:import` (then branch + PR) |
| Check a commit message / PR title | `node scripts/check-commit-msg.mjs --message "…"` |
| Cut a release (**Chris only**, puts it live) | `npm run release -- patch\|minor\|major [--dry-run]` |

## Where things live

- `src/content/{team,sermons,events}/`: one Markdown file per item, checked
  against the schema in `src/content.config.ts` (a bad file fails the build
  and names itself). Site-wide settings: `src/data/site.json`.
- `src/lib/time.ts`: DST-safe weekly-event math (America/Detroit), unit-tested.
  `src/lib/site.ts`: the indexing flag.
- `scripts/`: `import-sermons.mjs`, `release.mjs`, `build-release.sh`
  (production build of the newest tag), `check-commit-msg.mjs`.
- `.github/workflows/`: `import-sermons` (twice a day), `daily-rebuild`
  (drops past events), `pr-checks` (Conventional Commits).
- `tasks/todo.md`: plan, decisions and "Stopped Here". Read it at session start.

## How deploys work

- **Production = newest `vX.Y.Z` tag**, not `main`. Merging to `main` changes
  nothing live; `npm run release` does. Netlify's production context runs
  `scripts/build-release.sh`.
- **Deploy previews** (one per PR) build the PR's commit with `npm run verify`.
  URL: `https://deploy-preview-<PR#>--ogc-website.netlify.app`.
- `[skip netlify]` in a commit message skips the Netlify build (docs-only).

## Change workflow (always)

1. **Never commit to `main`.** A GitHub ruleset requires a PR, requires every
   review conversation to be resolved, and blocks force pushes and deletion.
   Chris (admin) can bypass it for `npm run release`. Start each change on a
   new branch: `git switch main && git pull && git switch -c <type>/<short-name>`.
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
   the thread (GraphQL `resolveReviewThread`; the ruleset blocks merging
   while any thread is open).
7. Give Chris the PR link and the preview URL. **Don't merge** unless
   Chris says to.

## Gotchas (learned the hard way)

- `git rev-parse --git-path hooks/X` follows `core.hooksPath`, so it points
  back into `.githooks/`. To reach the clone's own hooks use
  `$(git rev-parse --git-common-dir)/hooks/X`. Getting this wrong made the
  hooks call themselves forever.
- Sourcing `nvm.sh` from a plain `sh` hook fails silently; find node by path.
- PRs opened by a workflow with `GITHUB_TOKEN` don't start other workflows, so
  `pr-checks` never runs on them. Don't make status checks required in the
  ruleset, or bot PRs (sermon import) can't merge.
- Netlify on this site reports only "checks" (header/redirect rules), not a
  `deploy-preview` commit status or preview comment, unless Chris has enabled
  the GitHub commit-status and PR-comment deploy notifications. Confirm a
  preview with the Netlify API (`/api/v1/deploys/<id>`: `state`, `commit_ref`).
- Changing GitHub/Netlify account settings through the API is blocked for
  Claude; give Chris the exact UI path instead.
