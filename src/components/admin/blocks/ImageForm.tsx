import { useContext } from 'react';
import { BLOCK_TEXT_LIMITS } from '../../../features/blocks/schema';
import { BlockTextField } from './BlockFormControls';
import { BlockFormContext } from './blockFormContext';
import type { BlockFormProps } from './blockFormTypes';

export default function ImageForm({ content, onChange, instanceKey }: BlockFormProps<'image'>) {
  const { renderImageField } = useContext(BlockFormContext);
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
      {renderImageField({
        label: 'Image',
        value: content.mediaAssetId,
        instanceKey,
        onChange: (mediaAssetId, alt) => onChange({ ...content, mediaAssetId, alt }),
      })}
      <div className="grid gap-4">
        <BlockTextField label="Image description" value={content.alt} maxLength={BLOCK_TEXT_LIMITS.short} hint="Read aloud to visitors who cannot see the picture." onChange={(alt) => onChange({ ...content, alt })} />
        <BlockTextField label="Small label" value={content.label} maxLength={BLOCK_TEXT_LIMITS.title} placeholder="Detail" onChange={(label) => onChange({ ...content, label })} />
        <BlockTextField label="Caption" value={content.caption} maxLength={BLOCK_TEXT_LIMITS.short} onChange={(caption) => onChange({ ...content, caption })} />
      </div>
    </div>
  );
}
