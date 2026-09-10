import {
    BookOpenText,
    Braces,
    Plus,
    Search,
    ShieldAlert
} from 'lucide-react';
import {
    CmsLiveRuleCard,
    CmsPublicPageLink,
    CmsStatusCounts,
    CmsStatusMeaning,
    CmsStatusPill,
} from '../AdminCmsPrimitives';
import AdminShell from '../AdminShell';
import {
    ArticleActionBar,
    ArticlePublishChecklist,
    ArticlePublishStatusSummary,
    ArticleStatusHelp,
    MediaSelect,
    RecordChips,
    SelectField,
    SubrecordEditor,
    TextField,
} from './ArticleEditorComponents';
import { BlockContentEditor } from './BlockContentEditor';
import {
    blockContentHints,
    blockTypeOptions,
    fieldClass,
    formatBlockTypeLabel,
    statusOptions,
} from './forms';
import type { ArticleBlockType, ArticleStatus } from './types';
import { useArticleEditor } from './useArticleEditor';

export default function ArticlesWorkspace() {
    const {
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
    } = useArticleEditor();
    return (
        <AdminShell
            title="Articles"
            eyebrow={canEdit ? 'CMS editor' : 'Read only'}
            actions={
                <button
                    type="button"
                    onClick={startNewArticle}
                    disabled={!canEdit || isLoading || isSavingArticle || isSavingBlock}
                    className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                >
                    <Plus className="h-4 w-4" />
                    New article
                </button>
            }
        >
            <div
                className={[
                    'grid gap-5 xl:grid-cols-[minmax(280px,390px)_minmax(0,1fr)_380px]',
                    isLoading ? 'opacity-60' : '',
                ].join(' ')}
                aria-busy={isLoading}
                inert={isLoading}
            >
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
                                        disabled={isSavingArticle || isSavingBlock}
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
                                Leave these blank to reuse the article title and excerpt. A brand-new public URL also needs a release check before search engines can discover it.
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
                        onNew={startNewBlock}
                        disabled={!canEdit || !selectedArticle || isSavingArticle || isSavingBlock}
                    >
                        <RecordChips
                            rows={blocks}
                            selectedId={selectedBlockId}
                            getLabel={(row) => `${row.sort_order}. ${formatBlockTypeLabel(row.block_type)}`}
                            onSelect={selectBlock}
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
                                    ...(blockForm.linkedStoneGroupId && !stoneOptions.some((stone) => String(stone.id) === blockForm.linkedStoneGroupId) ? [[blockForm.linkedStoneGroupId, 'Saved stone (not currently published)'] as [string, string]] : []),
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
                            <li>Archive hides the CMS version. A matching legacy article can remain visible during migration until CMS-only cutover.</li>
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
