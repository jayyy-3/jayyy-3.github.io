import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { buttonClassName, type ButtonSize, type ButtonVariant, type Surface } from './styles';

type ButtonStyleProps = {
  /** primary: black fill · inverse: lime fill for dark surfaces · ghost: hairline outline · link: text link */
  variant?: ButtonVariant;
  /** Adapts primary, ghost and link to dark surfaces and photography. */
  surface?: Surface;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type NativeButtonProps = ButtonStyleProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { to?: never; href?: never };
type RouterLinkProps = ButtonStyleProps & Omit<LinkProps, 'className' | 'children'> & { href?: never };
type AnchorProps = ButtonStyleProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & { href: string; to?: never };

export type ButtonProps = NativeButtonProps | RouterLinkProps | AnchorProps;

/**
 * The one public button. `to` renders a router Link, `href` an anchor (in-page, download or
 * external), otherwise a native button (type="button" unless set).
 */
export default function Button(props: ButtonProps) {
  const { variant, surface, size, className, children, ...rest } = props;
  const classes = buttonClassName({ variant, surface, size, className });

  if ('to' in rest && rest.to !== undefined) {
    return (
      <Link {...(rest as Omit<LinkProps, 'className' | 'children'>)} className={classes}>
        {children}
      </Link>
    );
  }

  if ('href' in rest && rest.href !== undefined) {
    return (
      <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} className={classes}>
        {children}
      </a>
    );
  }

  const { type = 'button', ...buttonProps } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button {...buttonProps} type={type} className={classes}>
      {children}
    </button>
  );
}
