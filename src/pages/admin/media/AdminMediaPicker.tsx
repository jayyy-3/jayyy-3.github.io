import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { FileUp, Image as ImageIcon, Search, X } from 'lucide-react';
import { recordAdminAuditEvent } from '../../../lib/adminAudit';
import { PUBLIC_MEDIA_BUCKET, toSafePublicMediaSourceUrl } from '../../../lib/publicMediaUrl';
import { supabase } from '../../../lib/supabaseClient';
import {
    buildPickerObjectPath,
    describePickerUploadLimits,
    describePreparedUpload,
    isFileNameDescription,
    pickerAcceptAttribute,
    preparePickerUpload,
    sanitizeMediaSearch,
    type AdminMediaPickerAsset,
    type AdminMediaUploadPolicy,
    type PreparedPickerUpload,
} from './mediaPickerFiles';

// Shared admin image picker (generalised from the Projects inline media field). Colleagues
// search existing images by description, or upload a new one in place: the accepted types and
// limit are shown before choosing, large photos are resized in the browser, HEIC gets clear
// guidance, and the description (alt text) starts empty and is required. Every upload lands as
// a Draft in the private library; the website only shows it once it is published.

const privateMediaBucket = 'urblo-admin-media';
const pickerColumns = 'id,bucket,alt,caption,object_path,source_url,source_kind,media_type,status';
const pickerLibraryPageSize = 24;

