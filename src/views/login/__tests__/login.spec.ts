import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import LoginPage from '@/views/login/index.vue'
import i18n from '@/locales'

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
        plugins: [pinia, i18n, router, ElementPlus],
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
    expect(wrapper.text()).toContain('账号登录')
    expect(wrapper.findAll('input').length).toBeGreaterThanOrEqual(2)
    const submit = wrapper.findAll('button').find((b) => b.text().includes('登 录'))
    expect(submit).toBeTruthy()
  })

  it('does not log the user in when username is empty (validation fails)', async () => {
    const { wrapper, pinia } = mountLogin()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('')
    await inputs[1].setValue('123456')
    await wrapper.vm.$nextTick()
    const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('登 录'))!
    // Clicking the submit button triggers handleSubmit -> formRef.validate()
    // which rejects for empty username; handleSubmit catches and returns, so
    // the login action must never resolve successfully.
    const clickPromise = submitBtn.trigger('click')
    await vi.runAllTimersAsync()
    await clickPromise
    const { useUserStore } = await import('@/store/modules/user')
    const store = useUserStore(pinia)
    expect(store.isLoggedIn).toBe(false)
  })

  it('logs in successfully with admin credentials and populates token/roles', async () => {
    const { wrapper, pinia } = mountLogin()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('admin')
    await inputs[1].setValue('123456')
    await wrapper.vm.$nextTick()
    const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('登 录'))!
    const clickPromise = submitBtn.trigger('click')
    await vi.advanceTimersByTimeAsync(700)
    await clickPromise
    const { useUserStore } = await import('@/store/modules/user')
    const store = useUserStore(pinia)
    expect(store.token).toBe('mock-token-admin')
    expect(store.username).toBe('admin')
    expect(store.roles).toContain('admin')
    expect(store.isLoggedIn).toBe(true)
  })

  it('does not log the user in when password is too short', async () => {
    const { wrapper, pinia } = mountLogin()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('admin')
    await inputs[1].setValue('123')
    await wrapper.vm.$nextTick()
    const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('登 录'))!
    const clickPromise = submitBtn.trigger('click')
    await vi.advanceTimersByTimeAsync(700)
    await clickPromise
    const { useUserStore } = await import('@/store/modules/user')
    const store = useUserStore(pinia)
    expect(store.isLoggedIn).toBe(false)
  })
})
