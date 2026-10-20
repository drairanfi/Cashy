import { apiFetch } from '@/lib/api/client';
import type {
  Categoria,
  CreateCategoriaPayload,
  UpdateCategoriaPayload
} from '@/types/categoria.types';

export const categoriasApi = {
  list: () => apiFetch<Categoria[]>('/categorias'),

  create: (payload: CreateCategoriaPayload) =>
    apiFetch<Categoria>('/categorias', { method: 'POST', body: JSON.stringify(payload) }),

  update: (id: string, payload: UpdateCategoriaPayload) =>
    apiFetch<Categoria>(`/categorias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  remove: (id: string) => apiFetch<void>(`/categorias/${id}`, { method: 'DELETE' })
};
