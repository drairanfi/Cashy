'use client';

import { useQuery } from '@tanstack/react-query';

import { deudasApi } from '../api';
import { deudaQueryKeys } from './deudas-cache';

export function useCalendario() {
  return useQuery({
    queryKey: deudaQueryKeys.calendar,
    queryFn: deudasApi.calendario
  });
}
