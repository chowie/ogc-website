// The demo's review API (comments and to-dos from reviewers), from the
// review-layer package: https://github.com/chowie/review-layer
// Data lives in a site-wide Netlify Blobs store, shared by the demo and its
// deploy previews. Off unless REVIEW_PASSCODE is set, and off for good once
// the site is indexed (go-live) or PUBLIC_REVIEW is "off".
import { createHandler } from 'review-layer/server';
import { netlifyBlobsStore } from 'review-layer/stores/netlify-blobs';

const env = process.env;

const handler = createHandler({
  store: netlifyBlobsStore('ogc-review'),
  reviewerPasscode: env.REVIEW_PASSCODE,
  adminPasscode: env.REVIEW_ADMIN_PASSCODE,
  enabled: env.PUBLIC_ALLOW_INDEXING !== 'true' && env.PUBLIC_REVIEW !== 'off',
});

export default (req) => handler(req);

export const config = {
  path: '/api/review/*',
  // Generous for a handful of reviewers; stops a script from flooding the store.
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
