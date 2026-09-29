import { ArrowRight, X } from 'lucide-react';
import Button from '../ui/Button';
import { cx } from '../ui/styles';
import { MAX_COMPARE_STONES, compareHref } from '../../lib/stoneCompareSelection';
import type { StoneCardVM } from '../../types/stone-library';
import StoneResponsiveImage from './StoneResponsiveImage';
import type { CompareMessage } from './useStoneCompareSelection';

function Thumb({ stone, size }: { stone: StoneCardVM; size: 'sm' | 'md' }) {
    const box = size === 'md' ? 'h-11 w-11' : 'h-9 w-9';
    return stone.coverImageUrl ? (
        <StoneResponsiveImage
            src={stone.coverImageUrl}
            profile="thumb"
            sizes={size === 'md' ? '44px' : '36px'}
            alt=""
            className={cx(box, 'flex-none rounded-sm object-cover')}
            loading="lazy"
        />
    ) : (
        <span aria-hidden="true" className={cx(box, 'flex-none rounded-sm bg-[linear-gradient(135deg,#f4f4f1,#deded8)]')} />
    );
}

/**
 * Bottom compare tray for the Stone Library list. Same surface family as the sticky
 * FilterBar (white glass, hairline, soft shadow); it is a tool bar, not a modal, and never
 * traps focus. It is sticky to the bottom of the list page, so it settles above the footer
 * instead of covering it. Empty slots show the four-stone capacity.
 */
export default function CompareTray({
    stones,
    message,
    onRemove,
    onClear,
}: {
    /** Selected stones in selection order. */
    stones: StoneCardVM[];
    message: CompareMessage | null;
    onRemove: (id: string) => void;
    onClear: () => void;
}) {
    if (!stones.length) return null;
    const ids = stones.map((stone) => stone.stoneGroupId);
    const canCompare = stones.length >= 2;
    const emptySlots = Math.max(0, MAX_COMPARE_STONES - stones.length);
    // The cap warning and the "one more" hint stay visible; add/remove is announced only.
    const visibleNote = message?.kind === 'full' ? message.text : canCompare ? null : 'Add one more stone to compare.';
    const announced = message?.text ?? visibleNote;

    const action = canCompare ? (
        <Button to={compareHref(ids)} size="sm" className="flex-none whitespace-nowrap">
            Compare <span className="hidden sm:inline">{stones.length} stones</span>
            <span className="sm:hidden">({stones.length})</span>
            <ArrowRight className="hidden h-4 w-4 sm:block" aria-hidden="true" />
        </Button>
    ) : (
        <Button size="sm" disabled className="flex-none">
            Compare
        </Button>
    );

    return (
        <section
            aria-label="Compare stones"
            data-compare-tray="true"
            className="sticky bottom-0 z-40 border-t border-black/10 bg-white/98 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur"
        >
            <div className="urblo-page-container flex flex-col gap-2.5 py-3 md:flex-row md:items-center md:gap-5">
                <div className="flex items-center gap-3 md:block md:min-w-[112px]">
                    <p className="urblo-meta whitespace-nowrap text-ink">
                        Compare <span className="text-muted">{stones.length} / {MAX_COMPARE_STONES}</span>
                    </p>
                    <button type="button" onClick={onClear} className="urblo-button-link min-h-10 md:mt-1 md:min-h-0">
                        Clear
                    </button>
                    <div className="ml-auto md:hidden">{action}</div>
                </div>

                <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto md:overflow-visible" aria-label="Selected stones">
                    {stones.map((stone) => (
                        <li
                            key={stone.stoneGroupId}
                            className="flex flex-none items-center gap-2 rounded-[4px] border border-line bg-white p-1 md:min-w-0 md:flex-1 md:basis-0"
                        >
                            <Thumb stone={stone} size="sm" />
                            <span className="min-w-0 max-w-[6.5rem] truncate text-small font-medium text-ink md:max-w-none md:flex-1">
                                {stone.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => onRemove(stone.stoneGroupId)}
                                aria-label={`Remove ${stone.name} from compare`}
                                className="urblo-focus-inset inline-flex h-9 w-9 flex-none items-center justify-center rounded-sm text-muted transition-colors hover:bg-black/5 hover:text-ink"
                            >
                                <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </li>
                    ))}
                    {Array.from({ length: emptySlots }, (_, index) => (
                        <li
                            key={`slot-${index}`}
                            aria-hidden="true"
                            className="hidden h-[46px] flex-1 basis-0 items-center rounded-[4px] border border-dashed border-black/15 px-3 text-meta uppercase tracking-caps text-black/35 md:flex"
                        >
                            Add a stone
                        </li>
                    ))}
                </ul>

                <div className="hidden md:block">{action}</div>
            </div>
            <p role="status" aria-live="polite" className="sr-only">
                {announced}
            </p>
            {visibleNote ? (
                <div className="urblo-page-container -mt-1 pb-3">
                    <p className="flex items-center gap-2 text-small text-ink" data-compare-note="true">
                        <span aria-hidden="true" className="h-1.5 w-1.5 flex-none rounded-full bg-lime ring-1 ring-black/20" />
                        {visibleNote}
                    </p>
                </div>
            ) : null}
        </section>
    );
}
