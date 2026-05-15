import { Link, useParams } from 'react-router-dom';
import ProjectMaterialMap from '../components/projects/ProjectMaterialMap';
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

function ProjectBrief({ project }: { project: ProjectData }) {
  const factLabels = ['Client', 'Stone', 'Finish', 'Quantity', 'Carbon Offset', 'Landscape Architect', 'Contractor', 'Date'];
  const facts = getProjectFacts(project).filter((fact) => factLabels.includes(fact.label));
  const address = project.details.Address;
  const locationLabel = Array.isArray(address)
    ? address.join(' / ')
    : address || project.listing.location;

  return (
    <section className="border-b border-black/10 bg-white py-16 md:py-24">
      <div className="urblo-page-container grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.65fr)] lg:items-start">
        <div className="max-w-4xl">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--urblo-lime)]">
            {locationLabel}
          </p>
          <h2 className="mt-5 font-display text-[38px] font-semibold uppercase leading-[1.04] text-black md:text-[56px]">
            Stone as threshold, mirror, and place to pause.
          </h2>
          <p className="mt-7 max-w-3xl text-[20px] leading-9 text-[var(--urblo-text)]">
            Moon Gate sits between street life, planting, and pedestrian movement. Its black polished
            surface gives the precinct a civic marker; its circular void frames the street; its grey
            seating elements bring the work back to everyday public use.
          </p>
        </div>

        <div className="border-t border-black pt-1">
          {facts.map(({ label, value }) => (
            <div key={label} className="grid grid-cols-[0.42fr_1fr] gap-4 border-b border-black/10 py-4">
              <p className="urblo-meta text-black/45">{label}</p>
              <div>{renderDetailValue(value)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DesignMoves({ project }: { project: ProjectData }) {
  if (!project.projectStory?.length) {
    return null;
  }

  return (
    <section className="bg-black py-16 text-white md:py-24">
      <div className="urblo-page-container">
        <div className="grid gap-8 md:grid-cols-3">
          {project.projectStory.map((block, index) => (
            <article key={block.title} className="border-t border-white/20 pt-5">
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--urblo-lime)]">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-5 font-display text-[36px] font-semibold uppercase leading-none text-white md:text-[46px]">
                {block.title}
              </h3>
              <p className="mt-5 text-[16px] leading-8 text-white/70">{block.body}</p>
            </article>
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
    <section className="bg-white py-16 md:py-24">
      <div className="urblo-page-container">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.6fr_1fr] lg:items-end">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--urblo-lime)]">
            Material reading
          </p>
          <h2 className="font-display text-[38px] font-semibold uppercase leading-[1.04] text-black md:text-[56px]">
            Surface. Void. Pause.
          </h2>
        </div>
        <ProjectMaterialMap materialMap={project.materialMap} />
      </div>
    </section>
  );
}

function MaterialPairingItem({ material }: { material: ProjectMaterial }) {
  const stoneDetail = material.stoneGroupId
    ? StoneLibraryService.getStoneDetail(material.stoneGroupId)
    : null;
  const finishPreview = stoneDetail?.finishes.find(
    (finish) => finish.label.toLowerCase() === material.finish.toLowerCase(),
  );
  const image = material.image || finishPreview?.imageUrl || stoneDetail?.finishes[0]?.imageUrl;
  const imageAlt =
    material.imageAlt ||
    finishPreview?.imageAlt ||
    `${material.name} ${material.finish} finish preview`;
  const content = (
    <div className="grid gap-5 border-t border-black/[0.12] pt-5 md:grid-cols-[180px_1fr] md:gap-7">
      <div className="overflow-hidden bg-black">
        {image ? <img src={image} alt={imageAlt} className="aspect-[4/3] w-full object-cover" /> : null}
      </div>
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
          {material.finish} / {material.application}
        </p>
        <h3 className="mt-3 font-display text-[34px] font-semibold uppercase leading-none text-black">
          {material.name}
        </h3>
        <p className="mt-4 max-w-2xl text-[16px] leading-8 text-[var(--urblo-text)]">{material.role}</p>
        {material.stoneGroupId ? (
          <span className="mt-5 inline-flex border-b border-black pb-1 text-[12px] font-bold uppercase tracking-[0.14em] text-black transition-colors group-hover:border-[var(--urblo-lime)] group-hover:text-[var(--urblo-lime)]">
            View in stone library
          </span>
        ) : null}
      </div>
    </div>
  );

  if (!material.stoneGroupId) {
    return <article>{content}</article>;
  }

  return (
    <Link to={`/stone-library/${material.stoneGroupId}`} className="group block">
      {content}
    </Link>
  );
}

function MaterialPairing({ project }: { project: ProjectData }) {
  if (!project.materials?.length) {
    return null;
  }

  return (
    <section className="bg-[rgba(239,239,239,0.24)] py-16 md:py-24">
      <div className="urblo-page-container grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--urblo-lime)]">
            Material pairing
          </p>
          <h2 className="mt-5 font-display text-[36px] font-semibold uppercase leading-[1.06] text-black md:text-[50px]">
            Black reflection. Grey tactility.
          </h2>
        </div>

        <div className="space-y-8">
          {project.materials.map((material) => (
            <MaterialPairingItem key={`${material.name}-${material.finish}`} material={material} />
          ))}
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
    <section className="bg-white py-16 md:py-24">
      <div className="urblo-page-container">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--urblo-lime)]">
              Gallery
            </p>
            <h2 className="mt-5 font-display text-[36px] font-semibold uppercase leading-[1.06] text-black md:text-[50px]">
              The work in the street.
            </h2>
          </div>
          <p className="max-w-2xl text-[17px] leading-8 text-[var(--urblo-text)]">
            The photographs carry the scale: the moon gate as marker, the repeated circular view, and the quieter seating field around planting and paving.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-5">
          {project.gallery.map((image, index) => (
            <figure
              key={image.src}
              className={[
                'group',
                index === 0 ? 'md:col-span-3 md:row-span-2' : 'md:col-span-2',
              ].join(' ')}
            >
              <div className="overflow-hidden bg-black">
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className={[
                    'w-full object-cover transition duration-500 group-hover:scale-[1.02]',
                    index === 0 ? 'aspect-[4/5] md:aspect-[3/4]' : 'aspect-[4/3]',
                  ].join(' ')}
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
          <h2 className="font-display text-[34px] font-semibold uppercase leading-[1.08] text-white md:text-[46px]">
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
    return <div className="py-40 text-center text-xl">Project not found.</div>;
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
      <section className="relative min-h-[760px] overflow-hidden bg-black text-white md:min-h-[860px]">
        <img src={heroImage} alt={heroAlt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-black/5" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="urblo-page-container relative z-10 flex min-h-[760px] flex-col justify-end pb-12 pt-[148px] md:min-h-[860px] md:pb-16">
          <div className="max-w-4xl">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/70">
              {heroLocation} / {heroDate}
            </p>
            <h1 className="mt-5 font-display text-[48px] font-semibold uppercase leading-[0.95] text-white md:text-[84px] lg:text-[96px]">
              {project.name}
            </h1>
            <p className="mt-6 max-w-2xl text-[22px] font-medium leading-9 text-white/80 md:text-[27px] md:leading-10">
              {lead}
            </p>
          </div>
        </div>
      </section>

      <ProjectBrief project={project} />
      <DesignMoves project={project} />
      <MaterialMapSection project={project} />
      <MaterialPairing project={project} />
      <ProjectGallery project={project} />
      <ProjectCta project={project} />
    </div>
  );
}
