import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductService from '../service/ProductService.ts';
import { useProductStore } from '../store/productStore';
import ModelSelector from '../components/ModelSelector';
import SpecTable from '../components/SpecTable';
import type { Product } from '../types/product';
import { frameFinishes } from "../data/frameFinishData.ts";
import OptionSelector from "../components/OptionSelector.tsx";
import { stoneMaterials } from "../data/materialData.ts";
import { battenOptions } from "../data/battenData.ts";

export default function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [product, setProduct] = useState<Product | null>(null);

    // 不将 setProduct 放入 useEffect 依赖中，避免无限 loop
    const storeSetProduct = useProductStore.getState().setProduct;
    const currentModelKey = useProductStore((s) => s.currentModelKey);

    useEffect(() => {
        if (!slug) return;

        ProductService.getBySlug(slug).then((p) => {
            if (p) {
                setProduct(p);
                storeSetProduct(p.slug, p.models[0].key);
            }
        });
    }, [slug]); // ✅ 仅依赖 slug，避免 Zustand setter 触发 loop

    if (!product) return null;

    const currentModel =
        product.models.find((m) => m.key === currentModelKey) ??
        product.models[0];

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="grid gap-8 md:grid-cols-2">
                {/* Hero */}
                <div className="aspect-square overflow-hidden rounded shadow">
                    <img
                        src={currentModel.img}
                        alt={product.name}
                        className="h-full w-full object-contain"
                    />
                </div>

                {/* Controls */}
                <div>
                    <h1 className="mb-4 text-3xl font-bold">{product.name}</h1>
                    {product.shortDesc && (
                        <p className="mb-6 text-gray-700">{product.shortDesc}</p>
                    )}

                    <ModelSelector models={product.models} />
                    <OptionSelector
                        title="Body Stone"
                        category="body"
                        options={stoneMaterials}
                        whitelist={['new-grey', 'sesame-white', 'blue-ocean', '']}
                    />

                    <OptionSelector
                        title="Frame Finish"
                        category="frame"
                        options={frameFinishes}
                    />

                    <OptionSelector
                        title="Batten Timber"
                        category="battens"
                        options={battenOptions}
                    />
                    <SpecTable product={product} />
                </div>
            </div>
        </div>
    );
}
