import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type {
  ProjectData,
  ProjectMaterial,
  ProjectMediaBlock,
} from '../../data/projectData';
import StoneLibraryService from '../../service/StoneLibraryService';
import type { StoneDetailVM } from '../../types/stone-library';
import ProjectHotspotImage from './ProjectHotspotImage';
import ProjectResponsiveImage from './ProjectResponsiveImage';

interface ProjectPageViewProps {
  project: ProjectData;
  allProjects: ProjectData[];
  previewMode?: boolean;
}

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

function projectMaterialKey(material: ProjectMaterial) {
  return `${material.stoneGroupId}:${material.stoneVariantId || ''}`;
}

function resolveProjectMaterial(
  material: ProjectMaterial,
  publishedDetails: ReadonlyMap<string, StoneDetailVM>,
) {
  const stone = publishedDetails.get(projectMaterialKey(material))
    || StoneLibraryService.getStoneDetail(material.stoneGroupId, material.stoneVariantId);
  const finish = stone?.finishes.find((entry) => entry.finishKey === material.finishKey);

  return {
    stoneName: stone?.name || toFallbackLabel(material.stoneGroupId),
    finishLabel: finish?.label || toFallbackLabel(material.finishKey),
    image: finish?.imageUrl || stone?.finishes[0]?.imageUrl,
    imageAlt:
      finish?.imageAlt ||
      `${stone?.name || material.stoneGroupId} ${finish?.label || material.finishKey} finish preview`,
  };
}

function getProjectNeighbour(project: ProjectData, allProjects: ProjectData[], direction: -1 | 1) {
  if (allProjects.length < 2) return null;
  const currentIndex = allProjects.findIndex((item) => item.slug === project.slug);
  if (currentIndex === -1) return null;

  const nextIndex = (currentIndex + direction + allProjects.length) % allProjects.length;
  return allProjects[nextIndex];
}

function defaultMediaBlocks(project: ProjectData): ProjectMediaBlock[] {
  if (project.mediaBlocks?.length) {
    return project.mediaBlocks;
  }

  return project.images.map((image, index) => ({
    id: `${project.slug}-image-${index + 1}`,
    type: 'normal_image',
    src: image,
    alt: `${project.name} project image ${index + 1}`,
  }));
}

