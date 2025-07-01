import products from '../data/productData.ts';
import type { Product } from '../types/product.ts';

class ProductService {
    static async getAll(): Promise<Product[]> {
        // 真实项目可替换为 fetch / GraphQL
        return products;
    }

    static async getBySlug(slug: string): Promise<Product | undefined> {
        return products.find(p => p.slug === slug);
    }
}

export default ProductService;
