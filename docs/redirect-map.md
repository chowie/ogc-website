# Redirect Map: Wix → New Site

**Status:** the decided rows are in `public/_redirects`. They only matter
once `www.oneidagospel.org` points at Netlify. Rows marked 🟡 are still open.
The blog posts (`/post/…`) are covered post by post in
[wix-blog-audit.md](wix-blog-audit.md).

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
| `/post/who-is-oneida`, `/post/who-is-oneida-1` | `/about/membership/` | likely (the event page expires; see the blog audit) |
| `/post/want-to-know-more-about-membership`, `…-membership-1` | `/about/membership/` | exact |
| `/post/women-s-*bible-study*` (6 posts) | `/get-connected/women/` | likely |
| `/post/*` (the other 56 posts) | decided per post in the blog audit; the rest return 404 | — |
| `/blog-feed.xml` | 🟡 `/events/` or 404 | — |
| `/about-5` (Jobs) | `/about/jobs/` | exact |
| `/copy-of-global-missions` (Global Missions) | `/about/missions/` | exact |
| `/pictures` (Picture Files) | `/about/story/` | likely (old church photos live on Our Story) |
| `/sharedprayer` (Shared Relationship Prayer) | `/get-connected/prayer/` | exact |
| `/prayer-signup` | `/get-connected/prayer/` | likely (the signup form is gone; the page says how to join) |
| `/about-us-1` (Books to Borrow) | `/get-connected/library/` | exact |

## Where the rules live

`public/_redirects` holds every decided row above and the ready blog-post
rows. `npm run verify` fails if any target page is missing.

**Don't point a rule at an event page.** Event pages exist only while their
Markdown file does, and redirects stay up for a year or more. Use the program
page (`/get-connected/women/`, `/about/membership/`) or `/events/` instead.

## At cutover
1. Settle the 🟡 row and the held-back blog posts, add them to `public/_redirects`, run `npm run verify`, and open a PR.
2. After DNS moves, spot-check them with `curl -sI https://www.oneidagospel.org/<old>`. Expect `301` and a `location:` header.
3. In Search Console, submit the new sitemap. A same-domain move doesn't need the Change of Address tool, because the domain itself doesn't change.
