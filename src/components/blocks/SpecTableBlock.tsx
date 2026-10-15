import type { SpecTableBlockView } from '../../features/blocks/view';
import { cardTitleClassName } from '../ui/styles';
import { blockMetaClassName } from './blockStyles';

/** Two-column label/value table with hairlines only. */
export default function SpecTableBlock({ block }: { block: SpecTableBlockView }) {
  return (
    <div className="max-w-4xl">
      {block.title ? <h3 className={`mb-5 ${cardTitleClassName()}`}>{block.title}</h3> : null}
      <table className="w-full border-t border-ink text-left">
        <tbody>
          {block.rows.map((row, index) => (
            <tr key={`${row.label}-${index}`} className="border-b border-line align-top">
              <th scope="row" className={`w-[38%] py-4 pr-4 md:w-[28%] ${blockMetaClassName}`}>
                {row.label}
              </th>
              <td className="py-4 text-copy text-body [overflow-wrap:anywhere]">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
