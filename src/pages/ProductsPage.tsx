import { useEffect, useState } from 'react';
import ProductService from '../service/ProductService';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/product';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    ProductService.getAll().then(setProducts);
  }, []);

  return (
    <div className="bg-white">
      <section className="urblo-section-tight border-b border-black/10">
        <div className="urblo-page-container">
          <p className="urblo-eyebrow">Streetscape Collection</p>
          <h1 className="urblo-page-title">Products</h1>
          <p className="urblo-page-copy">
            Explore Urblo modular stone seating systems and configurable streetscape details built
            for civic landscape projects.
          </p>
        </div>
      </section>

      <section className="urblo-section bg-[rgba(239,239,239,0.28)]">
        <div className="urblo-page-container grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
