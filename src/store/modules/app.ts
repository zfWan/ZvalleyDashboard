import { ref } from 'vue'
import { defineStore } from 'pinia'

export type Locale = 'zh-CN' | 'en-US'

export const useAppStore = defineStore(
  'app',
  () => {
    const sidebarCollapsed = ref<boolean>(false)
    const locale = ref<Locale>('zh-CN')

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }
    function setLocale(l: Locale) {
      locale.value = l
    }

    return { sidebarCollapsed, locale, toggleSidebar, setLocale }
  },
  {
    persist: {
      key: 'zvalley_dashboard_app',
      storage: localStorage,
      // pinia-plugin-persistedstate v3 uses `paths` (not `pick`)
      paths: ['sidebarCollapsed', 'locale'],
    },
  },
)
