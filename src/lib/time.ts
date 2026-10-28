// Date math in the church's local time zone, so a 9:30 AM weekly event stays
// at 9:30 AM across daylight-saving changes.
export const TZ = 'America/Detroit';

const WEEK = 7 * 24 * 60 * 60 * 1000;

function wallClock(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hourCycle: 'h23',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { y: get('year'), m: get('month'), d: get('day'), h: get('hour'), mi: get('minute'), s: get('second') };
}

// Milliseconds the local wall clock is ahead of UTC at `date` (negative in Michigan).
function offset(date: Date) {
  const w = wallClock(date);
  return Date.UTC(w.y, w.m - 1, w.d, w.h, w.mi, w.s) - (date.getTime() - date.getMilliseconds());
}

// Same local time of day, `days` calendar days later.
export function addLocalDays(date: Date, days: number) {
  const w = wallClock(date);
  const wall = Date.UTC(w.y, w.m - 1, w.d + days, w.h, w.mi, w.s);
  const guess = new Date(wall - offset(date));
  return new Date(wall - offset(guess));
}

// First weekly occurrence that hasn't ended by `now`, or undefined once past `until`.
export function nextWeekly(start: Date, end: Date | undefined, now: Date, until?: Date) {
  const duration = end ? end.getTime() - start.getTime() : 0;
  let weeks = Math.max(0, Math.floor((now.getTime() - start.getTime() - duration) / WEEK));
  let occ = addLocalDays(start, weeks * 7);
  while (occ.getTime() + duration < now.getTime()) occ = addLocalDays(start, ++weeks * 7);
  if (until && occ > endOfLocalDay(until)) return undefined;
  return { start: occ, end: end ? new Date(occ.getTime() + duration) : undefined };
}

// `until: 2026-12-16` means "through that day" in local time.
function endOfLocalDay(date: Date) {
  const w = wallClock(date);
  const isMidnightUtc = date.getUTCHours() === 0 && date.getUTCMinutes() === 0;
  // Date-only values parse as UTC midnight; treat them as that calendar day.
  const [y, m, d] = isMidnightUtc ? [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()] : [w.y, w.m, w.d];
  const wall = Date.UTC(y, m - 1, d, 23, 59, 59);
  return new Date(wall - offset(new Date(wall)));
}
