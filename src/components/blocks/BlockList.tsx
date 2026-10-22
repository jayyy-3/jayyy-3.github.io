import { Fragment, useCallback, useMemo, useState, type CSSProperties } from 'react';
import { groupBodyBlocks, imageRatio } from '../../features/blocks/imageLayout';
import type { BlockImageSize, ContentBlockView, ImageBlockView } from '../../features/blocks/view';
import CalloutBlock from './CalloutBlock';
import ComparisonTableBlock from './ComparisonTableBlock';
import CtaBlock from './CtaBlock';
import GalleryBlock from './GalleryBlock';
import HeadingBlock from './HeadingBlock';
import HotspotImageBlock from './HotspotImageBlock';
import ImageBlock from './ImageBlock';
import QuoteBlock from './QuoteBlock';
import SpecTableBlock from './SpecTableBlock';
import StatsBlock from './StatsBlock';
import StepsBlock from './StepsBlock';
import StoneCardsBlock from './StoneCardsBlock';
import TextBlock from './TextBlock';
import VideoBlock from './VideoBlock';

interface BlockListProps {
  blocks: readonly ContentBlockView[];
  /** Hotspot to pin once on mount (public `?point=` deep link). */
  focusHotspotId?: string | null;
}

function renderBlock(
  block: ContentBlockView,
  focusHotspotId: string | null,
  onMeasure: (id: string, size: BlockImageSize) => void,
) {
  switch (block.type) {
    case 'heading':
      return <HeadingBlock block={block} />;
    case 'text':
      return <TextBlock block={block} />;
    case 'quote':
      return <QuoteBlock block={block} />;
    case 'callout':
      return <CalloutBlock block={block} />;
    case 'stats':
      return <StatsBlock block={block} />;
    case 'steps':
      return <StepsBlock block={block} />;
    case 'spec_table':
      return <SpecTableBlock block={block} />;
    case 'comparison_table':
      return <ComparisonTableBlock block={block} />;
    case 'stone_cards':
      return <StoneCardsBlock block={block} />;
    case 'image':
      return <ImageBlock block={block} onMeasure={(size) => onMeasure(block.id, size)} />;
    case 'gallery':
      return <GalleryBlock block={block} />;
    case 'hotspot_image':
      return <HotspotImageBlock block={block} focusHotspotId={focusHotspotId} />;
    case 'video':
      return <VideoBlock block={block} />;
    case 'cta':
      return <CtaBlock block={block} />;
  }
}

/** Two square/portrait photos side by side (from md) at equal height, each with its own caption. */
function ImagePair({ blocks }: { blocks: [ImageBlockView, ImageBlockView] }) {
  const pairRatio = blocks.reduce((sum, block) => sum + (imageRatio(block) ?? 1), 0);
  return (
    <div
      className="grid gap-12 md:mx-auto md:flex md:max-w-[calc(80svh*var(--pair-ratio)+1.5rem)] md:items-start md:gap-6"
      style={{ '--pair-ratio': pairRatio.toFixed(4) } as CSSProperties}
      data-image-pair=""
    >
      <ImageBlock block={blocks[0]} layout="pair" />
      <ImageBlock block={blocks[1]} layout="pair" />
    </div>
  );
}

/** Ordered content blocks with the shared vertical rhythm. Used by Project pages and preview. */
export default function BlockList({ blocks, focusHotspotId = null }: BlockListProps) {
  // Sizes measured in the browser for older images without recorded dimensions, so they can
  // still take their portrait layout and pair (docs/DESIGN.md "Content blocks").
  const [measured, setMeasured] = useState<Record<string, BlockImageSize>>({});
  const handleMeasure = useCallback((id: string, size: BlockImageSize) => {
    setMeasured((current) => (current[id] ? current : { ...current, [id]: size }));
  }, []);
  const groups = useMemo(
    () => groupBodyBlocks(
      blocks.map((block) => (block.type === 'image' && !(block.width && block.height) && measured[block.id]
        ? { ...block, ...measured[block.id] }
        : block)),
    ),
    [blocks, measured],
  );

  const focusBlockId = focusHotspotId
    ? blocks.find(
        (block) => block.type === 'hotspot_image' && block.hotspots.some((hotspot) => hotspot.id === focusHotspotId),
      )?.id ?? null
    : null;

  return (
    <div className="space-y-12">
      {groups.map((group) => (group.kind === 'image_pair'
        ? <ImagePair key={group.id} blocks={group.blocks} />
        : (
          <Fragment key={group.block.id}>
            {renderBlock(group.block, group.block.id === focusBlockId ? focusHotspotId : null, handleMeasure)}
          </Fragment>
        )))}
    </div>
  );
}
