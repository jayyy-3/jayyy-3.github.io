import { ArrowUpRight } from 'lucide-react';
import type { BlockLinkView, CtaBlockView } from '../../features/blocks/view';
import Button from '../ui/Button';
import { cardTitleClassName } from '../ui/styles';

function linkProps(link: BlockLinkView) {
  return link.href.startsWith('/') ? { to: link.href } : { href: link.href, rel: 'noopener' };
}

/** In-body prompt with one or two actions; the page's closing CTA still follows the body. */
export default function CtaBlock({ block }: { block: CtaBlockView }) {
  return (
    <aside className="grid gap-6 border-y border-ink py-8 md:grid-cols-[1fr_auto] md:items-end">
      <div className="max-w-3xl">
        <h3 className={cardTitleClassName('lg')}>{block.title}</h3>
        {block.body ? <p className="mt-3 text-copy text-body">{block.body}</p> : null}
      </div>
      {block.primary || block.secondary ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          {block.primary ? (
            <Button {...linkProps(block.primary)}>
              {block.primary.label}
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          ) : null}
          {block.secondary ? (
            <Button variant="ghost" {...linkProps(block.secondary)}>
              {block.secondary.label}
            </Button>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
