import { Skeleton } from '@/components/atoms/Skeleton';

interface ListSkeletonProps {
  count?: number;
  className?: string;
}

export function ListSkeleton({ count = 3, className = 'section__list' }: ListSkeletonProps) {
  return (
    <div className={className} aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="item-card">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}
