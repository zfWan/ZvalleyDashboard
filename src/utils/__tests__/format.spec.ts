import { describe, expect, it } from 'vitest'
import { formatNumber, capitalize, mask } from '@/utils/format'

describe('format helpers', () => {
  it('formatNumber adds thousands separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(NaN)).toBe('0')
  })

  it('capitalize uppercases the first letter', () => {
    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('')).toBe('')
  })

  it('mask hides all but the tail', () => {
    expect(mask('abcdefgh', 4)).toBe('****efgh')
    expect(mask('abc')).toBe('***')
  })
})
