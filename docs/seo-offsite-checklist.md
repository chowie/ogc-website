# Off-site Listings Checklist

Chris does these steps. Every value comes from `src/data/site.json` or from
copy already on the site.

**Source checks (official docs, fetched 2026-11-13):**
- Statements marked *(docs)* are quoted from the cited page.
- Steps marked *(confirm in product)* couldn't be checked, because the help page only loads with JavaScript or names no options. Follow what the product shows.

## The rule: one set of facts, everywhere

| Field | Exact value |
|---|---|
| Name | `Oneida Gospel Church` |
| Address | `3048 E. Strange Hwy., Grand Ledge, MI 48837` |
| Phone | `517.627.7112` (🟡 question 9 in seo-audit.md: if the format changes, change it here, in site.json, and on every listing at once) |
| Website | `https://www.oneidagospel.org/` (confirmed by Chris, 2026-11-13) |
| Email | `office@oneidagospel.org` |
| Sunday Worship | Sundays, 10:30 a.m. |
| Sunday School and Classes | Sundays, 9:15 a.m. (mid-September to May) |
| Short description | "A church family in Grand Ledge, opening the Bible together. Come as you are." (site.json `welcome`) |

- **Name:** don't add keywords to it. Google: "Your name should reflect your business's real-world name, as used consistently on your storefront, website, stationery, and as known to customers." *(docs)* https://support.google.com/business/answer/3038177
- **When anything changes:** update `src/data/site.json` first (the website, its structured data and `/llms.txt` all follow), then every listing below on the same day.
- **Owner:** 🟡 name one person (suggested: the church office, Bonnie Schulert, with Chris as backup). Check the listings twice a year, plus whenever the service times change for summer.

---

## 1. Google Business Profile
https://business.google.com

1. **Search first.** Look for an existing listing for "Oneida Gospel Church Grand Ledge". Claim it if one exists rather than creating a duplicate.
2. **Name, address, phone, website:** enter the values above.
3. **Categories:**
   - Primary: **Church**. Additional: only a few, if the list offers a more specific match (for example a non-denominational church category). *(confirm in product: the docs don't list category names)*
   - Google: "Choose categories that are as specific as possible… Do not use categories solely as keywords." *(docs)* https://support.google.com/business/answer/3038177
   - Google: "use a few categories from the provided list… You can't create your own category." *(docs)* https://support.google.com/business/answer/7249669
4. **Hours:**
   - Enter the office hours as regular hours (🟡 office hours are still unknown).
   - Add the service times if the hours editor offers a type for them, such as "More hours". Otherwise put them in the description and in a pinned post. *(confirm in product)*
   - Don't mark the church "open" outside staffed hours.
5. **Verification:** Google: "If your business is eligible for video verification, we recommend that you use this option." Phone and text codes can't be answered by an automated phone system. *(docs)* https://support.google.com/business/answer/7107242
   - Plan for a short video showing the church sign, the building with its address, and the office.
6. **Attributes:**
   - Accessibility attributes cover "hearing assistance devices and if the entrance, restrooms, seating, parking, and elevators are wheelchair-accessible." *(docs)* https://support.google.com/business/answer/9049526
   - Fill these in once the accessibility facts are confirmed (🟡 question 5). Only answer Yes when it's true. For example: "If the entrance… is three feet or one meter wide and has no steps or stairs, select Yes."
7. **Photos:** "JPG or PNG. Size: Between 10 KB and 5 MB. Recommended resolution: 720 px tall, 720 px wide." *(docs)* https://support.google.com/business/answer/6103862
   - Start with:
     - the church sign and bell (`src/assets/photos/church-sign-and-bell.jpg`)
     - the outside of the building
     - the entrance visitors should use
     - the worship space
     - the logo (🟡 question 7)
   - **No photos of children** until a consent policy exists.
8. **Description:** the short description above, plus the service times and "non-denominational, elder-led" (🟡 question 6).
9. **Posts:** "share announcements, offers, updates, and event details." *(docs)* https://support.google.com/business/answer/7342169
   - Post each public event from `/events` (Who Is Oneida?, the Membership Class, and the Christmas and Easter services), linking to its event page.
10. **Website link:** use `https://www.oneidagospel.org/` (not `/plan-your-visit`) unless Google offers a separate "appointment" or "menu" link.

## 2. Google Search Console
https://search.google.com/search-console

1. **Add a Domain property** for `oneidagospel.org`.
   - Domain verification (DNS) is "the only way to verify a Domain property". *(docs)* https://support.google.com/webmasters/answer/9008080
   - Add the TXT record Google gives you at the DNS host. 🟡 DNS changes need Chris's approval and access to wherever the domain's DNS is managed.
   - Doing this **before** cutover keeps the history from the Wix site.
2. **After go-live:** Sitemaps → submit `https://www.oneidagospel.org/sitemap-index.xml`.
3. **URL Inspection:** inspect `/` and `/plan-your-visit/`, then choose "Request indexing".
4. **AI features:** Google mentions a site-wide "Search generative AI control" for AI Overviews and AI Mode. Leave the site included. *(docs)* https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
5. **Rich results:** check the Enhancements reports (Events, Breadcrumbs) a week after go-live.

## 3. Bing Webmaster Tools and IndexNow
https://www.bing.com/webmasters

1. **Add the site** with "Import from Search Console". Bing's tool text says this skips manual verification and also imports submitted sitemaps. *(confirm in product: the help page only loads with JavaScript)*
2. **IndexNow (optional):**
   - Host a key file `{your-key}.txt` "at the root directory of your website". *(docs)* https://www.indexnow.org/documentation
   - For this site, that would be `public/<key>.txt` plus a post-deploy submit step.
   - At about 35 pages it's optional. Bing re-crawls the sitemap anyway.

## 4. Bing Places for Business
https://www.bingplaces.com

1. Sign in, then import the Google Business Profile, or add the place by hand with the values above. *(confirm in product)*
2. Match the categories and hours to Google.

## 5. Apple Business (formerly Apple Business Connect)
https://business.apple.com

- Apple: "Apple Business Connect is now Apple Business." *(docs)* https://support.apple.com/guide/apple-business-connect/welcome/web
- It lets you "Claim your location on Maps… Control how your business appears with your logo, hours, images, and key details." *(docs)* https://businessconnect.apple.com/

**Steps:**
1. Claim the place card for Oneida Gospel Church, and verify it the way the product asks. *(confirm in product)*
2. Enter the values above, plus the same photos and logo you used on Google.

This listing is what Siri, Apple Maps and Spotlight show.

## 6. Facebook Page
facebook.com/oneidagospel

1. **About:** enter the name, address, phone, website, email and hours exactly as above. *(confirm in product: the Meta help page only loads with JavaScript)*
2. **Category:** Church (or the closest option offered).
3. **Website field:** `https://www.oneidagospel.org/`.

## 7. Yelp and directories
- **Yelp** (https://biz.yelp.com): claim the listing if one exists, and use the same values.
- **Affiliation directories:** 🟡 only if question 6 names an association or fellowship. Its member directory is then the most valuable citation.
- **Other free listings:** add the church to any it already appears in, such as a local church finder or the Grand Ledge Area Chamber (if the church is a member), with the same values. Don't pay for listing services.

## 8. After go-live
- [ ] Search Console: sitemap submitted, no indexing errors after a week.
- [ ] Rich Results Test passes for `/` and one event (list in seo-audit.md).
- [ ] Every listing above shows exactly the same name, address and phone.
- [ ] Old Wix URLs return 301s (spot-check from redirect-map.md).
- [ ] Twice a year: re-check the listings, especially when the service times change.
