import { toSafePublicContentDestination } from '../../../lib/publicContentLink';
import { validatePublicEntitySeoDraft } from '../../../lib/publicEntitySeo';
import type {
    ArticleBlockRow,
    ArticleBlockType,
    ArticleFormState,
    ArticleRow,
    BlockFormState,
    MediaOptionRow,
} from './types';

export const emptyArticleForm: ArticleFormState = {
    status: 'draft',
    slug: '',
    title: '',
    publishedOn: '',
    author: '',
    excerpt: '',
    coverMediaId: '',
    tagsText: '',
    seoBaseJson: '{}',
    seoTitle: '',
    seoDescription: '',
    legacySourcePath: '',
    legacySourceUrl: '',
    sortOrder: '0',
};

export const emptyBlockForm: BlockFormState = {
    status: 'draft',
    blockType: 'rich_text',
    contentJson: JSON.stringify(defaultContentForBlockType('rich_text'), null, 2),
    mediaAssetId: '',
    linkedProjectId: '',
    linkedStoneGroupId: '',
    sortOrder: '0',
};

export const blockTypeOptions: Array<[string, string]> = [
    ['rich_text', 'Rich text'],
    ['image', 'Image'],
    ['gallery', 'Gallery'],
    ['quote', 'Quote'],
    ['faq', 'FAQ'],
    ['cta', 'CTA'],
    ['project_spotlight', 'Project spotlight'],
    ['stone_reference', 'Stone reference'],
    ['comparison_table', 'Comparison table'],
    ['proof_metric', 'Proof metric'],
    ['video_embed', 'Video embed'],
    ['callout', 'Callout'],
];

export const blockContentHints: Record<ArticleBlockType, string> = {
    rich_text: 'Normal article copy. Add one clear idea per section so the article can be rearranged later.',
    image: 'Pair a selected Media library item with caption and placement notes.',
    gallery: 'Use the selected media as the lead image, then describe the gallery sequence for review.',
    quote: 'A pull quote with optional attribution.',
    faq: 'Question and answer items for practical reader objections.',
    cta: 'A button-style reader action with label, link, and optional supporting copy.',
    project_spotlight: 'Choose a linked project and add why the project supports this article.',
    stone_reference: 'Choose a linked stone and add why the material matters here.',
    comparison_table: 'A table planning section. Add column labels and line notes in plain language.',
    proof_metric: 'A short metric or proof point with supporting note.',
    video_embed: 'Approved video URL and caption.',
    callout: 'A highlighted note with heading and body copy.',
};

export const fieldClass =
    'mt-2 min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium outline-none transition focus:border-black disabled:bg-black/[0.04] disabled:text-black/45';

export const statusOptions: Array<[string, string]> = [
    ['draft', 'Draft'],
    ['published', 'Published'],
    ['archived', 'Archived'],
];

export function findMediaOption(mediaOptions: MediaOptionRow[], value: string) {
    const mediaId = Number(value);
    if (!Number.isFinite(mediaId)) return null;
    return mediaOptions.find((media) => media.id === mediaId) ?? null;
}

export function getMediaUrl(asset: MediaOptionRow | null) {
    if (!asset) return null;
    return asset.source_url || asset.object_path;
}

export function formatMediaOption(media: MediaOptionRow) {
    const label = media.alt || media.caption || 'Untitled media';
    return `${label} - ${media.status === 'published' ? 'Published in Media' : 'Not published in Media'}`;
}

export function rowToArticleForm(row: ArticleRow | null): ArticleFormState {
    if (!row) return emptyArticleForm;
    const seo = objectRecord(row.seo);

    return {
        status: row.status,
        slug: row.slug,
        title: row.title,
        publishedOn: row.published_on ?? '',
        author: row.author ?? '',
        excerpt: row.excerpt ?? '',
        coverMediaId: row.cover_media_id === null ? '' : String(row.cover_media_id),
        tagsText: row.tags.join(', '),
        seoBaseJson: JSON.stringify(seo, null, 2),
        seoTitle: contentString(seo, 'title'),
        seoDescription: contentString(seo, 'description'),
        legacySourcePath: row.legacy_source_path ?? '',
        legacySourceUrl: row.legacy_source_url ?? '',
        sortOrder: String(row.sort_order),
    };
}

