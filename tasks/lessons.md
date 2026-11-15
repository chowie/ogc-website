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
- **Production functions come from main's checkout** (2026-11-14): Netlify
  bundles `netlify/functions` from the clone it built in, not from the tag
  build-release.sh builds, so the script must copy in the tag's functions
  *and* node_modules. Any new build-time input needs the same check.
- **Kill switches fail closed on a variable we control** (2026-11-14):
  `PUBLIC_ALLOW_INDEXING` may not reach the Functions scope, so the review
  API is off whenever its passcode is unset, not only when indexing is on.
- **Test fact checks against real copy first** (2026-11-14): the first
  description test failed on "9:30" without "a.m."; run new content tests
  against every file before trusting the rule, and prove they catch a change.

## Verbatim quotes: don't carry the source's typos onto the website (2026-11-12)
Quoting the Operating Procedures word for word kept "To BEcome", and Chris
flagged it as a typo. Rule: for adopted church text, keep the wording but fix
plain typos and odd capitalization, and list each fix in the PR body. The one
exception is the statement of faith: change it only with elder approval.
