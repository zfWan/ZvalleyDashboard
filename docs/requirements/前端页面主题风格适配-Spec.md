---
spec_id: zvd-theme-adaptation-spec
title: ZValleyDashboard 前端页面主题风格适配
status: draft
template_id: 需求Spec模板
schema_version: 1
product_area: ZValleyDashboard 前端脚手架
baseline_spec: 无（新增视觉能力，基于 main@8d6eb7c 现状基线）
depends_on_specs: []
supersedes_specs: []
source_documents:
  - artifacts/需求澄清/zfWan_ZvalleyDashboard@8d6eb7c/content.json
  - artifacts/需求澄清/需求澄清/需求澄清（即 docs/requirements/前端页面主题风格适配-需求澄清.md）
  - knowledge/template/网页页面主题风格.md
  - repos/zfWan_ZvalleyDashboard/src（Vue3 + Element Plus + Pinia + UnoCSS + Vite + SCSS）
created_at: 2026-10-09
updated_at: 2026-10-09
---

# Review Summary

- 本次需求: 在 ZValleyDashboard 现有前端脚手架（登录页 / 主框架布局 / 仪表盘 / 错误页 / 示例组件）接入基于「苔 Moss」色板的浅色 / 深色 / 跟随系统三态主题能力，提供顶栏切换入口、localStorage 持久化、首屏防闪烁，并保证所有既有页面在任意主题下样式统一、对比度合规，不新增功能模块。
- 需求类型: UX / frontend change、Copy / config 改动、兼容性改动（视觉兼容 + 持久化 + 系统主题跟随）。
- 变更面: UX Design（新增主题切换按钮与三态主题视觉）、Functional Requirements（主题模式、切换、持久化、FOUC、Element Plus 暗色接入、页面覆盖）、NFR/DFX（性能 / 兼容性 / 稳定性）、Copy（i18n 文案补充）；不涉及: Backend/Data、API Design、Metrics；待确认: 无（OQ 项均已给出建议默认值并作为决策落地）。
- 变更面判断依据:
  - 需求描述与需求澄清 §1–§5 明确仅为前端视觉适配；
  - 仓库证据（repos/zfWan_ZvalleyDashboard/src/{layouts,views,store,styles}/**、package.json、AGENTS.md）显示前端为 Vue3+EP+Pinia+UnoCSS 脚手架，样式硬编码集中在登录页/侧栏/顶栏，可由 CSS 变量改造覆盖；
  - 需求澄清 NG-04/NG-05 明确不涉及后端、API、新业务功能；prototype 与 e2e 链路（知识库系统原型）在 NG-06 中明确排除。
- 差异判断:
  - 产品形态差异：不涉及（仅 Web 端脚手架，无移动端 / 小程序 / SDK 形态）；
  - 站点差异：不涉及（单站点）；
  - 环境差异：不涉及（现代浏览器一致；IE 不在兼容范围，TR-11/约束已说明降级）；
  - 版本差异：不涉及（不升级依赖大版本，不改 API，无破坏性公共契约）；
  - 主题模式差异：涉及，即浅色 / 深色 / 跟随系统三态，为本次核心差异，已在 REQ-001~007 中全覆盖。
- 本次变更关键信息:
  - 新增三态主题模式（light / dark / system），默认"跟随系统"，按钮三态循环 light→dark→system→light；
  - 色板严格采用「苔 Moss」tokens（knowledge/template/网页页面主题风格.md），浅色用 :root tokens，暗色用 [data-theme="dark"] tokens；
  - Element Plus 暗色通过官方 dark/css-vars.css + .dark class 接入，并用 moss 主色覆盖 --el-color-primary* 系列变量；
  - 主题状态追加到 useAppStore.theme，pinia-plugin-persistedstate 持久化到 localStorage key `zvalley_dashboard_app` 的 `paths`；
  - index.html <head> 内联同步 IIFE 在 Vue 挂载前设置 html[data-theme] 与 .dark 类，消除 FOUC；
  - 样式组织：新增 src/styles/theme.scss 集中定义 CSS 变量并覆盖 EP 变量，index.scss 引入；改造现有 .vue 文件硬编码色值；
  - 适配页面：登录页（BlankLayout）、DefaultLayout（侧栏/顶栏/面包屑/头像下拉）、仪表盘（统计卡/Demo 卡）、error/403、error/404、HelloWorld 示例组件、NProgress；
  - 不做事项（NG-01~NG-06）保持不变，不新增第三方依赖、不重构完整 Design Token 体系、不改业务交互。
- Review 重点:
  - 主题模式三态定义、切换循环顺序、默认值是否与需求澄清一致；
  - 色板是否完全引用「苔 Moss」tokens，是否存在硬编码色值残留；
  - Element Plus 暗色接入与主色覆盖规则（.dark class + css-vars.css）是否可落地；
  - 首屏 FOUC 脚本与运行时逻辑是否共享同一套 key 与判定；
  - 持久化 key 与路径追加是否破坏现有 locale / sidebarCollapsed 配置；
  - 登录页（BlankLayout）主题按钮可见性与不依赖登录状态（TR-13）；
  - 范围禁区（prototype/、e2e/、docs/requirements/知识库系统-*）是否明确不改动；
  - OQ 默认值（OQ-1~OQ-4）是否已在 REQ 中落定并在 Open Questions 中登记风险。

## Scope Note

- Implemented sections: Context, Goals and Non-Goals, Glossary, Functional Requirements (REQ-001~REQ-009), UX Design, NFR/DFX, Traceability, Open Questions。
- Not involved: API Design（无对外 API/SDK/Webhook/CLI 变更，纯前端视觉改造）、Backend/Data（无后端行为、数据结构、存储、权限、迁移变更，localStorage 为前端本地偏好）、Metrics（不新增埋点/日志/Dashboard 指标）。
- Needs confirmation: 无。需求澄清 §6 的 OQ 项均在本 Spec 中按"建议默认值"落定，作为实现契约；若后续业务确认需调整，走 Spec 变更流程。
- Reason: 基于需求澄清 §1-§5 的明确"纯前端视觉适配"界定，以及仓库 src/ Vue3 脚手架现状（AGENTS.md 第 1 条 prototype 链路与本需求 NG-06 明确隔离；仓库 package.json 未包含主题框架依赖），变更面集中在前端样式、状态与 i18n 文案，不需要展开 API、后端或指标章节。

# Spec: ZValleyDashboard 前端页面主题风格适配

# 0. 文档元信息

## 0.1 基本信息

- **文档类型**: 新增需求（前端视觉能力）
- **适用产品范围**: ZValleyDashboard 前端脚手架（src/）：登录页（BlankLayout）、DefaultLayout（侧栏/顶栏/面包屑/头像下拉）、仪表盘首页、error/403、error/404、HelloWorld 示例组件、NProgress 进度条。
- **版本基线说明**: 基于仓库 main 分支 8d6eb7c 提交（feat/theme-adaptation-qnft 分支 head），现有主题能力仅为浅色硬编码，未接入 Element Plus dark css-vars、未定义 CSS 色板变量、无主题切换入口、无持久化。
- **适配色板**: 采用「苔 Moss」主题 tokens（knowledge/template/网页页面主题风格.md），以 `--moss-*` / `--surface-*` / `--text-*` / `--border-*` / `--radius-*` / `--font-*` / `--text-*` / `--leading-*` / `--weight-*` 为唯一颜色/字号/圆角/字重来源。

## 0.2 证据来源

| 来源 | 用途 | 可信度 | 备注 |
|------|------|--------|------|
| artifacts/需求澄清/需求澄清/需求澄清 | 需求范围、规则、非目标、验收基线 | 高 | 状态 status: confirmed，已通过 Human-in-the-loop 确认核心决策 |
| knowledge/template/网页页面主题风格.md | 「苔 Moss」色板 tokens（light / dark） | 高 | 所有颜色/字号/圆角/字重变量以此为准 |
| repos/zfWan_ZvalleyDashboard/src/{main.ts,App.vue,layouts,views,store,styles}/** | 现状摸底：技术栈、页面清单、硬编码颜色、app store 与持久化机制 | 高 | 只读探索，已确认侧栏硬编码 #001529/#002140、登录页蓝色渐变 #1677ff→#69b1ff、顶栏白色 |
| repos/zfWan_ZvalleyDashboard/package.json | 依赖基线（Vue3/EP/Pinia/UnoCSS/Vite/SCSS，已含 pinia-plugin-persistedstate、element-plus theme-chalk） | 高 | 无需新增主题相关第三方依赖 |
| repos/zfWan_ZvalleyDashboard/AGENTS.md | 仓库目录职责、原型链路与 src/ 脚手架链路分离约定 | 高 | NG-06 据此排除 prototype/ 与 e2e/ |

---

# 1. 需求背景

- **需求类型**: 用户体验（视觉一致性 + 暗色偏好支持）+ 战略规划（对齐「苔 Moss」设计规范）。
- **背景 / 驱动**:
  - 现有前端脚手架登录页、侧栏、顶栏均为硬编码颜色，仅能浅色渲染，未引入暗色主题，暗色偏好用户体验差；
  - 「苔 Moss」主题 tokens 已在模板规范中定义，但未在脚手架中落地；
  - 若直接接入暗色样式但未做首屏同步设置，会产生 FOUC（先白后黑 / 先黑后白），影响首屏体验。
- **用户价值**:
  - 为暗色偏好用户提供一致的暗色阅读环境；
  - 跟随系统模式可根据 OS 主题自动切换，减少手动操作；
  - 统一 moss 色板提升视觉一致性与品牌感，为后续 Design Token 体系打下基础。
- **关联重点特性**: 无（本需求为脚手架视觉能力升级，不绑定具体业务模块）。

| 用户角色 | 核心场景 | 痛点 | 相关 SA |
|----------|----------|------|---------|
| 首次访问的访客 | 打开登录页 | 默认浅色与系统暗色偏好不一致、蓝色渐变与品牌 moss 色不符 | S-01 |
| 偏好暗色的已登录用户 | 日常使用仪表盘 | 亮色刺眼、夜间模式下白底黑字对比过强、硬编码色块割裂视觉 | S-02 |
| 选择"跟随系统"的用户 | OS 自动切换明暗 | 需要手动来回切换，OS 切换后页面无法自动跟进 | S-03 |
| 异常访问用户 | 访问无权限/不存在页面 | 错误页硬编码白底黑字，与当前主题不一致 | S-04 |
| 开发者 / 演示者 | 访问 HelloWorld 示例组件 | 示例组件硬编码色值无法作为主题接入参考 | S-05 |

---

# 2. 目标与边界

## 2.1 目标

| 目标 ID | 类目 | 目标描述 | 可度量指标 | 目标值 |
|---------|------|----------|------------|--------|
| GOAL-001 | 用户 | 用户可在顶栏（及登录页）在浅色/深色/跟随系统三态间循环切换主题 | 切换后页面主要区域（侧栏/顶栏/卡片/按钮/文字）颜色变化；刷新后保留 | 100% 覆盖 §3.1 场景页面；切换 0.2s 内生效（颜色过渡） |
| GOAL-002 | 体验 | 浅色/深色下视觉统一、无硬编码色块、对比度合规 | 正文与背景对比度 ≥ WCAG AA (4.5:1)，次要文字 ≥ 3:1；无残留 #001529/#1677ff/#fff/#000 作为最终色值 | 开发阶段自查 + 人工走查 |
| GOAL-003 | 技术 | Element Plus 组件暗色正常、主色统一为 moss 绿 | type="primary" 按钮/链接/focus/菜单激活态在浅/深下均呈现 moss 绿量级，非 EP 默认蓝 #409EFF | 视觉走查 |
| GOAL-004 | 技术 | 主题偏好持久化、首屏无闪烁 | localStorage 持久化，刷新/重开浏览器保留；首帧即为目标主题，无 FOUC（内联脚本 < 10ms） | DevTools Performance + 清空 localStorage 硬刷新测试 |
| GOAL-005 | 技术 | 不新增第三方主题依赖、不改业务交互 | pnpm-lock.yaml 不新增主题相关依赖；登录/语言切换/侧栏折叠/路由/权限/NProgress 行为无回归 | pnpm lint / pnpm type-check 通过 + 功能回归 |

## 2.2 非目标

| 非目标 ID | 不做的内容 | 原因 / 后续规划 |
|-----------|------------|------------------|
| NG-01 | 不做浅色/深色之外的第三套主题（高对比度、节日皮肤、企业定制品牌色） | 本次以落地「苔 Moss」为目标；多品牌/多皮肤属后续 Design Token 体系 |
| NG-02 | 不重构为完整 Design Token 体系（不拆 @tokens、不引入 CSS-in-JS、不换主题框架） | 仅在 src/styles/theme.scss 集中定义 CSS 变量并替换硬编码值，控制改动范围 |
| NG-03 | 不处理 RTL、字号缩放、色盲友好等其它可访问性主题能力 | 可访问性独立议题，后续专项迭代 |
| NG-04 | 不做云端/后端用户偏好同步，不接账号级主题设置接口 | 偏好仅存 localStorage；多端同步需后端与账号体系支持 |
| NG-05 | 不新增页面、路由、接口或业务功能模块，不改动现有业务交互流程 | 本次仅为视觉样式适配；登录、仪表盘统计、权限、国际化、语言切换、侧栏折叠交互保持不变 |
| NG-06 | 不迁移 prototype/knowledge-base/ 原型与 e2e/ Playwright 链路（知识库系统原型） | 该目录为知识库工作流原型链路，有独立 AGENTS.md 约束，不在本次 src/ 脚手架主题改造范围 |

---

# 3. 核心概念

| 概念 / 术语 | 描述 | 备注 |
|-------------|------|------|
| 主题模式（theme mode） | 用户选择的主题偏好枚举：`light` / `dark` / `system` | 存储在 localStorage 的是"模式"，不是最终明暗值 |
| 生效主题（effective theme） | 运行时实际呈现的明暗状态，由"模式"推导：light/dark 直接使用；system 根据 matchMedia('(prefers-color-scheme: dark)') 动态判定 | 决定 html[data-theme] 与 html.dark class |
| 苔 Moss 色板 | knowledge/template/网页页面主题风格.md 中定义的颜色 / 字号 / 圆角 / 字重 tokens | 浅/深两套值通过 :root 与 [data-theme="dark"] 区分 |
| FOUC (Flash of Unstyled Content) | 首屏闪烁：样式/主题在 Vue 挂载后才应用，导致首帧为错误主题 | 通过 index.html 内联同步 IIFE 消除 |
| Element Plus 暗色模式 | EP 官方提供的暗色样式，通过给 <html> 加 `.dark` class 并引入 `element-plus/theme-chalk/dark/css-vars.css` 生效 | 本需求在其基础上用 moss 主色覆盖 --el-color-primary* |
| BlankLayout / DefaultLayout | 仓库现有两种布局：BlankLayout 用于登录/错误页（无侧栏顶栏）；DefaultLayout 用于登录后主界面（侧栏+顶栏+内容区） | 两处都需提供主题按钮 |

---

# 4. 页面与信息架构

> 本次不新增页面、路由；仅在现有页面上追加主题切换入口并调整视觉样式。

## 4.1 入口路径

| 入口 ID | 入口位置 | 目标页面 | 权限 / 前置条件 | 备注 |
|---------|----------|----------|------------------|------|
| ENTRY-001 | DefaultLayout 顶栏右侧（语言切换下拉旁） | 当前页面（全局可见） | 已登录（进入 DefaultLayout 即可见） | 图标按钮 TR-01/TR-13 |
| ENTRY-002 | BlankLayout（登录页/错误页）右上角 | 当前页面（登录页/错误页） | 未登录或进入错误页 | 不依赖登录态 TR-13，与 ENTRY-001 共享 ThemeToggle 组件 |

## 4.2 页面清单（受影响页面）

| 页面 ID | 页面名称 | 页面用途 | 主要操作 | 关联 REQ |
|---------|----------|----------|----------|----------|
| PAGE-001 | 登录页 (views/login/) | 用户登录入口 | 输入账号密码登录、切换语言、切换主题 | REQ-001, REQ-003, REQ-005, REQ-006 |
| PAGE-002 | DefaultLayout (layouts/DefaultLayout.vue) | 已登录主框架 | 侧栏折叠、面包屑导航、语言切换、头像下拉、主题切换 | REQ-001, REQ-002, REQ-003, REQ-005, REQ-006 |
| PAGE-003 | 仪表盘首页 (views/dashboard/) | 登录后默认页，展示统计卡/Demo 卡 | 查看统计、操作 Demo 按钮/消息提示 | REQ-003, REQ-005 |
| PAGE-004 | 403 / 404 错误页 (views/error/) | 异常访问提示 | 查看错误文案、返回按钮、切换主题 | REQ-003, REQ-005 |
| PAGE-005 | HelloWorld 示例组件 (components/HelloWorld.vue) | 主题接入正确性回归样本 | 查看文本/按钮/代码块/链接在主题下表现 | REQ-003, REQ-005 |

## 4.3 页面关系

| 起点 | 用户动作 | 终点 | 说明 |
|------|----------|------|------|
| 任意受影响页面 | 点击主题按钮 | 当前页面（不跳转） | 三态循环切换主题，页面颜色 0.2s 过渡，图标与 tooltip 同步更新 |
| system 模式下系统主题变化 | OS / DevTools 切换 prefers-color-scheme | 当前页面（无跳转） | 页面自动跟随切换明暗，无需用户点击 |
| 登录页 | 登录成功 | DefaultLayout（仪表盘） | 主题偏好跨布局保持，不重置 |
| DefaultLayout | 访问无权限/不存在路由 | error/403、error/404 | 错误页继承当前主题，主题按钮仍可用 |

---

# 5. 功能需求

## REQ-001: 主题模式三态与运行时应用

**User Story**
> As a 用户（含访客与已登录用户），I want 系统支持浅色/深色/跟随系统三态主题模式，so that 我能按自己的偏好和系统环境获得合适的视觉体验。

**Priority**: P0

**需求描述**
系统维护三种主题模式：light（浅色）、dark（深色）、system（跟随系统）。运行时根据当前模式与（若为 system）系统 `prefers-color-scheme` 推导最终生效明暗，并在 `<html>` 根节点上同步设置 `data-theme` 属性与 `.dark` class（`data-theme="light"`/`data-theme="dark"`；深色时额外加 `.dark` class 以激活 Element Plus 暗色）。

**Acceptance Requirements**

- **REQ-001.1**: The system **shall** 支持三种主题模式：`light`、`dark`、`system`，并在 `<html>` 根节点上通过 `data-theme` 属性标识最终生效的明暗值（`data-theme="light"` 或 `data-theme="dark"`）。
- **REQ-001.2**: The system **shall** 在最终生效主题为深色时，同时为 `<html>` 添加 `.dark` class；浅色时移除 `.dark` class，以激活/停用 Element Plus 暗色 css-vars。
- **REQ-001.3**: **When** 当前模式为 `system` 且 `window.matchMedia('(prefers-color-scheme: dark)').matches` 变化时，the system **shall** 自动切换最终生效明暗并同步 `<html>` 标记，无需用户点击、无需刷新。
- **REQ-001.4**: **If** 浏览器不支持 `matchMedia` 或 `prefers-color-scheme`，**then** the system **shall** 将 `system` 模式降级为浅色（最终生效 `data-theme="light"`，无 `.dark` class）。
- **REQ-001.5**: **If** 浏览器禁用 JavaScript，**then** the system **shall** 以 `:root` 默认浅色 tokens 呈现页面，保证基本可读性。

**Gherkin**:
```gherkin
Scenario: system 模式跟随 OS 主题自动切换
  Given 用户选择了 "system" 模式
  When 操作系统主题从浅色切换为暗色（或 DevTools emulates prefers-color-scheme: dark）
  Then <html> 应被设置 data-theme="dark" 并包含 .dark class
  And 页面主要区域颜色在 0.2s 内平滑过渡到暗色
```

---

## REQ-002: 主题切换按钮与三态循环交互

**User Story**
> As a 用户，I want 通过一个图标按钮在三态间循环切换主题，so that 我无需进入设置页即可快速切换。

**Priority**: P0

**需求描述**
在 DefaultLayout 顶栏右侧（语言切换旁）与 BlankLayout（登录页/错误页）右上角提供统一的 ThemeToggle 图标按钮。点击按 `light → dark → system → light` 循环切换模式；按钮图标与 tooltip/aria-label 反映"下一次点击将进入的模式"，system 模式使用专用"显示器/自动"图标以区别于手动浅/深色。

**Acceptance Requirements**

- **REQ-002.1**: The system **shall** 在 DefaultLayout 顶栏右侧（语言切换下拉旁）和 BlankLayout 右上角各展示一个主题切换图标按钮，不依赖登录状态、不被 `v-permission` 控制（TR-01/TR-13）。
- **REQ-002.2**: **When** 用户点击主题按钮，the system **shall** 按 `light → dark → system → light` 的顺序循环切换模式，并立即生效（不弹二次确认、不刷新、不丢失表单输入状态）（TR-05）。
- **REQ-002.3**: The system **shall** 在浅色模式下显示"月亮"图标（提示下一次切到深色），深色模式下显示"太阳"图标（提示下一次切到跟随系统），system 模式下显示"显示器/自动"图标（提示下一次切到浅色）（TR-01、OQ-4）。
- **REQ-002.4**: The system **shall** 为按钮提供 `title` 与 `aria-label`，并在使用 `el-tooltip` 时文案与 aria-label 一致，中文/英文 i18n 文案见 COPY 小节（TR-01）。
- **REQ-002.5**: **If** localStorage 不可用（如隐私模式），**then** the system **shall** 仍允许本次会话内切换主题，但不持久化，下次打开回默认值，不弹错误提示。

**Gherkin**:
```gherkin
Scenario: 三态按钮完整循环
  Given 当前模式为 light
  When 用户连续点击主题按钮 3 次
  Then 模式应依次变为 dark → system → light
  And 按钮图标依次为 太阳 → 显示器 → 月亮
  And 页面每次点击后颜色立即过渡
```

---

## REQ-003: 主题视觉覆盖与「苔 Moss」色板接入

**User Story**
> As a 用户，I want 所有页面在浅/深主题下使用统一的「苔 Moss」色板，so that 视觉一致、对比清晰、无硬编码色块。

**Priority**: P0

**需求描述**
在 `src/styles/theme.scss` 中集中定义「苔 Moss」CSS 变量（浅色 :root、暗色 `html.dark, [data-theme="dark"]`），并用 moss 主色语义变量覆盖 Element Plus `--el-color-primary*` 系列（浅色/暗色分别）。改造所有受影响页面/组件的硬编码色值，侧栏、顶栏、面包屑、卡片、按钮、文字、边框、代码块、下拉、Toast/MessageBox、NProgress 均使用 CSS 变量。

**Acceptance Requirements**

- **REQ-003.1**: The system **shall** 严格使用 `knowledge/template/网页页面主题风格.md` 中「苔 Moss」tokens 定义 `:root`（浅色）与 `[data-theme="dark"]`（暗色）下的 CSS 变量，包含 `--moss-primary / --moss-primary-soft / --moss-ink / --moss-accent / --moss-clay / --moss-stone / --moss-mist / --surface-canvas / --surface-card / --surface-sunken / --text-primary / --text-secondary / --text-tertiary / --text-on-primary / --border-default / --border-strong / --radius-sm/md/lg / --font-sans / --font-mono / --text-title / --text-body / --text-caption / --leading-body / --weight-regular / --weight-medium`；暗色 token 值与模板一致。
- **REQ-003.2**: The system **shall** 在浅色与暗色下分别用 moss 主色语义覆盖 Element Plus 的 `--el-color-primary` 及其分级（`--el-color-primary-light-1~9`、`--el-color-primary-dark-2`），使 `type="primary"` 按钮、链接色、focus ring、菜单激活态呈现 moss 绿（浅色约 #5A8A3C，暗色约 #97C459 量级），而非 EP 默认蓝 #409EFF。
- **REQ-003.3**: The system **shall** 替换所有受影响 `.vue` 文件（登录页、DefaultLayout 侧栏/顶栏、仪表盘、error 页、HelloWorld）中的硬编码十六进制颜色（如 `#001529`、`#002140`、`#1677ff`、`#69b1ff`、`#fff`、`#000` 等最终色值）为 CSS 变量引用；不得在 template 内联 style 中继续写死颜色（TR-03）。
- **REQ-003.4**: The system **shall** 为登录页替换原蓝色渐变：浅色使用 `--moss-mist → --moss-primary-soft` 的柔和渐变；暗色使用暗色表面 + moss 主色暗化的低饱和渐变，避免高饱和蓝光（TR-04）。
- **REQ-003.5**: The system **shall** 改造侧栏样式：浅色模式下使用 moss 深色侧栏视觉（基于 `--moss-ink` / `--moss-primary-soft` 层级，不再保留 #001529/#002140 深海军蓝）；暗色模式下使用 `--surface-card` / `--surface-sunken` 层级；菜单项文字/hover/active 态、logo 区、分割线均使用 moss tokens（OQ-2 选项 a）。
- **REQ-003.6**: The system **shall** 确保顶栏背景、底部分割线、面包屑文字、头像下拉菜单背景、主内容区背景（canvas）、卡片（card）背景与边框、统计数字标题与值、按钮、输入框、Toast/MessageBox、`<code>` 代码块背景与文字均来自 CSS 变量，不残留硬编码色值（TR-03）。
- **REQ-003.7**: The system **shall** 为 NProgress 进度条颜色提供主题适配（在两种主题下分别覆盖为 moss 主色或相应强调色），避免暗色下进度条颜色刺眼（INFER-04）。
- **REQ-003.8**: The system **shall** 保持圆角（`--radius-sm/md/lg`）、字号（`--text-title/body/caption`）、字重（`--weight-regular/medium`）、行高（`--leading-body`）优先复用 moss tokens，不引入与模板不一致的新基线（如 4px 圆角、14px/16px 新字号基线）。

**Gherkin**:
```gherkin
Scenario: 深色模式下 Element Plus primary 按钮显示 moss 绿
  Given 用户切换到 dark 模式
  When 仪表盘页面渲染 type="primary" 的 el-button
  Then 按钮主色应为 moss 绿（约 #97C459 量级），非 Element Plus 默认蓝 #409EFF
```

---

## REQ-004: 主题偏好持久化

**User Story**
> As a 用户，I want 我的主题偏好在刷新/重新打开浏览器后仍然保留，so that 我不需要每次重新设置。

**Priority**: P0

**需求描述**
主题模式状态放入现有 `useAppStore`（`src/store/modules/app.ts`），与 `locale`、`sidebarCollapsed` 并列；通过现有 `pinia-plugin-persistedstate` 持久化到 `localStorage` 的 `zvalley_dashboard_app` 键，在现有 `paths: ['sidebarCollapsed', 'locale']` 基础上追加 `'theme'`。

**Acceptance Requirements**

- **REQ-004.1**: The system **shall** 在 `useAppStore` 中新增 `theme` 状态字段，类型为 `'light' | 'dark' | 'system'`，默认值为 `'system'`（TR-02、OQ-1 选项 a）。
- **REQ-004.2**: The system **shall** 在 `useAppStore` 中提供 `setTheme(mode: 'light' | 'dark' | 'system')` action，负责更新状态并触发 html 标记更新。
- **REQ-004.3**: The system **shall** 在 pinia persist 配置的 `paths` 数组中追加 `'theme'`，与 `sidebarCollapsed`、`locale` 共存于 `zvalley_dashboard_app` localStorage key，不新增独立 key（TR-08、INFER-02）。
- **REQ-004.4**: **When** 用户切换主题后刷新页面、关闭浏览器重新打开或在新标签页访问，the system **shall** 恢复到用户上次选择的模式。
- **REQ-004.5**: **If** localStorage 中无 `theme` 字段（首次访问），**then** the system **shall** 使用默认值 `'system'` 并根据 `prefers-color-scheme` 推导最终明暗。

---

## REQ-005: 首屏防闪烁（FOUC）与平滑过渡

**User Story**
> As a 用户，I want 首屏加载即为目标主题、主题切换平滑，so that 不出现白闪/黑闪或生硬跳变。

**Priority**: P0

**需求描述**
在 `index.html` 的 `<head>` 中内联一段同步 IIFE 脚本（无依赖，< 1KB），在主样式与 Vue 挂载前读取 localStorage 中的主题偏好 → 推导最终明暗 → 立即在 `<html>` 设置 `data-theme` 与 `.dark` class。在 CSS 中为颜色类属性（`background-color / color / border-color / box-shadow`、`fill / stroke` 等）添加约 0.2s 的 `transition`，覆盖 body、侧栏、顶栏、卡片、按钮等主要元素；不对 width / transform / 布局属性加全局过渡，避免影响侧栏折叠等现有动画。

**Acceptance Requirements**

- **REQ-005.1**: The system **shall** 在 `index.html` 的 `<head>` 中、主 CSS 之后、`<div id="app">` 与主模块脚本之前，内联一段同步 IIFE 脚本，执行时间应 < 10ms（远小于一帧）。
- **REQ-005.2**: The FOUC 脚本 **shall** 使用与运行时完全相同的 localStorage key（`zvalley_dashboard_app`）、同一套 mode→effective 推导逻辑（system 读取 prefers-color-scheme，不支持降级 light），与 REQ-001/REQ-004 保持一致。
- **REQ-005.3**: The system **shall** 对颜色类属性（`background-color`、`color`、`border-color`、`box-shadow`、`fill`、`stroke`、`caret-color`）在 `body`、侧栏、顶栏、面包屑、卡片、按钮、输入、下拉、代码块等主要元素上添加约 `0.2s` 的 `transition`，不参与图片、图表与布局属性（TR-07）。
- **REQ-005.4**: **When** 用户在明暗之间切换，the system **shall** 在 0.2s 内完成颜色平滑过渡，不触发路由刷新、不触发组件重新挂载、不丢失表单输入状态（约束"稳定性"）。
- **REQ-005.5**: **When** 清空 localStorage 后分别在系统浅色/深色下硬刷新（Ctrl+Shift+R），the system **shall** 首帧即为目标主题，不出现与目标主题相反底色的闪烁（FOUC 验证项）。

**Gherkin**:
```gherkin
Scenario: 硬刷新无闪烁
  Given 用户切换到 dark 模式并刷新
  When DevTools 禁用缓存后执行 Ctrl+Shift+R 硬刷新
  Then 首屏背景即为暗色 canvas 色，无白底闪现
```

---

## REQ-006: Element Plus 暗色样式接入

**User Story**
> As a 用户，I want Element Plus 原生组件（菜单、卡片、表单、下拉、消息、对话框、头像等）在暗色模式下也正常显示，so that 系统原生组件与自定义区域视觉统一。

**Priority**: P0

**需求描述**
在入口样式（如 `src/styles/index.scss`）中引入 `element-plus/theme-chalk/dark/css-vars.css`；暗色生效时给 `<html>` 加 `.dark` class 以激活该样式；在 `[data-theme="dark"]` 选择器下用 moss 主色与表面/文本/边框变量覆盖 EP 相关语义变量，确保视觉一致。

**Acceptance Requirements**

- **REQ-006.1**: The system **shall** 在全局样式入口 `import 'element-plus/theme-chalk/dark/css-vars.css'`，不引入 EP 暗色 SCSS 源码、不做编译期定制（TR-10、约束"无第三方新依赖"）。
- **REQ-006.2**: **When** 最终生效主题为 dark，the system **shall** 同时为 `<html>` 设置 `data-theme="dark"` 与 `.dark` class；浅色时移除 `.dark` class（与 REQ-001.2 协同）。
- **REQ-006.3**: The system **shall** 在暗色与浅色下分别覆盖 EP `--el-bg-color*`、`--el-text-color*`、`--el-border-color*`、`--el-fill-color*`、`--el-mask-color` 等通用语义变量，使其与 moss `--surface-*`、`--text-*`、`--border-*` tokens 对齐，避免 EP 默认灰阶与 moss 色调冲突。
- **REQ-006.4**: The system **shall** 确保 `el-menu`（侧栏）、`el-card`（统计卡/Demo 卡）、`el-breadcrumb`、`el-dropdown`（语言/头像下拉）、`el-statistic`、`el-button`、`el-input`、`el-message`、`el-message-box`、`el-dialog`、`el-tooltip`、`el-avatar` 在浅/深主题下背景、文字、边框、阴影对比度合理，无白底黑字压深色/深字压深底情况。

---

## REQ-007: 页面覆盖完整性

**User Story**
> As a 用户，I want 我访问到的所有页面（登录、主框架、仪表盘、错误页、示例组件）都适配主题，so that 不会出现某个页面还是硬编码白底黑字。

**Priority**: P0

**需求描述**
改造范围必须覆盖 §4.2 所有页面（登录页、DefaultLayout、仪表盘、error/403、error/404、HelloWorld），并明确不改动 prototype/knowledge-base/ 与 e2e/ 链路（NG-06）。

**Acceptance Requirements**

- **REQ-007.1**: The system **shall** 在登录页（BlankLayout 下）适配渐变背景、卡片、表单、输入框、按钮、语言下拉、主题按钮的浅/深主题样式；右上角主题按钮可即时切换登录页主题（S-01、TR-04/TR-13）。
- **REQ-007.2**: The system **shall** 在 DefaultLayout 下适配侧栏（logo 区、菜单项文字/hover/active、折叠态）、顶栏（折叠按钮、面包屑、语言下拉、头像下拉、底部分割线、阴影）、主内容区（canvas 背景）的浅/深主题样式（S-02）。
- **REQ-007.3**: The system **shall** 在仪表盘首页适配欢迎标题、4 个统计卡片（el-card + el-statistic）、Demo 卡片、按钮（primary/success/default）、`<code>` 提示文本、Message/Toast 弹窗的浅/深主题样式，卡片边框/阴影在对应主题下对比清晰。
- **REQ-007.4**: The system **shall** 在 error/403、error/404 页面适配背景、插画占位（若有）、文案、返回按钮的浅/深主题样式；主题按钮在错误页仍可用并即时切换（S-04、INFER-05）。
- **REQ-007.5**: The system **shall** 在 HelloWorld 示例组件（若存在路由挂载）适配文本、按钮、代码块、链接的浅/深主题样式，作为主题接入正确性的最小回归样本（S-05）。
- **REQ-007.6**: The system **shall NOT** 改动 `prototype/knowledge-base/`、`e2e/`、`docs/requirements/知识库系统-*` 目录下的任何文件（NG-06）。

---

## REQ-008: i18n 文案补充

**User Story**
> As a 中英文用户，I want 主题按钮的 tooltip 与 aria-label 显示为我当前使用的语言，so that 体验一致。

**Priority**: P1

**需求描述**
在现有 `src/locales/` 中文与英文语言包里补充主题相关文案 key，不重命名、不删除原有 key。

**Acceptance Requirements**

- **REQ-008.1**: The system **shall** 在中文与英文语言包中分别补充以下 key（具体文案见 COPY 小节）：`app.themeLight`、`app.themeDark`、`app.themeSystem`、`app.themeSwitchToLight`、`app.themeSwitchToDark`、`app.themeSwitchToSystem`（或等价的 tooltip 模板 key）。
- **REQ-008.2**: The system **shall** 在中文环境显示中文文案、在 English 环境显示英文文案；tooltip 文案随当前模式反映"下一次点击将切换到的模式"（与 REQ-002.3 一致）。
- **REQ-008.3**: The system **shall** 不重命名、不删除任何已有 i18n key。

---

## REQ-009: 既有能力不回归

**User Story**
> As a 用户与开发者，I want 本次主题适配不破坏现有业务交互与工程规范，so that 上线风险可控。

**Priority**: P0

**需求描述**
登录流程、表单校验、国际化切换、侧栏折叠、路由跳转、仪表盘统计接口调用、`v-permission` 指令、NProgress 进度条等现有行为保持不变；代码风格、类型、lint 与测试按现有规范通过。

**Acceptance Requirements**

- **REQ-009.1**: The system **shall** 保持登录/登出、表单校验、语言切换、侧栏折叠、路由跳转、统计接口调用成功/失败 Toast、admin 权限按钮显示逻辑、NProgress 进度条行为在主题切换前后功能正常（TR-14）。
- **REQ-009.2**: The system **shall NOT** 升级依赖大版本；除 Element Plus 已自带的 `theme-chalk/dark/css-vars.css` 外，pnpm-lock.yaml 中不新增与主题相关的第三方依赖（不引入 vueuse/useColorMode、unocss-preset-theme、EP 暗色 SCSS 源码等）。
- **REQ-009.3**: The system **shall** 通过 `pnpm lint`（无新增 ESLint/Stylelint 错误；stylelint 不得出现未使用变量）与 `pnpm type-check`。
- **REQ-009.4**: The system **shall** 为 `useAppStore` 的 theme 相关 getter/action 补充或扩展 `src/store/__tests__/` 下的单元测试（如 setTheme、默认值、persist 路径配置、system→effective 推导）；不强制 E2E。

---

# 6. 字段与校验

> 本次无后端字段、无对外 API 字段契约；仅记录前端本地存储字段与状态字段。

| 字段 ID | 字段名称 | 类型 | 必填 | 默认值 | 约束 / 校验 | 使用页面 / 展示位置 | 关联 REQ |
|---------|----------|------|------|--------|-------------|----------------------|----------|
| FIELD-001 | useAppStore.theme | `'light' \| 'dark' \| 'system'` | 是 | `'system'` | 枚举值仅允许 light/dark/system；非法值回退 system | 全局（ThemeToggle、FOUC 脚本、CSS 标记设置） | REQ-001, REQ-004 |
| FIELD-002 | localStorage `zvalley_dashboard_app.theme` | string | 否 | 无（首次访问） | 与 FIELD-001 同枚举；由 pinia-plugin-persistedstate 写入，FOUC 脚本读取 | 浏览器本地 | REQ-004, REQ-005 |
| FIELD-003 | html[data-theme] | `'light' \| 'dark'` | 是（运行时） | 由 FIELD-001 推导 | 仅 light/dark；system 不在 DOM 上直接体现，由运行时推导后写入 light/dark | `<html>` 根节点 | REQ-001, REQ-005, REQ-006 |
| FIELD-004 | html.dark (class) | boolean | 是（运行时） | dark=true，light=false | 仅用于激活 Element Plus dark css-vars；与 data-theme="dark" 同步 | `<html>` 根节点 | REQ-001, REQ-006 |

---

# 7. 状态与流转

## 7.1 状态定义

| 状态 ID | 状态名称 | 含义 | 进入条件 | 退出条件 |
|---------|----------|------|----------|----------|
| STATE-001 | mode=light | 用户显式选择浅色 | 用户点击切换至 light；或（无 localStorage 时不进入此状态，默认 system） | 用户点击切换至 dark/system；或持久化数据被清除 |
| STATE-002 | mode=dark | 用户显式选择深色 | 用户点击切换至 dark | 用户点击切换至 system/light；或持久化数据被清除 |
| STATE-003 | mode=system | 跟随系统 | 首次访问（默认）；或用户点击切换至 system | 用户点击切换至 light/dark；或持久化数据被清除 |
| STATE-004 | effective=light | 最终呈现浅色 | mode=light；或 mode=system 且 prefers-color-scheme: light（或不支持 matchMedia 降级） | effective 对应的条件不再成立 |
| STATE-005 | effective=dark | 最终呈现深色 | mode=dark；或 mode=system 且 prefers-color-scheme: dark | effective 对应的条件不再成立 |

## 7.2 操作流转

| 操作 ID | 用户动作 | 前置状态 | 目标状态 | 生效时机 | 失败处理 | 关联 REQ |
|---------|----------|----------|----------|----------|----------|----------|
| ACTION-001 | 点击主题按钮（light→dark） | mode=light | mode=dark → effective=dark | 立即（同步更新 html 标记 + CSS 变量过渡 0.2s） | localStorage 不可用时仅会话内生效，下次回默认 | REQ-002, REQ-005 |
| ACTION-002 | 点击主题按钮（dark→system） | mode=dark | mode=system → effective 由 matchMedia 决定 | 立即；同时注册 matchMedia change 监听 | 不支持 matchMedia 时降级 effective=light | REQ-001, REQ-002 |
| ACTION-003 | 点击主题按钮（system→light） | mode=system | mode=light → effective=light | 立即；注销/复用同一 matchMedia 监听（无内存泄漏） | 同 ACTION-001 | REQ-002 |
| ACTION-004 | OS 主题变化（system 模式下） | mode=system | effective 在 light↔dark 间切换 | matchMedia change 事件触发时立即 | 不支持 matchMedia 时无此事件，降级 light | REQ-001 |
| ACTION-005 | 页面加载（首次/刷新） | 无 | 读取 localStorage → 推导 mode → effective → 应用到 html | FOUC 脚本在 Vue 挂载前同步完成 | localStorage 不可用/无值时默认 system 并降级 | REQ-004, REQ-005 |

## 7.3 关键文案（COPY）

| Key | 中文 | English | 位置 | 关联 REQ |
|-----|------|---------|------|----------|
| app.themeLight | 浅色模式 | Light Mode | 按钮当前模式提示（可选） | REQ-008 |
| app.themeDark | 深色模式 | Dark Mode | 按钮当前模式提示（可选） | REQ-008 |
| app.themeSystem | 跟随系统 | Sync with System | 按钮当前模式提示（system 态） | REQ-008 |
| app.themeSwitchToDark | 切换到深色模式 | Switch to dark mode | light 态 tooltip / aria-label | REQ-002, REQ-008 |
| app.themeSwitchToSystem | 切换到跟随系统 | Switch to system mode | dark 态 tooltip / aria-label | REQ-002, REQ-008 |
| app.themeSwitchToLight | 切换到浅色模式 | Switch to light mode | system 态 tooltip / aria-label | REQ-002, REQ-008 |

> 编码阶段可视图标语义微调具体文案，但需满足：(1) tooltip/aria-label 指向"下一次点击后的模式"；(2) 中文/英文均完整覆盖；(3) 不新增文案 key 外的硬编码文案。

---

# 8. API 设计

本次无 API 变更。

本需求为纯前端视觉适配，不涉及对外 API、SDK、Webhook、CLI 或客户集成契约变更；不新增/修改任何 HTTP 接口、请求响应字段、错误码；不涉及账号级云端主题偏好同步（NG-04）。前端 localStorage 为浏览器本地偏好存储，不属于对外 API 契约，其字段定义见 §6。

---

# 9. 非功能性需求

| NFR ID | 类别 | 要求 | 验收方法 |
|--------|------|------|----------|
| NFR-001 | 性能 | 首屏 FOUC 内联脚本执行时间 < 10ms，不阻塞首帧渲染；CSS 变量切换本身为同步操作，不引入额外网络请求与新依赖 | DevTools Performance 面板测量；清空 localStorage 硬刷新走查；pnpm-lock.yaml diff 审查 |
| NFR-002 | 兼容性 | 支持 Chrome / Edge / Firefox / Safari 最新两个大版本；不要求兼容 IE；不支持 matchMedia/prefers-color-scheme 时 system 模式降级为浅色；禁用 JS 时以 :root 默认浅色渲染可读 | 浏览器矩阵人工走查；禁用 JS 访问验证；matchMedia polyfill 缺失场景验证 |
| NFR-003 | 稳定性 | 主题切换不触发路由刷新、不触发组件重新挂载、不丢失表单输入状态；matchMedia 监听在组件卸载/SPA 切换时无内存泄漏 | 切换主题时在表单中输入内容观察不丢失；长时间运行 DevTools Memory 无明显泄漏（开发自查） |
| NFR-004 | 可维护性 | 主题 CSS 变量集中在 `src/styles/theme.scss`，在 `index.scss` 中 import；moss 色板在 :root 定义，暗色在 `html.dark, [data-theme="dark"]` 下覆盖；组件内禁止硬编码最终色值 | 代码走查：grep 受影响 `.vue` / `.scss` 文件，确认无残留硬编码最终色值（允许透明/rgba 基于变量的 alpha 变体）；pnpm lint 通过 |
| NFR-005 | 可访问性（本需求范围内） | 主题按钮提供 aria-label；正文与背景对比度 ≥ WCAG AA (4.5:1)，次要文字 ≥ 3:1；不做字号缩放/色盲友好（NG-03） | 开发自查 + Chrome DevTools 对比度检查；aria-label 走查 |
| NFR-006 | 代码规范与提交 | 遵循现有 ESLint / Stylelint / Prettier / Conventional Commits；提交信息 scope 使用 `feat(theme):` / `fix(theme):` / `docs(spec):` 等；不提交 node_modules / 构建产物 | pnpm lint / pnpm type-check 全绿；git log 检查 |
| NFR-007 | 发布 / 回滚 | 纯前端改动，无后端/数据变更，回滚仅需回退前端提交；无数据库迁移、无灰度开关需求 | 回滚方案：revert 主题提交即可恢复原浅色硬编码表现；不涉及数据兼容问题 |

---

# 10. 追溯矩阵

| REQ / NFR ID | 设计章节 | QA 重点（开发自查 + 评审走查） | 证据来源 |
|--------------|----------|--------------------------------|----------|
| REQ-001 | §4.1 ENTRY / §7 STATE / theme.scss + appStore | 三态切换、html 标记正确、system 跟随 OS、降级策略 | 需求澄清 §3.3、§3.4 TR-10/TR-11 |
| REQ-002 | §4.1 ENTRY / §7.2 ACTION / ThemeToggle 组件 | 循环顺序、图标/tooltip 同步、登录页可见、隐私模式降级 | 需求澄清 TR-01/TR-05/TR-13、OQ-3/OQ-4 |
| REQ-003 | §5 theme.scss / 各页面 scoped 样式 | moss 变量全面覆盖、无硬编码色值、EP 主色覆盖、侧栏/登录页渐变/NProgress 适配 | 网页页面主题风格.md、需求澄清 TR-03/TR-04、OQ-2 |
| REQ-004 | §6 FIELD / useAppStore persist 配置 | 默认值 system、paths 追加 theme、刷新/重开保留、首次访问默认 | 需求澄清 TR-02/TR-08、OQ-1、INFER-01/02 |
| REQ-005 | index.html 内联 IIFE / 全局 transition 样式 | FOUC 脚本位置/执行时间/同源逻辑、过渡属性范围、不重挂载、不丢输入 | 需求澄清 TR-07/TR-09 |
| REQ-006 | theme.scss 中 EP 变量覆盖 / 入口引入 dark/css-vars.css | 菜单/卡片/下拉/消息/对话框暗色表现、html.dark 切换与 data-theme 同步 | 需求澄清 TR-10 |
| REQ-007 | 登录页 / DefaultLayout / dashboard / error / HelloWorld 改造范围 | 各页面浅/深下视觉协调、主题按钮在错误页可用、prototype/e2e 未被改动 | 需求澄清 S-01~S-05、NG-06、INFER-03/05 |
| REQ-008 | src/locales/zh-CN.ts 与 en.ts 补充 | 中英文文案完整、tooltip 反映下一次模式、不破坏旧 key | 需求澄清 §3.6 |
| REQ-009 | 全量回归 + lint/type-check + 单测 | 既有功能不回归、无新依赖、lint/type-check 通过、useAppStore 单测覆盖 theme | 需求澄清 §4 约束、§5 验收 |
| NFR-001 ~ NFR-007 | §9 | 性能、兼容、稳定、可维护、可访问性、规范、回滚 | 需求澄清 §4 约束 |

---

# Open Questions

> 需求澄清 §6 的 OQ 项均在本 Spec 中按"建议默认值"落地，下列条目保留为可调整项；编码阶段按默认值实现并在代码注释中标注 `（OQ-<编号>）`，如后续业务确认不同方向，走 Spec 变更流程。

| ID | 问题 | 默认决策（本 Spec 采用） | 影响范围 | 建议负责人 |
|----|------|--------------------------|----------|------------|
| OQ-1 | 首次访问（无 localStorage）默认主题 | (a) 跟随系统（system） | REQ-004.1 默认值、FIELD-001 默认值 | PM / 前端 |
| OQ-2 | 浅色模式下侧栏样式 | (a) 深色侧栏（moss 暗色层级，moss-ink / moss-primary-soft），替换 #001529 | REQ-003.5、侧栏样式实现 | 设计 / 前端 |
| OQ-3 | 主题按钮三态循环顺序 | (a) 单击循环 light → dark → system | REQ-002.2、ACTION-001/002/003 | PM / 前端 |
| OQ-4 | system 模式下按钮图标 | (a) 专用"自动/显示器"图标（Monitor），区别于手动太阳/月亮 | REQ-002.3、ThemeToggle 图标映射 | 设计 / 前端 |

> 以上 OQ 不阻塞下游技术设计与编码节点，按默认值执行即可。
