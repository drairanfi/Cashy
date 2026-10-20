import { apiFetch } from '@/lib/api/client';
import type { CreateMetaPayload, Meta, UpdateMetaPayload } from '@/types/meta.types';

export const metasApi = {
  list: () => apiFetch<Meta[]>('/metas'),

  create: (payload: CreateMetaPayload) =>
    apiFetch<Meta>('/metas', { method: 'POST', body: JSON.stringify(payload) }),

  update: (id: string, payload: UpdateMetaPayload) =>
    apiFetch<Meta>(`/metas/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  remove: (id: string) => apiFetch<void>(`/metas/${id}`, { method: 'DELETE' })
};
