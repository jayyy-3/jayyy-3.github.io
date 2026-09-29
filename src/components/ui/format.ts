// Copy formatting shared by public pages (docs/DESIGN.md "Copy formats").

const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats a publication date in Australian day-month-year order as `10 Jun 2024`, whatever the
 * visitor's locale. Month abbreviations are fixed three-letter forms (Intl's en-AU output mixes
 * `June` and `Sept`). Date-only strings (`2024-06-10`) parse as UTC, so the UTC calendar day is
 * used in every time zone. Unparseable input is returned unchanged rather than "Invalid Date".
 */
export function formatPublicDate(value: string | undefined | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getUTCDate()} ${shortMonths[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
