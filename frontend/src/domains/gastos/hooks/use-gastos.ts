'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

export function useDeleteGasto() {
  const invalidate = useInvalidateGastos();

  return useMutation({
    mutationFn: gastosApi.remove,
    onSuccess: invalidate
  });
}
