import { describe, expect, it } from 'vitest';
import { archiveConfirmRequest } from './liveSave';
import { classifyGuardedClick, describeUnsavedPrompt, isFormDirty, listLabels } from './unsavedGuard';

const click = (overrides: Partial<Parameters<typeof classifyGuardedClick>[0]> = {}) => ({
    href: null,
    target: null,
    download: false,
    modified: false,
    buttonText: null,
    ...overrides,
});
const here = 'https://urblo.example.test/admin/products';

describe('isFormDirty', () => {
    it('ignores key order and detects any changed value', () => {
        const saved = { name: 'Bench', slug: 'bench', tags: ['a', 'b'] };
        expect(isFormDirty({ slug: 'bench', tags: ['a', 'b'], name: 'Bench' }, saved)).toBe(false);
        expect(isFormDirty({ ...saved, name: 'Bench XL' }, saved)).toBe(true);
        expect(isFormDirty({ ...saved, tags: ['b', 'a'] }, saved)).toBe(true);
        expect(isFormDirty({ ...saved, name: 'Bench ' }, saved)).toBe(true);
    });
});

describe('describeUnsavedPrompt', () => {
    const save = async () => true;

    it('offers Save when one section with its own save is unsaved', () => {
        const prompt = describeUnsavedPrompt([{ key: 'product', label: 'Product details', save }], 'switch products');
        expect(prompt.canSave).toBe(true);
        expect(prompt.title).toBe('Save your changes first?');
        expect(prompt.detail).toBe(
            'You have unsaved changes in Product details. Save them before you switch products, discard them, or keep editing.',
        );
    });

    it('asks for separate saves when several sections, or a section without a save, are unsaved', () => {
        const several = describeUnsavedPrompt(
            [
                { key: 'product', label: 'Product details', save },
                { key: 'model', label: 'Models', save },
                { key: 'spec', label: 'Specifications', save },
            ],
            'leave this page',
        );
        expect(several.canSave).toBe(false);
        expect(several.detail).toContain('Product details, Models and Specifications');
        expect(several.detail).toContain('Save each part with its own Save button');
        expect(describeUnsavedPrompt([{ key: 'invite', label: 'the invite form' }], 'sign out').canSave).toBe(false);
    });

    it('lists labels in plain English', () => {
        expect(listLabels([])).toBe('');
        expect(listLabels(['A'])).toBe('A');
        expect(listLabels(['A', 'B'])).toBe('A and B');
    });
});

describe('classifyGuardedClick', () => {
    it('guards in-app links, Sign out and Refresh', () => {
        expect(classifyGuardedClick(click({ href: '/admin/media' }), here)).toEqual({ kind: 'path', to: '/admin/media' });
        expect(classifyGuardedClick(click({ href: '/admin?tab=1#top' }), here)).toEqual({ kind: 'path', to: '/admin?tab=1#top' });
        expect(classifyGuardedClick(click({ buttonText: 'Sign out' }), here)).toEqual({ kind: 'session', label: 'Sign out' });
        expect(classifyGuardedClick(click({ buttonText: 'Refresh' }), here)).toEqual({ kind: 'session', label: 'Refresh' });
        expect(classifyGuardedClick(click({ href: 'https://example.org/page' }), here)).toEqual({
            kind: 'external',
            to: 'https://example.org/page',
        });
    });

    it('lets harmless clicks through', () => {
        expect(classifyGuardedClick(click({ buttonText: 'Save product' }), here)).toBeNull();
        expect(classifyGuardedClick(click({ href: '/admin/products' }), here)).toBeNull();
        expect(classifyGuardedClick(click({ href: '/admin/products#models' }), here)).toBeNull();
        expect(classifyGuardedClick(click({ href: '/products/bench', target: '_blank' }), here)).toBeNull();
        expect(classifyGuardedClick(click({ href: '/admin/media', modified: true }), here)).toBeNull();
        expect(classifyGuardedClick(click({ href: '/export.csv', download: true }), here)).toBeNull();
        expect(classifyGuardedClick(click({ href: 'mailto:someone@example.test' }), here)).toBeNull();
        expect(classifyGuardedClick(click(), here)).toBeNull();
    });
});

describe('archiveConfirmRequest', () => {
    it('names the public page that loses the record', () => {
        const request = archiveConfirmRequest({
            kind: 'product',
            name: 'Stone Bench',
            publicPath: '/products/stone-bench',
            confirmLabel: 'Archive product',
        });
        expect(request.title).toBe('Archive this live product?');
        expect(request.detail).toContain('“Stone Bench” is live on the website.');
        expect(request.detail).toContain('removes it from the public page at /products/stone-bench straight away');
        expect(request.detail).toContain('publish it again later');
        expect(request.confirmLabel).toBe('Archive product');
    });

    it('describes media by where it is shown', () => {
        const request = archiveConfirmRequest({
            kind: 'media item',
            name: '',
            liveTarget: 'every public page that shows this media',
            confirmLabel: 'Archive media',
        });
        expect(request.detail).toContain('This media item is live on the website.');
        expect(request.detail).toContain('every public page that shows this media');
    });
});
