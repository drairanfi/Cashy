import { z } from 'zod';

import { metaValidationMessages as messages } from './validation-messages';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const metaSchema = z
  .object({
    nombre: z.string().min(2, { error: messages.nameTooShort }),
    montoObjetivo: z
      .number({ error: messages.amountRequired })
      .positive({ error: messages.amountPositive }),
    montoMensual: z
      .number({ error: messages.amountRequired })
      .positive({ error: messages.amountPositive }),
    prioritaria: z.boolean(),
    fechaInicio: z.string().regex(DATE_PATTERN, { error: messages.dateRequired }),
    fechaFin: z
      .union([z.literal(''), z.string().regex(DATE_PATTERN)])
      .nullable()
      .optional()
  })
  .refine(data => !data.fechaFin || data.fechaFin >= data.fechaInicio, {
    message: messages.dateRange,
    path: ['fechaFin']
  });

export type MetaInput = z.infer<typeof metaSchema>;
