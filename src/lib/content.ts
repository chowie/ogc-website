import { getCollection, type CollectionEntry } from 'astro:content';
import { nextWeekly, TZ } from './time';

export async function getTeam() {
  const team = await getCollection('team');
  return team.sort(
    (a, b) =>
      a.data.displayOrder - b.data.displayOrder ||
      a.data.name.localeCompare(b.data.name),
  );
}

export async function getSermons() {
  const sermons = await getCollection('sermons');
  return sermons.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

type Event = CollectionEntry<'events'>;

// "Upcoming" is evaluated at build time; a scheduled daily rebuild keeps it fresh.
// A repeating event comes back with start/end moved to its next occurrence;
// an event that is over comes back as undefined.
export function upcoming(e: Event, now = new Date()): Event | undefined {
  if (!e.data.repeat) return (e.data.end ?? e.data.start) >= now ? e : undefined;
  const next = nextWeekly(e.data.start, e.data.end, now, e.data.until);
  return next ? { ...e, data: { ...e.data, ...next } } : undefined;
}

export async function getUpcomingEvents(now = new Date()) {
  const events = await getCollection('events');
  return events
    .flatMap((e) => upcoming(e, now) ?? [])
    .sort((a, b) => a.data.start.valueOf() - b.data.start.valueOf());
}

// Shorten text to at most `max` characters, cutting at a word boundary.
export function truncate(text: string, max = 150) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,.;:–—-]+$/, '')}…`;
}

// YouTube video ID from a watch, share, or embed URL.
export function youtubeId(url: string) {
  return url.match(/(?:v=|youtu\.be\/|embed\/|live\/)([\w-]{11})/)?.[1];
}

// "Sunday, November 15 · 9:15 AM – 10:15 AM", in church time. Weekly events
// read "Every Wednesday · 9:30 AM", plus the next date on its own.
export function eventWhen({ start, end, repeat }: Event['data']) {
  const opts = (o: Intl.DateTimeFormatOptions) => ({ ...o, timeZone: TZ });
  const time = (d: Date) => d.toLocaleTimeString('en-US', opts({ hour: 'numeric', minute: '2-digit' }));
  const times = `${time(start)}${end ? ` – ${time(end)}` : ''}`;
  const date = start.toLocaleDateString('en-US', opts({ weekday: 'long', month: 'long', day: 'numeric' }));
  if (repeat === 'weekly') {
    const weekday = start.toLocaleDateString('en-US', opts({ weekday: 'long' }));
    return { when: `Every ${weekday} · ${times}`, next: `Next: ${date}` };
  }
  return { when: `${date} · ${times}`, next: undefined };
}
