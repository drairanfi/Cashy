import { z } from 'zod';

import { modulosMessages } from './messages';

export const moduloPersonalizadoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, modulosMessages.validation.nombreMin)
    .max(40, modulosMessages.validation.nombreMax)
});

export type ModuloPersonalizadoInput = z.infer<typeof moduloPersonalizadoSchema>;
