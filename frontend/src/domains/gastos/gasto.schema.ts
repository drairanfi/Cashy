import { z } from 'zod';

import { gastoValidationMessages as messages } from './validation-messages';

export const gastoSchema = z.object({
  descripcion: z.string().min(2, { error: messages.descriptionTooShort }),
  monto: z
    .number({ error: messages.amountRequired })
    .positive({ error: messages.amountPositive }),
  categoria: z.string().min(1, { error: messages.categoryRequired }),
  cuentaId: z.string().nullable().optional()
});

export type GastoInput = z.infer<typeof gastoSchema>;
