import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    Archive,
    Boxes,
    CheckCircle2,
    Image as ImageIcon,
    Layers3,
    Plus,
    Save,
    Search,
    ShieldAlert,
} from 'lucide-react';
import { recordAdminAuditEvent, withAuditNotice } from '../../lib/adminAudit';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';
import { CmsLiveRuleCard, CmsStatusCounts, CmsStatusMeaning, CmsStatusPill } from './AdminCmsPrimitives';

type ProductStatus = 'draft' | 'published' | 'archived';
type ProductListFilter = ProductStatus | 'all';
type MaterialCategory = 'body' | 'frame' | 'battens';

interface ProductRow {
    id: number;
    slug: string;
    name: string;
    status: ProductStatus;
    short_description: string | null;
    hero_media_id: number | null;
    seo: unknown;
    sort_order: number;
    published_at: string | null;
    archived_at: string | null;
    updated_at: string;
    created_at: string;
}

interface ProductModelRow {
    id: number;
    product_id: number;
    model_key: string;
    label: string;
    image_media_id: number | null;
    status: ProductStatus;
    sort_order: number;
    published_at: string | null;
    archived_at: string | null;
    updated_at: string;
}

interface ProductMaterialDefaultRow {
    id: number;
    product_id: number;
    material_category: MaterialCategory;
    stone_group_id: number | null;
    material_slug: string | null;
    display_label: string | null;
    updated_at: string;
}

interface ProductSpecRow {
    id: number;
    product_id: number;
    spec_label: string;
    spec_value: string;
    sort_order: number;
    updated_at: string;
}

interface StoneOptionRow {
    id: number;
    stone_group_key: string;
    display_name: string;
    status: string;
}

interface MediaOptionRow {
    id: number;
    alt: string | null;
    caption: string | null;
    object_path: string | null;
    source_url: string | null;
    media_type: string;
    status: string;
}

interface ProductFormState {
    status: ProductStatus;
    slug: string;
    name: string;
    shortDescription: string;
    heroMediaId: string;
    seoJson: string;
    sortOrder: string;
}

interface ModelFormState {
    status: ProductStatus;
    modelKey: string;
    label: string;
    imageMediaId: string;
    sortOrder: string;
}

interface MaterialDefaultFormState {
    materialCategory: MaterialCategory;
    stoneGroupId: string;
    materialSlug: string;
    displayLabel: string;
}

interface SpecFormState {
    specLabel: string;
    specValue: string;
    sortOrder: string;
}

const emptyProductForm: ProductFormState = {
    status: 'draft',
    slug: '',
    name: '',
    shortDescription: '',
    heroMediaId: '',
    seoJson: '',
    sortOrder: '0',
};

const emptyModelForm: ModelFormState = {
    status: 'draft',
    modelKey: '',
    label: '',
    imageMediaId: '',
    sortOrder: '0',
};

const emptyMaterialDefaultForm: MaterialDefaultFormState = {
    materialCategory: 'body',
    stoneGroupId: '',
    materialSlug: '',
    displayLabel: '',
};

const emptySpecForm: SpecFormState = {
    specLabel: '',
    specValue: '',
    sortOrder: '0',
};

const fieldClass =
    'mt-2 min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium outline-none transition focus:border-black disabled:bg-black/[0.04] disabled:text-black/45';

export default function AdminProductsPage() {
    return (
        <RequireAdmin>
            <AdminProductsContent />
        </RequireAdmin>
    );
}

