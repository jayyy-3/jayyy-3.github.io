import { Link } from 'react-router-dom';
import Card from './ui/Card';
import type { Product } from '../types/product';
import StaticResponsiveImage from './StaticResponsiveImage';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const hero = product.models[0]?.img ?? '';

  return (
    <Link to={`/products/${product.slug}`} className="group block h-full">
      <Card
        as="article"
        className="h-full transition-colors group-hover:border-ink"
        mediaTone="light"
        media={
          <StaticResponsiveImage
            src={hero}
            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
            alt={product.name}
            className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
        }
        meta="Product"
        title={product.name}
      >
        {product.shortDesc ? <p className="text-copy">{product.shortDesc}</p> : null}
      </Card>
    </Link>
  );
}
