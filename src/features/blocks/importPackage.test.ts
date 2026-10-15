import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
    PROJECT_PACKAGE_LIMITS,
    catalogueResolvers,
    packageImageFiles,
    packageToDraft,
    parseProjectPackage,
    parseProjectPackageText,
    resolveImportSlug,
    type PackageToDraftContext,
    type ParsedProjectPackage,
} from './importPackage';

const root = resolve(import.meta.dirname, '../../..');
const exampleText = readFileSync(resolve(root, 'docs/content-import/examples/greenline/project.json'), 'utf8');
const packageSchema = JSON.parse(readFileSync(resolve(root, 'docs/content-import/project-package.schema.json'), 'utf8'));
const example = () => JSON.parse(exampleText);
// The protected Function's own validator (plain JS, outside the app type project).
const serverBlocksPath: string = resolve(root, 'functions/_lib/blocks.js');
const { validateContentBlock: validateServerBlock } = (await import(/* @vite-ignore */ serverBlocksPath)) as {
    validateContentBlock: (block: unknown, mode: 'draft' | 'publish') => unknown[];
};

const stoneIds: Record<string, number> = { blueocean: 11, 'alpine-white': 12 };
const finishes: Record<string, { id: number; key: string }> = { sawn: { id: 2, key: 'sawn' }, flamed: { id: 1, key: 'flamed' } };

function context(overrides: Partial<PackageToDraftContext> = {}): PackageToDraftContext {
    return {
        resolveStone: (slug) => stoneIds[slug] ?? null,
        resolveFinish: (key) => finishes[key] ?? null,
        resolveVariant: (stoneGroupId) => stoneGroupId * 10,
        mediaIdForFile: (file) => ({ 'images/hero.jpg': 101, 'images/step-1.jpg': 102, 'images/as-built.jpg': 103 })[file] ?? null,
        existingSlugs: [],
        ...overrides,
    };
}

function parsed(json: unknown): ParsedProjectPackage {
    const result = parseProjectPackage(json);
    expect(result.errors).toEqual([]);
    return result.package as ParsedProjectPackage;
}

function errorPaths(json: unknown) {
    return parseProjectPackage(json).errors.map((issue) => issue.path);
}

