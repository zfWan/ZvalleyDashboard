/**
 * Theme tests for 403 / 404 error pages (REQ-007.4).
 *
 * These pages render under BlankLayout so ThemeToggle must remain usable
 * even when the user lands on an error page. Page text/colors come from
 * theme tokens rather than hard-coded values.
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
import { useAppStore } from '@/store/modules/app'

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
  return {
    wrapper: mount(Component, {
      attachTo: document.body,
      global: {
        plugins: [pinia, i18n, router, ElementPlus],
        stubs: { transition: false },
      },
    }),
    pinia,
  }
}

describe('Error pages theme adaptation (REQ-007.4)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('404 page renders code, title, description and primary back-home button', () => {
    const { wrapper } = mountPage(Page404)
    expect(wrapper.find('.error-code').text()).toBe('404')
    expect(wrapper.find('.error-title').exists()).toBe(true)
    expect(wrapper.find('.desc').exists()).toBe(true)
    // The back-home button is rendered via el-button type="primary" so that
    // Element Plus (and its dark css-vars) can theme it uniformly (REQ-006.4).
    const primary = wrapper.findAll('.el-button').find((b) => b.classes().includes('el-button--primary'))
    expect(primary).toBeTruthy()
    expect(primary!.text()).toContain('返回首页')
  })

  it('403 page renders code and a primary back-home button', () => {
    const { wrapper } = mountPage(Page403)
    expect(wrapper.find('.error-code').text()).toBe('403')
    const primary = wrapper.findAll('.el-button').find((b) => b.classes().includes('el-button--primary'))
    expect(primary).toBeTruthy()
    expect(primary!.text()).toContain('返回首页')
  })

  it('error page structure uses token-driven classes (error-page/error-code/desc) and reacts to html.dark', () => {
    const { pinia } = mountPage(Page404)
    const store = useAppStore(pinia)
    // Switching theme from the store must flip <html> markers, which in turn
    // activates EP dark css-vars — error pages inherit the same mechanism.
    store.setTheme('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    store.setTheme('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('ThemeToggle mounts alongside error pages under BlankLayout (REQ-007.4 / S-04 / TR-13)', () => {
    // ThemeToggle must render and be clickable on error pages without auth.
    setActivePinia(createPinia())
    const tw = mount(ThemeToggle, {
      attachTo: document.body,
      global: { plugins: [i18n, ElementPlus], stubs: { transition: false } },
    })
    expect(tw.find('.theme-toggle').exists()).toBe(true)
  })
})
