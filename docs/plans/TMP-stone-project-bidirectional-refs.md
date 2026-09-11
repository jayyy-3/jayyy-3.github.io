# TMP · Stone Library ⇄ Projects 双向引用 · 执行计划

> 临时文档。由 Claude（Fable 5.1）于 2026-09-11 起草，供执行代理（Opus 5）逐阶段推进。三个阶段全部完成并通过 Claude 验收后，由 Claude 删除本文件。本文件不是长期设计权威；长期决策必须写入 `docs/DESIGN.md`、`docs/ARCHITECTURE.md` 等正式文档。

---

## 0. 目标与已定决策

### 0.1 目标（Jay 的原话，已确认）

1. **项目页任意图片都可以直接打点。** 后台不再有独立的 "Material maps" 区块；在 Media 序列里的每张图片上直接开启"材料点"。
2. **公开项目页的点默认安静。** 鼠标悬停 / 触屏点击某个点时，弹出一张小卡片，显示具体的石材、finish、用途，并能直接跳到 Stone Library 对应页面。右侧固定的材料面板取消。
3. **Stone Library 每块石头的公开页面显示"Used in projects"。** 显示项目封面 + 名称 + 匹配的 finish，点击进入项目页；有打点的项目可以直接定位到那个点。
4. **顺手重做后台 Projects 编辑器的割裂之处。** Jay 明确表示现有后台"很割裂和难用"，授权一并重新设计（见 §3）。

### 0.2 Jay 已拍板的决策（不要再问）

| 决策 | 结论 |
| --- | --- |
| Hero 大图是否可打点 | **不需要。** 只有 Media 序列里的图片块可以打点。 |
| 关闭一个图片块的打点时点位如何处理 | **直接删除**（删除前弹确认）。 |
| Stone 页项目卡片是否按当前选中 finish 排序/高亮 | **要。** 匹配当前 finish 的卡片排前并高亮标签。 |
| 旧的 "Material maps and points" 后台区块 | **彻底移除**，不保留只读 legacy 列表。 |
| 推进方式 | 三个阶段顺序推进，每阶段一个 PR。做完后 Claude 验收。 |
| 数据库 | **本计划不含任何 migration。** 数据模型不变。 |

### 0.3 授权边界（写给执行代理）

- **包含**：在分支上实现、本地隔离测试、`git push`、开 PR、Cloudflare 分支 Preview 及其 smoke、更新 docs/agent 状态与 WORKLOG。
- **不包含**：merge 到 `main`（会触发生产部署）、任何生产数据/Storage 写入、真实邮件、DNS、凭据、migration apply。每个 PR 到 Preview smoke 通过后停下，等 Claude 验收 + Jay 批准 merge。
- 若上一阶段的 PR 尚未 merge，下一阶段从上一阶段的分支继续（stacked），不要等待。
- 遵守 `AGENTS.md`、`docs/OPERATING_PROTOCOL.md`、`docs/agent/verification.md`。不要在本任务里顺手做无关重构。

### 0.4 起步

```sh
git checkout claude/stone-project-bidirectional-refs-36abca   # 本计划所在分支
npm install
npm run agent:init
```

必读：`AGENTS.md`、`docs/OPERATING_PROTOCOL.md`、`docs/agent/verification.md`、`docs/DESIGN.md`（§Projects、§Stone Library、§Admin、§Component Rules）、`docs/ARCHITECTURE.md`（§Stone Library Detail Interaction Contract、§Project Data Contract）、`docs/ADMIN_IA_ACCESS.md`（Projects 行）。

---

## 1. 现状速览（执行前必须理解）

### 1.1 数据模型（Supabase，**不改**）

| 表 | 作用 | 关键列 |
| --- | --- | --- |
| `project_materials` | 项目材料清单 | `stone_group_id`, `stone_variant_id`, `finish_definition_id`, `application`, `note`, `claim_status` |
| `project_material_maps` | "材料图"：一张图 + 标题/intro | `media_asset_id`, `title`, `intro`, `sort_order`, `status` |
| `project_hotspots` | 点位，挂在材料图下，指向一条材料 | `project_material_map_id`, `project_material_id`, `hotspot_key`, `x_percent`, `y_percent`, `application`, `note` |
| `project_media` | 页面媒体块（有序） | `media_role` ∈ `normal_image` / `hotspot_image` / `youtube_video`；`hotspot_image` 必须带 `project_material_map_id`，其 `media_asset_id` 由 RPC 从 map 复制 |

