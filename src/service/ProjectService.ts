import type { SupabaseClient } from '@supabase/supabase-js';
import { projects as staticProjects, type ProjectData } from '../data/projectData.ts';
import { getPublicContentClient } from '../lib/publicContentClient.ts';
import { parsePublicEntitySeo } from '../lib/publicEntitySeo.ts';
import { normalizePublicProjectFactValue } from '../lib/projectFactValue.ts';
import { resolvePublicMediaUrl, type PublicMediaLocation } from '../lib/publicMediaUrl.ts';
import { overlayPublishedContent, toCanonicalContentKey } from './publicContentOverlay.ts';

type MediaRef = PublicMediaLocation & { alt: string | null };

type ProjectRow = {
  id: number;
  slug: string;
  title: string;
  location: string | null;
  project_date_label: string | null;
  summary: string | null;
  lead: string | null;
  landscape_architect: string | null;
  contractor: string | null;
  address: string | null;
  quantity_label: string | null;
  carbon_status: string | null;
  seo: unknown;
  sort_order: number | null;
  cover_media?: MediaRef | MediaRef[] | null;
  hero_media?: MediaRef | MediaRef[] | null;
};

type ProjectFactRow = {
  fact_label: string;
  fact_value: string | null;
  fact_value_json: unknown;
  sort_order: number | null;
};

type ProjectMediaRow = {
  media_role: string;
  label: string | null;
  caption: string | null;
  block_title: string | null;
  youtube_url: string | null;
  sort_order: number | null;
  media_assets?: MediaRef | MediaRef[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function toYear(dateLabel: string | null): string {
  return dateLabel?.match(/\b(20\d{2}|19\d{2})\b/)?.[0] || '';
}

function toState(location: string | null): string {
  return location?.match(/\b(NSW|QLD|SA|TAS|VIC|WA|ACT|NT)\b/)?.[0] || '';
}

export { normalizePublicProjectFactValue } from '../lib/projectFactValue.ts';

function mapProjectRow(
  row: ProjectRow,
  supabase: SupabaseClient,
  facts: ProjectFactRow[] = [],
  media: ProjectMediaRow[] = [],
): ProjectData {
  const coverMedia = firstRelation(row.cover_media);
  const heroMedia = firstRelation(row.hero_media);
  const cover = resolvePublicMediaUrl(coverMedia, supabase) || '/media/launch/contact/project-contact.jpg';
  const hero = resolvePublicMediaUrl(heroMedia, supabase) || cover;
  const year = toYear(row.project_date_label);
  const details: ProjectData['details'] = {};

  for (const fact of facts.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))) {
    details[fact.fact_label] = normalizePublicProjectFactValue(fact.fact_value_json, fact.fact_value);
  }

  if (row.landscape_architect && !details['Landscape Architect']) {
    details['Landscape Architect'] = row.landscape_architect;
  }
  if (row.contractor && !details.Contractor) {
    details.Contractor = row.contractor;
  }
  if (row.project_date_label && !details.Date) {
    details.Date = row.project_date_label;
  }
  if (row.address && !details.Address) {
    details.Address = row.address;
  }
  if (row.quantity_label && !details.Quantity) {
    details.Quantity = row.quantity_label;
  }

  return {
    slug: row.slug,
    name: row.title,
    contentSource: 'cms',
    seo: parsePublicEntitySeo(row.seo),
    images: media
      .map((entry) => resolvePublicMediaUrl(firstRelation(entry.media_assets), supabase))
      .filter((source): source is string => Boolean(source)),
    listing: {
      title: row.title,
      location: row.location || '',
      state: toState(row.location),
      date: row.project_date_label || '',
      year,
      sector: 'Project',
      category: 'Civil landscape',
      cover,
      imageAlt: coverMedia?.alt || row.title,
      summary: row.summary || undefined,
    },
    hero: {
      image: hero,
      alt: heroMedia?.alt || coverMedia?.alt || row.title,
    },
    lead: row.lead || row.summary || undefined,
    story: row.summary ? [row.summary] : undefined,
    details,
    mediaBlocks: media
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((entry, index) => {
        if (entry.media_role === 'youtube_video' && entry.youtube_url) {
          const youtubeId = entry.youtube_url.split('/').pop() || entry.youtube_url;
          return {
            id: `${row.slug}-video-${index + 1}`,
            type: 'youtube_video' as const,
            youtubeId,
            title: entry.block_title || entry.label || 'Project video',
            caption: entry.caption || undefined,
          };
        }

        return {
          id: `${row.slug}-image-${index + 1}`,
          type: 'normal_image' as const,
          src: resolvePublicMediaUrl(firstRelation(entry.media_assets), supabase) || cover,
          alt: firstRelation(entry.media_assets)?.alt || entry.label || row.title,
          title: entry.block_title || undefined,
          label: entry.label || undefined,
          caption: entry.caption || undefined,
        };
      }),
  };
}

