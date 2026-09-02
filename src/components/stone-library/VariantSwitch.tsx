import type { StoneVariantVM } from '../../types/stone-library';
import StatusPill from './StatusPill';

interface VariantSwitchProps {
    variants: StoneVariantVM[];
    activeVariantId: string;
    label?: string;
    disabled?: boolean;
    onChange: (variantId: string) => void;
}

function variantStatusLabel(status: StoneVariantVM['status']): string {
    return status === 'tbc' ? 'Upcoming' : 'Available';
}

export default function VariantSwitch({
    variants,
    activeVariantId,
    label = 'Variant',
    disabled = false,
    onChange,
}: VariantSwitchProps) {
    if (variants.length <= 1) {
        return null;
    }

    return (
        <section aria-label={`${label} selector`} className="space-y-2.5">
            <p className="urblo-meta text-[10px] text-black/58">{label}</p>
            <div className="grid grid-cols-2 gap-2">
                {variants.map((variant) => {
                    const isActive = variant.stoneVariantId === activeVariantId;

                    return (
                        <button
                            key={variant.stoneVariantId}
                            type="button"
                            onClick={() => onChange(variant.stoneVariantId)}
                            disabled={disabled}
                            className={[
                                'inline-flex min-h-11 items-center justify-between gap-2 rounded-[4px] border px-3 py-2 text-left text-[13px] font-semibold uppercase tracking-[0.06em] transition disabled:cursor-wait disabled:opacity-60',
                                isActive
                                    ? 'border-black bg-black text-white'
                                    : 'border-black/12 bg-white text-black hover:border-black/40',
                            ].join(' ')}
                        >
                            <span>{variant.label}</span>
                            <StatusPill
                                label={variantStatusLabel(variant.status)}
                                tone={variant.status === 'tbc' ? 'upcoming' : 'available'}
                                surface={isActive ? 'dark' : 'light'}
                                className="py-1"
                            />
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
