export interface Comida {
  id: string;
  descripcion: string;
  monto: number;
  cuentaId: string | null;
  fecha: string;
}

export interface CreateComidaPayload {
  descripcion: string;
  monto: number;
  cuentaId?: string | null;
}
