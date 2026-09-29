import type { ReactNode } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { SiteHeaderSurface } from '../components/site/SiteHeader';

interface Props {
  children: ReactNode;
  /**
   * Render the light 102px clearance under the absolute header. Pages that open with their own
   * image hero (Capabilities) pass false. The former text-less decorative image banner is retired
   * (DESIGN.md "Page openings"): every white-start page opens with its PageIntro instead.
   */
  showBanner?: boolean;
  headerSurface?: SiteHeaderSurface;
}

export default function DefaultLayout({
  children,
  showBanner = true,
  headerSurface,
}: Props) {
  const resolvedHeaderSurface = headerSurface ?? 'light-page';

  return (
    <div className="min-h-screen bg-white text-[var(--urblo-text)]">
      <Header surface={resolvedHeaderSurface} />
      {showBanner ? <div className="h-[102px] bg-white" aria-hidden="true" /> : null}
      {/* Keep the footer below the first viewport while lazy page code and data load,
          so it is never painted in view and then pushed down (CLS). */}
      <main className="min-h-[100svh]">{children}</main>
      <Footer />
    </div>
  );
}
