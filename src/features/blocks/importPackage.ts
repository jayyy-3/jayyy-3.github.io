// Project content package (`urblo-project-package` v1): the external form of a Project draft
// that the content team exports from Claude Design. Parsing and mapping are pure and
// deterministic (no IO, no AI): the admin import dialog and `npm run agent:project-package`
// both use this module. Block content is the shared block schema with two substitutions only:
// images are `{ file, alt }` objects and stones are Stone Library slugs.
// Format documentation: docs/content-import/README.md (schema: project-package.schema.json).

import {
    BLOCK_TEXT_LIMITS,
    CONTENT_BLOCK_TYPES,
    isContentBlockType,
    validateContentBlock,
    type BlockIssue,
    type ContentBlockType,
} from './schema.ts';
import {
    createEmptyProjectAggregateDraft,
    createProjectDraftKey,
    normalizeProjectDraftOrder,
    slugify,
    type ProjectAggregateDraft,
    type ProjectBlockDraft,
    type ProjectDraftRecord,
} from '../projects/projectAggregate.ts';
import { isFileNameDescription } from '../../pages/admin/media/mediaPickerFiles.ts';

const PROJECT_PACKAGE_FORMAT = 'urblo-project-package';
const PROJECT_PACKAGE_VERSION = 1;

export const PROJECT_PACKAGE_LIMITS = {
    blocks: 100,
    facts: 100,
    materials: 100,
    images: 50,
    imageBytes: 10 * 1024 * 1024,
    zipBytes: 100 * 1024 * 1024,
    jsonBytes: 1024 * 1024,
} as const;

/** Every block type except the image with material points, which editors add in the admin. */
const IMPORTABLE_BLOCK_TYPES = CONTENT_BLOCK_TYPES.filter((type) => type !== 'hotspot_image');

const PACKAGE_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;

export interface PackageIssue {
    /** Where in project.json, e.g. `blocks[2].items[0].image.alt`. */
    path: string;
    message: string;
}

export interface PackageImageUse {
    path: string;
    /** `images/...` file name inside the zip, or null when the image will be added later. */
    file: string | null;
    alt: string;
}

export interface PackageStoneUse {
    path: string;
    stone: string;
    finish: string;
}

type ProjectTextField =
    | 'title'
    | 'slug'
    | 'location'
    | 'projectDateLabel'
    | 'completedOn'
    | 'summary'
    | 'lead'
    | 'client'
    | 'landscapeArchitect'
    | 'contractor'
    | 'address'
    | 'quantityLabel';

export interface PackageProject extends Record<ProjectTextField, string> {
    facts: { label: string; value: string }[];
    materials: { stone: PackageStoneUse; application: string; note: string }[];
    hero: PackageImageUse | null;
    cover: PackageImageUse | null;
}

export interface PackageBlock {
    type: ContentBlockType;
    path: string;
    /** Package fields exactly as written (validated). */
    fields: Record<string, unknown>;
}

export interface ParsedProjectPackage {
    project: PackageProject;
    blocks: PackageBlock[];
    /** Every image use, in package order. */
    images: PackageImageUse[];
    /** Every stone use (materials, then stone cards), in package order. */
    stones: PackageStoneUse[];
}

export interface ParseResult {
    package: ParsedProjectPackage | null;
    errors: PackageIssue[];
    warnings: PackageIssue[];
}

const PROJECT_TEXT_FIELDS: Record<ProjectTextField, number> = {
    title: BLOCK_TEXT_LIMITS.title,
    slug: BLOCK_TEXT_LIMITS.title,
    location: BLOCK_TEXT_LIMITS.title,
    projectDateLabel: BLOCK_TEXT_LIMITS.title,
    completedOn: 10,
    summary: BLOCK_TEXT_LIMITS.short,
    lead: BLOCK_TEXT_LIMITS.body,
    client: BLOCK_TEXT_LIMITS.title,
    landscapeArchitect: BLOCK_TEXT_LIMITS.title,
    contractor: BLOCK_TEXT_LIMITS.title,
    address: BLOCK_TEXT_LIMITS.title,
    quantityLabel: BLOCK_TEXT_LIMITS.title,
};

const PROJECT_KEYS = [...Object.keys(PROJECT_TEXT_FIELDS), 'facts', 'materials', 'hero', 'cover'];

