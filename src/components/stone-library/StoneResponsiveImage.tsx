import type { ImgHTMLAttributes, SyntheticEvent } from 'react';
import { getStoneImageDelivery, type StoneImageProfile } from '../../lib/stoneImageDelivery';

interface StoneResponsiveImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string;
  profile: StoneImageProfile;
}

/**
 * Stone media <img> that requests a render variant sized to its box. If the
 * render endpoint fails, it falls back once to the untouched source so the
 * material never disappears.
 */
export default function StoneResponsiveImage({
  src,
  profile,
  sizes,
  onError,
  decoding = 'async',
  ...imageProps
}: StoneResponsiveImageProps) {
  const delivery = getStoneImageDelivery(src, profile);

  function handleError(event: SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    if (delivery.optimized && image.dataset.originalFallbackApplied !== 'true') {
      image.dataset.originalFallbackApplied = 'true';
      image.srcset = '';
      image.sizes = '';
      image.src = src;
      return;
    }
    onError?.(event);
  }

  return (
    <img
      {...imageProps}
      src={delivery.src}
      srcSet={delivery.srcSet}
      sizes={delivery.optimized ? sizes || delivery.sizes : undefined}
      decoding={decoding}
      data-stone-image-profile={profile}
      onError={handleError}
    />
  );
}
