import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProjectHotspot, ProjectMaterialMap as ProjectMaterialMapData } from '../../data/projectData';
import StoneLibraryService from '../../service/StoneLibraryService';

interface ProjectMaterialMapProps {
  materialMap: ProjectMaterialMapData;
}

function toFallbackLabel(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function resolveHotspot(hotspot: ProjectHotspot) {
  const stone = StoneLibraryService.getStoneDetail(hotspot.stoneGroupId);
  const finish = stone?.finishes.find((entry) => entry.finishKey === hotspot.finishKey);

  return {
    stoneName: stone?.name || toFallbackLabel(hotspot.stoneGroupId),
    finishLabel: finish?.label || toFallbackLabel(hotspot.finishKey),
    previewImage: hotspot.image || finish?.imageUrl || stone?.finishes[0]?.imageUrl,
    previewAlt:
      hotspot.imageAlt ||
      finish?.imageAlt ||
      `${stone?.name || hotspot.stoneGroupId} ${finish?.label || hotspot.finishKey} finish preview`,
  };
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
  const activeMaterial = resolveHotspot(activeHotspot);
  const activeHref = `/stone-library/${activeHotspot.stoneGroupId}`;

  const inspector = (
    <aside className="border-t border-black/15 pt-5 lg:sticky lg:top-28 lg:pt-0">
      <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-4 border-b border-black/10 pb-5">
        <div className="overflow-hidden bg-black">
          {activeMaterial.previewImage ? (
            <img
              src={activeMaterial.previewImage}
              alt={activeMaterial.previewAlt}
              className="aspect-square w-full object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--urblo-lime)]">
            Selected material {String(activeIndex + 1).padStart(2, '0')}
          </p>
          <h3 className="urblo-project-card-title mt-2 text-black">
            {activeMaterial.stoneName}
          </h3>
          <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.14em] text-black/50">
            {activeMaterial.finishLabel}
          </p>
        </div>
      </div>

      <dl className="grid gap-4 border-b border-black/10 py-5">
        <div>
          <dt className="urblo-meta mb-1 text-black/45">Application</dt>
          <dd className="text-[15px] font-semibold leading-6 text-black">{activeHotspot.application}</dd>
        </div>
        <div>
          <dt className="urblo-meta mb-1 text-black/45">Project note</dt>
          <dd className="text-[15px] leading-7 text-[var(--urblo-text)]">{activeHotspot.note}</dd>
        </div>
      </dl>

      <Link
        to={activeHref}
        className="mt-5 inline-flex border-b border-black pb-1 text-[12px] font-bold uppercase tracking-[0.14em] text-black transition-colors hover:border-[var(--urblo-lime)] hover:text-[var(--urblo-lime)]"
      >
        View in stone library
      </Link>
    </aside>
  );

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_350px]">
      <div className="space-y-5">
        <p className="max-w-2xl text-[17px] leading-8 text-[var(--urblo-text)]">
          {materialMap.intro}
        </p>

        <div className="relative overflow-hidden border-y border-black/10 bg-black">
          <img
            src={materialMap.image}
            alt={materialMap.imageAlt}
            className="aspect-[4/3] w-full object-cover md:aspect-[16/10]"
          />

          {materialMap.hotspots.map((hotspot) => {
            const active = hotspot.id === activeHotspot.id;
            const material = resolveHotspot(hotspot);
            const label = `${material.stoneName} / ${material.finishLabel}`;

            return (
              <button
                key={hotspot.id}
                type="button"
                className={[
                  'group absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition duration-200',
                  active
                    ? 'border-[var(--urblo-lime)] bg-white shadow-[0_0_0_5px_rgba(0,255,25,0.20)]'
                    : 'border-white/80 bg-black/35 backdrop-blur hover:border-[var(--urblo-lime)] hover:bg-black/70',
                ].join(' ')}
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                aria-label={`Inspect ${label}`}
                aria-pressed={active}
                onMouseEnter={() => setActiveHotspotId(hotspot.id)}
                onFocus={() => setActiveHotspotId(hotspot.id)}
                onClick={() => setActiveHotspotId(hotspot.id)}
              >
                <span
                  className={[
                    'block h-2.5 w-2.5 rounded-full transition',
                    active ? 'bg-[var(--urblo-lime)]' : 'bg-white group-hover:bg-[var(--urblo-lime)]',
                  ].join(' ')}
                />
                <span
                  className={[
                    'pointer-events-none absolute left-1/2 top-[calc(100%+10px)] hidden -translate-x-1/2 whitespace-nowrap border border-black/10 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-black shadow-[0_14px_30px_rgba(0,0,0,0.12)] md:block',
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                  ].join(' ')}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="lg:hidden">{inspector}</div>

        <div className="grid gap-2 sm:grid-cols-2 lg:hidden">
          {materialMap.hotspots.map((hotspot) => {
            const material = resolveHotspot(hotspot);
            const active = hotspot.id === activeHotspot.id;

            return (
              <button
                key={hotspot.id}
                type="button"
                className={[
                  'border px-4 py-3 text-left transition',
                  active ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black',
                ].join(' ')}
                onClick={() => setActiveHotspotId(hotspot.id)}
              >
                <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--urblo-lime)]">
                  {material.finishLabel}
                </span>
                <span className="mt-1 block text-[15px] font-semibold">{material.stoneName}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden lg:block">{inspector}</div>
    </div>
  );
}