/** Package fields allowed at the top of each block (besides `type`). */
const PACKAGE_BLOCK_FIELDS: Record<Exclude<ContentBlockType, 'hotspot_image'>, readonly string[]> = {
    heading: ['eyebrow', 'title', 'intro'],
    text: ['body'],
    quote: ['quote', 'attribution', 'role'],
    callout: ['title', 'body', 'tone'],
    stats: ['items', 'caption'],
    steps: ['intro', 'items'],
    spec_table: ['title', 'rows'],
    comparison_table: ['title', 'columns', 'rows'],
    stone_cards: ['title', 'items'],
    image: ['image', 'caption', 'label', 'title', 'presentation'],
    gallery: ['items'],
    video: ['youtubeUrl', 'label', 'caption', 'title'],
    cta: ['title', 'body', 'primary', 'secondary'],
};

const STEP_ITEM_FIELDS = ['title', 'body', 'image'];
const GALLERY_ITEM_FIELDS = ['image', 'caption'];
const STONE_CARD_FIELDS = ['stone', 'finish', 'note'];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_FILE_PATTERN = new RegExp(`^images/[^/\\\\]+\\.(?:${PACKAGE_IMAGE_EXTENSIONS.join('|')})$`, 'i');

const ISSUE_MESSAGES: Record<BlockIssue['code'], string> = {
    invalid_type: 'has the wrong kind of value.',
    invalid_value: 'is not an accepted value.',
    unknown_field: 'is not part of the package format. Remove it.',
    required: 'is required.',
    too_long: 'is too long.',
    too_few: 'has too few entries.',
    too_many: 'has too many entries.',
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function describeType(type: ContentBlockType) {
    return type.replace(/_/g, ' ');
}

/** True when the value is a safe `images/<name>.<jpg|jpeg|png|webp>` path inside the zip. */
function isPackageImageFile(value: string) {
    return IMAGE_FILE_PATTERN.test(value) && !value.includes('..');
}

/** Reads project.json text (size limit, JSON syntax), then parses it. */
export function parseProjectPackageText(text: string): ParseResult {
    if (new TextEncoder().encode(text).byteLength > PROJECT_PACKAGE_LIMITS.jsonBytes) {
        return { package: null, errors: [{ path: 'project.json', message: 'The package text is larger than 1 MB.' }], warnings: [] };
    }
    let json: unknown;
    try {
        json = JSON.parse(text.replace(/^\uFEFF/, ''));
    } catch {
        return {
            package: null,
            errors: [{ path: 'project.json', message: 'This is not valid JSON. Export the package again, or paste the complete text.' }],
            warnings: [],
        };
    }
    return parseProjectPackage(json);
}

/**
 * Validates a package without touching any service. Errors stop the import; warnings (images
 * to add later, stones to confirm, gaps that block Publish) are shown in the report.
 */
export function parseProjectPackage(json: unknown): ParseResult {
    const errors: PackageIssue[] = [];
    const warnings: PackageIssue[] = [];
    const images: PackageImageUse[] = [];
    const stones: PackageStoneUse[] = [];
    const error = (path: string, message: string) => errors.push({ path, message });
    const warn = (path: string, message: string) => warnings.push({ path, message });

    if (!isPlainObject(json)) {
        error('(package)', 'The package must be one JSON object.');
        return { package: null, errors, warnings };
    }
    if (json.format !== PROJECT_PACKAGE_FORMAT) error('format', `Must be "${PROJECT_PACKAGE_FORMAT}".`);
    if (json.version !== PROJECT_PACKAGE_VERSION) error('version', `Must be ${PROJECT_PACKAGE_VERSION}.`);
    unknownKeys(json, ['format', 'version', 'project', 'blocks'], '', error);
    if (errors.length) return { package: null, errors, warnings };

    const readImage = (value: unknown, path: string, required: boolean): PackageImageUse | null => {
        if (value === undefined || value === null) {
            if (required) error(path, 'Add an image object with "file" and "alt".');
            return null;
        }
        if (!isPlainObject(value)) {
            error(path, 'Must be an object with "file" and "alt".');
            return null;
        }
        unknownKeys(value, ['file', 'alt'], path, error);
        let file: string | null = null;
        if (value.file !== undefined && value.file !== null && value.file !== '') {
            if (typeof value.file !== 'string' || !isPackageImageFile(value.file)) {
                error(`${path}.file`, 'Must be a JPG, PNG or WebP file inside the images folder, e.g. "images/hero.jpg".');
            } else {
                file = value.file;
            }
        }
        const alt = typeof value.alt === 'string' ? value.alt.trim() : '';
        if (value.alt !== undefined && typeof value.alt !== 'string') error(`${path}.alt`, 'Must be text.');
        else if (!alt) error(`${path}.alt`, 'Every image needs a description of what it shows.');
        else if (alt.length > BLOCK_TEXT_LIMITS.short) error(`${path}.alt`, `Keep the description under ${BLOCK_TEXT_LIMITS.short} characters.`);
        else if (file && isFileNameDescription(alt, file.split('/').pop() ?? file)) {
            error(`${path}.alt`, 'Describe what the image shows, not its file name.');
        }
        const use = { path, file, alt };
        images.push(use);
        return use;
    };

    const readStone = (value: Record<string, unknown>, path: string, finishRequired: boolean): PackageStoneUse | null => {
        const stone = value.stone;
        if (typeof stone !== 'string' || !SLUG_PATTERN.test(stone.trim())) {
            error(`${path}.stone`, 'Use the stone\'s Stone Library address, e.g. "blueocean" from /stone-library/blueocean.');
            return null;
        }
        if (value.finish !== undefined && (typeof value.finish !== 'string' || value.finish.length > BLOCK_TEXT_LIMITS.title)) {
            error(`${path}.finish`, 'Must be a finish key such as "sawn" or "flamed".');
            return null;
        }
        const finish = typeof value.finish === 'string' ? value.finish.trim() : '';
        if (finishRequired && !finish) {
            error(`${path}.finish`, 'Name the finish, e.g. "sawn" or "flamed".');
            return null;
        }
        const use = { path, stone: stone.trim(), finish };
        stones.push(use);
        return use;
    };

    // Project
    const projectSource = json.project;
    const project: PackageProject = {
        ...(Object.fromEntries(Object.keys(PROJECT_TEXT_FIELDS).map((key) => [key, ''])) as Record<ProjectTextField, string>),
        facts: [],
        materials: [],
        hero: null,
        cover: null,
    };
    if (!isPlainObject(projectSource)) {
        error('project', 'Add the project object with at least a title.');
    } else {
        unknownKeys(projectSource, PROJECT_KEYS, 'project', error);
        for (const [field, limit] of Object.entries(PROJECT_TEXT_FIELDS) as [ProjectTextField, number][]) {
            const value = projectSource[field];
            const path = `project.${field}`;
            if (value === undefined || value === null) continue;
            if (typeof value !== 'string') error(path, 'Must be text.');
            else if (value.length > limit) error(path, `Keep this under ${limit} characters.`);
            else project[field] = value.trim();
        }
        if (!project.title) error('project.title', 'Every project needs a title.');
        if (project.slug && !SLUG_PATTERN.test(project.slug)) {
            error('project.slug', 'Use lowercase letters, numbers and single hyphens, e.g. "greenline-birrarung-marr".');
        }
        if (project.completedOn && !isIsoDate(project.completedOn)) {
            error('project.completedOn', 'Use a date like 2026-03-01, or leave it out.');
        }
        if (!project.summary && !project.lead) warn('project.summary', 'Add a summary or lead before publishing.');

        const facts = projectSource.facts;
        if (facts !== undefined) {
            if (!Array.isArray(facts)) error('project.facts', 'Must be a list.');
            else if (facts.length > PROJECT_PACKAGE_LIMITS.facts) error('project.facts', `Use no more than ${PROJECT_PACKAGE_LIMITS.facts} facts.`);
            else facts.forEach((fact, index) => {
                const path = `project.facts[${index}]`;
                if (!isPlainObject(fact)) return error(path, 'Must be an object with "label" and "value".');
                unknownKeys(fact, ['label', 'value'], path, error);
                const label = requiredText(fact.label, `${path}.label`, BLOCK_TEXT_LIMITS.title, error);
                const value = requiredText(fact.value, `${path}.value`, BLOCK_TEXT_LIMITS.short, error);
                if (label !== null && value !== null) project.facts.push({ label, value });
            });
        }

        const materials = projectSource.materials;
        if (materials !== undefined) {
            if (!Array.isArray(materials)) error('project.materials', 'Must be a list.');
            else if (materials.length > PROJECT_PACKAGE_LIMITS.materials) {
                error('project.materials', `Use no more than ${PROJECT_PACKAGE_LIMITS.materials} materials.`);
            } else materials.forEach((material, index) => {
                const path = `project.materials[${index}]`;
                if (!isPlainObject(material)) return error(path, 'Must be an object with "stone", "finish" and "application".');
                unknownKeys(material, ['stone', 'finish', 'application', 'note'], path, error);
                const stone = readStone(material, path, true);
                const application = requiredText(material.application, `${path}.application`, BLOCK_TEXT_LIMITS.title, error);
                const note = optionalText(material.note, `${path}.note`, BLOCK_TEXT_LIMITS.short, error);
                if (stone && application !== null && note !== null) project.materials.push({ stone, application, note });
            });
        }

        project.hero = readImage(projectSource.hero, 'project.hero', false);
        project.cover = readImage(projectSource.cover, 'project.cover', false);
        if (!project.hero && !project.cover && !errors.some((issue) => issue.path.startsWith('project.hero'))) {
            warn('project.hero', 'No main image. Add one in the editor before publishing.');
        }
    }

    // Blocks
    const blocks: PackageBlock[] = [];
    const blockSource = json.blocks;
    if (!Array.isArray(blockSource)) {
        error('blocks', 'Add the list of page blocks (it may be empty).');
    } else if (blockSource.length > PROJECT_PACKAGE_LIMITS.blocks) {
        error('blocks', `Use no more than ${PROJECT_PACKAGE_LIMITS.blocks} blocks.`);
    } else {
        if (!blockSource.length) warn('blocks', 'The package has no page blocks.');
        let videos = 0;
        blockSource.forEach((block, index) => {
            const path = `blocks[${index}]`;
            if (!isPlainObject(block)) return error(path, 'Each block must be an object with a "type".');
            const type = block.type;
            if (type === 'hotspot_image') {
                return error(`${path}.type`, 'Images with material points cannot be imported. Use an "image" block and mark the materials in the editor.');
            }
            if (!isContentBlockType(type)) {
                return error(`${path}.type`, `Unknown block type. Use one of: ${IMPORTABLE_BLOCK_TYPES.join(', ')}.`);
            }
            const before = errors.length;
            const fields = { ...block };
            delete fields.type;
            unknownKeys(fields, PACKAGE_BLOCK_FIELDS[type as Exclude<ContentBlockType, 'hotspot_image'>], path, error);
            if (type === 'video') videos += 1;
            if (type === 'image') readImage(fields.image, `${path}.image`, true);
            if (type === 'steps' && Array.isArray(fields.items)) {
                fields.items.forEach((item, itemIndex) => {
                    const itemPath = `${path}.items[${itemIndex}]`;
                    if (!isPlainObject(item)) return;
                    unknownKeys(item, STEP_ITEM_FIELDS, itemPath, error);
                    readImage(item.image, `${itemPath}.image`, false);
                });
            }
            if (type === 'gallery' && Array.isArray(fields.items)) {
                fields.items.forEach((item, itemIndex) => {
                    const itemPath = `${path}.items[${itemIndex}]`;
                    if (!isPlainObject(item)) return;
                    unknownKeys(item, GALLERY_ITEM_FIELDS, itemPath, error);
                    readImage(item.image, `${itemPath}.image`, true);
                });
            }
            if (type === 'stone_cards' && Array.isArray(fields.items)) {
                fields.items.forEach((item, itemIndex) => {
                    const itemPath = `${path}.items[${itemIndex}]`;
                    if (!isPlainObject(item)) return;
                    unknownKeys(item, STONE_CARD_FIELDS, itemPath, error);
                    readStone(item, itemPath, false);
                });
            }
            if (type === 'text' && typeof fields.body === 'string') {
                if (/<\/?[a-z][^>]*>/i.test(fields.body)) warn(`${path}.body`, 'HTML is shown as plain text. Use Markdown bold, links and "- " lists only.');
                if (/^#{1,6}\s/m.test(fields.body)) warn(`${path}.body`, 'Markdown headings are not supported. Use a separate heading block.');
            }
            if (errors.length !== before) return;

            // Every image and stone is assumed found here, so the remaining issues are the
            // package's own: the same publish rules the editor and the website apply.
            const content = toBlockContent(type, fields, () => 1, (use) => ({ stoneGroupId: 1, finishKey: use.finish }));
            for (const issue of validateContentBlock({ type, content }, 'publish')) {
                error(packagePath(path, type, issue.path), `${capitalize(describeType(type))} ${fieldLabel(issue.path)} ${ISSUE_MESSAGES[issue.code]}`);
            }
            blocks.push({ type, path, fields });
        });
        if (videos > 1) error('blocks', 'Use at most one video block per project.');
    }

    const files = new Set(images.flatMap((use) => (use.file ? [use.file] : [])));
    if (files.size > PROJECT_PACKAGE_LIMITS.images) {
        error('images', `Use no more than ${PROJECT_PACKAGE_LIMITS.images} different images.`);
    }
    for (const use of images) if (!use.file) warn(use.path, 'No image file: add this image in the editor after importing.');

    return { package: errors.length ? null : { project, blocks, images, stones }, errors, warnings };
}

/** Unique image files in first-use order, each with the description of its first use. */
export function packageImageFiles(parsed: ParsedProjectPackage): { file: string; alt: string; uses: number }[] {
    const byFile = new Map<string, { file: string; alt: string; uses: number }>();
    for (const use of parsed.images) {
        if (!use.file) continue;
        const entry = byFile.get(use.file);
        if (entry) entry.uses += 1;
        else byFile.set(use.file, { file: use.file, alt: use.alt, uses: 1 });
    }
    return [...byFile.values()];
}

/** The package slug (or one made from the title), with `-2`, `-3`… when it is already used. */
export function resolveImportSlug(parsed: ParsedProjectPackage, existingSlugs: Iterable<string>) {
    const taken = new Set([...existingSlugs].map((slug) => slug.trim().toLowerCase()));
    const requested = parsed.project.slug || slugify(parsed.project.title) || 'imported-project';
    let slug = requested;
    for (let suffix = 2; taken.has(slug); suffix += 1) slug = `${requested}-${suffix}`;
    return { slug, requested, changed: slug !== requested };
}

export interface ResolvedFinish {
    id: number;
    key: string;
}

export interface PackageToDraftContext {
    /** Stone Library slug → Live stone ID, or null. */
    resolveStone: (slug: string) => number | null;
    /** Finish key or name → Live finish definition, or null. */
    resolveFinish: (key: string) => ResolvedFinish | null;
    /** First Live variant of the stone that offers the finish, or null. */
    resolveVariant: (stoneGroupId: number, finishDefinitionId: number | null) => number | null;
    /** Uploaded image ID for a package file, or null when it is added later. */
    mediaIdForFile: (file: string) => number | null;
    existingSlugs: Iterable<string>;
}

export interface UnresolvedStone extends PackageStoneUse {
    reason: 'stone' | 'finish';
}

export interface PackageToDraftResult {
    draft: ProjectAggregateDraft;
    pendingImages: PackageImageUse[];
    unresolvedStones: UnresolvedStone[];
}

/** Builds the new Draft project. Nothing is published; every claim starts as needs review. */
export function packageToDraft(parsed: ParsedProjectPackage, context: PackageToDraftContext): PackageToDraftResult {
    const pendingImages: PackageImageUse[] = [];
    const unresolvedStones: UnresolvedStone[] = [];
    const mediaId = (use: PackageImageUse | null | undefined) => {
        if (!use) return null;
        const id = use.file ? context.mediaIdForFile(use.file) : null;
        if (!id) pendingImages.push(use);
        return id;
    };
    const stone = (use: PackageStoneUse) => {
        const stoneGroupId = context.resolveStone(use.stone);
        const finish = use.finish ? context.resolveFinish(use.finish) : null;
        if (!stoneGroupId) unresolvedStones.push({ ...use, reason: 'stone' });
        else if (use.finish && !finish) unresolvedStones.push({ ...use, reason: 'finish' });
        return { stoneGroupId, finish };
    };

    const imageUses = new Map(parsed.images.map((use) => [use.path, use]));
    const stoneUses = new Map(parsed.stones.map((use) => [use.path, use]));
    const empty = createEmptyProjectAggregateDraft();
    const { slug } = resolveImportSlug(parsed, context.existingSlugs);
    const source = parsed.project;
    const project: ProjectDraftRecord = {
        ...empty.project,
        status: 'draft',
        slug,
        title: source.title,
        location: source.location,
        projectDateLabel: source.projectDateLabel,
        completedOn: source.completedOn,
        summary: source.summary,
        lead: source.lead,
        client: source.client,
        landscapeArchitect: source.landscapeArchitect,
        contractor: source.contractor,
        address: source.address,
        quantityLabel: source.quantityLabel,
        claimReviewStatus: 'needs_review',
        heroMediaId: mediaId(source.hero),
        coverMediaId: mediaId(source.cover),
    };

    const facts = source.facts.map((fact, index) => ({
        key: createProjectDraftKey('fact'),
        id: null,
        factLabel: fact.label,
        factValue: fact.value,
        factValueJson: null,
        claimStatus: 'needs_review' as const,
        sortOrder: index,
    }));

    const materials = source.materials.map((material, index) => {
        const resolved = stone(material.stone);
        const finishDefinitionId = resolved.finish?.id ?? null;
        return {
            key: createProjectDraftKey('material'),
            id: null,
            stoneGroupId: resolved.stoneGroupId,
            stoneVariantId: resolved.stoneGroupId ? context.resolveVariant(resolved.stoneGroupId, finishDefinitionId) : null,
            finishDefinitionId,
            application: material.application,
            note: material.note,
            mediaAssetId: null,
            claimStatus: 'needs_review' as const,
            sortOrder: index,
        };
    });

    const blocks = parsed.blocks.map((block, index): ProjectBlockDraft => {
        const content = toBlockContent(
            block.type,
            block.fields,
            (path) => mediaId(imageUses.get(path)),
            (_use, path) => {
                const use = stoneUses.get(path);
                if (!use) return { stoneGroupId: null, finishKey: '' };
                const resolved = stone(use);
                return { stoneGroupId: resolved.stoneGroupId, finishKey: resolved.finish?.key ?? use.finish };
            },
            block.path,
        );
        const draftBlock = { key: createProjectDraftKey('block'), id: null, type: block.type, content, sortOrder: index } as ProjectBlockDraft;
        const issues = validateContentBlock(draftBlock, 'draft');
        if (issues.length) throw new Error(`Imported ${block.path} does not match the block schema at ${issues[0].path}.`);
        return draftBlock;
    });

    const draft = normalizeProjectDraftOrder({ ...empty, project, facts, materials, blocks });
    return { draft, pendingImages, unresolvedStones };
}

/**
 * Converts package block fields to schema content. `media(path)` returns the image ID for the
 * image object at that package path; `stoneRef` the stone card's stone and finish key.
 */
function toBlockContent(
    type: ContentBlockType,
    fields: Record<string, unknown>,
    media: (path: string) => number | null,
    stoneRef: (use: { stone: string; finish: string }, path: string) => { stoneGroupId: number | null; finishKey: string },
    basePath = '',
): unknown {
    const image = (value: unknown, path: string) => {
        const ref = isPlainObject(value) ? value : null;
        return {
            mediaAssetId: ref ? media(path) : null,
            alt: ref && typeof ref.alt === 'string' ? ref.alt.trim() : '',
        };
    };
    const items = (prefix: string, map: (item: Record<string, unknown>, path: string) => unknown) =>
        Array.isArray(fields.items)
            ? fields.items.map((item, index) => (isPlainObject(item) ? map(item, `${prefix}.items[${index}]`) : item))
            : fields.items;

    switch (type) {
        case 'callout':
            return { ...fields, tone: fields.tone ?? 'neutral' };
        case 'image': {
            const { image: ref, ...rest } = fields;
            return { ...image(ref, `${basePath}.image`), ...rest };
        }
        case 'steps':
            return {
                ...fields,
                items: items(basePath, (item, path) => {
                    const { image: ref, ...rest } = item;
                    return ref === undefined || ref === null
                        ? { ...rest, mediaAssetId: null, alt: '' }
                        : { ...rest, ...image(ref, `${path}.image`) };
                }),
            };
        case 'gallery':
            return {
                ...fields,
                items: items(basePath, (item, path) => {
                    const { image: ref, caption } = item;
                    return { ...image(ref, `${path}.image`), ...(caption === undefined ? {} : { caption }) };
                }),
            };
        case 'stone_cards':
            return {
                ...fields,
                items: items(basePath, (item, path) => {
                    const rest = Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'stone' && key !== 'finish'));
                    const ref = stoneRef(
                        { stone: typeof item.stone === 'string' ? item.stone : '', finish: typeof item.finish === 'string' ? item.finish.trim() : '' },
                        path,
                    );
                    return { ...rest, stoneGroupId: ref.stoneGroupId, finishKey: ref.finishKey };
                }),
            };
        default:
            return { ...fields };
    }
}

