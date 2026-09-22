'use strict';

/**
 * Playwright E2E 测试配置（知识库系统原型）。
 *
 * - 浏览器：优先仓库配置 -> 系统 Chrome（通过 helpers/browser.js 探测，
 *   可被环境变量 PLAYWRIGHT_CHROMIUM_PATH 覆盖）；不下载 Playwright 自带浏览器。
 * - 服务：webServer 使用本仓库内置 node server.js 静态服务原型目录。
 * - 报告：HTML 报告输出到 e2e/reports/playwright-report，截图/trace
 *   失败时保留到 e2e/reports/test-results。
 */
const path = require('path');
const { defineConfig } = require('playwright/test');
const { detectChromeExecutable } = require('./helpers/browser');

const PROTOTYPE_ROOT = path.resolve(__dirname, '..', 'prototype', 'knowledge-base');
const chromePath = detectChromeExecutable();

module.exports = defineConfig({
  testDir: path.join(__dirname, 'specs'),
  timeout: 30000,
  expect: { timeout: 8000 },
  fullyParallel: false,
  workers: 1, // 原型为内存态单页应用 + 演示控制台，串行执行更稳定
  retries: 0,
  outputDir: path.join(__dirname, 'reports', 'test-results'),
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(__dirname, 'reports', 'playwright-report'), open: 'never' }]
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    ...(chromePath ? { launchOptions: { executablePath: chromePath } } : {})
  },
  webServer: {
    command: 'node ' + path.join(__dirname, 'server.js') + ' --port 4173 --root ' + PROTOTYPE_ROOT,
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 15000
  }
});
