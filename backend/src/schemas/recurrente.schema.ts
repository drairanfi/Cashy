import { z } from 'zod';

export const FRECUENCIAS_RECURRENTES = ['diaria', 'semanal', 'mensual', 'anual'] as const;
export const ESTADOS_RECURRENTES = ['activa', 'pausada'] as const;

export const createRecurrenteSchema = z.object({
  concepto: z
    .string()
    .trim()
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  monto: z
    .number({ invalid_type_error: 'Monto inválido' })
    .positive('El monto debe ser mayor a 0'),
  categoria: z.string().trim().min(1, 'Mínimo 1 carácter').max(30, 'Máximo 30 caracteres').optional(),
  frecuencia: z.enum(FRECUENCIAS_RECURRENTES, {
    errorMap: () => ({ message: 'Frecuencia inválida' }),
  }),
  intervalo: z
    .number({ invalid_type_error: 'Intervalo inválido' })
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1')
    .max(120, 'Máximo 120')
    .optional()
    .default(1),
  fechaInicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  fechaFin: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .nullable()
    .optional(),
});

export const updateRecurrenteSchema = z.object({
  estado: z
    .enum(ESTADOS_RECURRENTES, {
      errorMap: () => ({ message: 'Estado inválido' }),
    })
    .optional(),
});

export type CreateRecurrenteInput = z.infer<typeof createRecurrenteSchema>;
export type UpdateRecurrenteInput = z.infer<typeof updateRecurrenteSchema>;
