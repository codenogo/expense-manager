import { describe, it, expect } from 'vitest'
import { categorize, type CategorizationRule } from '@/lib/categorizer'

const rules: CategorizationRule[] = [
  { id: '1', match_pattern: 'Safaricom', match_type: 'contains', category_id: 'telecom', priority: 0 },
  { id: '2', match_pattern: 'KPLC', match_type: 'exact', category_id: 'utilities', priority: 0 },
  { id: '3', match_pattern: 'Uber', match_type: 'starts_with', category_id: 'transport', priority: 0 },
  { id: '4', match_pattern: 'Safaricom Fiber', match_type: 'exact', category_id: 'internet', priority: 10 },
]

describe('categorize', () => {
  it('matches contains pattern', () => {
    expect(categorize('Payment to Safaricom Ltd', rules)).toBe('telecom')
  })

  it('matches exact pattern', () => {
    expect(categorize('KPLC', rules)).toBe('utilities')
  })

  it('does not match exact when partial', () => {
    expect(categorize('KPLC Bill Payment', rules)).not.toBe('utilities')
  })

  it('matches starts_with pattern', () => {
    expect(categorize('Uber Trip #1234', rules)).toBe('transport')
  })

  it('does not match starts_with from middle', () => {
    expect(categorize('Pay Uber', rules)).not.toBe('transport')
  })

  it('returns null when no match', () => {
    expect(categorize('Random Store', rules)).toBeNull()
  })

  it('is case-insensitive', () => {
    expect(categorize('safaricom top-up', rules)).toBe('telecom')
  })

  it('respects priority (higher priority wins)', () => {
    expect(categorize('Safaricom Fiber', rules)).toBe('internet')
  })
})
