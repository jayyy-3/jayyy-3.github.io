import type { SupabaseClient } from '@supabase/supabase-js';
import {
  projects as staticProjects,
  type ProjectData,
  type ProjectHotspot,
  type ProjectMaterial,
  type ProjectMaterialMap,
  type ProjectMediaBlock,
} from '../data/projectData.ts';
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
  completed_on: string | null;
  summary: string | null;
  lead: string | null;
  client: string | null;
  landscape_architect: string | null;
  contractor: string | null;
  address: string | null;
  quantity_label: string | null;
  carbon_status: string | null;
  carbon_note: string | null;
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
  status: string;
};

type ProjectMediaRow = {
  id: number;
  project_material_map_id: number | null;
  media_role: string;
  label: string | null;
  caption: string | null;
  block_title: string | null;
  youtube_url: string | null;
  sort_order: number | null;
  media_assets?: MediaRef | MediaRef[] | null;
};

type StoneGroupRef = {
  stone_group_key: string;
};

type FinishDefinitionRef = {
  finish_key: string;
};

type ProjectMaterialRow = {
  id: number;
  application: string;
  note: string | null;
  sort_order: number | null;
  status: string;
  stone_groups?: StoneGroupRef | StoneGroupRef[] | null;
  finish_definitions?: FinishDefinitionRef | FinishDefinitionRef[] | null;
  media_assets?: MediaRef | MediaRef[] | null;
};

type ProjectMaterialMapRow = {
  id: number;
  title: string | null;
  intro: string | null;
  sort_order: number | null;
  status: string;
  media_assets?: MediaRef | MediaRef[] | null;
};

type ProjectHotspotRow = {
  project_material_map_id: number;
  project_material_id: number | null;
  hotspot_key: string;
  x_percent: number | string;
  y_percent: number | string;
  label: string | null;
  application: string | null;
  note: string | null;
  sort_order: number | null;
  status: string;
  preview_media?: MediaRef | MediaRef[] | null;
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

function toCarbonLabel(status: string | null): string {
  if (status === 'yes') return 'Yes';
  if (status === 'no') return 'No';
  if (status === 'not_available') return 'Not available';
  if (status === 'tbc') return 'To be confirmed';
  return '';
}

export { normalizePublicProjectFactValue } from '../lib/projectFactValue.ts';

function mapProjectMaterial(
  row: ProjectMaterialRow,
  supabase: SupabaseClient,
): ProjectMaterial | null {
  const stone = firstRelation(row.stone_groups);
  const finish = firstRelation(row.finish_definitions);
  if (!stone?.stone_group_key || !finish?.finish_key) return null;

  const media = firstRelation(row.media_assets);
  const image = resolvePublicMediaUrl(media, supabase);

  return {
    stoneGroupId: stone.stone_group_key,
    finishKey: finish.finish_key,
    application: row.application,
    note: row.note || '',
    image: image || undefined,
    imageAlt: media?.alt || undefined,
  };
}

function mapProjectHotspot(
  row: ProjectHotspotRow,
  materialRowsById: Map<number, ProjectMaterialRow>,
  supabase: SupabaseClient,
): ProjectHotspot | null {
  if (!row.project_material_id) return null;

  const material = materialRowsById.get(row.project_material_id);
  const stone = firstRelation(material?.stone_groups);
  const finish = firstRelation(material?.finish_definitions);
  if (!material || !stone?.stone_group_key || !finish?.finish_key) return null;

  const previewMedia = firstRelation(row.preview_media) || firstRelation(material.media_assets);
  const previewImage = resolvePublicMediaUrl(previewMedia, supabase);

  return {
    id: row.hotspot_key,
    x: Number(row.x_percent),
    y: Number(row.y_percent),
    title: row.label || undefined,
    description: row.note || undefined,
    stoneGroupId: stone.stone_group_key,
    finishKey: finish.finish_key,
    application: row.application || material.application,
    note: row.note || material.note || '',
    image: previewImage || undefined,
    imageAlt: previewMedia?.alt || undefined,
  };
}

function mapProjectMaterialMap(
  row: ProjectMaterialMapRow,
  hotspots: ProjectHotspotRow[],
  materialRowsById: Map<number, ProjectMaterialRow>,
  supabase: SupabaseClient,
): ProjectMaterialMap | null {
  const media = firstRelation(row.media_assets);
  const image = resolvePublicMediaUrl(media, supabase);
  if (!image) return null;

  return {
    image,
    imageAlt: media?.alt || row.title || 'Project material map',
    title: row.title || 'Project material map',
    intro: row.intro || '',
    hotspots: hotspots
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((hotspot) => mapProjectHotspot(hotspot, materialRowsById, supabase))
      .filter((hotspot): hotspot is ProjectHotspot => Boolean(hotspot)),
  };
}

function extractYouTubeId(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.includes('/')) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace(/^\//, '') || trimmed;
    }
    return url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop() || trimmed;
  } catch {
    return trimmed.split('/').filter(Boolean).pop() || trimmed;
  }
}