describe('project package parsing', () => {
    test('the Greenline example parses cleanly and becomes a Draft with every block', () => {
        const result = parseProjectPackageText(exampleText);
        expect(result.errors).toEqual([]);
        expect(result.warnings).toEqual([]);
        const { draft, pendingImages, unresolvedStones } = packageToDraft(result.package as ParsedProjectPackage, context());
        expect(pendingImages).toEqual([]);
        expect(unresolvedStones).toEqual([]);
        expect(draft.schemaVersion).toBe(2);
        expect(draft.project).toMatchObject({
            id: null,
            status: 'draft',
            slug: 'greenline-birrarung-marr',
            title: 'The Greenline Project, Birrarung Marr Site 1',
            completedOn: '2026-03-01',
            claimReviewStatus: 'needs_review',
            heroMediaId: 101,
            coverMediaId: 101,
        });
        expect(draft.facts).toMatchObject([{ factLabel: 'Award', claimStatus: 'needs_review', sortOrder: 0, id: null }]);
        expect(draft.materials).toMatchObject([
            { stoneGroupId: 11, stoneVariantId: 110, finishDefinitionId: 2, application: 'Tiered seating steps', claimStatus: 'needs_review' },
        ]);
        expect(draft.blocks.map((block) => block.type)).toEqual(['heading', 'stats', 'steps', 'image', 'stone_cards', 'spec_table', 'cta']);
        expect(draft.blocks.map((block) => block.sortOrder)).toEqual([0, 1, 2, 3, 4, 5, 6]);
        expect(new Set(draft.blocks.map((block) => block.key)).size).toBe(7);
        expect(draft.blocks[2].content).toMatchObject({ items: [{ title: 'Shop drawing', mediaAssetId: 102, alt: 'Shop drawing of the stair setting-out' }] });
        expect(draft.blocks[3].content).toMatchObject({ mediaAssetId: 103, alt: 'As built: staggered joints and a crisp arris' });
        expect(draft.blocks[4].content).toEqual({
            title: 'The stone',
            items: [
                { stoneGroupId: 11, finishKey: 'sawn' },
                { stoneGroupId: 12, finishKey: 'flamed' },
            ],
        });
        expect(draft.maps).toEqual([]);
        expect(draft.hotspots).toEqual([]);
        // The browser and the protected Function accept every block, and they are publish-ready.
        for (const block of draft.blocks) {
            expect(validateServerBlock(block, 'draft')).toEqual([]);
            expect(validateServerBlock(block, 'publish')).toEqual([]);
        }
    });

    test('format and version must match exactly', () => {
        expect(errorPaths({ ...example(), format: 'urblo-project' })).toEqual(['format']);
        expect(errorPaths({ ...example(), version: 2 })).toEqual(['version']);
        expect(errorPaths({ ...example(), extra: true })).toEqual(['extra']);
        expect(parseProjectPackageText('{ not json').errors[0].path).toBe('project.json');
        expect(parseProjectPackageText('x'.repeat(PROJECT_PACKAGE_LIMITS.jsonBytes + 1)).errors[0].message).toMatch(/1 MB/);
    });

    test('unknown block types, unknown fields and image points are refused with their location', () => {
        const json = example();
        json.blocks.push({ type: 'carousel', items: [] });
        json.blocks.push({ type: 'hotspot_image', projectMaterialMapKey: 'x' });
        json.blocks[0].colour = 'red';
        json.blocks[2].items[0].mediaAssetId = 5;
        json.project.carbonStatus = 'yes';
        const result = parseProjectPackage(json);
        expect(result.package).toBeNull();
        expect(result.errors.map((issue) => issue.path)).toEqual([
            'project.carbonStatus',
            'blocks[0].colour',
            'blocks[2].items[0].mediaAssetId',
            'blocks[7].type',
            'blocks[8].type',
        ]);
        expect(result.errors[4].message).toMatch(/material points cannot be imported/);
    });

    test('every image needs a description that is not its file name', () => {
        const json = example();
        delete json.blocks[3].image.alt;
        json.blocks[2].items[0].image.alt = 'step-1';
        json.project.hero.alt = '   ';
        expect(errorPaths(json)).toEqual(['project.hero.alt', 'blocks[2].items[0].image.alt', 'blocks[3].image.alt']);
    });

    test('image files must be JPG, PNG or WebP inside the images folder', () => {
        const json = example();
        json.blocks[3].image.file = '../secret.jpg';
        json.project.hero.file = 'images/hero.gif';
        expect(errorPaths(json)).toEqual(['project.hero.file', 'blocks[3].image.file']);
    });

    test('block limits and required fields use the shared schema and map back to package paths', () => {
        const json = example();
        json.blocks[1].items = Array.from({ length: 5 }, () => ({ value: '1', label: 'x' }));
        json.blocks[0].title = 'x'.repeat(201);
        json.blocks[6].primary.href = 'javascript:alert(1)';
        json.blocks[4].items[0].stone = 'Blue Ocean';
        json.blocks.push({ type: 'gallery', items: [{ image: { alt: 'One' } }] });
        json.blocks.push({ type: 'video', youtubeUrl: 'https://youtu.be/abcdefgh' }, { type: 'video', youtubeUrl: 'https://youtu.be/abcdefgh' });
        const result = parseProjectPackage(json);
        expect(result.errors.map((issue) => issue.path)).toEqual([
            'blocks[0].title',
            'blocks[1].items',
            'blocks[4].items[0].stone',
            'blocks[6].primary.href',
            'blocks[7].items',
            'blocks',
        ]);
        expect(result.errors[0].message).toBe('Heading title is too long.');
        expect(result.errors[5].message).toMatch(/one video/);
    });

    test('collection and image limits', () => {
        const json = example();
        json.blocks = Array.from({ length: 101 }, () => ({ type: 'text', body: 'Copy' }));
        expect(errorPaths(json)).toEqual(['blocks']);
        const facts = example();
        facts.project.facts = Array.from({ length: 101 }, () => ({ label: 'a', value: 'b' }));
        expect(errorPaths(facts)).toEqual(['project.facts']);
        const images = example();
        images.blocks = Array.from({ length: 26 }, (_, index) => ({
            type: 'gallery',
            items: [
                { image: { file: `images/a-${index}.jpg`, alt: `First view ${index}` } },
                { image: { file: `images/b-${index}.jpg`, alt: `Second view ${index}` } },
            ],
        }));
        expect(errorPaths(images)).toEqual(['images']);
    });

    test('slug, date and materials are checked', () => {
        const json = example();
        json.project.slug = 'Greenline Project';
        json.project.completedOn = '2026-02-30';
        json.project.materials.push({ stone: 'blueocean', application: 'Paving' });
        expect(errorPaths(json)).toEqual(['project.slug', 'project.completedOn', 'project.materials[1].finish']);
    });

    test('a slug that is already used gets a numeric suffix; a missing slug comes from the title', () => {
        const json = example();
        const used = resolveImportSlug(parsed(json), ['greenline-birrarung-marr', 'greenline-birrarung-marr-2']);
        expect(used).toEqual({ slug: 'greenline-birrarung-marr-3', requested: 'greenline-birrarung-marr', changed: true });
        delete json.project.slug;
        expect(resolveImportSlug(parsed(json), []).slug).toBe('the-greenline-project-birrarung-marr-site-1');
        const { draft } = packageToDraft(parsed(example()), context({ existingSlugs: ['greenline-birrarung-marr'] }));
        expect(draft.project.slug).toBe('greenline-birrarung-marr-2');
    });

    test('missing images and unresolved stones are warnings that leave gaps for the editor', () => {
        const json = example();
        delete json.blocks[3].image.file;
        json.blocks[4].items[1].stone = 'not-a-stone';
        json.blocks[4].items[0].finish = 'mirror';
        const result = parseProjectPackage(json);
        expect(result.errors).toEqual([]);
        expect(result.warnings.map((issue) => issue.path)).toEqual(['blocks[3].image']);
        const { draft, pendingImages, unresolvedStones } = packageToDraft(
            result.package as ParsedProjectPackage,
            context({ mediaIdForFile: (file) => (file === 'images/hero.jpg' ? 101 : null) }),
        );
        expect(pendingImages.map((use) => use.path)).toEqual(['blocks[2].items[0].image', 'blocks[3].image']);
        expect(unresolvedStones).toEqual([
            { path: 'blocks[4].items[0]', stone: 'blueocean', finish: 'mirror', reason: 'finish' },
            { path: 'blocks[4].items[1]', stone: 'not-a-stone', finish: 'flamed', reason: 'stone' },
        ]);
        expect(draft.blocks[3].content).toMatchObject({ mediaAssetId: null, alt: 'As built: staggered joints and a crisp arris' });
        expect(draft.blocks[4].content).toMatchObject({ items: [{ stoneGroupId: 11, finishKey: 'mirror' }, { stoneGroupId: null }] });
        // Gaps are allowed in a draft and stop Publish.
        expect(validateServerBlock(draft.blocks[3], 'draft')).toEqual([]);
        expect(validateServerBlock(draft.blocks[3], 'publish')).not.toEqual([]);
        expect(validateServerBlock(draft.blocks[4], 'publish')).not.toEqual([]);
    });

    test('an image used in several places is uploaded once', () => {
        const json = example();
        json.blocks.push({
            type: 'gallery',
            items: [
                { image: { file: 'images/hero.jpg', alt: 'Seating steps from the river' } },
                { image: { file: 'images/as-built.jpg', alt: 'Joint detail' } },
            ],
        });
        const files = packageImageFiles(parsed(json));
        expect(files).toEqual([
            { file: 'images/hero.jpg', alt: 'Tiered bluestone seating steps on the Yarra riverbank', uses: 3 },
            { file: 'images/step-1.jpg', alt: 'Shop drawing of the stair setting-out', uses: 1 },
            { file: 'images/as-built.jpg', alt: 'As built: staggered joints and a crisp arris', uses: 2 },
        ]);
        // Each use keeps its own description in the block.
        const { draft } = packageToDraft(parsed(json), context());
        expect(draft.blocks[7].content).toMatchObject({ items: [{ mediaAssetId: 101, alt: 'Seating steps from the river' }, { mediaAssetId: 103 }] });
    });

    test('restricted Markdown: HTML and headings in text are warned about', () => {
        const json = example();
        json.blocks.push({ type: 'text', body: '# Title\n\n<b>bold</b>' });
        expect(parseProjectPackage(json).warnings.map((issue) => issue.path)).toEqual(['blocks[7].body', 'blocks[7].body']);
    });
});