interface MediaPickerRow {
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

export interface AdminMediaPickerProps {
    label: string;
    description?: string;
    value: number | null;
    onChange: (mediaAssetId: number | null, asset: AdminMediaPickerAsset | null) => void;
    userId: string | null;
    /** Website owners and CMS managers: may remove a failed private upload and publish from Media. */
    canCleanUpStorage?: boolean;
    disabled?: boolean;
    /**
     * Images the caller already loaded (Projects). When omitted the picker searches the whole
     * media library itself instead of a fixed recent list.
     */
    assets?: readonly AdminMediaPickerAsset[];
    onAssetCreated?: (asset: AdminMediaPickerAsset) => void;
    /** "optimize" resizes large photos in the browser; "original" uploads the file unchanged. */
    uploadPolicy?: AdminMediaUploadPolicy;
    /** Offer Draft images too ("any"), or only images already published ("published"). */
    selectable?: 'any' | 'published';
    allowUpload?: boolean;
    /** Change-history source, e.g. "product_editor". */
    auditSource: string;
    /** Folder for new uploads inside the private library, e.g. "product-editor". */
    objectPathPrefix: string;
    /** Sentence under the selected image; defaults to its website status. */
    selectedNote?: (asset: AdminMediaPickerAsset) => string;
    /** Image shown when no library item is selected (e.g. an existing share-image address). */
    currentImageUrl?: string | null;
    instanceKey?: string;
    onPendingChange?: (instanceKey: string, pending: boolean) => void;
    onBusyChange?: (instanceKey: string, busy: boolean) => void;
    testIdPrefix?: string;
}

export default function AdminMediaPicker({
    label,
    description,
    value,
    onChange,
    userId,
    canCleanUpStorage = false,
    disabled = false,
    assets,
    onAssetCreated,
    uploadPolicy = 'optimize',
    selectable = 'any',
    allowUpload = true,
    auditSource,
    objectPathPrefix,
    selectedNote,
    currentImageUrl = null,
    instanceKey = label,
    onPendingChange,
    onBusyChange,
    testIdPrefix = 'admin-media-picker',
}: AdminMediaPickerProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const onChangeRef = useRef(onChange);
    const onAssetCreatedRef = useRef(onAssetCreated);
    onChangeRef.current = onChange;
    onAssetCreatedRef.current = onAssetCreated;
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [prepared, setPrepared] = useState<PreparedPickerUpload | null>(null);
    const [isPreparing, setIsPreparing] = useState(false);
    const [pendingAlt, setPendingAlt] = useState('');
    const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isUpdatingDescription, setIsUpdatingDescription] = useState(false);
    const [selectedAltDraft, setSelectedAltDraft] = useState('');
    const [pickerError, setPickerError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const [libraryAssets, setLibraryAssets] = useState<AdminMediaPickerAsset[]>([]);
    const [knownAssets, setKnownAssets] = useState<Record<number, AdminMediaPickerAsset>>({});
    const [isLibraryLoading, setIsLibraryLoading] = useState(false);
    const [libraryFailed, setLibraryFailed] = useState(false);
    const [libraryReloadKey, setLibraryReloadKey] = useState(0);
    const prepareGenerationRef = useRef(0);
    const selfLoading = !assets;
    const limits = describePickerUploadLimits(uploadPolicy);

    const selectedAsset = useMemo(() => {
        if (value === null) return null;
        return assets?.find((asset) => asset.id === value) ?? knownAssets[value] ?? null;
    }, [assets, knownAssets, value]);
    const hasPendingDescription = Boolean(
        selectedAsset &&
            selectedAsset.status !== 'published' &&
            selectedAltDraft.trim() !== (selectedAsset.alt ?? '').trim(),
    );
    const hasPendingWork = Boolean(pendingFile || isPreparing || isUploading || isUpdatingDescription || hasPendingDescription);
    const filteredAssets = useMemo(() => {
        if (selfLoading) return libraryAssets;
        const query = search.trim().toLowerCase();
        return (assets ?? [])
            .filter((asset) => asset.mediaType === 'image' && asset.status !== 'archived')
            .filter((asset) => selectable === 'any' || asset.status === 'published')
            .filter((asset) => {
                if (!query) return true;
                return [asset.alt, asset.caption, asset.objectPath]
                    .filter(Boolean)
                    .some((item) => String(item).toLowerCase().includes(query));
            })
            .slice(0, pickerLibraryPageSize);
    }, [assets, libraryAssets, search, selectable, selfLoading]);

    const remember = useCallback((items: readonly AdminMediaPickerAsset[]) => {
        if (!items.length) return;
        setKnownAssets((current) => {
            const next = { ...current };
            for (const item of items) next[item.id] = { ...next[item.id], ...item, previewUrl: item.previewUrl ?? next[item.id]?.previewUrl ?? null };
            return next;
        });
    }, []);

    // Library search (self-loading mode): the whole media library, newest first, filtered on the
    // server by description or caption rather than a fixed list of recent items.
    useEffect(() => {
        if (!selfLoading || !isPickerOpen || !supabase) return;
        const client = supabase;
        let cancelled = false;
        const timer = window.setTimeout(async () => {
            setIsLibraryLoading(true);
            setLibraryFailed(false);
            try {
                const rows = await searchMediaLibrary(client, search, selectable);
                const resolved = await resolvePickerPreviews(client, rows);
                if (cancelled) return;
                setLibraryAssets(resolved);
                remember(resolved);
            } catch (loadError) {
                console.error('Admin media picker library search failed.', loadError);
                if (!cancelled) setLibraryFailed(true);
            } finally {
                if (!cancelled) setIsLibraryLoading(false);
            }
        }, search ? 250 : 0);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [isPickerOpen, libraryReloadKey, remember, search, selectable, selfLoading]);

    // The selected image may be older than any search result; read it on its own.
    useEffect(() => {
        if (!selfLoading || value === null || knownAssets[value] || !supabase) return;
        const client = supabase;
        let cancelled = false;
        void (async () => {
            const result = await client.from('media_assets').select(pickerColumns).eq('id', value).maybeSingle<MediaPickerRow>();
            if (cancelled) return;
            if (result.error || !result.data) {
                if (result.error) console.error('Admin media picker could not read the selected image.', result.error);
                return;
            }
            remember(await resolvePickerPreviews(client, [result.data]));
        })();
        return () => {
            cancelled = true;
        };
    }, [knownAssets, remember, selfLoading, value]);

    useEffect(() => {
        const source = prepared?.file ?? pendingFile;
        if (!source) {
            setPendingPreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(source);
        setPendingPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [pendingFile, prepared]);

    useEffect(() => {
        setSelectedAltDraft(selectedAsset?.alt ?? '');
    }, [selectedAsset?.alt, selectedAsset?.id]);

    useEffect(() => {
        onPendingChange?.(instanceKey, hasPendingWork);
        return () => onPendingChange?.(instanceKey, false);
    }, [hasPendingWork, instanceKey, onPendingChange]);

    useEffect(() => {
        const busy = isUploading || isUpdatingDescription;
        onBusyChange?.(instanceKey, busy);
        return () => onBusyChange?.(instanceKey, false);
    }, [instanceKey, isUpdatingDescription, isUploading, onBusyChange]);

    function clearPending() {
        prepareGenerationRef.current += 1;
        setPendingFile(null);
        setPrepared(null);
        setIsPreparing(false);
        setPendingAlt('');
    }

    async function chooseFile(file: File | null) {
        setPickerError(null);
        setWarning(null);
        if (!file) return;
        clearPending();
        const generation = prepareGenerationRef.current;
        setPendingFile(file);
        setIsPickerOpen(true);
        setIsPreparing(true);
        try {
            const next = await preparePickerUpload(file, uploadPolicy);
            if (generation !== prepareGenerationRef.current) return;
            setPrepared(next);
        } catch (prepareError) {
            if (generation !== prepareGenerationRef.current) return;
            setPendingFile(null);
            setPickerError(prepareError instanceof Error ? prepareError.message : 'This image could not be used.');
        } finally {
            if (generation === prepareGenerationRef.current) setIsPreparing(false);
        }
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        void chooseFile(event.target.files?.[0] ?? null);
        event.target.value = '';
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(false);
        if (disabled || isUploading || isUpdatingDescription) return;
        void chooseFile(event.dataTransfer.files?.[0] ?? null);
    }

    function selectAsset(asset: AdminMediaPickerAsset) {
        remember([asset]);
        onChangeRef.current(asset.id, asset);
        setIsPickerOpen(false);
    }

    async function uploadPendingFile() {
        if (!supabase || !userId || !pendingFile || !prepared || disabled || isUploading) return;
        const alt = pendingAlt.trim();
        if (!alt) {
            setPickerError('Describe what is visible in the image before uploading.');
            return;
        }
        if (isFileNameDescription(alt, pendingFile.name)) {
            setPickerError('Describe what the image shows (for example "Granite bench in a city plaza"), not the file name.');
            return;
        }

        const uploadFile = prepared.file;
        setIsUploading(true);
        setPickerError(null);
        setWarning(null);
        try {
            const objectPath = buildPickerObjectPath(uploadFile, objectPathPrefix);
            const dimensions =
                prepared.width && prepared.height
                    ? { width: prepared.width, height: prepared.height }
                    : await readImageDimensions(uploadFile);
            const upload = await supabase.storage.from(privateMediaBucket).upload(objectPath, uploadFile, {
                cacheControl: '31536000',
                upsert: false,
                contentType: uploadFile.type,
            });

            if (upload.error) {
                console.error('Admin media picker upload failed.', upload.error);
                setPickerError('The image could not be uploaded. Check your connection and try again.');
                return;
            }

            const metadata = await supabase
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
                const readback = await supabase
                    .from('media_assets')
                    .select(pickerColumns)
                    .eq('bucket', privateMediaBucket)
                    .eq('object_path', objectPath)
                    .maybeSingle<MediaPickerRow>();
                uploadedRow = readback.data;

                if (!uploadedRow) {
                    if (readback.error) {
                        console.error('Admin media picker metadata readback failed.', readback.error);
                        setPickerError(
                            'The image was uploaded, but the media library could not confirm it was added. Reload the page to check before uploading it again.',
                        );
                        return;
                    }
                    if (!canCleanUpStorage) {
                        setPickerError(
                            'The image could not be added to the media library. Nothing is on the website. Ask a Website owner or CMS manager to tidy up the leftover copy, then try again.',
                        );
                        return;
                    }
                    const cleanup = await supabase.storage.from(privateMediaBucket).remove([objectPath]);
                    if (cleanup.error) console.error('Admin media picker cleanup failed.', cleanup.error);
                    setPickerError(
                        cleanup.error
                            ? 'The image could not be added to the media library, and its leftover copy could not be removed. Ask a Website owner or CMS manager to check it.'
                            : 'The image could not be added to the media library. Nothing was kept; try again.',
                    );
                    return;
                }
                metadataConfirmedByReadback = true;
            }

            const signedPreview = await supabase.storage.from(privateMediaBucket).createSignedUrl(objectPath, 3600);
            const asset: AdminMediaPickerAsset = {
                ...rowToAsset(uploadedRow),
                previewUrl: signedPreview.data?.signedUrl ?? null,
            };

            remember([asset]);
            if (selfLoading) setLibraryAssets((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
            onAssetCreatedRef.current?.(asset);
            onChangeRef.current(asset.id, asset);
            clearPending();
            setIsPickerOpen(false);
            if (signedPreview.error || !signedPreview.data?.signedUrl) {
                setWarning('The image was uploaded and selected, but its preview needs a page reload.');
            }

            try {
                const auditError = await recordAdminAuditEvent(supabase, {
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
                    setWarning(
                        'The image was uploaded and selected, but Change history could not be updated. Ask a Website owner or CMS manager to review it.',
                    );
                }
            } catch (auditError) {
                console.error('Admin media picker upload audit failed.', auditError);
                setWarning(
                    'The image was uploaded and selected, but Change history could not be updated. Ask a Website owner or CMS manager to review it.',
                );
            }
        } catch (uploadError) {
            console.error('Admin media picker upload failed.', uploadError);
            setPickerError('The image could not be uploaded. Check your connection and try again.');
        } finally {
            setIsUploading(false);
        }
    }

    async function saveSelectedDescription() {
        if (
            !supabase ||
            !userId ||
            !selectedAsset ||
            selectedAsset.status === 'published' ||
            disabled ||
            isUpdatingDescription
        )
            return;
        const alt = selectedAltDraft.trim();
        if (!alt) {
            setPickerError('Describe what is visible in the image.');
            return;
        }
        setIsUpdatingDescription(true);
        setPickerError(null);
        setWarning(null);
        try {
            const updated = await supabase
                .from('media_assets')
                .update({ alt, updated_by: userId })
                .eq('id', selectedAsset.id)
                .select(pickerColumns)
                .single<MediaPickerRow>();

            if (updated.error || !updated.data) {
                if (updated.error) console.error('Admin media picker description update failed.', updated.error);
                setPickerError('The image description could not be saved. Try again.');
                return;
            }
            const next = {
                ...selectedAsset,
                alt: updated.data.alt,
                caption: updated.data.caption,
                status: updated.data.status,
            };
            remember([next]);
            if (selfLoading) setLibraryAssets((current) => current.map((item) => (item.id === next.id ? next : item)));
            onAssetCreatedRef.current?.(next);

            try {
                const auditError = await recordAdminAuditEvent(supabase, {
                    actorUserId: userId,
                    action: 'media_asset.update',
                    entityType: 'media_assets',
                    entityId: selectedAsset.id,
                    metadata: {
                        source: auditSource,
                        field: 'alt',
                    },
                });
                if (auditError) {
                    console.error('Admin media picker description audit failed.', auditError);
                    setWarning(
                        'The image description was saved, but Change history could not be updated. Ask a Website owner or CMS manager to review it.',
                    );
                }
            } catch (auditError) {
                console.error('Admin media picker description audit failed.', auditError);
                setWarning(
                    'The image description was saved, but Change history could not be updated. Ask a Website owner or CMS manager to review it.',
                );
            }
        } catch (descriptionError) {
            console.error('Admin media picker description update failed.', descriptionError);
            setPickerError('The image description could not be saved. Try again.');
        } finally {
            setIsUpdatingDescription(false);
        }
    }

    // The picker usually sits inside an editor <form>: Enter must not submit (save) that form.
    function keepEnterInPicker(event: KeyboardEvent<HTMLInputElement>, action?: () => void) {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        action?.();
    }

    const noteForSelected = selectedAsset
        ? (selectedNote ?? ((asset: AdminMediaPickerAsset) => defaultSelectedNote(asset, canCleanUpStorage)))(selectedAsset)
        : '';
    const uploadDisabled =
        disabled || !pendingAlt.trim() || !prepared || isPreparing || isUploading || isUpdatingDescription;

    return (
        <div className="border border-black/10 bg-[#f8f9f5] p-4" data-testid={`${testIdPrefix}-field`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.13em] text-black/48">{label}</p>
                    {description ? <p className="mt-1 text-xs leading-5 text-black/52">{description}</p> : null}
                </div>
                <button
                    type="button"
                    onClick={() => setIsPickerOpen((current) => !current)}
                    disabled={disabled || isUploading || isUpdatingDescription}
                    aria-expanded={isPickerOpen}
                    className="inline-flex min-h-9 items-center gap-2 rounded border border-black/15 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                >
                    <Search className="h-4 w-4" />
                    {selectedAsset || (value === null && currentImageUrl) ? 'Replace image' : 'Choose image'}
                </button>
            </div>

            {selectedAsset ? (
                <div className="mt-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <MediaThumb asset={selectedAsset} className="h-24 w-28 shrink-0" />
                        <div className="min-w-0 flex-[1_1_10rem]">
                            <p className="truncate text-sm font-semibold text-black">{selectedAsset.alt || 'Image selected'}</p>
                            <p className="mt-1 text-xs leading-5 text-black/55">{noteForSelected}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onChange(null, null)}
                            disabled={disabled}
                            className="inline-flex h-9 w-9 items-center justify-center rounded border border-black/15 bg-white text-black transition hover:bg-black hover:text-white disabled:text-black/30"
                            aria-label={`Remove ${label}`}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    {selectedAsset.status !== 'published' ? (
                        <div className="mt-3 flex flex-wrap items-end gap-2">
                            <label className="block min-w-0 flex-[1_1_12rem] text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                                Image description
                                <input
                                    disabled={disabled || isUploading || isUpdatingDescription}
                                    value={selectedAltDraft}
                                    onChange={(event) => setSelectedAltDraft(event.target.value)}
                                    onKeyDown={(event) => keepEnterInPicker(event)}
                                    placeholder="Describe what is visible"
                                    className="mt-2 min-h-10 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium normal-case tracking-normal outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                                />
                            </label>
                            <button
                                type="button"
                                onClick={() => void saveSelectedDescription()}
                                disabled={
                                    disabled ||
                                    isUpdatingDescription ||
                                    !selectedAltDraft.trim() ||
                                    selectedAltDraft.trim() === (selectedAsset.alt ?? '').trim()
                                }
                                className="min-h-10 rounded border border-black/15 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/30"
                            >
                                {isUpdatingDescription ? 'Saving…' : 'Save description'}
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : value === null && currentImageUrl ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <img className="block h-24 w-28 shrink-0 object-cover" src={currentImageUrl} alt="" loading="lazy" />
                    <p className="min-w-0 flex-[1_1_10rem] break-words text-xs leading-5 text-black/55">Current image: {currentImageUrl}</p>
                </div>
            ) : value !== null ? (
                <div className="mt-4 flex min-h-24 items-center justify-center border border-dashed border-black/15 bg-white text-sm font-semibold text-black/45">
                    Loading the selected image…
                </div>
            ) : (
                <div className="mt-4 flex min-h-24 items-center justify-center border border-dashed border-black/15 bg-white text-sm font-semibold text-black/45">
                    No image selected
                </div>
            )}

            {isPickerOpen ? (
                <div className="mt-4 border-t border-black/10 pt-4">
                    <label className="relative block">
                        <span className="sr-only">Search the image library</span>
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
                        <input
                            type="search"
                            disabled={disabled || isUploading || isUpdatingDescription}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={(event) => keepEnterInPicker(event)}
                            placeholder="Search images by description"
                            className="min-h-11 w-full rounded border border-black/15 bg-white pl-10 pr-3 text-sm font-medium outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                        />
                    </label>
                    {selectable === 'published' ? (
                        <p className="mt-2 text-xs leading-5 text-black/52">Only published images are shown here.</p>
                    ) : null}

                    <div
                        className="mt-3 grid max-h-80 grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2 overflow-y-auto pr-1"
                        data-testid={`${testIdPrefix}-thumbnail-grid`}
                        aria-busy={isLibraryLoading}
                    >
                        {filteredAssets.map((asset) => (
                            <button
                                key={asset.id}
                                type="button"
                                disabled={disabled || isUploading || isUpdatingDescription}
                                onClick={() => selectAsset(asset)}
                                aria-pressed={value === asset.id}
                                className={[
                                    'overflow-hidden border bg-white text-left transition focus:outline-none focus:ring-2 focus:ring-black',
                                    value === asset.id ? 'border-black ring-1 ring-black' : 'border-black/10 hover:border-black/40',
                                ].join(' ')}
                            >
                                <MediaThumb asset={asset} className="aspect-[4/3] w-full" />
                                <span className="line-clamp-2 block min-h-12 px-2 py-2 text-[11px] font-semibold leading-4 text-black/64">
                                    {asset.alt || 'Image'}
                                    {asset.status !== 'published' ? <span className="block text-black/40">Not published yet</span> : null}
                                </span>
                            </button>
                        ))}
                        {isLibraryLoading && !filteredAssets.length ? (
                            <p className="col-span-full py-6 text-center text-sm text-black/48">Loading images…</p>
                        ) : null}
                        {libraryFailed ? (
                            <p className="col-span-full py-6 text-center text-sm text-black/60" role="alert">
                                The image library could not be loaded.{' '}
                                <button
                                    type="button"
                                    className="font-bold underline"
                                    onClick={() => setLibraryReloadKey((current) => current + 1)}
                                >
                                    Try again
                                </button>
                            </p>
                        ) : null}
                        {!filteredAssets.length && !isLibraryLoading && !libraryFailed ? (
                            <p className="col-span-full py-6 text-center text-sm text-black/48">No matching images.</p>
                        ) : null}
                    </div>
                    {filteredAssets.length >= pickerLibraryPageSize ? (
                        <p className="mt-2 text-xs leading-5 text-black/52">
                            Showing the {pickerLibraryPageSize} most recent matches. Type more of the description to find older images.
                        </p>
                    ) : null}

                    {allowUpload ? (
                        <div
                            onDragEnter={(event) => {
                                event.preventDefault();
                                if (!disabled && !isUploading && !isUpdatingDescription) setIsDragging(true);
                            }}
                            onDragOver={(event) => event.preventDefault()}
                            onDragLeave={(event) => {
                                if (event.currentTarget === event.target) setIsDragging(false);
                            }}
                            onDrop={handleDrop}
                            className={[
                                'mt-4 border border-dashed p-4 transition',
                                isDragging ? 'border-black bg-[rgba(0,255,25,0.12)]' : 'border-black/20 bg-white',
                            ].join(' ')}
                            data-testid={`${testIdPrefix}-dropzone`}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex min-w-0 flex-[1_1_12rem] items-start gap-3">
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-black text-white">
                                        <FileUp className="h-4 w-4" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-black">Drop a new image here</p>
                                        <p className="mt-1 text-xs text-black/48">Or choose a file from your computer.</p>
                                        <p className="mt-2 max-w-xl text-xs font-semibold leading-5 text-black/70" data-testid={`${testIdPrefix}-limits`}>
                                            {limits.types}, {limits.limit}.
                                        </p>
                                        <p className="mt-1 max-w-xl text-xs font-medium leading-5 text-black/62">{limits.note}</p>
                                        <p className="mt-1 max-w-xl text-xs font-medium leading-5 text-black/52">
                                            iPhone HEIC photos: set the camera to Most Compatible, or share the photo as a JPG first.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={disabled || isUploading || isUpdatingDescription}
                                    className="min-h-9 rounded bg-black px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white disabled:bg-black/25"
                                >
                                    Choose file
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={pickerAcceptAttribute}
                                    disabled={disabled || isUploading || isUpdatingDescription}
                                    onChange={handleFileChange}
                                    className="sr-only"
                                    tabIndex={-1}
                                    aria-label={`Upload a new image for ${label}`}
                                />
                            </div>

                            {pendingFile ? (
                                <div className="mt-4 flex flex-wrap gap-4 border-t border-black/10 pt-4">
                                    {pendingPreviewUrl ? (
                                        <img className="h-24 w-28 shrink-0 object-cover" src={pendingPreviewUrl} alt="Upload preview" />
                                    ) : null}
                                    <div className="min-w-0 flex-[1_1_12rem]">
                                        <p className="text-xs font-semibold leading-5 text-black/62" role="status">
                                            {isPreparing ? 'Preparing the image…' : prepared ? describePreparedUpload(prepared) : ''}
                                        </p>
                                        <label className="mt-2 block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                                            Image description
                                            <input
                                                disabled={disabled || isUploading}
                                                value={pendingAlt}
                                                onChange={(event) => setPendingAlt(event.target.value)}
                                                onKeyDown={(event) =>
                                                    keepEnterInPicker(event, () => {
                                                        if (!uploadDisabled) void uploadPendingFile();
                                                    })
                                                }
                                                placeholder="e.g. Granite bench beside a city footpath"
                                                aria-describedby={`${testIdPrefix}-alt-help-${instanceKey}`}
                                                className="mt-2 min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium normal-case tracking-normal outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                                            />
                                        </label>
                                        <p id={`${testIdPrefix}-alt-help-${instanceKey}`} className="mt-1 text-xs leading-5 text-black/52">
                                            Required. Say what someone would see in the picture; screen readers and search engines read it.
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => void uploadPendingFile()}
                                                disabled={uploadDisabled}
                                                className="min-h-10 rounded bg-[var(--urblo-lime)] px-4 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:bg-black hover:text-white disabled:bg-black/15 disabled:text-black/35"
                                            >
                                                {uploadPolicy === 'original'
                                                    ? isUploading
                                                        ? 'Keeping original…'
                                                        : 'Upload original'
                                                    : isUploading
                                                      ? 'Uploading…'
                                                      : 'Upload image'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={clearPending}
                                                disabled={isUploading}
                                                className="min-h-10 rounded border border-black/15 bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] text-black"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            ) : null}
            {pickerError ? (
                <p className="mt-3 text-sm font-semibold leading-5 text-red-700" role="alert">
                    {pickerError}
                </p>
            ) : null}
            {warning ? (
                <p
                    className="mt-3 border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold leading-5 text-amber-950"
                    role="status"
                >
                    {warning}
                </p>
            ) : null}
        </div>
    );
}

function defaultSelectedNote(asset: AdminMediaPickerAsset, canPublishFromMedia: boolean) {
    if (asset.status === 'published') return 'Published image. It can appear on the website.';
    return canPublishFromMedia
        ? 'Not published yet, so the website will not show it. Publish it from Media when its description is final.'
        : 'Not published yet, so the website will not show it. Ask a Website owner or CMS manager to publish it from Media.';
}

function MediaThumb({ asset, className }: { asset: AdminMediaPickerAsset; className: string }) {
    const source = asset.previewUrl || asset.sourceUrl;
    if (!source) {
        return (
            <span className={`${className} grid place-items-center bg-black/[0.05] text-black/30`}>
                <ImageIcon className="h-5 w-5" />
            </span>
        );
    }
    return <img className={`${className} block object-cover`} src={source} alt={asset.alt || ''} loading="lazy" />;
}

function rowToAsset(row: MediaPickerRow): AdminMediaPickerAsset {
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

async function searchMediaLibrary(client: SupabaseClient, rawSearch: string, selectable: 'any' | 'published') {
    const images = client.from('media_assets').select(pickerColumns).eq('media_type', 'image');
    let query = selectable === 'published' ? images.eq('status', 'published') : images.neq('status', 'archived');
    const search = sanitizeMediaSearch(rawSearch);
    if (search) query = query.or(`alt.ilike.*${search}*,caption.ilike.*${search}*`);
    const result = await query
        .order('updated_at', { ascending: false })
        .limit(pickerLibraryPageSize)
        .returns<MediaPickerRow[]>();
    if (result.error) throw result.error;
    return result.data ?? [];
}

/** Thumbnails: public images use their public address, private Drafts a one-hour signed link. */
async function resolvePickerPreviews(client: SupabaseClient, rows: readonly MediaPickerRow[]) {
    const assets = rows.map(rowToAsset);
    const privatePaths = assets
        .filter((asset) => asset.sourceKind === 'storage' && asset.bucket === privateMediaBucket && asset.objectPath)
        .map((asset) => asset.objectPath as string);
    const signed = new Map<string, string>();
    if (privatePaths.length) {
        const result = await client.storage.from(privateMediaBucket).createSignedUrls(privatePaths, 3600);
        if (result.error) console.error('Admin media picker could not prepare private previews.', result.error);
        for (const item of result.data ?? []) {
            if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
        }
    }
    return assets.map((asset) => ({ ...asset, previewUrl: pickerPreviewUrl(client, asset, signed) }));
}

function pickerPreviewUrl(client: SupabaseClient, asset: AdminMediaPickerAsset, signed: Map<string, string>) {
    if (asset.sourceKind === 'storage') {
        if (!asset.objectPath) return null;
        if (asset.bucket === PUBLIC_MEDIA_BUCKET) return client.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(asset.objectPath).data.publicUrl;
        return signed.get(asset.objectPath) ?? null;
    }
    return toSafePublicMediaSourceUrl(asset.sourceUrl) ?? null;
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
