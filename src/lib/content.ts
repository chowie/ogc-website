import { getCollection } from 'astro:content';

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

// "Upcoming" is evaluated at build time; a scheduled daily rebuild keeps it fresh.
export async function getUpcomingEvents(now = new Date()) {
  const events = await getCollection('events');
  return events
    .filter((e) => (e.data.end ?? e.data.start) >= now)
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
