import { z } from 'zod';

export const GASTO_CATEGORIAS = ['Hogar', 'Transporte', 'Ocio', 'Salud', 'Otros'] as const;

export const createGastoSchema = z.object({
  descripcion: z.string().min(2).max(100),
  monto: z.number().positive(),
  categoria: z.string().trim().min(1).max(30),
});

export type CreateGastoInput = z.infer<typeof createGastoSchema>;
