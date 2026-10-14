import { BLOCK_TEXT_LIMITS } from '../../../features/blocks/schema';
import { BlockTextArea, BlockTextField } from './BlockFormControls';
import type { BlockFormProps } from './blockFormTypes';

export default function HeadingForm({ content, onChange }: BlockFormProps<'heading'>) {
  return (
    <div className="grid gap-4">
      <BlockTextField label="Small label" value={content.eyebrow} maxLength={BLOCK_TEXT_LIMITS.title} placeholder="Background" onChange={(eyebrow) => onChange({ ...content, eyebrow })} />
      <BlockTextField label="Heading" value={content.title} maxLength={BLOCK_TEXT_LIMITS.title} onChange={(title) => onChange({ ...content, title })} />
      <BlockTextArea label="Introduction" value={content.intro} maxLength={BLOCK_TEXT_LIMITS.short} rows={2} onChange={(intro) => onChange({ ...content, intro })} />
    </div>
  );
}
