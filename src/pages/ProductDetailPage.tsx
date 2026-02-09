import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import OptionSelector from '../components/OptionSelector';
import ModelSelector from '../components/ModelSelector';
import SpecTable from '../components/SpecTable';
import { battenOptions } from '../data/battenData';
import { frameFinishes } from '../data/frameFinishData';
import ProductService from '../service/ProductService';
import StoneLibraryService from '../service/StoneLibraryService';
import { useProductStore } from '../store/productStore';
import type { Product } from '../types/product';

export default function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [product, setProduct] = useState<Product | null>(null);

    const storeSetProduct = useProductStore((state) => state.setProduct);
    const currentModelKey = useProductStore((state) => state.currentModelKey);

    const stoneOptions = useMemo(
        () => StoneLibraryService.getStoneGroupOptionsForProducts(),
        [],
    );

    useEffect(() => {
        if (!slug) {
            return;
        }

        ProductService.getBySlug(slug).then((result) => {
            if (!result) {
                return;
            }

            setProduct(result);
            storeSetProduct(result.slug, result.models[0].key);
        });
    }, [slug, storeSetProduct]);

    if (!product) {
        return null;
    }

    const currentModel =
        product.models.find((model) => model.key === currentModelKey) ||
        product.models[0];

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="grid gap-8 md:grid-cols-2">
                <div className="aspect-square overflow-hidden rounded shadow">
                    <img
                        src={currentModel.img}
                        alt={product.name}
                        className="h-full w-full object-contain"
                    />
                </div>

                <div>
                    <h1 className="mb-4 text-3xl font-bold">{product.name}</h1>
                    {product.shortDesc ? (
                        <p className="mb-6 text-gray-700">{product.shortDesc}</p>
                    ) : null}

                    <ModelSelector models={product.models} />

                    <OptionSelector
                        title="Body Stone"
                        category="body"
                        options={stoneOptions}
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
