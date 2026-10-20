'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AiAction, AiChatMessage } from '@/types/ai.types';

import { aiApi } from '../api';

const AFFECTED_QUERY_KEYS = [
  'gastos',
  'comidas',
  'gimnasio',
  'ahorros',
  'categorias',
  'dashboard'
];

export function useChat() {
  return useMutation({
    mutationFn: (messages: AiChatMessage[]) => aiApi.chat(messages)
  });
}

export function useConfirmActions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (actions: AiAction[]) => aiApi.confirm(actions),
    onSuccess: () => {
      for (const key of AFFECTED_QUERY_KEYS) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      queryClient.invalidateQueries({ queryKey: ['ai', 'insights'] });
    }
  });
}
