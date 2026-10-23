'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { DashboardCuenta } from '@/types/dashboard.types';
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

interface DineroTabsProps {
  saldoDisponible: number;
  sueldo: number;
  cuentas: DashboardCuenta[];
}

interface DineroTab {
  id: string;
  nombre: string;
  monto: number;
  state: SaldoState;
  percentage: number;
  detalle: string;
}

const TOTAL_TAB = 'total';

export function DineroTabs({ saldoDisponible, sueldo, cuentas }: DineroTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(TOTAL_TAB);

  const totalState = getSaldoState(saldoDisponible, sueldo);

  const tabs: DineroTab[] = [
    {
      id: TOTAL_TAB,
      nombre: dashboardMessages.dinero.total,
      monto: saldoDisponible,
      state: totalState.state,
      percentage: totalState.percentage,
      detalle: dashboardMessages.saldoPercentage(Math.round(totalState.percentage))
    },
    ...cuentas.map(cuenta => {
      const cuentaState = getSaldoState(cuenta.balance, cuenta.saldoInicial);
      return {
        id: cuenta.id,
        nombre: cuenta.nombre,
        monto: cuenta.balance,
        state: cuentaState.state,
        percentage: cuentaState.percentage,
        detalle: dashboardMessages.cuentaPercentage(Math.round(cuentaState.percentage))
      };
    })
  ];

  const active = tabs.find(tab => tab.id === activeTab) ?? tabs[0];

  return (
    <div className={cn('rounded-3xl border p-5', STATE_CARD_CLASSES[active.state])}>
      <div role="tablist" className="flex gap-1 overflow-x-auto rounded-full bg-card/60 p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active.id === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors',
              active.id === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            )}
          >
            <span
              aria-hidden
              className={cn('size-2 rounded-full', STATE_DOT_CLASSES[tab.state])}
            />
            {tab.nombre}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {active.id === TOTAL_TAB ? dashboardMessages.saldoLabel : active.nombre}
      </p>
      <p className="mt-1 text-3xl font-extrabold text-foreground">{formatCurrency(active.monto)}</p>
      <p className="text-xs text-muted-foreground">{dashboardMessages.saldoCurrency}</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
          <span className={cn('size-2 rounded-full', STATE_DOT_CLASSES[active.state])} />
          {SALDO_STATE_LABELS[active.state]}
        </span>
        <p className="text-xs text-muted-foreground">{active.detalle}</p>
      </div>
    </div>
  );
}
