# TMP · Project 块式正文（共享内容块系统）· 执行计划

> 临时文档。由 Claude（Fable 5.1）于 2026-10-14 起草，供执行代理（Opus 5）推进 **Phase 1**。Phase 2（导入）和 Phase 3（newsletter）另起计划。全部完成并通过 Claude 验收后，由 Claude 删除本文件。长期决策必须写入 `docs/DESIGN.md`、`docs/architecture/projects.md`、`docs/architecture/projects-admin.md`、`docs/SUPABASE_SCHEMA.md` 等正式文档。

---

## 0. 目标与已定决策

### 0.1 目标

把 Project 页从"固定字段 + 三种媒体块"改成 **结构化头部 + 块式正文**。编辑在后台用一组语义化的内容块（小标题、段落、数据条、流程步骤、规格表、石材卡、图片、打点图、视频、CTA……）组织项目叙事；公开项目页按 `docs/DESIGN.md` 渲染这些块。参考样例：内容同事用 Claude Design 做的 Greenline 项目 newsletter（获奖横幅 → 标题 → 项目信息表 → 背景段落 → "From design intent to fabrication reality" 五步流程带数据条和配图 → 石材卡 → 规格表 → CTA）。

同一套块以后还要给 Articles 共用，并作为 Phase 2 "从 Claude Design 导入 JSON" 和 Phase 3 "newsletter 输出模板" 的内容模型。**所以块必须是内容语义，不是版式。**

### 0.2 Jay 已拍板的决策（不要再问）

| 决策 | 结论 |
| --- | --- |
| 正文形态 | **块式正文**，不是自由排版 WYSIWYG。编辑选块，不选字体和间距。 |
| 头部 | 项目信息（标题、地点、日期、客户、设计师、承包商、数量、碳信息、claim 审核）、材料清单、打点图点位 **保持结构化数据**，不变成块。首页卡片、石材页 "Used in projects"、对比页都依赖它。 |
| 共用范围 | Projects 和 newsletter 共用同一套块；Articles 后续接入。Phase 1 只改 Projects，但块系统必须放在共享模块里。 |
| 块清单 | 见 §2.2 的 14 种。第一版就是这 14 种，不多不少。 |
| AI | **我们这边不跑 AI。** 导入是 Phase 2，本阶段不做。 |
| 现有项目 | 现有已发布项目迁移后 **公开页视觉必须不变**（现有媒体块一对一变成正文块）。 |
| 推进方式 | Phase 1 拆成三个 PR（§3），每个 PR 过 gate + Preview smoke 后停下等 Claude 验收；生产迁移由 Claude 应用，合并由 Claude 执行。 |

### 0.3 不在 Phase 1 范围

- JSON / zip 导入、给 Claude Design 的 prompt（Phase 2）。
- newsletter 输出（Phase 3）。
- Articles 改用新块编辑器（Phase 4，但 Phase 1 的共享模块命名和目录要为它留位置）。
- 首页、Products、Stone Library 的任何改动。
- 物理删除任何表、列、行。

### 0.4 授权边界（写给执行代理）

- **包含**：在分支上实现、本地隔离测试（含隔离数据库 fixture）、`git push`、开 PR、Cloudflare 分支 Preview 及其 smoke、更新 docs/agent 状态与 WORKLOG。
- **不包含**：merge 到 `main`、对生产 Supabase 应用 migration、任何生产数据/Storage 写入、真实邮件、DNS、凭据。每个 PR 到 Preview smoke 通过后停下，等 Claude 验收。Claude 负责按 §3.4 的顺序应用迁移并合并。
- 若上一个 PR 尚未 merge，下一个 PR 从上一个分支继续（stacked），不要等待。
- Preview 读的是生产数据且只读：Preview 上不许做任何写入。写入流程只在隔离数据库 / 本地 stack 上证明。
- 遵守 `AGENTS.md`、`docs/OPERATING_PROTOCOL.md`、`docs/agent/verification.md`。不要顺手做无关重构。

