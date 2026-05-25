import type { FinishVM } from '../../types/stone-library';
import StatusPill from './StatusPill';

interface FinishAccordionProps {
    finishes: FinishVM[];
    activeFinishKey: string | null;
    onSelect: (finishKey: string) => void;
}

function capabilityLabel(capability: FinishVM['capability']): string {
    return capability === 'tbc' ? 'Upcoming' : 'Available';
}

function imageSourceLabel(finish: FinishVM): string {
    if (finish.imageRole === 'finish-specific') {
        return 'Image: finish-specific source';
    }

    if (finish.imageRole === 'reference') {
        return 'Image: reference view, confirm sample';
    }

    return 'Image: pending';
}

export default function FinishAccordion({
    finishes,
    activeFinishKey,
    onSelect,
}: FinishAccordionProps) {
    return (
        <section className="min-w-0 space-y-2.5">
            <p className="urblo-meta text-[10px] text-black/58">Finish selector</p>

            <div className="divide-y divide-black/10 overflow-hidden rounded-[4px] border border-black/10 bg-white shadow-none">
                {finishes.map((finish) => {
                    const isActive = finish.finishKey === activeFinishKey;

                    return (
                        <div key={finish.finishKey}>
                            <button
                                type="button"
                                onClick={() => onSelect(finish.finishKey)}
                                className={[
                                    'flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition',
                                    isActive
                                        ? 'bg-black text-white'
                                        : 'bg-white text-black hover:bg-[rgba(239,239,239,0.55)]',
                                ].join(' ')}
                                aria-pressed={isActive}
                            >
                                <span className="text-[14px] font-semibold">{finish.label}</span>
                                <StatusPill
                                    label={capabilityLabel(finish.capability)}
                                    tone={finish.capability === 'tbc' ? 'upcoming' : 'available'}
                                    surface={isActive ? 'dark' : 'light'}
                                    className="py-1 text-[9px]"
                                />
                            </button>

                            {isActive ? (
                                <div className="space-y-2 border-t border-white/10 bg-black px-4 pb-4 text-[13px] leading-6 text-white/90">
                                    <p className="break-words">{finish.behavior.summary}</p>
                                    <ul className="space-y-1 text-[11px] uppercase leading-5 tracking-[0.08em] text-white/76">
                                        <li>Slip: {finish.behavior.slip}</li>
                                        <li>Glare: {finish.behavior.glare}</li>
                                        <li>Maintenance: {finish.behavior.maintenance}</li>
                                        {finish.secondaryImages.length ? (
                                            <li>
                                                Frames: primary + {finish.secondaryImages.length} secondary
                                            </li>
                                        ) : null}
                                        <li>{imageSourceLabel(finish)}</li>
                                    </ul>
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
