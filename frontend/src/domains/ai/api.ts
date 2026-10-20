import { apiFetch } from '@/lib/api/client';
import type {
  AiAction,
  AiActionsResponse,
  AiChatMessage,
  AiChatResponse,
  InsightsResponse
} from '@/types/ai.types';

export const aiApi = {
  status: () => apiFetch<{ enabled: boolean }>('/ai/status'),

  insights: (refresh = false) =>
    apiFetch<InsightsResponse>(`/ai/insights${refresh ? '?refresh=1' : ''}`),

  chat: (messages: AiChatMessage[]) =>
    apiFetch<AiChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages })
    }),

  confirm: (actions: AiAction[]) =>
    apiFetch<AiActionsResponse>('/ai/actions', {
      method: 'POST',
      body: JSON.stringify({
        actions: actions.map(({ id, tool, args }) => ({ id, tool, args }))
      })
    })
};
