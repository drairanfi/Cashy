export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  categoria: string;
  cuentaId: string | null;
  fecha: string;
}

export interface CreateGastoPayload {
  descripcion: string;
  monto: number;
  categoria: string;
  cuentaId?: string | null;
}
