import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const args = process.argv.slice(2);
const arg = (name, fallback) =>
  args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const snapshotPath = arg(
  '--snapshot',
  '.tmp/stone-library-before/content-snapshot.json',
);
const importPath = arg(
  '--baseline',
  '.tmp/stone-library-before/static-import.json',
);
const output = arg('--out', 'docs/agent/stone-library-adoption-plan.json');
const before = JSON.parse(await readFile(snapshotPath, 'utf8'));
const baseline = JSON.parse(await readFile(importPath, 'utf8'));
const raw = JSON.parse(await readFile('data/clean/stone_library.json', 'utf8'));
const sha = (value) =>
  createHash('sha256')
    .update(
      typeof value === 'string' || Buffer.isBuffer(value)
        ? value
        : JSON.stringify(value),
    )
    .digest('hex');
const expectedKeys = [
  'alpine-white',
  'angola-black',
  'blueocean',
  'golden-crust',
  'harcourt',
  'honey-comb',
  'ivory-sand',
  'juparana',
  'new-grey',
  'tan-brown',
  'tuscany',
  'zen-grey',
];
if (
  raw.stones
    .map((s) => s.stoneGroupId)
    .sort()
    .join() !== expectedKeys.sort().join()
)
  throw new Error(
    'The reviewed twelve-stone baseline changed. Review the scope before planning.',
  );
const photos = [];
for (const image of baseline.rows.stone_finish_images) {
  const source = image.media_source_url;
  const filename = source.startsWith('/')
    ? path.join('public', source)
    : source;
  const bytes = await readFile(filename);
  const sourceMedia = baseline.rows.media_assets.find(
    (m) => m.source_url === source,
  );
  photos.push({
    key: sha(source).slice(0, 24),
    sourceFile: filename,
    sha256: sha(bytes),
    sizeBytes: bytes.length,
    alt: sourceMedia?.alt || '',
    mimeType: /\.png$/i.test(filename)
      ? 'image/png'
      : /\.webp$/i.test(filename)
        ? 'image/webp'
        : 'image/jpeg',
  });
}
const stones = raw.stones.map((stone) => {
  const existing = before.stone_groups.find(
    (g) => g.stone_group_key === stone.stoneGroupId,
  );
  if (!existing)
    throw new Error(`Missing original stone ID: ${stone.stoneGroupId}`);
  const beforeVariants = before.stone_variants.filter(
    (v) => v.stone_group_id === existing.id,
  );
  const variants = stone.variants.map((variant) => {
    const match = beforeVariants.find(
      (v) => v.variant_key === variant.stoneVariantId,
    );
    if (!match)
      throw new Error(`Missing original variant ID: ${variant.stoneVariantId}`);
    return {
      key: `variant-${match.id}`,
      id: match.id,
      slug: variant.stoneVariantId,
      label: variant.displayVariant || '',
      type:
        variant.variantType === 'none'
          ? 'none'
          : variant.variantType === 'cut_orientation'
            ? 'cut_orientation'
            : 'shade',
      enabled: true,
      finishes: before.finish_definitions
        .filter((f) => f.status === 'published')
        .map((f) => {
          const capability = variant.finishCapabilities.find(
            (c) =>
              (c.finishVariantId
                ? `${c.finishId}__${c.finishVariantId}`
                : c.finishId) === f.finish_key,
          );
          const links = baseline.rows.stone_finish_images.filter(
            (i) =>
              i.stone_variant_key === variant.stoneVariantId &&
              i.finish_key === f.finish_key,
          );
          const images = links.map((link, index) => {
            const old = before.stone_finish_images.find(
              (i) =>
                i.stone_group_id === existing.id &&
                i.stone_variant_id === match.id &&
                i.finish_definition_id === f.id &&
                i.image_role === link.image_role &&
                i.sort_order === link.sort_order,
            );
            return {
              key: old
                ? `image-${old.id}`
                : `adopt-${match.id}-${f.id}-${index}`,
              id: old?.id || null,
              mediaAssetId: null,
              photoKey: sha(link.media_source_url).slice(0, 24),
              role: link.image_role,
            };
          });
          return {
            definitionId: f.id,
            capability: capability?.capability || 'no',
            behaviorNote: '',
            sources: capability?.sources || [],
            internalNote: '',
            images,
          };
        }),
    };
  });
  const draft = {
    schemaVersion: 1,
    stone: {
      id: existing.id,
      slug: stone.stoneGroupId,
      name: stone.displayName,
      type: stone.type.display,
      availability: stone.status,
      summary: '',
      sourceName: stone.sourceName || '',
      originRegion: stone.origin.regionDisplay || '',
      originCountry: stone.origin.countryDisplay || '',
      pricingNote: stone.price.source || '',
      priceTier: stone.price.tier || null,
      blockLength: stone.rawBlock.lengthMm || null,
      blockWidth: stone.rawBlock.widthMm || null,
      blockHeight: stone.rawBlock.heightMm || null,
      internalNote: '',
      cutOptions: stone.cutOptions || [],
    },
    variants,
  };
  const imageCount = variants.reduce(
    (n, v) => n + v.finishes.reduce((n, f) => n + f.images.length, 0),
    0,
  );
  const oldCaps = before.stone_finish_capabilities.filter((c) =>
    beforeVariants.some((v) => v.id === c.stone_variant_id),
  );
  const removedVariants = beforeVariants.filter(
    (v) => !variants.some((d) => d.id === v.id),
  );
  return {
    id: existing.id,
    key: stone.stoneGroupId,
    action: 'adopt_public_baseline',
    oldStatus: existing.status,
    oldName: existing.display_name,
    newName: stone.displayName,
    availability: stone.status,
    imageCount,
    preserveVariantIds: variants.map((v) => v.id),
    retireVariantIds: removedVariants.map((v) => v.id),
    original: {
      stone: existing,
      variants: beforeVariants,
      capabilities: oldCaps,
      images: before.stone_finish_images.filter(
        (i) => i.stone_group_id === existing.id,
      ),
    },
    changes: {
      name: existing.display_name !== stone.displayName,
      summary: existing.summary
        ? {
            before: existing.summary,
            after: '',
            reason:
              'Current public baseline has no custom introduction; preserve old text in history.',
          }
        : null,
      missingImages: variants.flatMap((v) =>
        v.finishes
          .filter((f) => f.capability !== 'no' && !f.images.length)
          .map((f) => ({
            variant: v.slug,
            finish: before.finish_definitions.find(
              (d) => d.id === f.definitionId,
            )?.finish_key,
          })),
      ),
      reviewRule:
        'Existing unpublished details remain in the before snapshot. Only the current public baseline is adopted; missing photography and TBC capability stay unconfirmed.',
    },
    draft,
  };
});
const testKeys = [
  'admin-live-1780496442071-f27c2b7d',
  'admin-live-1780496690772-b8a47213',
  'admin-live-1780497462544-23b1d5e3',
];
const historical = before.stone_groups
  .filter(
    (g) =>
      testKeys.includes(g.stone_group_key) ||
      g.stone_group_key === 'steel-blue',
  )
  .map((g) => ({
    id: g.id,
    key: g.stone_group_key,
    oldStatus: g.status,
    action: g.status === 'archived' ? 'retain_history' : 'archive',
    reason:
      g.stone_group_key === 'steel-blue'
        ? 'Retired stone outside the current twelve-stone website baseline.'
        : 'Exact tagged admin verification identifier; test metadata recorded in original snapshot.',
    original: g,
  }));
