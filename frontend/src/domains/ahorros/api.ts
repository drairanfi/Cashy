import { apiFetch } from '@/lib/api/client';
import type { Ahorro, CreateAhorroPayload } from '@/types/ahorro.types';

export const ahorrosApi = {
  list: () => apiFetch<Ahorro[]>('/ahorros'),

  create: (payload: CreateAhorroPayload) =>
    apiFetch<Ahorro>('/ahorros', { method: 'POST', body: JSON.stringify(payload) }),

  aportar: (id: string, monto: number) =>
    apiFetch<Ahorro>(`/ahorros/${id}/aportes`, {
      method: 'POST',
      body: JSON.stringify({ monto })
    }),

  remove: (id: string) => apiFetch<void>(`/ahorros/${id}`, { method: 'DELETE' })
};
