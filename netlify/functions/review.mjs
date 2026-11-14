// The demo's review API (comments and to-dos from reviewers), from the
// review-layer package: https://github.com/chowie/review-layer
// Data lives in a site-wide Netlify Blobs store, shared by the demo and its
// deploy previews.
//
// Fails closed: the API is off unless REVIEW_PASSCODE is set (in the
// Functions scope), so unsetting it turns review off. It's also off when
// PUBLIC_ALLOW_INDEXING is "true", if that variable reaches functions.
// Function env changes take effect on the next deploy.
import { createHandler } from 'review-layer/server';
import { netlifyBlobsStore } from 'review-layer/stores/netlify-blobs';

const env = process.env;

const handler = createHandler({
  store: netlifyBlobsStore('ogc-review'),
  reviewerPasscode: env.REVIEW_PASSCODE,
  adminPasscode: env.REVIEW_ADMIN_PASSCODE,
  enabled: env.PUBLIC_ALLOW_INDEXING !== 'true',
});

export default handler;

export const config = {
  path: '/api/review/*',
  // Generous for a handful of reviewers; stops a script from flooding the store.
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
