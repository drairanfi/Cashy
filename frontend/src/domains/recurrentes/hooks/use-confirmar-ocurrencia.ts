'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { recurrentesApi } from '../api';
import { recurrenteQueryKeys } from './recurrentes-cache';

export function useConfirmarOcurrencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recurrentesApi.confirmar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurrenteQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: recurrenteQueryKeys.pendientes });
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}
