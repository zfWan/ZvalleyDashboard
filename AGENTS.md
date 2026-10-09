# AGENTS.md

本文件为 AI 编码助手（Qoder / Claude Code 等）在本仓库工作时的项目指引。

## 1. 项目概览

ZValleyDashboard 是工作流「知识库系统（Knowledge Base）」的交付仓库，当前处于**原型阶段**：
交付物是一版**可交互高保真 HTML 原型**（非生产实现），无后端、无数据库、无鉴权、无埋点。

三条并行的产物链路（改动时必须知道自己在动哪一条）：

```
docs/requirements/  ──►  prototype/knowledge-base/  ──►  e2e/
需求澄清 → Spec → Gate   可交互原型（Spec 的实现）      E2E 用例（Spec REQ 的验证）
```

- `docs/requirements/` 是**唯一事实来源（Single Source of Truth）**：范围、验收口径、字段规则、状态机都在这里。
- `prototype/knowledge-base/` 是 Spec 的实现，代码注释直接标注 REQ / PAGE / OQ 编号。
- `e2e/` 是 Spec §5 REQ-001 ~ REQ-008 的自动化验证，Spec 即 E2E 用例设计基线。

## 2. 目录结构

```
ZvalleyDashboard/
├── docs/requirements/          # 需求澄清 / Spec / Gate（带 YAML front-matter）
├── prototype/knowledge-base/   # 可交互原型：index.html + css/style.css + js/{data,app}.js
├── e2e/                        # Playwright E2E（独立 npm 项目，有自己的 package.json）
└── README.md
```

`prototype/` 与 `e2e/` 是**两个完全独立的技术栈**（前者零依赖零构建，后者 Node + Playwright），不要把测试代码打进原型，也不要在原型里引入构建工具。

## 3. 常用命令

原型（无构建，直接用浏览器打开 `prototype/knowledge-base/index.html`）：

```bash
# 本地静态服务（与 E2E 使用的服务器同源，可用于真机调试）
node e2e/server.js --port 4173 --root prototype/knowledge-base
```

E2E：

```bash
cd e2e
npm install                # 安装 Playwright（不下载浏览器，需系统 Chrome / Chromium）
npx playwright test        # 全量 REQ-001~008
npx playwright test --grep "REQ-006"   # 按 REQ 分子集
npm run report             # 打开 HTML 报告
```

环境要求：Node.js >= 18；系统 Chrome / Chromium。探测顺序为
`PLAYWRIGHT_CHROMIUM_PATH` → `google-chrome-stable` / `google-chrome` / `chromium-browser` / `chromium`。
报告与失败产物在 `e2e/reports/`（已被 `.gitignore` 忽略）。

## 4. 范围边界（Non-Goal，改动前先确认没越界）

原型阶段**明确不做**，除非用户显式要求，否则不要"顺手实现"：

- 多租户、权限、鉴权、协作者、评论共享（NG-001 / NG-004）
- 生产级后端、数据库、API、SDK、Webhook、埋点（NG-002 / NG-006）
- 审计日志与使用统计（NG-005）
- 版本管理、回收站、多级目录树
- 与 ZValleyDashboard 其他模块的深度集成（导航仅作入口示意，其余入口点击提示）

数据是**内存模拟**：每次刷新页面恢复种子数据（9 篇文档 / 4 个分类 / 3 个模板）。
若改动种子数据，必须同步更新 `e2e/specs/knowledge-base.spec.js` 中依赖数量的断言
（如「全部文档：9 篇」「筛选结果：1 篇」）。

## 5. 原型编码约定（`prototype/knowledge-base/`）

**运行环境约束（最重要）**

- 零依赖、零构建、零 CDN、零框架。浏览器直接打开 `index.html` 即可运行；若浏览器在 `file://` 下对 `history.replaceState` 有兼容问题（见 `e2e/server.js` 说明），改用上面的静态服务方式访问。
- JS 使用 **ES5 风格**：IIFE 包裹 + `'use strict'`、`var`、函数声明，兼容老浏览器。禁止 `const/let`、箭头函数、模板字符串、`class`、模块系统。
- 页面为 hash 路由：`#/`（列表）、`#/doc/<id>`（详情）、`#/edit/<id>`（编辑）、`#/edit?template=<id>`（模板预填充新建）。
- 视图渲染统一走 `innerHTML` 字符串拼接 + 渲染后手工绑定事件；用户输入渲染前必须 `escapeHtml()`。

**命名与样式**

