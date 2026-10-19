import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gimnasioApi } from '@/services/api/gimnasio';

export function useGimnasio() {
  return useQuery({ queryKey: ['gimnasio'], queryFn: gimnasioApi.list });
}

export function useCreateGimnasio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: gimnasioApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gimnasio'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteGimnasio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: gimnasioApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gimnasio'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
