// Resolved, public-safe block view models shared by the public renderers and admin preview.
// Media IDs are already resolved to URLs and links already checked; renderers only lay out.

export interface BlockHotspot {
    id: string;
    x: number;
    y: number;
    title?: string;
    description?: string;
    stoneGroupId: string;
    stoneVariantId?: string;
    finishKey: string;
    application: string;
    note: string;
    image?: string;
    imageAlt?: string;
}

export interface BlockImageView {
    src: string;
    alt: string;
}

export interface BlockLinkView {
    label: string;
    href: string;
}

export interface HeadingBlockView {
    id: string;
    type: 'heading';
    eyebrow?: string;
    title: string;
    intro?: string;
}

export interface TextBlockView {
    id: string;
    type: 'text';
    body: string;
}

export interface QuoteBlockView {
    id: string;
    type: 'quote';
    quote: string;
    attribution?: string;
    role?: string;
}

export interface CalloutBlockView {
    id: string;
    type: 'callout';
    title?: string;
    body: string;
    tone: 'neutral' | 'lime';
}

export interface StatsBlockView {
    id: string;
    type: 'stats';
    items: Array<{ value: string; unit?: string; label: string }>;
    caption?: string;
}

export interface StepsBlockView {
    id: string;
    type: 'steps';
    intro?: string;
    items: Array<{ title: string; body: string; image?: BlockImageView }>;
}

export interface SpecTableBlockView {
    id: string;
    type: 'spec_table';
    title?: string;
    rows: Array<{ label: string; value: string }>;
}

export interface ComparisonTableBlockView {
    id: string;
    type: 'comparison_table';
    title?: string;
    columns: string[];
    rows: Array<{ label: string; cells: string[] }>;
}

export interface StoneCardView {
    /** Stone Library key; null when the referenced stone is not (or no longer) public. */
    stoneGroupId: string | null;
    finishKey?: string;
    note?: string;
}

export interface StoneCardsBlockView {
    id: string;
    type: 'stone_cards';
    title?: string;
    items: StoneCardView[];
}

export interface ImageBlockView {
    id: string;
    type: 'image';
    src: string;
    alt: string;
    title?: string;
    label?: string;
    caption?: string;
}

export interface GalleryBlockView {
    id: string;
    type: 'gallery';
    items: Array<{ src: string; alt: string; caption?: string }>;
}

export interface HotspotImageBlockView {
    id: string;
    type: 'hotspot_image';
    image: string;
    imageAlt: string;
    title: string;
    intro?: string;
    caption?: string;
    hotspots: BlockHotspot[];
}

export interface VideoBlockView {
    id: string;
    type: 'video';
    youtubeId: string;
    title: string;
    caption?: string;
}

export interface CtaBlockView {
    id: string;
    type: 'cta';
    title: string;
    body?: string;
    primary?: BlockLinkView;
    secondary?: BlockLinkView;
}

export type ContentBlockView =
    | HeadingBlockView
    | TextBlockView
    | QuoteBlockView
    | CalloutBlockView
    | StatsBlockView
    | StepsBlockView
    | SpecTableBlockView
    | ComparisonTableBlockView
    | StoneCardsBlockView
    | ImageBlockView
    | GalleryBlockView
    | HotspotImageBlockView
    | VideoBlockView
    | CtaBlockView;

/** Full-width image URLs a body shows in order (plain and point images), for `ProjectData.images`. */
export function blockViewImageUrls(blocks: readonly ContentBlockView[]): string[] {
    return blocks.flatMap((block) => {
        if (block.type === 'image') return [block.src];
        if (block.type === 'hotspot_image') return [block.image];
        return [];
    });
}
