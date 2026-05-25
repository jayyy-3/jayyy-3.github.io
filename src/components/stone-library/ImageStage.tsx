import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { FinishVM } from '../../types/stone-library';

interface ImageStageProps {
    stoneName: string;
    finishes: FinishVM[];
    activeFinishKey: string | null;
    centerRequestToken: number;
    onSelect: (finishKey: string) => void;
    onOpenLightbox: (finishKey: string, frameIndex?: number) => void;
}

function imageRoleLabel(finish: FinishVM): string {
    if (finish.imageRole === 'finish-specific') {
        return 'Finish-specific image';
    }

    if (finish.imageRole === 'reference') {
        return 'Reference image';
    }

    return 'Image pending';
}

function imageRoleSignalClass(finish: FinishVM): string {
    if (finish.imageRole === 'finish-specific') {
        return 'bg-[var(--urblo-lime)]';
    }

    if (finish.imageRole === 'reference') {
        return 'border border-white/50 bg-black/40';
    }

    return 'border border-white/50 bg-white/60';
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
    const activeSecondaryImages = activeFinish?.secondaryImages ?? [];
    const isSingleFinish = finishes.length === 1;
    const trackStyle: CSSProperties = {
        ['--panel-h' as string]: 'clamp(190px, 29vw, 340px)',
        ['--panel-collapsed' as string]: 'clamp(40px, 4.6vw, 56px)',
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
            <section className="urblo-card self-start overflow-hidden border-black/10 shadow-none">
                <div className="flex h-[320px] items-center justify-center bg-[rgba(239,239,239,0.78)] px-6 text-center">
                    <p className="urblo-meta text-black/50">
                        Image coming soon
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="min-w-0 space-y-2 self-start">
            <p className="urblo-meta text-[10px] text-black/58">Finish imagery</p>

            <div className="overflow-hidden rounded-[4px] border border-black/10 bg-white p-2 shadow-none">
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
                                    'group relative flex-none overflow-hidden border bg-black',
                                    isActive
                                        ? 'border-black shadow-[0_0_0_1px_rgba(0,0,0,0.12)]'
                                        : 'border-black/40 hover:border-black',
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
                                                    : 'opacity-70 group-hover:opacity-94 group-focus-within:opacity-94',
                                            ].join(' ')}
                                            loading="eager"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black to-[#33363f] px-3 text-center">
                                            <p className="urblo-meta text-[10px] text-[var(--urblo-lime)]">
                                                Image soon
                                            </p>
                                        </div>
                                    )}
                                </button>

                                {isActive && finish.imageUrl ? (
                                    <button
                                        type="button"
                                        onClick={() => onOpenLightbox(finish.finishKey)}
                                        className="absolute right-2 top-2 min-h-8 rounded-[4px] border border-white/25 bg-black/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white shadow-[0_8px_18px_rgba(0,0,0,0.22)] backdrop-blur-sm transition hover:border-[var(--urblo-lime)] hover:bg-black/90 hover:text-[var(--urblo-lime)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--urblo-lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                        aria-label={`Open ${finish.label} in large view`}
                                    >
                                        Zoom
                                    </button>
                                ) : null}

                                {isActive ? (
                                    <div className="pointer-events-none absolute left-2 top-2 flex max-w-[calc(100%-6.75rem)] items-center gap-1.5 rounded-[4px] border border-white/20 bg-black/80 px-2.5 py-1.5 text-[10px] font-bold uppercase leading-[1.12] tracking-[0.04em] text-white shadow-[0_8px_18px_rgba(0,0,0,0.24)] backdrop-blur-sm sm:text-[11px]">
                                        <span
                                            className={[
                                                'h-1.5 w-1.5 flex-none rounded-full',
                                                imageRoleSignalClass(finish),
                                            ].join(' ')}
                                            aria-hidden="true"
                                        />
                                        <span>{imageRoleLabel(finish)}</span>
                                    </div>
                                ) : null}

                                <div
                                    className={[
                                        'pointer-events-none absolute inset-y-3 right-1 flex items-center justify-center transition-opacity duration-200',
                                        isActive ? 'opacity-0' : 'opacity-100',
                                    ].join(' ')}
                                >
                                    <span
                                        className="rounded border border-white/20 bg-black/80 px-1.5 py-2.5 text-[10px] font-bold uppercase leading-none tracking-[0.04em] text-white shadow-[0_6px_14px_rgba(0,0,0,0.24)] backdrop-blur-sm transition group-hover:border-[var(--urblo-lime)] group-hover:bg-black/90"
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

            <div className="flex items-center justify-between rounded-[4px] border border-black/10 bg-white px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/55 shadow-none">
                <span>{stoneName}</span>
                {activeFinish ? (
                    <span className="text-right">
                        {activeFinish.label}
                        {activeFinish.imageRole === 'finish-specific'
                            ? ''
                            : ' - confirm sample'}
                    </span>
                ) : null}
            </div>

            {activeFinish && activeSecondaryImages.length ? (
                <div className="rounded-[4px] border border-black/10 bg-white p-3 shadow-none">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="urblo-meta text-[10px] text-black/58">
                            Secondary frame
                        </p>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-black/45">
                            Same finish, alternate source view
                        </span>
                    </div>

                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {activeSecondaryImages.map((image, index) => (
                            <button
                                key={`${activeFinish.finishKey}-${image.imageUrl}`}
                                type="button"
                                onClick={() => onOpenLightbox(activeFinish.finishKey, index + 1)}
                                className="group flex w-[120px] flex-none flex-col overflow-hidden rounded-[4px] border border-black/10 bg-white text-left transition hover:border-black/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--urblo-lime)]"
                            >
                                <span className="block aspect-[3/2] overflow-hidden bg-black/5">
                                    <img
                                        src={image.thumbUrl || image.imageUrl}
                                        alt=""
                                        aria-hidden="true"
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                        loading="lazy"
                                    />
                                </span>
                                <span className="px-2 py-2 text-[10px] font-semibold uppercase leading-tight tracking-[0.08em] text-black">
                                    {image.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}
        </section>
    );
}
