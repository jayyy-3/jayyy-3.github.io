import { useCallback, useEffect, useRef, useState } from 'react';
import type { FinishVM } from '../../types/stone-library';

interface FinishLightboxProps {
    isOpen: boolean;
    finishes: FinishVM[];
    activeFinishKey: string | null;
    stoneName: string;
    onClose: () => void;
    onSelectFinish: (finishKey: string) => void;
}

interface Offset {
    x: number;
    y: number;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export default function FinishLightbox({
    isOpen,
    finishes,
    activeFinishKey,
    stoneName,
    onClose,
    onSelectFinish,
}: FinishLightboxProps) {
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const dragOriginRef = useRef<{
        startX: number;
        startY: number;
        offsetX: number;
        offsetY: number;
    } | null>(null);

    const [zoom, setZoom] = useState<1 | 2>(1);
    const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    const currentIndex = Math.max(
        0,
        finishes.findIndex((finish) => finish.finishKey === activeFinishKey),
    );
    const activeFinish = finishes[currentIndex] || finishes[0] || null;
    const hasMultiple = finishes.length > 1;

    function maxOffset(): Offset {
        const rect = viewportRef.current?.getBoundingClientRect();
        if (!rect || zoom === 1) {
            return { x: 0, y: 0 };
        }

        return {
            x: (rect.width * (zoom - 1)) / 2,
            y: (rect.height * (zoom - 1)) / 2,
        };
    }

    function clampOffset(next: Offset): Offset {
        const max = maxOffset();
        return {
            x: clamp(next.x, -max.x, max.x),
            y: clamp(next.y, -max.y, max.y),
        };
    }

    function resetZoom() {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        dragOriginRef.current = null;
        setIsDragging(false);
    }

    const goToIndex = useCallback(
        (nextIndex: number) => {
            if (!finishes.length) {
                return;
            }

            const normalized =
                (nextIndex + finishes.length) % finishes.length;
            const nextFinish = finishes[normalized];
            if (!nextFinish) {
                return;
            }

            onSelectFinish(nextFinish.finishKey);
        },
        [finishes, onSelectFinish],
    );

    const goPrev = useCallback(() => {
        goToIndex(currentIndex - 1);
    }, [goToIndex, currentIndex]);

    const goNext = useCallback(() => {
        goToIndex(currentIndex + 1);
    }, [goToIndex, currentIndex]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeButtonRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
            }

            if (!hasMultiple) {
                return;
            }

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                goPrev();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                goNext();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, hasMultiple, onClose, goPrev, goNext]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        resetZoom();
    }, [isOpen, currentIndex]);

    if (!isOpen || !activeFinish) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black/85"
            role="dialog"
            aria-modal="true"
            aria-label={`${stoneName} finish image viewer`}
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="mx-auto flex h-full w-full max-w-7xl flex-col px-4 py-4">
                <div className="flex items-center justify-between border border-white/20 bg-black/60 px-4 py-3 text-white">
                    <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-neutral-300">
                            {stoneName}
                        </p>
                        <p className="text-sm font-semibold uppercase tracking-[0.08em]">
                            {activeFinish.label}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                if (zoom === 1) {
                                    setZoom(2);
                                } else {
                                    resetZoom();
                                }
                            }}
                            className="border border-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] transition hover:bg-white hover:text-black"
                        >
                            {zoom === 1 ? 'Zoom 2x' : 'Reset Zoom'}
                        </button>

                        <button
                            ref={closeButtonRef}
                            type="button"
                            onClick={onClose}
                            className="border border-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] transition hover:bg-white hover:text-black"
                        >
                            Close
                        </button>
                    </div>
                </div>

                <div
                    ref={viewportRef}
                    className="relative mt-4 flex min-h-0 flex-1 items-center justify-center overflow-hidden border border-white/20 bg-neutral-950"
                >
                    {activeFinish.imageUrl ? (
                        <img
                            src={activeFinish.imageUrl}
                            alt={
                                activeFinish.imageAlt ||
                                `${stoneName} ${activeFinish.label}`
                            }
                            className="max-h-full max-w-full select-none object-contain transition-transform duration-200"
                            style={{
                                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                                cursor:
                                    zoom === 2
                                        ? isDragging
                                            ? 'grabbing'
                                            : 'grab'
                                        : 'zoom-in',
                            }}
                            draggable={false}
                            onPointerDown={(event) => {
                                if (zoom !== 2 || event.button !== 0) {
                                    return;
                                }

                                (
                                    event.currentTarget as HTMLElement
                                ).setPointerCapture(event.pointerId);
                                dragOriginRef.current = {
                                    startX: event.clientX,
                                    startY: event.clientY,
                                    offsetX: offset.x,
                                    offsetY: offset.y,
                                };
                                setIsDragging(true);
                            }}
                            onPointerMove={(event) => {
                                if (zoom !== 2 || !dragOriginRef.current) {
                                    return;
                                }

                                const nextOffset = {
                                    x:
                                        dragOriginRef.current.offsetX +
                                        (event.clientX -
                                            dragOriginRef.current.startX),
                                    y:
                                        dragOriginRef.current.offsetY +
                                        (event.clientY -
                                            dragOriginRef.current.startY),
                                };

                                setOffset(clampOffset(nextOffset));
                            }}
                            onPointerUp={(event) => {
                                (
                                    event.currentTarget as HTMLElement
                                ).releasePointerCapture(event.pointerId);
                                dragOriginRef.current = null;
                                setIsDragging(false);
                            }}
                            onPointerCancel={(event) => {
                                (
                                    event.currentTarget as HTMLElement
                                ).releasePointerCapture(event.pointerId);
                                dragOriginRef.current = null;
                                setIsDragging(false);
                            }}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center px-6 text-center">
                            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#00FF19]">
                                Image coming soon
                            </p>
                        </div>
                    )}

                    {hasMultiple ? (
                        <>
                            <button
                                type="button"
                                onClick={goPrev}
                                className="absolute left-3 top-1/2 -translate-y-1/2 border border-white/40 bg-black/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-black"
                                aria-label="Previous finish image"
                            >
                                Prev
                            </button>

                            <button
                                type="button"
                                onClick={goNext}
                                className="absolute right-3 top-1/2 -translate-y-1/2 border border-white/40 bg-black/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-black"
                                aria-label="Next finish image"
                            >
                                Next
                            </button>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
