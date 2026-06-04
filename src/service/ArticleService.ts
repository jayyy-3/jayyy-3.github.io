import { getPublicContentClient } from '../lib/publicContentClient.ts';
import type { ArticleMeta } from '../types/article.ts';

export type PublicArticleBlockType =
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

type ArticleRow = {
  id?: number;
  slug: string;
  title: string;
  published_on: string | null;
  author: string | null;
  excerpt: string | null;
  tags: string[] | null;
  legacy_source_path: string | null;
  cover_media?: { source_url: string | null } | { source_url: string | null }[] | null;
};

export interface PublicArticleBlock {
  id: number;
  blockType: PublicArticleBlockType;
  content: Record<string, unknown>;
  media?: {
    sourceUrl?: string;
    alt?: string;
    caption?: string;
    mediaType?: string;
  };
  linkedProjectSlug?: string;
  linkedProjectTitle?: string;
  linkedStoneKey?: string;
  linkedStoneName?: string;
}

export interface ArticleBody {
  kind: 'structured' | 'legacy';
  legacySourceSlug?: string;
  blocks?: PublicArticleBlock[];
}

type ArticleBodyRow = ArticleRow & { id: number };

type ArticleBlockRow = {
  id: number;
  block_type: PublicArticleBlockType;
  content: unknown;
  sort_order: number;
  media_asset?: {
    source_url: string | null;
    object_path: string | null;
    alt: string | null;
    caption: string | null;
    media_type: string | null;
  } | {
    source_url: string | null;
    object_path: string | null;
    alt: string | null;
    caption: string | null;
    media_type: string | null;
  }[] | null;
  linked_project?: { slug: string; title: string } | { slug: string; title: string }[] | null;
  linked_stone_group?: { stone_group_key: string; display_name: string } | { stone_group_key: string; display_name: string }[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function objectRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function sourceSlugFromPath(path: string | null): string | undefined {
  const match = path?.match(/^\/?articles\/([^/]+)\/content\.html$/);
  return match?.[1];
}

function mapArticle(row: ArticleRow): ArticleMeta {
  return {
    slug: row.slug,
    sourceSlug: sourceSlugFromPath(row.legacy_source_path),
    title: row.title,
    date: row.published_on || '',
    author: row.author || undefined,
    cover: firstRelation(row.cover_media)?.source_url || undefined,
    excerpt: row.excerpt || undefined,
    tags: row.tags ?? undefined,
  };
}

function mapArticleBlock(row: ArticleBlockRow): PublicArticleBlock {
  const media = firstRelation(row.media_asset);
  const project = firstRelation(row.linked_project);
  const stone = firstRelation(row.linked_stone_group);
  const mediaSource = media?.source_url || media?.object_path || undefined;

  return {
    id: row.id,
    blockType: row.block_type,
    content: objectRecord(row.content),
    media: media
      ? {
          sourceUrl: mediaSource,
          alt: media.alt || undefined,
          caption: media.caption || undefined,
          mediaType: media.media_type || undefined,
        }
      : undefined,
    linkedProjectSlug: project?.slug,
    linkedProjectTitle: project?.title,
    linkedStoneKey: stone?.stone_group_key,
    linkedStoneName: stone?.display_name,
  };
}

async function getStaticArticles(): Promise<ArticleMeta[]> {
  const response = await fetch(import.meta.env.BASE_URL + 'articles/index.json');
  if (!response.ok) {
    throw new Error(`Article index returned ${response.status}`);
  }
  return response.json() as Promise<ArticleMeta[]>;
}

async function getPublishedArticles(): Promise<ArticleMeta[]> {
  const supabase = getPublicContentClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('articles')
    .select(`
      slug,
      title,
      published_on,
      author,
      excerpt,
      tags,
      legacy_source_path,
      cover_media:media_assets!articles_cover_media_id_fkey (
        source_url
      )
    `)
    .eq('status', 'published')
    .order('published_on', { ascending: false });

  if (error || !data?.length) return [];
  return (data as unknown as ArticleRow[]).map(mapArticle);
}

async function getPublishedArticleBody(slug: string): Promise<ArticleBody | null> {
  const supabase = getPublicContentClient();
  if (!supabase) return null;

  const { data: article, error: articleError } = await supabase
    .from('articles')
    .select('id,slug,title,published_on,author,excerpt,tags,legacy_source_path')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle<ArticleBodyRow>();

  if (articleError || !article) return null;

  const { data: blocks, error: blockError } = await supabase
    .from('article_blocks')
    .select(`
      id,
      block_type,
      content,
      sort_order,
      media_asset:media_assets!article_blocks_media_asset_id_fkey (
        source_url,
        object_path,
        alt,
        caption,
        media_type
      ),
      linked_project:projects!article_blocks_linked_project_id_fkey (
        slug,
        title
      ),
      linked_stone_group:stone_groups!article_blocks_linked_stone_group_id_fkey (
        stone_group_key,
        display_name
      )
    `)
    .eq('article_id', article.id)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });

  if (blockError || !blocks?.length) {
    return {
      kind: 'legacy',
      legacySourceSlug: sourceSlugFromPath(article.legacy_source_path) ?? article.slug,
    };
  }

  return {
    kind: 'structured',
    blocks: (blocks as unknown as ArticleBlockRow[]).map(mapArticleBlock),
    legacySourceSlug: sourceSlugFromPath(article.legacy_source_path) ?? article.slug,
  };
}

class ArticleService {
  static async getAll(): Promise<ArticleMeta[]> {
    const publishedArticles = await getPublishedArticles();
    const source = publishedArticles.length ? publishedArticles : await getStaticArticles();
    return source.sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
  }

  static async getBody(meta: ArticleMeta): Promise<ArticleBody> {
    const body = await getPublishedArticleBody(meta.slug);
    if (body) return body;

    return {
      kind: 'legacy',
      legacySourceSlug: meta.sourceSlug || meta.slug,
    };
  }
}

export default ArticleService;
