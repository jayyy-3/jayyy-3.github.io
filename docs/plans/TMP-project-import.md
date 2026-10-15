# TMP · Project 内容包导入（Phase 2）· 执行计划

> 临时文档。由 Claude（Fable 5.1）于 2026-10-15 起草，供执行代理（Opus 5）推进。完成并通过 Claude 验收后，由 Claude 删除本文件。长期决策写入 `docs/DESIGN.md`、`docs/architecture/projects-admin.md`、`docs/ADMIN_EDITOR_GUIDE.md`、`docs/content-import/`。

---

## 0. 目标与已定决策

### 0.1 目标

内容同事在 Claude Design 里做好项目故事后，能把它作为一个 **内容包**（一个 JSON 文件，或 JSON + 图片的 zip）交给 Urblo 后台；后台导入成一个 **Draft 项目**，所有正文块就位、图片入私有媒体库、石材引用解析到石材库；编辑审核、补缺、预览、发布。发布门槛不变。

同时交付一份 **给 Claude Design 的 prompt** 和内容包格式说明，让那边的 AI 直接产出合格的包。**Urblo 这边不跑任何 AI。**

### 0.2 Jay 已拍板的决策（不要再问）

| 决策 | 结论 |
| --- | --- |
| AI | 不在 Urblo 跑 AI。导入是确定性的格式校验和映射。 |
| 口子 | 窄：只接受 §2.1 定义的内容包格式。不接受 HTML、PDF、Markdown 自由文本。 |
| 图片 | zip 里有图就一起导入私有媒体库；没有就标记待上传，编辑在后台补。两种都支持。 |
| 内容模型 | 复用 Phase 1 的 14 种块（`src/features/blocks/schema.ts`）。包格式就是块 schema 的"外部表示"，不另造模型。 |
| 落地状态 | 一律 Draft，claim 审核状态 `needs_review`，正文每块原样，不自动发布。 |

### 0.3 Claude 代 Jay 定的实现决策（已定，照做）

- **处理在浏览器端完成**，不新增 Function 端点：后台页面解析包、校验、上传图片（走现有 `AdminMediaPicker` 同一条私有上传路径与 `media_assets` 插入合同）、组装 `ProjectAggregateDraft`、调用现有 `action: 'save'`。服务端照常重新校验。这样口子最窄，权限、审计、限额全部复用。
- **打点图不可导入**。内容包里没有 `hotspot_image`；需要打点的图片先作为普通 `image` 导入，编辑在后台开启材料点。
- **石材用 slug 引用**（即 `/stone-library/<slug>` 的 slug），导入时通过已发布石材目录解析成 id；解析失败的保留为"待确认"并在报告里列出，发布时被现有阻断器拦下。
- **允许新增一个小依赖 `fflate`** 仅用于浏览器端解 zip（只进 admin 分块；公开站 bundle 不得引入）。
- **一个 PR** 交付。

### 0.4 不在范围

- 从 HTML / PDF / Figma 自动转换；任何 AI 调用。
- 导入到 Articles；newsletter 输出（Phase 3）。
- 覆盖/更新已有项目（v1 只创建新 Draft；同 slug 冲突自动加后缀）。
- 导入材料清单的打点、hero 图自动裁切。

### 0.5 授权边界（写给执行代理）

- 包含：分支实现、隔离测试、`git push`、开 PR、Preview smoke、更新 docs/agent 状态与 WORKLOG。
- 不包含：merge（Claude 做）、任何生产数据/Storage 写入、邮件、DNS、凭据。Preview 只读；导入流程只在本地 stack 上用合成账号证明。
- 本阶段**无数据库迁移**。若发现必须改库，停下并在 PR 里说明，不要自行加迁移。

### 0.6 起步

```sh
git checkout main && git pull --ff-only
git checkout -b claude/project-import
npm install && npm run agent:init
```

必读：`AGENTS.md`、`docs/OPERATING_PROTOCOL.md`、`docs/agent/verification.md`、`docs/DESIGN.md`（§Admin、§Content blocks、§Projects）、`docs/architecture/projects-admin.md`、`docs/ADMIN_EDITOR_GUIDE.md`、`src/features/blocks/schema.ts`、`src/features/projects/projectAggregate.ts`、`src/pages/admin/media/AdminMediaPicker.tsx` 与 `mediaPickerFiles.ts`、`functions/_lib/blocks.js`、`docs/WORKLOG.md` 2026-10-14/15 两条。

