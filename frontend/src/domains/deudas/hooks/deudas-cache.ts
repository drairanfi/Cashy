'use client';

import { useQueryClient } from '@tanstack/react-query';

export const deudaQueryKeys = {
  list: ['deudas'] as const,
  detail: (id: string) => ['deuda', id] as const,
  calendar: ['deudas', 'calendario'] as const
};

export function useInvalidateDeudas() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: deudaQueryKeys.list });
    queryClient.invalidateQueries({ queryKey: ['deuda'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
}
