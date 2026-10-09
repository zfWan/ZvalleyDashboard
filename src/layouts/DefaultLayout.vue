<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessageBox } from 'element-plus'
import { HomeFilled, Lock, WarningFilled, Fold, Expand, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { setI18nLanguage } from '@/locales'
import i18n from '@/locales'

const SIDEBAR_WIDTH = '220px'
const SIDEBAR_COLLAPSED_WIDTH = '64px'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()
const { t } = i18n.global

const { sidebarCollapsed, locale } = storeToRefs(appStore)
const { username } = storeToRefs(userStore)

const sidebarWidth = computed(() =>
  sidebarCollapsed.value ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
)

// Build side menu from routes that have a title and are not hidden
const menuRoutes = computed(() => {
  const root = router.getRoutes().find((r) => r.path === '/')
  if (!root?.children) return []
  return root.children
    .filter((c) => c.meta?.title && !c.meta?.hidden)
    .map((c) => ({
      path: c.path,
      fullPath: c.path.startsWith('/') ? c.path : `/${c.path}`,
      title: t(c.meta?.title as string),
      icon: iconMap[(c.meta?.icon as string) || ''] || HomeFilled,
    }))
})

const iconMap: Record<string, unknown> = {
  HomeFilled,
  Lock,
  WarningFilled,
}

const activeMenu = computed(() => route.path)

const breadcrumbs = computed(() =>
  route.matched
    .filter((m) => m.meta?.title)
    .map((m) => ({ path: m.path, title: t(m.meta?.title as string) })),
)

function handleSelect(key: string) {
  if (key === route.path) return
  router.push(key)
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm(t('app.confirmLogout'), t('app.tip'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning',
    })
    userStore.logout(true)
  } catch {
    // user cancelled
  }
}

function handleLocaleChange(lang: 'zh-CN' | 'en-US') {
  appStore.setLocale(lang)
  setI18nLanguage(lang)
}

function handleCommand(cmd: string) {
  if (cmd === 'logout') handleLogout()
}
</script>

<template>
  <el-container class="default-layout" style="height: 100vh">
    <el-aside :width="sidebarWidth" class="sidebar">
      <div class="logo flex-center">
        <span v-if="!sidebarCollapsed">{{ t('app.title') }}</span>
        <span v-else>ZV</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="sidebarCollapsed"
        class="sidebar-menu"
        background-color="#001529"
        text-color="#ccc"
        active-text-color="#fff"
        router
        @select="handleSelect"
      >
        <el-menu-item v-for="item in menuRoutes" :key="item.fullPath" :index="item.fullPath">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header flex-between">
        <div class="header-left flex items-center gap-3">
          <el-icon class="collapse-btn" @click="appStore.toggleSidebar()">
            <Fold v-if="!sidebarCollapsed" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="b in breadcrumbs" :key="b.path">
              {{ b.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right flex items-center gap-4">
          <el-dropdown trigger="click" @command="handleLocaleChange">
            <span class="cursor-pointer flex items-center gap-1">
              {{ locale === 'zh-CN' ? '中文' : 'English' }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
                <el-dropdown-item command="en-US">English</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="cursor-pointer flex items-center gap-1">
              <el-avatar :size="28">{{ username.slice(0, 1).toUpperCase() }}</el-avatar>
              <span>{{ username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">{{ t('app.logout') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.default-layout {
  min-width: $app-min-width;
}

.sidebar {
  background: #001529;
  transition: width 0.25s ease;
  overflow: hidden;
}

.logo {
  height: $header-height;
  color: #fff;
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 1px;
  background: #002140;
}

.sidebar-menu {
  border-right: none;
  height: calc(100vh - #{$header-height});
}

.header {
  height: $header-height;
  background: #fff;
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding: 0 16px;
  box-shadow: 0 1px 4px rgb(0 21 41 / 4%);
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: var(--el-text-color-regular);

  &:hover {
    color: var(--el-color-primary);
  }
}

.main-content {
  background: var(--el-bg-color-page);
  padding: 16px;
}
</style>
