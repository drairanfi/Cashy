import { z } from 'zod';

export const createModuloPersonalizadoSchema = z.object({
  nombre: z.string().trim().min(2).max(40),
});

export const updateModuloPersonalizadoSchema = z.object({
  activo: z.boolean(),
});

export type CreateModuloPersonalizadoInput = z.infer<typeof createModuloPersonalizadoSchema>;
export type UpdateModuloPersonalizadoInput = z.infer<typeof updateModuloPersonalizadoSchema>;
