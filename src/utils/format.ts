/**
 * Lightweight formatting helpers used by the dashboard demo.
 */

/** Format a number as an approximate count with thousands separators. */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0'
  return value.toLocaleString('en-US')
}

/** Uppercase the first letter of a string. */
export function capitalize(value: string): string {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** Simple mask for sensitive strings (e.g. token preview). */
export function mask(value: string, visible = 4): string {
  if (!value) return ''
  if (value.length <= visible) return '*'.repeat(value.length)
  return '*'.repeat(value.length - visible) + value.slice(-visible)
}
