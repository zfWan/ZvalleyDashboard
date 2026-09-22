'use strict';

/**
 * 知识库系统原型 Page Object。
 *
 * 覆盖页面：PAGE-001 列表 / PAGE-002 详情 / PAGE-003 编辑 / PAGE-004 模板选择 / PAGE-005 空态与无结果。
 * 选择器来源：prototype/knowledge-base/js/app.js 渲染出的 DOM 结构（与 Spec §4/§5 对应）。
 */
class KnowledgeBasePage {
  constructor(page) {
    this.page = page;
  }

  /* ---------------- 导航（REQ-001） ---------------- */
  get navHome() { return this.page.locator('.nav-item[data-route="home"]'); }
  get navOther() { return this.page.locator('.nav-item[data-route="workbench"]'); }

  /* ---------------- 列表页（PAGE-001 / PAGE-005） ---------------- */
  get pageTitle() { return this.page.locator('.page-title'); }
  get docCards() { return this.page.locator('.doc-card'); }
  get skeletonCards() { return this.page.locator('.skeleton-card'); }
  get listSummary() { return this.page.locator('.list-summary'); }
  get stateTitle() { return this.page.locator('.state-title'); }
  get retryButton() { return this.page.locator('[data-retry]'); }

  get searchInput() { return this.page.locator('[data-search-form] input[name="keyword"]'); }
  get searchSubmit() { return this.page.locator('[data-search-form] button[type="submit"]'); }
  get filterCategory() { return this.page.locator('select[data-filter-cat]'); }
  get filterTag() { return this.page.locator('select[data-filter-tag]'); }
  get clearFilter() { return this.page.locator('[data-clear-filter]'); }

  // 页面头部「新建文档」按钮（唯一）；空态/无结果状态下另有 state-view 内的引导按钮
  get newDocHeadButton() { return this.page.locator('.head-actions [data-new-doc]'); }
  get newDocStateButton() { return this.page.locator('.state-view [data-new-doc]'); }
  get manageCategory() { return this.page.locator('[data-manage-cat]'); }

  docCardByTitle(title) { return this.page.locator('.doc-card', { hasText: title }); }

  async search(keyword) {
    await this.searchInput.fill(keyword);
    await this.searchSubmit.click();
  }
  async filterByCategory(name) { await this.filterCategory.selectOption(name); }
  async filterByTag(name) { await this.filterTag.selectOption(name); }

  /* ---------------- 模板选择（PAGE-004 / REQ-003） ---------------- */
  get modal() { return this.page.locator('.modal'); }
  get modalTitle() { return this.page.locator('.modal-title'); }
  get modalOk() { return this.page.locator('.modal [data-ok]'); }
  get modalCancel() { return this.page.locator('.modal [data-cancel]'); }
  get blankTemplate() { return this.page.locator('.tmpl-card[data-tmpl="__blank__"]'); }
  get templateCards() { return this.page.locator('.tmpl-card[data-tmpl]:not([data-tmpl="__blank__"])'); }
  templateCard(id) { return this.page.locator('.tmpl-card[data-tmpl="' + id + '"]'); }

  /* ---------------- 编辑页（PAGE-003 / REQ-003/004/007） ---------------- */
  get titleInput() { return this.page.locator('#f-title'); }
  get categorySelect() { return this.page.locator('#f-cat'); }
  get tagInput() { return this.page.locator('#f-tags'); }
  get contentInput() { return this.page.locator('#f-content'); }
  get saveButton() { return this.page.locator('[data-save]'); }
  get fieldErrors() { return this.page.locator('.field-error'); }
  get tagChips() { return this.page.locator('.tag-input-wrap .tag'); }
  get editorPreview() { return this.page.locator('.editor-preview'); }

  async addTag(text) {
    await this.tagInput.fill(text);
    await this.tagInput.press('Enter');
  }
  async removeTagByText(text) {
    await this.tagChips.filter({ hasText: text }).locator('.tag-remove').click();
  }

  /* ---------------- 详情页（PAGE-002 / REQ-005） ---------------- */
  get detailTitle() { return this.page.locator('.detail-title'); }
  get detailMeta() { return this.page.locator('.detail-meta'); }
  get detailBody() { return this.page.locator('.detail-body'); }
  get editButton() { return this.page.locator('[data-edit]'); }
  get deleteButton() { return this.page.locator('[data-delete]'); }
  get backButton() { return this.page.locator('[data-back]'); }

  /* ---------------- 分类创建弹层（REQ-002） ---------------- */
  get categoryNameInput() { return this.page.locator('#cat-name'); }

  /* ---------------- 轻提示 ---------------- */
  get toasts() { return this.page.locator('#toast-box .toast'); }
  get lastToast() { return this.page.locator('#toast-box .toast').last(); }

  /* ---------------- 原型演示控制台（模拟异常/空态，非产品功能） ---------------- */
  get simLoadError() { return this.page.locator('[data-sim="loadError"]'); }
  get simSaveError() { return this.page.locator('[data-sim="saveError"]'); }
  get simEmptyData() { return this.page.locator('[data-sim="emptyData"]'); }
  get simReset() { return this.page.locator('[data-reset]'); }
}

module.exports = { KnowledgeBasePage };
