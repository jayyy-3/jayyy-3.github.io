import type { VideoBlockView } from '../../features/blocks/view';
import { cardTitleClassName } from '../ui/styles';
import { blockMetaClassName } from './blockStyles';

/** Privacy-friendly YouTube embed with its title and caption outside the frame. */
export default function VideoBlock({ block }: { block: VideoBlockView }) {
  return (
    <figure>
      <div className="aspect-video overflow-hidden bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${block.youtubeId}`}
          title={block.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <figcaption className="grid gap-3 border-b border-line py-5 md:grid-cols-[0.28fr_1fr]">
        <p className={blockMetaClassName}>Video</p>
        <div>
          <h3 className={cardTitleClassName()}>{block.title}</h3>
          {block.caption ? <p className="mt-2 text-copy text-body">{block.caption}</p> : null}
        </div>
      </figcaption>
    </figure>
  );
}
