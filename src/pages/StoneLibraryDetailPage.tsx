import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import FinishAccordion from '../components/stone-library/FinishAccordion';
import FinishLightbox from '../components/stone-library/FinishLightbox';
import ImageStage from '../components/stone-library/ImageStage';
import SpecsPanel from '../components/stone-library/SpecsPanel';
import VariantSwitch from '../components/stone-library/VariantSwitch';
import StoneLibraryService from '../service/StoneLibraryService';

function statusLabel(status: 'active' | 'tbc'): string {
    return status === 'tbc' ? 'Upcoming' : 'Available';
}

export default function StoneLibraryDetailPage() {
    const { stoneGroupId = '' } = useParams();

    const [selectedVariantId, setSelectedVariantId] = useState<string>('');
    const [lockedFinishKey, setLockedFinishKey] = useState<string | null>(null);
    const [centerRequestToken, setCenterRequestToken] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const detail = useMemo(
        () =>
            StoneLibraryService.getStoneDetail(
                stoneGroupId,
                selectedVariantId || undefined,
            ),
        [stoneGroupId, selectedVariantId],
    );

    if (!detail) {
        return <Navigate to="/stone-library" replace />;
    }

    const effectiveFinishKey = lockedFinishKey || detail.defaultFinishKey;

    const activeFinish = detail.finishes.find(
        (finish) => finish.finishKey === effectiveFinishKey,
    ) || detail.finishes[0];

    const mailSubject = encodeURIComponent(`Stone Enquiry: ${detail.name}`);

    function handleVariantChange(variantId: string) {
        setSelectedVariantId(variantId);
        setLockedFinishKey(null);
        setIsLightboxOpen(false);
    }

    function handleFinishSelect(finishKey: string) {
        setLockedFinishKey(finishKey);
        setCenterRequestToken((current) => current + 1);
    }

    function handleOpenLightbox(finishKey: string) {
        handleFinishSelect(finishKey);
        setIsLightboxOpen(true);
    }

    function handleCloseLightbox() {
        setIsLightboxOpen(false);
    }

    return (
        <>
            <header className="border-b border-neutral-800 bg-neutral-950 text-white">
                <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
                    <Link
                        to="/stone-library"
                        className="text-xs uppercase tracking-[0.12em] text-[#00FF19] hover:text-white"
                    >
                        Back to Stone Library
                    </Link>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <span className="border border-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                            {detail.stoneType}
                        </span>
                        <span className="border border-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                            {statusLabel(detail.status)}
                        </span>
                    </div>

                    <h1 className="mt-4 text-4xl font-semibold md:text-6xl">{detail.name}</h1>
                    <p className="mt-4 max-w-3xl text-sm text-neutral-300 md:text-base">
                        Evaluate finish behavior, sourcing metadata, and variant options in one place.
                    </p>
                </div>
            </header>

            <main className="bg-neutral-50 pb-16">
                <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:py-12">
                    <VariantSwitch
                        variants={detail.variants}
                        activeVariantId={detail.activeVariantId}
                        onChange={handleVariantChange}
                    />

                    <div className="grid gap-6 lg:items-start lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
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
                        originLabel={detail.originLabel}
                        rawBlockLabel={detail.rawBlockLabel}
                        dlName={detail.dlName}
                        availabilityLabel={detail.availabilityLabel}
                        priceRange={detail.priceRange}
                        priceTierLevel={detail.priceTierLevel}
                        priceTierLabel={detail.priceTierLabel}
                        pricePrimaryLabel={detail.pricePrimaryLabel}
                        finishCapabilities={detail.finishCapabilities}
                        cutOptions={detail.cutOptions}
                    />
                </section>

                <section className="border-y border-neutral-300 bg-white">
                    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Enquiry</p>
                            <h2 className="mt-2 text-2xl font-semibold text-neutral-950">
                                Discuss {detail.name} for your next project
                            </h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href={`mailto:info@urblo.com.au?subject=${mailSubject}`}
                                className="border border-neutral-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
                            >
                                Email Enquiry
                            </a>
                            <a
                                href="tel:1300187256"
                                className="border border-neutral-900 bg-neutral-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black"
                            >
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
                onClose={handleCloseLightbox}
                onSelectFinish={handleFinishSelect}
            />
        </>
    );
}