/** Maps a schema issue path (`content.items[0].mediaAssetId`) back to the package field. */
function packagePath(blockPath: string, type: ContentBlockType, issuePath: string) {
    let path = issuePath.replace(/^content/, blockPath);
    if (type === 'image') path = path.replace(/\.mediaAssetId$/, '.image').replace(new RegExp(`^(${escape(blockPath)})\\.alt$`), '$1.image.alt');
    if (type === 'steps' || type === 'gallery') path = path.replace(/\.mediaAssetId$/, '.image').replace(/(\.items\[\d+\])\.alt$/, '$1.image.alt');
    if (type === 'stone_cards') path = path.replace(/\.stoneGroupId$/, '.stone').replace(/\.finishKey$/, '.finish');
    return path;
}

function escape(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function fieldLabel(issuePath: string) {
    const last = issuePath.replace(/^content\.?/, '').split('.').pop() ?? '';
    const name = last.replace(/\[\d+\]$/, '') || 'content';
    const words: Record<string, string> = { mediaAssetId: 'image', stoneGroupId: 'stone', finishKey: 'finish', youtubeUrl: 'YouTube link', href: 'link address' };
    return words[name] ?? name.replace(/([A-Z])/g, ' $1').toLowerCase();
}

function capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function unknownKeys(value: Record<string, unknown>, known: readonly string[], path: string, error: (path: string, message: string) => void) {
    for (const key of Object.keys(value)) {
        if (!known.includes(key)) error(path ? `${path}.${key}` : key, 'Is not part of the package format. Remove it.');
    }
}

function requiredText(value: unknown, path: string, limit: number, error: (path: string, message: string) => void): string | null {
    if (typeof value !== 'string' || !value.trim()) {
        error(path, 'Is required.');
        return null;
    }
    if (value.length > limit) {
        error(path, `Keep this under ${limit} characters.`);
        return null;
    }
    return value.trim();
}

function optionalText(value: unknown, path: string, limit: number, error: (path: string, message: string) => void): string | null {
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) return '';
    return requiredText(value, path, limit, error);
}

