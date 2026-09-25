import { z } from 'zod';

export const createAhorroSchema = z.object({
  nombre: z.string().min(2).max(100),
  objetivo: z.number().positive(),
  actual: z.number().min(0).default(0),
});

export const aporteAhorroSchema = z.object({
  monto: z.number().positive(),
});

export type CreateAhorroInput = z.infer<typeof createAhorroSchema>;
export type AporteAhorroInput = z.infer<typeof aporteAhorroSchema>;
