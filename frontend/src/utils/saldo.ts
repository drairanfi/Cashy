export type SaldoState = 'danger' | 'warning' | 'success';

export interface SaldoUmbrales {
  bajo: number;
  medio: number;
}

export const SALDO_UMBRALES_DEFAULT: SaldoUmbrales = { bajo: 0.2, medio: 0.5 };

export const SALDO_STATE_CLASSES: Record<SaldoState, string> = {
  danger: 'saldo-card--danger',
  warning: 'saldo-card--warning',
  success: 'saldo-card--success',
};

export const SALDO_STATE_LABELS: Record<SaldoState, string> = {
  danger: 'Bajo',
  warning: 'Medio',
  success: 'Saludable',
};

export function getSaldoState(
  saldo: number,
  sueldo: number,
  umbrales: SaldoUmbrales = SALDO_UMBRALES_DEFAULT,
): { state: SaldoState; porcentaje: number } {
  const porcentaje = sueldo > 0 ? (saldo / sueldo) * 100 : 0;

  let state: SaldoState;
  if (porcentaje < umbrales.bajo * 100) state = 'danger';
  else if (porcentaje < umbrales.medio * 100) state = 'warning';
  else state = 'success';

  return { state, porcentaje };
}
