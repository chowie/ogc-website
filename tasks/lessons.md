# Lessons

Rules from corrections, so the same mistake doesn't happen twice. Once a rule
is part of the standing workflow it moves to CLAUDE.md, and this file keeps
only a pointer, so there's one wording to maintain.

- **Preview URL with every PR** (2026-11-12): Chris never got a link for
  PR #2. Now in CLAUDE.md, change workflow step 7.
- **Don't push to a merged PR's branch** (2026-11-12): a commit pushed to
  `ci/pr-workflow` after PR #1 merged never reached main and needed PR #4.
  Now in CLAUDE.md, step 7.
- **Run a command before documenting it** (2026-11-12): a documented shell
  one-liner used `ls`, which is aliased with color codes in Chris's shell and
  produced a broken path. Testing it caught the bug. Prefer globs with
  `printf '%s\n'` over parsing `ls` output.
- **Check how far a bypass really reaches** (2026-11-12): docs said the
  ruleset blocks pushes to main, but the admin bypass is unconditional and
  Claude acts as the admin. Now in CLAUDE.md, step 1.
