'use client';

import { useQuery } from '@tanstack/react-query';

import { recurrentesApi } from '../api';
import { recurrenteQueryKeys } from './recurrentes-cache';

export function useRecurrentes() {
  return useQuery({
    queryKey: recurrenteQueryKeys.list,
    queryFn: recurrentesApi.list
  });
}
