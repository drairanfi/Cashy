import { z } from 'zod';

import { comidaValidationMessages as messages } from './validation-messages';

export const comidaSchema = z.object({
  descripcion: z.string().min(2, { error: messages.descriptionTooShort }),
  monto: z
    .number({ error: messages.amountRequired })
    .positive({ error: messages.amountPositive }),
  cuentaId: z.string().nullable().optional()
});

export type ComidaInput = z.infer<typeof comidaSchema>;
