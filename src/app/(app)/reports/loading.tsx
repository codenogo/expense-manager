export default function ReportsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-24" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="h-4 bg-slate-200 rounded w-40 mb-4" />
          <div className="h-[280px] bg-slate-100 rounded" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="h-4 bg-slate-200 rounded w-40 mb-4" />
          <div className="h-[280px] bg-slate-100 rounded" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="h-4 bg-slate-200 rounded w-36 mb-4" />
        <div className="h-[320px] bg-slate-100 rounded" />
      </div>
    </div>
  )
}
