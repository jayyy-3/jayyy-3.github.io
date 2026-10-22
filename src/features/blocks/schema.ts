// Shared content-block contract: the 14 semantic block types, their content schemas, limits,
// defaults and validation. Projects use it for the page body (Phase 1); Articles, the Claude
// Design import (Phase 2) and newsletter output (Phase 3) build on the same module.
//
// `functions/_lib/blocks.js` keeps an independent server copy of this validator. The shared
// fixture `tests/fixtures/content-blocks.json` proves both return identical issue lists, so
// change both files and the fixture together.

export const CONTENT_BLOCK_TYPES = [
    'heading',
    'text',
    'quote',
    'callout',
    'stats',
    'steps',
    'spec_table',
    'comparison_table',
    'stone_cards',
    'image',
    'gallery',
    'hotspot_image',
    'video',
    'cta',
] as const;

export type ContentBlockType = (typeof CONTENT_BLOCK_TYPES)[number];

export type ContentBlockGroup = 'narrative' | 'evidence' | 'media_action';

/** Character limits: titles 200, short sentences 400, body copy 5000. */
export const BLOCK_TEXT_LIMITS = { title: 200, short: 400, body: 5000 } as const;
export type BlockTextLimit = keyof typeof BLOCK_TEXT_LIMITS;

export const BLOCK_URL_LIMIT = 2048;

export type CalloutTone = 'neutral' | 'lime';

/**
 * How a body image is presented: `photo` (default when absent) or `drawing`, a drawing or
 * light-background document shown on a light surface with a hairline frame (2026-10-22).
 */
export const IMAGE_PRESENTATIONS = ['photo', 'drawing'] as const;
export type ImagePresentation = (typeof IMAGE_PRESENTATIONS)[number];

export interface HeadingContent {
    eyebrow?: string;
    title: string;
    intro?: string;
}

export interface TextContent {
    /** Restricted Markdown: paragraphs, **bold**, [links](url) and `- ` lists. No HTML. */
    body: string;
}

export interface QuoteContent {
    quote: string;
    attribution?: string;
    role?: string;
}

export interface CalloutContent {
    title?: string;
    body: string;
    tone: CalloutTone;
}

export interface StatItem {
    value: string;
    unit?: string;
    label: string;
}

export interface StatsContent {
    items: StatItem[];
    caption?: string;
}

export interface StepItem {
    title: string;
    body: string;
    mediaAssetId?: number | null;
    alt?: string;
}

export interface StepsContent {
    intro?: string;
    items: StepItem[];
}

export interface SpecRow {
    label: string;
    value: string;
}

export interface SpecTableContent {
    title?: string;
    rows: SpecRow[];
}

export interface ComparisonRow {
    label: string;
    cells: string[];
}

export interface ComparisonTableContent {
    title?: string;
    columns: string[];
    rows: ComparisonRow[];
}

export interface StoneCardItem {
    /** Stone Library stone (`stone_groups.id`). */
    stoneGroupId: number | null;
    finishKey?: string;
    note?: string;
}

export interface StoneCardsContent {
    title?: string;
    items: StoneCardItem[];
}

/** Provenance of a block copied from a `project_media` row by the 2026-10-14 migration. */
interface LegacyProvenance {
    legacyProjectMediaId?: number;
}

export interface ImageContent extends LegacyProvenance {
    mediaAssetId: number | null;
    alt: string;
    caption?: string;
    label?: string;
    /** Carried from the former media block title; not rendered on plain images. */
    title?: string;
    /** Optional; absent means `photo`. */
    presentation?: ImagePresentation;
}

export interface GalleryItem {
    mediaAssetId: number | null;
    alt: string;
    caption?: string;
}

export interface GalleryContent {
    items: GalleryItem[];
}

export interface HotspotImageContent extends LegacyProvenance {
    /** Draft key of the hidden material map that carries the image and its points. */
    projectMaterialMapKey: string | null;
    label?: string;
    caption?: string;
    /** Title above the image (former media block title). */
    title?: string;
}

export interface VideoContent extends LegacyProvenance {
    youtubeUrl: string;
    label?: string;
    caption?: string;
    title?: string;
}

export interface CtaLink {
    label: string;
    href: string;
}

export interface CtaContent {
    title: string;
    body?: string;
    primary: CtaLink;
    secondary?: CtaLink | null;
}

