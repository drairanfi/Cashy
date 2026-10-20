import { z } from 'zod';

import { deudaValidationMessages as messages } from './validation-messages';

export const DEUDA_DIRECCIONES = ['debida', 'a_cobrar'] as const;

export const DEUDA_FRECUENCIAS = ['semanal', 'quincenal', 'mensual'] as const;

export const deudaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, { error: messages.nameRequired })
    .max(80, { error: messages.nameTooLong }),
  direccion: z.enum(DEUDA_DIRECCIONES, { error: messages.directionRequired }),
  montoTotal: z
    .number({ error: messages.amountRequired })
    .positive({ error: messages.amountPositive }),
  cantidadCuotas: z
    .number({ error: messages.installmentsRequired })
    .int({ error: messages.installmentsInteger })
    .min(1, { error: messages.installmentsMin })
    .max(120, { error: messages.installmentsMax }),
  frecuencia: z.enum(DEUDA_FRECUENCIAS, { error: messages.frequencyRequired }),
  primeraFecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: messages.dateInvalid })
});

export type DeudaInput = z.infer<typeof deudaSchema>;
