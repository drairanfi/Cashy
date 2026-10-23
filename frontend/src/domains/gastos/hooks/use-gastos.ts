'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UpdateGastoPayload } from '@/types/gasto.types';

import { gastosApi } from '../api';

export function useGastos() {
  return useQuery({
    queryKey: ['gastos'],
    queryFn: gastosApi.list
  });
}

function useInvalidateGastos() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['gastos'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useCreateGasto() {
  const invalidate = useInvalidateGastos();

  return useMutation({
    mutationFn: gastosApi.create,
    onSuccess: invalidate
  });
}

export function useUpdateGasto() {
  const invalidate = useInvalidateGastos();

  return useMutation({
    mutationFn: (input: { id: string; data: UpdateGastoPayload }) =>
      gastosApi.update(input.id, input.data),
    onSuccess: invalidate
  });
}

export function useDeleteGasto() {
  const invalidate = useInvalidateGastos();

  return useMutation({
    mutationFn: gastosApi.remove,
    onSuccess: invalidate
  });
}
