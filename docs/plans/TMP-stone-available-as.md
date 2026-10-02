# TMP · Stone Library "Available as"（Blocks / Pavers / Cladding）· 执行计划

> 临时文档。由 Claude（Fable 5.1）于 2026-10-03 起草，供执行代理（Opus 5）逐阶段推进。全部阶段完成并通过 Claude 验收后，由 Claude 删除本文件。长期决策必须写入 `docs/DESIGN.md`、`docs/architecture/stone-library.md`、`docs/architecture/stone-library-admin.md`、`docs/SUPABASE_SCHEMA.md` 等正式文档。

---

## 0. 目标与已定决策

### 0.1 目标（Jay 的原话，已确认）

把每块石材现在的 "Available / Upcoming" 状态，换成"这块石材可以做成哪些产品形态"的清单：

- Blocks
- Pavers
- Cladding

清单项在后台可以增删改序（将来可能 3 项、5 项或更多）。每块石材在后台勾选自己提供哪些形态。当前所有已上线石材默认三项全选。

### 0.2 Jay 已拍板的决策（不要再问）

| 决策 | 结论 |
| --- | --- |
| 旧的 Available / Upcoming（`active` / `tbc`）石材状态 | **彻底移除。** 公开页、对比页、QR 页、后台编辑器都不再出现这个状态。 |
| 列表卡片左上角的状态角标 | **去掉**，不用形态清单替代。 |
| 详情页的展示方式 | **列出全部已发布的形态选项，并明确标出每一项是 Offered 还是 Not offered。** 不是只列勾选项。 |
| 字段标题 | 公开页卡片标题 **"Available as"**。 |
| 每项取值 | **简单勾选（布尔）**，不做 yes / tbc / no 三态。 |
| 选项管理位置 | 后台 Stone Library 列表页顶部一个 **"Available as options"** 区块，仅 owner / admin 可改；editor 只读。 |
| 上线默认值 | **已单独批准生产写入：** 所有已上线石材直接改为三项全部 Offered（写进已发布数据，不只是草稿）。 |

### 0.3 明确不在范围内

- Finish capability 行上的 "Available / Upcoming / No" 文案与 pill（这是 finish 级能力，不是石材级），以及对比页 finish 图例的 "Available / To be confirmed / Not offered"，**保持不变**。
- Cut options 行的 "Available / No" pill 保持不变。
- 不做按形态筛选（FilterBar 不加 facet）。可记入 `docs/NEXT_STEPS.md` 作为候选。
- 不删除任何数据库列（`stone_groups.availability_status` 保留但不再使用；详见 §2.1）。
- 不改 Products / Projects / Articles 模块。

### 0.4 授权边界（写给执行代理）

- **包含**：在分支上实现、本地隔离测试（含 `agent:stone-workspace` 的隔离数据库测试）、`git push`、开 PR、Cloudflare 分支 Preview 及其 smoke、更新 docs/agent 状态与 WORKLOG。按 Jay 的常规授权，验证通过的 PR 可以直接 merge 到 `main`（见 Phase 4 的顺序要求）。
- **不包含**：对生产 Supabase 应用 migration、任何生产 Storage 写入、真实邮件、DNS、凭据。生产 migration 由 Claude 在 Phase 4 按本计划里写明的顺序，拿到 Jay 对**具体 SHA** 的确认后执行。
- 遵守 `AGENTS.md`、`docs/OPERATING_PROTOCOL.md`、`docs/agent/verification.md`。不要顺手做无关重构。

### 0.5 起步

```sh
git checkout main && git pull --ff-only
git checkout -b claude/stone-available-as
npm install
npm run agent:init
```

必读：`AGENTS.md`、`docs/OPERATING_PROTOCOL.md`、`docs/agent/verification.md`、`docs/DESIGN.md`（§Stone Library、§Admin、§Component Rules）、`docs/architecture/stone-library.md`、`docs/architecture/stone-library-admin.md`、`docs/ADMIN_EDITOR_GUIDE.md`（Stone Library 部分）。

---

## 1. 现状速览（执行前必须理解）

### 1.1 "Available" 现在出现在哪里

