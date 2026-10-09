/**
 * Tests for BlankLayout (REQ-002.1 / REQ-007.1 / REQ-007.4 / TR-13).
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import BlankLayout from '@/layouts/BlankLayout.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import i18n from '@/locales'

describe('BlankLayout theme integration (REQ-002.1 / REQ-007)', () => {
  let pinia: ReturnType<typeof createPinia>
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.classList.remove('dark')
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('mounts ThemeToggle in the tools area for unauthenticated visitors (TR-13)', () => {
    const wrapper = mount(BlankLayout, {
      attachTo: document.body,
      global: {
        plugins: [pinia, i18n, ElementPlus],
        stubs: { transition: false, 'router-view': true },
      },
    })
    expect(wrapper.find('.blank-layout__tools').exists()).toBe(true)
    expect(wrapper.findComponent(ThemeToggle).exists()).toBe(true)
  })

  it('renders the top-right tools chip on blank pages', () => {
    const wrapper = mount(BlankLayout, {
      attachTo: document.body,
      global: {
        plugins: [pinia, i18n, ElementPlus],
        stubs: { transition: false, 'router-view': true },
      },
    })
    expect(wrapper.find('.blank-layout').exists()).toBe(true)
    expect(wrapper.find('.blank-layout__tools').isVisible()).toBe(true)
  })
})
