#!/usr/bin/env bash
# Netlify production build: publish the newest release tag (vX.Y.Z), not
# main's latest commit, so unreleased work on main never goes live.
# Set RELEASE_TAG in Netlify's environment variables to pin an older tag
# (rollback); unset it to go back to the newest.
set -euo pipefail

git fetch --quiet --tags --force origin
newest=$(git tag --list 'v*' --sort=-v:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -n 1 || true)
tag=${RELEASE_TAG:-$newest}
if [ -z "$tag" ]; then
  echo "build-release: no release tag found; run npm run release first" >&2
  exit 1
fi
echo "build-release: building $tag (main is at $(git rev-parse --short HEAD))"

# Build in a separate checkout so this script and the clone Netlify made stay untouched.
dir=$(mktemp -d)
trap 'git worktree remove --force "$dir"' EXIT
git worktree add --quiet --detach "$dir" "$tag"
(cd "$dir" && npm ci --no-audit --no-fund && npm run build)
rm -rf dist
cp -R "$dir/dist" dist
