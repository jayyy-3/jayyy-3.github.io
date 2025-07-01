import { useEffect, useState } from 'react';
import ProductService from "../service/ProductService.ts";
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/product';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        ProductService.getAll().then(setProducts);
    }, []);

    return (
        <div className="mx-auto max-w-7xl px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">Products</h1>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                    <ProductCard key={p.slug} product={p} />
                ))}
            </div>
        </div>
    );
}
