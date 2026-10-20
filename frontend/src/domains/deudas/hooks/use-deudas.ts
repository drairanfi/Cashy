'use client';

import { useQuery } from '@tanstack/react-query';

import { deudasApi } from '../api';
import { deudaQueryKeys } from './deudas-cache';

export function useDeudas() {
  return useQuery({
    queryKey: deudaQueryKeys.list,
    queryFn: deudasApi.list
  });
}
