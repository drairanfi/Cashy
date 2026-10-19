import { apiFetch } from './client';
import type { GimnasioRegistro } from '@/types';

export const gimnasioApi = {
  list: () => apiFetch<GimnasioRegistro[]>('/gimnasio'),
  create: (data: { actividad: string; monto: number }) =>
    apiFetch<GimnasioRegistro>('/gimnasio', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/gimnasio/${id}`, { method: 'DELETE' }),
};