function AdminProductsContent() {
    const { profile, user } = useAdminAuth();
    const canEdit = profile?.role === 'owner' || profile?.role === 'admin' || profile?.role === 'editor';
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [models, setModels] = useState<ProductModelRow[]>([]);
    const [materialDefaults, setMaterialDefaults] = useState<ProductMaterialDefaultRow[]>([]);
    const [specs, setSpecs] = useState<ProductSpecRow[]>([]);
    const [stoneOptions, setStoneOptions] = useState<StoneOptionRow[]>([]);
    const [mediaOptions, setMediaOptions] = useState<MediaOptionRow[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
    const [selectedMaterialDefaultId, setSelectedMaterialDefaultId] = useState<number | null>(null);
    const [selectedSpecId, setSelectedSpecId] = useState<number | null>(null);
    const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
    const [productSearch, setProductSearch] = useState('');
    const [productStatusFilter, setProductStatusFilter] = useState<ProductListFilter>('all');
    const [modelForm, setModelForm] = useState<ModelFormState>(emptyModelForm);
    const [materialDefaultForm, setMaterialDefaultForm] =
        useState<MaterialDefaultFormState>(emptyMaterialDefaultForm);
    const [specForm, setSpecForm] = useState<SpecFormState>(emptySpecForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingProduct, setIsSavingProduct] = useState(false);
    const [isSavingModel, setIsSavingModel] = useState(false);
    const [isSavingMaterialDefault, setIsSavingMaterialDefault] = useState(false);
    const [isSavingSpec, setIsSavingSpec] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const selectedProduct = useMemo(
        () => products.find((product) => product.id === selectedProductId) ?? null,
        [products, selectedProductId],
    );
    const selectedModel = useMemo(
        () => models.find((model) => model.id === selectedModelId) ?? null,
        [models, selectedModelId],
    );
    const productCounts = useMemo(() => summarizeProducts(products), [products]);
    const selectedHeroMedia = useMemo(
        () => findMediaOption(mediaOptions, productForm.heroMediaId),
        [mediaOptions, productForm.heroMediaId],
    );
    const selectedModelImage = useMemo(
        () => findMediaOption(mediaOptions, modelForm.imageMediaId),
        [mediaOptions, modelForm.imageMediaId],
    );
    const selectedDefaultStone = useMemo(
        () => findStoneOption(stoneOptions, materialDefaultForm.stoneGroupId),
        [materialDefaultForm.stoneGroupId, stoneOptions],
    );
    const filteredProducts = useMemo(
        () =>
            products.filter((product) => {
                const matchesStatus = productStatusFilter === 'all' || product.status === productStatusFilter;
                const search = productSearch.trim().toLowerCase();
                const matchesSearch =
                    !search ||
                    [product.name, product.slug, product.short_description]
                        .filter(Boolean)
                        .some((value) => String(value).toLowerCase().includes(search));
                return matchesStatus && matchesSearch;
            }),
        [productSearch, productStatusFilter, products],
    );

    const loadProductBundle = useCallback(
        async (client: SupabaseClient, productId: number, preferredModelId: number | null = null) => {
            const [modelsResult, defaultsResult, specsResult] = await Promise.all([
                client
                    .from('product_models')
                    .select('id,product_id,model_key,label,image_media_id,status,sort_order,published_at,archived_at,updated_at')
                    .eq('product_id', productId)
                    .order('sort_order', { ascending: true })
                    .order('label', { ascending: true })
                    .returns<ProductModelRow[]>(),
                client
                    .from('product_material_defaults')
                    .select('id,product_id,material_category,stone_group_id,material_slug,display_label,updated_at')
                    .eq('product_id', productId)
                    .order('material_category', { ascending: true })
                    .returns<ProductMaterialDefaultRow[]>(),
                client
                    .from('product_specs')
                    .select('id,product_id,spec_label,spec_value,sort_order,updated_at')
                    .eq('product_id', productId)
                    .order('sort_order', { ascending: true })
                    .order('spec_label', { ascending: true })
                    .returns<ProductSpecRow[]>(),
            ]);

            if (modelsResult.error) throw new Error(modelsResult.error.message);
            if (defaultsResult.error) throw new Error(defaultsResult.error.message);
            if (specsResult.error) throw new Error(specsResult.error.message);

            const modelRows = modelsResult.data ?? [];
            const defaultRows = defaultsResult.data ?? [];
            const specRows = specsResult.data ?? [];
            const nextModel = modelRows.find((model) => model.id === preferredModelId) ?? modelRows[0] ?? null;
            const nextDefault = defaultRows[0] ?? null;
            const nextSpec = specRows[0] ?? null;

            setModels(modelRows);
            setSelectedModelId(nextModel?.id ?? null);
            setModelForm(rowToModelForm(nextModel));
            setMaterialDefaults(defaultRows);
            setSelectedMaterialDefaultId(nextDefault?.id ?? null);
            setMaterialDefaultForm(rowToMaterialDefaultForm(nextDefault));
            setSpecs(specRows);
            setSelectedSpecId(nextSpec?.id ?? null);
            setSpecForm(rowToSpecForm(nextSpec));
        },
        [],
    );

    const loadProducts = useCallback(
        async (preferredProductId?: number | null) => {
            if (!supabase) {
                return;
            }

            const client: SupabaseClient = supabase;
            setIsLoading(true);
            setError(null);

            const [productsResult, stonesResult, mediaResult] = await Promise.all([
                client
                    .from('products')
                    .select(
                        'id,slug,name,status,short_description,hero_media_id,seo,sort_order,published_at,archived_at,updated_at,created_at',
                    )
                    .order('sort_order', { ascending: true })
                    .order('name', { ascending: true })
                    .returns<ProductRow[]>(),
                client
                    .from('stone_groups')
                    .select('id,stone_group_key,display_name,status')
                    .order('display_name', { ascending: true })
                    .returns<StoneOptionRow[]>(),
                client
                    .from('media_assets')
                    .select('id,alt,caption,object_path,source_url,media_type,status')
                    .order('updated_at', { ascending: false })
                    .limit(120)
                    .returns<MediaOptionRow[]>(),
            ]);

            if (productsResult.error) {
                setError(productsResult.error.message);
                setIsLoading(false);
                return;
            }

            if (stonesResult.error) {
                setError(stonesResult.error.message);
                setIsLoading(false);
                return;
            }

            if (mediaResult.error) {
                setError(mediaResult.error.message);
                setIsLoading(false);
                return;
            }

            const rows = productsResult.data ?? [];
            const nextProduct = rows.find((product) => product.id === preferredProductId) ?? rows[0] ?? null;
            setProducts(rows);
            setStoneOptions(stonesResult.data ?? []);
            setMediaOptions(mediaResult.data ?? []);
            setSelectedProductId(nextProduct?.id ?? null);
            setProductForm(rowToProductForm(nextProduct));

            if (!nextProduct) {
                resetChildState();
                setIsLoading(false);
                return;
            }

            try {
                await loadProductBundle(client, nextProduct.id);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Product detail load failed.');
            }

            setIsLoading(false);
        },
        [loadProductBundle],
    );

    useEffect(() => {
        void loadProducts();
    }, [loadProducts]);

    function resetChildState() {
        setModels([]);
        setMaterialDefaults([]);
        setSpecs([]);
        setSelectedModelId(null);
        setSelectedMaterialDefaultId(null);
        setSelectedSpecId(null);
        setModelForm(emptyModelForm);
        setMaterialDefaultForm(emptyMaterialDefaultForm);
        setSpecForm(emptySpecForm);
    }

    async function selectProduct(product: ProductRow) {
        setSelectedProductId(product.id);
        setProductForm(rowToProductForm(product));
        setError(null);
        setNotice(null);

        if (!supabase) {
            return;
        }

        try {
            await loadProductBundle(supabase, product.id);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Product detail load failed.');
        }
    }

    function startNewProduct() {
        setSelectedProductId(null);
        setProductForm(emptyProductForm);
        resetChildState();
        setError(null);
        setNotice('New product started.');
    }

    function updateProductField<Key extends keyof ProductFormState>(key: Key, value: ProductFormState[Key]) {
        setProductForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    function updateModelField<Key extends keyof ModelFormState>(key: Key, value: ModelFormState[Key]) {
        setModelForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    function updateMaterialDefaultField<Key extends keyof MaterialDefaultFormState>(
        key: Key,
        value: MaterialDefaultFormState[Key],
    ) {
        setMaterialDefaultForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    function updateSpecField<Key extends keyof SpecFormState>(key: Key, value: SpecFormState[Key]) {
        setSpecForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    async function saveProduct(nextStatus: ProductStatus) {
        if (!supabase || !canEdit || !user) return;

        const validation = validateProductForm({ ...productForm, status: nextStatus });
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        const now = new Date().toISOString();
        const payload = {
            slug: productForm.slug.trim(),
            name: productForm.name.trim(),
            status: nextStatus,
            short_description: productForm.shortDescription.trim() || null,
            hero_media_id: validation.heroMediaId,
            seo: validation.seo,
            sort_order: validation.sortOrder,
            updated_by: user.id,
            published_at:
                nextStatus === 'published' ? (selectedProduct?.published_at ?? now) : selectedProduct?.published_at,
            archived_at: nextStatus === 'archived' ? now : null,
        };

        setIsSavingProduct(true);
        setError(null);
        setNotice(null);

        const response = selectedProductId
            ? await supabase
                  .from('products')
                  .update(payload)
                  .eq('id', selectedProductId)
                  .select(
                      'id,slug,name,status,short_description,hero_media_id,seo,sort_order,published_at,archived_at,updated_at,created_at',
                  )
                  .single<ProductRow>()
            : await supabase
                  .from('products')
                  .insert({ ...payload, created_by: user.id })
                  .select(
                      'id,slug,name,status,short_description,hero_media_id,seo,sort_order,published_at,archived_at,updated_at,created_at',
                  )
                  .single<ProductRow>();

        setIsSavingProduct(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedProductId
                ? nextStatus === 'published'
                    ? 'product.publish'
                    : nextStatus === 'archived'
                      ? 'product.archive'
                      : 'product.update'
                : 'product.create',
            entityType: 'products',
            entityId: response.data.id,
            metadata: {
                slug: response.data.slug,
                status: response.data.status,
            },
        });
        setNotice(withAuditNotice(nextStatus === 'published' ? 'Product published.' : 'Product saved.', auditError));
        await loadProducts(response.data.id);
    }

    async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await saveProduct(productForm.status);
    }

    async function saveModel(nextStatus: ProductStatus) {
        if (!supabase || !canEdit || !user || !selectedProduct) return;

        const validation = validateModelForm({ ...modelForm, status: nextStatus });
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        const now = new Date().toISOString();
        const payload = {
            product_id: selectedProduct.id,
            model_key: modelForm.modelKey.trim(),
            label: modelForm.label.trim(),
            image_media_id: validation.imageMediaId,
            status: nextStatus,
            sort_order: validation.sortOrder,
            updated_by: user.id,
            published_at: nextStatus === 'published' ? (selectedModel?.published_at ?? now) : selectedModel?.published_at,
            archived_at: nextStatus === 'archived' ? now : null,
        };

        setIsSavingModel(true);
        setError(null);
        setNotice(null);

        const response = selectedModelId
            ? await supabase
                  .from('product_models')
                  .update(payload)
                  .eq('id', selectedModelId)
                  .select('id,product_id,model_key,label,image_media_id,status,sort_order,published_at,archived_at,updated_at')
                  .single<ProductModelRow>()
            : await supabase
                  .from('product_models')
                  .insert({ ...payload, created_by: user.id })
                  .select('id,product_id,model_key,label,image_media_id,status,sort_order,published_at,archived_at,updated_at')
                  .single<ProductModelRow>();

        setIsSavingModel(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedModelId
                ? nextStatus === 'published'
                    ? 'product_model.publish'
                    : nextStatus === 'archived'
                      ? 'product_model.archive'
                      : 'product_model.update'
                : 'product_model.create',
            entityType: 'product_models',
            entityId: response.data.id,
            metadata: {
                productId: response.data.product_id,
                modelKey: response.data.model_key,
                status: response.data.status,
            },
        });
        setNotice(withAuditNotice(nextStatus === 'published' ? 'Model published.' : 'Model saved.', auditError));
        await loadProductBundle(supabase, selectedProduct.id, response.data.id);
    }

    async function saveMaterialDefault() {
        if (!supabase || !canEdit || !user || !selectedProduct) return;

        const validation = validateMaterialDefaultForm(materialDefaultForm);
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        const payload = {
            product_id: selectedProduct.id,
            material_category: materialDefaultForm.materialCategory,
            stone_group_id: validation.stoneGroupId,
            material_slug: materialDefaultForm.materialSlug.trim() || null,
            display_label: materialDefaultForm.displayLabel.trim() || null,
            updated_by: user.id,
        };

        setIsSavingMaterialDefault(true);
        setError(null);
        setNotice(null);

        const response = selectedMaterialDefaultId
            ? await supabase
                  .from('product_material_defaults')
                  .update(payload)
                  .eq('id', selectedMaterialDefaultId)
                  .select('id,product_id,material_category,stone_group_id,material_slug,display_label,updated_at')
                  .single<ProductMaterialDefaultRow>()
            : await supabase
                  .from('product_material_defaults')
                  .insert({ ...payload, created_by: user.id })
                  .select('id,product_id,material_category,stone_group_id,material_slug,display_label,updated_at')
                  .single<ProductMaterialDefaultRow>();

        setIsSavingMaterialDefault(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedMaterialDefaultId ? 'product_material_default.update' : 'product_material_default.create',
            entityType: 'product_material_defaults',
            entityId: response.data.id,
            metadata: {
                productId: response.data.product_id,
                materialCategory: response.data.material_category,
                stoneGroupId: response.data.stone_group_id,
            },
        });
        setNotice(withAuditNotice('Material default saved.', auditError));
        await loadProductBundle(supabase, selectedProduct.id, selectedModelId);
    }

    async function saveSpec() {
        if (!supabase || !canEdit || !user || !selectedProduct) return;

        const validation = validateSpecForm(specForm);
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        const payload = {
            product_id: selectedProduct.id,
            spec_label: specForm.specLabel.trim(),
            spec_value: specForm.specValue.trim(),
            sort_order: validation.sortOrder,
            updated_by: user.id,
        };

        setIsSavingSpec(true);
        setError(null);
        setNotice(null);

        const response = selectedSpecId
            ? await supabase
                  .from('product_specs')
                  .update(payload)
                  .eq('id', selectedSpecId)
                  .select('id,product_id,spec_label,spec_value,sort_order,updated_at')
                  .single<ProductSpecRow>()
            : await supabase
                  .from('product_specs')
                  .insert({ ...payload, created_by: user.id })
                  .select('id,product_id,spec_label,spec_value,sort_order,updated_at')
                  .single<ProductSpecRow>();

        setIsSavingSpec(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedSpecId ? 'product_spec.update' : 'product_spec.create',
            entityType: 'product_specs',
            entityId: response.data.id,
            metadata: {
                productId: response.data.product_id,
                label: response.data.spec_label,
            },
        });
        setNotice(withAuditNotice('Specification saved.', auditError));
        await loadProductBundle(supabase, selectedProduct.id, selectedModelId);
    }

    return (
        <AdminShell
            title="Products"
            eyebrow={canEdit ? 'Admin/Editor' : 'Read only'}
            actions={
                <button
                    type="button"
                    onClick={startNewProduct}
                    disabled={!canEdit}
                    className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                >
                    <Plus className="h-4 w-4" />
                    New product
                </button>
            }
        >
            <div className="grid gap-5 xl:grid-cols-[minmax(280px,390px)_minmax(0,1fr)_380px]">
                <section className="border border-black/10 bg-white">
                    <div className="border-b border-black/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                            Product families
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-black">{products.length} products</h2>
                        <p className="mt-2 text-sm leading-6 text-black/55">
                            {productCounts.published} published, {productCounts.draft} draft,{' '}
                            {productCounts.archived} archived.
                        </p>
                        <div className="mt-4">
                            <CmsStatusCounts
                                draft={productCounts.draft}
                                published={productCounts.published}
                                archived={productCounts.archived}
                            />
                        </div>
                        <label className="mt-4 flex min-h-11 items-center gap-2 border border-black/10 bg-[#f8f9f5] px-3 text-sm text-black">
                            <Search className="h-4 w-4 shrink-0 text-black/42" />
                            <input
                                value={productSearch}
                                onChange={(event) => setProductSearch(event.target.value)}
                                placeholder="Search product, slug, description"
                                className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-black/36"
                            />
                        </label>
                        <div className="mt-3 grid grid-cols-4 gap-1">
                            {(['all', 'published', 'draft', 'archived'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setProductStatusFilter(filter)}
                                    className={[
                                        'min-h-9 rounded border px-2 text-[11px] font-bold uppercase tracking-[0.1em] transition',
                                        productStatusFilter === filter
                                            ? 'border-black bg-black text-white'
                                            : 'border-black/10 bg-white text-black/55 hover:border-black',
                                    ].join(' ')}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="max-h-[760px] overflow-auto">
                        {isLoading ? (
                            <div className="space-y-3 p-4">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-20 animate-pulse rounded border border-black/10 bg-black/[0.04]"
                                    />
                                ))}
                            </div>
                        ) : filteredProducts.length ? (
                            <div className="divide-y divide-black/10">
                                {filteredProducts.map((product) => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => void selectProduct(product)}
                                        className={[
                                            'block w-full p-4 text-left transition hover:bg-[#f8f9f5]',
                                            selectedProductId === product.id ? 'bg-[#f8f9f5]' : 'bg-white',
                                        ].join(' ')}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-semibold text-black">
                                                    {product.name}
                                                </span>
                                                <span className="mt-1 block truncate text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                                    {product.slug}
                                                </span>
                                            </span>
                                            <CmsStatusPill status={product.status} />
                                        </div>
                                        <p className="mt-3 truncate text-xs text-black/45">
                                            {product.short_description ?? 'Description pending'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-5">
                                <Boxes className="h-5 w-5 text-black" />
                                <h2 className="mt-5 text-xl font-semibold text-black">
                                    {products.length ? 'No matching products' : 'No product records yet'}
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-black/58">
                                    {products.length
                                        ? 'Clear the search or choose another status filter.'
                                        : 'Create a product family, then add models, material defaults, and specifications.'}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-5">
                    <form
                        onSubmit={(event) => void handleProductSubmit(event)}
                        className="border border-black/10 bg-white p-5 md:p-6"
                    >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Product editor
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-black">
                                    {selectedProduct ? selectedProduct.name : 'New product'}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-black/58">
                                    Keep models, material defaults, and specs structured so product pages can migrate
                                    from static data without losing route contracts.
                                </p>
                            </div>
                            <CmsStatusPill status={productForm.status} />
                        </div>

                        <div className="mt-5">
                            <CmsLiveRuleCard>
                                <CmsStatusMeaning compact />
                            </CmsLiveRuleCard>
                        </div>

                        <div className="mt-7 grid gap-4 md:grid-cols-2">
                            <TextField
                                label="Name"
                                value={productForm.name}
                                disabled={!canEdit || isSavingProduct || isLoading}
                                required
                                onChange={(value) => updateProductField('name', value)}
                            />
                            <TextField
                                label="Slug"
                                value={productForm.slug}
                                disabled={!canEdit || isSavingProduct || isLoading || Boolean(selectedProduct)}
                                required
                                onChange={(value) => updateProductField('slug', value)}
                            />
                            <SelectField
                                label="Status"
                                value={productForm.status}
                                disabled={!canEdit || isSavingProduct || isLoading}
                                onChange={(value) => updateProductField('status', value as ProductStatus)}
                                options={statusOptions}
                            />
                            <TextField
                                label="Sort order"
                                value={productForm.sortOrder}
                                disabled={!canEdit || isSavingProduct || isLoading}
                                inputMode="numeric"
                                onChange={(value) => updateProductField('sortOrder', value)}
                            />
                            <MediaSelect
                                label="Hero image"
                                value={productForm.heroMediaId}
                                disabled={!canEdit || isSavingProduct || isLoading}
                                mediaOptions={mediaOptions}
                                selectedMedia={selectedHeroMedia}
                                emptyLabel="No hero image"
                                onChange={(value) => updateProductField('heroMediaId', value)}
                            />
                        </div>

                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Short description
                            <textarea
                                value={productForm.shortDescription}
                                onChange={(event) => updateProductField('shortDescription', event.target.value)}
                                disabled={!canEdit || isSavingProduct || isLoading}
                                rows={4}
                                className={`${fieldClass} py-3 leading-6`}
                            />
                        </label>

                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            SEO JSON
                            <textarea
                                value={productForm.seoJson}
                                onChange={(event) => updateProductField('seoJson', event.target.value)}
                                disabled={!canEdit || isSavingProduct || isLoading}
                                rows={4}
                                className={`${fieldClass} py-3 font-mono text-xs leading-6 normal-case tracking-normal`}
                            />
                        </label>

                        <div className="mt-6 flex flex-wrap gap-2">
                            <ActionButton
                                disabled={!canEdit || isSavingProduct || isLoading}
                                label={isSavingProduct ? 'Saving' : 'Save product'}
                            />
                            <button
                                type="button"
                                disabled={!canEdit || isSavingProduct || isLoading}
                                onClick={() => void saveProduct('published')}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Publish product
                            </button>
                            <button
                                type="button"
                                disabled={!canEdit || isSavingProduct || isLoading}
                                onClick={() => void saveProduct('archived')}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/25"
                            >
                                <Archive className="h-4 w-4" />
                                Archive product
                            </button>
                        </div>
                    </form>

                    <section className="grid gap-5 lg:grid-cols-2">
                        <SubrecordEditor
                            title="Models"
                            eyebrow={`${models.length} rows`}
                            onNew={() => {
                                setSelectedModelId(null);
                                setModelForm(emptyModelForm);
                            }}
                            disabled={!canEdit || !selectedProduct}
                        >
                            <RecordChips
                                rows={models}
                                selectedId={selectedModelId}
                                getLabel={(row) => row.label}
                                onSelect={(row) => {
                                    setSelectedModelId(row.id);
                                    setModelForm(rowToModelForm(row));
                                }}
                            />
                            <SelectField
                                label="Status"
                                value={modelForm.status}
                                disabled={!canEdit || isSavingModel || !selectedProduct}
                                onChange={(value) => updateModelField('status', value as ProductStatus)}
                                options={statusOptions}
                            />
                            <TextField
                                label="Model key"
                                value={modelForm.modelKey}
                                disabled={!canEdit || isSavingModel || !selectedProduct || Boolean(selectedModel)}
                                onChange={(value) => updateModelField('modelKey', value)}
                            />
                            <TextField
                                label="Label"
                                value={modelForm.label}
                                disabled={!canEdit || isSavingModel || !selectedProduct}
                                onChange={(value) => updateModelField('label', value)}
                            />
                            <MediaSelect
                                label="Model image"
                                value={modelForm.imageMediaId}
                                disabled={!canEdit || isSavingModel || !selectedProduct}
                                mediaOptions={mediaOptions}
                                selectedMedia={selectedModelImage}
                                emptyLabel="No model image"
                                onChange={(value) => updateModelField('imageMediaId', value)}
                            />
                            <TextField
                                label="Sort order"
                                value={modelForm.sortOrder}
                                disabled={!canEdit || isSavingModel || !selectedProduct}
                                inputMode="numeric"
                                onChange={(value) => updateModelField('sortOrder', value)}
                            />
                            <div className="grid gap-2">
                                <button
                                    type="button"
                                    onClick={() => void saveModel(modelForm.status)}
                                    disabled={!canEdit || isSavingModel || !selectedProduct}
                                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                                >
                                    <Save className="h-4 w-4" />
                                    {isSavingModel ? 'Saving' : 'Save model'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void saveModel('published')}
                                    disabled={!canEdit || isSavingModel || !selectedProduct}
                                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Publish model
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void saveModel('archived')}
                                    disabled={!canEdit || isSavingModel || !selectedProduct}
                                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded bg-black px-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/25"
                                >
                                    <Archive className="h-4 w-4" />
                                    Archive model
                                </button>
                            </div>
                        </SubrecordEditor>

                        <SubrecordEditor
                            title="Specifications"
                            eyebrow={`${specs.length} rows`}
                            onNew={() => {
                                setSelectedSpecId(null);
                                setSpecForm(emptySpecForm);
                            }}
                            disabled={!canEdit || !selectedProduct}
                        >
                            <RecordChips
                                rows={specs}
                                selectedId={selectedSpecId}
                                getLabel={(row) => row.spec_label}
                                onSelect={(row) => {
                                    setSelectedSpecId(row.id);
                                    setSpecForm(rowToSpecForm(row));
                                }}
                            />
                            <TextField
                                label="Spec label"
                                value={specForm.specLabel}
                                disabled={!canEdit || isSavingSpec || !selectedProduct}
                                onChange={(value) => updateSpecField('specLabel', value)}
                            />
                            <TextField
                                label="Spec value"
                                value={specForm.specValue}
                                disabled={!canEdit || isSavingSpec || !selectedProduct}
                                onChange={(value) => updateSpecField('specValue', value)}
                            />
                            <TextField
                                label="Sort order"
                                value={specForm.sortOrder}
                                disabled={!canEdit || isSavingSpec || !selectedProduct}
                                inputMode="numeric"
                                onChange={(value) => updateSpecField('sortOrder', value)}
                            />
                            <button
                                type="button"
                                onClick={() => void saveSpec()}
                                disabled={!canEdit || isSavingSpec || !selectedProduct}
                                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                            >
                                <Save className="h-4 w-4" />
                                {isSavingSpec ? 'Saving' : 'Save spec'}
                            </button>
                        </SubrecordEditor>
                    </section>
                </section>

                <aside className="space-y-5">
                    <section className="border border-black/10 bg-black p-5 text-white">
                        <Layers3 className="h-5 w-5 text-[var(--urblo-lime)]" />
                        <h2 className="mt-5 text-xl font-semibold">Product health</h2>
                        <div className="mt-5 grid gap-3 text-sm leading-6 text-white/72">
                            <p>{models.length} model rows on the selected product.</p>
                            <p>{materialDefaults.length} material defaults configured.</p>
                            <p>{mediaOptions.length} media records available for ID linking.</p>
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Material default
                                </p>
                                <h2 className="mt-2 text-xl font-semibold text-black">
                                    {selectedMaterialDefaultId
                                        ? materialDefaults.find((row) => row.id === selectedMaterialDefaultId)
                                              ?.material_category
                                        : 'No default selected'}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedMaterialDefaultId(null);
                                    setMaterialDefaultForm(emptyMaterialDefaultForm);
                                }}
                                disabled={!canEdit || !selectedProduct}
                                className="inline-flex min-h-9 items-center gap-2 rounded border border-black/15 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black disabled:text-black/35"
                            >
                                <Plus className="h-4 w-4" />
                                New
                            </button>
                        </div>
                        <RecordChips
                            rows={materialDefaults}
                            selectedId={selectedMaterialDefaultId}
                            getLabel={(row) => `${row.material_category}: ${row.display_label ?? row.material_slug ?? 'TBC'}`}
                            onSelect={(row) => {
                                setSelectedMaterialDefaultId(row.id);
                                setMaterialDefaultForm(rowToMaterialDefaultForm(row));
                            }}
                        />
                        <SelectField
                            label="Category"
                            value={materialDefaultForm.materialCategory}
                            disabled={
                                !canEdit || isSavingMaterialDefault || !selectedProduct || Boolean(selectedMaterialDefaultId)
                            }
                            onChange={(value) => updateMaterialDefaultField('materialCategory', value as MaterialCategory)}
                            options={[
                                ['body', 'Body stone'],
                                ['frame', 'Frame'],
                                ['battens', 'Battens'],
                            ]}
                        />
                        <SelectField
                            label="Stone group"
                            value={materialDefaultForm.stoneGroupId}
                            disabled={!canEdit || isSavingMaterialDefault || !selectedProduct}
                            onChange={(value) => updateMaterialDefaultField('stoneGroupId', value)}
                            options={[
                                ['', 'No Stone Library link'],
                                ...stoneOptions.map((stone) => [String(stone.id), stone.display_name] as [string, string]),
                            ]}
                        />
                        {selectedDefaultStone ? (
                            <div className="border border-black/10 bg-[#f8f9f5] p-3">
                                <p className="text-sm font-semibold text-black">{selectedDefaultStone.display_name}</p>
                                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-black/45">
                                    Stone Library status: {selectedDefaultStone.status}
                                </p>
                                {selectedDefaultStone.status !== 'published' ? (
                                    <p className="mt-2 text-sm font-semibold leading-6 text-amber-800">
                                        This Stone Library row is not Published yet. Public product pages may keep using
                                        fallback/default material text until the stone is published.
                                    </p>
                                ) : null}
                            </div>
                        ) : null}
                        <TextField
                            label="Material slug"
                            value={materialDefaultForm.materialSlug}
                            disabled={!canEdit || isSavingMaterialDefault || !selectedProduct}
                            onChange={(value) => updateMaterialDefaultField('materialSlug', value)}
                        />
                        <TextField
                            label="Display label"
                            value={materialDefaultForm.displayLabel}
                            disabled={!canEdit || isSavingMaterialDefault || !selectedProduct}
                            onChange={(value) => updateMaterialDefaultField('displayLabel', value)}
                        />
                        <button
                            type="button"
                            onClick={() => void saveMaterialDefault()}
                            disabled={!canEdit || isSavingMaterialDefault || !selectedProduct}
                            className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                        >
                            <Save className="h-4 w-4" />
                            {isSavingMaterialDefault ? 'Saving' : 'Save material default'}
                        </button>
                    </section>

                    <section className="border border-black/10 bg-white p-5">
                        <ShieldAlert className="h-5 w-5 text-black" />
                        <h2 className="mt-5 text-xl font-semibold text-black">Publication guardrails</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                            <li>Published products require a lowercase slug and short description.</li>
                            <li>Published models should carry approved render media before public migration.</li>
                            <li>Material defaults can reference Stone Library rows or keep clear non-stone labels.</li>
                            <li>Physical deletes remain hidden; archive is the safe operational path.</li>
                        </ul>
                    </section>

                    {error ? (
                        <section className="border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
                            {error}
                        </section>
                    ) : null}
                    {notice ? (
                        <section className="border border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.10)] p-4 text-sm font-semibold leading-6 text-black">
                            {notice}
                        </section>
                    ) : null}
                    {!canEdit ? (
                        <section className="border border-black/10 bg-white p-5 text-sm leading-6 text-black/62">
                            Current role is read-only for Products. Ask an editor/admin to update product records.
                        </section>
                    ) : null}
                </aside>
            </div>
        </AdminShell>
    );
}

