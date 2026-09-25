// Class builders for the shared public UI components. Tokens live in tailwind.config.js and
// src/index.css; docs/DESIGN.md "Visual System → Tokens" is the reference table.

export type Surface = 'light' | 'dark';
export type ButtonVariant = 'primary' | 'inverse' | 'ghost' | 'link';
export type ButtonSize = 'md' | 'sm';
export type HeadingLevel = 'display' | 'section';

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const buttonVariantClasses: Record<ButtonVariant, string> = {
  // Black fill; white fill on dark surfaces.
  primary: 'urblo-button-inverse',
  // Lime fill: the decisive action on a dark surface.
  inverse: 'urblo-button-signal',
  // Quiet hairline outline that warms to lime on hover.
  ghost: 'urblo-button-ghost',
  // Uppercase underlined text link.
  link: 'urblo-button-link',
};

export function buttonClassName({
  variant = 'primary',
  surface = 'light',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  surface?: Surface;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cx(
    buttonVariantClasses[variant],
    surface === 'dark' && 'urblo-button--on-dark',
    size === 'sm' && variant !== 'link' && 'urblo-button--sm',
    'disabled:cursor-not-allowed disabled:opacity-60',
    className,
  );
}

const headingLevelClasses: Record<HeadingLevel, string> = {
  // Editorial display: Avenir light, 34 → 44 → 64.
  display: 'font-sans font-light text-title md:text-title-lg lg:text-display',
  // Section heading (Projects pattern): Avenir semibold, sentence case, 34 → 44.
  section: 'font-sans font-semibold text-title md:text-title-lg',
};

export function headingClassName(level: HeadingLevel = 'section', surface: Surface = 'light') {
  return cx(headingLevelClasses[level], 'tracking-normal', surface === 'dark' ? 'text-inverse' : 'text-ink');
}

export function eyebrowClassName(surface: Surface = 'light') {
  return cx('urblo-eyebrow', surface === 'dark' && 'text-inverse-muted');
}

export function copyToneClassName(surface: Surface = 'light') {
  return surface === 'dark' ? 'text-inverse-body' : 'text-body';
}
