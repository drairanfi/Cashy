export interface Meta {
  id: string;
  nombre: string;
  montoObjetivo: number;
  montoMensual: number;
  mesesParaAlcanzar: number | null;
  prioritaria: boolean;
}

export interface CreateMetaPayload {
  nombre: string;
  montoObjetivo: number;
  montoMensual: number;
  prioritaria?: boolean;
}

export interface UpdateMetaPayload {
  nombre?: string;
  montoObjetivo?: number;
  montoMensual?: number;
  prioritaria?: boolean;
}
