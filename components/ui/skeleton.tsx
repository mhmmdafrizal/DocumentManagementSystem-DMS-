function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-radius-md bg-ink-100 dark:bg-ink-200 ${className ?? ""}`} aria-hidden />;
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-9" />
      ))}
    </div>
  );
}