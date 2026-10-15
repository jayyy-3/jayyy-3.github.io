import type { CalloutBlockView } from '../../features/blocks/view';
import { cx } from '../ui/styles';

/** Highlighted note. The lime tone is a thin edge only, never a filled panel. */
export default function CalloutBlock({ block }: { block: CalloutBlockView }) {
  return (
    <aside
      className={cx(
        'max-w-4xl border border-line p-5 md:p-8',
        block.tone === 'lime' ? 'border-l-2 border-l-lime' : 'border-l-2 border-l-ink',
      )}
    >
      {block.title ? <p className="text-small font-semibold text-ink">{block.title}</p> : null}
      <p className={cx('text-copy text-body', block.title && 'mt-2')}>{block.body}</p>
    </aside>
  );
}
