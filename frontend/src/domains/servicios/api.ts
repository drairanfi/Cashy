import { apiFetch } from '@/lib/api/client';
import type {
  CreateServicioPayload,
  Servicio,
  UpdateServicioPayload
} from '@/types/servicio.types';

export const serviciosApi = {
  list: () => apiFetch<Servicio[]>('/servicios'),

  create: (payload: CreateServicioPayload) =>
    apiFetch<Servicio>('/servicios', { method: 'POST', body: JSON.stringify(payload) }),

  update: (id: string, payload: UpdateServicioPayload) =>
    apiFetch<Servicio>(`/servicios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  remove: (id: string) => apiFetch<void>(`/servicios/${id}`, { method: 'DELETE' })
};
