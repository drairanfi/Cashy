'use client';

import { useMutation } from '@tanstack/react-query';

import { deudasApi } from '../api';
import { useInvalidateDeudas } from './deudas-cache';

export function usePagarCuota() {
  const invalidate = useInvalidateDeudas();

  return useMutation({
    mutationFn: deudasApi.pagarCuota,
    onSuccess: invalidate
  });
}
