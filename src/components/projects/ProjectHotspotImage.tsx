import {
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type FocusEvent as ReactFocusEvent,
} from 'react';
import { Link } from 'react-router-dom';
import type { ProjectHotspot } from '../../data/projectData';
import StoneLibraryService from '../../service/StoneLibraryService';
import type { StoneDetailVM } from '../../types/stone-library';
import ProjectResponsiveImage from './ProjectResponsiveImage';

interface ProjectHotspotImageProps {
    image: string;
    imageAlt: string;
    title?: string;
    intro?: string;
    caption?: string;
    hotspots: ProjectHotspot[];
    /** Deep link: pin this point once on mount and bring the image into view. */
    focusHotspotId?: string | null;
    /** DOM id of the figure, used as the scroll target for deep links. */
    anchorId?: string;
}

const CARD_WIDTH = 260;
const CARD_OFFSET = 22;
const HOVER_CLOSE_DELAY_MS = 140;

function toFallbackLabel(value: string): string {
    return value
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function materialKey(hotspot: ProjectHotspot) {
    return `${hotspot.stoneGroupId}:${hotspot.stoneVariantId || ''}`;
}

function resolveHotspot(hotspot: ProjectHotspot, publishedDetails: ReadonlyMap<string, StoneDetailVM>) {
    const stone = publishedDetails.get(materialKey(hotspot));
    const finish = stone?.finishes.find((entry) => entry.finishKey === hotspot.finishKey);

    return {
        stoneName: stone?.name || toFallbackLabel(hotspot.stoneGroupId),
        finishLabel: finish?.label || toFallbackLabel(hotspot.finishKey),
        previewImage: finish?.imageUrl,
        previewAlt:
            finish?.imageAlt ||
            `${stone?.name || hotspot.stoneGroupId} ${finish?.label || hotspot.finishKey} finish preview`,
    };
}

function stoneHref(hotspot: ProjectHotspot) {
    const params = new URLSearchParams();
    if (hotspot.stoneVariantId) params.set('variant', hotspot.stoneVariantId);
    params.set('finish', hotspot.finishKey);
    return `/stone-library/${hotspot.stoneGroupId}?${params.toString()}`;
}

/**
 * Cards open away from the nearest edges: right-aligned to the point past 55% x,
 * above the point past 60% y. Once the layer is measured the horizontal position
 * is clamped so a card never leaves the image frame on narrow screens.
 */
function cardPosition(hotspot: ProjectHotspot, layerWidth: number): CSSProperties {
    const style: CSSProperties = {};
    const alignRight = hotspot.x > 55;

    if (layerWidth > 0) {
        const width = Math.min(CARD_WIDTH, layerWidth);
        const anchor = (hotspot.x / 100) * layerWidth;
        const preferred = alignRight ? anchor - width : anchor;
        style.left = Math.max(0, Math.min(preferred, layerWidth - width));
        style.width = width;
    } else if (alignRight) {
        style.right = `calc(100% - ${hotspot.x}%)`;
    } else {
        style.left = `${hotspot.x}%`;
    }

    if (hotspot.y > 60) {
        style.bottom = `calc(${100 - hotspot.y}% + ${CARD_OFFSET}px)`;
    } else {
        style.top = `calc(${hotspot.y}% + ${CARD_OFFSET}px)`;
    }

    return style;
}

function pointNumber(index: number) {
    return String(index + 1).padStart(2, '0');
}

export default function ProjectHotspotImage({
    image,
    imageAlt,
    title,
    intro,
    caption,
    hotspots,
    focusHotspotId = null,
    anchorId,
}: ProjectHotspotImageProps) {
    const generatedId = useId();
    const baseId = anchorId || `project-hotspots-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const [activeId, setActiveId] = useState<string | null>(null);
    const [pinnedId, setPinnedId] = useState<string | null>(null);
    const [layerWidth, setLayerWidth] = useState(0);
    const [publishedDetails, setPublishedDetails] = useState<ReadonlyMap<string, StoneDetailVM>>(
        () => new Map(),
    );
    const figureRef = useRef<HTMLElement | null>(null);
    const layerRef = useRef<HTMLDivElement | null>(null);
    const markerRefs = useRef(new Map<string, HTMLButtonElement>());
    const closeTimerRef = useRef<number | null>(null);
    const deepLinkHandledRef = useRef(false);
    const openId = pinnedId ?? activeId;

    useEffect(() => {
        let active = true;
        const uniqueMaterials = [
            ...new Map(hotspots.map((hotspot) => [materialKey(hotspot), hotspot])).values(),
        ];
        if (!uniqueMaterials.length) {
            setPublishedDetails(new Map());
            return () => {
                active = false;
            };
        }

        Promise.all(
            uniqueMaterials.map(async (hotspot) => ({
                key: materialKey(hotspot),
                detail: await StoneLibraryService.getPublishedStoneDetail(
                    hotspot.stoneGroupId,
                    hotspot.stoneVariantId,
                ),
            })),
        )
            .then((results) => {
                if (!active) return;
                setPublishedDetails(new Map(
                    results.flatMap((result) => result.detail ? [[result.key, result.detail] as const] : []),
                ));
            })
            .catch(() => {
                if (active) setPublishedDetails(new Map());
            });

        return () => {
            active = false;
        };
    }, [hotspots]);

    useLayoutEffect(() => {
        const layer = layerRef.current;
        if (!layer) return undefined;
        const measure = () => setLayerWidth(layer.getBoundingClientRect().width);
        measure();
        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', measure);
            return () => window.removeEventListener('resize', measure);
        }
        const observer = new ResizeObserver(measure);
        observer.observe(layer);
        return () => observer.disconnect();
    }, [hotspots.length]);

    useEffect(() => {
        if (deepLinkHandledRef.current || !focusHotspotId) return;
        if (!hotspots.some((hotspot) => hotspot.id === focusHotspotId)) return;
        deepLinkHandledRef.current = true;
        setPinnedId(focusHotspotId);
        // Not cancelled on cleanup: the one-shot guard would otherwise swallow the scroll
        // when an effect is replayed (StrictMode) before the frame runs.
        window.requestAnimationFrame(() => {
            figureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }, [focusHotspotId, hotspots]);

    useEffect(() => {
        if (!openId) return undefined;

        function handlePointerDown(event: PointerEvent) {
            const figure = figureRef.current;
            if (figure && event.target instanceof Node && figure.contains(event.target)) return;
            setPinnedId(null);
            setActiveId(null);
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key !== 'Escape') return;
            setPinnedId(null);
            setActiveId(null);
        }

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [openId]);

    useEffect(() => () => {
        if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    }, []);

    function cancelScheduledClose() {
        if (closeTimerRef.current !== null) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    }

    function openTransient(hotspotId: string) {
        cancelScheduledClose();
        setActiveId(hotspotId);
    }

    function scheduleTransientClose(hotspotId: string) {
        cancelScheduledClose();
        closeTimerRef.current = window.setTimeout(() => {
            closeTimerRef.current = null;
            setActiveId((current) => (current === hotspotId ? null : current));
        }, HOVER_CLOSE_DELAY_MS);
    }

    function togglePinned(hotspotId: string) {
        cancelScheduledClose();
        if (pinnedId === hotspotId) {
            setPinnedId(null);
            setActiveId(null);
            return;
        }
        setPinnedId(hotspotId);
    }

    function handleWrapperBlur(event: ReactFocusEvent<HTMLDivElement>, hotspotId: string) {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        setActiveId((current) => (current === hotspotId ? null : current));
    }

    function pinFromLegend(hotspotId: string) {
        cancelScheduledClose();
        setPinnedId(hotspotId);
        markerRefs.current.get(hotspotId)?.scrollIntoView({ block: 'nearest' });
    }

    const header = title || intro ? (
        <div className="grid gap-4 md:grid-cols-[0.42fr_1fr] md:items-end">
            {title ? <h3 className="text-[28px] font-semibold leading-tight text-black">{title}</h3> : <span />}
            {intro ? <p className="text-[17px] leading-8 text-[var(--urblo-text)]">{intro}</p> : null}
        </div>
    ) : null;

    if (!hotspots.length) {
        return (
            <div className="space-y-5">
                {header}
                <figure id={anchorId} className="overflow-hidden bg-black">
                    <ProjectResponsiveImage
                        src={image}
                        profile="hotspot"
                        alt={imageAlt}
                        className="aspect-[16/10] w-full object-cover"
                        loading="lazy"
                    />
                    {caption ? <figcaption className="mt-4 text-[14px] leading-7 text-black/55">{caption}</figcaption> : null}
                </figure>
            </div>
        );
    }

    const resolved = hotspots.map((hotspot) => resolveHotspot(hotspot, publishedDetails));

    return (
        <div className="space-y-5">
            {header}

            <figure id={anchorId} ref={figureRef} className="scroll-mt-28">
                <div ref={layerRef} className="relative border-y border-black/10 bg-black">
                    <div className="overflow-hidden">
                        <ProjectResponsiveImage
                            src={image}
                            profile="hotspot"
                            alt={imageAlt}
                            className="aspect-[4/3] w-full object-cover md:aspect-[16/10]"
                            loading="lazy"
                        />
                    </div>

                    {hotspots.map((hotspot, index) => {
                        const material = resolved[index];
                        const open = hotspot.id === openId;
                        const cardId = `${baseId}-point-${index + 1}`;
                        const copy = hotspot.description || hotspot.note;

                        return (
                            <div
                                key={hotspot.id}
                                onMouseEnter={() => openTransient(hotspot.id)}
                                onMouseLeave={() => scheduleTransientClose(hotspot.id)}
                                onBlur={(event) => handleWrapperBlur(event, hotspot.id)}
                            >
                                <button
                                    ref={(node) => {
                                        if (node) markerRefs.current.set(hotspot.id, node);
                                        else markerRefs.current.delete(hotspot.id);
                                    }}
                                    type="button"
                                    className={[
                                        'absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--urblo-lime)] bg-white transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                                        open
                                            ? 'shadow-[0_0_0_5px_rgba(0,255,25,0.28)]'
                                            : 'shadow-[0_2px_8px_rgba(0,0,0,0.35)] hover:shadow-[0_0_0_5px_rgba(0,255,25,0.22)]',
                                    ].join(' ')}
                                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                                    aria-label={`Point ${index + 1}: ${material.stoneName} / ${material.finishLabel}`}
                                    aria-expanded={open}
                                    aria-controls={cardId}
                                    onFocus={() => openTransient(hotspot.id)}
                                    onClick={() => togglePinned(hotspot.id)}
                                >
                                    <span className="block h-2 w-2 rounded-full bg-black" aria-hidden="true" />
                                </button>

                                <div
                                    id={cardId}
                                    role="group"
                                    aria-label={`${material.stoneName} ${material.finishLabel} details`}
                                    hidden={!open}
                                    className="absolute z-20 w-[260px] max-w-[calc(100vw-2rem)] border border-black/10 bg-white p-4 text-left shadow-[0_14px_30px_rgba(0,0,0,0.12)]"
                                    style={cardPosition(hotspot, layerWidth)}
                                >
                                    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3">
                                        <div className="h-[72px] w-[72px] overflow-hidden bg-black">
                                            {material.previewImage ? (
                                                <img
                                                    src={material.previewImage}
                                                    alt={material.previewAlt}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : null}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[17px] font-semibold leading-tight text-black">
                                                {material.stoneName}
                                            </p>
                                            <p className="urblo-meta mt-1.5 text-[11px] text-black/50">
                                                {material.finishLabel}
                                            </p>
                                        </div>
                                    </div>

                                    <dl className="mt-3 border-t border-black/10 pt-3">
                                        <dt className="urblo-meta text-[10px] text-black/45">Where it is used</dt>
                                        <dd className="mt-1 text-[14px] font-semibold leading-6 text-black">
                                            {hotspot.application}
                                        </dd>
                                    </dl>
                                    {copy ? (
                                        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[var(--urblo-text)]">
                                            {copy}
                                        </p>
                                    ) : null}

                                    <Link
                                        to={stoneHref(hotspot)}
                                        className="mt-3 inline-flex border-b border-black pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition-colors hover:border-[var(--urblo-lime)] hover:text-black focus-visible:border-[var(--urblo-lime)] focus-visible:outline-none"
                                    >
                                        View stone
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <ol className="mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Material points">
                    {hotspots.map((hotspot, index) => {
                        const material = resolved[index];
                        const open = hotspot.id === openId;

                        return (
                            <li key={hotspot.id}>
                                <button
                                    type="button"
                                    className={[
                                        'urblo-meta border-b pb-0.5 text-[11px] transition-colors focus-visible:outline-none focus-visible:border-[var(--urblo-lime)]',
                                        open ? 'border-[var(--urblo-lime)] text-black' : 'border-transparent text-black/55 hover:text-black',
                                    ].join(' ')}
                                    aria-controls={`${baseId}-point-${index + 1}`}
                                    aria-expanded={open}
                                    onClick={() => pinFromLegend(hotspot.id)}
                                >
                                    <span className="text-black/35">{pointNumber(index)}</span>{' '}
                                    {material.stoneName} · {material.finishLabel}
                                </button>
                            </li>
                        );
                    })}
                </ol>

                {caption ? <figcaption className="mt-3 text-[14px] leading-7 text-black/55">{caption}</figcaption> : null}
            </figure>
        </div>
    );
}
