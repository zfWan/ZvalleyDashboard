<script setup lang="ts">
import { useRouter } from 'vue-router'
import i18n from '@/locales'
import { useUserStore } from '@/store/modules/user'

const { t } = i18n.global
const router = useRouter()
const userStore = useUserStore()

function goHome() {
  router.replace('/dashboard')
}
function doLogout() {
  userStore.logout(true)
}
</script>

<template>
  <div class="error-page flex-center">
    <div class="error-content text-center">
      <div class="error-code">403</div>
      <h2>{{ t('error.403.title') }}</h2>
      <p class="desc">{{ t('error.403.description') }}</p>
      <div class="actions flex-center gap-3">
        <el-button type="primary" @click="goHome">{{ t('error.403.backHome') }}</el-button>
        <el-button @click="doLogout">{{ t('error.403.logout') }}</el-button>
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
  color: var(--el-color-primary);
  line-height: 1;
}

.desc {
  color: var(--el-text-color-secondary);
  margin-bottom: 24px;
}

.actions {
  justify-content: center;
}
</style>
