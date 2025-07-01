import {materialCategories} from '../data/materialData';
import { useProductStore } from '../store/productStore';
import type { MaterialCategory } from '../types/product';

interface Props {
    category: MaterialCategory;
    /** 若仅允许部分材质，可传入 slug 白名单 */
    whitelist?: string[];
}

export default function MaterialSelector({ category, whitelist }: Props) {
    const selected = useProductStore((s) => s.selectedMaterials[category]);
    const setMaterial = useProductStore((s) => s.setMaterial);

    const options = materialCategories
        .flatMap(cat => cat.subCategories)
        .flatMap(sub => sub.items)
        .filter(item => !whitelist || whitelist.includes(item.slug));

    if (options.length === 0) return null;

    return (
        <div className="mb-6">
            <h4 className="mb-2 font-medium capitalize">{category}</h4>
            <div className="flex flex-wrap gap-3">
                {options.map((o) => (
                    <button
                        key={o.slug}
                        onClick={() => setMaterial(category, o.slug)}
                        className={`w-16 h-16 overflow-hidden rounded border-2 transition
              ${
                            selected === o.slug
                                ? 'border-emerald-600'
                                : 'border-transparent hover:border-gray-300'
                        }`}
                    >
                        <img
                            src={o.img}
                            alt={o.name}
                            className="h-full w-full object-cover"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
