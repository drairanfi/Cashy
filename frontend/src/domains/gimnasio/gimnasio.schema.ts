import { z } from 'zod';

import { gimnasioValidationMessages as messages } from './validation-messages';

export const gimnasioSchema = z.object({
  actividad: z.string().min(2, { error: messages.activityTooShort }),
  monto: z
    .number({ error: messages.amountRequired })
    .positive({ error: messages.amountPositive })
});

export type GimnasioInput = z.infer<typeof gimnasioSchema>;
