// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import sitemap from '@astrojs/sitemap';
import { sectionStatusPlugin } from './src/lib/section-status.mjs';
import { headersFile, NOT_IN_SITEMAP, sourcesFor } from './src/lib/indexing.mjs';

const allowIndexing = process.env.PUBLIC_ALLOW_INDEXING === 'true';

// Canonical URLs, the sitemap and share links use this address. Netlify sets
// URL to the site's primary domain, so it becomes www.oneidagospel.org when
// that domain is made primary at go-live. Local builds fall back to the demo.
const siteUrl = process.env.URL || 'https://ogc-website.netlify.app';

// <lastmod> from the last commit touching a page's source files. Skipped in a
// shallow clone, where every file would show the clone's date.
const git = (/** @type {string[]} */ ...args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};
const fullHistory = git('rev-parse', '--is-shallow-repository') === 'false';
/** @param {string} pathname */
const lastmodFor = (pathname) => {
  if (!fullHistory) return undefined;
  const files = sourcesFor(pathname).filter((f) => existsSync(f));
  const date = files.length ? git('log', '-1', '--format=%cI', '--', ...files) : '';
  return date || undefined;
};

/**
 * Writes Netlify's `_headers` (X-Robots-Tag: noindex until go-live).
 * @type {import('astro').AstroIntegration}
 */
const netlifyHeaders = {
  name: 'netlify-headers',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const body = headersFile({ allowIndexing });
      if (body) writeFileSync(new URL('_headers', dir), body);
    },
  },
};

export default defineConfig({
  site: siteUrl,
  output: 'static',
  integrations: [
    netlifyHeaders,
    sitemap({
      filter: (page) => !NOT_IN_SITEMAP.includes(new URL(page).pathname),
      serialize: (item) => ({ ...item, lastmod: lastmodFor(new URL(item.url).pathname) }),
    }),
  ],
  markdown: {
    processor: satteri({ hastPlugins: [sectionStatusPlugin] }),
  },
  // Redirects live in public/_redirects (real HTTP 301s on Netlify).
});
