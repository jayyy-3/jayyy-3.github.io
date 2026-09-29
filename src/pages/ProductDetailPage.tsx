import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import ModelSelector from '../components/ModelSelector';
import OptionSelector from '../components/OptionSelector';
import RouteState from '../components/RouteState';
import PublicContentSeo from '../components/PublicContentSeo';
import SpecTable from '../components/SpecTable';
import StoneResponsiveImage from '../components/stone-library/StoneResponsiveImage';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageIntro from '../components/ui/PageIntro';
import { cardTitleClassName } from '../components/ui/styles';
import { siteContact, siteCtas } from '../data/siteChrome';
import { battenOptions } from '../data/battenData';
import { frameFinishes } from '../data/frameFinishData';
import ProductService from '../service/ProductService';
import StoneLibraryService from '../service/StoneLibraryService';
import { useProductStore } from '../store/productStore';
import type { MaterialCategory, OptionItem, Product } from '../types/product';
import StaticResponsiveImage from '../components/StaticResponsiveImage';

function findOption(options: readonly OptionItem[], slug?: string) {
  if (!slug) {
    return undefined;
  }

  return options.find((option) => option.slug === slug);
}

function encodeMailto(value: string) {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

const labelClassName = 'text-meta font-semibold uppercase tracking-caps text-muted';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found' | 'error'>('loading');

  const storeSetProduct = useProductStore((state) => state.setProduct);
  const currentModelKey = useProductStore((state) => state.currentModelKey);
  const selectedMaterials = useProductStore((state) => state.selectedMaterials);
  const setMaterial = useProductStore((state) => state.setMaterial);

  const [stoneOptions, setStoneOptions] = useState<OptionItem[]>([]);

  useEffect(() => {
    if (!slug) {
      setProduct(null);
      setStatus('not-found');
      return;
    }

    let isCurrent = true;
    setProduct(null);
    setStatus('loading');

    Promise.all([ProductService.getBySlug(slug), StoneLibraryService.getPublicStoneGroupOptionsForProducts()])
      .then(([result, options]) => {
        setStoneOptions(options);
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
  const configurationMailto = `mailto:${siteContact.email}?subject=${encodeMailto(
    mailSubject,
  )}&body=${encodeMailto(mailBody)}`;

  return (
    <div className="bg-white">
      {product.contentSource === 'cms' ? (
        <PublicContentSeo
          canonicalPath={`/products/${product.slug}`}
          fallbackTitle={`${product.name} Stone Streetscape Product | Urblo`}
          fallbackDescription={
            product.shortDesc ||
            `Explore ${product.name}, an Urblo modular stone product system for streetscape and public realm projects.`
          }
          image={currentModel.img}
          seo={product.seo}
        />
      ) : null}
      <PageIntro
        band
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Products', to: '/products' },
          { label: product.name },
        ]}
        title={product.name}
        lede={product.shortDesc || undefined}
      />

      <section className="urblo-section bg-surface">
        <div className="urblo-page-container grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-start">
          <Card className="p-4">
            <div className="aspect-square overflow-hidden rounded bg-black/5">
              <StaticResponsiveImage
                src={currentModel.img}
                sizes="(min-width: 1024px) 50vw, 100vw"
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="mt-4 border-t border-line pt-4">
              <p className={labelClassName}>Model preview</p>
              <p className="mt-2 text-small text-muted">
                This render shows product geometry. Stone, frame, and batten selections are captured
                below for sample confirmation rather than composited into the render.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {previewRows.map(({ label, option }) => (
                <div key={label} className="border border-line bg-surface p-3">
                  <p className={labelClassName}>{label}</p>
                  <div className="mt-3 aspect-[4/3] overflow-hidden bg-white">
                    {option ? (
                      <StoneResponsiveImage
                        src={option.img}
                        profile="preview"
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className={[
                          'h-full w-full object-cover',
                          option.imageState === 'pending' ? 'opacity-70 grayscale' : '',
                        ].join(' ')}
                      />
                    ) : null}
                  </div>
                  <p className="mt-2 text-meta font-semibold text-ink">
                    {option?.name ?? 'To confirm'}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:p-8">
            <p className={`${labelClassName} mb-4`}>Configure for project discussion</p>
            <ModelSelector models={product.models} />
            <OptionSelector title="Body stone" category="body" options={stoneOptions} />
            <OptionSelector title="Frame finish" category="frame" options={frameFinishes} />
            <OptionSelector title="Batten timber" category="battens" options={battenOptions} />

            <section className="mt-8 border-t border-ink bg-surface p-5">
              <div className="flex flex-col gap-4">
                <div>
                  <p className={labelClassName}>Selected configuration</p>
                  <h2 className={`mt-2 ${cardTitleClassName()}`}>
                    {product.name} / {currentModel.label}
                  </h2>
                </div>
                <Button
                  href={configurationMailto}
                  aria-label={`Email Urblo about ${product.name} / ${currentModel.label}`}
                  className="w-full sm:w-fit"
                >
                  Email Urblo
                </Button>
              </div>

              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                {configurationRows.map((row) => (
                  <div key={row.label} className="border-t border-line pt-3">
                    <dt className={labelClassName}>{row.label}</dt>
                    <dd className="mt-1 text-copy font-semibold text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>

              {hasPendingSelectionImage ? (
                <p className="mt-4 text-small text-muted">
                  One selected swatch is waiting on approved imagery. Confirm final sample and finish
                  before using this configuration for sign-off.
                </p>
              ) : null}

              <p className="mt-4 text-small text-muted">
                Body-stone finish is confirmed through Stone Library review and physical samples.
                The product image remains a geometry preview until final project materials are approved.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="ghost" to={siteCtas.contact.to}>
                  {siteCtas.contact.label}
                </Button>
                <Button variant="ghost" to={siteCtas.stoneLibrary.to}>
                  {siteCtas.stoneLibrary.label}
                </Button>
              </div>
            </section>

            <div className="mt-8">
              <p className={labelClassName}>Specification cues</p>
              <p className="mt-3 text-small text-muted">
                Treat these values as discussion cues. Final dimensions, engineering, fixings,
                and lead time should be confirmed against the project scope.
              </p>
            </div>
            <SpecTable product={product} />
          </Card>
        </div>
      </section>
    </div>
  );
}
