import { Fragment } from 'react';
import type { ContentBlockView } from '../../features/blocks/view';
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

function renderBlock(block: ContentBlockView, focusHotspotId: string | null) {
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
      return <ImageBlock block={block} />;
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

/** Ordered content blocks with the shared vertical rhythm. Used by Project pages and preview. */
export default function BlockList({ blocks, focusHotspotId = null }: BlockListProps) {
  const focusBlockId = focusHotspotId
    ? blocks.find(
        (block) => block.type === 'hotspot_image' && block.hotspots.some((hotspot) => hotspot.id === focusHotspotId),
      )?.id ?? null
    : null;

  return (
    <div className="space-y-12">
      {blocks.map((block) => (
        <Fragment key={block.id}>{renderBlock(block, block.id === focusBlockId ? focusHotspotId : null)}</Fragment>
      ))}
    </div>
  );
}
