export type ModuloClave =
  | 'gastos'
  | 'comida'
  | 'gimnasio'
  | 'ahorros'
  | 'recurrentes'
  | 'deudas'
  | 'metas';

export interface Modulo {
  clave: ModuloClave;
  activo: boolean;
}

export interface ModuloPersonalizado {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface RegistroModulo {
  id: string;
  descripcion: string;
  monto: number;
  cuentaId: string | null;
  fecha: string;
}

export interface CreateRegistroModuloPayload {
  descripcion: string;
  monto: number;
  cuentaId?: string | null;
}
