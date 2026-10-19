import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/services/api/ai';
import type { AiAction, AiChatMessage } from '@/types';

export function useChat() {
  return useMutation({
    mutationFn: (messages: AiChatMessage[]) => aiApi.chat(messages),
  });
}

export function useConfirmActions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (actions: AiAction[]) => aiApi.confirm(actions),
    onSuccess: () => {
      for (const key of ['gastos', 'comidas', 'gimnasio', 'ahorros', 'dashboard']) {
        qc.invalidateQueries({ queryKey: [key] });
      }
      qc.invalidateQueries({ queryKey: ['ai', 'insights'] });
    },
  });
}