const statusOptions: Array<[string, string]> = [
    ['draft', 'Draft'],
    ['published', 'Published'],
    ['archived', 'Archived'],
];

function TextField({
    label,
    value,
    disabled,
    required,
    type = 'text',
    inputMode,
    onChange,
}: {
    label: string;
    value: string;
    disabled?: boolean;
    required?: boolean;
    type?: string;
    inputMode?: 'numeric';
    onChange: (value: string) => void;
}) {
    return (
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
            {label}
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                required={required}
                inputMode={inputMode}
                className={fieldClass}
            />
        </label>
    );
}

function SelectField({
    label,
    value,
    disabled,
    options,
    onChange,
}: {
    label: string;
    value: string;
    disabled?: boolean;
    options: Array<[string, string]>;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
            {label}
            <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={fieldClass}>
                {options.map(([optionValue, labelText]) => (
                    <option key={optionValue} value={optionValue}>
                        {labelText}
                    </option>
                ))}
            </select>
        </label>
    );
}

function findMediaOption(mediaOptions: MediaOptionRow[], value: string) {
    const mediaId = Number(value);
    if (!Number.isFinite(mediaId)) return null;
    return mediaOptions.find((media) => media.id === mediaId) ?? null;
}

function findStoneOption(stoneOptions: StoneOptionRow[], value: string) {
    const stoneId = Number(value);
    if (!Number.isFinite(stoneId)) return null;
    return stoneOptions.find((stone) => stone.id === stoneId) ?? null;
}

