'use client';

import { useQuery } from '@tanstack/react-query';

import { cuentasApi } from '../api';
import { cuentaQueryKeys } from './cuentas-cache';

export function useCuentas() {
  return useQuery({
    queryKey: cuentaQueryKeys.list,
    queryFn: cuentasApi.list
  });
}
