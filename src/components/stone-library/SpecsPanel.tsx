import type {
    FinishCapabilityVM,
    StoneAvailableAsVM,
    StoneCutOptionRaw,
    StonePriceTierLabel,
    StonePriceTierLevel,
} from '../../types/stone-library';
import StatusPill from './StatusPill';
import { cardTitleClassName } from '../ui/styles';
import type { StatusPillTone } from './StatusPill';

interface SpecsPanelProps {
    stoneType: string;
    rawBlockLabel: string;
    availableAs: StoneAvailableAsVM[];
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

function cutOrientationLabel(value: string): string {
    return value
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function SpecsPanel({
    stoneType,
    rawBlockLabel,
    availableAs,
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
                    <p className="urblo-meta text-black/55" id="stone-available-as">
                        Available as
                    </p>
                    {availableAs.length ? (
                        // Every published option is listed with an explicit text state, never colour alone.
                        <ul className="mt-3 space-y-2" aria-labelledby="stone-available-as">
                            {availableAs.map((option) => (
                                <li
                                    key={option.key}
                                    data-available-as={option.key}
                                    data-offered={option.offered}
                                    className="flex items-center justify-between gap-3 text-sm"
                                >
                                    <span
                                        className={[
                                            'min-w-0 break-words',
                                            option.offered ? 'text-black' : 'text-black/55',
                                        ].join(' ')}
                                    >
                                        {option.label}
                                    </span>
                                    <StatusPill
                                        label={option.offered ? 'Offered' : 'Not offered'}
                                        tone={option.offered ? 'available' : 'unavailable'}
                                        className="flex-none"
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-2 text-base text-black">Confirm for your project</p>
                    )}
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
                                        ? 'bg-lime'
                                        : 'bg-black/10',
                                ].join(' ')}
                            />
                        ))}
                    </div>
                    {priceRange && priceRange !== pricePrimaryLabel ? (
                        <p className="mt-3 text-micro uppercase tracking-caps text-muted">
                            Source notation: {priceRange}
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="space-y-3">
                <h2 className={cardTitleClassName()}>
                    Finish capability
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
                <h2 className={cardTitleClassName()}>
                    Cut options
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