| 位置 | 文件 | 现状 |
| --- | --- | --- |
| 详情页 Specs 的 Availability 卡片 | `src/components/stone-library/SpecsPanel.tsx`（`availabilityStatus` / `availabilityLabel` props） | StatusPill `Available` / `Upcoming` + 一句 `Available for project sourcing` |
| 列表卡片左上角角标 | `src/components/stone-library/StoneCard.tsx` | `statusBadgeLabel(stone.status)` |
| 对比页每列表头 | `src/components/stone-library/StoneCompareView.tsx` 约第 510 行 | 同样的 StatusPill |
| 变体切换 rail | `src/components/stone-library/VariantSwitch.tsx` | 每个 variant 一个 `Available` / `Upcoming` pill |
| QR 材料页 | `src/components/image-qr/ImageQrPageView.tsx` 约第 69 行 | **硬编码**的 `Available / For project sourcing` |
| 后台编辑器 §1 Basic information | `src/pages/admin/AdminStoneLibraryPage.tsx` 约第 653 行 | `<select>` `active` / `tbc` |
| 后台列表 | 同上约第 156 行 | `Availability TBC` 徽标 |
| 后台历史对话框 | `src/pages/admin/stone-library/StoneHistoryDialog.tsx` 约第 83 行 | 读 `snapshot.stone.availability` |
| 页面组装 | `src/pages/StonePageView.tsx` 约第 166 行 | 把 `detail.status` / `detail.availabilityLabel` 传给 SpecsPanel |

### 1.2 数据与写入链路（必须沿用）

- 数据库：`public.stone_groups.availability_status`（`active` / `tbc`）、`stone_groups.status` 也可能是 `tbc`。写入**只**经过 service-role RPC `public.admin_stone_workspace(...)`（`supabase/migrations/20260910064551_stone_library_workspace.sql`），入口是 Cloudflare Function `functions/api/admin/stone-library.js` → `functions/_lib/admin-stones.js`。浏览器对四张 Stone 表的 DML 已被 `20260910065803_stone_library_reference_lockdown.sql` 全部撤销。
- 草稿：`private.stone_drafts.draft`（整份 JSON，`schemaVersion: 1`），形状定义在 `src/features/stone-library/stoneDraft.ts`（`StoneDraft.stone.availability`）。`private.stone_current_draft(id)` 从正式表反推草稿；`publish` 分支把草稿写回正式表；`private.stone_history` 存快照。
- 公开读取：`public.public_stone_catalogue()` 一次返回 `managedKeys` / `finishes` / `stones[]`，前端 `src/features/stone-library/stoneDraft.ts` 的 `stoneDraftToDetail()` / `stoneRecordToCard()` 把它映射成 `StoneDetailVM` / `StoneCardVM`（`src/types/stone-library.ts`）。静态兜底是 `data/clean/stone_library.json` → `src/service/StoneLibraryService.ts`（其中 2 条 `status: tbc`）；受管 key 永不回退到静态。
- 全局可编辑清单的现成范式：`public.finish_definitions`（`finish_key` / `display_name` / `sort_order` / `status`）。后台只读它（`?view=finishes`），公开目录只取 `status='published'`。**本计划新表照抄这个形状。**
- 角色：RPC 里 `actor_role` 来自 `admin_profiles`；`viewer` 只读；Function 侧 `actorFor()` 返回 `{ id, role }`，已有 `['owner','admin'].includes(actor.role)` 的分支可参考。
- 对比页：`src/lib/stoneCompareRegistry.ts` 是行注册表，加一条 descriptor 就多一行；cell 类型在同文件 `CompareCell`。
- 现有源码级守卫：`scripts/check-stone-workspace.mjs`（`npm run agent:stone-workspace`，含隔离数据库 fixture `scripts/fixtures/stone-workspace.sql`）、`scripts/check-admin-crud-coverage.mjs`（第 1436 行读取 stone migration 做断言）、`scripts/check-public-supabase-readiness.mjs`（第 556 行同样读取）、`scripts/check-stone-library-detail-integrity.mjs`。改动后这些都要跑过；需要改断言时把原因写进 WORKLOG。
- 类型：`src/types/database.ts` 是 Supabase 生成类型（第 1504 行附近有 `stone_groups.availability_status`），新表 / 新列要同步加进去。

---

## 2. 目标设计

### 2.1 数据模型

