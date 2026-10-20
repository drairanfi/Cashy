import { Skeleton } from '@/components/atoms/skeleton';

interface ListSkeletonProps {
  count?: number;
}

export function ListSkeleton({ count = 4 }: ListSkeletonProps) {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
