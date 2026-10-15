import { useId } from 'react';
import type { ComparisonTableBlockView } from '../../features/blocks/view';
import { cardTitleClassName } from '../ui/styles';
import { blockMetaClassName } from './blockStyles';

/**
 * Multi-column comparison. The table scrolls inside its own container on narrow screens with
 * the first column fixed; the page itself never scrolls sideways.
 */
export default function ComparisonTableBlock({ block }: { block: ComparisonTableBlockView }) {
  const titleId = useId();
  return (
    <div>
      {block.title ? <h3 id={titleId} className={`mb-5 ${cardTitleClassName()}`}>{block.title}</h3> : null}
      <div
        className="max-w-full overflow-x-auto"
        role="region"
        aria-labelledby={block.title ? titleId : undefined}
        aria-label={block.title ? undefined : 'Comparison table'}
        tabIndex={0}
      >
        <table className="w-full min-w-[560px] border-t border-ink text-left">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="sticky left-0 bg-white py-4 pr-4">
                <span className="sr-only">Item</span>
              </th>
              {block.columns.map((column, index) => (
                <th key={`${column}-${index}`} scope="col" className={`min-w-[160px] py-4 pl-4 pr-4 ${blockMetaClassName}`}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={`${row.label}-${rowIndex}`} className="border-b border-line align-top">
                <th
                  scope="row"
                  className="sticky left-0 w-[160px] bg-white py-4 pr-4 text-small font-semibold text-ink shadow-[inset_-1px_0_0_rgba(0,0,0,0.12)]"
                >
                  {row.label}
                </th>
                {row.cells.map((cell, cellIndex) => (
                  <td key={cellIndex} className="py-4 pl-4 pr-4 text-small text-body">
                    {cell || <span className="text-muted" aria-label="No entry">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
