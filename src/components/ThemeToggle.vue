<script setup lang="ts">
/**
 * Theme toggle button (REQ-002).
 *
 * Cycle: light -> dark -> system -> light (OQ-3).
 * Icon reflects the "next" mode (REQ-002.3):
 *   light  -> Moon    (next: dark)
 *   dark   -> Sunny   (next: system)
 *   system -> Monitor (next: light) (OQ-4)
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Moon, Sunny, Monitor } from '@element-plus/icons-vue'
import { useAppStore } from '@/store/modules/app'
import { nextThemeMode } from '@/utils/theme'

const appStore = useAppStore()
const { t } = useI18n()

type NextMode = 'light' | 'dark' | 'system'
const nextMode = computed<NextMode>(() => nextThemeMode(appStore.theme))

// Icon shown represents the mode the user will switch into after clicking.
const nextIcon = computed(() => {
  if (nextMode.value === 'dark') return Moon
  if (nextMode.value === 'system') return Sunny
  return Monitor
})

const tooltipKey = computed(() => {
  if (nextMode.value === 'dark') return 'app.themeSwitchToDark'
  if (nextMode.value === 'system') return 'app.themeSwitchToSystem'
  return 'app.themeSwitchToLight'
})

const currentLabelKey = computed(() => {
  if (appStore.theme === 'dark') return 'app.themeDark'
  if (appStore.theme === 'system') return 'app.themeSystem'
  return 'app.themeLight'
})

function handleClick() {
  appStore.toggleTheme()
}
</script>

<template>
  <el-tooltip :content="t(tooltipKey)" placement="bottom">
    <el-button
      class="theme-toggle"
      text
      :aria-label="t(tooltipKey)"
      :title="t(currentLabelKey)"
      @click="handleClick"
    >
      <el-icon :size="18">
        <component :is="nextIcon" />
      </el-icon>
    </el-button>
  </el-tooltip>
</template>

<style scoped lang="scss">
.theme-toggle {
  padding: 6px;
  color: var(--el-text-color-regular);
  border-radius: var(--radius-sm);

  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-fill-color-light);
  }
}
</style>
