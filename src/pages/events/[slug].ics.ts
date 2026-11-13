// One .ics file per event (/events/<id>.ics), for "Add to Calendar" in Apple
// Calendar and Outlook. A weekly event uses its first meeting from the file,
// so the repeat rule covers the whole series.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { buildIcs, toCalendarEvent } from '../../lib/calendar';
import { streetAddress } from '../../lib/site';

export const getStaticPaths = (async () => {
  const events = await getCollection('events');
  return events.map((event) => ({ params: { slug: event.id }, props: { event } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) => {
  const { event } = props as { event: CollectionEntry<'events'> };
  const ics = buildIcs(toCalendarEvent(event.id, event.data, site!, streetAddress));
  return new Response(ics, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
