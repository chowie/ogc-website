// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import sitemap from '@astrojs/sitemap';
import { sectionStatusPlugin } from './src/lib/section-status.mjs';
import { headersFile, NOT_IN_SITEMAP, sourcesFor } from './src/lib/indexing.mjs';

const allowIndexing = process.env.PUBLIC_ALLOW_INDEXING === 'true';

// Canonical URLs, the sitemap and share links use this address. In
// production Netlify sets URL to the site's primary domain, so it becomes
// www.oneidagospel.org when that domain is made primary at go-live. Deploy
// previews and branch deploys use their own address (DEPLOY_PRIME_URL; URL is
// still production there), so a preview's share image is the preview's own.
// Local builds fall back to the demo.
const siteUrl =
  (process.env.CONTEXT !== 'production' && process.env.DEPLOY_PRIME_URL) ||
  process.env.URL ||
  'https://ogc-website.netlify.app';

// <lastmod> from the last commit touching a page's source files, read from
// one `git log` pass. Skipped in a shallow clone, where every file would show
// the clone's date.
const git = (/** @type {string[]} */ ...args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).trim();
  } catch {
    return '';
  }
};
const fullHistory = git('rev-parse', '--is-shallow-repository') === 'false';

/**
 * File or directory -> its newest commit, as { order, date }. `order` is the
 * commit's position in `git log` (0 = newest), so a page with several sources
 * gets the same commit `git log -1 -- <sources>` would pick. A directory
 * counts every file under it.
 * @type {Map<string, { order: number, date: string }>}
 */
const lastCommit = new Map();
if (fullHistory) {
  let order = -1;
  let date = '';
  for (const line of git('-c', 'core.quotePath=off', 'log', '--format=%x00%cI', '--name-only').split('\n')) {
    if (line.startsWith('\0')) {
      order++;
      date = line.slice(1);
    } else if (line) {
      for (let path = line; path; path = path.slice(0, Math.max(path.lastIndexOf('/'), 0))) {
        if (!lastCommit.has(path)) lastCommit.set(path, { order, date });
      }
    }
  }
}
/** @param {string} pathname */
const lastmodFor = (pathname) => {
  const hits = sourcesFor(pathname).filter((f) => existsSync(f)).map((f) => lastCommit.get(f)).filter((c) => c !== undefined);
  return hits.length ? hits.reduce((a, b) => (b.order < a.order ? b : a)).date : undefined;
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