- 写入只经过 service-role RPC（`supabase/migrations/20260719015649_project_aggregate_drafts.sql`），入口是 Cloudflare Function `functions/_lib/admin-projects.js`。私有草稿存 `private.project_drafts`（整份 aggregate JSON）。
- 公开 RLS：匿名可读已发布项目的 materials / maps / hotspots（`20260802105537_project_aggregate_write_lockdown.sql` 第 100–125 行）。
- Stone 侧已有 `private.stone_reference_guard`：被已发布项目引用的石头/finish 不能被隐藏。**反向引用不需要新的完整性机制。**

### 1.2 前端草稿模型

`src/features/projects/projectAggregate.ts`：`ProjectAggregateDraft = { project, facts, materials, maps, mediaBlocks, hotspots }`。

- `ProjectMediaBlockDraft.mediaRole === 'hotspot_image'` 时 `mediaAssetId` 必须为 `null`，`projectMaterialMapKey` 指向一个 `maps[]` 项；图片来自 map。
- `ProjectHotspotDraft.projectMaterialMapKey` 指向 map；`projectMaterialKey` 指向 material（可为 null，发布时必须非 null）。
- `draftToProjectData()` 把草稿映射成公开 `ProjectData`（预览与公开页共用渲染器）。没有被任何 `hotspot_image` 块引用的 map 会被**自动追加**到 media 序列末尾——`ProjectService.ts` 的公开读取也有同样逻辑。
- `normalizeProjectDraftForSave()` 在保存前清空 `hotspot.label` / `previewMediaId` 等项目侧覆盖字段（这是既有合同，检查脚本会验证，不要改回去）。
- 发布阻断：`getProjectPublishBlockers()`（客户端）与 `assertPublishDraft()`（服务端）双份。

### 1.3 后台编辑器现状

`src/pages/admin/AdminProjectsPage.tsx`（列表 + 加载/保存编排，1309 行）→ `src/pages/admin/projects/ProjectEditor.tsx`（1883 行）。

五个手风琴区块（同一时间只开一个）：Hero and overview / Facts / Material schedule / Project media / Material maps and points。要做一张带点的图，要先在 Maps 建 map（选图、打点），再回 Media 加一个 "Interactive material image" 块把它关联进来。点位必须先在 Materials 区块建好材料才能选。团队/交付字段（Client、Landscape architect、Contractor、Address、Quantity、Carbon）放在 Overview，而自由 facts 列表在 Facts——公开页却把它们渲染在同一个 "Project Information" 里。

### 1.4 公开页现状

- `src/components/projects/ProjectPageView.tsx` → `ProjectMedia` 渲染 media blocks；`hotspot_image` → `src/components/projects/ProjectHotspotImage.tsx`。
- `ProjectHotspotImage` 现在：图上有 hover 显示 "Stone / Finish" 小标签的圆点，**同时**有右侧 sticky 的 inspector（缩略图、名称、finish、application、note、"View in stone library" 链接）；移动端 inspector 在图下 + 按钮列表。石材名称/finish 图片通过 `StoneLibraryService.getPublishedStoneDetail()` 解析。
- 公开 hotspot 的 `id`：CMS 项目为 `hotspot_key`（形如 `hotspot:123` 或 `hotspot:new:<uuid>`），静态项目为 `projectData.ts` 里的字符串（如 Moon Gate）。**含冒号，URL 中要 encode。**
- `src/pages/StonePageView.tsx` 被公开详情页与后台 Stone 工作区预览共用（后台传 `preview`）。
- `ProjectService.getAll()` 一次拉取全部已发布项目（含 materials / maps / hotspots）并与 `src/data/projectData.ts` 的静态 fallback 合并；静态 Moon Gate 带 `materials` 与 hotspot 的 `stoneGroupId`/`finishKey`。

### 1.5 会咬人的现有检查

- `scripts/check-admin-projects-aggregate.mjs`（2388 行）：源码级断言。与本计划相关的：
  - 要求 `ProjectEditor.tsx` 含 `label="Variant"`、`finishCapabilities.some`、`stone-library-material-preview`；
  - 要求含 ``key={`map-${selectedMap.key}`}``（"stable selected-map media identity"，Phase 2 要改成等价的新断言，见 §3.6）；
  - 禁止 `Point detail image`、`Material detail image`、`Point title`、`ProofReviewControl`；
  - 要求 action bar 有 `Save` / `Publish` / `Hide`；
  - 要求 `ProjectDraftPreview.tsx` 用 `ProjectPageView` + `previewMode` + `ProjectService.getAll()`。