### 0.5 起步

```sh
git checkout main && git pull --ff-only
git checkout -b claude/project-blocks-1a      # 本计划 Phase 1A 分支
npm install
npm run agent:init
```

必读：`AGENTS.md`、`docs/OPERATING_PROTOCOL.md`、`docs/agent/verification.md`、`docs/DESIGN.md`（§Projects、§Project material points、§Project point marker、§Component Rules、§Copy formats、§Admin）、`docs/architecture/projects.md`、`docs/architecture/projects-admin.md`、`docs/architecture/articles.md`、`docs/ADMIN_IA_ACCESS.md`（Projects 行）。

---

## 1. 现状速览（执行前必须理解）

### 1.1 数据与写入链路

- 表：`public.projects`、`project_facts`、`project_materials`、`project_material_maps`、`project_hotspots`、`project_media`（`supabase/migrations/202605270001_foundation_schema.sql`）。`project_media.media_role` 在 `20260603142359_project_media_blocks.sql` 扩成 `normal_image` / `hotspot_image` / `youtube_video`（加 `project_material_map_id`、`youtube_url`），旧的 `cover` / `hero` / `gallery` / `material_map` / `supporting` 角色仍在约束里。
- 写入**只**经过 service-role RPC `public.admin_project_aggregate(p_action, p_project_id, p_base_revision, p_base_updated_at, p_draft, p_actor_user_id, p_expected_actor_role, p_promotions)`（`20260719015649_project_aggregate_drafts.sql`，约 1100 行），入口是 Cloudflare Function `functions/api/admin/projects.js` → `functions/_lib/admin-projects.js`（1754 行）。私有草稿存 `private.project_drafts.draft`（整份 aggregate JSON）。`20260802105537_project_aggregate_write_lockdown.sql` 撤销了浏览器对六张 Project 表的 DML。
- 前端草稿模型：`src/features/projects/projectAggregate.ts` 的 `ProjectAggregateDraft = { project, facts, materials, maps, mediaBlocks, hotspots }`。`ProjectMediaBlockDraft` 有 `mediaRole` / `mediaAssetId` / `projectMaterialMapKey` / `blockTitle` / `youtubeUrl` / `label` / `caption` / `sortOrder`。`draftToProjectData()` 把草稿映射成公开 `ProjectData`，预览和公开页共用渲染器。
- 公开读取：`src/service/ProjectService.ts` 直接按表读（`project_facts` / `project_media` / `project_materials` / `project_material_maps` / `project_hotspots`），与 `src/data/projectData.ts` 静态兜底合并。公开页 `src/components/projects/ProjectPageView.tsx`（470 行）：Opening → Hero → Project Information → ProjectMedia（有序媒体块）→ Featured Materials → CTA。打点图是 `ProjectHotspotImage.tsx`。
- 后台：`src/pages/admin/AdminProjectsPage.tsx`（1370 行，列表 + 加载/保存编排）→ `src/pages/admin/projects/ProjectEditor.tsx`（978 行）+ `projects/sections/`（Media、Materials 区块与共享控件）。区块：Hero and overview / Project information / Media / Materials。媒体区块里每个块有一个图片字段，可开启"材料点"。

### 1.2 Articles 的块（参考，不是可直接复用的编辑器）

- `public.article_blocks`：`block_type`（12 种）、`content jsonb`、`media_asset_id`、`linked_project_id`、`linked_stone_group_id`、`sort_order`、`status`。
- 后台 `src/pages/admin/articles/`：编辑器让编辑**手填 content JSON 字符串**（`BlockFormState.contentJson`），不是真正的块表单。浏览器直接走 RLS 写 `articles` / `article_blocks`。
- 公开渲染 `src/pages/ArticlePage.tsx` 第 255–412 行按 `blockType` 分支；`rich_text` 的 `body` 是纯文本，`comparison_table` 是 `columnsText` / `rowsText` 文本。
- 结论：块的**语义**可以借鉴，但 schema、校验、渲染器、编辑器都要在共享模块里重做；Articles 在 Phase 4 迁到新模块。

