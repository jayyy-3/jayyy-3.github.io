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
    <div className="bg-white">
      <section className="urblo-section-tight border-b border-black/10">
        <div className="urblo-page-container">
          <p className="urblo-eyebrow">Digital Stone Library</p>
          <h1 className="urblo-page-title">Stone Library</h1>
          <p className="urblo-page-copy">
            Explore Urblo raw stone options by type, finish capability, and project suitability.
            This library is designed for fast design decisions backed by sourcing data.
          </p>
        </div>
      </section>

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

      <section className="urblo-section bg-[rgba(239,239,239,0.28)]">
        <div className="urblo-page-container">
          {cards.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cards.map((card) => (
                <StoneCard key={card.stoneGroupId} stone={card} />
              ))}
            </div>
          ) : (
            <div className="urblo-card px-6 py-16 text-center">
              <p className="font-display text-[28px] font-semibold uppercase leading-[1.1] text-black">
                No stones match the current filters.
              </p>
              <p className="mx-auto mt-3 max-w-[34rem] text-[16px] leading-7 text-[var(--urblo-text)]">
                Try clearing one or more filters to broaden results.
              </p>
              <button type="button" onClick={clearFilters} className="urblo-button mt-6">
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