- CSS class：kebab-case；JS 变量/函数：camelCase；CSS 变量集中在 `:root`，新样式优先复用已有变量。
- `style.css` 按区块注释组织，新增样式放进对应区块，保持顺序：`布局 → 通用组件 → 工具栏/列表 → 状态视图 → 骨架屏 → 详情 → Markdown → 编辑 → 弹层 → Toast → 演示控制台 → 响应式`。
- 交互元素必须保留（或新增）**稳定的 `data-*` 钩子**（如 `data-new-doc`、`data-save`、`data-filter-cat`、`data-retry`），E2E 依赖它们定位；不要用纯样式类名做唯一锚点。

**注释与文案**

- 注释、分节标题、Toast 文案、空态文案一律**中文**，并在关键处标注 Spec 编号（如 `// REQ-008.1 无文档空态`）。
- 每个源文件顶部保留一段 `/* ==== */` 块注释，说明文件职责、对应 Spec 章节、采用的 OQ 默认值。

**演示控制台**

右下角 `#dev-panel` 是**评审演示工具，不是产品功能**：用于模拟列表加载失败、保存失败、空数据。
新增异常/空态场景时优先接入这里，而不是改产品逻辑。代码中必须保持该标注不被删除。

## 6. E2E 约定（`e2e/`）

- 分层：`specs/`（用例）+ `pages/`（Page Object）+ `helpers/`（工具）+ `server.js`（零依赖静态服务）。
- 用例按 **REQ 编号分 `test.describe` 分组**，用例标题用中文描述用户可观察的行为；断言文案以 Spec §7.3 关键文案为准（如「文档已创建并发布」「暂无搜索结果」）。
- 页面对象集中在 `pages/knowledgeBasePage.js`，选择器写在 getter 里并注释对应的 PAGE / REQ；**任何 DOM 结构或 `data-*` 变化都要先同步 Page Object**。
- 原型为内存态单页应用，配置固定 `workers: 1`、`fullyParallel: false`、`retries: 0`；不要为了提速改成并行（会因共享演示开关与内存态互相干扰）。
- 新增交互功能时，同步补充对应 REQ 分组下的用例，保持"每个 REQ 至少 1 条验收用例"。

## 7. 文档约定（`docs/requirements/`）

- Spec / Gate 文档带 YAML front-matter（`spec_id`、`status`、`template_id`、`created_at`、`updated_at` 等），修改内容时同步更新 `updated_at`。
- Spec 结构固定：Review Summary / Scope Note / 元信息 / 背景 / 目标与边界 / 核心概念 / 页面与信息架构 / 功能需求（REQ） / 字段与校验（FIELD） / 状态与流转（STATE、ACTION、COPY） / API / NFR / 追溯矩阵 / Open Questions（OQ）。
- **追溯性**：任何新增或调整的需求都要维护 REQ ↔ 设计章节 ↔ E2E 用例 ↔ 原型代码注释的对应关系，不要留下无编号的孤立实现。
- OQ（待确认项）在评审拍板前，**按 Spec 中的"建议默认值"实现**，并在代码注释里标注 `（OQ-xxx）`；用户给出新结论时，先更新 Spec 再改代码。
- 推断项必须显式标注为推断（需求澄清文档 §6），不要把推断写成既定事实。

## 8. Git 约定

- 分支：`feat/<工作流>-<工作流id>`（当前：`feat/knowledge-base-system-i4sd`），不直接在 `main` 上开发。
- 提交信息用 Conventional Commits + 中文描述，scope 体现产物类型：
  - `docs(requirement):` / `docs(spec):` —— 需求澄清、Spec / Gate
  - `feat(prototype):` / `fix(prototype):` —— 原型实现与修复
  - `test(e2e):` —— E2E 用例
- 一次提交聚焦一类改动（原型改动与其对应的 E2E / 文档调整可同批提交）。
- 不提交 `node_modules/`、`e2e/reports/` 等产物。

## 9. 完成前自检清单

- [ ] 改动是否落在 Spec 已确认范围内？越界需求先与用户确认，不要自行扩范围。
- [ ] 原型改动后，`npx playwright test` 全绿；新增交互已补 E2E 用例与 Page Object。
- [ ] 改动种子数据时，已同步更新依赖数量的断言。
- [ ] 中文注释 / 文案与 Spec 编号标注是否到位，`data-*` 钩子是否保留。
- [ ] 涉及需求口径变化的，是否已先更新 `docs/requirements/` 再改代码。
- [ ] 涉及 README 描述（覆盖范围、命令、目录结构）时是否已同步。
