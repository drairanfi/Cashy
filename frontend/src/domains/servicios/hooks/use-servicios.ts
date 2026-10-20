'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UpdateServicioPayload } from '@/types/servicio.types';

import { serviciosApi } from '../api';

export function useServicios() {
  return useQuery({
    queryKey: ['servicios'],
    queryFn: serviciosApi.list
  });
}

function useInvalidateServicios() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['servicios'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useCreateServicio() {
  const invalidate = useInvalidateServicios();

  return useMutation({
    mutationFn: serviciosApi.create,
    onSuccess: invalidate
  });
}

export function useUpdateServicio() {
  const invalidate = useInvalidateServicios();

  return useMutation({
    mutationFn: (input: { id: string; data: UpdateServicioPayload }) =>
      serviciosApi.update(input.id, input.data),
    onSuccess: invalidate
  });
}

export function useDeleteServicio() {
  const invalidate = useInvalidateServicios();

  return useMutation({
    mutationFn: serviciosApi.remove,
    onSuccess: invalidate
  });
}
