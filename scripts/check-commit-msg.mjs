// Checks that commit messages follow Conventional Commits 1.0.0
// (https://www.conventionalcommits.org/en/v1.0.0/):
//
//   type(optional scope)!: description
//
//   node scripts/check-commit-msg.mjs <file>         # commit-msg hook
//   node scripts/check-commit-msg.mjs --message "…"  # e.g. a PR title
//   node scripts/check-commit-msg.mjs --range a..b   # every commit in a range
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// The usual types, plus this repo's `content` (site content edits) and
// `release` (written by scripts/release.mjs).
export const TYPES = [
  'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test',
  'build', 'ci', 'chore', 'revert', 'content', 'release',
];
const MAX_HEADER = 100;
const HEADER = new RegExp(`^(${TYPES.join('|')})(\\([^()\\s][^()]*\\))?!?: \\S`);
// Messages git writes itself; allowed through.
const GIT_GENERATED = /^(Merge (branch|pull request|remote-tracking branch|tag) |Revert "|(fixup|squash|amend)! )/;

/**
 * Returns null if the message is fine, otherwise the reason it isn't.
 * `stripComments`: drop `#` lines first, as git does for a commit-msg file.
 */
export function checkMessage(message, { stripComments = false } = {}) {
  const header = message
    .split('\n')
    .find((line) => line.trim() && !(stripComments && line.startsWith('#')))
    ?.trimEnd();
  if (!header) return 'empty commit message';
  if (GIT_GENERATED.test(header)) return null;
  if (!HEADER.test(header)) {
    return `"${header}" is not "type(scope): description"; type is one of: ${TYPES.join(', ')}`;
  }
  if (header.length > MAX_HEADER) return `header is ${header.length} characters (max ${MAX_HEADER})`;
  return null;
}

function main(args) {
  const [flag, value] = args;
  let messages;
  let stripComments = false;
  if (flag === '--message' && value !== undefined) {
    messages = [value];
  } else if (flag === '--range' && value) {
    let out;
    try {
      out = execFileSync('git', ['log', '--no-merges', '--format=%B%x00', value], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
    } catch {
      return 2; // git already printed why
    }
    // Each commit is "<message>\0\n"; the last split piece is the trailing newline.
    messages = out.split('\0').slice(0, -1).map((m) => m.replace(/^\n/, ''));
  } else if (flag && !flag.startsWith('--')) {
    messages = [readFileSync(flag, 'utf8')];
    stripComments = true;
  } else {
    console.error('usage: check-commit-msg.mjs <file> | --message "<text>" | --range <a..b>');
    return 2;
  }

  let failed = 0;
  for (const message of messages) {
    const problem = checkMessage(message, { stripComments });
    if (problem) {
      failed++;
      console.error(`✗ ${problem}`);
    }
  }
  if (failed) {
    console.error('See https://www.conventionalcommits.org/en/v1.0.0/ — e.g. "feat: add events page", "fix(nav): close menu on tap".');
    return 1;
  }
  console.log(`✓ ${messages.length} message(s) follow Conventional Commits`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)));
}