### 1.3 会咬人的现有检查

- `scripts/check-admin-projects-aggregate.mjs`（1376 行，104 条源码断言）+ `tests/admin-projects-aggregate.test.ts`：覆盖编辑器区块、媒体块图片字段身份、材料点开关、发布阻断、Function 边界等。改媒体块模型必然触发大量断言；**逐条改成新合同的等价断言，并在 WORKLOG 记录原因，不许删掉守卫。**
- `tests/public-content-overlay.test.ts`、`scripts/check-public-supabase-readiness.mjs`：公开读取边界。
- `npm run gate` 的 `db-types` 节点：改表后要重新生成 `src/types/database.ts`。
- `docs/architecture/*.md` 单文件 8KB 上限（`agent:check`）。

---

## 2. 目标设计

### 2.1 数据模型（expand-only）

**新表 `public.project_blocks`**（照 `article_blocks` 的形状，加上 Projects 需要的引用）：

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `id` | bigint identity PK | |
| `project_id` | bigint FK projects on delete cascade | |
| `block_key` | text not null | 草稿里的稳定 key（`block:<id>` 或 `block:new:<uuid>`），同一项目内唯一 |
| `block_type` | text check in (§2.2 的 14 种) | |
| `content` | jsonb not null default `{}` | 按块类型的 schema（§2.2） |
| `media_asset_id` | bigint FK media_assets on delete set null | `image` / `steps` 单图 / `hotspot_image`（通过 map）用 |
| `project_material_map_id` | bigint FK project_material_maps on delete set null | 仅 `hotspot_image` |
| `linked_stone_group_ids` | bigint[] not null default `{}` | `stone_cards` 引用的石材 |
| `sort_order` | integer not null default 0 | 正文顺序 |
| `status` | text check in (draft, published, archived) | 与其它子表一致 |
| 审计列 | `created_at` / `updated_at` / `created_by` / `updated_by` / `published_at` / `archived_at` | |

- RLS：启用；匿名 / authenticated 只能读 **父项目已发布且 claim 审核通过** 的 `status='published'` 行（照 `project_media` 现有公开策略写法）；浏览器 DML 全部撤销；service-role 走 RPC。加入 `private.stone_reference_mutex` / `stone_reference_guard` 触发器列表（石材引用守卫要覆盖 `linked_stone_group_ids`）。
- **`project_media` 不删、不改约束。** 迁移把每个项目的 `normal_image` / `hotspot_image` / `youtube_video` 行 **复制** 成 `project_blocks` 行（同 status、同 sort_order、`content` 里带 `label` / `caption` / `blockTitle` / `youtubeUrl`），并在 `project_blocks.content.legacyProjectMediaId` 记录来源 id。之后 `project_media` 只是历史数据，公开读取和 RPC 发布都不再写它（保留 `cover` / `hero` 旧行不动）。
- 草稿：`ProjectAggregateDraft.mediaBlocks` → `blocks: ProjectBlockDraft[]`。`private.project_drafts.draft` 里的旧草稿由迁移一次性改形（`mediaBlocks` 每项映射成 block，删除 `mediaBlocks` 键），并把 draft 加 `schemaVersion: 2`。RPC 和 Function 对 `schemaVersion` 缺失或为 1 的入站草稿做同样的升级后再校验（兼容缓存的旧客户端），对已发布快照不改。
- 迁移末尾自检：每个已发布项目的 `project_blocks` 已发布行数 = 其 `project_media` 已发布的三种媒体行数；每份草稿都有 `blocks` 数组且没有 `mediaBlocks`；否则整体回滚。

### 2.2 块清单与 content schema（共享模块，Phase 2 导入格式也用它）

