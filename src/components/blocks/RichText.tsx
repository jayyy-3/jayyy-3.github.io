import { Link } from 'react-router-dom';
import { parseRichText, type RichInline } from '../../lib/richText';
import { cx } from '../ui/styles';

const linkClassName = 'font-semibold text-ink underline decoration-1 underline-offset-4 transition hover:decoration-lime';

function Inline({ nodes }: { nodes: RichInline[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        if (node.kind === 'text') return <span key={index}>{node.text}</span>;
        if (node.kind === 'strong') {
          return (
            <strong key={index} className="font-semibold text-ink">
              <Inline nodes={node.children} />
            </strong>
          );
        }
        return node.external ? (
          <a key={index} href={node.href} rel="noopener" className={linkClassName}>
            <Inline nodes={node.children} />
          </a>
        ) : (
          <Link key={index} to={node.href} className={linkClassName}>
            <Inline nodes={node.children} />
          </Link>
        );
      })}
    </>
  );
}

/** Restricted Markdown body copy (paragraphs, bold, links, `- ` lists). Never renders HTML. */
export default function RichText({ source, className }: { source: string; className?: string }) {
  return (
    <div className={cx('space-y-5', className)}>
      {parseRichText(source).map((block, index) =>
        block.kind === 'paragraph' ? (
          <p key={index}>
            <Inline nodes={block.children} />
          </p>
        ) : (
          <ul key={index} className="list-disc space-y-2 pl-5 marker:text-muted">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <Inline nodes={item} />
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
