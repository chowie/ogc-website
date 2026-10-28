import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addLocalDays, nextWeekly } from '../src/lib/time.ts';

const iso = (d: Date | undefined) => d?.toISOString();

test('addLocalDays keeps local time across DST start', () => {
  // 9:30 EST → 9:30 EDT (clocks spring forward Mar 8, 2026)
  assert.equal(iso(addLocalDays(new Date('2026-03-02T09:30:00-05:00'), 7)), '2026-03-09T13:30:00.000Z');
});

test('addLocalDays keeps local time across DST end', () => {
  // 9:30 EDT → 9:30 EST (clocks fall back Nov 1, 2026)
  assert.equal(iso(addLocalDays(new Date('2026-10-28T09:30:00-04:00'), 7)), '2026-11-04T14:30:00.000Z');
});

test('nextWeekly returns the first meeting before the series starts', () => {
  const start = new Date('2026-09-16T09:30:00-04:00');
  assert.equal(iso(nextWeekly(start, undefined, new Date('2026-09-01T00:00:00-04:00'))?.start), iso(start));
});

test('nextWeekly skips a meeting that has already started (no end time)', () => {
  const next = nextWeekly(new Date('2026-09-16T09:30:00-04:00'), undefined, new Date('2026-10-28T12:00:00-04:00'));
  assert.equal(iso(next?.start), '2026-11-04T14:30:00.000Z');
});

test('nextWeekly keeps a meeting that is still in progress', () => {
  const next = nextWeekly(
    new Date('2026-09-16T09:30:00-04:00'),
    new Date('2026-09-16T11:00:00-04:00'),
    new Date('2026-10-28T10:00:00-04:00'),
  );
  assert.equal(iso(next?.start), '2026-10-28T13:30:00.000Z');
  assert.equal(iso(next?.end), '2026-10-28T15:00:00.000Z');
});

test('nextWeekly stops after `until` (date-only, inclusive)', () => {
  const start = new Date('2026-09-16T09:30:00-04:00');
  const now = new Date('2026-10-28T12:00:00-04:00');
  assert.equal(nextWeekly(start, undefined, now, new Date('2026-10-28')), undefined);
  assert.equal(iso(nextWeekly(start, undefined, now, new Date('2026-11-04'))?.start), '2026-11-04T14:30:00.000Z');
});
