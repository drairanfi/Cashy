export interface Usuario {
  id: string;
  email: string;
  nombre: string;
}

export interface Sueldo {
  id: string;
  monto: number;
}

export interface Servicio {
  id: string;
  nombre: string;
  montoDestinado: number;
}

export interface Meta {
  id: string;
  nombre: string;
  montoObjetivo: number;
  montoMensual: number;
  mesesParaAlcanzar: number | null;
}

export interface DashboardResumen {
  sueldo: number;
  ingresos: number;
  gastos: number;
  ahorros: number;
  saldoDisponible: number;
  totalServicios: number;
  totalMetas: number;
}

export const GASTO_CATEGORIAS = ['Hogar', 'Transporte', 'Ocio', 'Salud', 'Otros'] as const;
export type GastoCategoria = (typeof GASTO_CATEGORIAS)[number];

export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  categoria: GastoCategoria;
  fecha: string;
}

export interface Comida {
  id: string;
  descripcion: string;
  monto: number;
  fecha: string;
}

export interface GimnasioRegistro {
  id: string;
  actividad: string;
  monto: number;
  fecha: string;
}

export interface Ahorro {
  id: string;
  nombre: string;
  objetivo: number;
  actual: number;
}
