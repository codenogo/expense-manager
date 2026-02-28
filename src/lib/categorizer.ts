export interface CategorizationRule {
  id: string
  match_pattern: string
  match_type: 'contains' | 'exact' | 'starts_with'
  category_id: string
  priority: number
}

function matches(description: string, rule: CategorizationRule): boolean {
  const desc = description.toLowerCase()
  const pattern = rule.match_pattern.toLowerCase()

  switch (rule.match_type) {
    case 'contains':
      return desc.includes(pattern)
    case 'exact':
      return desc === pattern
    case 'starts_with':
      return desc.startsWith(pattern)
    default:
      return false
  }
}

export function categorize(description: string, rules: CategorizationRule[]): string | null {
  const sorted = [...rules].sort((a, b) => b.priority - a.priority)

  for (const rule of sorted) {
    if (matches(description, rule)) {
      return rule.category_id
    }
  }

  return null
}