export async function getPublishedProjects(
  suppliedClient?: SupabaseClient | null,
): Promise<ProjectData[]> {
  const supabase = suppliedClient === undefined
    ? await getPublicContentClient()
    : suppliedClient;
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      slug,
      title,
      location,
      project_date_label,
      summary,
      lead,
      landscape_architect,
      contractor,
      address,
      quantity_label,
      carbon_status,
      seo,
      sort_order,
      cover_media:media_assets!projects_cover_media_id_fkey (
        status,
        source_kind,
        source_url,
        bucket,
        object_path,
        alt
      ),
      hero_media:media_assets!projects_hero_media_id_fkey (
        status,
        source_kind,
        source_url,
        bucket,
        object_path,
        alt
      )
    `)
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (error || !data?.length) return [];

  const projectRows = data as unknown as ProjectRow[];
  const ids = projectRows.map((row) => row.id);
  const factsByProject = new Map<number, ProjectFactRow[]>();
  const mediaByProject = new Map<number, ProjectMediaRow[]>();

  const [factsResult, mediaResult] = await Promise.all([
    supabase
      .from('project_facts')
      .select('project_id, fact_label, fact_value, fact_value_json, sort_order')
      .in('project_id', ids)
      .order('sort_order', { ascending: true }),
    supabase
      .from('project_media')
      .select(`
        project_id,
        media_role,
        label,
        caption,
        block_title,
        youtube_url,
        sort_order,
        media_assets (
          status,
          source_kind,
          source_url,
          bucket,
          object_path,
          alt
        )
      `)
      .in('project_id', ids)
      .eq('status', 'published')
      .order('sort_order', { ascending: true }),
  ]);

  if (factsResult.error || mediaResult.error) {
    return [];
  }

  for (const fact of (factsResult.data ?? []) as (ProjectFactRow & { project_id: number })[]) {
    factsByProject.set(fact.project_id, [...(factsByProject.get(fact.project_id) ?? []), fact]);
  }

  for (const item of (mediaResult.data ?? []) as unknown as (ProjectMediaRow & { project_id: number })[]) {
    mediaByProject.set(item.project_id, [...(mediaByProject.get(item.project_id) ?? []), item]);
  }

  return projectRows.map((row) =>
    mapProjectRow(row, supabase, factsByProject.get(row.id), mediaByProject.get(row.id)),
  );
}

export function mergeProjectsWithPublishedOverlay(publishedProjects: ProjectData[]): ProjectData[] {
  const fallbackBySlug = new Map(
    staticProjects.map((project) => [toCanonicalContentKey(project.slug), project]),
  );
  const publishedWithFallbackFields = publishedProjects.map((project) => {
    const fallback = fallbackBySlug.get(toCanonicalContentKey(project.slug));
    if (!fallback) {
      return project;
    }

    return {
      ...project,
      listing: {
        ...project.listing,
        // Project taxonomy is not represented by the current CMS schema.
        sector: fallback.listing.sector,
        category: fallback.listing.category,
      },
      // Preserve static-only public display structures until the public CMS adapter consumes them.
      materialMap: project.materialMap ?? fallback.materialMap,
      materials: project.materials ?? fallback.materials,
      gallery: project.gallery ?? fallback.gallery,
      cta: project.cta ?? fallback.cta,
    };
  });

  return overlayPublishedContent(
    staticProjects,
    publishedWithFallbackFields,
    (project) => project.slug,
  );
}

class ProjectService {
  static async getAll(): Promise<ProjectData[]> {
    const publishedProjects = await getPublishedProjects();
    return mergeProjectsWithPublishedOverlay(publishedProjects);
  }

  static async getBySlug(slug: string): Promise<ProjectData | undefined> {
    const projects = await ProjectService.getAll();
    const canonicalSlug = toCanonicalContentKey(slug);
    return projects.find((project) => toCanonicalContentKey(project.slug) === canonicalSlug);
  }
}

export default ProjectService;
