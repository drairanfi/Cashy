import { apiFetch } from './client';
import type { Sueldo } from '@/types';

export const sueldoApi = {
  get: () => apiFetch<Sueldo | null>('/sueldo'),
  upsert: (monto: number) =>
    apiFetch<Sueldo>('/sueldo', { method: 'PUT', body: JSON.stringify({ monto }) }),
};
