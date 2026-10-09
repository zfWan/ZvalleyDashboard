/**
 * Theme utilities shared by the FOUC inline script (mirror logic),
 * the Pinia app store and the ThemeToggle component.
 *
 * Modes: 'light' | 'dark' | 'system' (OQ-1 default: system).
 * Effective theme: 'light' | 'dark' — resolved from mode + matchMedia.
 * Storage key is the same as pinia-plugin-persistedstate's key so the
 * inline IIFE in index.html and the runtime store stay in sync (REQ-005.2).
 */

export type ThemeMode = 'light' | 'dark' | 'system'
export type EffectiveTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'zvalley_dashboard_app'
export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system']
export const DEFAULT_THEME_MODE: ThemeMode = 'system'

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

function supportsMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
}

export function resolveEffectiveTheme(mode: ThemeMode): EffectiveTheme {
  if (mode === 'light') return 'light'
  if (mode === 'dark') return 'dark'
  // system mode (REQ-001.4: degrade to light when matchMedia unsupported)
  if (!supportsMatchMedia()) return 'light'
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light'
}

export function isValidThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (THEME_MODES as string[]).includes(value)
}

/**
 * Read persisted theme mode synchronously. Tolerates localStorage being
 * unavailable (e.g. private browsing) — falls back to the default (REQ-002.5).
 */
export function readStoredThemeMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (!raw) return DEFAULT_THEME_MODE
    const parsed = JSON.parse(raw) as { theme?: unknown }
    if (isValidThemeMode(parsed?.theme)) return parsed.theme
    return DEFAULT_THEME_MODE
  } catch {
    return DEFAULT_THEME_MODE
  }
}

/**
 * Apply the resolved effective theme to <html>: set data-theme and toggle
 * the .dark class (which activates element-plus/theme-chalk/dark/css-vars.css).
 */
export function applyThemeToDocument(effective: EffectiveTheme): void {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  html.setAttribute('data-theme', effective)
  if (effective === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}

/**
 * Cycle light -> dark -> system -> light (REQ-002.2, OQ-3).
 */
export function nextThemeMode(current: ThemeMode): ThemeMode {
  const order: ThemeMode[] = ['light', 'dark', 'system']
  const idx = order.indexOf(current)
  return order[(idx + 1) % order.length]
}

/**
 * Subscribe to prefers-color-scheme changes. Returns an unsubscribe fn.
 * Returns a no-op unsubscribe when matchMedia is unsupported.
 */
export function watchSystemTheme(handler: (effective: EffectiveTheme) => void): () => void {
  if (!supportsMatchMedia()) return () => {}
  const mql = window.matchMedia(DARK_MEDIA_QUERY)
  const onChange = () => {
    handler(mql.matches ? 'dark' : 'light')
  }
  // Safari < 14 uses addListener; modern browsers use addEventListener.
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', onChange)
  } else {
    // Legacy Safari — loosely typed to avoid DOM-lib version mismatch.

    ;(mql as any).addListener(onChange)
  }
  return () => {
    if (typeof mql.removeEventListener === 'function') {
      mql.removeEventListener('change', onChange)
    } else {
      ;(mql as any).removeListener(onChange)
    }
  }
}
