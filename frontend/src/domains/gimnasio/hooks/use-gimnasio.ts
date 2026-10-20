'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { gimnasioApi } from '../api';

export function useGimnasio() {
  return useQuery({
    queryKey: ['gimnasio'],
    queryFn: gimnasioApi.list
  });
}

function useInvalidateGimnasio() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['gimnasio'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useCreateGimnasio() {
  const invalidate = useInvalidateGimnasio();

  return useMutation({
    mutationFn: gimnasioApi.create,
    onSuccess: invalidate
  });
}

export function useDeleteGimnasio() {
  const invalidate = useInvalidateGimnasio();

  return useMutation({
    mutationFn: gimnasioApi.remove,
    onSuccess: invalidate
  });
}
