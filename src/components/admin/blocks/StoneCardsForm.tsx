import { useContext } from 'react';
import { BLOCK_TEXT_LIMITS, CONTENT_BLOCK_LIMITS } from '../../../features/blocks/schema';
import { BlockItemList, BlockSelect, BlockTextField } from './BlockFormControls';
import { BlockFormContext } from './blockFormContext';
import type { BlockFormProps } from './blockFormTypes';

const statusSuffix = (status: string) => (status === 'published' ? ' (Live)' : status === 'draft' ? ' (Draft)' : ' (Hidden)');

/** Stone Library stones only; names, photos and types come from the Stone Library. */
export default function StoneCardsForm({ content, onChange }: BlockFormProps<'stone_cards'>) {
  const { stones, finishes } = useContext(BlockFormContext);
  return (
    <div className="grid gap-4">
      <BlockTextField label="Title above the cards" value={content.title} maxLength={BLOCK_TEXT_LIMITS.title} placeholder="Stones used" onChange={(title) => onChange({ ...content, title })} />
      <BlockItemList
        items={content.items}
        noun="Stone"
        min={CONTENT_BLOCK_LIMITS.stone_cards.min}
        max={CONTENT_BLOCK_LIMITS.stone_cards.max}
        createItem={() => ({ stoneGroupId: null, finishKey: '', note: '' })}
        onChange={(items) => onChange({ ...content, items })}
        renderItem={(item, _index, update) => {
          const visible = stones.filter((stone) => stone.status !== 'archived' || stone.id === item.stoneGroupId);
          return (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <BlockSelect
                  label="Stone"
                  value={item.stoneGroupId ? String(item.stoneGroupId) : ''}
                  placeholder="Choose a stone"
                  options={visible.map((stone) => ({ value: String(stone.id), label: `${stone.label}${statusSuffix(stone.status)}` }))}
                  onChange={(value) => update({ ...item, stoneGroupId: value ? Number(value) : null })}
                />
                <BlockSelect
                  label="Finish shown"
                  value={item.finishKey ?? ''}
                  placeholder="First available finish"
                  options={finishes.map((finish) => ({ value: finish.key, label: finish.label }))}
                  onChange={(finishKey) => update({ ...item, finishKey })}
                />
              </div>
              <BlockTextField label="Where it is used" value={item.note} maxLength={BLOCK_TEXT_LIMITS.short} placeholder="Entry paving" onChange={(note) => update({ ...item, note })} />
            </>
          );
        }}
      />
    </div>
  );
}
