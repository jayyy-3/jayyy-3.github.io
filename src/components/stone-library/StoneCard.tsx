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
            className="group block border border-neutral-200 bg-white transition hover:border-neutral-900"
        >
            <div className="relative h-60 overflow-hidden bg-neutral-900">
                {stone.coverImageUrl ? (
                    <img
                        src={stone.coverImageUrl}
                        alt={stone.coverImageAlt || `${stone.name} finish preview`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] group-hover:opacity-90"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-600 px-6 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#00FF19]">
                            Image coming soon
                        </p>
                    </div>
                )}

                <span className="absolute left-3 top-3 border border-black bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black">
                    {statusBadgeLabel(stone.status)}
                </span>
            </div>

            <div className="space-y-2 p-4">
                <h3 className="text-xl font-semibold text-neutral-950">{stone.name}</h3>
                <p className="text-sm text-neutral-700">{stone.stoneType}</p>
                <p className="text-sm text-neutral-500">{stone.originLabel}</p>
                <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-neutral-600">
                        {stone.finishCount} finishes
                    </p>
                    {stone.variantCount > 1 ? (
                        <p className="text-xs uppercase tracking-[0.12em] text-neutral-600">
                            {stone.variantCount} variants
                        </p>
                    ) : (
                        <p className="text-xs uppercase tracking-[0.12em] text-neutral-600">
                            Standard
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}
