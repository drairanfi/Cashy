import { useMemo } from 'react';
import {
  getSaldoState,
  SALDO_UMBRALES_DEFAULT,
  type SaldoState,
  type SaldoUmbrales,
} from '@/utils/saldo';

export function useSaldoState(
  saldo: number,
  sueldo: number,
  umbrales: SaldoUmbrales = SALDO_UMBRALES_DEFAULT,
): { state: SaldoState; porcentaje: number } {
  return useMemo(() => getSaldoState(saldo, sueldo, umbrales), [saldo, sueldo, umbrales]);
}
