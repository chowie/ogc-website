import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeOrigin, originText, formatDate, originFor, hasLeadCopy, sectionStatusPlugin, goLiveBlockers } from '../src/lib/section-status.mjs';

const on = new Date('2026-11-12');

test('formatDate reads YAML dates as calendar days (no time-zone shift)', () => {
  assert.equal(formatDate(on), 'Nov 12, 2026');
  assert.equal(formatDate('2026-01-01'), 'Jan 1, 2026');
});

test('verbatim copy names the source and the date taken', () => {
  assert.equal(
    originText({ status: 'real', from: 'OGC Operating Procedures (2007), Article 1', on }),
    'Verbatim from OGC Operating Procedures (2007), Article 1, taken Nov 12, 2026.',
  );
});

test('site data with no date just names where it comes from', () => {
  assert.equal(originText({ status: 'real', from: 'site settings' }), 'From site settings.');
});

test('rewritten copy adds what was done; URL sources become short links', () => {
  const parts = describeOrigin({ status: 'rewritten', from: 'https://www.oneidagospel.org/about-4/', on, note: 'Condensed.' });
  assert.deepEqual(parts[1], { href: 'https://www.oneidagospel.org/about-4/', text: 'oneidagospel.org/about-4' });
  assert.equal(originText({ status: 'rewritten', from: 'https://www.oneidagospel.org/give', on, note: 'Reworded.' }),
    'Rewritten from oneidagospel.org/give, taken Nov 12, 2026. Reworded.');
});

test('placeholders say generated, with their basis, or that they were made up', () => {
  assert.equal(
    originText({ status: 'placeholder', from: 'Website Outline (Notion)', on, note: 'From the FAQ row.' }),
    'Generated Nov 12, 2026, based on Website Outline (Notion). From the FAQ row.',
  );
  assert.equal(originText({ status: 'placeholder', on }), 'Generated Nov 12, 2026; made up, with no source.');
});

test('a section uses its own origin, else the page default', () => {
  const fm = { origin: { status: 'rewritten' }, sections: { faq: { status: 'placeholder' } } };
  assert.equal(originFor(fm, 'faq').status, 'placeholder');
  assert.equal(originFor(fm, 'other').status, 'rewritten');
});

test('hasLeadCopy: an intro, or Markdown before the first section', () => {
  assert.equal(hasLeadCopy('## Teams\n\nText', undefined), false);
  assert.equal(hasLeadCopy('Opening line.\n\n## Teams', undefined), true);
  assert.equal(hasLeadCopy('## Teams', 'An intro'), true);
  assert.equal(hasLeadCopy(undefined, undefined), false);
});

/** Runs the plugin's h2 visitor on one heading; returns its id and what it inserted. */
function visitHeading(options?: { demoLabels: boolean }) {
  const node: { properties: Record<string, unknown> } = { properties: {} };
  const inserted: unknown[] = [];
  const ctx = {
    data: { astro: { frontmatter: { origin: { status: 'placeholder', on } } } },
    textContent: () => 'Our Story',
    setProperty: (n: typeof node, k: string, v: unknown) => { n.properties[k] = v; },
    insertAfter: (_n: unknown, added: unknown) => inserted.push(added),
  };
  sectionStatusPlugin(options).element.visit(node, ctx);
  return { id: node.properties.id, inserted };
}

test('the demo adds a badge and Source note under each section heading', () => {
  const { id, inserted } = visitHeading();
  assert.equal(id, 'our-story');
  assert.equal(inserted.length, 1);
});

test('the go-live build keeps section ids but adds no demo labels', () => {
  const { id, inserted } = visitHeading({ demoLabels: false });
  assert.equal(id, 'our-story');
  assert.deepEqual(inserted, []);
});

test('go-live is blocked by every placeholder section, and only by those', () => {
  const section = (url: string, title: string, status: string) => ({ url, title, origin: { status } });
  const pages = [
    { url: '/contact', sections: [section('/contact#map', 'Map', 'placeholder'), section('/contact#office', 'Office', 'real')] },
    { url: '/give', sections: [section('/give', 'Introduction', 'rewritten')] },
    { url: '/', sections: [section('/#welcome', 'Welcome', 'placeholder')] },
  ];
  assert.deepEqual(goLiveBlockers(pages), ['/contact#map: Map', '/#welcome: Welcome']);
  assert.deepEqual(goLiveBlockers([pages[1]]), []);
});
