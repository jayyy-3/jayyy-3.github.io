# Urblo 项目地图

这是一份模块导航，不存放当前发布状态。当前状态由 agent:init 和生成总览提供。

## 路由与数据

| 模块 | 入口 → 业务层 → 数据边界 | 改动时必须保留 |
|---|---|---|
| 公共站点 | App → layouts/components → 四个 public service adapters | 干净路径、元数据、静态 fallback、按需 Supabase 加载 |
| Stone Library | StoneLibraryDetailPage → StoneLibraryService → static catalog / Published stone tables | variant/finish 匹配、真实 finish 图片、draft 不公开 |
| QR | ImageQrPage / AdminImageQrPage → image-qr Functions → server-only image_qr_resources / Storage | 固定 slug、原始产品图、独立材质纹理、显式关联与默认值区分 |
| Projects | AdminProjectsPage / ProjectEditor → admin-projects Function → aggregate RPC / six Project tables | 单次 aggregate Save、revision conflict、发布补偿、公开父记录约束 |
| Articles | AdminArticlesPage → browser-key queries → articles / article_blocks；ArticleService → public renderer | 子记录绑定、切换防旧响应、草稿不可见、安全链接、审计语义 |
| Products | AdminProductsPage → browser-key queries → products / models / defaults / specs | 父子 ownership 谓词、加载锁、Published overlay |
| Media | AdminMediaPage → browser-key Storage + metadata | private-first、原图保留、owner/admin promotion、失败保留与读回 |
| Forms / Leads | ContactPage → enquiries/sample-requests Functions → private leads + audit；AdminLeadsPage → RLS | 原子 sample items、服务端校验、通知状态、私人数据匿名拒绝 |
| Settings / Auth | AdminSettingsPage / account setup → Supabase Auth + profiles + settings | owner 边界、isolated recovery session、公开 settings consumer |

## 权限模型

公共页面只读取允许公开的 Published 内容；静态 fallback 是有意保留的产品合同。公共 Supabase client 不持久化 Auth。后台 browser client 持久化会话并受 RLS 约束。Projects 与 QR 的业务写入经验证 Auth user 和 active profile 的受保护 Function；其他编辑器目前仍使用 browser-key CRUD。两种边界均需保留，不能在维护任务里静默统一。

Viewer 不能执行编辑动作；owner/admin/editor 的具体能力由模块与 RLS 共同决定。Media public promotion 仅 owner/admin。Settings、Leads 和团队管理的角色规则见 `docs/ADMIN_IA_ACCESS.md`。服务端复用身份读取时不合并各模块 action 的权限策略。

## 四条深入检查链路

1. QR：公开 HTML/JSON → 页面两张图 → 后台关联选择 → Save → 刷新 → 公开读回；再验证 hidden404、viewer 拒绝、stale save。
2. Projects：load aggregate → edit → draft Save → reload → private media → Publish → public readback → Hide；核对 revision conflict 与 public-copy compensation。
3. Articles：选择父记录 → 加载 blocks → 校验 → Save → 刷新 → public renderer；快速切换、失败解锁、child ownership 与 draft visibility 是重点。
4. Forms：UI → Function validation → enquiry 或 atomic sample RPC → audit → notification status → Leads；本地使用合成资料和邮件替身。

## 如何找规则和检查

`docs/agent/modules.json` 是机器可读模块索引；agent:init 按任务打印相关入口。`docs/agent/verification.md` 管理检查类型；`docs/ARCHITECTURE.md` 管理稳定技术合同；`docs/ADMIN_IA_ACCESS.md` 管理后台角色与编辑流程。源码事实与旧文档冲突时先验证，再修正文档。

历史架构与发布记录在 `docs/archive/2026-09-09/`，不属于默认启动材料。大文件仅是检查信号，不自动触发重写。
