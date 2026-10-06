import { defaultCompanyLocations } from '../lib/companyLocations';

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
}

export const siteLogoUrl = '/media/launch/identity/urblo-logo.png';

export const siteBrandStatement =
  'devoted to supporting ethical and significant projects every step of the way.';

export const siteCtas = {
  capabilities: {
    label: 'Capabilities',
    to: '/capabilities',
  },
  contact: {
    label: 'Discuss a project',
    to: '/contact',
  },
  sampleRequest: {
    label: 'Request samples',
    to: '/contact?intent=sample-request',
  },
  stoneLibrary: {
    label: 'Explore Stone Library',
    to: '/stone-library',
  },
  capabilityStatementDownload: {
    label: 'Download capability statement',
    href: '/downloads/urblo-capability-statement-2026.pdf',
    filename: 'urblo-capability-statement-2026.pdf',
  },
} as const;

/**
 * Direct contact channels as written in public copy (docs/DESIGN.md "Copy formats"). The phone
 * number is displayed as the vanity `1300 1URBLO` and dialled as 1300 187 256; the footer alone shows
 * `phoneDigits` so the registered business number is visible for platform verification.
 */
export const siteContact = {
  email: 'info@urblo.com.au',
  phoneDisplay: '1300 1URBLO',
  phoneDigits: '1300 187 256',
  phoneHref: 'tel:1300187256',
} as const;

export const siteNavLinks: SiteNavLink[] = [
  { label: 'Projects', to: '/projects' },
  { label: siteCtas.capabilities.label, to: siteCtas.capabilities.to },
  { label: 'Stone Library', to: '/stone-library' },
  { label: 'Our Story', to: '/our-story' },
  { label: 'Articles', to: '/articles' },
  { label: 'Products', to: '/products' },
  { label: 'Contact Us', to: '/contact' },
];

export const siteFooterLinks: SiteNavLink[] = [
  {
    label: siteCtas.capabilities.label,
    to: siteCtas.capabilities.to,
  },
  {
    label: 'Sample Request',
    to: siteCtas.sampleRequest.to,
  },
  {
    label: 'Contact Us',
    to: siteCtas.contact.to,
  },
];

export const siteSocialLinks: SiteSocialLink[] = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/urb.lo?igsh=MThyZ3g1NnoyMXc0cg%3D%3D&utm_source=qr',
  },
  {
    label: 'LinkedIn',
    href: 'https://au.linkedin.com/company/urblo',
  },
];

export const siteFooterContact: SiteFooterContact = {
  address: [defaultCompanyLocations.office, defaultCompanyLocations.warehouse],
  email: 'info@urblo.com.au',
  phone: '1300 1URBLO',
};

/** Footer legal line (Jay, 2026-10-06): registered entity and ABN, required for platform business verification. */
export const siteFooterLegalLine = '© 2026 Urban Block Australia Pty Ltd, trading as Urblo. ABN 35 675 426 561';
