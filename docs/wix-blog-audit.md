# Wix blog audit: what happens to each `/post/` URL at the domain move

Audit of all 66 posts in the Wix blog sitemap (www.oneidagospel.org, checked
2026-11-13). This decides, for each old `/post/<slug>` URL, whether it gets a
301 redirect to a page on the new site, becomes content on the new site, or is
left to return 404. Nothing here is live yet. The `_redirects` lines go into
`docs/redirect-map.md` and `public/_redirects` once the SEO work
(`seo-discoverability`) is merged, since those files live on that branch.

22 posts are flyer images with no body text. Their dates and details were read
from the images.

## Policy (Google Search Central, fetched 2026-11-13)

- [Site moves with URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes):
  "Don't redirect many old URLs to one irrelevant single URL destination, such
  as the home page of the new site. This can confuse users and might be treated
  as a soft 404 error. However, if you have consolidated content previously
  hosted on multiple pages to a new single page, you can redirect the older
  URLs to that new, consolidated page." Also: "if you're not moving to the new
  site all your old content, make sure those URLs correctly return an HTTP 404
  or 410 error response code on the new site."
- [Soft 404 errors](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors):
  "If you removed the page and there's no replacement page on your site with
  similar content, return a 404 (not found) or 410 (gone) response" and "If
  your page has moved or has a clear replacement on your site, return a 301
  (permanent redirect)."
