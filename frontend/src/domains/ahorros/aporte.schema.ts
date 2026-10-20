import { z } from 'zod';

import { ahorroValidationMessages as messages } from './validation-messages';

export const aporteSchema = z.object({
  monto: z
    .number({ error: messages.amountRequired })
    .positive({ error: messages.amountPositive })
});

export type AporteInput = z.infer<typeof aporteSchema>;
