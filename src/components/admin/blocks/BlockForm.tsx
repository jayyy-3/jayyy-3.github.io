import type { ContentBlock } from '../../../features/blocks/schema';
import CalloutForm from './CalloutForm';
import ComparisonTableForm from './ComparisonTableForm';
import CtaForm from './CtaForm';
import GalleryForm from './GalleryForm';
import HeadingForm from './HeadingForm';
import HotspotImageForm from './HotspotImageForm';
import ImageForm from './ImageForm';
import QuoteForm from './QuoteForm';
import SpecTableForm from './SpecTableForm';
import StatsForm from './StatsForm';
import StepsForm from './StepsForm';
import StoneCardsForm from './StoneCardsForm';
import TextForm from './TextForm';
import VideoForm from './VideoForm';

/** One form per block type; the block keeps its type, only its content changes. */
export default function BlockForm({
  block,
  instanceKey,
  onChange,
}: {
  block: ContentBlock;
  instanceKey: string;
  onChange: (content: ContentBlock['content']) => void;
}) {
  switch (block.type) {
    case 'heading':
      return <HeadingForm content={block.content} onChange={onChange} instanceKey={instanceKey} />;
    case 'text':
      return <TextForm content={block.content} onChange={onChange} instanceKey={instanceKey} />;
    case 'quote':
      return <QuoteForm content={block.content} onChange={onChange} instanceKey={instanceKey} />;
    case 'callout':
      return <CalloutForm content={block.content} onChange={onChange} instanceKey={instanceKey} />;
    case 'stats':
      return <StatsForm content={block.content} onChange={onChange} instanceKey={instanceKey} />;
    case 'steps':
      return <StepsForm content={block.content} onChange={onChange} instanceKey={instanceKey} />;
    case 'spec_table':
      return <SpecTableForm content={block.content} onChange={onChange} instanceKey={instanceKey} />;
    case 'comparison_table':
      return <ComparisonTableForm content={block.content} onChange={onChange} instanceKey={instanceKey} />;
    case 'stone_cards':
      return <StoneCardsForm content={block.content} onChange={onChange} instanceKey={instanceKey} />;
    case 'image':
      return <ImageForm content={block.content} onChange={onChange} instanceKey={instanceKey} />;
    case 'gallery':
      return <GalleryForm content={block.content} onChange={onChange} instanceKey={instanceKey} />;
    case 'hotspot_image':
      return <HotspotImageForm content={block.content} onChange={onChange} instanceKey={instanceKey} />;
    case 'video':
      return <VideoForm content={block.content} onChange={onChange} instanceKey={instanceKey} />;
    case 'cta':
      return <CtaForm content={block.content} onChange={onChange} instanceKey={instanceKey} />;
  }
}
