import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ReadingProgressBar from '../components/ReadingProgressBar';
import PublicContentSeo from '../components/PublicContentSeo';
import RouteState from '../components/RouteState';
import { prepareArticleHtml, resolveArticleAssetPath } from '../lib/articleMedia';
import { toSafePublicContentDestination } from '../lib/publicContentLink';
import ArticleService from '../service/ArticleService';
import type { ArticleBody, PublicArticleBlock } from '../service/ArticleService';
import type { ArticleMeta } from '../types/article';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageIntro from '../components/ui/PageIntro';
import { cardTitleClassName } from '../components/ui/styles';
import { formatPublicDate } from '../components/ui/format';
import { siteCtas } from '../data/siteChrome';
import StaticResponsiveImage from '../components/StaticResponsiveImage';

export default function ArticlePage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [html, setHtml] = useState<string | null>(null);
  const [body, setBody] = useState<ArticleBody | null>(null);
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
    setBody(null);
    setContentStatus('loading');

    ArticleService.getBody(meta)
      .then(async (nextBody) => {
        if (!isCurrent) {
          return;
        }

        if (nextBody.kind === 'structured' && nextBody.blocks?.length) {
          setBody(nextBody);
          setContentStatus('ready');
          return;
        }

        const contentSlug = nextBody.legacySourceSlug || meta.sourceSlug || meta.slug;
        const response = await fetch(import.meta.env.BASE_URL + 'articles/' + contentSlug + '/content.html');
        if (!response.ok) {
          throw new Error(`Article content returned ${response.status}`);
        }
        const raw = await response.text();
        if (!isCurrent) {
          return;
        }
        setBody(nextBody);
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
      />
    );
  }

  if (indexStatus === 'error') {
    return (
      <RouteState
        eyebrow="Article Error"
        title="Articles could not load"
        copy="The article index could not be loaded right now. Return to articles or contact Urblo if this keeps happening."
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
      />
    );
  }

  const hasStructuredBody = body?.kind === 'structured' && Boolean(body.blocks?.length);

  if (contentStatus === 'error' || (!hasStructuredBody && !html)) {
    return (
      <RouteState
        eyebrow="Article Error"
        title="Article could not load"
        copy="The article content could not be loaded right now. Return to articles or contact Urblo if this keeps happening."
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
      {meta.contentSource === 'cms' ? (
        <PublicContentSeo
          canonicalPath={`/articles/${meta.slug}`}
          fallbackTitle={`${meta.title} | Urblo`}
          fallbackDescription={
            meta.excerpt ||
            `Read ${meta.title}, an Urblo article on natural stone, public realm design, and streetscape delivery.`
          }
          image={meta.cover}
          ogType="article"
          seo={meta.seo}
        />
      ) : null}
      <ReadingProgressBar />

      <PageIntro
        band
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Articles', to: '/articles' },
          { label: meta.title },
        ]}
        eyebrow={meta.date ? <time dateTime={meta.date}>{formatPublicDate(meta.date)}</time> : 'Article'}
        title={meta.title}
      />

      {meta.cover ? (
        <figure className="bg-ink">
          <StaticResponsiveImage
            src={heroImage}
            sizes="100vw"
            alt={meta.title}
            className="h-[48svh] min-h-[320px] w-full object-cover md:h-[60svh]"
            loading="eager"
            fetchPriority="high"
          />
        </figure>
      ) : null}

      <div className="article-wrapper border-b border-line bg-surface px-gutter py-section">
        {hasStructuredBody ? (
          <StructuredArticleBody blocks={body.blocks ?? []} />
        ) : (
          <Card className="urblo-card w-full max-w-[980px] shadow-none">
            <div className="px-6 py-8 md:px-10 md:py-10" dangerouslySetInnerHTML={{ __html: html ?? '' }} />
          </Card>
        )}
      </div>

      <nav
        aria-label="More articles"
        className="urblo-page-container flex flex-col gap-4 py-section-tight md:flex-row md:items-center md:justify-between"
      >
        {prev ? (
          <Button variant="ghost" to={'/articles/' + prev.slug} className="w-full whitespace-normal text-center md:w-auto">
            Previous article
          </Button>
        ) : (
          <span />
        )}

        {next ? (
          <Button to={'/articles/' + next.slug} className="w-full whitespace-normal text-center md:w-auto">
            Next article
          </Button>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

function StructuredArticleBody({ blocks }: { blocks: PublicArticleBlock[] }) {
  return (
    <Card as="article" className="mx-auto w-full max-w-[980px] px-6 py-8 md:px-10 md:py-10">
      <div className="space-y-8">
        {blocks.map((block) => (
          <ArticleBlockRenderer key={block.id} block={block} />
        ))}
      </div>
    </Card>
  );
}

function ArticleBlockRenderer({ block }: { block: PublicArticleBlock }) {
  const content = block.content;

  if (block.blockType === 'rich_text') {
    const body = contentString(content, 'body');
    const headingLevel = contentNumber(content, 'headingLevel');
    if (!body) return null;
    if (headingLevel && headingLevel <= 3) {
      return <h2 className={cardTitleClassName('lg')}>{body}</h2>;
    }
    return <ParagraphText text={body} />;
  }

  if (block.blockType === 'image' || block.blockType === 'gallery') {
    const caption = contentString(content, 'caption') || contentString(content, 'body') || block.media?.caption;
    return (
      <figure className="space-y-3">
        {block.media?.sourceUrl ? (
          <StaticResponsiveImage
            src={block.media.sourceUrl}
            sizes="(min-width: 980px) 900px, 100vw"
            alt={block.media.alt || caption || 'Article image'}
            className="w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : null}
        {caption ? <figcaption className="text-small text-muted">{caption}</figcaption> : null}
      </figure>
    );
  }

  if (block.blockType === 'quote') {
    return (
      <blockquote className="border-l-4 border-lime bg-surface px-5 py-4">
        <p className="text-title-sm font-light text-ink">{contentString(content, 'quote')}</p>
        {contentString(content, 'attribution') ? (
          <cite className="mt-3 block text-meta font-semibold not-italic uppercase tracking-caps text-muted">
            {contentString(content, 'attribution')}
          </cite>
        ) : null}
      </blockquote>
    );
  }

  if (block.blockType === 'callout') {
    return (
      <section className="border border-line bg-surface p-5">
        {contentString(content, 'heading') ? (
          <h2 className={cardTitleClassName()}>{contentString(content, 'heading')}</h2>
        ) : null}
        <ParagraphText text={contentString(content, 'body')} className="mt-3" />
      </section>
    );
  }

  if (block.blockType === 'cta') {
    const rawHref = contentString(content, 'href');
    const destination = toSafePublicContentDestination(rawHref || '/contact');
    const label = contentString(content, 'label') || siteCtas.contact.label;

    return (
      <section className="border border-line bg-ink p-5 text-inverse">
        <ParagraphText text={contentString(content, 'body')} className="text-inverse-body" />
        {destination?.kind === 'internal' ? (
          <Button variant="inverse" to={destination.href} className="mt-5">
            {label}
          </Button>
        ) : destination?.kind === 'external' ? (
          <Button variant="inverse" href={destination.href} className="mt-5" rel="noopener noreferrer">
            {label}
          </Button>
        ) : null}
      </section>
    );
  }

  if (block.blockType === 'faq') {
    const items = contentArray(content, 'items');
    if (!items.length) return null;
    return (
      <section className="space-y-3">
        {items.map((item, index) => {
          const record = objectRecord(item);
          return (
            <div key={index} className="border border-line p-4">
              <h3 className="text-lead font-semibold text-ink">{contentString(record, 'question')}</h3>
              <ParagraphText text={contentString(record, 'answer')} className="mt-2" />
            </div>
          );
        })}
      </section>
    );
  }

  if (block.blockType === 'proof_metric') {
    const value = contentString(content, 'value');
    const label = contentString(content, 'label');
    if (!value && !label) return null;

    return (
      <section className="border-y border-line py-6">
        {value ? <p className="text-title-lg font-light leading-none text-ink md:text-display md:leading-none">{value}</p> : null}
        {label ? <h2 className="mt-2 text-lead font-semibold text-ink">{label}</h2> : null}
        <ParagraphText text={contentString(content, 'note')} className="mt-3" />
      </section>
    );
  }

  if (block.blockType === 'project_spotlight') {
    return (
      <ReferenceBlock
        title={contentString(content, 'title') || block.linkedProjectTitle || 'Project spotlight'}
        body={contentString(content, 'body')}
        href={block.linkedProjectSlug ? `/projects/${block.linkedProjectSlug}` : undefined}
      />
    );
  }

  if (block.blockType === 'stone_reference') {
    return (
      <ReferenceBlock
        title={block.linkedStoneName || 'Stone reference'}
        body={contentString(content, 'body')}
        href={block.linkedStoneKey ? `/stone-library/${block.linkedStoneKey}` : undefined}
      />
    );
  }

  if (block.blockType === 'video_embed') {
    const url = contentString(content, 'url');
    const destination = toSafePublicContentDestination(url);
    return (
      <ReferenceBlock
        title="Video"
        body={contentString(content, 'caption') || destination?.href}
        href={destination?.href}
      />
    );
  }

  if (block.blockType === 'comparison_table') {
    return (
      <section className="border border-line p-5">
        {contentString(content, 'heading') ? (
          <h2 className={cardTitleClassName()}>{contentString(content, 'heading')}</h2>
        ) : null}
        {contentString(content, 'columnsText') ? (
          <p className="mt-4 text-meta font-bold uppercase tracking-caps text-muted">
            {contentString(content, 'columnsText')}
          </p>
        ) : null}
        <ParagraphText text={contentString(content, 'rowsText')} className="mt-4" />
      </section>
    );
  }

  return <ParagraphText text={contentString(content, 'body') || contentString(content, 'summary')} />;
}

function ReferenceBlock({ title, body, href }: { title: string; body?: string; href?: string }) {
  const content = (
    <section className="border border-line bg-surface p-5 transition hover:border-black/30">
      <h2 className={cardTitleClassName()}>{title}</h2>
      {body ? <ParagraphText text={body} className="mt-3" /> : null}
      {href ? (
        <span className="mt-4 inline-flex text-meta font-bold uppercase tracking-caps text-ink underline decoration-1 underline-offset-[5px]">
          Open reference
        </span>
      ) : null}
    </section>
  );

  if (!href) return content;

  const destination = toSafePublicContentDestination(href);
  if (!destination) return content;

  return destination.kind === 'internal' ? (
    <Link to={destination.href}>{content}</Link>
  ) : (
    <a href={destination.href} rel="noopener noreferrer">
      {content}
    </a>
  );
}

function ParagraphText({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <div className={`space-y-4 text-lead text-body ${className}`}>
      {text.split(/\n{2,}/).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
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

function contentNumber(content: Record<string, unknown>, key: string) {
  const value = content[key];
  return typeof value === 'number' ? value : null;
}

function contentArray(content: Record<string, unknown>, key: string) {
  const value = content[key];
  return Array.isArray(value) ? value : [];
}
