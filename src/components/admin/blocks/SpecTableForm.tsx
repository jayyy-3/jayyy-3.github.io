import { BLOCK_TEXT_LIMITS, CONTENT_BLOCK_LIMITS } from '../../../features/blocks/schema';
import { BlockItemList, BlockTextField } from './BlockFormControls';
import type { BlockFormProps } from './blockFormTypes';

export default function SpecTableForm({ content, onChange }: BlockFormProps<'spec_table'>) {
  return (
    <div className="grid gap-4">
      <BlockTextField label="Table title" value={content.title} maxLength={BLOCK_TEXT_LIMITS.title} placeholder="Specification" onChange={(title) => onChange({ ...content, title })} />
      <BlockItemList
        items={content.rows}
        noun="Row"
        min={CONTENT_BLOCK_LIMITS.spec_table.min}
        max={CONTENT_BLOCK_LIMITS.spec_table.max}
        createItem={() => ({ label: '', value: '' })}
        onChange={(rows) => onChange({ ...content, rows })}
        renderItem={(row, _index, update) => (
          <div className="grid gap-3 md:grid-cols-[0.8fr_1.2fr]">
            <BlockTextField label="Label" value={row.label} maxLength={BLOCK_TEXT_LIMITS.title} placeholder="Finish" onChange={(label) => update({ ...row, label })} />
            <BlockTextField label="Value" value={row.value} maxLength={BLOCK_TEXT_LIMITS.short} placeholder="Flamed" onChange={(value) => update({ ...row, value })} />
          </div>
        )}
      />
    </div>
  );
}
