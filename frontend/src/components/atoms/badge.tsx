import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type BadgeTone = 'danger' | 'warning' | 'success' | 'neutral';

const TONE_CLASSES: Record<BadgeTone, string> = {
  danger: 'bg-expense/10 text-expense',
  warning: 'bg-warning/10 text-warning',
  success: 'bg-income/10 text-income',
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
