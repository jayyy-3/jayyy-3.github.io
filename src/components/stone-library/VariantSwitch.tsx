import type { StoneVariantVM } from '../../types/stone-library';
import StatusPill from './StatusPill';

interface VariantSwitchProps {
    variants: StoneVariantVM[];
    activeVariantId: string;
    onChange: (variantId: string) => void;
}

function variantStatusLabel(status: StoneVariantVM['status']): string {
    return status === 'tbc' ? 'Upcoming' : 'Available';
}

export default function VariantSwitch({
    variants,
    activeVariantId,
    onChange,
}: VariantSwitchProps) {
    if (variants.length <= 1) {
        return null;
    }

    return (
        <section aria-label="Variant selector" className="space-y-3">
            <p className="urblo-meta text-black/65">Variant</p>
            <div className="flex flex-wrap gap-2">
                {variants.map((variant) => {
                    const isActive = variant.stoneVariantId === activeVariantId;

                    return (
                        <button
                            key={variant.stoneVariantId}
                            type="button"
                            onClick={() => onChange(variant.stoneVariantId)}
                            className={[
                                'inline-flex items-center gap-2 rounded-[4px] border px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] transition',
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
