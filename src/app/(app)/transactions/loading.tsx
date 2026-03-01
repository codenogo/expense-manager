export default function TransactionsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-muted rounded w-32" />
        <div className="h-9 bg-muted rounded w-28" />
      </div>

      {/* Table skeleton */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="border-b border-border px-4 py-3 flex gap-4">
          <div className="h-4 bg-muted rounded w-16" />
          <div className="h-4 bg-muted rounded w-20" />
          <div className="h-4 bg-muted rounded w-16" />
          <div className="h-4 bg-muted rounded w-24" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-b border-border/50 px-4 py-3 flex gap-4">
            <div className="h-4 bg-muted/50 rounded w-20" />
            <div className="h-4 bg-muted/50 rounded w-16" />
            <div className="h-4 bg-muted/50 rounded w-16" />
            <div className="h-4 bg-muted/50 rounded flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
