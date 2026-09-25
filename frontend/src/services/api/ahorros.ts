import { apiFetch } from './client';
import type { Ahorro } from '../../types';

export const ahorrosApi = {
  list: () => apiFetch<Ahorro[]>('/ahorros'),
  create: (data: { nombre: string; objetivo: number; actual?: number }) =>
    apiFetch<Ahorro>('/ahorros', { method: 'POST', body: JSON.stringify(data) }),
  aportar: (id: string, monto: number) =>
    apiFetch<Ahorro>(`/ahorros/${id}/aportes`, {
      method: 'POST',
      body: JSON.stringify({ monto }),
    }),
  remove: (id: string) => apiFetch<void>(`/ahorros/${id}`, { method: 'DELETE' }),
};
