import { useContext } from 'react';
import { BLOCK_TEXT_LIMITS, CONTENT_BLOCK_LIMITS } from '../../../features/blocks/schema';
import { BlockItemList, BlockTextField } from './BlockFormControls';
import { BlockFormContext } from './blockFormContext';
import type { BlockFormProps } from './blockFormTypes';

export default function GalleryForm({ content, onChange, instanceKey }: BlockFormProps<'gallery'>) {
  const { renderImageField } = useContext(BlockFormContext);
  return (
    <BlockItemList
      items={content.items}
      noun="Gallery image"
      min={CONTENT_BLOCK_LIMITS.gallery.min}
      max={CONTENT_BLOCK_LIMITS.gallery.max}
      createItem={() => ({ mediaAssetId: null, alt: '', caption: '' })}
      onChange={(items) => onChange({ ...content, items })}
      renderItem={(item, index, update) => (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
          {renderImageField({
            label: 'Image',
            value: item.mediaAssetId,
            instanceKey: `${instanceKey}-gallery-${index}`,
            onChange: (mediaAssetId, alt) => update({ ...item, mediaAssetId, alt }),
          })}
          <div className="grid gap-3">
            <BlockTextField label="Image description" value={item.alt} maxLength={BLOCK_TEXT_LIMITS.short} onChange={(alt) => update({ ...item, alt })} />
            <BlockTextField label="Caption" value={item.caption} maxLength={BLOCK_TEXT_LIMITS.short} onChange={(caption) => update({ ...item, caption })} />
          </div>
        </div>
      )}
    />
  );
}
