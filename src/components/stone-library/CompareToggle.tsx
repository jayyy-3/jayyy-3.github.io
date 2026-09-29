import { Check } from 'lucide-react';
import { cx } from '../ui/styles';

/**
 * Checkbox-style Compare control. Selected state uses the StatusPill signal language:
 * a small lime mark on a quiet surface, never a lime fill across the control.
 */
function CompareCheck({ selected }: { selected: boolean }) {
    return (
        <span
            aria-hidden="true"
            className={cx(
                'inline-flex h-4 w-4 flex-none items-center justify-center rounded-sm border transition-colors',
                selected ? 'border-ink bg-lime text-ink' : 'border-black/30 bg-white text-transparent',
            )}
        >
            <Check className="h-3 w-3" strokeWidth={3} />
        </span>
    );
}

export default function CompareToggle({
    stoneName,
    selected,
    onToggle,
    className,
}: {
    stoneName: string;
    selected: boolean;
    onToggle: () => void;
    className?: string;
}) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            aria-label={`Compare ${stoneName}`}
            onClick={onToggle}
            data-compare-toggle="true"
            className={cx(
                'urblo-focus-inset inline-flex min-h-11 items-center gap-2.5 text-meta font-semibold uppercase tracking-caps transition-colors',
                selected ? 'text-ink' : 'text-muted hover:text-ink',
                className,
            )}
        >
            <CompareCheck selected={selected} />
            <span>{selected ? 'Added to compare' : 'Compare'}</span>
        </button>
    );
}
