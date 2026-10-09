---
spec_id: zvd-theme-adaptation-gate
title: ZValleyDashboard 前端页面主题风格适配 · 需求质量 Gate
status: draft
template_id: 需求质量卡点模板
schema_version: 1
created_at: 2026-10-09
updated_at: 2026-10-09
---

# Gate: ZValleyDashboard 前端页面主题风格适配 · 需求质量卡点

## Summary

本 Gate 用于在"AI-Spec 生成"节点出口对"前端页面主题风格适配"的 Spec 文档做质量门禁，判断其是否足以交付给下游"AI-编码"节点实施。Spec 基于上游《前端页面主题风格适配-需求澄清》（status: confirmed）与「苔 Moss」主题 tokens（knowledge/template/网页页面主题风格.md），面向 ZValleyDashboard 前端脚手架（Vue3 + Element Plus + Pinia + UnoCSS）落地浅色/深色/跟随系统三态主题能力；本 Gate 同时覆盖范围禁区、验收可测性、非功能约束、依赖与回滚风险的可执行性判定。

## Decision

- Status: Pending approval
- Approved approach: 按 Spec 中 REQ-001 ~ REQ-009 实施；色板严格引用「苔 Moss」tokens；Element Plus 暗色通过官方 dark/css-vars.css + .dark class 接入并用 moss 主色覆盖；主题状态在 useAppStore 追加 theme 字段并持久化到 localStorage `zvalley_dashboard_app.paths`；index.html 内联 FOUC 脚本；不新增第三方主题依赖；不改动 prototype/knowledge-base/ 与 e2e/ 链路。
- Decision owner: 产品负责人（节点负责人 u-yevmfl73swlxswyjncdy）
- Decision date: _TBD_

## Acceptance Criteria

只有以下条件全部满足时，Gate 判定为 PASS，方可进入"AI-编码"节点：

- [ ] **G1 · 范围明确**：Spec 明确本次覆盖页面清单（登录页 / DefaultLayout / 仪表盘 / error/403 / error/404 / HelloWorld）以及明确不改动范围（prototype/knowledge-base/、e2e/、docs/requirements/知识库系统-*、NG-01~NG-06），无模糊表述。
- [ ] **G2 · 三态模式定义清晰**：浅色/深色/跟随系统三态的 mode 取值、html[data-theme] 标记、.dark class、system 模式 matchMedia 跟随逻辑、matchMedia 不支持/JS 禁用降级策略均已在 REQ-001 中定义并可测试。
- [ ] **G3 · 切换交互可验收**：顶栏与 BlankLayout 右上角主题按钮位置、三态循环顺序（light→dark→system→light）、图标语义（月亮/太阳/显示器）、tooltip/aria-label i18n 文案已在 REQ-002、REQ-008、COPY 小节定义。
- [ ] **G4 · 色板与硬编码清理规则可执行**：必须使用「苔 Moss」tokens（变量名与值与模板一致）；Element Plus `--el-color-primary*` 系列在浅/深下被 moss 主色覆盖；受影响 .vue 文件内硬编码最终色值（#001529/#002140/#1677ff/#69b1ff/#fff/#000 等）必须替换为变量；侧栏浅色深色侧栏视觉、登录页渐变、NProgress 适配规则在 REQ-003 中明确。
- [ ] **G5 · 持久化与默认值明确**：useAppStore.theme 字段、默认值 system、setTheme action、pinia persist paths 追加 'theme'、localStorage key 为 zvalley_dashboard_app，在 REQ-004 与 §6 FIELD 表中明确。
- [ ] **G6 · FOUC 与过渡规则可落地**：index.html <head> 内联 IIFE 脚本位置（主 CSS 之后、#app 与主模块脚本之前）、执行时间 < 10ms、与运行时同源同 key、transition 只覆盖颜色类属性（不覆盖 width/transform），在 REQ-005 中明确。
- [ ] **G7 · Element Plus 暗色接入方案明确**：import 路径（element-plus/theme-chalk/dark/css-vars.css）、.dark class 激活机制、EP 通用语义变量（--el-bg-color* / --el-text-color* / --el-border-color* / --el-fill-color* / --el-mask-color）覆盖策略、受影响组件清单在 REQ-006 中明确。
- [ ] **G8 · 页面覆盖与禁区可验证**：REQ-007 对登录页/DefaultLayout/仪表盘/错误页/HelloWorld 的适配要点逐一描述，同时显式排除 prototype/ 与 e2e/。
- [ ] **G9 · 既有能力不回归**：登录/语言切换/侧栏折叠/路由/权限/NProgress 行为保持；不新增第三方主题依赖；pnpm lint 与 pnpm type-check 通过；useAppStore theme 单测覆盖，在 REQ-009 中明确。
- [ ] **G10 · 非功能与回滚可执行**：NFR-001~NFR-007 覆盖性能/兼容性/稳定性/可维护性/可访问性/规范/回滚；回滚仅需 revert 前端提交，无数据迁移；IE 不在兼容范围。
- [ ] **G11 · 关键决策无 TBD**：核心决策（三态方案、默认值 system、按钮循环顺序、图标语义、侧栏浅色视觉、持久化 key）已落定；OQ-1~OQ-4 均给出默认值并标注不阻塞下游，未把关键实现留给"待定"。
- [ ] **G12 · 验收标准可映射**：Spec §10 追溯矩阵将每条 REQ/NFR 映射到设计章节与 QA 重点，需求澄清 §5 验收标准条目可在 REQ-001~REQ-009 中找到对应覆盖（浅↔深切换、三态循环、跟随系统、持久化、FOUC、登录页、DefaultLayout、仪表盘、错误页、EP 主色、HelloWorld、i18n、不回归、无新依赖、lint 通过）。

