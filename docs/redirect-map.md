# Redirect Map: Wix → New Site (draft)

**Status:** draft. Nothing below is live yet. It goes into
`public/_redirects` once Chris answers the open questions (marked 🟡), and it
only matters once `www.oneidagospel.org` points at Netlify.

**Source:** the live Wix sitemap index, `https://www.oneidagospel.org/sitemap.xml`,
fetched on 2026-11-13. It contains:
- `pages-sitemap.xml`: 32 pages
- the dynamic team sitemap: 6 pages
- `blog-categories-sitemap.xml`: 1 page
- `blog-posts-sitemap.xml`: 64 posts

**Old URLs vs new pages:** Wix titles don't always match their URLs. For example, `/about` is the Women's Ministry page. Each old URL below was checked by fetching its `<title>`.

**Google's guidance** (https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes):
- "We recommend server side permanent redirects from the old URLs to the new URLs as you indicated in your mapping."
- "Keep the redirects for as long as possible, generally at least 1 year."

**Netlify notes:**
- `_redirects` rules apply in order, and the first match wins.
- A rule doesn't fire when a page exists at that path. That's why old `/about`, `/give` and `/events` can't be redirected without overriding the new pages.
- `npm run verify` checks that every target exists.

## Map

| Old URL (Wix title) | New URL | Confidence |
|---|---|---|
| `/` | `/` | same path |
| `/give` | `/give/` | same path |
| `/events` (blog category) | `/events/` | same path |
| `/calendar` | `/events/` | exact |
| `/sermons` | `/watch-and-listen/` | exact (already live) |
| `/video` (Videos) | `/watch-and-listen/` | exact |
| `/podcast` | `/watch-and-listen/` | exact |
| `/whoweare` (Who We Are) | `/about/beliefs/` | likely: it holds the statement of faith, which is now on Our Beliefs |
| `/about-4` (History) | `/about/story/` | exact |
| `/about` (**Women's Ministry**) | `/about/` (About Us; no redirect) | decided: Chris, 2026-11-13. The Wix page was misnamed, and paths should describe their content. Old links to it now land on About Us; Women's Ministry is at `/get-connected/women/`. |
| `/team` (Team list) | `/about/team/` | exact |
| `/meet-our-team-copy` (Meet Our Team) | `/about/team/` | exact |
| `/team/:slug` (6 people) | `/about/team/:slug/` | exact (already live) |
| `/andrew-fulton-1` | `/about/team/andrew-fulton/` | exact |
| `/al-blankenship-1` | `/about/team/al-blankenship/` | exact |
| `/bruce-schulert` | `/about/team/bruce-schulert/` | exact |
| `/brian-milner` | `/about/team/brian-milner/` | exact |
| `/childrensdirector` (Rachel Fulton) | `/about/team/rachel-fulton/` | exact |
| `/mensministry` | `/get-connected/men/` | exact |
| `/general-4` (Men's Retreat) | `/get-connected/men/` | likely |
| `/children` | `/kids-and-families/` | exact |
| `/youth` | `/kids-and-families/` | likely (youth group is on that page) |
| `/copy-of-vbs-2026` (VBS) | `/kids-and-families/` | likely |
| `/vbs-response` (VBS form submission) | `/kids-and-families/` | likely |
| `/adult-ed` (Sunday School) | `/get-connected/groups/` | likely |
| `/rbt` (Programs) | `/get-connected/` | likely |
| `/blank-page` (Contact) | `/contact/` | exact |
| `/post/who-is-oneida`, `/post/who-is-oneida-1` | `/events/2026-11-15-who-is-oneida/` | likely |
| `/post/want-to-know-more-about-membership`, `…-membership-1` | `/about/membership/` | exact |
| `/post/women-s-*bible-study*` (6 posts) | `/events/womens-bible-study/` | likely |
| `/post/*` (the other ≈52 dated announcements) | 🟡 `/events/` or 404 (question 4) | — |
| `/blog-feed.xml` | 🟡 `/events/` or 404 | — |
| `/about-5` (Jobs) | 🟡 (question 3) | no equivalent |
| `/copy-of-global-missions` (Global Missions) | 🟡 | no equivalent (Missions Board seats are on Our Team) |
| `/pictures` (Picture Files) | 🟡 | no equivalent |
| `/sharedprayer` (Shared Relationship Prayer) | 🟡 `/contact/#prayer-request`? | no equivalent |
| `/prayer-signup` | 🟡 `/contact/#prayer-request`? | no equivalent |
| `/about-us-1` (Books to Borrow) | 🟡 | no equivalent |

## Draft `_redirects` lines (the unambiguous rows)

These rows don't depend on any open question. They go below the existing
rules in `public/_redirects` at cutover.

```
# Wix → new site (cutover, YYYY-MM-DD). Keep at least a year.
/calendar                 /events/                         301
/video                    /watch-and-listen/               301
/podcast                  /watch-and-listen/               301
/whoweare                 /about/beliefs/                  301
/about-4                  /about/story/                    301
/team                     /about/team/                     301
/meet-our-team-copy       /about/team/                     301
/andrew-fulton-1          /about/team/andrew-fulton/       301
/al-blankenship-1         /about/team/al-blankenship/      301
/bruce-schulert           /about/team/bruce-schulert/      301
/brian-milner             /about/team/brian-milner/        301
/childrensdirector        /about/team/rachel-fulton/       301
/mensministry             /get-connected/men/              301
/general-4                /get-connected/men/              301
/children                 /kids-and-families/              301
/youth                    /kids-and-families/              301
/copy-of-vbs-2026         /kids-and-families/              301
/vbs-response             /kids-and-families/              301
/adult-ed                 /get-connected/groups/           301
/rbt                      /get-connected/                  301
/blank-page               /contact/                        301
/post/who-is-oneida       /events/2026-11-15-who-is-oneida/ 301
/post/who-is-oneida-1     /events/2026-11-15-who-is-oneida/ 301
/post/want-to-know-more-about-membership    /about/membership/  301
/post/want-to-know-more-about-membership-1  /about/membership/  301
/post/women-s-fall-bible-study              /events/womens-bible-study/  301
/post/women-s-fall-bible-study-1            /events/womens-bible-study/  301
/post/women-s-spring-bible-study            /events/womens-bible-study/  301
/post/women-s-bible-study-prayer            /events/womens-bible-study/  301
/post/women-s-bible-study-starting-october-3-2024    /events/womens-bible-study/  301
/post/women-s-bible-study-starting-february-15-2023  /events/womens-bible-study/  301
```

**Event pages can be removed.** Event pages exist only while their Markdown
file does. If the Who Is Oneida? event is deleted, its redirect target
disappears and `npm run verify` fails. That's the intended guard: point the
rule at `/events/` instead.

## At cutover
1. Add the agreed lines to `public/_redirects`, run `npm run verify`, and open a PR.
2. After DNS moves, spot-check them with `curl -sI https://www.oneidagospel.org/<old>`. Expect `301` and a `location:` header.
3. In Search Console, submit the new sitemap. A same-domain move doesn't need the Change of Address tool, because the domain itself doesn't change.
