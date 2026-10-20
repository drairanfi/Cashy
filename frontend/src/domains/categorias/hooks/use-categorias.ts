'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UpdateCategoriaPayload } from '@/types/categoria.types';

import { categoriasApi } from '../api';

export function useCategorias(enabled = true) {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.list,
    enabled
  });
}

function useInvalidateCategorias() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['categorias'] });
  };
}

export function useCreateCategoria() {
  const invalidate = useInvalidateCategorias();

  return useMutation({
    mutationFn: categoriasApi.create,
    onSuccess: invalidate
  });
}

export function useUpdateCategoria() {
  const invalidate = useInvalidateCategorias();

  return useMutation({
    mutationFn: (input: { id: string; data: UpdateCategoriaPayload }) =>
      categoriasApi.update(input.id, input.data),
    onSuccess: invalidate
  });
}

export function useDeleteCategoria() {
  const invalidate = useInvalidateCategorias();

  return useMutation({
    mutationFn: categoriasApi.remove,
    onSuccess: invalidate
  });
}
