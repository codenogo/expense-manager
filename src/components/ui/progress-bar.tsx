interface ProgressBarProps {
  value: number
  max: number
  className?: string
}

export function ProgressBar({ value, max, className }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0

  let fillColor: string
  if (percentage < 75) {
    fillColor = 'bg-emerald-500'
  } else if (percentage <= 90) {
    fillColor = 'bg-amber-500'
  } else {
    fillColor = 'bg-red-500'
  }

  return (
    <div className={`bg-muted rounded-full h-2 ${className ?? ''}`}>
      <div
        className={`${fillColor} h-2 rounded-full transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
