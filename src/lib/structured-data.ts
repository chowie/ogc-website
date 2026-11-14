// schema.org JSON-LD for search engines, built from the same data the pages
// show (site.json, the events collection, the menu), so the two can't drift.
// Imports use the .ts extension so `node --test` can load this file directly.
//
// Choices, from Google Search Central (checked 2026-11-13):
// - Church + WebSite on the home page only: "We recommend placing this
//   information on your home page… You don't need to include it on every
//   page" (structured-data/organization), and "The WebSite structured data
//   must be on the home page" (appearance/site-names).
// - schema.org Church is a Place (PlaceOfWorship), not an Organization, so
//   the node is typed ["Church", "Organization"] (Google: "If you have
//   multiple types, specify them as an array") to carry email, logo, sameAs.
// - Events: only on each event's own page, for its next meeting, at a
//   physical place (structured-data/event: "Each event MUST have a unique URL
//   … and markup on that URL"; "Events must take place in a physical
//   location"). Weekly Sunday services are not marked up as events (Google:
//   "Don't mark business hours as events").
// - No FAQPage: Google stopped showing FAQ rich results on May 7, 2026.
// - No geo or logo yet: the church hasn't supplied them, and none are guessed.
import { localIso } from './time.ts';

type Json = Record<string, unknown>;

export interface SiteFacts {
  name: string;
  address: { street: string; city: string; state: string; zip: string };
  phone: string;
  email: string;
  social: { label: string; url: string }[];
}

const CONTEXT = 'https://schema.org';

/** "(517) 627-7112" -> "+1-517-627-7112" */
export function e164ish(phone: string) {
  const d = phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  return d.length === 10 ? `+1-${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : phone;
}

export function postalAddress(a: SiteFacts['address']): Json {
  return {
    '@type': 'PostalAddress',
    streetAddress: a.street,
    addressLocality: a.city,
    addressRegion: a.state,
    postalCode: a.zip,
    addressCountry: 'US',
  };
}

const churchId = (siteUrl: string) => new URL('/#church', siteUrl).href;

/** The church: name, address, phone, email and social profiles. */
export function churchJsonLd(site: SiteFacts, siteUrl: string, image?: string): Json {
  return {
    '@context': CONTEXT,
    '@type': ['Church', 'Organization'],
    '@id': churchId(siteUrl),
    name: site.name,
    url: new URL('/', siteUrl).href,
    ...(image && { image }),
    address: postalAddress(site.address),
    ...(site.phone && { telephone: e164ish(site.phone) }),
    ...(site.email && { email: site.email }),
    ...(site.social.length && { sameAs: site.social.map((s) => s.url) }),
  };
}

/** The site's name, for Google's site-name feature. */
export function websiteJsonLd(site: SiteFacts, siteUrl: string): Json {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    name: site.name,
    url: new URL('/', siteUrl).href,
    publisher: { '@id': churchId(siteUrl) },
  };
}

export interface EventFacts {
  title: string;
  start: Date;
  end?: Date;
  summary?: string;
  /** Room or place name ("Meeting Room, off the chapel"). */
  location?: string;
  /** Street address for an event away from the church. */
  address?: string;
}

/**
 * The Place's name. At the church, the room plus the church's name, unless
 * the room already names the church. Away from the church, the event's own
 * place name (or its address), never the church's.
 */
function placeName(e: EventFacts, churchName: string) {
  if (e.address) return e.location || e.address;
  if (!e.location) return churchName;
  return e.location.includes(churchName) ? e.location : `${e.location}, ${churchName}`;
}

/** One meeting of an event, at a physical place. */
export function eventJsonLd(e: EventFacts, pageUrl: string, site: SiteFacts, siteUrl: string): Json {
  return {
    '@context': CONTEXT,
    '@type': 'Event',
    name: e.title,
    startDate: localIso(e.start),
    ...(e.end && { endDate: localIso(e.end) }),
    eventStatus: 'https://schema.org/EventScheduled',
    ...(e.summary && { description: e.summary }),
    url: pageUrl,
    location: {
      '@type': 'Place',
      name: placeName(e, site.name),
      address: e.address ?? postalAddress(site.address),
    },
    organizer: { '@type': 'Organization', name: site.name, url: new URL('/', siteUrl).href },
  };
}

/** Breadcrumbs, Home first. The last crumb has no `item`: Google uses the page's URL. */
export function breadcrumbJsonLd(trail: { name: string; url?: string }[]): Json | undefined {
  if (trail.length < 2) return undefined;
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(i < trail.length - 1 && c.url && { item: c.url }),
    })),
  };
}

/** Safe inside <script>: no "</script>" or "<!--" can end the block early. */
export function serialize(data: Json) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
