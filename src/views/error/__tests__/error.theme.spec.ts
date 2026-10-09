/**
 * Theme tests for 403 / 404 error pages (REQ-007.4).
 *
 * These pages render under BlankLayout so ThemeToggle must remain usable
 * even when the user lands on an error page. Page text/colors must come
 * from theme tokens rather than hard-coded values.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import { createRouter, createWebHistory } from 'vue-router'
import Page403 from '@/views/error/403.vue'
import Page404 from '@/views/error/404.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import i18n from '@/locales'

function makeRouter() {
  return createRouter({
    history: createWebHistory('/'),
    routes: [
      { path: '/403', component: { template: '<div/>' } },
      { path: '/404', component: { template: '<div/>' } },
      { path: '/dashboard', component: { template: '<div/>' } },
    ],
  })
}

function mountPage(Component: typeof Page404) {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.classList.remove('dark')
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = makeRouter()
  return mount(Component, {
    attachTo: document.body,
    global: {
      plugins: [pinia, i18n, router, ElementPlus],
      stubs: { transition: false },
    },
  })
}

describe('Error pages theme adaptation (REQ-007.4)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('404 page renders code, title, description and primary back-home button', () => {
    const w = mountPage(Page404)
    expect(w.find('.error-code').text()).toBe('404')
    expect(w.find('.error-title').exists()).toBe(true)
    expect(w.find('.desc').exists()).toBe(true)
    const btn = w.findAll('button').find((b) => b.text().includes('返回首页'))
    expect(btn).toBeTruthy()
  })

  it('403 page renders code and back-home button', () => {
    const w = mountPage(Page403)
    expect(w.find('.error-code').text()).toBe('403')
    const btn = w.findAll('button').find((b) => b.text().includes('返回首页'))
    expect(btn).toBeTruthy()
  })

  it('error page container uses theme page background (var(--el-bg-color-page))', () => {
    const w = mountPage(Page404)
    const page = w.find('.error-page')
    expect(page.exists()).toBe(true)
    // The authored style must reference variable, not a hard-coded #fff/#000 final color.
    const styleText = Array.from(document.querySelectorAll('style'))
      .map((s) => s.textContent || '')
      .join('\n')
    expect(styleText).toContain('--el-bg-color-page')
  })

  it('ThemeToggle mounts alongside error pages under BlankLayout (REQ-007.4 / S-04)', () => {
    // Sanity: ThemeToggle must be usable on error pages (TR-13); parent BlankLayout
    // is responsible for placement, but the toggle component itself must render and
    // be clickable without requiring auth.
    setActivePinia(createPinia())
    const tw = mount(ThemeToggle, {
      attachTo: document.body,
      global: { plugins: [createPinia(), i18n, ElementPlus], stubs: { transition: false } },
    })
    expect(tw.find('.theme-toggle').exists()).toBe(true)
  })
})
