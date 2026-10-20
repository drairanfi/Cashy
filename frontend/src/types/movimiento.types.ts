export type MovimientoTipo = 'gasto' | 'comida' | 'gimnasio';

export interface Movimiento {
  id: string;
  tipo: MovimientoTipo;
  titulo: string;
  monto: number;
  fecha: string;
  categoria?: string;
}
