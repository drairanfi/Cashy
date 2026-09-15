import { z } from 'zod';

export const upsertSueldoSchema = z.object({
  monto: z.number().positive('Monto mayor a 0'),
});

export type UpsertSueldoInput = z.infer<typeof upsertSueldoSchema>;
