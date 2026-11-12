# Lessons

Rules from corrections, so the same mistake doesn't happen twice. When a
rule becomes part of the standing workflow it moves to CLAUDE.md and only a
one-line pointer stays here. Project gotchas (hooks, nvm, GITHUB_TOKEN PRs)
are in CLAUDE.md's Gotchas section.

- Preview URL with every PR (2026-11-12) → CLAUDE.md step 7.
- Don't push to a merged PR's branch (2026-11-12) → CLAUDE.md step 7.
- A bypass reaches further than it looks: the admin bypass covers pushes
  *and* merges, and Claude acts as admin (2026-11-12) → CLAUDE.md steps 1, 6.
- **Run a command before documenting it** (2026-11-12): a documented one-liner
  parsed `ls` output, and `ls` is aliased with color codes in Chris's shell,
  so the path broke. Use a glob (`printf '%s\n' dir/v22.*`) or `command ls`.
