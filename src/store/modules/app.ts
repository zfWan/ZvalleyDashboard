import { ref, computed, watch, onScopeDispose } from 'vue'
import { defineStore } from 'pinia'
import {
  DEFAULT_THEME_MODE,
  applyThemeToDocument,
  nextThemeMode,
  readStoredThemeMode,
  resolveEffectiveTheme,
  watchSystemTheme,
  type EffectiveTheme,
  type ThemeMode,
} from '@/utils/theme'

export type Locale = 'zh-CN' | 'en-US'

export const useAppStore = defineStore(
  'app',
  () => {
    const sidebarCollapsed = ref<boolean>(false)
    const locale = ref<Locale>('zh-CN')
    // REQ-004.1 default theme is 'system' (OQ-1 option a).
    // Initialize from localStorage synchronously so the first reactive update
    // after mount does not flash from system -> stored value.
    const theme = ref<ThemeMode>(
      typeof window !== 'undefined' ? readStoredThemeMode() : DEFAULT_THEME_MODE,
    )

    // Derived effective theme (light/dark), used by components if they need
    // to branch on visuals that can't be expressed via CSS alone.
    const effectiveTheme = computed<EffectiveTheme>(() => resolveEffectiveTheme(theme.value))

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }
    function setLocale(l: Locale) {
      locale.value = l
    }
    function setTheme(mode: ThemeMode) {
      theme.value = mode
    }
    function toggleTheme() {
      theme.value = nextThemeMode(theme.value)
    }

    // Apply <html data-theme=""> and .dark class whenever effectiveTheme changes.
    function syncThemeToDom() {
      applyThemeToDocument(effectiveTheme.value)
    }
    syncThemeToDom()
    const stopWatch = watch(effectiveTheme, syncThemeToDom, { flush: 'sync' })

    // REQ-001.3: in system mode, re-resolve when OS preference changes.
    let stopMediaWatch: (() => void) | null = null
    function startOrStopMediaWatch() {
      if (theme.value === 'system') {
        if (!stopMediaWatch) {
          stopMediaWatch = watchSystemTheme(() => {
            // Trigger re-computation by nudging the ref; effectiveTheme will
            // recompute and the watch above will apply to DOM.
            // eslint-disable-next-line no-self-assign
            theme.value = theme.value
          })
        }
      } else if (stopMediaWatch) {
        stopMediaWatch()
        stopMediaWatch = null
      }
    }
    startOrStopMediaWatch()
    watch(theme, startOrStopMediaWatch, { flush: 'sync' })

    onScopeDispose(() => {
      stopWatch()
      if (stopMediaWatch) stopMediaWatch()
    })

    return {
      sidebarCollapsed,
      locale,
      theme,
      effectiveTheme,
      toggleSidebar,
      setLocale,
      setTheme,
      toggleTheme,
    }
  },
  {
    persist: {
      key: 'zvalley_dashboard_app',
      storage: localStorage,
      // REQ-004.3 persist 'theme' alongside existing keys (no new top-level key).
      paths: ['sidebarCollapsed', 'locale', 'theme'],
    },
  },
)
