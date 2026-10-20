export type SaldoState = 'danger' | 'warning' | 'success';

export interface SaldoThresholds {
  low: number;
  medium: number;
}

export const DEFAULT_SALDO_THRESHOLDS: SaldoThresholds = { low: 0.2, medium: 0.5 };

export const SALDO_STATE_LABELS: Record<SaldoState, string> = {
  danger: 'Bajo',
  warning: 'Medio',
  success: 'Saludable'
};

export interface SaldoStateResult {
  state: SaldoState;
  percentage: number;
}

export function getSaldoState(
  saldo: number,
  sueldo: number,
  thresholds: SaldoThresholds = DEFAULT_SALDO_THRESHOLDS
): SaldoStateResult {
  const percentage = sueldo > 0 ? (saldo / sueldo) * 100 : 0;

  let state: SaldoState;
  if (percentage < thresholds.low * 100) state = 'danger';
  else if (percentage < thresholds.medium * 100) state = 'warning';
  else state = 'success';

  return { state, percentage };
}
