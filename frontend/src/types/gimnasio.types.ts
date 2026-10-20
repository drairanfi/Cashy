export interface GimnasioRegistro {
  id: string;
  actividad: string;
  monto: number;
  cuentaId: string | null;
  fecha: string;
}

export interface CreateGimnasioPayload {
  actividad: string;
  monto: number;
  cuentaId?: string | null;
}
