import { getPublicContentClient } from '../lib/publicContentClient.ts';
import type { ArticleMeta } from '../types/article.ts';

type ArticleRow = {
  slug: string;
  title: string;
  published_on: string | null;
  author: string | null;
  excerpt: string | null;
  tags: string[] | null;
  legacy_source_path: string | null;
  cover_media?: { source_url: string | null } | { source_url: string | null }[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
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

class ArticleService {
  static async getAll(): Promise<ArticleMeta[]> {
    const publishedArticles = await getPublishedArticles();
    const source = publishedArticles.length ? publishedArticles : await getStaticArticles();
    return source.sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
  }
}

export default ArticleService;