- `scripts/check-stone-library-detail-integrity.mjs`：要求 `StoneLibraryDetailPage.tsx` 保留 `setDetail((current) => current?.stoneGroupId === stoneGroupId ? current : null` 和 `status === 'loading' && !detail`；要求 `StonePageView.tsx` 的 `aria-label="Stone selection"` 之后先 `<VariantSwitch` 再 `<FinishAccordion`。
- `scripts/check-harness.mjs`（`npm run agent:check`）：`docs/ADMIN_EDITOR_GUIDE.md` 必须含特定文案且不能回退旧术语；改文档后必须跑。
- `scripts/local-journeys/projects.mjs`：Playwright 合成流程，依赖按钮文案 `New project` / `Save` / `Publish` / `Hide`、textbox 名 `Project title` / `Opening line` / `Project story`、`Choose image` / `Upload original`。Phase 2 若改文案必须同步。
- 本地 fixtures（`scripts/_lib/local-fixtures.mjs`）**不种入 stone 数据**；发布带点的项目需要已发布的 stone/variant/finish/finish image。执行 Phase 2 前先查本地库（`npm run local:start` 后查询 `stone_groups` / `stone_finish_images`）再决定 journey 能否走到 Publish。

---

## 2. Phase 1 · 公开页：点卡片 + Stone 页 "Used in projects" + 深链

**范围**：纯前端，无 schema、无后台改动。**PR 标题建议**：`feat(public): hover point cards, stone usage section and point deep links`。

### 2.1 `src/components/projects/ProjectHotspotImage.tsx`（重写）

Props 保持 `image / imageAlt / title / intro / caption / hotspots`，新增：

```ts
focusHotspotId?: string | null;   // 深链：初始置顶并滚动到该点
anchorId?: string;                // figure 的 DOM id，供滚动定位
```

行为：

- **默认状态**：图片干净。点 = 直径 28px 圆形 `button`，白底、2px lime（`var(--urblo-lime)`）描边、中心小黑点；不显示编号；无右侧面板。
- **状态模型**：`activeId`（hover / focus 触发，瞬时）与 `pinnedId`（click / tap 切换，持久）。`openId = pinnedId ?? activeId`。只有 `openId` 对应的卡片渲染为可见。
- **卡片**（每个点一张，DOM 上紧跟在它的 `button` 之后，包在同一个 wrapper `div` 里）：
  - 宽度 `w-[260px] max-w-[calc(100vw-2rem)]`，白底、`border border-black/10`、`shadow-[0_14px_30px_rgba(0,0,0,0.12)]`、无圆角或 ≤4px。
  - 内容自上而下：72px 方形 finish 缩略图（`img loading="lazy"`，无图时留空黑底）；石材名（`text-[17px] font-semibold`）；finish 标签（`urblo-meta` 风格小写间距大写）；"Where it is used" → `application`；`note` 可选，最多两行（`line-clamp-2`）；底部链接 **View stone** → `/stone-library/{stoneGroupId}?variant={stoneVariantId}&finish={finishKey}`（沿用现有 `activeHref` 拼法）。
  - **定位翻转**：`x > 55` 时卡片右对齐点（`right: calc(100% - x%)`），否则左对齐（`left: x%`）；`y > 60` 时卡片出现在点上方（`bottom: calc(100% - y%)` + 上移 22px），否则在下方（`top: y%` + 下移 22px）。卡片 `z-20`，marker `z-10`。
  - 指针移到卡片上不应关闭（wrapper 上处理 `onMouseEnter` / `onMouseLeave`，离开 wrapper 才清 `activeId`）。
- **触屏**：`onClick` 切换 `pinnedId`（同一点再点一次关闭）；`document` 上 `pointerdown` 落在 figure 之外时清 `pinnedId`。不依赖 hover。
- **键盘/无障碍**：button 带 `aria-label="Point N: {stone} / {finish}"`、`aria-expanded={open}`、`aria-controls={cardId}`；focus 时打开卡片；Tab 顺序 button → 卡片内链接；`Escape` 清空 `pinnedId` 与 `activeId`。卡片容器 `role="group" aria-label="{stone} {finish} details"`。
- **图例**：图片下方一行 `<ol>`，每项一个小 button：`01 Angola Black · Polished`（`urblo-meta` 风格，`text-[11px]`）。点击 = pin 该点并 `scrollIntoView({block:'nearest'})` 到 marker。这是无 hover 场景的兜底，也是可索引文本。桌面与移动端都渲染。
- **深链**：`focusHotspotId` 命中时，首次挂载后 `pinnedId = focusHotspotId`，并对 figure 执行一次 `scrollIntoView({ behavior: 'smooth', block: 'center' })`。只做一次（`useRef` 守卫）。
- **删除**：右侧 `<aside>` inspector、`lg:grid-cols-[minmax(0,1fr)_360px]` 布局、移动端按钮列表（被图例取代）。组件变为单列：可选标题/intro 头部 → figure（图 + 点 + 卡片）→ 图例 → caption。
- 石材解析逻辑（`resolveHotspot` / `getPublishedStoneDetail`）**保留**。
- 设计约束：不要让卡片或标签在默认状态遮挡材质（`docs/DESIGN.md` §Imagery）；lime 只做信号色。

