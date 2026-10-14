import { BLOCK_TEXT_LIMITS } from '../../../features/blocks/schema';
import { BlockTextArea, BlockTextField } from './BlockFormControls';
import type { BlockFormProps } from './blockFormTypes';

export default function QuoteForm({ content, onChange }: BlockFormProps<'quote'>) {
  return (
    <div className="grid gap-4">
      <BlockTextArea label="Quote" value={content.quote} maxLength={BLOCK_TEXT_LIMITS.short} rows={3} onChange={(quote) => onChange({ ...content, quote })} />
      <div className="grid gap-4 md:grid-cols-2">
        <BlockTextField label="Name" value={content.attribution} maxLength={BLOCK_TEXT_LIMITS.title} onChange={(attribution) => onChange({ ...content, attribution })} />
        <BlockTextField label="Role" value={content.role} maxLength={BLOCK_TEXT_LIMITS.title} placeholder="Landscape architect" onChange={(role) => onChange({ ...content, role })} />
      </div>
    </div>
  );
}