**新表 `public.stone_availability_options`**（照 `finish_definitions`）：

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `id` | bigint identity PK | |
| `option_key` | text unique not null | 由名称 slug 化生成，`^[a-z0-9]+(-[a-z0-9]+)*$`，长度 ≤ 60，**创建后不可改** |
| `display_name` | text not null | 长度 ≤ 60 |
| `sort_order` | integer not null default 0 | |
| `status` | text check in (`published`, `archived`) default `published` | 删除 = 归档，不物理删除 |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `archived_at` | 同 `finish_definitions` | |

- RLS：启用；匿名 / authenticated 只能 `select` `status='published'` 的行；所有 DML 对 anon / authenticated 撤销（只走 service-role RPC）。
- 种子：`blocks / Blocks / 10`、`pavers / Pavers / 20`、`cladding / Cladding / 30`。
- 上限：已发布选项 ≤ 24。

**`public.stone_groups` 新列**：`available_as text[] not null default '{}'`，存 `option_key` 数组。公开读取和发布时都要与已发布选项**取交集**，归档的 key 自然消失。

**草稿形状**（`schemaVersion` 维持 `1`，不升版本；用迁移把现有草稿一次性改成新形状）：

- 新增 `draft.stone.availableAs: string[]`（option_key 列表，去重，顺序无意义，渲染时按 `sort_order` 排）。
- 移除 `draft.stone.availability`。Function 校验和 RPC 对传入的 `availability` 一律**忽略并剥离**（兼容旧客户端缓存），`stone_current_draft()` 不再输出它。
- `emptyStone()`（新建石材）默认 `availableAs` = 全部已发布选项的 key（Jay："默认都有这三种"）。

**旧状态的处理**：

- 迁移把所有 `stone_groups.availability_status` 置为 `active`，`stone_groups.status='tbc'` 的行置为 `draft`（后台 list 现在就把 `tbc` 映射成 `draft`，行为不变）。列保留，代码里不再读写；在 `docs/SUPABASE_SCHEMA.md` 标记 deprecated。
- 前端类型：`StoneStatus` 仍保留给 `status` 字段的类型，但 `StoneCardVM.status`、`StoneDetailVM.status`、`StoneDetailVM.availabilityLabel`、`StoneVariantVM.status` **删除**，改为：
  - `StoneDetailVM.availableAs: { key: string; label: string; offered: boolean }[]`（按已发布选项全集展开，顺序 = `sort_order`）
  - `StoneCardVM` 不加形态字段（卡片不显示）。
- 静态兜底：`StoneLibraryService.ts` 用常量 `STATIC_AVAILABILITY_OPTIONS = [blocks, pavers, cladding]`，每块静态石材全部 `offered: true`；`status: tbc` 不再影响渲染。

### 2.2 迁移（一个文件，Phase 1 产出，Phase 4 应用到生产）

`supabase/migrations/<timestamp>_stone_available_as.sql`，单事务，内容按顺序：

