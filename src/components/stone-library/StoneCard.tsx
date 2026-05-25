import { Link } from 'react-router-dom';
import type { StoneCardVM } from '../../types/stone-library';
import StatusPill from './StatusPill';

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
      className="group block overflow-hidden rounded-[4px] border border-black/10 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-black/28 hover:shadow-[0_18px_38px_rgba(0,0,0,0.08)]"
    >
      <div className="relative aspect-[1.08/1] overflow-hidden bg-[rgba(239,239,239,0.78)]">
        {stone.coverImageUrl ? (
          <img
            src={stone.coverImageUrl}
            alt={stone.coverImageAlt || `${stone.name} finish preview`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025] group-hover:opacity-95"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f4f4f1,#deded8)] px-6 text-center">
            <p className="urblo-meta text-black/50">Image coming soon</p>
          </div>
        )}

        <StatusPill
          label={statusBadgeLabel(stone.status)}
          tone={stone.status === 'tbc' ? 'upcoming' : 'available'}
          surface="overlay"
          className="absolute left-3 top-3"
        />
      </div>

      <div className="space-y-2.5 p-4">
        <h3 className="font-display text-[23px] font-semibold uppercase leading-[1.05] tracking-[0.01em] text-black md:text-[24px]">
          {stone.name}
        </h3>
        <p className="text-[14px] font-medium text-black/80">{stone.stoneType}</p>
        <p className="text-[13px] font-medium text-[var(--urblo-text)]">{stone.originLabel}</p>
        <div className="flex items-center justify-between border-t border-black/10 pt-3">
          <p className="urblo-meta text-[10px] text-black/58">{stone.finishCount} finishes</p>
          <p className="urblo-meta text-[10px] text-black/58">
            {stone.variantCount > 1 ? `${stone.variantCount} variants` : 'Standard'}
          </p>
        </div>
      </div>
    </Link>
  );
}
