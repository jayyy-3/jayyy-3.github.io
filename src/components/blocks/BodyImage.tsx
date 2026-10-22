import { useState, type CSSProperties, type ReactNode, type SyntheticEvent } from 'react';
import { imageOrientation, imageRatio } from '../../features/blocks/imageLayout';
import type { BlockImageSize } from '../../features/blocks/view';
import ProjectResponsiveImage from '../projects/ProjectResponsiveImage';

export type BodyImageLayout = 'single' | 'pair';

interface BodyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  presentation?: 'photo' | 'drawing';
  /** `pair` is one half of two side-by-side square/portrait photos (from md). */
  layout?: BodyImageLayout;
  /** `figure` for image blocks (with a caption), `div` inside a step. */
  as?: 'figure' | 'div';
  /** Called once with the loaded size when no size was recorded. */
  onMeasure?: (size: BlockImageSize) => void;
  children?: ReactNode;
}

// Square and portrait images: the box shrinks so the picture is never taller than 80svh, never
// cropped. `--image-ratio` is width / height.
const uprightWidthClassName = 'mx-auto w-[min(100%,calc(80svh*var(--image-ratio)))]';

/**
 * One body image presented to suit its shape (docs/DESIGN.md "Content blocks", 2026-10-22):
 * landscape full width at its natural ratio; square/portrait centred in a two-thirds measure
 * (full width on mobile) and capped at 80svh; drawings on a light hairline-framed surface.
 * Older media without a recorded size render full width until the loaded image is measured.
 */
export default function BodyImage({
  src,
  alt,
  width,
  height,
  presentation = 'photo',
  layout = 'single',
  as: Element = 'figure',
  onMeasure,
  children,
}: BodyImageProps) {
  const known = width && height ? { width, height } : null;
  const [measured, setMeasured] = useState<BlockImageSize | null>(null);
  const size = known ?? measured;
  const orientation = imageOrientation(size);
  const ratio = imageRatio(size);
  const drawing = presentation === 'drawing';

  function handleLoad(event: SyntheticEvent<HTMLImageElement>) {
    if (known) return;
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!(naturalWidth > 0 && naturalHeight > 0)) return;
    const next = { width: naturalWidth, height: naturalHeight };
    setMeasured(next);
    onMeasure?.(next);
  }

  const outerClassName = layout === 'pair'
    ? 'min-w-0 md:[flex:var(--image-ratio)_1_0%]'
    : orientation === 'upright'
      ? 'mx-auto w-full md:w-2/3'
      : 'w-full';
  const sizedClassName = orientation !== 'upright'
    ? 'w-full'
    : layout === 'pair'
      ? `${uprightWidthClassName} md:w-full`
      : uprightWidthClassName;
  const style = ratio ? ({ '--image-ratio': ratio.toFixed(4) } as CSSProperties) : undefined;

  return (
    <Element
      className={outerClassName}
      style={style}
      data-image-layout={layout === 'pair' ? 'pair' : orientation === 'upright' ? 'upright' : 'landscape'}
      data-image-presentation={presentation}
    >
      <div className={sizedClassName}>
        <div className={drawing ? 'border border-line bg-surface p-4 md:p-8' : undefined}>
          <ProjectResponsiveImage
            src={src}
            profile="detail"
            alt={alt}
            width={size?.width}
            height={size?.height}
            className="block h-auto w-full"
            loading="lazy"
            onLoad={known ? undefined : handleLoad}
          />
        </div>
        {children}
      </div>
    </Element>
  );
}
