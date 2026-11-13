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