### 2.2 `src/components/projects/ProjectPageView.tsx`

- 新增 prop `focusHotspotId?: string | null`；`ProjectMedia` 找到包含该 hotspot 的 `hotspot_image` 块，把 `focusHotspotId` 与 `anchorId={`project-media-${block.id}`}` 传给 `ProjectHotspotImage`；其他块传 `null`。
- `previewMode` 下忽略 `focusHotspotId`（预览不需要深链）。
- 其余结构不动（`FeaturedMaterials` 保留，作为完整材料清单）。

### 2.3 `src/pages/ProjectDetails.tsx`

- `const [params] = useSearchParams(); const focusHotspotId = params.get('point');` 传给 `ProjectPageView`。
- 注意 `src/App.tsx` 的 `ScrollRestoration` 只在 pathname 变化时回顶；我们的滚动在数据加载后执行，会覆盖它，无需改 App。

### 2.4 `src/service/ProjectService.ts`

- `getAll()` 增加**并发去重**（in-flight promise 复用，完成后清空；**不做 TTL 缓存**，与 `StoneLibraryService.getCatalogue()` 的做法一致）。这样 Stone 页与 Projects 页来回切换时不重复拉取同一批请求。
- 新增导出类型与方法：

```ts
export interface StoneProjectUsage {
  project: ProjectData;
  finishKeys: string[];            // 该项目中这块石头用到的 finish（去重，保持出现顺序）
  applications: string[];          // 对应的 application 文案（去重）
  pointRef: { hotspotId: string; blockId: string } | null; // 第一个含该石头的点
}
static async getProjectsUsingStone(stoneGroupId: string): Promise<StoneProjectUsage[]>
```

  - 基于 `getAll()` 结果；用 `toCanonicalContentKey` 比较 `stoneGroupId`。
  - 匹配来源：`project.materials[]` **和** `project.mediaBlocks[]` 中 `type === 'hotspot_image'` 的 `hotspots[]`（静态项目可能只在其中一处有数据）。
  - 顺序沿用 `getAll()` 的顺序，稳定。
  - 任何读取失败返回 `[]`，不抛。

### 2.5 新建 `StoneProjectsSection.tsx`（放在 `src/components/stone-library/` 目录下）

Props：`stoneName: string; usages: StoneProjectUsage[]; activeFinishKey: string | null; finishLabelByKey: ReadonlyMap<string, string>`。

- `usages.length === 0` → `return null`（**不渲染空占位**）。
- 结构：`<section>` + `urblo-page-container`；eyebrow `Used in projects`；标题沿用 Stone 页 Enquiry 区块的 display 风格（`font-display uppercase`），文案建议 `Seen on site`。
- 卡片网格：`grid gap-5 md:grid-cols-2 xl:grid-cols-3`。每张卡：
  - 整卡是 `<Link to={`/projects/${slug}`}>`：`ProjectResponsiveImage profile="card"` 4:3、项目标题、`location / year`、finish 标签行（每个 finish 一个小 chip；`finishKey === activeFinishKey` 时 chip 用 lime 边框/底色高亮，其余 `border-black/15`）。
  - `pointRef` 存在时，在卡片**外部**（避免嵌套 `<a>`）渲染一个次级链接 **See placement** → `/projects/${slug}?point=${encodeURIComponent(hotspotId)}`。
- 排序：`usages` 先按"包含 `activeFinishKey`"分组（匹配的在前），组内保持原顺序。
- 参考视觉：`src/pages/Projects.tsx` 的 `ProjectsGridCard`（保持等比裁切、`urblo-meta` 元信息）。

### 2.6 `src/pages/StonePageView.tsx`

- 新增可选 prop `projectUsages?: StoneProjectUsage[]`。
- 在 `<SpecsPanel …/>` 之后、`</section>` 关闭前渲染 `<StoneProjectsSection …/>`（即位于规格面板之后、Enquiry 之前），`activeFinishKey={activeFinish?.finishKey ?? null}`，`finishLabelByKey` 由 `detail.finishCapabilities` 构建。
- `preview === true` 时不渲染（后台预览不请求项目数据）。
- **不要动** `aria-label="Stone selection"` 区块内的顺序（检查脚本断言）。

### 2.7 `src/pages/StoneLibraryDetailPage.tsx`

