#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const root = process.cwd();
const args = process.argv.slice(2);
const printJson = args.includes('--json');
const outputPath = getFlagValue('--out');

function getFlagValue(flag) {
    const index = args.indexOf(flag);

    if (index === -1) {
        return null;
    }

    const value = args[index + 1];

    if (!value || value.startsWith('--')) {
        throw new Error(`${flag} requires a file path.`);
    }

    return value;
}

function readJson(relativePath) {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function loadTypeScriptModule(relativePath) {
    const absolutePath = path.join(root, relativePath);
    const source = fs.readFileSync(absolutePath, 'utf8');
    const output = ts.transpileModule(source, {
        compilerOptions: {
            esModuleInterop: true,
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2022,
        },
        fileName: absolutePath,
    }).outputText;

    const module = { exports: {} };
    const sandbox = {
        console,
        exports: module.exports,
        module,
        require(specifier) {
            if (specifier.includes('/types/') || specifier.startsWith('../types/')) {
                return {};
            }
            throw new Error(`Unsupported import while loading ${relativePath}: ${specifier}`);
        },
    };

    vm.runInNewContext(output, sandbox, { filename: absolutePath });
    return module.exports;
}

function finishKeyFromParts(finishId, finishVariantId) {
    return finishVariantId ? `${finishId}__${finishVariantId}` : finishId;
}

function mapPublicStatus(status) {
    if (status === 'active') return 'published';
    if (status === 'tbc') return 'tbc';
    if (status === 'published' || status === 'draft' || status === 'archived') return status;
    return 'draft';
}

function assertUnique(rows, keySelector, label, blockers) {
    const seen = new Set();

    for (const row of rows) {
        const key = keySelector(row);
        if (seen.has(key)) {
            blockers.push(`Duplicate ${label}: ${key}`);
        }
        seen.add(key);
    }
}

function inferMediaType(url) {
    const ext = path.extname(url.split('?')[0]).toLowerCase();

    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) return 'image';
    if (['.mp4', '.webm', '.mov'].includes(ext)) return 'video';
    if (['.pdf'].includes(ext)) return 'document';
    return 'other';
}

function publicFileExists(url) {
    if (!url || /^https?:\/\//i.test(url)) return true;
    if (!url.startsWith('/')) return false;

    return fs.existsSync(path.join(root, 'public', url.slice(1)));
}

function compactObject(value) {
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null));
}

function writeOutputArtifact(relativePath, payload) {
    const absolutePath = path.resolve(root, relativePath);

    if (!absolutePath.startsWith(`${root}${path.sep}`)) {
        throw new Error(`Refusing to write outside the repository: ${relativePath}`);
    }

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, `${JSON.stringify(payload, null, 2)}\n`);
    return path.relative(root, absolutePath);
}

const blockers = [];
const warnings = [];
const mediaCandidates = new Map();

function addMediaCandidate(url, usage, alt) {
    if (!url) return null;

    const existing = mediaCandidates.get(url);
    if (existing) {
        existing.usage.push(usage);
        if (!existing.alt && alt) existing.alt = alt;
        return url;
    }

    const exists = publicFileExists(url);
    const candidate = {
        source_url: url,
        source_kind: 'external_legacy',
        media_type: inferMediaType(url),
        alt: alt || null,
        usage: [usage],
        local_file_exists: exists,
    };

    mediaCandidates.set(url, candidate);

    if (!exists) {
        blockers.push(`Missing local media for ${usage}: ${url}`);
    }

    return url;
}

const stoneLibrary = readJson('data/clean/stone_library.json');
const articles = readJson('public/articles/index.json');
const { projects } = loadTypeScriptModule('src/data/projectData.ts');
const { products } = loadTypeScriptModule('src/data/productData.ts');

const finishKeys = new Set(stoneLibrary.finishes.map((finish) => finishKeyFromParts(finish.finishId, finish.finishVariantId)));
const stoneGroupKeys = new Set(stoneLibrary.stones.map((stone) => stone.stoneGroupId));

const stoneGroups = stoneLibrary.stones.map((stone, index) => ({
    stone_group_key: stone.stoneGroupId,
    display_name: stone.displayName,
    source_name: stone.sourceName,
    status: mapPublicStatus(stone.status),
    stone_type_source: stone.type?.source ?? null,
    stone_type_display: stone.type?.display ?? null,
    origin_region: stone.origin?.regionDisplay ?? null,
    origin_country: stone.origin?.countryDisplay ?? null,
    price_source: stone.price?.source ?? null,
    price_tier: stone.price?.tier ?? null,
    raw_block_length_mm: stone.rawBlock?.lengthMm ?? null,
    raw_block_width_mm: stone.rawBlock?.widthMm ?? null,
    raw_block_height_mm: stone.rawBlock?.heightMm ?? null,
    sort_order: index,
}));

