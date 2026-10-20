import { z } from 'zod';

import { recurrenteValidationMessages as messages } from './validation-messages';

export const RECURRENTE_FRECUENCIAS = ['diaria', 'semanal', 'mensual', 'anual'] as const;

export const RECURRENTE_ESTADOS = ['activa', 'pausada'] as const;

export const recurrenteSchema = z.object({
  concepto: z
    .string()
    .trim()
    .min(1, { error: messages.conceptRequired })
    .max(80, { error: messages.conceptTooLong }),
  monto: z
    .number({ error: messages.amountRequired })
    .positive({ error: messages.amountPositive }),
  categoria: z.string().trim().optional(),
  frecuencia: z.enum(RECURRENTE_FRECUENCIAS, { error: messages.frequencyRequired }),
  intervalo: z
    .number({ error: messages.intervalRequired })
    .int({ error: messages.intervalInteger })
    .min(1, { error: messages.intervalMin })
    .max(99, { error: messages.intervalMax }),
  fechaInicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: messages.dateInvalid }),
  fechaFin: z
    .string()
    .optional()
    .refine(value => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      error: messages.dateInvalid
    })
});

export type RecurrenteInput = z.infer<typeof recurrenteSchema>;
