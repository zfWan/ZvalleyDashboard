/**
 * Tests for <ThemeToggle /> (REQ-002 / REQ-008).
 *
 * Covers:
 *  - Renders a button with .theme-toggle class and accessible label
 *  - Icon reflects the NEXT mode (REQ-002.3 / OQ-4) and tooltip/aria-label
 *    points to the next mode (REQ-002.4)
 *  - Click cycles the store theme through light -> dark -> system -> light (REQ-002.2)
 *  - i18n tooltip changes with locale (REQ-008)
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import ThemeToggle from '@/components/ThemeToggle.vue'
import i18n, { setI18nLanguage } from '@/locales'
import { useAppStore } from '@/store/modules/app'

function mountToggle() {
  return mount(ThemeToggle, {
    attachTo: document.body,
    global: {
      plugins: [createPinia(), i18n, ElementPlus],
      stubs: { transition: false },
    },
  })
}

describe('ThemeToggle component (REQ-002 / REQ-008)', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.classList.remove('dark')
    setActivePinia(createPinia())
    setI18nLanguage('zh-CN')
  })

  afterEach(() => {
    setI18nLanguage('zh-CN')
  })

  it('renders a theme toggle button with aria-label and title', () => {
    const store = useAppStore()
    store.setTheme('light')
    const wrapper = mountToggle()
    const btn = wrapper.find('.theme-toggle')
    expect(btn.exists()).toBe(true)
    // light -> next is dark (REQ-002.3)
    expect(btn.attributes('aria-label')).toBe('切换到深色模式')
    // title reflects current mode
    expect(btn.attributes('title')).toBe('浅色模式')
    // el-tooltip wraps the button; ensure tooltip content key resolves to CN
    expect(wrapper.text()).not.toContain('themeSwitchToDark')
  })

  it('shows moon icon in light mode, sun in dark, monitor in system (REQ-002.3 / OQ-4)', () => {
    const store = useAppStore()
    const wrapper = mountToggle()

    store.setTheme('light') // next = dark -> Moon icon (class .el-icon-moon? EP icons render svg)
    expect(wrapper.find('.el-icon').findComponent({ name: 'Moon' }).exists()).toBe(true)

    store.setTheme('dark') // next = system -> Sunny
    expect(wrapper.find('.el-icon').findComponent({ name: 'Sunny' }).exists()).toBe(true)

    store.setTheme('system') // next = light -> Monitor
    expect(wrapper.find('.el-icon').findComponent({ name: 'Monitor' }).exists()).toBe(true)
  })

  it('cycles light -> dark -> system -> light on click (REQ-002.2)', async () => {
    const store = useAppStore()
    store.setTheme('light')
    const wrapper = mountToggle()
    const btn = wrapper.find('.theme-toggle')

    await btn.trigger('click')
    expect(store.theme).toBe('dark')
    await btn.trigger('click')
    expect(store.theme).toBe('system')
    await btn.trigger('click')
    expect(store.theme).toBe('light')
  })

  it('updates aria-label/title for each tooltip i18n key (REQ-002.4 / REQ-008)', () => {
    const store = useAppStore()
    const wrapper = mountToggle()

    store.setTheme('light')
    expect(wrapper.find('.theme-toggle').attributes('aria-label')).toBe('切换到深色模式')
    expect(wrapper.find('.theme-toggle').attributes('title')).toBe('浅色模式')

    store.setTheme('dark')
    expect(wrapper.find('.theme-toggle').attributes('aria-label')).toBe('切换到跟随系统')
    expect(wrapper.find('.theme-toggle').attributes('title')).toBe('深色模式')

    store.setTheme('system')
    expect(wrapper.find('.theme-toggle').attributes('aria-label')).toBe('切换到浅色模式')
    expect(wrapper.find('.theme-toggle').attributes('title')).toBe('跟随系统')
  })

  it('switches tooltip/title to English when locale is en-US (REQ-008.2)', () => {
    setI18nLanguage('en-US')
    const store = useAppStore()
    store.setTheme('dark')
    const wrapper = mountToggle()
    const btn = wrapper.find('.theme-toggle')
    expect(btn.attributes('aria-label')).toBe('Switch to system mode')
    expect(btn.attributes('title')).toBe('Dark Mode')
  })
})