const stoneVariants = [];
const stoneFinishCapabilities = [];

for (const stone of stoneLibrary.stones) {
    for (const variant of stone.variants ?? []) {
        stoneVariants.push({
            stone_group_key: stone.stoneGroupId,
            variant_key: variant.stoneVariantId,
            display_name: variant.displayVariant ?? null,
            source_variant: variant.sourceVariant ?? null,
            variant_type: variant.variantType ?? 'none',
            status: mapPublicStatus(variant.status),
            sort_order: variant.sortOrder ?? 0,
        });

        for (const capability of variant.finishCapabilities ?? []) {
            const finish_key = finishKeyFromParts(capability.finishId, capability.finishVariantId);
            if (!finishKeys.has(finish_key)) {
                blockers.push(`Unknown finish definition ${finish_key} on ${stone.stoneGroupId}/${variant.stoneVariantId}`);
            }

            stoneFinishCapabilities.push({
                stone_group_key: stone.stoneGroupId,
                stone_variant_key: variant.stoneVariantId,
                finish_key,
                capability: capability.capability,
                sources: capability.sources ?? [],
            });
        }
    }
}

const productRows = [];
const productModels = [];
const productMaterialDefaults = [];
const productSpecs = [];

products.forEach((product, productIndex) => {
    productRows.push({
        slug: product.slug,
        name: product.name,
        status: 'draft',
        short_description: product.shortDesc,
        sort_order: productIndex,
    });

    (product.models ?? []).forEach((model, modelIndex) => {
        addMediaCandidate(model.img, `product model ${product.slug}/${model.key}`, `${product.name} ${model.label}`);
        productModels.push({
            product_slug: product.slug,
            model_key: model.key,
            label: model.label,
            image_source_url: model.img,
            status: 'draft',
            sort_order: modelIndex,
        });
    });

    Object.entries(product.defaultMaterials ?? {}).forEach(([materialCategory, materialSlug]) => {
        productMaterialDefaults.push({
            product_slug: product.slug,
            material_category: materialCategory,
            stone_group_key: stoneGroupKeys.has(materialSlug) ? materialSlug : null,
            material_slug: stoneGroupKeys.has(materialSlug) ? null : materialSlug,
            display_label: materialSlug,
        });
    });

    Object.entries(product.specs ?? {}).forEach(([specLabel, specValue], specIndex) => {
        productSpecs.push({
            product_slug: product.slug,
            spec_label: specLabel,
            spec_value: specValue,
            sort_order: specIndex,
        });
    });
});

const projectRows = [];
const projectFacts = [];
const projectMedia = [];
const projectMaterials = [];
const projectMaterialMaps = [];
const projectHotspots = [];

