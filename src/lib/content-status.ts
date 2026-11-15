// Every page and section with its status (real, draft copy, placeholder), in
// menu order, from the pages collection's frontmatter. /content-status shows
// it during the demo; at go-live it's the check that no placeholder is left.
import { getCollection, render } from 'astro:content';
import { nav } from '../data/nav';
import { hasLeadCopy } from './section-status.mjs';

// Sections an .astro page adds (SectionHeading) appear only in frontmatter.
const titleFromId = (id: string) => id.charAt(0).toUpperCase() + id.slice(1).replaceAll('-', ' ');

// Menu order first, then anything else.
const order = nav.flatMap((item) => [item.href, ...item.children.map((c) => c.href)]);
const rank = (url: string) => {
  const i = order.indexOf(url);
  return i === -1 ? order.length : i;
};

export async function getContentStatus() {
  const pages = await Promise.all(
    (await getCollection('pages')).map(async (entry) => {
      const { headings } = await render(entry);
      const url = entry.id === 'index' ? '/' : `/${entry.id}`;
      const fromMarkdown = headings
        .filter((h) => h.depth === 2)
        .map((h) => ({ id: h.slug, title: h.text, origin: entry.data.sections[h.slug] ?? entry.data.origin }));
      const fromPage = Object.entries(entry.data.sections)
        .filter(([id]) => !fromMarkdown.some((s) => s.id === id))
        .map(([id, origin]) => ({ id, title: titleFromId(id), origin }));
      // Section keys link to their anchors, so check-links fails on a key that
      // matches no heading (a typo, or a renamed heading).
      const sections = [...fromPage, ...fromMarkdown].map((s) => ({ ...s, url: `${url}#${s.id}` }));
      // The page's own origin covers its intro and any copy before the first section.
      if (hasLeadCopy(entry.body, entry.data.intro) || !sections.length) {
        sections.unshift({ id: '', title: 'Introduction', url, origin: entry.data.origin });
      }
      return { entry, url, sections };
    }),
  );
  return pages.sort((a, b) => rank(a.url) - rank(b.url));
}

export type ContentStatus = Awaited<ReturnType<typeof getContentStatus>>;
