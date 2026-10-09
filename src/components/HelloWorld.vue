<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
  </div>
</template>

<style scoped>
.hello h1 {
  font-size: 24px;
  color: var(--el-color-primary);
}
</style>
