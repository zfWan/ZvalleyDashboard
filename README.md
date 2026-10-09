# zvalley-dashboard

基于 **Vue 3 + Vite + Pinia + TypeScript** 的现代化中后台前端脚手架，作为 Zvalley Dashboard 业务开发的统一起点。

## 1. 技术栈

| 分类       | 选型                                                  | 版本          |
| ---------- | ----------------------------------------------------- | ------------- |
| 核心框架   | Vue 3（Composition API + `<script setup lang="ts">`） | ^3.5          |
| 构建工具   | Vite                                                  | ^5.4          |
| 类型系统   | TypeScript（strict 模式）                             | ~5.6          |
| 状态管理   | Pinia + pinia-plugin-persistedstate                   | ^2.2 / ^3.2   |
| 路由       | Vue Router 4（history 模式）                          | ^4.4          |
| UI 组件库  | Element Plus + @element-plus/icons-vue                | ^2.8          |
| CSS 方案   | UnoCSS + SCSS                                         | ^0.64 / ^1.80 |
| HTTP 请求  | Axios（统一拦截器 + 错误处理）                        | ^1.7          |
| 国际化     | vue-i18n（zh-CN / en-US）                             | ^9.14         |
| 工具 hooks | @vueuse/core                                          | ^11.2         |
| 进度条     | NProgress                                             | ^0.2          |
| 自动导入   | unplugin-auto-import / unplugin-vue-components        | ^0.18 / ^0.27 |
| 代码规范   | ESLint 9 (Flat config) + Prettier + Stylelint         | 最新稳定      |
| 提交规范   | Commitlint + Husky + lint-staged + cz-git             | 最新稳定      |
| 测试框架   | Vitest + @vue/test-utils + happy-dom                  | ^2.1          |

## 2. 环境要求

- **Node.js** >= 18（推荐 20+）
- **pnpm** >= 8（本仓库锁定 `packageManager: pnpm@9.15.0`）

