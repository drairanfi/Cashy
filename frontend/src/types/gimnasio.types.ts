export interface GimnasioRegistro {
  id: string;
  actividad: string;
  monto: number;
  fecha: string;
}

export interface CreateGimnasioPayload {
  actividad: string;
  monto: number;
}
