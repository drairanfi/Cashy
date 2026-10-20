import { z } from 'zod';

import { servicioValidationMessages as messages } from './validation-messages';

export const servicioSchema = z.object({
  nombre: z.string().min(2, { error: messages.nameTooShort }),
  montoDestinado: z
    .number({ error: messages.amountRequired })
    .positive({ error: messages.amountPositive })
});

export type ServicioInput = z.infer<typeof servicioSchema>;
