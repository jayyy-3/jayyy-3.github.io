import { Link } from 'react-router-dom';
import type { StoneCardVM } from '../../types/stone-library';
import CompareToggle from './CompareToggle';
import StoneResponsiveImage from './StoneResponsiveImage';

interface StoneCardProps {
  stone: StoneCardVM;
  /** Compare selection; the toggle renders only when a handler is passed. */
  compareSelected?: boolean;
  onCompareToggle?: () => void;
}

export default function StoneCard({ stone, compareSelected = false, onCompareToggle }: StoneCardProps) {
  // The Compare control sits beside the card link, never inside it (no nested interactive content).
  return (
    <div
      data-compare-selected={compareSelected || undefined}
      className={[
        'group flex flex-col overflow-hidden rounded-[4px] border bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(0,0,0,0.08)]',
        compareSelected ? 'border-black' : 'border-black/10 hover:border-black/28',
      ].join(' ')}
    >
      <Link to={`/stone-library/${stone.stoneGroupId}`} className="block flex-1">
        <div className="relative aspect-[1.08/1] overflow-hidden bg-[rgba(239,239,239,0.78)]">
          {stone.coverImageUrl ? (
            <StoneResponsiveImage
              src={stone.coverImageUrl}
              profile="card"
              alt={stone.coverImageAlt || `${stone.name} finish preview`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025] group-hover:opacity-95"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f4f4f1,#deded8)] px-6 text-center">
              <p className="urblo-meta text-black/60">Image coming soon</p>
            </div>
          )}
        </div>

        <div className="space-y-2.5 p-4">
          <h3 className="font-display text-[23px] font-semibold uppercase leading-[1.05] tracking-[0.01em] text-black md:text-[24px]">
            {stone.name}
          </h3>
          <p className="text-[14px] font-medium text-black/80">{stone.stoneType}</p>
          <div className="flex items-center justify-between border-t border-black/10 pt-3">
            <p className="urblo-meta text-black/58">{stone.finishCount}{stone.finishCount === 1 ? ' finish' : ' finishes'}</p>
            <p className="urblo-meta text-black/58">
              {stone.variantCount > 1 ? `${stone.variantCount} variants` : 'Standard'}
            </p>
          </div>
        </div>
      </Link>
      {onCompareToggle ? (
        <div className="border-t border-black/10 px-4">
          <CompareToggle
            stoneName={stone.name}
            selected={compareSelected}
            onToggle={onCompareToggle}
            className="w-full"
          />
        </div>
      ) : null}
    </div>
  );
}
