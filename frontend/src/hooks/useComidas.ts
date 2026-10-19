import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { comidasApi } from '@/services/api/comidas';

export function useComidas() {
  return useQuery({ queryKey: ['comidas'], queryFn: comidasApi.list });
}

export function useCreateComida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: comidasApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comidas'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteComida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: comidasApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comidas'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
