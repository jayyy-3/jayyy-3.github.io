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
import StoneResponsiveImage from '../stone-library/StoneResponsiveImage';
import Button from '../ui/Button';
import PageIntro from '../ui/PageIntro';
import SectionHeading from '../ui/SectionHeading';
import { buttonClassName, cardTitleClassName } from '../ui/styles';
import { siteCtas } from '../../data/siteChrome';

interface ProjectPageViewProps {
  project: ProjectData;
  allProjects: ProjectData[];
  previewMode?: boolean;
  /** Public `?point=` deep link; ignored in preview mode. */
  focusHotspotId?: string | null;
}

function renderDetailValue(value: string | string[]) {
  if (Array.isArray(value)) {
    return value.map((entry, index) => (
      <p key={`${entry}-${index}`} className="text-copy text-body">
        {entry}
      </p>
    ));
  }

  return <p className="text-copy text-body">{value}</p>;
}

const metaLabelClassName = 'text-meta font-semibold uppercase tracking-caps text-muted';

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
  const stone = publishedDetails.get(projectMaterialKey(material));
  const finish = stone?.finishes.find((entry) => entry.finishKey === material.finishKey);

  return {
    stoneName: stone?.name || toFallbackLabel(material.stoneGroupId),
    finishLabel: finish?.label || toFallbackLabel(material.finishKey),
    image: finish?.imageUrl,
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

  const neighbourLinkClassName =
    'group flex items-center justify-between gap-4 text-meta font-bold uppercase tracking-caps text-muted transition hover:text-ink';

  return (
    <PageIntro
      band
      size="hero"
      breadcrumb={[
        { label: 'Home', to: '/' },
        { label: 'Projects', to: '/projects' },
        { label: project.name },
      ]}
      eyebrow={`${project.listing.location} / ${heroDate}`}
      title={project.name}
      lede={project.lead || project.listing.summary}
      aside={
        previousProject || nextProject ? (
          <nav aria-label="More projects" className="grid gap-3 border-t border-ink pt-4">
            {previousProject ? (
              <Link
                to={`/projects/${previousProject.slug}`}
                className={`${neighbourLinkClassName} border-b border-line pb-3`}
              >
                <span className="inline-flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </span>
                <span className="text-right text-ink">{previousProject.listing.title}</span>
              </Link>
            ) : null}
            {nextProject ? (
              <Link to={`/projects/${nextProject.slug}`} className={neighbourLinkClassName}>
                <span className="inline-flex items-center gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </span>
                <span className="text-right text-ink">{nextProject.listing.title}</span>
              </Link>
            ) : null}
          </nav>
        ) : undefined
      }
    />
  );
}

