import type { SupabaseClient } from '@supabase/supabase-js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    buildMediaExportCsv,
    buildObjectPath,
    getMediaPublishChecklist,
    mediaTypeFromMime,
    removePrivatePromotionSourceIfUnreferenced,
    removePublicObjectIfUnreferenced,
    validateMediaForm,
} from './AdminMediaPage';

// The editor module imports the browser Supabase client; tests never talk to Supabase.
vi.mock('../../lib/supabaseClient', () => ({
    supabase: null,
    supabaseConfig: { url: 'https://supabase.invalid', hasBrowserKey: false },
}));

type MediaForm = Parameters<typeof validateMediaForm>[0];
type MediaRow = Parameters<typeof buildMediaExportCsv>[0][number];

const privateUpload: MediaForm = {
    status: 'draft',
    bucket: 'urblo-admin-media',
    objectPath: ' uploads/2026-09/granite.jpg ',
    sourceUrl: '',
    sourceKind: 'storage',
    mediaType: 'image',
    mimeType: 'image/jpeg',
    widthPx: '2400',
    heightPx: '1600',
    sizeBytes: '0',
    alt: '',
    caption: '',
    credit: '',
    usageNotes: '',
};

/** In-memory stand-in for the two Supabase calls the cleanup helpers make. */
function fakeMediaClient({
    references = [] as Array<{ id: number }>,
    readError = null as { message: string } | null,
    removeError = null as { message: string } | null,
} = {}) {
    const calls: string[] = [];
    const query = {
        select: (columns: string) => (calls.push(`select ${columns}`), query),
        eq: (column: string, value: string) => (calls.push(`eq ${column}=${value}`), query),
        limit: (count: number) => (calls.push(`limit ${count}`), query),
        returns: () => Promise.resolve({ data: readError ? null : references, error: readError }),
    };
    const client = {
        from: (table: string) => (calls.push(`from ${table}`), query),
        storage: {
            from: (bucket: string) => ({
                remove: async (paths: string[]) => {
                    calls.push(`remove ${bucket}:${paths.join(',')}`);
                    return { data: null, error: removeError };
                },
            }),
        },
    };
    return { client: client as unknown as SupabaseClient, calls };
}

afterEach(() => {
    vi.useRealTimers();
});

