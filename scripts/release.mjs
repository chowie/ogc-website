// Cut a release from main: verify, bump the version, close the CHANGELOG
// section, tag vX.Y.Z and push. Pushing the tag is what puts it live.
//
//   npm run release -- patch|minor|major|X.Y.Z [--dry-run]
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const REPO = 'https://github.com/chowie/ogc-website';
// Release versions only: pre-release (-rc.1) and build (+sha) versions never go live.
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const bump = args.find((a) => !a.startsWith('--'));

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const run = (cmd, ...a) => execFileSync(cmd, a, { stdio: 'inherit' });
const fail = (msg) => {
  console.error(`release: ${msg}`);
  process.exit(1);
};
const parts = (v) => v.split('.').map(Number);
const compare = (a, b) => {
  const [x, y] = [parts(a), parts(b)];
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};

if (!bump) fail('usage: npm run release -- patch|minor|major|X.Y.Z [--dry-run]');

// Only a clean main that matches GitHub can be released.
if (git('branch', '--show-current') !== 'main') fail('switch to main first');
if (git('status', '--porcelain')) fail('commit or stash your changes first');
git('fetch', '--quiet', '--tags', 'origin');
if (git('rev-parse', 'HEAD') !== git('rev-parse', 'origin/main')) {
  fail('main is not in sync with origin/main; pull or push first');
}

const released = git('tag', '--list', 'v*')
  .split('\n')
  .map((t) => t.slice(1))
  .filter((v) => SEMVER.test(v))
  .sort(compare);
const latest = released.at(-1); // undefined before the first release

let next = bump;
if (!SEMVER.test(bump)) {
  const [major, minor, patch] = parts(latest ?? '0.0.0');
  next = { major: `${major + 1}.0.0`, minor: `${major}.${minor + 1}.0`, patch: `${major}.${minor}.${patch + 1}` }[bump];
  if (!next) fail(`"${bump}" is not patch, minor, major or X.Y.Z`);
}
if (latest && compare(next, latest) <= 0) fail(`v${next} is not newer than v${latest}`);

const changelog = readFileSync('CHANGELOG.md', 'utf8');
const unreleased = changelog.match(/^## \[Unreleased\]\n([\s\S]*?)(?=^## \[|^\[unreleased\]:)/m);
if (!unreleased?.[1].trim()) fail('add notes under "## [Unreleased]" in CHANGELOG.md first');

const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Detroit' }).format(new Date());
const versionLink = latest ? `${REPO}/compare/v${latest}...v${next}` : `${REPO}/releases/tag/v${next}`;
const updated = changelog
  .replace(unreleased[0], `## [Unreleased]\n\n## [${next}] - ${date}\n${unreleased[1]}`)
  .replace(/^\[unreleased\]: .*$/m, `[unreleased]: ${REPO}/compare/v${next}...HEAD\n[${next}]: ${versionLink}`);

console.log(`release: v${latest ?? '(none)'} → v${next}`);
if (dryRun) {
  console.log(updated);
  process.exit(0);
}

try {
  run('npm', 'run', 'verify');
} catch {
  fail('verify failed; nothing was changed');
}

writeFileSync('CHANGELOG.md', updated);
run('npm', 'version', next, '--no-git-tag-version', '--allow-same-version');
git('add', 'CHANGELOG.md', 'package.json', 'package-lock.json');
git('commit', '--quiet', '-m', `release: v${next}`);
git('tag', '--annotate', `v${next}`, '-m', `v${next}`);
// Atomic: GitHub gets both the release commit and the tag, or neither.
run('git', 'push', '--atomic', 'origin', 'main', `v${next}`);
console.log(`release: v${next} pushed; Netlify will publish it.`);
