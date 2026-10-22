import type { StepsBlockView } from '../../features/blocks/view';
import BodyImage from './BodyImage';
import { cardTitleClassName } from '../ui/styles';
import { blockMetaClassName } from './blockStyles';

/** Numbered process: `01` label, step title and copy, then an optional image presented to suit its shape. */
export default function StepsBlock({ block }: { block: StepsBlockView }) {
  return (
    <div>
      {block.intro ? <p className="mb-8 max-w-3xl text-lead text-body">{block.intro}</p> : null}
      <ol className="grid gap-10 border-t border-ink">
        {block.items.map((item, index) => (
          <li key={`${item.title}-${index}`} className="grid gap-6 border-t border-line pt-5 first:border-t-0">
            <div className="grid gap-3 md:grid-cols-[0.28fr_1fr]">
              <p className={blockMetaClassName} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </p>
              <div className="max-w-3xl">
                <h3 className={cardTitleClassName()}>{item.title}</h3>
                {item.body ? <p className="mt-3 text-copy text-body">{item.body}</p> : null}
              </div>
            </div>
            {item.image ? (
              <BodyImage
                as="div"
                src={item.image.src}
                alt={item.image.alt}
                width={item.image.width}
                height={item.image.height}
              />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
