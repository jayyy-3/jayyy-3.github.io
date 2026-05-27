import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    Archive,
    CheckCircle2,
    FileUp,
    Image as ImageIcon,
    Plus,
    Save,
    ShieldCheck,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';

type MediaStatus = 'draft' | 'published' | 'archived';
type SourceKind = 'storage' | 'external_legacy' | 'r2' | 'stream';
type MediaType = 'image' | 'video' | 'document' | 'other';
type MediaBucket = 'urblo-admin-media' | 'urblo-public-media';

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
    bucket: 'urblo-admin-media',
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

const fieldClass =
    'mt-2 min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium outline-none transition focus:border-black disabled:bg-black/[0.04] disabled:text-black/45';

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
    const [assets, setAssets] = useState<MediaAssetRow[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [form, setForm] = useState<MediaFormState>(emptyForm);
    const [uploadBucket, setUploadBucket] = useState<MediaBucket>('urblo-admin-media');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
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
            .limit(80)
            .returns<MediaAssetRow[]>();

        if (loadError) {
            setError(loadError.message);
            setIsLoading(false);
            return;
        }

        const rows = data ?? [];
        const nextSelected = selectedId ? rows.find((asset) => asset.id === selectedId) : rows[0];

        setAssets(rows);
        setSelectedId(nextSelected?.id ?? null);
        setForm(rowToForm(nextSelected ?? null));
        setIsLoading(false);
    }, [selectedId]);

    useEffect(() => {
        void loadAssets();
    }, [loadAssets]);

    function updateField<Key extends keyof MediaFormState>(key: Key, value: MediaFormState[Key]) {
        setForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    function selectAsset(asset: MediaAssetRow) {
        setSelectedId(asset.id);
        setForm(rowToForm(asset));
        setNotice(null);
        setError(null);
    }

    function startExternalRecord() {
        setSelectedId(null);
        setForm({
            ...emptyForm,
            sourceKind: 'external_legacy',
            bucket: 'urblo-public-media',
        });
        setNotice('New external media record started.');
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

        if (file.size > bucketLimits[uploadBucket]) {
            setError(`File is too large for ${uploadBucket}.`);
            return;
        }

        setIsUploading(true);
        setError(null);
        setNotice(null);

        const dimensions = await getImageDimensions(file);
        const objectPath = buildObjectPath(file);
        const uploadResult = await supabase.storage.from(uploadBucket).upload(objectPath, file, {
            cacheControl: '31536000',
            upsert: false,
            contentType: file.type,
        });

        if (uploadResult.error) {
            setIsUploading(false);
            setError(uploadResult.error.message);
            return;
        }

        const { data, error: insertError } = await supabase
            .from('media_assets')
            .insert({
                status: 'draft',
                bucket: uploadBucket,
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

        setIsUploading(false);

        if (insertError) {
            setError(
                `Storage upload completed, but media metadata could not be created: ${insertError.message}`,
            );
            return;
        }

        setFile(null);
        setAssets((current) => [data, ...current.filter((asset) => asset.id !== data.id)]);
        setSelectedId(data.id);
        setForm(rowToForm(data));
        setNotice('Media uploaded as a draft. Add alt text and usage notes before publishing.');
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await saveAsset(form.status);
    }

    async function saveAsset(nextStatus: MediaStatus) {
        if (!supabase || !canEdit || !user) {
            return;
        }

        const validation = validateMediaForm({ ...form, status: nextStatus });
        if (validation.error) {
            setError(validation.error);
            return;
        }

        const now = new Date().toISOString();
        const payload = {
            status: nextStatus,
            bucket: validation.bucket,
            object_path: validation.objectPath,
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

        const response = selectedId
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

        setIsSaving(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        setAssets((current) => [
            response.data,
            ...current.filter((asset) => asset.id !== response.data.id),
        ]);
        setSelectedId(response.data.id);
        setForm(rowToForm(response.data));
        setNotice(nextStatus === 'published' ? 'Media published.' : 'Media metadata saved.');
    }

    const previewUrl = getMediaUrl(selectedAsset);
    const mediaCounts = useMemo(() => summarizeMedia(assets), [assets]);

    return (
        <AdminShell
            title="Media Library"
            eyebrow={canEdit ? 'Admin/Editor' : 'Read only'}
            actions={
                <button
                    type="button"
                    onClick={startExternalRecord}
                    disabled={!canEdit}
                    className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                >
                    <Plus className="h-4 w-4" />
                    External record
                </button>
            }
        >
            <div className="grid gap-5 xl:grid-cols-[minmax(280px,420px)_1fr_340px]">
                <section className="border border-black/10 bg-white">
                    <div className="border-b border-black/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                            Library records
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-black">{assets.length} assets</h2>
                        <p className="mt-2 text-sm leading-6 text-black/55">
                            {mediaCounts.published} published, {mediaCounts.draft} draft, {mediaCounts.archived}{' '}
                            archived.
                        </p>
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
                        ) : assets.length ? (
                            <div className="divide-y divide-black/10">
                                {assets.map((asset) => (
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
                                                    {asset.alt || asset.caption || asset.object_path || asset.source_url || `Asset ${asset.id}`}
                                                </span>
                                                <span className="mt-1 block truncate text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                                    {asset.source_kind} · {asset.media_type}
                                                </span>
                                            </span>
                                            <StatusPill status={asset.status} />
                                        </div>
                                        <p className="mt-3 truncate text-xs text-black/45">
                                            {asset.bucket ?? 'external'} / {asset.object_path ?? asset.source_url ?? 'No source'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-5">
                                <ImageIcon className="h-5 w-5 text-black" />
                                <h2 className="mt-5 text-xl font-semibold text-black">No media records yet</h2>
                                <p className="mt-3 text-sm leading-6 text-black/58">
                                    Upload a draft file or start an external record. Published media requires alt
                                    text, usage notes, and a public-safe source.
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
                                    {selectedId ? `Asset ${selectedId}` : 'New media record'}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-black/58">
                                    Keep media inspectable, credited, and safe before connecting it to public content.
                                </p>
                            </div>
                            <StatusPill status={form.status} />
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
                                Source kind
                                <select
                                    value={form.sourceKind}
                                    onChange={(event) => updateField('sourceKind', event.target.value as SourceKind)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    className={fieldClass}
                                >
                                    <option value="storage">Storage</option>
                                    <option value="external_legacy">External legacy</option>
                                    <option value="r2">Cloudflare R2</option>
                                    <option value="stream">Cloudflare Stream</option>
                                </select>
                            </label>

                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Bucket
                                <select
                                    value={form.bucket}
                                    onChange={(event) => updateField('bucket', event.target.value as MediaBucket)}
                                    disabled={!canEdit || isSaving || isLoading || form.sourceKind !== 'storage'}
                                    className={fieldClass}
                                >
                                    <option value="urblo-admin-media">Admin draft bucket</option>
                                    <option value="urblo-public-media">Public media bucket</option>
                                </select>
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

                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Object path
                            <input
                                value={form.objectPath}
                                onChange={(event) => updateField('objectPath', event.target.value)}
                                disabled={!canEdit || isSaving || isLoading || form.sourceKind !== 'storage'}
                                className={fieldClass}
                            />
                        </label>

                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Source URL
                            <input
                                value={form.sourceUrl}
                                onChange={(event) => updateField('sourceUrl', event.target.value)}
                                disabled={!canEdit || isSaving || isLoading}
                                className={fieldClass}
                            />
                        </label>
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
                            Technical metadata
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
                            Uploads create a draft media record. Public publishing still requires alt text, usage
                            notes, and the public bucket.
                        </p>
                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-white/65">
                            Upload bucket
                            <select
                                value={uploadBucket}
                                onChange={(event) => setUploadBucket(event.target.value as MediaBucket)}
                                disabled={!canEdit || isUploading}
                                className="mt-2 min-h-11 w-full rounded border border-white/20 bg-black px-3 text-sm font-semibold text-white outline-none transition focus:border-white disabled:text-white/35"
                            >
                                <option value="urblo-admin-media">Admin draft bucket</option>
                                <option value="urblo-public-media">Public media bucket</option>
                            </select>
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
                        <h2 className="mt-5 text-xl font-semibold text-black">Publication guardrails</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                            <li>Published storage assets must use `urblo-public-media`.</li>
                            <li>Published media requires usage notes.</li>
                            <li>Published images require alt text.</li>
                            <li>Viewer roles can inspect but not mutate media records.</li>
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
                            Current role is read-only for Media. Ask an admin/editor to upload or publish media.
                        </section>
                    ) : null}

                    <div className="grid gap-2">
                        <button
                            type="button"
                            disabled={!canEdit || isSaving || isLoading}
                            onClick={() => void saveAsset('draft')}
                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded border border-black/15 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                        >
                            <Save className="h-4 w-4" />
                            {isSaving ? 'Saving' : 'Save draft'}
                        </button>
                        <button
                            type="button"
                            disabled={!canEdit || isSaving || isLoading}
                            onClick={() => void saveAsset('published')}
                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Publish
                        </button>
                        <button
                            type="button"
                            disabled={!canEdit || isSaving || isLoading}
                            onClick={() => void saveAsset('archived')}
                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/25"
                        >
                            <Archive className="h-4 w-4" />
                            Archive
                        </button>
                    </div>
                </aside>
            </div>
        </AdminShell>
    );
}

function StatusPill({ status }: { status: MediaStatus }) {
    return (
        <span
            className={[
                'inline-flex h-8 shrink-0 items-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.14em]',
                status === 'published'
                    ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-black'
                    : status === 'archived'
                      ? 'border-black/15 bg-black text-white'
                      : 'border-black/15 bg-white text-black/50',
            ].join(' ')}
        >
            {status}
        </span>
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

function validateMediaForm(form: MediaFormState): {
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
        return validationFailure('Storage media requires an object path.');
    }

    if (form.sourceKind !== 'storage' && !form.sourceUrl.trim()) {
        return validationFailure('External, R2, or Stream media requires a source URL.');
    }

    if (form.status === 'published') {
        if (form.sourceKind === 'storage' && form.bucket !== 'urblo-public-media') {
            return validationFailure('Published storage media must use the public media bucket.');
        }

        if (form.mediaType === 'image' && !form.alt.trim()) {
            return validationFailure('Published images require alt text.');
        }

        if (!form.usageNotes.trim()) {
            return validationFailure('Published media requires usage notes.');
        }
    }

    return {
        error: null,
        bucket: form.sourceKind === 'storage' ? form.bucket : null,
        objectPath: form.sourceKind === 'storage' ? form.objectPath.trim() : null,
        sourceUrl: form.sourceUrl.trim() || null,
        widthPx: widthPx.value,
        heightPx: heightPx.value,
        sizeBytes: sizeBytes.value,
    };
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

function getMediaUrl(asset: MediaAssetRow | null) {
    if (!asset) {
        return null;
    }

    if (asset.source_kind === 'storage' && asset.bucket === 'urblo-public-media' && asset.object_path && supabase) {
        return supabase.storage.from(asset.bucket).getPublicUrl(asset.object_path).data.publicUrl;
    }

    return asset.source_url;
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
