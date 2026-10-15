// Opens a project package zip (`project.json` + `images/`) in the browser. `fflate` is loaded
// on demand so it stays in the admin import chunk and never reaches the public site bundle.
// Unsafe paths, files outside `images/`, non-image files and oversized entries are refused
// before anything is uploaded.

import { PROJECT_PACKAGE_LIMITS, type PackageIssue } from './importPackage.ts';

export interface PackageArchive {
    projectJson: string;
    /** Image files by package name, e.g. `images/hero.jpg`. */
    files: Map<string, Blob>;
}

export interface ReadPackageZipResult {
    archive: PackageArchive | null;
    errors: PackageIssue[];
}

const IMAGE_TYPES: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const IGNORED = /(^|\/)(__MACOSX\/|\.DS_Store$|Thumbs\.db$)/;

function isUnsafeName(name: string) {
    return (
        name.includes('\\') ||
        name.startsWith('/') ||
        /^[a-zA-Z]:/.test(name) ||
        name.split('/').some((segment) => segment === '..' || segment === '.') ||
        [...name].some((character) => (character.codePointAt(0) ?? 0) < 32)
    );
}

/** The image type a file's first bytes prove, or null. */
export function sniffImageType(bytes: Uint8Array): string | null {
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
    if (bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte)) return 'image/png';
    const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
    if (bytes.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
    return null;
}

export async function readPackageZip(source: Blob | Uint8Array): Promise<ReadPackageZipResult> {
    const errors: PackageIssue[] = [];
    const size = source instanceof Uint8Array ? source.byteLength : source.size;
    if (size > PROJECT_PACKAGE_LIMITS.zipBytes) {
        return { archive: null, errors: [{ path: '(zip)', message: 'The zip is larger than 100 MB. Use smaller images or fewer images.' }] };
    }
    const data = source instanceof Uint8Array ? source : new Uint8Array(await source.arrayBuffer());
    const { unzipSync, strFromU8 } = await import('fflate');

    // First pass: names and declared sizes only (nothing is decompressed).
    const entries: { name: string; originalSize: number }[] = [];
    try {
        unzipSync(data, {
            filter: (file) => {
                entries.push({ name: file.name, originalSize: file.originalSize });
                return false;
            },
        });
    } catch {
        return { archive: null, errors: [{ path: '(zip)', message: 'This zip file could not be opened. Export the package again.' }] };
    }

    const files = entries.filter((entry) => !entry.name.endsWith('/') && !IGNORED.test(entry.name));
    for (const entry of files) {
        if (isUnsafeName(entry.name)) errors.push({ path: entry.name, message: 'This file name is not allowed in a package.' });
    }
    if (errors.length) return { archive: null, errors };

    // Accept project.json at the root, or inside one folder that holds everything.
    let prefix = '';
    if (!files.some((entry) => entry.name === 'project.json')) {
        const nested = files.filter((entry) => /^[^/]+\/project\.json$/.test(entry.name));
        const folder = nested.length === 1 ? nested[0].name.slice(0, -'project.json'.length) : '';
        if (!folder || !files.every((entry) => entry.name.startsWith(folder))) {
            return { archive: null, errors: [{ path: '(zip)', message: 'The zip must contain project.json at its top level.' }] };
        }
        prefix = folder;
    }

    let total = 0;
    const wanted = new Set<string>();
    for (const entry of files) {
        const name = entry.name.slice(prefix.length);
        total += entry.originalSize;
        if (name === 'project.json') {
            if (entry.originalSize > PROJECT_PACKAGE_LIMITS.jsonBytes) errors.push({ path: name, message: 'project.json is larger than 1 MB.' });
            wanted.add(entry.name);
            continue;
        }
        const match = /^images\/([^/]+)\.([a-z0-9]+)$/i.exec(name);
        if (!match) {
            errors.push({ path: name, message: 'Only project.json and image files in the images folder can be in the package.' });
            continue;
        }
        if (!IMAGE_TYPES[match[2].toLowerCase()]) {
            errors.push({ path: name, message: 'Only JPG, PNG and WebP images can be imported.' });
            continue;
        }
        if (entry.originalSize > PROJECT_PACKAGE_LIMITS.imageBytes) {
            errors.push({ path: name, message: 'This image is larger than 10 MB. Export a smaller copy.' });
            continue;
        }
        wanted.add(entry.name);
    }
    if (total > PROJECT_PACKAGE_LIMITS.zipBytes + PROJECT_PACKAGE_LIMITS.jsonBytes) {
        errors.push({ path: '(zip)', message: 'The package contents are larger than 100 MB.' });
    }
    if (errors.length) return { archive: null, errors };

    let unpacked: Record<string, Uint8Array>;
    try {
        unpacked = unzipSync(data, { filter: (file) => wanted.has(file.name) });
    } catch {
        return { archive: null, errors: [{ path: '(zip)', message: 'This zip file could not be opened. Export the package again.' }] };
    }

    let projectJson = '';
    const images = new Map<string, Blob>();
    for (const [entryName, bytes] of Object.entries(unpacked)) {
        const name = entryName.slice(prefix.length);
        if (name === 'project.json') {
            projectJson = strFromU8(bytes);
            continue;
        }
        if (bytes.byteLength > PROJECT_PACKAGE_LIMITS.imageBytes) {
            errors.push({ path: name, message: 'This image is larger than 10 MB. Export a smaller copy.' });
            continue;
        }
        const extensionType = IMAGE_TYPES[name.split('.').pop()?.toLowerCase() ?? ''];
        const actualType = sniffImageType(bytes);
        if (!actualType) {
            errors.push({ path: name, message: 'This file is not a JPG, PNG or WebP image.' });
            continue;
        }
        if (actualType !== extensionType) {
            errors.push({ path: name, message: 'The file name ending does not match the image type. Export it again as JPG, PNG or WebP.' });
            continue;
        }
        images.set(name, new Blob([bytes.slice()], { type: actualType }));
    }
    if (errors.length) return { archive: null, errors };
    return { archive: { projectJson, files: images }, errors };
}
