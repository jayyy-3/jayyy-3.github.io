import type { StatsBlockView } from '../../features/blocks/view';
import { cx } from '../ui/styles';

const desktopColumns: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

/** Key numbers: light display figures with a hairline under each, 2 × 2 on mobile. */
export default function StatsBlock({ block }: { block: StatsBlockView }) {
  return (
    <figure>
      <dl className={cx('grid grid-cols-2 gap-x-6 gap-y-8 md:gap-x-8', desktopColumns[block.items.length] ?? 'md:grid-cols-4')}>
        {block.items.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex min-w-0 flex-col">
            <dt className="order-2 mt-3 text-small text-body">{item.label}</dt>
            <dd className="order-1 border-b border-line pb-3 font-light text-title text-ink [overflow-wrap:anywhere] md:text-title-lg lg:text-display">
              {item.value}
              {item.unit ? <span className="ml-1 text-lead text-body">{item.unit}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
      {block.caption ? <figcaption className="mt-6 max-w-3xl text-small text-muted">{block.caption}</figcaption> : null}
    </figure>
  );
}