---

## 1. 现状速览

- 块模型：`src/features/blocks/schema.ts`（类型、限制、校验、默认值），服务端镜像 `functions/_lib/blocks.js`，共享 fixture 测试保证一致。
- 草稿：`ProjectAggregateDraft = { project, facts, materials, maps, blocks, hotspots }`，`schemaVersion: 2`；`createEmptyProjectAggregateDraft()`、`createProjectDraftKey(kind)` 生成稳定 key。保存走 `functions/api/admin/projects.js`（`action: 'save'`，限额：facts/materials ≤ 100、blocks ≤ 100、draft ≤ 1MB）。
- 上传：`AdminMediaPicker` 把文件（可选浏览器端优化）上传到私有桶 `urblo-admin-media` 的 `<prefix>/...` 路径，再插入 `media_assets`（`source_kind: 'storage'`、`mime_type`、尺寸、`alt` 必填）。上传限制在 `mediaPickerFiles.ts`（原图 ≤ 10MB、HEIC 指引等）。发布时由 Function 做私有→公开提升。
- 石材目录：`src/service/stoneCatalogueOptions.ts` 的 `loadStoneCatalogueOptions()` 提供已发布石材（含 `stone_group_key` = slug、变体、finish）。
- 审计：`src/lib/adminAudit.ts` 的 `recordAdminAuditEvent()`。
- 后台 Projects 列表页：`src/pages/admin/AdminProjectsPage.tsx`（"New project" 入口在此）。编辑器 `src/pages/admin/projects/ProjectEditor.tsx` + `BodySection.tsx`。
- 守卫：`scripts/check-admin-projects-aggregate.mjs`、`tests/admin-projects-aggregate.test.ts`、`scripts/check-admin-guide.mjs`、`npm run gate` 的 bundle 边界检查（公开 entry < 500KB，Supabase chunk 不预加载）。

---

## 2. 目标设计

### 2.1 内容包格式 `urblo-project-package` v1

两种载体：
- 单个 `project.json`；
- 一个 `.zip`，根目录含 `project.json` 和 `images/` 文件夹（图片文件名在 JSON 里引用）。

`project.json`：

```json
{
  "format": "urblo-project-package",
  "version": 1,
  "project": {
    "title": "The Greenline Project, Birrarung Marr Site 1",
    "slug": "greenline-birrarung-marr",
    "location": "Melbourne, VIC",
    "projectDateLabel": "2026",
    "completedOn": "2026-03-01",
    "summary": "Tiered stone seating along the river edge.",
    "lead": "Congratulations to City of Melbourne and Tract on a landmark civic landscape.",
    "client": "City of Melbourne",
    "landscapeArchitect": "Tract",
    "contractor": "Symal",
    "address": "",
    "quantityLabel": "",
    "facts": [ { "label": "Award", "value": "2026 AILA VIC Landscape Architecture Award, Civic Landscape" } ],
    "materials": [ { "stone": "blueocean", "finish": "sawn", "application": "Tiered seating steps", "note": "" } ],
    "hero": { "file": "images/hero.jpg", "alt": "Tiered bluestone seating steps on the Yarra riverbank" },
    "cover": { "file": "images/hero.jpg", "alt": "..." }
  },
  "blocks": [
    { "type": "heading", "eyebrow": "Signature project", "title": "From design intent to fabrication reality", "intro": "Here is how the Greenline stone went from drawing to riverfront." },
    { "type": "stats", "items": [ { "value": "1398 + 1000", "unit": "mm", "label": "Staggered module lengths across a 3800 mm stair width" }, { "value": "2", "unit": "mm", "label": "Joints, set out and dimensioned on the drawing" } ] },
    { "type": "steps", "items": [ { "title": "Shop drawing", "body": "Every stair began as a coordinated shop drawing…", "image": { "file": "images/step-1.jpg", "alt": "Shop drawing of the stair setting-out" } } ] },
    { "type": "image", "image": { "file": "images/as-built.jpg", "alt": "As built: staggered joints and a crisp arris" }, "caption": "As built: staggered joints, a crisp arris, and Alpine White granite strips set into Steel Blue." },
    { "type": "stone_cards", "title": "The stone", "items": [ { "stone": "blueocean", "finish": "sawn" }, { "stone": "alpine-white", "finish": "flamed" } ] },
    { "type": "spec_table", "rows": [ { "label": "Application", "value": "Tiered seating steps and transition elements" }, { "label": "Slip rating", "value": "P5" } ] },
    { "type": "cta", "title": "Talk to us early", "body": "The best outcomes come when fabrication is part of the conversation during design development.", "primary": { "label": "Discuss a project", "href": "/contact" } }
  ]
}
```

