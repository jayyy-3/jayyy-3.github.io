import { describe, expect, it, vi } from 'vitest';
import {
    getProductModelPublishChecklist,
    getProductPublishChecklist,
    rowToProductForm,
    validateMaterialDefaultForm,
    validateModelForm,
    validateProductForm,
    validateSpecForm,
} from './AdminProductsPage';

// The editor module imports the browser Supabase client; tests never talk to Supabase.
vi.mock('../../lib/supabaseClient', () => ({
    supabase: null,
    supabaseConfig: { url: 'https://supabase.invalid', hasBrowserKey: false },
}));

type ProductRow = NonNullable<Parameters<typeof rowToProductForm>[0]>;
type ProductForm = Parameters<typeof validateProductForm>[0];
type ModelForm = Parameters<typeof validateModelForm>[0];
type ModelRow = Parameters<typeof getProductPublishChecklist>[1][number];
type MaterialRow = Parameters<typeof getProductPublishChecklist>[2][number];
type SpecRow = Parameters<typeof getProductPublishChecklist>[3][number];

const draftProduct: ProductForm = {
    status: 'draft',
    slug: 'prime-block',
    name: 'Prime Block',
    shortDescription: '',
    heroMediaId: '',
    seoBaseJson: '{}',
    seoTitle: '',
    seoDescription: '',
    sortOrder: '0',
};

const model = (overrides: Partial<ModelRow> = {}): ModelRow => ({
    id: 1,
    product_id: 7,
    model_key: 'square-seat',
    label: 'Square seat',
    image_media_id: 41,
    status: 'published',
    sort_order: 0,
    published_at: null,
    archived_at: null,
    updated_at: '2026-09-25T00:00:00Z',
    ...overrides,
});
const material = (overrides: Partial<MaterialRow> = {}): MaterialRow => ({
    id: 2,
    product_id: 7,
    material_category: 'body',
    stone_group_id: 3,
    material_slug: null,
    display_label: null,
    updated_at: '2026-09-25T00:00:00Z',
    ...overrides,
});
const spec = (overrides: Partial<SpecRow> = {}): SpecRow => ({
    id: 3,
    product_id: 7,
    spec_label: 'Length',
    spec_value: '1800 mm',
    sort_order: 0,
    updated_at: '2026-09-25T00:00:00Z',
    ...overrides,
});
const readyLabels = (items: Array<{ label: string; ready: boolean }>) =>
    items.filter((item) => item.ready).map((item) => item.label);

