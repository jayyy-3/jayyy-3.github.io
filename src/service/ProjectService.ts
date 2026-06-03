import { projects as staticProjects, type ProjectData } from '../data/projectData.ts';
import { getPublicContentClient } from '../lib/publicContentClient.ts';

type MediaRef = { source_url: string | null; alt: string | null };

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
  sort_order: number | null;
  cover_media?: MediaRef | MediaRef[] | null;
  hero_media?: MediaRef | MediaRef[] | null;
};

type ProjectFactRow = {
  fact_label: string;
  fact_value: string | null;
  fact_value_json: string[] | null;
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

function mapProjectRow(row: ProjectRow, facts: ProjectFactRow[] = [], media: ProjectMediaRow[] = []): ProjectData {
  const coverMedia = firstRelation(row.cover_media);
  const heroMedia = firstRelation(row.hero_media);
  const cover = coverMedia?.source_url || '/media/launch/contact/project-contact.jpg';
  const hero = heroMedia?.source_url || cover;
  const year = toYear(row.project_date_label);
  const details: ProjectData['details'] = {};

  for (const fact of facts.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))) {
    details[fact.fact_label] = fact.fact_value_json || fact.fact_value || '';
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
    images: media
      .map((entry) => firstRelation(entry.media_assets)?.source_url)
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
          src: firstRelation(entry.media_assets)?.source_url || cover,
          alt: firstRelation(entry.media_assets)?.alt || entry.label || row.title,
          title: entry.block_title || undefined,
          label: entry.label || undefined,
          caption: entry.caption || undefined,
        };
      }),
  };
}

async function getPublishedProjects(): Promise<ProjectData[]> {
  const supabase = getPublicContentClient();
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
      sort_order,
      cover_media:media_assets!projects_cover_media_id_fkey (
        source_url,
        alt
      ),
      hero_media:media_assets!projects_hero_media_id_fkey (
        source_url,
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

  const { data: facts } = await supabase
    .from('project_facts')
    .select('project_id, fact_label, fact_value, fact_value_json, sort_order')
    .in('project_id', ids)
    .order('sort_order', { ascending: true });

  for (const fact of (facts ?? []) as (ProjectFactRow & { project_id: number })[]) {
    factsByProject.set(fact.project_id, [...(factsByProject.get(fact.project_id) ?? []), fact]);
  }

  const { data: media } = await supabase
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
        source_url,
        alt
      )
    `)
    .in('project_id', ids)
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  for (const item of (media ?? []) as unknown as (ProjectMediaRow & { project_id: number })[]) {
    mediaByProject.set(item.project_id, [...(mediaByProject.get(item.project_id) ?? []), item]);
  }

  return projectRows.map((row) => mapProjectRow(row, factsByProject.get(row.id), mediaByProject.get(row.id)));
}

class ProjectService {
  static async getAll(): Promise<ProjectData[]> {
    const publishedProjects = await getPublishedProjects();
    return publishedProjects.length ? publishedProjects : staticProjects;
  }

  static async getBySlug(slug: string): Promise<ProjectData | undefined> {
    const projects = await ProjectService.getAll();
    return projects.find((project) => project.slug === slug);
  }
}

export default ProjectService;
