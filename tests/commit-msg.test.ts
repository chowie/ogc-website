import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkMessage } from '../scripts/check-commit-msg.mjs';

test('accepts conventional headers', () => {
  for (const msg of [
    'feat: add events page',
    'fix(nav): close menu on tap',
    'feat(api)!: drop old feed',
    'content: import new sermons from YouTube',
    'release: v0.1.0',
    'docs: record v0.1.0 release [skip netlify]',
  ]) {
    assert.equal(checkMessage(msg), null, msg);
  }
});

test('ignores git comment lines and leading blanks', () => {
  assert.equal(checkMessage('\n# Please enter the commit message\nchore: tidy\n'), null);
});

test('allows messages git generates', () => {
  for (const msg of ['Merge branch main into feat/x', 'Revert "feat: add x"', 'fixup! feat: add x']) {
    assert.equal(checkMessage(msg), null, msg);
  }
});

test('rejects non-conventional headers', () => {
  for (const msg of [
    'Add events page',
    'feat add events page',
    'feat:add events page',
    'Feat: add events page',
    'feature: add events page',
    'feat(): empty scope',
    '',
    '# only a comment',
    `feat: ${'x'.repeat(100)}`,
  ]) {
    assert.notEqual(checkMessage(msg), null, msg);
  }
});
