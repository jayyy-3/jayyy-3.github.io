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


## 第二批进展（2026-09-09）

- 已确认重复发布入口：现役 `urblo-site` 是 Direct Upload，但旧 `urblo` Git 集成仍为生产自动部署开启、Preview `all`。已按本轮授权关闭并读回 `false` / `none`，旧 canonical deployment 保留。重复构建这一项已解决。
- 检查图本地验证：完整源码图 22 个唯一节点，浏览器图 23 个。原有单次 smoke + predeploy 会重复 Projects、QR、build、lint/typecheck；合并图内各节点仅一次。无配置浏览器复用同一次已验证构建；有配置与无配置是两个不同配置。
- 首次失败留存：沙箱阻止 Vite 端口绑定；放行本地服务器后发现 Capabilities 仍检查旧 shell 文本。已替换为图依赖断言，之后源码与浏览器验证通过；每次尝试独立编号，不覆盖首个失败。
- 文件分类已用真实临时 Git 仓库测试：源码重命名到 docs、删除源码、未知 untracked 文件不能走记录文档路径；记录文档不会改变运行时指纹。
- GitHub `quality` 汇总与自动发布后读回已实现，等待该 PR 的真实 CI 和后续纯记录 PR 证明零部署。主分支保护仍需管理员一次配置。剩余本地隔离环境、真实编辑流程、Articles 拆分尚未完成，不能据此宣称整轮完成。

## 第三批：隔离环境与发现

| 发现 | 分类与证据 | 触发与影响 | 处理与验证 |
| --- | --- | --- | --- |
| M10 云端辅助函数假设 | 已确认重建缺陷；历史 migration `202605280005` 在空白本地库报 42883 | 新环境没有 `public.rls_auto_enable()`，迁移中途停止 | 存在时才执行原来的三项 revoke；连续两次 reset 成功，存在分支通过本地事务权限证明并回滚 |
| M11 Linux 浏览器进程退出 | 已确认测试可靠性缺陷；PR #41 首次 CI 卡在浏览器，Linux 对照实验 npx 子进程仍提供 HTTP | 新增 CI 浏览器检查可能永久等待 | 直接运行 Vite Node 入口、实时脱敏日志、超时和进程组终止；修复后 CI 与 Preview 成功 |
| M12 本地测试配置与素材 | 测试搭建问题，不是线上产品缺陷；关闭 email provider 导致本地登录 422，旧测试 PNG 无法解码 | 本地账号和图片不能进入真实编辑流程 | 开启本地 email/password provider、保持全局注册关闭，生成有正确 CRC 的 64px PNG；二维码完整流程通过 |

纯记录验收已通过 PR #42 (`34326719464`) 和 main (`34327122789`)：两次 quality 成功，构建/浏览器/部署跳过。main 运行时指纹与前一版本一致：`03eec5670136b87337c146d89044c364c304b637ae851764041763af415212c9`。本地 `full-1788941176621` 证明真实数据库、Storage、Functions、连续两次 reset 和二维码保存/刷新/公开读回/隐藏恢复；其他后台流程仍待下一批补齐。

## 第四批：行为基线

- M13 / 已确认 Projects 状态竞争：已有项目加载中点击 New project 会增加加载代数，旧请求的 finally 因代数过期不再清除 loading；新建分支也没有清除 loading，编辑器永久停留在 Loading project。真实本地测试保留失败截图；新建分支显式结束旧 loading，并用延迟旧请求、立即新建、释放旧响应后仍为空表单的测试验证。无布局、文案、发布或权限契约变化。
- Articles 的无效输入恢复、API 500 后保留输入/重试/刷新、父记录绑定的 section PATCH、保存锁阻止切换、延迟加载后正确显示、公开标题与正文已通过本地行为测试。测试不承诺普通手动切换会保留未保存编辑，现有行为不在本轮改动。
- Contact/Sample Request 在本地真实 Functions/数据库入库并显示于 owner inbox，匿名读取被拒绝；通知状态为 not_required。没有发送外部邮件，真实 SMTP/Turnstile 验收仍独立。
- Functions JavaScript 已纳入 ESLint recommended + Worker globals；两个有意检测控制字符的安全正则精确豁免 no-control-regex，未改变规则行为；删除一个未用 helper。

## 第五批：有界重构结果

Articles 入口由 2,226 行变成 11 行保护壳；类型、表单校验、数据访问、编辑状态和三个展示文件各自承担明确职责。保留了查询字段与顺序、父子过滤、审计顺序、旧响应防护和所有展示动作。12 个展示函数/返回区域 AST 比对一致；重构前后相同的 16 项真实本地流程通过。正常断言还成功检测到构建中故意恢复的校验前加锁缺陷，证明替换源码顺序检查没有丢掉该保护。

QR/Projects 共用配置与身份读取，各模块仍保留独立角色、错误码、消息和响应合同。缺失配置/身份、后端错误、未知角色、Viewer 拒绝和三个编辑角色的行为测试通过。后端密钥禁止进入浏览器的源码边界保留。

新诊断显示公开内容 client 与持久化 admin client 使用默认同名 Auth storage namespace，SDK 给出重复实例警告；本地没有观察到会话损坏。这是待调查风险，已列入 `LATER-AUTH-CLIENT-NAMESPACE-001`，不是本轮顺带修改认证的理由。Products、Stone Library、Media 的后续模块边界工作也已进入正式队列。
