import { useProductStore } from '../store/productStore';
import type { MaterialCategory, OptionItem } from '../types/product';

type Props = {
  title: string;
  category: MaterialCategory;
  options: readonly OptionItem[];
  whitelist?: string[];
};

export default function OptionSelector({ title, category, options, whitelist }: Props) {
  const selected = useProductStore((state) => state.selectedMaterials[category]);
  const setMaterial = useProductStore((state) => state.setMaterial);

  const visible = whitelist ? options.filter((option) => whitelist.includes(option.slug)) : options;

  if (!visible.length) {
    return null;
  }

  return (
    <section className="mb-8">
      <h4 className="urblo-meta mb-4 text-black/65">{title}</h4>
      <div className="flex flex-wrap gap-4">
        {visible.map((option) => {
          const active = selected === option.slug;

          return (
            <button
              key={option.slug}
              type="button"
              onClick={() => setMaterial(category, option.slug)}
              className={[
                'overflow-hidden rounded-[4px] border bg-white text-left transition',
                active
                  ? 'border-[var(--urblo-lime)] shadow-[0_0_0_1px_rgba(0,255,25,0.32)]'
                  : 'border-black/10 hover:border-black/30',
              ].join(' ')}
            >
              <img src={option.img} alt={option.name} className="h-20 w-24 object-cover" />
              <span className="block w-24 px-2 py-2 text-center text-[11px] font-semibold leading-tight text-black">
                {option.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
