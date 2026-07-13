import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    Archive,
    CheckCircle2,
    Download,
    FileUp,
    Image as ImageIcon,
    Plus,
    Save,
    Search,
    ShieldCheck,
} from 'lucide-react';
import { recordAdminAuditEvent, withAuditNotice } from '../../lib/adminAudit';
import { PUBLIC_MEDIA_BUCKET, toSafePublicMediaSourceUrl } from '../../lib/publicMediaUrl';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';
import { CmsLiveRuleCard, CmsStatusCounts, CmsStatusMeaning, CmsStatusPill } from './AdminCmsPrimitives';

type MediaStatus = 'draft' | 'published' | 'archived';
type MediaListFilter = MediaStatus | 'all';
type SourceKind = 'storage' | 'external_legacy' | 'r2' | 'stream';
type MediaType = 'image' | 'video' | 'document' | 'other';
type MediaBucket = 'urblo-admin-media' | 'urblo-public-media';

const PRIVATE_MEDIA_BUCKET: MediaBucket = 'urblo-admin-media';

interface MediaAssetRow {
    id: number;
    status: MediaStatus;
    bucket: string | null;
    object_path: string | null;
    source_url: string | null;
    source_kind: SourceKind;
    media_type: MediaType;
    mime_type: string | null;
    width_px: number | null;
    height_px: number | null;
    size_bytes: number | null;
    alt: string | null;
    caption: string | null;
    credit: string | null;
    usage_notes: string | null;
    published_at: string | null;
    archived_at: string | null;
    updated_at: string;
    created_at: string;
}

interface MediaFormState {
    status: MediaStatus;
    bucket: MediaBucket;
    objectPath: string;
    sourceUrl: string;
    sourceKind: SourceKind;
    mediaType: MediaType;
    mimeType: string;
    widthPx: string;
    heightPx: string;
    sizeBytes: string;
    alt: string;
    caption: string;
    credit: string;
    usageNotes: string;
}

const emptyForm: MediaFormState = {
    status: 'draft',
    bucket: PRIVATE_MEDIA_BUCKET,
    objectPath: '',
    sourceUrl: '',
    sourceKind: 'storage',
    mediaType: 'image',
    mimeType: '',
    widthPx: '',
    heightPx: '',
    sizeBytes: '',
    alt: '',
    caption: '',
    credit: '',
    usageNotes: '',
};

const allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'application/pdf',
    'video/mp4',
]);

const bucketLimits: Record<MediaBucket, number> = {
    'urblo-public-media': 26_214_400,
    'urblo-admin-media': 52_428_800,
};

const mediaBucketOptions: Array<{ value: MediaBucket; label: string; detail: string }> = [
    {
        value: 'urblo-admin-media',
        label: 'Private draft library',
        detail: 'Hidden from the public website. Good for uploads that are still being checked or are only for the team.',
    },
    {
        value: 'urblo-public-media',
        label: 'Public website library',
        detail: 'Ready for public pages to use after this media item is Published.',
    },
];

const mediaSourceOptions: Array<{ value: SourceKind; label: string; detail: string }> = [
    {
        value: 'storage',
        label: 'Uploaded file',
        detail: 'A file uploaded through this Media screen.',
    },
    {
        value: 'external_legacy',
        label: 'External archive link',
        detail: 'A public or archived source link kept for reference or reuse.',
    },
    {
        value: 'r2',
        label: 'Hosted file link',
        detail: 'A file hosted outside the Media upload library.',
    },
    {
        value: 'stream',
        label: 'Hosted video link',
        detail: 'A video hosted outside the Media upload library.',
    },
];

const fieldClass =
    'mt-2 min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium outline-none transition focus:border-black disabled:bg-black/[0.04] disabled:text-black/45';

const mediaAssetLoadLimit = 500;

export default function AdminMediaPage() {
    return (
        <RequireAdmin>
            <AdminMediaContent />
        </RequireAdmin>
    );
}