function ProjectHero({ project }: { project: ProjectData }) {
  const heroImage = project.hero?.image || project.listing.cover || project.images[0];
  const heroAlt = project.hero?.alt || project.listing.imageAlt || project.name;

  if (!heroImage) {
    return (
      <div
        className="grid min-h-[420px] place-items-center bg-ink px-6 text-center text-meta font-bold uppercase tracking-caps text-inverse-muted md:min-h-[58svh]"
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
        <figcaption className="urblo-page-container py-4 text-small text-inverse-body">
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
    <section className="urblo-section border-b border-line bg-white">
      <div className="urblo-page-container grid gap-12 lg:grid-cols-[0.42fr_1fr] lg:items-start">
        <SectionHeading eyebrow="Project information" title="Facts before interpretation." />

        <div className="grid gap-10">
          <div className="grid gap-x-8 border-t border-ink md:grid-cols-2">
            {facts.map(({ label, value }) => (
              <div key={label} className="grid gap-2 border-b border-line py-5">
                <p className={metaLabelClassName}>{label}</p>
                <div>{renderDetailValue(value)}</div>
              </div>
            ))}
          </div>

          <div className="max-w-4xl space-y-5 text-lead text-body">
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
        <figcaption className="grid gap-3 border-b border-line py-5 md:grid-cols-[0.28fr_1fr]">
          <p className={metaLabelClassName}>{block.label || 'Project media'}</p>
          <p className="text-copy text-body">{block.caption}</p>
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
      <figcaption className="grid gap-3 border-b border-line py-5 md:grid-cols-[0.28fr_1fr]">
        <p className={metaLabelClassName}>Video</p>
        <div>
          <h3 className={cardTitleClassName()}>{block.title}</h3>
          {block.caption ? <p className="mt-2 text-copy text-body">{block.caption}</p> : null}
        </div>
      </figcaption>
    </figure>
  );
}

function ProjectMedia({
  project,
  focusHotspotId,
}: {
  project: ProjectData;
  focusHotspotId: string | null;
}) {
  const blocks = defaultMediaBlocks(project);
  const focusBlockId = focusHotspotId
    ? blocks.find(
        (block) =>
          block.type === 'hotspot_image' &&
          block.hotspots.some((hotspot) => hotspot.id === focusHotspotId),
      )?.id ?? null
    : null;

  if (!blocks.length) {
    return null;
  }

  return (
    <section className="urblo-section bg-white">
      <div className="urblo-page-container">
        <SectionHeading
          eyebrow="Project media"
          title="Built evidence, ordered."
          className="mb-10 border-t border-ink pt-5"
        />

        <div className="space-y-12">
          {blocks.map((block) => {
            if (block.type === 'normal_image') {
              return <NormalImageBlock key={block.id} block={block} />;
            }

            if (block.type === 'hotspot_image') {
              return (
                <div key={block.id} className="border-b border-line pb-8">
                  <ProjectHotspotImage
                    image={block.image}
                    imageAlt={block.imageAlt}
                    title={block.title}
                    intro={block.intro}
                    caption={block.caption}
                    hotspots={block.hotspots}
                    anchorId={`project-media-${block.id}`}
                    focusHotspotId={block.id === focusBlockId ? focusHotspotId : null}
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
    <section className="urblo-section border-y border-line bg-surface">
      <div className="urblo-page-container grid gap-8 lg:grid-cols-[0.36fr_1fr]">
        <SectionHeading eyebrow="Featured materials" title="Stone, finish, use." />

        <div className="divide-y divide-line border-t border-ink">
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
                <div className="overflow-hidden bg-ink">
                  {resolved.image ? (
                    <StoneResponsiveImage src={resolved.image} profile="material" alt={resolved.imageAlt} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  ) : null}
                </div>
                <div>
                  <p className={metaLabelClassName}>{resolved.finishLabel}</p>
                  <h3 className={`mt-2 ${cardTitleClassName()}`}>{resolved.stoneName}</h3>
                  <span className={buttonClassName({ variant: 'link', className: 'mt-4 group-hover:decoration-lime' })}>
                    View stone
                  </span>
                </div>
                <div>
                  <p className="text-small font-semibold text-ink">{material.application}</p>
                  <p className="mt-2 text-copy text-body">{material.note}</p>
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
    primaryLabel: siteCtas.contact.label,
    primaryTo: siteCtas.contact.to,
    secondaryLabel: 'View capabilities',
    secondaryTo: '/capabilities',
  };

  return (
    <section className="urblo-section bg-ink">
      <div className="urblo-page-container flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <SectionHeading surface="dark" title={cta.title} copy={cta.body} className="max-w-3xl" />
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <Button surface="dark" to={cta.primaryTo}>
            {cta.primaryLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Button>
          {cta.secondaryTo && cta.secondaryLabel ? (
            <Button variant="ghost" surface="dark" to={cta.secondaryTo}>
              {cta.secondaryLabel}
            </Button>
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
  focusHotspotId = null,
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
      <ProjectMedia project={project} focusHotspotId={previewMode ? null : focusHotspotId} />
      <FeaturedMaterials project={project} />
      <ProjectCta project={project} />
    </div>
  );
}
