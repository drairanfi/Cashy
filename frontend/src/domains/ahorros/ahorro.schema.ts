import { z } from 'zod';

import { ahorroValidationMessages as messages } from './validation-messages';

export const ahorroSchema = z.object({
  nombre: z.string().min(2, { error: messages.nameTooShort }),
  objetivo: z
    .number({ error: messages.amountRequired })
    .positive({ error: messages.amountPositive }),
  actual: z
    .number({ error: messages.amountRequired })
    .min(0, { error: messages.amountNotNegative })
});

export type AhorroInput = z.infer<typeof ahorroSchema>;
