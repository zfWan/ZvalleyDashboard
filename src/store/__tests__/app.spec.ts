import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/store/modules/app'

describe('useAppStore', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.classList.remove('dark')
    setActivePinia(createPinia())
  })

  it('defaults to zh-CN locale, sidebar expanded, theme=system (OQ-1)', () => {
    const store = useAppStore()
    expect(store.locale).toBe('zh-CN')
    expect(store.sidebarCollapsed).toBe(false)
    expect(store.theme).toBe('system')
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

  it('setTheme updates theme and applies data-theme to <html> (REQ-001.1/.2)', () => {
    const store = useAppStore()
    store.setTheme('dark')
    expect(store.theme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    store.setTheme('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggleTheme cycles light -> dark -> system -> light (REQ-002.2, OQ-3)', () => {
    const store = useAppStore()
    store.setTheme('light')
    store.toggleTheme()
    expect(store.theme).toBe('dark')
    store.toggleTheme()
    expect(store.theme).toBe('system')
    store.toggleTheme()
    expect(store.theme).toBe('light')
  })
})
