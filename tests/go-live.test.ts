import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { goLiveBlockers, findPlaceholders } from '../src/lib/go-live.mjs';

test('go-live is blocked by placeholder sections and page copy, and only by those', () => {
  type Page = Parameters<typeof goLiveBlockers>[0][number];
  const pages: Page[] = [
    { id: 'contact', data: { origin: { status: 'real' }, sections: { map: { status: 'placeholder' }, office: { status: 'real' } } } },
    { id: 'give', data: { origin: { status: 'rewritten' } } },
    { id: 'index', data: { origin: { status: 'placeholder' }, sections: { welcome: { status: 'placeholder' } } } },
  ];
  assert.deepEqual(goLiveBlockers(pages), ['/contact#map', '/: page copy (origin)', '/#welcome']);
  assert.deepEqual(goLiveBlockers([pages[1]]), []);
});

test('findPlaceholders reads frontmatter from nested page files', () => {
  const dir = mkdtempSync(join(tmpdir(), 'pages-'));
  mkdirSync(join(dir, 'about'));
  writeFileSync(join(dir, 'about', 'team.md'), '---\ntitle: Team\norigin:\n  status: real\nsections:\n  staff:\n    status: placeholder\n    on: 2026-11-12\n---\n\nBody\n');
  writeFileSync(join(dir, 'give.md'), '---\ntitle: Give\norigin:\n  status: rewritten\n---\n');
  assert.deepEqual(findPlaceholders(dir), ['/about/team#staff']);
});

test('the real pages are read without errors', () => {
  assert.ok(Array.isArray(findPlaceholders()));
});
