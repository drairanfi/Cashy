'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { comidasApi } from '../api';

export function useComidas() {
  return useQuery({
    queryKey: ['comidas'],
    queryFn: comidasApi.list
  });
}

function useInvalidateComidas() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['comidas'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useCreateComida() {
  const invalidate = useInvalidateComidas();

  return useMutation({
    mutationFn: comidasApi.create,
    onSuccess: invalidate
  });
}

export function useDeleteComida() {
  const invalidate = useInvalidateComidas();

  return useMutation({
    mutationFn: comidasApi.remove,
    onSuccess: invalidate
  });
}
