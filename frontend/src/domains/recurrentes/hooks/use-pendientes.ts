'use client';

import { useQuery } from '@tanstack/react-query';

import { recurrentesApi } from '../api';
import { recurrenteQueryKeys } from './recurrentes-cache';

export function usePendientes() {
  return useQuery({
    queryKey: recurrenteQueryKeys.pendientes,
    queryFn: recurrentesApi.pendientes
  });
}
