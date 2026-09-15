import { apiFetch } from './client';
import type { Meta } from '../../types';

export const metasApi = {
  list: () => apiFetch<Meta[]>('/metas'),

  create: (data: { nombre: string; montoObjetivo: number; montoMensual: number }) =>
    apiFetch<Meta>('/metas', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: { nombre?: string; montoObjetivo?: number; montoMensual?: number }) =>
    apiFetch<Meta>(`/metas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  remove: (id: string) => apiFetch<void>(`/metas/${id}`, { method: 'DELETE' }),
};