function getMediaUrl(asset: MediaOptionRow | null) {
    if (!asset) return null;
    return asset.source_url || asset.object_path;
}

function formatMediaOption(media: MediaOptionRow) {
    const label = media.alt || media.caption || media.object_path || media.source_url || `Asset ${media.id}`;
    return `#${media.id} / ${label}`;
}

function MediaSelect({
    label,
    value,
    disabled,
    mediaOptions,
    selectedMedia,
    emptyLabel,
    onChange,
}: {
    label: string;
    value: string;
    disabled?: boolean;
    mediaOptions: MediaOptionRow[];
    selectedMedia: MediaOptionRow | null;
    emptyLabel: string;
    onChange: (value: string) => void;
}) {
    const previewUrl = getMediaUrl(selectedMedia);

    return (
        <div className="space-y-2">
            <SelectField
                label={label}
                value={value}
                disabled={disabled}
                onChange={onChange}
                options={[
                    ['', emptyLabel],
                    ...mediaOptions.map((media) => [String(media.id), formatMediaOption(media)] as [string, string]),
                ]}
            />
            {selectedMedia ? (
                <div className="flex gap-3 border border-black/10 bg-[#f8f9f5] p-3">
                    <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden bg-white">
                        {previewUrl && selectedMedia.media_type === 'image' ? (
                            <img
                                src={previewUrl}
                                alt={selectedMedia.alt || selectedMedia.caption || label}
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <ImageIcon className="h-5 w-5 text-black/35" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-black">
                            {selectedMedia.alt || selectedMedia.caption || selectedMedia.object_path || `Asset ${selectedMedia.id}`}
                        </p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-black/45">
                            {selectedMedia.media_type} / {selectedMedia.status} / #{selectedMedia.id}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-black/52">
                            {selectedMedia.source_url || selectedMedia.object_path || 'No source path recorded.'}
                        </p>
                    </div>
                </div>
            ) : value ? (
                <p className="border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-800">
                    Selected media is not in the available media list.
                </p>
            ) : null}
        </div>
    );
}

function ActionButton({ disabled, label }: { disabled?: boolean; label: string }) {
    return (
        <button
            type="submit"
            disabled={disabled}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-black/15 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
        >
            <Save className="h-4 w-4" />
            {label}
        </button>
    );
}

function SubrecordEditor({
    title,
    eyebrow,
    disabled,
    onNew,
    children,
}: {
    title: string;
    eyebrow: string;
    disabled?: boolean;
    onNew: () => void;
    children: ReactNode;
}) {
    return (
        <section className="border border-black/10 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">{eyebrow}</p>
                    <h2 className="mt-2 text-xl font-semibold text-black">{title}</h2>
                </div>
                <button
                    type="button"
                    onClick={onNew}
                    disabled={disabled}
                    className="inline-flex min-h-9 items-center gap-2 rounded border border-black/15 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black disabled:text-black/35"
                >
                    <Plus className="h-4 w-4" />
                    New
                </button>
            </div>
            <div className="mt-5 space-y-4">{children}</div>
        </section>
    );
}

function RecordChips<T extends { id: number }>({
    rows,
    selectedId,
    getLabel,
    onSelect,
}: {
    rows: T[];
    selectedId: number | null;
    getLabel: (row: T) => string;
    onSelect: (row: T) => void;
}) {
    if (!rows.length) {
        return <p className="text-sm leading-6 text-black/50">No records yet.</p>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {rows.map((row) => (
                <button
                    key={row.id}
                    type="button"
                    onClick={() => onSelect(row)}
                    className={[
                        'inline-flex min-h-9 items-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.12em] transition',
                        row.id === selectedId
                            ? 'border-black bg-black text-white'
                            : 'border-black/15 bg-white text-black/58 hover:border-black hover:text-black',
                    ].join(' ')}
                >
                    {getLabel(row)}
                </button>
            ))}
        </div>
    );
}

function rowToProductForm(row: ProductRow | null): ProductFormState {
    if (!row) return emptyProductForm;

    return {
        status: row.status,
        slug: row.slug,
        name: row.name,
        shortDescription: row.short_description ?? '',
        heroMediaId: row.hero_media_id === null ? '' : String(row.hero_media_id),
        seoJson: row.seo ? JSON.stringify(row.seo, null, 2) : '',
        sortOrder: String(row.sort_order),
    };
}

function rowToModelForm(row: ProductModelRow | null): ModelFormState {
    if (!row) return emptyModelForm;

    return {
        status: row.status,
        modelKey: row.model_key,
        label: row.label,
        imageMediaId: row.image_media_id === null ? '' : String(row.image_media_id),
        sortOrder: String(row.sort_order),
    };
}

function rowToMaterialDefaultForm(row: ProductMaterialDefaultRow | null): MaterialDefaultFormState {
    if (!row) return emptyMaterialDefaultForm;

    return {
        materialCategory: row.material_category,
        stoneGroupId: row.stone_group_id === null ? '' : String(row.stone_group_id),
        materialSlug: row.material_slug ?? '',
        displayLabel: row.display_label ?? '',
    };
}

function rowToSpecForm(row: ProductSpecRow | null): SpecFormState {
    if (!row) return emptySpecForm;

    return {
        specLabel: row.spec_label,
        specValue: row.spec_value,
        sortOrder: String(row.sort_order),
    };
}

function validateProductForm(form: ProductFormState) {
    if (!form.name.trim()) return validationFailure('Product name is required.');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
        return validationFailure('Product slug must be lowercase kebab-case.');
    }

    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    const heroMediaId = optionalPositiveInteger(form.heroMediaId, 'Hero image');
    if (sortOrder.error) return validationFailure(sortOrder.error);
    if (heroMediaId.error) return validationFailure(heroMediaId.error);

    let seo: unknown = {};
    if (form.seoJson.trim()) {
        try {
            seo = JSON.parse(form.seoJson);
        } catch {
            return validationFailure('SEO JSON is not valid JSON.');
        }
    }

    if (form.status === 'published' && !form.shortDescription.trim()) {
        return validationFailure('Published products require a short description.');
    }

    return { error: null, sortOrder: sortOrder.value, heroMediaId: heroMediaId.value, seo };
}

function validateModelForm(form: ModelFormState) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.modelKey.trim())) {
        return validationFailure('Model key must be lowercase kebab-case.');
    }

    if (!form.label.trim()) return validationFailure('Model label is required.');

    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    const imageMediaId = optionalPositiveInteger(form.imageMediaId, 'Model image');
    if (sortOrder.error) return validationFailure(sortOrder.error);
    if (imageMediaId.error) return validationFailure(imageMediaId.error);

    if (form.status === 'published' && imageMediaId.value === null) {
        return validationFailure('Cannot publish model yet. Choose a model image first.');
    }

    return { error: null, sortOrder: sortOrder.value, imageMediaId: imageMediaId.value };
}

