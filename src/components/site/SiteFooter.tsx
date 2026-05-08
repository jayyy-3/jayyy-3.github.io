import { Link } from 'react-router-dom';
import {
  siteBrandStatement,
  siteFooterContact,
  siteFooterLinks,
  siteSocialLinks,
} from '../../data/siteChrome';

export default function SiteFooter() {
  return (
    <footer className="bg-black px-6 py-16 text-white md:px-10 lg:px-[95px]">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1.4fr_0.8fr_0.7fr]">
        <div className="space-y-6">
          <h2 className="max-w-[34rem] text-[26px] font-semibold uppercase leading-[1.55] tracking-[0.06em] md:text-[28px]">
            {siteBrandStatement.slice(0, -1)}
            <span className="text-[var(--urblo-lime)]">.</span>
          </h2>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-[17px] text-white/70">
            {siteSocialLinks.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="transition-colors hover:text-[var(--urblo-lime)]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.label}
                </a>
              ) : (
                <span key={item.label}>{item.label}</span>
              ),
            )}
          </div>
        </div>

        <div className="space-y-4 text-[18px] leading-[1.9] text-white/85">
          <p>{siteFooterContact.address[0]}</p>
          <p>{siteFooterContact.address[1]}</p>
          <p>
            <a
              href={`mailto:${siteFooterContact.email}`}
              className="underline decoration-white/40 underline-offset-4"
            >
              {siteFooterContact.email}
            </a>
          </p>
          <p className="font-semibold text-white">{siteFooterContact.phone}</p>
        </div>

        <div className="space-y-4 text-[18px] leading-[1.9] text-white/85">
          {siteFooterLinks.map((item) => {
            const className = 'block transition-colors hover:text-[var(--urblo-lime)]';

            if (item.to) {
              return (
                <Link key={item.label} to={item.to} className={className}>
                  {item.label}
                </Link>
              );
            }

            return (
              <a key={item.label} href={item.href} className={className}>
                {item.label}
              </a>
            );
          })}
          <div className="pt-2 text-[16px] text-white/55">
            <p>All rights reserved</p>
            <p>{siteFooterContact.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