## Verification

评审采用文档级 gate check（不运行代码），证据来源仅限以下可见材料：

- Tests: N/A（本 Gate 为需求质量门禁，非代码测试门禁；REQ-009.4 规定的 useAppStore 单测在编码节点执行）。
- Manual checks:
  - 对照 Spec Review Summary / Scope Note / REQ-001~REQ-009 / §6 FIELD / §7 STATE/ACTION/COPY / §9 NFR / §10 Traceability / Open Questions 逐项核对 G1~G12；
  - 对照需求澄清文档 §3.4 产品规则（TR-01~TR-14）、§5 验收标准、§6 OQ 默认值进行一一映射；
  - 对照 knowledge/template/网页页面主题风格.md 核对 token 名称与色值未被篡改；
  - 对照 repos/zfWan_ZvalleyDashboard/AGENTS.md 与需求澄清 NG-06，确认不涉及 prototype/ 与 e2e/ 链路。
- CI or automation: 编码节点由 `pnpm lint` / `pnpm type-check` / vitest 验证；本 Gate 不执行命令。
- Additional evidence:
  - 需求澄清状态为 confirmed，核心决策已通过 Human-in-the-loop；
  - 仓库源码结构证据（src/{layouts,views,store,styles} 存在，package.json 含 element-plus / pinia-plugin-persistedstate，支持 REQ-004/REQ-006 实现方案）。

## Blockers

当前无阻塞项。

Spec 已对核心范围、三态模式、切换交互、色板、持久化、FOUC、Element Plus 暗色接入、页面覆盖、不回归与非功能约束给出可测试的 REQ；OQ-1~OQ-4 均已按需求澄清"建议默认值"落定，不阻塞下游"AI-编码"节点执行。如业务方对任一 OQ 默认值有不同决策，应在进入编码前通过 Spec 变更流程更新本文档与 Spec，再放行本 Gate。

## Changelog

| Time | Status Change | Updated By | Reason |
| --- | --- | --- | --- |
| 2026-10-09 | Draft 初版 | AI-Spec 生成节点 | 基于需求澄清（confirmed）与「苔 Moss」模板生成 Spec + Gate，自检通过待负责人审批 |
