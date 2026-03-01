export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-muted rounded w-48" />
        <div className="h-4 bg-muted rounded w-16" />
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="h-3 bg-muted rounded w-16 mb-3" />
          <div className="h-6 bg-muted rounded w-24" />
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="h-3 bg-muted rounded w-16 mb-3" />
          <div className="h-6 bg-muted rounded w-24" />
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="h-3 bg-muted rounded w-16 mb-3" />
          <div className="h-6 bg-muted rounded w-24" />
        </div>
      </div>

      {/* Chart skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 h-52" />
        <div className="bg-card rounded-xl border border-border p-6 h-52" />
      </div>

      {/* Category + bills skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 h-48" />
        <div className="bg-card rounded-xl border border-border p-6 h-48" />
      </div>

      {/* Recent transactions skeleton */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-3">
        <div className="h-4 bg-muted rounded w-32" />
        <div className="h-8 bg-muted/50 rounded" />
        <div className="h-8 bg-muted/50 rounded" />
        <div className="h-8 bg-muted/50 rounded" />
        <div className="h-8 bg-muted/50 rounded" />
      </div>
    </div>
  )
}
