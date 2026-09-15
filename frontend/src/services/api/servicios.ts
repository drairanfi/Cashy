import { apiFetch } from './client';
import type { Servicio } from '../../types';

export const serviciosApi = {
  list: () => apiFetch<Servicio[]>('/servicios'),

  create: (data: { nombre: string; montoDestinado: number }) =>
    apiFetch<Servicio>('/servicios', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: { nombre?: string; montoDestinado?: number }) =>
    apiFetch<Servicio>(`/servicios/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  remove: (id: string) => apiFetch<void>(`/servicios/${id}`, { method: 'DELETE' }),
};
