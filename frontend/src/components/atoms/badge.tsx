import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type BadgeTone = 'danger' | 'warning' | 'success' | 'neutral';

const TONE_CLASSES: Record<BadgeTone, string> = {
  danger: 'bg-rose-100 text-rose-700',
  warning: 'bg-amber-100 text-amber-700',
  success: 'bg-emerald-100 text-emerald-700',
  neutral: 'bg-muted text-muted-foreground'
};

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
