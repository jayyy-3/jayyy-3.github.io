import type { ReactNode } from 'react';
import {
  copyToneClassName,
  cx,
  eyebrowClassName,
  headingClassName,
  type HeadingLevel,
  type Surface,
} from './styles';

type SectionHeadingProps = {
  /** display: editorial Avenir light 34/44/64 · section: Avenir semibold 34/44 (Projects pattern). */
  level?: HeadingLevel;
  as?: 'h2' | 'h3';
  eyebrow?: ReactNode;
  title: ReactNode;
  copy?: ReactNode;
  surface?: Surface;
  id?: string;
  /** Layout only (width, margin); type comes from `level`. */
  className?: string;
  /** Layout only for the heading element itself (max width, top margin). */
  titleClassName?: string;
};

export default function SectionHeading({
  level = 'section',
  as: Tag = 'h2',
  eyebrow,
  title,
  copy,
  surface = 'light',
  id,
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <div className={className}>
      {eyebrow ? <p className={eyebrowClassName(surface)}>{eyebrow}</p> : null}
      <Tag
        id={id}
        data-heading-level={level}
        className={cx(headingClassName(level, surface), eyebrow ? 'mt-4' : undefined, titleClassName)}
      >
        {title}
      </Tag>
      {copy ? <p className={cx('mt-6 text-lead', copyToneClassName(surface))}>{copy}</p> : null}
    </div>
  );
}