export function rowToBlockForm(row: ArticleBlockRow | null): BlockFormState {
    if (!row) return emptyBlockForm;

    return {
        status: row.status,
        blockType: row.block_type,
        contentJson: JSON.stringify(row.content ?? {}, null, 2),
        mediaAssetId: row.media_asset_id === null ? '' : String(row.media_asset_id),
        linkedProjectId: row.linked_project_id === null ? '' : String(row.linked_project_id),
        linkedStoneGroupId: row.linked_stone_group_id === null ? '' : String(row.linked_stone_group_id),
        sortOrder: String(row.sort_order),
    };
}

export function formatBlockTypeLabel(blockType: ArticleBlockType) {
    return blockTypeOptions.find(([value]) => value === blockType)?.[1] ?? blockType;
}

export function validateArticleForm(form: ArticleFormState) {
    if (!form.title.trim()) return validationFailure('Article title is required.');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
        return validationFailure('Website URL key must use lowercase words separated by hyphens.');
    }

    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    const coverMediaId = optionalPositiveInteger(form.coverMediaId, 'Cover image');
    if (sortOrder.error) return validationFailure(sortOrder.error);
    if (coverMediaId.error) return validationFailure(coverMediaId.error);

    const seo = parseContentRecord(form.seoBaseJson);
    const seoValidation = validatePublicEntitySeoDraft(form.seoTitle, form.seoDescription);
    if (seoValidation.error) return validationFailure(seoValidation.error);
    if (seoValidation.title) {
        seo.title = seoValidation.title;
    } else {
        delete seo.title;
    }
    if (seoValidation.description) {
        seo.description = seoValidation.description;
    } else {
        delete seo.description;
    }

    const tags = form.tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

    if (form.status === 'published') {
        if (!form.publishedOn) return validationFailure('Published articles require a published date.');
        if (!form.excerpt.trim()) return validationFailure('Published articles require an excerpt.');
    }

    return { error: null, sortOrder: sortOrder.value, coverMediaId: coverMediaId.value, seo, tags };
}

export function validateBlockForm(form: BlockFormState) {
    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    const mediaAssetId = optionalPositiveInteger(form.mediaAssetId, 'Section image');
    const linkedProjectId = optionalPositiveInteger(form.linkedProjectId, 'Linked project');
    const linkedStoneGroupId = optionalPositiveInteger(form.linkedStoneGroupId, 'Linked stone');
    if (sortOrder.error) return validationFailure(sortOrder.error);
    if (mediaAssetId.error) return validationFailure(mediaAssetId.error);
    if (linkedProjectId.error) return validationFailure(linkedProjectId.error);
    if (linkedStoneGroupId.error) return validationFailure(linkedStoneGroupId.error);

    let content: unknown = {};
    if (form.contentJson.trim()) {
        try {
            content = JSON.parse(form.contentJson);
        } catch {
            return validationFailure('Section content could not be read. Re-open the section and try again.');
        }
    }

    const contentRecord = objectRecord(content);
    const destinationKey = form.blockType === 'cta' ? 'href' : form.blockType === 'video_embed' ? 'url' : null;
    if (destinationKey && form.status === 'published') {
        const destination = toSafePublicContentDestination(contentString(contentRecord, destinationKey));
        if (!destination) {
            return validationFailure(
                `Published ${formatBlockTypeLabel(form.blockType)} sections need a root-relative site path or an http(s) URL.`,
            );
        }
        content = { ...contentRecord, [destinationKey]: destination.href };
    }

    if (form.status === 'published' && !hasPublishReadyBlockContent(form.blockType, content, mediaAssetId.value)) {
        return validationFailure(`Published ${formatBlockTypeLabel(form.blockType)} sections need editor content before they can go live.`);
    }

    return {
        error: null,
        sortOrder: sortOrder.value,
        mediaAssetId: mediaAssetId.value,
        linkedProjectId: linkedProjectId.value,
        linkedStoneGroupId: linkedStoneGroupId.value,
        content,
    };
}

