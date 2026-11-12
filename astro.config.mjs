// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { sectionStatusPlugin } from './src/lib/section-status.mjs';

export default defineConfig({
  // Replace with the real domain at go-live.
  site: 'https://ogc-website.netlify.app',
  output: 'static',
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
