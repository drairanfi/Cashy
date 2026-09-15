import { z } from 'zod';

export const createServicioSchema = z.object({
  nombre: z.string().min(2).max(100),
  montoDestinado: z.number().positive(),
});

export const updateServicioSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  montoDestinado: z.number().positive().optional(),
});

export type CreateServicioInput = z.infer<typeof createServicioSchema>;
export type UpdateServicioInput = z.infer<typeof updateServicioSchema>;
