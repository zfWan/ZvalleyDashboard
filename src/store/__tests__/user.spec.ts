import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/store/modules/user'

const STORAGE_KEY = 'zvalley_dashboard_user'

describe('useUserStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    // Avoid test leakage through the dynamic router import in logout().
    vi.resetModules()
  })

  it('starts unauthenticated with empty state', () => {
    const store = useUserStore()
    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
    expect(store.isLoggedIn).toBe(false)
    expect(store.roles).toEqual([])
    expect(store.username).toBe('')
  })

  it('login with valid credentials sets token, userInfo and admin roles for admin user', async () => {
    vi.useFakeTimers()
    const store = useUserStore()
    const promise = store.login({ username: 'admin', password: '123456' })
    await vi.advanceTimersByTimeAsync(600)
    await promise
    expect(store.token).toBe('mock-token-admin')
    expect(store.userInfo).toEqual({ username: 'admin', roles: ['admin', 'editor'] })
    expect(store.isLoggedIn).toBe(true)
    expect(store.username).toBe('admin')
    expect(store.roles).toContain('admin')
    vi.useRealTimers()
  })

  it('login assigns viewer role for non-admin users', async () => {
    vi.useFakeTimers()
    const store = useUserStore()
    const promise = store.login({ username: 'alice', password: '123456' })
    await vi.advanceTimersByTimeAsync(600)
    await promise
    expect(store.roles).toEqual(['viewer'])
    vi.useRealTimers()
  })

  it('login rejects when username is empty', async () => {
    vi.useFakeTimers()
    const store = useUserStore()
    const promise = store.login({ username: '', password: '123456' })
    await vi.advanceTimersByTimeAsync(600)
    await expect(promise).rejects.toThrow('用户名或密码错误')
    expect(store.token).toBe('')
    vi.useRealTimers()
  })

  it('login rejects when password is shorter than 6 characters', async () => {
    vi.useFakeTimers()
    const store = useUserStore()
    const promise = store.login({ username: 'admin', password: '123' })
    await vi.advanceTimersByTimeAsync(600)
    await expect(promise).rejects.toThrow('用户名或密码错误')
    vi.useRealTimers()
  })

  it('logout(navigate=false) clears state and removes localStorage key', async () => {
    vi.useFakeTimers()
    const store = useUserStore()
    const promise = store.login({ username: 'admin', password: '123456' })
    await vi.advanceTimersByTimeAsync(600)
    await promise
    // Simulate persistence having written the key manually (pinia-plugin-persistedstate
    // persists after mutation; we emulate it here since we do not install the plugin
    // with the pinia used in this unit test).
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: store.token, userInfo: store.userInfo }),
    )

    store.logout(false)
    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    vi.useRealTimers()
  })
})
