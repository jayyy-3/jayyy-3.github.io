#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const root = process.cwd();
const args = process.argv.slice(2);
const printJson = args.includes('--json');
const outputPath = getFlagValue('--out');
const planOutputPath = getFlagValue('--plan-out');
const preflightSqlOutputPath = getFlagValue('--preflight-sql-out');
const applySqlOutputPath = getFlagValue('--apply-sql-out');
const rollbackSqlOutputPath = getFlagValue('--rollback-sql-out');

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

function mapImportStatus() {
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
    if (url.startsWith('data/Product/')) return fs.existsSync(path.join(root, url));
    if (!url.startsWith('/')) return false;

    return fs.existsSync(path.join(root, 'public', url.slice(1)));
}

function compactObject(value) {
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null));
}

function writeTextArtifact(relativePath, content) {
    const absolutePath = path.resolve(root, relativePath);

    if (!absolutePath.startsWith(`${root}${path.sep}`)) {
        throw new Error(`Refusing to write outside the repository: ${relativePath}`);
    }

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content.endsWith('\n') ? content : `${content}\n`);
    return path.relative(root, absolutePath);
}

function writeOutputArtifact(relativePath, payload) {
    return writeTextArtifact(relativePath, JSON.stringify(payload, null, 2));
}

function buildImportPlan(summary) {
    const applyOrder = [
        ['media_assets', summary.media_assets, 'source_url'],
        ['stone_groups', summary.stone_groups, 'stone_group_key'],
        ['stone_variants', summary.stone_variants, 'stone_group_key + variant_key'],
        ['stone_finish_capabilities', summary.stone_finish_capabilities, 'stone_group_key + stone_variant_key + finish_key'],
        ['stone_finish_images', summary.stone_finish_images, 'stone_group_key + stone_variant_key + finish_key + media_source_url + image_role + sort_order'],
        ['products', summary.products, 'slug'],
        ['product_models', summary.product_models, 'product_slug + model_key'],
        ['product_material_defaults', summary.product_material_defaults, 'product_slug + material_category'],
        ['product_specs', summary.product_specs, 'product_slug + spec_label + sort_order'],
        ['projects', summary.projects, 'slug'],
        ['project_facts', summary.project_facts, 'project_slug + fact_label + sort_order'],
        ['project_media', summary.project_media, 'project_slug + source_url + media_role + sort_order'],
        ['project_materials', summary.project_materials, 'project_slug + application + sort_order'],
        ['project_material_maps', summary.project_material_maps, 'project_slug + map_key'],
        ['project_hotspots', summary.project_hotspots, 'project_slug + map_key + hotspot_key'],
        ['articles', summary.articles, 'slug'],
        ['article_blocks', summary.article_blocks, 'article_slug + block_type + sort_order'],
    ].map(([table, count, naturalKey], index) => ({
        step: index + 1,
        table,
        count,
        naturalKey,
    }));

    return {
        safety: [
            'No-write planning artifact only.',
            'All imported content remains draft until Jay approves import scope and publication.',
            'Do not run an apply/import step against production without a fresh backup/export and service-role credential review.',
            'Use reverse dependency order for rollback so child rows are removed before parents.',
        ],
        preflightChecks: [
            'Confirm blockers = 0 and warnings are reviewed.',
            'Confirm target tables are empty or an approved merge strategy exists for every natural key.',
            'Confirm browser-safe admin access and service-role credentials are available in the correct environment.',
            'Confirm media source URLs are controlled launch assets or explicitly accepted legacy references.',
        ],
        applyOrder,
        rollbackOrder: [...applyOrder].reverse().map((item, index) => ({
            step: index + 1,
            table: item.table,
            naturalKey: item.naturalKey,
        })),
        verification: [
            'Compare inserted row counts with this dry-run summary.',
            'Confirm all imported rows have status = draft except seed rows already approved as published.',
            'Run public route smoke tests before switching any public read path from static files to Supabase.',
            'Use /admin content screens to inspect imported drafts before publication.',
        ],
    };
}

function formatImportPlanMarkdown(payload) {
    const plan = payload.importPlan;
    const lines = [
        '# Urblo Content Import Plan',
        '',
        'Generated by `npm run agent:content-import` as a no-write planning artifact.',
        '',
        '## Safety',
        ...plan.safety.map((item) => `- ${item}`),
        '',
        '## Source Summary',
        `- Media candidates: ${payload.summary.media_assets}`,
        `- Stone groups: ${payload.summary.stone_groups}`,
        `- Stone variants: ${payload.summary.stone_variants}`,
        `- Finish capabilities: ${payload.summary.stone_finish_capabilities}`,
        `- Stone finish images: ${payload.summary.stone_finish_images}`,
        `- Products: ${payload.summary.products}`,
        `- Product models: ${payload.summary.product_models}`,
        `- Product material defaults: ${payload.summary.product_material_defaults}`,
        `- Product specs: ${payload.summary.product_specs}`,
        `- Projects: ${payload.summary.projects}`,
        `- Project facts: ${payload.summary.project_facts}`,
        `- Project media rows: ${payload.summary.project_media}`,
        `- Project materials: ${payload.summary.project_materials}`,
        `- Project material maps: ${payload.summary.project_material_maps}`,
        `- Project hotspots: ${payload.summary.project_hotspots}`,
        `- Articles: ${payload.summary.articles}`,
        `- Article blocks: ${payload.summary.article_blocks}`,
        `- Warnings: ${payload.summary.warnings}`,
        `- Blockers: ${payload.summary.blockers}`,
        '',
        '## Preflight Checks',
        ...plan.preflightChecks.map((item) => `- ${item}`),
        '',
        '## Apply Order',
        '| Step | Table | Rows | Natural key |',
        '|---:|---|---:|---|',
        ...plan.applyOrder.map((item) => `| ${item.step} | \`${item.table}\` | ${item.count} | ${item.naturalKey} |`),
        '',
        '## Rollback Order',
        '| Step | Table | Natural key |',
        '|---:|---|---|',
        ...plan.rollbackOrder.map((item) => `| ${item.step} | \`${item.table}\` | ${item.naturalKey} |`),
        '',
        '## Verification',
        ...plan.verification.map((item) => `- ${item}`),
        '',
    ];

    return `${lines.join('\n')}\n`;
}

