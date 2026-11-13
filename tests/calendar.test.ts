import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildIcs, calendarLocation, escapeText, foldLine, googleCalendarUrl, toCalendarEvent } from '../src/lib/calendar.ts';

const SITE = 'https://ogc-website.netlify.app';
const CHURCH = '3048 E. Strange Hwy., Grand Ledge, MI 48837';
const stamp = new Date('2026-11-01T12:00:00Z');
const lines = (ics: string) => ics.replace(/\r\n /g, '').split('\r\n'); // unfolded

const oneOff = toCalendarEvent('2026-12-06-membership-class', {
  title: 'Membership Class',
  start: new Date('2026-12-06T09:15:00-05:00'),
  location: 'Meeting Room, off the chapel',
  summary: 'Bring your questions.',
}, SITE, CHURCH);

const weekly = toCalendarEvent('womens-bible-study', {
  title: "Women's Bible Study",
  start: new Date('2026-09-16T09:30:00-04:00'),
  end: new Date('2026-09-16T11:00:00-04:00'),
  location: 'Oneida Gospel Church',
  repeat: 'weekly',
  until: new Date('2026-12-16'), // date-only, as YAML gives it
}, SITE, CHURCH);

test('one-off event: UTC times, 1-hour default end, URL and stable UID', () => {
  const ics = buildIcs(oneOff, stamp);
  assert.ok(ics.endsWith('\r\n'));
  assert.ok(!/[^\r]\n/.test(ics), 'every line ends in CRLF');
  const l = lines(ics);
  assert.ok(l.includes('DTSTART:20261206T141500Z'));
  assert.ok(l.includes('DTEND:20261206T151500Z'));
  assert.ok(l.includes('DTSTAMP:20261101T120000Z'));
  assert.ok(l.includes('UID:2026-12-06-membership-class@ogc-website.netlify.app'));
  assert.ok(l.includes('SEQUENCE:0'));
  assert.ok(l.includes('URL:https://ogc-website.netlify.app/events/2026-12-06-membership-class'));
  assert.ok(l.includes('LOCATION:Meeting Room\\, off the chapel\\, 3048 E. Strange Hwy.\\, Grand Ledge\\, MI 48837'));
  assert.ok(l.includes('DESCRIPTION:Bring your questions.\\n\\nhttps://ogc-website.netlify.app/events/2026-12-06-membership-class'));
  assert.ok(!ics.includes('VTIMEZONE') && !ics.includes('RRULE'));
});

test('escapeText escapes backslash, semicolon, comma and newlines', () => {
  assert.equal(escapeText('a\\b; c, d\ne\r\nf'), 'a\\\\b\\; c\\, d\\ne\\nf');
});

test('foldLine folds at 75 octets without splitting a character', () => {
  const folded = foldLine(`DESCRIPTION:${'é'.repeat(100)}`);
  const parts = folded.split('\r\n');
  assert.ok(parts.length > 1);
  for (const p of parts) assert.ok(new TextEncoder().encode(p).length <= 75, p);
  for (const p of parts.slice(1)) assert.ok(p.startsWith(' '));
  assert.equal(folded.replace(/\r\n /g, ''), `DESCRIPTION:${'é'.repeat(100)}`);
  assert.equal(foldLine('SHORT:line'), 'SHORT:line');
});

test('weekly event: local TZID times, RRULE with UNTIL at end of that day, VTIMEZONE', () => {
  const l = lines(buildIcs(weekly, stamp));
  assert.ok(l.includes('DTSTART;TZID=America/Detroit:20260916T093000'));
  assert.ok(l.includes('DTEND;TZID=America/Detroit:20260916T110000'));
  // 23:59:59 EST on Dec 16 is 04:59:59 UTC on Dec 17
  assert.ok(l.includes('RRULE:FREQ=WEEKLY;UNTIL=20261217T045959Z'));
  assert.ok(l.includes('BEGIN:VTIMEZONE') && l.includes('TZID:America/Detroit'));
  assert.ok(l.includes('RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU'));
  assert.ok(l.includes('RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU'));
});

test('weekly UNTIL ends a Thursday series before Dec 17 (same rule as the event list)', () => {
  const thursday = { ...weekly, start: new Date('2026-09-17T19:00:00-04:00'), end: undefined };
  const l = lines(buildIcs(thursday, stamp));
  // Dec 17's 7 PM EST meeting starts at 2026-12-18T00:00Z, after UNTIL.
  assert.ok(l.includes('RRULE:FREQ=WEEKLY;UNTIL=20261217T045959Z'));
});

test('weekly event without until repeats with no end', () => {
  const l = lines(buildIcs({ ...weekly, until: undefined }, stamp));
  assert.ok(l.includes('RRULE:FREQ=WEEKLY'));
});

test('Google Calendar URL for a one-off event', () => {
  const url = new URL(googleCalendarUrl(oneOff));
  assert.equal(url.origin + url.pathname, 'https://calendar.google.com/calendar/render');
  const p = url.searchParams;
  assert.equal(p.get('action'), 'TEMPLATE');
  assert.equal(p.get('text'), 'Membership Class');
  assert.equal(p.get('dates'), '20261206T141500Z/20261206T151500Z');
  assert.equal(p.get('location'), 'Meeting Room, off the chapel, 3048 E. Strange Hwy., Grand Ledge, MI 48837');
  assert.equal(p.get('details'), 'Bring your questions.\n\nhttps://ogc-website.netlify.app/events/2026-12-06-membership-class');
  assert.equal(p.get('ctz'), null);
  assert.equal(p.get('recur'), null);
});

test('Google Calendar URL for a weekly event uses church time and a repeat rule', () => {
  const p = new URL(googleCalendarUrl(weekly)).searchParams;
  assert.equal(p.get('dates'), '20260916T093000/20260916T110000');
  assert.equal(p.get('ctz'), 'America/Detroit');
  assert.equal(p.get('recur'), 'RRULE:FREQ=WEEKLY;UNTIL=20261217T045959Z');
});

test('calendar location: church address by default, own address off-site, address alone without a location', () => {
  const data = { title: 'X', start: new Date('2026-12-06T09:15:00-05:00') };
  const loc = (extra: object) => toCalendarEvent('x', { ...data, ...extra }, SITE, CHURCH).location;
  assert.equal(loc({ location: 'Sanctuary' }), `Sanctuary, ${CHURCH}`);
  assert.equal(loc({ location: 'Lansing Center', address: '333 E. Michigan Ave., Lansing, MI 48933' }),
    'Lansing Center, 333 E. Michigan Ave., Lansing, MI 48933');
  assert.equal(loc({}), CHURCH);
  assert.equal(calendarLocation(undefined, CHURCH), CHURCH);
});
