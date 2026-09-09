import type { SupabaseClient } from '@supabase/supabase-js';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { recordAdminAuditEvent, withAuditNotice } from '../../../lib/adminAudit';
import { useAdminAuth } from '../../../lib/adminAuthHooks';
import { supabase } from '../../../lib/supabaseClient';
import { readArticleBlocks, readArticleWorkspace, writeArticle, writeArticleBlock } from './data';
import {
    compareArticleBlockRows,
    compareArticleRows,
    defaultContentForBlockType,
    emptyArticleForm,
    emptyBlockForm,
    findMediaOption,
    formatArticlePublishError,
    getArticlePublishChecklist,
    getArticleSectionPublishChecklist,
    rowToArticleForm,
    rowToBlockForm,
    summarizeArticles,
    validateArticleForm,
    validateBlockForm,
} from './forms';
import type {
    ArticleBlockRow,
    ArticleBlockType,
    ArticleFormState,
    ArticleListFilter,
    ArticleRow,
    ArticleStatus,
    BlockFormState,
    MediaOptionRow,
    ProjectOptionRow,
    StoneOptionRow,
} from './types';

export function useArticleEditor() {
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
    const articleLoadGenerationRef = useRef(0);
    const blockLoadGenerationRef = useRef(0);
    const selectedArticleIdRef = useRef<number | null>(null);
    const selectedBlockIdRef = useRef<number | null>(null);
    const savingArticleRef = useRef(false);
    const savingBlockRef = useRef(false);

    selectedArticleIdRef.current = selectedArticleId;

    selectedBlockIdRef.current = selectedBlockId;

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
            const generation = ++blockLoadGenerationRef.current;
            const { data, error: blockError } = await readArticleBlocks(client, articleId);

            if (blockError) {
                throw new Error(blockError.message);
            }

            if (
                generation !== blockLoadGenerationRef.current ||
                selectedArticleIdRef.current !== articleId
            ) {
                return false;
            }

            const rows = data ?? [];
            const nextBlock = rows.find((block) => block.id === preferredBlockId) ?? rows[0] ?? null;
            selectedBlockIdRef.current = nextBlock?.id ?? null;
            setBlocks(rows);
            setSelectedBlockId(nextBlock?.id ?? null);
            setBlockForm(rowToBlockForm(nextBlock));
            return true;
        },
        [],
    );

    const loadArticles = useCallback(
        async (preferredArticleId?: number | null) => {
            if (!supabase) {
                return;
            }

            const generation = ++articleLoadGenerationRef.current;
            const client: SupabaseClient = supabase;
            setIsLoading(true);
            setError(null);

            const [articlesResult, projectsResult, stonesResult, mediaResult] = await readArticleWorkspace(client);

            if (generation !== articleLoadGenerationRef.current) return;

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
            selectedArticleIdRef.current = nextArticle?.id ?? null;
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
                const applied = await loadArticleBlocks(client, nextArticle.id);
                if (!applied || generation !== articleLoadGenerationRef.current) return;
            } catch (loadError) {
                if (
                    generation === articleLoadGenerationRef.current &&
                    selectedArticleIdRef.current === nextArticle.id
                ) {
                    setError(loadError instanceof Error ? loadError.message : 'Article sections failed to load.');
                }
            }

            setIsLoading(false);
        },
        [loadArticleBlocks],
    );

    useEffect(() => {
        void loadArticles();
    }, [loadArticles]);

    function resetBlockState() {
        blockLoadGenerationRef.current += 1;
        selectedBlockIdRef.current = null;
        setBlocks([]);
        setSelectedBlockId(null);
        setBlockForm(emptyBlockForm);
    }

    async function selectArticle(article: ArticleRow) {
        if (savingArticleRef.current || savingBlockRef.current) {
            setNotice('A save is still finishing. Wait for it to complete before switching articles.');
            return;
        }
        if (!supabase) {
            return;
        }

        setIsLoading(true);
        resetBlockState();
        selectedArticleIdRef.current = article.id;
        setSelectedArticleId(article.id);
        setArticleForm(rowToArticleForm(article));
        setError(null);
        setNotice(null);

        try {
            await loadArticleBlocks(supabase, article.id);
        } catch (loadError) {
            if (selectedArticleIdRef.current === article.id) {
                setError(loadError instanceof Error ? loadError.message : 'Article sections failed to load.');
            }
        } finally {
            if (selectedArticleIdRef.current === article.id) {
                setIsLoading(false);
            }
        }
    }

    function startNewArticle() {
        if (isLoading) {
            setNotice('Wait for the article library to finish loading before starting a new article.');
            return;
        }
        if (savingArticleRef.current || savingBlockRef.current) {
            setNotice('A save is still finishing. Wait for it to complete before starting a new article.');
            return;
        }
        articleLoadGenerationRef.current += 1;
        selectedArticleIdRef.current = null;
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

    function startNewBlock() {
        if (savingArticleRef.current || savingBlockRef.current) {
            setNotice('A save is still finishing. Wait for it to complete before starting a new section.');
            return;
        }
        selectedBlockIdRef.current = null;
        setSelectedBlockId(null);
        setBlockForm(emptyBlockForm);
    }

    function selectBlock(block: ArticleBlockRow) {
        if (block.id === selectedBlockIdRef.current) return;
        if (savingArticleRef.current || savingBlockRef.current) {
            setNotice('A save is still finishing. Wait for it to complete before switching sections.');
            return;
        }
        selectedBlockIdRef.current = block.id;
        setSelectedBlockId(block.id);
        setBlockForm(rowToBlockForm(block));
    }

    async function saveArticle(nextStatus: ArticleStatus) {
        if (!supabase || !canEdit || !user) return;
        if (savingArticleRef.current || savingBlockRef.current) return;

        if (nextStatus === 'published' && !canPublishArticle) {
            setError(formatArticlePublishError('article', publishChecklist));
            return;
        }

        const validation = validateArticleForm({ ...articleForm, status: nextStatus });
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        const articleId = selectedArticleIdRef.current;
        savingArticleRef.current = true;
        setIsSavingArticle(true);

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

        setError(null);
        setNotice(null);

        try {
            const response = await writeArticle(supabase, articleId, payload, user.id);

            if (response.error) {
                setError(response.error.message);
                return;
            }

            const auditError = await recordAdminAuditEvent(supabase, {
                actorUserId: user.id,
                action: articleId
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
            if (selectedArticleIdRef.current !== articleId) {
                return;
            }

            selectedArticleIdRef.current = response.data.id;
            setSelectedArticleId(response.data.id);
            setArticles((current) =>
                [...current.filter((article) => article.id !== response.data.id), response.data].sort(compareArticleRows),
            );
            setArticleForm(rowToArticleForm(response.data));
            setNotice(withAuditNotice(nextStatus === 'published' ? 'Article published.' : 'Article saved.', auditError));
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'The article could not be saved. Try again.');
        } finally {
            savingArticleRef.current = false;
            setIsSavingArticle(false);
        }
    }

    async function handleArticleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await saveArticle(articleForm.status);
    }

    async function saveBlock(nextStatus: ArticleStatus) {
        if (!supabase || !canEdit || !user || !selectedArticle) return;
        if (savingArticleRef.current || savingBlockRef.current) return;

        if (nextStatus === 'published' && !canPublishBlock) {
            setError(formatArticlePublishError('section', blockPublishChecklist));
            return;
        }

        const validation = validateBlockForm({ ...blockForm, status: nextStatus });
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        const articleId = selectedArticle.id;
        const blockId = selectedBlockIdRef.current;
        savingBlockRef.current = true;
        setIsSavingBlock(true);

        const now = new Date().toISOString();
        const payload = {
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

        setError(null);
        setNotice(null);

        try {
            const response = await writeArticleBlock(supabase, articleId, blockId, payload, user.id);

            if (response.error) {
                setError(response.error.message);
                return;
            }

            const auditError = await recordAdminAuditEvent(supabase, {
                actorUserId: user.id,
                action: blockId
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
            if (
                selectedArticleIdRef.current !== articleId ||
                selectedBlockIdRef.current !== blockId
            ) {
                return;
            }

            selectedBlockIdRef.current = response.data.id;
            setSelectedBlockId(response.data.id);
            setBlocks((current) =>
                [...current.filter((block) => block.id !== response.data.id), response.data].sort(compareArticleBlockRows),
            );
            setBlockForm(rowToBlockForm(response.data));
            setNotice(withAuditNotice(nextStatus === 'published' ? 'Section published.' : 'Section saved.', auditError));
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'The section could not be saved. Try again.');
        } finally {
            savingBlockRef.current = false;
            setIsSavingBlock(false);
        }
    }
    return {
        canEdit,
        articles,
        blocks,
        projectOptions,
        stoneOptions,
        mediaOptions,
        selectedArticleId,
        selectedBlockId,
        articleForm,
        articleSearch,
        setArticleSearch,
        articleStatusFilter,
        setArticleStatusFilter,
        blockForm,
        isLoading,
        isSavingArticle,
        isSavingBlock,
        error,
        notice,
        selectedArticle,
        articleCounts,
        selectedCoverMedia,
        selectedBlockMedia,
        publishChecklist,
        canPublishArticle,
        blockPublishChecklist,
        canPublishBlock,
        filteredArticles,
        selectArticle,
        startNewArticle,
        updateArticleField,
        updateBlockField,
        updateBlockType,
        startNewBlock,
        selectBlock,
        saveArticle,
        handleArticleSubmit,
        saveBlock,
    };
}
