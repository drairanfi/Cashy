'use client';

import { useMutation } from '@tanstack/react-query';

import { cuentasApi } from '../api';
import { useInvalidateCuentas } from './cuentas-cache';

export function useUpdateCuenta() {
  const invalidate = useInvalidateCuentas();

  return useMutation({
    mutationFn: cuentasApi.update,
    onSuccess: invalidate
  });
}
