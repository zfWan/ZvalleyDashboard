<script setup lang="ts">
/**
 * Blank layout — used by login / error pages.
 * Hosts a ThemeToggle in the top-right corner (REQ-002.1 / REQ-007.1 / TR-13)
 * so visitors not yet signed in can still switch themes.
 */
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>

<template>
  <div class="blank-layout">
    <div class="blank-layout__tools">
      <ThemeToggle />
    </div>
    <router-view />
  </div>
</template>

<style lang="scss" scoped>
.blank-layout {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: var(--el-bg-color-page);
}

.blank-layout__tools {
  position: absolute;
  top: 16px;
  right: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: var(--radius-md);
  background-color: rgb(255 255 255 / 35%);
  backdrop-filter: saturate(160%) blur(6px);

  [data-theme='dark'] & {
    background-color: rgb(0 0 0 / 25%);
  }
}
</style>
