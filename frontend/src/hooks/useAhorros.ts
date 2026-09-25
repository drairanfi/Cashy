import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ahorrosApi } from '../services/api/ahorros';

export function useAhorros() {
  return useQuery({ queryKey: ['ahorros'], queryFn: ahorrosApi.list });
}

export function useCreateAhorro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ahorrosApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ahorros'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAportarAhorro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; monto: number }) => ahorrosApi.aportar(input.id, input.monto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ahorros'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteAhorro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ahorrosApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ahorros'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
