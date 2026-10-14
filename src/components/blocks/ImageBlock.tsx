import type { ImageBlockView } from '../../features/blocks/view';
import ProjectResponsiveImage from '../projects/ProjectResponsiveImage';
import { blockMetaClassName } from './blockStyles';

/** Full-width image proof with an optional label and caption (former `normal_image`). */
export default function ImageBlock({ block }: { block: ImageBlockView }) {
  return (
    <figure>
      <div className="overflow-hidden bg-black">
        <ProjectResponsiveImage
          src={block.src}
          profile="detail"
          alt={block.alt}
          className="aspect-[16/9] w-full object-cover"
          loading="lazy"
        />
      </div>
      {block.label || block.caption ? (
        <figcaption className="grid gap-3 border-b border-line py-5 md:grid-cols-[0.28fr_1fr]">
          <p className={blockMetaClassName}>{block.label || 'Project media'}</p>
          <p className="text-copy text-body">{block.caption}</p>
        </figcaption>
      ) : null}
    </figure>
  );
}
