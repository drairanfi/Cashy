import { apiFetch } from '@/lib/api/client';
import type { CreateGastoPayload, Gasto } from '@/types/gasto.types';

export const gastosApi = {
  list: () => apiFetch<Gasto[]>('/gastos'),

  create: (payload: CreateGastoPayload) =>
    apiFetch<Gasto>('/gastos', { method: 'POST', body: JSON.stringify(payload) }),

  remove: (id: string) => apiFetch<void>(`/gastos/${id}`, { method: 'DELETE' })
};
