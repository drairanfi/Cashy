import { z } from 'zod';

export const createComidaSchema = z.object({
  descripcion: z.string().min(2).max(100),
  monto: z.number().positive(),
});

export type CreateComidaInput = z.infer<typeof createComidaSchema>;
