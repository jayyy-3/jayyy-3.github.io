import { useContext } from 'react';
import { BLOCK_TEXT_LIMITS, CONTENT_BLOCK_LIMITS } from '../../../features/blocks/schema';
import { BlockItemList, BlockTextArea, BlockTextField } from './BlockFormControls';
import { BlockFormContext } from './blockFormContext';
import type { BlockFormProps } from './blockFormTypes';

export default function StepsForm({ content, onChange, instanceKey }: BlockFormProps<'steps'>) {
  const { renderImageField } = useContext(BlockFormContext);
  return (
    <div className="grid gap-4">
      <BlockTextField label="Introduction" value={content.intro} maxLength={BLOCK_TEXT_LIMITS.short} onChange={(intro) => onChange({ ...content, intro })} />
      <BlockItemList
        items={content.items}
        noun="Step"
        min={CONTENT_BLOCK_LIMITS.steps.min}
        max={CONTENT_BLOCK_LIMITS.steps.max}
        createItem={() => ({ title: '', body: '', mediaAssetId: null, alt: '' })}
        onChange={(items) => onChange({ ...content, items })}
        renderItem={(item, index, update) => (
          <>
            <BlockTextField label="Step title" value={item.title} maxLength={BLOCK_TEXT_LIMITS.title} onChange={(title) => update({ ...item, title })} />
            <BlockTextArea label="Step text" value={item.body} maxLength={BLOCK_TEXT_LIMITS.body} rows={3} onChange={(body) => update({ ...item, body })} />
            {renderImageField({
              label: 'Step image (optional)',
              value: item.mediaAssetId ?? null,
              instanceKey: `${instanceKey}-step-${index}`,
              onChange: (mediaAssetId, description) => update({ ...item, mediaAssetId, alt: mediaAssetId ? description : '' }),
            })}
            {item.mediaAssetId ? (
              <BlockTextField label="Image description" value={item.alt} maxLength={BLOCK_TEXT_LIMITS.short} onChange={(alt) => update({ ...item, alt })} />
            ) : null}
          </>
        )}
      />
    </div>
  );
}
