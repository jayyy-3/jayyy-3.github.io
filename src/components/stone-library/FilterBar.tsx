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
        <section className="sticky top-0 z-30 border-y border-neutral-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-end md:gap-4">
                <div className="w-full md:flex-1">
                    <label htmlFor="stone-search" className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-neutral-600">
                        Search
                    </label>
                    <input
                        id="stone-search"
                        type="search"
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Stone name, type, or origin"
                        className="w-full rounded-none border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-black"
                    />
                </div>

                <div className="w-full md:w-56">
                    <label htmlFor="stone-type" className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-neutral-600">
                        Stone Type
                    </label>
                    <select
                        id="stone-type"
                        value={stoneType}
                        onChange={(event) => onStoneTypeChange(event.target.value)}
                        className="w-full rounded-none border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-black"
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
                    <label htmlFor="stone-finish" className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-neutral-600">
                        Finish
                    </label>
                    <select
                        id="stone-finish"
                        value={finishKey}
                        onChange={(event) => onFinishChange(event.target.value)}
                        className="w-full rounded-none border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-black"
                    >
                        <option value="">All Finishes</option>
                        {finishes.map((finish) => (
                            <option key={finish.value} value={finish.value}>
                                {finish.label} ({finish.count})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center justify-between gap-4 md:w-auto md:min-w-[180px] md:flex-col md:items-end md:justify-end">
                    <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">
                        {resultCount} results
                    </p>
                    <button
                        type="button"
                        onClick={onClear}
                        className="border border-neutral-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </section>
    );
}
