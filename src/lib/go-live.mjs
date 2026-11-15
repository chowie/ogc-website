// The go-live check: once PUBLIC_ALLOW_INDEXING=true drops the demo labels,
// placeholder copy would read as real, so it must all be replaced first.
// Reads page frontmatter only (no rendering). Used by the go-live build
// (astro.config.mjs) and by `npm run release` once the live site is indexed.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'yaml';

/**
 * One line per placeholder: each `sections:` entry with status placeholder,
 * plus the page's own `origin` when it's a placeholder (it covers the intro
 * and any section without its own entry).
 * @param {{ id: string, data: { origin?: { status: string }, sections?: Record<string, { status: string }> } }[]} pages
 *   id is the file path under src/content/pages without ".md" ("about/team").
 */
export function goLiveBlockers(pages) {
  return pages.flatMap(({ id, data }) => {
    const url = id === 'index' ? '/' : `/${id}`;
    return [
      ...(data.origin?.status === 'placeholder' ? [`${url}: page copy (origin)`] : []),
      ...Object.entries(data.sections ?? {})
        .filter(([, s]) => s.status === 'placeholder')
        .map(([key]) => `${url}#${key}`),
    ];
  });
}

/** goLiveBlockers for the Markdown files under `dir`. */
export function findPlaceholders(dir = 'src/content/pages') {
  const pages = readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const front = readFileSync(join(dir, f), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
      return { id: relative(dir, join(dir, f)).replace(/\.md$/, '').split('\\').join('/'), data: front ? parse(front[1]) ?? {} : {} };
    });
  return goLiveBlockers(pages);
}

/** The error both callers print. @param {string[]} blockers */
export const placeholderMessage = (blockers) =>
  `${blockers.length} placeholder(s) left. With the demo labels gone they would read as real copy; ` +
  `replace each one and change its status in the page's frontmatter:\n  ${blockers.join('\n  ')}`;
