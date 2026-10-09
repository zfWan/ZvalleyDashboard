<script setup lang="ts">
import { useRouter } from 'vue-router'
import i18n from '@/locales'

const { t } = i18n.global
const router = useRouter()

function goHome() {
  router.replace('/dashboard')
}
</script>

<template>
  <div class="error-page flex-center">
    <div class="error-content text-center">
      <div class="error-code">404</div>
      <h2 class="error-title">{{ t('error.404.title') }}</h2>
      <p class="desc">{{ t('error.404.description') }}</p>
      <div class="actions flex-center">
        <el-button type="primary" @click="goHome">{{ t('error.404.backHome') }}</el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-page {
  min-height: 100vh;
  background: var(--el-bg-color-page);
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: var(--el-color-warning);
  line-height: 1;
  letter-spacing: 4px;
}

.error-title {
  margin: 12px 0 8px;
  color: var(--text-primary);
}

.desc {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.actions {
  justify-content: center;
}
</style>
