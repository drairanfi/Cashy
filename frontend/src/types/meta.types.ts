export interface Meta {
  id: string;
  nombre: string;
  montoObjetivo: number;
  montoMensual: number;
  mesesParaAlcanzar: number | null;
  prioritaria: boolean;
  fechaInicio: string;
  fechaFin: string | null;
}

export interface CreateMetaPayload {
  nombre: string;
  montoObjetivo: number;
  montoMensual: number;
  prioritaria?: boolean;
  fechaInicio: string;
  fechaFin?: string | null;
}

export interface UpdateMetaPayload {
  nombre?: string;
  montoObjetivo?: number;
  montoMensual?: number;
  prioritaria?: boolean;
  fechaInicio?: string;
  fechaFin?: string | null;
}
