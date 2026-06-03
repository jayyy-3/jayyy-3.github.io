import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ArticleCard from '../components/ArticleCard';
import RouteState from '../components/RouteState';
import ArticleService from '../service/ArticleService';
import type { ArticleMeta } from '../types/article';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleMeta[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    setStatus('loading');

    ArticleService.getAll()
      .then((list: ArticleMeta[]) => {
        setArticles(list);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="bg-white">
      <section className="urblo-section-tight border-b border-black/10">
        <div className="urblo-page-container">
          <p className="urblo-eyebrow">Journal</p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="urblo-page-title"
          >
            Articles
          </motion.h1>
          <p className="urblo-page-copy">
            Notes, project stories, and material insights from the Urblo team and our collaborators.
          </p>
        </div>
      </section>

      {status === 'loading' ? (
        <RouteState
          eyebrow="Loading"
          title="Preparing articles"
          copy="The article library is loading. This should only take a moment."
        />
      ) : null}

      {status === 'error' ? (
        <RouteState
          eyebrow="Article Error"
          title="Articles could not load"
          copy="The article library could not be loaded right now. Contact Urblo if this keeps happening."
          actions={[{ label: 'Contact Us', to: '/contact', variant: 'secondary' }]}
        />
      ) : null}

      {status === 'ready' && articles.length === 0 ? (
        <RouteState
          eyebrow="Articles"
          title="No articles published"
          copy="Published Urblo articles will appear here once available."
          actions={[{ label: 'Contact Us', to: '/contact', variant: 'secondary' }]}
        />
      ) : null}

      {status === 'ready' && articles.length ? (
        <section className="urblo-section bg-[rgba(239,239,239,0.28)]">
          <div className="urblo-page-container grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {articles.map((meta) => (
              <ArticleCard key={meta.slug} meta={meta} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
