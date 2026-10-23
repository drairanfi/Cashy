import { apiFetch } from '@/lib/api/client';
import type { CreateGastoPayload, Gasto, UpdateGastoPayload } from '@/types/gasto.types';

export const gastosApi = {
  list: () => apiFetch<Gasto[]>('/gastos'),

  create: (payload: CreateGastoPayload) =>
    apiFetch<Gasto>('/gastos', { method: 'POST', body: JSON.stringify(payload) }),

  update: (id: string, payload: UpdateGastoPayload) =>
    apiFetch<Gasto>(`/gastos/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  remove: (id: string) => apiFetch<void>(`/gastos/${id}`, { method: 'DELETE' })
};
