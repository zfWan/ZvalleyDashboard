import NProgress from 'nprogress'
import type { Router } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import i18n from '@/locales'

const LOGIN_PATH = '/login'
const DEFAULT_HOME = '/dashboard'

export function setupGuards(router: Router) {
  router.beforeEach((to, _from, next) => {
    NProgress.start()
    const userStore = useUserStore()
    const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth)
    const hasToken = !!userStore.token

    if (!requiresAuth) {
      if (to.path === LOGIN_PATH && hasToken) {
        next(DEFAULT_HOME)
        return
      }
      next()
      return
    }

    if (!hasToken) {
      next({ path: LOGIN_PATH, query: { redirect: to.fullPath } })
      return
    }

    const rolesRequired = (to.meta?.roles as string[] | undefined) ?? []
    if (rolesRequired.length > 0 && !rolesRequired.some((r) => userStore.roles.includes(r))) {
      next('/403')
      return
    }

    next()
  })

  router.afterEach((to) => {
    NProgress.done()
    const { t } = i18n.global
    const pageTitle = to.meta?.title ? t(to.meta.title as string) : ''
    const appTitle = t('app.title')
    document.title = pageTitle ? `${pageTitle} - ${appTitle}` : appTitle
  })

  router.onError(() => {
    NProgress.done()
  })
}
