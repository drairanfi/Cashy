import { z } from 'zod';

export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

export type ChatInput = z.infer<typeof chatSchema>;

export const insightSchema = z.object({
  tipo: z.enum(['alerta', 'sugerencia', 'info']),
  titulo: z.string().min(1).max(80),
  mensaje: z.string().min(1).max(400),
});

export const insightsModelSchema = z.object({
  insights: z.array(insightSchema).max(6),
});

export const confirmActionsSchema = z.object({
  actions: z
    .array(
      z.object({
        id: z.string().min(1),
        tool: z.string().min(1),
        args: z.record(z.unknown()),
      }),
    )
    .min(1)
    .max(10),
});

export type ConfirmActionsInput = z.infer<typeof confirmActionsSchema>;

export type Insight = z.infer<typeof insightSchema> & { id: string };
