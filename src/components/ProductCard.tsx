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
            className="group block overflow-hidden rounded-lg shadow transition hover:shadow-lg"
        >
            <img
                src={hero}
                alt={product.name}
                className="h-56 w-full object-cover transition group-hover:scale-105 duration-300"
            />
            <div className="p-4">
                <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                {product.shortDesc && (
                    <p className="text-sm text-gray-600">{product.shortDesc}</p>
                )}
            </div>
        </Link>
    );
}
