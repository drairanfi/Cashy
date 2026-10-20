export interface Servicio {
  id: string;
  nombre: string;
  montoDestinado: number;
}

export interface CreateServicioPayload {
  nombre: string;
  montoDestinado: number;
}

export interface UpdateServicioPayload {
  nombre?: string;
  montoDestinado?: number;
}
