import products from '../data/productData.ts';
import { getPublicContentClient } from '../lib/publicContentClient.ts';
import type { Product } from '../types/product.ts';

type ProductRow = {
    slug: string;
    name: string;
    short_description: string | null;
    product_models?: {
        model_key: string;
        label: string;
        sort_order: number | null;
        media_assets?: { source_url: string | null } | { source_url: string | null }[] | null;
    }[];
    product_material_defaults?: {
        material_category: string;
        material_slug: string | null;
        display_label: string | null;
        stone_groups?: { stone_group_key: string | null } | { stone_group_key: string | null }[] | null;
    }[];
    product_specs?: {
        spec_label: string;
        spec_value: string;
    }[];
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
    return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function mapPublishedProduct(row: ProductRow): Product {
    const models = (row.product_models ?? [])
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((model) => ({
            key: model.model_key,
            label: model.label,
            img: firstRelation(model.media_assets)?.source_url || '/products/primeBlock/core.png',
        }));

    const defaultMaterials = Object.fromEntries(
        (row.product_material_defaults ?? []).map((entry) => [
            entry.material_category,
            firstRelation(entry.stone_groups)?.stone_group_key || entry.material_slug || entry.display_label || undefined,
        ]),
    ) as Product['defaultMaterials'];

    const specs = Object.fromEntries(
        (row.product_specs ?? []).map((entry) => [entry.spec_label, entry.spec_value]),
    );

    return {
        slug: row.slug,
        name: row.name,
        shortDesc: row.short_description || undefined,
        models: models.length ? models : [{ key: 'default', label: 'Default', img: '/products/primeBlock/core.png' }],
        defaultMaterials,
        specs,
    };
}

async function getPublishedProducts(): Promise<Product[]> {
    const supabase = getPublicContentClient();
    if (!supabase) {
        return [];
    }

    const { data, error } = await supabase
        .from('products')
        .select(`
            slug,
            name,
            short_description,
            sort_order,
            product_models (
                model_key,
                label,
                sort_order,
                media_assets:media_assets!product_models_image_media_id_fkey (
                    source_url
                )
            ),
            product_material_defaults (
                material_category,
                material_slug,
                display_label,
                stone_groups (
                    stone_group_key
                )
            ),
            product_specs (
                spec_label,
                spec_value,
                sort_order
            )
        `)
        .eq('status', 'published')
        .order('sort_order', { ascending: true })
        .order('sort_order', { referencedTable: 'product_models', ascending: true })
        .order('sort_order', { referencedTable: 'product_specs', ascending: true });

    if (error || !data?.length) {
        return [];
    }

    return (data as unknown as ProductRow[]).map(mapPublishedProduct);
}

class ProductService {
    static async getAll(): Promise<Product[]> {
        const publishedProducts = await getPublishedProducts();
        return publishedProducts.length ? publishedProducts : products;
    }

    static async getBySlug(slug: string): Promise<Product | undefined> {
        const publishedProducts = await getPublishedProducts();
        const productSource = publishedProducts.length ? publishedProducts : products;

        return productSource.find(
            (product) =>
                product.slug === slug ||
                product.legacySlugs?.includes(slug),
        );
    }
}

export default ProductService;
