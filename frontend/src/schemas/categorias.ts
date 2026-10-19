import { z } from 'zod';

export const categoriaFormSchema = z.object({
  nombre: z.string().trim().min(2, 'Mínimo 2 caracteres').max(30, 'Máximo 30 caracteres'),
});

export type CategoriaFormInput = z.infer<typeof categoriaFormSchema>;
