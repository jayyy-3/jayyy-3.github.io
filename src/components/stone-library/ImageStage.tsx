import type { CSSProperties, FocusEvent } from 'react';
import type { FinishVM } from '../../types/stone-library';

interface ImageStageProps {
    stoneName: string;
    finishes: FinishVM[];
    activeFinishKey: string | null;
    onHover: (finishKey: string) => void;
    onLeave: () => void;
    onSelect: (finishKey: string) => void;
    onOpenLightbox: (finishKey: string) => void;
}

export default function ImageStage({
    stoneName,
    finishes,
    activeFinishKey,
    onHover,
    onLeave,
    onSelect,
    onOpenLightbox,
}: ImageStageProps) {
    const effectiveActiveKey = activeFinishKey || finishes[0]?.finishKey || null;
    const activeFinish =
        finishes.find((finish) => finish.finishKey === effectiveActiveKey) ||
        finishes[0];
    const trackStyle: CSSProperties = {
        ['--panel-h' as string]: 'clamp(220px, 34vw, 420px)',
        ['--panel-collapsed' as string]: 'clamp(44px, 6vw, 64px)',
    };

    function handleBlurCapture(event: FocusEvent<HTMLDivElement>) {
        const nextTarget = event.relatedTarget as Node | null;
        if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
            onLeave();
        }
    }

    if (!finishes.length) {
        return (
            <section className="self-start overflow-hidden border border-neutral-300 bg-neutral-950">
                <div className="flex h-[460px] items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-600 px-6 text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#00FF19]">
                        Image coming soon
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section
            className="space-y-2 self-start"
            onMouseLeave={onLeave}
            onBlurCapture={handleBlurCapture}
        >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Image Accordion · Hover to preview, click to lock
            </p>

            <div className="overflow-hidden border border-neutral-300 bg-neutral-100 p-2">
                <div className="flex gap-2 overflow-x-auto pb-1" style={trackStyle}>
                    {finishes.map((finish) => {
                        const isActive = finish.finishKey === effectiveActiveKey;

                        return (
                            <div
                                key={finish.finishKey}
                                className={[
                                    'group relative flex-none overflow-hidden border bg-neutral-950 transition-[width,border-color,box-shadow] duration-300 ease-out',
                                    isActive
                                        ? 'border-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]'
                                        : 'border-neutral-800 hover:border-neutral-700',
                                ].join(' ')}
                                style={{
                                    height: 'var(--panel-h)',
                                    width: isActive
                                        ? 'calc(var(--panel-h) * 1.5)'
                                        : 'var(--panel-collapsed)',
                                }}
                            >
                                <button
                                    type="button"
                                    onMouseEnter={() => onHover(finish.finishKey)}
                                    onFocus={() => onHover(finish.finishKey)}
                                    onClick={() => onSelect(finish.finishKey)}
                                    aria-pressed={isActive}
                                    aria-label={`${stoneName} ${finish.label}`}
                                    className="absolute inset-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#00FF19] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                                >
                                    {finish.imageUrl ? (
                                        <img
                                            src={finish.imageUrl}
                                            alt={
                                                finish.imageAlt ||
                                                `${stoneName} ${finish.label}`.trim()
                                            }
                                            className={[
                                                'absolute inset-0 h-full w-full object-cover transition duration-300',
                                                isActive
                                                    ? 'opacity-100'
                                                    : 'opacity-75 group-hover:opacity-95 group-focus-within:opacity-95',
                                            ].join(' ')}
                                            loading="eager"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-600 px-3 text-center">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#00FF19]">
                                                Image soon
                                            </p>
                                        </div>
                                    )}
                                </button>

                                {isActive && finish.imageUrl ? (
                                    <button
                                        type="button"
                                        onClick={() => onOpenLightbox(finish.finishKey)}
                                        className="absolute right-2 top-2 border border-neutral-900/80 bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-900 transition hover:bg-white"
                                        aria-label={`Open ${finish.label} in large view`}
                                    >
                                        Zoom
                                    </button>
                                ) : null}

                                <div
                                    className={[
                                        'pointer-events-none absolute inset-y-3 right-1 flex items-center justify-center transition-opacity duration-200',
                                        isActive ? 'opacity-0' : 'opacity-100',
                                    ].join(' ')}
                                >
                                    <span
                                        className="rounded border border-neutral-200 bg-white/90 px-1 py-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-neutral-800"
                                        style={{
                                            writingMode: 'vertical-rl',
                                            textOrientation: 'mixed',
                                        }}
                                    >
                                        {finish.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center justify-between border border-neutral-300 bg-white px-4 py-3 text-xs uppercase tracking-[0.12em] text-neutral-600">
                <span>{stoneName}</span>
                {activeFinish ? <span>{activeFinish.label}</span> : null}
            </div>
        </section>
    );
}
