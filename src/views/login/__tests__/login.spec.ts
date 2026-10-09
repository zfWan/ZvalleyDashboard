import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/views/login/index.vue'
import i18n from '@/locales'
import { permission as vPermission } from '@/directives/permission'

function makeRouter() {
  return createRouter({
    history: createWebHistory('/'),
    routes: [
      { path: '/login', name: 'Login', component: { template: '<div/>' } },
      { path: '/dashboard', name: 'Dashboard', component: { template: '<div/>' } },
    ],
  })
}

function mountLogin() {
  localStorage.clear()
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = makeRouter()
  router.push('/login')
  return {
    pinia,
    router,
    wrapper: mount(LoginPage, {
      attachTo: document.body,
      global: {
        plugins: [pinia, i18n, router],
        directives: { permission: vPermission },
        stubs: { transition: false },
      },
    }),
  }
}

describe('Login page', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('renders title, inputs and submit button in zh-CN', () => {
    const { wrapper } = mountLogin()
    expect(wrapper.text()).toContain('登录')
    expect(wrapper.findAll('input').length).toBeGreaterThanOrEqual(2)
    const submit = wrapper.findAll('button').find((b) => b.text().includes('登录'))
    expect(submit).toBeTruthy()
  })

  it('blocks submission when form is invalid and does not log user in', async () => {
    const { wrapper } = mountLogin()
    // Dynamic import so we use the same pinia as components
    const { useUserStore } = await import('@/store/modules/user')
    const store = useUserStore()
    const loginSpy = vi.spyOn(store, 'login')
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('')
    await inputs[1].setValue('')
    // Trigger blur to fire validation
    await inputs[0].trigger('blur')
    await inputs[1].trigger('blur')
    const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('登录'))!
    await submitBtn.trigger('click')
    await vi.runAllTimersAsync()
    expect(loginSpy).not.toHaveBeenCalled()
    expect(store.isLoggedIn).toBe(false)
  })

  it('logs in successfully with admin credentials and populates token/roles', async () => {
    const { wrapper } = mountLogin()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('admin')
    await inputs[1].setValue('123456')
    const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('登录'))!
    await submitBtn.trigger('click')
    await vi.advanceTimersByTimeAsync(700)
    const { useUserStore } = await import('@/store/modules/user')
    const store = useUserStore()
    expect(store.token).toBe('mock-token-admin')
    expect(store.username).toBe('admin')
    expect(store.roles).toContain('admin')
    expect(store.isLoggedIn).toBe(true)
  })

  it('does not set token when password is too short', async () => {
    const { wrapper } = mountLogin()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('admin')
    await inputs[1].setValue('123')
    const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('登录'))!
    await submitBtn.trigger('click')
    await vi.advanceTimersByTimeAsync(700)
    const { useUserStore } = await import('@/store/modules/user')
    const store = useUserStore()
    expect(store.isLoggedIn).toBe(false)
  })
})
