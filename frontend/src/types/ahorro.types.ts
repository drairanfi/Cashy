export interface Ahorro {
  id: string;
  nombre: string;
  objetivo: number;
  actual: number;
}

export interface CreateAhorroPayload {
  nombre: string;
  objetivo: number;
  actual?: number;
}
