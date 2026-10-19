import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { serviciosApi } from '@/services/api/servicios';

export function useServicios() {
  return useQuery({
    queryKey: ['servicios'],
    queryFn: serviciosApi.list,
  });
}

export function useCreateServicio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: serviciosApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['servicios'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateServicio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; data: { nombre: string; montoDestinado: number } }) =>
      serviciosApi.update(input.id, input.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['servicios'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteServicio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: serviciosApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['servicios'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