describe('Media editor', () => {
    it('builds the save payload: storage keeps the trimmed bucket path, hosted links are sanitized and numbers parsed', () => {
        expect(validateMediaForm(privateUpload)).toEqual({
            error: null,
            bucket: 'urblo-admin-media',
            objectPath: 'uploads/2026-09/granite.jpg',
            sourceUrl: null,
            widthPx: 2400,
            heightPx: 1600,
            sizeBytes: 0,
        });
        expect(validateMediaForm({ ...privateUpload, sourceKind: 'r2', sourceUrl: ' https://cdn.example.com/a.jpg ' })).toMatchObject({
            error: null,
            bucket: null,
            objectPath: null,
            sourceUrl: 'https://cdn.example.com/a.jpg',
        });
        expect(validateMediaForm({ ...privateUpload, sourceKind: 'external_legacy', sourceUrl: 'javascript:alert(1)' }).error).toBe(
            'External or hosted media needs a valid http(s) URL or site path before it can be saved.',
        );
        expect(validateMediaForm({ ...privateUpload, objectPath: ' ' }).error).toBe(
            'Uploaded media needs an uploaded file location before it can be saved.',
        );
        expect(validateMediaForm({ ...privateUpload, widthPx: '0' }).error).toBe('Width must be a whole positive number.');
        expect(validateMediaForm({ ...privateUpload, sizeBytes: '-1' }).error).toBe('Size bytes must be a whole positive number or zero.');
    });

    it('locks Publish for private uploads without promotion, images without alt text and media without usage notes', () => {
        const publish: MediaForm = { ...privateUpload, status: 'published', alt: 'Honed granite bench', usageNotes: 'Product hero' };
        expect(validateMediaForm(publish).error).toBe(
            'Select an existing private upload so Publish can copy the file into the Public website library.',
        );
        expect(validateMediaForm(publish, { allowPrivateStoragePublish: true }).error).toBeNull();
        expect(validateMediaForm({ ...publish, bucket: 'urblo-public-media' }).error).toBeNull();
        expect(validateMediaForm({ ...publish, bucket: 'urblo-public-media', alt: ' ' }).error).toBe(
            'Add image alt text before publishing this media.',
        );
        expect(validateMediaForm({ ...publish, bucket: 'urblo-public-media', mediaType: 'document', alt: '' }).error).toBeNull();
        expect(validateMediaForm({ ...publish, bucket: 'urblo-public-media', usageNotes: '' }).error).toBe(
            'Add usage notes before publishing this media.',
        );
    });

    it('reports the public location as ready only for public files, hosted links or Owner/Admin promotion', () => {
        const ready = (form: MediaForm, canPromote: boolean, isPrivateSelection: boolean) =>
            Object.fromEntries(getMediaPublishChecklist(form, canPromote, isPrivateSelection).map((item) => [item.label, item.ready]));

        expect(ready(privateUpload, false, true)).toEqual({
            'Source is recorded': true,
            'Public location': false,
            'Alt text for images': false,
            'Usage notes': false,
        });
        expect(ready(privateUpload, true, true)['Public location']).toBe(true);
        expect(ready({ ...privateUpload, bucket: 'urblo-public-media' }, false, false)['Public location']).toBe(true);
        expect(ready({ ...privateUpload, sourceKind: 'stream', sourceUrl: 'https://video.example.com/v' }, false, false)).toMatchObject({
            'Source is recorded': true,
            'Public location': true,
        });
        expect(ready({ ...privateUpload, mediaType: 'video', usageNotes: 'Homepage' }, true, true)).toMatchObject({
            'Alt text for images': true,
            'Usage notes': true,
        });
        const editorDetail = getMediaPublishChecklist(privateUpload, false, true)[1].detail;
        expect(editorDetail).toMatch(/requires an Owner or Admin/);
    });

    it('exports every media row as quoted CSV that survives commas, quotes, newlines and empty values', () => {
        const row: MediaRow = {
            id: 9,
            status: 'published',
            bucket: null,
            object_path: null,
            source_url: '/media/a.jpg',
            source_kind: 'external_legacy',
            media_type: 'image',
            mime_type: null,
            width_px: null,
            height_px: 800,
            size_bytes: null,
            alt: 'Bench, "honed" finish',
            caption: 'Line one\nLine two',
            credit: null,
            usage_notes: null,
            published_at: null,
            archived_at: null,
            created_at: '2026-09-01T00:00:00Z',
            updated_at: '2026-09-02T00:00:00Z',
        };
        const csv = buildMediaExportCsv([row]);
        expect(csv.endsWith('\n')).toBe(true);
        expect(csv.startsWith('"id","status","source_kind","media_type","bucket","object_path","source_url"')).toBe(true);
        expect(csv).toContain('"9","published","external_legacy","image","","","/media/a.jpg","","","800",""');
        expect(csv).toContain('"Bench, ""honed"" finish","Line one\nLine two"');
        expect(buildMediaExportCsv([]).trim().split('\n')).toHaveLength(1);
    });

    it('derives the media type and a safe dated upload path from the chosen file', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 8, 25, 12));
        vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000001');

        expect(buildObjectPath(new File(['x'], 'Honed Granite (Final).JPG'))).toBe(
            'uploads/2026-09/00000000-0000-4000-8000-000000000001-honed-granite-final-.jpg',
        );
        expect(buildObjectPath(new File(['x'], '../../石材.png'))).toBe('uploads/2026-09/00000000-0000-4000-8000-000000000001-..-..-.png');
        expect(buildObjectPath(new File(['x'], '***'))).toBe('uploads/2026-09/00000000-0000-4000-8000-000000000001-media');
        expect(['image/webp', 'video/mp4', 'application/pdf', 'application/zip'].map(mediaTypeFromMime)).toEqual([
            'image',
            'video',
            'document',
            'other',
        ]);
    });

    it('removes a Storage object after a failed save only when no media record still references it', async () => {
        const unreferenced = fakeMediaClient();
        await expect(removePublicObjectIfUnreferenced(unreferenced.client, 'uploads/a.jpg')).resolves.toEqual({ removed: true, detail: null });
        expect(unreferenced.calls).toEqual([
            'from media_assets',
            'select id',
            'eq bucket=urblo-public-media',
            'eq object_path=uploads/a.jpg',
            'limit 1',
            'remove urblo-public-media:uploads/a.jpg',
        ]);

        const referenced = fakeMediaClient({ references: [{ id: 44 }] });
        await expect(removePublicObjectIfUnreferenced(referenced.client, 'uploads/a.jpg')).resolves.toEqual({
            removed: false,
            detail: 'media record 44 references this public path, so deletion was skipped',
        });
        expect(referenced.calls.some((call) => call.startsWith('remove'))).toBe(false);

        const unreadable = fakeMediaClient({ readError: { message: 'timeout' } });
        await expect(removePrivatePromotionSourceIfUnreferenced(unreadable.client, 'uploads/a.jpg')).resolves.toEqual({
            removed: false,
            detail: 'private media-reference readback failed (timeout), so source deletion was skipped',
        });
        expect(unreadable.calls.some((call) => call.startsWith('remove'))).toBe(false);

        const privateSource = fakeMediaClient({ removeError: { message: 'denied' } });
        await expect(removePrivatePromotionSourceIfUnreferenced(privateSource.client, 'uploads/a.jpg')).resolves.toEqual({
            removed: false,
            detail: 'private source cleanup failed (denied)',
        });
        expect(privateSource.calls).toContain('eq bucket=urblo-admin-media');
        expect(privateSource.calls[privateSource.calls.length - 1]).toBe('remove urblo-admin-media:uploads/a.jpg');
    });
});
