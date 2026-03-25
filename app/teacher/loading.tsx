import { SkeletonCard } from "@/components/SkeletonLoader";

export default function Loading() {
  return (
    <div className="py-8">
      <div className="h-8 bg-slate-200 rounded w-48 mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