export interface ContentBlockContentByType {
    heading: HeadingContent;
    text: TextContent;
    quote: QuoteContent;
    callout: CalloutContent;
    stats: StatsContent;
    steps: StepsContent;
    spec_table: SpecTableContent;
    comparison_table: ComparisonTableContent;
    stone_cards: StoneCardsContent;
    image: ImageContent;
    gallery: GalleryContent;
    hotspot_image: HotspotImageContent;
    video: VideoContent;
    cta: CtaContent;
}

export type ContentBlockContent = ContentBlockContentByType[ContentBlockType];

/** A block as stored in a draft or import: stable key, optional row id, type and content. */
export type ContentBlock<T extends ContentBlockType = ContentBlockType> = {
    [K in T]: {
        key: string;
        id: number | null;
        type: K;
        content: ContentBlockContentByType[K];
        sortOrder: number;
    };
}[T];

export const CONTENT_BLOCK_LIMITS = {
    stats: { min: 1, max: 4 },
    steps: { min: 1, max: 8 },
    spec_table: { min: 1, max: 12 },
    comparisonColumns: { min: 2, max: 4 },
    comparisonRows: { min: 1, max: 20 },
    stone_cards: { min: 1, max: 6 },
    gallery: { min: 2, max: 12 },
} as const;

export interface ContentBlockDefinition {
    type: ContentBlockType;
    group: ContentBlockGroup;
    label: string;
    description: string;
}

/** Editor-facing names and one-line help, in Add-block panel order. */
export const CONTENT_BLOCK_DEFINITIONS: readonly ContentBlockDefinition[] = [
    { type: 'heading', group: 'narrative', label: 'Heading', description: 'A section title with an optional small label and introduction.' },
    { type: 'text', group: 'narrative', label: 'Text', description: 'Paragraphs with bold, links and simple lists.' },
    { type: 'quote', group: 'narrative', label: 'Quote', description: 'A short quote from a client, designer or builder.' },
    { type: 'callout', group: 'narrative', label: 'Callout', description: 'A highlighted note that should not be missed.' },
    { type: 'stats', group: 'evidence', label: 'Key numbers', description: 'One to four figures such as area, tonnes or weeks.' },
    { type: 'steps', group: 'evidence', label: 'Steps', description: 'A numbered process, each step with an optional image.' },
    { type: 'spec_table', group: 'evidence', label: 'Specification table', description: 'Label and value rows, such as finish, thickness or supply.' },
    { type: 'comparison_table', group: 'evidence', label: 'Comparison table', description: 'Two to four columns compared row by row.' },
    { type: 'stone_cards', group: 'evidence', label: 'Stone cards', description: 'Stones from the Stone Library with their photo and finish.' },
    { type: 'image', group: 'media_action', label: 'Image', description: 'One photo or drawing, shown to suit its shape. Materials can be marked on it.' },
    { type: 'gallery', group: 'media_action', label: 'Gallery', description: 'Two to twelve images in an even grid.' },
    { type: 'hotspot_image', group: 'media_action', label: 'Image with material points', description: 'A full-width image with stone points visitors can open.' },
    { type: 'video', group: 'media_action', label: 'Video', description: 'A YouTube video.' },
    { type: 'cta', group: 'media_action', label: 'Call to action', description: 'A short prompt with one or two buttons.' },
];

export const CONTENT_BLOCK_GROUP_LABELS: Record<ContentBlockGroup, string> = {
    narrative: 'Narrative',
    evidence: 'Evidence',
    media_action: 'Media and action',
};

export function isContentBlockType(value: unknown): value is ContentBlockType {
    return typeof value === 'string' && (CONTENT_BLOCK_TYPES as readonly string[]).includes(value);
}

export function contentBlockDefinition(type: ContentBlockType): ContentBlockDefinition {
    return CONTENT_BLOCK_DEFINITIONS.find((definition) => definition.type === type) as ContentBlockDefinition;
}

