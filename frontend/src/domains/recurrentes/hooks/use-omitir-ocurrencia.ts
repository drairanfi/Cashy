'use client';

import { useMutation } from '@tanstack/react-query';

import { recurrentesApi } from '../api';
import { useInvalidateRecurrentes } from './recurrentes-cache';

export function useOmitirOcurrencia() {
  const invalidate = useInvalidateRecurrentes();

  return useMutation({
    mutationFn: recurrentesApi.omitir,
    onSuccess: invalidate
  });
}
