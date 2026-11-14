// What search engines are told, from one flag (PUBLIC_ALLOW_INDEXING).
//
// Until go-live, crawlers may fetch every page but are told not to index it,
// by an X-Robots-Tag header on every response plus a robots meta tag. Crawling
// stays allowed on purpose: a crawler blocked by robots.txt never sees the
// noindex, and Google can still list a blocked URL it finds linked elsewhere
// (https://developers.google.com/search/docs/crawling-indexing/block-indexing).

/** robots.txt body. The sitemap is listed only once the site may be indexed. */
export function robotsTxt({ allowIndexing, sitemapUrl }) {
  const lines = ['User-agent: *', 'Allow: /'];
  if (allowIndexing && sitemapUrl) lines.push('', `Sitemap: ${sitemapUrl}`);
  return lines.join('\n') + '\n';
}

/**
 * Netlify `_headers` file body, or '' for none. Netlify itself adds
 * `X-Robots-Tag: noindex` only to deploy previews, not production
 * (https://docs.netlify.com/site-deploys/deploy-previews/).
 */
export function headersFile({ allowIndexing }) {
  return allowIndexing ? '' : '/*\n  X-Robots-Tag: noindex\n';
}

// Pages left out of the sitemap: they carry noindex for good (Base's
// `noindex` prop), so listing them would send search engines mixed signals.
export const NOT_IN_SITEMAP = ['/thanks/', '/content-status/'];

/**
 * The source files whose last commit dates a page for the sitemap's
 * <lastmod>. Only files that exist are dated; a page with none gets no
 * <lastmod>, rather than a guessed one.
 */
export function sourcesFor(pathname) {
  const p = pathname.replace(/^\/|\/$/g, '');
  const name = p || 'index';
  const files = [`src/content/pages/${name}.md`, `src/pages/${name}.astro`, `src/pages/${name}/index.astro`];
  const team = p.match(/^about\/team\/([^/]+)$/);
  if (team) files.push(`src/content/team/${team[1]}.md`);
  const event = p.match(/^events\/([^/]+)$/);
  if (event) files.push(`src/content/events/${event[1]}.md`);
  // List pages change with the collections they show. Site-wide chrome (the
  // layout, the menu, the footer) is left out on purpose: Google wants
  // <lastmod> to be "the last significant update to the page", and a chrome
  // tweak would re-date every page at once.
  if (p === '' || p === 'watch-and-listen') files.push('src/content/sermons');
  if (p === '' || p === 'events') files.push('src/content/events');
  if (p === 'about/team') files.push('src/content/team');
  // The home page's Church and WebSite structured data come from site.json.
  if (p === '') files.push('src/data/site.json');
  return files;
}
