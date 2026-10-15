import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { strToU8, zipSync, type Zippable } from 'fflate';
import { describe, expect, test } from 'vitest';
import { readPackageZip, sniffImageType } from './importZip';

const exampleText = readFileSync(resolve(import.meta.dirname, '../../../docs/content-import/examples/greenline/project.json'), 'utf8');
const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1]);
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);

function zip(files: Zippable) {
    return zipSync(files);
}

describe('project package zip', () => {
    test('reads project.json and the images folder', async () => {
        const result = await readPackageZip(zip({
            'project.json': strToU8(exampleText),
            'images/hero.jpg': jpeg,
            'images/step-1.png': png,
            'images/': new Uint8Array(),
            '__MACOSX/images/._hero.jpg': new Uint8Array([1, 2, 3]),
            '.DS_Store': new Uint8Array([1]),
        }));
        expect(result.errors).toEqual([]);
        expect(JSON.parse(result.archive?.projectJson ?? '{}').format).toBe('urblo-project-package');
        expect([...(result.archive?.files.keys() ?? [])].sort()).toEqual(['images/hero.jpg', 'images/step-1.png']);
        expect(result.archive?.files.get('images/hero.jpg')?.type).toBe('image/jpeg');
    });

    test('accepts a package zipped inside one folder', async () => {
        const result = await readPackageZip(zip({ 'greenline/project.json': strToU8(exampleText), 'greenline/images/hero.jpg': jpeg }));
        expect(result.errors).toEqual([]);
        expect([...(result.archive?.files.keys() ?? [])]).toEqual(['images/hero.jpg']);
    });

    test('refuses path traversal and absolute paths before anything is unpacked', async () => {
        for (const name of ['../evil.jpg', 'images/../../evil.jpg', '/etc/passwd', 'images\\evil.jpg']) {
            const result = await readPackageZip(zip({ 'project.json': strToU8(exampleText), [name]: jpeg }));
            expect(result.archive, name).toBeNull();
            expect(result.errors[0].message, name).toMatch(/not allowed/);
        }
    });

    test('refuses files outside images/, non-image files and disguised files', async () => {
        const outside = await readPackageZip(zip({ 'project.json': strToU8(exampleText), 'notes.txt': strToU8('hi') }));
        expect(outside.errors).toEqual([{ path: 'notes.txt', message: expect.stringMatching(/Only project.json and image files/) }]);
        const nested = await readPackageZip(zip({ 'project.json': strToU8(exampleText), 'images/more/hero.jpg': jpeg }));
        expect(nested.errors[0].path).toBe('images/more/hero.jpg');
        const svg = await readPackageZip(zip({ 'project.json': strToU8(exampleText), 'images/logo.svg': strToU8('<svg/>') }));
        expect(svg.errors[0].message).toMatch(/Only JPG, PNG and WebP/);
        const disguised = await readPackageZip(zip({ 'project.json': strToU8(exampleText), 'images/hero.jpg': strToU8('<html>') }));
        expect(disguised.errors[0]).toEqual({ path: 'images/hero.jpg', message: 'This file is not a JPG, PNG or WebP image.' });
        const mismatch = await readPackageZip(zip({ 'project.json': strToU8(exampleText), 'images/hero.png': jpeg }));
        expect(mismatch.errors[0].message).toMatch(/does not match/);
    });

    test('refuses a zip without project.json, a broken zip and oversized images', async () => {
        expect((await readPackageZip(zip({ 'images/hero.jpg': jpeg }))).errors[0].message).toMatch(/project.json at its top level/);
        expect((await readPackageZip(new Uint8Array([1, 2, 3, 4]))).errors[0].message).toMatch(/could not be opened/);
        const big = new Uint8Array(10 * 1024 * 1024 + 1);
        big.set(jpeg);
        const result = await readPackageZip(zip({ 'project.json': strToU8(exampleText), 'images/big.jpg': big }));
        expect(result.errors).toEqual([{ path: 'images/big.jpg', message: expect.stringMatching(/larger than 10 MB/) }]);
    });

    test('image types are proven by their first bytes', () => {
        expect(sniffImageType(jpeg)).toBe('image/jpeg');
        expect(sniffImageType(png)).toBe('image/png');
        expect(sniffImageType(strToU8('RIFF\0\0\0\0WEBPVP8 '))).toBe('image/webp');
        expect(sniffImageType(strToU8('GIF89a'))).toBeNull();
    });
});
