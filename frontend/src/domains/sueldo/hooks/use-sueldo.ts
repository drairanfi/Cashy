'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { sueldoApi } from '../api';

export function useSueldo() {
  return useQuery({
    queryKey: ['sueldo'],
    queryFn: sueldoApi.get
  });
}

export function useUpsertSueldo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sueldoApi.upsert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sueldo'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}
