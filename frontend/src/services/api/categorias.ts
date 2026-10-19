import { apiFetch } from './client';
import type { Categoria } from '@/types';

export const categoriasApi = {
  list: () => apiFetch<Categoria[]>('/categorias'),
  create: (nombre: string) =>
    apiFetch<Categoria>('/categorias', { method: 'POST', body: JSON.stringify({ nombre }) }),
  remove: (id: string) => apiFetch<void>(`/categorias/${id}`, { method: 'DELETE' }),
};
