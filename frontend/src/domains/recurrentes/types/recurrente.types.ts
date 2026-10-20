export type RecurrenteFrecuencia = 'diaria' | 'semanal' | 'mensual' | 'anual';

export type RecurrenteEstado = 'activa' | 'pausada';

export type OcurrenciaEstado = 'pendiente' | 'confirmada' | 'omitida';

export interface Recurrente {
  id: string;
  concepto: string;
  monto: number;
  categoria: string | null;
  frecuencia: RecurrenteFrecuencia;
  intervalo: number;
  fechaInicio: string;
  fechaFin: string | null;
  estado: RecurrenteEstado;
  proximaOcurrencia: string | null;
  pendientes: number;
}

export interface CreateRecurrentePayload {
  concepto: string;
  monto: number;
  categoria?: string;
  frecuencia: RecurrenteFrecuencia;
  intervalo?: number;
  fechaInicio: string;
  fechaFin?: string | null;
}

export interface RecurrenteOcurrencia {
  id: string;
  reglaId: string;
  fecha: string;
  concepto: string;
  monto: number;
  categoria: string | null;
  estado: OcurrenciaEstado;
}

export interface ConfirmarOcurrenciaResult {
  gasto: {
    id: string;
    descripcion: string;
    monto: number;
    categoria: string;
    fecha: string;
  };
  ocurrencia: {
    id: string;
    reglaId: string;
    fecha: string;
    estado: OcurrenciaEstado;
  };
}
