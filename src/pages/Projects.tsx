import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Grid2X2, List } from 'lucide-react';
import { projects } from '../data/projectData';

type ProjectViewMode = 'grid' | 'list';

const allSectorLabel = 'All sectors';

function getSectorOptions() {
  return [
    allSectorLabel,
    ...Array.from(new Set(projects.map((project) => project.listing.sector))).sort((a, b) =>
      a.localeCompare(b),
    ),
  ];
}

function ProjectsGridCard({ project }: { project: (typeof projects)[number] }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group grid border-t border-black/12 pt-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--urblo-lime)] focus-visible:ring-offset-4"
    >
      <div className="overflow-hidden bg-black">
        <img
          src={project.listing.cover}
          alt={project.listing.imageAlt || project.listing.title}
          className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          loading="lazy"
        />
      </div>
      <div className="grid min-h-[220px] grid-rows-[auto_1fr_auto] gap-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <p className="urblo-meta text-black/45">{project.listing.sector}</p>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-black transition group-hover:text-[var(--urblo-lime)]" />
        </div>
        <div>
          <h2 className="text-[30px] font-semibold leading-[1.05] text-black md:text-[34px]">
            {project.listing.title}
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-[var(--urblo-text)]">
            {project.listing.summary}
          </p>
        </div>
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-black/50">
          {project.listing.location} / {project.listing.year}
        </p>
      </div>
    </Link>
  );
}

function ProjectsListRow({ project, index }: { project: (typeof projects)[number]; index: number }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group grid gap-5 border-t border-black/12 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--urblo-lime)] focus-visible:ring-offset-4 md:grid-cols-[120px_minmax(0,0.35fr)_minmax(0,1fr)_120px_40px] md:items-center"
    >
      <div className="overflow-hidden bg-black">
        <img
          src={project.listing.cover}
          alt={project.listing.imageAlt || project.listing.title}
          className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          loading="lazy"
        />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/38">
          {String(index + 1).padStart(2, '0')}
        </p>
        <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.14em] text-black/50">
          {project.listing.sector}
        </p>
      </div>
      <div>
        <h2 className="text-[28px] font-semibold leading-tight text-black md:text-[34px]">
          {project.listing.title}
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[var(--urblo-text)]">
          {project.listing.summary}
        </p>
      </div>
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-black/50">
        {project.listing.state} / {project.listing.year}
      </p>
      <ArrowUpRight className="h-5 w-5 text-black transition group-hover:text-[var(--urblo-lime)]" />
    </Link>
  );
}

export default function Projects() {
  const [activeSector, setActiveSector] = useState(allSectorLabel);
  const [viewMode, setViewMode] = useState<ProjectViewMode>('grid');
  const sectorOptions = useMemo(getSectorOptions, []);

  const filteredProjects = useMemo(() => {
    if (activeSector === allSectorLabel) {
      return projects;
    }

    return projects.filter((project) => project.listing.sector === activeSector);
  }, [activeSector]);

  return (
    <div className="bg-white pt-[102px]">
      <section className="border-b border-black/10">
        <div className="urblo-page-container py-12 md:py-16">
          <nav className="flex flex-wrap items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-black/45">
            <Link to="/" className="transition hover:text-black">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-black">Projects</span>
          </nav>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(360px,0.34fr)] lg:items-end">
            <div>
              <h1 className="urblo-page-title mt-0">Projects</h1>
              <p className="mt-7 max-w-4xl text-[20px] font-medium leading-9 text-[var(--urblo-text)] md:text-[22px]">
                Proof of stone as civic infrastructure: selected streetscape, education, commercial, and public-realm work where material intent had to become buildable.
              </p>
            </div>

            <div className="grid gap-5 border-t border-black pt-5">
              <div>
                <p className="text-[48px] font-light leading-none text-black">
                  {String(filteredProjects.length).padStart(2, '0')}
                </p>
                <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
                  Projects shown
                </p>
              </div>
              <p className="text-[15px] leading-7 text-black/58">
                Filter by sector, then open a case study for project facts, media evidence, and material notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-[rgba(239,239,239,0.28)]">
        <div className="urblo-page-container flex flex-col gap-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {sectorOptions.map((sector) => {
              const active = sector === activeSector;

              return (
                <button
                  key={sector}
                  type="button"
                  onClick={() => setActiveSector(sector)}
                  className={[
                    'min-h-10 rounded border px-4 text-[11px] font-bold uppercase tracking-[0.14em] transition',
                    active
                      ? 'border-black bg-black text-white'
                      : 'border-black/12 bg-white text-black/58 hover:border-black hover:text-black',
                  ].join(' ')}
                  aria-pressed={active}
                >
                  {sector}
                </button>
              );
            })}
          </div>

          <div className="inline-flex w-fit overflow-hidden rounded border border-black/12 bg-white">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={[
                'inline-flex min-h-10 items-center gap-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] transition',
                viewMode === 'grid' ? 'bg-black text-white' : 'text-black/58 hover:text-black',
              ].join(' ')}
              aria-pressed={viewMode === 'grid'}
            >
              <Grid2X2 className="h-4 w-4" />
              Image
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={[
                'inline-flex min-h-10 items-center gap-2 border-l border-black/12 px-3 text-[11px] font-bold uppercase tracking-[0.14em] transition',
                viewMode === 'list' ? 'bg-black text-white' : 'text-black/58 hover:text-black',
              ].join(' ')}
              aria-pressed={viewMode === 'list'}
            >
              <List className="h-4 w-4" />
              List
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 md:py-14">
        <div className="urblo-page-container">
          {viewMode === 'grid' ? (
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectsGridCard key={project.slug} project={project} />
              ))}
            </div>
          ) : (
            <div>
              {filteredProjects.map((project, index) => (
                <ProjectsListRow key={project.slug} project={project} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
