export function SkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="card p-0 overflow-hidden">
      {/* image */}
      <div className={`skeleton w-full ${compact ? "h-28" : "h-40"}`} />
      <div className="p-3 flex flex-col gap-2">
        {/* tags */}
        <div className="skeleton h-4 w-16 rounded-full" />
        {/* name */}
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        {/* price */}
        <div className="skeleton h-5 w-24 rounded mt-1" />
        {/* moq */}
        <div className="skeleton h-3 w-16 rounded" />
        {/* button */}
        <div className="skeleton h-9 w-full rounded-xl mt-1" />
      </div>
    </div>
  );
}
