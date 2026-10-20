import { z } from 'zod';

import { metaValidationMessages as messages } from './validation-messages';

export const metaSchema = z.object({
  nombre: z.string().min(2, { error: messages.nameTooShort }),
  montoObjetivo: z
    .number({ error: messages.amountRequired })
    .positive({ error: messages.amountPositive }),
  montoMensual: z
    .number({ error: messages.amountRequired })
    .positive({ error: messages.amountPositive }),
  prioritaria: z.boolean()
});

export type MetaInput = z.infer<typeof metaSchema>;
