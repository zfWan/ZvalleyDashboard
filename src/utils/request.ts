import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import router from '@/router'
import { useUserStore } from '@/store/modules/user'

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL

const service: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

// Request interceptor
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    NProgress.start()
    // The interceptor only fires at request time, at which point Pinia is installed.
    // We call useUserStore() inside the interceptor (not at module eval) to avoid
    // "getActivePinia was called with no active Pinia" errors if this module is
    // imported before app.use(pinia).
    try {
      const userStore = useUserStore()
      if (userStore.token) {
        config.headers.Authorization = `Bearer ${userStore.token}`
      }
    } catch {
      // ignore — token will not be attached
    }
    return config
  },
  (error) => {
    NProgress.done()
    return Promise.reject(error)
  },
)

// Response interceptor
service.interceptors.response.use(
  (response) => {
    NProgress.done()
    const res = response.data
    if (res && res.code === 0) {
      return res.data
    }
    const message = res?.message || '请求失败'
    ElMessage.error(message)
    return Promise.reject(new Error(message))
  },
  (error: AxiosError<{ code?: number; message?: string }>) => {
    NProgress.done()
    const status = error.response?.status
    const data = error.response?.data
    if (status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      try {
        const userStore = useUserStore()
        userStore.logout(false)
        const redirect = encodeURIComponent(router.currentRoute.value.fullPath)
        router.replace(`/login?redirect=${redirect}`)
      } catch {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = `/login?redirect=${redirect}`
      }
    } else if (status === 403) {
      ElMessage.error('没有权限访问该资源')
    } else if (status === 500) {
      ElMessage.error(data?.message || '服务器异常，请稍后重试')
    } else if (!error.response) {
      ElMessage.error('网络异常，请稍后重试')
    } else {
      ElMessage.error(data?.message || error.message || '请求失败')
    }
    return Promise.reject(error)
  },
)

export default service
