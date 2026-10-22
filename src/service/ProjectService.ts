import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '../types/database.ts';
import {
  projects as staticProjects,
  type ProjectData,
  type ProjectHotspot,
  type ProjectMaterial,
  type ProjectMaterialMap,
} from '../data/projectData.ts';
import { blockMediaAssetIds, blockStoneGroupIds, isContentBlockType, type ContentBlockType } from '../features/blocks/schema.ts';
import { resolveBlockView, toBlockImageSize } from '../features/blocks/resolve.ts';
import { blockViewImageUrls, type ContentBlockView } from '../features/blocks/view.ts';
import { getPublicContentClient } from '../lib/publicContentClient.ts';
import { parsePublicEntitySeo } from '../lib/publicEntitySeo.ts';
import { normalizePublicProjectFactValue } from '../lib/projectFactValue.ts';
import { resolvePublicMediaUrl, type PublicMediaLocation } from '../lib/publicMediaUrl.ts';
import { overlayPublishedContent, toCanonicalContentKey } from './publicContentOverlay.ts';

type MediaRef = PublicMediaLocation & { alt: string | null; width_px?: number | null; height_px?: number | null };
type Relation<T> = T | T[] | null;
type PublicClient = SupabaseClient<Database>;

type ProjectRow = Pick<
  Tables<'projects'>,
  | 'id'
  | 'slug'
  | 'title'
  | 'location'
  | 'project_date_label'
  | 'completed_on'
  | 'summary'
  | 'lead'
  | 'client'
  | 'landscape_architect'
  | 'contractor'
  | 'address'
  | 'quantity_label'
  | 'carbon_status'
  | 'carbon_note'
  | 'seo'
  | 'sort_order'
> & {
  cover_media?: Relation<MediaRef>;
  hero_media?: Relation<MediaRef>;
};

type ProjectFactRow = Pick<
  Tables<'project_facts'>,
  'fact_label' | 'fact_value' | 'fact_value_json' | 'sort_order' | 'status'
>;

type ProjectBlockRow = Pick<
  Tables<'project_blocks'>,
  | 'id'
  | 'block_type'
  | 'content'
  | 'project_material_map_id'
  | 'sort_order'
> & {
  media_assets?: Relation<MediaRef>;
};

/** Media and Stone Library keys referenced inside block content, read once per collection. */
interface BlockReferences {
  mediaById: ReadonlyMap<number, MediaRef>;
  stoneKeyById: ReadonlyMap<number, string>;
}

const emptyBlockReferences: BlockReferences = { mediaById: new Map(), stoneKeyById: new Map() };

type ProjectMaterialRow = Pick<
  Tables<'project_materials'>,
  'id' | 'application' | 'note' | 'sort_order' | 'status'
> & {
  stone_groups?: Relation<Pick<Tables<'stone_groups'>, 'stone_group_key'>>;
  stone_variants?: Relation<Pick<Tables<'stone_variants'>, 'variant_key'>>;
  finish_definitions?: Relation<Pick<Tables<'finish_definitions'>, 'finish_key'>>;
};

type ProjectMaterialMapRow = Pick<
  Tables<'project_material_maps'>,
  'id' | 'title' | 'intro' | 'sort_order' | 'status'
> & {
  media_assets?: Relation<MediaRef>;
};

type ProjectHotspotRow = Pick<
  Tables<'project_hotspots'>,
  | 'project_material_map_id'
  | 'project_material_id'
  | 'hotspot_key'
  | 'x_percent'
  | 'y_percent'
  | 'label'
  | 'application'
  | 'note'
  | 'sort_order'
  | 'status'
>;

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
): ProjectMaterial | null {
  const stone = firstRelation(row.stone_groups);
  const finish = firstRelation(row.finish_definitions);
  if (!stone?.stone_group_key || !finish?.finish_key) return null;

  const variant = firstRelation(row.stone_variants);

  return {
    stoneGroupId: stone.stone_group_key,
    stoneVariantId: variant?.variant_key,
    finishKey: finish.finish_key,
    application: row.application,
    note: row.note || '',
  };
}

function mapProjectHotspot(
  row: ProjectHotspotRow,
  materialRowsById: Map<number, ProjectMaterialRow>,
): ProjectHotspot | null {
  if (!row.project_material_id) return null;

  const material = materialRowsById.get(row.project_material_id);
  const stone = firstRelation(material?.stone_groups);
  const finish = firstRelation(material?.finish_definitions);
  if (!material || !stone?.stone_group_key || !finish?.finish_key) return null;

  const variant = firstRelation(material.stone_variants);

  return {
    id: row.hotspot_key,
    x: Number(row.x_percent),
    y: Number(row.y_percent),
    description: row.note || undefined,
    stoneGroupId: stone.stone_group_key,
    stoneVariantId: variant?.variant_key,
    finishKey: finish.finish_key,
    application: row.application || material.application,
    note: row.note || material.note || '',
  };
}

