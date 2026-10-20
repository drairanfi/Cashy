import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format.util';

export type StatTone = 'emerald' | 'rose' | 'sky';

const TONE_CLASSES: Record<StatTone, string> = {
  emerald: 'bg-income/10 text-income',
  rose: 'bg-expense/10 text-expense',
  sky: 'bg-info/10 text-info'
};

interface StatCardProps {
  label: string;
  amount: number;
  icon: ReactNode;
  tone: StatTone;
}

export function StatCard({ label, amount, icon, tone }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 sm:p-4">
      <span
        className={cn('grid size-8 place-items-center rounded-full', TONE_CLASSES[tone])}
      >
        {icon}
      </span>
      <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
      <p className="text-sm font-semibold text-foreground sm:text-base">
        {formatCurrency(amount)}
      </p>
    </div>
  );
}
