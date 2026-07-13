import { createContext, useContext } from 'react';
import {
  siteFooterContact,
  siteSocialLinks,
  type SiteSocialLink,
} from '../data/siteChrome.ts';
import { getPublicContentClient } from './publicContentClient.ts';
import {
  siteSettingsFooterLimits,
  toSafeInternalFooterDestination,
} from './siteSettingsFooterContract.ts';
import {
  publicSiteSettingsFieldLimits,
  toBoundedPublicSiteSettingsText,
  toPublicSiteSettingsEmail,
  toPublicSiteSettingsExternalUrl,
  toPublicSiteSettingsPhone,
  toPublicSiteSettingsShareImage,
} from './siteSettingsPublicContract.ts';

interface PublicSiteSettingsRow {
  settings_key: string;
  status: string;
  company_name: string;
  primary_email: string | null;
  primary_phone: string | null;
  social_links: unknown;
  footer_columns: unknown;
  seo: unknown;
}

export type PublicFooterItem =
  | { label: string; kind: 'text'; value: string }
  | { label: string; kind: 'internal'; to: string }
  | { label: string; kind: 'external'; href: string };

export interface PublicFooterColumn {
  title: string;
  items: PublicFooterItem[];
}

export interface PublicSiteSettings {
  source: 'static' | 'cms';
  companyName: string;
  primaryEmail: string | null;
  primaryPhone: string | null;
  socialLinks: SiteSocialLink[];
  footerColumns: PublicFooterColumn[] | null;
  seo: {
    title: string | null;
    description: string | null;
    defaultShareImage: string | null;
  };
}

export const staticPublicSiteSettings: PublicSiteSettings = {
  source: 'static',
  companyName: 'Urblo',
  primaryEmail: siteFooterContact.email,
  primaryPhone: siteFooterContact.phone,
  socialLinks: siteSocialLinks,
  footerColumns: null,
  seo: {
    title: null,
    description: null,
    defaultShareImage: null,
  },
};

export const PublicSiteSettingsContext = createContext<PublicSiteSettings>(
  staticPublicSiteSettings,
);

export function usePublicSiteSettings() {
  return useContext(PublicSiteSettingsContext);
}

export function createRefreshablePublicSiteSettingsLoader(
  fetchSettings: () => Promise<PublicSiteSettings>,
  fallbackSettings: PublicSiteSettings = staticPublicSiteSettings,
) {
  let activeRequest: Promise<PublicSiteSettings> | null = null;

  return function loadSettings() {
    if (!activeRequest) {
      activeRequest = fetchSettings()
        .catch(() => fallbackSettings)
        .finally(() => {
          activeRequest = null;
        });
    }

    return activeRequest;
  };
}

export const loadPublicSiteSettings = createRefreshablePublicSiteSettingsLoader(fetchPublicSiteSettings);

async function fetchPublicSiteSettings(): Promise<PublicSiteSettings> {
  const client = getPublicContentClient();
  if (!client) {
    return staticPublicSiteSettings;
  }

  const { data, error } = await client
    .from('site_settings')
    .select(
      'settings_key,status,company_name,primary_email,primary_phone,social_links,footer_columns,seo',
    )
    .eq('settings_key', 'default')
    .eq('status', 'published')
    .maybeSingle<PublicSiteSettingsRow>();

  if (error || !data) {
    return staticPublicSiteSettings;
  }

  return parsePublicSiteSettings(data);
}

