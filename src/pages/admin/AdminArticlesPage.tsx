import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    Archive,
    BookOpenText,
    Braces,
    CheckCircle2,
    Image as ImageIcon,
    Plus,
    Save,
    Search,
    ShieldAlert,
} from 'lucide-react';
import { recordAdminAuditEvent, withAuditNotice } from '../../lib/adminAudit';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';
import { CmsLiveRuleCard, CmsPublicPageLink, CmsStatusCounts, CmsStatusMeaning, CmsStatusPill } from './AdminCmsPrimitives';

type ArticleStatus = 'draft' | 'published' | 'archived';
type ArticleListFilter = ArticleStatus | 'all';
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
    seoBaseJson: string;
    seoTitle: string;
    seoDescription: string;
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
    seoBaseJson: '{}',
    seoTitle: '',
    seoDescription: '',
    legacySourcePath: '',
    legacySourceUrl: '',
    sortOrder: '0',
};

const emptyBlockForm: BlockFormState = {
    status: 'draft',
    blockType: 'rich_text',
    contentJson: JSON.stringify(defaultContentForBlockType('rich_text'), null, 2),
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

const blockContentHints: Record<ArticleBlockType, string> = {
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
    const [articleSearch, setArticleSearch] = useState('');
    const [articleStatusFilter, setArticleStatusFilter] = useState<ArticleListFilter>('all');
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
    const selectedCoverMedia = useMemo(
        () => findMediaOption(mediaOptions, articleForm.coverMediaId),
        [articleForm.coverMediaId, mediaOptions],
    );
    const selectedBlockMedia = useMemo(
        () => findMediaOption(mediaOptions, blockForm.mediaAssetId),
        [blockForm.mediaAssetId, mediaOptions],
    );
    const publishChecklist = useMemo(
        () => getArticlePublishChecklist(articleForm, blocks),
        [articleForm, blocks],
    );
    const canPublishArticle = publishChecklist.every((item) => item.ready);
    const blockPublishChecklist = useMemo(
        () => getArticleSectionPublishChecklist(blockForm),
        [blockForm],
    );
    const canPublishBlock = blockPublishChecklist.every((item) => item.ready);
    const filteredArticles = useMemo(
        () =>
            articles.filter((article) => {
                const matchesStatus = articleStatusFilter === 'all' || article.status === articleStatusFilter;
                const search = articleSearch.trim().toLowerCase();
                const matchesSearch =
                    !search ||
                    [
                        article.title,
                        article.slug,
                        article.excerpt,
                        article.author,
                        article.published_on,
                        ...(article.tags ?? []),
                    ]
                        .filter(Boolean)
                        .some((value) => String(value).toLowerCase().includes(search));
                return matchesStatus && matchesSearch;
            }),
        [articleSearch, articleStatusFilter, articles],
    );

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
                setError(loadError instanceof Error ? loadError.message : 'Article sections failed to load.');
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
            setError(loadError instanceof Error ? loadError.message : 'Article sections failed to load.');
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

    function updateBlockType(value: ArticleBlockType) {
        setBlockForm((current) => ({
            ...current,
            blockType: value,
            contentJson: JSON.stringify(defaultContentForBlockType(value), null, 2),
        }));
        setNotice(null);
    }

    async function saveArticle(nextStatus: ArticleStatus) {
        if (!supabase || !canEdit || !user) return;

        if (nextStatus === 'published' && !canPublishArticle) {
            setError(formatArticlePublishError('article', publishChecklist));
            return;
        }

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

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedArticleId
                ? nextStatus === 'published'
                    ? 'article.publish'
                    : nextStatus === 'archived'
                      ? 'article.archive'
                      : 'article.update'
                : 'article.create',
            entityType: 'articles',
            entityId: response.data.id,
            metadata: {
                slug: response.data.slug,
                status: response.data.status,
                tags: response.data.tags,
            },
        });
        setNotice(withAuditNotice(nextStatus === 'published' ? 'Article published.' : 'Article saved.', auditError));
        await loadArticles(response.data.id);
    }

    async function handleArticleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await saveArticle(articleForm.status);
    }

    async function saveBlock(nextStatus: ArticleStatus) {
        if (!supabase || !canEdit || !user || !selectedArticle) return;

        if (nextStatus === 'published' && !canPublishBlock) {
            setError(formatArticlePublishError('section', blockPublishChecklist));
            return;
        }

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

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedBlockId
                ? nextStatus === 'published'
                    ? 'article_block.publish'
                    : nextStatus === 'archived'
                      ? 'article_block.archive'
                      : 'article_block.update'
                : 'article_block.create',
            entityType: 'article_blocks',
            entityId: response.data.id,
            metadata: {
                articleId: response.data.article_id,
                blockType: response.data.block_type,
                status: response.data.status,
            },
        });
        setNotice(withAuditNotice(nextStatus === 'published' ? 'Section published.' : 'Section saved.', auditError));
        await loadArticleBlocks(supabase, selectedArticle.id, response.data.id);
    }

    return (
        <AdminShell
            title="Articles"
            eyebrow={canEdit ? 'CMS editor' : 'Read only'}
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
                            Articles
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-black">{articles.length} articles</h2>
                        <p className="mt-2 text-sm leading-6 text-black/55">
                            {articleCounts.published} published, {articleCounts.draft} draft,{' '}
                            {articleCounts.archived} archived.
                        </p>
                        <div className="mt-4">
                            <CmsStatusCounts
                                draft={articleCounts.draft}
                                published={articleCounts.published}
                                archived={articleCounts.archived}
                            />
                        </div>
                        <label className="mt-4 flex min-h-11 items-center gap-2 border border-black/10 bg-[#f8f9f5] px-3 text-sm text-black">
                            <Search className="h-4 w-4 shrink-0 text-black/42" />
                            <input
                                value={articleSearch}
                                onChange={(event) => setArticleSearch(event.target.value)}
                                placeholder="Search title, website URL, tag, author"
                                className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-black/36"
                            />
                        </label>
                        <div className="mt-3 grid grid-cols-4 gap-1">
                            {(['all', 'published', 'draft', 'archived'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setArticleStatusFilter(filter)}
                                    className={[
                                        'min-h-9 rounded border px-2 text-[11px] font-bold uppercase tracking-[0.1em] transition',
                                        articleStatusFilter === filter
                                            ? 'border-black bg-black text-white'
                                            : 'border-black/10 bg-white text-black/55 hover:border-black',
                                    ].join(' ')}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
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
                        ) : filteredArticles.length ? (
                            <div className="divide-y divide-black/10">
                                {filteredArticles.map((article) => (
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
                                                    URL: {article.slug} / {article.published_on ?? 'Date not set'}
                                                </span>
                                            </span>
                                            <CmsStatusPill status={article.status} />
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
                                <h2 className="mt-5 text-xl font-semibold text-black">
                                    {articles.length ? 'No matching articles' : 'No articles yet'}
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-black/58">
                                    {articles.length
                                        ? 'Clear the search or choose another status filter.'
                                        : 'Create an article, then add article sections for the public page body.'}
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
                                    Edit the article details, add publish-ready sections, then publish when the checklist is clear.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <CmsPublicPageLink
                                    href={articleForm.slug ? `/articles/${articleForm.slug}` : undefined}
                                    status={articleForm.status}
                                />
                                <CmsStatusPill status={articleForm.status} />
                            </div>
                        </div>

                        <div className="mt-5">
                            <CmsLiveRuleCard>
                                <CmsStatusMeaning compact />
                            </CmsLiveRuleCard>
                        </div>

                        <div className="mt-5">
                            <ArticlePublishStatusSummary
                                eyebrow="Article website status"
                                status={articleForm.status}
                                items={publishChecklist}
                                disabled={!selectedArticle && !articleForm.title.trim() && !articleForm.slug.trim()}
                                liveLabel="Live on website"
                                readyLabel="Ready, not live yet"
                                blockedLabel="Not ready to publish"
                                liveDetail="This article is Published, so its published sections can appear on the public article detail page."
                                readyDetail="The article checklist is clear. Publish when the editor has made the final content decision."
                                blockedDetail="Fix the first missing item before publishing this article."
                            />
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
                                label="Website URL key"
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
                            <MediaSelect
                                label="Cover image"
                                value={articleForm.coverMediaId}
                                disabled={!canEdit || isSavingArticle || isLoading}
                                mediaOptions={mediaOptions}
                                selectedMedia={selectedCoverMedia}
                                emptyLabel="No cover image"
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

                        <div className="mt-3">
                            <ArticleStatusHelp status={articleForm.status} />
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
                                label="Migration note"
                                value={articleForm.legacySourcePath}
                                disabled={!canEdit || isSavingArticle || isLoading}
                                onChange={(value) => updateArticleField('legacySourcePath', value)}
                            />
                            <TextField
                                label="Migration source link"
                                value={articleForm.legacySourceUrl}
                                disabled={!canEdit || isSavingArticle || isLoading}
                                onChange={(value) => updateArticleField('legacySourceUrl', value)}
                            />
                        </div>

                        <div className="mt-5 border border-black/10 bg-[#f8f9f5] p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Search preview</p>
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <TextField
                                    label="Search title"
                                    value={articleForm.seoTitle}
                                    disabled={!canEdit || isSavingArticle || isLoading}
                                    onChange={(value) => updateArticleField('seoTitle', value)}
                                />
                                <TextField
                                    label="Search description"
                                    value={articleForm.seoDescription}
                                    disabled={!canEdit || isSavingArticle || isLoading}
                                    onChange={(value) => updateArticleField('seoDescription', value)}
                                />
                            </div>
                            <p className="mt-3 text-sm leading-6 text-black/58">
                                Leave these blank to let the public site reuse the article title and excerpt.
                            </p>
                        </div>

                        <ArticlePublishChecklist items={publishChecklist} />

                        <ArticleActionBar
                            label="Article actions"
                            status={articleForm.status}
                            isSaving={isSavingArticle}
                            disabled={!canEdit || isLoading}
                            canPublish={canPublishArticle}
                            publishLockedLabel="Complete the Article publish checklist first."
                            saveLabel={isSavingArticle ? 'Saving' : 'Save article'}
                            publishLabel="Publish article"
                            archiveLabel="Archive article"
                            onPublish={() => void saveArticle('published')}
                            onArchive={() => void saveArticle('archived')}
                        />
                    </form>

                    <SubrecordEditor
                        title="Article sections"
                        eyebrow={`${blocks.length} sections`}
                        onNew={() => {
                            setSelectedBlockId(null);
                            setBlockForm(emptyBlockForm);
                        }}
                        disabled={!canEdit || !selectedArticle}
                    >
                        <RecordChips
                            rows={blocks}
                            selectedId={selectedBlockId}
                            getLabel={(row) => `${row.sort_order}. ${formatBlockTypeLabel(row.block_type)}`}
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
                                label="Section type"
                                value={blockForm.blockType}
                                disabled={!canEdit || isSavingBlock || !selectedArticle}
                                onChange={(value) => updateBlockType(value as ArticleBlockType)}
                                options={blockTypeOptions}
                            />
                            <MediaSelect
                                label="Section image"
                                value={blockForm.mediaAssetId}
                                disabled={!canEdit || isSavingBlock || !selectedArticle}
                                mediaOptions={mediaOptions}
                                selectedMedia={selectedBlockMedia}
                                emptyLabel="No section image"
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
                        <div className="border border-black/10 bg-[#f8f9f5] p-4 text-sm leading-6 text-black/62">
                            <p className="font-semibold text-black">{formatBlockTypeLabel(blockForm.blockType)}</p>
                            <p className="mt-1">{blockContentHints[blockForm.blockType]}</p>
                        </div>
                        <ArticlePublishStatusSummary
                            eyebrow="Section publish status"
                            status={blockForm.status}
                            items={blockPublishChecklist}
                            disabled={!selectedArticle && !blockForm.contentJson.trim()}
                            liveLabel="Section can appear in article"
                            readyLabel="Ready, not published yet"
                            blockedLabel="Not ready to publish"
                            liveDetail="This section is Published and can appear when the article is Published."
                            readyDetail="The selected section has enough content to publish."
                            blockedDetail="Fix the first missing item before publishing this section."
                        />
                        <BlockContentEditor
                            blockType={blockForm.blockType}
                            contentJson={blockForm.contentJson}
                            disabled={!canEdit || isSavingBlock || !selectedArticle}
                            onChange={(value) => updateBlockField('contentJson', value)}
                        />
                        <ArticleActionBar
                            label="Section actions"
                            status={blockForm.status}
                            isSaving={isSavingBlock}
                            disabled={!canEdit || !selectedArticle}
                            canPublish={canPublishBlock}
                            publishLockedLabel="Fill the selected section content before publishing."
                            saveLabel={isSavingBlock ? 'Saving' : 'Save section'}
                            publishLabel="Publish section"
                            archiveLabel="Archive section"
                            onSave={() => void saveBlock(blockForm.status)}
                            onPublish={() => void saveBlock('published')}
                            onArchive={() => void saveBlock('archived')}
                            compact
                        />
                    </SubrecordEditor>
                </section>

                <aside className="space-y-5">
                    <section className="border border-black/10 bg-black p-5 text-white">
                        <Braces className="h-5 w-5 text-[var(--urblo-lime)]" />
                        <h2 className="mt-5 text-xl font-semibold">Article section health</h2>
                        <div className="mt-5 grid gap-3 text-sm leading-6 text-white/72">
                            <p>{blocks.length} sections on the selected article.</p>
                            <p>{mediaOptions.length} Media library items available for article images.</p>
                            <p>{projectOptions.length} project links and {stoneOptions.length} stone links available.</p>
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white p-5">
                        <ShieldAlert className="h-5 w-5 text-black" />
                        <h2 className="mt-5 text-xl font-semibold text-black">Publishing rules</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                            <li>Complete the Article publish checklist before publishing.</li>
                            <li>Use Article sections for the public article body.</li>
                            <li>Publish at least one article section so the public article body can appear.</li>
                            <li>Use Archive to remove an article from the website while keeping its editing history.</li>
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
                            Current role is read-only for Articles. Ask a CMS editor to update article content.
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

function ArticleStatusHelp({ status }: { status: ArticleStatus }) {
    const messages: Record<ArticleStatus, string> = {
        draft: 'Draft is safe to edit and will not appear on the public website.',
        published: 'Published can appear on public article pages where CMS content is active.',
        archived: 'Archived is hidden from the public website and kept for editing history.',
    };

    return (
        <p className="rounded border border-black/10 bg-[#f8f9f5] px-3 py-2 text-xs font-semibold leading-5 text-black/58">
            {messages[status]}
        </p>
    );
}

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

function findMediaOption(mediaOptions: MediaOptionRow[], value: string) {
    const mediaId = Number(value);
    if (!Number.isFinite(mediaId)) return null;
    return mediaOptions.find((media) => media.id === mediaId) ?? null;
}

function getMediaUrl(asset: MediaOptionRow | null) {
    if (!asset) return null;
    return asset.source_url || asset.object_path;
}

function formatMediaOption(media: MediaOptionRow) {
    const label = media.alt || media.caption || 'Untitled media';
    return `${label} - ${media.status === 'published' ? 'Published in Media' : 'Not published in Media'}`;
}

function MediaSelect({
    label,
    value,
    disabled,
    mediaOptions,
    selectedMedia,
    emptyLabel,
    onChange,
}: {
    label: string;
    value: string;
    disabled?: boolean;
    mediaOptions: MediaOptionRow[];
    selectedMedia: MediaOptionRow | null;
    emptyLabel: string;
    onChange: (value: string) => void;
}) {
    const previewUrl = getMediaUrl(selectedMedia);

    return (
        <div className="space-y-2">
            <SelectField
                label={label}
                value={value}
                disabled={disabled}
                onChange={onChange}
                options={[
                    ['', emptyLabel],
                    ...mediaOptions.map((media) => [String(media.id), formatMediaOption(media)] as [string, string]),
                ]}
            />
            {selectedMedia ? (
                <div className="flex gap-3 border border-black/10 bg-[#f8f9f5] p-3">
                    <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden bg-white">
                        {previewUrl && selectedMedia.media_type === 'image' ? (
                            <img
                                src={previewUrl}
                                alt={selectedMedia.alt || selectedMedia.caption || label}
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <ImageIcon className="h-5 w-5 text-black/35" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-black">
                            {selectedMedia.alt || selectedMedia.caption || 'Untitled media'}
                        </p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-black/45">
                            {selectedMedia.status === 'published' ? 'Published in Media' : 'Not published in Media'}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-black/52">
                            {selectedMedia.status === 'published'
                                ? 'This Media library item can support a public article image.'
                                : 'Open Media, review the item, then publish it before relying on it for public article pages.'}
                        </p>
                    </div>
                </div>
            ) : value ? (
                <p className="border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-800">
                    Selected media is not in the available media list.
                </p>
            ) : null}
        </div>
    );
}

function BlockContentEditor({
    blockType,
    contentJson,
    disabled,
    onChange,
}: {
    blockType: ArticleBlockType;
    contentJson: string;
    disabled?: boolean;
    onChange: (value: string) => void;
}) {
    const content = parseContentRecord(contentJson);

    function updateTextField(key: string, value: string) {
        onChange(JSON.stringify({ ...content, [key]: value }, null, 2));
    }

    function updateFaqText(value: string) {
        const items = value
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
                const [question, ...answerParts] = line.split('|');
                return {
                    question: question?.trim() ?? '',
                    answer: answerParts.join('|').trim(),
                };
            })
            .filter((item) => item.question || item.answer);

        onChange(JSON.stringify({ ...content, items }, null, 2));
    }

    const commonProps = { disabled };

    if (blockType === 'rich_text') {
        return (
            <TextareaField
                label="Article copy"
                value={contentString(content, 'body')}
                rows={8}
                onChange={(value) => updateTextField('body', value)}
                {...commonProps}
            />
        );
    }

    if (blockType === 'quote') {
        return (
            <div className="grid gap-4">
                <TextareaField
                    label="Quote"
                    value={contentString(content, 'quote')}
                    rows={4}
                    onChange={(value) => updateTextField('quote', value)}
                    {...commonProps}
                />
                <TextField
                    label="Attribution"
                    value={contentString(content, 'attribution')}
                    onChange={(value) => updateTextField('attribution', value)}
                    {...commonProps}
                />
            </div>
        );
    }

    if (blockType === 'callout') {
        return (
            <div className="grid gap-4">
                <TextField
                    label="Callout heading"
                    value={contentString(content, 'heading')}
                    onChange={(value) => updateTextField('heading', value)}
                    {...commonProps}
                />
                <TextareaField
                    label="Callout body"
                    value={contentString(content, 'body')}
                    rows={5}
                    onChange={(value) => updateTextField('body', value)}
                    {...commonProps}
                />
            </div>
        );
    }

    if (blockType === 'cta') {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                <TextField
                    label="Button label"
                    value={contentString(content, 'label')}
                    onChange={(value) => updateTextField('label', value)}
                    {...commonProps}
                />
                <TextField
                    label="Button link"
                    value={contentString(content, 'href')}
                    onChange={(value) => updateTextField('href', value)}
                    {...commonProps}
                />
                <div className="md:col-span-2">
                    <TextareaField
                        label="Supporting copy"
                        value={contentString(content, 'body')}
                        rows={4}
                        onChange={(value) => updateTextField('body', value)}
                        {...commonProps}
                    />
                </div>
            </div>
        );
    }

    if (blockType === 'faq') {
        return (
            <div className="grid gap-3">
                <TextareaField
                    label="Questions and answers"
                    value={faqItemsText(content)}
                    rows={8}
                    onChange={updateFaqText}
                    {...commonProps}
                />
                <p className="text-sm leading-6 text-black/52">
                    Put one question per line. Use a vertical bar between question and answer, for example:
                    What is the lead time? | Usually 6-8 weeks after approval.
                </p>
            </div>
        );
    }

    if (blockType === 'proof_metric') {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                <TextField
                    label="Metric value"
                    value={contentString(content, 'value')}
                    onChange={(value) => updateTextField('value', value)}
                    {...commonProps}
                />
                <TextField
                    label="Metric label"
                    value={contentString(content, 'label')}
                    onChange={(value) => updateTextField('label', value)}
                    {...commonProps}
                />
                <div className="md:col-span-2">
                    <TextareaField
                        label="Proof note"
                        value={contentString(content, 'note')}
                        rows={4}
                        onChange={(value) => updateTextField('note', value)}
                        {...commonProps}
                    />
                </div>
            </div>
        );
    }

    if (blockType === 'video_embed') {
        return (
            <div className="grid gap-4">
                <TextField
                    label="Approved video URL"
                    value={contentString(content, 'url')}
                    onChange={(value) => updateTextField('url', value)}
                    {...commonProps}
                />
                <TextareaField
                    label="Video caption"
                    value={contentString(content, 'caption')}
                    rows={4}
                    onChange={(value) => updateTextField('caption', value)}
                    {...commonProps}
                />
            </div>
        );
    }

    if (blockType === 'comparison_table') {
        return (
            <div className="grid gap-4">
                <TextField
                    label="Table heading"
                    value={contentString(content, 'heading')}
                    onChange={(value) => updateTextField('heading', value)}
                    {...commonProps}
                />
                <TextareaField
                    label="Column labels"
                    value={contentString(content, 'columnsText')}
                    rows={3}
                    onChange={(value) => updateTextField('columnsText', value)}
                    {...commonProps}
                />
                <TextareaField
                    label="Table body notes"
                    value={contentString(content, 'rowsText')}
                    rows={6}
                    onChange={(value) => updateTextField('rowsText', value)}
                    {...commonProps}
                />
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            <TextareaField
                label={
                    blockType === 'image'
                        ? 'Image caption'
                        : blockType === 'gallery'
                          ? 'Gallery notes'
                          : blockType === 'project_spotlight'
                            ? 'Project supporting copy'
                            : blockType === 'stone_reference'
                              ? 'Stone supporting copy'
                              : 'Section copy'
                }
                value={contentString(content, 'body') || contentString(content, 'caption') || contentString(content, 'summary')}
                rows={6}
                onChange={(value) => updateTextField(blockType === 'image' ? 'caption' : 'body', value)}
                {...commonProps}
            />
            {blockType === 'image' || blockType === 'gallery' ? (
                <TextField
                    label="Layout note"
                    value={contentString(content, 'layout')}
                    onChange={(value) => updateTextField('layout', value)}
                    {...commonProps}
                />
            ) : null}
        </div>
    );
}

function TextareaField({
    label,
    value,
    disabled,
    rows = 4,
    onChange,
}: {
    label: string;
    value: string;
    disabled?: boolean;
    rows?: number;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
            {label}
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                rows={rows}
                className={`${fieldClass} py-3 leading-6`}
            />
        </label>
    );
}

function ArticlePublishChecklist({ items }: { items: Array<{ label: string; ready: boolean; detail: string }> }) {
    const readyCount = items.filter((item) => item.ready).length;
    const allReady = readyCount === items.length;

    return (
        <section className="mt-5 border border-black/10 bg-white p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Article publish checklist</p>
                    <h3 className="mt-2 text-lg font-semibold text-black">
                        {allReady ? 'Ready to publish' : `${items.length - readyCount} item${items.length - readyCount === 1 ? '' : 's'} need review`}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-black/58">
                        Published articles can appear on the public Articles page and article detail route.
                    </p>
                </div>
                <span
                    className={[
                        'inline-flex min-h-8 items-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.12em]',
                        allReady
                            ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-black'
                            : 'border-amber-300 bg-amber-50 text-amber-800',
                    ].join(' ')}
                >
                    {readyCount}/{items.length} ready
                </span>
            </div>
            <div className="mt-4 grid gap-2">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className={[
                            'border p-3',
                            item.ready ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.08)]' : 'border-amber-200 bg-amber-50',
                        ].join(' ')}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-black">{item.label}</p>
                            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-black/45">
                                {item.ready ? 'Ready' : 'Fix'}
                            </span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-black/58">{item.detail}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function ArticlePublishStatusSummary({
    eyebrow,
    status,
    items,
    disabled,
    liveLabel,
    readyLabel,
    blockedLabel,
    liveDetail,
    readyDetail,
    blockedDetail,
}: {
    eyebrow: string;
    status: ArticleStatus;
    items: Array<{ label: string; ready: boolean; detail: string }>;
    disabled?: boolean;
    liveLabel: string;
    readyLabel: string;
    blockedLabel: string;
    liveDetail: string;
    readyDetail: string;
    blockedDetail: string;
}) {
    const missingItems = items.filter((item) => !item.ready);
    const readyToPublish = !disabled && missingItems.length === 0;
    const isPublished = status === 'published';
    const stateLabel = disabled
        ? 'Choose or create content'
        : isPublished
          ? liveLabel
          : readyToPublish
            ? readyLabel
            : blockedLabel;
    const detail = disabled
        ? 'Select an item or start a new one to see whether it can appear on the website.'
        : isPublished
          ? liveDetail
          : readyToPublish
            ? readyDetail
            : `${blockedDetail} ${missingItems.length} item${missingItems.length === 1 ? '' : 's'} still need review.`;

    return (
        <section
            className={[
                'border p-4',
                isPublished
                    ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.08)]'
                    : readyToPublish
                      ? 'border-black/10 bg-[#f8f9f5]'
                      : 'border-amber-200 bg-amber-50',
            ].join(' ')}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    {isPublished || readyToPublish ? (
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-black" />
                    ) : (
                        <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-amber-800" />
                    )}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">{eyebrow}</p>
                        <h3 className="mt-2 text-lg font-semibold text-black">{stateLabel}</h3>
                        <p className="mt-2 text-sm leading-6 text-black/62">{detail}</p>
                    </div>
                </div>
                <CmsStatusPill status={status} />
            </div>
            {!disabled && missingItems[0] ? (
                <p className="mt-4 inline-flex min-h-10 items-center rounded border border-amber-300 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-amber-900">
                    Start with: {missingItems[0].label}
                </p>
            ) : null}
        </section>
    );
}

function ArticleActionBar({
    label,
    status,
    isSaving,
    disabled,
    canPublish,
    publishLockedLabel,
    saveLabel,
    publishLabel,
    archiveLabel,
    onSave,
    onPublish,
    onArchive,
    compact = false,
}: {
    label: string;
    status: ArticleStatus;
    isSaving: boolean;
    disabled?: boolean;
    canPublish: boolean;
    publishLockedLabel: string;
    saveLabel: string;
    publishLabel: string;
    archiveLabel: string;
    onSave?: () => void;
    onPublish: () => void;
    onArchive: () => void;
    compact?: boolean;
}) {
    const isDisabled = disabled || isSaving;
    const actionNote = canPublish
        ? status === 'published'
            ? 'Published article content can appear on the website after you save.'
            : status === 'archived'
              ? 'Archived article content stays hidden. Save if you are preparing it for future reuse.'
              : 'Save keeps changes in the CMS. Publish only when the checklist is clear.'
        : `Publish locked: ${publishLockedLabel}`;

    return (
        <section className={compact ? 'border border-black/10 bg-white p-4' : 'mt-5 border border-black/10 bg-[#f8f9f5] p-4'}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">{label}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <CmsStatusPill status={status} />
                        <p className="text-sm font-semibold leading-6 text-black/62">{actionNote}</p>
                    </div>
                </div>
                <div className={compact ? 'grid gap-2' : 'flex flex-wrap gap-2'}>
                    <button
                        type={onSave ? 'button' : 'submit'}
                        onClick={onSave}
                        disabled={isDisabled}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-black/15 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                    >
                        <Save className="h-4 w-4" />
                        {saveLabel}
                    </button>
                    <button
                        type="button"
                        disabled={isDisabled || !canPublish}
                        onClick={onPublish}
                        title={canPublish ? publishLabel : publishLockedLabel}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        {publishLabel}
                    </button>
                    <button
                        type="button"
                        disabled={isDisabled}
                        onClick={onArchive}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/25"
                    >
                        <Archive className="h-4 w-4" />
                        {archiveLabel}
                    </button>
                </div>
            </div>
        </section>
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
        return <p className="text-sm leading-6 text-black/50">Nothing added yet.</p>;
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

function rowToArticleForm(row: ArticleRow | null): ArticleFormState {
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

function formatBlockTypeLabel(blockType: ArticleBlockType) {
    return blockTypeOptions.find(([value]) => value === blockType)?.[1] ?? blockType;
}

function validateArticleForm(form: ArticleFormState) {
    if (!form.title.trim()) return validationFailure('Article title is required.');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
        return validationFailure('Website URL key must use lowercase words separated by hyphens.');
    }

    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    const coverMediaId = optionalPositiveInteger(form.coverMediaId, 'Cover image');
    if (sortOrder.error) return validationFailure(sortOrder.error);
    if (coverMediaId.error) return validationFailure(coverMediaId.error);

    const seo = parseContentRecord(form.seoBaseJson);
    if (form.seoTitle.trim()) {
        seo.title = form.seoTitle.trim();
    } else {
        delete seo.title;
    }
    if (form.seoDescription.trim()) {
        seo.description = form.seoDescription.trim();
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

function validateBlockForm(form: BlockFormState) {
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

function defaultContentForBlockType(blockType: ArticleBlockType): Record<string, unknown> {
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

function parseContentRecord(value: string): Record<string, unknown> {
    try {
        return objectRecord(JSON.parse(value || '{}'));
    } catch {
        return {};
    }
}

function objectRecord(value: unknown): Record<string, unknown> {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }

    return {};
}

function contentString(content: Record<string, unknown>, key: string) {
    const value = content[key];
    return typeof value === 'string' ? value : '';
}

function faqItemsText(content: Record<string, unknown>) {
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

function hasPublishReadyBlockContent(blockType: ArticleBlockType, content: unknown, mediaAssetId: number | null) {
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
            return contentString(record, 'label').trim().length > 0 && contentString(record, 'href').trim().length > 0;
        case 'proof_metric':
            return contentString(record, 'value').trim().length > 0 && contentString(record, 'label').trim().length > 0;
        case 'video_embed':
            return contentString(record, 'url').trim().length > 0;
        default:
            return hasAnyText && !isEmptyObject(record);
    }
}

function getArticlePublishChecklist(form: ArticleFormState, blocks: ArticleBlockRow[]) {
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

function getArticleSectionPublishChecklist(form: BlockFormState) {
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

function formatArticlePublishError(kind: 'article' | 'section', items: Array<{ label: string; ready: boolean; detail: string }>) {
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