function mapProjectMaterialMap(
  row: ProjectMaterialMapRow,
  hotspots: ProjectHotspotRow[],
  materialRowsById: Map<number, ProjectMaterialRow>,
  supabase: PublicClient,
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
      .map((hotspot) => mapProjectHotspot(hotspot, materialRowsById))
      .filter((hotspot): hotspot is ProjectHotspot => Boolean(hotspot)),
  };
}

/** Public block ID: a block copied from a former media row keeps that row's anchor. */
function publicBlockId(slug: string, row: ProjectBlockRow): string {
  const content = row.content as { legacyProjectMediaId?: unknown } | null;
  const legacyId = content && typeof content === 'object' ? content.legacyProjectMediaId : undefined;
  return typeof legacyId === 'number' && Number.isSafeInteger(legacyId) && legacyId > 0
    ? `${slug}-media-${legacyId}`
    : `${slug}-block-${row.id}`;
}

function mapProjectRow(
  row: ProjectRow,
  supabase: PublicClient,
  facts: ProjectFactRow[] = [],
  blockRows: ProjectBlockRow[] = [],
  materials: ProjectMaterialRow[] = [],
  materialMaps: ProjectMaterialMapRow[] = [],
  hotspots: ProjectHotspotRow[] = [],
  references: BlockReferences = emptyBlockReferences,
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
    .map((material) => mapProjectMaterial(material))
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
  const blocks: ContentBlockView[] = [];
  const resolveContext = {
    fallbackAlt: row.title,
    mediaUrl: (mediaId: number | null | undefined) =>
      resolvePublicMediaUrl(mediaId ? references.mediaById.get(mediaId) ?? null : null, supabase) || '',
    mediaAlt: (mediaId: number | null | undefined) =>
      (mediaId ? references.mediaById.get(mediaId)?.alt : null) || '',
    stoneKey: (stoneGroupId: number) => references.stoneKeyById.get(stoneGroupId) ?? null,
    mediaSize: (mediaId: number | null | undefined) => {
      const media = mediaId ? references.mediaById.get(mediaId) : null;
      return media ? toBlockImageSize(media.width_px, media.height_px) : null;
    },
  };

  for (const entry of blockRows
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))) {
    if (!isContentBlockType(entry.block_type)) continue;
    const id = publicBlockId(row.slug, entry);
    const content = (entry.content ?? {}) as Record<string, unknown>;

    if (entry.block_type === 'hotspot_image') {
      if (!entry.project_material_map_id) continue;
      const linkedMap = materialMapById.get(entry.project_material_map_id);
      if (!linkedMap) continue;

      const entryMedia = firstRelation(entry.media_assets);
      const entryImage = resolvePublicMediaUrl(entryMedia, supabase);
      linkedMaterialMapIds.add(entry.project_material_map_id);
      const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
      blocks.push({
        id,
        type: 'hotspot_image',
        image: entryImage || linkedMap.image,
        imageAlt: entryMedia?.alt || linkedMap.imageAlt,
        title: text(content.title) || linkedMap.title,
        intro: linkedMap.intro || undefined,
        caption: text(content.caption) || undefined,
        hotspots: linkedMap.hotspots,
      });
      continue;
    }

    // A plain image carries its media in the row's own relation; content IDs cover the rest.
    const entryMedia = firstRelation(entry.media_assets);
    const view = resolveBlockView(
      { type: entry.block_type, content },
      id,
      entry.block_type === 'image' && entryMedia
        ? {
            ...resolveContext,
            mediaUrl: () => resolvePublicMediaUrl(entryMedia, supabase) || '',
            mediaAlt: () => entryMedia.alt || '',
            mediaSize: () => toBlockImageSize(entryMedia.width_px, entryMedia.height_px),
          }
        : resolveContext,
    );
    if (view) blocks.push(view);
  }

  for (const entry of mappedMaterialMaps) {
    if (linkedMaterialMapIds.has(entry.row.id)) continue;
    blocks.push({
      id: `${row.slug}-hotspot-${entry.row.id}`,
      type: 'hotspot_image',
      image: entry.value.image,
      imageAlt: entry.value.imageAlt,
      title: entry.value.title,
      intro: entry.value.intro || undefined,
      hotspots: entry.value.hotspots,
    });
  }

  const images = blockViewImageUrls(blocks);

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
    blocks,
  };
}

