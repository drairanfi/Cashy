import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriasApi } from '@/services/api/categorias';

export function useCategorias(enabled = true) {
  return useQuery({ queryKey: ['categorias'], queryFn: categoriasApi.list, enabled });
}

export function useCreateCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriasApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  });
}

export function useDeleteCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriasApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  });
}
