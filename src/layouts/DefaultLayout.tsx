import type { ReactNode } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Props {
  children: ReactNode;
  bgImage?: string;
  showBanner?: boolean;
}

function LayoutBanner({ bgImage }: { bgImage?: string }) {
  if (!bgImage) {
    return <div className="h-[102px] bg-black" aria-hidden="true" />;
  }

  return (
    <div className="relative h-[240px] overflow-hidden bg-black md:h-[280px]" aria-hidden="true">
      <img src={bgImage} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,255,25,0.18),transparent_35%)]" />
    </div>
  );
}

export default function DefaultLayout({ children, bgImage, showBanner = true }: Props) {
  return (
    <div className="min-h-screen bg-white text-[var(--urblo-text)]">
      <Header />
      {showBanner ? <LayoutBanner bgImage={bgImage} /> : null}
      <main className="min-h-[40vh]">{children}</main>
      <Footer />
    </div>
  );
}