放在 `src/features/blocks/schema.ts`（类型 + 校验 + 默认值 + 清洗），**无新依赖**（不引 zod），校验逻辑在 TypeScript 和 Function 两处各一份（Function 用 `functions/_lib/blocks.js`，用 `tests/functions-contract.test.ts` 保证两者对同一组 fixture 判定一致）。所有文本字段上限：标题 200、短句 400、正文 5000。

| type | 组 | content 字段 | 公开渲染要点（细节见 §2.3） |
| --- | --- | --- | --- |
| `heading` | 叙事 | `eyebrow?`、`title`、`intro?` | 小标题：eyebrow 用 meta 样式，title 用 section 标题样式 |
| `text` | 叙事 | `body`（受限 Markdown：段落、`**粗体**`、`[链接](url)`、`- 列表`；不允许 HTML） | 段落排版，最大行宽 |
| `quote` | 叙事 | `quote`、`attribution?`、`role?` | 大号轻字重引用，左侧 hairline |
| `callout` | 叙事 | `title?`、`body`、`tone: 'neutral' \| 'lime'` | 高亮框；lime 只做细边/细条，不做大面积填色 |
| `stats` | 证据 | `items[1..4]: { value, unit?, label }`、`caption?` | 数据条：数值大号轻字重，1–4 项横排，移动端 2×2 |
| `steps` | 证据 | `intro?`、`items[1..8]: { title, body, mediaAssetId? , alt? }` | 编号流程：`01` eyebrow + 标题 + 正文，可选全宽图 |
| `spec_table` | 证据 | `title?`、`rows[1..12]: { label, value }` | 两列键值表，hairline 分隔 |
| `comparison_table` | 证据 | `title?`、`columns[2..4]: string`、`rows[1..20]: { label, cells: string[] }` | 多列表，移动端横向滚动，首列固定 |
| `stone_cards` | 证据 | `title?`、`items[1..6]: { stoneGroupId, finishKey?, note? }` | 从石材库目录自动取图、名称、类型、finish；不存在的石材渲染为"待确认"占位，发布时阻断 |
| `image` | 媒体 | `mediaAssetId`、`alt`、`caption?`、`label?` | 全宽，沿用现有 `normal_image` 渲染和响应式图片合同 |
| `gallery` | 媒体 | `items[2..12]: { mediaAssetId, alt, caption? }` | 等高网格，可点开查看；不做瀑布流 |
| `hotspot_image` | 媒体 | `projectMaterialMapKey`、`label?`、`caption?` | 完全沿用现有打点图合同（map + hotspots 不变） |
| `video` | 媒体 | `youtubeUrl`、`label?`、`caption?` | 沿用现有 `youtube-nocookie` 合同 |
| `cta` | 行动 | `title`、`body?`、`primary: { label, href }`、`secondary?: { label, href }` | 正文内 CTA；页面末尾的共享 CTA 仍保留 |

规则：
- 每个块有稳定 `key`，拖动 / 上下移动 / 复制 / 删除都以 key 为准；图片字段身份跟随块（沿用现有"图片字段不会跑到别的块"合同）。
- `image` / `gallery` / `steps` 的图片走现有 Media picker 与私有优先上传、发布时提升的合同，不新建上传路径。
- 发布阻断（客户端 `getProjectPublishBlockers()` 和服务端 `assertPublishDraft()` 两份都要）：必填字段缺失；`stone_cards` 引用了未发布石材；`hotspot_image` 没有 map；图片未就绪；`video` URL 非 YouTube。

### 2.3 公开页（DESIGN.md）

