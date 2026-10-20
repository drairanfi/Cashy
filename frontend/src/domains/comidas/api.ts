import { apiFetch } from '@/lib/api/client';
import type { Comida, CreateComidaPayload } from '@/types/comida.types';

export const comidasApi = {
  list: () => apiFetch<Comida[]>('/comidas'),

  create: (payload: CreateComidaPayload) =>
    apiFetch<Comida>('/comidas', { method: 'POST', body: JSON.stringify(payload) }),

  remove: (id: string) => apiFetch<void>(`/comidas/${id}`, { method: 'DELETE' })
};
