/**
 * Every public lead form (Contact, Sample request, Capability statement download, and any
 * future CTA form) requires a contactable phone number (Jay, 2026-11-20). The rule is loose
 * on purpose so mobiles, landlines and international numbers all pass.
 * Keep in sync with `isPhone` in functions/_lib/forms.js, which enforces the same rule.
 */
export const leadPhonePlaceholder = '04xx xxx xxx';

export function isLeadPhone(value: string) {
  const trimmed = value.trim();
  if (!/^[+\d\s().-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '').length;
  return digits >= 8 && digits <= 15;
}

/** Returns a visitor-facing error, or null when the phone is acceptable. */
export function leadPhoneError(value: string) {
  if (!value.trim()) return 'Add a phone number so Urblo can reach you.';
  if (!isLeadPhone(value)) return 'Enter a valid phone number, for example 04xx xxx xxx.';
  return null;
}