function sqlString(value) {
    return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlIdentifier(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
}

function formatValues(rows) {
    return rows.map((row) => `    (${row.map(sqlString).join(', ')})`).join(',\n');
}

function formatSqlCteList(ctes, indent = '') {
    return ctes.flatMap((cte, index) => {
        const lines = cte.split('\n');
        const suffix = index === ctes.length - 1 ? '' : ',';
        return lines.map((line, lineIndex) => {
            const cteLine = `${indent}${line}`;
            return lineIndex === lines.length - 1 ? `${cteLine}${suffix}` : cteLine;
        });
    });
}

function buildNaturalKeyConflictCtes(payload) {
    return [
        jsonRecordset(payload.rows.media_assets, 'media_conflict_rows', ['source_url text']),
        jsonRecordset(payload.rows.stone_groups, 'stone_group_conflict_rows', ['stone_group_key text']),
        jsonRecordset(payload.rows.products, 'product_conflict_rows', ['slug text']),
        jsonRecordset(payload.rows.projects, 'project_conflict_rows', ['slug text']),
        jsonRecordset(payload.rows.articles, 'article_conflict_rows', ['slug text']),
    ];
}

function buildNaturalKeyConflictSelectLines() {
    return [
        "  select 'media_assets' as table_name, count(*)::bigint as matching_rows",
        '  from public.media_assets target',
        '  join media_conflict_rows r on target.source_url = r.source_url',
        "  where r.source_url is not null and r.source_url <> ''",
        '  union all',
        "  select 'stone_groups' as table_name, count(*)::bigint as matching_rows",
        '  from public.stone_groups target',
        '  join stone_group_conflict_rows r on target.stone_group_key = r.stone_group_key',
        '  union all',
        "  select 'products' as table_name, count(*)::bigint as matching_rows",
        '  from public.products target',
        '  join product_conflict_rows r on target.slug = r.slug',
        '  union all',
        "  select 'projects' as table_name, count(*)::bigint as matching_rows",
        '  from public.projects target',
        '  join project_conflict_rows r on target.slug = r.slug',
        '  union all',
        "  select 'articles' as table_name, count(*)::bigint as matching_rows",
        '  from public.articles target',
        '  join article_conflict_rows r on target.slug = r.slug',
    ];
}

function buildNaturalKeyConflictReportSql(payload) {
    return [
        'with',
        ...formatSqlCteList(buildNaturalKeyConflictCtes(payload)),
        ', conflicts as (',
        ...buildNaturalKeyConflictSelectLines(),
        ')',
        'select table_name, matching_rows',
        'from conflicts',
        'where matching_rows > 0',
        'order by table_name;',
    ].join('\n');
}

function buildNaturalKeyConflictGuardSql(payload) {
    return [
        '-- Existing target natural-key conflict guard.',
        '-- This makes first-run imports safe by default. Existing matching rows require a separate reviewed merge/upsert approval.',
        "-- Required merge approval gate. Uncomment only after preflight shows matching target rows and Jay approves the merge behavior.",
        "-- set local urblo.import_merge_approved = 'true';",
        '',
        'do $$',
        'declare',
        '  matching_rows bigint;',
        'begin',
        '  with',
        ...formatSqlCteList(buildNaturalKeyConflictCtes(payload), '  '),
        '  , conflicts as (',
        ...buildNaturalKeyConflictSelectLines().map((line) => `  ${line}`),
        '  )',
        '  select coalesce(sum(conflicts.matching_rows), 0)::bigint',
        '  into matching_rows',
        '  from conflicts;',
        '',
        "  if matching_rows > 0 and current_setting('urblo.import_merge_approved', true) is distinct from 'true' then",
        "    raise exception 'Urblo draft import found % existing target natural-key matches. Review preflight and set urblo.import_merge_approved=true only after Jay approves merge/upsert behavior.', matching_rows;",
        '  end if;',
        'end $$;',
        '',
    ].join('\n');
}

function buildPreflightSql(payload) {
    const importTables = payload.importPlan.applyOrder.map((item) => item.table);
    const countTables = ['finish_definitions', 'site_settings', ...importTables];
    const statusTables = [
        'finish_definitions',
        'site_settings',
        'media_assets',
        'stone_groups',
        'stone_variants',
        'stone_finish_images',
        'products',
        'product_models',
        'projects',
        'project_media',
        'project_material_maps',
        'project_hotspots',
        'articles',
        'article_blocks',
    ];
    const expectedRows = payload.importPlan.applyOrder.map((item) => [
        item.table,
        String(item.count),
        item.naturalKey,
    ]);

    const currentCounts = countTables
        .map(
            (table) =>
                `    select ${sqlString(table)} as table_name, count(*)::bigint as current_rows from public.${sqlIdentifier(table)}`,
        )
        .join('\n    union all\n');

    const statusCounts = statusTables
        .map(
            (table) =>
                `    select ${sqlString(table)} as table_name, status::text, count(*)::bigint as rows from public.${sqlIdentifier(table)} group by status`,
        )
        .join('\n    union all\n');

    const tableArray = `array[${countTables.map(sqlString).join(', ')}]`;

    return [
        '-- Urblo content import preflight',
        '-- Generated by npm run agent:content-import as a no-write review artifact.',
        '-- Run manually before any approved import/apply step. This script is read-only.',
        '',
        'begin;',
        'set transaction read only;',
        '',
        '-- Expected dry-run rows compared with current Supabase target counts.',
        'with expected(table_name, dry_run_rows, natural_key) as (',
        `  values\n${formatValues(expectedRows)}`,
        '),',
        'current_counts as (',
        currentCounts,
        ')',
        'select',
        '  e.table_name,',
        '  e.dry_run_rows::bigint as planned_import_rows,',
        '  coalesce(c.current_rows, 0) as current_target_rows,',
        '  e.natural_key',
        'from expected e',
        'left join current_counts c using (table_name)',
        'order by e.table_name;',
        '',
        '-- Seed and import target table counts.',
        'with current_counts as (',
        currentCounts,
        ')',
        'select table_name, current_rows',
        'from current_counts',
        'order by table_name;',
        '',
        '-- Existing target rows matching parent natural keys that would turn the apply step into a merge/upsert.',
        buildNaturalKeyConflictReportSql(payload),
        '',
        '-- Status distribution for public-status tables.',
        'select table_name, status, rows',
        'from (',
        statusCounts,
        ') status_counts',
        'order by table_name, status;',
        '',
        '-- RLS state for seed and import target tables.',
        'select c.relname as table_name, c.relrowsecurity as rls_enabled',
        'from pg_class c',
        'join pg_namespace n on n.oid = c.relnamespace',
        "where n.nspname = 'public'",
        `  and c.relname = any (${tableArray})`,
        'order by c.relname;',
        '',
        '-- Policies for seed and import target tables.',
        'select schemaname, tablename, policyname, cmd, roles, qual, with_check',
        'from pg_policies',
        "where schemaname = 'public'",
        `  and tablename = any (${tableArray})`,
        'order by tablename, policyname;',
        '',
        'rollback;',
        '',
    ].join('\n');
}

function jsonSqlLiteral(value, label) {
    const baseTag = `urblo_${label}_json`;
    let tag = baseTag;
    let suffix = 0;
    const json = JSON.stringify(value);

    while (json.includes(`$${tag}$`)) {
        suffix += 1;
        tag = `${baseTag}_${suffix}`;
    }

    return `$${tag}$${json}$${tag}$::jsonb`;
}

function jsonRecordset(rows, label, columns) {
    return [
        `${label} as (`,
        `  select * from jsonb_to_recordset(${jsonSqlLiteral(rows, label)}) as r(${columns.join(', ')})`,
        ')',
    ].join('\n');
}

function buildDraftImportSql(payload) {
    const mediaRows = payload.rows.media_assets.map((row) => ({
        ...row,
        usage: row.usage ?? [],
    }));

    return [
        '-- Urblo guarded draft content import',
        '-- Generated by npm run agent:content-import as a review artifact.',
        '-- This script is intentionally guarded. It aborts unless the approval setting below is explicitly enabled.',
        '-- It imports rows as draft/private review data only; it does not publish content or delete data.',
        '-- Before use: review .tmp/content-import-preview.json, .tmp/content-import-plan.md, and .tmp/content-import-preflight.sql.',
        '',
        'begin;',
        '',
        "-- Required manual approval gate. Uncomment only after Jay approves the import scope and credentials/environment are verified.",
        "-- set local urblo.import_approved = 'true';",
        '',
        'do $$',
        'begin',
        "  if current_setting('urblo.import_approved', true) is distinct from 'true' then",
        "    raise exception 'Urblo draft import is not approved. Set urblo.import_approved=true inside this transaction after approval.';",
        '  end if;',
        'end $$;',
        '',
        buildNaturalKeyConflictGuardSql(payload),
        '-- Media assets: keyed by source_url. Existing rows are updated in place; missing rows are inserted as draft/external review records.',
        'with',
        jsonRecordset(mediaRows, 'media_rows', [
            'source_url text',
            'source_kind text',
            'media_type text',
            'alt text',
            'usage jsonb',
            'local_file_exists boolean',
        ]),
        ', normalized as (',
        '  select',
        '    source_url,',
        "    coalesce(source_kind, 'external_legacy') as source_kind,",
        "    coalesce(media_type, 'other') as media_type,",
        '    alt,',
        "    concat('Imported draft usage: ', coalesce((select string_agg(value, '; ' order by value) from jsonb_array_elements_text(coalesce(usage, '[]'::jsonb)) as usage_values(value)), 'unmapped')) as usage_notes",
        '  from media_rows',
        '  where source_url is not null and source_url <> \'\'',
        ')',
        'update public.media_assets target',
        'set',
        "  status = 'draft',",
        '  source_kind = normalized.source_kind,',
        '  media_type = normalized.media_type,',
        '  alt = coalesce(target.alt, normalized.alt),',
        '  usage_notes = normalized.usage_notes',
        'from normalized',
        'where target.source_url = normalized.source_url;',
        '',
        'with',
        jsonRecordset(mediaRows, 'media_rows', [
            'source_url text',
            'source_kind text',
            'media_type text',
            'alt text',
            'usage jsonb',
            'local_file_exists boolean',
        ]),
        ', normalized as (',
        '  select',
        '    source_url,',
        "    coalesce(source_kind, 'external_legacy') as source_kind,",
        "    coalesce(media_type, 'other') as media_type,",
        '    alt,',
        "    concat('Imported draft usage: ', coalesce((select string_agg(value, '; ' order by value) from jsonb_array_elements_text(coalesce(usage, '[]'::jsonb)) as usage_values(value)), 'unmapped')) as usage_notes",
        '  from media_rows',
        '  where source_url is not null and source_url <> \'\'',
        ')',
        'insert into public.media_assets (status, source_url, source_kind, media_type, alt, usage_notes)',
        "select 'draft', source_url, source_kind, media_type, alt, usage_notes",
        'from normalized',
        'where not exists (select 1 from public.media_assets existing where existing.source_url = normalized.source_url);',
        '',
        '-- Stone Library groups.',
        'with',
        jsonRecordset(payload.rows.stone_groups, 'stone_group_rows', [
            'stone_group_key text',
            'display_name text',
            'source_name text',
            'status text',
            'stone_type_source text',
            'stone_type_display text',
            'origin_region text',
            'origin_country text',
            'price_source text',
            'price_tier integer',
            'raw_block_length_mm integer',
            'raw_block_width_mm integer',
            'raw_block_height_mm integer',
            'sort_order integer',
        ]),
        'insert into public.stone_groups (stone_group_key, display_name, source_name, status, stone_type_source, stone_type_display, origin_region, origin_country, price_source, price_tier, raw_block_length_mm, raw_block_width_mm, raw_block_height_mm, sort_order)',
        "select stone_group_key, display_name, source_name, 'draft', stone_type_source, stone_type_display, origin_region, origin_country, price_source, price_tier, raw_block_length_mm, raw_block_width_mm, raw_block_height_mm, sort_order",
        'from stone_group_rows',
        'on conflict (stone_group_key) do update set',
        '  display_name = excluded.display_name,',
        '  source_name = excluded.source_name,',
        "  status = 'draft',",
        '  stone_type_source = excluded.stone_type_source,',
        '  stone_type_display = excluded.stone_type_display,',
        '  origin_region = excluded.origin_region,',
        '  origin_country = excluded.origin_country,',
        '  price_source = excluded.price_source,',
        '  price_tier = excluded.price_tier,',
        '  raw_block_length_mm = excluded.raw_block_length_mm,',
        '  raw_block_width_mm = excluded.raw_block_width_mm,',
        '  raw_block_height_mm = excluded.raw_block_height_mm,',
        '  sort_order = excluded.sort_order;',
        '',
        '-- Stone variants.',
        'with',
        jsonRecordset(payload.rows.stone_variants, 'stone_variant_rows', [
            'stone_group_key text',
            'variant_key text',
            'display_name text',
            'source_variant text',
            'variant_type text',
            'status text',
            'sort_order integer',
        ]),
        'insert into public.stone_variants (stone_group_id, variant_key, display_name, source_variant, variant_type, status, sort_order)',
        "select sg.id, r.variant_key, r.display_name, r.source_variant, coalesce(r.variant_type, 'none'), 'draft', r.sort_order",
        'from stone_variant_rows r',
        'join public.stone_groups sg on sg.stone_group_key = r.stone_group_key',
        'on conflict (stone_group_id, variant_key) do update set',
        '  display_name = excluded.display_name,',
        '  source_variant = excluded.source_variant,',
        '  variant_type = excluded.variant_type,',
        "  status = 'draft',",
        '  sort_order = excluded.sort_order;',
        '',
        '-- Stone finish capabilities.',
        'with',
        jsonRecordset(payload.rows.stone_finish_capabilities, 'capability_rows', [
            'stone_group_key text',
            'stone_variant_key text',
            'finish_key text',
            'capability text',
            'sources jsonb',
        ]),
        'insert into public.stone_finish_capabilities (stone_variant_id, finish_definition_id, capability, sources)',
        "select sv.id, fd.id, r.capability, coalesce(array(select jsonb_array_elements_text(coalesce(r.sources, '[]'::jsonb))), '{}'::text[])",
        'from capability_rows r',
        'join public.stone_groups sg on sg.stone_group_key = r.stone_group_key',
        'join public.stone_variants sv on sv.stone_group_id = sg.id and sv.variant_key = r.stone_variant_key',
        'join public.finish_definitions fd on fd.finish_key = r.finish_key',
        'on conflict (stone_variant_id, finish_definition_id) do update set',
        '  capability = excluded.capability,',
        '  sources = excluded.sources;',
        '',
        '-- Stone finish images: linked to imported media assets and kept draft for admin review.',
        'with',
        jsonRecordset(payload.rows.stone_finish_images, 'finish_image_rows', [
            'stone_group_key text',
            'stone_variant_key text',
            'finish_key text',
            'media_source_url text',
            'image_role text',
            'sort_order integer',
            'status text',
        ]),
        'insert into public.stone_finish_images (stone_group_id, stone_variant_id, finish_definition_id, media_asset_id, image_role, sort_order, status)',
        "select sg.id, sv.id, fd.id, m.id, r.image_role, r.sort_order, 'draft'",
        'from finish_image_rows r',
        'join public.stone_groups sg on sg.stone_group_key = r.stone_group_key',
        'join public.stone_variants sv on sv.stone_group_id = sg.id and sv.variant_key = r.stone_variant_key',
        'join public.finish_definitions fd on fd.finish_key = r.finish_key',
        'join public.media_assets m on m.source_url = r.media_source_url',
        'where not exists (',
        '  select 1 from public.stone_finish_images existing',
        '  where existing.stone_group_id = sg.id',
        '    and existing.stone_variant_id = sv.id',
        '    and existing.finish_definition_id = fd.id',
        '    and existing.media_asset_id = m.id',
        '    and existing.image_role = r.image_role',
        '    and existing.sort_order = r.sort_order',
        ');',
        '',
        '-- Products.',
        'with',
        jsonRecordset(payload.rows.products, 'product_rows', [
            'slug text',
            'name text',
            'status text',
            'short_description text',
            'sort_order integer',
        ]),
        'insert into public.products (slug, name, status, short_description, sort_order)',
        "select slug, name, 'draft', short_description, sort_order from product_rows",
        'on conflict (slug) do update set',
        '  name = excluded.name,',
        "  status = 'draft',",
        '  short_description = excluded.short_description,',
        '  sort_order = excluded.sort_order;',
        '',
        '-- Product models.',
        'with',
        jsonRecordset(payload.rows.product_models, 'model_rows', [
            'product_slug text',
            'model_key text',
            'label text',
            'image_source_url text',
            'status text',
            'sort_order integer',
        ]),
        'insert into public.product_models (product_id, model_key, label, image_media_id, status, sort_order)',
        "select p.id, r.model_key, r.label, m.id, 'draft', r.sort_order",
        'from model_rows r',
        'join public.products p on p.slug = r.product_slug',
        'left join public.media_assets m on m.source_url = r.image_source_url',
        'on conflict (product_id, model_key) do update set',
        '  label = excluded.label,',
        '  image_media_id = excluded.image_media_id,',
        "  status = 'draft',",
        '  sort_order = excluded.sort_order;',
        '',
        '-- Product material defaults.',
        'with',
        jsonRecordset(payload.rows.product_material_defaults, 'material_default_rows', [
            'product_slug text',
            'material_category text',
            'stone_group_key text',
            'material_slug text',
            'display_label text',
        ]),
        'insert into public.product_material_defaults (product_id, material_category, stone_group_id, material_slug, display_label)',
        'select p.id, r.material_category, sg.id, r.material_slug, r.display_label',
        'from material_default_rows r',
        'join public.products p on p.slug = r.product_slug',
        'left join public.stone_groups sg on sg.stone_group_key = r.stone_group_key',
        'on conflict (product_id, material_category) do update set',
        '  stone_group_id = excluded.stone_group_id,',
        '  material_slug = excluded.material_slug,',
        '  display_label = excluded.display_label;',
        '',
        '-- Product specs.',
        'with',
        jsonRecordset(payload.rows.product_specs, 'spec_rows', [
            'product_slug text',
            'spec_label text',
            'spec_value text',
            'sort_order integer',
        ]),
        'insert into public.product_specs (product_id, spec_label, spec_value, sort_order)',
        'select p.id, r.spec_label, r.spec_value, r.sort_order',
        'from spec_rows r',
        'join public.products p on p.slug = r.product_slug',
        'where not exists (',
        '  select 1 from public.product_specs existing',
        '  where existing.product_id = p.id and existing.spec_label = r.spec_label and existing.sort_order = r.sort_order',
        ');',
        '',
        '-- Projects.',
        'with',
        jsonRecordset(payload.rows.projects, 'project_rows', [
            'slug text',
            'title text',
            'status text',
            'location text',
            'project_date_label text',
            'summary text',
            'lead text',
            'client text',
            'landscape_architect text',
            'contractor text',
            'address text',
            'quantity_label text',
            'carbon_status text',
            'claim_review_status text',
            'cover_source_url text',
            'hero_source_url text',
            'sort_order integer',
        ]),
        'insert into public.projects (slug, title, status, location, project_date_label, summary, lead, client, landscape_architect, contractor, address, quantity_label, carbon_status, claim_review_status, cover_media_id, hero_media_id, sort_order)',
        "select r.slug, r.title, 'draft', r.location, r.project_date_label, r.summary, r.lead, r.client, r.landscape_architect, r.contractor, r.address, r.quantity_label, r.carbon_status, r.claim_review_status, cover.id, hero.id, r.sort_order",
        'from project_rows r',
        'left join public.media_assets cover on cover.source_url = r.cover_source_url',
        'left join public.media_assets hero on hero.source_url = r.hero_source_url',
        'on conflict (slug) do update set',
        '  title = excluded.title,',
        "  status = 'draft',",
        '  location = excluded.location,',
        '  project_date_label = excluded.project_date_label,',
        '  summary = excluded.summary,',
        '  lead = excluded.lead,',
        '  client = excluded.client,',
        '  landscape_architect = excluded.landscape_architect,',
        '  contractor = excluded.contractor,',
        '  address = excluded.address,',
        '  quantity_label = excluded.quantity_label,',
        '  carbon_status = excluded.carbon_status,',
        '  claim_review_status = excluded.claim_review_status,',
        '  cover_media_id = excluded.cover_media_id,',
        '  hero_media_id = excluded.hero_media_id,',
        '  sort_order = excluded.sort_order;',
        '',
        '-- Project facts.',
        'with',
        jsonRecordset(payload.rows.project_facts, 'fact_rows', [
            'project_slug text',
            'fact_label text',
            'fact_value text',
            'fact_value_json jsonb',
            'claim_status text',
            'sort_order integer',
        ]),
        'insert into public.project_facts (project_id, fact_label, fact_value, fact_value_json, claim_status, sort_order)',
        'select p.id, r.fact_label, r.fact_value, r.fact_value_json, r.claim_status, r.sort_order',
        'from fact_rows r',
        'join public.projects p on p.slug = r.project_slug',
        'where not exists (',
        '  select 1 from public.project_facts existing',
        '  where existing.project_id = p.id and existing.fact_label = r.fact_label and existing.sort_order = r.sort_order',
        ');',
        '',
        '-- Project media.',
        'with',
        jsonRecordset(payload.rows.project_media, 'project_media_rows', [
            'project_slug text',
            'media_role text',
            'source_url text',
            'label text',
            'caption text',
            'sort_order integer',
            'status text',
        ]),
        'insert into public.project_media (project_id, media_asset_id, media_role, label, caption, sort_order, status)',
        "select p.id, m.id, r.media_role, r.label, r.caption, r.sort_order, 'draft'",
        'from project_media_rows r',
        'join public.projects p on p.slug = r.project_slug',
        'join public.media_assets m on m.source_url = r.source_url',
        'where not exists (',
        '  select 1 from public.project_media existing',
        '  where existing.project_id = p.id and existing.media_asset_id = m.id and existing.media_role = r.media_role and existing.sort_order = r.sort_order',
        ');',
        '',
        '-- Project materials.',
        'with',
        jsonRecordset(payload.rows.project_materials, 'project_material_rows', [
            'project_slug text',
            'stone_group_key text',
            'finish_key text',
            'application text',
            'note text',
            'media_source_url text',
            'claim_status text',
            'sort_order integer',
        ]),
        'insert into public.project_materials (project_id, stone_group_id, finish_definition_id, application, note, media_asset_id, claim_status, sort_order)',
        'select p.id, sg.id, fd.id, r.application, r.note, m.id, r.claim_status, r.sort_order',
        'from project_material_rows r',
        'join public.projects p on p.slug = r.project_slug',
        'left join public.stone_groups sg on sg.stone_group_key = r.stone_group_key',
        'left join public.finish_definitions fd on fd.finish_key = r.finish_key',
        'left join public.media_assets m on m.source_url = r.media_source_url',
        'where not exists (',
        '  select 1 from public.project_materials existing',
        '  where existing.project_id = p.id and existing.application = r.application and existing.sort_order = r.sort_order',
        ');',
        '',
        '-- Project material maps.',
        'with',
        jsonRecordset(payload.rows.project_material_maps, 'map_rows', [
            'project_slug text',
            'map_key text',
            'media_source_url text',
            'title text',
            'intro text',
            'sort_order integer',
            'status text',
        ]),
        'insert into public.project_material_maps (project_id, media_asset_id, title, intro, sort_order, status)',
        "select p.id, m.id, r.title, r.intro, r.sort_order, 'draft'",
        'from map_rows r',
        'join public.projects p on p.slug = r.project_slug',
        'join public.media_assets m on m.source_url = r.media_source_url',
        'where not exists (',
        '  select 1 from public.project_material_maps existing',
        '  where existing.project_id = p.id and existing.media_asset_id = m.id and existing.sort_order = r.sort_order',
        ');',
        '',
        '-- Project hotspots.',
        'with',
        jsonRecordset(payload.rows.project_hotspots, 'hotspot_rows', [
            'project_slug text',
            'map_key text',
            'hotspot_key text',
            'stone_group_key text',
            'finish_key text',
            'x_percent numeric',
            'y_percent numeric',
            'application text',
            'note text',
            'preview_source_url text',
            'sort_order integer',
            'status text',
        ]),
        'insert into public.project_hotspots (project_material_map_id, project_material_id, hotspot_key, x_percent, y_percent, label, application, note, preview_media_id, sort_order, status)',
        'select maps.id, materials.id, r.hotspot_key, r.x_percent, r.y_percent, r.application, r.application, r.note, preview.id, r.sort_order, \'draft\'',
        'from hotspot_rows r',
        'join public.projects p on p.slug = r.project_slug',
        'join public.project_material_maps maps on maps.project_id = p.id and maps.sort_order = 0',
        'left join public.stone_groups sg on sg.stone_group_key = r.stone_group_key',
        'left join public.finish_definitions fd on fd.finish_key = r.finish_key',
        'left join public.project_materials materials on materials.project_id = p.id and materials.application = r.application and (materials.stone_group_id = sg.id or sg.id is null) and (materials.finish_definition_id = fd.id or fd.id is null)',
        'left join public.media_assets preview on preview.source_url = r.preview_source_url',
        'on conflict (project_material_map_id, hotspot_key) do update set',
        '  project_material_id = excluded.project_material_id,',
        '  x_percent = excluded.x_percent,',
        '  y_percent = excluded.y_percent,',
        '  label = excluded.label,',
        '  application = excluded.application,',
        '  note = excluded.note,',
        '  preview_media_id = excluded.preview_media_id,',
        '  sort_order = excluded.sort_order,',
        "  status = 'draft';",
        '',
        '-- Articles.',
        'with',
        jsonRecordset(payload.rows.articles, 'article_rows', [
            'slug text',
            'title text',
            'status text',
            'published_on date',
            'author text',
            'excerpt text',
            'cover_source_url text',
            'tags jsonb',
            'legacy_source_path text',
            'sort_order integer',
        ]),
        'insert into public.articles (slug, title, status, published_on, author, excerpt, cover_media_id, tags, legacy_source_path, sort_order)',
        "select r.slug, r.title, 'draft', r.published_on, r.author, r.excerpt, m.id, coalesce(array(select jsonb_array_elements_text(coalesce(r.tags, '[]'::jsonb))), '{}'::text[]), r.legacy_source_path, r.sort_order",
        'from article_rows r',
        'left join public.media_assets m on m.source_url = r.cover_source_url',
        'on conflict (slug) do update set',
        '  title = excluded.title,',
        "  status = 'draft',",
        '  published_on = excluded.published_on,',
        '  author = excluded.author,',
        '  excerpt = excluded.excerpt,',
        '  cover_media_id = excluded.cover_media_id,',
        '  tags = excluded.tags,',
        '  legacy_source_path = excluded.legacy_source_path,',
        '  sort_order = excluded.sort_order;',
        '',
        '-- Article blocks are draft structured extraction rows until legacy newsletter content is reviewed.',
        'with',
        jsonRecordset(payload.rows.article_blocks, 'article_block_rows', [
            'article_slug text',
            'block_type text',
            'status text',
            'sort_order integer',
            'media_source_url text',
            'content jsonb',
        ]),
        'insert into public.article_blocks (article_id, block_type, content, media_asset_id, sort_order, status)',
        "select a.id, r.block_type, r.content, media.id, r.sort_order, 'draft'",
        'from article_block_rows r',
        'join public.articles a on a.slug = r.article_slug',
        'left join public.media_assets media on media.source_url = r.media_source_url',
        'where not exists (',
        '  select 1 from public.article_blocks existing',
        '  where existing.article_id = a.id and existing.block_type = r.block_type and existing.sort_order = r.sort_order',
        ');',
        '',
        '-- Verification summary for the reviewed draft import.',
        'select table_name, rows',
        'from (values',
        ...payload.importPlan.applyOrder.map((item, index) => {
            const suffix = index === payload.importPlan.applyOrder.length - 1 ? '' : ',';
            return `  (${sqlString(item.table)}, ${item.count}::bigint)${suffix}`;
        }),
        ') as planned(table_name, rows)',
        'order by table_name;',
        '',
        'commit;',
        '',
    ].join('\n');
}

function rollbackDeleteStatement({ title, rows, label, columns, deleteLines }) {
    return [
        `-- Rollback ${title}.`,
        'with',
        jsonRecordset(rows, label, columns),
        ', deleted as (',
        ...deleteLines.map((line) => `  ${line}`),
        ')',
        `select ${sqlString(title)} as table_name, count(*)::bigint as removed_rows from deleted;`,
        '',
    ];
}

function buildDraftRollbackSql(payload) {
    const mediaRows = payload.rows.media_assets.map((row) => ({
        ...row,
        usage: row.usage ?? [],
    }));

    const sections = [
        rollbackDeleteStatement({
            title: 'article_blocks',
            rows: payload.rows.article_blocks,
            label: 'article_block_rows',
            columns: [
                'article_slug text',
                'block_type text',
                'status text',
                'sort_order integer',
                'media_source_url text',
                'content jsonb',
            ],
            deleteLines: [
                'delete from public.article_blocks target',
                'using article_block_rows r, public.articles a',
                'where target.article_id = a.id',
                '  and a.slug = r.article_slug',
                '  and target.block_type = r.block_type',
                '  and target.sort_order = r.sort_order',
                "  and target.status = 'draft'",
                'returning target.id',
            ],
        }),
        rollbackDeleteStatement({
            title: 'articles',
            rows: payload.rows.articles,
            label: 'article_rows',
            columns: [
                'slug text',
                'title text',
                'status text',
                'published_on date',
                'author text',
                'excerpt text',
                'cover_source_url text',
                'tags jsonb',
                'legacy_source_path text',
                'sort_order integer',
            ],
            deleteLines: [
                'delete from public.articles target',
                'using article_rows r',
                'where target.slug = r.slug',
                "  and target.status = 'draft'",
                'returning target.id',
            ],
        }),
        rollbackDeleteStatement({
            title: 'project_hotspots',
            rows: payload.rows.project_hotspots,
            label: 'hotspot_rows',
            columns: [
                'project_slug text',
                'map_key text',
                'hotspot_key text',
                'stone_group_key text',
                'finish_key text',
                'x_percent numeric',
                'y_percent numeric',
                'application text',
                'note text',
                'preview_source_url text',
                'sort_order integer',
                'status text',
            ],
            deleteLines: [
                'delete from public.project_hotspots target',
                'using hotspot_rows r, public.projects p, public.project_material_maps maps',
                'where p.slug = r.project_slug',
                '  and maps.project_id = p.id',
                '  and maps.sort_order = 0',
                '  and target.project_material_map_id = maps.id',
                '  and target.hotspot_key = r.hotspot_key',
                "  and target.status = 'draft'",
                'returning target.id',
            ],
        }),
        rollbackDeleteStatement({
            title: 'project_material_maps',
            rows: payload.rows.project_material_maps,
            label: 'map_rows',
            columns: [
                'project_slug text',
                'map_key text',
                'media_source_url text',
                'title text',
                'intro text',
                'sort_order integer',
                'status text',
            ],
            deleteLines: [
                'delete from public.project_material_maps target',
                'using map_rows r, public.projects p, public.media_assets media',
                'where p.slug = r.project_slug',
                '  and target.project_id = p.id',
                '  and media.source_url = r.media_source_url',
                '  and target.media_asset_id = media.id',
                '  and target.sort_order = r.sort_order',
                "  and target.status = 'draft'",
                'returning target.id',
            ],
        }),
        rollbackDeleteStatement({
            title: 'project_materials',
            rows: payload.rows.project_materials,
            label: 'project_material_rows',
            columns: [
                'project_slug text',
                'stone_group_key text',
                'finish_key text',
                'application text',
                'note text',
                'media_source_url text',
                'claim_status text',
                'sort_order integer',
            ],
            deleteLines: [
                'delete from public.project_materials target',
                'using project_material_rows r, public.projects p',
                'where p.slug = r.project_slug',
                '  and p.status = \'draft\'',
                '  and target.project_id = p.id',
                '  and target.application = r.application',
                '  and target.sort_order = r.sort_order',
                'returning target.id',
            ],
        }),
        rollbackDeleteStatement({
            title: 'project_media',
            rows: payload.rows.project_media,
            label: 'project_media_rows',
            columns: [
                'project_slug text',
                'media_role text',
                'source_url text',
                'label text',
                'caption text',
                'sort_order integer',
                'status text',
            ],
            deleteLines: [
                'delete from public.project_media target',
                'using project_media_rows r, public.projects p, public.media_assets media',
                'where p.slug = r.project_slug',
                '  and target.project_id = p.id',
                '  and media.source_url = r.source_url',
                '  and target.media_asset_id = media.id',
                '  and target.media_role = r.media_role',
                '  and target.sort_order = r.sort_order',
                "  and target.status = 'draft'",
                'returning target.id',
            ],
        }),
        rollbackDeleteStatement({
            title: 'project_facts',
            rows: payload.rows.project_facts,
            label: 'fact_rows',
            columns: [
                'project_slug text',
                'fact_label text',
                'fact_value text',
                'fact_value_json jsonb',
                'claim_status text',
                'sort_order integer',
            ],
            deleteLines: [
                'delete from public.project_facts target',
                'using fact_rows r, public.projects p',
                'where p.slug = r.project_slug',
                '  and p.status = \'draft\'',
                '  and target.project_id = p.id',
                '  and target.fact_label = r.fact_label',
                '  and target.sort_order = r.sort_order',
                'returning target.id',
            ],
        }),
        rollbackDeleteStatement({
            title: 'projects',
            rows: payload.rows.projects,
            label: 'project_rows',
            columns: [
                'slug text',
                'title text',
                'status text',
                'location text',
                'project_date_label text',
                'summary text',
                'lead text',
                'client text',
                'landscape_architect text',
                'contractor text',
                'address text',
                'quantity_label text',
                'carbon_status text',
                'claim_review_status text',
                'cover_source_url text',
                'hero_source_url text',
                'sort_order integer',
            ],
            deleteLines: [
                'delete from public.projects target',
                'using project_rows r',
                'where target.slug = r.slug',
                "  and target.status = 'draft'",
                'returning target.id',
            ],
        }),
        rollbackDeleteStatement({
            title: 'product_specs',
            rows: payload.rows.product_specs,
            label: 'spec_rows',
            columns: [
                'product_slug text',
                'spec_label text',
                'spec_value text',
                'sort_order integer',
            ],
            deleteLines: [
                'delete from public.product_specs target',
                'using spec_rows r, public.products p',
                'where p.slug = r.product_slug',
                '  and p.status = \'draft\'',
                '  and target.product_id = p.id',
                '  and target.spec_label = r.spec_label',
                '  and target.sort_order = r.sort_order',
                'returning target.id',
            ],
        }),
        rollbackDeleteStatement({
            title: 'product_material_defaults',
            rows: payload.rows.product_material_defaults,
            label: 'material_default_rows',
            columns: [
                'product_slug text',
                'material_category text',
                'stone_group_key text',
                'material_slug text',
                'display_label text',
            ],
            deleteLines: [
                'delete from public.product_material_defaults target',
                'using material_default_rows r, public.products p',
                'where p.slug = r.product_slug',
                '  and p.status = \'draft\'',
                '  and target.product_id = p.id',
                '  and target.material_category = r.material_category',
                'returning target.id',
            ],
        }),
        rollbackDeleteStatement({
            title: 'product_models',
            rows: payload.rows.product_models,
            label: 'model_rows',
            columns: [
                'product_slug text',
                'model_key text',
                'label text',
                'image_source_url text',
                'status text',
                'sort_order integer',
            ],
            deleteLines: [
                'delete from public.product_models target',
                'using model_rows r, public.products p',
                'where p.slug = r.product_slug',
                '  and target.product_id = p.id',
                '  and target.model_key = r.model_key',
                "  and target.status = 'draft'",
                'returning target.id',
            ],
        }),
        rollbackDeleteStatement({
            title: 'products',
            rows: payload.rows.products,
            label: 'product_rows',
            columns: [
                'slug text',
                'name text',
                'status text',
                'short_description text',
                'sort_order integer',
            ],
            deleteLines: [
                'delete from public.products target',
                'using product_rows r',
                'where target.slug = r.slug',
                "  and target.status = 'draft'",
                'returning target.id',
            ],
        }),
        rollbackDeleteStatement({
            title: 'stone_finish_images',
            rows: payload.rows.stone_finish_images,
            label: 'finish_image_rows',
            columns: [
                'stone_group_key text',
                'stone_variant_key text',
                'finish_key text',
                'media_source_url text',
                'image_role text',
                'sort_order integer',
                'status text',
            ],
            deleteLines: [
                'delete from public.stone_finish_images target',
                'using finish_image_rows r, public.stone_groups sg, public.stone_variants sv, public.finish_definitions fd, public.media_assets media',
                'where sg.stone_group_key = r.stone_group_key',
                '  and sv.stone_group_id = sg.id',
                '  and sv.variant_key = r.stone_variant_key',
                '  and fd.finish_key = r.finish_key',
                '  and media.source_url = r.media_source_url',
                '  and target.stone_group_id = sg.id',
                '  and target.stone_variant_id = sv.id',
                '  and target.finish_definition_id = fd.id',
                '  and target.media_asset_id = media.id',
                '  and target.image_role = r.image_role',
                '  and target.sort_order = r.sort_order',
                "  and target.status = 'draft'",
                'returning target.id',
            ],
        }),
        rollbackDeleteStatement({
            title: 'stone_finish_capabilities',
            rows: payload.rows.stone_finish_capabilities,
            label: 'capability_rows',
            columns: [
                'stone_group_key text',
                'stone_variant_key text',
                'finish_key text',
                'capability text',
                'sources jsonb',
            ],
            deleteLines: [
                'delete from public.stone_finish_capabilities target',
                'using capability_rows r, public.stone_groups sg, public.stone_variants sv, public.finish_definitions fd',
                'where sg.stone_group_key = r.stone_group_key',
                '  and sv.stone_group_id = sg.id',
                '  and sv.variant_key = r.stone_variant_key',
                '  and sv.status = \'draft\'',
                '  and fd.finish_key = r.finish_key',
                '  and target.stone_variant_id = sv.id',
                '  and target.finish_definition_id = fd.id',
                'returning target.id',
            ],
        }),
        rollbackDeleteStatement({
            title: 'stone_variants',
            rows: payload.rows.stone_variants,
            label: 'stone_variant_rows',
            columns: [
                'stone_group_key text',
                'variant_key text',
                'display_name text',
                'source_variant text',
                'variant_type text',
                'status text',
                'sort_order integer',
            ],
            deleteLines: [
                'delete from public.stone_variants target',
                'using stone_variant_rows r, public.stone_groups sg',
                'where sg.stone_group_key = r.stone_group_key',
                '  and target.stone_group_id = sg.id',
                '  and target.variant_key = r.variant_key',
                "  and target.status = 'draft'",
                'returning target.id',
            ],
        }),
        rollbackDeleteStatement({
            title: 'stone_groups',
            rows: payload.rows.stone_groups,
            label: 'stone_group_rows',
            columns: [
                'stone_group_key text',
                'display_name text',
                'source_name text',
                'status text',
                'stone_type_source text',
                'stone_type_display text',
                'origin_region text',
                'origin_country text',
                'price_source text',
                'price_tier integer',
                'raw_block_length_mm integer',
                'raw_block_width_mm integer',
                'raw_block_height_mm integer',
                'sort_order integer',
            ],
            deleteLines: [
                'delete from public.stone_groups target',
                'using stone_group_rows r',
                'where target.stone_group_key = r.stone_group_key',
                "  and target.status = 'draft'",
                'returning target.id',
            ],
        }),
        rollbackDeleteStatement({
            title: 'media_assets',
            rows: mediaRows,
            label: 'media_rows',
            columns: [
                'source_url text',
                'source_kind text',
                'media_type text',
                'alt text',
                'usage jsonb',
                'local_file_exists boolean',
            ],
            deleteLines: [
                'delete from public.media_assets target',
                'using media_rows r',
                'where target.source_url = r.source_url',
                "  and target.status = 'draft'",
                "  and target.source_kind = 'external_legacy'",
                'returning target.id',
            ],
        }),
    ];

    return [
        '-- Urblo guarded draft content import rollback',
        '-- Generated by npm run agent:content-import as a review artifact.',
        '-- This script is intentionally destructive and guarded. It aborts unless the approval setting below is explicitly enabled.',
        '-- It removes matching draft/import rows in reverse dependency order; it does not touch published content.',
        '-- Before use: review .tmp/content-import-preview.json, .tmp/content-import-plan.md, .tmp/content-import-preflight.sql, and .tmp/content-import-apply.sql.',
        '',
        'begin;',
        '',
        "-- Required manual approval gate. Uncomment only after Jay approves rolling back the draft import scope.",
        "-- set local urblo.rollback_approved = 'true';",
        '',
        'do $$',
        'begin',
        "  if current_setting('urblo.rollback_approved', true) is distinct from 'true' then",
        "    raise exception 'Urblo draft import rollback is not approved. Set urblo.rollback_approved=true inside this transaction after approval.';",
        '  end if;',
        'end $$;',
        '',
        '-- Rollback sections follow the import plan rollback order: child rows first, media rows last.',
        '',
        ...sections.flat(),
        '-- Planned rollback row counts from the reviewed dry run.',
        'select table_name, rows',
        'from (values',
        ...payload.importPlan.rollbackOrder.map((item, index) => {
            const count = payload.importPlan.applyOrder.find((entry) => entry.table === item.table)?.count ?? 0;
            const suffix = index === payload.importPlan.rollbackOrder.length - 1 ? '' : ',';
            return `  (${sqlString(item.table)}, ${count}::bigint)${suffix}`;
        }),
        ') as planned(table_name, rows)',
        'order by table_name;',
        '',
        'commit;',
        '',
    ].join('\n');
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

function loadArticleImageReplacements() {
    const source = fs.readFileSync(path.join(root, 'src/lib/articleMedia.ts'), 'utf8');
    const entries = new Map();
    const matchPattern = /'([^']+)':\s*(null|'([^']+)')/g;
    let match = matchPattern.exec(source);

    while (match) {
        entries.set(match[1], match[2] === 'null' ? null : match[3]);
        match = matchPattern.exec(source);
    }

    return entries;
}

function decodeHtmlEntities(value) {
    const namedEntities = {
        amp: '&',
        apos: "'",
        gt: '>',
        lt: '<',
        nbsp: ' ',
        quot: '"',
    };

    return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, body) => {
        const normalized = body.toLowerCase();

        if (normalized.startsWith('#x')) {
            return String.fromCodePoint(Number.parseInt(normalized.slice(2), 16));
        }

        if (normalized.startsWith('#')) {
            return String.fromCodePoint(Number.parseInt(normalized.slice(1), 10));
        }

        return namedEntities[normalized] ?? entity;
    });
}

