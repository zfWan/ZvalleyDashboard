/**
 * Tests for <ThemeToggle /> (REQ-002 / REQ-008).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import ThemeToggle from '@/components/ThemeToggle.vue'
import i18n, { setI18nLanguage } from '@/locales'
import { useAppStore } from '@/store/modules/app'

describe('ThemeToggle component (REQ-002 / REQ-008)', () => {
  let pinia: ReturnType<typeof createPinia>
  let wrapper: VueWrapper | null = null

  function mountToggle() {
    wrapper = mount(ThemeToggle, {
      attachTo: document.body,
      global: {
        plugins: [pinia, i18n, ElementPlus],
        stubs: { transition: false },
      },
    })
    return wrapper
  }

  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.classList.remove('dark')
    pinia = createPinia()
    setActivePinia(pinia)
    setI18nLanguage('zh-CN')
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
    setI18nLanguage('zh-CN')
  })

  it('renders a theme toggle button with next-mode aria-label and current title (light -> dark)', () => {
    const store = useAppStore()
    store.setTheme('light')
    const w = mountToggle()
    const btn = w.find('.theme-toggle')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('aria-label')).toBe('切换到深色模式')
    expect(btn.attributes('title')).toBe('浅色模式')
  })

  it('shows Moon / Sunny / Monitor icons respectively for light/dark/system (REQ-002.3 / OQ-4)', async () => {
    const store = useAppStore()
    store.setTheme('light')
    const w = mountToggle()
    expect(w.find('.el-icon').findComponent({ name: 'Moon' }).exists()).toBe(true)

    store.setTheme('dark')
    await nextTick()
    expect(w.find('.el-icon').findComponent({ name: 'Sunny' }).exists()).toBe(true)

    store.setTheme('system')
    await nextTick()
    expect(w.find('.el-icon').findComponent({ name: 'Monitor' }).exists()).toBe(true)
  })

  it('cycles light -> dark -> system -> light on click (REQ-002.2)', async () => {
    const store = useAppStore()
    store.setTheme('light')
    const w = mountToggle()
    const btn = w.find('.theme-toggle')

    await btn.trigger('click')
    expect(store.theme).toBe('dark')
    await btn.trigger('click')
    expect(store.theme).toBe('system')
    await btn.trigger('click')
    expect(store.theme).toBe('light')
  })

  it('updates aria-label/title reactively as theme changes (REQ-002.4 / REQ-008)', async () => {
    const store = useAppStore()
    store.setTheme('light')
    const w = mountToggle()

    store.setTheme('dark')
    await nextTick()
    expect(w.find('.theme-toggle').attributes('aria-label')).toBe('切换到跟随系统')
    expect(w.find('.theme-toggle').attributes('title')).toBe('深色模式')

    store.setTheme('system')
    await nextTick()
    expect(w.find('.theme-toggle').attributes('aria-label')).toBe('切换到浅色模式')
    expect(w.find('.theme-toggle').attributes('title')).toBe('跟随系统')

    store.setTheme('light')
    await nextTick()
    expect(w.find('.theme-toggle').attributes('aria-label')).toBe('切换到深色模式')
    expect(w.find('.theme-toggle').attributes('title')).toBe('浅色模式')
  })

  it('renders English tooltip/title when locale is en-US (REQ-008.2)', async () => {
    setI18nLanguage('en-US')
    const store = useAppStore()
    store.setTheme('dark')
    const w = mountToggle()
    await nextTick()
    expect(w.find('.theme-toggle').attributes('aria-label')).toBe('Switch to system mode')
    expect(w.find('.theme-toggle').attributes('title')).toBe('Dark Mode')
  })
})
