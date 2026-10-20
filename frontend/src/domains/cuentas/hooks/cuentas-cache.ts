'use client';

import { useQueryClient } from '@tanstack/react-query';

export const cuentaQueryKeys = {
  list: ['cuentas'] as const
};

export function useInvalidateCuentas() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: cuentaQueryKeys.list });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
}
