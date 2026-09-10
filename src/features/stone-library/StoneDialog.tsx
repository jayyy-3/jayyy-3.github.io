import { useEffect, useRef, type ReactNode } from 'react';
export default function StoneDialog({
  label,
  onClose,
  locked = false,
  children,
  className = '',
}: {
  label: string;
  onClose: () => void;
  locked?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const lockedRef = useRef(locked);
  useEffect(() => {
    closeRef.current = onClose;
    lockedRef.current = locked;
  }, [onClose, locked]);
  useEffect(() => {
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const container = ref.current;
    const focusables = () =>
      Array.from(
        container?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
        ) || [],
      ).filter((el) => el.getClientRects().length > 0);
    (focusables()[0] || container)?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !lockedRef.current) {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
      }
      if (event.key === 'Tab') {
        const items = focusables();
        const first = items[0];
        const last = items[items.length - 1];
        if (!first) {
          event.preventDefault();
          container?.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === container)
        ) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    container?.addEventListener('keydown', keydown);
    return () => {
      container?.removeEventListener('keydown', keydown);
      previous?.focus();
    };
  }, []);
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className={className}
    >
      {children}
    </div>
  );
}
