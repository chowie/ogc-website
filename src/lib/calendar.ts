// "Add to calendar" for events: an iCalendar (.ics) file for Apple Calendar
// and Outlook, and a Google Calendar link. No imports, so `node --test` can
// load it directly.
//
// One-off events are written in UTC. Weekly events are written in church time
// (America/Detroit) with a VTIMEZONE block, so 9:30 AM stays 9:30 AM across
// daylight-saving changes.

export const CALENDAR_TZ = 'America/Detroit';
const HOUR = 60 * 60 * 1000;

export interface CalendarEvent {
  title: string;
  start: Date;
  /** Defaults to one hour after `start`. */
  end?: Date;
  location?: string;
  summary?: string;
  repeat?: 'weekly';
  /** Last day of a weekly series (inclusive, church time). */
  until?: Date;
  /** The event's page, added to the details. */
  url: string;
  /** Stable across rebuilds, so re-adding updates the same calendar entry. */
  uid: string;
}

/** Event fields from the content collection, plus its page URL and UID. */
export function toCalendarEvent(
  id: string,
  data: Omit<CalendarEvent, 'url' | 'uid'>,
  site: URL | string,
): CalendarEvent {
  const { title, start, end, location, summary, repeat, until } = data;
  return {
    title, start, end, location, summary, repeat, until,
    url: new URL(`/events/${id}`, site).href,
    uid: `${id}@${new URL(site).host}`,
  };
}

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

// 20261115T141500Z
function utcStamp(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function wallClock(d: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CALENDAR_TZ, hourCycle: 'h23',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
  }).formatToParts(d);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { y: get('year'), m: get('month'), d: get('day'), h: get('hour'), mi: get('minute'), s: get('second') };
}

// 20260916T093000, church wall-clock time (no zone suffix)
function localStamp(d: Date) {
  const w = wallClock(d);
  return `${pad(w.y, 4)}${pad(w.m)}${pad(w.d)}T${pad(w.h)}${pad(w.mi)}${pad(w.s)}`;
}

// `until: 2026-12-16` means "through that day" in church time, as a UTC
// instant (RFC 5545 requires UNTIL in UTC when DTSTART has a TZID).
// Date-only values parse as UTC midnight; treat them as that calendar day.
function endOfLocalDay(d: Date) {
  const midnightUtc = d.getUTCHours() === 0 && d.getUTCMinutes() === 0;
  const w = wallClock(d);
  const [y, m, day] = midnightUtc ? [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()] : [w.y, w.m, w.d];
  const wall = Date.UTC(y, m - 1, day, 23, 59, 59);
  const offset = (at: Date) => {
    const v = wallClock(at);
    return Date.UTC(v.y, v.m - 1, v.d, v.h, v.mi, v.s) - at.getTime();
  };
  return new Date(wall - offset(new Date(wall)));
}

function rrule(e: CalendarEvent) {
  return `RRULE:FREQ=WEEKLY${e.until ? `;UNTIL=${utcStamp(endOfLocalDay(e.until))}` : ''}`;
}

const endOf = (e: CalendarEvent) => e.end ?? new Date(e.start.getTime() + HOUR);

/** Escape a TEXT value (RFC 5545 §3.3.11). */
export function escapeText(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Fold a content line at 75 octets, never splitting a UTF-8 character. */
export function foldLine(line: string) {
  const bytes = (s: string) => new TextEncoder().encode(s).length;
  const out: string[] = [];
  let current = '';
  let size = 0;
  for (const ch of line) {
    const n = bytes(ch);
    if (size + n > 75) {
      out.push(current);
      current = ' '; // continuation lines start with a space, which counts
      size = 1;
    }
    current += ch;
    size += n;
  }
  out.push(current);
  return out.join('\r\n');
}

// US rules since 2007: second Sunday in March to first Sunday in November.
const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  `TZID:${CALENDAR_TZ}`,
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:-0500',
  'TZOFFSETTO:-0400',
  'TZNAME:EDT',
  'DTSTART:20070311T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:-0400',
  'TZOFFSETTO:-0500',
  'TZNAME:EST',
  'DTSTART:20071104T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
];

const details = (e: CalendarEvent) => [e.summary, e.url].filter(Boolean).join('\n\n');

/** A complete .ics file for one event. `stamp` is the DTSTAMP (defaults to now). */
export function buildIcs(e: CalendarEvent, stamp = new Date()) {
  const end = endOf(e);
  const weekly = e.repeat === 'weekly';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Oneida Gospel Church//Website//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...(weekly ? VTIMEZONE : []),
    'BEGIN:VEVENT',
    `UID:${e.uid}`,
    `DTSTAMP:${utcStamp(stamp)}`,
    ...(weekly
      ? [`DTSTART;TZID=${CALENDAR_TZ}:${localStamp(e.start)}`, `DTEND;TZID=${CALENDAR_TZ}:${localStamp(end)}`, rrule(e)]
      : [`DTSTART:${utcStamp(e.start)}`, `DTEND:${utcStamp(end)}`]),
    `SUMMARY:${escapeText(e.title)}`,
    ...(e.location ? [`LOCATION:${escapeText(e.location)}`] : []),
    `DESCRIPTION:${escapeText(details(e))}`,
    `URL:${e.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** A Google Calendar "add event" link, prefilled. */
export function googleCalendarUrl(e: CalendarEvent) {
  const end = endOf(e);
  const weekly = e.repeat === 'weekly';
  const stamp = weekly ? localStamp : utcStamp;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${stamp(e.start)}/${stamp(end)}`,
    details: details(e),
  });
  if (e.location) params.set('location', e.location);
  if (weekly) {
    params.set('ctz', CALENDAR_TZ);
    params.set('recur', rrule(e));
  }
  return `https://calendar.google.com/calendar/render?${params}`;
}
