interface AustralianStoneBadgeProps {
  /** `md` overlays the detail finish image; `sm` sits on list-card images. */
  size?: 'md' | 'sm';
  className?: string;
}

const SIZE_CLASS = {
  md: 'px-3.5 py-1.5 text-micro',
  sm: 'px-2.5 py-1 text-micro',
} as const;

/**
 * Lime outline pill for stones whose CMS origin country is Australia. The only
 * public trace of origin; the country string itself is never rendered.
 * Visible text is real text, so screen readers read it without an extra label.
 */
export default function AustralianStoneBadge({ size = 'md', className = '' }: AustralianStoneBadgeProps) {
  return (
    <span
      data-australian-stone-badge=""
      className={[
        'pointer-events-none inline-flex items-center justify-center whitespace-nowrap rounded-full border-[1.5px] border-lime bg-black/35 text-center font-semibold uppercase tracking-caps text-lime backdrop-blur-sm',
        SIZE_CLASS[size],
        className,
      ].join(' ')}
    >
      Australian stone
    </span>
  );
}
