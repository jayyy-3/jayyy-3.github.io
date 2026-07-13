import {
  toSafeExternalFooterDestination,
  toSafeInternalFooterDestination,
} from './siteSettingsFooterContract.ts';

export type SafePublicContentDestination =
  | { kind: 'internal'; href: string }
  | { kind: 'external'; href: string };

function containsUnsafeCharacter(value: string) {
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (character === '\\' || codePoint <= 31 || (codePoint >= 127 && codePoint <= 159)) {
      return true;
    }
  }
  return false;
}

export function toSafePublicContentDestination(
  value: unknown,
): SafePublicContentDestination | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized || containsUnsafeCharacter(value)) return null;

  let decoded: string;
  try {
    decoded = decodeURIComponent(normalized);
  } catch {
    return null;
  }
  if (containsUnsafeCharacter(decoded)) return null;

  if (normalized.startsWith('/')) {
    const href = toSafeInternalFooterDestination(normalized);
    return href ? { kind: 'internal', href } : null;
  }

  const href = toSafeExternalFooterDestination(normalized);
  return href ? { kind: 'external', href } : null;
}
