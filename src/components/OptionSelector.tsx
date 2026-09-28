import { useProductStore } from '../store/productStore';
import type { MaterialCategory, OptionItem } from '../types/product';
import StoneResponsiveImage from './stone-library/StoneResponsiveImage';

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
      <h3 className="mb-4 text-meta font-semibold uppercase tracking-caps text-muted">{title}</h3>
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
                'overflow-hidden rounded border bg-white text-left transition',
                active
                  ? 'border-lime shadow-[0_0_0_1px_rgba(0,255,25,0.32)]'
                  : 'border-line hover:border-black/30',
              ].join(' ')}
            >
              <span className="relative block h-20 w-28 overflow-hidden bg-black/5">
                <StoneResponsiveImage
                  src={option.img}
                  profile="swatch"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className={[
                    'h-full w-full object-cover',
                    imagePending ? 'opacity-70 grayscale' : '',
                  ].join(' ')}
                />
                {imagePending ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-1 bottom-1 rounded-sm bg-white/92 px-1.5 py-1 text-center text-micro font-semibold leading-none text-ink"
                  >
                    Image pending
                  </span>
                ) : null}
              </span>
              <span className="block w-28 px-2 py-2 text-center text-micro font-semibold text-ink">
                {option.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
