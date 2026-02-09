import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { FinishVM } from '../../types/stone-library';

interface ImageStageProps {
    stoneName: string;
    finishes: FinishVM[];
    activeFinishKey: string | null;
    centerRequestToken: number;
    onSelect: (finishKey: string) => void;
    onOpenLightbox: (finishKey: string) => void;
}

export default function ImageStage({
    stoneName,
    finishes,
    activeFinishKey,
    centerRequestToken,
    onSelect,
    onOpenLightbox,
}: ImageStageProps) {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [inactiveFillWidth, setInactiveFillWidth] = useState<number | null>(null);
    const resizeDebounceRef = useRef<number | null>(null);
    const frameRef = useRef<number | null>(null);
    const lastHandledCenterTokenRef = useRef<number | null>(null);

    const effectiveActiveKey = activeFinishKey || finishes[0]?.finishKey || null;
    const activeFinish =
        finishes.find((finish) => finish.finishKey === effectiveActiveKey) ||
        finishes[0];
    const isSingleFinish = finishes.length === 1;
    const trackStyle: CSSProperties = {
        ['--panel-h' as string]: 'clamp(220px, 34vw, 420px)',
        ['--panel-collapsed' as string]: 'clamp(44px, 6vw, 64px)',
    };
    const isDev = import.meta.env.DEV;

    const logCenterDecision = useCallback((
        reason: 'skip-token' | 'ref-miss' | 'visible' | 'clipped',
        details: Record<string, unknown> = {},
    ) => {
        if (!isDev) {
            return;
        }
        console.debug('[ImageStage:center]', {
            stoneName,
            activeKey: effectiveActiveKey,
            token: centerRequestToken,
            reason,
            ...details,
        });
    }, [centerRequestToken, effectiveActiveKey, isDev, stoneName]);

    function measureCollapsedWidth(track: HTMLDivElement): number {
        const probe = document.createElement('div');
        probe.style.position = 'absolute';
        probe.style.visibility = 'hidden';
        probe.style.pointerEvents = 'none';
        probe.style.width = 'var(--panel-collapsed)';
        probe.style.height = '0';
        probe.style.overflow = 'hidden';
        track.appendChild(probe);
        const width = probe.getBoundingClientRect().width;
        track.removeChild(probe);
        return width;
    }

    function setInactiveWidthIfChanged(nextWidth: number | null) {
        setInactiveFillWidth((current) => {
            if (current === null && nextWidth === null) {
                return current;
            }

            if (current !== null && nextWidth !== null) {
                const epsilon = 0.1;
                if (Math.abs(current - nextWidth) <= epsilon) {
                    return current;
                }
            }

            return nextWidth;
        });
    }

    function getTrackGap(track: HTMLDivElement): number {
        const styles = window.getComputedStyle(track);
        const columnGap = Number.parseFloat(styles.columnGap);
        const fallbackGap = Number.parseFloat(styles.gap);

        if (Number.isFinite(columnGap)) {
            return columnGap;
        }

        if (Number.isFinite(fallbackGap)) {
            return fallbackGap;
        }

        return 0;
    }

    const computeInactiveFillWidth = useCallback((activeKey: string): number | null => {
        const track = trackRef.current;
        const activePanel = panelRefs.current[activeKey];
        if (!track || !activePanel || finishes.length < 2) {
            return null;
        }

        const activeWidth = activePanel.getBoundingClientRect().width;
        const inactiveCount = finishes.length - 1;
        const gap = getTrackGap(track);
        const collapsedWidth = measureCollapsedWidth(track);

        const defaultTotalWidth =
            activeWidth + collapsedWidth * inactiveCount + gap * inactiveCount;

        if (defaultTotalWidth >= track.clientWidth) {
            return null;
        }

        const computedFillWidth =
            (track.clientWidth - activeWidth - gap * inactiveCount) /
            inactiveCount;
        const normalizedFillWidth = Math.round(computedFillWidth * 100) / 100;

        if (!Number.isFinite(normalizedFillWidth) || normalizedFillWidth <= 0) {
            return null;
        }

        return normalizedFillWidth;
    }, [finishes]);

    useLayoutEffect(() => {
        if (!effectiveActiveKey) {
            setInactiveWidthIfChanged(null);
            return;
        }
        const activeKey = effectiveActiveKey;

        const nextWidth = computeInactiveFillWidth(activeKey);
        setInactiveWidthIfChanged(nextWidth);
    }, [effectiveActiveKey, computeInactiveFillWidth]);

    useEffect(() => {
        if (!effectiveActiveKey) {
            setInactiveWidthIfChanged(null);
            return;
        }
        const activeKey = effectiveActiveKey;
        const track = trackRef.current;
        if (!track) {
            return;
        }

        if (typeof ResizeObserver === 'undefined') {
            return;
        }

        const resizeObserver = new ResizeObserver(() => {
            if (resizeDebounceRef.current !== null) {
                window.clearTimeout(resizeDebounceRef.current);
            }

            resizeDebounceRef.current = window.setTimeout(() => {
                const nextWidth = computeInactiveFillWidth(activeKey);
                setInactiveWidthIfChanged(nextWidth);
                resizeDebounceRef.current = null;
            }, 100);
        });

        resizeObserver.observe(track);

        return () => {
            if (resizeDebounceRef.current !== null) {
                window.clearTimeout(resizeDebounceRef.current);
                resizeDebounceRef.current = null;
            }
            resizeObserver.disconnect();
        };
    }, [effectiveActiveKey, computeInactiveFillWidth]);

    useEffect(() => {
        if (!effectiveActiveKey || lastHandledCenterTokenRef.current === centerRequestToken) {
            if (effectiveActiveKey && lastHandledCenterTokenRef.current === centerRequestToken) {
                logCenterDecision('skip-token');
            }
            return;
        }
        const activeKey = effectiveActiveKey;
        const tokenForThisRun = centerRequestToken;
        let attempt = 0;

        if (frameRef.current !== null) {
            window.cancelAnimationFrame(frameRef.current);
        }

        function runCenterCheck() {
            attempt += 1;
            const track = trackRef.current;
            const panel = panelRefs.current[activeKey];
            if (!track || !panel) {
                if (attempt < 2) {
                    frameRef.current = window.requestAnimationFrame(runCenterCheck);
                    return;
                }
                logCenterDecision('ref-miss', { attempt });
                lastHandledCenterTokenRef.current = tokenForThisRun;
                frameRef.current = null;
                return;
            }

            const trackRect = track.getBoundingClientRect();
            const panelRect = panel.getBoundingClientRect();
            const panelLeft = panelRect.left - trackRect.left + track.scrollLeft;
            const panelRight = panelLeft + panelRect.width;
            const viewportLeft = track.scrollLeft;
            const viewportRight = viewportLeft + track.clientWidth;
            const visibilityTolerance = 1;
            const isFullyVisible =
                panelLeft >= viewportLeft - visibilityTolerance &&
                panelRight <= viewportRight + visibilityTolerance;

            if (isFullyVisible) {
                logCenterDecision('visible', {
                    panelLeft,
                    panelRight,
                    viewportLeft,
                    viewportRight,
                });
                lastHandledCenterTokenRef.current = tokenForThisRun;
                frameRef.current = null;
                return;
            }

            const panelCenter = panelLeft + panelRect.width / 2;
            const targetLeft = panelCenter - track.clientWidth / 2;
            const maxLeft = Math.max(track.scrollWidth - track.clientWidth, 0);
            const nextLeft = Math.min(Math.max(targetLeft, 0), maxLeft);

            track.scrollTo({
                left: nextLeft,
                behavior: 'smooth',
            });
            logCenterDecision('clipped', {
                panelLeft,
                panelRight,
                viewportLeft,
                viewportRight,
                targetLeft,
                nextLeft,
            });
            lastHandledCenterTokenRef.current = tokenForThisRun;
            frameRef.current = null;
        }

        frameRef.current = window.requestAnimationFrame(runCenterCheck);

        return () => {
            if (frameRef.current !== null) {
                window.cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
            }
        };
    }, [centerRequestToken, effectiveActiveKey, inactiveFillWidth, logCenterDecision]);

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
        <section className="space-y-2 self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Image Accordion · Click to select
            </p>

            <div className="overflow-hidden border border-neutral-300 bg-neutral-100 p-2">
                <div
                    ref={trackRef}
                    className={[
                        'flex gap-2 overflow-x-auto pb-1',
                        isSingleFinish ? 'justify-center' : '',
                    ].join(' ')}
                    style={trackStyle}
                >
                    {finishes.map((finish) => {
                        const isActive = finish.finishKey === effectiveActiveKey;
                        const inactiveWidth =
                            inactiveFillWidth !== null
                                ? `${inactiveFillWidth}px`
                                : 'var(--panel-collapsed)';

                        return (
                            <div
                                key={finish.finishKey}
                                ref={(node) => {
                                    panelRefs.current[finish.finishKey] = node;
                                }}
                                className={[
                                    'group relative flex-none overflow-hidden border bg-neutral-950',
                                    isActive
                                        ? 'border-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]'
                                        : 'border-neutral-800 hover:border-neutral-700',
                                ].join(' ')}
                                style={{
                                    height: 'var(--panel-h)',
                                    width: isActive
                                        ? 'calc(var(--panel-h) * 1.5)'
                                        : inactiveWidth,
                                }}
                            >
                                <button
                                    type="button"
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
