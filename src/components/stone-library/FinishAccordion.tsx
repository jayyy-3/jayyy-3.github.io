import type { FinishVM } from '../../types/stone-library';

interface FinishAccordionProps {
    finishes: FinishVM[];
    activeFinishKey: string | null;
    onSelect: (finishKey: string) => void;
}

function capabilityLabel(capability: FinishVM['capability']): string {
    return capability === 'tbc' ? 'Upcoming' : 'Available';
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
                                <span
                                    className={[
                                        'rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em]',
                                        finish.capability === 'tbc'
                                            ? isActive
                                                ? 'bg-white/10 text-white'
                                                : 'bg-black/6 text-black/65'
                                            : isActive
                                              ? 'bg-[#00FF19] text-black'
                                              : 'bg-[rgba(0,255,25,0.12)] text-black',
                                    ].join(' ')}
                                >
                                    {capabilityLabel(finish.capability)}
                                </span>
                            </button>

                            {isActive ? (
                                <div className="space-y-2 border-t border-white/10 bg-black px-4 pb-4 text-[13px] leading-6 text-white/90">
                                    <p className="break-words">{finish.behavior.summary}</p>
                                    <ul className="space-y-1 text-[11px] uppercase leading-5 tracking-[0.08em] text-white/76">
                                        <li>Slip: {finish.behavior.slip}</li>
                                        <li>Glare: {finish.behavior.glare}</li>
                                        <li>Maintenance: {finish.behavior.maintenance}</li>
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
