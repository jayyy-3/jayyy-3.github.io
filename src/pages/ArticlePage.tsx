import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReadingProgressBar from '../components/ReadingProgressBar';
import type { ArticleMeta } from '../types/article';

export default function ArticlePage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [html, setHtml] = useState('<p>Loading...</p>');
  const [articles, setArticles] = useState<ArticleMeta[]>([]);

  const meta = articles.find((article) => article.slug === slug);
  const index = articles.findIndex((article) => article.slug === slug);
  const prev = articles[index - 1];
  const next = articles[index + 1];

  useEffect(() => {
    if (!slug || !meta) {
      return;
    }

    fetch(import.meta.env.BASE_URL + 'articles/' + slug + '/content.html')
      .then((response) => response.text())
      .then((raw) => setHtml(DOMPurify.sanitize(raw)))
      .catch(() => setHtml("<p class='text-red-600'>Failed to load article.</p>"));
  }, [slug, meta]);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'articles/index.json')
      .then((response) => response.json())
      .then(setArticles)
      .catch(console.error);
  }, []);

  if (!meta) {
    return <p className="py-20 text-center text-red-600">Article not found.</p>;
  }

  const heroImage = meta.cover?.startsWith('http')
    ? meta.cover
    : import.meta.env.BASE_URL + (meta.cover || '').replace(/^\/+/, '');

  return (
    <div className="bg-white">
      <ReadingProgressBar />

      <header className="relative overflow-hidden bg-black text-white">
        {meta.cover ? <img src={heroImage} alt={meta.title} className="h-[380px] w-full object-cover opacity-75" loading="lazy" /> : null}
        <div className="absolute inset-0 bg-black/45" />
        <div className="urblo-page-container absolute inset-0 flex items-end pb-14">
          <div className="max-w-[60rem]">
            <p className="urblo-eyebrow text-white/70">Article</p>
            <h1 className="mt-4 font-display text-[34px] font-semibold uppercase leading-[1.08] tracking-[0.03em] md:text-[58px]">
              {meta.title}
            </h1>
          </div>
        </div>
      </header>

      <div className="article-wrapper border-y border-black/10 bg-[rgba(239,239,239,0.38)] px-6 py-14 md:px-10">
        <div className="urblo-card w-full max-w-[980px] bg-white px-6 py-8 md:px-10 md:py-10" dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      <nav className="urblo-page-container flex items-center justify-between gap-4 py-10">
        {prev ? (
          <Link to={'/articles/' + prev.slug} className="urblo-button">
            Previous: {prev.title}
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link to={'/articles/' + next.slug} className="urblo-button-inverse">
            Next: {next.title}
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