describe('Products editor', () => {
    it('builds the draft save payload: whole numbers, optional hero image and SEO merged into the stored JSON', () => {
        const result = validateProductForm({
            ...draftProduct,
            heroMediaId: '12',
            sortOrder: '3',
            seoBaseJson: '{"title":"Old title","description":"Old","keywords":["granite"]}',
            seoTitle: '  Prime   Block seating ',
            seoDescription: '',
        });

        expect(result).toEqual({
            error: null,
            sortOrder: 3,
            heroMediaId: 12,
            seo: { title: 'Prime Block seating', keywords: ['granite'] },
        });
        expect(validateProductForm({ ...draftProduct, seoBaseJson: 'not json' })).toMatchObject({ error: null, heroMediaId: null, seo: {} });
    });

    it('rejects a missing name, a non-canonical URL key and malformed numbers before any save', () => {
        expect(validateProductForm({ ...draftProduct, name: '   ' }).error).toBe('Product name is required.');
        for (const slug of ['Prime Block', 'prime--block', '-prime', 'prime_block']) {
            expect(validateProductForm({ ...draftProduct, slug }).error).toBe(
                'Website URL key must use lowercase words separated by hyphens.',
            );
        }
        expect(validateProductForm({ ...draftProduct, sortOrder: '1.5' }).error).toBe('Sort order must be a whole number.');
        expect(validateProductForm({ ...draftProduct, heroMediaId: '0' }).error).toBe('Hero image must be a whole positive number.');
        expect(validateProductForm({ ...draftProduct, seoTitle: 'x'.repeat(181) }).error).toBe(
            'Search title must be 180 characters or fewer.',
        );
    });

    it('locks Publish until the product has a short description and a hero image', () => {
        const published: ProductForm = { ...draftProduct, status: 'published' };
        expect(validateProductForm(published).error).toBe('Published products require a short description.');
        expect(validateProductForm({ ...published, shortDescription: 'Modular granite seating.' }).error).toBe(
            'Complete the publish checklist before publishing this product.',
        );
        expect(
            validateProductForm({ ...published, shortDescription: 'Modular granite seating.', heroMediaId: '5' }),
        ).toMatchObject({ error: null, heroMediaId: 5 });
    });

    it('validates models and locks model Publish until an image is chosen', () => {
        const form: ModelForm = { status: 'draft', modelKey: 'square-seat', label: 'Square seat', imageMediaId: '', sortOrder: '0' };
        expect(validateModelForm(form)).toEqual({ error: null, sortOrder: 0, imageMediaId: null });
        expect(validateModelForm({ ...form, modelKey: 'Square Seat' }).error).toBe(
            'Model website key must use lowercase words separated by hyphens.',
        );
        expect(validateModelForm({ ...form, label: ' ' }).error).toBe('Model label is required.');
        expect(validateModelForm({ ...form, status: 'published' }).error).toBe(
            'Publish is locked. Choose a model image before publishing this model.',
        );
        expect(validateModelForm({ ...form, status: 'published', imageMediaId: '9' })).toEqual({ error: null, sortOrder: 0, imageMediaId: 9 });
        expect(readyLabels(getProductModelPublishChecklist(form))).toEqual(['Model website key', 'Model label']);
        expect(readyLabels(getProductModelPublishChecklist({ ...form, imageMediaId: '9' }))).toHaveLength(3);
    });

    it('marks every product publish checklist item ready only when the product is complete', () => {
        const complete: ProductForm = { ...draftProduct, shortDescription: 'Modular granite seating.', heroMediaId: '5' };
        const checklist = getProductPublishChecklist(complete, [model()], [material()], [spec()]);
        expect(checklist.map((item) => item.label)).toEqual([
            'Product name',
            'Website URL',
            'Short description',
            'Hero image',
            'Published model',
            'Material defaults',
            'Specifications',
        ]);
        expect(checklist.every((item) => item.ready)).toBe(true);

        const empty = getProductPublishChecklist({ ...draftProduct, name: '', slug: '' }, [], [], []);
        expect(readyLabels(empty)).toEqual([]);
    });

    it('does not count draft models, image-less models or blank material/spec rows toward Publish', () => {
        const complete: ProductForm = { ...draftProduct, shortDescription: 'Summary', heroMediaId: '5' };
        const notReady = (models: ModelRow[], materials: MaterialRow[], specs: SpecRow[]) =>
            getProductPublishChecklist(complete, models, materials, specs)
                .filter((item) => !item.ready)
                .map((item) => item.label);

        expect(notReady([model({ status: 'draft' })], [material()], [spec()])).toEqual(['Published model']);
        expect(notReady([model({ image_media_id: null })], [material()], [spec()])).toEqual(['Published model']);
        expect(
            notReady([model()], [material({ stone_group_id: null, material_slug: '  ', display_label: ' ' })], [spec({ spec_value: ' ' })]),
        ).toEqual(['Material defaults', 'Specifications']);
        expect(notReady([model()], [material({ stone_group_id: null, display_label: 'Bluestone body' })], [spec()])).toEqual([]);
    });

    it('round-trips a saved product row into the form and back to the same save payload', () => {
        const row: ProductRow = {
            id: 7,
            slug: 'prime-block',
            name: 'Prime Block',
            status: 'published',
            short_description: 'Modular granite seating.',
            hero_media_id: 12,
            seo: { title: 'Prime Block', description: 'Granite seating', canonical: '/products/prime-block' },
            sort_order: 4,
            published_at: '2026-09-01T00:00:00Z',
            archived_at: null,
            updated_at: '2026-09-02T00:00:00Z',
            created_at: '2026-08-01T00:00:00Z',
        };
        const form = rowToProductForm(row);
        expect(form).toMatchObject({ heroMediaId: '12', sortOrder: '4', seoTitle: 'Prime Block', seoDescription: 'Granite seating' });
        expect(validateProductForm(form)).toEqual({
            error: null,
            sortOrder: 4,
            heroMediaId: 12,
            seo: row.seo,
        });
        expect(rowToProductForm({ ...row, short_description: null, hero_media_id: null, seo: ['not', 'an', 'object'] })).toMatchObject({
            shortDescription: '',
            heroMediaId: '',
            seoBaseJson: '{}',
            seoTitle: '',
        });
        expect(rowToProductForm(null)).toMatchObject({ status: 'draft', slug: '', seoBaseJson: '{}', sortOrder: '0' });
    });

    it('requires a material default reference and complete specs before those child rows save', () => {
        expect(validateMaterialDefaultForm({ materialCategory: 'body', stoneGroupId: '', materialSlug: '', displayLabel: ' ' }).error).toBe(
            'Material defaults need a Stone Library link, material reference, or display label.',
        );
        expect(validateMaterialDefaultForm({ materialCategory: 'frame', stoneGroupId: '-1', materialSlug: '', displayLabel: '' }).error).toBe(
            'Stone Library link must be a whole positive number.',
        );
        expect(validateMaterialDefaultForm({ materialCategory: 'body', stoneGroupId: '3', materialSlug: '', displayLabel: '' })).toEqual({
            error: null,
            stoneGroupId: 3,
        });
        expect(validateSpecForm({ specLabel: '', specValue: '1800 mm', sortOrder: '0' }).error).toBe('Spec label is required.');
        expect(validateSpecForm({ specLabel: 'Length', specValue: ' ', sortOrder: '0' }).error).toBe('Spec value is required.');
        expect(validateSpecForm({ specLabel: 'Length', specValue: '1800 mm', sortOrder: 'x' }).error).toBe('Sort order must be a whole number.');
        expect(validateSpecForm({ specLabel: 'Length', specValue: '1800 mm', sortOrder: '2' })).toEqual({ error: null, sortOrder: 2 });
    });
});
