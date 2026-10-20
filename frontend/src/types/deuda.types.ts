export type DeudaDireccion = 'debida' | 'a_cobrar';

export type DeudaFrecuencia = 'semanal' | 'quincenal' | 'mensual';

export type CuotaEstado = 'pendiente' | 'pagada';

export interface Cuota {
  id: string;
  numero: number;
  fechaVencimiento: string;
  monto: number;
  estado: CuotaEstado;
}

export interface DeudaResumen {
  id: string;
  nombre: string;
  direccion: DeudaDireccion;
  montoTotal: number;
  cantidadCuotas: number;
  frecuencia: DeudaFrecuencia;
  primeraFecha: string;
  montoPagado: number;
  montoPendiente: number;
  cuotasPagadas: number;
  totalCuotas: number;
  proximaFecha: string | null;
}

export interface DeudaDetalle extends DeudaResumen {
  cuotas: Cuota[];
}

export interface CreateDeudaPayload {
  nombre: string;
  direccion: DeudaDireccion;
  montoTotal: number;
  cantidadCuotas: number;
  frecuencia: DeudaFrecuencia;
  primeraFecha: string;
}

export interface CuotaCalendario {
  fechaVencimiento: string;
  deudaNombre: string;
  numero: number;
  monto: number;
}

export interface PagarCuotaResult {
  cuota: Cuota;
  resumen: DeudaResumen;
}
