import { describe, expect, it, vi } from 'vitest';
import type { OptimizedQrImage } from '../../../lib/imageQrOptimization';
import {
    buildPickerObjectPath,
    checkPickerFile,
    describePickerUploadLimits,
    describePreparedUpload,
    heicGuidance,
    isFileNameDescription,
    mediaIdFromField,
    pickerAcceptAttribute,
    preparePickerUpload,
    publicUrlForPickerAsset,
    sanitizeMediaSearch,
    type AdminMediaPickerAsset,
} from './mediaPickerFiles';

const MB = 1024 * 1024;

/** A File whose reported size is `bytes` without allocating the bytes. */
function sizedFile(name: string, type: string, bytes: number) {
    const file = new File(['x'], name, { type });
    Object.defineProperty(file, 'size', { value: bytes });
    return file;
}

function fakeOptimizer(outputBytes: number, changed = true) {
    return vi.fn(async (file: File): Promise<OptimizedQrImage> => {
        const output = changed ? sizedFile(file.name.replace(/\.[^.]+$/, '.webp'), 'image/webp', outputBytes) : file;
        return { file: output, width: 2560, height: 1707, originalBytes: file.size, optimizedBytes: output.size, changed };
    });
}

describe('shared admin media picker file rules', () => {
    it('states the accepted types and limit before a file is chosen', () => {
        expect(describePickerUploadLimits('optimize')).toMatchObject({
            types: 'JPG, PNG, WebP, AVIF or GIF',
            limit: 'up to 50 MB (GIF up to 10 MB)',
        });
        expect(describePickerUploadLimits('optimize').note).toMatch(/resized to 2560 px/);
        expect(describePickerUploadLimits('original')).toMatchObject({ limit: 'up to 10 MB' });
        expect(describePickerUploadLimits('original').note).toMatch(/Your original is kept at full quality/);
        expect(pickerAcceptAttribute).toContain('image/jpeg');
        expect(pickerAcceptAttribute).toContain('.heic');
    });

    it('explains HEIC and rejects unsupported or oversized files in plain English', () => {
        expect(checkPickerFile(sizedFile('IMG_4032.HEIC', '', 3 * MB), 'optimize')).toBe(heicGuidance);
        expect(checkPickerFile(sizedFile('photo.heif', 'image/heif', 3 * MB), 'original')).toBe(heicGuidance);
        expect(heicGuidance).toMatch(/Most Compatible/);
        expect(checkPickerFile(sizedFile('brochure.pdf', 'application/pdf', MB), 'optimize')).toBe(
            'This file type cannot be used. Choose a JPG, PNG, WebP, AVIF or GIF image.',
        );
        expect(checkPickerFile(sizedFile('site.jpg', 'image/jpeg', 20 * MB), 'optimize')).toBeNull();
        expect(checkPickerFile(sizedFile('site.jpg', 'image/jpeg', 51 * MB), 'optimize')).toBe(
            'This image is 51 MB. Images must be 50 MB or smaller. Export a smaller copy and choose it again.',
        );
        expect(checkPickerFile(sizedFile('site.jpg', 'image/jpeg', 20 * MB), 'original')).toBe(
            'This image is 20 MB. Images must be 10 MB or smaller. Export a smaller copy and choose it again.',
        );
        expect(checkPickerFile(sizedFile('loop.gif', 'image/gif', 12 * MB), 'optimize')).toBe(
            'This image is 12 MB. GIF images must be 10 MB or smaller. Export a smaller copy and choose it again.',
        );
        expect(checkPickerFile(sizedFile('empty.png', 'image/png', 0), 'optimize')).toBe('This file is empty. Choose the image again.');
    });

    it('resizes a 20 MB JPG in the browser before upload and reports the new size', async () => {
        const optimize = fakeOptimizer(Math.round(2.4 * MB));
        const prepared = await preparePickerUpload(sizedFile('site-visit.jpg', 'image/jpeg', 20 * MB), 'optimize', optimize);
        expect(optimize).toHaveBeenCalledTimes(1);
        expect(prepared).toMatchObject({ width: 2560, height: 1707, originalBytes: 20 * MB, resized: true });
        expect(prepared.file.type).toBe('image/webp');
        expect(prepared.uploadBytes).toBeLessThanOrEqual(10 * MB);
        expect(describePreparedUpload(prepared)).toBe('Resized for the website: 20 MB → 2.4 MB, 2560 × 1707 px.');
    });

    it('keeps originals for Projects and GIFs, and fails clearly when the browser cannot resize', async () => {
        const optimize = fakeOptimizer(MB);
        const original = sizedFile('hero.png', 'image/png', 8 * MB);
        await expect(preparePickerUpload(original, 'original', optimize)).resolves.toMatchObject({ file: original, resized: false });
        const gif = sizedFile('loop.gif', 'image/gif', 2 * MB);
        await expect(preparePickerUpload(gif, 'optimize', optimize)).resolves.toMatchObject({ file: gif, resized: false });
        expect(optimize).not.toHaveBeenCalled();

        vi.spyOn(console, 'error').mockImplementation(() => {});
        const broken = vi.fn(async () => {
            throw new Error('decode failed');
        });
        await expect(preparePickerUpload(sizedFile('scan.jpg', 'image/jpeg', 30 * MB), 'optimize', broken)).rejects.toThrow(
            'This image could not be opened in your browser. Save it as a JPG or PNG and choose it again.',
        );
        await expect(
            preparePickerUpload(sizedFile('poster.png', 'image/png', 40 * MB), 'optimize', fakeOptimizer(12 * MB)),
        ).rejects.toThrow(/Even after resizing, this image is 12 MB/);
        await expect(preparePickerUpload(sizedFile('x.heic', 'image/heic', MB), 'optimize', optimize)).rejects.toThrow(heicGuidance);
    });

    it('recognises a file name used as the image description', () => {
        expect(isFileNameDescription('IMG_4032', 'IMG_4032.JPG')).toBe(true);
        expect(isFileNameDescription('img 4032', 'site.jpg')).toBe(true);
        expect(isFileNameDescription('granite bench final', 'granite-bench_final.jpg')).toBe(true);
        expect(isFileNameDescription('Granite bench beside a city footpath', 'granite-bench_final.jpg')).toBe(false);
        expect(isFileNameDescription('', 'a.jpg')).toBe(false);
    });

    it('builds private upload paths, safe search text and form media IDs', () => {
        vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000001');
        expect(buildPickerObjectPath({ name: 'Honed Granite (Final).webp' }, 'product-editor', 1700000000000)).toBe(
            'product-editor/1700000000000-00000000-000-honed-granite-final.webp',
        );
        expect(sanitizeMediaSearch(' bench, (honed)*%  granite ')).toBe('bench honed granite');
        expect(sanitizeMediaSearch('***')).toBe('');
        expect(mediaIdFromField('42')).toBe(42);
        expect(mediaIdFromField('')).toBeNull();
        expect(mediaIdFromField('0')).toBeNull();
        expect(mediaIdFromField('4.5')).toBeNull();
    });

    it('gives Settings a public address only for published images', () => {
        const asset: AdminMediaPickerAsset = {
            id: 7,
            bucket: null,
            alt: 'Bench',
            caption: null,
            objectPath: null,
            sourceUrl: 'https://cdn.example.com/bench.jpg',
            sourceKind: 'external_legacy',
            mediaType: 'image',
            status: 'published',
        };
        expect(publicUrlForPickerAsset(asset, null)).toBe('https://cdn.example.com/bench.jpg');
        expect(publicUrlForPickerAsset({ ...asset, status: 'draft' }, null)).toBeNull();
        expect(
            publicUrlForPickerAsset({ ...asset, sourceKind: 'storage', bucket: 'urblo-admin-media', objectPath: 'a.jpg' }, null),
        ).toBeNull();
        expect(publicUrlForPickerAsset(null, null)).toBeNull();
    });
});
