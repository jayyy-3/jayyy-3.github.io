import {
    formatImageBytes,
    imageQrMaximumLongEdge,
    imageQrMaximumSourceBytes,
    optimizeImageForQr,
    type OptimizedQrImage,
} from '../../../lib/imageQrOptimization';
import { resolvePublicMediaUrl } from '../../../lib/publicMediaUrl';

// File rules for the shared admin media picker. Colleagues see the accepted types and limit
// before they choose a file; large photos are resized in the browser before upload so a 20 MB
// phone photo becomes a few-MB website image. Projects keep their original upload instead
// (the public site prepares screen sizes from it), so they use the "original" policy.

export type AdminMediaUploadPolicy = 'optimize' | 'original';

/** Largest file a colleague may choose when the picker resizes it first (the resize input). */
export const pickerSourceMaximumBytes = imageQrMaximumSourceBytes;
/** Largest file that is uploaded as-is: originals (Projects) and animated GIFs. */
export const pickerOriginalMaximumBytes = 10 * 1024 * 1024;
/** Longest edge after resizing. */
export const pickerMaximumLongEdge = imageQrMaximumLongEdge;

const optimizableTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const originalTypes = new Set([...optimizableTypes, 'image/gif']);

export const heicGuidance =
    'iPhone HEIC photos cannot be uploaded yet. On the iPhone, open Settings › Camera › Formats and choose Most Compatible, or share the photo as a JPG, then choose it again.';

export interface PickerUploadLimits {
    /** Accepted formats in plain words. */
    types: string;
    /** Size limit in plain words. */
    limit: string;
    /** One sentence on what happens to the file. */
    note: string;
}

export function describePickerUploadLimits(policy: AdminMediaUploadPolicy): PickerUploadLimits {
    if (policy === 'original') {
        return {
            types: 'JPG, PNG, WebP, AVIF or GIF',
            limit: `up to ${formatImageBytes(pickerOriginalMaximumBytes)}`,
            note: 'Your original is kept at full quality. High-quality website versions are prepared automatically for each screen.',
        };
    }
    return {
        types: 'JPG, PNG, WebP, AVIF or GIF',
        limit: `up to ${formatImageBytes(pickerSourceMaximumBytes)} (GIF up to ${formatImageBytes(pickerOriginalMaximumBytes)})`,
        note: `Large photos are resized to ${pickerMaximumLongEdge} px on the long edge in your browser before upload, so they load quickly on the website.`,
    };
}

/** The file input's accept list. HEIC stays selectable so the picker can explain what to do. */
export const pickerAcceptAttribute = [...originalTypes, 'image/heic', 'image/heif', '.heic', '.heif'].join(',');

