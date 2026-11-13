// After `astro build`: checks that every internal link in dist/ points at a
// page that exists and, if it has a #fragment, at an id on that page.
// Run by `npm run verify` (and so by every deploy preview).
//
//   node scripts/check-links.mjs [distDir]
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = process.argv[2] ?? 'dist';

const htmlFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? htmlFiles(join(dir, e.name)) : e.name.endsWith('.html') ? [join(dir, e.name)] : [],
  );

/** dist/about/team/index.html -> /about/team ; dist/index.html -> / */
const urlOf = (file) => '/' + relative(dist, file).replace(/\\/g, '/').replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');

const pages = new Map();
const problems = [];
for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, 'utf8');
  const idList = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const ids = new Set(idList);
  for (const id of new Set(idList.filter((id, i) => idList.indexOf(id) !== i))) {
    problems.push(`${urlOf(file)}: duplicate id "${id}"`);
  }
  const hrefs = [...html.matchAll(/\shref="([^"]*)"/g)].map((m) => m[1].replaceAll('&amp;', '&'));
  pages.set(urlOf(file).replace(/\/$/, '') || '/', { file, ids, hrefs });
}

for (const [from, { hrefs }] of pages) {
  for (const href of hrefs) {
    if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(href)) continue;
    if (href.startsWith('/_astro/') || /\.(css|js|png|jpe?g|webp|svg|ico|txt|xml|pdf|ics)$/.test(href)) {
      if (!existsSync(join(dist, href))) problems.push(`${from}: missing asset ${href}`);
      continue;
    }
    // Resolve relative hrefs against the page's own URL (pages are dir/index.html).
    const url = new URL(href, `http://site${from === '/' ? '' : from}/`);
    const target = url.pathname.replace(/\/$/, '') || '/';
    let fragment = url.hash.slice(1);
    try {
      fragment = decodeURIComponent(fragment);
    } catch {
      problems.push(`${from}: badly encoded anchor ${href}`);
      continue;
    }
    const page = pages.get(decodeURI(target));
    if (!page) {
      problems.push(`${from}: link to missing page ${href}`);
    } else if (fragment && !page.ids.has(fragment)) {
      problems.push(`${from}: link to missing anchor ${href}`);
    }
  }
}

// Netlify _redirects: every target must be a built page. A `:slug`
// placeholder must match at least one page under its parent path.
const redirectsFile = join(dist, '_redirects');
let redirects = 0;
if (existsSync(redirectsFile)) {
  for (const [n, raw] of readFileSync(redirectsFile, 'utf8').split('\n').entries()) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const [fromPath, to, status] = line.split(/\s+/);
    const where = `_redirects line ${n + 1}`;
    redirects++;
    if (!fromPath?.startsWith('/') || !to || !/^30[1278]!?$/.test(status ?? '')) {
      problems.push(`${where}: expected "/from /to 301", got "${line}"`);
      continue;
    }
    if (/^https?:/.test(to)) continue;
    const target = to.split('#')[0].replace(/\/$/, '') || '/';
    if (target.includes(':')) {
      const parent = target.slice(0, target.indexOf('/:'));
      if (![...pages.keys()].some((p) => p.startsWith(parent + '/'))) problems.push(`${where}: no pages under ${parent}/`);
    } else if (!pages.has(target)) {
      problems.push(`${where}: redirect to missing page ${to}`);
    }
  }
}

if (problems.length) {
  console.error([...new Set(problems)].map((p) => `✗ ${p}`).join('\n'));
  console.error(`check-links: ${new Set(problems).size} problem(s) across ${pages.size} pages`);
  process.exit(1);
}
console.log(`check-links: ✓ ${pages.size} pages, all internal links and anchors resolve; ${redirects} redirects point at real pages`);
