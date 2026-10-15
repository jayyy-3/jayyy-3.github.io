import { BLOCK_TEXT_LIMITS } from '../../../features/blocks/schema';
import { BlockTextField } from './BlockFormControls';
import type { BlockFormProps } from './blockFormTypes';

/** Words around an image with material points; the host editor owns the image and points. */
export default function HotspotImageForm({ content, onChange }: BlockFormProps<'hotspot_image'>) {
  return (
    <div className="grid gap-4">
      <BlockTextField label="Title above the image" value={content.title} maxLength={BLOCK_TEXT_LIMITS.title} placeholder="Stone and finish placement" onChange={(title) => onChange({ ...content, title })} />
      <BlockTextField label="Caption" value={content.caption} maxLength={BLOCK_TEXT_LIMITS.short} onChange={(caption) => onChange({ ...content, caption })} />
    </div>
  );
}
