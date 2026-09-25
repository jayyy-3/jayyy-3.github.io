import type { ReactNode } from 'react';
import HomepageFooter from '../components/homepage/HomepageFooter';
import HomepageHeader from '../components/homepage/HomepageHeader';

export default function HomepageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="homepage-shell min-h-screen bg-white text-[var(--urblo-text)]">
      <HomepageHeader />
      {/* Reserve the hero's first viewport so the footer never paints in view before the page chunk loads. */}
      <main className="min-h-[100svh]">{children}</main>
      <HomepageFooter />
    </div>
  );
}
