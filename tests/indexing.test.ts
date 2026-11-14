import { test } from 'node:test';
import assert from 'node:assert/strict';
import { robotsTxt, headersFile } from '../src/lib/indexing.mjs';

const sitemapUrl = 'https://www.example.org/sitemap-index.xml';

test('before go-live: crawling allowed, so crawlers can see the noindex', () => {
  const txt = robotsTxt({ allowIndexing: false, sitemapUrl });
  assert.match(txt, /^User-agent: \*\nAllow: \/\n$/);
  assert.doesNotMatch(txt, /Disallow|Sitemap/);
  assert.equal(headersFile({ allowIndexing: false }), '/*\n  X-Robots-Tag: noindex\n');
});

test('after go-live: sitemap listed, no noindex header', () => {
  assert.match(robotsTxt({ allowIndexing: true, sitemapUrl }), new RegExp(`\\nSitemap: ${sitemapUrl}\\n$`));
  assert.equal(headersFile({ allowIndexing: true }), '');
});

test('sitemap dates each page from its own source files', async () => {
  const { sourcesFor, NOT_IN_SITEMAP } = await import('../src/lib/indexing.mjs');
  assert.ok(sourcesFor('/').includes('src/content/pages/index.md'));
  assert.ok(sourcesFor('/').includes('src/content/sermons'));
  assert.ok(sourcesFor('/about/beliefs/').includes('src/content/pages/about/beliefs.md'));
  assert.ok(sourcesFor('/about/team/andrew-fulton/').includes('src/content/team/andrew-fulton.md'));
  assert.ok(sourcesFor('/events/womens-bible-study/').includes('src/content/events/womens-bible-study.md'));
  assert.ok(sourcesFor('/events/').includes('src/pages/events/index.astro'));
  // List pages are dated by the collections they show.
  assert.ok(sourcesFor('/events/').includes('src/content/events'));
  assert.ok(sourcesFor('/').includes('src/content/events'));
  assert.ok(sourcesFor('/about/team/').includes('src/content/team'));
  assert.ok(sourcesFor('/watch-and-listen/').includes('src/content/sermons'));
  for (const p of NOT_IN_SITEMAP) assert.match(p, /^\/.+\/$/, `${p} must be a /path/ like the sitemap's`);
});
