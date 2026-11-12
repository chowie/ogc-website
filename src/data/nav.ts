// The site's menu: one source for the header dropdowns, footer links, section
// sub-navigation and "current section" highlighting. Order here is menu order.
//
// A child href is either a page under its parent's path (/about/beliefs) or a
// section anchor on the parent page (/give#online-giving). Anchors match the
// heading ids that src/lib/section-status.mjs gives each `##` heading.

export interface NavLink {
  label: string;
  href: string;
}

export interface NavItem extends NavLink {
  children: NavLink[];
  /** Shown as the coral call-to-action button. */
  cta?: boolean;
  /** Styled smaller, at the far right of the menu bar. */
  minor?: boolean;
}

export const nav: NavItem[] = [
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'Our Beliefs', href: '/about/beliefs' },
      { label: 'Our Story', href: '/about/story' },
      { label: 'Our Team', href: '/about/team' },
      { label: 'Membership', href: '/about/membership' },
    ],
  },
  {
    label: 'Get Connected',
    href: '/get-connected',
    children: [
      { label: 'Next Steps', href: '/get-connected/next-steps' },
      { label: 'Groups', href: '/get-connected/groups' },
      { label: 'Men', href: '/get-connected/men' },
      { label: 'Women', href: '/get-connected/women' },
      { label: 'Young Adults & Singles', href: '/get-connected/young-adults-and-singles' },
      { label: 'Seniors & Care', href: '/get-connected/seniors-and-care' },
      { label: 'Serve', href: '/get-connected/serve' },
    ],
  },
  {
    label: 'Kids & Families',
    href: '/kids-and-families',
    children: [
      { label: 'Age Groups', href: '/kids-and-families#age-groups' },
      { label: 'Check-In and Safety', href: '/kids-and-families#check-in-and-safety' },
      { label: 'Parent Resources', href: '/kids-and-families#parent-resources' },
    ],
  },
  {
    label: 'Events',
    href: '/events',
    children: [
      { label: 'Calendar', href: '/events#calendar' },
      { label: 'Community Events', href: '/events#community-events' },
    ],
  },
  {
    label: 'Watch & Listen',
    href: '/watch-and-listen',
    children: [
      { label: 'Short Videos', href: '/watch-and-listen#short-videos' },
      { label: 'Sermon Podcast', href: '/watch-and-listen#sermon-podcast' },
      { label: 'Monthly Service Video', href: '/watch-and-listen#monthly-service-video' },
      { label: 'Series Archive', href: '/watch-and-listen#series-archive' },
    ],
  },
  {
    label: 'Give',
    href: '/give',
    minor: true,
    children: [
      { label: 'Online Giving', href: '/give#online-giving' },
      { label: 'Other Ways to Give', href: '/give#other-ways-to-give' },
      { label: 'Where Giving Goes', href: '/give#where-giving-goes' },
    ],
  },
  {
    label: 'Contact',
    href: '/contact',
    minor: true,
    children: [
      { label: 'Office Hours', href: '/contact#office-hours' },
      { label: 'Prayer Request', href: '/contact#prayer-request' },
      { label: 'Staff Directory', href: '/contact#staff-directory' },
    ],
  },
  {
    label: 'Plan Your Visit',
    href: '/plan-your-visit',
    cta: true,
    children: [
      { label: 'Service Times and Location', href: '/plan-your-visit#service-times-and-location' },
      { label: 'What a Sunday Looks Like', href: '/plan-your-visit#what-a-sunday-looks-like' },
      { label: 'Your Kids', href: '/plan-your-visit#your-kids' },
      { label: 'New to the Area?', href: '/plan-your-visit#new-to-the-area' },
      { label: 'Coming Back to Church?', href: '/plan-your-visit#coming-back-to-church' },
      { label: 'FAQ', href: '/plan-your-visit#faq' },
      { label: "Let Us Know You're Coming", href: '/plan-your-visit#let-us-know-youre-coming' },
    ],
  },
];

/** '/about/' -> '/about'; '' or '/' -> '/'. */
export const normalizePath = (p: string) => p.replace(/\/$/, '') || '/';

/** The top-level menu item a path belongs to, if any. */
export function sectionFor(pathname: string): NavItem | undefined {
  const path = normalizePath(pathname);
  return nav.find((item) => path === item.href || path.startsWith(`${item.href}/`));
}

/** The child page a path is on (not anchors), for aria-current in submenus. */
export function isCurrentPage(link: NavLink, pathname: string): boolean {
  const path = normalizePath(pathname);
  return !link.href.includes('#') && (path === link.href || path.startsWith(`${link.href}/`));
}
