export interface PublicEntitySeo {
  title?: string;
  description?: string;
}

export const publicEntitySeoLimits = {
  title: 180,
  description: 500,
} as const;

export function validatePublicEntitySeoDraft(title: string, description: string) {
  const normalizedTitle = normalizeText(title);
  const normalizedDescription = normalizeText(description);

  if (normalizedTitle.length > publicEntitySeoLimits.title) {
    return {
      error: `Search title must be ${publicEntitySeoLimits.title} characters or fewer.`,
      title: null,
      description: null,
    };
  }

  if (normalizedDescription.length > publicEntitySeoLimits.description) {
    return {
      error: `Search description must be ${publicEntitySeoLimits.description} characters or fewer.`,
      title: null,
      description: null,
    };
  }

  return {
    error: null,
    title: normalizedTitle || null,
    description: normalizedDescription || null,
  };
}

export function parsePublicEntitySeo(value: unknown): PublicEntitySeo | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const title = toBoundedText(record.title, publicEntitySeoLimits.title);
  const description = toBoundedText(record.description, publicEntitySeoLimits.description);

  return title || description ? { title: title ?? undefined, description: description ?? undefined } : undefined;
}

function toBoundedText(value: unknown, maximumLength: number) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = normalizeText(value);
  return normalized && normalized.length <= maximumLength ? normalized : null;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}
