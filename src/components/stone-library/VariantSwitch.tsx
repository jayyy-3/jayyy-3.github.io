import type { StoneVariantVM } from '../../types/stone-library';

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
                            <span
                                className={[
                                    'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
                                    variant.status === 'tbc'
                                        ? isActive
                                            ? 'bg-white/12 text-white'
                                            : 'bg-black/6 text-black/65'
                                        : isActive
                                          ? 'bg-[#00FF19] text-black'
                                          : 'bg-[rgba(0,255,25,0.12)] text-black',
                                ].join(' ')}
                            >
                                {variantStatusLabel(variant.status)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
