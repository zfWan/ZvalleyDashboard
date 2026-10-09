<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import i18n from '@/locales'
import { getStatistics } from '@/api/dashboard'
import type { Statistics } from '@/types'

const { t } = i18n.global

const loading = ref(false)
const stats = ref<Statistics>({ users: 0, orders: 0, revenue: 0, visits: 0 })

async function loadStats() {
  loading.value = true
  try {
    stats.value = await getStatistics()
  } catch {
    ElMessage.error(t('dashboard.apiFailed'))
  } finally {
    loading.value = false
  }
}

onMounted(loadStats)

function onAdminClick() {
  ElMessage.success('你拥有 admin 权限，看到了这个按钮')
}
function onNormalClick() {
  ElMessage.info(t('dashboard.normalButton'))
}

function fmt(n: number) {
  return n.toLocaleString('en-US')
}
</script>

<template>
  <div class="dashboard">
    <h2 class="welcome">
      {{ t('dashboard.welcome', { name: t('app.title') }) }}
    </h2>
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="24" :md="12" :xl="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic :title="t('dashboard.users')" :value="stats.users" :formatter="fmt" />
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12" :xl="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic :title="t('dashboard.orders')" :value="stats.orders" :formatter="fmt" />
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12" :xl="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic :title="t('dashboard.revenue')" :value="stats.revenue" :formatter="fmt" />
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12" :xl="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic :title="t('dashboard.visits')" :value="stats.visits" :formatter="fmt" />
        </el-card>
      </el-col>
    </el-row>

    <el-card class="demo-card" shadow="never">
      <template #header>
        <div class="flex-between">
          <span>Demo</span>
          <el-button type="primary" :loading="loading" @click="loadStats">
            {{ t('dashboard.apiDemo') }}
          </el-button>
        </div>
      </template>
      <div class="flex gap-3">
        <el-button @click="onNormalClick">{{ t('dashboard.normalButton') }}</el-button>
        <el-button v-permission="['admin']" type="success" @click="onAdminClick">
          {{ t('dashboard.adminButton') }}
        </el-button>
      </div>
      <p class="tip">
        v-permission 示例：当你以用户名 <code>admin</code> 登录时，会看到"管理员按钮"；
        以其他用户名登录时该按钮被移除。
      </p>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  .welcome {
    margin: 0 0 16px;
    font-size: 22px;
    color: var(--el-text-color-primary);
  }

  .stat-row {
    margin-bottom: 16px;
  }

  .stat-card {
    margin-bottom: 16px;
  }

  .tip {
    margin-top: 16px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }
}
</style>
