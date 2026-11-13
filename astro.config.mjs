// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { writeFileSync } from 'node:fs';
import { sectionStatusPlugin } from './src/lib/section-status.mjs';
import { headersFile } from './src/lib/indexing.mjs';

const allowIndexing = process.env.PUBLIC_ALLOW_INDEXING === 'true';

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
  // Replace with the real domain at go-live.
  site: 'https://ogc-website.netlify.app',
  output: 'static',
  integrations: [netlifyHeaders],
  markdown: {
    processor: satteri({ hastPlugins: [sectionStatusPlugin] }),
  },
  // Old URLs from the first demo menu.
  redirects: {
    '/visit': '/plan-your-visit',
    '/sermons': '/watch-and-listen',
    '/team/[slug]': '/about/team/[slug]',
  },
});
