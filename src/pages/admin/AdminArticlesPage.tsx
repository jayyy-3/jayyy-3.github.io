import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    Archive,
    BookOpenText,
    Braces,
    CheckCircle2,
    Plus,
    Save,
    ShieldAlert,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';

type ArticleStatus = 'draft' | 'published' | 'archived';
type ArticleBlockType =
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

interface ArticleRow {
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

interface ArticleBlockRow {
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

interface ProjectOptionRow {
    id: number;
    slug: string;
    title: string;
    status: string;
}

interface StoneOptionRow {
    id: number;
    stone_group_key: string;
    display_name: string;
    status: string;
}

interface MediaOptionRow {
    id: number;
    alt: string | null;
    caption: string | null;
    object_path: string | null;
    source_url: string | null;
    media_type: string;
    status: string;
}

interface ArticleFormState {
    status: ArticleStatus;
    slug: string;
    title: string;
    publishedOn: string;
    author: string;
    excerpt: string;
    coverMediaId: string;
    tagsText: string;
    seoJson: string;
    legacySourcePath: string;
    legacySourceUrl: string;
    sortOrder: string;
}

interface BlockFormState {
    status: ArticleStatus;
    blockType: ArticleBlockType;
    contentJson: string;
    mediaAssetId: string;
    linkedProjectId: string;
    linkedStoneGroupId: string;
    sortOrder: string;
}

const emptyArticleForm: ArticleFormState = {
    status: 'draft',
    slug: '',
    title: '',
    publishedOn: '',
    author: '',
    excerpt: '',
    coverMediaId: '',
    tagsText: '',
    seoJson: '',
    legacySourcePath: '',
    legacySourceUrl: '',
    sortOrder: '0',
};

const emptyBlockForm: BlockFormState = {
    status: 'draft',
    blockType: 'rich_text',
    contentJson: '{\n  "body": ""\n}',
    mediaAssetId: '',
    linkedProjectId: '',
    linkedStoneGroupId: '',
    sortOrder: '0',
};

const blockTypeOptions: Array<[string, string]> = [
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

const fieldClass =
    'mt-2 min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium outline-none transition focus:border-black disabled:bg-black/[0.04] disabled:text-black/45';

export default function AdminArticlesPage() {
    return (
        <RequireAdmin>
            <AdminArticlesContent />
        </RequireAdmin>
    );
}

function AdminArticlesContent() {
    const { profile, user } = useAdminAuth();
    const canEdit = profile?.role === 'owner' || profile?.role === 'admin' || profile?.role === 'editor';
    const [articles, setArticles] = useState<ArticleRow[]>([]);
    const [blocks, setBlocks] = useState<ArticleBlockRow[]>([]);
    const [projectOptions, setProjectOptions] = useState<ProjectOptionRow[]>([]);
    const [stoneOptions, setStoneOptions] = useState<StoneOptionRow[]>([]);
    const [mediaOptions, setMediaOptions] = useState<MediaOptionRow[]>([]);
    const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
    const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
    const [articleForm, setArticleForm] = useState<ArticleFormState>(emptyArticleForm);
    const [blockForm, setBlockForm] = useState<BlockFormState>(emptyBlockForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingArticle, setIsSavingArticle] = useState(false);
    const [isSavingBlock, setIsSavingBlock] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const selectedArticle = useMemo(
        () => articles.find((article) => article.id === selectedArticleId) ?? null,
        [articles, selectedArticleId],
    );
    const selectedBlock = useMemo(
        () => blocks.find((block) => block.id === selectedBlockId) ?? null,
        [blocks, selectedBlockId],
    );
    const articleCounts = useMemo(() => summarizeArticles(articles), [articles]);

    const loadArticleBlocks = useCallback(
        async (client: SupabaseClient, articleId: number, preferredBlockId: number | null = null) => {
            const { data, error: blockError } = await client
                .from('article_blocks')
                .select(
                    'id,article_id,block_type,content,media_asset_id,linked_project_id,linked_stone_group_id,sort_order,status,published_at,archived_at,updated_at',
                )
                .eq('article_id', articleId)
                .order('sort_order', { ascending: true })
                .order('id', { ascending: true })
                .returns<ArticleBlockRow[]>();

            if (blockError) {
                throw new Error(blockError.message);
            }

            const rows = data ?? [];
            const nextBlock = rows.find((block) => block.id === preferredBlockId) ?? rows[0] ?? null;
            setBlocks(rows);
            setSelectedBlockId(nextBlock?.id ?? null);
            setBlockForm(rowToBlockForm(nextBlock));
        },
        [],
    );

    const loadArticles = useCallback(
        async (preferredArticleId?: number | null) => {
            if (!supabase) {
                return;
            }

            const client: SupabaseClient = supabase;
            setIsLoading(true);
            setError(null);

            const [articlesResult, projectsResult, stonesResult, mediaResult] = await Promise.all([
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

            if (articlesResult.error) {
                setError(articlesResult.error.message);
                setIsLoading(false);
                return;
            }

            if (projectsResult.error) {
                setError(projectsResult.error.message);
                setIsLoading(false);
                return;
            }

            if (stonesResult.error) {
                setError(stonesResult.error.message);
                setIsLoading(false);
                return;
            }

            if (mediaResult.error) {
                setError(mediaResult.error.message);
                setIsLoading(false);
                return;
            }

            const rows = articlesResult.data ?? [];
            const nextArticle = rows.find((article) => article.id === preferredArticleId) ?? rows[0] ?? null;
            setArticles(rows);
            setProjectOptions(projectsResult.data ?? []);
            setStoneOptions(stonesResult.data ?? []);
            setMediaOptions(mediaResult.data ?? []);
            setSelectedArticleId(nextArticle?.id ?? null);
            setArticleForm(rowToArticleForm(nextArticle));

            if (!nextArticle) {
                resetBlockState();
                setIsLoading(false);
                return;
            }

            try {
                await loadArticleBlocks(client, nextArticle.id);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Article blocks failed to load.');
            }

            setIsLoading(false);
        },
        [loadArticleBlocks],
    );

    useEffect(() => {
        void loadArticles();
    }, [loadArticles]);

    function resetBlockState() {
        setBlocks([]);
        setSelectedBlockId(null);
        setBlockForm(emptyBlockForm);
    }

    async function selectArticle(article: ArticleRow) {
        setSelectedArticleId(article.id);
        setArticleForm(rowToArticleForm(article));
        setError(null);
        setNotice(null);

        if (!supabase) {
            return;
        }

        try {
            await loadArticleBlocks(supabase, article.id);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Article blocks failed to load.');
        }
    }

    function startNewArticle() {
        setSelectedArticleId(null);
        setArticleForm(emptyArticleForm);
        resetBlockState();
        setError(null);
        setNotice('New article started.');
    }

    function updateArticleField<Key extends keyof ArticleFormState>(key: Key, value: ArticleFormState[Key]) {
        setArticleForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    function updateBlockField<Key extends keyof BlockFormState>(key: Key, value: BlockFormState[Key]) {
        setBlockForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    async function saveArticle(nextStatus: ArticleStatus) {
        if (!supabase || !canEdit || !user) return;

        const validation = validateArticleForm({ ...articleForm, status: nextStatus });
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        const now = new Date().toISOString();
        const payload = {
            slug: articleForm.slug.trim(),
            title: articleForm.title.trim(),
            status: nextStatus,
            published_on: articleForm.publishedOn || null,
            author: articleForm.author.trim() || null,
            excerpt: articleForm.excerpt.trim() || null,
            cover_media_id: validation.coverMediaId,
            tags: validation.tags,
            seo: validation.seo,
            legacy_source_path: articleForm.legacySourcePath.trim() || null,
            legacy_source_url: articleForm.legacySourceUrl.trim() || null,
            sort_order: validation.sortOrder,
            updated_by: user.id,
            published_at:
                nextStatus === 'published' ? (selectedArticle?.published_at ?? now) : selectedArticle?.published_at,
            archived_at: nextStatus === 'archived' ? now : null,
        };

        setIsSavingArticle(true);
        setError(null);
        setNotice(null);

        const response = selectedArticleId
            ? await supabase
                  .from('articles')
                  .update(payload)
                  .eq('id', selectedArticleId)
                  .select(
                      'id,slug,title,status,published_on,author,excerpt,cover_media_id,tags,seo,legacy_source_path,legacy_source_url,sort_order,published_at,archived_at,updated_at,created_at',
                  )
                  .single<ArticleRow>()
            : await supabase
                  .from('articles')
                  .insert({ ...payload, created_by: user.id })
                  .select(
                      'id,slug,title,status,published_on,author,excerpt,cover_media_id,tags,seo,legacy_source_path,legacy_source_url,sort_order,published_at,archived_at,updated_at,created_at',
                  )
                  .single<ArticleRow>();

        setIsSavingArticle(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        setNotice(nextStatus === 'published' ? 'Article published.' : 'Article saved.');
        await loadArticles(response.data.id);
    }

    async function handleArticleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await saveArticle(articleForm.status);
    }

    async function saveBlock(nextStatus: ArticleStatus) {
        if (!supabase || !canEdit || !user || !selectedArticle) return;

        const validation = validateBlockForm({ ...blockForm, status: nextStatus });
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        const now = new Date().toISOString();
        const payload = {
            article_id: selectedArticle.id,
            block_type: blockForm.blockType,
            content: validation.content,
            media_asset_id: validation.mediaAssetId,
            linked_project_id: validation.linkedProjectId,
            linked_stone_group_id: validation.linkedStoneGroupId,
            sort_order: validation.sortOrder,
            status: nextStatus,
            updated_by: user.id,
            published_at: nextStatus === 'published' ? (selectedBlock?.published_at ?? now) : selectedBlock?.published_at,
            archived_at: nextStatus === 'archived' ? now : null,
        };

        setIsSavingBlock(true);
        setError(null);
        setNotice(null);

        const response = selectedBlockId
            ? await supabase
                  .from('article_blocks')
                  .update(payload)
                  .eq('id', selectedBlockId)
                  .select(
                      'id,article_id,block_type,content,media_asset_id,linked_project_id,linked_stone_group_id,sort_order,status,published_at,archived_at,updated_at',
                  )
                  .single<ArticleBlockRow>()
            : await supabase
                  .from('article_blocks')
                  .insert({ ...payload, created_by: user.id })
                  .select(
                      'id,article_id,block_type,content,media_asset_id,linked_project_id,linked_stone_group_id,sort_order,status,published_at,archived_at,updated_at',
                  )
                  .single<ArticleBlockRow>();

        setIsSavingBlock(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        setNotice(nextStatus === 'published' ? 'Block published.' : 'Block saved.');
        await loadArticleBlocks(supabase, selectedArticle.id, response.data.id);
    }

    return (
        <AdminShell
            title="Articles"
            eyebrow={canEdit ? 'Admin/Editor' : 'Read only'}
            actions={
                <button
                    type="button"
                    onClick={startNewArticle}
                    disabled={!canEdit}
                    className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                >
                    <Plus className="h-4 w-4" />
                    New article
                </button>
            }
        >
            <div className="grid gap-5 xl:grid-cols-[minmax(280px,390px)_minmax(0,1fr)_380px]">
                <section className="border border-black/10 bg-white">
                    <div className="border-b border-black/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                            Article records
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-black">{articles.length} articles</h2>
                        <p className="mt-2 text-sm leading-6 text-black/55">
                            {articleCounts.published} published, {articleCounts.draft} draft,{' '}
                            {articleCounts.archived} archived.
                        </p>
                    </div>
                    <div className="max-h-[760px] overflow-auto">
                        {isLoading ? (
                            <div className="space-y-3 p-4">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-20 animate-pulse rounded border border-black/10 bg-black/[0.04]"
                                    />
                                ))}
                            </div>
                        ) : articles.length ? (
                            <div className="divide-y divide-black/10">
                                {articles.map((article) => (
                                    <button
                                        key={article.id}
                                        type="button"
                                        onClick={() => void selectArticle(article)}
                                        className={[
                                            'block w-full p-4 text-left transition hover:bg-[#f8f9f5]',
                                            selectedArticleId === article.id ? 'bg-[#f8f9f5]' : 'bg-white',
                                        ].join(' ')}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-semibold text-black">
                                                    {article.title}
                                                </span>
                                                <span className="mt-1 block truncate text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                                    {article.slug} / {article.published_on ?? 'date TBC'}
                                                </span>
                                            </span>
                                            <StatusPill status={article.status} />
                                        </div>
                                        <p className="mt-3 truncate text-xs text-black/45">
                                            {(article.tags ?? []).join(', ') || 'Tags pending'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-5">
                                <BookOpenText className="h-5 w-5 text-black" />
                                <h2 className="mt-5 text-xl font-semibold text-black">No article records yet</h2>
                                <p className="mt-3 text-sm leading-6 text-black/58">
                                    Create an article record, then add structured blocks. Raw newsletter HTML should
                                    stay migration source, not the authoring model.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-5">
                    <form
                        onSubmit={(event) => void handleArticleSubmit(event)}
                        className="border border-black/10 bg-white p-5 md:p-6"
                    >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Article editor
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-black">
                                    {selectedArticle ? selectedArticle.title : 'New article'}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-black/58">
                                    Author article bodies as structured blocks. Use legacy source fields only to track
                                    migration provenance.
                                </p>
                            </div>
                            <StatusPill status={articleForm.status} />
                        </div>

                        <div className="mt-7 grid gap-4 md:grid-cols-2">
                            <TextField
                                label="Title"
                                value={articleForm.title}
                                disabled={!canEdit || isSavingArticle || isLoading}
                                required
                                onChange={(value) => updateArticleField('title', value)}
                            />
                            <TextField
                                label="Slug"
                                value={articleForm.slug}
                                disabled={!canEdit || isSavingArticle || isLoading || Boolean(selectedArticle)}
                                required
                                onChange={(value) => updateArticleField('slug', value)}
                            />
                            <SelectField
                                label="Status"
                                value={articleForm.status}
                                disabled={!canEdit || isSavingArticle || isLoading}
                                onChange={(value) => updateArticleField('status', value as ArticleStatus)}
                                options={statusOptions}
                            />
                            <TextField
                                label="Published on"
                                type="date"
                                value={articleForm.publishedOn}
                                disabled={!canEdit || isSavingArticle || isLoading}
                                onChange={(value) => updateArticleField('publishedOn', value)}
                            />
                            <TextField
                                label="Author"
                                value={articleForm.author}
                                disabled={!canEdit || isSavingArticle || isLoading}
                                onChange={(value) => updateArticleField('author', value)}
                            />
                            <TextField
                                label="Cover media ID"
                                value={articleForm.coverMediaId}
                                disabled={!canEdit || isSavingArticle || isLoading}
                                inputMode="numeric"
                                onChange={(value) => updateArticleField('coverMediaId', value)}
                            />
                            <TextField
                                label="Tags"
                                value={articleForm.tagsText}
                                disabled={!canEdit || isSavingArticle || isLoading}
                                onChange={(value) => updateArticleField('tagsText', value)}
                            />
                            <TextField
                                label="Sort order"
                                value={articleForm.sortOrder}
                                disabled={!canEdit || isSavingArticle || isLoading}
                                inputMode="numeric"
                                onChange={(value) => updateArticleField('sortOrder', value)}
                            />
                        </div>

                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Excerpt
                            <textarea
                                value={articleForm.excerpt}
                                onChange={(event) => updateArticleField('excerpt', event.target.value)}
                                disabled={!canEdit || isSavingArticle || isLoading}
                                rows={4}
                                className={`${fieldClass} py-3 leading-6`}
                            />
                        </label>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <TextField
                                label="Legacy source path"
                                value={articleForm.legacySourcePath}
                                disabled={!canEdit || isSavingArticle || isLoading}
                                onChange={(value) => updateArticleField('legacySourcePath', value)}
                            />
                            <TextField
                                label="Legacy source URL"
                                value={articleForm.legacySourceUrl}
                                disabled={!canEdit || isSavingArticle || isLoading}
                                onChange={(value) => updateArticleField('legacySourceUrl', value)}
                            />
                        </div>

                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            SEO JSON
                            <textarea
                                value={articleForm.seoJson}
                                onChange={(event) => updateArticleField('seoJson', event.target.value)}
                                disabled={!canEdit || isSavingArticle || isLoading}
                                rows={4}
                                className={`${fieldClass} py-3 font-mono text-xs leading-6 normal-case tracking-normal`}
                            />
                        </label>

                        <div className="mt-6 flex flex-wrap gap-2">
                            <ActionButton
                                disabled={!canEdit || isSavingArticle || isLoading}
                                label={isSavingArticle ? 'Saving' : 'Save article'}
                            />
                            <button
                                type="button"
                                disabled={!canEdit || isSavingArticle || isLoading}
                                onClick={() => void saveArticle('published')}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Publish article
                            </button>
                            <button
                                type="button"
                                disabled={!canEdit || isSavingArticle || isLoading}
                                onClick={() => void saveArticle('archived')}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/25"
                            >
                                <Archive className="h-4 w-4" />
                                Archive article
                            </button>
                        </div>
                    </form>

                    <SubrecordEditor
                        title="Structured blocks"
                        eyebrow={`${blocks.length} rows`}
                        onNew={() => {
                            setSelectedBlockId(null);
                            setBlockForm(emptyBlockForm);
                        }}
                        disabled={!canEdit || !selectedArticle}
                    >
                        <RecordChips
                            rows={blocks}
                            selectedId={selectedBlockId}
                            getLabel={(row) => `${row.sort_order}. ${row.block_type}`}
                            onSelect={(row) => {
                                setSelectedBlockId(row.id);
                                setBlockForm(rowToBlockForm(row));
                            }}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                            <SelectField
                                label="Status"
                                value={blockForm.status}
                                disabled={!canEdit || isSavingBlock || !selectedArticle}
                                onChange={(value) => updateBlockField('status', value as ArticleStatus)}
                                options={statusOptions}
                            />
                            <SelectField
                                label="Block type"
                                value={blockForm.blockType}
                                disabled={!canEdit || isSavingBlock || !selectedArticle}
                                onChange={(value) => updateBlockField('blockType', value as ArticleBlockType)}
                                options={blockTypeOptions}
                            />
                            <TextField
                                label="Media asset ID"
                                value={blockForm.mediaAssetId}
                                disabled={!canEdit || isSavingBlock || !selectedArticle}
                                inputMode="numeric"
                                onChange={(value) => updateBlockField('mediaAssetId', value)}
                            />
                            <TextField
                                label="Sort order"
                                value={blockForm.sortOrder}
                                disabled={!canEdit || isSavingBlock || !selectedArticle}
                                inputMode="numeric"
                                onChange={(value) => updateBlockField('sortOrder', value)}
                            />
                            <SelectField
                                label="Linked project"
                                value={blockForm.linkedProjectId}
                                disabled={!canEdit || isSavingBlock || !selectedArticle}
                                onChange={(value) => updateBlockField('linkedProjectId', value)}
                                options={[
                                    ['', 'No project link'],
                                    ...projectOptions.map((project) => [String(project.id), project.title] as [string, string]),
                                ]}
                            />
                            <SelectField
                                label="Linked stone"
                                value={blockForm.linkedStoneGroupId}
                                disabled={!canEdit || isSavingBlock || !selectedArticle}
                                onChange={(value) => updateBlockField('linkedStoneGroupId', value)}
                                options={[
                                    ['', 'No stone link'],
                                    ...stoneOptions.map((stone) => [String(stone.id), stone.display_name] as [string, string]),
                                ]}
                            />
                        </div>
                        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Content JSON
                            <textarea
                                value={blockForm.contentJson}
                                onChange={(event) => updateBlockField('contentJson', event.target.value)}
                                disabled={!canEdit || isSavingBlock || !selectedArticle}
                                rows={10}
                                className={`${fieldClass} py-3 font-mono text-xs leading-6 normal-case tracking-normal`}
                            />
                        </label>
                        <div className="grid gap-2 md:grid-cols-3">
                            <button
                                type="button"
                                onClick={() => void saveBlock(blockForm.status)}
                                disabled={!canEdit || isSavingBlock || !selectedArticle}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                            >
                                <Save className="h-4 w-4" />
                                {isSavingBlock ? 'Saving' : 'Save block'}
                            </button>
                            <button
                                type="button"
                                onClick={() => void saveBlock('published')}
                                disabled={!canEdit || isSavingBlock || !selectedArticle}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Publish
                            </button>
                            <button
                                type="button"
                                onClick={() => void saveBlock('archived')}
                                disabled={!canEdit || isSavingBlock || !selectedArticle}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded bg-black px-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/25"
                            >
                                <Archive className="h-4 w-4" />
                                Archive
                            </button>
                        </div>
                    </SubrecordEditor>
                </section>

                <aside className="space-y-5">
                    <section className="border border-black/10 bg-black p-5 text-white">
                        <Braces className="h-5 w-5 text-[var(--urblo-lime)]" />
                        <h2 className="mt-5 text-xl font-semibold">Block health</h2>
                        <div className="mt-5 grid gap-3 text-sm leading-6 text-white/72">
                            <p>{blocks.length} structured blocks on the selected article.</p>
                            <p>{mediaOptions.length} media records available for ID linking.</p>
                            <p>{projectOptions.length} project links and {stoneOptions.length} stone links available.</p>
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white p-5">
                        <ShieldAlert className="h-5 w-5 text-black" />
                        <h2 className="mt-5 text-xl font-semibold text-black">Publication guardrails</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                            <li>Published articles require title, slug, date, and excerpt.</li>
                            <li>Article bodies should use typed blocks; do not paste newsletter HTML as normal authoring.</li>
                            <li>Blocks use JSON content so claim and media checks can be added later.</li>
                            <li>Physical deletes remain hidden; archive is the safe operational path.</li>
                        </ul>
                    </section>

                    {error ? (
                        <section className="border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
                            {error}
                        </section>
                    ) : null}
                    {notice ? (
                        <section className="border border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.10)] p-4 text-sm font-semibold leading-6 text-black">
                            {notice}
                        </section>
                    ) : null}
                    {!canEdit ? (
                        <section className="border border-black/10 bg-white p-5 text-sm leading-6 text-black/62">
                            Current role is read-only for Articles. Ask an editor/admin to update article records.
                        </section>
                    ) : null}
                </aside>
            </div>
        </AdminShell>
    );
}

const statusOptions: Array<[string, string]> = [
    ['draft', 'Draft'],
    ['published', 'Published'],
    ['archived', 'Archived'],
];

function TextField({
    label,
    value,
    disabled,
    required,
    type = 'text',
    inputMode,
    onChange,
}: {
    label: string;
    value: string;
    disabled?: boolean;
    required?: boolean;
    type?: string;
    inputMode?: 'numeric';
    onChange: (value: string) => void;
}) {
    return (
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
            {label}
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                required={required}
                inputMode={inputMode}
                className={fieldClass}
            />
        </label>
    );
}

function SelectField({
    label,
    value,
    disabled,
    options,
    onChange,
}: {
    label: string;
    value: string;
    disabled?: boolean;
    options: Array<[string, string]>;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
            {label}
            <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={fieldClass}>
                {options.map(([optionValue, labelText]) => (
                    <option key={optionValue} value={optionValue}>
                        {labelText}
                    </option>
                ))}
            </select>
        </label>
    );
}

function ActionButton({ disabled, label }: { disabled?: boolean; label: string }) {
    return (
        <button
            type="submit"
            disabled={disabled}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-black/15 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
        >
            <Save className="h-4 w-4" />
            {label}
        </button>
    );
}

function SubrecordEditor({
    title,
    eyebrow,
    disabled,
    onNew,
    children,
}: {
    title: string;
    eyebrow: string;
    disabled?: boolean;
    onNew: () => void;
    children: ReactNode;
}) {
    return (
        <section className="border border-black/10 bg-white p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">{eyebrow}</p>
                    <h2 className="mt-2 text-xl font-semibold text-black">{title}</h2>
                </div>
                <button
                    type="button"
                    onClick={onNew}
                    disabled={disabled}
                    className="inline-flex min-h-9 items-center gap-2 rounded border border-black/15 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black disabled:text-black/35"
                >
                    <Plus className="h-4 w-4" />
                    New
                </button>
            </div>
            <div className="mt-5 space-y-4">{children}</div>
        </section>
    );
}

function RecordChips<T extends { id: number }>({
    rows,
    selectedId,
    getLabel,
    onSelect,
}: {
    rows: T[];
    selectedId: number | null;
    getLabel: (row: T) => string;
    onSelect: (row: T) => void;
}) {
    if (!rows.length) {
        return <p className="text-sm leading-6 text-black/50">No records yet.</p>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {rows.map((row) => (
                <button
                    key={row.id}
                    type="button"
                    onClick={() => onSelect(row)}
                    className={[
                        'inline-flex min-h-9 items-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.12em] transition',
                        row.id === selectedId
                            ? 'border-black bg-black text-white'
                            : 'border-black/15 bg-white text-black/58 hover:border-black hover:text-black',
                    ].join(' ')}
                >
                    {getLabel(row)}
                </button>
            ))}
        </div>
    );
}

function StatusPill({ status }: { status: ArticleStatus }) {
    return (
        <span
            className={[
                'inline-flex h-8 shrink-0 items-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.14em]',
                status === 'published'
                    ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-black'
                    : status === 'archived'
                      ? 'border-black/15 bg-black text-white'
                      : 'border-black/15 bg-white text-black/50',
            ].join(' ')}
        >
            {status}
        </span>
    );
}

function rowToArticleForm(row: ArticleRow | null): ArticleFormState {
    if (!row) return emptyArticleForm;

    return {
        status: row.status,
        slug: row.slug,
        title: row.title,
        publishedOn: row.published_on ?? '',
        author: row.author ?? '',
        excerpt: row.excerpt ?? '',
        coverMediaId: row.cover_media_id === null ? '' : String(row.cover_media_id),
        tagsText: row.tags.join(', '),
        seoJson: row.seo ? JSON.stringify(row.seo, null, 2) : '',
        legacySourcePath: row.legacy_source_path ?? '',
        legacySourceUrl: row.legacy_source_url ?? '',
        sortOrder: String(row.sort_order),
    };
}

function rowToBlockForm(row: ArticleBlockRow | null): BlockFormState {
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

function validateArticleForm(form: ArticleFormState) {
    if (!form.title.trim()) return validationFailure('Article title is required.');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
        return validationFailure('Article slug must be lowercase kebab-case.');
    }

    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    const coverMediaId = optionalPositiveInteger(form.coverMediaId, 'Cover media ID');
    if (sortOrder.error) return validationFailure(sortOrder.error);
    if (coverMediaId.error) return validationFailure(coverMediaId.error);

    let seo: unknown = {};
    if (form.seoJson.trim()) {
        try {
            seo = JSON.parse(form.seoJson);
        } catch {
            return validationFailure('SEO JSON is not valid JSON.');
        }
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

function validateBlockForm(form: BlockFormState) {
    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    const mediaAssetId = optionalPositiveInteger(form.mediaAssetId, 'Media asset ID');
    const linkedProjectId = optionalPositiveInteger(form.linkedProjectId, 'Linked project ID');
    const linkedStoneGroupId = optionalPositiveInteger(form.linkedStoneGroupId, 'Linked stone group ID');
    if (sortOrder.error) return validationFailure(sortOrder.error);
    if (mediaAssetId.error) return validationFailure(mediaAssetId.error);
    if (linkedProjectId.error) return validationFailure(linkedProjectId.error);
    if (linkedStoneGroupId.error) return validationFailure(linkedStoneGroupId.error);

    let content: unknown = {};
    if (form.contentJson.trim()) {
        try {
            content = JSON.parse(form.contentJson);
        } catch {
            return validationFailure('Block content JSON is not valid JSON.');
        }
    }

    if (form.status === 'published' && isEmptyObject(content)) {
        return validationFailure('Published blocks require structured content.');
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

function validationFailure(error: string) {
    return { error };
}

function requiredInteger(value: string, label: string): { error: string | null; value: number } {
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
        return { error: `${label} must be a whole number.`, value: 0 };
    }
    return { error: null, value: parsed };
}

function optionalPositiveInteger(value: string, label: string): { error: string | null; value: number | null } {
    if (!value.trim()) return { error: null, value: null };
    return requiredPositiveInteger(value, label);
}

function requiredPositiveInteger(value: string, label: string): { error: string | null; value: number } {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return { error: `${label} must be a whole positive number.`, value: 0 };
    }
    return { error: null, value: parsed };
}

function isEmptyObject(value: unknown) {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        Object.keys(value as Record<string, unknown>).length === 0
    );
}

function summarizeArticles(articles: ArticleRow[]) {
    return articles.reduce(
        (summary, article) => ({
            draft: summary.draft + (article.status === 'draft' ? 1 : 0),
            published: summary.published + (article.status === 'published' ? 1 : 0),
            archived: summary.archived + (article.status === 'archived' ? 1 : 0),
        }),
        { draft: 0, published: 0, archived: 0 },
    );
}
