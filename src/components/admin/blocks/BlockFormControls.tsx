import { useContext, useId, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { BlockFormContext } from './blockFormContext';

// Visual language of the Projects editor fields (rounded hairline inputs, uppercase labels).
const labelClass = 'block text-xs font-bold uppercase tracking-[0.12em] text-black/48';
export const blockFieldClass =
  'mt-2 min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium normal-case tracking-normal text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:bg-black/[0.04] disabled:text-black/45';
const smallButtonClass =
  'inline-flex min-h-9 items-center gap-2 rounded border border-black/15 bg-white px-3 text-micro font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:bg-black/[0.04] disabled:text-black/30';
const iconButtonClass =
  'grid h-9 w-9 place-items-center text-black/58 transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/[0.03] disabled:text-black/20';

export function BlockTextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  hint,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength: number;
  hint?: string;
}) {
  const { disabled } = useContext(BlockFormContext);
  return (
    <label className={labelClass}>
      {label}
      <input
        disabled={disabled}
        value={value ?? ''}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={blockFieldClass}
      />
      {hint ? <span className="mt-1 block text-xs font-medium normal-case tracking-normal text-black/45">{hint}</span> : null}
    </label>
  );
}

export function BlockTextArea({
  label,
  value,
  onChange,
  maxLength,
  rows = 4,
  hint,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  maxLength: number;
  rows?: number;
  hint?: string;
}) {
  const { disabled } = useContext(BlockFormContext);
  return (
    <label className={labelClass}>
      {label}
      <textarea
        disabled={disabled}
        value={value ?? ''}
        maxLength={maxLength}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className={`${blockFieldClass} py-3 leading-6`}
      />
      {hint ? <span className="mt-1 block text-xs font-medium normal-case tracking-normal text-black/45">{hint}</span> : null}
    </label>
  );
}

export function BlockSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const { disabled } = useContext(BlockFormContext);
  return (
    <label className={labelClass}>
      {label}
      <select disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} className={blockFieldClass}>
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function BlockAddButton({ label, onClick, disabled = false }: { label: string; onClick: () => void; disabled?: boolean }) {
  const { disabled: locked } = useContext(BlockFormContext);
  return (
    <button type="button" onClick={onClick} disabled={locked || disabled} className={smallButtonClass}>
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

/**
 * Repeating rows (numbers, steps, table rows, cards, gallery images) with visible move and
 * remove controls. The item count stays within the block's limits.
 */
export function BlockItemList<T>({
  items,
  noun,
  min,
  max,
  onChange,
  createItem,
  renderItem,
}: {
  items: readonly T[];
  noun: string;
  min: number;
  max: number;
  onChange: (items: T[]) => void;
  createItem: () => T;
  renderItem: (item: T, index: number, update: (item: T) => void) => ReactNode;
}) {
  const { disabled } = useContext(BlockFormContext);
  const groupId = useId();
  const move = (index: number, offset: number) => {
    const next = [...items];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <fieldset key={`${groupId}-${index}`} className="border border-black/10 bg-white p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <legend className="text-micro font-bold uppercase tracking-[0.13em] text-black/52">
              {noun} {index + 1}
            </legend>
            <div className="flex items-center gap-2">
              <div className="inline-flex overflow-hidden rounded border border-black/15 bg-white" role="group" aria-label={`Reorder ${noun.toLowerCase()} ${index + 1}`}>
                <button type="button" className={`${iconButtonClass} border-r border-black/10`} disabled={disabled || index === 0} onClick={() => move(index, -1)} aria-label={`Move ${noun.toLowerCase()} ${index + 1} up`}>
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" className={iconButtonClass} disabled={disabled || index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Move ${noun.toLowerCase()} ${index + 1} down`}>
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1 rounded border border-black/15 bg-white px-2 text-micro font-bold uppercase tracking-[0.12em] text-black/58 transition hover:border-red-700 hover:text-red-700 disabled:cursor-not-allowed disabled:text-black/25"
                disabled={disabled || items.length <= min}
                onClick={() => onChange(items.filter((_, entry) => entry !== index))}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
          <div className="grid gap-3">
            {renderItem(item, index, (nextItem) => onChange(items.map((entry, entryIndex) => (entryIndex === index ? nextItem : entry))))}
          </div>
        </fieldset>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <BlockAddButton label={`Add ${noun.toLowerCase()}`} onClick={() => onChange([...items, createItem()])} disabled={items.length >= max} />
        <span className="text-xs font-semibold text-black/45">
          {items.length} of up to {max}
        </span>
      </div>
    </div>
  );
}