function isIsoDate(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export interface PackageCatalogue {
    stones: readonly { id: number; key: string; label: string; status: string }[];
    variants: readonly { id: number; stoneGroupId: number; status: string; sortOrder: number }[];
    finishes: readonly { id: number; key: string; label: string; status: string }[];
    capabilities: readonly { stoneVariantId: number; finishDefinitionId: number; capability: string }[];
}

function finishWords(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

/**
 * Stone and finish lookups over the Live Stone Library catalogue. Finishes match their key or
 * name, ignoring case, spaces and hyphens ("bush-hammered", "Bush Hammered" → bush_hammered).
 */
export function catalogueResolvers(catalogue: PackageCatalogue) {
    const stones = catalogue.stones.filter((stone) => stone.status === 'published');
    const finishes = catalogue.finishes.filter((finish) => finish.status === 'published');
    const resolveStone = (slug: string) => stones.find((stone) => stone.key === slug.trim().toLowerCase())?.id ?? null;
    const resolveFinish = (value: string): ResolvedFinish | null => {
        const words = finishWords(value);
        const finish = words ? finishes.find((entry) => finishWords(entry.key) === words || finishWords(entry.label) === words) : undefined;
        return finish ? { id: finish.id, key: finish.key } : null;
    };
    const resolveVariant = (stoneGroupId: number, finishDefinitionId: number | null) => {
        const variants = catalogue.variants
            .filter((variant) => variant.stoneGroupId === stoneGroupId && variant.status === 'published')
            .sort((left, right) => left.sortOrder - right.sortOrder);
        const offering = finishDefinitionId === null
            ? variants
            : variants.filter((variant) => catalogue.capabilities.some((capability) =>
                capability.stoneVariantId === variant.id
                && capability.finishDefinitionId === finishDefinitionId
                && capability.capability !== 'no'));
        return offering[0]?.id ?? null;
    };
    const stoneLabel = (slug: string) => stones.find((stone) => stone.key === slug.trim().toLowerCase())?.label ?? slug;
    const finishLabel = (value: string) => {
        const resolved = resolveFinish(value);
        return resolved ? finishes.find((finish) => finish.id === resolved.id)?.label ?? value : value;
    };
    return { resolveStone, resolveFinish, resolveVariant, stoneLabel, finishLabel };
}
