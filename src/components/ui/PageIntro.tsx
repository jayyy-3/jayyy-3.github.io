import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { copyToneClassName, cx, eyebrowClassName, type Surface } from './styles';

type Crumb = { label: string; to?: string };

type PageIntroProps = {
  /** Trail ending with the current page, e.g. [{ label: 'Home', to: '/' }, { label: 'Projects' }]. */
  breadcrumb?: Crumb[];
  eyebrow?: ReactNode;
  /** Small labels or status pills above the eyebrow and title (e.g. stone type and availability). */
  meta?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  /** Buttons under the lede. */
  actions?: ReactNode;
  /** Right-hand column beside the title from lg (a count, previous/next navigation). */
  aside?: ReactNode;
  /**
   * Render the white-start page band every bannerless public page opens with: a bottom hairline
   * and the page container with the Projects archive padding. Leave false inside custom layouts.
   */
  band?: boolean;
  surface?: Surface;
  /** page: the shared page H1 (50/64 light) · hero: oversized H1 (44/64/104), over media or on a case study. */
  size?: 'page' | 'hero';
  className?: string;
  /** Layout only for the lede (e.g. a narrower max width over photography). */
  ledeClassName?: string;
  children?: ReactNode;
};

/** Page-level intro modelled on the Projects archive: breadcrumb or eyebrow, light H1, lede, actions. */
export default function PageIntro({
  breadcrumb,
  eyebrow,
  meta,
  title,
  lede,
  actions,
  aside,
  band = false,
  surface = 'light',
  size = 'page',
  className,
  ledeClassName = 'max-w-4xl',
  children,
}: PageIntroProps) {
  const dark = surface === 'dark';
  const hasLead = Boolean(breadcrumb?.length || eyebrow || meta);

  const heading = (
    <>
      {meta ? <div className="mb-6 flex flex-wrap items-center gap-3">{meta}</div> : null}
      {eyebrow ? <p className={eyebrowClassName(surface)}>{eyebrow}</p> : null}
      <h1
        className={
          size === 'hero'
            ? cx(
                'font-sans text-title-lg font-light leading-[1.02] tracking-normal md:text-display lg:text-hero',
                dark ? 'text-inverse' : 'text-ink',
                eyebrow ? 'mt-5' : 'mt-0',
              )
            : cx('urblo-page-title', dark && 'urblo-page-title--inverse', hasLead && !eyebrow && 'mt-0')
        }
      >
        {title}
      </h1>
      {lede ? (
        <p className={cx('mt-7 text-lead font-medium leading-9', ledeClassName, copyToneClassName(surface))}>{lede}</p>
      ) : null}
      {actions ? <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
      {children}
    </>
  );

  const content = (
    <>
      {breadcrumb?.length ? (
        <nav
          aria-label="Breadcrumb"
          className={cx(
            'mb-10 flex flex-wrap items-center gap-2 text-meta font-bold uppercase tracking-caps',
            dark ? 'text-inverse-muted' : 'text-muted',
          )}
        >
          {breadcrumb.map((crumb, index) => {
            const current = index === breadcrumb.length - 1;
            return (
              <Fragment key={`${crumb.label}-${index}`}>
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {crumb.to && !current ? (
                  <Link to={crumb.to} className={cx('transition', dark ? 'hover:text-inverse' : 'hover:text-ink')}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current={current ? 'page' : undefined} className={dark ? 'text-inverse' : 'text-ink'}>
                    {crumb.label}
                  </span>
                )}
              </Fragment>
            );
          })}
        </nav>
      ) : null}
      {aside ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.34fr)] lg:items-end">
          <div className="min-w-0">{heading}</div>
          <div className="min-w-0">{aside}</div>
        </div>
      ) : (
        heading
      )}
    </>
  );

  if (band) {
    return (
      <section className={cx('border-b', dark ? 'border-line-inverse bg-ink' : 'border-line bg-white', className)}>
        <div className="urblo-page-container py-12 md:py-16">{content}</div>
      </section>
    );
  }

  return <div className={className}>{content}</div>;
}
