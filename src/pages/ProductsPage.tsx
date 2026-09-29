import { useEffect, useState } from 'react';
import ProductService from '../service/ProductService';
import ProductCard from '../components/ProductCard';
import PageIntro from '../components/ui/PageIntro';
import type { Product } from '../types/product';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    ProductService.getAll().then(setProducts);
  }, []);

  return (
    <div className="bg-white">
      <PageIntro
        band
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Products' }]}
        title="Products"
        lede="Explore Urblo modular stone seating systems and configurable streetscape details built for civic landscape projects."
      />

      <section className="urblo-section bg-surface">
        <div className="urblo-page-container grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
