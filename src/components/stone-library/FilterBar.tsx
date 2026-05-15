import type { StoneFilterFacet } from '../../types/stone-library';

interface FilterBarProps {
  search: string;
  stoneType: string;
  finishKey: string;
  stoneTypes: StoneFilterFacet[];
  finishes: StoneFilterFacet[];
  resultCount: number;
  onSearchChange: (value: string) => void;
  onStoneTypeChange: (value: string) => void;
  onFinishChange: (value: string) => void;
  onClear: () => void;
}

export default function FilterBar({
  search,
  stoneType,
  finishKey,
  stoneTypes,
  finishes,
  resultCount,
  onSearchChange,
  onStoneTypeChange,
  onFinishChange,
  onClear,
}: FilterBarProps) {
  return (
    <section className="sticky top-0 z-30 border-y border-black/10 bg-white/98 shadow-[0_8px_24px_rgba(0,0,0,0.035)] backdrop-blur">
      <div className="urblo-page-container grid gap-3 py-3 md:grid-cols-[minmax(220px,1.35fr)_minmax(180px,0.78fr)_minmax(220px,0.95fr)_auto] md:items-end">
        <div className="w-full">
          <label htmlFor="stone-search" className="urblo-meta mb-1.5 block text-[10px] text-black/62">
            Search
          </label>
          <input
            id="stone-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Stone name, type, or origin"
            className="h-11 w-full rounded-[4px] border border-black/14 bg-white px-4 text-[14px] font-medium text-black outline-none transition placeholder:text-black/35 focus:border-black focus:ring-2 focus:ring-[var(--urblo-lime)]"
          />
        </div>

        <div className="w-full">
          <label htmlFor="stone-type" className="urblo-meta mb-1.5 block text-[10px] text-black/62">
            Stone Type
          </label>
          <select
            id="stone-type"
            value={stoneType}
            onChange={(event) => onStoneTypeChange(event.target.value)}
            className="h-11 w-full rounded-[4px] border border-black/14 bg-white px-4 text-[14px] font-medium text-black outline-none transition focus:border-black focus:ring-2 focus:ring-[var(--urblo-lime)]"
          >
            <option value="">All Types</option>
            {stoneTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} ({type.count})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <label htmlFor="stone-finish" className="urblo-meta mb-1.5 block text-[10px] text-black/62">
            Finish
          </label>
          <select
            id="stone-finish"
            value={finishKey}
            onChange={(event) => onFinishChange(event.target.value)}
            className="h-11 w-full rounded-[4px] border border-black/14 bg-white px-4 text-[14px] font-medium text-black outline-none transition focus:border-black focus:ring-2 focus:ring-[var(--urblo-lime)]"
          >
            <option value="">All Finishes</option>
            {finishes.map((finish) => (
              <option key={finish.value} value={finish.value}>
                {finish.label} ({finish.count})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-4 md:min-w-[142px] md:flex-col md:items-end md:justify-end md:gap-2">
          <p className="urblo-meta text-[10px] text-black/62">{resultCount} results</p>
          <button type="button" onClick={onClear} className="min-h-11 rounded-[4px] border border-black px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-black transition hover:bg-black hover:text-white">
            Clear
          </button>
        </div>
      </div>
    </section>
  );
}
