import { ArrowDown, ArrowUp, Bell, PiggyBank } from 'lucide-react';

import { StatCard } from '@/components/molecules/stat-card';
import type { DashboardCuenta } from '@/types/dashboard.types';

import { dashboardMessages } from '../../messages';
import { DineroTabs } from './dinero-tabs';

interface DashboardHeaderProps {
  nombre: string;
  saldoDisponible: number;
  sueldo: number;
  ingresos: number;
  gastos: number;
  ahorros: number;
  cuentas: DashboardCuenta[];
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
  cuentas,
  hasNotifications = false,
  onOpenNotifications
}: DashboardHeaderProps) {
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

      <DineroTabs saldoDisponible={saldoDisponible} sueldo={sueldo} cuentas={cuentas} />

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
