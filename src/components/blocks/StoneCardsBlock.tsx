import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { StoneCardsBlockView, StoneCardView } from '../../features/blocks/view';
import StoneLibraryService from '../../service/StoneLibraryService';
import type { StoneDetailVM } from '../../types/stone-library';
import StoneResponsiveImage from '../stone-library/StoneResponsiveImage';
import { buttonClassName, cardTitleClassName } from '../ui/styles';
import { blockMetaClassName } from './blockStyles';

type Resolved = ReadonlyMap<string, StoneDetailVM | null>;

function StoneCard({ item, detail }: { item: StoneCardView; detail: StoneDetailVM | null | undefined }) {
  // Unknown, hidden or not-yet-loaded stones show a quiet placeholder rather than a guess.
  if (!item.stoneGroupId || !detail) {
    return (
      <li className="grid content-start gap-3 border-t border-line pt-4">
        <div className="grid aspect-[4/3] place-items-center border border-dashed border-line text-meta font-bold uppercase tracking-caps text-muted">
          Stone to be confirmed
        </div>
        {item.note ? <p className="text-small text-body">{item.note}</p> : null}
      </li>
    );
  }
  const finish = detail.finishes.find((entry) => entry.finishKey === item.finishKey) ?? null;
  const params = new URLSearchParams();
  if (finish) params.set('finish', finish.finishKey);
  const href = `/stone-library/${item.stoneGroupId}${params.size ? `?${params.toString()}` : ''}`;
  return (
    <li className="border-t border-line pt-4">
      <Link to={href} className="group grid content-start gap-3">
        <div className="overflow-hidden bg-ink">
          {finish?.imageUrl ? (
            <StoneResponsiveImage
              src={finish.imageUrl}
              profile="material"
              alt={finish.imageAlt || `${detail.name} ${finish.label} finish`}
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="grid aspect-[4/3] place-items-center bg-surface text-meta font-bold uppercase tracking-caps text-muted">
              Photo pending
            </div>
          )}
        </div>
        <p className={blockMetaClassName}>{[detail.stoneType, finish?.label].filter(Boolean).join(' · ')}</p>
        <h3 className={cardTitleClassName()}>{detail.name}</h3>
        {item.note ? <p className="text-small text-body">{item.note}</p> : null}
        <span className={buttonClassName({ variant: 'link', className: 'group-hover:decoration-lime' })}>View stone</span>
      </Link>
    </li>
  );
}

/** Stone Library stones with their published photo, type and finish. */
export default function StoneCardsBlock({ block }: { block: StoneCardsBlockView }) {
  const [resolved, setResolved] = useState<Resolved>(() => new Map());
  const keys = [...new Set(block.items.flatMap((item) => (item.stoneGroupId ? [item.stoneGroupId] : [])))];
  const keyList = keys.join('|');

  useEffect(() => {
    let active = true;
    const stoneKeys = keyList ? keyList.split('|') : [];
    Promise.all(stoneKeys.map(async (key) => [key, await StoneLibraryService.getPublishedStoneDetail(key)] as const))
      .then((entries) => {
        if (active) setResolved(new Map(entries));
      })
      .catch(() => {
        if (active) setResolved(new Map());
      });
    return () => {
      active = false;
    };
  }, [keyList]);

  return (
    <div>
      {block.title ? <h3 className={`mb-5 ${cardTitleClassName()}`}>{block.title}</h3> : null}
      <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {block.items.map((item, index) => (
          <StoneCard
            key={`${item.stoneGroupId ?? 'pending'}-${index}`}
            item={item}
            detail={item.stoneGroupId ? resolved.get(item.stoneGroupId) : null}
          />
        ))}
      </ul>
    </div>
  );
}