function ProjectOpening({ project, allProjects }: { project: ProjectData; allProjects: ProjectData[] }) {
  const previousProject = getProjectNeighbour(project, allProjects, -1);
  const nextProject = getProjectNeighbour(project, allProjects, 1);
  const heroDate = Array.isArray(project.details.Date)
    ? project.details.Date.join(' / ')
    : project.details.Date || project.listing.date;

  return (
    <section className="border-b border-black/10 bg-white">
      <div className="urblo-page-container py-12 md:py-16">
        <nav className="flex flex-wrap items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-black/45">
          <Link to="/" className="transition hover:text-black">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/projects" className="transition hover:text-black">
            Projects
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-black">{project.name}</span>
        </nav>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
              {project.listing.location} / {heroDate}
            </p>
            <h1 className="mt-5 max-w-[1200px] text-[48px] font-light leading-[1.02] text-black md:text-[76px] lg:text-[112px]">
              {project.name}
            </h1>
            <p className="mt-7 max-w-4xl text-[21px] font-medium leading-9 text-[var(--urblo-text)]">
              {project.lead || project.listing.summary}
            </p>
          </div>

          <div className="grid gap-3 border-t border-black pt-4">
            {previousProject ? (
              <Link
                to={`/projects/${previousProject.slug}`}
                className="group flex items-center justify-between gap-4 border-b border-black/10 pb-3 text-[12px] font-bold uppercase tracking-[0.14em] text-black/50 transition hover:text-black"
              >
                <span className="inline-flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </span>
                <span className="text-right text-black">{previousProject.listing.title}</span>
              </Link>
            ) : null}
            {nextProject ? (
              <Link
                to={`/projects/${nextProject.slug}`}
                className="group flex items-center justify-between gap-4 text-[12px] font-bold uppercase tracking-[0.14em] text-black/50 transition hover:text-black"
              >
                <span className="inline-flex items-center gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </span>
                <span className="text-right text-black">{nextProject.listing.title}</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectHero({ project }: { project: ProjectData }) {
  const heroImage = project.hero?.image || project.listing.cover || project.images[0];
  const heroAlt = project.hero?.alt || project.listing.imageAlt || project.name;

  if (!heroImage) {
    return (
      <div
        className="grid min-h-[420px] place-items-center bg-black px-6 text-center text-[12px] font-bold uppercase tracking-[0.16em] text-white/55 md:min-h-[58svh]"
        role="img"
        aria-label={`${heroAlt} image not selected`}
      >
        Project image
      </div>
    );
  }

  return (
    <figure className="bg-black">
      <ProjectResponsiveImage
        src={heroImage}
        profile="hero"
        alt={heroAlt}
        className="h-[58svh] min-h-[420px] w-full object-cover md:h-[72svh]"
        fetchPriority="high"
      />
      {project.hero?.caption ? (
        <figcaption className="urblo-page-container py-4 text-[13px] leading-6 text-white/62">
          {project.hero.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function ProjectInformation({ project }: { project: ProjectData }) {
  const facts = getProjectFacts(project);
  const story =
    project.story?.length
      ? project.story
      : [
          project.listing.summary ||
            'A project record showing stone selection, finish intent, delivery partners, and site context.',
        ];

  return (
    <section className="border-b border-black/10 bg-white py-14 md:py-20">
      <div className="urblo-page-container grid gap-12 lg:grid-cols-[0.42fr_1fr] lg:items-start">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--urblo-lime)]">
            Project Information
          </p>
          <h2 className="mt-5 text-[38px] font-semibold leading-tight text-black md:text-[48px]">
            Facts before interpretation.
          </h2>
        </div>

        <div className="grid gap-10">
          <div className="grid gap-x-8 border-t border-black md:grid-cols-2">
            {facts.map(({ label, value }) => (
              <div key={label} className="grid gap-2 border-b border-black/10 py-5">
                <p className="urblo-meta text-black/45">{label}</p>
                <div>{renderDetailValue(value)}</div>
              </div>
            ))}
          </div>

          <div className="max-w-4xl space-y-5 text-[18px] leading-8 text-[var(--urblo-text)]">
            {story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NormalImageBlock({ block }: { block: Extract<ProjectMediaBlock, { type: 'normal_image' }> }) {
  return (
    <figure>
      <div className="overflow-hidden bg-black">
        <ProjectResponsiveImage
          src={block.src}
          profile="detail"
          alt={block.alt}
          className="aspect-[16/9] w-full object-cover"
          loading="lazy"
        />
      </div>
      {block.label || block.caption ? (
        <figcaption className="grid gap-3 border-b border-black/10 py-5 md:grid-cols-[0.28fr_1fr]">
          <p className="urblo-meta text-black/45">{block.label || 'Project media'}</p>
          <p className="text-[15px] leading-7 text-[var(--urblo-text)]">{block.caption}</p>
        </figcaption>
      ) : null}
    </figure>
  );
}

function YoutubeVideoBlock({ block }: { block: Extract<ProjectMediaBlock, { type: 'youtube_video' }> }) {
  return (
    <figure>
      <div className="aspect-video overflow-hidden bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${block.youtubeId}`}
          title={block.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <figcaption className="grid gap-3 border-b border-black/10 py-5 md:grid-cols-[0.28fr_1fr]">
        <p className="urblo-meta text-black/45">Video</p>
        <div>
          <h3 className="text-[24px] font-semibold leading-tight text-black">{block.title}</h3>
          {block.caption ? <p className="mt-2 text-[15px] leading-7 text-[var(--urblo-text)]">{block.caption}</p> : null}
        </div>
      </figcaption>
    </figure>
  );
}

function ProjectMedia({ project }: { project: ProjectData }) {
  const blocks = defaultMediaBlocks(project);

  if (!blocks.length) {
    return null;
  }

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="urblo-page-container">
        <div className="mb-10 grid gap-5 border-t border-black pt-5 md:grid-cols-[0.34fr_1fr] md:items-end">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--urblo-lime)]">
            Project media
          </p>
          <h2 className="text-[38px] font-semibold leading-tight text-black md:text-[48px]">
            Built evidence, ordered.
          </h2>
        </div>

        <div className="space-y-12">
          {blocks.map((block) => {
            if (block.type === 'normal_image') {
              return <NormalImageBlock key={block.id} block={block} />;
            }

            if (block.type === 'hotspot_image') {
              return (
                <div key={block.id} className="border-b border-black/10 pb-8">
                  <ProjectHotspotImage
                    image={block.image}
                    imageAlt={block.imageAlt}
                    title={block.title}
                    intro={block.intro}
                    caption={block.caption}
                    hotspots={block.hotspots}
                  />
                </div>
              );
            }

            return <YoutubeVideoBlock key={block.id} block={block} />;
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturedMaterials({ project }: { project: ProjectData }) {
  const [publishedDetails, setPublishedDetails] = useState<ReadonlyMap<string, StoneDetailVM>>(
    () => new Map(),
  );

  useEffect(() => {
    let active = true;
    const uniqueMaterials = [
      ...new Map((project.materials ?? []).map((material) => [projectMaterialKey(material), material])).values(),
    ];
    if (!uniqueMaterials.length) {
      setPublishedDetails(new Map());
      return () => {
        active = false;
      };
    }

    Promise.all(
      uniqueMaterials.map(async (material) => ({
        key: projectMaterialKey(material),
        detail: await StoneLibraryService.getPublishedStoneDetail(
          material.stoneGroupId,
          material.stoneVariantId,
        ),
      })),
    )
      .then((results) => {
        if (!active) return;
        setPublishedDetails(new Map(
          results.flatMap((result) => result.detail ? [[result.key, result.detail] as const] : []),
        ));
      })
      .catch(() => {
        if (active) setPublishedDetails(new Map());
      });

    return () => {
      active = false;
    };
  }, [project.materials]);

  if (!project.materials?.length) {
    return null;
  }

  return (
    <section className="border-y border-black/10 bg-[rgba(239,239,239,0.22)] py-12 md:py-16">
      <div className="urblo-page-container grid gap-8 lg:grid-cols-[0.36fr_1fr]">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--urblo-lime)]">
            Featured Materials
          </p>
          <h2 className="mt-4 text-[34px] font-semibold leading-tight text-black">
            Stone, finish, use.
          </h2>
        </div>

        <div className="divide-y divide-black/10 border-t border-black">
          {project.materials.map((material) => {
            const resolved = resolveProjectMaterial(material, publishedDetails);
            const params = new URLSearchParams();
            if (material.stoneVariantId) params.set('variant', material.stoneVariantId);
            params.set('finish', material.finishKey);

            return (
              <Link
                key={`${material.stoneGroupId}-${material.finishKey}-${material.application}`}
                to={`/stone-library/${material.stoneGroupId}?${params.toString()}`}
                className="group grid gap-4 py-5 md:grid-cols-[140px_0.9fr_1.1fr] md:items-start"
              >
                <div className="overflow-hidden bg-black">
                  {resolved.image ? (
                    <img src={resolved.image} alt={resolved.imageAlt} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  ) : null}
                </div>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-black/45">
                    {resolved.finishLabel}
                  </p>
                  <h3 className="mt-2 text-[28px] font-semibold leading-tight text-black">
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

function ProjectCta({ project }: { project: ProjectData }) {
  const cta = project.cta ?? {
    title: 'Have a project that needs stone to become buildable?',
    body:
      'Talk to Urblo about material selection, finish behavior, shop drawings, fabrication scope, and delivery planning before the project is locked.',
    primaryLabel: 'Discuss a project',
    primaryTo: '/contact',
    secondaryLabel: 'View capabilities',
    secondaryTo: '/capabilities',
  };

  return (
    <section className="bg-black py-14 text-white md:py-[72px]">
      <div className="urblo-page-container flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <div className="max-w-3xl">
          <h2 className="text-[34px] font-semibold leading-tight text-white md:text-[44px]">
            {cta.title}
          </h2>
          <p className="mt-4 text-[17px] leading-8 text-white/70">{cta.body}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <Link to={cta.primaryTo} className="urblo-button-inverse border-white bg-white text-black hover:border-[var(--urblo-lime)]">
            {cta.primaryLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          {cta.secondaryTo && cta.secondaryLabel ? (
            <Link to={cta.secondaryTo} className="urblo-button border-white text-white hover:bg-white hover:text-black">
              {cta.secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function preventPreviewNavigation(event: ReactMouseEvent<HTMLDivElement>) {
  if (event.target instanceof Element && event.target.closest('a')) {
    event.preventDefault();
    event.stopPropagation();
  }
}

export default function ProjectPageView({
  project,
  allProjects,
  previewMode = false,
}: ProjectPageViewProps) {
  return (
    <div
      className="bg-white"
      onClickCapture={previewMode ? preventPreviewNavigation : undefined}
      onAuxClickCapture={previewMode ? preventPreviewNavigation : undefined}
    >
      <ProjectOpening project={project} allProjects={allProjects} />
      <ProjectHero project={project} />
      <ProjectInformation project={project} />
      <ProjectMedia project={project} />
      <FeaturedMaterials project={project} />
      <ProjectCta project={project} />
    </div>
  );
}
