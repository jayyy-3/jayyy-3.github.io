import { BLOCK_TEXT_LIMITS } from '../../../features/blocks/schema';
import { BlockTextArea } from './BlockFormControls';
import type { BlockFormProps } from './blockFormTypes';

export default function TextForm({ content, onChange }: BlockFormProps<'text'>) {
  return (
    <BlockTextArea
      label="Text"
      value={content.body}
      maxLength={BLOCK_TEXT_LIMITS.body}
      rows={8}
      hint="Leave an empty line between paragraphs. **Bold words**, [link text](/contact) and lines starting with - for a list."
      onChange={(body) => onChange({ ...content, body })}
    />
  );
}
