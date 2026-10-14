import {
  AlignLeft,
  ChartColumn,
  Columns3,
  Heading,
  Image,
  Images,
  Info,
  Layers,
  ListOrdered,
  MapPin,
  MousePointerClick,
  Quote,
  Table,
  Video,
  type LucideIcon,
} from 'lucide-react';
import type { ContentBlockType } from '../../../features/blocks/schema';

const icons: Record<ContentBlockType, LucideIcon> = {
  heading: Heading,
  text: AlignLeft,
  quote: Quote,
  callout: Info,
  stats: ChartColumn,
  steps: ListOrdered,
  spec_table: Table,
  comparison_table: Columns3,
  stone_cards: Layers,
  image: Image,
  gallery: Images,
  hotspot_image: MapPin,
  video: Video,
  cta: MousePointerClick,
};

export default function BlockTypeIcon({ type, className }: { type: ContentBlockType; className?: string }) {
  const Icon = icons[type];
  return <Icon className={className} aria-hidden="true" />;
}
