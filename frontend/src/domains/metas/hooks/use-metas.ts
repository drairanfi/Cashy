'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UpdateMetaPayload } from '@/types/meta.types';

import { metasApi } from '../api';

export function useMetas() {
  return useQuery({
    queryKey: ['metas'],
    queryFn: metasApi.list
  });
}

function useInvalidateMetas() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['metas'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useCreateMeta() {
  const invalidate = useInvalidateMetas();

  return useMutation({
    mutationFn: metasApi.create,
    onSuccess: invalidate
  });
}

export function useUpdateMeta() {
  const invalidate = useInvalidateMetas();

  return useMutation({
    mutationFn: (input: { id: string; data: UpdateMetaPayload }) =>
      metasApi.update(input.id, input.data),
    onSuccess: invalidate
  });
}

export function useDeleteMeta() {
  const invalidate = useInvalidateMetas();

  return useMutation({
    mutationFn: metasApi.remove,
    onSuccess: invalidate
  });
}
