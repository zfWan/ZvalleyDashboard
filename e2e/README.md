# 知识库系统原型 · E2E 自动化测试

针对 `prototype/knowledge-base/` 可交互高保真原型（HTML）的 E2E / UI 自动化测试，使用 Playwright。

## 覆盖范围

用例来源于《docs/requirements/知识库系统-Spec.md》第 5 章 REQ-001 ~ REQ-008 的
Acceptance Requirements 与 Gherkin 场景（Spec 即本轮 E2E 用例设计基线）：

| 分组 | 覆盖内容 | 用例数 |
| --- | --- | --- |
| REQ-001 | 知识库入口与导航（主导航入口、原型边界提示） | 1 |
| REQ-002 | 分类创建与默认分类归属 | 2 |
| REQ-003 | 新建文档（空白/模板选择、模板预填充、保存入列可检索、必填校验） | 4 |
| REQ-004 | 文档编辑与保存（编辑生效、保存失败可重试且输入不丢失） | 2 |
| REQ-005 | 文档查看与删除（详情渲染、删除二次确认/取消、列表删除） | 4 |
| REQ-006 | 全文检索与筛选（标题/正文/标签匹配、大小写、分类/标签/组合过滤、无结果空态） | 6 |
| REQ-007 | 标签管理（添加/移除/检索、标签长度校验） | 3 |
| REQ-008 | 状态与反馈（空态引导、加载骨架屏、加载失败重试） | 3 |

合计 25 个用例。

> 说明：
> - 异常 / 空态通过页面右下角「原型演示控制台」（演示工具，非产品功能）模拟。
> - 原型为内存态模拟数据，每次页面加载重置为预置种子数据（9 篇文档 / 4 个分类 / 3 个模板）。
> - REQ-002.3（无任何分类时的引导）因种子数据始终包含默认分类「未分类」，原型当前无法进入该状态，未编写用例。

## 环境要求

- Node.js（>= 18）
- 系统 Chrome / Chromium（`google-chrome-stable` / `google-chrome` / `chromium-browser` / `chromium`）
- 网络（首次安装 Playwright npm 包；本仓库不下载 Playwright 自带浏览器）

## 运行方式

```bash
cd e2e
npm install          # 安装 Playwright（不下载浏览器）
npx playwright test  # 全量（REQ-001~008）
npx playwright test specs/knowledge-base.spec.js --grep "REQ-006"  # 子集
```

浏览器选择顺序：环境变量 `PLAYWRIGHT_CHROMIUM_PATH`（显式指定）→ 依次探测系统
Chrome / Chromium（见 `helpers/browser.js`）。未探测到系统浏览器时 Playwright 会
报错，此时请安装系统 Chrome 或设置 `PLAYWRIGHT_CHROMIUM_PATH`。

## 产物

- HTML 报告：`e2e/reports/playwright-report/index.html`
- 失败截图 / 视频 / trace：`e2e/reports/test-results/`

## 目录结构

```
e2e/
├── README.md              # 本说明
├── package.json           # Playwright 依赖与脚本
├── playwright.config.js   # 测试配置（webServer + 系统 Chrome + HTML 报告）
├── server.js              # Node 内置模块静态服务器（仅测试用，无第三方依赖）
├── helpers/browser.js     # 系统浏览器探测 helper
├── pages/knowledgeBasePage.js  # 知识库原型 Page Object
└── specs/knowledge-base.spec.js # 用例（REQ-001~008）
```
