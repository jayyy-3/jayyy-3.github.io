import { useEffect, useMemo, useState } from 'react';
import FilterBar from '../components/stone-library/FilterBar';
import StoneCard from '../components/stone-library/StoneCard';
import StoneLibraryService from '../service/StoneLibraryService';

import type { StoneCardVM } from '../types/stone-library';

export default function StoneLibraryPage() {
  const [publicCards, setPublicCards] = useState<StoneCardVM[]>(() =>
    StoneLibraryService.getStoneCards(),
  );

  const [search, setSearch] = useState('');
  const [stoneType, setStoneType] = useState('');
  const [finishKey, setFinishKey] = useState('');
  const facets = useMemo(
    () => StoneLibraryService.getFilterFacets(publicCards),
    [publicCards],
  );

  const cards = useMemo(
    () =>
      StoneLibraryService.filterStoneCards(publicCards, {
        query: search,
        stoneType: stoneType || undefined,
        finishKey: finishKey || undefined,
      }),
    [publicCards, search, stoneType, finishKey],
  );

  useEffect(() => {
    let isCurrent = true;
    StoneLibraryService.getPublicStoneCards()
      .then((nextCards) => {
        if (!isCurrent) return;
        setPublicCards(nextCards);
      })
      .catch(() => {
        // The initial static cards stay visible if the public CMS read fails.
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  function clearFilters() {
    setSearch('');
    setStoneType('');
    setFinishKey('');
  }

  return (
    <div className="bg-white">
      <section className="border-b border-black/10 py-10 md:py-12">
        <div className="urblo-page-container">
          <p className="urblo-eyebrow">Digital Stone Library</p>
          <h1 className="urblo-page-title">Stone Library</h1>
          <p className="mt-5 max-w-[48rem] text-[18px] font-medium leading-8 text-[var(--urblo-text)] md:text-[19px]">
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

      <section className="bg-[rgba(239,239,239,0.32)] py-10 md:py-12">
        <div className="urblo-page-container">
          {cards.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
