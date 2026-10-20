export type CuentaTipo = 'efectivo' | 'banco' | 'ahorros' | 'billetera' | 'tarjeta' | 'otro';

export interface Cuenta {
  id: string;
  nombre: string;
  tipo: CuentaTipo;
  saldoInicial: number;
  balance: number;
}

export interface CreateCuentaPayload {
  nombre: string;
  tipo: CuentaTipo;
  saldoInicial?: number;
}

export interface UpdateCuentaPayload {
  nombre?: string;
  tipo?: CuentaTipo;
  saldoInicial?: number;
}
