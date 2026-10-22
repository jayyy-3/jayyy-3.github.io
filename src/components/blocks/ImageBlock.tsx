import type { BlockImageSize, ImageBlockView } from '../../features/blocks/view';
import BodyImage, { type BodyImageLayout } from './BodyImage';
import { blockCaptionClassName, blockCaptionTextClassName, blockMetaClassName } from './blockStyles';

interface ImageBlockProps {
  block: ImageBlockView;
  layout?: BodyImageLayout;
  onMeasure?: (size: BlockImageSize) => void;
}

/** One body image with an optional label and caption, presented to suit its shape. */
export default function ImageBlock({ block, layout = 'single', onMeasure }: ImageBlockProps) {
  return (
    <BodyImage
      src={block.src}
      alt={block.alt}
      width={block.width}
      height={block.height}
      presentation={block.presentation}
      layout={layout}
      onMeasure={onMeasure}
    >
      {block.label || block.caption ? (
        <figcaption className={blockCaptionClassName}>
          {block.label ? <p className={blockMetaClassName}>{block.label}</p> : null}
          {block.caption ? <p className={blockCaptionTextClassName}>{block.caption}</p> : null}
        </figcaption>
      ) : null}
    </BodyImage>
  );
}
