import { z } from 'zod';

export const createMetaSchema = z.object({
  nombre: z.string().min(2).max(100),
  montoObjetivo: z.number().positive(),
  montoMensual: z.number().positive(),
  prioritaria: z.boolean().default(false),
});

export const updateMetaSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  montoObjetivo: z.number().positive().optional(),
  montoMensual: z.number().positive().optional(),
  prioritaria: z.boolean().optional(),
});

export type CreateMetaInput = z.infer<typeof createMetaSchema>;
export type UpdateMetaInput = z.infer<typeof updateMetaSchema>;
