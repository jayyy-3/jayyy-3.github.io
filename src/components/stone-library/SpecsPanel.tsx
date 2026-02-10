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
                <div className="border border-neutral-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        Type
                    </p>
                    <p className="mt-2 text-base text-neutral-900">{stoneType}</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        Origin
                    </p>
                    <p className="mt-2 text-base text-neutral-900">{originLabel}</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        Availability
                    </p>
                    <p className="mt-2 text-base text-neutral-900">{availabilityLabel}</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        Raw Block
                    </p>
                    <p className="mt-2 text-base text-neutral-900">{rawBlockLabel}</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        DL Name
                    </p>
                    <p className="mt-2 text-base text-neutral-900">{dlName || 'TBC'}</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        Price Range
                    </p>
                    <p className="mt-2 text-base font-semibold text-neutral-900">{pricePrimaryLabel}</p>
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
                                        : 'bg-neutral-200',
                                ].join(' ')}
                            />
                        ))}
                    </div>
                    {priceRange && priceRange !== pricePrimaryLabel ? (
                        <p className="mt-3 text-[11px] uppercase tracking-[0.08em] text-neutral-500">
                            Source notation: {priceRange}
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-neutral-900">Finish Capability</h2>
                <div className="divide-y divide-neutral-200 border border-neutral-200 bg-white">
                    {finishCapabilities.map((finish) => (
                        <div
                            key={finish.finishKey}
                            className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                        >
                            <span className="text-neutral-900">{finish.label}</span>
                            <span
                                className={[
                                    'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]',
                                    finish.capability === 'yes'
                                        ? 'bg-[#00FF19] text-black'
                                        : finish.capability === 'tbc'
                                          ? 'bg-neutral-200 text-neutral-700'
                                          : 'bg-neutral-100 text-neutral-500',
                                ].join(' ')}
                            >
                                {capabilityBadge(finish.capability)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-neutral-900">Cut Options</h2>
                {cutOptions.length ? (
                    <div className="divide-y divide-neutral-200 border border-neutral-200 bg-white">
                        {cutOptions.map((cut) => (
                            <div
                                key={cut.cutOrientation}
                                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                            >
                                <span className="text-neutral-900">
                                    {cutOrientationLabel(cut.cutOrientation)}
                                </span>
                                <span
                                    className={[
                                        'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]',
                                        cut.available
                                            ? 'bg-[#00FF19] text-black'
                                            : 'bg-neutral-100 text-neutral-500',
                                    ].join(' ')}
                                >
                                    {cut.available ? 'Available' : 'No'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-neutral-600">No specific cut option listed for this stone.</p>
                )}
            </div>
        </section>
    );
}