export function validationFailure(error: string) {
    return { error };
}

export function requiredInteger(value: string, label: string): { error: string | null; value: number } {
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
        return { error: `${label} must be a whole number.`, value: 0 };
    }
    return { error: null, value: parsed };
}

export function optionalPositiveInteger(value: string, label: string): { error: string | null; value: number | null } {
    if (!value.trim()) return { error: null, value: null };
    return requiredPositiveInteger(value, label);
}

export function requiredPositiveInteger(value: string, label: string): { error: string | null; value: number } {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return { error: `${label} must be a whole positive number.`, value: 0 };
    }
    return { error: null, value: parsed };
}

export function isEmptyObject(value: unknown) {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        Object.keys(value as Record<string, unknown>).length === 0
    );
}

export function defaultContentForBlockType(blockType: ArticleBlockType): Record<string, unknown> {
    switch (blockType) {
        case 'rich_text':
            return { body: '' };
        case 'image':
            return { caption: '', layout: '' };
        case 'gallery':
            return { body: '', layout: '' };
        case 'quote':
            return { quote: '', attribution: '' };
        case 'faq':
            return { items: [] };
        case 'cta':
            return { label: '', href: '', body: '' };
        case 'project_spotlight':
        case 'stone_reference':
            return { body: '' };
        case 'comparison_table':
            return { heading: '', columnsText: '', rowsText: '' };
        case 'proof_metric':
            return { value: '', label: '', note: '' };
        case 'video_embed':
            return { url: '', caption: '' };
        case 'callout':
            return { heading: '', body: '' };
        default:
            return {};
    }
}

export function parseContentRecord(value: string): Record<string, unknown> {
    try {
        return objectRecord(JSON.parse(value || '{}'));
    } catch {
        return {};
    }
}

export function objectRecord(value: unknown): Record<string, unknown> {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }

    return {};
}

export function contentString(content: Record<string, unknown>, key: string) {
    const value = content[key];
    return typeof value === 'string' ? value : '';
}

export function faqItemsText(content: Record<string, unknown>) {
    const items = Array.isArray(content.items) ? content.items : [];
    return items
        .map((item) => {
            if (typeof item !== 'object' || item === null || Array.isArray(item)) return '';
            const record = item as Record<string, unknown>;
            const question = typeof record.question === 'string' ? record.question : '';
            const answer = typeof record.answer === 'string' ? record.answer : '';
            return [question, answer].filter(Boolean).join(' | ');
        })
        .filter(Boolean)
        .join('\n');
}

export function hasPublishReadyBlockContent(blockType: ArticleBlockType, content: unknown, mediaAssetId: number | null) {
    const record = objectRecord(content);
    const hasAnyText = Object.values(record).some((value) => {
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return false;
    });

    switch (blockType) {
        case 'image':
        case 'gallery':
            return mediaAssetId !== null || hasAnyText;
        case 'quote':
            return contentString(record, 'quote').trim().length > 0;
        case 'faq':
            return Array.isArray(record.items) && record.items.length > 0;
        case 'cta':
            return contentString(record, 'label').trim().length > 0 && Boolean(toSafePublicContentDestination(contentString(record, 'href')));
        case 'proof_metric':
            return contentString(record, 'value').trim().length > 0 && contentString(record, 'label').trim().length > 0;
        case 'video_embed':
            return Boolean(toSafePublicContentDestination(contentString(record, 'url')));
        default:
            return hasAnyText && !isEmptyObject(record);
    }
}

