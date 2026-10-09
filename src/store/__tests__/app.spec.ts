import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/store/modules/app'

describe('useAppStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('defaults to zh-CN locale, sidebar expanded', () => {
    const store = useAppStore()
    expect(store.locale).toBe('zh-CN')
    expect(store.sidebarCollapsed).toBe(false)
  })

  it('toggleSidebar flips the collapsed state', () => {
    const store = useAppStore()
    store.toggleSidebar()
    expect(store.sidebarCollapsed).toBe(true)
    store.toggleSidebar()
    expect(store.sidebarCollapsed).toBe(false)
  })

  it('setLocale updates locale to en-US', () => {
    const store = useAppStore()
    store.setLocale('en-US')
    expect(store.locale).toBe('en-US')
  })
})
