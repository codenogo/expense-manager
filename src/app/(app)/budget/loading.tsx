export default function BudgetLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-slate-200 rounded w-24" />
        <div className="h-9 bg-slate-200 rounded w-32" />
      </div>

      {/* Budget cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-slate-200 rounded w-24" />
              <div className="h-4 bg-slate-200 rounded w-16" />
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div className="h-2 bg-slate-200 rounded-full w-1/2" />
            </div>
            <div className="h-3 bg-slate-200 rounded w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}
