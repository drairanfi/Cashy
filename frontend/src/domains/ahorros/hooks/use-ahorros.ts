'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ahorrosApi } from '../api';

export function useAhorros() {
  return useQuery({
    queryKey: ['ahorros'],
    queryFn: ahorrosApi.list
  });
}

function useInvalidateAhorros() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['ahorros'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useCreateAhorro() {
  const invalidate = useInvalidateAhorros();

  return useMutation({
    mutationFn: ahorrosApi.create,
    onSuccess: invalidate
  });
}

export function useAportarAhorro() {
  const invalidate = useInvalidateAhorros();

  return useMutation({
    mutationFn: (input: { id: string; monto: number }) =>
      ahorrosApi.aportar(input.id, input.monto),
    onSuccess: invalidate
  });
}

export function useDeleteAhorro() {
  const invalidate = useInvalidateAhorros();

  return useMutation({
    mutationFn: ahorrosApi.remove,
    onSuccess: invalidate
  });
}
