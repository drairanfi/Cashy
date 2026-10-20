import { apiFetch } from '@/lib/api/client';
import type {
  CreateDeudaPayload,
  CuotaCalendario,
  DeudaDetalle,
  DeudaResumen,
  PagarCuotaResult
} from '@/types/deuda.types';

export const deudasApi = {
  list: () => apiFetch<DeudaResumen[]>('/deudas'),

  get: (id: string) => apiFetch<DeudaDetalle>(`/deudas/${id}`),

  create: (payload: CreateDeudaPayload) =>
    apiFetch<DeudaDetalle>('/deudas', { method: 'POST', body: JSON.stringify(payload) }),

  pagarCuota: (input: { id: string; numero: number }) =>
    apiFetch<PagarCuotaResult>(`/deudas/${input.id}/cuotas/${input.numero}/pagar`, {
      method: 'POST'
    }),

  remove: (id: string) => apiFetch<void>(`/deudas/${id}`, { method: 'DELETE' }),

  calendario: () => apiFetch<CuotaCalendario[]>('/deudas/calendario')
};