1. 建表 `stone_availability_options` + RLS + grants + 种子三项。
2. `alter table public.stone_groups add column available_as text[] not null default '{}'`。
3. **批准的生产回填**：`update public.stone_groups set available_as = array['blocks','pavers','cladding']`（所有行，含 archived，避免恢复时为空）；`availability_status='active'`；`status='tbc'` → `'draft'`。
4. 回填草稿：`update private.stone_drafts set draft = jsonb_set(draft #- '{stone,availability}', '{stone,availableAs}', '["blocks","pavers","cladding"]')`。`private.stone_history` 快照**不改**（历史对话框要容忍旧形状）。
5. `create or replace` 以下函数：
   - `private.stone_current_draft(id)`：输出 `availableAs`（`stone_groups.available_as` ∩ 已发布选项 key），不输出 `availability`。
   - `public.admin_stone_workspace(...)`：
     - `save` / `prepare` / `publish` 校验：`stone.availableAs` 必须是字符串数组，每个 key 必须存在于已发布选项，否则 `stone_availability_option_unavailable`（errcode `23514`）；保存前剥离 `stone.availability`。
     - `publish` 的 `update public.stone_groups set ...` 增加 `available_as = (select array_agg(...) from jsonb_array_elements_text(s->'availableAs'))`，不再写 `availability_status`。
     - `list` 分支去掉 `'availability'` 字段。
   - `public.public_stone_catalogue()`：顶层增加 `'availabilityOptions'`（已发布选项 `{id,key,name,sortOrder}`，按 `sort_order,id`）；`stones[].draft.stone` 自然带上 `availableAs`。
   - 新建 `public.admin_stone_availability_options(p_action text, p_actor uuid, p_role text, p_request_id uuid, p_option jsonb) returns jsonb`，service-role only，`security definer`，`set search_path=''`：
     - 角色：`actor_role` 必须 ∈ (`owner`,`admin`)，否则 `stone_option_forbidden`（`42501`）。`list` 允许 `editor` / `viewer`。
     - `list`：返回已发布 + 已归档两组。
     - `create`：`{ name }` → 生成 `option_key`（slug），重复 key 报 `stone_option_duplicate`（`23505`）；已发布数量 ≥ 24 报 `stone_option_limit`。`sort_order` = 当前最大 + 10。
     - `rename`：`{ id, name }` 只改 `display_name`。
     - `reorder`：`{ ids: bigint[] }` 按数组顺序重写 `sort_order`（10, 20, 30…）。
     - `archive`：`{ id }` 置 `archived` + `archived_at`；**同一事务**内从所有 `stone_groups.available_as` 和所有 `private.stone_drafts.draft->stone->availableAs` 里移除该 key。
     - `restore`：`{ id }` 置回 `published`；**不**自动加回任何石材。
     - 每个写动作插入 `admin_audit_events`（`action = 'stone.availability_option.' || p_action`，`entity_type='stone_availability_options'`），并沿用 `pg_advisory_xact_lock(20260910,1)` 与 Stone 写入互斥。
   - grants：`revoke all ... from public, anon, authenticated; grant execute ... to service_role`。
6. `notify pgrst, 'reload schema'`。

迁移末尾加只读的回读断言（`do $$ ... raise exception` 当任一已发布 `stone_groups` 的 `available_as` 不是三项时），作为生产应用后的即时自检。

### 2.3 后端 Function

`functions/_lib/admin-stones.js`：

- `validateStoneDraft()`：删掉 `availability` 的校验；新增 `array(s.availableAs, 'Available as', 24)`，每项 `string(x, 'Available as option', 60)` 且匹配 slug 正则；去重后再传给 RPC；`delete s.availability`。
- GET `?view=availability-options` → RPC `list`。
- 写入：`stoneApi('', body)` 的 body 现有 `action` 分发处，新增 `action: 'availability-option'` 分支，带 `{ op: 'create'|'rename'|'reorder'|'archive'|'restore', option }`，转发到新 RPC；`requestId` 必填（沿用现有 `p_request_id` 幂等模式）。
- 错误翻译：新增 `stone_option_forbidden` → "Only owners and admins can change these options."，`stone_option_duplicate` → "An option with this name already exists."，`stone_option_limit` → "You can keep up to 24 options."，`stone_availability_option_unavailable` → "One of the selected options is no longer available. Reload the page."（放在现有的 `adminErrors` 翻译表里，走同一机制）。
- `src/lib/adminStoneApi.ts` 的 `StoneWrite` 类型同步扩展。

### 2.4 公开页（DESIGN.md 规则）

- **SpecsPanel**：第二张卡标题改为 `Available as`。卡内一列，每行 = 选项名 + `StatusPill`：offered → tone `available` 文案 **`Offered`**；否则 tone `unavailable` 文案 **`Not offered`**。去掉说明句。props 改为 `availableAs: StoneDetailVM['availableAs']`。选项为空（目录读取失败且无静态兜底时不会发生，但要防御）时显示 `Confirm for your project`。
- **StoneCard**：删除左上角 StatusPill 及 `statusBadgeLabel`。检查 `surface="overlay"` 的 StatusPill 变体是否还有别处使用，没有就一并清理。
- **VariantSwitch**：删除每个 variant 的状态 pill；rail 布局不变。
- **StoneCompareView**：删除表头 StatusPill；注册表新增：
  ```ts
  { key: 'available-as', label: 'Available as', kind: 'checklist', public: true, order: 25,
    source: 'StoneDetailVM.availableAs (published options ∩ stone selection)',
    resolve: ({ detail }) => ({ kind: 'checklist', entries: detail.availableAs.map(o => ({ label: o.label, offered: o.offered })) }) }
  ```
  新增 `CompareCell` 变体 `{ kind: 'checklist'; entries: { label: string; offered: boolean }[] }`，渲染沿用对比页现有点语言（lime 点 = Offered，安静短横 = Not offered），每行带可见文字，不只靠颜色。"differences only" 切换要能识别该行差异。
