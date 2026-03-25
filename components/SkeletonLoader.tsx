export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-100 rounded w-full"></div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-slate-200 h-12 rounded animate-pulse"></div>
      ))}
    </div>
  );
}

export function SkeletonButton() {
  return <div className="h-10 bg-slate-200 rounded animate-pulse w-32"></div>;
}
