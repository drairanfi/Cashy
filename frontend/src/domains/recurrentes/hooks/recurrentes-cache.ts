'use client';

import { useQueryClient } from '@tanstack/react-query';

export const recurrenteQueryKeys = {
  list: ['recurrentes'] as const,
  pendientes: ['recurrentes', 'pendientes'] as const
};

export function useInvalidateRecurrentes() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: recurrenteQueryKeys.list });
    queryClient.invalidateQueries({ queryKey: recurrenteQueryKeys.pendientes });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
}
