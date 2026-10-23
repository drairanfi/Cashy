import { z } from 'zod';

export const createCategoriaSchema = z.object({
  nombre: z.string().trim().min(2, 'Mínimo 2 caracteres').max(30, 'Máximo 30 caracteres'),
});

export type CreateCategoriaInput = z.infer<typeof createCategoriaSchema>;

export const updateCategoriaSchema = createCategoriaSchema;

export type UpdateCategoriaInput = z.infer<typeof updateCategoriaSchema>;
