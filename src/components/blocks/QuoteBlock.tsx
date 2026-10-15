import type { QuoteBlockView } from '../../features/blocks/view';
import { blockMetaClassName } from './blockStyles';

/** Large light quote with a left hairline. */
export default function QuoteBlock({ block }: { block: QuoteBlockView }) {
  const source = [block.attribution, block.role].filter(Boolean).join(' · ');
  return (
    <figure className="max-w-4xl border-l border-ink pl-5 md:pl-10">
      <blockquote className="font-light text-title-sm leading-snug text-ink md:text-title">
        <p>{block.quote}</p>
      </blockquote>
      {source ? <figcaption className={`mt-5 ${blockMetaClassName}`}>{source}</figcaption> : null}
    </figure>
  );
}
