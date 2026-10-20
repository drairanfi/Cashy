'use client';

import { useMutation } from '@tanstack/react-query';

import { recurrentesApi } from '../api';
import { useInvalidateRecurrentes } from './recurrentes-cache';

export function useUpdateRecurrente() {
  const invalidate = useInvalidateRecurrentes();

  return useMutation({
    mutationFn: recurrentesApi.update,
    onSuccess: invalidate
  });
}
