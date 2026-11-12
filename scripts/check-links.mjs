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
for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const hrefs = [...html.matchAll(/\shref="([^"]*)"/g)].map((m) => m[1].replaceAll('&amp;', '&'));
  pages.set(urlOf(file).replace(/\/$/, '') || '/', { file, ids, hrefs });
}

const problems = [];
for (const [from, { hrefs }] of pages) {
  for (const href of hrefs) {
    if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(href)) continue;
    if (href.startsWith('/_astro/') || /\.(css|js|png|jpe?g|webp|svg|ico|txt|xml|pdf)$/.test(href)) {
      if (!existsSync(join(dist, href))) problems.push(`${from}: missing asset ${href}`);
      continue;
    }
    const [pathPart, fragment] = href.split('#');
    const target = pathPart === '' ? from : pathPart.replace(/\/$/, '') || '/';
    const page = pages.get(target);
    if (!page) {
      problems.push(`${from}: link to missing page ${href}`);
    } else if (fragment && !page.ids.has(decodeURIComponent(fragment))) {
      problems.push(`${from}: link to missing anchor ${href}`);
    }
  }
}

if (problems.length) {
  console.error([...new Set(problems)].map((p) => `✗ ${p}`).join('\n'));
  console.error(`check-links: ${new Set(problems).size} broken link(s) across ${pages.size} pages`);
  process.exit(1);
}
console.log(`check-links: ✓ ${pages.size} pages, all internal links and anchors resolve`);
