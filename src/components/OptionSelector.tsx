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
          const imagePending = option.imageState === 'pending';

          return (
            <button
              key={option.slug}
              type="button"
              onClick={() => setMaterial(category, option.slug)}
              aria-pressed={active}
              className={[
                'overflow-hidden rounded-[4px] border bg-white text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--urblo-lime)]',
                active
                  ? 'border-[var(--urblo-lime)] shadow-[0_0_0_1px_rgba(0,255,25,0.32)]'
                  : 'border-black/10 hover:border-black/30',
              ].join(' ')}
            >
              <span className="relative block h-20 w-28 overflow-hidden bg-black/5">
                <img
                  src={option.img}
                  alt=""
                  aria-hidden="true"
                  className={[
                    'h-full w-full object-cover',
                    imagePending ? 'opacity-70 grayscale' : '',
                  ].join(' ')}
                />
                {imagePending ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-1 bottom-1 rounded-[3px] bg-white/92 px-1.5 py-1 text-center text-[9px] font-semibold uppercase leading-none tracking-[0.08em] text-black/70"
                  >
                    Image pending
                  </span>
                ) : null}
              </span>
              <span className="block w-28 px-2 py-2 text-center text-[11px] font-semibold leading-tight text-black">
                {option.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