projects.forEach((project, projectIndex) => {
    const details = project.details ?? {};

    addMediaCandidate(project.listing?.cover, `project cover ${project.slug}`, `${project.name} cover`);
    addMediaCandidate(project.hero?.image, `project hero ${project.slug}`, project.hero?.alt);

    projectRows.push(compactObject({
        slug: project.slug,
        title: project.name,
        status: 'draft',
        location: project.listing?.location ?? null,
        project_date_label: project.listing?.date ?? details.Date ?? null,
        summary: project.listing?.summary ?? null,
        lead: project.lead ?? null,
        client: typeof details.Client === 'string' ? details.Client : null,
        landscape_architect: typeof details['Landscape Architect'] === 'string' ? details['Landscape Architect'] : null,
        contractor: typeof details.Contractor === 'string' ? details.Contractor : null,
        address: typeof details.Address === 'string' ? details.Address : null,
        quantity_label: typeof details.Quantity === 'string' ? details.Quantity : null,
        carbon_status: String(details['Carbon Offset'] ?? '').toLowerCase() === 'yes' ? 'yes' : 'not_available',
        claim_review_status: 'needs_review',
        cover_source_url: project.listing?.cover ?? null,
        hero_source_url: project.hero?.image ?? null,
        sort_order: projectIndex,
    }));

    Object.entries(details).forEach(([factLabel, factValue], factIndex) => {
        projectFacts.push({
            project_slug: project.slug,
            fact_label: factLabel,
            fact_value: Array.isArray(factValue) ? null : String(factValue),
            fact_value_json: Array.isArray(factValue) ? factValue : null,
            claim_status: 'needs_review',
            sort_order: factIndex,
        });
    });

    (project.images ?? []).forEach((image, imageIndex) => {
        addMediaCandidate(image, `project gallery source ${project.slug}/${imageIndex + 1}`, `${project.name} image ${imageIndex + 1}`);
        projectMedia.push({
            project_slug: project.slug,
            media_role: 'gallery',
            source_url: image,
            sort_order: imageIndex,
            status: 'draft',
        });
    });

    (project.gallery ?? []).forEach((image, imageIndex) => {
        addMediaCandidate(image.src, `project gallery ${project.slug}/${image.label}`, image.alt);
        projectMedia.push({
            project_slug: project.slug,
            media_role: 'gallery',
            source_url: image.src,
            label: image.label,
            caption: image.caption,
            sort_order: imageIndex,
            status: 'draft',
        });
    });

    (project.materials ?? []).forEach((material, materialIndex) => {
        if (!stoneGroupKeys.has(material.stoneGroupId)) {
            blockers.push(`Unknown project material stone ${material.stoneGroupId} on ${project.slug}`);
        }
        if (!finishKeys.has(material.finishKey)) {
            blockers.push(`Unknown project material finish ${material.finishKey} on ${project.slug}`);
        }
        addMediaCandidate(material.image, `project material ${project.slug}/${material.application}`, material.imageAlt);
        projectMaterials.push({
            project_slug: project.slug,
            stone_group_key: material.stoneGroupId,
            finish_key: material.finishKey,
            application: material.application,
            note: material.note,
            media_source_url: material.image ?? null,
            claim_status: 'needs_review',
            sort_order: materialIndex,
        });
    });

    if (project.materialMap) {
        addMediaCandidate(project.materialMap.image, `project material map ${project.slug}`, project.materialMap.imageAlt);
        projectMaterialMaps.push({
            project_slug: project.slug,
            map_key: `${project.slug}-material-map`,
            media_source_url: project.materialMap.image,
            title: project.materialMap.title,
            intro: project.materialMap.intro,
            sort_order: 0,
            status: 'draft',
        });

        (project.materialMap.hotspots ?? []).forEach((hotspot, hotspotIndex) => {
            if (!stoneGroupKeys.has(hotspot.stoneGroupId)) {
                blockers.push(`Unknown hotspot stone ${hotspot.stoneGroupId} on ${project.slug}/${hotspot.id}`);
            }
            if (!finishKeys.has(hotspot.finishKey)) {
                blockers.push(`Unknown hotspot finish ${hotspot.finishKey} on ${project.slug}/${hotspot.id}`);
            }
            addMediaCandidate(hotspot.image, `project hotspot ${project.slug}/${hotspot.id}`, hotspot.imageAlt);
            projectHotspots.push({
                project_slug: project.slug,
                map_key: `${project.slug}-material-map`,
                hotspot_key: hotspot.id,
                stone_group_key: hotspot.stoneGroupId,
                finish_key: hotspot.finishKey,
                x_percent: hotspot.x,
                y_percent: hotspot.y,
                application: hotspot.application,
                note: hotspot.note,
                preview_source_url: hotspot.image ?? null,
                sort_order: hotspotIndex,
                status: 'draft',
            });
        });
    }
});

const articleRows = [];
const articleBlocks = [];

articles.forEach((article, articleIndex) => {
    const sourceSlug = article.sourceSlug || article.slug;
    const sourcePath = `/articles/${sourceSlug}/content.html`;
    const absoluteSourcePath = path.join(root, 'public', sourcePath.slice(1));

    if (!fs.existsSync(absoluteSourcePath)) {
        blockers.push(`Missing article source HTML for ${article.slug}: ${sourcePath}`);
    }

    addMediaCandidate(article.cover, `article cover ${article.slug}`, `${article.title} cover`);
    articleRows.push({
        slug: article.slug,
        title: article.title,
        status: 'draft',
        published_on: article.date,
        author: article.author,
        excerpt: article.excerpt,
        cover_source_url: article.cover,
        tags: article.tags ?? [],
        legacy_source_path: sourcePath,
        sort_order: articleIndex,
    });
    articleBlocks.push({
        article_slug: article.slug,
        block_type: 'rich_text',
        status: 'draft',
        sort_order: 0,
        content: {
            migrationStatus: 'legacy_newsletter_requires_structured_review',
            sourcePath,
        },
    });
});

