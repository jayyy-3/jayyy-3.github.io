import type { ImgHTMLAttributes, SyntheticEvent } from 'react';
import { getStaticImageDelivery } from '../lib/staticImageDelivery';

interface StaticResponsiveImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src?: string;
  /** Rendered box width, as an <img sizes> value. Defaults to the full viewport. */
  sizes?: string;
}

/**
 * <img> for static `public/` imagery. When the source has generated WebP variants it adds
 * srcset/sizes and intrinsic width/height (so the box ratio is known before load); otherwise it
 * renders the source unchanged. A failed variant falls back once to the original file.
 */
export default function StaticResponsiveImage({
  src,
  sizes,
  onError,
  decoding = 'async',
  width,
  height,
  ...imageProps
}: StaticResponsiveImageProps) {
  const delivery = getStaticImageDelivery(src ?? '', sizes);

  function handleError(event: SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    if (delivery.optimized && image.dataset.originalFallbackApplied !== 'true') {
      image.dataset.originalFallbackApplied = 'true';
      image.srcset = '';
      image.sizes = '';
      if (src) image.src = src;
      return;
    }
    onError?.(event);
  }

  return (
    <img
      {...imageProps}
      src={delivery.src || undefined}
      srcSet={delivery.srcSet}
      sizes={delivery.sizes}
      width={width ?? delivery.width}
      height={height ?? delivery.height}
      decoding={decoding}
      onError={handleError}
    />
  );
}
