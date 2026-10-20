import { apiFetch } from '@/lib/api/client';

import type {
  ConfirmarOcurrenciaResult,
  CreateRecurrentePayload,
  Recurrente,
  RecurrenteEstado,
  RecurrenteOcurrencia
} from './types/recurrente.types';

export const recurrentesApi = {
  list: () => apiFetch<Recurrente[]>('/recurrentes'),

  create: (payload: CreateRecurrentePayload) =>
    apiFetch<Recurrente>('/recurrentes', { method: 'POST', body: JSON.stringify(payload) }),

  update: (input: { id: string; estado: RecurrenteEstado }) =>
    apiFetch<Recurrente>(`/recurrentes/${input.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: input.estado })
    }),

  remove: (id: string) => apiFetch<void>(`/recurrentes/${id}`, { method: 'DELETE' }),

  pendientes: () => apiFetch<RecurrenteOcurrencia[]>('/recurrentes/pendientes'),

  confirmar: (id: string) =>
    apiFetch<ConfirmarOcurrenciaResult>(`/recurrentes/ocurrencias/${id}/confirmar`, {
      method: 'POST'
    }),

  omitir: (id: string) =>
    apiFetch<RecurrenteOcurrencia>(`/recurrentes/ocurrencias/${id}/omitir`, {
      method: 'POST'
    })
};
