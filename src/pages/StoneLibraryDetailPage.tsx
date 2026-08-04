import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import FinishAccordion from '../components/stone-library/FinishAccordion';
import FinishLightbox from '../components/stone-library/FinishLightbox';
import ImageStage from '../components/stone-library/ImageStage';
import SpecsPanel from '../components/stone-library/SpecsPanel';
import StatusPill from '../components/stone-library/StatusPill';
import VariantSwitch from '../components/stone-library/VariantSwitch';
import RouteState from '../components/RouteState';
import PublicContentSeo from '../components/PublicContentSeo';
import StoneLibraryService from '../service/StoneLibraryService';
import type { StoneDetailVM } from '../types/stone-library';

function statusLabel(status: 'active' | 'tbc'): string {
  return status === 'tbc' ? 'Upcoming' : 'Available';
}

export default function StoneLibraryDetailPage() {
  const { stoneGroupId = '' } = useParams();

  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [lockedFinishKey, setLockedFinishKey] = useState<string | null>(null);
  const [centerRequestToken, setCenterRequestToken] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxFrameIndex, setLightboxFrameIndex] = useState(0);
  const [detail, setDetail] = useState<StoneDetailVM | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let isCurrent = true;
    setStatus('loading');
    setDetail(null);

    StoneLibraryService.getPublishedStoneDetail(stoneGroupId, selectedVariantId || undefined)
      .then((publishedDetail) => {
        if (!isCurrent) return;
        const fallbackDetail =
          publishedDetail ||
          StoneLibraryService.getStoneDetail(stoneGroupId, selectedVariantId || undefined);
        setDetail(fallbackDetail);
        setStatus('ready');
      })
      .catch(() => {
        if (!isCurrent) return;
        const fallbackDetail = StoneLibraryService.getStoneDetail(stoneGroupId, selectedVariantId || undefined);
        setDetail(fallbackDetail);
        setStatus(fallbackDetail ? 'ready' : 'error');
      });

    return () => {
      isCurrent = false;
    };
  }, [stoneGroupId, selectedVariantId]);

  if (status === 'loading') {
    return (
      <RouteState
        eyebrow="Loading"
        title="Preparing stone detail"
        copy="The stone detail is loading. This should only take a moment."
        headerOffset
      />
    );
  }

  if (status === 'error') {
    return (
      <RouteState
        eyebrow="Stone Library Error"
        title="Stone detail could not load"
        copy="The stone detail could not be loaded right now. Return to the Stone Library or contact Urblo if this keeps happening."
        headerOffset
        actions={[
          { label: 'Stone Library', to: '/stone-library' },
          { label: 'Contact Us', to: '/contact', variant: 'secondary' },
        ]}
      />
    );
  }

  if (!detail) {
    return <Navigate to="/stone-library" replace />;
  }

  const effectiveFinishKey = lockedFinishKey || detail.defaultFinishKey;
  const activeFinish = detail.finishes.find((finish) => finish.finishKey === effectiveFinishKey) || detail.finishes[0];
  const mailSubject = encodeURIComponent('Stone Enquiry: ' + detail.name);

  function handleVariantChange(variantId: string) {
    setSelectedVariantId(variantId);
    setLockedFinishKey(null);
    setIsLightboxOpen(false);
    setLightboxFrameIndex(0);
  }

  function handleFinishSelect(finishKey: string) {
    setLockedFinishKey(finishKey);
    setLightboxFrameIndex(0);
    setCenterRequestToken((current) => current + 1);
  }

  function handleOpenLightbox(finishKey: string, frameIndex = 0) {
    handleFinishSelect(finishKey);
    setLightboxFrameIndex(frameIndex);
    setIsLightboxOpen(true);
  }

  return (
    <div className="bg-white">
      {detail.contentSource === 'cms' ? (
        <PublicContentSeo
          canonicalPath={`/stone-library/${detail.stoneGroupId}`}
          fallbackTitle={`${detail.name} ${detail.stoneType} | Urblo Stone Library`}
          fallbackDescription={`Review ${detail.name} in the Urblo Stone Library, including finish options, sourcing notes, and public realm application guidance.`}
          image={activeFinish?.imageUrl}
        />
      ) : null}
      <nav className="border-b border-black/10 bg-white/92 py-4">
        <div className="urblo-page-container flex flex-wrap items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-black/55">
          <Link to="/stone-library" className="hover:text-[var(--urblo-lime)]">
            Stone Library
          </Link>
          <span>/</span>
          <span className="text-black">{detail.name}</span>
        </div>
      </nav>

      <section className="border-b border-black/10 py-10 md:py-12">
        <div className="urblo-page-container">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-[4px] border border-black/10 bg-[rgba(239,239,239,0.55)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black">
              {detail.stoneType}
            </span>
            <StatusPill
              label={statusLabel(detail.status)}
              tone={detail.status === 'tbc' ? 'upcoming' : 'available'}
            />
          </div>
          <p className="urblo-eyebrow mt-6">Stone Detail</p>
          <h1 className="urblo-page-title">{detail.name}</h1>
          <p className="mt-5 max-w-[48rem] text-[18px] font-medium leading-8 text-[var(--urblo-text)] md:text-[19px]">
            Evaluate finish behavior, sourcing metadata, and variant options in one place.
          </p>
        </div>
      </section>

      <main className="bg-[rgba(239,239,239,0.26)] pb-14">
        <section className="py-9 md:py-11">
          <div className="urblo-page-container space-y-8">
            <VariantSwitch
              variants={detail.variants}
              activeVariantId={detail.activeVariantId}
              onChange={handleVariantChange}
            />

            <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.58fr)_minmax(310px,0.92fr)] lg:items-start">
              <ImageStage
                stoneName={detail.name}
                finishes={detail.finishes}
                activeFinishKey={activeFinish?.finishKey || null}
                centerRequestToken={centerRequestToken}
                onSelect={handleFinishSelect}
                onOpenLightbox={handleOpenLightbox}
              />

              <FinishAccordion
                finishes={detail.finishes}
                activeFinishKey={activeFinish?.finishKey || null}
                onSelect={handleFinishSelect}
              />
            </div>

            <SpecsPanel
              stoneType={detail.stoneType}
              rawBlockLabel={detail.rawBlockLabel}
              availabilityStatus={detail.status}
              availabilityLabel={detail.availabilityLabel}
              priceRange={detail.priceRange}
              priceTierLevel={detail.priceTierLevel}
              priceTierLabel={detail.priceTierLabel}
              pricePrimaryLabel={detail.pricePrimaryLabel}
              finishCapabilities={detail.finishCapabilities}
              cutOptions={detail.cutOptions}
            />
          </div>
        </section>

        <section className="border-y border-black/10 bg-white">
          <div className="urblo-page-container flex flex-col gap-5 py-10 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="urblo-eyebrow">Enquiry</p>
              <h2 className="mt-4 font-display text-[34px] font-semibold uppercase leading-[1.08] tracking-[0.03em] text-black md:text-[42px]">
                Discuss {detail.name} for your next project
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={'mailto:info@urblo.com.au?subject=' + mailSubject} className="urblo-button">
                Email Enquiry
              </a>
              <a href="tel:1300187256" className="urblo-button-inverse">
                Call 1300 1 URBLO
              </a>
            </div>
          </div>
        </section>
      </main>

      <FinishLightbox
        isOpen={isLightboxOpen}
        finishes={detail.finishes}
        activeFinishKey={activeFinish?.finishKey || null}
        stoneName={detail.name}
        initialFrameIndex={lightboxFrameIndex}
        onClose={() => setIsLightboxOpen(false)}
        onSelectFinish={(finishKey) => {
          setLightboxFrameIndex(0);
          handleFinishSelect(finishKey);
        }}
      />
    </div>
  );
}
