import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ReadingProgressBar from '../components/ReadingProgressBar';
import RouteState from '../components/RouteState';
import { prepareArticleHtml, resolveArticleAssetPath } from '../lib/articleMedia';
import ArticleService from '../service/ArticleService';
import type { ArticleMeta } from '../types/article';

export default function ArticlePage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [html, setHtml] = useState<string | null>(null);
  const [articles, setArticles] = useState<ArticleMeta[]>([]);
  const [indexStatus, setIndexStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [contentStatus, setContentStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const meta = articles.find(
    (article) =>
      article.slug === slug ||
      article.sourceSlug === slug ||
      article.legacySlugs?.includes(slug),
  );
  const index = articles.findIndex((article) => article.slug === slug);
  const prev = articles[index - 1];
  const next = articles[index + 1];

  useEffect(() => {
    if (!slug || !meta) {
      return;
    }

    let isCurrent = true;
    setHtml(null);
    setContentStatus('loading');

    const contentSlug = meta.sourceSlug || meta.slug;

    fetch(import.meta.env.BASE_URL + 'articles/' + contentSlug + '/content.html')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Article content returned ${response.status}`);
        }
        return response.text();
      })
      .then((raw) => {
        if (!isCurrent) {
          return;
        }
        setHtml(DOMPurify.sanitize(prepareArticleHtml(raw)));
        setContentStatus('ready');
      })
      .catch(() => {
        if (isCurrent) {
          setContentStatus('error');
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [slug, meta]);

  useEffect(() => {
    setIndexStatus('loading');

    ArticleService.getAll()
      .then((result) => {
        setArticles(result);
        setIndexStatus('ready');
      })
      .catch(() => setIndexStatus('error'));
  }, []);

  if (indexStatus === 'loading') {
    return (
      <RouteState
        eyebrow="Loading"
        title="Preparing article"
        copy="The article is loading. This should only take a moment."
        headerOffset
      />
    );
  }

  if (indexStatus === 'error') {
    return (
      <RouteState
        eyebrow="Article Error"
        title="Articles could not load"
        copy="The article index could not be loaded right now. Return to articles or contact Urblo if this keeps happening."
        headerOffset
        actions={[
          { label: 'Articles', to: '/articles' },
          { label: 'Contact Us', to: '/contact', variant: 'secondary' },
        ]}
      />
    );
  }

  if (!meta) {
    return (
      <RouteState
        eyebrow="Article Not Found"
        title="Article not found"
        copy="This article link does not match a published Urblo article. Browse the article library or contact Urblo for help."
        headerOffset
        actions={[
          { label: 'Articles', to: '/articles' },
          { label: 'Contact Us', to: '/contact', variant: 'secondary' },
        ]}
      />
    );
  }

  if (slug !== meta.slug) {
    return <Navigate to={`/articles/${meta.slug}`} replace />;
  }

  if (contentStatus === 'loading' || contentStatus === 'idle') {
    return (
      <RouteState
        eyebrow="Loading"
        title="Preparing article"
        copy="The article content is loading. This should only take a moment."
        headerOffset
      />
    );
  }

  if (contentStatus === 'error' || !html) {
    return (
      <RouteState
        eyebrow="Article Error"
        title="Article could not load"
        copy="The article content could not be loaded right now. Return to articles or contact Urblo if this keeps happening."
        headerOffset
        actions={[
          { label: 'Articles', to: '/articles' },
          { label: 'Contact Us', to: '/contact', variant: 'secondary' },
        ]}
      />
    );
  }

  const heroImage = resolveArticleAssetPath(meta.cover);

  return (
    <div className="bg-white">
      <ReadingProgressBar />

      <header className="relative overflow-hidden bg-black text-white">
        {meta.cover ? (
          <img
            src={heroImage}
            alt={meta.title}
            className="h-[520px] w-full object-cover opacity-75 md:h-[420px]"
            loading="lazy"
            decoding="async"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/45" />
        <div className="urblo-page-container absolute inset-0 flex items-end pb-14">
          <div className="max-w-[60rem]">
            <p className="urblo-eyebrow text-white/70">Article</p>
            <h1 className="urblo-page-title urblo-page-title--inverse">
              {meta.title}
            </h1>
          </div>
        </div>
      </header>

      <div className="article-wrapper border-y border-black/10 bg-[rgba(239,239,239,0.38)] px-6 py-14 md:px-10">
        <div className="urblo-card w-full max-w-[980px] bg-white px-6 py-8 md:px-10 md:py-10" dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      <nav className="urblo-page-container flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
        {prev ? (
          <Link to={'/articles/' + prev.slug} className="urblo-button w-full whitespace-normal text-center md:w-auto">
            Previous article
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link to={'/articles/' + next.slug} className="urblo-button-inverse w-full whitespace-normal text-center md:w-auto">
            Next article
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