- **QR 页 `ImageQrPageView.tsx`**：`Availability` 格改为 `Available as`，列出全部选项，offered 用现有 `#00df16` 圆点 + 名称，not offered 用 `text-black/40` + 名称 + 短横。保持两列栅格不变。
- **StonePageView**：改 props 传递。
- 文案规则写入 `docs/DESIGN.md` §Stone Library：公开页不再表达石材级"可用 / 即将上线"状态；"Available as" 清单必须完整列出已发布选项并明确 Offered / Not offered；Finish capability 与 Cut options 的既有文案不变。

### 2.5 后台

- **编辑器 §1 Basic information**：把 `Availability` `<select>` 换成 `Available as` 复选组（`fieldset` + `legend`，每个已发布选项一个 checkbox，样式用现有 `stone-input` 体系 / `AdminCmsPrimitives` 里的复选样式）。无已发布选项时显示 "No options yet. Owners and admins can add options at the top of the Stone Library list." 自动保存 / 发布流程不变（`StoneSaveQueue`）。
- **列表页顶部 `Available as options` 区块**（`AdminStoneLibraryPage.tsx` 的 `StoneList`）：
  - 默认折叠成一行摘要（例如 `Available as options · Blocks, Pavers, Cladding`）+ `Manage` 按钮；owner / admin 展开后可：添加（输入名称 → 回车）、重命名（行内）、上下移动（按钮，不做拖拽）、Hide（= archive，二次确认，提示"会从所有石材上移除"）、`Hidden options` 折叠区里 Restore。
  - editor / viewer 只看到摘要，没有 `Manage`。
  - 写入成功后刷新选项列表；若编辑器页面已打开，重新加载选项（简单做法：编辑器加载时取 `?view=availability-options`，列表页写入后 `invalidate`）。
  - 所有反馈走现有 `AdminFeedback` / 翻译错误机制，不写技术词。
- **列表**：去掉 `Availability TBC` 徽标和 `StoneListItem.availability`。
- **历史对话框**：改为显示 `Available as: Blocks, Pavers` （从 `snapshot.stone.availableAs` 映射，缺失时显示 `—`）；对旧快照里的 `availability` 字段**忽略**。
- **帮助文案**：`src/pages/admin/adminGuide*`（快速指南）与 `docs/ADMIN_EDITOR_GUIDE.md` 的 Stone Library 段落补一句 Available as 的说明；`docs/ADMIN_IA_ACCESS.md` 增加 "Available as options：owner/admin 可改，editor 只读"。

### 2.6 测试与守卫

- vitest：
  - `src/features/stone-library/stoneDraft.test.ts`（新）：`stoneDraftToDetail` 输出 `availableAs` 全集展开 + offered 标记；归档 key 被过滤；`emptyStone` 默认全选。
  - `src/lib/stoneCompareRegistry.test.ts`：新增 `available-as` 行与 differences 判定。
  - Function 单测（若 `functions/_lib` 已有测试模式则跟随；否则在 `scripts/check-stone-workspace.mjs` 隔离库里覆盖）：`validateStoneDraft` 剥离 `availability`、拒绝非法 key；options RPC 的角色拒绝、重复、归档联动移除。
- `scripts/fixtures/stone-workspace.sql` 加入新迁移；`npm run agent:stone-workspace` 必须通过。
- 更新 `scripts/check-admin-crud-coverage.mjs` / `check-public-supabase-readiness.mjs` / `check-stone-workspace.mjs` 里会被本改动咬到的断言（例如要求后台源码含 `Available as`、要求 catalogue SQL 含 `availabilityOptions`、禁止公开组件再出现 `availabilityLabel`）。

---

## 3. 阶段

### Phase 1 · 数据层 + API（PR 1）

