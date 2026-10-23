export interface DashboardCuenta {
  id: string;
  nombre: string;
  tipo: string;
  saldoInicial: number;
  balance: number;
}

export interface DashboardSummary {
  sueldo: number;
  ingresos: number;
  gastos: number;
  ahorros: number;
  saldoDisponible: number;
  totalMetas: number;
  cuentas: DashboardCuenta[];
}
