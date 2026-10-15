import { useContext } from 'react';
import { Trash2 } from 'lucide-react';
import { addComparisonColumn, removeComparisonColumn } from '../../../features/blocks/edit';
import { BLOCK_TEXT_LIMITS, CONTENT_BLOCK_LIMITS } from '../../../features/blocks/schema';
import { BlockAddButton, BlockItemList, BlockTextField } from './BlockFormControls';
import { BlockFormContext } from './blockFormContext';
import type { BlockFormProps } from './blockFormTypes';

/** Columns and rows stay aligned: adding or removing a column changes every row. */
export default function ComparisonTableForm({ content, onChange }: BlockFormProps<'comparison_table'>) {
  const { disabled } = useContext(BlockFormContext);
  const { min, max } = CONTENT_BLOCK_LIMITS.comparisonColumns;
  const setColumn = (index: number, value: string) =>
    onChange({ ...content, columns: content.columns.map((column, entry) => (entry === index ? value : column)) });
  const addColumn = () => onChange(addComparisonColumn(content));
  const removeColumn = (index: number) => onChange(removeComparisonColumn(content, index));
  return (
    <div className="grid gap-4">
      <BlockTextField label="Table title" value={content.title} maxLength={BLOCK_TEXT_LIMITS.title} onChange={(title) => onChange({ ...content, title })} />
      <fieldset className="border border-black/10 bg-white p-3">
        <legend className="text-micro font-bold uppercase tracking-[0.13em] text-black/52">Columns</legend>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          {content.columns.map((column, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <BlockTextField label={`Column ${index + 1}`} value={column} maxLength={BLOCK_TEXT_LIMITS.title} onChange={(value) => setColumn(index, value)} />
              </div>
              <button
                type="button"
                onClick={() => removeColumn(index)}
                disabled={disabled || content.columns.length <= min}
                className="mb-1 inline-flex h-9 items-center gap-1 rounded border border-black/15 bg-white px-2 text-micro font-bold uppercase tracking-[0.12em] text-black/58 transition hover:border-red-700 hover:text-red-700 disabled:cursor-not-allowed disabled:text-black/25"
                aria-label={`Remove column ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <BlockAddButton label="Add column" onClick={addColumn} disabled={content.columns.length >= max} />
        </div>
      </fieldset>
      <BlockItemList
        items={content.rows}
        noun="Row"
        min={CONTENT_BLOCK_LIMITS.comparisonRows.min}
        max={CONTENT_BLOCK_LIMITS.comparisonRows.max}
        createItem={() => ({ label: '', cells: content.columns.map(() => '') })}
        onChange={(rows) => onChange({ ...content, rows })}
        renderItem={(row, _index, update) => (
          <>
            <BlockTextField label="Row label" value={row.label} maxLength={BLOCK_TEXT_LIMITS.title} onChange={(label) => update({ ...row, label })} />
            <div className="grid gap-3 md:grid-cols-2">
              {content.columns.map((column, cellIndex) => (
                <BlockTextField
                  key={cellIndex}
                  label={column.trim() || `Column ${cellIndex + 1}`}
                  value={row.cells[cellIndex] ?? ''}
                  maxLength={BLOCK_TEXT_LIMITS.short}
                  onChange={(value) => update({ ...row, cells: content.columns.map((_, entry) => (entry === cellIndex ? value : row.cells[entry] ?? '')) })}
                />
              ))}
            </div>
          </>
        )}
      />
    </div>
  );
}