export function isHeicFile(file: Pick<File, 'name' | 'type'>) {
    return /^image\/hei[cf](-sequence)?$/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

/** Plain-English reason the file cannot be used, or null when it can be prepared for upload. */
export function checkPickerFile(file: Pick<File, 'name' | 'type' | 'size'>, policy: AdminMediaUploadPolicy): string | null {
    const limits = describePickerUploadLimits(policy);
    if (isHeicFile(file)) return heicGuidance;
    if (!originalTypes.has(file.type)) {
        return `This file type cannot be used. Choose a ${limits.types} image.`;
    }
    if (file.size <= 0) return 'This file is empty. Choose the image again.';
    const passesThrough = policy === 'original' || file.type === 'image/gif';
    const maximum = passesThrough ? pickerOriginalMaximumBytes : pickerSourceMaximumBytes;
    if (file.size > maximum) {
        const kind = passesThrough && policy !== 'original' ? 'GIF images' : 'Images';
        return `This image is ${formatImageBytes(file.size)}. ${kind} must be ${formatImageBytes(maximum)} or smaller. Export a smaller copy and choose it again.`;
    }
    return null;
}

export interface PreparedPickerUpload {
    file: File;
    width: number | null;
    height: number | null;
    originalBytes: number;
    uploadBytes: number;
    /** True when the browser produced a smaller copy instead of the chosen file. */
    resized: boolean;
}

/**
 * Turns the chosen file into the file that will be uploaded. Throws an Error with a plain-English
 * message when the file cannot be used. `optimize` is injectable for tests.
 */
export async function preparePickerUpload(
    file: File,
    policy: AdminMediaUploadPolicy,
    optimize: (file: File) => Promise<OptimizedQrImage> = optimizeImageForQr,
): Promise<PreparedPickerUpload> {
    const problem = checkPickerFile(file, policy);
    if (problem) throw new Error(problem);

    if (policy === 'original' || !optimizableTypes.has(file.type)) {
        return { file, width: null, height: null, originalBytes: file.size, uploadBytes: file.size, resized: false };
    }

    let optimized: OptimizedQrImage;
    try {
        optimized = await optimize(file);
    } catch (error) {
        console.error('Admin media picker could not resize the image.', error);
        throw new Error('This image could not be opened in your browser. Save it as a JPG or PNG and choose it again.');
    }
    if (optimized.file.size > pickerOriginalMaximumBytes) {
        throw new Error(
            `Even after resizing, this image is ${formatImageBytes(optimized.file.size)}. Export a smaller copy (under ${formatImageBytes(pickerOriginalMaximumBytes)}) and choose it again.`,
        );
    }
    return {
        file: optimized.file,
        width: optimized.width,
        height: optimized.height,
        originalBytes: optimized.originalBytes,
        uploadBytes: optimized.optimizedBytes,
        resized: optimized.changed,
    };
}

/** Sentence shown under the pending upload so colleagues know what will be uploaded. */
export function describePreparedUpload(prepared: PreparedPickerUpload) {
    if (!prepared.resized) return `Ready to upload (${formatImageBytes(prepared.uploadBytes)}).`;
    const size = prepared.width && prepared.height ? `, ${prepared.width} × ${prepared.height} px` : '';
    return `Resized for the website: ${formatImageBytes(prepared.originalBytes)} → ${formatImageBytes(prepared.uploadBytes)}${size}.`;
}

function normalizeWords(value: string) {
    return value
        .toLowerCase()
        .replace(/\.[a-z0-9]{2,5}$/i, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

/** True when the description is just the file name (e.g. "IMG 4032"), which is not alt text. */
export function isFileNameDescription(description: string, fileName: string) {
    const words = normalizeWords(description);
    if (!words) return false;
    return words === normalizeWords(fileName) || /^(img|dsc|dscn|pxl|photo|image|screenshot)\s?\d/.test(words);
}

export function buildPickerObjectPath(file: Pick<File, 'name'>, prefix: string, now = Date.now()) {
    const extension =
        file.name
            .split('.')
            .pop()
            ?.toLowerCase()
            .replace(/[^a-z0-9]/g, '') || 'bin';
    const base =
        file.name
            .replace(/\.[^.]+$/, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 72) || 'image';
    const unique = globalThis.crypto?.randomUUID?.().slice(0, 12) ?? `${now}`;
    return `${prefix}/${now}-${unique}-${base}.${extension}`;
}

/** Search text safe for a PostgREST `or=(alt.ilike.*x*,…)` filter: letters, digits and spaces only. */
export function sanitizeMediaSearch(value: string) {
    return value
        .normalize('NFKC')
        .replace(/[^\p{L}\p{N}\s'-]+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 60);
}

/** Editor forms keep media IDs as text; the picker works with a positive integer or null. */
export function mediaIdFromField(value: string) {
    const mediaId = Number(value);
    return value.trim() && Number.isInteger(mediaId) && mediaId > 0 ? mediaId : null;
}

/** One image in the shared admin media picker (same shape as the Projects media option). */
export interface AdminMediaPickerAsset {
    id: number;
    bucket: string | null;
    alt: string | null;
    caption: string | null;
    objectPath: string | null;
    sourceUrl: string | null;
    sourceKind: string;
    mediaType: string;
    status: string;
    previewUrl?: string | null;
}

/** Public website address of a published picker image (null for Drafts and private uploads). */
export function publicUrlForPickerAsset(
    asset: AdminMediaPickerAsset | null,
    client: Parameters<typeof resolvePublicMediaUrl>[1],
) {
    if (!asset) return null;
    return (
        resolvePublicMediaUrl(
            {
                status: asset.status,
                source_kind: asset.sourceKind,
                source_url: asset.sourceUrl,
                bucket: asset.bucket,
                object_path: asset.objectPath,
            },
            client,
        ) ?? null
    );
}
