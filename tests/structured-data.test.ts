import { test } from 'node:test';
import assert from 'node:assert/strict';
import { breadcrumbJsonLd, churchJsonLd, e164ish, eventJsonLd, serialize, websiteJsonLd } from '../src/lib/structured-data.ts';
import { localIso } from '../src/lib/time.ts';
import raw from '../src/data/site.json' with { type: 'json' };

const SITE = 'https://www.example.org';

test('localIso writes church time with the right UTC offset', () => {
  assert.equal(localIso(new Date('2026-12-06T14:15:00Z')), '2026-12-06T09:15:00-05:00'); // EST
  assert.equal(localIso(new Date('2026-07-05T14:30:00Z')), '2026-07-05T10:30:00-04:00'); // EDT
});

test('phone numbers get the +1 international form', () => {
  assert.equal(e164ish('517.627.7112'), '+1-517-627-7112');
  assert.equal(e164ish('(517) 627-7112'), '+1-517-627-7112');
});

test('the church node uses site.json, typed Church + Organization', () => {
  const c = churchJsonLd(raw, SITE);
  assert.deepEqual(c['@type'], ['Church', 'Organization']);
  assert.equal(c.name, raw.name);
  assert.equal(c.url, `${SITE}/`);
  assert.deepEqual(c.address, {
    '@type': 'PostalAddress', streetAddress: raw.address.street, addressLocality: raw.address.city,
    addressRegion: raw.address.state, postalCode: raw.address.zip, addressCountry: 'US',
  });
  assert.deepEqual(c.sameAs, raw.social.map((s) => s.url));
  assert.ok(!('geo' in c) && !('logo' in c), 'geo and logo are not guessed');
  assert.equal(websiteJsonLd(raw, SITE).url, `${SITE}/`);
});

test('an event has Google\'s required name, startDate and physical location', () => {
  const e = eventJsonLd(
    { title: 'Membership Class', start: new Date('2026-12-06T14:15:00Z'), location: 'Meeting Room' },
    `${SITE}/events/x/`, raw, SITE,
  );
  assert.equal(e.name, 'Membership Class');
  assert.equal(e.startDate, '2026-12-06T09:15:00-05:00');
  const loc = e.location as { name: string; address: { streetAddress: string } };
  assert.equal(loc.name, `Meeting Room, ${raw.name}`);
  assert.equal(loc.address.streetAddress, raw.address.street);
  assert.ok(!('eventAttendanceMode' in e), 'Google removed online-event properties');
  const away = eventJsonLd({ title: 'Picnic', start: new Date(), address: '1 Park Rd, Lansing, MI' }, `${SITE}/e/`, raw, SITE);
  assert.equal((away.location as { address: string }).address, '1 Park Rd, Lansing, MI');
});

test('breadcrumbs need two crumbs, and the last one has no item', () => {
  assert.equal(breadcrumbJsonLd([{ name: 'Home', url: `${SITE}/` }]), undefined);
  const b = breadcrumbJsonLd([{ name: 'Home', url: `${SITE}/` }, { name: 'About', url: `${SITE}/about/` }])!;
  const items = b.itemListElement as Record<string, unknown>[];
  assert.deepEqual(items.map((i) => i.position), [1, 2]);
  assert.equal(items[0].item, `${SITE}/`);
  assert.ok(!('item' in items[1]));
});

test('serialized JSON-LD cannot close its script tag', () => {
  const out = serialize({ name: '</script><script>alert(1)</script>' });
  assert.ok(!out.includes('</script>'));
  assert.equal(JSON.parse(out).name, '</script><script>alert(1)</script>');
});
