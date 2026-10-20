import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <span aria-hidden className={cn('block animate-pulse rounded-md bg-muted', className)} />;
}
