/**
 * Tests for src/utils/theme.ts (REQ-001 / REQ-002 / REQ-004 / REQ-005).
 *
 * Covers:
 *  - resolveEffectiveTheme for light/dark/system modes + matchMedia fallback (REQ-001.1/.4)
 *  - nextThemeMode cycling light -> dark -> system -> light (REQ-002.2, OQ-3)
 *  - isValidThemeMode rejecting unknown values (REQ-004 field validation)
 *  - readStoredThemeMode parsing localStorage + graceful fallback (REQ-002.5 / REQ-004)
 *  - applyThemeToDocument setting html[data-theme] + .dark class (REQ-001.2 / REQ-006.2)
 *  - watchSystemTheme subscribing to prefers-color-scheme changes (REQ-001.3)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_THEME_MODE,
  THEME_STORAGE_KEY,
  applyThemeToDocument,
  isValidThemeMode,
  nextThemeMode,
  readStoredThemeMode,
  resolveEffectiveTheme,
  watchSystemTheme,
} from '@/utils/theme'

describe('theme utils', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.classList.remove('dark')
    vi.restoreAllMocks()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // --- resolveEffectiveTheme ---
  describe('resolveEffectiveTheme', () => {
    it('returns light when mode is "light"', () => {
      expect(resolveEffectiveTheme('light')).toBe('light')
    })

    it('returns dark when mode is "dark"', () => {
      expect(resolveEffectiveTheme('dark')).toBe('dark')
    })

    it('follows prefers-color-scheme in system mode (REQ-001.3)', () => {
      vi.spyOn(window, 'matchMedia').mockImplementation(
        (query) =>
          ({
            matches: query === '(prefers-color-scheme: dark)',
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            onchange: null,
            dispatchEvent: vi.fn(),
          }) as unknown as MediaQueryList,
      )
      expect(resolveEffectiveTheme('system')).toBe('dark')

      vi.spyOn(window, 'matchMedia').mockImplementation(
        (query) =>
          ({
            matches: false,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            onchange: null,
            dispatchEvent: vi.fn(),
          }) as unknown as MediaQueryList,
      )
      expect(resolveEffectiveTheme('system')).toBe('light')
    })

    it('degrades to light when matchMedia is unsupported (REQ-001.4)', () => {
      const originalMatchMedia = window.matchMedia
      // @ts-expect-error simulate unsupported env
      delete window.matchMedia
      expect(resolveEffectiveTheme('system')).toBe('light')
      window.matchMedia = originalMatchMedia
    })
  })

  // --- nextThemeMode ---
  describe('nextThemeMode (REQ-002.2, OQ-3)', () => {
    it('cycles light -> dark -> system -> light', () => {
      expect(nextThemeMode('light')).toBe('dark')
      expect(nextThemeMode('dark')).toBe('system')
      expect(nextThemeMode('system')).toBe('light')
    })
  })

  // --- isValidThemeMode ---
  describe('isValidThemeMode', () => {
    it('accepts the three valid modes', () => {
      expect(isValidThemeMode('light')).toBe(true)
      expect(isValidThemeMode('dark')).toBe(true)
      expect(isValidThemeMode('system')).toBe(true)
    })
    it('rejects unknown / invalid values', () => {
      expect(isValidThemeMode('auto')).toBe(false)
      expect(isValidThemeMode('')).toBe(false)
      expect(isValidThemeMode(null)).toBe(false)
      expect(isValidThemeMode(undefined)).toBe(false)
      expect(isValidThemeMode(1)).toBe(false)
    })
  })

  // --- readStoredThemeMode ---
  describe('readStoredThemeMode (REQ-004 / REQ-002.5)', () => {
    it('returns default (system) when nothing is stored (REQ-004.5, OQ-1)', () => {
      expect(readStoredThemeMode()).toBe(DEFAULT_THEME_MODE)
    })

    it('reads a valid persisted theme', () => {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ theme: 'dark' }))
      expect(readStoredThemeMode()).toBe('dark')
    })

    it('falls back to default when stored value is invalid', () => {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ theme: 'holiday' }))
      expect(readStoredThemeMode()).toBe(DEFAULT_THEME_MODE)
    })

    it('falls back to default when JSON is corrupt (privacy / storage edge)', () => {
      localStorage.setItem(THEME_STORAGE_KEY, '{not-json')
      expect(readStoredThemeMode()).toBe(DEFAULT_THEME_MODE)
    })
  })

  // --- applyThemeToDocument ---
  describe('applyThemeToDocument (REQ-001.2 / REQ-006.2)', () => {
    it('sets data-theme="dark" and adds .dark class', () => {
      applyThemeToDocument('dark')
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('sets data-theme="light" and removes .dark class', () => {
      document.documentElement.classList.add('dark')
      applyThemeToDocument('light')
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  // --- watchSystemTheme ---
  describe('watchSystemTheme (REQ-001.3)', () => {
    it('invokes handler with dark/light when prefers-color-scheme changes', () => {
      const listeners = new Set<(ev: { matches: boolean }) => void>()
      const mql = {
        matches: false,
        addEventListener: vi.fn((_ev: string, cb: any) => listeners.add(cb)),
        removeEventListener: vi.fn((_ev: string, cb: any) => listeners.delete(cb)),
      }
      vi.spyOn(window, 'matchMedia').mockReturnValue(mql as unknown as MediaQueryList)

      const handler = vi.fn()
      const unsub = watchSystemTheme(handler)

      expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
      // Simulate OS switching to dark
      listeners.forEach((cb) => cb({ matches: true } as MediaQueryListEvent))
      expect(handler).toHaveBeenLastCalledWith('dark')
      // Simulate OS switching back to light
      listeners.forEach((cb) => cb({ matches: false } as MediaQueryListEvent))
      expect(handler).toHaveBeenLastCalledWith('light')

      unsub()
      expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })
})
