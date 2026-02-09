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
        <section aria-label="Variant selector" className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Variant
            </p>
            <div className="flex flex-wrap gap-2">
                {variants.map((variant) => {
                    const isActive = variant.stoneVariantId === activeVariantId;

                    return (
                        <button
                            key={variant.stoneVariantId}
                            type="button"
                            onClick={() => onChange(variant.stoneVariantId)}
                            className={[
                                'inline-flex items-center gap-2 border px-3 py-2 text-sm transition',
                                isActive
                                    ? 'border-black bg-black text-white'
                                    : 'border-neutral-300 bg-white text-neutral-900 hover:border-black',
                            ].join(' ')}
                        >
                            <span>{variant.label}</span>
                            <span
                                className={[
                                    'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
                                    variant.status === 'tbc'
                                        ? isActive
                                            ? 'bg-neutral-700 text-white'
                                            : 'bg-neutral-100 text-neutral-700'
                                        : isActive
                                          ? 'bg-[#00FF19] text-black'
                                          : 'bg-neutral-100 text-neutral-700',
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