function AdminMediaContent() {
    const { profile, user } = useAdminAuth();
    const canEdit = profile?.role === 'owner' || profile?.role === 'admin' || profile?.role === 'editor';
    const canCleanUpStorage = profile?.role === 'owner' || profile?.role === 'admin';
    const [assets, setAssets] = useState<MediaAssetRow[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const selectedIdRef = useRef<number | null>(null);
    const [form, setForm] = useState<MediaFormState>(emptyForm);
    const [mediaSearch, setMediaSearch] = useState('');
    const [mediaStatusFilter, setMediaStatusFilter] = useState<MediaListFilter>('all');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const selectedAsset = useMemo(
        () => assets.find((asset) => asset.id === selectedId) ?? null,
        [assets, selectedId],
    );

    const loadAssets = useCallback(async () => {
        if (!supabase) {
            return;
        }

        const client: SupabaseClient = supabase;
        setIsLoading(true);
        setError(null);

        const { data, error: loadError } = await client
            .from('media_assets')
            .select(
                'id,status,bucket,object_path,source_url,source_kind,media_type,mime_type,width_px,height_px,size_bytes,alt,caption,credit,usage_notes,published_at,archived_at,updated_at,created_at',
            )
            .order('updated_at', { ascending: false })
            .limit(mediaAssetLoadLimit)
            .returns<MediaAssetRow[]>();

        if (loadError) {
            setError(loadError.message);
            setIsLoading(false);
            return;
        }

        const rows = data ?? [];
        const nextSelected = selectedIdRef.current
            ? (rows.find((asset) => asset.id === selectedIdRef.current) ?? rows[0])
            : rows[0];

        setAssets(rows);
        selectedIdRef.current = nextSelected?.id ?? null;
        setSelectedId(nextSelected?.id ?? null);
        setForm(rowToForm(nextSelected ?? null));
        setIsLoading(false);
    }, []);

    useEffect(() => {
        void loadAssets();
    }, [loadAssets]);

    function updateField<Key extends keyof MediaFormState>(key: Key, value: MediaFormState[Key]) {
        setForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    function selectAsset(asset: MediaAssetRow) {
        selectedIdRef.current = asset.id;
        setSelectedId(asset.id);
        setForm(rowToForm(asset));
        setNotice(null);
        setError(null);
    }

    function startExternalRecord() {
        selectedIdRef.current = null;
        setSelectedId(null);
        setForm({
            ...emptyForm,
            sourceKind: 'external_legacy',
            bucket: 'urblo-public-media',
        });
        setNotice('New external media item started.');
        setError(null);
    }

    async function handleUpload(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!supabase || !canEdit || !user) {
            return;
        }

        if (!file) {
            setError('Choose a media file before uploading.');
            return;
        }

        if (!allowedMimeTypes.has(file.type)) {
            setError('This file type is not allowed for the launch media buckets.');
            return;
        }

        if (file.size > bucketLimits[PRIVATE_MEDIA_BUCKET]) {
            setError(`File is too large for ${formatBucketLabel(PRIVATE_MEDIA_BUCKET)}.`);
            return;
        }

        setIsUploading(true);
        setError(null);
        setNotice(null);

        const dimensions = await getImageDimensions(file);
        const objectPath = buildObjectPath(file);
        const uploadResult = await supabase.storage.from(PRIVATE_MEDIA_BUCKET).upload(objectPath, file, {
            cacheControl: '31536000',
            upsert: false,
            contentType: file.type,
        });

        if (uploadResult.error) {
            setIsUploading(false);
            setError(uploadResult.error.message);
            return;
        }

        const metadataResponse = await supabase
            .from('media_assets')
            .insert({
                status: 'draft',
                bucket: PRIVATE_MEDIA_BUCKET,
                object_path: objectPath,
                source_kind: 'storage',
                media_type: mediaTypeFromMime(file.type),
                mime_type: file.type,
                width_px: dimensions?.width ?? null,
                height_px: dimensions?.height ?? null,
                size_bytes: file.size,
                alt: null,
                caption: null,
                credit: null,
                usage_notes: null,
                created_by: user.id,
                updated_by: user.id,
            })
            .select(
                'id,status,bucket,object_path,source_url,source_kind,media_type,mime_type,width_px,height_px,size_bytes,alt,caption,credit,usage_notes,published_at,archived_at,updated_at,created_at',
            )
            .single<MediaAssetRow>();

        let uploadedAsset = metadataResponse.data;
        let metadataConfirmedByReadback = false;

        if (metadataResponse.error || !uploadedAsset) {
            const metadataReadback = await supabase
                .from('media_assets')
                .select(
                    'id,status,bucket,object_path,source_url,source_kind,media_type,mime_type,width_px,height_px,size_bytes,alt,caption,credit,usage_notes,published_at,archived_at,updated_at,created_at',
                )
                .eq('bucket', PRIVATE_MEDIA_BUCKET)
                .eq('object_path', objectPath)
                .maybeSingle<MediaAssetRow>();

            if (metadataReadback.data) {
                uploadedAsset = metadataReadback.data;
                metadataConfirmedByReadback = true;
            } else {
                setIsUploading(false);
                const metadataError = metadataResponse.error?.message ?? 'No media metadata row was returned.';

                if (metadataReadback.error) {
                    setError(
                        `The file was uploaded privately, but the media record response failed and readback could not confirm whether it committed: ${metadataError}; readback: ${metadataReadback.error.message}. The private object was not deleted because a record may exist. Ask an Owner or Admin to inspect ${objectPath}.`,
                    );
                    return;
                }

                if (!canCleanUpStorage) {
                    setError(
                        `The file was uploaded privately, but media metadata could not be created: ${metadataError}. Editors cannot delete Storage objects, so a private orphan may remain at ${objectPath}. Ask an Owner or Admin to clean it up. It is not in the public media bucket.`,
                    );
                    return;
                }

                const cleanupError = await removeStorageObjectSafely(
                    supabase,
                    PRIVATE_MEDIA_BUCKET,
                    objectPath,
                );
                setError(
                    cleanupError
                        ? `The file was uploaded privately, but media metadata could not be created: ${metadataError}. Cleanup also failed: ${cleanupError}. A private orphan may remain at ${objectPath}; inspect it before retrying.`
                        : `The media record could not be created: ${metadataError}. The private upload was removed during cleanup, so no public object was created.`,
                );
                return;
            }
        }

        setIsUploading(false);
        setFile(null);
        setAssets((current) => [uploadedAsset, ...current.filter((asset) => asset.id !== uploadedAsset.id)]);
        selectedIdRef.current = uploadedAsset.id;
        setSelectedId(uploadedAsset.id);
        setForm(rowToForm(uploadedAsset));
        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: 'media_asset.upload',
            entityType: 'media_assets',
            entityId: uploadedAsset.id,
            metadata: {
                bucket: uploadedAsset.bucket,
                objectPath: uploadedAsset.object_path,
                mediaType: uploadedAsset.media_type,
                sizeBytes: uploadedAsset.size_bytes,
                metadataConfirmedByReadback,
            },
        });
        setNotice(
            withAuditNotice(
                metadataConfirmedByReadback
                    ? 'The initial metadata response failed, but readback confirmed the private Draft media record. Add alt text and usage notes before publishing.'
                    : 'Media uploaded privately as a Draft. Add alt text and usage notes before publishing.',
                auditError,
            ),
        );
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await saveAsset(form.status);
    }

    async function saveAsset(nextStatus: MediaStatus) {
        if (!supabase || !canEdit || !user) {
            return;
        }

        const privatePromotionRequested =
            nextStatus === 'published' &&
            form.sourceKind === 'storage' &&
            form.bucket === PRIVATE_MEDIA_BUCKET;
        let privateStoragePromotion: {
            assetId: number;
            objectPath: string;
            originalUpdatedAt: string;
        } | null = null;

        if (privatePromotionRequested) {
            const originalObjectPath = selectedAsset?.object_path?.trim() ?? '';

            if (!canCleanUpStorage) {
                setError('Private-to-public promotion requires an Owner or Admin so rollback can be completed safely.');
                return;
            }

            if (
                !selectedAsset ||
                selectedId !== selectedAsset.id ||
                selectedAsset.source_kind !== 'storage' ||
                selectedAsset.bucket !== PRIVATE_MEDIA_BUCKET ||
                !originalObjectPath
            ) {
                setError('Reload and select an existing private upload before publishing it.');
                return;
            }

            if (form.objectPath.trim() !== originalObjectPath) {
                setError(
                    'Publishing stopped because the uploaded file location no longer matches the selected private media record. Reload the item before publishing; Storage paths cannot be repaired through the publish action.',
                );
                return;
            }

            privateStoragePromotion = {
                assetId: selectedAsset.id,
                objectPath: originalObjectPath,
                originalUpdatedAt: selectedAsset.updated_at,
            };
        }

        if (nextStatus === 'published' && !canPublishMedia) {
            setError(formatMediaPublishError(publishChecklist));
            return;
        }

        const shouldPromotePrivateStorage = Boolean(privateStoragePromotion);
        const validation = validateMediaForm(
            { ...form, status: nextStatus },
            { allowPrivateStoragePublish: shouldPromotePrivateStorage },
        );
        if (validation.error) {
            setError(validation.error);
            return;
        }

        const now = new Date().toISOString();
        const payload = {
            status: nextStatus,
            bucket: shouldPromotePrivateStorage ? PUBLIC_MEDIA_BUCKET : validation.bucket,
            object_path: privateStoragePromotion?.objectPath ?? validation.objectPath,
            source_url: validation.sourceUrl,
            source_kind: form.sourceKind,
            media_type: form.mediaType,
            mime_type: form.mimeType.trim() || null,
            width_px: validation.widthPx,
            height_px: validation.heightPx,
            size_bytes: validation.sizeBytes,
            alt: form.alt.trim() || null,
            caption: form.caption.trim() || null,
            credit: form.credit.trim() || null,
            usage_notes: form.usageNotes.trim() || null,
            updated_by: user.id,
            published_at:
                nextStatus === 'published' ? (selectedAsset?.published_at ?? now) : selectedAsset?.published_at,
            archived_at: nextStatus === 'archived' ? now : null,
        };

        setIsSaving(true);
        setError(null);
        setNotice(null);

        let promotedContentType: string | null = null;

        if (privateStoragePromotion) {
            const privateDownload = await supabase.storage
                .from(PRIVATE_MEDIA_BUCKET)
                .download(privateStoragePromotion.objectPath);

            if (privateDownload.error || !privateDownload.data) {
                setIsSaving(false);
                setError(
                    `Publishing stopped before the database was changed because the private source file could not be downloaded: ${privateDownload.error?.message ?? 'No file was returned.'}`,
                );
                return;
            }

            promotedContentType =
                privateDownload.data.type || selectedAsset?.mime_type || form.mimeType.trim() || null;
            const publicFileBody =
                promotedContentType && privateDownload.data.type !== promotedContentType
                    ? new Blob([privateDownload.data], { type: promotedContentType })
                    : privateDownload.data;
            const publicUpload = await supabase.storage
                .from(PUBLIC_MEDIA_BUCKET)
                .upload(privateStoragePromotion.objectPath, publicFileBody, {
                    cacheControl: '31536000',
                    upsert: false,
                    ...(promotedContentType ? { contentType: promotedContentType } : {}),
                });

            if (publicUpload.error) {
                setIsSaving(false);
                setError(
                    `Publishing stopped before the database was changed because a new public copy could not be created: ${publicUpload.error.message}. The destination was not overwritten. If this path already exists, inspect it before retrying.`,
                );
                return;
            }
        }

        const response = privateStoragePromotion
            ? await supabase
                  .from('media_assets')
                  .update(payload)
                  .eq('id', privateStoragePromotion.assetId)
                  .eq('bucket', PRIVATE_MEDIA_BUCKET)
                  .eq('object_path', privateStoragePromotion.objectPath)
                  .eq('updated_at', privateStoragePromotion.originalUpdatedAt)
                  .select(
                      'id,status,bucket,object_path,source_url,source_kind,media_type,mime_type,width_px,height_px,size_bytes,alt,caption,credit,usage_notes,published_at,archived_at,updated_at,created_at',
                  )
                  .maybeSingle<MediaAssetRow>()
            : selectedId
            ? await supabase
                  .from('media_assets')
                  .update(payload)
                  .eq('id', selectedId)
                  .select(
                      'id,status,bucket,object_path,source_url,source_kind,media_type,mime_type,width_px,height_px,size_bytes,alt,caption,credit,usage_notes,published_at,archived_at,updated_at,created_at',
                  )
                  .single<MediaAssetRow>()
            : await supabase
                  .from('media_assets')
                  .insert({
                      ...payload,
                      created_by: user.id,
                  })
                  .select(
                      'id,status,bucket,object_path,source_url,source_kind,media_type,mime_type,width_px,height_px,size_bytes,alt,caption,credit,usage_notes,published_at,archived_at,updated_at,created_at',
                  )
                  .single<MediaAssetRow>();

        let persistedAsset = response.data;
        let databaseWriteConfirmedByReadback = false;

        if (response.error || !persistedAsset) {
            const responseFailure =
                response.error?.message ??
                'The selected private media record changed after it was loaded, so the guarded publish updated no row.';

            if (!privateStoragePromotion) {
                setIsSaving(false);
                setError(responseFailure);
                return;
            }

            const publishReadback = await supabase
                .from('media_assets')
                .select(
                    'id,status,bucket,object_path,source_url,source_kind,media_type,mime_type,width_px,height_px,size_bytes,alt,caption,credit,usage_notes,published_at,archived_at,updated_at,created_at',
                )
                .eq('id', privateStoragePromotion.assetId)
                .maybeSingle<MediaAssetRow>();

            if (publishReadback.error || !publishReadback.data) {
                setIsSaving(false);
                setError(
                    `The database publish response failed and readback could not confirm the final state: ${responseFailure}; readback: ${publishReadback.error?.message ?? 'No media record was returned.'}. The new public object was not deleted because the database may have committed. Inspect asset ${privateStoragePromotion.assetId} and ${privateStoragePromotion.objectPath} before retrying. Storage and database changes are not atomic in this browser workflow.`,
                );
                return;
            }

            const publishWasCommitted =
                publishReadback.data.status === 'published' &&
                publishReadback.data.bucket === PUBLIC_MEDIA_BUCKET &&
                publishReadback.data.object_path === privateStoragePromotion.objectPath;

            if (!publishWasCommitted) {
                const publicRollback = await removePublicObjectIfUnreferenced(
                    supabase,
                    privateStoragePromotion.objectPath,
                );
                setIsSaving(false);
                setError(
                    publicRollback.removed
                        ? `The database did not publish the media after a new public object was created: ${responseFailure}. The unreferenced public object was removed during rollback.`
                        : `The database did not publish the media after a new public object was created: ${responseFailure}. The public object was retained: ${publicRollback.detail}. Inspect ${privateStoragePromotion.objectPath} before retrying; rollback never deletes an object referenced by another media record.`,
                );
                return;
            }

            persistedAsset = publishReadback.data;
            databaseWriteConfirmedByReadback = true;
        }

        if (!persistedAsset) {
            setIsSaving(false);
            setError('The media save returned no database row, so the final state could not be confirmed.');
            return;
        }

        let privateSourceCleanup = shouldPromotePrivateStorage ? 'retained' : 'not_applicable';
        let privateSourceCleanupError: string | null = null;

        if (privateStoragePromotion) {
            const privateCleanup = await removePrivatePromotionSourceIfUnreferenced(
                supabase,
                privateStoragePromotion.objectPath,
            );
            privateSourceCleanup = privateCleanup.removed ? 'removed_after_publish' : 'retained';
            privateSourceCleanupError = privateCleanup.detail;
        }

        setAssets((current) => [
            persistedAsset,
            ...current.filter((asset) => asset.id !== persistedAsset.id),
        ]);
        selectedIdRef.current = persistedAsset.id;
        setSelectedId(persistedAsset.id);
        setForm(rowToForm(persistedAsset));
        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedId
                ? nextStatus === 'published'
                    ? 'media_asset.publish'
                    : nextStatus === 'archived'
                      ? 'media_asset.archive'
                      : 'media_asset.update'
                : 'media_asset.create',
            entityType: 'media_assets',
            entityId: persistedAsset.id,
            metadata: {
                status: persistedAsset.status,
                sourceKind: persistedAsset.source_kind,
                mediaType: persistedAsset.media_type,
                storagePromotion: shouldPromotePrivateStorage
                    ? {
                          sourceBucket: PRIVATE_MEDIA_BUCKET,
                          destinationBucket: PUBLIC_MEDIA_BUCKET,
                          objectPath: privateStoragePromotion?.objectPath,
                          originalUpdatedAt: privateStoragePromotion?.originalUpdatedAt,
                          sourcePathBoundToSelectedRecord: true,
                          contentType: promotedContentType,
                          destinationWriteMode: 'create_only_no_overwrite',
                          rollbackCapability: 'owner_admin_storage_delete',
                          browserWorkflowAtomic: false,
                          databaseWriteConfirmedByReadback,
                          privateSourceCleanup,
                          privateSourceCleanupError,
                      }
                    : null,
            },
        });
        const publishNotice = shouldPromotePrivateStorage
            ? privateSourceCleanup === 'removed_after_publish'
                ? 'Media copied to the Public website library and published. The original private file was removed after the database update succeeded.'
                : privateSourceCleanup === 'retained'
                  ? `Media copied to the Public website library and published. The private source copy remains: ${privateSourceCleanupError}`
                  : 'Media copied to the Public website library and published.'
            : 'Media published.';
        const databaseConfirmationNotice = databaseWriteConfirmedByReadback
            ? ' The initial database response failed, but a follow-up read confirmed the Published record before private-source cleanup.'
            : '';
        setIsSaving(false);
        setNotice(
            withAuditNotice(
                nextStatus === 'published'
                    ? `${publishNotice}${databaseConfirmationNotice}`
                    : 'Media metadata saved.',
                auditError,
            ),
        );
    }

    async function exportMediaManifest() {
        if (!supabase || !canEdit || !user || assets.length === 0) {
            return;
        }

        setIsExporting(true);
        setError(null);
        setNotice(null);

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: 'media_assets.export_manifest',
            entityType: 'media_assets',
            entityId: null,
            metadata: {
                exportedVisibleRows: assets.length,
                publishedCount: mediaCounts.published,
                draftCount: mediaCounts.draft,
                archivedCount: mediaCounts.archived,
            },
        });

        if (auditError) {
            setIsExporting(false);
            setError(`Media export was blocked because change history could not be recorded: ${auditError}`);
            return;
        }

        const csv = buildMediaExportCsv(assets);
        downloadTextFile(csv, `urblo-media-manifest-${new Date().toISOString().slice(0, 10)}.csv`);
        setIsExporting(false);
        setNotice(`Exported ${assets.length} visible media library items. Change history recorded.`);
    }

    const previewUrl = getMediaUrl(selectedAsset);
    const mediaCounts = useMemo(() => summarizeMedia(assets), [assets]);
    const isPrivateStorageSelection = Boolean(
        selectedAsset &&
            selectedId === selectedAsset.id &&
            form.sourceKind === 'storage' &&
            selectedAsset.source_kind === 'storage' &&
            selectedAsset.bucket === PRIVATE_MEDIA_BUCKET,
    );
    const privateStoragePathMatches = Boolean(
        isPrivateStorageSelection &&
            selectedAsset?.object_path?.trim() &&
            form.objectPath.trim() === selectedAsset.object_path.trim(),
    );
    const canAutoPromotePrivateStorage = Boolean(
        isPrivateStorageSelection &&
            privateStoragePathMatches &&
            (profile?.role === 'owner' || profile?.role === 'admin'),
    );
    const publishChecklist = useMemo(
        () => getMediaPublishChecklist(form, canAutoPromotePrivateStorage, isPrivateStorageSelection),
        [canAutoPromotePrivateStorage, form, isPrivateStorageSelection],
    );
    const canPublishMedia = publishChecklist.every((item) => item.ready);
    const filteredAssets = useMemo(
        () =>
            assets.filter((asset) => {
                const matchesStatus = mediaStatusFilter === 'all' || asset.status === mediaStatusFilter;
                const search = mediaSearch.trim().toLowerCase();
                const matchesSearch =
                    !search ||
                    [
                        asset.alt,
                        asset.caption,
                        asset.credit,
                        asset.object_path,
                        asset.source_url,
                        asset.bucket,
                        asset.source_kind,
                        asset.media_type,
                    ]
                        .filter(Boolean)
                        .some((value) => String(value).toLowerCase().includes(search));
                return matchesStatus && matchesSearch;
            }),
        [assets, mediaSearch, mediaStatusFilter],
    );

    return (
        <AdminShell
            title="Media Library"
            eyebrow={canEdit ? 'CMS editor' : 'Read only'}
            actions={
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => void exportMediaManifest()}
                        disabled={!canEdit || isExporting || assets.length === 0}
                        className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/[0.04] disabled:text-black/35"
                    >
                        <Download className="h-4 w-4" />
                        {isExporting ? 'Auditing export' : 'Export manifest'}
                    </button>
                    <button
                        type="button"
                        onClick={startExternalRecord}
                        disabled={!canEdit || isLoading}
                        className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                    >
                        <Plus className="h-4 w-4" />
                        External media
                    </button>
                </div>
            }
        >
            <div className="grid gap-5 xl:grid-cols-[minmax(280px,420px)_1fr_340px]">
                <section className="border border-black/10 bg-white">
                    <div className="border-b border-black/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                            Media library items
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-black">{assets.length} assets</h2>
                        <p className="mt-2 text-sm leading-6 text-black/55">
                            {mediaCounts.published} published, {mediaCounts.draft} draft, {mediaCounts.archived}{' '}
                            archived.
                        </p>
                        <div className="mt-4">
                            <CmsStatusCounts
                                draft={mediaCounts.draft}
                                published={mediaCounts.published}
                                archived={mediaCounts.archived}
                            />
                        </div>
                        <label className="mt-4 flex min-h-11 items-center gap-2 border border-black/10 bg-[#f8f9f5] px-3 text-sm text-black">
                            <Search className="h-4 w-4 shrink-0 text-black/42" />
                            <input
                                value={mediaSearch}
                                onChange={(event) => setMediaSearch(event.target.value)}
                                placeholder="Search description, source, location, type"
                                className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-black/36"
                            />
                        </label>
                        <div className="mt-3 grid grid-cols-4 gap-1">
                            {(['all', 'published', 'draft', 'archived'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setMediaStatusFilter(filter)}
                                    className={[
                                        'min-h-9 rounded border px-2 text-[11px] font-bold uppercase tracking-[0.1em] transition',
                                        mediaStatusFilter === filter
                                            ? 'border-black bg-black text-white'
                                            : 'border-black/10 bg-white text-black/55 hover:border-black',
                                    ].join(' ')}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="max-h-[720px] overflow-auto">
                        {isLoading ? (
                            <div className="space-y-3 p-4">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-20 animate-pulse rounded border border-black/10 bg-black/[0.04]"
                                    />
                                ))}
                            </div>
                        ) : filteredAssets.length ? (
                            <div className="divide-y divide-black/10">
                                {filteredAssets.map((asset) => (
                                    <button
                                        key={asset.id}
                                        type="button"
                                        onClick={() => selectAsset(asset)}
                                        className={[
                                            'block w-full p-4 text-left transition hover:bg-[#f8f9f5]',
                                            selectedId === asset.id ? 'bg-[#f8f9f5]' : 'bg-white',
                                        ].join(' ')}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-semibold text-black">
                                                    {formatAssetTitle(asset)}
                                                </span>
                                                <span className="mt-1 block truncate text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                                    {formatSourceKind(asset.source_kind)} · {asset.media_type}
                                                </span>
                                            </span>
                                            <CmsStatusPill status={asset.status} />
                                        </div>
                                        <p className="mt-3 truncate text-xs text-black/45">
                                            {formatMediaLocation(asset)}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-5">
                                <ImageIcon className="h-5 w-5 text-black" />
                                <h2 className="mt-5 text-xl font-semibold text-black">
                                    {assets.length ? 'No matching media' : 'No media library items yet'}
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-black/58">
                                    {assets.length
                                        ? 'Clear the search or choose another status filter.'
                                        : 'Upload a draft file or start an external media item. Published media requires alt text, usage notes, and a public-safe source.'}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
                    <section className="border border-black/10 bg-white p-5 md:p-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Metadata editor
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-black">
                                    {selectedId ? `Asset ${selectedId}` : 'New media item'}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-black/58">
                                    Keep media inspectable, credited, and safe before connecting it to public content.
                                </p>
                            </div>
                            <CmsStatusPill status={form.status} />
                        </div>

                        <div className="mt-5">
                            <CmsLiveRuleCard>
                                <CmsStatusMeaning compact />
                            </CmsLiveRuleCard>
                        </div>

                        <div className="mt-5">
                            <MediaWebsiteStatusSummary
                                status={form.status}
                                checklist={publishChecklist}
                                disabled={!selectedId && !form.objectPath.trim() && !form.sourceUrl.trim()}
                            />
                        </div>

                        <div className="mt-7 grid gap-4 md:grid-cols-2">
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Status
                                <select
                                    value={form.status}
                                    onChange={(event) => updateField('status', event.target.value as MediaStatus)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    className={fieldClass}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </label>

                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                File or link type
                                <select
                                    value={form.sourceKind}
                                    onChange={(event) => updateField('sourceKind', event.target.value as SourceKind)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    className={fieldClass}
                                >
                                    {mediaSourceOptions.map(({ value, label }) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Website visibility location (managed)
                                <input
                                    value={
                                        form.sourceKind === 'storage'
                                            ? formatBucketLabel(form.bucket)
                                            : 'Not used for external links'
                                    }
                                    readOnly
                                    disabled
                                    className={fieldClass}
                                />
                                <span className="mt-2 block text-xs font-semibold normal-case leading-5 tracking-normal text-black/45">
                                    Upload decides the real Storage location. Owner/Admin publishing creates a
                                    non-overwriting public copy before updating this record; Editor roles cannot run
                                    that cross-library promotion because rollback may require file deletion.
                                </span>
                            </label>

                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Media type
                                <select
                                    value={form.mediaType}
                                    onChange={(event) => updateField('mediaType', event.target.value as MediaType)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    className={fieldClass}
                                >
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                    <option value="document">Document</option>
                                    <option value="other">Other</option>
                                </select>
                            </label>
                        </div>

                        <div className="mt-3">
                            <MediaLocationHelp sourceKind={form.sourceKind} bucket={form.bucket} />
                        </div>

                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Uploaded file location
                            <input
                                value={form.objectPath}
                                onChange={(event) => updateField('objectPath', event.target.value)}
                                disabled={
                                    !canEdit ||
                                    isSaving ||
                                    isLoading ||
                                    form.sourceKind !== 'storage' ||
                                    selectedAsset?.source_kind === 'storage'
                                }
                                className={fieldClass}
                            />
                            <span className="mt-2 block text-xs font-semibold normal-case leading-5 tracking-normal text-black/45">
                                Filled automatically after upload. Existing Storage paths are locked so publishing and
                                cleanup cannot affect another media record; reload the item if this location looks wrong.
                            </span>
                        </label>

                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Public or reference URL
                            <input
                                value={form.sourceUrl}
                                onChange={(event) => updateField('sourceUrl', event.target.value)}
                                disabled={!canEdit || isSaving || isLoading}
                                className={fieldClass}
                            />
                            <span className="mt-2 block text-xs font-semibold normal-case leading-5 tracking-normal text-black/45">
                                Use this for external archive links, hosted video links, or public files that are not
                                uploaded through this Media screen.
                            </span>
                        </label>

                        <MediaPublishChecklist items={publishChecklist} />
                        <MediaActionBar
                            status={form.status}
                            isSaving={isSaving}
                            disabled={!canEdit || isLoading}
                            canPublish={canPublishMedia}
                            willPromotePrivateStorage={canAutoPromotePrivateStorage}
                            onSaveDraft={() => void saveAsset('draft')}
                            onPublish={() => void saveAsset('published')}
                            onArchive={() => void saveAsset('archived')}
                        />
                    </section>

                    <section className="border border-black/10 bg-white p-5 md:p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                            Public readiness
                        </p>
                        <div className="mt-5 grid gap-4">
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Alt text
                                <input
                                    value={form.alt}
                                    onChange={(event) => updateField('alt', event.target.value)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Caption
                                <input
                                    value={form.caption}
                                    onChange={(event) => updateField('caption', event.target.value)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Credit
                                <input
                                    value={form.credit}
                                    onChange={(event) => updateField('credit', event.target.value)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Usage notes
                                <textarea
                                    value={form.usageNotes}
                                    onChange={(event) => updateField('usageNotes', event.target.value)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    rows={4}
                                    className={`${fieldClass} py-3 leading-6`}
                                />
                            </label>
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white p-5 md:p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                            File details
                        </p>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                MIME type
                                <input
                                    value={form.mimeType}
                                    onChange={(event) => updateField('mimeType', event.target.value)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Size bytes
                                <input
                                    value={form.sizeBytes}
                                    onChange={(event) => updateField('sizeBytes', event.target.value)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    inputMode="numeric"
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Width px
                                <input
                                    value={form.widthPx}
                                    onChange={(event) => updateField('widthPx', event.target.value)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    inputMode="numeric"
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Height px
                                <input
                                    value={form.heightPx}
                                    onChange={(event) => updateField('heightPx', event.target.value)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    inputMode="numeric"
                                    className={fieldClass}
                                />
                            </label>
                        </div>
                    </section>
                </form>

                <aside className="space-y-5">
                    <form onSubmit={(event) => void handleUpload(event)} className="border border-black/10 bg-black p-5 text-white">
                        <FileUp className="h-5 w-5 text-[var(--urblo-lime)]" />
                        <h2 className="mt-5 text-xl font-semibold">Upload draft media</h2>
                        <p className="mt-3 text-sm leading-6 text-white/68">
                            Every upload starts in the Private draft library. Publishing copies the selected file into
                            the Public website library after alt text and usage notes are ready. Owner or Admin access
                            is required for that promotion and its rollback.
                        </p>
                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-white/65">
                            Upload destination
                            <input
                                value={formatBucketLabel(PRIVATE_MEDIA_BUCKET)}
                                readOnly
                                disabled
                                className="mt-2 min-h-11 w-full rounded border border-white/20 bg-black px-3 text-sm font-semibold text-white outline-none transition focus:border-white disabled:text-white/35"
                            />
                            <span className="mt-2 block text-xs font-semibold normal-case leading-5 tracking-normal text-white/55">
                                Draft files are never uploaded directly into the public bucket.
                            </span>
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif,image/gif,application/pdf,video/mp4"
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                setFile(event.target.files?.[0] ?? null)
                            }
                            disabled={!canEdit || isUploading}
                            className="mt-4 block w-full text-sm text-white/75 file:mr-3 file:min-h-10 file:rounded file:border-0 file:bg-white file:px-3 file:text-xs file:font-bold file:uppercase file:tracking-[0.12em] file:text-black disabled:text-white/35"
                        />
                        <button
                            type="submit"
                            disabled={!canEdit || !file || isUploading}
                            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/45"
                        >
                            <FileUp className="h-4 w-4" />
                            {isUploading ? 'Uploading' : 'Upload media'}
                        </button>
                    </form>

                    <section className="border border-black/10 bg-white p-5">
                        <ShieldCheck className="h-5 w-5 text-black" />
                        <h2 className="mt-5 text-xl font-semibold text-black">Publishing rules</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                            <li>Owner/Admin publishing creates a new public file without overwriting an existing path.</li>
                            <li>If the database update fails, cleanup checks Media references first and retains the file whenever ownership is uncertain.</li>
                            <li>Storage and database writes are sequential and are not one atomic transaction.</li>
                            <li>Storage location is managed by upload and publish actions, not by editing a bucket label.</li>
                            <li>Published media needs usage notes so editors know where it is safe to reuse.</li>
                            <li>Published images need alt text before they can support public pages.</li>
                            <li>CSV manifest exports are recorded in Change history and include only visible media items.</li>
                            <li>Viewer roles can inspect but not change media items.</li>
                        </ul>
                    </section>

                    {previewUrl ? (
                        <section className="border border-black/10 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                Preview
                            </p>
                            {form.mediaType === 'image' ? (
                                <img
                                    src={previewUrl}
                                    alt={form.alt || 'Selected media preview'}
                                    className="mt-4 aspect-[4/3] w-full rounded object-cover"
                                />
                            ) : (
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-4 block break-all text-sm font-semibold leading-6 text-black underline"
                                >
                                    {previewUrl}
                                </a>
                            )}
                        </section>
                    ) : null}

                    {error ? (
                        <section className="border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
                            {error}
                        </section>
                    ) : null}

                    {notice ? (
                        <section className="border border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.10)] p-4 text-sm font-semibold leading-6 text-black">
                            {notice}
                        </section>
                    ) : null}

                    {!canEdit ? (
                        <section className="border border-black/10 bg-white p-5 text-sm leading-6 text-black/62">
                            Current role is read-only for Media. Ask a CMS editor to upload or publish media.
                        </section>
                    ) : null}

                    <MediaActionBar
                        status={form.status}
                        isSaving={isSaving}
                        disabled={!canEdit || isLoading}
                        canPublish={canPublishMedia}
                        willPromotePrivateStorage={canAutoPromotePrivateStorage}
                        onSaveDraft={() => void saveAsset('draft')}
                        onPublish={() => void saveAsset('published')}
                        onArchive={() => void saveAsset('archived')}
                        compact
                    />
                </aside>
            </div>
        </AdminShell>
    );
}

function MediaPublishChecklist({ items }: { items: Array<{ label: string; ready: boolean; detail: string }> }) {
    const readyCount = items.filter((item) => item.ready).length;
    const allReady = readyCount === items.length;

    return (
        <section className="mt-5 border border-black/10 bg-[#f8f9f5] p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Publish checklist</p>
                    <h3 className="mt-2 text-lg font-semibold text-black">
                        {allReady ? 'Ready for public use' : `${items.length - readyCount} item${items.length - readyCount === 1 ? '' : 's'} need review`}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-black/58">
                        Published media can be selected for public Projects, Products, Articles, and Stone Library images.
                    </p>
                </div>
                <span
                    className={[
                        'inline-flex min-h-8 items-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.12em]',
                        allReady
                            ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-black'
                            : 'border-amber-300 bg-amber-50 text-amber-800',
                    ].join(' ')}
                >
                    {readyCount}/{items.length} ready
                </span>
            </div>
            <div className="mt-4 grid gap-2">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className={[
                            'border p-3',
                            item.ready ? 'border-[var(--urblo-lime)] bg-white' : 'border-amber-200 bg-amber-50',
                        ].join(' ')}
                    >
                        <div className="flex items-start gap-2">
                            {item.ready ? (
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-black" />
                            ) : (
                                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />
                            )}
                            <div>
                                <p className="text-sm font-semibold text-black">{item.label}</p>
                                <p className="mt-1 text-sm leading-5 text-black/58">{item.detail}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function MediaWebsiteStatusSummary({
    status,
    checklist,
    disabled,
}: {
    status: MediaStatus;
    checklist: Array<{ label: string; ready: boolean; detail: string }>;
    disabled?: boolean;
}) {
    const missingItems = checklist.filter((item) => !item.ready);
    const readyToPublish = !disabled && missingItems.length === 0;
    const isPublished = status === 'published';
    const stateLabel = disabled
        ? 'Choose or create media'
        : isPublished
          ? 'Available to public pages'
          : readyToPublish
            ? 'Ready, not published yet'
            : 'Not ready for public pages';
    const detail = disabled
        ? 'Select a media item or upload a draft file to see whether website pages can use it.'
        : isPublished
          ? 'This media is Published, so CMS-backed Projects, Products, Articles, and Stone Library pages can use it on the website.'
          : readyToPublish
            ? 'The checklist is clear. Publish this media before linking it to public content.'
            : `${missingItems.length} item${missingItems.length === 1 ? '' : 's'} must be fixed before public pages can use this media.`;

    return (
        <section
            className={[
                'border p-4',
                isPublished
                    ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.08)]'
                    : readyToPublish
                      ? 'border-black/10 bg-[#f8f9f5]'
                      : 'border-amber-200 bg-amber-50',
            ].join(' ')}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    {isPublished || readyToPublish ? (
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-black" />
                    ) : (
                        <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-amber-800" />
                    )}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">
                            Website media status
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-black">{stateLabel}</h3>
                        <p className="mt-2 text-sm leading-6 text-black/62">{detail}</p>
                    </div>
                </div>
                <CmsStatusPill status={status} />
            </div>
            {!disabled && missingItems[0] ? (
                <p className="mt-4 inline-flex min-h-10 items-center rounded border border-amber-300 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-amber-900">
                    Start with: {missingItems[0].label}
                </p>
            ) : null}
        </section>
    );
}

function MediaActionBar({
    status,
    isSaving,
    disabled,
    canPublish,
    willPromotePrivateStorage,
    onSaveDraft,
    onPublish,
    onArchive,
    compact = false,
}: {
    status: MediaStatus;
    isSaving: boolean;
    disabled?: boolean;
    canPublish: boolean;
    willPromotePrivateStorage: boolean;
    onSaveDraft: () => void;
    onPublish: () => void;
    onArchive: () => void;
    compact?: boolean;
}) {
    const isDisabled = disabled || isSaving;
    const actionNote = canPublish
        ? willPromotePrivateStorage
            ? 'Publish creates a non-overwriting public copy, then updates the record. A failed database update checks Media references before cleanup and retains the object when ownership is uncertain; these writes are not atomic.'
            : status === 'published'
            ? 'Published media can be selected on public CMS-backed pages after you save.'
            : status === 'archived'
              ? 'Archived media stays hidden from public pickers. Save draft if you are preparing it again.'
              : 'Save keeps changes in the Media Library. Publish only when the checklist is clear.'
        : 'Publish locked: complete the Media publish checklist first.';

    return (
        <section className={compact ? 'border border-black/10 bg-white p-4' : 'mt-5 border border-black/10 bg-[#f8f9f5] p-4'}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Media actions</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <CmsStatusPill status={status} />
                        <p className="text-sm font-semibold leading-6 text-black/62">{actionNote}</p>
                    </div>
                </div>
                <div className={compact ? 'grid gap-2' : 'flex flex-wrap gap-2'}>
                    <button
                        type="button"
                        disabled={isDisabled}
                        onClick={onSaveDraft}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-black/15 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving' : 'Save draft'}
                    </button>
                    <button
                        type="button"
                        disabled={isDisabled || !canPublish}
                        onClick={onPublish}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                        title={
                            canPublish
                                ? willPromotePrivateStorage
                                    ? 'Copy private file to public Storage and publish media'
                                    : 'Publish media'
                                : 'Complete the Media publish checklist first.'
                        }
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        {willPromotePrivateStorage ? 'Copy & publish' : 'Publish media'}
                    </button>
                    <button
                        type="button"
                        disabled={isDisabled}
                        onClick={onArchive}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/25"
                    >
                        <Archive className="h-4 w-4" />
                        Archive media
                    </button>
                </div>
            </div>
        </section>
    );
}

function MediaLocationHelp({ sourceKind, bucket }: { sourceKind: SourceKind; bucket: MediaBucket }) {
    const source = mediaSourceOptions.find((item) => item.value === sourceKind) ?? mediaSourceOptions[0];
    const location = mediaBucketOptions.find((item) => item.value === bucket) ?? mediaBucketOptions[0];

    return (
        <div className="grid gap-2 md:grid-cols-2">
            <p className="rounded border border-black/10 bg-[#f8f9f5] px-3 py-2 text-xs font-semibold leading-5 text-black/58">
                {source.detail}
            </p>
            <p className="rounded border border-black/10 bg-[#f8f9f5] px-3 py-2 text-xs font-semibold leading-5 text-black/58">
                {sourceKind === 'storage' ? location.detail : 'External and hosted links need a usable URL before publishing.'}
            </p>
        </div>
    );
}

function rowToForm(row: MediaAssetRow | null): MediaFormState {
    if (!row) {
        return emptyForm;
    }

    return {
        status: row.status,
        bucket: row.bucket === 'urblo-public-media' ? 'urblo-public-media' : 'urblo-admin-media',
        objectPath: row.object_path ?? '',
        sourceUrl: row.source_url ?? '',
        sourceKind: row.source_kind,
        mediaType: row.media_type,
        mimeType: row.mime_type ?? '',
        widthPx: row.width_px === null ? '' : String(row.width_px),
        heightPx: row.height_px === null ? '' : String(row.height_px),
        sizeBytes: row.size_bytes === null ? '' : String(row.size_bytes),
        alt: row.alt ?? '',
        caption: row.caption ?? '',
        credit: row.credit ?? '',
        usageNotes: row.usage_notes ?? '',
    };
}

function validateMediaForm(
    form: MediaFormState,
    { allowPrivateStoragePublish = false }: { allowPrivateStoragePublish?: boolean } = {},
): {
    error: string | null;
    bucket: string | null;
    objectPath: string | null;
    sourceUrl: string | null;
    widthPx: number | null;
    heightPx: number | null;
    sizeBytes: number | null;
} {
    const widthPx = optionalPositiveInteger(form.widthPx, 'Width');
    const heightPx = optionalPositiveInteger(form.heightPx, 'Height');
    const sizeBytes = optionalNonNegativeInteger(form.sizeBytes, 'Size bytes');

    if (widthPx.error) return validationFailure(widthPx.error);
    if (heightPx.error) return validationFailure(heightPx.error);
    if (sizeBytes.error) return validationFailure(sizeBytes.error);

    if (form.sourceKind === 'storage' && !form.objectPath.trim()) {
        return validationFailure('Uploaded media needs an uploaded file location before it can be saved.');
    }

    if (form.sourceKind !== 'storage' && !toSafePublicMediaSourceUrl(form.sourceUrl)) {
        return validationFailure(
            'External or hosted media needs a valid http(s) URL or site path before it can be saved.',
        );
    }

    if (form.status === 'published') {
        if (
            form.sourceKind === 'storage' &&
            form.bucket !== 'urblo-public-media' &&
            !allowPrivateStoragePublish
        ) {
            return validationFailure(
                'Select an existing private upload so Publish can copy the file into the Public website library.',
            );
        }

        if (form.mediaType === 'image' && !form.alt.trim()) {
            return validationFailure('Add image alt text before publishing this media.');
        }

        if (!form.usageNotes.trim()) {
            return validationFailure('Add usage notes before publishing this media.');
        }
    }

    return {
        error: null,
        bucket: form.sourceKind === 'storage' ? form.bucket : null,
        objectPath: form.sourceKind === 'storage' ? form.objectPath.trim() : null,
        sourceUrl:
            form.sourceKind === 'storage'
                ? form.sourceUrl.trim() || null
                : toSafePublicMediaSourceUrl(form.sourceUrl) ?? null,
        widthPx: widthPx.value,
        heightPx: heightPx.value,
        sizeBytes: sizeBytes.value,
    };
}

function getMediaPublishChecklist(
    form: MediaFormState,
    canAutoPromotePrivateStorage: boolean,
    isPrivateStorageSelection: boolean,
) {
    const hasSource =
        form.sourceKind === 'storage'
            ? Boolean(form.objectPath.trim())
            : Boolean(toSafePublicMediaSourceUrl(form.sourceUrl));
    const isPrivateStorage = form.sourceKind === 'storage' && form.bucket === 'urblo-admin-media';
    const publicLocationReady =
        form.sourceKind !== 'storage' || form.bucket === 'urblo-public-media' || (isPrivateStorage && canAutoPromotePrivateStorage);
    const altReady = form.mediaType !== 'image' || Boolean(form.alt.trim());

    return [
        {
            label: 'Source is recorded',
            ready: hasSource,
            detail:
                form.sourceKind === 'storage'
                    ? 'Uploaded media needs an uploaded file location.'
                    : 'External or hosted media needs a URL the team can inspect.',
        },
        {
            label: 'Public location',
            ready: publicLocationReady,
            detail: canAutoPromotePrivateStorage
                ? 'An Owner or Admin can create a non-overwriting public copy at the same path, then update the database. If the database fails, cleanup checks Media references first and retains the object when ownership is uncertain; this browser workflow is not atomic.'
                : isPrivateStorageSelection
                  ? 'Private-to-public promotion requires an Owner or Admin because a failed database update may require deleting the newly created public object during rollback.'
                : publicLocationReady
                  ? 'The selected source can be used by public pages.'
                  : 'Select an existing private upload so Publish can create a real public Storage copy.',
        },
        {
            label: 'Alt text for images',
            ready: altReady,
            detail: altReady ? 'Image accessibility text is ready.' : 'Add a short description of what the image shows.',
        },
        {
            label: 'Usage notes',
            ready: Boolean(form.usageNotes.trim()),
            detail: form.usageNotes.trim()
                ? 'Editors have reuse guidance for this media.'
                : 'Explain where this media can be used, for example product hero, project detail, or Stone finish.',
        },
    ];
}

function formatMediaPublishError(items: Array<{ label: string; ready: boolean; detail: string }>) {
    const firstMissing = items.find((item) => !item.ready);
    if (!firstMissing) {
        return 'Complete the media publish checklist before publishing this asset.';
    }

    return `Publish is locked for now. Start with: ${firstMissing.label}. ${firstMissing.detail} The Website media status and Publish checklist show what to fix before public pages can use this media.`;
}

function validationFailure(error: string): ReturnType<typeof validateMediaForm> {
    return {
        error,
        bucket: null,
        objectPath: null,
        sourceUrl: null,
        widthPx: null,
        heightPx: null,
        sizeBytes: null,
    };
}

function optionalPositiveInteger(value: string, label: string): { error: string | null; value: number | null } {
    if (!value.trim()) {
        return { error: null, value: null };
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return { error: `${label} must be a whole positive number.`, value: null };
    }

    return { error: null, value: parsed };
}

function optionalNonNegativeInteger(value: string, label: string): { error: string | null; value: number | null } {
    if (!value.trim()) {
        return { error: null, value: null };
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) {
        return { error: `${label} must be a whole positive number or zero.`, value: null };
    }

    return { error: null, value: parsed };
}

function mediaTypeFromMime(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf') return 'document';
    return 'other';
}

function buildObjectPath(file: File) {
    const date = new Date();
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const safeName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());

    return `uploads/${month}/${id}-${safeName || 'media'}`;
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
    if (!file.type.startsWith('image/')) {
        return null;
    }

    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: image.naturalWidth, height: image.naturalHeight });
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(null);
        };

        image.src = url;
    });
}

function buildMediaExportCsv(rows: MediaAssetRow[]) {
    const outputRows = [
        [
            'id',
            'status',
            'source_kind',
            'media_type',
            'bucket',
            'object_path',
            'source_url',
            'mime_type',
            'width_px',
            'height_px',
            'size_bytes',
            'alt',
            'caption',
            'credit',
            'usage_notes',
            'published_at',
            'archived_at',
            'created_at',
            'updated_at',
        ],
        ...rows.map((asset) => [
            asset.id,
            asset.status,
            asset.source_kind,
            asset.media_type,
            asset.bucket ?? '',
            asset.object_path ?? '',
            asset.source_url ?? '',
            asset.mime_type ?? '',
            asset.width_px ?? '',
            asset.height_px ?? '',
            asset.size_bytes ?? '',
            asset.alt ?? '',
            asset.caption ?? '',
            asset.credit ?? '',
            asset.usage_notes ?? '',
            asset.published_at ?? '',
            asset.archived_at ?? '',
            asset.created_at,
            asset.updated_at,
        ]),
    ];

    return `${outputRows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}

function csvCell(value: unknown) {
    const text = value === null || value === undefined ? '' : String(value);
    return `"${text.replace(/"/g, '""')}"`;
}

function downloadTextFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

async function removeStorageObjectSafely(
    client: SupabaseClient,
    bucket: MediaBucket,
    objectPath: string,
) {
    try {
        const removal = await client.storage.from(bucket).remove([objectPath]);
        return removal.error?.message ?? null;
    } catch (error) {
        return error instanceof Error ? error.message : 'Unknown Storage cleanup error.';
    }
}

type ConditionalStorageRemoval = {
    removed: boolean;
    detail: string | null;
};

async function removePublicObjectIfUnreferenced(
    client: SupabaseClient,
    objectPath: string,
): Promise<ConditionalStorageRemoval> {
    const referenceCheck = await client
        .from('media_assets')
        .select('id')
        .eq('bucket', PUBLIC_MEDIA_BUCKET)
        .eq('object_path', objectPath)
        .limit(1)
        .returns<Array<{ id: number }>>();

    if (referenceCheck.error) {
        return {
            removed: false,
            detail: `media-reference readback failed (${referenceCheck.error.message}), so deletion was skipped`,
        };
    }

    if (referenceCheck.data?.length) {
        return {
            removed: false,
            detail: `media record ${referenceCheck.data[0].id} references this public path, so deletion was skipped`,
        };
    }

    const removalError = await removeStorageObjectSafely(client, PUBLIC_MEDIA_BUCKET, objectPath);
    return removalError
        ? { removed: false, detail: `Storage rollback failed (${removalError})` }
        : { removed: true, detail: null };
}

async function removePrivatePromotionSourceIfUnreferenced(
    client: SupabaseClient,
    objectPath: string,
): Promise<ConditionalStorageRemoval> {
    const otherReferenceCheck = await client
        .from('media_assets')
        .select('id')
        .eq('bucket', PRIVATE_MEDIA_BUCKET)
        .eq('object_path', objectPath)
        .limit(1)
        .returns<Array<{ id: number }>>();

    if (otherReferenceCheck.error) {
        return {
            removed: false,
            detail: `private media-reference readback failed (${otherReferenceCheck.error.message}), so source deletion was skipped`,
        };
    }

    if (otherReferenceCheck.data?.length) {
        return {
            removed: false,
            detail: `media record ${otherReferenceCheck.data[0].id} still references this private path, so source deletion was skipped`,
        };
    }

    const removalError = await removeStorageObjectSafely(client, PRIVATE_MEDIA_BUCKET, objectPath);
    return removalError
        ? { removed: false, detail: `private source cleanup failed (${removalError})` }
        : { removed: true, detail: null };
}

function getMediaUrl(asset: MediaAssetRow | null) {
    if (!asset) {
        return null;
    }

    if (asset.source_kind === 'storage' && asset.bucket === 'urblo-public-media' && asset.object_path && supabase) {
        return supabase.storage.from(asset.bucket).getPublicUrl(asset.object_path).data.publicUrl;
    }

    return toSafePublicMediaSourceUrl(asset.source_url) ?? null;
}

function formatSourceKind(sourceKind: SourceKind) {
    return mediaSourceOptions.find((item) => item.value === sourceKind)?.label ?? sourceKind.replace(/_/g, ' ');
}

function formatMediaLocation(asset: MediaAssetRow) {
    if (asset.source_kind === 'storage') {
        const library =
            mediaBucketOptions.find((item) => item.value === asset.bucket)?.label ?? 'Private draft library';
        return `${library} / ${asset.object_path ? 'Uploaded file saved' : 'Missing uploaded file location'}`;
    }

    return `${formatSourceKind(asset.source_kind)} / ${asset.source_url ? 'URL saved' : 'Missing URL'}`;
}

function formatAssetTitle(asset: MediaAssetRow) {
    if (asset.alt || asset.caption) {
        return asset.alt || asset.caption || `Asset ${asset.id}`;
    }

    if (asset.source_kind === 'storage') {
        return `Untitled uploaded ${asset.media_type}`;
    }

    return `Untitled ${formatSourceKind(asset.source_kind).toLowerCase()} media`;
}

function formatBucketLabel(bucket: MediaBucket) {
    return mediaBucketOptions.find((item) => item.value === bucket)?.label ?? bucket;
}

function summarizeMedia(assets: MediaAssetRow[]) {
    return assets.reduce(
        (summary, asset) => ({
            draft: summary.draft + (asset.status === 'draft' ? 1 : 0),
            published: summary.published + (asset.status === 'published' ? 1 : 0),
            archived: summary.archived + (asset.status === 'archived' ? 1 : 0),
        }),
        { draft: 0, published: 0, archived: 0 },
    );
}
