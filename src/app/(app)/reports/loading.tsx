export default function ReportsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      <div className="h-6 bg-muted rounded w-24" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="h-4 bg-muted rounded w-40 mb-4" />
          <div className="h-[280px] bg-muted/50 rounded" />
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="h-4 bg-muted rounded w-40 mb-4" />
          <div className="h-[280px] bg-muted/50 rounded" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="h-4 bg-muted rounded w-36 mb-4" />
        <div className="h-[320px] bg-muted/50 rounded" />
      </div>
    </div>
  )
}
