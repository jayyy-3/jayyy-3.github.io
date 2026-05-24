import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ModelSelector from '../components/ModelSelector';
import OptionSelector from '../components/OptionSelector';
import RouteState from '../components/RouteState';
import SpecTable from '../components/SpecTable';
import { battenOptions } from '../data/battenData';
import { frameFinishes } from '../data/frameFinishData';
import ProductService from '../service/ProductService';
import StoneLibraryService from '../service/StoneLibraryService';
import { useProductStore } from '../store/productStore';
import type { MaterialCategory, Product } from '../types/product';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found' | 'error'>('loading');

  const storeSetProduct = useProductStore((state) => state.setProduct);
  const currentModelKey = useProductStore((state) => state.currentModelKey);
  const setMaterial = useProductStore((state) => state.setMaterial);

  const stoneOptions = useMemo(() => StoneLibraryService.getStoneGroupOptionsForProducts(), []);

  useEffect(() => {
    if (!slug) {
      setProduct(null);
      setStatus('not-found');
      return;
    }

    let isCurrent = true;
    setProduct(null);
    setStatus('loading');

    ProductService.getBySlug(slug)
      .then((result) => {
        if (!isCurrent) {
          return;
        }

        if (!result) {
          setStatus('not-found');
          return;
        }

        setProduct(result);
        setStatus('ready');
        storeSetProduct(result.slug, result.models[0].key);

        Object.entries(result.defaultMaterials ?? {}).forEach(([category, materialSlug]) => {
          if (materialSlug) {
            setMaterial(category as MaterialCategory, materialSlug);
          }
        });
      })
      .catch(() => {
        if (isCurrent) {
          setStatus('error');
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [setMaterial, slug, storeSetProduct]);

  if (status === 'loading') {
    return (
      <RouteState
        eyebrow="Loading"
        title="Preparing product"
        copy="The product detail is loading. This should only take a moment."
      />
    );
  }

  if (status === 'error') {
    return (
      <RouteState
        eyebrow="Product Error"
        title="Product could not load"
        copy="The product detail could not be loaded right now. Return to the product list or contact Urblo if this keeps happening."
        actions={[
          { label: 'Products', to: '/products' },
          { label: 'Contact Us', to: '/contact', variant: 'secondary' },
        ]}
      />
    );
  }

  if (!product) {
    return (
      <RouteState
        eyebrow="Product Not Found"
        title="Product not found"
        copy="This product link does not match a published Urblo product. Browse the product range or contact Urblo for help."
        actions={[
          { label: 'Products', to: '/products' },
          { label: 'Contact Us', to: '/contact', variant: 'secondary' },
        ]}
      />
    );
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
