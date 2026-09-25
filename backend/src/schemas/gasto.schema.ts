import { z } from 'zod';

export const GASTO_CATEGORIAS = ['Hogar', 'Transporte', 'Ocio', 'Salud', 'Otros'] as const;

export const createGastoSchema = z.object({
  descripcion: z.string().min(2).max(100),
  monto: z.number().positive(),
  categoria: z.enum(GASTO_CATEGORIAS),
});

export type CreateGastoInput = z.infer<typeof createGastoSchema>;
