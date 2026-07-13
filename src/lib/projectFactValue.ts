export type PublicProjectFactValue = string | string[];

export type ProjectFactJsonDraftResult =
  | { error: null; value: PublicProjectFactValue | null }
  | { error: string; value: null };

export function parseProjectFactJsonDraft(value: string): ProjectFactJsonDraftResult {
  const normalized = value.trim();
  if (!normalized) {
    return { error: null, value: null };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(normalized);
  } catch {
    return {
      error: 'Structured detail is not valid. Leave it blank unless this fact needs advanced structured data.',
      value: null,
    };
  }

  if (
    typeof parsed !== 'string' &&
    (!Array.isArray(parsed) || !parsed.every((entry) => typeof entry === 'string'))
  ) {
    return {
      error: 'Structured detail must be a JSON string or an array containing only text values.',
      value: null,
    };
  }

  return { error: null, value: parsed };
}

export function normalizePublicProjectFactValue(
  structuredValue: unknown,
  fallbackValue: unknown,
): PublicProjectFactValue {
  if (typeof structuredValue === 'string') {
    return structuredValue;
  }

  if (Array.isArray(structuredValue) && structuredValue.every((entry) => typeof entry === 'string')) {
    return structuredValue;
  }

  return typeof fallbackValue === 'string' ? fallbackValue : '';
}
