'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { aiApi } from '../api';

export function useAiStatus() {
  return useQuery({
    queryKey: ['ai', 'status'],
    queryFn: aiApi.status,
    staleTime: Infinity
  });
}

export function useInsights() {
  return useQuery({
    queryKey: ['ai', 'insights'],
    queryFn: () => aiApi.insights(false),
    staleTime: 60 * 60 * 1000
  });
}

export function useRefreshInsights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => aiApi.insights(true),
    onSuccess: data => {
      queryClient.setQueryData(['ai', 'insights'], data);
    }
  });
}