function parsePublicSiteSettings(row: PublicSiteSettingsRow): PublicSiteSettings {
  if (row.settings_key !== 'default' || row.status !== 'published') {
    return staticPublicSiteSettings;
  }

  const companyName =
    toBoundedPublicSiteSettingsText(
      row.company_name,
      publicSiteSettingsFieldLimits.companyName,
    ) || staticPublicSiteSettings.companyName;
  const email = toPublicSiteSettingsEmail(row.primary_email);
  const phone = toPublicSiteSettingsPhone(row.primary_phone);

  return {
    source: 'cms',
    companyName,
    primaryEmail:
      row.primary_email === null
        ? null
        : email || staticPublicSiteSettings.primaryEmail,
    primaryPhone:
      row.primary_phone === null ? null : phone || staticPublicSiteSettings.primaryPhone,
    socialLinks: parseSocialLinks(row.social_links),
    footerColumns: parseFooterColumns(row.footer_columns),
    seo: parseSeo(row.seo),
  };
}

function parseSocialLinks(value: unknown): SiteSocialLink[] {
  if (!isRecord(value)) {
    return staticPublicSiteSettings.socialLinks;
  }

  const links: SiteSocialLink[] = [];
  const instagram = toPublicSiteSettingsExternalUrl(value.instagram);
  const linkedin = toPublicSiteSettingsExternalUrl(value.linkedin);

  if (instagram) {
    links.push({ label: 'Instagram', href: instagram });
  }
  if (linkedin) {
    links.push({ label: 'LinkedIn', href: linkedin });
  }

  return links;
}

function parseFooterColumns(value: unknown): PublicFooterColumn[] | null {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > siteSettingsFooterLimits.columns
  ) {
    return null;
  }

  const columns: PublicFooterColumn[] = [];

  for (const rawColumn of value) {
    if (!isRecord(rawColumn) || !hasOnlyKeys(rawColumn, ['title', 'items'])) {
      return null;
    }

    const title = toBoundedPublicSiteSettingsText(
      rawColumn.title,
      siteSettingsFooterLimits.titleLength,
    );
    if (!title || !Array.isArray(rawColumn.items) || rawColumn.items.length === 0) {
      return null;
    }
    if (rawColumn.items.length > siteSettingsFooterLimits.itemsPerColumn) {
      return null;
    }

    const items: PublicFooterItem[] = [];
    for (const rawItem of rawColumn.items) {
      const item = parseFooterItem(rawItem);
      if (!item) {
        return null;
      }
      items.push(item);
    }

    columns.push({ title, items });
  }

  return columns;
}

function parseFooterItem(value: unknown): PublicFooterItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const label = toBoundedPublicSiteSettingsText(value.label, siteSettingsFooterLimits.labelLength);
  if (!label) {
    return null;
  }

  const destinations = ['to', 'href', 'value'].filter((key) => {
    const destination = value[key];
    return typeof destination === 'string' && destination.trim().length > 0;
  });
  if (destinations.length !== 1) {
    return null;
  }

  if (!hasOnlyKeys(value, ['label', destinations[0]])) {
    return null;
  }

  if (destinations[0] === 'to') {
    const safeDestination =
      typeof value.to === 'string' ? toSafeInternalFooterDestination(value.to) : null;
    return safeDestination
      ? { label, kind: 'internal', to: safeDestination }
      : null;
  }

  if (destinations[0] === 'href') {
    const href = toPublicSiteSettingsExternalUrl(value.href);
    return href ? { label, kind: 'external', href } : null;
  }

  const text = toBoundedPublicSiteSettingsText(
    value.value,
    siteSettingsFooterLimits.textValueLength,
  );
  return text ? { label, kind: 'text', value: text } : null;
}

function parseSeo(value: unknown): PublicSiteSettings['seo'] {
  if (!isRecord(value)) {
    return staticPublicSiteSettings.seo;
  }

  return {
    title: toBoundedPublicSiteSettingsText(value.title, publicSiteSettingsFieldLimits.seoTitle),
    description: toBoundedPublicSiteSettingsText(
      value.description,
      publicSiteSettingsFieldLimits.seoDescription,
    ),
    defaultShareImage: toPublicSiteSettingsShareImage(value.defaultShareImage),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowedKeys: string[]) {
  const allowed = new Set(allowedKeys);
  return Object.keys(value).every((key) => allowed.has(key));
}
