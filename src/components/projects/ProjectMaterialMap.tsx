import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProjectHotspot, ProjectMaterialMap as ProjectMaterialMapData } from '../../data/projectData';

const kindLabelByType: Record<ProjectHotspot['kind'], string> = {
  material: 'Material',
  detail: 'Detail',
  experience: 'Experience',
  scope: 'Scope',
};

interface ProjectMaterialMapProps {
  materialMap: ProjectMaterialMapData;
}

export default function ProjectMaterialMap({ materialMap }: ProjectMaterialMapProps) {
  const [activeHotspotId, setActiveHotspotId] = useState(materialMap.hotspots[0]?.id ?? '');

  const activeHotspot = useMemo(() => {
    return (
      materialMap.hotspots.find((hotspot) => hotspot.id === activeHotspotId) ??
      materialMap.hotspots[0]
    );
  }, [activeHotspotId, materialMap.hotspots]);

  if (!activeHotspot) {
    return null;
  }

  const activeIndex = materialMap.hotspots.findIndex((hotspot) => hotspot.id === activeHotspot.id);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_360px]">
      <div className="space-y-5">
        <p className="max-w-2xl text-[17px] leading-8 text-[var(--urblo-text)]">
          {materialMap.intro}
        </p>

        <div className="relative overflow-hidden bg-black">
          <img
            src={materialMap.image}
            alt={materialMap.imageAlt}
            className="aspect-[4/3] w-full object-cover md:aspect-[16/10]"
          />

          {materialMap.hotspots.map((hotspot, index) => {
            const active = hotspot.id === activeHotspot.id;

            return (
              <button
                key={hotspot.id}
                type="button"
                className={[
                  'group absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[11px] font-bold transition duration-200 md:h-9 md:w-9',
                  active
                    ? 'border-[var(--urblo-lime)] bg-white text-black shadow-[0_0_0_4px_rgba(0,255,25,0.20)]'
                    : 'border-white/80 bg-black/35 text-white backdrop-blur hover:border-[var(--urblo-lime)] hover:bg-black/70',
                ].join(' ')}
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                aria-label={`Inspect ${hotspot.title}`}
                aria-pressed={active}
                onMouseEnter={() => setActiveHotspotId(hotspot.id)}
                onFocus={() => setActiveHotspotId(hotspot.id)}
                onClick={() => setActiveHotspotId(hotspot.id)}
              >
                {String(index + 1)}
              </button>
            );
          })}
        </div>
      </div>

      <aside className="border-t border-black/15 pt-6 lg:sticky lg:top-28">
        <div className="overflow-hidden bg-black">
          <img
            src={activeHotspot.image}
            alt={activeHotspot.imageAlt}
            className="aspect-[16/11] w-full object-cover"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--urblo-lime)]">
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
          <span className="h-px w-8 bg-black/20" />
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/45">
            {kindLabelByType[activeHotspot.kind]}
          </span>
          {activeHotspot.finish ? (
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/45">
              {activeHotspot.finish}
            </span>
          ) : null}
        </div>

        <h3 className="mt-3 font-display text-[36px] font-semibold uppercase leading-[0.98] text-black md:text-[44px]">
          {activeHotspot.title}
        </h3>

        <dl className="mt-5 grid gap-4 border-y border-black/10 py-5 sm:grid-cols-2 lg:grid-cols-1">
          {activeHotspot.stoneName ? (
            <div>
              <dt className="urblo-meta mb-1 text-black/45">Stone</dt>
              <dd className="text-[15px] font-semibold text-black">{activeHotspot.stoneName}</dd>
            </div>
          ) : null}
          <div>
            <dt className="urblo-meta mb-1 text-black/45">Application</dt>
            <dd className="text-[15px] font-semibold leading-6 text-black">
              {activeHotspot.application}
            </dd>
          </div>
        </dl>

        <p className="mt-5 text-[17px] leading-8 text-[var(--urblo-text)]">{activeHotspot.body}</p>

        <div className="mt-5 border-l-2 border-[var(--urblo-lime)] pl-4">
          <p className="urblo-meta mb-2 text-black/45">Designer note</p>
          <p className="text-[14px] leading-7 text-black/70">{activeHotspot.designerNote}</p>
        </div>

        {activeHotspot.ctaTo && activeHotspot.ctaLabel ? (
          <Link to={activeHotspot.ctaTo} className="mt-6 inline-flex border-b border-black pb-1 text-[12px] font-bold uppercase tracking-[0.14em] text-black transition-colors hover:border-[var(--urblo-lime)] hover:text-[var(--urblo-lime)]">
            {activeHotspot.ctaLabel}
          </Link>
        ) : null}
      </aside>
    </div>
  );
}
