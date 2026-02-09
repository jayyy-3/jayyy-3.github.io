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
        <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Finish Selector · Click to select
            </p>

            <div className="divide-y divide-neutral-200 border border-neutral-200 bg-white">
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
                                        ? 'bg-neutral-950 text-white'
                                        : 'bg-white text-neutral-900 hover:bg-neutral-100',
                                ].join(' ')}
                                aria-pressed={isActive}
                            >
                                <span className="text-sm font-medium">{finish.label}</span>
                                <span
                                    className={[
                                        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
                                        finish.capability === 'tbc'
                                            ? isActive
                                                ? 'bg-neutral-700 text-white'
                                                : 'bg-neutral-200 text-neutral-700'
                                            : isActive
                                              ? 'bg-[#00FF19] text-black'
                                              : 'bg-neutral-200 text-neutral-700',
                                    ].join(' ')}
                                >
                                    {capabilityLabel(finish.capability)}
                                </span>
                            </button>

                            {isActive ? (
                                <div className="space-y-2 border-t border-neutral-800 bg-neutral-950 px-4 pb-4 text-sm text-neutral-300">
                                    <p>{finish.behavior.summary}</p>
                                    <ul className="space-y-1 text-xs uppercase tracking-[0.08em] text-neutral-400">
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
