// Markdown pages (src/content/pages): gives every `##` heading a stable id and,
// for this demo, a badge saying whether that section's copy is real, plus a
// collapsed "Source" note saying where it came from.
//
// Frontmatter (checked by the pages schema in src/content.config.ts):
//   origin:   { status, from?, on?, note? }        the page default (required)
//   sections: { <heading-id>: { status, from?, on?, note? } }   per section
//
//   status  real | rewritten | placeholder
//   from    a URL or a document name ("OGC Operating Procedures (2007)")
//   on      the date the copy was taken or generated
//   note    one short sentence: what was changed, or what a placeholder is based on
//
// Ids come from slugify() below; menu anchors in src/data/nav.ts must match,
// and scripts/check-links.mjs fails the build check if one doesn't.

export const STATUSES = ['real', 'rewritten', 'placeholder'];

export const STATUS_LABELS = {
  real: 'Real',
  rewritten: 'Draft copy',
  placeholder: 'Placeholder',
};

/** "New to the Area?" -> "new-to-the-area"; "Service times & location" -> "service-times-and-location". */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** 2026-11-12 (a Date or a YAML date string) -> "Nov 12, 2026". */
export function formatDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

const isUrl = (s) => /^https?:\/\//.test(s); // the schema allows only http(s) URLs

/** https://www.oneidagospel.org/about-4 -> "oneidagospel.org/about-4" */
const shortUrl = (s) => {
  const u = new URL(s);
  return (u.host.replace(/^www\./, '') + u.pathname).replace(/\/$/, '');
};

/** @typedef {{ status: string, from?: string, on?: Date | string, note?: string }} Origin */

/**
 * Whether a page has copy outside its sections (an intro, or Markdown before
 * the first `##`), which the page-level `origin` then describes.
 * @param {string | undefined} body
 * @param {string | undefined} intro
 */
export function hasLeadCopy(body, intro) {
  return Boolean(intro) || (body ?? '').split(/^## /m)[0].trim() !== '';
}

/** The origin that applies to a section: its own entry, else the page's. */
export function originFor(frontmatter, id) {
  return frontmatter.sections?.[id] ?? frontmatter.origin;
}

/**
 * Where a section's copy came from, as segments: plain strings, and
 * { href, text } for a source that is a link. Join them to get the sentence.
 *   real, with a date   "Verbatim from <from>, taken Nov 12, 2026."
 *   real, no date       "From <from>."   (site data: settings, YouTube, calendar)
 *   rewritten           "Rewritten from <from>, taken Nov 12, 2026. <note>"
 *   placeholder         "Generated Nov 12, 2026[, based on <from>]. <note>"
 *                       with no note or source: "...; made up, with no source."
 * @param {Origin} origin
 * @returns {(string | { href: string, text: string })[]}
 */
export function describeOrigin({ status, from, on, note }) {
  const src = from ? [isUrl(from) ? { href: from, text: shortUrl(from) } : from] : [];
  const date = on ? formatDate(on) : undefined;
  let parts;
  if (status === 'placeholder') {
    parts = [`Generated ${date}`];
    if (from) parts.push(', based on ', ...src);
    parts.push(!from && !note ? '; made up, with no source.' : '.');
  } else if (status === 'rewritten') {
    parts = ['Rewritten from ', ...src, `, taken ${date}.`];
  } else {
    parts = date ? ['Verbatim from ', ...src, `, taken ${date}.`] : ['From ', ...src, '.'];
  }
  if (note) parts.push(` ${note}`);
  return parts;
}

/** describeOrigin as plain text. @param {Origin} origin */
export const originText = (origin) =>
  describeOrigin(origin)
    .map((p) => (typeof p === 'string' ? p : p.text))
    .join('');

const el = (tagName, properties, children) => ({ type: 'element', tagName, properties, children });
const text = (value) => ({ type: 'text', value });

/**
 * HAST for the line under a section heading: the status badge (none for real
 * copy) and a collapsed "Source" note. SectionMeta.astro renders the same
 * markup for sections that .astro pages add. `label` (the section's title) is
 * read out after "Source" so screen readers can tell the toggles apart.
 * @param {Origin} origin
 * @param {string} label
 */
export function sectionMeta(origin, label) {
  const note = describeOrigin(origin).map((p) =>
    typeof p === 'string' ? text(p) : el('a', { href: p.href }, [text(p.text)]),
  );
  return el('div', { className: ['section-meta'] }, [
    ...(origin.status === 'real'
      ? []
      : [el('span', { className: ['status-badge', `status-badge--${origin.status}`] }, [text(STATUS_LABELS[origin.status])])]),
    el('details', { className: ['provenance'] }, [
      el('summary', {}, [text('Source'), el('span', { className: ['visually-hidden'] }, [text(`: ${label}`)])]),
      el('p', {}, note),
    ]),
  ]);
}

/**
 * Sätteri (Astro 7's Markdown processor) HAST plugin, created once per file.
 * Runs before Astro's own heading-id plugin, which keeps an id that's already
 * set. A repeated heading gets -1, -2… so ids stay unique.
 */
export function sectionStatusPlugin() {
  const seen = new Map();
  return {
    name: 'section-status',
    element: {
      filter: ['h2'],
      visit(node, ctx) {
        const frontmatter = ctx.data?.astro?.frontmatter ?? {};
        let id = node.properties?.id;
        if (typeof id !== 'string') {
          const base = slugify(ctx.textContent(node));
          const n = seen.get(base) ?? 0;
          seen.set(base, n + 1);
          id = n ? `${base}-${n}` : base;
          ctx.setProperty(node, 'id', id);
        }
        // Only pages declare an origin (the schema requires it there); other
        // collections (team bios, sermons) never get badges.
        if (!frontmatter.origin) return;
        ctx.insertAfter(node, sectionMeta(originFor(frontmatter, id), ctx.textContent(node)));
      },
    },
  };
}
