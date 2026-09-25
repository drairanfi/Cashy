import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gastosApi } from '../services/api/gastos';

export function useGastos() {
  return useQuery({ queryKey: ['gastos'], queryFn: gastosApi.list });
}

export function useCreateGasto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: gastosApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gastos'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteGasto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: gastosApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gastos'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
