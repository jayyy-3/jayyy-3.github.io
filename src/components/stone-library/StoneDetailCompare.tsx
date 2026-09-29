import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { compareHref } from '../../lib/stoneCompareSelection';
import CompareToggle from './CompareToggle';
import { useStoneCompareSelection } from './useStoneCompareSelection';

/**
 * Compare control for a stone detail page. The selection is shared with the list tray
 * through localStorage; the detail URL keeps its own variant/finish parameters.
 */
export default function StoneDetailCompare({ stoneGroupId, stoneName }: { stoneGroupId: string; stoneName: string }) {
    const compare = useStoneCompareSelection();
    const selected = compare.isSelected(stoneGroupId);
    const count = compare.ids.length;

    return (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1" data-stone-detail-compare="true">
            <CompareToggle
                stoneName={stoneName}
                selected={selected}
                onToggle={() => compare.toggle(stoneGroupId, stoneName)}
            />
            {count >= 2 ? (
                <Link to={compareHref(compare.ids)} className="urblo-button-link min-h-11">
                    Compare {count} stones
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            ) : null}
            <p role="status" aria-live="polite" className={compare.message?.kind === 'full' ? 'basis-full text-small text-ink' : 'sr-only'}>
                {compare.message?.text}
            </p>
        </div>
    );
}
