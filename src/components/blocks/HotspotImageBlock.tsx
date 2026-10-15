import type { HotspotImageBlockView } from '../../features/blocks/view';
import ProjectHotspotImage from '../projects/ProjectHotspotImage';

/** Full-width image with quiet material points (docs/DESIGN.md Project material map pattern). */
export default function HotspotImageBlock({
  block,
  focusHotspotId,
}: {
  block: HotspotImageBlockView;
  focusHotspotId: string | null;
}) {
  return (
    <div className="border-b border-line pb-8">
      <ProjectHotspotImage
        image={block.image}
        imageAlt={block.imageAlt}
        title={block.title}
        intro={block.intro}
        caption={block.caption}
        hotspots={block.hotspots}
        anchorId={`project-media-${block.id}`}
        focusHotspotId={focusHotspotId}
      />
    </div>
  );
}
