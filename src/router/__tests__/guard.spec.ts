import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import { setupGuards } from '@/router/guard'
import { useUserStore } from '@/store/modules/user'

// A minimal set of routes matching the real app's guard contract.
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: { template: '<div>login</div>' },
    meta: { title: 'login.title' },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: { template: '<div>dashboard</div>' },
    meta: { requiresAuth: true, title: 'menu.dashboard' },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: { template: '<div>admin</div>' },
    meta: { requiresAuth: true, roles: ['admin'], title: 'menu.admin' },
  },
  { path: '/403', name: 'Forbidden', component: { template: '<div>403</div>' } },
  { path: '/404', name: 'NotFound', component: { template: '<div>404</div>' } },
  { path: '/public', name: 'Public', component: { template: '<div>public</div>' } },
]

function makeRouter() {
  const r = createRouter({ history: createWebHistory('/'), routes })
  setupGuards(r)
  return r
}

vi.mock('nprogress', () => ({
  default: { start: vi.fn(), done: vi.fn() },
}))

describe('router guards', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
    document.title = ''
  })

  afterEach(() => {
    // Prevent retained router instances from interfering with other tests.
    vi.restoreAllMocks()
  })

  it('redirects unauthenticated users to /login with redirect query when requiresAuth=true', async () => {
    const r = makeRouter()
    await r.push('/dashboard')
    await r.isReady()
    expect(r.currentRoute.value.path).toBe('/login')
    expect(r.currentRoute.value.query.redirect).toBe('/dashboard')
    expect(NProgress.start).toHaveBeenCalled()
    expect(NProgress.done).toHaveBeenCalled()
  })

  it('allows public routes for unauthenticated users without redirect', async () => {
    const r = makeRouter()
    await r.push('/public')
    expect(r.currentRoute.value.path).toBe('/public')
  })

  it('redirects authenticated users away from /login to /dashboard', async () => {
    const r = makeRouter()
    const store = useUserStore()
    store.token = 'mock-token-admin'
    store.userInfo = { username: 'admin', roles: ['admin'] }
    await r.push('/login')
    expect(r.currentRoute.value.path).toBe('/dashboard')
  })

  it('redirects users without required role to /403', async () => {
    const r = makeRouter()
    const store = useUserStore()
    store.token = 'token-viewer'
    store.userInfo = { username: 'alice', roles: ['viewer'] }
    await r.push('/admin')
    expect(r.currentRoute.value.path).toBe('/403')
  })

  it('allows users with required role to pass', async () => {
    const r = makeRouter()
    const store = useUserStore()
    store.token = 'token-admin'
    store.userInfo = { username: 'admin', roles: ['admin'] }
    await r.push('/admin')
    expect(r.currentRoute.value.path).toBe('/admin')
  })

  it('sets document.title from route meta after navigation', async () => {
    const r = makeRouter()
    await r.push('/public')
    // afterEach fires synchronously after navigation resolves
    expect(document.title).toContain('zvalley-dashboard')
  })
})