规则：
- `format` / `version` 必须精确匹配；未知顶层键、未知块类型、未知字段 → 报错并指出位置（不静默忽略）。
- 块的字段 = `schema.ts` 对应 content 字段，差异只有两处：图片用 `{ "file", "alt" }` 对象（而不是 `mediaAssetId`），石材用 `{ "stone": "<slug>", "finish": "<finishKey>" }`（而不是 `stoneGroupId`）。`hotspot_image` 不允许出现。
- `file` 可省略或指向 zip 里不存在的文件 → 该图片"待上传"（允许导入，报告里列出）。同一个 `file` 多处引用只上传一次。
- `alt` 对每张图必填（上传合同要求描述）；缺失 → 报错。
- 文本限制沿用 `BLOCK_TEXT_LIMITS`；`text.body` 是受限 Markdown。
- `slug` 可省略（由标题生成）；与现有项目冲突时加 `-2`、`-3`。
- `completedOn` 为 ISO 日期或省略。
- 限额：blocks ≤ 100、facts ≤ 100、materials ≤ 100、图片 ≤ 50 张、单图 ≤ 10MB、zip ≤ 100MB、JSON ≤ 1MB。

机器可读 schema：`docs/content-import/project-package.schema.json`（JSON Schema draft 2020-12，手写，与 `schema.ts` 对齐，vitest 用它校验示例包）。示例包：`docs/content-import/examples/greenline/project.json`（用上面 Greenline 内容，图片用 `file` 引用但示例里不附真实图片）。

### 2.2 代码结构

- `src/features/blocks/importPackage.ts`：类型 + `parseProjectPackage(json): ParseResult`（纯函数，无 IO；返回结构化错误 `{ path, message }` 列表和 warnings）+ `packageToDraft(parsed, context): { draft, pendingImages, unresolvedStones }`，其中 `context` 提供 `resolveStone(slug) → stoneGroupId | null`、`resolveFinish(key) → finishDefinitionId | null`、`mediaIdForFile(file) → number | null`、`existingSlugs`。用 `createEmptyProjectAggregateDraft()` 和 `createProjectDraftKey()`；所有 claim 状态 `needs_review`；块 content 经 `schema.ts` 的校验/清洗。
- `src/features/blocks/importZip.ts`：用 `fflate` 解 zip（动态 `import()`，只在 admin 分块），返回 `{ projectJson, files: Map<name, Blob> }`；拒绝路径穿越、非 `images/` 下的文件、非图片 MIME。
- `src/pages/admin/projects/ImportProjectDialog.tsx`：UI（§2.3）。上传复用 `mediaPickerFiles.ts` 的 `checkPickerFile` / `preparePickerUpload('optimize')` / `buildPickerObjectPath(file, 'project-import')` 和与 `AdminMediaPicker` 相同的 Storage + `media_assets` 插入逻辑——**把那段上传逻辑抽成 `src/pages/admin/media/uploadPickerFile.ts` 供两者共用**，不要复制粘贴。
- `scripts/check-project-package.mjs`（`npm run agent:project-package -- <file.json|file.zip>`）：Node 端离线校验同一格式（复用 `functions/_lib/blocks.js` 的校验 + 包解析的 JS 版本或通过 `tsx` 跑 TS），输出报告，不联网。给同事和 Claude Design 自检用。
- `functions/_lib/blocks.js` 无需改；若 `packageToDraft` 的清洗逻辑需要在两端一致，加 fixture 到现有共享 fixture 测试。

### 2.3 后台 UI（DESIGN.md §Admin）

