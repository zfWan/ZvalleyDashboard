'use strict';

/**
 * 极简静态文件服务器（仅用于本地 E2E 测试，无第三方依赖）。
 *
 * 用法：
 *   node server.js --port 4173 --root <prototype 目录>
 *
 * 说明：原型为纯 HTML/CSS/JS，无任何 XHR/fetch 请求，静态服务即可满足
 *       Playwright 以 http 方式加载（避免 file:// 下 history.replaceState 兼容性问题）。
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const args = process.argv.slice(2);
function argValue(name, fallback) {
  const idx = args.indexOf(name);
  return idx > -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

const PORT = Number(argValue('--port', '4173'));
const ROOT = path.resolve(argValue('--root', path.join(__dirname, '..', 'prototype', 'knowledge-base')));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1:' + PORT);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/' || pathname.endsWith('/')) pathname += 'index.html';
    const filePath = path.normalize(path.join(ROOT, pathname));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
      res.end(data);
    });
  } catch (_) {
    res.writeHead(500);
    res.end('Server Error');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  process.stdout.write('e2e static server listening on http://127.0.0.1:' + PORT + ' (root: ' + ROOT + ')\n');
});
