// Turns a stored block (type + content) into its public view model. Callers supply how media
// IDs become public URLs and how Stone Library IDs become stone keys, so the same mapping
// serves the public reader (`ProjectService`) and the admin preview (`draftToProjectData`).
// `hotspot_image` needs the project's material maps and points and is resolved by the caller.
import { toSafePublicContentDestination } from '../../lib/publicContentLink.ts';
import { normalizeYouTubeId, type ContentBlockContentByType, type ContentBlockType } from './schema.ts';
import type { BlockImageView, BlockLinkView, ContentBlockView } from './view.ts';

export interface BlockResolveContext {
    /** Fallback text for images without any description (usually the project title). */
    fallbackAlt: string;
    mediaUrl: (mediaAssetId: number | null | undefined) => string;
    /** The media item's own description, or an empty string. */
    mediaAlt: (mediaAssetId: number | null | undefined) => string;
    /** Stone Library key for a stone ID, or null when it is not available. */
    stoneKey: (stoneGroupId: number) => string | null;
}

function clean(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function optional(value: unknown): string | undefined {
    return clean(value) || undefined;
}

function image(
    mediaAssetId: number | null | undefined,
    alt: unknown,
    context: BlockResolveContext,
    fallback: string,
): BlockImageView | null {
    const src = context.mediaUrl(mediaAssetId);
    if (!src) return null;
    return { src, alt: clean(alt) || context.mediaAlt(mediaAssetId) || fallback };
}

function link(value: { label?: unknown; href?: unknown } | null | undefined): BlockLinkView | undefined {
    const label = clean(value?.label);
    const destination = toSafePublicContentDestination(value?.href);
    return label && destination ? { label, href: destination.href } : undefined;
}

type Resolvable = Exclude<ContentBlockType, 'hotspot_image'>;

/** Returns the public view, or null when nothing visible remains (for example no image). */
export function resolveBlockView(
    block: { type: ContentBlockType; content: unknown },
    id: string,
    context: BlockResolveContext,
): ContentBlockView | null {
    if (block.type === 'hotspot_image' || typeof block.content !== 'object' || block.content === null) return null;
    const type = block.type as Resolvable;
    switch (type) {
        case 'heading': {
            const content = block.content as ContentBlockContentByType['heading'];
            const title = clean(content.title);
            return title ? { id, type, title, eyebrow: optional(content.eyebrow), intro: optional(content.intro) } : null;
        }
        case 'text': {
            const body = clean((block.content as ContentBlockContentByType['text']).body);
            return body ? { id, type, body } : null;
        }
        case 'quote': {
            const content = block.content as ContentBlockContentByType['quote'];
            const quote = clean(content.quote);
            return quote ? { id, type, quote, attribution: optional(content.attribution), role: optional(content.role) } : null;
        }
        case 'callout': {
            const content = block.content as ContentBlockContentByType['callout'];
            const body = clean(content.body);
            return body ? { id, type, body, title: optional(content.title), tone: content.tone === 'lime' ? 'lime' : 'neutral' } : null;
        }
        case 'stats': {
            const content = block.content as ContentBlockContentByType['stats'];
            const items = (content.items ?? [])
                .map((item) => ({ value: clean(item.value), unit: optional(item.unit), label: clean(item.label) }))
                .filter((item) => item.value && item.label);
            return items.length ? { id, type, items, caption: optional(content.caption) } : null;
        }
        case 'steps': {
            const content = block.content as ContentBlockContentByType['steps'];
            const items = (content.items ?? []).flatMap((item) => {
                const title = clean(item.title);
                if (!title) return [];
                const picture = item.mediaAssetId ? image(item.mediaAssetId, item.alt, context, title) : null;
                return [{ title, body: clean(item.body), ...(picture ? { image: picture } : {}) }];
            });
            return items.length ? { id, type, items, intro: optional(content.intro) } : null;
        }
        case 'spec_table': {
            const content = block.content as ContentBlockContentByType['spec_table'];
            const rows = (content.rows ?? [])
                .map((row) => ({ label: clean(row.label), value: clean(row.value) }))
                .filter((row) => row.label && row.value);
            return rows.length ? { id, type, rows, title: optional(content.title) } : null;
        }
        case 'comparison_table': {
            const content = block.content as ContentBlockContentByType['comparison_table'];
            const columns = (content.columns ?? []).map(clean);
            const rows = (content.rows ?? [])
                .map((row) => ({
                    label: clean(row.label),
                    cells: columns.map((_, index) => clean(row.cells?.[index])),
                }))
                .filter((row) => row.label);
            return columns.length >= 2 && rows.length ? { id, type, columns, rows, title: optional(content.title) } : null;
        }
        case 'stone_cards': {
            const content = block.content as ContentBlockContentByType['stone_cards'];
            const items = (content.items ?? []).map((item) => ({
                stoneGroupId: item.stoneGroupId ? context.stoneKey(item.stoneGroupId) : null,
                finishKey: optional(item.finishKey),
                note: optional(item.note),
            }));
            return items.length ? { id, type, items, title: optional(content.title) } : null;
        }
        case 'image': {
            const content = block.content as ContentBlockContentByType['image'];
            const picture = image(content.mediaAssetId, content.alt, context, clean(content.label) || context.fallbackAlt);
            if (!picture) return null;
            return {
                id,
                type,
                src: picture.src,
                alt: picture.alt,
                title: optional(content.title),
                label: optional(content.label),
                caption: optional(content.caption),
            };
        }
        case 'gallery': {
            const content = block.content as ContentBlockContentByType['gallery'];
            const items = (content.items ?? []).flatMap((item, index) => {
                const picture = image(item.mediaAssetId, item.alt, context, `${context.fallbackAlt} image ${index + 1}`);
                return picture ? [{ ...picture, caption: optional(item.caption) }] : [];
            });
            return items.length ? { id, type, items } : null;
        }
        case 'video': {
            const content = block.content as ContentBlockContentByType['video'];
            const youtubeId = normalizeYouTubeId(content.youtubeUrl);
            if (!youtubeId) return null;
            return {
                id,
                type,
                youtubeId,
                title: clean(content.title) || clean(content.label) || 'Project video',
                caption: optional(content.caption),
            };
        }
        case 'cta': {
            const content = block.content as ContentBlockContentByType['cta'];
            const title = clean(content.title);
            if (!title) return null;
            return {
                id,
                type,
                title,
                body: optional(content.body),
                primary: link(content.primary),
                secondary: link(content.secondary),
            };
        }
    }
}
