import { useContext } from 'react';
import {
  CONTENT_BLOCK_DEFINITIONS,
  CONTENT_BLOCK_GROUP_LABELS,
  type ContentBlockGroup,
  type ContentBlockType,
} from '../../../features/blocks/schema';
import { BlockFormContext } from './blockFormContext';
import BlockTypeIcon from './BlockTypeIcon';

const groups: ContentBlockGroup[] = ['narrative', 'evidence', 'media_action'];

/** The 14 block types in three groups, each with a one-line explanation. */
export default function AddBlockPanel({
  heading,
  unavailable,
  onAdd,
  onClose,
}: {
  heading: string;
  /** Types that cannot be added now, with the reason shown under them. */
  unavailable?: Partial<Record<ContentBlockType, string>>;
  onAdd: (type: ContentBlockType) => void;
  onClose: () => void;
}) {
  const { disabled } = useContext(BlockFormContext);
  return (
    <div className="border border-black bg-white p-4" role="group" aria-label={heading}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-black">{heading}</h3>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-9 items-center rounded border border-black/15 bg-white px-3 text-micro font-bold uppercase tracking-[0.12em] text-black transition hover:border-black"
        >
          Cancel
        </button>
      </div>
      <div className="mt-4 grid gap-5 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group}>
            <p className="text-micro font-bold uppercase tracking-[0.13em] text-black/52">{CONTENT_BLOCK_GROUP_LABELS[group]}</p>
            <ul className="mt-2 grid gap-2">
              {CONTENT_BLOCK_DEFINITIONS.filter((definition) => definition.group === group).map((definition) => {
                const reason = unavailable?.[definition.type];
                return (
                  <li key={definition.type}>
                    <button
                      type="button"
                      disabled={disabled || Boolean(reason)}
                      onClick={() => onAdd(definition.type)}
                      className="grid w-full grid-cols-[28px_minmax(0,1fr)] gap-2 rounded border border-black/10 bg-[#f8f9f5] p-3 text-left transition hover:border-black disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      <BlockTypeIcon type={definition.type} className="mt-0.5 h-5 w-5 text-black/70" />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-black">{definition.label}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-black/58">{reason ?? definition.description}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