export function createDefaultBlockContent<T extends ContentBlockType>(type: T): ContentBlockContentByType[T] {
    const defaults: ContentBlockContentByType = {
        heading: { eyebrow: '', title: '', intro: '' },
        text: { body: '' },
        quote: { quote: '', attribution: '', role: '' },
        callout: { title: '', body: '', tone: 'neutral' },
        stats: { items: [{ value: '', unit: '', label: '' }], caption: '' },
        steps: { intro: '', items: [{ title: '', body: '', mediaAssetId: null, alt: '' }] },
        spec_table: { title: '', rows: [{ label: '', value: '' }] },
        comparison_table: {
            title: '',
            columns: ['', ''],
            rows: [{ label: '', cells: ['', ''] }],
        },
        stone_cards: { title: '', items: [{ stoneGroupId: null, finishKey: '', note: '' }] },
        image: { mediaAssetId: null, alt: '', caption: '', label: '', title: '' },
        gallery: {
            items: [
                { mediaAssetId: null, alt: '', caption: '' },
                { mediaAssetId: null, alt: '', caption: '' },
            ],
        },
        hotspot_image: { projectMaterialMapKey: null, label: '', caption: '', title: '' },
        video: { youtubeUrl: '', label: '', caption: '', title: '' },
        cta: {
            title: '',
            body: '',
            primary: { label: 'Discuss a project', href: '/contact' },
            secondary: null,
        },
    };
    return structuredClone(defaults[type]);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export type BlockValidationMode = 'draft' | 'publish';

export type BlockIssueCode =
    | 'invalid_type'
    | 'invalid_value'
    | 'unknown_field'
    | 'required'
    | 'too_long'
    | 'too_few'
    | 'too_many';

export interface BlockIssue {
    path: string;
    code: BlockIssueCode;
}

type FieldSpec =
    | { kind: 'text'; limit: BlockTextLimit; required?: boolean }
    | { kind: 'id'; required?: boolean }
    | { kind: 'legacy_id' }
    | { kind: 'key'; required?: boolean }
    | { kind: 'enum'; values: readonly string[]; optional?: boolean }
    | { kind: 'youtube' }
    | { kind: 'link'; optional?: boolean }
    | { kind: 'strings'; limit: BlockTextLimit; min: number; max: number }
    | { kind: 'items'; fields: Record<string, FieldSpec>; min: number; max: number };

const t = (limit: BlockTextLimit, required = false): FieldSpec => ({ kind: 'text', limit, required });

/** Field order is the issue order; both validators must declare the same order. */
const BLOCK_SPECS: Record<ContentBlockType, Record<string, FieldSpec>> = {
    heading: { eyebrow: t('title'), title: t('title', true), intro: t('short') },
    text: { body: t('body', true) },
    quote: { quote: t('short', true), attribution: t('title'), role: t('title') },
    callout: { title: t('title'), body: t('short', true), tone: { kind: 'enum', values: ['neutral', 'lime'] } },
    stats: {
        items: {
            kind: 'items',
            min: CONTENT_BLOCK_LIMITS.stats.min,
            max: CONTENT_BLOCK_LIMITS.stats.max,
            fields: { value: t('title', true), unit: t('title'), label: t('short', true) },
        },
        caption: t('short'),
    },
    steps: {
        intro: t('short'),
        items: {
            kind: 'items',
            min: CONTENT_BLOCK_LIMITS.steps.min,
            max: CONTENT_BLOCK_LIMITS.steps.max,
            fields: { title: t('title', true), body: t('body', true), mediaAssetId: { kind: 'id' }, alt: t('short') },
        },
    },
    spec_table: {
        title: t('title'),
        rows: {
            kind: 'items',
            min: CONTENT_BLOCK_LIMITS.spec_table.min,
            max: CONTENT_BLOCK_LIMITS.spec_table.max,
            fields: { label: t('title', true), value: t('short', true) },
        },
    },
    comparison_table: {
        title: t('title'),
        columns: {
            kind: 'strings',
            limit: 'title',
            min: CONTENT_BLOCK_LIMITS.comparisonColumns.min,
            max: CONTENT_BLOCK_LIMITS.comparisonColumns.max,
        },
        rows: {
            kind: 'items',
            min: CONTENT_BLOCK_LIMITS.comparisonRows.min,
            max: CONTENT_BLOCK_LIMITS.comparisonRows.max,
            fields: {
                label: t('title', true),
                cells: { kind: 'strings', limit: 'short', min: 0, max: CONTENT_BLOCK_LIMITS.comparisonColumns.max },
            },
        },
    },
    stone_cards: {
        title: t('title'),
        items: {
            kind: 'items',
            min: CONTENT_BLOCK_LIMITS.stone_cards.min,
            max: CONTENT_BLOCK_LIMITS.stone_cards.max,
            fields: { stoneGroupId: { kind: 'id', required: true }, finishKey: t('title'), note: t('short') },
        },
    },
    image: {
        mediaAssetId: { kind: 'id', required: true },
        alt: t('short', true),
        caption: t('short'),
        label: t('title'),
        title: t('title'),
        presentation: { kind: 'enum', values: IMAGE_PRESENTATIONS, optional: true },
        legacyProjectMediaId: { kind: 'legacy_id' },
    },
    gallery: {
        items: {
            kind: 'items',
            min: CONTENT_BLOCK_LIMITS.gallery.min,
            max: CONTENT_BLOCK_LIMITS.gallery.max,
            fields: { mediaAssetId: { kind: 'id', required: true }, alt: t('short', true), caption: t('short') },
        },
    },
    hotspot_image: {
        projectMaterialMapKey: { kind: 'key', required: true },
        label: t('title'),
        caption: t('short'),
        title: t('title'),
        legacyProjectMediaId: { kind: 'legacy_id' },
    },
    video: {
        youtubeUrl: { kind: 'youtube' },
        label: t('title'),
        caption: t('short'),
        title: t('title'),
        legacyProjectMediaId: { kind: 'legacy_id' },
    },
    cta: {
        title: t('title', true),
        body: t('short'),
        primary: { kind: 'link' },
        secondary: { kind: 'link', optional: true },
    },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPositiveId(value: unknown): value is number {
    return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function hasUnsafeLinkCharacter(value: string) {
    for (const character of value) {
        const codePoint = character.codePointAt(0) ?? 0;
        if (character === '\\' || codePoint <= 31 || (codePoint >= 127 && codePoint <= 159)) return true;
    }
    return false;
}

/**
 * A public destination: a root-relative site path (not `//`) or an `http:`/`https:` URL.
 * Mirrors `toSafePublicContentDestination`, which the renderer applies again.
 */
export function isSafeBlockHref(value: string): boolean {
    const normalized = value.trim();
    if (!normalized || normalized.length > BLOCK_URL_LIMIT || hasUnsafeLinkCharacter(value)) return false;
    let decoded: string;
    try {
        decoded = decodeURIComponent(normalized);
    } catch {
        return false;
    }
    if (hasUnsafeLinkCharacter(decoded)) return false;
    if (normalized.startsWith('/')) return !normalized.startsWith('//') && !decoded.startsWith('//');
    try {
        const url = new URL(normalized);
        return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
        return false;
    }
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,}$/;
const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'];

/** Returns the YouTube video ID for an ID or an https YouTube URL, otherwise null. */
export function normalizeYouTubeId(value: unknown): string | null {
    const source = typeof value === 'string' ? value.trim() : '';
    if (!source) return null;
    if (YOUTUBE_ID.test(source)) return source;
    try {
        const url = new URL(source);
        if (url.protocol !== 'https:' || url.username || url.password) return null;
        let id: string | null = null;
        if (url.hostname === 'youtu.be') {
            id = url.pathname.split('/').filter(Boolean)[0] || null;
        } else if (YOUTUBE_HOSTS.includes(url.hostname)) {
            id = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop() || null;
        }
        return id && YOUTUBE_ID.test(id) ? id : null;
    } catch {
        return null;
    }
}

function validateText(value: unknown, spec: { limit: BlockTextLimit; required?: boolean }, path: string, mode: BlockValidationMode, issues: BlockIssue[]) {
    if (value === undefined) {
        if (spec.required && mode === 'publish') issues.push({ path, code: 'required' });
        return;
    }
    if (typeof value !== 'string') {
        issues.push({ path, code: 'invalid_type' });
        return;
    }
    if (value.length > BLOCK_TEXT_LIMITS[spec.limit]) issues.push({ path, code: 'too_long' });
    else if (spec.required && mode === 'publish' && !value.trim()) issues.push({ path, code: 'required' });
}

function validateField(value: unknown, spec: FieldSpec, path: string, mode: BlockValidationMode, issues: BlockIssue[]) {
    switch (spec.kind) {
        case 'text':
            validateText(value, spec, path, mode, issues);
            return;
        case 'id':
            if (value === undefined || value === null) {
                if (spec.required && mode === 'publish') issues.push({ path, code: 'required' });
            } else if (!isPositiveId(value)) {
                issues.push({ path, code: 'invalid_type' });
            }
            return;
        case 'legacy_id':
            if (value !== undefined && !isPositiveId(value)) issues.push({ path, code: 'invalid_type' });
            return;
        case 'key':
            if (value === undefined || value === null) {
                if (spec.required && mode === 'publish') issues.push({ path, code: 'required' });
            } else if (typeof value !== 'string') {
                issues.push({ path, code: 'invalid_type' });
            } else if (value.length > BLOCK_TEXT_LIMITS.title) {
                issues.push({ path, code: 'too_long' });
            } else if (!value.trim()) {
                issues.push({ path, code: 'invalid_value' });
            }
            return;
        case 'enum':
            if (value === undefined && spec.optional) return;
            if (typeof value !== 'string') issues.push({ path, code: 'invalid_type' });
            else if (!spec.values.includes(value)) issues.push({ path, code: 'invalid_value' });
            return;
        case 'youtube':
            if (value === undefined) {
                if (mode === 'publish') issues.push({ path, code: 'required' });
            } else if (typeof value !== 'string') {
                issues.push({ path, code: 'invalid_type' });
            } else if (value.length > BLOCK_TEXT_LIMITS.short) {
                issues.push({ path, code: 'too_long' });
            } else if (mode === 'publish') {
                if (!value.trim()) issues.push({ path, code: 'required' });
                else if (!normalizeYouTubeId(value)) issues.push({ path, code: 'invalid_value' });
            }
            return;
        case 'link': {
            if (value === undefined || value === null) {
                if (!spec.optional && mode === 'publish') issues.push({ path, code: 'required' });
                return;
            }
            if (!isPlainObject(value)) {
                issues.push({ path, code: 'invalid_type' });
                return;
            }
            pushUnknownFields(value, ['label', 'href'], path, issues);
            const before = issues.length;
            validateText(value.label, { limit: 'title' }, `${path}.label`, mode, issues);
            if (value.href !== undefined && typeof value.href !== 'string') {
                issues.push({ path: `${path}.href`, code: 'invalid_type' });
            } else if (typeof value.href === 'string' && value.href.length > BLOCK_URL_LIMIT) {
                issues.push({ path: `${path}.href`, code: 'too_long' });
            }
            if (mode !== 'publish' || issues.length !== before) return;
            const label = typeof value.label === 'string' ? value.label.trim() : '';
            const href = typeof value.href === 'string' ? value.href.trim() : '';
            // An optional link left completely empty is simply absent.
            if (spec.optional && !label && !href) return;
            if (!label) issues.push({ path: `${path}.label`, code: 'required' });
            if (!href) issues.push({ path: `${path}.href`, code: 'required' });
            else if (!isSafeBlockHref(href)) issues.push({ path: `${path}.href`, code: 'invalid_value' });
            return;
        }
        case 'strings': {
            if (value === undefined) {
                if (spec.min > 0 && mode === 'publish') issues.push({ path, code: 'too_few' });
                return;
            }
            if (!Array.isArray(value)) {
                issues.push({ path, code: 'invalid_type' });
                return;
            }
            if (value.length > spec.max) {
                issues.push({ path, code: 'too_many' });
                return;
            }
            if (mode === 'publish' && value.length < spec.min) issues.push({ path, code: 'too_few' });
            value.forEach((entry, index) =>
                validateText(entry, { limit: spec.limit, required: spec.min > 0 }, `${path}[${index}]`, mode, issues));
            return;
        }
        case 'items': {
            if (value === undefined) {
                if (mode === 'publish') issues.push({ path, code: 'too_few' });
                return;
            }
            if (!Array.isArray(value)) {
                issues.push({ path, code: 'invalid_type' });
                return;
            }
            if (value.length > spec.max) {
                issues.push({ path, code: 'too_many' });
                return;
            }
            if (mode === 'publish' && value.length < spec.min) issues.push({ path, code: 'too_few' });
            value.forEach((entry, index) => validateObject(entry, spec.fields, `${path}[${index}]`, mode, issues));
            return;
        }
    }
}

function pushUnknownFields(value: Record<string, unknown>, known: readonly string[], path: string, issues: BlockIssue[]) {
    for (const key of Object.keys(value).sort()) {
        if (!known.includes(key)) issues.push({ path: `${path}.${key}`, code: 'unknown_field' });
    }
}

function validateObject(value: unknown, fields: Record<string, FieldSpec>, path: string, mode: BlockValidationMode, issues: BlockIssue[]) {
    if (!isPlainObject(value)) {
        issues.push({ path, code: 'invalid_type' });
        return;
    }
    pushUnknownFields(value, Object.keys(fields), path, issues);
    for (const [name, spec] of Object.entries(fields)) {
        validateField(value[name], spec, `${path}.${name}`, mode, issues);
    }
}

/**
 * Validates one block's type and content. `draft` checks structure and limits so incomplete
 * work can be saved; `publish` additionally requires every field a visitor would see.
 */
export function validateContentBlock(
    block: { type: unknown; content: unknown },
    mode: BlockValidationMode,
): BlockIssue[] {
    if (!isContentBlockType(block.type)) return [{ path: 'type', code: 'invalid_value' }];
    const issues: BlockIssue[] = [];
    validateObject(block.content, BLOCK_SPECS[block.type], 'content', mode, issues);
    if (issues.length || mode !== 'publish') return issues;

    // Cross-field rules that only apply once the structure is valid.
    if (block.type === 'comparison_table') {
        const content = block.content as ComparisonTableContent;
        content.rows.forEach((row, index) => {
            if (row.cells.length !== content.columns.length) {
                issues.push({ path: `content.rows[${index}].cells`, code: 'invalid_value' });
            }
        });
    }
    if (block.type === 'steps') {
        (block.content as StepsContent).items.forEach((item, index) => {
            if (isPositiveId(item.mediaAssetId) && !(item.alt ?? '').trim()) {
                issues.push({ path: `content.items[${index}].alt`, code: 'required' });
            }
        });
    }
    return issues;
}

/** All media asset IDs a block's content references, in content order. */
export function blockMediaAssetIds(block: { type: ContentBlockType; content: unknown }): number[] {
    const content = isPlainObject(block.content) ? block.content : {};
    const ids: number[] = [];
    const add = (value: unknown) => {
        if (isPositiveId(value) && !ids.includes(value)) ids.push(value);
    };
    if (block.type === 'image') add(content.mediaAssetId);
    if ((block.type === 'gallery' || block.type === 'steps') && Array.isArray(content.items)) {
        for (const item of content.items) if (isPlainObject(item)) add(item.mediaAssetId);
    }
    return ids;
}

/** Stone Library stone IDs referenced by a `stone_cards` block. */
export function blockStoneGroupIds(block: { type: ContentBlockType; content: unknown }): number[] {
    if (block.type !== 'stone_cards' || !isPlainObject(block.content) || !Array.isArray(block.content.items)) return [];
    const ids: number[] = [];
    for (const item of block.content.items) {
        if (isPlainObject(item) && isPositiveId(item.stoneGroupId) && !ids.includes(item.stoneGroupId)) ids.push(item.stoneGroupId);
    }
    return ids;
}

/** One plain-language line describing a block, used for collapsed editor cards. */
export function summarizeContentBlock(block: { type: ContentBlockType; content: unknown }): string {
    const content = (isPlainObject(block.content) ? block.content : {}) as Record<string, unknown>;
    const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
    const first = (...values: unknown[]) => values.map(text).find(Boolean) ?? '';
    const items = Array.isArray(content.items) ? content.items : [];
    const count = (n: number, noun: string) => `${n} ${noun}${n === 1 ? '' : 's'}`;
    switch (block.type) {
        case 'heading':
        case 'callout':
        case 'cta':
            return first(content.title, content.body);
        case 'text':
            return text(content.body).split('\n')[0] ?? '';
        case 'quote':
            return text(content.quote);
        case 'stats':
            return items.map((item) => (isPlainObject(item) ? [text(item.value), text(item.unit)].filter(Boolean).join(' ') : '')).filter(Boolean).join(' · ');
        case 'steps':
            return items.length ? count(items.length, 'step') : '';
        case 'spec_table':
            return first(content.title) || (Array.isArray(content.rows) ? count(content.rows.length, 'row') : '');
        case 'comparison_table':
            return first(content.title) || (Array.isArray(content.columns) ? count(content.columns.length, 'column') : '');
        case 'stone_cards':
            return first(content.title) || count(items.length, 'stone');
        case 'gallery':
            return count(items.length, 'image');
        case 'image':
        case 'hotspot_image':
        case 'video':
            return first(content.title, content.label, content.caption);
    }
}