export async function getPublishedProjects(
  suppliedClient?: PublicClient | null,
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

  const projectRows: ProjectRow[] = data;
  const ids = projectRows.map((row) => row.id);
  const factsByProject = new Map<number, ProjectFactRow[]>();
  const blocksByProject = new Map<number, ProjectBlockRow[]>();
  const materialsByProject = new Map<number, ProjectMaterialRow[]>();
  const materialMapsByProject = new Map<number, ProjectMaterialMapRow[]>();
  const hotspotsByProject = new Map<number, ProjectHotspotRow[]>();

  const [factsResult, blocksResult, materialsResult, materialMapsResult] = await Promise.all([
    supabase
      .from('project_facts')
      .select('project_id, fact_label, fact_value, fact_value_json, sort_order, status')
      .in('project_id', ids)
      .eq('status', 'published')
      .eq('claim_status', 'approved')
      .order('sort_order', { ascending: true }),
    supabase
      .from('project_blocks')
      .select(`
        project_id,
        id,
        block_type,
        content,
        project_material_map_id,
        sort_order,
        media_assets!project_blocks_media_asset_id_fkey (
          status,
          source_kind,
          source_url,
          bucket,
          object_path,
          alt,
          width_px,
          height_px
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
        stone_variants!project_materials_stone_variant_id_fkey (
          variant_key
        ),
        finish_definitions!project_materials_finish_definition_id_fkey (
          finish_key
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
    (blocksResult.error && !isMissingRelationError(blocksResult.error)) ||
    materialsResult.error ||
    materialMapsResult.error
  ) {
    return [];
  }
  // Before the body-block migration is applied the table does not exist: pages keep their
  // facts and materials and simply show no body. Any other failure keeps the static fallback.
  const blockRows = blocksResult.error ? [] : blocksResult.data ?? [];
  const references = await loadBlockReferences(supabase, blockRows);
  if (!references) return [];

  const materialMapRows = materialMapsResult.data ?? [];
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
          preview_media_id
        `)
        .in('project_material_map_id', materialMapIds)
        .eq('status', 'published')
        .order('sort_order', { ascending: true })
    : { data: [], error: null };

  if (hotspotsResult.error) return [];

  for (const fact of factsResult.data ?? []) {
    factsByProject.set(fact.project_id, [...(factsByProject.get(fact.project_id) ?? []), fact]);
  }

  for (const item of blockRows) {
    blocksByProject.set(item.project_id, [...(blocksByProject.get(item.project_id) ?? []), item]);
  }

  for (const material of materialsResult.data ?? []) {
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

  for (const hotspot of hotspotsResult.data ?? []) {
    const projectId = projectIdByMaterialMapId.get(hotspot.project_material_map_id);
    if (!projectId) continue;
    hotspotsByProject.set(projectId, [...(hotspotsByProject.get(projectId) ?? []), hotspot]);
  }

  return projectRows.map((row) =>
    mapProjectRow(
      row,
      supabase,
      factsByProject.get(row.id),
      blocksByProject.get(row.id),
      materialsByProject.get(row.id),
      materialMapsByProject.get(row.id),
      hotspotsByProject.get(row.id),
      references,
    ),
  );
}

function isMissingRelationError(error: { code?: string | null }): boolean {
  return error.code === 'PGRST205' || error.code === '42P01';
}

/**
 * Reads the Published media and Stone Library keys that gallery, steps and stone-card blocks
 * reference by ID. Unpublished references are simply absent (RLS) and render as missing.
 * Returns null when a read fails, so the caller keeps the complete static fallback.
 */
async function loadBlockReferences(
  supabase: PublicClient,
  rows: readonly ProjectBlockRow[],
): Promise<BlockReferences | null> {
  const typed = rows.flatMap((row) =>
    isContentBlockType(row.block_type) ? [{ type: row.block_type as ContentBlockType, content: row.content }] : []);
  const mediaIds = [...new Set(typed.flatMap((block) => (block.type === 'image' ? [] : blockMediaAssetIds(block))))];
  const stoneIds = [...new Set(typed.flatMap((block) => blockStoneGroupIds(block)))];
  const [mediaResult, stoneResult] = await Promise.all([
    mediaIds.length
      ? supabase
          .from('media_assets')
          .select('id,status,source_kind,source_url,bucket,object_path,alt,width_px,height_px')
          .in('id', mediaIds)
          .eq('status', 'published')
      : Promise.resolve({ data: [], error: null }),
    stoneIds.length
      ? supabase.from('stone_groups').select('id,stone_group_key').in('id', stoneIds).eq('status', 'published')
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (mediaResult.error || stoneResult.error) return null;
  return {
    mediaById: new Map((mediaResult.data ?? []).map((media) => [Number(media.id), media as MediaRef])),
    stoneKeyById: new Map((stoneResult.data ?? []).map((stone) => [Number(stone.id), stone.stone_group_key])),
  };
}

// Admin Projects keeps editing in a private draft, so its envelope reports "draft" for a live
// Project that has saved-but-unpublished changes. This reads the website's own visibility rule
// (the public select policy: published and approved) to tell editors which Project addresses
// visitors can open right now. It returns only ids and addresses, never draft content; null
// means the check could not run.
export async function getLiveProjectAddresses(
  client: PublicClient,
): Promise<Map<number, string> | null> {
  const { data, error } = await client
    .from('projects')
    .select('id,slug')
    .eq('status', 'published');
  if (error || !Array.isArray(data)) return null;
  const addresses = new Map<number, string>();
  for (const row of data as unknown[]) {
    const { id, slug } = (row ?? {}) as { id?: unknown; slug?: unknown };
    if (typeof id === 'number' && typeof slug === 'string') addresses.set(id, slug);
  }
  return addresses;
}

export async function getArchivedProjectSlugs(
  suppliedClient?: PublicClient | null,
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

export interface StoneProjectUsage {
  project: ProjectData;
  /** Finishes of this stone used by the project, de-duplicated in first-seen order. */
  finishKeys: string[];
  /** Application copy for this stone in the project, de-duplicated. */
  applications: string[];
  /** First material point showing this stone, for `/projects/:slug?point=` deep links. */
  pointRef: { hotspotId: string; blockId: string } | null;
}

function pushUnique(values: string[], value: string | undefined) {
  const normalized = value?.trim();
  if (normalized && !values.includes(normalized)) values.push(normalized);
}

/**
 * Reverse Stone Library → Project lookup over the merged public collection. Both the
 * material schedule and hotspot-image points count, because static fallback records may
 * only describe a stone in one of them. Keeps the input project order.
 */
export function findStoneProjectUsages(
  projects: readonly ProjectData[],
  stoneGroupId: string,
): StoneProjectUsage[] {
  const stoneKey = toCanonicalContentKey(stoneGroupId);
  if (!stoneKey) return [];
  const matches = (candidate: string | undefined) =>
    Boolean(candidate) && toCanonicalContentKey(candidate as string) === stoneKey;

  return projects.flatMap((project) => {
    const finishKeys: string[] = [];
    const applications: string[] = [];
    let pointRef: StoneProjectUsage['pointRef'] = null;
    let used = false;

    for (const material of project.materials ?? []) {
      if (!matches(material.stoneGroupId)) continue;
      used = true;
      pushUnique(finishKeys, material.finishKey);
      pushUnique(applications, material.application);
    }

    for (const block of project.blocks ?? []) {
      if (block.type !== 'hotspot_image') continue;
      for (const hotspot of block.hotspots) {
        if (!matches(hotspot.stoneGroupId)) continue;
        used = true;
        pushUnique(finishKeys, hotspot.finishKey);
        pushUnique(applications, hotspot.application);
        pointRef ??= { hotspotId: hotspot.id, blockId: block.id };
      }
    }

    return used ? [{ project, finishKeys, applications, pointRef }] : [];
  });
}

async function loadAllProjects(): Promise<ProjectData[]> {
  const supabase = await getPublicContentClient();
  if (!supabase) return mergeProjectsWithPublishedOverlay([]);

  const [publishedProjects, archivedProjectSlugs] = await Promise.all([
    getPublishedProjects(supabase),
    getArchivedProjectSlugs(supabase),
  ]);
  return mergeProjectsWithPublishedOverlay(publishedProjects, archivedProjectSlugs);
}

let allProjectsPending: Promise<ProjectData[]> | null = null;

class ProjectService {
  static async getAll(): Promise<ProjectData[]> {
    // Deduplicate concurrent page requests, never cache a previous publication.
    if (!allProjectsPending) {
      allProjectsPending = loadAllProjects().finally(() => {
        allProjectsPending = null;
      });
    }
    return allProjectsPending;
  }

  static async getProjectsUsingStone(stoneGroupId: string): Promise<StoneProjectUsage[]> {
    try {
      return findStoneProjectUsages(await ProjectService.getAll(), stoneGroupId);
    } catch {
      return [];
    }
  }

  static async getBySlug(slug: string): Promise<ProjectData | undefined> {
    const projects = await ProjectService.getAll();
    const canonicalSlug = toCanonicalContentKey(slug);
    return projects.find((project) => toCanonicalContentKey(project.slug) === canonicalSlug);
  }
}

export default ProjectService;
