import SiteHeader from './site/SiteHeader';
import type { SiteHeaderSurface } from './site/SiteHeader';

export default function Header({ surface }: { surface?: SiteHeaderSurface }) {
  return <SiteHeader surface={surface} />;
}
