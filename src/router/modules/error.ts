import type { RouteRecordRaw } from 'vue-router'

const errorRoute: RouteRecordRaw[] = [
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/layouts/BlankLayout.vue'),
    meta: { title: 'error.403.title', hidden: true },
    children: [
      {
        path: '',
        name: 'ForbiddenPage',
        component: () => import('@/views/error/403.vue'),
        meta: { title: 'error.403.title' },
      },
    ],
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/layouts/BlankLayout.vue'),
    meta: { title: 'error.404.title', hidden: true },
    children: [
      {
        path: '',
        name: 'NotFoundPage',
        component: () => import('@/views/error/404.vue'),
        meta: { title: 'error.404.title' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: { hidden: true },
  },
]

export default errorRoute
