import { apiFetch } from '@/lib/api/client';
import type { CreateGimnasioPayload, GimnasioRegistro } from '@/types/gimnasio.types';

export const gimnasioApi = {
  list: () => apiFetch<GimnasioRegistro[]>('/gimnasio'),

  create: (payload: CreateGimnasioPayload) =>
    apiFetch<GimnasioRegistro>('/gimnasio', { method: 'POST', body: JSON.stringify(payload) }),

  remove: (id: string) => apiFetch<void>(`/gimnasio/${id}`, { method: 'DELETE' })
};