- 新增独立 effect：按 `stoneGroupId`（不含 variant）调用 `ProjectService.getProjectsUsingStone`，成功 `setUsages`，失败 `setUsages([])`；不阻塞 detail 的加载状态。
- 把 `usages` 传给 `StonePageView`。
- **保持**检查脚本要求的两段代码原样。

### 2.8 验证（Phase 1）

```sh
npm run agent:verify -- --plan          # 确认分类为 runtime，看图里包含哪些检查
npm run gate                            # 干净 Node 20 容器：build/lint/tsc/smoke/harness/aggregate/stone 等
git diff --check
```

浏览器 QA（`npm run dev`，或 `npm run local:dev` 走本地栈）：

| 路由 | 检查点 |
| --- | --- |
| `/projects/moon-gate-woolley-street` | 默认无卡片、无右侧面板；hover 点出卡片，靠右/靠下的点卡片翻转不出画；点击卡片内 View stone 跳转带 `variant`/`finish`；Esc 关闭；Tab 可到链接；图例可点 |
| 同上，375px 视口 | tap 开/关卡片；点击空白关闭；卡片不超出视口 |
| `/stone-library/angola-black` | 出现 Used in projects，含 Moon Gate 卡片，Polished chip 高亮（默认 finish 若非 Polished，切换 finish 后高亮变化且卡片重排）；See placement 链接存在 |
| 点击 See placement | 项目页打开，页面滚到对应图，该点卡片已置顶打开 |
| `/stone-library/<无项目引用的石头>` | 该区块完全不渲染 |
| `/admin/stone-library` 预览 | 预览里不出现 Used in projects，无额外网络请求 |

记录：截图路径（放 `.tmp/`，在 WORKLOG 里描述而非提交）、浏览器 console 无错误、Stone 页新增的网络请求数。

### 2.9 文档（Phase 1 随 PR 一起）

- `docs/ARCHITECTURE.md` §Project Data Contract → "Project hotspot component" 小节：改写为卡片交互 + `?point=` 深链合同；§Stone Library Detail Interaction Contract 末尾新增 "Used in projects" 合同（数据来自 `ProjectService.getProjectsUsingStone`，客户端过滤，含静态 fallback，预览不渲染，空则不渲染）。
- `docs/DESIGN.md` §Projects：把 "material/finish hotspot inspector" 的描述改为点卡片规则；§Stone Library：新增 Used in projects 卡片规则（按当前 finish 排序高亮、See placement、无空态）。文末追加一条 `## Project material points and stone usage — 2026-09-11` 决策记录（写明 Jay 的四条决策）。
- `docs/agent/tasks.json`：新增任务 `NOW-STONE-PROJECT-REFS-001`（`status: now`，`modules: ["projects","stone-library"]`，acceptance 与本计划 §5 一致，`phase` 随阶段推进更新），然后 `npm run agent:state` 重新生成 HANDOFF / NEXT_STEPS / README 状态块，`npm run agent:state:check`。
- `docs/WORKLOG.md`：新增 `## 2026-09-xx — Stone/Project references phase 1` 段，记录范围、检查结果、Preview URL、残余风险。

### 2.10 交付

push → PR（描述末尾附 `🤖 Generated with [Claude Code](https://claude.com/claude-code)`）→ CI 绿 → Preview smoke：`npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.urblo-site.pages.dev` → 在 Preview 上复跑 §2.8 的浏览器 QA（只读）→ 停下等验收。

---

## 3. Phase 2 · 后台：Projects 编辑器重做（不改数据库）

**范围**：`src/pages/admin/projects/*`、`src/pages/admin/AdminProjectsPage.tsx`、`src/features/projects/projectAggregate.ts`、相关检查脚本与文档。**服务端 `functions/_lib/admin-projects.js` 与 RPC 不改**（草稿 JSON 结构不变）。**PR 标题建议**：`feat(admin): points on any project image, unified media section`。

### 3.1 新的编辑器结构

四个区块，按公开页顺序排列。**默认全部展开**，每个可单独折叠（允许多开）；编辑器顶部加一条 sticky 的区块导航条（"section rail"）：显示区块名、条目数、以及有发布阻断时的琥珀色小点；点击滚动到区块并展开。`openSection: Section | null` 改为 `collapsed: Set<Section>`。

| 区块 id | 标题 | 内容 |
| --- | --- | --- |
| `overview` | Hero and overview | Project title、Location、Project date、Completion date、Opening line、Project story、Main project image、Project listing image、Page address |
| `facts` | Project information | 先固定字段网格：Client、Landscape architect、Contractor、Address、Quantity、Carbon offset（+ Carbon note）；再 "Additional facts" 自由列表（现有 facts 的增删排序） |
| `media` | Page images and video | 有序媒体块；**图片块可直接开启材料点**（§3.2） |
| `materials` | Material schedule | 材料清单 + 每条显示 "Used at N points" |