推荐使用 [nvm](https://github.com/nvm-sh/nvm) 或 [Volta](https://volta.sh/) 管理 Node 版本：

```bash
# nvm
nvm install 20 && nvm use 20
corepack enable && corepack prepare pnpm@9.15.0 --activate
```

> 项目使用 `preinstall` 钩子 + `only-allow` 强制使用 pnpm。若使用 npm/yarn 安装会直接报错退出。

## 3. 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 本地开发（默认 http://localhost:5173，端口被占用会自动递增）
pnpm dev

# 3. 生产构建
pnpm build          # 使用 .env.production
pnpm build:staging  # 使用 .env.staging
pnpm preview        # 预览 dist 产物

# 4. 代码质量
pnpm lint        # ESLint + Stylelint 检查
pnpm lint:fix    # 自动修复
pnpm format      # Prettier 写入
pnpm type-check  # vue-tsc 类型检查

# 5. 测试
pnpm test           # Vitest watch 模式
pnpm test:run       # 单次运行
pnpm test:coverage  # 产出 v8 覆盖率报告到 coverage/

# 6. 规范化提交（推荐）
pnpm commit   # cz-git 交互式提交
```

默认示例账号：任意用户名（长度 3–20）+ 任意密码（长度 ≥ 6）均可登录；用户名 `admin` 会被授予 `admin` 角色，可以看到 v-permission 演示按钮。

## 4. 目录结构

```
zvalley-dashboard/
├── public/                 # 静态资源（不经过 Vite 处理）
├── src/
│   ├── api/                # 按模块拆分的接口请求（示例：api/dashboard.ts）
│   ├── assets/             # 需要 Vite 处理的静态资源（图片、字体等）
│   ├── components/         # 通用业务/基础组件（含 __tests__/）
│   ├── composables/        # 可复用的 Vue 组合式 hooks
│   ├── directives/         # 自定义指令（v-permission 等）
│   ├── layouts/            # 页面布局（DefaultLayout/BlankLayout）
│   ├── locales/            # i18n 语言包（zh-CN.ts / en-US.ts）
│   ├── router/             # 路由配置
│   │   ├── guard/          # 全局守卫（鉴权 / 标题 / NProgress）
│   │   └── modules/        # 按模块拆分的路由表（glob 聚合）
│   ├── store/              # Pinia store
│   │   └── modules/        # 按模块拆分（user.ts / app.ts，setup 风格）
│   ├── styles/             # 全局样式（variables/reset/nprogress/transition）
│   ├── types/              # 全局 TypeScript 类型声明
│   ├── utils/              # 工具函数（request.ts、format.ts 等）
│   ├── views/              # 页面视图（按业务模块组织）
│   ├── App.vue
│   ├── main.ts
│   └── env.d.ts
├── .env                    # 多环境共享变量
├── .env.development        # 开发环境
├── .env.staging            # 预发环境
├── .env.production         # 生产环境
├── .env.example            # 不含敏感值的环境变量模板
├── .eslintrc-auto-import.json  # AutoImport 生成的全局变量声明（已初始化）
├── auto-imports.d.ts       # AutoImport 生成的类型（dev 启动后自动维护）
├── components.d.ts         # Components 自动生成的组件类型
├── eslint.config.js        # ESLint 9 Flat Config
├── .prettierrc.json        # Prettier 配置
├── .stylelintrc.cjs        # Stylelint 配置
├── commitlint.config.cjs   # Commitlint 规则（Conventional Commits）
├── .husky/                 # Git hooks（pre-commit / commit-msg）
├── uno.config.ts           # UnoCSS 配置
├── vite.config.ts          # Vite 配置（含 alias/插件/分包）
├── vitest.config.ts        # Vitest 配置
├── tsconfig.json           # TS 应用配置
└── tsconfig.node.json      # TS Node 侧配置
```

路径别名：`@/` 指向 `src/`，在 `.ts/.vue/.scss` 中均可直接使用（例如 `import { useUserStore } from '@/store/modules/user'`）。

## 5. 环境变量

| 变量                    | 说明                                           | 示例                              |
| ----------------------- | ---------------------------------------------- | --------------------------------- |
| `VITE_APP_TITLE`        | 应用标题（用于 `document.title` 与登录页）     | `zvalley-dashboard`               |
| `VITE_APP_ENV`          | 当前环境标识（development/staging/production） | `development`                     |
| `VITE_APP_API_BASE_URL` | Axios 默认 `baseURL`                           | `/api`、`https://api.example.com` |

- 所有以 `VITE_` 开头的变量才会暴露给客户端代码（`import.meta.env.VITE_XXX`）。
- `.env.*.local` 已加入 `.gitignore`，可用于个人本地覆盖。
- `src/env.d.ts` 已扩展 `ImportMetaEnv`，TS 会给出类型提示。

## 6. 请求封装（Axios）

- 统一在 `src/utils/request.ts` 创建 Axios 实例：
  - `baseURL` 取 `import.meta.env.VITE_APP_API_BASE_URL`，超时 10s；
  - 请求拦截：存在 token 时自动注入 `Authorization: Bearer <token>`，同时启动 NProgress；
  - 响应拦截：业务 `code === 0` 视为成功，直接返回 `data` 字段；非 0 会 `ElMessage.error(message)`；
  - HTTP 401：清除登录态，跳转 `/login?redirect=...`；
  - HTTP 403/500/网络错误：统一 ElMessage 提示，不白屏。
- 示例 API 在 `src/api/dashboard.ts`，当前使用本地 `setTimeout` mock，对接真实后端时把 `getStatistics()` 替换为 `request.get(...)` 即可。

## 7. 路由 & 守卫

- 路由使用 `createWebHistory`（history 模式），模块放在 `src/router/modules/` 下，按业务拆分。
- 全局守卫（`src/router/guard/index.ts`）处理：
  - 未登录访问 `meta.requiresAuth = true` 的路由 → 重定向 `/login?redirect=<fullPath>`；
  - 已登录访问 `/login` → 重定向 `/dashboard`；
  - 角色不匹配 `meta.roles` → 重定向 `/403`；
  - 路由切换时 NProgress 启动/关闭；
  - `afterEach` 根据 i18n key 设置 `document.title = ${pageTitle} - ${appTitle}`。

## 8. 状态管理（Pinia）

- Pinia 实例在 `src/store/index.ts` 创建，并注册 `pinia-plugin-persistedstate`。
- 所有 store 采用 **setup 风格**（`ref/computed/function`），按模块放在 `store/modules/`：
  - `useUserStore`：token、userInfo、login/logout；持久化 `token + userInfo`，key 前缀 `zvalley_dashboard_`。
  - `useAppStore`：侧栏折叠状态、locale；同样持久化。
- 组件中解构状态推荐使用 `storeToRefs` 保持响应性：
  ```ts
  const userStore = useUserStore()
  const { username, roles } = storeToRefs(userStore)
  ```

## 9. 权限指令 v-permission

在 `src/directives/permission.ts` 注册。用法：

```vue
<!-- 任何登录用户可见 -->
<el-button>普通按钮</el-button>
<!-- 仅具备 admin 角色的用户可见，否则节点从 DOM 中移除 -->
<el-button v-permission="['admin']">管理员按钮</el-button>
```

## 10. i18n（国际化）

- 预置 `zh-CN`、`en-US` 两套语言，文件位于 `src/locales/`。
- 应用默认中文，顶栏/登录页可切换语言，偏好通过 `appStore.locale` 持久化到 localStorage。
- 新增文案请同时更新两个语言包，并在页面/菜单/title 处使用 `t('key')`。

## 11. 自动导入

- `unplugin-auto-import` 自动导入 Vue / Vue Router / Pinia / VueUse 的 API，无需手写 `import { ref } from 'vue'`。
  - 为了让首次 `pnpm type-check` 在未启动 dev 时也能通过，示例代码中的核心 store/组件仍显式 import Vue API；你可以选择继续显式 import 或完全依赖自动导入。
- `unplugin-vue-components` + `ElementPlusResolver` 自动按需引入 Element Plus 组件与样式，无需手动 `import { ElButton } from 'element-plus'`。

## 12. 提交规范

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范，commit-msg 钩子由 Commitlint 校验，type 白名单：

`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`chore`、`revert`。

推荐通过交互式命令提交：

```bash
pnpm commit
```

`pre-commit` 钩子使用 lint-staged 对暂存文件执行：

- `*.{ts,vue,js,cjs,mjs}` → `eslint --fix` + `prettier --write`
- `*.{scss,css,vue}` → `stylelint --fix`
- `*.{json,md}` → `prettier --write`

## 13. 测试

- 使用 Vitest + @vue/test-utils + happy-dom。
- 最小示例包含：
  - `src/utils/__tests__/format.spec.ts`：工具函数单测；
  - `src/components/__tests__/HelloWorld.spec.ts`：组件挂载/渲染测试。
- `pnpm test:run` 单次运行；`pnpm test:coverage` 产出 v8 覆盖率报告到 `coverage/`（已加入 .gitignore）。

## 14. FAQ

- **安装依赖时报 `preinstall` 相关错误？**
  请确认使用的是 pnpm（≥8），若使用 npm/yarn 会被 `only-allow` 拒绝。
- **Node 版本过低？**
  升级 Node 至 18+；推荐 nvm：`nvm install 20 && nvm use 20`。
- **依赖安装慢/失败？**
  配置国内镜像：`pnpm config set registry https://registry.npmmirror.com`。
- **端口被占用？**
  Vite 会自动递增端口；也可以 `pnpm dev --port 5174` 指定端口。
- **HMR 不生效？**
  确保以项目根目录启动；若在 WSL/容器中运行，考虑在 vite.config 的 server 配置 `watch.usePolling = true`。
- **ESLint/Prettier 与 IDE 冲突？**
  安装 VS Code 插件 `ESLint`、`Prettier - Code formatter`、`Stylelint`、`Vue - Official (Volar)`，并在工作区禁用 `Vetur`。

## 15. 不包含什么（Non-Goals）

为保持骨架轻量，本模板默认 **不** 内置：

- Mock 方案（MSW / vite-plugin-mock 等）：示例 API 使用本地 `setTimeout`，真实业务请按需引入；
- Dockerfile / nginx 配置：由部署/CI 节点按需补充；
- CI（GitHub Actions / GitLab CI 等）：由后续 CICD 节点补充；
- 真实登录/权限模型/菜单/用户管理业务：本骨架只提供最小演示；
- SSR（Nuxt）/微前端/Electron/PWA/移动端适配；
- 监控/埋点/性能 SDK（Sentry/OpenTelemetry 等）：业务启动后按需接入；
- 暗黑模式/主题切换：顶栏未放切换按钮，可在后续扩展（CSS 变量已预留）。

## 16. 示例接口说明

本骨架为纯前端模板，**不依赖任何真实后端**。`src/api/dashboard.ts` 使用本地 Promise 返回假数据，Axios 拦截器在 401/网络异常时的弹窗行为可在浏览器 DevTools 中通过断开网络或直接手动 reject 模拟。对接真实后端时：

1. 调整 `.env.*` 中 `VITE_APP_API_BASE_URL` 指向真实网关；
2. 按后端响应体字段（`code/message/data`）调整 `src/utils/request.ts` 响应拦截器的成功判定（默认 `code === 0`）；
3. 按模块在 `src/api/` 下新增接口文件并通过 `request.get/post` 发起真实请求。

---

Happy hacking 🚀
