import { describe, it, expect } from 'vitest'
import { parseCSV, detectHeaders, parseAmount, parseDate } from '@/lib/csv-parser'

describe('parseCSV', () => {
  it('parses basic CSV with headers', () => {
    const csv =
      'Date,Amount,Description\n2024-01-15,1500.00,Grocery Store\n2024-01-16,-200.50,Restaurant'
    const result = parseCSV(csv)
    expect(result.headers).toEqual(['Date', 'Amount', 'Description'])
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toEqual(['2024-01-15', '1500.00', 'Grocery Store'])
  })

  it('handles quoted fields with commas', () => {
    const csv = 'Date,Amount,Description\n2024-01-15,1500.00,"Nairobi, Kenya Store"'
    const result = parseCSV(csv)
    expect(result.rows[0][2]).toBe('Nairobi, Kenya Store')
  })

  it('handles empty lines', () => {
    const csv = 'Date,Amount\n2024-01-15,100\n\n2024-01-16,200\n'
    const result = parseCSV(csv)
    expect(result.rows).toHaveLength(2)
  })
})

describe('parseAmount', () => {
  it('parses positive amounts', () => {
    expect(parseAmount('1500.00')).toBe(150000)
  })
  it('parses negative amounts', () => {
    expect(parseAmount('-200.50')).toBe(-20050)
  })
  it('parses amounts with commas', () => {
    expect(parseAmount('1,500.00')).toBe(150000)
  })
  it('parses parenthesized amounts as negative', () => {
    expect(parseAmount('(500.00)')).toBe(-50000)
  })
  it('returns 0 for empty/invalid', () => {
    expect(parseAmount('')).toBe(0)
    expect(parseAmount('abc')).toBe(0)
  })
})

describe('parseDate', () => {
  it('parses YYYY-MM-DD', () => {
    expect(parseDate('2024-01-15')).toBe('2024-01-15')
  })
  it('parses DD/MM/YYYY', () => {
    expect(parseDate('15/01/2024')).toBe('2024-01-15')
  })
  it('parses MM/DD/YYYY', () => {
    expect(parseDate('01/15/2024')).toBe('2024-01-15')
  })
  it('returns null for invalid', () => {
    expect(parseDate('not-a-date')).toBeNull()
  })
})

describe('detectHeaders', () => {
  it('detects date, amount, and description columns', () => {
    const row = ['Date', 'Amount', 'Description']
    const result = detectHeaders(row)
    expect(result).not.toBeNull()
    expect(result?.date).toBe(0)
    expect(result?.amount).toBe(1)
    expect(result?.description).toBe(2)
  })

  it('detects case-insensitive header names', () => {
    const row = ['date', 'amount', 'description']
    const result = detectHeaders(row)
    expect(result).not.toBeNull()
  })

  it('returns null when required columns are missing', () => {
    const row = ['foo', 'bar', 'baz']
    const result = detectHeaders(row)
    expect(result).toBeNull()
  })

  it('handles alternative header names', () => {
    const row = ['Transaction Date', 'Debit', 'Narration']
    const result = detectHeaders(row)
    expect(result).not.toBeNull()
  })
})
