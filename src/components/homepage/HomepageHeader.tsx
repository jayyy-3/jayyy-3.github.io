import { useState } from 'react';
import { Link } from 'react-router-dom';
import { homepageData, homepageNavLinks, type HomepageNavLink } from '../../data/homepage';

function NavItem({ item, onClick }: { item: HomepageNavLink; onClick?: () => void }) {
  const className =
    'transition-colors duration-200 hover:text-[var(--urblo-lime)]';

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

export default function HomepageHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/20 bg-black/88 text-white backdrop-blur-sm">
      <div className="mx-auto flex h-[102px] max-w-[1440px] items-center justify-between px-6 md:px-10 lg:px-[94px]">
        <Link to="/" aria-label="Urblo home">
          <img
            src={homepageData.logoUrl}
            alt="Urblo logo"
            className="h-10 w-auto md:h-[45px]"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-[18px] font-light tracking-[0.02em] lg:flex">
          {homepageNavLinks.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex h-12 w-12 items-center justify-center lg:hidden"
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

      {menuOpen ? (
        <div className="border-t border-white/10 bg-black/96 px-6 py-6 lg:hidden">
          <nav className="flex flex-col gap-4 text-lg font-light">
            {homepageNavLinks.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                onClick={() => setMenuOpen(false)}
              />
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
