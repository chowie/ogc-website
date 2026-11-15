// Search descriptions repeat a few facts (service times) that the page itself
// reads from src/data/site.json. If site.json changes, the description has to
// change with it, so every time in a description must still appear either in
// site.json or in that file's own copy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const site = readFileSync('src/data/site.json', 'utf8');
const TIME = /\b\d{1,2}(?::\d{2})?\s?[ap]\.m\./g;

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : e.name.endsWith('.md') ? [join(dir, e.name)] : [],
  );

test('times in search descriptions match site.json or the page copy', () => {
  for (const file of [...files('src/content/pages'), ...files('src/content/events')]) {
    const src = readFileSync(file, 'utf8');
    const description = src.match(/^description:\s*"(.*)"\s*$/m)?.[1];
    if (!description) continue;
    const rest = src.replace(/^description:.*$/m, '');
    for (const time of description.match(TIME) ?? []) {
      // The page copy may write it without "a.m." ("Wednesday mornings at 9:30").
      const clock = time.replace(/\s?[ap]\.m\./, '');
      assert.ok(site.includes(time) || rest.includes(clock), `${file}: "${time}" in the description isn't in site.json or the page`);
    }
  }
});