function textFromHtml(html) {
    return decodeHtmlEntities(
        html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim(),
    );
}

function getAttributeValue(html, attributeName) {
    const pattern = new RegExp(`${attributeName}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
    const match = pattern.exec(html);
    return match ? decodeHtmlEntities(match[2] ?? match[3] ?? match[4] ?? '') : '';
}

function extractSourceUrl(rawValue) {
    const htmlDecoded = rawValue.replace(/&amp;/g, '&');
    const fragmentIndex = htmlDecoded.indexOf('#https://images.squarespace-cdn.com');

    return fragmentIndex >= 0 ? htmlDecoded.slice(fragmentIndex + 1) : htmlDecoded;
}

function getSquarespaceAssetId(rawValue) {
    const source = extractSourceUrl(rawValue);

    try {
        const url = new URL(source);
        if (url.hostname !== 'images.squarespace-cdn.com') {
            return null;
        }

        const parts = url.pathname.split('/').filter(Boolean);
        const contentIndex = parts.indexOf('content');
        return contentIndex >= 0 ? parts[contentIndex + 2] : null;
    } catch {
        return null;
    }
}

function resolveArticleImageSource(rawSrc, articleImageReplacements) {
    if (!rawSrc || rawSrc.includes('fonts.gstatic.com/s/e/notoemoji')) {
        return null;
    }

    if (rawSrc.startsWith('/media/')) {
        return rawSrc;
    }

    const assetId = getSquarespaceAssetId(rawSrc);
    if (!assetId || !articleImageReplacements.has(assetId)) {
        return null;
    }

    return articleImageReplacements.get(assetId);
}

function isNewsletterChromeText(tagName, text) {
    const normalized = text.toLowerCase();

    if (!normalized) return true;
    if (normalized === 'powered by' || normalized.includes('powered by squarespace')) return true;
    if (normalized.includes('unsubscribe') || normalized.includes('campaign preferences')) return true;
    if (normalized.includes('view entire message')) return true;
    if (/^ready to (transform|experiment)/i.test(text)) return true;
    if (/^let.?s (craft|discuss)/i.test(text)) return true;
    if (/^reply to this email/i.test(text)) return true;
    if (/^call:\s*1300/i.test(text)) return true;
    if (/^urblo,\s*5 hamilton/i.test(text) || /^5 hamilton street/i.test(text)) return true;
    if (normalized.includes('explore solutions: urblo.com.au')) return true;
    if (tagName === 'p' && /^project spotlight\s*\|/i.test(text)) return true;

    return false;
}

function claimReviewFlags(text) {
    const checks = [
        ['carbon_scope', /\bcarbon[-\s]?neutral\b|\bco2\b|\bprotecting the planet\b/i],
        ['absolute_quality', /\bzero onsite errors\b|\bzero cracks\b|\bguaranteed\b|\bflawless\b|\bperfect alignment\b/i],
        ['time_or_cost_percent', /\b\d+\s*%|\b1\/3\b|\bslash project timelines\b|\bcost[-\s]?smart\b/i],
        ['broad_sustainability', /\bsustainability\b|\bsustainable\b|\breduce waste\b/i],
    ];

    return checks.filter(([, pattern]) => pattern.test(text)).map(([flag]) => flag);
}

function blockFromTextToken(articleSlug, sourcePath, tagName, text, sortOrder) {
    const reviewFlags = claimReviewFlags(text);

    if (/^download\s+to\s+explore/i.test(text)) {
        return {
            article_slug: articleSlug,
            block_type: 'cta',
            status: 'draft',
            sort_order: sortOrder,
            media_source_url: null,
            content: {
                label: 'Download',
                body: text,
                reviewFlags,
                migrationStatus: 'legacy_cta_requires_review',
                sourcePath,
            },
        };
    }

    if (/^project spotlight\s*\|/i.test(text)) {
        return {
            article_slug: articleSlug,
            block_type: 'project_spotlight',
            status: 'draft',
            sort_order: sortOrder,
            media_source_url: null,
            content: {
                title: text,
                reviewFlags,
                migrationStatus: 'legacy_project_spotlight_requires_review',
                sourcePath,
            },
        };
    }

    return {
        article_slug: articleSlug,
        block_type: 'rich_text',
        status: 'draft',
        sort_order: sortOrder,
        media_source_url: null,
        content: {
            body: text,
            sourceTag: tagName,
            headingLevel: /^h[1-6]$/i.test(tagName) ? Number(tagName.slice(1)) : null,
            reviewFlags,
            claimReviewStatus: reviewFlags.length ? 'needs_review' : 'source_review_required',
            migrationStatus: 'legacy_newsletter_extracted_for_review',
            sourcePath,
        },
    };
}

function extractArticleBlocks(article, sourcePath, rawHtml, articleImageReplacements) {
    const blocks = [];
    const tokenPattern = /<(h[1-6]|p)\b[^>]*>([\s\S]*?)<\/\1>|<img\b[^>]*>/gi;
    let match = tokenPattern.exec(rawHtml);

    while (match) {
        const [token, tagName, innerHtml] = match;

        if (tagName) {
            const text = textFromHtml(innerHtml);
            if (!isNewsletterChromeText(tagName.toLowerCase(), text)) {
                blocks.push(blockFromTextToken(article.slug, sourcePath, tagName.toLowerCase(), text, blocks.length));
            }
        } else {
            const imageSource = resolveArticleImageSource(getAttributeValue(token, 'src'), articleImageReplacements);
            const alt = textFromHtml(getAttributeValue(token, 'alt'));

            if (
                imageSource &&
                imageSource !== '/media/launch/identity/urblo-logo.png' &&
                !imageSource.includes('/media/launch/articles/shared/')
            ) {
                blocks.push({
                    article_slug: article.slug,
                    block_type: 'image',
                    status: 'draft',
                    sort_order: blocks.length,
                    media_source_url: imageSource,
                    content: {
                        alt: alt || null,
                        caption: null,
                        migrationStatus: 'legacy_newsletter_image_extracted_for_review',
                        sourcePath,
                    },
                });
            }
        }

        match = tokenPattern.exec(rawHtml);
    }

    if (blocks.length > 0) {
        return blocks.map((block, index) => ({ ...block, sort_order: index }));
    }

    return [
        {
            article_slug: article.slug,
            block_type: 'rich_text',
            status: 'draft',
            sort_order: 0,
            media_source_url: null,
            content: {
                migrationStatus: 'legacy_newsletter_requires_structured_review',
                sourcePath,
            },
        },
    ];
}

function propertyNameText(name) {
    if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
        return name.text;
    }

    return null;
}

function stringLiteralText(node) {
    return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : null;
}

function productImageSourceUrl(relativePath) {
    return `data/Product/${relativePath}`;
}

function extractSecondaryProductImage(callExpression) {
    if (!ts.isCallExpression(callExpression) || callExpression.expression.getText() !== 'secondaryProductImage') {
        return null;
    }

    const relativePath = stringLiteralText(callExpression.arguments[0]);
    const alt = stringLiteralText(callExpression.arguments[1]);
    const label = stringLiteralText(callExpression.arguments[2]);

    if (!relativePath) {
        return null;
    }

    return {
        imageUrl: productImageSourceUrl(relativePath),
        alt,
        label,
    };
}

function extractStoneImageAsset(initializer) {
    if (ts.isCallExpression(initializer) && initializer.expression.getText() === 'productImage') {
        const relativePath = stringLiteralText(initializer.arguments[0]);
        const alt = stringLiteralText(initializer.arguments[1]);
        const secondaryImagesArg = initializer.arguments[3];
        const secondaryImages = secondaryImagesArg && ts.isArrayLiteralExpression(secondaryImagesArg)
            ? secondaryImagesArg.elements.map(extractSecondaryProductImage).filter(Boolean)
            : [];

        if (!relativePath) {
            return null;
        }

        return {
            imageUrl: productImageSourceUrl(relativePath),
            alt,
            secondaryImages,
        };
    }

    if (ts.isObjectLiteralExpression(initializer)) {
        const asset = {
            imageUrl: null,
            alt: null,
            secondaryImages: [],
        };

        for (const property of initializer.properties) {
            if (!ts.isPropertyAssignment(property)) continue;
            const key = propertyNameText(property.name);

            if (key === 'imageUrl') {
                asset.imageUrl = stringLiteralText(property.initializer);
            }
            if (key === 'alt') {
                asset.alt = stringLiteralText(property.initializer);
            }
        }

        return asset.imageUrl ? asset : null;
    }

    return null;
}

function extractStaticStoneFinishImageRows(stoneVariantToGroup, validFinishKeys, blockers) {
    const sourcePath = 'src/data/stoneFinishImages.ts';
    const source = fs.readFileSync(path.join(root, sourcePath), 'utf8');
    const sourceFile = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const rows = [];

    function visit(node) {
        if (
            ts.isVariableDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            node.name.text === 'stoneFinishImages' &&
            node.initializer &&
            ts.isObjectLiteralExpression(node.initializer)
        ) {
            for (const variantProperty of node.initializer.properties) {
                if (!ts.isPropertyAssignment(variantProperty) || !ts.isObjectLiteralExpression(variantProperty.initializer)) {
                    continue;
                }

                const stoneVariantKey = propertyNameText(variantProperty.name);
                if (!stoneVariantKey) continue;

                const stoneGroupKey = stoneVariantToGroup.get(stoneVariantKey);
                if (!stoneGroupKey) {
                    const hasFinishSpecificRows = variantProperty.initializer.properties.some(
                        (finishProperty) =>
                            ts.isPropertyAssignment(finishProperty) &&
                            propertyNameText(finishProperty.name) !== 'default',
                    );
                    if (hasFinishSpecificRows) {
                        blockers.push(`Unknown stone variant image map ${stoneVariantKey} in ${sourcePath}`);
                    }
                    continue;
                }

                for (const finishProperty of variantProperty.initializer.properties) {
                    if (!ts.isPropertyAssignment(finishProperty)) continue;
                    const finishKey = propertyNameText(finishProperty.name);

                    if (!finishKey || finishKey === 'default') continue;
                    if (!validFinishKeys.has(finishKey)) {
                        blockers.push(`Unknown finish image key ${finishKey} on ${stoneVariantKey} in ${sourcePath}`);
                        continue;
                    }

                    const asset = extractStoneImageAsset(finishProperty.initializer);
                    if (!asset?.imageUrl) {
                        blockers.push(`Missing finish image asset for ${stoneVariantKey}/${finishKey} in ${sourcePath}`);
                        continue;
                    }

                    rows.push({
                        stone_group_key: stoneGroupKey,
                        stone_variant_key: stoneVariantKey,
                        finish_key: finishKey,
                        media_source_url: asset.imageUrl,
                        image_role: 'primary',
                        sort_order: 0,
                        status: 'draft',
                        alt: asset.alt,
                    });

                    asset.secondaryImages.forEach((secondaryImage, secondaryIndex) => {
                        if (!secondaryImage.imageUrl) return;

                        rows.push({
                            stone_group_key: stoneGroupKey,
                            stone_variant_key: stoneVariantKey,
                            finish_key: finishKey,
                            media_source_url: secondaryImage.imageUrl,
                            image_role: 'secondary',
                            sort_order: secondaryIndex + 1,
                            status: 'draft',
                            alt: secondaryImage.alt,
                        });
                    });
                }
            }
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return rows;
}

const stoneLibrary = readJson('data/clean/stone_library.json');
const articles = readJson('public/articles/index.json');
const { projects } = loadTypeScriptModule('src/data/projectData.ts');
const { products } = loadTypeScriptModule('src/data/productData.ts');
const articleImageReplacements = loadArticleImageReplacements();

const finishKeys = new Set(stoneLibrary.finishes.map((finish) => finishKeyFromParts(finish.finishId, finish.finishVariantId)));
const stoneGroupKeys = new Set(stoneLibrary.stones.map((stone) => stone.stoneGroupId));
const stoneVariantToGroup = new Map(
    stoneLibrary.stones.flatMap((stone) =>
        (stone.variants ?? []).map((variant) => [variant.stoneVariantId, stone.stoneGroupId]),
    ),
);

const stoneGroups = stoneLibrary.stones.map((stone, index) => ({
    stone_group_key: stone.stoneGroupId,
    display_name: stone.displayName,
    source_name: stone.sourceName,
    status: mapImportStatus(stone.status),
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
            status: mapImportStatus(variant.status),
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

const stoneFinishImages = extractStaticStoneFinishImageRows(stoneVariantToGroup, finishKeys, blockers);
stoneFinishImages.forEach((image) => {
    addMediaCandidate(
        image.media_source_url,
        `stone finish image ${image.stone_variant_key}/${image.finish_key}/${image.image_role}/${image.sort_order}`,
        image.alt,
    );
});

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
    let rawArticleHtml = '';

    if (!fs.existsSync(absoluteSourcePath)) {
        blockers.push(`Missing article source HTML for ${article.slug}: ${sourcePath}`);
    } else {
        rawArticleHtml = fs.readFileSync(absoluteSourcePath, 'utf8');
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

    extractArticleBlocks(article, sourcePath, rawArticleHtml, articleImageReplacements).forEach((block) => {
        if (block.media_source_url) {
            addMediaCandidate(
                block.media_source_url,
                `article block image ${article.slug}/${block.sort_order}`,
                block.content?.alt ?? `${article.title} image`,
            );
        }

        articleBlocks.push(block);
    });
});

assertUnique(stoneGroups, (row) => row.stone_group_key, 'stone group key', blockers);
assertUnique(stoneVariants, (row) => `${row.stone_group_key}/${row.variant_key}`, 'stone variant key', blockers);
assertUnique(
    stoneFinishImages,
    (row) =>
        `${row.stone_group_key}/${row.stone_variant_key}/${row.finish_key}/${row.media_source_url}/${row.image_role}/${row.sort_order}`,
    'stone finish image key',
    blockers,
);
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
        stone_finish_images: stoneFinishImages.length,
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
        stone_finish_images: stoneFinishImages.map(({ alt, ...row }) => row),
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

payload.importPlan = buildImportPlan(payload.summary);

if (outputPath) {
    const writtenPath = writeOutputArtifact(outputPath, payload);
    console.log(`wrote content import artifact: ${writtenPath}`);
}

if (planOutputPath) {
    const writtenPath = writeTextArtifact(planOutputPath, formatImportPlanMarkdown(payload));
    console.log(`wrote content import plan: ${writtenPath}`);
}

if (preflightSqlOutputPath) {
    const writtenPath = writeTextArtifact(preflightSqlOutputPath, buildPreflightSql(payload));
    console.log(`wrote content import preflight SQL: ${writtenPath}`);
}

if (applySqlOutputPath) {
    const writtenPath = writeTextArtifact(applySqlOutputPath, buildDraftImportSql(payload));
    console.log(`wrote guarded draft content import SQL: ${writtenPath}`);
}

if (rollbackSqlOutputPath) {
    const writtenPath = writeTextArtifact(rollbackSqlOutputPath, buildDraftRollbackSql(payload));
    console.log(`wrote guarded draft content import rollback SQL: ${writtenPath}`);
}

if (printJson) {
    console.log(JSON.stringify(payload, null, 2));
} else {
    console.log('Supabase content import readiness');
    console.log(`- media_assets candidates: ${payload.rows.media_assets.length}`);
    console.log(`- stone_groups: ${stoneGroups.length}`);
    console.log(`- stone_variants: ${stoneVariants.length}`);
    console.log(`- stone_finish_capabilities: ${stoneFinishCapabilities.length}`);
    console.log(`- stone_finish_images: ${stoneFinishImages.length}`);
    console.log(`- products: ${productRows.length}`);
    console.log(`- product_models: ${productModels.length}`);
    console.log(`- product_material_defaults: ${productMaterialDefaults.length}`);
    console.log(`- product_specs: ${productSpecs.length}`);
    console.log(`- projects: ${projectRows.length}`);
    console.log(`- project_facts: ${projectFacts.length}`);
    console.log(`- project_media: ${projectMedia.length}`);
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
