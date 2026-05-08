import { useProductStore } from '../store/productStore';
import type { ProductModel } from '../types/product';

interface Props {
  models: ProductModel[];
}

export default function ModelSelector({ models }: Props) {
  const current = useProductStore((state) => state.currentModelKey);
  const setModel = useProductStore((state) => state.selectModel);

  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {models.map((model) => {
        const active = current === model.key;

        return (
          <button
            key={model.key}
            type="button"
            onClick={() => setModel(model.key)}
            className={[
              'rounded-[4px] border px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] transition',
              active
                ? 'border-black bg-black text-white'
                : 'border-black/15 bg-white text-black hover:border-black/35',
            ].join(' ')}
          >
            {model.label}
          </button>
        );
      })}
    </div>
  );
}
