import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ModelSelector from '../components/ModelSelector';
import OptionSelector from '../components/OptionSelector';
import RouteState from '../components/RouteState';
import SpecTable from '../components/SpecTable';
import { battenOptions } from '../data/battenData';
import { frameFinishes } from '../data/frameFinishData';
import ProductService from '../service/ProductService';
import StoneLibraryService from '../service/StoneLibraryService';
import { useProductStore } from '../store/productStore';
import type { MaterialCategory, OptionItem, Product } from '../types/product';

function findOption(options: readonly OptionItem[], slug?: string) {
  if (!slug) {
    return undefined;
  }

  return options.find((option) => option.slug === slug);
}

function encodeMailto(value: string) {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found' | 'error'>('loading');

  const storeSetProduct = useProductStore((state) => state.setProduct);
  const currentModelKey = useProductStore((state) => state.currentModelKey);
  const selectedMaterials = useProductStore((state) => state.selectedMaterials);
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

  if (slug && slug !== product.slug) {
    return <Navigate to={`/products/${product.slug}`} replace />;
  }

  const currentModel =
    product.models.find((model) => model.key === currentModelKey) || product.models[0];
  const selectedBody = findOption(
    stoneOptions,
    selectedMaterials.body ?? product.defaultMaterials?.body,
  );
  const selectedFrame = findOption(
    frameFinishes,
    selectedMaterials.frame ?? product.defaultMaterials?.frame,
  );
  const selectedBattens = findOption(
    battenOptions,
    selectedMaterials.battens ?? product.defaultMaterials?.battens,
  );
  const hasPendingSelectionImage = [selectedBody, selectedFrame, selectedBattens].some(
    (option) => option?.imageState === 'pending',
  );
  const configurationRows = [
    { label: 'Model', value: currentModel.label },
    { label: 'Body stone', value: selectedBody?.name ?? 'Select a body stone' },
    { label: 'Frame finish', value: selectedFrame?.name ?? 'Select a frame finish' },
    { label: 'Battens', value: selectedBattens?.name ?? 'Select batten material' },
  ];
  const previewRows = [
    { label: 'Body stone', option: selectedBody },
    { label: 'Frame finish', option: selectedFrame },
    { label: 'Battens', option: selectedBattens },
  ];
  const mailSubject = `Urblo product enquiry: ${product.name} - ${currentModel.label}`;
  const mailBody = [
    `Product: ${product.name}`,
    `Model: ${currentModel.label}`,
    `Body stone: ${selectedBody?.name ?? 'Not selected'}`,
    'Body finish: Confirm through project sample review',
    `Frame finish: ${selectedFrame?.name ?? 'Not selected'}`,
    `Battens: ${selectedBattens?.name ?? 'Not selected'}`,
    '',
    'Project notes:',
  ].join('\n');
  const configurationMailto = `mailto:info@urblo.com.au?subject=${encodeMailto(
    mailSubject,
  )}&body=${encodeMailto(mailBody)}`;

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
            <div className="mt-4 border-t border-black/10 pt-4">
              <p className="urblo-meta text-black/60">Model preview</p>
              <p className="mt-2 text-sm leading-6 text-black/62">
                This render shows product geometry. Stone, frame, and batten selections are captured
                below for sample confirmation rather than composited into the render.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {previewRows.map(({ label, option }) => (
                <div key={label} className="border border-black/10 bg-[rgba(239,239,239,0.24)] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/52">
                    {label}
                  </p>
                  <div className="mt-3 aspect-[4/3] overflow-hidden bg-white">
                    {option ? (
                      <img
                        src={option.img}
                        alt=""
                        aria-hidden="true"
                        className={[
                          'h-full w-full object-cover',
                          option.imageState === 'pending' ? 'opacity-70 grayscale' : '',
                        ].join(' ')}
                      />
                    ) : null}
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-5 text-black">
                    {option?.name ?? 'To confirm'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="urblo-card bg-white p-6 md:p-8">
            <p className="urblo-meta mb-4 text-black/65">Configure for project discussion</p>
            <ModelSelector models={product.models} />
            <OptionSelector title="Body Stone" category="body" options={stoneOptions} />
            <OptionSelector title="Frame Finish" category="frame" options={frameFinishes} />
            <OptionSelector title="Batten Timber" category="battens" options={battenOptions} />

            <section className="mt-8 border border-black/10 bg-[rgba(239,239,239,0.2)] p-5">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="urblo-meta text-black/65">Selected configuration</p>
                  <h2 className="mt-2 text-[22px] font-semibold leading-tight text-black">
                    {product.name} / {currentModel.label}
                  </h2>
                </div>
                <a
                  href={configurationMailto}
                  className="urblo-button-inverse w-full text-center sm:w-fit"
                >
                  Discuss this configuration
                </a>
              </div>

              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                {configurationRows.map((row) => (
                  <div key={row.label} className="border-t border-black/10 pt-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/55">
                      {row.label}
                    </dt>
                    <dd className="mt-1 text-[15px] font-semibold leading-6 text-black">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {hasPendingSelectionImage ? (
                <p className="mt-4 text-sm leading-6 text-black/65">
                  One selected swatch is waiting on approved imagery. Confirm final sample and finish
                  before using this configuration for sign-off.
                </p>
              ) : null}

              <p className="mt-4 text-sm leading-6 text-black/65">
                Body-stone finish is confirmed through Stone Library review and physical samples.
                The product image remains a geometry preview until final project materials are approved.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/contact" className="urblo-button">
                  Contact Urblo
                </Link>
                <Link to="/stone-library" className="urblo-button">
                  Compare Stone Library
                </Link>
              </div>
            </section>

            <div className="mt-8">
              <p className="urblo-meta text-black/65">Specification cues</p>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Treat these values as discussion cues. Final dimensions, engineering, fixings,
                and lead time should be confirmed against the project scope.
              </p>
            </div>
            <SpecTable product={product} />
          </div>
        </div>
      </section>
    </div>
  );
}