// Minimal JSON Schema (2020-12 subset) checker for the hand-written package schema: no new
// dependency. Supports the keywords the schema file uses.
type Schema = Record<string, unknown>;
function schemaErrors(schema: Schema, value: unknown, path = '$', rootSchema: Schema = schema): string[] {
    if (typeof schema.$ref === 'string') {
        const target = schema.$ref.replace('#/$defs/', '');
        return schemaErrors((rootSchema.$defs as Record<string, Schema>)[target], value, path, rootSchema);
    }
    const errors: string[] = [];
    if ('const' in schema && value !== schema.const) errors.push(`${path}: const`);
    if (Array.isArray(schema.enum) && !schema.enum.includes(value)) errors.push(`${path}: enum`);
    if (Array.isArray(schema.oneOf)) {
        const matches = schema.oneOf.filter((option) => schemaErrors(option as Schema, value, path, rootSchema).length === 0);
        if (matches.length !== 1) errors.push(`${path}: oneOf matched ${matches.length}`);
    }
    if (schema.type === 'string') {
        if (typeof value !== 'string') return [...errors, `${path}: type`];
        if (typeof schema.maxLength === 'number' && value.length > schema.maxLength) errors.push(`${path}: maxLength`);
        if (typeof schema.minLength === 'number' && value.length < schema.minLength) errors.push(`${path}: minLength`);
        if (typeof schema.pattern === 'string' && !new RegExp(schema.pattern, 'u').test(value)) errors.push(`${path}: pattern`);
    }
    if (schema.type === 'array') {
        if (!Array.isArray(value)) return [...errors, `${path}: type`];
        if (typeof schema.maxItems === 'number' && value.length > schema.maxItems) errors.push(`${path}: maxItems`);
        if (typeof schema.minItems === 'number' && value.length < schema.minItems) errors.push(`${path}: minItems`);
        value.forEach((entry, index) => errors.push(...schemaErrors(schema.items as Schema, entry, `${path}[${index}]`, rootSchema)));
    }
    if (schema.type === 'object') {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) return [...errors, `${path}: type`];
        const record = value as Record<string, unknown>;
        const properties = (schema.properties ?? {}) as Record<string, Schema>;
        for (const key of (schema.required ?? []) as string[]) if (!(key in record)) errors.push(`${path}.${key}: required`);
        for (const [key, entry] of Object.entries(record)) {
            if (properties[key]) errors.push(...schemaErrors(properties[key], entry, `${path}.${key}`, rootSchema));
            else if (schema.additionalProperties === false) errors.push(`${path}.${key}: additionalProperties`);
        }
    }
    return errors;
}

