/* =========================================================================
 * 知识库系统原型 —— 视图与交互
 * 对应规格：《知识库系统-Spec.md》§4 页面与信息架构、§5 REQ、§7 状态与流转
 * 页面：PAGE-001 列表 / PAGE-002 详情 / PAGE-003 编辑 / PAGE-004 模板选择 / PAGE-005 空态与无结果
 * 默认值（OQ 建议，评审通过后生效）：Markdown 编辑器、删除+二次确认、一级分类、
 *       单一知识库 + 默认分类「未分类」、提交式检索、匹配标题/正文/标签（不区分大小写）
 * ========================================================================= */
(function () {
  'use strict';

  var DATA = window.KB_DATA;
  var store = DATA.store;

  /* ============================ 工具函数 ============================ */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function stripMarkdown(md) {
    return String(md || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`([^`]*)`/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/^>\s?/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/^\s*\|.*\|\s*$/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function excerpt(md, len) {
    var text = stripMarkdown(md);
    return text.length > len ? text.slice(0, len) + '…' : text;
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    function p(n) { return n < 10 ? '0' + n : '' + n; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function uid(prefix) {
    return (prefix || 'doc') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function allTags() {
    var map = {};
    store.docs.forEach(function (d) { d.tags.forEach(function (t) { map[t] = true; }); });
    return Object.keys(map).sort(function (a, b) { return a.localeCompare(b, 'zh'); });
  }

  /* ============================ 状态 ============================ */
  var state = {
    // 已应用的检索条件（决定列表结果）
    filter: { keyword: '', category: '', tag: '' },
    // 搜索框当前输入（提交后才应用到 filter）
    searchInput: '',
    // 编辑页状态
    editor: null,
    // 删除目标
    deleteTarget: null,
    // 分类创建弹层
    categoryTarget: null,
    // 模板选择弹层是否打开
    templateOpen: false,
    // 演示控制（用于向评审演示异常 / 空态，见 §7 状态与流转）
    sim: { loadError: false, saveError: false, emptyData: false }
  };

  /* ============================ 极简 Markdown 渲染 ============================ */
  function mdInline(text) {
    var s = escapeHtml(text);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    s = s.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return s;
  }

  function renderMarkdown(md) {
    var lines = String(md || '').split('\n');
    var html = [];
    var i = 0;
    var listStack = [];

    function closeList(stack, target) {
      while (stack.length && stack[stack.length - 1] !== target) {
        html.push('</' + stack.pop() + '>');
      }
    }

    while (i < lines.length) {
      var line = lines[i];

      // 代码块
      if (/^```/.test(line.trim())) {
        closeList(listStack, 'P');
        var lang = line.trim().slice(3).trim();
        var buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i].trim())) {
          buf.push(lines[i]);
          i++;
        }
        i++; // 跳过结束 ```（可能不存在）
        html.push('<pre' + (lang ? ' data-lang="' + escapeHtml(lang) + '"' : '') + '><code>' + escapeHtml(buf.join('\n')) + '</code></pre>');
        continue;
      }

      // 空行
      if (!line.trim()) {
        closeList(listStack, 'P');
        i++;
        continue;
      }

      // 标题
      var h = /^(#{1,6})\s+(.*)$/.exec(line);
      if (h) {
        closeList(listStack, 'P');
        var level = h[1].length;
        html.push('<h' + level + '>' + mdInline(h[2]) + '</h' + level + '>');
        i++;
        continue;
      }

      // 分隔线
      if (/^\s*---+\s*$/.test(line)) {
        closeList(listStack, 'P');
        html.push('<hr>');
        i++;
        continue;
      }

      // 引用
      if (/^\s*>\s?/.test(line)) {
        closeList(listStack, 'P');
        var q = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          q.push(lines[i].replace(/^\s*>\s?/, ''));
          i++;
        }
        html.push('<blockquote><p>' + mdInline(q.join('<br>')) + '</p></blockquote>');
        continue;
      }

      // 无序列表
      if (/^\s*[-*+]\s+/.test(line)) {
        closeList(listStack, 'UL');
        listStack.push('UL');
        html.push('<ul>');
        while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
          html.push('<li>' + mdInline(lines[i].replace(/^\s*[-*+]\s+/, '')) + '</li>');
          i++;
        }
        html.push('</ul>');
        listStack.pop();
        continue;
      }

      // 有序列表
      if (/^\s*\d+\.\s+/.test(line)) {
        closeList(listStack, 'OL');
        listStack.push('OL');
        html.push('<ol>');
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          html.push('<li>' + mdInline(lines[i].replace(/^\s*\d+\.\s+/, '')) + '</li>');
          i++;
        }
        html.push('</ol>');
        listStack.pop();
        continue;
      }

      // 表格（简易：以 | 开头且下一行含 ---）
      if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|[\s\-:|]+\|\s*$/.test(lines[i + 1])) {
        closeList(listStack, 'P');
        var headerCells = line.split('|').slice(1, -1);
        var rows = [];
        i += 2;
        while (i < lines.length && /^\s*\|/.test(lines[i])) {
          rows.push(lines[i].split('|').slice(1, -1));
          i++;
        }
        html.push('<div class="md-table-wrap"><table><thead><tr>');
        headerCells.forEach(function (c) { html.push('<th>' + mdInline(c.trim()) + '</th>'); });
        html.push('</tr></thead><tbody>');
        rows.forEach(function (r) {
          html.push('<tr>');
          headerCells.forEach(function (_, idx) {
            html.push('<td>' + mdInline((r[idx] || '').trim()) + '</td>');
          });
          html.push('</tr>');
        });
        html.push('</tbody></table></div>');
        continue;
      }

      // 任务列表行（作为普通段落处理）
      closeList(listStack, 'P');
      var p = [line];
      i++;
      while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|>\s?|[-*+]\s|\d+\.\s|---+$|^\s*\|)/.test(lines[i])) {
        p.push(lines[i]);
        i++;
      }
      html.push('<p>' + mdInline(p.join('<br>')) + '</p>');
    }

    return html.join('');
  }

  /* ============================ 检索与筛选（REQ-006） ============================ */
  function filterDocs(keyword, category, tag) {
    var kw = (keyword || '').trim().toLowerCase();
    return store.docs.filter(function (d) {
      if (category && d.category !== category) return false;
      if (tag && d.tags.indexOf(tag) === -1) return false;
      if (kw) {
        var haystack = (d.title + ' ' + d.content + ' ' + d.tags.join(' ')).toLowerCase();
        if (haystack.indexOf(kw) === -1) return false;
      }
      return true;
    }).sort(function (a, b) {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }

  function hasActiveFilter() {
    return !!(state.filter.keyword || state.filter.category || state.filter.tag);
  }

  /* ============================ 轻提示 ============================ */
  function toast(message, type) {
    var box = $('#toast-box');
    var el = document.createElement('div');
    el.className = 'toast toast-' + (type || 'success');
    el.innerHTML = '<span class="toast-icon">' + (type === 'error'
      ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>'
      : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>') + '</span><span>' + escapeHtml(message) + '</span>';
    box.appendChild(el);
    setTimeout(function () {
      el.classList.add('toast-out');
      setTimeout(function () { el.remove(); }, 260);
    }, 2400);
  }

  /* ============================ 弹层 ============================ */
  function openModal(html, options) {
    options = options || {};
    var mask = document.createElement('div');
    mask.className = 'modal-mask';
    mask.innerHTML = '<div class="modal" role="dialog" aria-modal="true">' +
      '<button type="button" class="modal-close" data-close aria-label="关闭"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
      html + '</div>';
    document.body.appendChild(mask);
    function close() {
      mask.classList.add('modal-out');
      setTimeout(function () { mask.remove(); }, 200);
      if (options.onClose) options.onClose();
    }
    $('[data-close]', mask).addEventListener('click', close);
    mask.addEventListener('click', function (e) { if (e.target === mask && options.dismissible !== false) close(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
    var firstInput = $('input, select, textarea, button', mask);
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 60);
    return { el: mask, close: close };
  }

  function confirmModal(title, message, onConfirm) {
    var modal = openModal(
      '<div class="modal-head"><h3 class="modal-title">' + escapeHtml(title) + '</h3></div>' +
      '<div class="modal-body">' + message + '</div>' +
      '<div class="modal-foot">' +
      '<button type="button" class="btn btn-ghost" data-cancel>取消</button>' +
      '<button type="button" class="btn btn-danger" data-ok>确认删除</button>' +
      '</div>',
      { onClose: function () { state.deleteTarget = null; } }
    );
    $('[data-cancel]', modal.el).addEventListener('click', modal.close);
    $('[data-ok]', modal.el).addEventListener('click', function () {
      onConfirm();
      modal.close();
    });
  }

  /* ============================ 路由 ============================ */
  function parseHash() {
    var hash = location.hash.replace(/^#\/?/, '');
    var parts = hash.split('?');
    var path = parts[0].replace(/\/+$/, '');
    var params = {};
    (parts[1] || '').split('&').forEach(function (kv) {
      var idx = kv.indexOf('=');
      if (idx > -1) params[decodeURIComponent(kv.slice(0, idx))] = decodeURIComponent(kv.slice(idx + 1));
    });
    var segs = path.split('/').filter(Boolean);
    if (segs.length === 0) return { name: 'home', params: params };
    if (segs[0] === 'doc' && segs[1]) return { name: 'detail', params: Object.assign({ id: segs[1] }, params) };
    if (segs[0] === 'edit') return { name: 'edit', params: Object.assign({ id: segs[1] }, params) };
    return { name: 'home', params: params };
  }

  var viewEl = $('#view');
  var main = $('#main');

  function setSidebar(route) {
    $all('.nav-item').forEach(function (el) {
      el.classList.toggle('active', el.dataset.route === route);
    });
  }

  /* ============================ 视图：骨架屏 / 加载 / 错误 ============================ */
  function skeletonList() {
    var items = '';
    for (var i = 0; i < 4; i++) {
      items += '<div class="doc-card skeleton-card"><div class="skeleton skeleton-title"></div>' +
        '<div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line short"></div>' +
        '<div class="skeleton skeleton-meta"></div></div>';
    }
    return '<div class="view-head">' + pageHead('', [], true) + '</div>' +
      '<div class="toolbar skeleton-toolbar"><div class="skeleton skeleton-search"></div><div class="skeleton skeleton-filter"></div></div>' + items;
  }

  function errorView(message, retry) {
    return '<div class="state-view">' +
      '<div class="state-icon state-error">' + icon('alert') + '</div>' +
      '<h3 class="state-title">加载失败</h3>' +
      '<p class="state-desc">' + escapeHtml(message || '数据加载出现异常，请重试。') + '</p>' +
      '<button type="button" class="btn btn-primary" data-retry>' + icon('refresh', 14) + '<span>重试</span></button>' +
      '</div>';
  }

  function pageHead(title, crumbs, withActions) {
    var crumbsHtml = crumbs && crumbs.length
      ? '<div class="crumbs">' + crumbs.map(function (c, idx) {
          return '<span class="crumb' + (idx === crumbs.length - 1 ? ' current' : ' link') + '"' +
            (c.link ? ' data-crumb="' + escapeHtml(c.link) + '"' : '') + '>' + escapeHtml(c.label) + '</span>';
        }).join('<span class="crumb-sep">/</span>') + '</div>'
      : '';
    return crumbsHtml + '<div class="head-row"><h1 class="page-title">' + escapeHtml(title) + '</h1>' +
      (withActions ? '<div class="head-actions">' + withActions + '</div>' : '') + '</div>';
  }

  function icon(name, size) {
    var s = size || 16;
    var paths = {
      search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
      trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/><path d="M10 11v6M14 11v6"/>',
      back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
      refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"/>',
      alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
      code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
      doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
      check: '<path d="M20 6L9 17l-5-5"/>',
      book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
      folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
      tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/>',
      user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
      grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
      layers: '<path d="M12 2l10 6-10 6L2 8z"/><path d="M2 16l10 6 10-6"/><path d="M2 12l10 6 10-6"/>',
      archive: '<path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'
    };
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || '') + '</svg>';
  }

  /* ============================ 视图：列表（PAGE-001 / PAGE-005） ============================ */
  function renderHome(route) {
    setSidebar('home');
    viewEl.innerHTML = skeletonList();

    setTimeout(function () {
      if (state.sim.loadError) {
        viewEl.innerHTML = errorView('演示模式：已开启「模拟列表加载失败」。关闭演示开关后点击重试即可恢复。', true);
        wireErrorRetry();
        return;
      }
      var docs = state.sim.emptyData ? [] : filterDocs(state.filter.keyword, state.filter.category, state.filter.tag);
      var total = state.sim.emptyData ? 0 : store.docs.length;
      renderList(docs, total);
    }, 380);
  }

  function renderList(docs, total) {
    var tagOptions = allTags();
    var isFiltering = hasActiveFilter();

    var categoryOptions = ['<option value="">全部分类</option>'].concat(
      store.categories.map(function (c) {
        return '<option value="' + escapeHtml(c) + '"' + (state.filter.category === c ? ' selected' : '') + '>' + escapeHtml(c) + '</option>';
      })
    );
    var tagSel = ['<option value="">全部标签</option>'].concat(
      tagOptions.map(function (t) {
        return '<option value="' + escapeHtml(t) + '"' + (state.filter.tag === t ? ' selected' : '') + '>' + escapeHtml(t) + '</option>';
      })
    );

    var clearBtn = isFiltering
      ? '<button type="button" class="btn btn-ghost btn-sm" data-clear-filter>' + icon('refresh', 13) + '<span>清除筛选</span></button>'
      : '';

    var body;
    if (total === 0 && !isFiltering) {
      // REQ-008.1 无文档空态
      body = '<div class="state-view">' +
        '<div class="state-icon">' + icon('book', 40) + '</div>' +
        '<h3 class="state-title">暂无文档</h3>' +
        '<p class="state-desc">知识库还没有任何文档，快来创建第一篇知识文档吧。</p>' +
        '<button type="button" class="btn btn-primary" data-new-doc>' + icon('plus', 14) + '<span>新建文档</span></button>' +
        '</div>';
    } else if (docs.length === 0) {
      // REQ-008.2 无结果空态
      body = '<div class="state-view">' +
        '<div class="state-icon">' + icon('search', 40) + '</div>' +
        '<h3 class="state-title">暂无搜索结果</h3>' +
        '<p class="state-desc">没有找到匹配的文档，可以调整关键词或清除筛选条件。</p>' +
        '<div class="state-actions"><button type="button" class="btn btn-primary" data-clear-filter>' + icon('refresh', 14) + '<span>清除筛选</span></button>' +
        '<button type="button" class="btn btn-ghost" data-new-doc>' + icon('plus', 14) + '<span>新建文档</span></button></div>' +
        '</div>';
    } else {
      body = '<div class="doc-list">' + docs.map(function (d) {
        var tags = d.tags.map(function (t) {
          return '<span class="tag" data-tag="' + escapeHtml(t) + '" title="按标签筛选">' + escapeHtml(t) + '</span>';
        }).join('');
        return '<article class="doc-card" data-doc="' + escapeHtml(d.id) + '" tabindex="0" role="link" aria-label="打开文档：' + escapeHtml(d.title) + '">' +
          '<div class="doc-card-main">' +
          '<h2 class="doc-card-title">' + escapeHtml(d.title) + '</h2>' +
          '<p class="doc-card-excerpt">' + escapeHtml(excerpt(d.content, 92)) + '</p>' +
          '<div class="doc-card-meta">' +
          '<span class="badge badge-cat" data-cat="' + escapeHtml(d.category) + '">' + icon('folder', 12) + escapeHtml(d.category) + '</span>' +
          tags +
          '</div></div>' +
          '<div class="doc-card-side">' +
          '<div class="doc-card-sub">' + escapeHtml(d.author) + '</div>' +
          '<div class="doc-card-sub muted">' + formatDate(d.updatedAt) + '</div>' +
          '<button type="button" class="icon-btn icon-btn-danger" data-del-doc="' + escapeHtml(d.id) + '" title="删除文档" aria-label="删除文档">' + icon('trash', 15) + '</button>' +
          '</div>' +
          '</article>';
      }).join('') + '</div>';
    }

    viewEl.innerHTML =
      pageHead('知识库', [{ label: '工作台', link: '#/' }, { label: '知识库' }],
        '<button type="button" class="btn btn-primary" data-new-doc>' + icon('plus', 15) + '<span>新建文档</span></button>') +
      '<div class="toolbar">' +
      '<form class="search-form" data-search-form>' +
      '<span class="search-icon">' + icon('search', 16) + '</span>' +
      '<input class="input search-input" type="search" name="keyword" placeholder="搜索标题、正文或标签…" value="' + escapeHtml(state.searchInput) + '" autocomplete="off">' +
      '<button type="submit" class="btn btn-primary btn-sm">搜索</button>' +
      '</form>' +
      '<div class="toolbar-filters">' +
      '<label class="filter-label">分类 <select class="input select" data-filter-cat>' + categoryOptions.join('') + '</select></label>' +
      '<label class="filter-label">标签 <select class="input select" data-filter-tag>' + tagSel.join('') + '</select></label>' +
      clearBtn +
      '</div>' +
      '</div>' +
      '<div class="list-summary">' +
      '<span>' + (isFiltering ? '筛选结果：' + docs.length + ' 篇' : '全部文档：' + docs.length + ' 篇') + '</span>' +
      '<button type="button" class="link-btn" data-manage-cat>' + icon('plus', 13) + '<span>新建分类</span></button>' +
      '</div>' +
      body;

    // 事件绑定
    var form = $('[data-search-form]', viewEl);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      state.searchInput = $('input[name=keyword]', form).value.trim();
      state.filter.keyword = state.searchInput;
      renderHome(route);
    });
    $('[data-filter-cat]', viewEl).addEventListener('change', function (e) {
      state.filter.category = e.target.value;
      renderHome(route);
    });
    $('[data-filter-tag]', viewEl).addEventListener('change', function (e) {
      state.filter.tag = e.target.value;
      renderHome(route);
    });
    // D3 修复：data-clear-filter 在工具栏与无结果空态(state-actions)各有一个，需批量绑定
    $all('[data-clear-filter]', viewEl).forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.filter = { keyword: '', category: '', tag: '' };
        state.searchInput = '';
        renderHome(route);
      });
    });
    // D4 修复：data-new-doc 在页头(head-actions)与空态(state-view)各有一个，需批量绑定
    $all('[data-new-doc]', viewEl).forEach(function (btn) {
      btn.addEventListener('click', openTemplatePicker);
    });
    $('[data-manage-cat]', viewEl).addEventListener('click', function () { openCategoryModal(); });

    $all('.doc-card', viewEl).forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('[data-del-doc]')) return;
        location.hash = '#/doc/' + card.dataset.doc;
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') location.hash = '#/doc/' + card.dataset.doc;
      });
    });
    $all('[data-del-doc]', viewEl).forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        requestDelete(btn.dataset.delDoc);
      });
    });
    $all('[data-tag]', viewEl).forEach(function (chip) {
      chip.addEventListener('click', function (e) {
        e.stopPropagation();
        state.filter.tag = chip.dataset.tag;
        renderHome(route);
      });
    });
    $all('[data-cat]', viewEl).forEach(function (badge) {
      badge.addEventListener('click', function (e) {
        e.stopPropagation();
        state.filter.category = badge.dataset.cat;
        renderHome(route);
      });
    });
    $all('[data-crumb]', viewEl).forEach(function (el) {
      el.addEventListener('click', function () { location.hash = el.dataset.crumb; });
    });
  }

  // 从演示控制台 DOM 同步模拟开关状态到 state（评审可直接勾选/取消复选框后点「重试」）
  function syncSimFromDom() {
    $all('[data-sim]', $('#dev-panel')).forEach(function (cb) {
      state.sim[cb.dataset.sim] = cb.checked;
    });
  }

  function wireErrorRetry() {
    var btn = $('[data-retry]', viewEl);
    if (btn) btn.addEventListener('click', function () {
      syncSimFromDom();
      renderHome(parseHash());
    });
  }

  /* ============================ 视图：详情（PAGE-002） ============================ */
  function renderDetail(route) {
    setSidebar('home');
    var doc = store.docs.filter(function (d) { return d.id === route.params.id; })[0];
    if (!doc) {
      viewEl.innerHTML = errorView('文档不存在或已被删除。', true);
      wireErrorRetry();
      return;
    }
    viewEl.innerHTML = '<div class="view-head">' + pageHead('', [{ label: '知识库', link: '#/' }, { label: doc.title }], false) + '</div>' +
      '<div class="detail-loading"><div class="skeleton skeleton-title wide"></div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line short"></div></div>';

    setTimeout(function () {
      if (state.sim.loadError) {
        viewEl.innerHTML = errorView('演示模式：已开启「模拟列表加载失败」。关闭演示开关后点击重试即可恢复。', true);
        wireErrorRetry();
        return;
      }
      var tags = doc.tags.map(function (t) {
        return '<span class="tag">' + escapeHtml(t) + '</span>';
      }).join('');
      viewEl.innerHTML =
        '<div class="view-head">' + pageHead('', [{ label: '知识库', link: '#/' }, { label: doc.title }], false) + '</div>' +
        '<article class="detail-card">' +
        '<div class="detail-head">' +
        '<h1 class="detail-title">' + escapeHtml(doc.title) + '</h1>' +
        '<div class="detail-meta">' +
        '<span class="badge badge-cat">' + icon('folder', 12) + escapeHtml(doc.category) + '</span>' + tags +
        '</div>' +
        '<div class="detail-sub">' +
        '<span>' + icon('user', 13) + escapeHtml(doc.author) + '</span>' +
        '<span>' + icon('archive', 13) + '更新于 ' + formatDate(doc.updatedAt) + '</span>' +
        '<span class="muted">ID：' + escapeHtml(doc.id) + '</span>' +
        '</div>' +
        '</div>' +
        '<div class="detail-body markdown-body">' + renderMarkdown(doc.content) + '</div>' +
        '<div class="detail-foot">' +
        '<button type="button" class="btn btn-ghost" data-back>' + icon('back', 14) + '<span>返回列表</span></button>' +
        '<div class="detail-actions">' +
        '<button type="button" class="btn btn-danger-ghost" data-delete>' + icon('trash', 14) + '<span>删除</span></button>' +
        '<button type="button" class="btn btn-primary" data-edit>' + icon('edit', 14) + '<span>编辑</span></button>' +
        '</div>' +
        '</div>' +
        '</article>';

      $('[data-back]', viewEl).addEventListener('click', function () { location.hash = '#/'; });
      $('[data-edit]', viewEl).addEventListener('click', function () { location.hash = '#/edit/' + doc.id; });
      $('[data-delete]', viewEl).addEventListener('click', function () { requestDelete(doc.id, '#/'); });
      $('[data-crumb]', viewEl).addEventListener('click', function (e) { location.hash = e.target.dataset.crumb; });
    }, 320);
  }

  /* ============================ 视图：编辑（PAGE-003） ============================ */
  function renderEdit(route) {
    setSidebar('home');
    var existing = route.params.id ? store.docs.filter(function (d) { return d.id === route.params.id; })[0] : null;
    var template = null;
    if (!existing && route.params.template) {
      template = store.templates.filter(function (t) { return t.id === route.params.template; })[0] || null;
    }
    state.editor = {
      id: existing ? existing.id : null,
      title: existing ? existing.title : (template ? template.name.replace('模板', '') + '：' : ''),
      category: existing ? existing.category : (store.categories.indexOf(DATA.DEFAULT_CATEGORY) > -1 ? DATA.DEFAULT_CATEGORY : store.categories[0]),
      tags: existing ? existing.tags.slice() : [],
      content: existing ? existing.content : (template ? template.content : ''),
      errors: {}
    };

    function renderForm() {
      var e = state.editor;
      // 每次重渲染按最新 state.editor.category 重新生成分类选项（D1：避免闭包旧值导致分类被还原）
      var catOptions = store.categories.map(function (c) {
        return '<option value="' + escapeHtml(c) + '"' + (state.editor.category === c ? ' selected' : '') + '>' + escapeHtml(c) + '</option>';
      }).join('');
      var tagsHtml = e.tags.map(function (t, idx) {
        return '<span class="tag tag-input"><span>' + escapeHtml(t) + '</span><button type="button" class="tag-remove" data-remove-tag="' + idx + '" aria-label="移除标签">×</button></span>';
      }).join('');
      var tagHint = e.tags.length >= 10 ? '<span class="field-error">标签最多添加 10 个</span>'
        : (e.errors.tag ? '<span class="field-error">' + escapeHtml(e.errors.tag) + '</span>'
        : '<span class="field-hint">回车或逗号添加，单标签 ≤ 20 字符，最多 10 个</span>');

      viewEl.innerHTML =
        '<div class="view-head">' + pageHead(existing ? '编辑文档' : '新建文档',
          [{ label: '知识库', link: '#/' }, { label: existing ? '编辑文档' : '新建文档' }],
          '<button type="button" class="btn btn-ghost" data-cancel>取消</button>' +
          '<button type="button" class="btn btn-primary" data-save>' + icon('check', 14) + '<span>保存</span></button>') + '</div>' +
        '<form class="edit-card" data-edit-form novalidate>' +
        '<div class="field">' +
        '<label class="field-label" for="f-title">文档标题 <span class="req">*</span></label>' +
        '<input class="input" id="f-title" name="title" type="text" maxlength="200" placeholder="请输入文档标题（1~200 字符）" value="' + escapeHtml(e.title) + '">' +
        (e.errors.title ? '<span class="field-error">' + escapeHtml(e.errors.title) + '</span>' : '') +
        '</div>' +
        '<div class="field-row">' +
        '<div class="field field-cat">' +
        '<label class="field-label" for="f-cat">分类 <span class="req">*</span></label>' +
        '<div class="cat-control">' +
        '<select class="input select" id="f-cat" name="category">' + catOptions + '</select>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-new-cat>' + icon('plus', 13) + '<span>新建分类</span></button>' +
        '</div>' +
        '</div>' +
        '<div class="field field-tags">' +
        '<label class="field-label" for="f-tags">标签</label>' +
        '<div class="tag-input-wrap">' + tagsHtml +
        '<input class="input tag-input-box" id="f-tags" type="text" placeholder="添加标签后回车" autocomplete="off">' +
        '</div>' + tagHint +
        '</div>' +
        '</div>' +
        '<div class="field">' +
        '<div class="field-label-row"><label class="field-label" for="f-content">正文（Markdown） <span class="req">*</span></label>' +
        '<div class="editor-tabs"><button type="button" class="editor-tab active" data-tab="write">编辑</button>' +
        '<button type="button" class="editor-tab" data-tab="preview">预览</button></div></div>' +
        '<div class="editor" data-editor>' +
        '<textarea class="editor-textarea" id="f-content" name="content" rows="16" placeholder="支持 Markdown：标题、加粗、列表、代码块、表格…">' + escapeHtml(e.content) + '</textarea>' +
        '<div class="editor-preview markdown-body" hidden></div>' +
        '</div>' +
        (e.errors.content ? '<span class="field-error">' + escapeHtml(e.errors.content) + '</span>' : '') +
        '</div>' +
        '</form>';

      var titleInput = $('#f-title', viewEl);
      var catSelect = $('#f-cat', viewEl);
      var tagInput = $('#f-tags', viewEl);
      var contentInput = $('#f-content', viewEl);
      var preview = $('.editor-preview', viewEl);

      // D1 修复：输入实时回写 state.editor，避免标签增删触发 renderForm 时已输入内容被旧 state 还原
      titleInput.addEventListener('input', function () { state.editor.title = titleInput.value; });
      catSelect.addEventListener('change', function () { state.editor.category = catSelect.value; });

      $('[data-cancel]', viewEl).addEventListener('click', function () {
        if (hasDraftChanges()) {
          confirmDiscard(function () { location.hash = existing ? '#/doc/' + existing.id : '#/'; });
        } else {
          location.hash = existing ? '#/doc/' + existing.id : '#/';
        }
      });
      $('[data-save]', viewEl).addEventListener('click', saveDoc);
      $('[data-new-cat]', viewEl).addEventListener('click', function () {
        openCategoryModal(function (catName) {
          var opt = document.createElement('option');
          opt.value = catName;
          opt.textContent = catName;
          opt.selected = true;
          catSelect.appendChild(opt);
          state.editor.category = catName;
        });
      });

      // 标签添加
      function addTag(value) {
        var v = (value || '').trim().replace(/^#/, '');
        if (!v) return;
        if (state.editor.tags.indexOf(v) > -1) { toast('标签已存在', 'info'); return; }
        if (state.editor.tags.length >= 10) { state.editor.errors.tag = '标签最多添加 10 个'; renderForm(); return; }
        if (v.length > 20) { state.editor.errors.tag = '单个标签不能超过 20 个字符'; renderForm(); return; }
        state.editor.tags.push(v);
        delete state.editor.errors.tag;
        renderForm();
      }
      tagInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          addTag(tagInput.value);
        }
      });
      tagInput.addEventListener('blur', function () {
        if (tagInput.value.trim()) addTag(tagInput.value);
      });
      $all('[data-remove-tag]', viewEl).forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.editor.tags.splice(Number(btn.dataset.removeTag), 1);
          renderForm();
        });
      });

      // 编辑器预览切换
      $all('.editor-tab', viewEl).forEach(function (tab) {
        tab.addEventListener('click', function () {
          $all('.editor-tab', viewEl).forEach(function (t) { t.classList.toggle('active', t === tab); });
          var isPreview = tab.dataset.tab === 'preview';
          $('.editor-textarea', viewEl).hidden = isPreview;
          preview.hidden = !isPreview;
          if (isPreview) preview.innerHTML = renderMarkdown(contentInput.value);
        });
      });
      contentInput.addEventListener('input', function () {
        state.editor.content = contentInput.value;
        if (!preview.hidden) preview.innerHTML = renderMarkdown(contentInput.value);
      });

      function syncEditor() {
        state.editor.title = titleInput.value;
        state.editor.category = catSelect.value;
        state.editor.content = contentInput.value;
      }

      function saveDoc() {
        syncEditor();
        var errors = {};
        if (!state.editor.title.trim()) errors.title = '请输入文档标题';
        else if (state.editor.title.trim().length > 200) errors.title = '标题不能超过 200 个字符';
        if (!state.editor.content.trim()) errors.content = '请输入文档正文';
        state.editor.errors = errors;
        if (Object.keys(errors).length) {
          renderForm();
          toast('请先完善必填项后再保存', 'error');
          return;
        }
        if (state.sim.saveError) {
          // REQ-004.3 保存失败：提示错误、可重试、输入不丢失
          toast('保存失败（演示模式）：已开启「模拟保存失败」，输入内容已保留，请重试或关闭演示开关。', 'error');
          return;
        }
        if (existing) {
          existing.title = state.editor.title.trim();
          existing.content = state.editor.content;
          existing.category = state.editor.category;
          existing.tags = state.editor.tags.slice();
          existing.updatedAt = new Date().toISOString();
          toast('文档已更新');
          location.hash = '#/doc/' + existing.id;
        } else {
          var now = new Date().toISOString();
          store.docs.push({
            id: uid('doc'),
            title: state.editor.title.trim(),
            content: state.editor.content,
            category: state.editor.category,
            tags: state.editor.tags.slice(),
            author: '我',
            createdAt: now,
            updatedAt: now
          });
          toast('文档已创建并发布');
          location.hash = '#/doc/' + store.docs[store.docs.length - 1].id;
        }
      }

      function hasDraftChanges() {
        syncEditor();
        if (!existing) return !!(state.editor.title.trim() || state.editor.content.trim() || state.editor.tags.length);
        return state.editor.title.trim() !== existing.title ||
          state.editor.content !== existing.content ||
          state.editor.category !== existing.category ||
          JSON.stringify(state.editor.tags) !== JSON.stringify(existing.tags);
      }
    }

    renderForm();
  }

  function confirmDiscard(onConfirm) {
    var modal = openModal(
      '<div class="modal-head"><h3 class="modal-title">放弃未保存的修改？</h3></div>' +
      '<div class="modal-body"><p>当前文档有未保存的修改，离开后将丢失。</p></div>' +
      '<div class="modal-foot"><button type="button" class="btn btn-ghost" data-cancel>继续编辑</button>' +
      '<button type="button" class="btn btn-primary" data-ok>放弃修改</button></div>'
    );
    $('[data-cancel]', modal.el).addEventListener('click', modal.close);
    $('[data-ok]', modal.el).addEventListener('click', function () { modal.close(); onConfirm(); });
  }

  /* ============================ 删除（REQ-005，二次确认） ============================ */
  function requestDelete(docId, afterHash) {
    var doc = store.docs.filter(function (d) { return d.id === docId; })[0];
    if (!doc) return;
    state.deleteTarget = docId;
    confirmModal('删除文档',
      '<p>确定删除文档 <strong>' + escapeHtml(doc.title) + '</strong> 吗？</p><p class="modal-note">删除后将无法恢复（原型未提供回收站）。</p>',
      function () {
        store.docs = store.docs.filter(function (d) { return d.id !== docId; });
        toast('文档已删除');
        // D2 修复：hash 变化时由 hashchange 渲染；hash 未变化（列表页直接删除）时显式重渲染当前视图
        if (afterHash && location.hash !== afterHash) location.hash = afterHash;
        route();
      });
  }

  /* ============================ 模板选择（PAGE-004 / REQ-003） ============================ */
  function openTemplatePicker() {
    if (state.templateOpen) return;
    state.templateOpen = true;
    var cards = store.templates.map(function (t) {
      return '<button type="button" class="tmpl-card" data-tmpl="' + escapeHtml(t.id) + '">' +
        '<span class="tmpl-icon">' + icon(t.icon === 'code' ? 'code' : (t.icon === 'check' ? 'check' : 'doc'), 20) + '</span>' +
        '<span class="tmpl-name">' + escapeHtml(t.name) + '</span>' +
        '<span class="tmpl-desc">' + escapeHtml(t.description) + '</span>' +
        '</button>';
    }).join('');

    var modal = openModal(
      '<div class="modal-head"><h3 class="modal-title">新建文档</h3><p class="modal-sub">选择模板快速创建，或从空白开始（模板内容只读预填充，可修改后保存）</p></div>' +
      '<div class="modal-body">' +
      '<button type="button" class="tmpl-card tmpl-blank" data-tmpl="__blank__">' +
      '<span class="tmpl-icon">' + icon('doc', 20) + '</span>' +
      '<span class="tmpl-name">空白文档</span>' +
      '<span class="tmpl-desc">不套用模板，从空白开始编写</span>' +
      '</button>' +
      cards +
      '</div>' +
      '<div class="modal-foot"><button type="button" class="btn btn-ghost" data-cancel>取消</button></div>',
      { onClose: function () { state.templateOpen = false; } }
    );
    $('[data-cancel]', modal.el).addEventListener('click', modal.close);
    $all('[data-tmpl]', modal.el).forEach(function (card) {
      card.addEventListener('click', function () {
        var id = card.dataset.tmpl;
        modal.close();
        location.hash = id === '__blank__' ? '#/edit' : '#/edit?template=' + id;
      });
    });
  }

  /* ============================ 分类创建（REQ-002） ============================ */
  function openCategoryModal(onCreated) {
    var modal = openModal(
      '<div class="modal-head"><h3 class="modal-title">新建分类</h3></div>' +
      '<div class="modal-body">' +
      '<label class="field-label" for="cat-name">分类名称</label>' +
      '<input class="input" id="cat-name" type="text" maxlength="30" placeholder="请输入分类名称（≤ 30 字符）">' +
      '<p class="field-hint">知识库当前为一级分类结构。</p>' +
      '</div>' +
      '<div class="modal-foot"><button type="button" class="btn btn-ghost" data-cancel>取消</button>' +
      '<button type="button" class="btn btn-primary" data-ok>创建</button></div>'
    );
    var input = $('#cat-name', modal.el);
    function submit() {
      var name = input.value.trim();
      if (!name) { toast('请输入分类名称', 'error'); input.focus(); return; }
      if (name.length > 30) { toast('分类名称不能超过 30 个字符', 'error'); return; }
      if (store.categories.indexOf(name) > -1) { toast('该分类已存在', 'error'); return; }
      store.categories.push(name);
      toast('分类「' + name + '」已创建');
      modal.close();
      if (typeof onCreated === 'function') onCreated(name);
      else { renderHome(parseHash()); }
    }
    $('[data-cancel]', modal.el).addEventListener('click', modal.close);
    $('[data-ok]', modal.el).addEventListener('click', submit);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
  }

  /* ============================ 演示控制台（用于评审演示异常 / 空态，非产品功能） ============================ */
  function renderDevPanel() {
    function row(label, key) {
      return '<label class="dev-row"><input type="checkbox" data-sim="' + key + '"' + (state.sim[key] ? ' checked' : '') + '><span>' + label + '</span></label>';
    }
    $('#dev-panel').innerHTML =
      '<div class="dev-head" data-dev-toggle>原型演示控制台' +
      '<span class="dev-chevron">' + icon('layers', 13) + '</span></div>' +
      '<div class="dev-body">' +
      '<p class="dev-note">用于向评审演示异常状态，非产品功能：</p>' +
      row('模拟列表加载失败', 'loadError') +
      row('模拟保存失败', 'saveError') +
      row('模拟空数据（无文档空态）', 'emptyData') +
      '<button type="button" class="btn btn-ghost btn-sm dev-reset" data-reset>恢复演示数据</button>' +
      '</div>';

    $('[data-dev-toggle]', $('#dev-panel')).addEventListener('click', function () {
      $('#dev-panel').classList.toggle('collapsed');
    });
    $all('[data-sim]', $('#dev-panel')).forEach(function (cb) {
      cb.addEventListener('change', function () {
        state.sim[cb.dataset.sim] = cb.checked;
        if (cb.dataset.sim === 'saveError') return; // 仅作用于下一次保存，无需重渲染
        route(); // 重渲染当前路由以展示加载失败 / 空数据效果
      });
    });
    $('[data-reset]', $('#dev-panel')).addEventListener('click', function () {
      state.sim = { loadError: false, saveError: false, emptyData: false };
      DATA.reset();
      state.filter = { keyword: '', category: '', tag: '' };
      state.searchInput = '';
      renderDevPanel();
      toast('演示数据已重置');
      renderHome(parseHash());
    });
  }

  /* ============================ 主导航（入口示意） ============================ */
  function wireSidebar() {
    $all('.nav-item').forEach(function (item) {
      item.addEventListener('click', function () {
        if (item.dataset.route === 'home') {
          state.filter = { keyword: '', category: '', tag: '' };
          state.searchInput = '';
          location.hash = '#/';
          return;
        }
        if (!item.dataset.route) return;
        toast('原型仅提供「知识库」模块，其余入口为导航示意', 'info');
      });
    });
  }

  /* ============================ 启动 ============================ */
  function route() {
    var r = parseHash();
    if (r.name === 'detail') renderDetail(r);
    else if (r.name === 'edit') renderEdit(r);
    else renderHome(r);
    main.scrollTop = 0;
  }

  window.addEventListener('hashchange', route);

  function init() {
    // 仅在无 hash 时补默认值；使用 replaceState 避免触发 hashchange 造成首屏重复渲染
    if (!location.hash) history.replaceState(null, '', '#/');
    route();
    wireSidebar();
    renderDevPanel();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
