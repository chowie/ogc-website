# Lessons

Rules from corrections, so the same mistake doesn't happen twice.
Project gotchas (hooks, nvm, GITHUB_TOKEN PRs) live in CLAUDE.md.

## Reporting a PR
- **Always give the deploy preview URL with the PR link**, every time, even
  for docs-only PRs (`https://deploy-preview-<PR#>--ogc-website.netlify.app`).
  Chris never got a link for PR #2 (2026-11-12).

## Branches after merge
- **Check `gh pr view <n> --json state` before pushing to an existing PR
  branch.** A commit pushed to `ci/pr-workflow` after PR #1 had merged never
  reached main and needed a new PR (#4). Once merged, start a new branch.

## Verify what you document
- **Run any command before writing it into docs.** The first `CLAUDE.local.md`
  PATH line used `ls`, which is aliased with color codes here and produced
  a broken path. Testing it caught the bug.