historical.sort((a, b) => a.id - b.id);
const preserved = {
  products: before.products
    .filter((p) => p.status !== 'archived')
    .map(({ id, slug, status }) => ({ id, slug, status })),
  articles: before.articles
    .filter((p) => p.status !== 'archived')
    .map(({ id, slug, status }) => ({ id, slug, status })),
  projects: before.projects.map(({ id, slug, status }) => ({
    id,
    slug,
    status,
  })),
  imageQr: {
    count: before.image_qr_resources.length,
    sha256: sha(before.image_qr_resources),
  },
  rule: 'No product, article, project, lead, or Image QR publication, rename, deletion, or media replacement is included.',
};
const plan = {
  schemaVersion: 1,
  mode: 'review_only',
  snapshotCapturedAt: before.captured_at,
  snapshotSha256: sha(before),
  baselineSha256: sha(baseline.rows),
  approvalRequired: true,
  rollout: [
    'Apply expand migration after approval; keep Stone editing frozen through adoption.',
    'Deploy branch Preview; verify real login and no-write catalogue/API against the expanded database.',
    'After approved content writes: privately upload the 55 reviewed photographs, save and publish each exact baseline draft through the protected endpoint; archive IDs 1 and 13.',
    'Verify catalogue, private draft boundaries, referenced pages and unchanged preserved modules.',
    'Promote verified runtime, apply the direct-write lockdown, then run production-bound smoke and approved tagged workflows.',
  ],
  stones,
  historical,
  photos,
  preserved,
};
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(plan, null, 2) + '\n');
console.log(
  JSON.stringify(
    {
      mode: plan.mode,
      output,
      stones: stones.length,
      photos: photos.length,
      historical: historical.map(({ id, action }) => ({ id, action })),
      productionWrites: 0,
    },
    null,
    2,
  ),
);
