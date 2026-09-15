import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { metasApi } from '../services/api/metas';

export function useMetas() {
  return useQuery({
    queryKey: ['metas'],
    queryFn: metasApi.list,
  });
}

export function useCreateMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: metasApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['metas'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      id: string;
      data: { nombre: string; montoObjetivo: number; montoMensual: number };
    }) => metasApi.update(input.id, input.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['metas'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: metasApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['metas'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
