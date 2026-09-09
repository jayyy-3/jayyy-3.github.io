# Urblo 可维护性审计

基线：2026-09-09，已发布 main 2e7977b（运行时代码 018341a）。本报告将已确认事实、维护风险和待验证事项分开；验证进度以任务队列和 WORKLOG 为准。

## 已确认问题

| ID / 优先级 | 证据与触发 | 影响 | 改进 / 验证 |
|---|---|---|---|
| M01 / P1 | 原 README 宣称 CMS handoff passed，而 structured handoff evidence 为 revalidation_required；HANDOFF 同时描述 QR redirect 与 material page | 新 agent 误判完成状态 | 单一结构化状态生成摘要；注入矛盾内容必须使 GC 失败 |
| M02 / P1 | deploy workflow 对全部 push 构建部署；docs-only profile 却允许跳过 runtime gates | 纯证据改动重复发布 | 分类器 + 稳定 quality 汇总；文档样例必须零部署 |
| M03 / P1 | CI build/lint/typecheck 后 predeploy 再次执行；smoke/coverage 重复调用 QR/Projects | 修改越多，工具维护与等待越重 | 去重检查图；同配置每节点只执行一次 |
| M04 / P1 | 基线 main API 返回 protected=false；连接身份 push=true/admin=false | 协议的 PR 边界没有仓库设置保障 | quality 稳定后由管理员配置并读回；权限不足明确列外部依赖 |
| M05 / P1 | Preview 绑定生产 Supabase；无 tracked local Supabase config | 完整 UI 写入测试只能触及生产或靠 mock | 本地迁移/seed/Functions；两次 reset、拒绝生产目标、合成 UI 流程 |
| M06 / P1 | auth browser 只等待标题，console 只记录 message.text；曾报 JSHandle@object 后重试通过 | 数据尚未就绪即可过关，失败难定位 | ready-state + actual workflow assertions；保留脱敏错误和每次尝试 |
| M07 / P2 | 根指引约 29 KB，HANDOFF 约 30 KB，tasks 273 KB，WORKLOG 818 KB | 默认接手成本过高且历史被误当当前 | 归档不删历史；6 KiB root / 24 KiB startup；冷接手演练 |
| M08 / P2 | 最近 60 commits 中 CRUD coverage 脚本出现 24 次、check-harness 14 次；多处 includes(source text) | 安全重构也需维护实现字符串 | 逐条迁移为可注入失败的行为断言；保留真正安全边界 |
| M09 / P2 | Articles 2,226 行混合 query、forms、state、JSX；Functions 的 JS 不在现有 TS/lint 范围 | 难隔离变更，后端错误可能绕过静态检查 | Articles 有界抽取；Functions 静态检查；先建立行为基线 |

## 待验证事项

- 旧 Cloudflare Git integration 是否仍主动构建：PR 中存在历史 Cloudflare status 的迹象，但不能仅凭旧状态断言当前设置。读取配置后再决定关闭哪一个自动入口；不删除 rollback deployment。
- 本地迁移全量重放与 Storage/Auth seed 可重复性：必须实际跑两次，源文件存在不等于已证明。
- Articles 快速切换与失败恢复：现有防护需行为基线；本报告不预先声称存在用户数据丢失。
- 生产 CMS、Auth SMTP、真实设备和内容事实验收：维护测试不替代这些用户或生产验收。

## 实施范围

审计 → 状态生成 → 分类 CI → 本地隔离 → 行为测试 → Articles / server identity 局部重构 → 接手演练。每批独立提交/PR。保留 public UI、技术栈、永久链接、role/RLS、fallback 和所有生产业务数据。

## 基线度量

- 最近 docs-only main run 34319175514：从开始到结束约 119 秒；包括网站部署。文档新流程目标是零部署，不承诺以省掉必要测试换取总耗时数字。
- 原任务队列 55 项：41 done、7 next、4 now、3 later；status.activeExecutableTasks 仍含已 done QR ID。
- 原 GC：0 failures / 5 warnings，未发现 README/CMS 以及 QR current-state 冲突。
- 归档内容的字节完整性由 archive manifest 校验；启动预算、重复检查数、分类结果、失败证据和本地流程分别作为验收项。
