import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

// Mock the entire axios module so we can drive responses without hitting the network.
vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios')
  // Create a real Axios instance, but replace its adapter with a controllable mock.
  const instance = actual.default.create({
    baseURL: '/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
  })
  return {
    default: {
      ...actual.default,
      create: () => instance,
      isAxiosError: actual.default.isAxiosError,
    },
    AxiosError: actual.AxiosError,
    HttpStatusCode: actual.HttpStatusCode,
  }
})

// Stub NProgress & router to avoid side effects in unit tests.
vi.mock('nprogress', () => ({ default: { start: vi.fn(), done: vi.fn() } }))
vi.mock('@/router', () => ({
  default: {
    currentRoute: { value: { fullPath: '/dashboard' } },
    replace: vi.fn(),
  },
}))

// Silence ElMessage side effects and spy for assertions.
vi.mock('element-plus', async () => {
  const actual = await vi.importActual<typeof import('element-plus')>('element-plus')
  return {
    ...actual,
    ElMessage: { error: vi.fn(), success: vi.fn() },
  }
})

describe('axios request wrapper', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('unwraps successful responses (code === 0) to response.data', async () => {
    // Inject a successful adapter handler on the default instance.
    ;(request.defaults.adapter as unknown) = vi.fn().mockResolvedValue({
      status: 200,
      data: { code: 0, data: { ok: true }, message: 'ok' },
      headers: {},
      config: { headers: {} },
      statusText: 'OK',
    })
    const res = await request.get<{ ok: boolean }>('/anything')
    expect(res).toEqual({ ok: true })
  })

  it('rejects and shows ElMessage.error when business code is non-zero', async () => {
    ;(request.defaults.adapter as unknown) = vi.fn().mockResolvedValue({
      status: 200,
      data: { code: 500, data: null, message: 'boom' },
      headers: {},
      config: { headers: {} },
      statusText: 'OK',
    })
    await expect(request.get('/fail')).rejects.toThrow('boom')
    expect(ElMessage.error).toHaveBeenCalledWith('boom')
  })
})
