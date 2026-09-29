import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '../types/database.ts';
import products from '../data/productData.ts';
import { getPublicContentClient } from '../lib/publicContentClient.ts';
import { parsePublicEntitySeo } from '../lib/publicEntitySeo.ts';
import { resolvePublicMediaUrl, type PublicMediaLocation } from '../lib/publicMediaUrl.ts';
import type { Product } from '../types/product.ts';
import { overlayPublishedContent, toCanonicalContentKey } from './publicContentOverlay.ts';

type MediaRef = PublicMediaLocation;

type Relation<T> = T | T[] | null;
type PublicClient = SupabaseClient<Database>;

type ProductRow = Pick<Tables<'products'>, 'slug' | 'name' | 'short_description' | 'seo'> & {
    product_models?: (Pick<Tables<'product_models'>, 'model_key' | 'label' | 'sort_order'> & {
        media_assets?: Relation<MediaRef>;
    })[];
    product_material_defaults?: (Pick<
        Tables<'product_material_defaults'>,
        'material_category' | 'material_slug' | 'display_label'
    > & {
        stone_groups?: Relation<Pick<Tables<'stone_groups'>, 'stone_group_key'>>;
    })[];
    product_specs?: Pick<Tables<'product_specs'>, 'spec_label' | 'spec_value'>[];
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
    return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function mapPublishedProduct(row: ProductRow, supabase: PublicClient): Product {
    const models = (row.product_models ?? [])
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((model) => ({
            key: model.model_key,
            label: model.label,
            img: resolvePublicMediaUrl(firstRelation(model.media_assets), supabase) || '/products/primeBlock/core.png',
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
        contentSource: 'cms',
        seo: parsePublicEntitySeo(row.seo),
        models: models.length ? models : [{ key: 'default', label: 'Default', img: '/products/primeBlock/core.png' }],
        defaultMaterials,
        specs,
    };
}

async function getPublishedProducts(): Promise<Product[]> {
    const supabase = await getPublicContentClient();
    if (!supabase) {
        return [];
    }

    const { data, error } = await supabase
        .from('products')
        .select(`
            slug,
            name,
            short_description,
            seo,
            sort_order,
            product_models (
                model_key,
                label,
                sort_order,
                media_assets:media_assets!product_models_image_media_id_fkey (
                    status,
                    source_kind,
                    source_url,
                    bucket,
                    object_path
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

    const rows: ProductRow[] = data;
    return rows.map((row) => mapPublishedProduct(row, supabase));
}

function mergeProductsWithPublishedOverlay(publishedProducts: Product[]): Product[] {
    const fallbackBySlug = new Map(
        products.map((product) => [toCanonicalContentKey(product.slug), product]),
    );
    const publishedWithLegacyRoutes = publishedProducts.map((product) => {
        const fallback = fallbackBySlug.get(toCanonicalContentKey(product.slug));
        if (!fallback?.legacySlugs?.length) {
            return product;
        }

        return {
            ...product,
            legacySlugs: product.legacySlugs ?? fallback.legacySlugs,
        };
    });

    return overlayPublishedContent(products, publishedWithLegacyRoutes, (product) => product.slug);
}

class ProductService {
    static async getAll(): Promise<Product[]> {
        const publishedProducts = await getPublishedProducts();
        return mergeProductsWithPublishedOverlay(publishedProducts);
    }

    static async getBySlug(slug: string): Promise<Product | undefined> {
        const productSource = await ProductService.getAll();
        const canonicalSlug = toCanonicalContentKey(slug);

        return productSource.find(
            (product) =>
                toCanonicalContentKey(product.slug) === canonicalSlug ||
                product.legacySlugs?.some(
                    (legacySlug) => toCanonicalContentKey(legacySlug) === canonicalSlug,
                ),
        );
    }
}

export default ProductService;
