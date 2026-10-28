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
