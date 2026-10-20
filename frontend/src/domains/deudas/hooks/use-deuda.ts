'use client';

import { useQuery } from '@tanstack/react-query';

import { deudasApi } from '../api';
import { deudaQueryKeys } from './deudas-cache';

export function useDeuda(id: string | null) {
  return useQuery({
    queryKey: deudaQueryKeys.detail(id ?? ''),
    queryFn: () => deudasApi.get(id as string),
    enabled: Boolean(id)
  });
}
