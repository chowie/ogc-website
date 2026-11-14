import type { APIRoute } from 'astro';
import { allowIndexing } from '../lib/site';
import { robotsTxt } from '../lib/indexing.mjs';

export const GET: APIRoute = () =>
  new Response(robotsTxt({ allowIndexing, sitemapUrl: new URL('sitemap-index.xml', import.meta.env.SITE).href }), {
    headers: { 'Content-Type': 'text/plain' },
  });
