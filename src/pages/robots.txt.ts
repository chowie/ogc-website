import type { APIRoute } from 'astro';
import { allowIndexing } from '../lib/site';

export const GET: APIRoute = () =>
  new Response(`User-agent: *\n${allowIndexing ? 'Allow' : 'Disallow'}: /\n`, {
    headers: { 'Content-Type': 'text/plain' },
  });
