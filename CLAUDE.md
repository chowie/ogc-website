# CLAUDE.md

Astro static site for Oneida Gospel Church. README.md covers commands,
content editing, deploy and releasing; read it first.

## Change workflow (always)

1. **Never commit to `main`.** Start each change on a new branch from an
   up-to-date `main`: `git switch main && git pull && git switch -c <type>/<short-name>`.
   The only things that land on `main` directly are the sermon-import Action and
   `npm run release` (which Chris runs). A GitHub ruleset blocks force pushes
   to and deletion of `main`; rebase/amend only on your own branch.
2. **Conventional Commits** for every commit and the PR title:
   `type(scope)!: description`. Types are listed in `scripts/check-commit-msg.mjs`
   (`TYPES`); use `content` for site content and leave `release` to the
   release script. The `commit-msg` hook enforces this locally if
   `git config include.path ../.gitconfig` is set.
3. Run `npm run verify` before pushing. Node comes from nvm and isn't on
   PATH in non-interactive shells: `export PATH=~/.nvm/versions/node/v22.23.4/bin:$PATH`.
4. Push and open a PR with `gh pr create` (Conventional Commits title; body:
   what changed, why, how it was checked). Add a line under
   `## [Unreleased]` in `CHANGELOG.md` for user-visible changes.
5. Wait for checks: **Netlify deploy preview** (runs `npm run verify`, posts
   the preview URL) and **PR checks** (Conventional Commits). Fix failures
   on the branch.
6. **Code review:** after opening the PR, run the `code-review` skill on it
   with `--comment` (e.g. `/code-review 12 --comment`) so findings are posted
   as PR comments. Fix valid findings in new commits on the branch and reply to
   the ones you don't fix with your reasoning.
7. Give Chris the PR link and the deploy preview URL. **Don't merge** unless
   Chris says to. Merging doesn't publish; releases do.
