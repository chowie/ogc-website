// A short plain-text summary for AI tools (llmstxt.org), built from
// site.json and the menu so it can't drift from the site. Google says such
// files "neither harm nor help" in Search
// (https://developers.google.com/search/docs/fundamentals/ai-optimization-guide);
// it's here only because it costs nothing to keep accurate.
import type { APIRoute } from 'astro';
import { site, streetAddress } from '../lib/site';
import { nav } from '../data/nav';

export const GET: APIRoute = () => {
  const url = (href: string) => new URL(href.endsWith('/') || href.includes('#') ? href : `${href}/`, import.meta.env.SITE).href;
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.welcome}`,
    '',
    ...site.serviceTimes.map((s) => `- ${s.label}: ${s.day}s, ${s.time}`),
    `- Address: ${streetAddress}`,
    `- Phone: ${site.phone}`,
    ...(site.email ? [`- Email: ${site.email}`] : []),
    '',
    '## Pages',
    '',
    ...nav.flatMap((i) => [`- [${i.label}](${url(i.href)})`, ...i.children.filter((c) => !c.href.includes('#')).map((c) => `  - [${c.label}](${url(c.href)})`)]),
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
