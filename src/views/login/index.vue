<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import i18n, { setI18nLanguage } from '@/locales'
import type { Locale } from '@/store/modules/app'

const { t } = i18n.global
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const loading = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  username: 'admin',
  password: '123456',
  remember: true,
})

const rules = computed<FormRules>(() => ({
  username: [
    { required: true, message: t('login.usernameRequired'), trigger: 'blur' },
    { min: 3, max: 20, message: t('login.usernameLength'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
    { min: 6, max: 20, message: t('login.passwordLength'), trigger: 'blur' },
  ],
}))

async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await userStore.login({
      username: form.username,
      password: form.password,
      remember: form.remember,
    })
    ElMessage.success(t('login.loginSuccess'))
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.replace(redirect)
  } catch (err) {
    const msg = err instanceof Error ? err.message : t('login.loginFailed')
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}

function switchLocale(l: Locale) {
  appStore.setLocale(l)
  setI18nLanguage(l)
}
</script>

<template>
  <div class="login-container flex-center">
    <el-card class="login-card" shadow="always">
      <template #header>
        <div class="flex-between">
          <h2 class="title">{{ t('login.title') }}</h2>
          <el-dropdown trigger="click" @command="switchLocale">
            <span class="locale-btn"> 🌐 {{ appStore.locale === 'zh-CN' ? '中文' : 'EN' }} </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
                <el-dropdown-item command="en-US">English</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleSubmit"
      >
        <el-form-item :label="t('login.username')" prop="username">
          <el-input v-model="form.username" :placeholder="t('login.usernamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('login.password')" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="t('login.passwordPlaceholder')"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.remember">{{ t('login.remember') }}</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="w-full" :loading="loading" @click="handleSubmit">
            {{ t('login.submit') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1677ff 0%, #69b1ff 100%);
}

.login-card {
  width: 400px;
  border-radius: 8px;
}

.title {
  margin: 0;
  font-size: 20px;
}

.locale-btn {
  cursor: pointer;
  font-size: 14px;
  color: var(--el-color-primary);
}
</style>
