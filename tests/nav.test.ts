import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { nav, sectionFor, isCurrentPage } from '../src/data/nav.ts';
import { slugify } from '../src/lib/section-status.mjs';

test('every menu href is unique', () => {
  const hrefs = nav.flatMap((i) => [i.href, ...i.children.map((c) => c.href)]);
  assert.equal(new Set(hrefs).size, hrefs.length);
});

test('every child sits under its parent (sub-page or anchor on the parent page)', () => {
  for (const item of nav) {
    assert.ok(item.children.length > 0, `${item.label} has no children`);
    for (const c of item.children) {
      assert.ok(
        c.href.startsWith(`${item.href}/`) || c.href.startsWith(`${item.href}#`),
        `${c.href} is not under ${item.href}`,
      );
    }
  }
});

test('exactly one call-to-action item', () => {
  assert.equal(nav.filter((i) => i.cta).length, 1);
});

test('every menu anchor matches a heading on its page', () => {
  // Headings come from the page's Markdown (## lines) and from SectionHeading
  // titles in its .astro page, if it has one; both get slugify ids.
  const headingIds = (page: string) => {
    const read = (f: string) => (existsSync(f) ? readFileSync(f, 'utf8') : '');
    const md = read(`src/content/pages/${page}.md`);
    const astro = read(`src/pages/${page}.astro`);
    const titles = [
      ...[...md.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]),
      ...[...astro.matchAll(/<SectionHeading\s+title="([^"]+)"/g)].map((m) => m[1]),
    ];
    return new Set(titles.map(slugify));
  };
  for (const c of nav.flatMap((i) => i.children)) {
    const [path, anchor] = c.href.split('#');
    if (anchor) assert.ok(headingIds(path.slice(1)).has(anchor), `no heading for ${c.href}`);
  }
});

test('sectionFor finds the menu item for nested paths', () => {
  assert.equal(sectionFor('/about/team/andrew-fulton')?.label, 'About');
  assert.equal(sectionFor('/get-connected/men/')?.label, 'Get Connected');
  assert.equal(sectionFor('/'), undefined);
  assert.equal(sectionFor('/aboutus'), undefined);
});

test('isCurrentPage matches pages, never anchors', () => {
  assert.ok(isCurrentPage({ label: 'Our Team', href: '/about/team' }, '/about/team/andrew-fulton'));
  assert.ok(!isCurrentPage({ label: 'FAQ', href: '/plan-your-visit#faq' }, '/plan-your-visit'));
});

test('slugify', () => {
  assert.equal(slugify('New to the Area?'), 'new-to-the-area');
  assert.equal(slugify('Service Times & Location'), 'service-times-and-location');
  assert.equal(slugify("Let Us Know You're Coming"), 'let-us-know-youre-coming');
  assert.equal(slugify('  FAQ  '), 'faq');
});
