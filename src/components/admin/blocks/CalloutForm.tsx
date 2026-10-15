import { BLOCK_TEXT_LIMITS } from '../../../features/blocks/schema';
import { BlockSelect, BlockTextArea, BlockTextField } from './BlockFormControls';
import type { BlockFormProps } from './blockFormTypes';

export default function CalloutForm({ content, onChange }: BlockFormProps<'callout'>) {
  return (
    <div className="grid gap-4">
      <BlockTextField label="Callout title" value={content.title} maxLength={BLOCK_TEXT_LIMITS.title} onChange={(title) => onChange({ ...content, title })} />
      <BlockTextArea label="Callout text" value={content.body} maxLength={BLOCK_TEXT_LIMITS.short} rows={3} onChange={(body) => onChange({ ...content, body })} />
      <BlockSelect
        label="Edge colour"
        value={content.tone}
        options={[{ value: 'neutral', label: 'Black edge' }, { value: 'lime', label: 'Green edge' }]}
        onChange={(tone) => onChange({ ...content, tone: tone === 'lime' ? 'lime' : 'neutral' })}
      />
    </div>
  );
}
