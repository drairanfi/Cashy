import { z } from 'zod';

export const createGimnasioSchema = z.object({
  actividad: z.string().min(2).max(100),
  monto: z.number().positive(),
});

export type CreateGimnasioInput = z.infer<typeof createGimnasioSchema>;
