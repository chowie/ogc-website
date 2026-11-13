import { z } from 'astro/zod';
import raw from '../data/site.json';

// Site-wide settings (service times, address, social links).
// Edit src/data/site.json; the build fails if it doesn't match this shape.
const siteSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  // One sentence under the church's name on the home page.
  welcome: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    mapEmbedUrl: z.union([z.url(), z.literal('')]),
  }),
  phone: z.string(),
  email: z.union([z.email(), z.literal('')]),
  serviceTimes: z.array(
    z.object({ label: z.string(), day: z.string(), time: z.string() }),
  ),
  social: z.array(z.object({ label: z.string(), url: z.url() })),
});

export const site = siteSchema.parse(raw);

// tel: link for the office phone ("517.627.7112" -> "tel:+15176277112").
export const telHref = `tel:+1${site.phone.replace(/\D/g, '')}`;

// Demo stays out of search engines until PUBLIC_ALLOW_INDEXING=true is set
// in the Netlify environment at go-live.
export const allowIndexing = import.meta.env.PUBLIC_ALLOW_INDEXING === 'true';
