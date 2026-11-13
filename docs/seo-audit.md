# SEO and Discoverability Audit

**Site:** Oneida Gospel Church demo (Astro, Netlify), branch `seo-discoverability`.
**Audited:** 2026-11-13, against v0.2.0 (main) and this branch.
**Scope:** Google, Bing, Apple Maps and AI assistants (ChatGPT, Gemini, Claude,
Perplexity, Google AI Overviews and AI Mode).

Every recommendation cites the official page it rests on. The docs were
fetched on 2026-11-13. Church facts come only from this repo; anything
missing is listed under "Questions for Chris" at the end, not guessed.

**Status key:**
- ✅ fixed on this branch
- 🟡 needs Chris's decision or information
- ⏳ at go-live

---

## Summary

| # | Impact | Finding | Status |
|---|---|---|---|
| 1 | High | robots.txt `Disallow: /` hid the noindex from crawlers | ✅ |
| 2 | High | No canonical URLs, and the site URL was hard-coded to netlify.app | ✅ |
| 3 | High | No XML sitemap | ✅ |
| 4 | High | No structured data (Church, WebSite, Event, BreadcrumbList) | ✅ |
| 5 | High | Redirects were meta-refresh pages, and there's no cutover map from Wix | ✅ / 🟡 |
| 6 | High | Demo badges, "Source" notes and "not monitored" notices would be indexed and quoted | 🟡 ⏳ |
| 7 | High | First-visitor answers are placeholders: parking, length, dress, accessibility, check-in | 🟡 |
| 8 | Medium | Titles are generic, with no local terms | 🟡 (keyword map below) |
| 9 | Medium | Meta descriptions are too short (Contact: 20 chars) or too long (events: 164–206) | 🟡 (with #8) |
| 10 | Medium | No link-preview cards | ✅ |
| 11 | Medium | No favicon, logo or manifest; `/favicon.ico` 404s (Lighthouse best-practices 96) | 🟡 |
| 12 | Medium | Netlify's generic 404 page | ✅ |
| 13 | Medium | Facts typed out in Markdown instead of read from site.json | 🟡 |
| 14 | Medium | Every internal link takes a 301 hop (`/about` → `/about/`) | open |
| 15 | Low | Thin team and event pages | expected |
| 16 | Low | NAP format variants ("OGC"; the hero leaves out the state and ZIP) | 🟡 |
| 17 | Low | llms.txt | ✅ (not a win) |

**Lighthouse, mobile (Lighthouse 13.6.0, local static build):**

| Build | Pages | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| main (before) | home, plan-your-visit, events, team, kids | 100 | 100 | 96 | 63–66 | 0.9 s | 0 | 0–10 ms |
| this branch (demo mode) | same | 100 | 100 | 96 | 66–69 | 0.9 s | 0 | 0 ms |
| this branch, go-live mode | home, plan-your-visit, an event | 100 | 100 | — | **100** | 0.9 s | 0 | 0 ms |

- **Demo-mode SEO:** the demo SEO scores fail only `is-crawlable`, which is the deliberate demo noindex.
- **Best practices:** 96 everywhere comes from one console error, the missing `/favicon.ico` (#11).
- **No regressions:** performance and accessibility didn't drop on any page.

---

## High

### 1. The demo blocked crawling, which hid its own noindex ✅
- **Evidence:**
  - Production (ogc-website.netlify.app) served `Disallow: /` with no `X-Robots-Tag`.
  - Only deploy previews got Netlify's automatic header.
- **Sources:**
  - Google: "If the page is blocked by a robots.txt file… the crawler will never see the noindex rule, and the page can still appear in search results." https://developers.google.com/search/docs/crawling-indexing/block-indexing
  - Google: robots.txt is "not a mechanism for keeping a web page out of Google." https://developers.google.com/search/docs/crawling-indexing/robots/intro
  - Netlify adds `X-Robots-Tag: noindex` to "Deploy Previews and older branch deploys" only. https://docs.netlify.com/site-deploys/deploy-previews/
- **Fix:**
  - robots.txt now allows crawling.
  - Until `PUBLIC_ALLOW_INDEXING=true`, the build writes a `_headers` file adding `X-Robots-Tag: noindex` to every response. The noindex meta tag stays.
  - At go-live, both go away and robots.txt lists the sitemap.
  - Files: `src/lib/indexing.mjs`, `src/pages/robots.txt.ts`, `astro.config.mjs`; tests in `tests/indexing.test.ts`.

### 2. No canonicals; the site URL was hard-coded ✅
- **Evidence:** no `rel=canonical` on any page, and `site: 'https://ogc-website.netlify.app'` in `astro.config.mjs`.
- **Source:** "Use absolute paths rather than relative paths with the rel="canonical" link element." https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- **Fix:**
  - Every indexable page has an absolute canonical, with the trailing slash Netlify serves.
  - `site` comes from Netlify's `URL` variable (the site's primary domain). Once `www.oneidagospel.org` is primary in Netlify, every canonical, sitemap entry and share URL follows with no code change.
  - Wix already redirects the bare domain to www (checked with curl), so www is the canonical host.

### 3. No sitemap ✅
- **Source:** "Google ignores `<priority>` and `<changefreq>` values. Google uses the `<lastmod>` value if it's consistently and verifiably… accurate." https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- **Fix:**
  - `@astrojs/sitemap` (pinned 3.7.4) writes `/sitemap-index.xml` with 33 URLs.
  - `<lastmod>` is the last git commit to each page's own source files. It's left out in a shallow clone rather than faked, and there's no priority or changefreq.
  - `/thanks`, `/content-status` and the 404 page are excluded.

### 4. No structured data ✅
All of it is built from site.json, the events collection and the menu, so it
can't disagree with the page. `npm run verify` fails if a block doesn't parse
or lacks Google's required properties.
- **Church (home page only),** typed `["Church", "Organization"]`, with name, URL, address, phone, email, photo and sameAs (Facebook, YouTube, Apple Podcasts).
  - Schema.org's Church is a Place (Thing › Place › CivicStructure › PlaceOfWorship › Church; https://schema.org/Church), so it can't carry `email` alone. Google allows multiple types "as an array" (https://developers.google.com/search/docs/appearance/structured-data/local-business).
  - Google: "We recommend placing this information on your home page… You don't need to include it on every page." https://developers.google.com/search/docs/appearance/structured-data/organization
  - No `geo` or `logo` yet: neither is in the repo (questions 5 and 7).
- **WebSite (home page):** "The WebSite structured data must be on the home page." https://developers.google.com/search/docs/appearance/site-names
- **Event (each event's own page, next meeting only):**
  - Required: `name`, `startDate` (written in church time with its offset) and `location` (Place plus address).
  - Google: "Each event MUST have a unique URL… and markup on that URL"; "Events must take place in a physical location"; "Don't mark business hours as events". https://developers.google.com/search/docs/appearance/structured-data/event
  - So the weekly Sunday services are **not** Events. Online-event properties were removed from Google's docs in June 2025, so none are used.
  - Weekly series (the women's study) mark up their next meeting. The daily rebuild moves it forward.
- **BreadcrumbList (every indexable page below Home):** at least two items, and the last has no `item`, which Google allows. https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- **FAQPage: not used.** Google: "This feature will no longer appear in Google Search starting May 7, 2026." https://developers.google.com/search/updates#removing-faq-rich-result

**Validate after deploy** (on the go-live domain, or the demo with the
noindex in mind):
- Rich Results Test (https://search.google.com/test/rich-results):
  - `/` (Organization)
  - `/events/2026-12-06-membership-class/` (Event, Breadcrumb)
  - `/events/womens-bible-study/` (Event, Breadcrumb)
  - `/about/team/andrew-fulton/` (Breadcrumb)
- Schema Markup Validator (https://validator.schema.org/):
  - the same four
  - `/plan-your-visit/`

### 5. Redirects ✅ / cutover map 🟡
- **Evidence:** Astro's `redirects` option wrote meta-refresh HTML pages for `/visit`, `/sermons` and `/team/*`.
- **Source:** "We recommend server side permanent redirects from the old URLs to the new URLs"; keep them "generally at least 1 year." https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- **Fix:**
  - `public/_redirects` now serves real 301s.
  - `npm run verify` fails if any redirect points at a page that doesn't exist.
  - The draft Wix → new map for about 100 URLs is in [redirect-map.md](redirect-map.md). It's held for questions 2–4.

### 6. Demo labels would be crawled and quoted 🟡 ⏳
- **Evidence:** the "Draft copy" and "Placeholder" badges, the "Source" notes, the form notice ("Demo site: this form isn't monitored yet"), the footer's "Privacy… Placeholder", and `/content-status` are all in the static HTML on every build. An AI assistant quoting the Plan Your Visit page would repeat "Details on accessible parking… will go here."
- **Fix (before go-live):** show these only while `PUBLIC_ALLOW_INDEXING` is unset, and resolve every placeholder they mark. This changes what reviewers see, so it's Chris's call. Not done on this branch.

### 7. First-visitor answers are missing 🟡
AI assistants answer "what time / where / what about my kids / what do I
wear" by quoting text they can fetch. Google: "There are no additional
requirements to appear in AI Overviews or AI Mode… a page must be indexed and
eligible to be shown in Google Search with a snippet."
(https://developers.google.com/search/docs/appearance/ai-features)

**Checked:** every page is pre-rendered static HTML, so all of its text is
in the HTML a crawler fetches without running JavaScript. I verified this on
the built files for Plan Your Visit, Home and Kids & Families.

| Answer | On the site? |
|---|---|
| Service times, Sunday School | ✅ Plan Your Visit, footer, home |
| Address | ✅ Plan Your Visit, footer, Contact |
| What a Sunday looks like | ✅ Plan Your Visit |
| Kids' programs, background checks | ✅ Kids & Families, Plan Your Visit |
| Short beliefs summary | ✅ home ("What We Believe"), Our Beliefs |
| **Parking and entrance** | 🟡 placeholder |
| **Service length** | 🟡 missing |
| **What to wear** | 🟡 missing (removed in review) |
| **Accessibility** (parking, entrance, restrooms, hearing) | 🟡 placeholder |
| **Children's check-in** | 🟡 placeholder |

Each needs one plain, quotable sentence on Plan Your Visit, for example
"Most people wear ___; you're welcome however you come." See question 5.

**Plan-link URL format:** the Plan Your Visit itinerary feature isn't built
(it's a research task in Notion), so there's no plan link to document yet.

---

## Medium

### 8. Titles have no local terms; keyword map for sign-off 🟡
- **Evidence:**
  - Every title is "Page | Oneida Gospel Church". The home title is just the name.
  - No title or description mentions Grand Ledge or Lansing, except the home description.
- **Source:** "ensure each page has a unique, descriptive, and concise title… Avoid keyword stuffing, boilerplate text"; "Avoid vague descriptors like 'Home' for your home page". https://developers.google.com/search/docs/appearance/title-link

**Proposed keyword map** (sign-off needed before any copy changes):

| Page | Primary intent | Proposed title (≤60 chars) |
|---|---|---|
| `/` | brand plus "church in Grand Ledge MI" | Oneida Gospel Church · Grand Ledge, MI |
| `/plan-your-visit` | "church near Lansing", "visit a church Grand Ledge" | Plan Your Visit · Church in Grand Ledge, MI |
| `/kids-and-families` | "Sunday school for kids Grand Ledge" | Kids & Sunday School · Oneida Gospel Church |
| `/about/beliefs` | "non-denominational church Grand Ledge" | What We Believe · Oneida Gospel Church |
| `/about` | "Oneida church Grand Ledge" | About Oneida Gospel Church, Grand Ledge |
| `/events` | "church events Grand Ledge" | Events · Oneida Gospel Church, Grand Ledge |
| `/get-connected/groups` | "Bible study Grand Ledge" | Bible Studies & Groups · Oneida Gospel Church |
| `/watch-and-listen` | "Oneida Gospel Church sermons" | Sermons & Videos · Oneida Gospel Church |
| `/contact` | brand plus phone and address | Contact · Oneida Gospel Church, Grand Ledge |
| others | brand | keep "Page \| Oneida Gospel Church" |

- **Affiliation queries:** the site states "non-denominational" and "elder-led", with Presbyterian roots (Our Story). Don't target a denomination unless question 6 names one.
- **Descriptions:** rewrite with the titles to 120–155 characters. Contact's needs the phone and city. The three event descriptions (164–206) get cut down.
- **Headings:** every page already has one H1. Heading order is enforced by the provenance system.

### 9. Meta descriptions 🟡
Done together with #8.

### 10. Link previews ✅
- Open Graph and Twitter `summary_large_image` tags on every page.
- The image is the real photo of the church sign and bell from Our Story, cropped to 1200×630, with alt text.
- Reference: the Open Graph protocol, https://ogp.me/.

### 11. Favicon, logo, manifest 🟡
- **Evidence:** `/favicon.ico` 404s, which causes the one Lighthouse best-practices failure. There's no logo file in the repo.
- **Fix:**
  - Needs the church's logo (question 7). From it: a favicon (SVG plus a 32px ICO), an `apple-touch-icon`, and `logo` in the Church JSON-LD.
  - Google: "The image must be 112x112px, at minimum." https://developers.google.com/search/docs/appearance/structured-data/organization
  - A web manifest adds nothing for a site like this; skip it.

### 12. 404 page ✅
`src/pages/404.astro` shows the service times, address and phone (from
site.json), plus links to Plan Your Visit and the main sections. It's
noindex and not in the sitemap.

### 13. Facts typed out instead of read from site.json 🟡
- **Evidence:** the phone, office email, "10:30 a.m.", "9:15 a.m." and "Grand Ledge, Michigan" are typed out in:
  - `plan-your-visit.md`
  - `kids-and-families.md`
  - `groups.md`, `men.md`, `women.md`
  - `membership.md`
- **Problems:**
  - `children@oneidagospel.org` has no site.json field.
  - If a time changes, these copies drift, and so does every AI answer quoting them.
- **Fix (with #8, once the copy is signed off):** replace them with values from site.json, or add a build check that the Markdown matches site.json.

### 14. Trailing-slash redirect hop (open)
- **Evidence:** internal links use `/about`; Netlify answers with a 301 to `/about/`. That's one extra round trip per click, and crawlers see redirects for internal links.
- **Fix:** write links with the trailing slash (menu, Markdown), or switch Astro to `build.format: 'file'` so `/about` is served directly. It touches many files for a small gain, so it's left for a separate change.

---

## Low

### 15. Thin pages (expected)
- Bonnie Schulert (36 words, placeholder) and most bios are under 200 words, as are the three event pages.
- These are fine as leaf pages; they don't need padding.

### 16. NAP formatting 🟡
- **No contradictions,** but there are variants:
  - "OGC" in Al Blankenship's bio
  - `E. Strange Hwy.` vs `E Strange Hwy` inside the map URL
  - the home hero shows the street and city without the state and ZIP
- **Rule:** the name, address and phone must read exactly the same here, on Google Business Profile, Bing Places, Apple Business Connect and Facebook. See [seo-offsite-checklist.md](seo-offsite-checklist.md).

### 17. llms.txt ✅ (not counted as a win)
- `/llms.txt` is generated from site.json and the menu.
- Google: "You don't need to create new machine readable files, AI text files… Doing so will neither harm nor help." https://developers.google.com/search/docs/fundamentals/ai-optimization-guide

---

## AI crawlers (robots.txt)

robots.txt is `User-agent: *` / `Allow: /`, which allows every crawler
below. **Recommendation:** keep allowing all the search, retrieval and
user-initiated agents. Blocking them removes the church from that
assistant's answers.

| Vendor | Search / retrieval | User-initiated | Training | Source |
|---|---|---|---|---|
| Google | Googlebot (also feeds AI Overviews and AI Mode) | Google-Agent, Google-NotebookLM (generally ignore robots.txt) | Google-Extended (token only; "does not impact a site's inclusion in Google Search") | https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers |
| OpenAI | OAI-SearchBot ("opted out… will not be shown in ChatGPT search answers") | ChatGPT-User ("robots.txt rules may not apply") | GPTBot | https://platform.openai.com/docs/bots |
| Anthropic | Claude-SearchBot | Claude-User | ClaudeBot | https://support.claude.com/en/articles/8896518 |
| Perplexity | PerplexityBot ("not used to crawl content for AI foundation models") | Perplexity-User (generally ignores robots.txt) | — | https://docs.perplexity.ai/guides/bots |
| Apple | Applebot (Siri, Spotlight; may also train) | — | Applebot-Extended (controls training use only) | https://support.apple.com/en-us/119829 |
| Microsoft | Bingbot (Bing, Copilot) | — | NOCACHE / NOARCHIVE meta (2023 guidance) | https://blogs.bing.com/webmaster/september-2023/Announcing-new-options-for-webmasters-to-control-usage-of-their-content-in-Bing-Chat |
| Amazon | Amzn-SearchBot | Amzn-User | Amazonbot | https://developer.amazon.com/amazonbot |
| Common Crawl | — | — | CCBot (its data feeds many models) | https://commoncrawl.org/ccbot |
| Meta | (docs couldn't be fetched) | | meta-externalagent | — |

**Training crawlers: Chris's decision (question 8).**
- **Allow (today's setting):**
  - The church's beliefs, times and voice become part of how future models describe it.
  - Simplest setup, with nothing to maintain.
- **Block** (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Amazonbot):
  - The sermons, bios and copy aren't used for training.
  - It has **no effect** on Google Search, AI Overviews, ChatGPT search, Claude search or Perplexity, because those use the search agents above.
  - The cost is a few robots.txt lines to keep current as vendors add tokens.
- **Search Console:** Google's guide also mentions a site-wide "Search generative AI control" in Search Console for AI Overviews and AI Mode. Leave it on after verifying (https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

---

## Questions for Chris

1. **Final domain:** is it `https://www.oneidagospel.org` (www, as Wix does today)?
2. **Old `/about`** on Wix is the *Women's Ministry* page. Redirect it to `/get-connected/women`? It can't, because the new `/about` is About Us. Should we accept that the address now means something else?
3. **Wix pages with no new home:** Jobs, Global Missions, Pictures, Shared Prayer, Prayer signup, Books to Borrow. Redirect each to the nearest section, or let them 404?
4. **Old blog posts** (`/post/*`, 64 of them): send them all to `/events`, or let the dated ones 404?
5. **Missing facts:** parking and entrance, service length, what to wear, accessibility (including any hearing assistance), children's check-in, office hours, a youth leader and a women's ministry leader.
6. **Affiliation:** is "non-denominational, elder-led" the whole story, or is the church a member of an association or fellowship that should be named?
7. **Logo:** is there a logo file (SVG preferred), and should the church sign-and-bell photo stay as the share image? Also: does a Google Business Profile exist (it would supply the map pin and coordinates)?
8. **Training crawlers:** allow (today) or block? See above.
9. **Phone format:** keep `517.627.7112`, or use `(517) 627-7112`? Whatever is chosen must match every listing exactly.
10. **Demo labels at go-live** (#6): OK to hide the badges, Source notes and demo notices automatically once indexing is turned on?
11. **Keyword map** (#8): approve, edit or reject before any titles and copy change.
