import { useMemo, useState } from 'react';
import FilterBar from '../components/stone-library/FilterBar';
import StoneCard from '../components/stone-library/StoneCard';
import StoneLibraryService from '../service/StoneLibraryService';

export default function StoneLibraryPage() {
    const facets = useMemo(() => StoneLibraryService.getFilterFacets(), []);

    const [search, setSearch] = useState('');
    const [stoneType, setStoneType] = useState('');
    const [finishKey, setFinishKey] = useState('');

    const cards = useMemo(
        () =>
            StoneLibraryService.getStoneCards({
                query: search,
                stoneType: stoneType || undefined,
                finishKey: finishKey || undefined,
            }),
        [search, stoneType, finishKey],
    );

    function clearFilters() {
        setSearch('');
        setStoneType('');
        setFinishKey('');
    }

    return (
        <>
            <header className="relative overflow-hidden border-b border-neutral-800 bg-neutral-950 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#00FF1940,transparent_55%)]" />
                <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-24">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00FF19]">
                        Digital Stone Library
                    </p>
                    <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
                        Stone Library
                    </h1>
                    <p className="mt-6 max-w-3xl text-sm text-neutral-300 md:text-base">
                        Explore Urblo raw stone options by type, finish capability, and project suitability.
                        This library is designed for fast design decisions backed by sourcing data.
                    </p>
                </div>
            </header>

            <FilterBar
                search={search}
                stoneType={stoneType}
                finishKey={finishKey}
                stoneTypes={facets.stoneTypes}
                finishes={facets.finishes}
                resultCount={cards.length}
                onSearchChange={setSearch}
                onStoneTypeChange={setStoneType}
                onFinishChange={setFinishKey}
                onClear={clearFilters}
            />

            <section className="bg-neutral-50 py-10 md:py-12">
                <div className="mx-auto max-w-7xl px-4">
                    {cards.length ? (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {cards.map((card) => (
                                <StoneCard key={card.stoneGroupId} stone={card} />
                            ))}
                        </div>
                    ) : (
                        <div className="border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
                            <p className="text-lg font-medium text-neutral-900">No stones match the current filters.</p>
                            <p className="mt-2 text-sm text-neutral-600">
                                Try clearing one or more filters to broaden results.
                            </p>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-6 border border-neutral-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
                            >
                                Reset filters
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
