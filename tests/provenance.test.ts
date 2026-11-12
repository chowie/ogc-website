import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeOrigin, originText, formatDate, originFor } from '../src/lib/section-status.mjs';

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
