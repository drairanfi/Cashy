import { z } from 'zod';

import { categoriaValidationMessages as messages } from './validation-messages';

export const categoriaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, { error: messages.nameTooShort })
    .max(30, { error: messages.nameTooLong })
});

export type CategoriaInput = z.infer<typeof categoriaSchema>;
