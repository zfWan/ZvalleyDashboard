import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import i18n, { setI18nLanguage } from './locales'
import { setupDirectives } from './directives'

// UnoCSS (must be imported before app styles)
import 'virtual:uno.css'
// NProgress base css (colors overridden in src/styles/nprogress.scss)
import 'nprogress/nprogress.css'
// Global app styles (reset + variables + transitions + nprogress overrides)
import '@/styles/index.scss'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)
setupDirectives(app)

// Sync persisted locale into i18n before mount so first render uses the saved language.
import { useAppStore } from '@/store/modules/app'
const appStore = useAppStore()
setI18nLanguage(appStore.locale)

router.isReady().then(() => {
  app.mount('#app')
})
