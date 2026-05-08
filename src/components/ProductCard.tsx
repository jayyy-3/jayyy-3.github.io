import { Link } from 'react-router-dom';
import type { Product } from '../types/product';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const hero = product.models[0]?.img ?? '';

  return (
    <Link
      to={`/products/${product.slug}`}
      className="urblo-card group block overflow-hidden transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden bg-black/5">
        <img
          src={hero}
          alt={product.name}
          className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="space-y-3 p-6">
        <p className="urblo-meta">Product</p>
        <h3 className="font-display text-[28px] font-semibold uppercase leading-[1.1] text-black">
          {product.name}
        </h3>
        {product.shortDesc ? (
          <p className="text-[16px] leading-7 text-[var(--urblo-text)]">{product.shortDesc}</p>
        ) : null}
      </div>
    </Link>
  );
}
