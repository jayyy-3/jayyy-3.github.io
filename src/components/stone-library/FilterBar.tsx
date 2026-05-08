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
    <section className="sticky top-0 z-30 border-y border-black/10 bg-white/95 backdrop-blur">
      <div className="urblo-page-container flex flex-col gap-3 py-4 md:flex-row md:items-end md:gap-4">
        <div className="w-full md:flex-1">
          <label htmlFor="stone-search" className="urblo-meta mb-2 block text-[11px] text-black/65">
            Search
          </label>
          <input
            id="stone-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Stone name, type, or origin"
            className="w-full rounded-[4px] border border-black/15 bg-white px-4 py-3 text-[15px] text-black outline-none transition focus:border-black"
          />
        </div>

        <div className="w-full md:w-56">
          <label htmlFor="stone-type" className="urblo-meta mb-2 block text-[11px] text-black/65">
            Stone Type
          </label>
          <select
            id="stone-type"
            value={stoneType}
            onChange={(event) => onStoneTypeChange(event.target.value)}
            className="w-full rounded-[4px] border border-black/15 bg-white px-4 py-3 text-[15px] text-black outline-none transition focus:border-black"
          >
            <option value="">All Types</option>
            {stoneTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} ({type.count})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-64">
          <label htmlFor="stone-finish" className="urblo-meta mb-2 block text-[11px] text-black/65">
            Finish
          </label>
          <select
            id="stone-finish"
            value={finishKey}
            onChange={(event) => onFinishChange(event.target.value)}
            className="w-full rounded-[4px] border border-black/15 bg-white px-4 py-3 text-[15px] text-black outline-none transition focus:border-black"
          >
            <option value="">All Finishes</option>
            {finishes.map((finish) => (
              <option key={finish.value} value={finish.value}>
                {finish.label} ({finish.count})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-4 md:min-w-[180px] md:flex-col md:items-end md:justify-end">
          <p className="urblo-meta text-black/65">{resultCount} results</p>
          <button type="button" onClick={onClear} className="urblo-button">
            Clear
          </button>
        </div>
      </div>
    </section>
  );
}