- 顺序：Opening → Hero → Project Information → **Body（有序块）** → Featured Materials → 共享 CTA。现有 `summary` / `lead` 继续在 Opening / Information 显示，不进正文。
- 块渲染器放 `src/components/blocks/`（每块一个文件 + `BlockList.tsx`），Projects 公开页、后台预览共用；Articles 以后也用它。不要在 `ProjectPageView.tsx` 里内联渲染逻辑。
- 视觉规则写入 `docs/DESIGN.md` 新节 "Content blocks"：bold in scale、restrained in ingredients；数据条数值用现有 display/title-lg 轻字重；流程步骤编号用 meta eyebrow；表格只用 hairline，不用斑马纹；callout 的 lime 只做边；块之间统一垂直节奏（沿用 `urblo-section` 间距，不另造）；移动端 16px 边距、无横向溢出（`comparison_table` 例外：容器内滚动）。
- 受限 Markdown 渲染器 `src/lib/richText.ts`：只识别段落、粗体、链接、无序列表；链接外链加 `rel="noopener"`；任何 HTML 原样转义。配单元测试。

### 2.4 后台编辑器

- `ProjectEditor.tsx` 的 Media 区块改为 **Body** 区块：块列表（折叠卡片：类型图标 + 标题摘要 + 上下移动 / 复制 / 删除）、顶部和每块之间的 "Add block" 面板（按叙事 / 证据 / 媒体与行动三组展示，每种块一句说明）、每块一个表单（放 `src/components/admin/blocks/<type>Form.tsx`，共享表单控件复用 `AdminCmsPrimitives`）。打点图块沿用现有"材料点"开关与 map 编辑。
- 实时预览沿用现有 `ProjectPageView` 预览路径；块编辑即时反映。
- 自动保存 / 冲突 / 发布 / 隐藏流程不变（`admin_project_aggregate` 的 revision 机制）。
- 文案：英文，面向非技术同事；错误走现有翻译表。帮助：`docs/ADMIN_EDITOR_GUIDE.md` 和后台快速指南各加一段"Body blocks"。
- 角色：与现有 Projects 一致（editor 可编辑，发布受现有 claim 审核约束）。

### 2.5 RPC / Function

- 迁移文件 `supabase/migrations/<timestamp>_project_blocks.sql`：建表 + RLS + 触发器 + 复制回填 + 草稿改形 + `create or replace` `admin_project_aggregate`（`save` / `publish` 读写 `blocks`，不再写 `project_media` 的三种媒体行；发布时按 key 保 id、归档被移除的块）+ 公开读取 RPC/视图（若现有公开读取是直接 select 表，则给 `project_blocks` 配同样的公开策略即可）+ 自检。单文件，单事务，expand-only。
- `functions/_lib/admin-projects.js`：草稿校验改为 `blocks`，调用 `functions/_lib/blocks.js` 的共享校验；旧形状升级；错误码翻译。
- `src/service/ProjectService.ts`：读 `project_blocks` 代替 `project_media` 的三种媒体行；静态兜底 `src/data/projectData.ts` 的 `mediaBlocks` 改成 `blocks`（一对一）。

### 2.6 测试与守卫

- 新增 vitest：块 schema 校验（每种块的合法 / 非法 fixture）、旧草稿升级、`draftToProjectData` 对 blocks 的映射、受限 Markdown 渲染器、公开读取只暴露已发布块。
- `tests/admin-projects-aggregate.test.ts` 和 `scripts/check-admin-projects-aggregate.mjs`：改成新合同；新增断言：共享模块存在且 Projects 公开页不内联块渲染、Function 与前端校验共用 fixture、`project_media` 未被删除。
- 隔离数据库 fixture（照 `scripts/fixtures/stone-workspace.sql` 的做法新建 `scripts/fixtures/project-blocks.sql`）：旧形状项目 → 迁移 → 回填计数相等、草稿改形、保存 / 发布 / 归档块、石材引用守卫。
- **视觉回归**：对现有 15 个已发布项目，迁移前后 `ProjectData`（去掉 id / 时间戳）必须相等；在隔离库上用生产数据的脱敏导出或本地 seed 证明，并写进 WORKLOG。

---

## 3. 阶段（Phase 1 的三个 PR）

