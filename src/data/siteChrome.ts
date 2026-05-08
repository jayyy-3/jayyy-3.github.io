export interface SiteNavLink {
  label: string;
  to?: string;
  href?: string;
  external?: boolean;
}

export interface SiteSocialLink {
  label: string;
  href?: string;
}

export interface SiteFooterContact {
  address: [string, string];
  email: string;
  phone: string;
  copyright: string;
}

export const siteLogoUrl = 'https://urblo.com.au/wp-content/uploads/2024/12/logo.png';

export const siteBrandStatement =
  'devoted to Support Ethical and Significant Projects Every Step of the Way.';

export const siteNavLinks: SiteNavLink[] = [
  { label: 'Projects', to: '/projects' },
  { label: 'Stone Library', to: '/stone-library' },
  { label: 'Our Story', to: '/our-story' },
  { label: 'Articles', to: '/articles' },
  { label: 'Products', to: '/products' },
  { label: 'Contact Us', to: '/contact' },
];

export const siteFooterLinks: SiteNavLink[] = [
  {
    label: 'Sample Request',
    href: 'mailto:info@urblo.com.au?subject=Sample%20Request',
    external: true,
  },
  {
    label: 'Contact Us',
    to: '/contact',
  },
];

export const siteSocialLinks: SiteSocialLink[] = [
  { label: 'Facebook' },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/urb.lo?igsh=MThyZ3g1NnoyMXc0cg%3D%3D&utm_source=qr',
  },
  {
    label: 'LinkedIn',
    href: 'https://au.linkedin.com/company/urblo',
  },
  { label: 'YouTube' },
];

export const siteFooterContact: SiteFooterContact = {
  address: ['5 Hamilton St,', 'Oakleigh VIC 3166'],
  email: 'info@urblo.com.au',
  phone: '1300 1URBLO',
  copyright: '© Copyright 2025',
};
