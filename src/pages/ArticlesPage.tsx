import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ArticleCard from '../components/ArticleCard';
import type { ArticleMeta } from '../types/article';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleMeta[]>([]);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'articles/index.json')
      .then((response) => response.json())
      .then((list: ArticleMeta[]) =>
        setArticles(
          list.sort(
            (a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime(),
          ),
        ),
      )
      .catch(console.error);
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

      <section className="urblo-section bg-[rgba(239,239,239,0.28)]">
        <div className="urblo-page-container grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {articles.map((meta) => (
            <ArticleCard key={meta.slug} meta={meta} />
          ))}
        </div>
      </section>
    </div>
  );
}