产出：§2.1、§2.2、§2.3 全部；`src/types/database.ts`、`src/types/stone-library.ts`、`stoneDraft.ts` 的类型与映射；`stoneCatalogueOptions.ts` 若依赖 `status` 需同步。前端页面可以先用新字段但保持编译通过（可临时把 `availableAs` 映射出来而暂不渲染）。

验证：
```sh
npm run build && npm run lint && npx tsc -b && npm run test
npm run agent:stone-workspace
npm run agent:admin-crud-coverage
npm run agent:public-supabase-readiness
npm run agent:supabase-foundation-readiness
```

### Phase 2 · 公开页（PR 2，可 stacked 在 PR 1 上）

产出：§2.4 全部 + `docs/DESIGN.md`、`docs/architecture/stone-library.md` 更新 + registry 测试。

验证：上面的命令 + `npm run agent:stone-library-detail` + `npm run gate` + Preview 上目视：某块石材详情、列表卡（无角标）、对比页（新行、无表头 pill）、`/image/<slug>` QR 页、390px 宽度无横向溢出。截图附在 PR。

### Phase 3 · 后台（PR 3，可 stacked）

产出：§2.5 全部 + `docs/architecture/stone-library-admin.md`、`docs/ADMIN_EDITOR_GUIDE.md`、`docs/ADMIN_IA_ACCESS.md`、`docs/SUPABASE_SCHEMA.md` 更新。

验证：命令同上 + `npm run agent:admin-cms-predeploy` + `npm run agent:admin-config-gate`。在隔离库 / Preview 上用 owner 账号走一遍：新增一个选项 `Kerbs` → 某石材勾选 → 自动保存 → 预览 → 发布 → 公开页回读显示 4 行且 Kerbs = Offered → 归档 `Kerbs` → 公开页回到 3 行、编辑器草稿里也没有它 → Restore 后石材不自动勾回。再用 editor 账号确认看不到 `Manage`，直接调 API 得到翻译后的拒绝提示。**Preview 的这些写入只允许打到隔离库或 Jay 另行指定的 QA 数据，不许打生产。**

### Phase 4 · 发布（Claude 主持）

顺序必须是：

1. 三个 PR 通过 `npm run gate` + Preview smoke，Claude 验收。
2. Claude 把迁移 SHA 报给 Jay，拿到对该 SHA 的确认。
3. **先应用迁移到生产**（迁移内置回读断言；另外用只读 SQL 回读：12 块已发布石材 `available_as` 全为三项、`availability_status` 全为 `active`、`private.stone_drafts` 全部带 `availableAs` 且无 `availability`）。
4. **立即 merge PR**（同一个发布窗口；旧运行时在迁移后短暂并存是安全的：旧 Function 只是不会显示新字段，RPC 会忽略旧 `availability` 字段）。
5. 生产回读：`https://urblo.com.au/stone-library/<任一>`、对比页、一个 QR 页；后台以 owner 登录看选项区块与编辑器复选组；`npm run agent:cloudflare-preview-smoke -- --base-url <immutable>` 对 immutable / apex / www。
6. 记录：`docs/WORKLOG.md`、`docs/HANDOFF.md`、`docs/agent/status.json`、`docs/agent/tasks.json`、`docs/NEXT_STEPS.md`（记入"按形态筛选"候选）、`docs/agent/verification.md`。

---

## 4. 验收清单（Claude 用）

- [ ] 公开页任何地方不再出现石材级 `Available` / `Upcoming` / `Available for project sourcing`（`grep` 公开组件无 `availabilityLabel` / `availabilityStatus`）。
- [ ] 详情页 `Available as` 卡列出全部已发布选项并逐项标 Offered / Not offered；列表卡无角标；对比页有 `Available as` 行且无表头 pill；QR 页同步。
- [ ] 后台：选项增 / 改名 / 排序 / 归档 / 恢复仅 owner / admin；editor 只读且 API 拒绝；归档会从所有石材与草稿移除；新建石材默认全选。
- [ ] 迁移单事务、无列删除、历史快照未改；生产 12 块已发布石材三项全 Offered。
- [ ] `npm run gate`、`agent:stone-workspace`、`agent:admin-crud-coverage`、`agent:public-supabase-readiness`、`agent:stone-library-detail`、vitest 全绿。
- [ ] DESIGN / architecture / SUPABASE_SCHEMA / ADMIN 文档与 docs/agent 状态已更新；本文件删除。
