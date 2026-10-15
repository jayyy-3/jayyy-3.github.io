import type { HeadingBlockView } from '../../features/blocks/view';
import SectionHeading from '../ui/SectionHeading';

/** A chapter opening inside the body: same pattern as the page's section headings. */
export default function HeadingBlock({ block }: { block: HeadingBlockView }) {
  return (
    <SectionHeading
      eyebrow={block.eyebrow}
      title={block.title}
      copy={block.intro}
      className="border-t border-ink pt-5"
      titleClassName="max-w-4xl"
    />
  );
}
