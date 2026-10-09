import type { RouteRecordRaw } from 'vue-router'

const loginRoute: RouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('@/layouts/BlankLayout.vue'),
  meta: { title: 'login.title', hidden: true },
  children: [
    {
      path: '',
      name: 'LoginPage',
      component: () => import('@/views/login/index.vue'),
      meta: { title: 'login.title' },
    },
  ],
}

export default loginRoute