`ProjectEditorSection` 类型改为 `'overview' | 'facts' | 'media' | 'materials'`；`getProjectPublishBlockers()` 里原本指向 `'maps'` 的阻断改指 `'media'`，文案改为面向图片块（例：`Choose a described image for every media block.`、`Connect every point to a material and say where it is used.`）。`openAndScroll(section)` 需要先展开再滚动。

### 3.2 Media 区块的图片块

每个块一张卡片：左侧缩略图（视频块显示图标），右侧字段。头部：`Block N · Image | Video`，开启打点后追加一个 pill `N material points`；右侧 OrderControls + RemoveButton。

- 顶部按钮：`Add image`、`Add video`（已有视频时禁用）。**删除** "Interactive material image" 这个类型选项；类型下拉只剩 Image / Video（或直接用两个 Add 按钮 + 不可改类型，任选其一但要一致）。
- 图片块字段：`InlineMediaField`（图片）、Title（可选，打点图作为图上方标题）、Label（可选，仅普通图片显示为 meta 行）、Caption。
- 图片块底部按钮：**Mark materials on this image** → 调用 `enableMediaBlockPoints`，展开打点区域：
  - 左：`VisualHotspotEditor`（现有组件，`hotspots = hotspotsForBlock(draft, block.key)`）。
  - 右："Selected point" 面板：Material 下拉（选项 = `draft.materials`，末尾固定一项 `＋ Add new material…`，选中即调用现有 `addMaterial()` 逻辑创建材料并把该点指向它，同时在面板内展开该材料的编辑字段）；`Where it is used`（placeholder 显示所选材料的 application，空表示沿用材料文案）；`Point note`；`StoneLibraryMaterialPreview`（现有）；OrderControls（同图内点序 = 图例编号）+ Remove point。
  - 打点区域底部：**Remove points from this image**（`window.confirm` 说明将删除 N 个点）→ `disableMediaBlockPoints`。
- 打点块换图：`InlineMediaField.value = mediaBlockImageId(draft, block)`，`onChange → setMediaBlockImage`；换图后显示一行提示 `Points keep their positions. Check they still sit on the right materials.`
- 删除打点块：`confirm` 提示会一起删除 N 个点 → `removeMediaBlock`（级联删 map + hotspots）。
- 材料字段抽成共享组件 `MaterialFields`（Stone / Variant / Finish / Where it is used / Material note / 预览），Materials 区块与点面板共用。**保留**检查脚本要求的 `label="Variant"`、`finishCapabilities.some`、`stone-library-material-preview` 字样（若这些代码迁到新文件，同一 PR 里把 `check-admin-projects-aggregate.mjs` 对应断言改到新文件路径，并在 PR 描述说明）。

### 3.3 Materials 区块

- 每条材料显示 badge：`Used at N points` / `Not placed on any image yet`（`countHotspotsForMaterial`）。
- 删除被点引用的材料时 `confirm`：`N points will lose their material`；行为沿用现有（点的 `projectMaterialKey` 置 null → 成为发布阻断）。

### 3.4 `src/features/projects/projectAggregate.ts` 新增纯函数（全部导出，供检查脚本单测）

```ts
mediaBlockImageId(draft, block): number | null            // hotspot_image 取 map 图，否则取 block 图
hotspotsForBlock(draft, blockKey): ProjectHotspotDraft[]  // 按 sortOrder
countHotspotsForMaterial(draft, materialKey): number
enableMediaBlockPoints(draft, blockKey)  // 新建 map{mediaAssetId: block.mediaAssetId, title: block.blockTitle}，block → {mediaRole:'hotspot_image', mediaAssetId:null, projectMaterialMapKey:map.key}
disableMediaBlockPoints(draft, blockKey) // 删该 map 的 hotspots 与 map；block → {mediaRole:'normal_image', mediaAssetId: map.mediaAssetId, projectMaterialMapKey:null}
setMediaBlockImage(draft, blockKey, mediaAssetId) // 打点块改 map.mediaAssetId，否则改 block.mediaAssetId
removeMediaBlock(draft, blockKey)        // 打点块级联删 map + hotspots；普通块只删块
adoptLegacyMaterialMaps(draft)           // 每个未被任何 hotspot_image 块引用的 map，追加一个 hotspot_image 块（blockTitle = map.title），顺序追加在末尾（与公开页自动追加语义一致）
```

