import { Link } from 'react-router-dom';
import type { StoneCardVM } from '../../types/stone-library';

interface StoneCardProps {
  stone: StoneCardVM;
}

function statusBadgeLabel(status: StoneCardVM['status']): string {
  return status === 'tbc' ? 'Upcoming' : 'Available';
}

export default function StoneCard({ stone }: StoneCardProps) {
  return (
    <Link
      to={`/stone-library/${stone.stoneGroupId}`}
      className="urblo-card group block overflow-hidden transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative h-72 overflow-hidden bg-black/90">
        {stone.coverImageUrl ? (
          <img
            src={stone.coverImageUrl}
            alt={stone.coverImageAlt || `${stone.name} finish preview`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] group-hover:opacity-90"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-black to-[#33363f] px-6 text-center">
            <p className="urblo-meta text-[var(--urblo-lime)]">Image coming soon</p>
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-[4px] border border-black bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black">
          {statusBadgeLabel(stone.status)}
        </span>
      </div>

      <div className="space-y-3 p-5">
        <h3 className="font-display text-[28px] font-semibold uppercase leading-[1.08] text-black">
          {stone.name}
        </h3>
        <p className="text-[16px] text-black/80">{stone.stoneType}</p>
        <p className="text-[15px] text-[var(--urblo-text)]">{stone.originLabel}</p>
        <div className="flex items-center justify-between border-t border-black/10 pt-4">
          <p className="urblo-meta text-black/65">{stone.finishCount} finishes</p>
          <p className="urblo-meta text-black/65">
            {stone.variantCount > 1 ? `${stone.variantCount} variants` : 'Standard'}
          </p>
        </div>
      </div>
    </Link>
  );
}