function validateMaterialDefaultForm(form: MaterialDefaultFormState) {
    const stoneGroupId = optionalPositiveInteger(form.stoneGroupId, 'Stone Library link');
    if (stoneGroupId.error) return validationFailure(stoneGroupId.error);

    if (stoneGroupId.value === null && !form.materialSlug.trim() && !form.displayLabel.trim()) {
        return validationFailure('Material defaults need a Stone Library link, material slug, or display label.');
    }

    return { error: null, stoneGroupId: stoneGroupId.value };
}

function validateSpecForm(form: SpecFormState) {
    if (!form.specLabel.trim()) return validationFailure('Spec label is required.');
    if (!form.specValue.trim()) return validationFailure('Spec value is required.');
    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    if (sortOrder.error) return validationFailure(sortOrder.error);
    return { error: null, sortOrder: sortOrder.value };
}

function validationFailure(error: string) {
    return { error };
}

function requiredInteger(value: string, label: string): { error: string | null; value: number } {
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
        return { error: `${label} must be a whole number.`, value: 0 };
    }
    return { error: null, value: parsed };
}

function optionalPositiveInteger(value: string, label: string): { error: string | null; value: number | null } {
    if (!value.trim()) return { error: null, value: null };
    return requiredPositiveInteger(value, label);
}

function requiredPositiveInteger(value: string, label: string): { error: string | null; value: number } {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return { error: `${label} must be a whole positive number.`, value: 0 };
    }
    return { error: null, value: parsed };
}

function summarizeProducts(products: ProductRow[]) {
    return products.reduce(
        (summary, product) => ({
            draft: summary.draft + (product.status === 'draft' ? 1 : 0),
            published: summary.published + (product.status === 'published' ? 1 : 0),
            archived: summary.archived + (product.status === 'archived' ? 1 : 0),
        }),
        { draft: 0, published: 0, archived: 0 },
    );
}
