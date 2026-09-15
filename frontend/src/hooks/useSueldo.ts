import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sueldoApi } from '../services/api/sueldo';

export function useSueldo() {
  return useQuery({
    queryKey: ['sueldo'],
    queryFn: sueldoApi.get,
  });
}

export function useUpsertSueldo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sueldoApi.upsert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sueldo'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
