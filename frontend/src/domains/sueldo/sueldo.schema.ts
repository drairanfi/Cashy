import { z } from 'zod';

import { sueldoValidationMessages } from './validation-messages';

export const upsertSueldoSchema = z.object({
  monto: z
    .number({ error: sueldoValidationMessages.amountRequired })
    .positive({ error: sueldoValidationMessages.amountPositive })
});

export type UpsertSueldoInput = z.infer<typeof upsertSueldoSchema>;
