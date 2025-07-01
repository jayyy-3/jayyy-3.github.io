import { useProductStore } from '../store/productStore';
import type {MaterialCategory, OptionItem} from '../types/product';

type Props = {
    title: string;
    category: MaterialCategory;        // ← uses the shared union
    options: readonly OptionItem[];
    whitelist?: string[];
};

export default function OptionSelector({
                                           title,
                                           category,
                                           options,
                                           whitelist,
                                       }: Props) {
    const selected = useProductStore((s) => s.selectedMaterials[category]);
    const setMaterial = useProductStore((s) => s.setMaterial);

    const visible = whitelist ? options.filter((o) => whitelist!.includes(o.slug)) : options;

    if (!visible.length) return null;

    return (
        <section className="mb-6">
            <h4 className="mb-2 font-medium">{title}</h4>
            <div className="flex flex-wrap gap-4">
                {visible.map((o) => (
                    <button
                        key={o.slug}
                        onClick={() => setMaterial(category, o.slug)}
                        className={`w-20 overflow-hidden rounded border-2 transition
              ${selected === o.slug ? 'border-emerald-600' : 'border-transparent hover:border-gray-300'}`}
                    >
                        <img src={o.img} alt={o.name} className="h-16 w-full object-cover" />
                        <span className="px-1 pb-1 text-xs text-center leading-tight min-h-[2.5rem] line-clamp-3">{o.name}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}