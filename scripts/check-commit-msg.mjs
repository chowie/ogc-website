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
const HEADER = new RegExp(`^(${TYPES.join('|')})(\\([\\w./-]+\\))?!?: \\S`);
// Messages git writes itself; allowed through.
const GIT_GENERATED = /^(Merge |Revert "|(fixup|squash|amend)! )/;

/** Returns null if the message is fine, otherwise the reason it isn't. */
export function checkMessage(message) {
  const header = message
    .split('\n')
    .find((line) => line.trim() && !line.startsWith('#'))
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
  if (flag === '--message' && value !== undefined) {
    messages = [value];
  } else if (flag === '--range' && value) {
    let out;
    try {
      out = execFileSync('git', ['log', '--no-merges', '--format=%B%x00', value], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
    } catch {
      return 2; // git already printed why
    }
    messages = out.split('\0\n').map((m) => m.replace(/\0$/, '')).filter((m) => m.trim());
  } else if (flag && !flag.startsWith('--')) {
    messages = [readFileSync(flag, 'utf8')];
  } else {
    console.error('usage: check-commit-msg.mjs <file> | --message "<text>" | --range <a..b>');
    return 2;
  }

  let failed = 0;
  for (const message of messages) {
    const problem = checkMessage(message);
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
