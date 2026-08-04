import type {
    FinishCapabilityVM,
    StoneStatus,
    StoneCutOptionRaw,
    StonePriceTierLabel,
    StonePriceTierLevel,
} from '../../types/stone-library';
import StatusPill from './StatusPill';
import type { StatusPillTone } from './StatusPill';

interface SpecsPanelProps {
    stoneType: string;
    rawBlockLabel: string;
    availabilityStatus: StoneStatus;
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

function capabilityTone(capability: FinishCapabilityVM['capability']): StatusPillTone {
    if (capability === 'yes') {
        return 'available';
    }
    if (capability === 'tbc') {
        return 'upcoming';
    }
    return 'unavailable';
}

function availabilityBadgeLabel(status: StoneStatus): string {
    return status === 'tbc' ? 'Upcoming' : 'Available';
}

function cutOrientationLabel(value: string): string {
    return value
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function SpecsPanel({
    stoneType,
    rawBlockLabel,
    availabilityStatus,
    availabilityLabel,
    priceRange,
    priceTierLevel,
    priceTierLabel,
    pricePrimaryLabel,
    finishCapabilities,
    cutOptions,
}: SpecsPanelProps) {
    return (
        <section className="space-y-7">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[4px] border border-black/10 bg-white p-4 shadow-none">
                    <p className="urblo-meta text-black/55">
                        Type
                    </p>
                    <p className="mt-2 text-base text-black">{stoneType}</p>
                </div>
                <div className="rounded-[4px] border border-black/10 bg-white p-4 shadow-none">
                    <p className="urblo-meta text-black/55">
                        Availability
                    </p>
                    <StatusPill
                        label={availabilityBadgeLabel(availabilityStatus)}
                        tone={availabilityStatus === 'tbc' ? 'upcoming' : 'available'}
                        className="mt-3"
                    />
                    <p className="mt-3 text-sm leading-6 text-black/62">{availabilityLabel}</p>
                </div>
                <div className="rounded-[4px] border border-black/10 bg-white p-4 shadow-none">
                    <p className="urblo-meta text-black/55">
                        Raw Block
                    </p>
                    <p className="mt-2 text-base text-black">{rawBlockLabel}</p>
                </div>
                <div className="rounded-[4px] border border-black/10 bg-white p-4 shadow-none">
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
                <h2 className="font-display text-[24px] font-semibold uppercase leading-[1.08] tracking-[0.02em] text-black">
                    Finish Capability
                </h2>
                <div className="divide-y divide-black/10 overflow-hidden rounded-[4px] border border-black/10 bg-white shadow-none">
                    {finishCapabilities.map((finish) => (
                        <div
                            key={finish.finishKey}
                            className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                        >
                            <span className="text-black">{finish.label}</span>
                            <StatusPill
                                label={capabilityBadge(finish.capability)}
                                tone={capabilityTone(finish.capability)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <h2 className="font-display text-[24px] font-semibold uppercase leading-[1.08] tracking-[0.02em] text-black">
                    Cut Options
                </h2>
                {cutOptions.length ? (
                    <div className="divide-y divide-black/10 overflow-hidden rounded-[4px] border border-black/10 bg-white shadow-none">
                        {cutOptions.map((cut) => (
                            <div
                                key={cut.cutOrientation}
                                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                            >
                                <span className="text-black">
                                    {cutOrientationLabel(cut.cutOrientation)}
                                </span>
                                <StatusPill
                                    label={cut.available ? 'Available' : 'No'}
                                    tone={cut.available ? 'available' : 'unavailable'}
                                />
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
