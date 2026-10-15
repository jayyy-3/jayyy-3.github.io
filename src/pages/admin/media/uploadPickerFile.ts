import type { SupabaseClient } from '@supabase/supabase-js';
import { recordAdminAuditEvent } from '../../../lib/adminAudit';
import { buildPickerObjectPath, type AdminMediaPickerAsset, type PreparedPickerUpload } from './mediaPickerFiles';

// The one private-first image upload used by the shared media picker and the Projects package
// import: create-only upload to the private library, a Draft `media_assets` row with the
// required description, readback when the row cannot be confirmed, cleanup (or a request to
// tidy up) when it was not added, a one-hour preview link, and the Change history entry.
// Nothing here is public: the protected Projects endpoint copies referenced images to the
// public library on Publish.

export const privateMediaBucket = 'urblo-admin-media';
export const pickerColumns = 'id,bucket,alt,caption,object_path,source_url,source_kind,media_type,status';

export interface MediaPickerRow {
    id: number;
    bucket: string | null;
    alt: string | null;
    caption: string | null;
    object_path: string | null;
    source_url: string | null;
    source_kind: string;
    media_type: string;
    status: string;
}

export function rowToAsset(row: MediaPickerRow): AdminMediaPickerAsset {
    return {
        id: row.id,
        bucket: row.bucket,
        alt: row.alt,
        caption: row.caption,
        objectPath: row.object_path,
        sourceUrl: row.source_url,
        sourceKind: row.source_kind,
        mediaType: row.media_type,
        status: row.status,
    };
}

export interface UploadPickerFileInput {
    client: SupabaseClient;
    userId: string;
    prepared: PreparedPickerUpload;
    /** Required description, already checked by the caller. */
    alt: string;
    /** Folder inside the private library, e.g. "project-editor" or "project-import". */
    objectPathPrefix: string;
    /** Change-history source, e.g. "project_inline" or "project_import". */
    auditSource: string;
    /** Website owners and CMS managers may remove the leftover copy of a failed upload. */
    canCleanUpStorage: boolean;
}

export type UploadPickerFileResult =
    | {
          ok: true;
          asset: AdminMediaPickerAsset;
          /** Plain-English note when the image is in the library but something minor failed. */
          warning: string | null;
      }
    | { ok: false; error: string };

const auditWarning =
    'The image was uploaded and selected, but Change history could not be updated. Ask a Website owner or CMS manager to review it.';

/** Uploads one prepared image. Never throws for expected failures; returns a plain sentence. */
export async function uploadPickerFile({
    client,
    userId,
    prepared,
    alt,
    objectPathPrefix,
    auditSource,
    canCleanUpStorage,
}: UploadPickerFileInput): Promise<UploadPickerFileResult> {
    const uploadFile = prepared.file;
    const objectPath = buildPickerObjectPath(uploadFile, objectPathPrefix);
    const dimensions =
        prepared.width && prepared.height
            ? { width: prepared.width, height: prepared.height }
            : await readImageDimensions(uploadFile);
    const upload = await client.storage.from(privateMediaBucket).upload(objectPath, uploadFile, {
        cacheControl: '31536000',
        upsert: false,
        contentType: uploadFile.type,
    });

    if (upload.error) {
        console.error('Admin media picker upload failed.', upload.error);
        return { ok: false, error: 'The image could not be uploaded. Check your connection and try again.' };
    }

    const metadata = await client
        .from('media_assets')
        .insert({
            status: 'draft',
            bucket: privateMediaBucket,
            object_path: objectPath,
            source_url: null,
            source_kind: 'storage',
            media_type: 'image',
            mime_type: uploadFile.type,
            width_px: dimensions?.width ?? null,
            height_px: dimensions?.height ?? null,
            size_bytes: uploadFile.size,
            alt,
            caption: null,
            credit: null,
            usage_notes: null,
            created_by: userId,
            updated_by: userId,
        })
        .select(pickerColumns)
        .single<MediaPickerRow>();

    let uploadedRow = metadata.data;
    let metadataConfirmedByReadback = false;
    if (metadata.error || !uploadedRow) {
        if (metadata.error) console.error('Admin media picker metadata insert failed.', metadata.error);
        const readback = await client
            .from('media_assets')
            .select(pickerColumns)
            .eq('bucket', privateMediaBucket)
            .eq('object_path', objectPath)
            .maybeSingle<MediaPickerRow>();
        uploadedRow = readback.data;

        if (!uploadedRow) {
            if (readback.error) {
                console.error('Admin media picker metadata readback failed.', readback.error);
                return {
                    ok: false,
                    error: 'The image was uploaded, but the media library could not confirm it was added. Reload the page to check before uploading it again.',
                };
            }
            if (!canCleanUpStorage) {
                return {
                    ok: false,
                    error: 'The image could not be added to the media library. Nothing is on the website. Ask a Website owner or CMS manager to tidy up the leftover copy, then try again.',
                };
            }
            const cleanup = await client.storage.from(privateMediaBucket).remove([objectPath]);
            if (cleanup.error) console.error('Admin media picker cleanup failed.', cleanup.error);
            return {
                ok: false,
                error: cleanup.error
                    ? 'The image could not be added to the media library, and its leftover copy could not be removed. Ask a Website owner or CMS manager to check it.'
                    : 'The image could not be added to the media library. Nothing was kept; try again.',
            };
        }
        metadataConfirmedByReadback = true;
    }

    const signedPreview = await client.storage.from(privateMediaBucket).createSignedUrl(objectPath, 3600);
    const asset: AdminMediaPickerAsset = {
        ...rowToAsset(uploadedRow),
        previewUrl: signedPreview.data?.signedUrl ?? null,
    };
    let warning: string | null =
        signedPreview.error || !signedPreview.data?.signedUrl
            ? 'The image was uploaded and selected, but its preview needs a page reload.'
            : null;

    try {
        const auditError = await recordAdminAuditEvent(client, {
            actorUserId: userId,
            action: 'media_asset.upload',
            entityType: 'media_assets',
            entityId: asset.id,
            metadata: {
                source: auditSource,
                storagePosture: 'private-first',
                metadataConfirmedByReadback,
                bucket: uploadedRow.bucket,
                objectPath: uploadedRow.object_path,
                mediaType: uploadedRow.media_type,
                originalBytes: prepared.originalBytes,
                uploadBytes: prepared.uploadBytes,
                resizedInBrowser: prepared.resized,
            },
        });
        if (auditError) {
            console.error('Admin media picker upload audit failed.', auditError);
            warning = auditWarning;
        }
    } catch (auditError) {
        console.error('Admin media picker upload audit failed.', auditError);
        warning = auditWarning;
    }

    return { ok: true, asset, warning };
}

async function readImageDimensions(file: File) {
    const objectUrl = URL.createObjectURL(file);
    try {
        return await new Promise<{ width: number; height: number } | null>((resolve) => {
            const image = new Image();
            image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
            image.onerror = () => resolve(null);
            image.src = objectUrl;
        });
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}
