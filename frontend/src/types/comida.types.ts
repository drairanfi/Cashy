export interface Comida {
  id: string;
  descripcion: string;
  monto: number;
  fecha: string;
}

export interface CreateComidaPayload {
  descripcion: string;
  monto: number;
}
