'use strict';

/**
 * 知识库系统原型 E2E 用例。
 *
 * 用例来源：《docs/requirements/知识库系统-Spec.md》第 5 章 REQ-001 ~ REQ-008
 * 的 Acceptance Requirements 与 Gherkin 场景；原型实现：
 *   prototype/knowledge-base/index.html + js/app.js + js/data.js
 *
 * 说明：
 * - 原型为内存态模拟数据，每个测试用例使用独立的浏览器上下文（数据随页面加载重置）。
 * - 异常/空态通过「原型演示控制台」（右下角，非产品功能）模拟，模拟开关为演示工具。
 * - 种子数据：9 篇文档、4 个分类（未分类/技术文档/产品文档/测试文档）、3 个模板。
 */
const { test, expect } = require('playwright/test');
const { KnowledgeBasePage } = require('../pages/knowledgeBasePage');

test.describe('知识库系统原型 E2E（REQ-001 ~ REQ-008）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  /* ================= REQ-001 知识库入口与导航 ================= */
  test.describe('REQ-001 知识库入口与导航', () => {
    test('主导航提供「知识库」入口，点击进入文档列表页', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await expect(kb.navHome).toBeVisible();
      await expect(kb.pageTitle).toHaveText('知识库');
      await expect(kb.docCards.first()).toBeVisible();
      // 其余入口仅为导航示意（原型边界，Spec ENTRY-001 / NG-006）
      await kb.navOther.click();
      await expect(kb.lastToast).toContainText('原型仅提供「知识库」模块');
    });
  });

  /* ================= REQ-002 分类创建与归属 ================= */
  test.describe('REQ-002 分类创建与归属', () => {
    test('支持创建分类，新分类出现在筛选项中', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.manageCategory.click();
      await expect(kb.modalTitle).toHaveText('新建分类');
      await kb.categoryNameInput.fill('测试分类A');
      await kb.modalOk.click();
      await expect(kb.lastToast).toContainText('分类「测试分类A」已创建');
      await expect(kb.filterCategory.locator('option', { hasText: '测试分类A' })).toHaveCount(1);
    });

    test('新建文档未选择分类时归属默认分类「未分类」', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.newDocHeadButton.click();
      await kb.blankTemplate.click();
      await expect(kb.titleInput).toBeVisible();
      await expect(kb.categorySelect).toHaveValue('未分类');
      await kb.titleInput.fill('默认分类归属验证文档');
      await kb.contentInput.fill('## 正文\n验证未选择分类时的默认归属。');
      await kb.saveButton.click();
      await expect(kb.lastToast).toContainText('文档已创建并发布');
      await expect(kb.detailTitle).toHaveText('默认分类归属验证文档');
      await expect(kb.detailMeta.locator('.badge-cat')).toContainText('未分类');
      await kb.backButton.click();
      await expect(kb.docCardByTitle('默认分类归属验证文档')).toBeVisible();
    });
  });

  /* ================= REQ-003 新建文档（空白 / 模板） ================= */
  test.describe('REQ-003 新建文档（空白 / 模板）', () => {
    test('新建入口提供「空白创建」与 3 个预置模板', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.newDocHeadButton.click();
      await expect(kb.modalTitle).toHaveText('新建文档');
      await expect(kb.blankTemplate).toBeVisible();
      await expect(kb.templateCards).toHaveCount(3);
      await expect(kb.templateCard('tmpl-tech')).toContainText('技术方案模板');
      await expect(kb.templateCard('tmpl-prd')).toContainText('PRD 需求文档模板');
      await expect(kb.templateCard('tmpl-test')).toContainText('测试用例模板');
    });

    test('选择模板后编辑器预填充模板内容', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.newDocHeadButton.click();
      await kb.templateCard('tmpl-tech').click();
      await expect(kb.titleInput).toBeVisible();
      await expect(kb.titleInput).toHaveValue('技术方案：');
      await expect(kb.contentInput).toHaveValue(/# \{文档标题\}/);
    });

    test('基于模板新建文档，保存后出现在列表并可被检索', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.newDocHeadButton.click();
      await kb.templateCard('tmpl-test').click();
      await kb.titleInput.fill('支付回归测试用例（模板）');
      await kb.contentInput.fill('# 支付回归测试用例\n\n## 范围\n\n- 支付主链路\n\n## 结论\n\n待执行');
      await kb.saveButton.click();
      await expect(kb.lastToast).toContainText('文档已创建并发布');
      await expect(kb.detailTitle).toHaveText('支付回归测试用例（模板）');
      await kb.backButton.click();
      await expect(kb.docCardByTitle('支付回归测试用例（模板）')).toBeVisible();
      await kb.search('支付回归测试');
      await expect(kb.listSummary).toContainText('筛选结果：1 篇');
      await expect(kb.docCardByTitle('支付回归测试用例（模板）')).toBeVisible();
    });

    test('必填字段缺失时阻止保存并提示校验信息', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.newDocHeadButton.click();
      await kb.blankTemplate.click();
      await kb.saveButton.click();
      await expect(kb.lastToast).toContainText('请先完善必填项后再保存');
      await expect(kb.fieldErrors).toHaveText(['请输入文档标题', '请输入文档正文']);
    });
  });

  /* ================= REQ-004 文档编辑与保存 ================= */
  test.describe('REQ-004 文档编辑与保存', () => {
    test('编辑标题/正文/标签/分类并保存，列表与详情反映最新内容', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.docCardByTitle('网关服务架构设计').click();
      await expect(kb.detailTitle).toHaveText('网关服务架构设计');
      await kb.editButton.click();
      await kb.titleInput.fill('网关服务架构设计（修订）');
      await kb.contentInput.fill('# 网关服务架构设计（修订）\n\n更新后的正文内容。');
      await kb.categorySelect.selectOption('测试文档');
      await kb.addTag('评审');
      await kb.saveButton.click();
      await expect(kb.lastToast).toContainText('文档已更新');
      await expect(kb.detailTitle).toHaveText('网关服务架构设计（修订）');
      await expect(kb.detailMeta.locator('.badge-cat')).toContainText('测试文档');
      await expect(kb.detailMeta.locator('.tag').filter({ hasText: '评审' })).toHaveCount(1);
      await kb.backButton.click();
      await expect(kb.docCardByTitle('网关服务架构设计（修订）')).toBeVisible();
    });

    test('保存失败提示错误且输入不丢失，重试后保存成功', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.newDocHeadButton.click();
      await kb.blankTemplate.click();
      await kb.titleInput.fill('保存失败重试验证文档');
      await kb.contentInput.fill('## 正文\n用于验证保存失败重试场景。');
      await kb.expandDevPanel();
      await kb.simSaveError.check();
      await kb.saveButton.click();
      await expect(kb.lastToast).toContainText('保存失败（演示模式）');
      // 输入内容保留
      await expect(kb.titleInput).toHaveValue('保存失败重试验证文档');
      await expect(kb.contentInput).toHaveValue(/用于验证保存失败重试场景/);
      // 关闭模拟后重试成功
      await kb.simSaveError.uncheck();
      await kb.saveButton.click();
      await expect(kb.lastToast).toContainText('文档已创建并发布');
      await expect(kb.detailTitle).toHaveText('保存失败重试验证文档');
    });
  });

  /* ================= REQ-005 文档查看与删除 ================= */
  test.describe('REQ-005 文档查看与删除', () => {
    test('点击文档条目进入详情，展示标题/分类/标签与正文渲染', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.docCardByTitle('网关服务架构设计').click();
      await expect(kb.detailTitle).toHaveText('网关服务架构设计');
      await expect(kb.detailMeta.locator('.badge-cat')).toContainText('技术文档');
      await expect(kb.detailMeta.locator('.tag').filter({ hasText: '架构' })).toHaveCount(1);
      await expect(kb.detailBody.locator('h1')).toContainText('网关服务架构设计');
      await expect(kb.detailBody).toContainText('统一请求入口与鉴权');
    });

    test('删除前要求二次确认，确认后文档从列表移除', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.docCardByTitle('用户中心 API 接口说明').click();
      await expect(kb.detailTitle).toHaveText('用户中心 API 接口说明');
      await kb.deleteButton.click();
      await expect(kb.modalTitle).toHaveText('删除文档');
      await kb.modalOk.click();
      await expect(kb.lastToast).toContainText('文档已删除');
      await expect(kb.pageTitle).toHaveText('知识库');
      await expect(kb.docCardByTitle('用户中心 API 接口说明')).toHaveCount(0);
    });

    test('取消删除则不生效，文档保留', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.docCardByTitle('用户中心 API 接口说明').click();
      await kb.deleteButton.click();
      await expect(kb.modalTitle).toHaveText('删除文档');
      await kb.modalCancel.click();
      await expect(kb.detailTitle).toHaveText('用户中心 API 接口说明');
      await kb.backButton.click();
      await expect(kb.docCardByTitle('用户中心 API 接口说明')).toBeVisible();
    });

    test('列表页可直接删除文档（二次确认）', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      const card = kb.docCardByTitle('登录页改版需求');
      await card.locator('[data-del-doc]').click();
      await expect(kb.modalTitle).toHaveText('删除文档');
      await kb.modalOk.click();
      await expect(kb.lastToast).toContainText('文档已删除');
      await expect(kb.docCardByTitle('登录页改版需求')).toHaveCount(0);
    });
  });

  /* ================= REQ-006 全文检索与筛选 ================= */
  test.describe('REQ-006 全文检索与筛选', () => {
    test('关键词匹配标题并返回结果', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.search('网关');
      await expect(kb.docCardByTitle('网关服务架构设计')).toBeVisible();
      await expect(kb.docCardByTitle('支付流程测试用例')).toHaveCount(0);
    });

    test('关键词匹配正文与标签，不区分大小写', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      // 正文匹配
      await kb.search('OpenResty');
      await expect(kb.docCardByTitle('网关服务架构设计')).toBeVisible();
      // 标签匹配且不区分大小写（PRD -> prd）
      await kb.search('prd');
      await expect(kb.docCardByTitle('知识库系统 PRD')).toBeVisible();
      await expect(kb.docCardByTitle('登录页改版需求')).toBeVisible();
      await expect(kb.docCardByTitle('支付流程测试用例')).toHaveCount(0);
    });

    test('按分类过滤', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.filterByCategory('产品文档');
      await expect(kb.docCardByTitle('知识库系统 PRD')).toBeVisible();
      await expect(kb.docCardByTitle('登录页改版需求')).toBeVisible();
      await expect(kb.docCardByTitle('网关服务架构设计')).toHaveCount(0);
    });

    test('按标签过滤', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.filterByTag('架构');
      await expect(kb.docCardByTitle('网关服务架构设计')).toBeVisible();
      await expect(kb.docCards).toHaveCount(1);
    });

    test('检索 + 分类 + 标签组合过滤', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.search('PRD');
      await kb.filterByCategory('产品文档');
      await kb.filterByTag('登录');
      await expect(kb.docCardByTitle('登录页改版需求')).toBeVisible();
      await expect(kb.docCardByTitle('知识库系统 PRD')).toHaveCount(0);
      await expect(kb.listSummary).toContainText('筛选结果：1 篇');
    });

    test('无匹配结果展示空态与「清除筛选」引导', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.search('不存在的关键词xyz');
      await expect(kb.stateTitle).toHaveText('暂无搜索结果');
      await expect(kb.clearFilter).toBeVisible();
      await expect(kb.clearFilterState).toBeVisible();
      await expect(kb.newDocStateButton).toBeVisible();
      await kb.clearFilterState.click();
      await expect(kb.listSummary).toContainText('全部文档：9 篇');
      await expect(kb.docCards).toHaveCount(9);
    });
  });

  /* ================= REQ-007 标签管理 ================= */
  test.describe('REQ-007 标签管理', () => {
    test('编辑页添加标签，保存后详情展示且可被检索', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.docCardByTitle('团队代码规范（前端）').click();
      await kb.editButton.click();
      await kb.addTag('工程实践');
      await kb.saveButton.click();
      await expect(kb.lastToast).toContainText('文档已更新');
      await expect(kb.detailMeta.locator('.tag').filter({ hasText: '工程实践' })).toHaveCount(1);
      await kb.backButton.click();
      await kb.search('工程实践');
      await expect(kb.docCardByTitle('团队代码规范（前端）')).toBeVisible();
    });

    test('编辑页可移除标签，保存后详情不再展示', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.docCardByTitle('团队代码规范（前端）').click();
      await kb.editButton.click();
      await kb.removeTagByText('规范');
      await expect(kb.tagChips.filter({ hasText: '规范' })).toHaveCount(0);
      await kb.saveButton.click();
      await expect(kb.lastToast).toContainText('文档已更新');
      await expect(kb.detailMeta.locator('.tag').filter({ hasText: '规范' })).toHaveCount(0);
    });

    test('单个标签超过 20 字符时提示校验错误', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.newDocHeadButton.click();
      await kb.blankTemplate.click();
      await kb.addTag('这是一个超过二十个字符的标签用于校验测试哦哦');
      await expect(kb.fieldErrors).toContainText('单个标签不能超过 20 个字符');
    });
  });

  /* ================= REQ-008 状态与反馈 ================= */
  test.describe('REQ-008 状态与反馈', () => {
    test('知识库无文档时展示空态与新建文档引导', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.expandDevPanel();
      await kb.simEmptyData.check();
      await expect(kb.stateTitle).toHaveText('暂无文档');
      await expect(kb.newDocStateButton).toBeVisible();
      await kb.newDocStateButton.click();
      await expect(kb.modalTitle).toHaveText('新建文档');
      await kb.modalCancel.click();
      // 恢复演示数据
      await kb.simReset.click();
      await expect(kb.docCards.first()).toBeVisible();
    });

    test('列表加载中展示骨架屏后渲染文档列表', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await expect(kb.skeletonCards.first()).toBeVisible();
      await expect(kb.docCards.first()).toBeVisible();
    });

    test('加载失败展示错误态与重试入口，关闭故障源后重试恢复', async ({ page }) => {
      const kb = new KnowledgeBasePage(page);
      await kb.expandDevPanel();
      await kb.simLoadError.check();
      await expect(kb.stateTitle).toHaveText('加载失败');
      await expect(kb.retryButton).toBeVisible();
      // 故障源未关闭时重试仍保持错误态
      await kb.retryButton.click();
      await expect(kb.stateTitle).toHaveText('加载失败');
      // 关闭演示开关（不触发重渲染），再点重试恢复
      await page.evaluate(() => {
        const cb = document.querySelector('[data-sim="loadError"]');
        if (cb) cb.checked = false;
      });
      await kb.retryButton.click();
      await expect(kb.docCards.first()).toBeVisible();
    });
  });
});
