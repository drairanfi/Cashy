import { z } from 'zod';

export const upsertSueldoSchema = z.object({
  monto: z.number().positive(),
});

export type UpsertSueldoInput = z.infer<typeof upsertSueldoSchema>;