export function getArticlePublishChecklist(form: ArticleFormState, blocks: ArticleBlockRow[]) {
    const publishedBlocks = blocks.filter((block) => block.status === 'published');
    const readyPublishedBlocks = publishedBlocks.filter((block) =>
        hasPublishReadyBlockContent(block.block_type, block.content, block.media_asset_id),
    );

    return [
        {
            label: 'Article title',
            ready: Boolean(form.title.trim()),
            detail: form.title.trim()
                ? 'The public article title is filled in.'
                : 'Add the article title readers will see.',
        },
        {
            label: 'Website URL',
            ready: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim()),
            detail: 'Use lowercase words separated by hyphens, for example modular-mastery-primeblock.',
        },
        {
            label: 'Published date',
            ready: Boolean(form.publishedOn),
            detail: form.publishedOn
                ? 'The article has a publication date.'
                : 'Choose the date that should appear on the public article.',
        },
        {
            label: 'Excerpt',
            ready: Boolean(form.excerpt.trim()),
            detail: form.excerpt.trim()
                ? 'The article has summary copy for cards and search previews.'
                : 'Add a short excerpt before publishing.',
        },
        {
            label: 'Published article section',
            ready: publishedBlocks.length > 0,
            detail:
                publishedBlocks.length > 0
                    ? 'At least one article section is marked Published.'
                    : 'Publish at least one article section so the article body can appear.',
        },
        {
            label: 'Section content ready',
            ready: publishedBlocks.length > 0 && readyPublishedBlocks.length === publishedBlocks.length,
            detail:
                publishedBlocks.length > 0 && readyPublishedBlocks.length === publishedBlocks.length
                    ? 'Published sections have the required copy, links, or media.'
                    : 'Open each Published section and fill the required copy, link, or media field.',
        },
    ];
}

export function getArticleSectionPublishChecklist(form: BlockFormState) {
    const mediaAssetId = optionalPositiveInteger(form.mediaAssetId, 'Section image').value;
    const content = parseContentRecord(form.contentJson);
    const contentReady = hasPublishReadyBlockContent(form.blockType, content, mediaAssetId);

    return [
        {
            label: 'Section type',
            ready: Boolean(form.blockType),
            detail: 'Choose the kind of article section this content should become.',
        },
        {
            label: 'Section content',
            ready: contentReady,
            detail: contentReady
                ? 'This section has the required copy, link, or media for its type.'
                : 'Fill the required copy, link, or media field before publishing this section.',
        },
    ];
}

export function formatArticlePublishError(kind: 'article' | 'section', items: Array<{ label: string; ready: boolean; detail: string }>) {
    const firstMissing = items.find((item) => !item.ready);
    const lockedPrefix =
        kind === 'article'
            ? 'Publish is locked. Complete the Article publish checklist before publishing this article.'
            : 'Publish is locked. Fill the selected section content before publishing.';

    if (!firstMissing) {
        return lockedPrefix;
    }

    const ending =
        kind === 'article'
            ? 'The Article publish checklist shows what to fix before this article can appear on the website.'
            : 'The Section publish status shows what to fix before this section can appear on the website.';

    return `${lockedPrefix} Start with: ${firstMissing.label}. ${firstMissing.detail} ${ending}`;
}

export function summarizeArticles(articles: ArticleRow[]) {
    return articles.reduce(
        (summary, article) => ({
            draft: summary.draft + (article.status === 'draft' ? 1 : 0),
            published: summary.published + (article.status === 'published' ? 1 : 0),
            archived: summary.archived + (article.status === 'archived' ? 1 : 0),
        }),
        { draft: 0, published: 0, archived: 0 },
    );
}

export function compareArticleRows(left: ArticleRow, right: ArticleRow) {
    const leftPublishedAt = left.published_on ? new Date(left.published_on).getTime() : Number.NEGATIVE_INFINITY;
    const rightPublishedAt = right.published_on ? new Date(right.published_on).getTime() : Number.NEGATIVE_INFINITY;
    return rightPublishedAt - leftPublishedAt || left.sort_order - right.sort_order || left.title.localeCompare(right.title);
}

export function compareArticleBlockRows(left: ArticleBlockRow, right: ArticleBlockRow) {
    return left.sort_order - right.sort_order || left.id - right.id;
}
