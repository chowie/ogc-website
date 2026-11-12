// Markdown pages (src/content/pages): gives every `##` heading a stable id and,
// for this demo, a badge saying whether that section's copy is real.
//
// Frontmatter:
//   status: real | rewritten | placeholder     (the page default)
//   sections: { <heading-id>: <status> }       (per-section overrides)
//
// Ids come from slugify() below; menu anchors in src/data/nav.ts must match,
// and scripts/check-links.mjs fails the build check if one doesn't.

export const STATUSES = ['real', 'rewritten', 'placeholder'];

export const STATUS_LABELS = {
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
 * Sätteri (Astro 7's Markdown processor) HAST plugin. Runs before Astro's own
 * heading-id plugin, which keeps an id that's already set.
 */
export const sectionStatusPlugin = {
  name: 'section-status',
  element: {
    filter: ['h2'],
    visit(node, ctx) {
      const frontmatter = ctx.data?.astro?.frontmatter ?? {};
      let id = node.properties?.id;
      if (typeof id !== 'string') {
        id = slugify(ctx.textContent(node));
        ctx.setProperty(node, 'id', id);
      }
      const status = frontmatter.sections?.[id] ?? frontmatter.status ?? 'real';
      if (status !== 'real') ctx.insertAfter(node, statusBadge(status));
    },
  },
};
