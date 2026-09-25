import type { ReactNode } from 'react';
import { copyToneClassName, cx, type Surface } from './styles';

type CardProps = {
  /** bordered: 1px hairline frame, 4px radius · borderless: Projects card, top hairline only. No resting shadow. */
  variant?: 'bordered' | 'borderless';
  surface?: Surface;
  as?: 'div' | 'article' | 'li';
  /** Image (or placeholder) shown in a fixed 4:3 frame. */
  media?: ReactNode;
  meta?: ReactNode;
  title?: ReactNode;
  titleAs?: 'h2' | 'h3';
  titleSize?: 'sm' | 'lg';
  footer?: ReactNode;
  className?: string;
  /** Padding/layout for the content area; defaults suit each variant. */
  bodyClassName?: string;
  children?: ReactNode;
};

export default function Card({
  variant = 'bordered',
  surface = 'light',
  as: Tag = 'div',
  media,
  meta,
  title,
  titleAs: Title = 'h3',
  titleSize = 'sm',
  footer,
  className,
  bodyClassName,
  children,
}: CardProps) {
  const dark = surface === 'dark';
  const structured = Boolean(media || meta || title || footer);

  const frame =
    variant === 'bordered'
      ? cx('overflow-hidden rounded border', dark ? 'border-line-inverse bg-white/[0.04]' : 'border-line bg-white')
      : cx('border-t pt-5', dark ? 'border-line-inverse' : 'border-line');

  if (!structured) {
    return (
      <Tag data-card={variant} className={cx(frame, className)}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag data-card={variant} className={cx('group', frame, className)}>
      {media ? <div className={cx('aspect-[4/3] overflow-hidden', dark ? 'bg-white/5' : 'bg-ink')}>{media}</div> : null}
      <div className={bodyClassName ?? (variant === 'bordered' ? 'p-5' : 'py-5')}>
        {meta ? (
          <p
            className={cx(
              'text-meta font-semibold uppercase tracking-caps',
              dark ? 'text-inverse-muted' : 'text-muted',
            )}
          >
            {meta}
          </p>
        ) : null}
        {title ? (
          <Title
            className={cx(
              meta ? 'mt-4' : undefined,
              titleSize === 'lg' ? 'text-title' : 'text-title-sm',
              'font-semibold leading-tight',
              dark ? 'text-inverse' : 'text-ink',
            )}
          >
            {title}
          </Title>
        ) : null}
        {children ? <div className={cx('mt-4 text-small', copyToneClassName(surface))}>{children}</div> : null}
        {footer ? <div className="mt-5">{footer}</div> : null}
      </div>
    </Tag>
  );
}