- `normalizeProjectDraftForSave()` 追加：对每个被引用的 map，`title = 关联块.blockTitle || map.title`，`intro = ''`（intro 字段退役，公开页 `intro` 为空即不渲染）。
- `normalizeProjectDraftOrder()` 不变（hotspot 在 map 内的 sortOrder 即图例编号）。
- `draftToProjectData()` 的自动追加逻辑保留（无害）。

### 3.5 `src/pages/admin/AdminProjectsPage.tsx`

- 加载 envelope 后，对 `draft` **与** `baseline` 同时应用 `adoptLegacyMaterialMaps`，这样旧项目打开时不显示 "Unsaved changes"，下次保存自然持久化。
- 其余（保存、发布、冲突、导航守卫）不动。

### 3.6 检查脚本

- `scripts/check-admin-projects-aggregate.mjs`：
  - 把 ``key={`map-${selectedMap.key}`}`` 断言改为等价的新断言（意图：每个打点块的 `InlineMediaField` 有稳定的 `instanceKey`/`key`，pending 上传不会串块），例如要求 ``instanceKey={`media-${block.key}`}``。
  - 新增纯函数单测（用 `createEmptyProjectAggregateDraft()` 构造）：enable→disable 往返后块恢复原样且无残留 map/hotspot；`adoptLegacyMaterialMaps` 对未引用 map 生成块、对已引用 map 不重复；`removeMediaBlock` 级联；`normalizeProjectDraftForSave` 同步 map.title 并清空 intro；`getProjectPublishBlockers` 不再产生 `section: 'maps'`。
  - 保留全部现有 forbid 断言。
- `scripts/local-journeys/projects.mjs`：在现有流程中扩展：新建项目 → 上传图片块 → `Mark materials on this image` → 点击 `project-hotspot-canvas` 加点 → 在 Material 下拉选 `＋ Add new material…`（若本地库有已发布 stone）或已有材料 → 填 `Where it is used` → Save → reload → 断言 GET envelope 的 `mediaBlocks[0].mediaRole === 'hotspot_image'` 且 `hotspots.length === 1`。若本地库没有可发布的 stone/finish image，则断言发布阻断文案出现，并在 WORKLOG 记录该限制；否则继续 Publish → 公开页出现 `role=button` 且 `aria-label` 以 `Point 1:` 开头 → Hide。
- 若改动了 journey 依赖的按钮/文本框文案，同步更新。

### 3.7 文档

- `docs/ADMIN_EDITOR_GUIDE.md` Projects 行：`Overview/Facts/Materials/Media/Maps` → `Overview / Project information / Page images and video / Material schedule`，并写一句"在任意图片块上点 Mark materials on this image 即可打点"。改完必须 `npm run agent:check`。
- `docs/ADMIN_IA_ACCESS.md` 第 34 行与第 180 行段落中关于 Maps 区块的措辞同步。
- `docs/PROJECT_MAP.md` Projects 行的"入口 → 业务层"描述若提及 Maps 则更新。
- `docs/ARCHITECTURE.md` §Project Data Contract：补一段 "Admin points-on-image contract"（map 是图片块的隐式子对象；`adoptLegacyMaterialMaps` 的加载期收编；intro 退役）。
- `docs/DESIGN.md` §Admin：记录新的四区块结构与 section rail。
- `docs/agent/verification.md` "For Project Stone Library material-point changes, also verify" 列表：加入"任意图片块可开启/关闭材料点、换图保留点位、legacy map 收编不产生脏状态"。
- `docs/agent/tasks.json` 任务 notes / phase 更新；`npm run agent:state`；WORKLOG 记录。

### 3.8 验证（Phase 2）

```sh
npm run agent:verify -- --plan
npm run gate
npm run local:start && npm run local:verify      # Node 22；含 local:journeys（Projects 合成流程）
git diff --check
```

浏览器 QA（本地栈，真实登录）：

1. 打开一个**已有** map 的旧项目：Media 里出现对应打点块、pill 显示点数、状态为 "All changes saved"（不脏）。
2. 新图片块 → Mark materials → 点图加点 → 新建材料 → Save → 刷新 → 点与材料都在。
3. 换图 → 提示出现，点位保留。
4. Remove points → 确认 → 块变普通图片，图片不变。
5. Publish（若本地有可发布 stone）→ 公开页该图有点与卡片 → Hide。
6. 发布阻断点击后滚到 Media 区块并展开。
7. 1116px 与 375px 视口下 section rail 与卡片布局可用。

### 3.9 交付

同 §2.10。PR 描述里列出：删除的 Maps 区块、`adoptLegacyMaterialMaps` 的语义、检查脚本改动理由。

---

