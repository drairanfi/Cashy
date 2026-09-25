import type { ReactNode } from 'react';
import { useSaldoState } from '../../../hooks/useSaldoState';
import { SaldoStateIndicator } from '../../atoms/SaldoStateIndicator';
import { SALDO_STATE_CLASSES, type SaldoUmbrales } from '../../../utils/saldo';
import { formatCurrency } from '../../../utils/format';
type StatTone = 'emerald' | 'rose' | 'sky';

const STAT_TONES: Record<StatTone, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-400',
  rose: 'bg-rose-500/15 text-rose-400',
  sky: 'bg-sky-500/15 text-sky-400',
};

interface StatCardProps {
  label: string;
  monto: number;
  icon: ReactNode;
  tone: StatTone;
}

function StatCard({ label, monto, icon, tone }: StatCardProps) {
  return (
    <div className="stat-card">
      <span className={`stat-card__icon ${STAT_TONES[tone]}`}>{icon}</span>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__monto">{formatCurrency(monto)}</p>
    </div>
  );
}

interface DashboardHeaderProps {
  nombre: string;
  saldoDisponible: number;
  sueldo: number;
  ingresos: number;
  gastos: number;
  ahorros: number;
  umbrales?: SaldoUmbrales;
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
  umbrales,
  hasNotifications,
  onOpenNotifications,
}: DashboardHeaderProps) {
  const { state, porcentaje } = useSaldoState(saldoDisponible, sueldo, umbrales);

  return (
    <header className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-400">Hola,</p>
          <h1 className="text-2xl font-bold text-white">{nombre}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notificaciones"
            className="icon-button"
            onClick={onOpenNotifications}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            {hasNotifications && <span className="icon-button__dot" />}
          </button>
          <span className="avatar">{nombre.charAt(0).toUpperCase()}</span>
        </div>
      </div>

      <div className={`saldo-card ${SALDO_STATE_CLASSES[state]}`}>
        <p className="saldo-card__label">Saldo disponible</p>
        <p className="saldo-card__monto">{formatCurrency(saldoDisponible)}</p>
        <p className="saldo-card__moneda">Pesos colombianos (COP)</p>
        <div className="saldo-card__footer">
          <SaldoStateIndicator state={state} />
          <p className="saldo-card__pct">{Math.round(porcentaje)}% del sueldo</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Ingresos" monto={ingresos} tone="emerald" icon={<ArrowDownIcon />} />
        <StatCard label="Gastos" monto={gastos} tone="rose" icon={<ArrowUpIcon />} />
        <StatCard label="Ahorros" monto={ahorros} tone="sky" icon={<PiggyIcon />} />
      </div>
    </header>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function PiggyIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 1.3 3.2 3 3.8V19a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3h2v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3.2c1.7-.6 3-2 3-3.8 0-3-2.5-5-5-5z" />
    </svg>
  );
}
