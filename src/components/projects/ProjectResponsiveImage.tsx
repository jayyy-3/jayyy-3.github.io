import type { ImgHTMLAttributes, SyntheticEvent } from 'react';
import {
  getProjectImageDelivery,
  type ProjectImageProfile,
} from '../../lib/projectImageDelivery';

interface ProjectResponsiveImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> {
  src: string;
  profile: ProjectImageProfile;
}

export default function ProjectResponsiveImage({
  src,
  profile,
  onError,
  decoding = 'async',
  ...imageProps
}: ProjectResponsiveImageProps) {
  const delivery = getProjectImageDelivery(src, profile);

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
      sizes={delivery.sizes}
      decoding={decoding}
      data-project-image-profile={profile}
      data-original-src={delivery.optimized ? src : undefined}
      onError={handleError}
    />
  );
}
