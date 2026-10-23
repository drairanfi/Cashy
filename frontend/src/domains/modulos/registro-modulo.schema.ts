import { z } from 'zod';

import { modulosMessages } from './messages';

export const registroModuloSchema = z.object({
  descripcion: z
    .string()
    .trim()
    .min(2, modulosMessages.registro.validation.descripcionMin)
    .max(100, modulosMessages.registro.validation.descripcionMax),
  monto: z
    .number({ error: modulosMessages.registro.validation.montoRequerido })
    .positive(modulosMessages.registro.validation.montoPositivo),
  cuentaId: z.string().nullable().optional()
});

export type RegistroModuloInput = z.infer<typeof registroModuloSchema>;
