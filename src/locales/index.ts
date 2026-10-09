import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'
import type { Locale } from '@/store/modules/app'

export const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
} as const

export const SUPPORTED_LOCALES: Locale[] = ['zh-CN', 'en-US']

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages,
})

export function setI18nLanguage(lang: Locale) {
  i18n.global.locale.value = lang
  document.documentElement.setAttribute('lang', lang)
}

export default i18n
