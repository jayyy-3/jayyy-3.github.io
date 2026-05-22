import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ArticleMeta } from '../types/article';
import { resolveArticleAssetPath } from '../lib/articleMedia';

interface Props {
  meta: ArticleMeta;
}

export default function ArticleCard({ meta }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="urblo-card overflow-hidden"
    >
      <Link to={`/articles/${meta.slug}`} className="block">
        {meta.cover ? (
          <div className="aspect-[3/2] overflow-hidden bg-black/5">
            <img
              src={resolveArticleAssetPath(meta.cover)}
              alt={meta.title}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
        <div className="space-y-3 p-6">
          <p className="urblo-meta">{new Date(meta.date).toLocaleDateString()}</p>
          <h3 className="font-display text-[28px] font-semibold uppercase leading-[1.08] text-black">
            {meta.title}
          </h3>
          {meta.excerpt ? (
            <p className="line-clamp-3 text-[16px] leading-7 text-[var(--urblo-text)]">
              {meta.excerpt}
            </p>
          ) : null}
        </div>
      </Link>
    </motion.article>
  );
}
