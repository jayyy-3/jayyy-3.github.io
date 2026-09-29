import { useState } from 'react';
import FinishAccordion from '../components/stone-library/FinishAccordion';
import FinishLightbox from '../components/stone-library/FinishLightbox';
import ImageStage from '../components/stone-library/ImageStage';
import SpecsPanel from '../components/stone-library/SpecsPanel';
import StoneProjectsSection from '../components/stone-library/StoneProjectsSection';
import StatusPill from '../components/stone-library/StatusPill';
import StoneDetailCompare from '../components/stone-library/StoneDetailCompare';
import VariantSwitch from '../components/stone-library/VariantSwitch';
import PublicContentSeo from '../components/PublicContentSeo';
import type { StoneProjectUsage } from '../service/ProjectService';
import type { StoneDetailVM } from '../types/stone-library';
import { getStoneShareImageUrl } from '../lib/stoneImageDelivery';
import Button from '../components/ui/Button';
import PageIntro from '../components/ui/PageIntro';
import SectionHeading from '../components/ui/SectionHeading';
import { siteContact } from '../data/siteChrome';

function statusLabel(status: 'active' | 'tbc') {
  return status === 'tbc' ? 'Upcoming' : 'Available';
}
export default function StonePageView({
  detail,
  onVariantChange,
  onFinishChange,
  refreshing = false,
  preview = false,
  initialFinish = null,
  projectUsages = [],
}: {
  detail: StoneDetailVM;
  onVariantChange: (id: string) => void;
  onFinishChange?: (params: URLSearchParams) => void;
  refreshing?: boolean;
  preview?: boolean;
  initialFinish?: string | null;
  /** Public reverse references; the admin preview never passes or renders them. */
  projectUsages?: StoneProjectUsage[];
}) {
  const selectedVariantId = detail.activeVariantId;
  const [lockedFinishKey, setLockedFinishKey] = useState<string | null>(
    initialFinish,
  );
  const [centerRequestToken, setCenterRequestToken] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxFrameIndex, setLightboxFrameIndex] = useState(0);
  const effectiveFinishKey = lockedFinishKey || detail.defaultFinishKey;
  const activeFinish =
    detail.finishes.find((finish) => finish.finishKey === effectiveFinishKey) ||
    detail.finishes[0];
  const isRefreshingVariant = refreshing;
  const variantLabel = detail.variants.every(
    (variant) => variant.variantType === 'cut_orientation',
  )
    ? 'Cut direction'
    : 'Variant';
  const mailSubject = encodeURIComponent('Stone Enquiry: ' + detail.name);
  const finishLabelByKey = new Map<string, string>([
    ...detail.finishCapabilities.map((finish) => [finish.finishKey, finish.label] as const),
    ...detail.finishes.map((finish) => [finish.finishKey, finish.label] as const),
  ]);

  function handleVariantChange(variantId: string) {
    onVariantChange(variantId);
    setLockedFinishKey(null);

    setIsLightboxOpen(false);
    setLightboxFrameIndex(0);
  }

  function handleFinishSelect(finishKey: string) {
    setLockedFinishKey(finishKey);
    const next = new URLSearchParams();
    if (selectedVariantId) next.set('variant', selectedVariantId);
    next.set('finish', finishKey);
    onFinishChange?.(next);
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
      {!preview && detail.contentSource === 'cms' ? (
        <PublicContentSeo
          canonicalPath={`/stone-library/${detail.stoneGroupId}`}
          fallbackTitle={`${detail.name} ${detail.stoneType} | Urblo Stone Library`}
          fallbackDescription={`Review ${detail.name} in the Urblo Stone Library, including finish options, sourcing notes, and public realm application guidance.`}
          image={getStoneShareImageUrl(activeFinish?.imageUrl)}
        />
      ) : null}
      <PageIntro
        band
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Stone Library', to: '/stone-library' },
          { label: detail.name },
        ]}
        meta={
          <>
            <span className="rounded border border-line bg-surface px-3 py-1 text-micro font-semibold uppercase tracking-caps text-ink">
              {detail.stoneType}
            </span>
            <StatusPill
              label={statusLabel(detail.status)}
              tone={detail.status === 'tbc' ? 'upcoming' : 'available'}
            />
            {!preview ? (
              <StoneDetailCompare stoneGroupId={detail.stoneGroupId} stoneName={detail.name} />
            ) : null}
          </>
        }
        title={detail.name}
        lede={detail.summary || 'Evaluate finish behavior, sourcing metadata, and variant options in one place.'}
        ledeClassName="max-w-[48rem]"
      />

      <div className="bg-surface">
        <section className="py-section-tight">
          <div className="urblo-page-container space-y-8">
            <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.58fr)_minmax(310px,0.92fr)] lg:items-start">
              <ImageStage
                stoneName={detail.name}
                finishes={detail.finishes}
                activeFinishKey={activeFinish?.finishKey || null}
                centerRequestToken={centerRequestToken}
                onSelect={handleFinishSelect}
                onOpenLightbox={handleOpenLightbox}
              />

              <section
                aria-label="Stone selection"
                aria-busy={isRefreshingVariant}
                className="min-w-0 space-y-5"
              >
                <VariantSwitch
                  variants={detail.variants}
                  activeVariantId={selectedVariantId || detail.activeVariantId}
                  label={variantLabel}
                  disabled={isRefreshingVariant}
                  onChange={handleVariantChange}
                />

                <FinishAccordion
                  finishes={detail.finishes}
                  activeFinishKey={activeFinish?.finishKey || null}
                  onSelect={handleFinishSelect}
                />

                {isRefreshingVariant ? (
                  <p
                    className="text-meta font-semibold uppercase tracking-caps text-muted"
                    role="status"
                  >
                    Updating cut and finish options
                  </p>
                ) : null}
              </section>
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
          {!preview ? (
            <StoneProjectsSection
              stoneName={detail.name}
              usages={projectUsages}
              activeFinishKey={activeFinish?.finishKey ?? null}
              finishLabelByKey={finishLabelByKey}
            />
          ) : null}
        </section>

        <section className="border-y border-line bg-white">
          <div className="urblo-page-container flex flex-col gap-6 py-section-tight md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Enquiry"
              title={`Discuss ${detail.name} for your next project`}
              className="max-w-[48rem]"
            />
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" href={`mailto:${siteContact.email}?subject=` + mailSubject}>
                Email Urblo
              </Button>
              <Button href="tel:1300187256" aria-label={`Call ${siteContact.phoneDisplay} (${siteContact.phoneDigits})`}>
                Call {siteContact.phoneDisplay}
              </Button>
            </div>
          </div>
        </section>
      </div>

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
