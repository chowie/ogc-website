// The link-preview photo (Open Graph), cropped to the 1200×630 previews use.
// Base uses it for og:image and the home page for the Church's `image`, so
// both name the same file and the build makes it once.
import { getImage } from 'astro:assets';
import sharePhoto from '../assets/photos/church-sign-and-bell.jpg';

export const SHARE_IMAGE_ALT =
  'The Oneida Gospel Church sign beside the old church bell, in front of the stone-and-brick wall with its cross.';

/** Absolute URL of the share image on this site. */
export async function shareImageUrl(site: URL) {
  const image = await getImage({ src: sharePhoto, width: 1200, height: 630, fit: 'cover', format: 'jpg' });
  return new URL(image.src, site).href;
}
