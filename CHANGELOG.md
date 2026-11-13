# Changelog

All notable changes to this site are recorded here. The format follows
[Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and versions
follow [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html); see
"Releasing" in the README for what each kind of version bump means here.

Add entries under `Unreleased` as you work. `npm run release` turns that
section into the new version.

## [Unreleased]

### Added

- "Can't Make It on Sunday?" on Watch & Listen for homebound members, and the
  sermon podcast (Apple Podcasts) in the footer.
- Proposed Mission Board (four members) and Treasurer on Our Team, shown as
  cards with no one named yet.
- A new home page following the website outline: welcome, a spot for the
  pastor's welcome video, what to expect, find your place, upcoming events,
  the latest video, what we believe, and a "let us know you're coming" form.
- Forms on Plan Your Visit, Next Steps, Groups, Serve and Contact (visit,
  connect, prayer request and contact). Each one says it isn't monitored yet.
- A page for each event, with who it's for, and "Invite a Friend" buttons on
  events and sermons that open the phone's share menu or copy the link.
- Deacons on Our Team: Chris Howie, Derek Smith and Jordan Shaulis, with
  draft bios. Headshots without a photo say "Photo to come".
- Men and Groups name Derek Smith as the Thursday study's leader; Young
  Adults & Singles and Groups name Jordan Shaulis as the Young Adults small
  group's leader.
- Bonnie Schulert, Office Manager, on Our Team (placeholder bio).
- Every demo section has a "Source" note saying where its copy came from:
  copied word for word, rewritten (and how), or generated as a placeholder.
- Menu from the proposed website outline, with dropdowns (keyboard and phone
  friendly) and a fuller footer.
- Every page in the outline: About (beliefs, story, team, membership), Get
  Connected (seven pages), Kids & Families, Give, Contact and more. Copy not
  yet final carries a "Draft copy" or "Placeholder" label.
- `/content-status` (not linked or indexed): what is real, draft or
  placeholder on each page, and what's still needed.
- Copy from the current site, rewritten for the web: About, Our Beliefs
  (statement of faith word for word), Our Story, Membership, Plan Your
  Visit, Kids & Families, Events, Give, Contact, Groups, Men and Women.
- Mission, vision and values from the church's Operating Procedures.
- Two church photos on Our Story: the building today and a 1950s Sunday.
- Our Team is grouped into Pastor and Elders, Deacons and Staff.
- Sunday School and classes (9:15 a.m., mid-September to May) in the
  service times.

### Changed

- Pages moved: `/visit` → `/plan-your-visit`, `/sermons` →
  `/watch-and-listen`, `/team/…` → `/about/team/…`. The old URLs redirect.
- Team bios no longer name members' children.

## [0.1.0] - 2026-10-28

### Added

- Pages: Home, About/Our Team, team member detail, Sermons, Events, Plan a
  Visit with map and contact form (Netlify Forms).
- Content collections for team, sermons and events, checked against a schema
  at build time; site settings in `src/data/site.json`.
- Team imported from the current site, with photos.
- Sermons imported from the church YouTube channel, plus a twice-daily
  GitHub Actions import.
- Weekly repeating events (DST-safe) and a daily rebuild so past events drop
  off.
- Demo hidden from search engines until `PUBLIC_ALLOW_INDEXING=true`.
- Unit tests for event date math (`npm test`).
- Release tooling: `npm run release`, and production deploys that build the
  newest release tag instead of `main`'s latest commit.

[unreleased]: https://github.com/chowie/ogc-website/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/chowie/ogc-website/releases/tag/v0.1.0