function mapProjectRow(
  row: ProjectRow,
  supabase: SupabaseClient,
  facts: ProjectFactRow[] = [],
  media: ProjectMediaRow[] = [],
  materials: ProjectMaterialRow[] = [],
  materialMaps: ProjectMaterialMapRow[] = [],
  hotspots: ProjectHotspotRow[] = [],
): ProjectData {
  const coverMedia = firstRelation(row.cover_media);
  const heroMedia = firstRelation(row.hero_media);
  const cover = resolvePublicMediaUrl(coverMedia, supabase) || '/media/launch/contact/project-contact.jpg';
  const hero = resolvePublicMediaUrl(heroMedia, supabase) || cover;
  const dateLabel = row.project_date_label || row.completed_on;
  const year = toYear(dateLabel);
  const details: ProjectData['details'] = {};

  for (const fact of facts.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))) {
    details[fact.fact_label] = normalizePublicProjectFactValue(fact.fact_value_json, fact.fact_value);
  }

  if (row.client && !details.Client) {
    details.Client = row.client;
  }
  if (row.landscape_architect && !details['Landscape Architect']) {
    details['Landscape Architect'] = row.landscape_architect;
  }
  if (row.contractor && !details.Contractor) {
    details.Contractor = row.contractor;
  }
  if (dateLabel && !details.Date) {
    details.Date = dateLabel;
  }
  if (row.address && !details.Address) {
    details.Address = row.address;
  }
  if (row.quantity_label && !details.Quantity) {
    details.Quantity = row.quantity_label;
  }
  const carbonLabel = toCarbonLabel(row.carbon_status);
  if (carbonLabel && !details['Carbon Offset']) {
    details['Carbon Offset'] = row.carbon_note
      ? `${carbonLabel} — ${row.carbon_note}`
      : carbonLabel;
  }

  const sortedMaterialRows = materials
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const materialRowsById = new Map(sortedMaterialRows.map((material) => [material.id, material]));
  const mappedMaterials = sortedMaterialRows
    .map((material) => mapProjectMaterial(material, supabase))
    .filter((material): material is ProjectMaterial => Boolean(material));
  const hotspotsByMapId = new Map<number, ProjectHotspotRow[]>();

  for (const hotspot of hotspots) {
    hotspotsByMapId.set(hotspot.project_material_map_id, [
      ...(hotspotsByMapId.get(hotspot.project_material_map_id) ?? []),
      hotspot,
    ]);
  }

  const mappedMaterialMaps: Array<{
    row: ProjectMaterialMapRow;
    value: ProjectMaterialMap;
  }> = [];

  for (const materialMapRow of materialMaps
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))) {
    const value = mapProjectMaterialMap(
      materialMapRow,
      hotspotsByMapId.get(materialMapRow.id) ?? [],
      materialRowsById,
      supabase,
    );
    if (value) mappedMaterialMaps.push({ row: materialMapRow, value });
  }

  const materialMapById = new Map(mappedMaterialMaps.map((entry) => [entry.row.id, entry.value]));
  const linkedMaterialMapIds = new Set<number>();
  const mediaBlocks: ProjectMediaBlock[] = [];

  for (const entry of media
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))) {
    if (entry.media_role === 'youtube_video' && entry.youtube_url) {
      mediaBlocks.push({
        id: `${row.slug}-media-${entry.id}`,
        type: 'youtube_video',
        youtubeId: extractYouTubeId(entry.youtube_url),
        title: entry.block_title || entry.label || 'Project video',
        caption: entry.caption || undefined,
      });
      continue;
    }

    if (entry.media_role === 'hotspot_image' && entry.project_material_map_id) {
      const linkedMap = materialMapById.get(entry.project_material_map_id);
      if (!linkedMap) continue;

      const entryMedia = firstRelation(entry.media_assets);
      const entryImage = resolvePublicMediaUrl(entryMedia, supabase);
      linkedMaterialMapIds.add(entry.project_material_map_id);
      mediaBlocks.push({
        id: `${row.slug}-media-${entry.id}`,
        type: 'hotspot_image',
        image: entryImage || linkedMap.image,
        imageAlt: entryMedia?.alt || linkedMap.imageAlt,
        title: entry.block_title || linkedMap.title,
        intro: linkedMap.intro || undefined,
        caption: entry.caption || undefined,
        hotspots: linkedMap.hotspots,
      });
      continue;
    }

    const entryMedia = firstRelation(entry.media_assets);
    const source = resolvePublicMediaUrl(entryMedia, supabase);
    if (!source) continue;

    mediaBlocks.push({
      id: `${row.slug}-media-${entry.id}`,
      type: 'normal_image',
      src: source,
      alt: entryMedia?.alt || entry.label || row.title,
      title: entry.block_title || undefined,
      label: entry.label || undefined,
      caption: entry.caption || undefined,
    });
  }

  for (const entry of mappedMaterialMaps) {
    if (linkedMaterialMapIds.has(entry.row.id)) continue;
    mediaBlocks.push({
      id: `${row.slug}-hotspot-${entry.row.id}`,
      type: 'hotspot_image',
      image: entry.value.image,
      imageAlt: entry.value.imageAlt,
      title: entry.value.title,
      intro: entry.value.intro || undefined,
      hotspots: entry.value.hotspots,
    });
  }

  const images = mediaBlocks.flatMap((block) => {
    if (block.type === 'normal_image') return [block.src];
    if (block.type === 'hotspot_image') return [block.image];
    return [];
  });

  return {
    slug: row.slug,
    name: row.title,
    contentSource: 'cms',
    seo: parsePublicEntitySeo(row.seo),
    images,
    listing: {
      title: row.title,
      location: row.location || '',
      state: toState(row.location),
      date: dateLabel || '',
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
    materialMap: mappedMaterialMaps[0]?.value,
    materials: mappedMaterials,
    mediaBlocks,
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
      completed_on,
      summary,
      lead,
      client,
      landscape_architect,
      contractor,
      address,
      quantity_label,
      carbon_status,
      carbon_note,
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
  const materialsByProject = new Map<number, ProjectMaterialRow[]>();
  const materialMapsByProject = new Map<number, ProjectMaterialMapRow[]>();
  const hotspotsByProject = new Map<number, ProjectHotspotRow[]>();

  const [factsResult, mediaResult, materialsResult, materialMapsResult] = await Promise.all([
    supabase
      .from('project_facts')
      .select('project_id, fact_label, fact_value, fact_value_json, sort_order, status')
      .in('project_id', ids)
      .eq('status', 'published')
      .eq('claim_status', 'approved')
      .order('sort_order', { ascending: true }),
    supabase
      .from('project_media')
      .select(`
        project_id,
        id,
        project_material_map_id,
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
    supabase
      .from('project_materials')
      .select(`
        id,
        project_id,
        application,
        note,
        sort_order,
        status,
        stone_groups!project_materials_stone_group_id_fkey (
          stone_group_key
        ),
        finish_definitions!project_materials_finish_definition_id_fkey (
          finish_key
        ),
        media_assets!project_materials_media_asset_id_fkey (
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
      .eq('claim_status', 'approved')
      .order('sort_order', { ascending: true }),
    supabase
      .from('project_material_maps')
      .select(`
        id,
        project_id,
        title,
        intro,
        sort_order,
        status,
        media_assets!project_material_maps_media_asset_id_fkey (
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

  // Facts and materials gain their visibility status in the aggregate-project
  // migration. Until that migration is deployed, either query fails and the
  // caller receives the complete static project set rather than a partial CMS page.
  if (
    factsResult.error ||
    mediaResult.error ||
    materialsResult.error ||
    materialMapsResult.error
  ) {
    return [];
  }

  const materialMapRows = (materialMapsResult.data ?? []) as unknown as (
    ProjectMaterialMapRow & { project_id: number }
  )[];
  const materialMapIds = materialMapRows.map((materialMap) => materialMap.id);
  const hotspotsResult = materialMapIds.length
    ? await supabase
        .from('project_hotspots')
        .select(`
          project_material_map_id,
          project_material_id,
          hotspot_key,
          x_percent,
          y_percent,
          label,
          application,
          note,
          sort_order,
          status,
          preview_media:media_assets!project_hotspots_preview_media_id_fkey (
            status,
            source_kind,
            source_url,
            bucket,
            object_path,
            alt
          )
        `)
        .in('project_material_map_id', materialMapIds)
        .eq('status', 'published')
        .order('sort_order', { ascending: true })
    : { data: [], error: null };

  if (hotspotsResult.error) return [];

  for (const fact of (factsResult.data ?? []) as (ProjectFactRow & { project_id: number })[]) {
    factsByProject.set(fact.project_id, [...(factsByProject.get(fact.project_id) ?? []), fact]);
  }

  for (const item of (mediaResult.data ?? []) as unknown as (ProjectMediaRow & { project_id: number })[]) {
    mediaByProject.set(item.project_id, [...(mediaByProject.get(item.project_id) ?? []), item]);
  }

  for (const material of (materialsResult.data ?? []) as unknown as (
    ProjectMaterialRow & { project_id: number }
  )[]) {
    materialsByProject.set(material.project_id, [
      ...(materialsByProject.get(material.project_id) ?? []),
      material,
    ]);
  }

  const projectIdByMaterialMapId = new Map<number, number>();
  for (const materialMap of materialMapRows) {
    projectIdByMaterialMapId.set(materialMap.id, materialMap.project_id);
    materialMapsByProject.set(materialMap.project_id, [
      ...(materialMapsByProject.get(materialMap.project_id) ?? []),
      materialMap,
    ]);
  }

  for (const hotspot of (hotspotsResult.data ?? []) as unknown as ProjectHotspotRow[]) {
    const projectId = projectIdByMaterialMapId.get(hotspot.project_material_map_id);
    if (!projectId) continue;
    hotspotsByProject.set(projectId, [...(hotspotsByProject.get(projectId) ?? []), hotspot]);
  }

  return projectRows.map((row) =>
    mapProjectRow(
      row,
      supabase,
      factsByProject.get(row.id),
      mediaByProject.get(row.id),
      materialsByProject.get(row.id),
      materialMapsByProject.get(row.id),
      hotspotsByProject.get(row.id),
    ),
  );
}

export async function getArchivedProjectSlugs(
  suppliedClient?: SupabaseClient | null,
): Promise<string[]> {
  const supabase = suppliedClient === undefined
    ? await getPublicContentClient()
    : suppliedClient;
  if (!supabase) return [];

  const { data, error } = await supabase.rpc(
    'get_archived_project_slugs',
    undefined,
    { get: true },
  );

  // Availability-first failure behavior: a tombstone read failure must not
  // make otherwise healthy static project pages disappear.
  if (error || !Array.isArray(data)) return [];

  // The RPC is a public suppression signal, not a private-content feed. Keep a
  // client-side allowlist as defence in depth so an unexpected function result
  // can only hide a Project slug that is already bundled in the public site.
  const staticProjectSlugs = new Set(
    staticProjects.map((project) => toCanonicalContentKey(project.slug)),
  );
  const slugs = new Set<string>();
  for (const row of data as unknown[]) {
    if (!row || typeof row !== 'object') continue;
    const slug = (row as { slug?: unknown }).slug;
    if (typeof slug !== 'string') continue;
    const canonicalSlug = toCanonicalContentKey(slug);
    if (canonicalSlug && staticProjectSlugs.has(canonicalSlug)) {
      slugs.add(canonicalSlug);
    }
  }

  return [...slugs];
}

export function mergeProjectsWithPublishedOverlay(
  publishedProjects: ProjectData[],
  archivedProjectSlugs: readonly string[] = [],
): ProjectData[] {
  const fallbackBySlug = new Map(
    staticProjects.map((project) => [toCanonicalContentKey(project.slug), project]),
  );
  const archivedSlugSet = new Set(
    archivedProjectSlugs
      .map((slug) => toCanonicalContentKey(slug))
      .filter(Boolean),
  );
  const visibleStaticProjects = staticProjects.filter(
    (project) => !archivedSlugSet.has(toCanonicalContentKey(project.slug)),
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
      // Gallery and CTA are not represented by the current CMS schema.
      gallery: project.gallery ?? fallback.gallery,
      cta: project.cta ?? fallback.cta,
    };
  });

  return overlayPublishedContent(
    visibleStaticProjects,
    publishedWithFallbackFields,
    (project) => project.slug,
  );
}

class ProjectService {
  static async getAll(): Promise<ProjectData[]> {
    const supabase = await getPublicContentClient();
    if (!supabase) return mergeProjectsWithPublishedOverlay([]);

    const [publishedProjects, archivedProjectSlugs] = await Promise.all([
      getPublishedProjects(supabase),
      getArchivedProjectSlugs(supabase),
    ]);
    return mergeProjectsWithPublishedOverlay(publishedProjects, archivedProjectSlugs);
  }

  static async getBySlug(slug: string): Promise<ProjectData | undefined> {
    const projects = await ProjectService.getAll();
    const canonicalSlug = toCanonicalContentKey(slug);
    return projects.find((project) => toCanonicalContentKey(project.slug) === canonicalSlug);
  }
}

export default ProjectService;
