import type { SupabaseClient } from '@supabase/supabase-js';

export const PUBLIC_MEDIA_BUCKET = 'urblo-public-media';

export type PublicMediaLocation = {
  status: string | null;
  source_kind: string | null;
  source_url: string | null;
  bucket: string | null;
  object_path: string | null;
};

type PublicStorageClient = Pick<SupabaseClient, 'storage'>;

export function toSafePublicMediaSourceUrl(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();
  if (!normalized) {
    return undefined;
  }

  if (normalized.startsWith('/') && !normalized.startsWith('//')) {
    return normalized;
  }

  try {
    const url = new URL(normalized);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Resolves a published CMS media row to a URL that is safe to render publicly.
 * Storage objects are only exposed from Urblo's explicitly public bucket;
 * external, R2, and Stream records continue to use their stored source URL.
 */
export function resolvePublicMediaUrl(
  media: PublicMediaLocation | null | undefined,
  supabase: PublicStorageClient | null,
): string | undefined {
  if (!media || media.status !== 'published') {
    return undefined;
  }

  const sourceUrl = toSafePublicMediaSourceUrl(media.source_url);
  if (media.source_kind !== 'storage') {
    return sourceUrl || undefined;
  }

  const objectPath = media.object_path?.trim();
  if (media.bucket !== PUBLIC_MEDIA_BUCKET || !objectPath || !supabase) {
    return undefined;
  }

  return supabase.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(objectPath).data.publicUrl;
}
