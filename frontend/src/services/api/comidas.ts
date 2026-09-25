import { apiFetch } from './client';
import type { Comida } from '../../types';

export const comidasApi = {
  list: () => apiFetch<Comida[]>('/comidas'),
  create: (data: { descripcion: string; monto: number }) =>
    apiFetch<Comida>('/comidas', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/comidas/${id}`, { method: 'DELETE' }),
};