- Projects 列表页头部，在 `New project` 旁加 `Import package`（owner / admin / editor；viewer 不显示）。
- 对话框三步，一次只显示一步：
  1. **Choose file**：拖放或选择 `.json` / `.zip`；说明一句"Export a project package from Claude Design, or paste the JSON."，附 "Package format" 链接到帮助页；同时提供一个粘贴 JSON 的文本区（折叠）。
  2. **Review**：解析报告。顶部项目标题、slug（含冲突后缀提示）；块清单（类型图标 + 摘要，按顺序）；图片：`N found in package · M to add later`；石材：`resolved: Steel Blue (sawn), Alpine White (flamed) · unresolved: xxx`；错误列表（有错误则不能继续，每条带 `path`）；警告列表。按钮 `Create draft`。
  3. **Importing**：逐张上传进度（`Uploading 3 of 7 images`），然后 `Saving draft`；失败时显示哪张失败并提供 `Retry` / `Skip this image`（跳过 = 该块图片待上传）；成功后跳到编辑器，顶部通知 `Imported as a draft. Review each block, add any missing images, then Publish.`，`Needs attention` 清单自然列出缺图/未解析石材。
- 文案英文、面向非技术同事，不出现 bucket / table / schema 等实现词。错误走现有翻译。
- 审计：导入成功后 `recordAdminAuditEvent('project.import', { projectId, blocks, imagesUploaded, imagesPending, stonesUnresolved })`。

### 2.4 给 Claude Design 的材料

`docs/content-import/README.md`（格式说明，面向同事，英文）和 `docs/content-import/CLAUDE_DESIGN_PROMPT.md`（可整段复制的 prompt）。prompt 必须包含：
- 角色与目标（把设计稿转成 Urblo 项目内容包，不写 HTML）。
- 完整格式（内嵌 §2.1 示例与字段表、14 种块中可用的 13 种及各自适用场景、文本限制、受限 Markdown 规则）。
- 石材 slug 规则：取 `https://urblo.com.au/stone-library/<slug>` 的 `<slug>`；finish 用小写 key（flamed / sawn / honed / polished / bush-hammered…，列出站点现有 finish key）。
- 图片规则：导出 zip，根目录 `project.json` + `images/`，每图必须有 `alt`，JPG/PNG/WebP，单张 ≤ 10MB，长边 ≥ 1600px。
- 输出要求：只输出 zip（或 JSON）；不要加任何 JSON 以外的说明；不要发明石材。
- 一个"自检清单"段落。
并在 `docs/ADMIN_EDITOR_GUIDE.md` 和后台快速指南加 "Import a project package" 段落，链接到 README。

### 2.5 测试与守卫

- vitest：`importPackage.test.ts`（合法示例 → draft；每类错误：格式/版本不符、未知块、`hotspot_image`、缺 `alt`、超限、slug 冲突后缀、未解析石材/缺图的 warning 路径；图片去重）；`importZip.test.ts`（用 `fflate` 在测试里生成 zip：正常包、路径穿越、非图片文件被拒）；JSON Schema 对示例包通过、对坏包失败。
- 本地 stack 走通：owner 导入示例 zip（测试时临时生成 3 张图）→ 报告 → 创建 → 编辑器打开、块与图片就位 → 预览 → 发布 → 公开页逐块核对；再导入只有 JSON 的包 → 缺图待上传 → 在编辑器补图 → 发布。editor 账号同样可导入；viewer 看不到入口。
- `scripts/check-admin-projects-aggregate.mjs` / `check-admin-guide.mjs` 按新合同补断言（入口存在、三步对话框、上传逻辑共用、公开 bundle 不含 `fflate`）。
- `npm run gate`、`agent:check`、`git diff --check`、`agent:admin-crud-coverage`、`agent:admin-cms-predeploy`、`agent:admin-config-gate`、Preview smoke。

### 2.6 文档与记录

`docs/content-import/*`（新）、`docs/DESIGN.md`（§Admin 加导入对话框规则一段）、`docs/architecture/projects-admin.md`、`docs/ADMIN_EDITOR_GUIDE.md`、`docs/ADMIN_IA_ACCESS.md`、`docs/agent/tasks.json`（`NOW-PROJECT-IMPORT-001`，now / release）、WORKLOG、`npm run agent:state`。

---

## 3. 验收清单（Claude 用）

- [ ] 格式文档、JSON Schema、示例包、Claude Design prompt 齐全且互相一致。
- [ ] 解析是纯函数，错误带路径；`hotspot_image` 被拒；缺图与未解析石材是 warning 而非错误。
- [ ] 上传逻辑与 `AdminMediaPicker` 共用一份；`fflate` 只在 admin 分块。
- [ ] 本地 stack 两条路径（zip、纯 JSON）走通并发布成功；viewer 无入口。
- [ ] 无迁移、无新端点；所有 gate 与守卫通过。
