export type ArticleStatus = 'draft' | 'published' | 'archived';

export type ArticleListFilter = ArticleStatus | 'all';

export type ArticleBlockType =
    | 'rich_text'
    | 'image'
    | 'gallery'
    | 'quote'
    | 'faq'
    | 'cta'
    | 'project_spotlight'
    | 'stone_reference'
    | 'comparison_table'
    | 'proof_metric'
    | 'video_embed'
    | 'callout';

export interface ArticleRow {
    id: number;
    slug: string;
    title: string;
    status: ArticleStatus;
    published_on: string | null;
    author: string | null;
    excerpt: string | null;
    cover_media_id: number | null;
    tags: string[];
    seo: unknown;
    legacy_source_path: string | null;
    legacy_source_url: string | null;
    sort_order: number;
    published_at: string | null;
    archived_at: string | null;
    updated_at: string;
    created_at: string;
}

export interface ArticleBlockRow {
    id: number;
    article_id: number;
    block_type: ArticleBlockType;
    content: unknown;
    media_asset_id: number | null;
    linked_project_id: number | null;
    linked_stone_group_id: number | null;
    sort_order: number;
    status: ArticleStatus;
    published_at: string | null;
    archived_at: string | null;
    updated_at: string;
}

export interface ProjectOptionRow {
    id: number;
    slug: string;
    title: string;
    status: string;
}

export interface StoneOptionRow {
    id: number;
    stone_group_key: string;
    display_name: string;
    status: string;
}

export interface MediaOptionRow {
    id: number;
    alt: string | null;
    caption: string | null;
    object_path: string | null;
    source_url: string | null;
    media_type: string;
    status: string;
}

export interface ArticleFormState {
    status: ArticleStatus;
    slug: string;
    title: string;
    publishedOn: string;
    author: string;
    excerpt: string;
    coverMediaId: string;
    tagsText: string;
    seoBaseJson: string;
    seoTitle: string;
    seoDescription: string;
    legacySourcePath: string;
    legacySourceUrl: string;
    sortOrder: string;
}

export interface BlockFormState {
    status: ArticleStatus;
    blockType: ArticleBlockType;
    contentJson: string;
    mediaAssetId: string;
    linkedProjectId: string;
    linkedStoneGroupId: string;
    sortOrder: string;
}
