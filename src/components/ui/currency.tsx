export function formatKES(cents: number): string {
  const amount = cents / 100
  const formatted = new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))
  return `${cents < 0 ? '-' : ''}KES ${formatted}`
}

interface CurrencyProps {
  amount: number
}

export function Currency({ amount }: CurrencyProps) {
  return <span>{formatKES(amount)}</span>
}
