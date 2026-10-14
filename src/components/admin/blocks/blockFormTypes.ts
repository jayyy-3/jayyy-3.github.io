import type { ContentBlockContentByType, ContentBlockType } from '../../../features/blocks/schema';

export interface BlockFormProps<T extends ContentBlockType> {
  content: ContentBlockContentByType[T];
  onChange: (content: ContentBlockContentByType[T]) => void;
  /** Stable per block; image fields derive their own instance keys from it. */
  instanceKey: string;
}
