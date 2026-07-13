import { Link } from 'react-router-dom';
import {
  siteBrandStatement,
  siteFooterContact,
  siteFooterLinks,
  type SiteSocialLink,
} from '../../data/siteChrome';
import {
  usePublicSiteSettings,
  type PublicFooterColumn,
  type PublicFooterItem,
} from '../../lib/publicSiteSettings';

export default function SiteFooter() {
  const settings = usePublicSiteSettings();

  if (settings.footerColumns) {
    const contactCoverage = getFooterContactCoverage(settings.footerColumns);

    return (
      <footer className="bg-black px-6 py-16 text-white md:px-10 lg:px-[95px]">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.6fr)]">
          <div className="space-y-6">
            <BrandStatement />
            <SocialLinks links={settings.socialLinks} />
            <PrimaryContact
              email={contactCoverage.hasEmail ? null : settings.primaryEmail}
              phone={contactCoverage.hasPhone ? null : settings.primaryPhone}
            />
          </div>

          <div>
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {settings.footerColumns.map((column, index) => (
                <CmsFooterColumn
                  key={`${column.title}-${index}`}
                  column={column}
                  primaryEmail={settings.primaryEmail}
                  primaryPhone={settings.primaryPhone}
                />
              ))}
            </div>
            <Copyright />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-black px-6 py-16 text-white md:px-10 lg:px-[95px]">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1.4fr_0.8fr_0.7fr]">
        <div className="space-y-6">
          <BrandStatement />
          <SocialLinks links={settings.socialLinks} />
        </div>

        <div className="space-y-4 text-[18px] leading-[1.9] text-white/85">
          <p>{siteFooterContact.address[0]}</p>
          <p>{siteFooterContact.address[1]}</p>
          <PrimaryContact email={settings.primaryEmail} phone={settings.primaryPhone} />
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
          <Copyright compact />
        </div>
      </div>
    </footer>
  );
}

function BrandStatement() {
  return (
    <h2 className="max-w-[34rem] text-[26px] font-semibold uppercase leading-[1.55] tracking-[0.06em] md:text-[28px]">
      {siteBrandStatement.slice(0, -1)}
      <span className="text-[var(--urblo-lime)]">.</span>
    </h2>
  );
}

function SocialLinks({ links }: { links: SiteSocialLink[] }) {
  if (!links.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-x-8 gap-y-3 text-[17px] text-white/70">
      {links.map((item) =>
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
  );
}

function PrimaryContact({ email, phone }: { email: string | null; phone: string | null }) {
  if (!email && !phone) {
    return null;
  }

  return (
    <div className="space-y-4 text-[18px] leading-[1.9] text-white/85">
      {email ? (
        <p>
          <a href={`mailto:${email}`} className="underline decoration-white/40 underline-offset-4">
            {email}
          </a>
        </p>
      ) : null}
      {phone ? <p className="font-semibold text-white">{phone}</p> : null}
    </div>
  );
}

function CmsFooterColumn({
  column,
  primaryEmail,
  primaryPhone,
}: {
  column: PublicFooterColumn;
  primaryEmail: string | null;
  primaryPhone: string | null;
}) {
  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">{column.title}</h3>
      <div className="mt-4 space-y-4 text-[17px] leading-[1.65] text-white/82">
        {column.items.map((item, index) => (
          <CmsFooterItem
            key={`${item.label}-${index}`}
            item={item}
            primaryEmail={primaryEmail}
            primaryPhone={primaryPhone}
          />
        ))}
      </div>
    </section>
  );
}

function CmsFooterItem({
  item,
  primaryEmail,
  primaryPhone,
}: {
  item: PublicFooterItem;
  primaryEmail: string | null;
  primaryPhone: string | null;
}) {
  const className = 'block transition-colors hover:text-[var(--urblo-lime)]';

  if (item.kind === 'internal') {
    return (
      <Link to={item.to} className={className}>
        {item.label}
      </Link>
    );
  }

  if (item.kind === 'external') {
    return (
      <a href={item.href} className={className} target="_blank" rel="noopener noreferrer">
        {item.label}
      </a>
    );
  }

  const normalizedLabel = item.label.trim().toLowerCase();
  const value =
    normalizedLabel === 'email'
      ? primaryEmail || item.value
      : normalizedLabel === 'phone'
        ? primaryPhone || item.value
        : item.value;

  return (
    <p>
      <span className="block text-[11px] font-bold uppercase tracking-[0.13em] text-white/42">
        {item.label}
      </span>
      <span className="mt-1 block">{value}</span>
    </p>
  );
}

function getFooterContactCoverage(columns: PublicFooterColumn[]) {
  let hasEmail = false;
  let hasPhone = false;

  for (const column of columns) {
    for (const item of column.items) {
      if (item.kind !== 'text') {
        continue;
      }

      const normalizedLabel = item.label.trim().toLowerCase();
      hasEmail ||= normalizedLabel === 'email';
      hasPhone ||= normalizedLabel === 'phone';
    }
  }

  return { hasEmail, hasPhone };
}

function Copyright({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'pt-2 text-[16px] text-white/55' : 'mt-10 text-[15px] text-white/48'}>
      <p>All rights reserved</p>
      <p>{siteFooterContact.copyright}</p>
    </div>
  );
}
