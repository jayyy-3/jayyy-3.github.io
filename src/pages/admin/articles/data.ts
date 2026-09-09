import type { SupabaseClient } from '@supabase/supabase-js';
import type { ArticleBlockRow, ArticleRow, MediaOptionRow, ProjectOptionRow, StoneOptionRow } from './types';

type ArticleWritePayload = Omit<ArticleRow, 'id' | 'updated_at' | 'created_at' | 'published_at'> & { published_at?: string | null; updated_by: string };
type ArticleBlockWritePayload = Omit<ArticleBlockRow, 'id' | 'article_id' | 'updated_at' | 'published_at'> & { published_at?: string | null; updated_by: string };

// Browser-key queries keep RLS, ordering, selected columns and parent filters explicit.
export async function readArticleBlocks(client: SupabaseClient, articleId: number) {
    return client
        .from('article_blocks')
        .select(
            'id,article_id,block_type,content,media_asset_id,linked_project_id,linked_stone_group_id,sort_order,status,published_at,archived_at,updated_at',
        )
        .eq('article_id', articleId)
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true })
        .returns<ArticleBlockRow[]>();
}

export async function readArticleWorkspace(client: SupabaseClient) {
    return Promise.all([
        client
            .from('articles')
            .select(
                'id,slug,title,status,published_on,author,excerpt,cover_media_id,tags,seo,legacy_source_path,legacy_source_url,sort_order,published_at,archived_at,updated_at,created_at',
            )
            .order('published_on', { ascending: false, nullsFirst: false })
            .order('sort_order', { ascending: true })
            .returns<ArticleRow[]>(),
        client
            .from('projects')
            .select('id,slug,title,status')
            .order('title', { ascending: true })
            .returns<ProjectOptionRow[]>(),
        client
            .from('stone_groups')
            .select('id,stone_group_key,display_name,status')
            .order('display_name', { ascending: true })
            .returns<StoneOptionRow[]>(),
        client
            .from('media_assets')
            .select('id,alt,caption,object_path,source_url,media_type,status')
            .order('updated_at', { ascending: false })
            .limit(120)
            .returns<MediaOptionRow[]>(),
    ]);
}

export async function writeArticle(client: SupabaseClient, articleId: number | null, payload: ArticleWritePayload, actorUserId: string) {
    return articleId
        ? await client
            .from('articles')
            .update(payload)
            .eq('id', articleId)
            .select(
                'id,slug,title,status,published_on,author,excerpt,cover_media_id,tags,seo,legacy_source_path,legacy_source_url,sort_order,published_at,archived_at,updated_at,created_at',
            )
            .single<ArticleRow>()
        : await client
            .from('articles')
            .insert({ ...payload, created_by: actorUserId })
            .select(
                'id,slug,title,status,published_on,author,excerpt,cover_media_id,tags,seo,legacy_source_path,legacy_source_url,sort_order,published_at,archived_at,updated_at,created_at',
            )
            .single<ArticleRow>();
}

export async function writeArticleBlock(client: SupabaseClient, articleId: number, blockId: number | null, payload: ArticleBlockWritePayload, actorUserId: string) {
    return blockId
        ? await client
            .from('article_blocks')
            .update(payload)
            .eq('id', blockId)
            .eq('article_id', articleId)
            .select(
                'id,article_id,block_type,content,media_asset_id,linked_project_id,linked_stone_group_id,sort_order,status,published_at,archived_at,updated_at',
            )
            .single<ArticleBlockRow>()
        : await client
            .from('article_blocks')
            .insert({ ...payload, article_id: articleId, created_by: actorUserId })
            .select(
                'id,article_id,block_type,content,media_asset_id,linked_project_id,linked_stone_group_id,sort_order,status,published_at,archived_at,updated_at',
            )
            .single<ArticleBlockRow>();
}
