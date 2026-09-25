import { apiFetch } from './client';
import type { Gasto } from '../../types';

export const gastosApi = {
  list: () => apiFetch<Gasto[]>('/gastos'),
  create: (data: { descripcion: string; monto: number; categoria: string }) =>
    apiFetch<Gasto>('/gastos', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/gastos/${id}`, { method: 'DELETE' }),
};
