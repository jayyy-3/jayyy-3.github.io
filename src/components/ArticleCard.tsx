import { Link } from 'react-router-dom';
import type { ArticleMeta } from '../types/article';
import { resolveArticleAssetPath } from '../lib/articleMedia';
import Card from './ui/Card';
import { formatPublicDate } from './ui/format';
import StaticResponsiveImage from './StaticResponsiveImage';

interface Props {
  meta: ArticleMeta;
}

export default function ArticleCard({ meta }: Props) {
  return (
    <Link to={`/articles/${meta.slug}`} className="group block h-full">
      <Card
        as="article"
        className="h-full transition-colors group-hover:border-ink"
        media={
          meta.cover ? (
            <StaticResponsiveImage
              src={resolveArticleAssetPath(meta.cover)}
              sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
              alt={meta.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
              loading="lazy"
              decoding="async"
            />
          ) : undefined
        }
        meta={<time dateTime={meta.date}>{formatPublicDate(meta.date)}</time>}
        title={meta.title}
      >
        {meta.excerpt ? <p className="line-clamp-3 text-copy">{meta.excerpt}</p> : null}
      </Card>
    </Link>
  );
}
