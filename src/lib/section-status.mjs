// Markdown pages (src/content/pages): gives every `##` heading a stable id and,
// for this demo, a badge saying whether that section's copy is real.
//
// Frontmatter:
//   status: real | rewritten | placeholder     (required; the page default)
//   sections: { <heading-id>: <status> }       (per-section overrides)
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

export function statusBadge(status) {
  return {
    type: 'element',
    tagName: 'p',
    properties: { className: ['status-badge', `status-badge--${status}`] },
    children: [{ type: 'text', value: STATUS_LABELS[status] }],
  };
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
        // Only pages declare a status (the schema requires it there); other
        // collections (team bios, sermons) never get badges.
        if (!frontmatter.status) return;
        const status = frontmatter.sections?.[id] ?? frontmatter.status;
        if (status !== 'real') ctx.insertAfter(node, statusBadge(status));
      },
    },
  };
}
