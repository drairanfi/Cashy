import { apiFetch } from '@/lib/api/client';

import type { CreateCuentaPayload, Cuenta, UpdateCuentaPayload } from './types/cuenta.types';

export const cuentasApi = {
  list: () => apiFetch<Cuenta[]>('/cuentas'),

  create: (payload: CreateCuentaPayload) =>
    apiFetch<Cuenta>('/cuentas', { method: 'POST', body: JSON.stringify(payload) }),

  update: (input: { id: string; data: UpdateCuentaPayload }) =>
    apiFetch<Cuenta>(`/cuentas/${input.id}`, {
      method: 'PATCH',
      body: JSON.stringify(input.data)
    }),

  remove: (id: string) => apiFetch<void>(`/cuentas/${id}`, { method: 'DELETE' })
};
