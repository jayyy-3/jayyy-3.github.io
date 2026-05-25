import { Link, useParams } from 'react-router-dom';
import ProjectMaterialMap from '../components/projects/ProjectMaterialMap';
import RouteState from '../components/RouteState';
import { projects, type ProjectData, type ProjectMaterial } from '../data/projectData';
import StoneLibraryService from '../service/StoneLibraryService';

function renderDetailValue(value: string | string[]) {
  if (Array.isArray(value)) {
    return value.map((entry, index) => (
      <p key={`${entry}-${index}`} className="text-[15px] leading-7 text-[var(--urblo-text)]">
        {entry}
      </p>
    ));
  }

  return <p className="text-[15px] leading-7 text-[var(--urblo-text)]">{value}</p>;
}

function getProjectFacts(project: ProjectData) {
  return Object.entries(project.details).map(([label, value]) => ({ label, value }));
}

function toFallbackLabel(value: string) {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function resolveProjectMaterial(material: ProjectMaterial) {
  const stone = StoneLibraryService.getStoneDetail(material.stoneGroupId);
  const finish = stone?.finishes.find((entry) => entry.finishKey === material.finishKey);

  return {
    stoneName: stone?.name || toFallbackLabel(material.stoneGroupId),
    finishLabel: finish?.label || toFallbackLabel(material.finishKey),
    image: material.image || finish?.imageUrl || stone?.finishes[0]?.imageUrl,
    imageAlt:
      material.imageAlt ||
      finish?.imageAlt ||
      `${stone?.name || material.stoneGroupId} ${finish?.label || material.finishKey} finish preview`,
  };
}

function ProjectBrief({ project }: { project: ProjectData }) {
  const factLabels = ['Client', 'Stone', 'Finish', 'Quantity', 'Carbon Offset', 'Landscape Architect', 'Contractor', 'Date'];
  const facts = getProjectFacts(project).filter((fact) => factLabels.includes(fact.label));
  const address = project.details.Address;
  const locationLabel = Array.isArray(address)
    ? address.join(' / ')
    : address || project.listing.location;
  const summary =
    project.listing.summary ||
    project.lead ||
    'A project record showing stone selection, finish intent, delivery partners, and site context.';

  return (
    <section className="border-b border-black/10 bg-white py-14 md:py-20">
      <div className="urblo-page-container grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.65fr)] lg:items-start">
        <div className="max-w-4xl">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--urblo-lime)]">
            {locationLabel}
          </p>
          <h2 className="urblo-project-section-title mt-5 text-black">
            Project facts
          </h2>
          <p className="mt-7 max-w-3xl text-[20px] leading-9 text-[var(--urblo-text)]">
            {summary}
          </p>
        </div>

        <div className="border-t border-black pt-1">
          {facts.map(({ label, value }) => (
            <div key={label} className="grid gap-2 border-b border-black/10 py-4 md:grid-cols-[0.42fr_1fr] md:gap-4">
              <p className="urblo-meta text-black/45">{label}</p>
              <div>{renderDetailValue(value)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MaterialMapSection({ project }: { project: ProjectData }) {
  if (!project.materialMap) {
    return null;
  }

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="urblo-page-container">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.6fr_1fr] lg:items-end">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--urblo-lime)]">
            Material map
          </p>
          <h2 className="urblo-project-section-title text-black">
            {project.materialMap.title}
          </h2>
        </div>
        <ProjectMaterialMap materialMap={project.materialMap} />
      </div>
    </section>
  );
}

function MaterialSchedule({ project }: { project: ProjectData }) {
  if (!project.materials?.length) {
    return null;
  }

  return (
    <section className="border-y border-black/10 bg-[rgba(239,239,239,0.20)] py-12 md:py-16">
      <div className="urblo-page-container grid gap-8 lg:grid-cols-[0.45fr_1fr]">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--urblo-lime)]">
            Material schedule
          </p>
          <h2 className="urblo-project-section-title mt-4 text-black">
            Stone, finish, use.
          </h2>
        </div>

        <div className="divide-y divide-black/10 border-t border-black">
          {project.materials.map((material) => {
            const resolved = resolveProjectMaterial(material);

            return (
              <Link
                key={`${material.stoneGroupId}-${material.finishKey}-${material.application}`}
                to={`/stone-library/${material.stoneGroupId}`}
                className="group grid gap-4 py-5 md:grid-cols-[120px_0.9fr_1.1fr] md:items-start"
              >
                <div className="overflow-hidden bg-black">
                  {resolved.image ? (
                    <img src={resolved.image} alt={resolved.imageAlt} className="aspect-[4/3] w-full object-cover" />
                  ) : null}
                </div>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-black/45">
                    {resolved.finishLabel}
                  </p>
                  <h3 className="urblo-project-card-title mt-2 text-black">
                    {resolved.stoneName}
                  </h3>
                  <span className="mt-4 inline-flex border-b border-black pb-1 text-[12px] font-bold uppercase tracking-[0.14em] text-black transition-colors group-hover:border-[var(--urblo-lime)] group-hover:text-[var(--urblo-lime)]">
                    View stone
                  </span>
                </div>
                <div>
                  <p className="text-[14px] font-semibold leading-6 text-black">{material.application}</p>
                  <p className="mt-2 text-[15px] leading-7 text-[var(--urblo-text)]">{material.note}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProjectGallery({ project }: { project: ProjectData }) {
  if (!project.gallery?.length) {
    return (
      <section className="urblo-section bg-[rgba(239,239,239,0.22)]">
        <div className="urblo-page-container grid gap-6 md:grid-cols-2">
          {project.images.map((image, index) => (
            <div key={image} className="overflow-hidden border border-black/10 bg-white">
              <img
                src={image}
                alt={`${project.name} project image ${index + 1}`}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="urblo-page-container">
        <div className="mb-8 grid gap-6 lg:grid-cols-[0.55fr_1fr] lg:items-end">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--urblo-lime)]">
              Project evidence
            </p>
            <h2 className="urblo-project-section-title mt-4 text-black">
              Built context
            </h2>
          </div>
          <p className="max-w-2xl text-[17px] leading-8 text-[var(--urblo-text)]">
            A short record of the stone elements in the public realm, kept secondary to the material map.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {project.gallery.map((image) => (
            <figure
              key={image.src}
              className="group"
            >
              <div className="overflow-hidden bg-black">
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <figcaption className="grid gap-2 border-t border-black/10 pt-4">
                <span className="urblo-meta text-black/45">{image.label}</span>
                <span className="text-[14px] leading-7 text-[var(--urblo-text)]">{image.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function LegacyProjectGallery({ project }: { project: ProjectData }) {
  return (
    <section className="urblo-section bg-[rgba(239,239,239,0.22)]">
      <div className="urblo-page-container grid gap-6 md:grid-cols-2">
        {project.images.map((image, index) => (
          <div key={image} className="overflow-hidden border border-black/10 bg-white">
            <img
              src={image}
              alt={`${project.name} project image ${index + 1}`}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function LegacyProjectDetails({ project }: { project: ProjectData }) {
  return (
    <div className="bg-white">
      <section className="urblo-section-tight border-b border-black/10">
        <div className="urblo-page-container">
          <p className="urblo-eyebrow">Project Details</p>
          <h1 className="urblo-page-title">{project.name}</h1>
        </div>
      </section>
      <ProjectBrief project={project} />
      <LegacyProjectGallery project={project} />
    </div>
  );
}

function ProjectCta({ project }: { project: ProjectData }) {
  if (!project.cta) {
    return null;
  }

  return (
    <section className="bg-black py-14 text-white md:py-[72px]">
      <div className="urblo-page-container flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <div className="max-w-3xl">
          <h2 className="urblo-project-section-title text-white">
            {project.cta.title}
          </h2>
          <p className="mt-4 text-[17px] leading-8 text-white/70">{project.cta.body}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <Link to={project.cta.primaryTo} className="urblo-button-inverse border-white bg-white text-black hover:border-[var(--urblo-lime)]">
            {project.cta.primaryLabel}
          </Link>
          {project.cta.secondaryTo && project.cta.secondaryLabel ? (
            <Link to={project.cta.secondaryTo} className="urblo-button border-white text-white hover:bg-white hover:text-black">
              {project.cta.secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default function ProjectDetails() {
  const { slug = '' } = useParams();
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return (
      <RouteState
        eyebrow="Project Not Found"
        title="Project not found"
        copy="This project link does not match a published Urblo project. Browse current project records or contact Urblo for help."
        headerOffset
        actions={[
          { label: 'Projects', to: '/projects' },
          { label: 'Contact Us', to: '/contact', variant: 'secondary' },
        ]}
      />
    );
  }

  const heroImage = project.hero?.image || project.images[0];
  const heroAlt = project.hero?.alt || project.name;
  const lead =
    project.lead ||
    'A recent Urblo project showing how natural stone can support durable public environments.';
  const heroDate = Array.isArray(project.details.Date)
    ? project.details.Date.join(' / ')
    : project.details.Date || project.listing.date;
  const heroAddress = project.details.Address;
  const heroLocation = Array.isArray(heroAddress)
    ? heroAddress.join(' / ')
    : heroAddress || project.listing.location;

  if (!project.materialMap) {
    return <LegacyProjectDetails project={project} />;
  }

  return (
    <div className="bg-white">
      <section className="relative min-h-[620px] overflow-hidden bg-black text-white md:min-h-[720px]">
        <img src={heroImage} alt={heroAlt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-black/5" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="urblo-page-container relative z-10 flex min-h-[620px] flex-col justify-end pb-12 pt-[132px] md:min-h-[720px] md:pb-14">
          <div className="max-w-[83rem]">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/70">
              {heroLocation} / {heroDate}
            </p>
            <h1 className="urblo-project-hero-title mt-5 text-white">
              {project.name}
            </h1>
            <p className="mt-6 max-w-2xl text-[20px] font-medium leading-8 text-white/80 md:text-[23px] md:leading-9">
              {lead}
            </p>
          </div>
        </div>
      </section>

      <ProjectBrief project={project} />
      <MaterialMapSection project={project} />
      <MaterialSchedule project={project} />
      <ProjectGallery project={project} />
      <ProjectCta project={project} />
    </div>
  );
}
