import type { RouteRecordRaw } from 'vue-router'

const dashboardRoute: RouteRecordRaw = {
  path: '/',
  name: 'Dashboard',
  component: () => import('@/layouts/DefaultLayout.vue'),
  redirect: '/dashboard',
  meta: { requiresAuth: true, title: 'menu.dashboard' },
  children: [
    {
      path: 'dashboard',
      name: 'DashboardHome',
      component: () => import('@/views/dashboard/index.vue'),
      meta: {
        title: 'menu.dashboard',
        icon: 'HomeFilled',
        requiresAuth: true,
      },
    },
    {
      path: 'demo-403',
      name: 'Demo403',
      component: () => import('@/views/error/403.vue'),
      meta: {
        title: 'menu.demo403',
        icon: 'Lock',
        requiresAuth: true,
      },
    },
    {
      path: 'demo-404',
      name: 'Demo404',
      component: () => import('@/views/error/404.vue'),
      meta: {
        title: 'menu.demo404',
        icon: 'WarningFilled',
        requiresAuth: true,
      },
    },
  ],
}

export default dashboardRoute
