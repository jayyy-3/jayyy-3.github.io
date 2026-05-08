import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ModelSelector from '../components/ModelSelector';
import OptionSelector from '../components/OptionSelector';
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

  const stoneOptions = useMemo(() => StoneLibraryService.getStoneGroupOptionsForProducts(), []);

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
    product.models.find((model) => model.key === currentModelKey) || product.models[0];

  return (
    <div className="bg-white">
      <section className="urblo-section-tight border-b border-black/10">
        <div className="urblo-page-container">
          <p className="urblo-eyebrow">Product Details</p>
          <h1 className="urblo-page-title">{product.name}</h1>
          {product.shortDesc ? <p className="urblo-page-copy">{product.shortDesc}</p> : null}
        </div>
      </section>

      <section className="urblo-section bg-[rgba(239,239,239,0.18)]">
        <div className="urblo-page-container grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-start">
          <div className="urblo-card overflow-hidden bg-white p-4">
            <div className="aspect-square overflow-hidden rounded-[4px] bg-black/5">
              <img src={currentModel.img} alt={product.name} className="h-full w-full object-contain" />
            </div>
          </div>

          <div className="urblo-card bg-white p-6 md:p-8">
            <p className="urblo-meta mb-4 text-black/65">Configurable system</p>
            <ModelSelector models={product.models} />
            <OptionSelector title="Body Stone" category="body" options={stoneOptions} />
            <OptionSelector title="Frame Finish" category="frame" options={frameFinishes} />
            <OptionSelector title="Batten Timber" category="battens" options={battenOptions} />
            <SpecTable product={product} />
          </div>
        </div>
      </section>
    </div>
  );
}
