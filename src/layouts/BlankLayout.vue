<script setup lang="ts"></script>

<template>
  <div class="blank-layout">
    <router-view />
  </div>
</template>

<style lang="scss" scoped>
.blank-layout {
  min-height: 100vh;
  width: 100%;
  background: var(--el-bg-color-page);
}
</style>
