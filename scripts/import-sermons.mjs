// Pulls recent videos from the church YouTube channel's RSS feed and writes
// one Markdown file per new sermon into src/content/sermons/.
// Existing files (matched by video ID) are never touched, so hand edits stick.
//
//   npm run sermons:import
//
// The feed only lists the channel's 15 most recent uploads.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CHANNEL_ID = 'UCAdc6tRYh8qfrwEsq-2GpzA'; // youtube.com/@OneidaGospelChurch
const OUT_DIR = new URL('../src/content/sermons/', import.meta.url).pathname;

const decode = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]).trim() : '';
};
// Lines like "📖 Scripture: Psalm 46" in the video description.
const field = (desc, label) => desc.match(new RegExp(`^\\S*\\s*${label}:\\s*(.+)$`, 'mi'))?.[1].trim();
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');
const yaml = (v) => JSON.stringify(v);

const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`);
if (!res.ok) throw new Error(`Feed request failed: ${res.status}`);
const entries = (await res.text()).split('<entry>').slice(1);

const existing = await Promise.all(
  (await readdir(OUT_DIR)).filter((f) => f.endsWith('.md')).map((f) => readFile(join(OUT_DIR, f), 'utf8')),
);
const known = new Set(existing.flatMap((s) => s.match(/watch\?v=([\w-]{11})/)?.[1] ?? []));

let added = 0;
for (const entry of entries) {
  const id = tag(entry, 'yt:videoId');
  if (known.has(id)) continue;

  const fullTitle = tag(entry, 'title');
  const desc = tag(entry, 'media:description');
  const title = fullTitle.split('|')[0].trim();
  // Prefer the sermon date in the description ("🗓 October 4, 2026") over upload date.
  const sermonDate = desc.match(/^🗓\s*(.+)$/m)?.[1];
  const parsed = sermonDate ? new Date(`${sermonDate} 12:00 UTC`) : new Date(NaN);
  const date = (isNaN(parsed) ? new Date(tag(entry, 'published')) : parsed).toISOString().slice(0, 10);
  const summary = desc.split(/\n\s*\n/)[0].trim();

  const lines = [
    '---',
    `title: ${yaml(title)}`,
    `date: ${date}`,
    field(desc, 'Speaker') && `speaker: ${yaml(field(desc, 'Speaker'))}`,
    field(desc, 'Scripture') && `passage: ${yaml(field(desc, 'Scripture'))}`,
    `youtubeUrl: https://www.youtube.com/watch?v=${id}`,
    summary && `summary: ${yaml(summary)}`,
    '---',
    '',
  ].filter(Boolean);

  const file = `${date}-${slugify(title)}.md`;
  await writeFile(join(OUT_DIR, file), lines.join('\n'));
  console.log(`added ${file}`);
  added++;
}
console.log(added ? `${added} sermon(s) added.` : 'No new sermons.');