### 3.1 PR 1A · 共享块系统 + 数据层 + 公开页

分支 `claude/project-blocks-1a`。产出：§2.1 迁移、§2.2 schema 模块与 Function 校验、§2.3 渲染器与 DESIGN.md、§2.5 的 RPC / Function / Service / 静态兜底、`src/types/database.ts` 再生成、隔离库 fixture、vitest、守卫更新。后台编辑器此时仍能编译并按新 `blocks` 保存（表单可暂时只支持迁移来的三种媒体块）。

验证：`npm run gate`、`npm run agent:check`、`git diff --check`、`npx vitest run`、`npm run agent:admin-crud-coverage`、`npm run agent:public-supabase-readiness`、隔离库 fixture 通过、视觉回归（§2.6）通过；Preview smoke 通过；Preview 上随机三个项目页与生产逐段文本对照一致（Preview 读生产旧数据、新代码：由于新代码从 `project_blocks` 读，而生产尚未迁移，**Preview 会显示没有正文块**——这是预期，写进 PR 说明，并用本地 stack 截图证明迁移后的渲染）。

### 3.2 PR 1B · 后台块编辑器

分支 `claude/project-blocks-1b`（stacked 在 1A 上）。产出：§2.4 全部 + 14 种块表单 + 帮助文案 + `docs/architecture/projects-admin.md`、`docs/ADMIN_EDITOR_GUIDE.md`、`docs/ADMIN_IA_ACCESS.md`。

验证：上述命令 + `npm run agent:admin-cms-predeploy` + `npm run agent:admin-config-gate`；本地 stack 用 owner 走一遍：新建项目 → 加 heading / text / stats / steps（带图）/ spec_table / stone_cards / image / hotspot_image（打点）/ video / cta → 自动保存 → 刷新保留 → 预览 → 发布 → 公开页逐块读回 → 删一个块再发布 → 公开页同步 → 隐藏项目。用 editor 账号重复保存与发布的权限边界。1440 与 390 截图附 PR。

### 3.3 PR 1C · 发布记录与收尾

把 1A/1B 验收后发现的修正、`docs/agent/tasks.json`（`NOW-PROJECT-BLOCKS-001`，`now` / `release`）、WORKLOG、`npm run agent:state` 汇总到一个小 PR；若 1A/1B 已经干净，可并入 1B。

### 3.4 发布顺序（Claude 主持，执行代理不做）

1. 1A + 1B 验收通过。
2. Claude 把迁移 SHA 报给 Jay 确认。
3. **先应用迁移到生产**（内置自检），SQL 回读：已发布项目块计数、草稿改形、`project_media` 行数未变。
4. 立刻合并 1A（和 1B）。旧运行时在迁移后短暂并存：旧 Function 发来的 `mediaBlocks` 草稿由新 RPC 升级，安全。
5. 生产回读：15 个已发布项目页逐段对照、首页 Latest Projects、一个石材页 "Used in projects"、后台 owner 打开一个项目看 Body 区块；immutable / apex / www 绑定 smoke；记录与状态更新。

---

## 4. 验收清单（Claude 用）

- [ ] 14 种块的 schema、校验（前端 + Function 同 fixture）、渲染器、表单齐全；无新 npm 依赖。
- [ ] 迁移 expand-only、单事务、带自检；`project_media` 未删未改；草稿改形；旧客户端草稿被 RPC 升级。
- [ ] 现有 15 个已发布项目迁移前后公开页一致（证据在 WORKLOG）。
- [ ] 编辑器：加 / 移 / 复制 / 删块、每块表单、预览、自动保存、发布阻断、角色边界，在本地 stack 走通并有截图。
- [ ] DESIGN.md 新节 "Content blocks"；architecture / SCHEMA / ADMIN 文档更新；守卫只加强不放松，改动有记录。
- [ ] `npm run gate`、vitest、admin-crud-coverage、public-supabase-readiness、隔离库 fixture 全绿。