- [HTTP status codes](https://developers.google.com/search/docs/crawling-indexing/http-network-errors):
  "All 4xx errors, except 429, are treated the same", so a 410 gains nothing
  over Netlify's default 404.

**Rules applied:**
- **301** only when a new page covers the same program or the same yearly
  tradition.
- **404** (no rule needed) for one-off dated events.
- No 410s.

This replaces the earlier draft idea of a catch-all `/post/* → /events/`, which
the first quote above warns against.

## Totals

| Decision | Posts |
|---|---|
| REDIRECT | 43 |
| KEEP AS CONTENT (and 301 to where that content lands) | 8 |
| LET 404 | 15 |

Categories in the table: a = one-off event, b = recurring program, c = sermon
series or teaching, d = church info.

## All 66 posts

| slug | date | title | words | cat | evergreen? | decision | target / reason |
|---|---|---|---|---|---|---|---|
| relationships-made-whole | 2022-09-01 | Relationships Made Whole | 59 | c | Partly | KEEP AS CONTENT | `/watch-and-listen/` 2022 Ephesians series blurb; series archive, then 301 |
| what-is-a-healthy-church | 2022-09-03 | What is a Healthy Church? | 183 | b | Partly | REDIRECT | `/get-connected/groups/` 2022 nine-week 9Marks class; Adult Elective on Groups |
| christmas-advent-series-god-with-us | 2022-11-10 | Christmas Advent Series - "God With Us" | 170 | c | Partly | KEEP AS CONTENT | `/watch-and-listen/` 2022 Advent series blurb with sermon list; series archive, then 301 |
| christmas-eve-candlelight-service | 2022-11-22 | Christmas Eve Candlelight Service | 32 | a | No | REDIRECT | `/events/` 2022 Christmas Eve candlelight service; same yearly service on /events/ |
| want-to-know-more-about-membership | 2022-11-28 | Want to know more about membership? | 216 | d | Yes | REDIRECT | `/about/membership/` Membership class invite (2022); exact match |
| ho-ho-ho | 2022-12-15 | HO...HO...HO! | 40 | a | No | LET 404 | 2022 teen/young-adult holiday party at a private home |
| christmas-eve-candlelight-service-1 | 2022-12-19 | Christmas Eve Candlelight Service HAS BEEN CANCELED | 17 | a | No | LET 404 | 2022 weather cancellation notice; no equivalent |
| light-in-the-darkness | 2023-01-02 | Light in the Darkness | 81 | b | No | REDIRECT | `/get-connected/groups/` 2023 adult Sunday School class (John 12-21); Adult Elective listed on Groups |
| a-whole-new-work-god-s-vision-from-isaiah | 2023-01-04 | A Whole New World: God's Vision from Isaiah | 174 | c | Partly | KEEP AS CONTENT | `/watch-and-listen/` 2023 Isaiah series blurb; use as the series description in the planned series archive, then 301 |
| men-s-study-resumes | 2023-01-08 | Men's Study on "God of All Things" | 75 | b | No | REDIRECT | `/get-connected/men/` 2023 men's book study at a private home; Men page |
| women-s-bible-study-starting-february-15-2023 | 2023-01-24 | Women's Bible Study starting February 15, 2023 - "Sermon on the Mount" | 302 | b | No | REDIRECT | `/get-connected/women/` 2023 Sermon on the Mount study; Women page |
| new-sunday-morning-class | 2023-03-07 | New Sunday morning class - Habakkuk: God's Grace for your Complaints | 89 | b | No | REDIRECT | `/get-connected/groups/` 2023 Habakkuk adult class; Adult Elective on Groups |
| game-night-for-teens-young-adults | 2023-03-20 | Game Night for Teens & Young Adults | 45 | a | No | LET 404 | One-off 2023 game night |
| easter-egg-hunt | 2023-03-21 | Easter Egg Hunt | 53 | a | No | REDIRECT | `/events/` 2023 egg hunt; target only once an Easter section exists on /events/ (else 404) |
| holy-week-at-oneida | 2023-04-03 | Holy Week at Oneida | 45 | a | No | REDIRECT | `/events/` 2023 Holy Week times; same condition (Easter section) |
| happy-anniversary | 2023-04-14 | Happy Anniversary! | 65 | d | Partly | REDIRECT | `/about/story/` 175th homecoming 2023; already condensed into Our Story |
| adult-and-children-s-sunday-school-resumes | 2023-09-07 | Adult and Children's Sunday School resumes | 173 | b | No | REDIRECT | `/get-connected/groups/` Fall 2023 adult class (Beatitudes) and kids' curriculum; the Adult Elective at 9:15 still runs and is listed there |
| fall-sermon-series | 2023-09-07 | Fall Sermon Series | 140 | c | Partly | KEEP AS CONTENT | `/watch-and-listen/` Fall 2023 Isaiah 40-55 series blurb; series archive, then 301 (links to old /isaiah page, now gone) |
| men-s-fall-bible-study-2-corinthians | 2023-09-12 | Men's Fall Bible Study: 2 Corinthians | 115 | b | No | REDIRECT | `/get-connected/men/` 2023 men's study; men's Bible study still meets (Men page) |
| fall-bonfire-for-youth-and-20-somethings | 2023-09-19 | Fall Bonfire for Youth and 20-somethings | 0 (flyer) | a | No | LET 404 | One-off 2023 bonfire flyer |
| women-s-fall-bible-study | 2023-09-21 | Women's Fall Bible Study | 0 (flyer) | b | No | REDIRECT | `/get-connected/women/` 2023 "When You Pray" study; Women page |
| other-six-days | 2023-11-02 | Other Six Days - Three week Sunday School Series | 65 | b | No | REDIRECT | `/get-connected/groups/` 2023 three-week adult Sunday School series; Groups |
| sunday-school-four-weeks-of-christmas | 2023-11-14 | Sunday School: Four Weeks of Christmas | 0 (flyer) | b | No | REDIRECT | `/get-connected/groups/` 2023 Advent adult Sunday School; Groups |
| women-s-christmas-tea | 2023-11-14 | Women's Christmas Tea | 167 | b | No | KEEP AS CONTENT | `/get-connected/women/` Annual Christmas Tea (2023, 2024, 2025 all held); add a "Christmas Tea (December)" line to Women, then 301 |
| advent-at-oneida-gospel | 2023-11-18 | Advent at Oneida Gospel | 0 (flyer) | a | No | REDIRECT | `/events/` 2023 Christmas-season flyer; /events/ has the yearly Christmas Eve section |
| christmas-eve-services | 2023-11-29 | Christmas Eve Services | 62 | a | No | REDIRECT | `/events/` 2023 Christmas Eve service times; same yearly service on /events/ |
| what-are-you-doing-new-year-s-eve | 2023-12-12 | WHAT ARE YOU DOING NEW YEAR'S EVE? | 0 (flyer) | a | No | LET 404 | 2023 New Year's Eve party flyer |
| bible-reading-plan-for-2024 | 2023-12-30 | Bible Reading Plan for 2024 - You can join any time | 142 | b | No | LET 404 | 2024 YouVersion whole-Bible plan; no reading-plan page on the new site |
| ten-essential-christian-truths-meeting-on-sundays-at-9-15-am | 2024-01-06 | "Ten Essential Christian Truths" - meeting on Sundays at 9:15 AM | 0 (flyer) | b | No | REDIRECT | `/get-connected/groups/` 2024 adult class (David Platt video series); Groups |
| teen-talk | 2024-01-13 | TEEN TALK | 277 | b | Partly | REDIRECT | `/kids-and-families/` 2024 teen group launch (grades 6-12); Youth Group section now serves teens |
| exciting-sequel-to-jesus-life | 2024-01-18 | Exciting Sequel to Jesus' Life | 0 (flyer) | c | Partly | KEEP AS CONTENT | `/watch-and-listen/` 2024 Acts series blurb (in the flyer image); series archive, then 301 |
| leap-day-lunch | 2024-02-21 | Leap Day Lunch | 30 | a | No | REDIRECT | `/get-connected/women/` Ladies' lunch; Women page lists the monthly breakfast or lunch |
| women-s-bible-study-prayer | 2024-02-29 | Women's Bible Study & Prayer | 0 (flyer) | b | No | REDIRECT | `/get-connected/women/` 2024 women's study flyer; Women page Bible study |
| easter-egg-hunt-at-noon-on-3-24-24-coffee-and-refreshments-for-adults | 2024-03-20 | EASTER EGG HUNT AT NOON ON 3/24/24 - Coffee and refreshments for adults | 0 (flyer) | a | No | REDIRECT | `/events/` 2024 egg hunt; same condition (Easter section) |
| holy-week-at-oneida-1 | 2024-03-20 | Holy Week at Oneida | 10 | a | No | REDIRECT | `/events/` 2024 Holy Week flyer; same condition (Easter section) |
| meeting-with-god | 2024-04-04 | MEETING WITH GOD | 110 | b | No | REDIRECT | `/get-connected/groups/` 2024 five-week adult Sunday School class; Adult Elective on Groups |
| we-are-hiring | 2024-04-23 | We Are Hiring | 38 | d | No | REDIRECT | `/about/jobs/` (pending) 2024 custodian opening; Jobs page (pending) answers "jobs at Oneida", though the role differs (borderline; 404 also defensible) |
| vbs-2024-june-25-27 | 2024-04-24 | VBS 2024 - June 25-27 | 5 | b | No | REDIRECT | `/kids-and-families/` VBS 2024; VBS section with 2027 dates |
| breakfast-flowers | 2024-05-07 | Breakfast & Flowers - May 22 @ 9 AM | 0 (flyer) | a | No | LET 404 | One-off 2024 breakfast and flower-shopping outing |
| festival-of-prayer-june-2-6-pm | 2024-05-18 | Festival of Prayer, June 2, 6 PM | 149 | a | Partly | REDIRECT | `/get-connected/prayer/` (pending) 2024 corporate prayer night; prayer page (pending) covers church-wide seasons of prayer |
| picnic-time | 2024-06-29 | Picnic Time | 24 | a | No | LET 404 | 2024 fifth-Sunday picnic |
| ministry-fair-september-8 | 2024-08-26 | Ministry Fair - September 8 | 51 | b | No | REDIRECT | `/events/` 2024 Ministry Fair; yearly section on /events/ |
| new-adult-elective-on-sunday-mornings-at-9-15-am | 2024-08-28 | Adult Elective on Sunday mornings at 9:15 AM | 114 | b | No | REDIRECT | `/get-connected/groups/` 2024 adult elective; Adult Elective on Groups |
| family-movie-night-inside-out-2 | 2024-09-09 | Family Movie Night: Inside Out 2 | 9 | a | No | LET 404 | One-off 2024 movie night |
| trunk-or-treat-and-compete | 2024-09-20 | Join us at Trunk or Treat and Compete! on October 27th | 0 (flyer) | a | No | REDIRECT | `/events/` Trunk or Treat 2024; yearly section on /events/ |
| join-our-communal-journey-through-the-new-testament | 2024-10-01 | Join Our Communal Journey Through the New Testament | 142 | b | No | LET 404 | Oct-Dec 2024 New Testament reading plan; no equivalent |
| women-s-bible-study-starting-october-3-2024 | 2024-10-01 | Women's Bible Study (October 3 - Nov. 21, 2024) | 141 | b | No | REDIRECT | `/get-connected/women/` 2024 Amos study; Women page |
| teens-at-country-mill | 2024-10-02 | Teens at Country Mill | 0 (flyer) | a | No | LET 404 | One-off 2024 youth outing |
| who-is-oneida | 2024-10-21 | Who Is Oneida? | 67 | d | No | REDIRECT | `/about/membership/` Who Is Oneida? class (Feb 2025); Membership page describes the class as step 1, with a Next Class section |
| oneida-youth-christmas-party | 2024-11-19 | Oneida Youth Christmas Party | 53 | a | No | LET 404 | 2024 youth party; no event equivalent |
| christmas-eve-candlelight-service-2-1 | 2024-11-25 | Christmas Eve Candlelight Service | 0 (flyer) | a | No | REDIRECT | `/events/` 2024 Christmas Eve service flyer; same yearly service on /events/ |
| women-s-christmas-tea-and-crafting-december-15 | 2024-12-08 | Women's Christmas Tea and Crafting - December 15 | 0 (flyer) | b | No | REDIRECT | `/get-connected/women/` 2024 Christmas Tea; after the Tea line is added |
| family-new-year-s-eve-party | 2024-12-09 | Family New Year's Eve Party | 0 (flyer) | a | No | LET 404 | 2024 New Year's Eve party; no equivalent page |
| philippians-series-beginning-february-2-2025 | 2025-02-04 | Philippians Series beginning February 2, 2025 | 0 (flyer) | c | Partly | KEEP AS CONTENT | `/watch-and-listen/` 2025 Philippians series blurb (flyer); series archive, then 301 |
| christmas-at-oneida | 2025-11-11 | Christmas at Oneida | 0 (flyer) | a | No | REDIRECT | `/events/` 2025 Christmas schedule; /events/ Christmas Eve section is the yearly equivalent |
| womens-new-year-breakfast | 2026-01-02 | Womens New Year Breakfast | 0 (flyer) | a | No | REDIRECT | `/get-connected/women/` Jan 2026 women's breakfast; Women page lists the monthly breakfast or lunch |
| women-s-ministry-favorite-things-evening-2-6-26 | 2026-01-27 | Women's Ministry "Favorite Things" Evening - 2/6/26 | 40 | a | No | LET 404 | One-off Feb 2026 evening at a private home |
| easter-services-2026 | 2026-03-09 | Easter Services 2026 | 0 (flyer) | a | No | KEEP AS CONTENT | `/events/` Holy Week 2026 schedule flyer; seed a yearly "Holy Week and Easter" section on /events/ (already in events.md needs), then 301 |
| vbs-2026 | 2026-03-09 | VBS 2026 | 0 (flyer) | b | No | REDIRECT | `/kids-and-families/` VBS 2026; VBS section with 2027 dates |
| women-s-spring-bible-study | 2026-04-01 | Women's Spring Bible Study | 116 | b | No | REDIRECT | `/get-connected/women/` Spring 2026 Psalm 23 study; Women page |
| work-day-may-16-9-30-am | 2026-04-30 | Work Day - May 16 - 9:30 AM | 10 | a | No | LET 404 | One-off May 2026 building work day |
| family-camp-2026 | 2026-07-31 | Family Camp 2026 | 79 | b | Yes | REDIRECT | `/events/` Annual Family Camp; text already reused in the /events/ Family Camp section |
| want-to-know-more-about-membership-1 | 2026-08-06 | Want to know more about Membership? | 189 | d | Yes | REDIRECT | `/about/membership/` Membership invite (2026); its text is the source of the Membership page. Linked from Wix /events and both Who Is Oneida posts |
| women-s-fall-bible-study-1 | 2026-09-05 | Women's Fall Bible Study | 0 (flyer) | b | Yes | REDIRECT | `/events/womens-bible-study/` Current fall 2026 study (1 Corinthians, Wed 9:30); exact match. Linked from Wix home and /events |
| copy-of-join-us-at-trunk-or-treat-and-compete-on-october-27th | 2026-09-30 | Join us at Trunk or Treat and Compete! on October 25th | 0 (flyer) | a | No | REDIRECT | `/events/` Trunk or Treat 2026 (Oct 25, now past); yearly section on /events/. Linked from Wix home and /events |
| who-is-oneida-1 | 2026-10-20 | WHO IS ONEIDA? | 67 | d | Yes | REDIRECT | `/about/membership/` Who Is Oneida? class Nov 15 2026; not the event page, which expires Nov 15. Linked from Wix home and /events |

## Proposed `_redirects` lines

```
# Blog posts → the matching program or yearly-tradition page
/post/we-are-hiring                                                           /about/jobs/                  301
/post/want-to-know-more-about-membership                                      /about/membership/            301
/post/want-to-know-more-about-membership-1                                    /about/membership/            301
/post/who-is-oneida                                                           /about/membership/            301
/post/who-is-oneida-1                                                         /about/membership/            301
/post/happy-anniversary                                                       /about/story/                 301
/post/advent-at-oneida-gospel                                                 /events/                      301
/post/christmas-at-oneida                                                     /events/                      301
/post/christmas-eve-candlelight-service                                       /events/                      301
/post/christmas-eve-candlelight-service-2-1                                   /events/                      301
/post/christmas-eve-services                                                  /events/                      301
/post/copy-of-join-us-at-trunk-or-treat-and-compete-on-october-27th           /events/                      301
/post/easter-egg-hunt                                                         /events/                      301
/post/easter-egg-hunt-at-noon-on-3-24-24-coffee-and-refreshments-for-adults   /events/                      301
/post/family-camp-2026                                                        /events/                      301
/post/holy-week-at-oneida                                                     /events/                      301
/post/holy-week-at-oneida-1                                                   /events/                      301
/post/ministry-fair-september-8                                               /events/                      301
/post/trunk-or-treat-and-compete                                              /events/                      301
/post/women-s-fall-bible-study-1                                              /events/womens-bible-study/   301
/post/adult-and-children-s-sunday-school-resumes                              /get-connected/groups/        301
/post/light-in-the-darkness                                                   /get-connected/groups/        301
/post/meeting-with-god                                                        /get-connected/groups/        301
/post/new-adult-elective-on-sunday-mornings-at-9-15-am                        /get-connected/groups/        301
/post/new-sunday-morning-class                                                /get-connected/groups/        301
/post/other-six-days                                                          /get-connected/groups/        301
/post/sunday-school-four-weeks-of-christmas                                   /get-connected/groups/        301
/post/ten-essential-christian-truths-meeting-on-sundays-at-9-15-am            /get-connected/groups/        301
/post/what-is-a-healthy-church                                                /get-connected/groups/        301
/post/men-s-fall-bible-study-2-corinthians                                    /get-connected/men/           301
/post/men-s-study-resumes                                                     /get-connected/men/           301
/post/festival-of-prayer-june-2-6-pm                                          /get-connected/prayer/        301
/post/leap-day-lunch                                                          /get-connected/women/         301
/post/women-s-bible-study-prayer                                              /get-connected/women/         301
/post/women-s-bible-study-starting-february-15-2023                           /get-connected/women/         301
/post/women-s-bible-study-starting-october-3-2024                             /get-connected/women/         301
/post/women-s-christmas-tea-and-crafting-december-15                          /get-connected/women/         301
/post/women-s-fall-bible-study                                                /get-connected/women/         301
/post/women-s-spring-bible-study                                              /get-connected/women/         301
/post/womens-new-year-breakfast                                               /get-connected/women/         301
/post/teen-talk                                                               /kids-and-families/           301
/post/vbs-2024-june-25-27                                                     /kids-and-families/           301
/post/vbs-2026                                                                /kids-and-families/           301
# KEEP AS CONTENT posts → where the migrated content lives
/post/easter-services-2026                                                    /events/                      301
/post/women-s-christmas-tea                                                   /get-connected/women/         301
/post/a-whole-new-work-god-s-vision-from-isaiah                               /watch-and-listen/            301
/post/christmas-advent-series-god-with-us                                     /watch-and-listen/            301
/post/exciting-sequel-to-jesus-life                                           /watch-and-listen/            301
/post/fall-sermon-series                                                      /watch-and-listen/            301
/post/philippians-series-beginning-february-2-2025                            /watch-and-listen/            301
/post/relationships-made-whole                                                /watch-and-listen/            301
```

**Targets not ready yet.** Drop the matching lines at cutover if any of these
is still missing; the posts then fall back to 404.
- `/about/jobs/` and `/get-connected/prayer/` are added by the
  restore-Wix-sections change, not yet on `main`.
- The six Easter and Holy Week posts assume a yearly Easter section on
  `/events/` (already in that page's needs).
- The Christmas Tea post assumes a Tea line on `/get-connected/women/`.

`npm run verify` checks that each target page exists, but it can't check
that a section exists on that page.

## Posts worth keeping as content

- **Six sermon-series blurbs** (Ephesians 2022, Advent 2022, Isaiah, Isaiah
  40–55, Acts, Philippians) can become descriptions in the series archive
  planned for `/watch-and-listen/`. The Acts and Philippians text exists only
  in the flyer images.
- **easter-services-2026**: source for a yearly Holy Week and Easter section
  on `/events/`.
- **women-s-christmas-tea**: held every December (2023, 2024, 2025); add to
  `/get-connected/women/` or the Community Events list.
- **Optional:** teen-talk has a youth-group vision statement;
  festival-of-prayer has copy on why the church prays together. If the church
  runs a yearly Bible reading plan, the two reading-plan posts could redirect
  to a "Read the Bible together" item instead of 404ing.

## Changes from the earlier redirect-map draft

- **Who Is Oneida? posts** go to `/about/membership/`, not the
  2026-11-15 event page, which disappears once that event passes.
- **Older women's Bible study posts** go to `/get-connected/women/`. Only the
  current fall 2026 post points at `/events/womens-bible-study/`.
- **The post count is 66, not 64.**

## Decisions for Chris

- Should all 9 adult Sunday School posts point at the one Adult Elective
  listing on Groups, or should some 404?
- Should Leap Day Lunch and New Year Breakfast point at Women, which lists the
  monthly breakfast or lunch, or 404?
- **we-are-hiring** was a custodian job, and the Jobs page is for an Associate
  Pastor. Should it 301 to Jobs, or 404?
- Does the church run a reading plan every year? If so, should it get a page?
