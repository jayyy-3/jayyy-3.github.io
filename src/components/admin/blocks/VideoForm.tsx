import { BLOCK_TEXT_LIMITS, normalizeYouTubeId } from '../../../features/blocks/schema';
import { BlockTextField } from './BlockFormControls';
import type { BlockFormProps } from './blockFormTypes';

export default function VideoForm({ content, onChange }: BlockFormProps<'video'>) {
  const link = content.youtubeUrl.trim();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <BlockTextField label="Video title" value={content.title} maxLength={BLOCK_TEXT_LIMITS.title} onChange={(title) => onChange({ ...content, title })} />
      <BlockTextField
        label="YouTube link"
        value={content.youtubeUrl}
        maxLength={BLOCK_TEXT_LIMITS.short}
        placeholder="https://www.youtube.com/watch?v=…"
        hint={link && !normalizeYouTubeId(link) ? 'Paste the address of a YouTube video.' : undefined}
        onChange={(youtubeUrl) => onChange({ ...content, youtubeUrl })}
      />
      <div className="md:col-span-2">
        <BlockTextField label="Caption" value={content.caption} maxLength={BLOCK_TEXT_LIMITS.short} onChange={(caption) => onChange({ ...content, caption })} />
      </div>
    </div>
  );
}
