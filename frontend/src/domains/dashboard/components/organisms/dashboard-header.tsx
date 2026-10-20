import { ArrowDown, ArrowUp, Bell, PiggyBank } from 'lucide-react';

import { StatCard } from '@/components/molecules/stat-card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format.util';
import { getSaldoState, SALDO_STATE_LABELS, type SaldoState } from '@/utils/saldo.util';

import { dashboardMessages } from '../../messages';

const STATE_CARD_CLASSES: Record<SaldoState, string> = {
  danger: 'border-expense/30 bg-expense/10',
  warning: 'border-warning/30 bg-warning/10',
  success: 'border-income/30 bg-income/10'
};

const STATE_DOT_CLASSES: Record<SaldoState, string> = {
  danger: 'bg-expense',
  warning: 'bg-warning',
  success: 'bg-income'
};

interface DashboardHeaderProps {
  nombre: string;
  saldoDisponible: number;
  sueldo: number;
  ingresos: number;
  gastos: number;
  ahorros: number;
  hasNotifications?: boolean;
  onOpenNotifications?: () => void;
}

export function DashboardHeader({
  nombre,
  saldoDisponible,
  sueldo,
  ingresos,
  gastos,
  ahorros,
  hasNotifications = false,
  onOpenNotifications
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label={dashboardMessages.notifications.label}
            className="relative grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Bell className="size-5" />
            {hasNotifications && (
              <span className="absolute right-2 top-2 size-2 rounded-full bg-expense" />
            )}
          </button>
          <span className="grid size-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initial}
          </span>
        </div>
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