assertUnique(stoneGroups, (row) => row.stone_group_key, 'stone group key', blockers);
assertUnique(stoneVariants, (row) => `${row.stone_group_key}/${row.variant_key}`, 'stone variant key', blockers);
assertUnique(productRows, (row) => row.slug, 'product slug', blockers);
assertUnique(projectRows, (row) => row.slug, 'project slug', blockers);
assertUnique(articleRows, (row) => row.slug, 'article slug', blockers);

if (projectRows.length === 0) warnings.push('No project rows were prepared.');
if (articleRows.length === 0) warnings.push('No article rows were prepared.');
if (productRows.length === 0) warnings.push('No product rows were prepared.');
if (stoneGroups.length === 0) warnings.push('No stone groups were prepared.');

const payload = {
    source: {
        stoneLibrary: 'data/clean/stone_library.json',
        products: 'src/data/productData.ts',
        projects: 'src/data/projectData.ts',
        articles: 'public/articles/index.json',
    },
    importPolicy: {
        status: 'draft',
        note: 'Dry-run only. Do not apply as published client-approved content without review.',
        mediaSourceKind: 'external_legacy',
    },
    summary: {
        media_assets: mediaCandidates.size,
        stone_groups: stoneGroups.length,
        stone_variants: stoneVariants.length,
        stone_finish_capabilities: stoneFinishCapabilities.length,
        products: productRows.length,
        product_models: productModels.length,
        product_material_defaults: productMaterialDefaults.length,
        product_specs: productSpecs.length,
        projects: projectRows.length,
        project_facts: projectFacts.length,
        project_media: projectMedia.length,
        project_materials: projectMaterials.length,
        project_material_maps: projectMaterialMaps.length,
        project_hotspots: projectHotspots.length,
        articles: articleRows.length,
        article_blocks: articleBlocks.length,
        warnings: warnings.length,
        blockers: blockers.length,
    },
    rows: {
        media_assets: [...mediaCandidates.values()],
        stone_groups: stoneGroups,
        stone_variants: stoneVariants,
        stone_finish_capabilities: stoneFinishCapabilities,
        products: productRows,
        product_models: productModels,
        product_material_defaults: productMaterialDefaults,
        product_specs: productSpecs,
        projects: projectRows,
        project_facts: projectFacts,
        project_media: projectMedia,
        project_materials: projectMaterials,
        project_material_maps: projectMaterialMaps,
        project_hotspots: projectHotspots,
        articles: articleRows,
        article_blocks: articleBlocks,
    },
    warnings,
    blockers,
};

if (outputPath) {
    const writtenPath = writeOutputArtifact(outputPath, payload);
    console.log(`wrote content import artifact: ${writtenPath}`);
}

if (printJson) {
    console.log(JSON.stringify(payload, null, 2));
} else {
    console.log('Supabase content import readiness');
    console.log(`- media_assets candidates: ${payload.rows.media_assets.length}`);
    console.log(`- stone_groups: ${stoneGroups.length}`);
    console.log(`- stone_variants: ${stoneVariants.length}`);
    console.log(`- stone_finish_capabilities: ${stoneFinishCapabilities.length}`);
    console.log(`- products: ${productRows.length}`);
    console.log(`- product_models: ${productModels.length}`);
    console.log(`- product_material_defaults: ${productMaterialDefaults.length}`);
    console.log(`- product_specs: ${productSpecs.length}`);
    console.log(`- projects: ${projectRows.length}`);
    console.log(`- project_facts: ${projectFacts.length}`);
    console.log(`- project_materials: ${projectMaterials.length}`);
    console.log(`- project_material_maps: ${projectMaterialMaps.length}`);
    console.log(`- project_hotspots: ${projectHotspots.length}`);
    console.log(`- articles: ${articleRows.length}`);
    console.log(`- article_blocks: ${articleBlocks.length}`);
    console.log(`- warnings: ${warnings.length}`);
    console.log(`- blockers: ${blockers.length}`);

    for (const warning of warnings) {
        console.log(`warning: ${warning}`);
    }

    for (const blocker of blockers) {
        console.log(`blocker: ${blocker}`);
    }
}

if (blockers.length > 0) {
    process.exit(1);
}
