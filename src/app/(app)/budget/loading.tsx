export default function BudgetLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-muted rounded w-24" />
        <div className="h-9 bg-muted rounded w-32" />
      </div>

      {/* Budget cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-4 bg-muted rounded w-16" />
            </div>
            <div className="h-2 bg-muted/50 rounded-full">
              <div className="h-2 bg-muted rounded-full w-1/2" />
            </div>
            <div className="h-3 bg-muted rounded w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}
