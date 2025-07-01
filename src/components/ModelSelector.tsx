import { useProductStore } from '../store/productStore';
import type { ProductModel } from '../types/product';

interface Props {
    models: ProductModel[];
}

export default function ModelSelector({ models }: Props) {
    const current = useProductStore((s) => s.currentModelKey);
    const setModel = useProductStore((s) => s.selectModel);

    return (
        <div className="flex gap-4 flex-wrap mb-6">
            {models.map((m) => (
                    <button
                        key={m.key}
                onClick={() => setModel(m.key)}
    className={`rounded border px-3 py-1 text-sm transition
            ${
        current === m.key
            ? 'border-emerald-600 bg-emerald-50'
            : 'border-gray-300 hover:bg-gray-50'
    }`}
>
    {m.label}
    </button>
))}
    </div>
);
}
