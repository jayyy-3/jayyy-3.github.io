export const siteSettingsFooterLimits = {
  columns: 6,
  itemsPerColumn: 12,
  titleLength: 80,
  labelLength: 100,
  textValueLength: 160,
  urlLength: 2048,
} as const;

const internalSiteUrl = new URL('https://urblo.com.au');

function hasUnsafeInternalDestinationCharacter(value: string) {
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (character === '\\' || codePoint <= 31 || (codePoint >= 127 && codePoint <= 159)) {
      return true;
    }
  }

  return false;
}

export function isSafeInternalFooterDestination(value: string) {
  return toSafeInternalFooterDestination(value) !== null;
}

export function toSafeInternalFooterDestination(value: string) {
  if (
    !value ||
    value.length > siteSettingsFooterLimits.urlLength ||
    hasUnsafeInternalDestinationCharacter(value)
  ) {
    return null;
  }

  const normalized = value.trim();
  if (!normalized.startsWith('/') || normalized.startsWith('//')) {
    return null;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(normalized);
  } catch {
    return null;
  }

  if (decoded.startsWith('//') || hasUnsafeInternalDestinationCharacter(decoded)) {
    return null;
  }

  try {
    const url = new URL(normalized, internalSiteUrl);
    if (url.origin !== internalSiteUrl.origin) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function toSafeExternalFooterDestination(value: string) {
  if (!value || value.length > siteSettingsFooterLimits.urlLength) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}
