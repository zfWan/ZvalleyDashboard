'use strict';

/**
 * 浏览器探测 helper（e2e-test-run 阶段由 Playwright 启动时调用）。
 *
 * 选择优先级（与《e2e-test-run》Skill 约定一致）：
 *   1. 环境变量 PLAYWRIGHT_CHROMIUM_PATH（显式指定，最高优先）
 *   2. 依次探测 google-chrome-stable / google-chrome / chromium-browser / chromium
 *
 * 返回可执行文件绝对路径；未探测到时返回 undefined，交由 Playwright 默认
 * （仓库未强制 Playwright Chromium，本仓库无浏览器下载约定）。
 */
const { spawnSync } = require('child_process');

function detectChromeExecutable() {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  }
  const candidates = ['google-chrome-stable', 'google-chrome', 'chromium-browser', 'chromium'];
  for (const cmd of candidates) {
    try {
      const r = spawnSync('sh', ['-c', 'command -v ' + cmd], { encoding: 'utf8' });
      if (r.status === 0 && r.stdout && r.stdout.trim()) {
        return r.stdout.trim();
      }
    } catch (_) {
      // 继续探测下一个候选
    }
  }
  return undefined;
}

module.exports = { detectChromeExecutable };