describe('project package JSON Schema', () => {
    test('accepts the example package', () => {
        expect(packageSchema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
        expect(schemaErrors(packageSchema, example())).toEqual([]);
    });

    test('lists the 13 importable block types and not the image with material points', () => {
        const types = packageSchema.properties.blocks.items.oneOf.map((option: Schema) => (option.properties as Record<string, Schema>).type.const);
        expect(types).toEqual(['heading', 'text', 'quote', 'callout', 'stats', 'steps', 'spec_table', 'comparison_table', 'stone_cards', 'image', 'gallery', 'video', 'cta']);
    });

    test('rejects broken packages the importer also rejects', () => {
        const cases: [string, (json: ReturnType<typeof example>) => void][] = [
            ['wrong format', (json) => { json.format = 'other'; }],
            ['unknown block', (json) => { json.blocks.push({ type: 'hotspot_image' }); }],
            ['missing alt', (json) => { delete json.blocks[3].image.alt; }],
            ['unknown field', (json) => { json.blocks[0].colour = 'red'; }],
            ['too many stats', (json) => { json.blocks[1].items = Array.from({ length: 5 }, () => ({ value: '1', label: 'x' })); }],
            ['bad stone slug', (json) => { json.project.materials[0].stone = 'Blue Ocean'; }],
            ['image outside images/', (json) => { json.project.hero.file = 'hero.jpg'; }],
        ];
        for (const [name, mutate] of cases) {
            const json = example();
            mutate(json);
            expect(schemaErrors(packageSchema, json), name).not.toEqual([]);
            expect(parseProjectPackage(json).errors, name).not.toEqual([]);
        }
    });
});

describe('catalogue lookups', () => {
    const resolvers = catalogueResolvers({
        stones: [
            { id: 1, key: 'blueocean', label: 'BlueOcean', status: 'published' },
            { id: 2, key: 'golden-crust', label: 'Golden Crust', status: 'published' },
            { id: 3, key: 'hidden-stone', label: 'Hidden', status: 'draft' },
        ],
        variants: [
            { id: 20, stoneGroupId: 2, status: 'published', sortOrder: 1 },
            { id: 21, stoneGroupId: 2, status: 'published', sortOrder: 0 },
            { id: 10, stoneGroupId: 1, status: 'published', sortOrder: 0 },
        ],
        finishes: [
            { id: 5, key: 'bush_hammered', label: 'Bush Hammered', status: 'published' },
            { id: 6, key: 'rippling__fine', label: 'Rippling (Fine)', status: 'published' },
            { id: 7, key: 'flamed', label: 'Flamed', status: 'published' },
        ],
        capabilities: [
            { stoneVariantId: 21, finishDefinitionId: 7, capability: 'no' },
            { stoneVariantId: 20, finishDefinitionId: 7, capability: 'yes' },
        ],
    });

    test('only Live stones resolve, by their Stone Library address', () => {
        expect(resolvers.resolveStone('blueocean')).toBe(1);
        expect(resolvers.resolveStone('hidden-stone')).toBeNull();
        expect(resolvers.resolveStone('steel-blue')).toBeNull();
    });

    test('finish keys and names match without caring about case, spaces or hyphens', () => {
        for (const value of ['bush_hammered', 'bush-hammered', 'Bush Hammered']) expect(resolvers.resolveFinish(value)).toEqual({ id: 5, key: 'bush_hammered' });
        for (const value of ['rippling__fine', 'rippling-fine', 'Rippling (Fine)']) expect(resolvers.resolveFinish(value)?.key).toBe('rippling__fine');
        expect(resolvers.resolveFinish('mirror')).toBeNull();
        expect(resolvers.finishLabel('bush-hammered')).toBe('Bush Hammered');
    });

    test('the variant is the first Live variant that offers the finish', () => {
        expect(resolvers.resolveVariant(2, 7)).toBe(20);
        expect(resolvers.resolveVariant(2, null)).toBe(21);
        expect(resolvers.resolveVariant(1, 7)).toBeNull();
    });
});

describe('colleague documents stay in step with the format', () => {
    const readme = readFileSync(resolve(root, 'docs/content-import/README.md'), 'utf8');
    const prompt = readFileSync(resolve(root, 'docs/content-import/CLAUDE_DESIGN_PROMPT.md'), 'utf8');
    const finishKeys = readFileSync(resolve(root, 'data/clean/finish_options.csv'), 'utf8')
        .trim()
        .split('\n')
        .slice(1)
        .map((line) => {
            const [finishId, variantId] = line.split(',');
            return variantId ? `${finishId}__${variantId}` : finishId;
        });

    test('both list the dated live Stone Library catalogue from its single committed source', () => {
        const catalogue = JSON.parse(readFileSync(resolve(root, 'docs/content-import/stone-catalogue-2026-10-15.json'), 'utf8')) as {
            observedAt: string;
            stones: { slug: string; name: string; finishes: string[] }[];
        };
        expect(catalogue.observedAt).toBe('2026-10-15');
        expect(catalogue.stones).toHaveLength(18);
        for (const doc of [readme, prompt]) {
            expect(doc).toContain('Live Stone Library on 2026-10-15');
            expect(doc).toMatch(/copy (?:the|its) slug from/);
        }
        for (const stone of catalogue.stones) {
            expect(readme).toContain(`| \`${stone.slug}\` | ${stone.name} | ${stone.finishes.map((finish) => `\`${finish}\``).join(', ')} |`);
            expect(prompt).toContain(`  - \`${stone.slug}\` (${stone.name}): ${stone.finishes.join(', ')}`);
        }
        const listed = (doc: string) => [...doc.slice(doc.indexOf('Live Stone Library on 2026-10-15')).split(/\n#{2,3} /)[0].matchAll(/^(?:\| `| {2}- `)([a-z0-9-]+)` (?:\| [^|]+ \| `|\()/gm)].map((match) => match[1]);
        expect(listed(readme)).toEqual(catalogue.stones.map((stone) => stone.slug));
        expect(listed(prompt)).toEqual(catalogue.stones.map((stone) => stone.slug));
    });

    test('both embed the complete example package', () => {
        expect(readme).toContain(exampleText.trim());
        expect(prompt).toContain(exampleText.trim());
    });

    test('both list every importable block type and every current finish key', () => {
        for (const type of ['heading', 'text', 'quote', 'callout', 'stats', 'steps', 'spec_table', 'comparison_table', 'stone_cards', 'image', 'gallery', 'video', 'cta']) {
            expect(readme).toContain(`| \`${type}\` |`);
            expect(prompt).toContain(`| \`${type}\` |`);
        }
        expect(finishKeys.length).toBeGreaterThanOrEqual(12);
        for (const key of finishKeys) {
            expect(readme).toContain(`\`${key}\``);
            expect(prompt).toContain(`\`${key}\``);
        }
    });
});
