import { z } from 'zod';

const fechaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)');

const fechaFinSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
  .nullable()
  .optional();

export const createMetaSchema = z
  .object({
    nombre: z.string().min(2).max(100),
    montoObjetivo: z.number().positive(),
    montoMensual: z.number().positive(),
    prioritaria: z.boolean().default(false),
    fechaInicio: fechaSchema,
    fechaFin: fechaFinSchema,
  })
  .refine((data) => !data.fechaFin || data.fechaFin >= data.fechaInicio, {
    message: 'La fecha de fin no puede ser anterior a la de inicio',
    path: ['fechaFin'],
  });

export const updateMetaSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  montoObjetivo: z.number().positive().optional(),
  montoMensual: z.number().positive().optional(),
  prioritaria: z.boolean().optional(),
  fechaInicio: fechaSchema.optional(),
  fechaFin: fechaFinSchema,
});

export type CreateMetaInput = z.infer<typeof createMetaSchema>;
export type UpdateMetaInput = z.infer<typeof updateMetaSchema>;
