import {
  siteSettingsFooterLimits,
  toSafeExternalFooterDestination,
  toSafeInternalFooterDestination,
} from './siteSettingsFooterContract.ts';

export const publicSiteSettingsFieldLimits = {
  companyName: 100,
  email: 254,
  phone: 80,
  seoTitle: 180,
  seoDescription: 500,
} as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface PublishedSiteSettingsFields {
  companyName: string;
  primaryEmail: string;
  primaryPhone: string;
  instagram: string;
  linkedin: string;
  seoTitle: string;
  seoDescription: string;
  defaultShareImage: string;
}

export interface NormalizedPublishedSiteSettingsFields {
  companyName: string;
  primaryEmail: string | null;
  primaryPhone: string | null;
  instagram: string | null;
  linkedin: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  defaultShareImage: string | null;
}

export type PublishedSiteSettingsFieldResult =
  | { error: string; value: null }
  | { error: null; value: NormalizedPublishedSiteSettingsFields };

export function toBoundedPublicSiteSettingsText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized && normalized.length <= maxLength ? normalized : null;
}

export function toPublicSiteSettingsEmail(value: unknown) {
  const normalized = toBoundedPublicSiteSettingsText(value, publicSiteSettingsFieldLimits.email);
  return normalized && emailPattern.test(normalized) ? normalized : null;
}

export function toPublicSiteSettingsPhone(value: unknown) {
  return toBoundedPublicSiteSettingsText(value, publicSiteSettingsFieldLimits.phone);
}

export function toPublicSiteSettingsExternalUrl(value: unknown) {
  const normalized = toBoundedPublicSiteSettingsText(value, siteSettingsFooterLimits.urlLength);
  return normalized ? toSafeExternalFooterDestination(normalized) : null;
}

export function toPublicSiteSettingsShareImage(value: unknown) {
  const normalized = toBoundedPublicSiteSettingsText(value, siteSettingsFooterLimits.urlLength);
  if (!normalized) {
    return null;
  }

  return toSafeInternalFooterDestination(normalized) ?? toPublicSiteSettingsExternalUrl(normalized);
}

export function normalizePublishedSiteSettingsFields(
  fields: PublishedSiteSettingsFields,
): PublishedSiteSettingsFieldResult {
  const companyName = toBoundedPublicSiteSettingsText(
    fields.companyName,
    publicSiteSettingsFieldLimits.companyName,
  );
  if (!companyName) {
    return {
      error: `Published settings need a company name of ${publicSiteSettingsFieldLimits.companyName} characters or fewer.`,
      value: null,
    };
  }

  const primaryEmail = toPublicSiteSettingsEmail(fields.primaryEmail);
  if (fields.primaryEmail.trim() && !primaryEmail) {
    return { error: 'Published settings need a valid primary email address.', value: null };
  }

  const primaryPhone = toPublicSiteSettingsPhone(fields.primaryPhone);
  if (fields.primaryPhone.trim() && !primaryPhone) {
    return {
      error: `Published settings need a primary phone of ${publicSiteSettingsFieldLimits.phone} characters or fewer.`,
      value: null,
    };
  }

  const instagram = toPublicSiteSettingsExternalUrl(fields.instagram);
  if (fields.instagram.trim() && !instagram) {
    return { error: 'Published Instagram links must be valid http(s) URLs.', value: null };
  }

  const linkedin = toPublicSiteSettingsExternalUrl(fields.linkedin);
  if (fields.linkedin.trim() && !linkedin) {
    return { error: 'Published LinkedIn links must be valid http(s) URLs.', value: null };
  }

  const seoTitle = toBoundedPublicSiteSettingsText(
    fields.seoTitle,
    publicSiteSettingsFieldLimits.seoTitle,
  );
  if (fields.seoTitle.trim() && !seoTitle) {
    return {
      error: `The homepage search title must be ${publicSiteSettingsFieldLimits.seoTitle} characters or fewer.`,
      value: null,
    };
  }

  const seoDescription = toBoundedPublicSiteSettingsText(
    fields.seoDescription,
    publicSiteSettingsFieldLimits.seoDescription,
  );
  if (fields.seoDescription.trim() && !seoDescription) {
    return {
      error: `The homepage search description must be ${publicSiteSettingsFieldLimits.seoDescription} characters or fewer.`,
      value: null,
    };
  }

  const defaultShareImage = toPublicSiteSettingsShareImage(fields.defaultShareImage);
  if (fields.defaultShareImage.trim() && !defaultShareImage) {
    return {
      error: 'The default share image must be a valid site path or http(s) URL.',
      value: null,
    };
  }

  return {
    error: null,
    value: {
      companyName,
      primaryEmail,
      primaryPhone,
      instagram,
      linkedin,
      seoTitle,
      seoDescription,
      defaultShareImage,
    },
  };
}

export function validatePublishedSiteSettingsFields(fields: PublishedSiteSettingsFields) {
  return normalizePublishedSiteSettingsFields(fields).error;
}
