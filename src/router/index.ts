import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import dashboardRoute from './modules/dashboard'
import loginRoute from './modules/login'
import errorRoute from './modules/error'
import { setupGuards } from './guard'

const routes: RouteRecordRaw[] = [dashboardRoute, loginRoute, ...errorRoute]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

setupGuards(router)

export default router
