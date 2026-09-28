import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '../types/database.ts';
import { getPublicContentClient } from '../lib/publicContentClient.ts';
import { parsePublicEntitySeo } from '../lib/publicEntitySeo.ts';
import { resolvePublicMediaUrl, type PublicMediaLocation } from '../lib/publicMediaUrl.ts';
import type { ArticleMeta } from '../types/article.ts';
import { overlayPublishedContent, toCanonicalContentKey } from './publicContentOverlay.ts';

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

type Relation<T> = T | T[] | null;
type PublicClient = SupabaseClient<Database>;

type ArticleRow = Pick<
  Tables<'articles'>,
  'slug' | 'title' | 'published_on' | 'author' | 'excerpt' | 'tags' | 'legacy_source_path' | 'seo'
> & {
  cover_media?: Relation<PublicMediaLocation>;
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

type ArticleMediaRef = PublicMediaLocation & {
  alt: string | null;
  caption: string | null;
  media_type: string | null;
};

type ArticleBlockRow = Pick<Tables<'article_blocks'>, 'id' | 'block_type' | 'content' | 'sort_order'> & {
  media_asset?: Relation<ArticleMediaRef>;
  linked_project?: Relation<Pick<Tables<'projects'>, 'slug' | 'title'>>;
  linked_stone_group?: Relation<Pick<Tables<'stone_groups'>, 'stone_group_key' | 'display_name'>>;
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

function mapArticle(row: ArticleRow, supabase: PublicClient): ArticleMeta {
  return {
    slug: row.slug,
    sourceSlug: sourceSlugFromPath(row.legacy_source_path),
    title: row.title,
    date: row.published_on || '',
    author: row.author || undefined,
    cover: resolvePublicMediaUrl(firstRelation(row.cover_media), supabase),
    excerpt: row.excerpt || undefined,
    tags: row.tags ?? undefined,
    contentSource: 'cms',
    seo: parsePublicEntitySeo(row.seo),
  };
}

function mapArticleBlock(row: ArticleBlockRow, supabase: PublicClient): PublicArticleBlock {
  const media = firstRelation(row.media_asset);
  const project = firstRelation(row.linked_project);
  const stone = firstRelation(row.linked_stone_group);
  const mediaSource = resolvePublicMediaUrl(media, supabase);

  return {
    id: row.id,
    // The article_blocks block_type check constraint limits the column to these values.
    blockType: row.block_type as PublicArticleBlockType,
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
  const supabase = await getPublicContentClient();
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
      seo,
      cover_media:media_assets!articles_cover_media_id_fkey (
        status,
        source_kind,
        source_url,
        bucket,
        object_path
      )
    `)
    .eq('status', 'published')
    .order('published_on', { ascending: false });

  if (error || !data?.length) return [];
  const rows: ArticleRow[] = data;
  return rows.map((row) => mapArticle(row, supabase));
}

async function getPublishedArticleBody(slug: string): Promise<ArticleBody | null> {
  const supabase = await getPublicContentClient();
  if (!supabase) return null;

  const { data: article, error: articleError } = await supabase
    .from('articles')
    .select('id,slug,title,published_on,author,excerpt,tags,legacy_source_path')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (articleError || !article) return null;

  const { data: blocks, error: blockError } = await supabase
    .from('article_blocks')
    .select(`
      id,
      block_type,
      content,
      sort_order,
      media_asset:media_assets!article_blocks_media_asset_id_fkey (
        status,
        source_kind,
        source_url,
        bucket,
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
    blocks: blocks.map((block: ArticleBlockRow) => mapArticleBlock(block, supabase)),
    legacySourceSlug: sourceSlugFromPath(article.legacy_source_path) ?? article.slug,
  };
}

function mergeArticlesWithPublishedOverlay(
  staticArticles: ArticleMeta[],
  publishedArticles: ArticleMeta[],
): ArticleMeta[] {
  const fallbackBySlug = new Map(
    staticArticles.map((article) => [toCanonicalContentKey(article.slug), article]),
  );
  const publishedWithLegacyRoutes = publishedArticles.map((article) => {
    const fallback = fallbackBySlug.get(toCanonicalContentKey(article.slug));
    if (!fallback) return article;

    return {
      ...article,
      sourceSlug: article.sourceSlug ?? fallback.sourceSlug,
      legacySlugs: article.legacySlugs ?? fallback.legacySlugs,
    };
  });

  return overlayPublishedContent(
    staticArticles,
    publishedWithLegacyRoutes,
    (article) => article.slug,
  );
}

class ArticleService {
  static async getAll(): Promise<ArticleMeta[]> {
    const [staticArticles, publishedArticles] = await Promise.all([
      getStaticArticles(),
      getPublishedArticles(),
    ]);
    const mergedArticles = mergeArticlesWithPublishedOverlay(staticArticles, publishedArticles);
    return mergedArticles.sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
  }

  static async getBySlug(slug: string): Promise<ArticleMeta | undefined> {
    const articles = await ArticleService.getAll();
    const canonicalSlug = toCanonicalContentKey(slug);

    return articles.find(
      (article) =>
        toCanonicalContentKey(article.slug) === canonicalSlug ||
        (article.sourceSlug && toCanonicalContentKey(article.sourceSlug) === canonicalSlug) ||
        article.legacySlugs?.some(
          (legacySlug) => toCanonicalContentKey(legacySlug) === canonicalSlug,
        ),
    );
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
