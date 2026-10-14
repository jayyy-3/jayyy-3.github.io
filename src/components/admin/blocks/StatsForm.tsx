import { BLOCK_TEXT_LIMITS, CONTENT_BLOCK_LIMITS } from '../../../features/blocks/schema';
import { BlockItemList, BlockTextField } from './BlockFormControls';
import type { BlockFormProps } from './blockFormTypes';

export default function StatsForm({ content, onChange }: BlockFormProps<'stats'>) {
  return (
    <div className="grid gap-4">
      <BlockItemList
        items={content.items}
        noun="Number"
        min={CONTENT_BLOCK_LIMITS.stats.min}
        max={CONTENT_BLOCK_LIMITS.stats.max}
        createItem={() => ({ value: '', unit: '', label: '' })}
        onChange={(items) => onChange({ ...content, items })}
        renderItem={(item, _index, update) => (
          <div className="grid gap-3 md:grid-cols-[1fr_0.7fr_1.6fr]">
            <BlockTextField label="Figure" value={item.value} maxLength={BLOCK_TEXT_LIMITS.title} placeholder="1,200" onChange={(value) => update({ ...item, value })} />
            <BlockTextField label="Unit" value={item.unit} maxLength={BLOCK_TEXT_LIMITS.title} placeholder="m²" onChange={(unit) => update({ ...item, unit })} />
            <BlockTextField label="What it measures" value={item.label} maxLength={BLOCK_TEXT_LIMITS.short} placeholder="Paving supplied" onChange={(label) => update({ ...item, label })} />
          </div>
        )}
      />
      <BlockTextField label="Note under the numbers" value={content.caption} maxLength={BLOCK_TEXT_LIMITS.short} onChange={(caption) => onChange({ ...content, caption })} />
    </div>
  );
}
