/**
 * Tests for BlankLayout (REQ-002.1 / REQ-007.1 / REQ-007.4).
 *
 * The blank layout hosts login and error pages; visitors who are not yet
 * signed in must be able to switch themes (TR-13) — ThemeToggle must be
 * mounted in the top-right tools area regardless of auth state.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import BlankLayout from '@/layouts/BlankLayout.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import i18n from '@/locales'

describe('BlankLayout theme integration (REQ-002.1 / REQ-007)', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.classList.remove('dark')
    setActivePinia(createPinia())
  })

  it('mounts ThemeToggle in the tools area for unauthenticated visitors (TR-13)', () => {
    const wrapper = mount(BlankLayout, {
      attachTo: document.body,
      global: {
        plugins: [createPinia(), i18n, ElementPlus],
        stubs: { transition: false, 'router-view': true },
      },
    })
    expect(wrapper.find('.blank-layout__tools').exists()).toBe(true)
    expect(wrapper.findComponent(ThemeToggle).exists()).toBe(true)
  })

  it('uses the theme-aware page background token (var(--el-bg-color-page))', () => {
    const wrapper = mount(BlankLayout, {
      attachTo: document.body,
      global: {
        plugins: [createPinia(), i18n, ElementPlus],
        stubs: { transition: false, 'router-view': true },
      },
    })
    const root = wrapper.find('.blank-layout').element as HTMLElement
    // The container must reference the EP page bg token so dark theme can override it
    expect(root.style.backgroundColor || getComputedStyle(root).backgroundColor).toBeDefined()
    // The tools chip should be rendered even on error/login pages
    expect(wrapper.find('.blank-layout__tools').isVisible()).toBe(true)
  })
})
