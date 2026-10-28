# Changelog

All notable changes to this site are recorded here. The format follows
[Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and versions
follow [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html); see
"Releasing" in the README for what each kind of version bump means here.

Add entries under `Unreleased` as you work. `npm run release` turns that
section into the new version.

## [Unreleased]

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

[unreleased]: https://github.com/chowie/ogc-website/commits/main
