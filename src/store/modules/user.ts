import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { LoginPayload, UserInfo } from '@/types'

const STORAGE_KEY = 'zvalley_dashboard_user'

function mockLogin(payload: LoginPayload): Promise<{ token: string; userInfo: UserInfo }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!payload.username || !payload.password || payload.password.length < 6) {
        reject(new Error('用户名或密码错误'))
        return
      }
      resolve({
        token: `mock-token-${payload.username}`,
        userInfo: {
          username: payload.username,
          roles: payload.username === 'admin' ? ['admin', 'editor'] : ['viewer'],
        },
      })
    }, 600)
  })
}

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)

    async function login(payload: LoginPayload) {
      const res = await mockLogin(payload)
      token.value = res.token
      userInfo.value = res.userInfo
      return res
    }

    function logout(navigate = true) {
      token.value = ''
      userInfo.value = null
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore
      }
      if (navigate) {
        import('@/router').then(({ default: router }) => {
          router.replace('/login')
        })
      }
    }

    const isLoggedIn = computed(() => !!token.value)
    const roles = computed<string[]>(() => userInfo.value?.roles ?? [])
    const username = computed(() => userInfo.value?.username ?? '')

    return { token, userInfo, isLoggedIn, roles, username, login, logout }
  },
  {
    persist: {
      key: STORAGE_KEY,
      storage: localStorage,
      paths: ['token', 'userInfo'],
    },
  },
)
