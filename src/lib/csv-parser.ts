export interface ParsedCSV {
  headers: string[]
  rows: string[][]
}

export function parseCSV(content: string): ParsedCSV {
  const lines = content.split('\n')
  const nonEmptyLines = lines.filter((line) => line.trim() !== '')

  if (nonEmptyLines.length === 0) {
    return { headers: [], rows: [] }
  }

  const headers = parseCSVLine(nonEmptyLines[0])
  const rows = nonEmptyLines.slice(1).map(parseCSVLine)

  return { headers, rows }
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }

  fields.push(current)
  return fields
}

export function parseAmount(value: string): number {
  if (!value || value.trim() === '') return 0

  let str = value.trim()

  // Handle parenthesized negative amounts like (500.00)
  const isNegativeParens = str.startsWith('(') && str.endsWith(')')
  if (isNegativeParens) {
    str = str.slice(1, -1)
  }

  // Remove commas used as thousands separators
  str = str.replace(/,/g, '')

  const num = parseFloat(str)
  if (isNaN(num)) return 0

  const cents = Math.round(Math.abs(num) * 100)
  const sign = isNegativeParens || num < 0 ? -1 : 1

  return sign * cents
}

export function parseDate(value: string): string | null {
  if (!value || value.trim() === '') return null

  const str = value.trim()

  // YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    const date = new Date(`${year}-${month}-${day}`)
    if (!isNaN(date.getTime())) {
      return `${year}-${month}-${day}`
    }
    return null
  }

  // DD/MM/YYYY or MM/DD/YYYY
  const slashMatch = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (slashMatch) {
    const [, first, second, year] = slashMatch
    const firstNum = parseInt(first, 10)
    const secondNum = parseInt(second, 10)

    // If first number > 12, it must be DD/MM/YYYY
    if (firstNum > 12) {
      return `${year}-${second}-${first}`
    }

    // If second number > 12, it must be MM/DD/YYYY
    if (secondNum > 12) {
      return `${year}-${first}-${second}`
    }

    // Ambiguous — default to DD/MM/YYYY
    return `${year}-${second}-${first}`
  }

  return null
}

const DATE_KEYWORDS = ['date', 'transaction date', 'trans date', 'posted date', 'value date']
const AMOUNT_KEYWORDS = ['amount', 'debit', 'credit', 'sum', 'value']
const DESCRIPTION_KEYWORDS = ['description', 'narration', 'details', 'memo', 'notes', 'reference']

export function detectHeaders(row: string[]): Record<string, number> | null {
  const lower = row.map((h) => h.toLowerCase().trim())

  let dateIdx = -1
  let amountIdx = -1
  let descriptionIdx = -1

  lower.forEach((h, i) => {
    if (dateIdx === -1 && DATE_KEYWORDS.some((kw) => h.includes(kw))) {
      dateIdx = i
    }
    if (amountIdx === -1 && AMOUNT_KEYWORDS.some((kw) => h.includes(kw))) {
      amountIdx = i
    }
    if (descriptionIdx === -1 && DESCRIPTION_KEYWORDS.some((kw) => h.includes(kw))) {
      descriptionIdx = i
    }
  })

  if (dateIdx === -1 || amountIdx === -1) return null

  return {
    date: dateIdx,
    amount: amountIdx,
    description: descriptionIdx === -1 ? -1 : descriptionIdx,
  }
}
