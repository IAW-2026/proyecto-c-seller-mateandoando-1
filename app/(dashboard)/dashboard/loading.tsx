//app/(dashboard)/dashboard/loading.tsx

export default function DashboardLoading() {
  return (
    <div className="w-full max-w-6xl pb-12 animate-pulse">
      {/* Título Skeleton */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="h-10 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="h-6 bg-slate-200 rounded w-96"></div>
        </div>
        <div className="h-12 bg-slate-200 rounded-xl w-48"></div>
      </div>

      {/* Tarjetas Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-40">
            <div className="h-4 bg-slate-200 rounded w-32 mb-6"></div>
            <div className="h-10 bg-slate-200 rounded w-16 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-24"></div>
          </div>
        ))}
      </div>

      {/* Historial Skeleton */}
      <div className="h-8 bg-slate-200 rounded w-64 mb-6"></div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 h-64"></div>
    </div>
  );
}