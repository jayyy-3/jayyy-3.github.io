import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { siteLogoUrl, siteNavLinks, type SiteNavLink } from '../../data/siteChrome';

export type SiteHeaderSurface = 'overlay' | 'light-page';

const headerSurfaceClasses: Record<SiteHeaderSurface, string> = {
  overlay: 'bg-black/50 backdrop-blur-xl backdrop-saturate-125',
  'light-page': 'bg-black/70 backdrop-blur-xl backdrop-saturate-125',
};

const menuSurfaceClasses: Record<SiteHeaderSurface, string> = {
  overlay: 'bg-black/70 backdrop-blur-2xl backdrop-saturate-125',
  'light-page': 'bg-black/75 backdrop-blur-2xl backdrop-saturate-125',
};

function navItemActive(pathname: string, item: SiteNavLink) {
  if (!item.to) {
    return false;
  }

  if (pathname === item.to) {
    return true;
  }

  return pathname.startsWith(`${item.to}/`);
}

function NavItem({
  item,
  active,
  onClick,
}: {
  item: SiteNavLink;
  active: boolean;
  onClick?: () => void;
}) {
  const className = [
    'transition-colors duration-200',
    active ? 'text-[var(--urblo-lime)]' : 'text-white hover:text-[var(--urblo-lime)]',
  ].join(' ');

  if (item.external && item.href) {
    return (
      <a href={item.href} className={className} onClick={onClick}>
        {item.label}
      </a>
    );
  }

  if (item.to) {
    return (
      <Link to={item.to} className={className} onClick={onClick}>
        {item.label}
      </Link>
    );
  }

  return null;
}

export default function SiteHeader({ surface = 'light-page' }: { surface?: SiteHeaderSurface }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const desktopMenuLabels = new Set(['Articles', 'Products']);
  const desktopNavLinks = siteNavLinks.filter((item) => !desktopMenuLabels.has(item.label));
  const desktopMenuLinks = siteNavLinks.filter((item) => desktopMenuLabels.has(item.label));

  const activeLookup = useMemo(() => {
    return new Map(siteNavLinks.map((item) => [item.label, navItemActive(location.pathname, item)]));
  }, [location.pathname]);
  const desktopMenuActive = desktopMenuLinks.some((item) => activeLookup.get(item.label));

  return (
    <header
      data-header-surface={surface}
      className={`absolute inset-x-0 top-0 z-50 border-b border-white/20 text-white transition-[background-color,border-color,backdrop-filter] duration-300 ${headerSurfaceClasses[surface]}`}
    >
      <div className="urblo-edge-container flex h-[102px] items-center justify-between">
        <Link to="/" aria-label="Urblo home">
          <img src={siteLogoUrl} alt="Urblo logo" className="h-10 w-auto md:h-[45px]" />
        </Link>

        <div className="flex items-center justify-end gap-4 lg:gap-6">
          <nav className="hidden items-center gap-8 text-[18px] font-light tracking-[0.02em] lg:flex">
            {desktopNavLinks.map((item) => (
              <NavItem key={item.label} item={item} active={activeLookup.get(item.label) ?? false} />
            ))}
          </nav>

          <button
            type="button"
            className={`inline-flex h-12 w-12 items-center justify-center transition-colors hover:text-[var(--urblo-lime)] ${
              desktopMenuActive ? 'text-[var(--urblo-lime)]' : 'text-white'
            }`}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-7 w-7"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <>
                  <path d="M3 7h18" />
                  <path d="M3 12h18" />
                  <path d="M3 17h18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          data-header-menu-surface={surface}
          className={`border-t border-white/15 px-6 py-6 shadow-[0_24px_60px_rgba(0,0,0,0.24)] lg:absolute lg:right-[clamp(20px,3.2vw,64px)] lg:top-[102px] lg:w-[260px] lg:border lg:border-white/15 lg:px-6 lg:py-5 ${menuSurfaceClasses[surface]}`}
        >
          <nav className="flex flex-col gap-4 text-lg font-light tracking-[0.02em] lg:hidden">
            {siteNavLinks.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                active={activeLookup.get(item.label) ?? false}
                onClick={() => setMenuOpen(false)}
              />
            ))}
          </nav>
          <nav className="hidden flex-col gap-4 text-[18px] font-light tracking-[0.02em] lg:flex">
            {desktopMenuLinks.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                active={activeLookup.get(item.label) ?? false}
                onClick={() => setMenuOpen(false)}
              />
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
