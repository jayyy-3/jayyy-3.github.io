import type {
    FinishCapabilityVM,
    StoneCutOptionRaw,
    StonePriceTierLabel,
    StonePriceTierLevel,
} from '../../types/stone-library';

interface SpecsPanelProps {
    stoneType: string;
    originLabel: string;
    rawBlockLabel: string;
    dlName: string | null;
    availabilityLabel: string;
    priceRange: string;
    priceTierLevel: StonePriceTierLevel | null;
    priceTierLabel: StonePriceTierLabel | null;
    pricePrimaryLabel: string;
    finishCapabilities: FinishCapabilityVM[];
    cutOptions: StoneCutOptionRaw[];
}

function capabilityBadge(capability: FinishCapabilityVM['capability']): string {
    if (capability === 'yes') {
        return 'Available';
    }
    if (capability === 'tbc') {
        return 'Upcoming';
    }
    return 'No';
}

function cutOrientationLabel(value: string): string {
    return value
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function SpecsPanel({
    stoneType,
    originLabel,
    rawBlockLabel,
    dlName,
    availabilityLabel,
    priceRange,
    priceTierLevel,
    priceTierLabel,
    pricePrimaryLabel,
    finishCapabilities,
    cutOptions,
}: SpecsPanelProps) {
    return (
        <section className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
                <div className="urblo-card p-4 shadow-none">
                    <p className="urblo-meta text-black/55">
                        Type
                    </p>
                    <p className="mt-2 text-base text-black">{stoneType}</p>
                </div>
                <div className="urblo-card p-4 shadow-none">
                    <p className="urblo-meta text-black/55">
                        Origin
                    </p>
                    <p className="mt-2 text-base text-black">{originLabel}</p>
                </div>
                <div className="urblo-card p-4 shadow-none">
                    <p className="urblo-meta text-black/55">
                        Availability
                    </p>
                    <p className="mt-2 text-base text-black">{availabilityLabel}</p>
                </div>
                <div className="urblo-card p-4 shadow-none">
                    <p className="urblo-meta text-black/55">
                        Raw Block
                    </p>
                    <p className="mt-2 text-base text-black">{rawBlockLabel}</p>
                </div>
                <div className="urblo-card p-4 shadow-none">
                    <p className="urblo-meta text-black/55">
                        DL Name
                    </p>
                    <p className="mt-2 text-base text-black">{dlName || 'TBC'}</p>
                </div>
                <div className="urblo-card p-4 shadow-none">
                    <p className="urblo-meta text-black/55">
                        Price Range
                    </p>
                    <p className="mt-2 text-base font-semibold text-black">{pricePrimaryLabel}</p>
                    <div
                        className="mt-3 flex items-center gap-2"
                        role="img"
                        aria-label={priceTierLabel ? `${priceTierLabel} price tier` : 'Price on request'}
                    >
                        {[1, 2, 3].map((level) => (
                            <span
                                key={level}
                                className={[
                                    'h-2 flex-1 rounded-sm transition-colors',
                                    priceTierLevel !== null && level <= priceTierLevel
                                        ? 'bg-[#00FF19]'
                                        : 'bg-black/10',
                                ].join(' ')}
                            />
                        ))}
                    </div>
                    {priceRange && priceRange !== pricePrimaryLabel ? (
                        <p className="mt-3 text-[11px] uppercase tracking-[0.08em] text-black/55">
                            Source notation: {priceRange}
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="space-y-3">
                <h2 className="font-display text-[28px] font-semibold uppercase leading-[1.08] text-black">
                    Finish Capability
                </h2>
                <div className="urblo-card divide-y divide-black/10 overflow-hidden shadow-none">
                    {finishCapabilities.map((finish) => (
                        <div
                            key={finish.finishKey}
                            className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                        >
                            <span className="text-black">{finish.label}</span>
                            <span
                                className={[
                                    'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]',
                                    finish.capability === 'yes'
                                        ? 'bg-[#00FF19] text-black'
                                        : finish.capability === 'tbc'
                                          ? 'bg-black/6 text-black/65'
                                          : 'bg-black/4 text-black/50',
                                ].join(' ')}
                            >
                                {capabilityBadge(finish.capability)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <h2 className="font-display text-[28px] font-semibold uppercase leading-[1.08] text-black">
                    Cut Options
                </h2>
                {cutOptions.length ? (
                    <div className="urblo-card divide-y divide-black/10 overflow-hidden shadow-none">
                        {cutOptions.map((cut) => (
                            <div
                                key={cut.cutOrientation}
                                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                            >
                                <span className="text-black">
                                    {cutOrientationLabel(cut.cutOrientation)}
                                </span>
                                <span
                                    className={[
                                        'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]',
                                        cut.available
                                            ? 'bg-[#00FF19] text-black'
                                            : 'bg-black/4 text-black/50',
                                    ].join(' ')}
                                >
                                    {cut.available ? 'Available' : 'No'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-[var(--urblo-text)]">No specific cut option listed for this stone.</p>
                )}
            </div>
        </section>
    );
}
