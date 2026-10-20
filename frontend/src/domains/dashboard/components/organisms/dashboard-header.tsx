import { ArrowDown, ArrowUp, PiggyBank } from 'lucide-react';

import { StatCard } from '@/components/molecules/stat-card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format.util';
import { getSaldoState, SALDO_STATE_LABELS, type SaldoState } from '@/utils/saldo.util';

import { dashboardMessages } from '../../messages';

const STATE_CARD_CLASSES: Record<SaldoState, string> = {
  danger: 'border-rose-200 bg-rose-50',
  warning: 'border-amber-200 bg-amber-50',
  success: 'border-emerald-200 bg-emerald-50'
};

const STATE_DOT_CLASSES: Record<SaldoState, string> = {
  danger: 'bg-rose-500',
  warning: 'bg-amber-500',
  success: 'bg-emerald-500'
};

interface DashboardHeaderProps {
  nombre: string;
  saldoDisponible: number;
  sueldo: number;
  ingresos: number;
  gastos: number;
  ahorros: number;
}

export function DashboardHeader({
  nombre,
  saldoDisponible,
  sueldo,
  ingresos,
  gastos,
  ahorros
}: DashboardHeaderProps) {
  const { state, percentage } = getSaldoState(saldoDisponible, sueldo);
  const initial = nombre.charAt(0).toUpperCase();

  return (
    <header className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{dashboardMessages.greeting}</p>
          <h1 className="text-2xl font-extrabold text-foreground">{nombre}</h1>
        </div>
        <span className="grid size-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {initial}
        </span>
      </div>

      <div className={cn('rounded-3xl border p-5', STATE_CARD_CLASSES[state])}>
        <p className="text-sm text-muted-foreground">{dashboardMessages.saldoLabel}</p>
        <p className="mt-1 text-3xl font-extrabold text-foreground">
          {formatCurrency(saldoDisponible)}
        </p>
        <p className="text-xs text-muted-foreground">{dashboardMessages.saldoCurrency}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
            <span className={cn('size-2 rounded-full', STATE_DOT_CLASSES[state])} />
            {SALDO_STATE_LABELS[state]}
          </span>
          <p className="text-xs text-muted-foreground">
            {dashboardMessages.saldoPercentage(Math.round(percentage))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard
          label={dashboardMessages.stats.income}
          amount={ingresos}
          tone="emerald"
          icon={<ArrowDown className="size-4" />}
        />
        <StatCard
          label={dashboardMessages.stats.expenses}
          amount={gastos}
          tone="rose"
          icon={<ArrowUp className="size-4" />}
        />
        <StatCard
          label={dashboardMessages.stats.savings}
          amount={ahorros}
          tone="sky"
          icon={<PiggyBank className="size-4" />}
        />
      </div>
    </header>
  );
}
