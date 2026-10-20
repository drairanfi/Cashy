'use client';

import { useMutation } from '@tanstack/react-query';

import { recurrentesApi } from '../api';
import { useInvalidateRecurrentes } from './recurrentes-cache';

export function useDeleteRecurrente() {
  const invalidate = useInvalidateRecurrentes();

  return useMutation({
    mutationFn: recurrentesApi.remove,
    onSuccess: invalidate
  });
}