## 4. Phase 3 · 收尾：清理、度量、文档收口、发布证据

**范围**：无新功能。**PR 标题建议**：`chore: stone/project references cleanup, docs and release evidence`。

### 4.1 代码清理

- `src/components/projects/ProjectMaterialMap.tsx`：确认无引用后删除；`docs/ARCHITECTURE.md` 中 "Legacy wrapper" 一句同步删除。
- `ProjectEditor.tsx` 中 Phase 2 后残留的 `mapTabId` / `mapPanelId` / `handleMapTabKeyDown` / `selectedMap*` 等死代码清理；ESLint 必须干净。
- 若 `ProjectEditor.tsx` 仍 > 1200 行，把 Media 区块（含点面板）与 Materials 区块拆到 `src/pages/admin/projects/` 下新建的 `sections/` 子目录，行为不变；相应更新检查脚本路径。
- `npm run agent:harness-gc` 与 `npm run agent:harness-gc:review`：处理其指出的与本任务相关的陈旧措辞。

### 4.2 性能度量（决定是否需要后续 RPC）

- 在 Preview 上打开 `/stone-library/angola-black`，记录：网络请求总数、`ProjectService.getAll()` 引入的请求数与耗时、页面可交互时间。
- 判定：若引入 > 6 个请求或额外 > 400 ms，在 `docs/agent/tasks.json` 新增 `NEXT-STONE-PROJECTS-RPC-001`（`status: next`）：新增 `public_stone_projects(stone_key)` SECURITY DEFINER RPC，仿 `public_stone_catalogue`，只返回已发布且 `claim_review_status='approved'` 的项目摘要 + 匹配 material/hotspot；客户端再合并静态 fallback。**本计划不实现它**（需要 migration 授权）。若未超阈值，只在 WORKLOG 记录数据，不建任务。

### 4.3 文档收口

- 复核 Phase 1/2 写入的 `ARCHITECTURE.md` / `DESIGN.md` / `ADMIN_EDITOR_GUIDE.md` / `ADMIN_IA_ACCESS.md` / `PROJECT_MAP.md` / `verification.md` 与最终代码一致。
- `docs/agent/tasks.json`：`NOW-STONE-PROJECT-REFS-001` 的 `phase` 置为 `awaiting_external`，`nextAction` 写 "Claude acceptance, then Jay merge approval"，`blocker` 留空或写明未 merge 的 PR 编号。
- `npm run agent:state` + `npm run agent:state:check` + `npm run agent:check`。
- WORKLOG 记录三个阶段的 PR 编号、CI run id、Preview URL、smoke 结果。

### 4.4 验证

```sh
npm run agent:verify -- --plan
npm run gate
git diff --check
```

### 4.5 交付

同 §2.10。停下等 Claude 验收。

---

## 5. Claude 验收清单（执行代理需保证以下全部可复现）

**公开页**
- [ ] 打点图默认无卡片、无侧栏；hover / focus 出卡片；tap 开关；Esc 关闭；卡片翻转不出画；卡片内 View stone 链接带 variant+finish。
- [ ] 图例存在且可点；移动端 375px 可用。
- [ ] `/projects/<slug>?point=<id>` 滚到对应图并置顶该点。
- [ ] Stone 页 Used in projects：有引用时显示、无引用时不渲染；按当前 finish 排序高亮；See placement 深链正确；后台预览不显示。
- [ ] Featured Materials 区块仍在。

**后台**
- [ ] 无 Maps 区块；四区块默认展开、可折叠、section rail 可跳转并显示阻断点。
- [ ] 任意图片块可开启/关闭材料点；关闭删除点；换图保留点位并提示；删除打点块级联。
- [ ] 点面板可就地新建材料；Materials 区块显示每条材料的点数。
- [ ] 旧项目（已有 map）打开不脏，打点块正确显示；保存后持久化。
- [ ] 发布阻断指向 media/materials，无 `'maps'`。
- [ ] 服务端 Function 与 RPC 未改动（`git diff --stat main -- functions supabase` 为空）。

**工程**
- [ ] 每阶段 PR：CI 绿、`npm run gate` 通过、Preview smoke 通过、`git diff --check` 干净。
- [ ] Phase 2 的 `local:verify` 通过（或明确记录本地 stone 数据限制）。
- [ ] 检查脚本改动有理由说明；forbid 断言全部保留。
- [ ] 文档与 tasks.json / WORKLOG 更新完整；`npm run agent:check` 通过。
- [ ] 无 migration、无生产写入、未 merge（除非 Jay 明确批准）。

验收通过后：Claude 删除本文件（`docs/plans/TMP-stone-project-bidirectional-refs.md`）并提交。
